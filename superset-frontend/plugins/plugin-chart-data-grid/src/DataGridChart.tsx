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
import Knex from 'knex';
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

const DATABASE_BACKENDS_CLIENTS: Record<string, string> = {
  postgresql: 'pg',
  mysql: 'mysql',
  sqlite: 'sqlite3',
  mssql: 'mssql',
};

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
    is_editable,
    allow_update,
    allow_insert,
    allow_delete,
  } = formData;

  const rootElem = createRef<HTMLDivElement>();

  const databaseId: number = (datasource as any)?.database?.id;
  const databaseBackend: string = (datasource as any)?.database?.backend;
  const datasourceName: string = datasource.name;

  const knex = Knex({
    client: DATABASE_BACKENDS_CLIENTS[databaseBackend]
  });

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

  const handleUpdate = (event: UpdateEvent) => {
    event.updates.forEach(({ newData, rowKey }) => {
      const query = knex(datasourceName).where(rowKey).update(newData);
      const querySql = query.toQuery();
      runQuery(databaseId, querySql)
        .then(res => message.success('Update successful'))
        .catch(err => message.error('Update error'))
    });
  };

  const handleInsert = (event: InsertEvent) => {
    event.inserts.forEach(({ newData, rowKey }) => {
      const query = knex(datasourceName).insert({...newData, ...(rowKey ?? {})});
      const querySql = query.toQuery();
      runQuery(databaseId, querySql)
        .then(res => message.success('Insert successful'))
        .catch(err => message.error('Insert error'))
    });
  };

  const handleDelete = (event: DeleteEvent) => {
    event.deletes.forEach(({ rowKey }) => {
      const query = knex(datasourceName).where(rowKey).delete();
      const querySql = query.toQuery();
      runQuery(databaseId, querySql)
        .then(res => message.success('Delete successful'))
        .catch(err => message.error('Delete error'))
    });
  };

  return (
    <Styles ref={rootElem} width={width} height={height}>
      <DataGrid
        {...dataGrid}
        onUpdate={is_editable && allow_update ? handleUpdate : undefined}
        onInsert={is_editable && allow_insert ? handleInsert : undefined}
        onDelete={is_editable && allow_delete ? handleDelete : undefined}
      />
    </Styles>
  );
}
