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
import { styled } from '@superset-ui/core';
import { createRef } from 'react';
import {
  DataGridChartStylesProps,
  DataGridChartTransformedProps,
  DeleteEvent,
  InsertEvent,
  UpdateEvent,
} from './types';
import DataGrid from './components/DataGrid/DataGrid';

const Styles = styled.div<DataGridChartStylesProps>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;

export default function DataGridChart(props: DataGridChartTransformedProps) {
  const {
    width,
    height,
    formData,
    dataGrid,
  } = props;
  const {
    allow_update,
    allow_insert,
    allow_delete,
  } = formData;

  const rootElem = createRef<HTMLDivElement>();

  const handleUpdate = (event: UpdateEvent) => {console.log(event)};
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
