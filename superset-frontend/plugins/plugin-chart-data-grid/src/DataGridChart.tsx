/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  QueryFormData,
  RequestConfig,
  styled,
  SupersetClient,
} from '@superset-ui/core';
import { createRef } from 'react';
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  RawBuilder,
  sql,
} from 'kysely';
import {
  DataGridChartStylesProps,
  DataGridChartTransformedProps,
} from './types';
import DataGrid, {
  DeleteEvent,
  InsertEvent,
  UpdateEvent,
} from './components/DataGrid/DataGrid';
import { message } from 'antd';

const Styles = styled.div<DataGridChartStylesProps>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;

export default function DataGridChart(props: DataGridChartTransformedProps) {
  const {
    width,
    height,
    datasource,
    formData,
    dataGrid,
  } = props;
  const {
    allow_update,
    allow_insert,
    allow_delete,
  } = formData;

  const rootElem = createRef<HTMLDivElement>();

  async function runQuery(databaseId: number, querySql: string): Promise<QueryFormData> {
    return await SupersetClient
      .post({
        endpoint: `/api/v1/sqllab/execute/`,
        jsonPayload: {
          database_id: databaseId,
          sql: querySql,
        }
      } as RequestConfig)
      .then(res => res.json as QueryFormData)
  }

  // https://kysely.dev/docs/recipes/splitting-query-building-and-execution
  interface Database {}
  const db = new Kysely<Database>({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => new DummyDriver(),
      createIntrospector: (db) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
  });

  const buildAssignments = <T extends Record<string, unknown>>(
    columnValueMap: T
  ): RawBuilder<unknown>[] => (
    Object.entries(columnValueMap).map(
      ([key, value]) => sql`${sql.ref(key)} = ${sql.lit(value)}`
    )
  );

  const handleUpdate = (event: UpdateEvent) => {
    event.updates.forEach(({ newData, rowKey }) => {
      const setClause = buildAssignments(newData);
      const whereClause = buildAssignments(rowKey);
      const query = sql`
        UPDATE ${sql.table(datasource.name)}
        SET ${sql.join(setClause)}
        WHERE ${sql.join(whereClause, sql` AND `)}
      `;
      const querySql = query.compile(db).sql;
      const databaseId = (datasource as any)?.database?.id;
      runQuery(databaseId, querySql)
        .then(res => message.success('Update successful'))
        .catch(err => message.error('Update error'))
    })
  };
  const handleInsert = (event: InsertEvent) => {console.log(event)};
  const handleDelete = (event: DeleteEvent) => {console.log(event)};

  return (
    <Styles ref={rootElem} width={width} height={height}>
      <DataGrid
        {...dataGrid}
        onUpdate={allow_update ? handleUpdate : undefined}
        onInsert={allow_insert ? handleInsert : undefined}
        onDelete={allow_delete ? handleDelete : undefined}
      />
    </Styles>
  );
}
