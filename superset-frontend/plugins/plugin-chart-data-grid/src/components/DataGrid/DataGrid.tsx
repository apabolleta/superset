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
import { useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Flex, Input, Space } from '@superset-ui/core/components';
import { DataRecord, styled, t } from '@superset-ui/core';

export interface ColumnDef<D extends DataRecord = DataRecord> {}

export type UpdateEvent = {};
export type InsertEvent = {};
export type DeleteEvent = {};

export interface DataGridProps<D extends DataRecord = DataRecord> {
  columns: ColumnDef<D>[];
  data: D[];
  pagination?: boolean;
  paginationPageSize?: number;
  sorting?: boolean;
  filtering?: boolean;
  searching?: boolean;
  onUpdate?: ((event: UpdateEvent) => void) | null;
  onInsert?: ((event: InsertEvent) => void) | null;
  onDelete?: ((event: DeleteEvent) => void) | null;
}

const DataGridContainer = styled(Flex)`
  width: 100%;
  height: 100%;
`;

const DataGridControlsContainer = styled(Space)`
  margin-bottom: 10px;
`;

const DataGridContentContainer = styled.div`
  flex: 1;
`;

export default function DataGrid<D extends DataRecord = DataRecord>({
  columns,
  data,
  pagination,
  paginationPageSize,
  sorting,
  filtering,
  searching,
  onUpdate,
  onInsert,
  onDelete,
}: DataGridProps<D>) {
  const gridRef = useRef<AgGridReact>(null);
  return (
    <DataGridContainer vertical>
      <DataGridControlsContainer>
        {searching && (
          <Input
            type='text'
            placeholder={t('Search')}
            onChange={(e) => gridRef?.current?.api.setGridOption('quickFilterText', e.target.value)}
          />
        )}
      </DataGridControlsContainer>
      <DataGridContentContainer>
        <AgGridReact
          ref={gridRef}
          rowData={data}
          columnDefs={columns}
          defaultColDef={{
            sortable: sorting,
            filter: filtering
          }}
          pagination={pagination}
          paginationAutoPageSize={paginationPageSize === 0}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={!paginationPageSize}
        />
      </DataGridContentContainer>
    </DataGridContainer>
  );
}
