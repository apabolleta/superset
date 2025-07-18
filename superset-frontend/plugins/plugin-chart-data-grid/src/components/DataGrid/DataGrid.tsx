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
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Flex, Input, Space } from '@superset-ui/core/components';
import { DataRecord, styled, t } from '@superset-ui/core';
import { DataGridDef, RowKey } from 'src/types';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface UpdateEvent<D extends DataRecord = DataRecord> {
  type: 'update',
  updates: {
    newData: Partial<D>;
    oldData: Partial<D>;
    rowKey: RowKey;
  }[];
}

export interface InsertEvent<D extends DataRecord = DataRecord> {
  type: 'insert',
  inserts: {
    newData: D;
    rowKey?: RowKey;
  }[];
}

export interface DeleteEvent<D extends DataRecord = DataRecord> {
  type: 'delete',
  deletes: {
    oldData: D;
    rowKey: RowKey;
  }[];
}

export interface DataGridProps<D extends DataRecord = DataRecord> extends DataGridDef<D> {
  onUpdate?: (event: UpdateEvent<D>) => void;
  onInsert?: (event: InsertEvent<D>) => void;
  onDelete?: (event: DeleteEvent<D>) => void;
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
  columns: _columns,
  data: _data,
  pagination,
  paginationPageSize,
  selection,
  selectionType,
  selectionMode,
  sorting,
  sortingMode,
  filtering,
  searching,
  editing,
  editingType,
  editingMode,
  importing,
  exporting,
  onUpdate,
  onInsert,
  onDelete,
}: DataGridProps<D>) {
  const gridRef = useRef<AgGridReact>(null);

  const columns = _columns.map((col) => ({
    field: col.key as string,
    headerName: col.header,
  }));

  const data = _data.map((row) => ({
    ...row,
  }));

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
            filter: filtering,
            editable: editing,
          }}
          pagination={pagination}
          paginationAutoPageSize={paginationPageSize === 0}
          paginationPageSize={paginationPageSize ?? undefined}
          paginationPageSizeSelector={!paginationPageSize}
          rowSelection={
            selection && selectionType === 'row'
              ? { mode: selectionMode === 'single' ? 'singleRow' : 'multiRow' }
              : undefined
          }
          suppressMultiSort={sortingMode === 'single'}
          alwaysMultiSort={sortingMode === 'multiple'}
          editType={editingType === 'row' ? 'fullRow' : undefined}
          onCellValueChanged={
            onUpdate
              ? (event) => {
                const { colDef, oldValue, newValue, data } = event;
                onUpdate({
                  type: 'update',
                  updates: [{
                    newData: {[colDef.field as keyof D]: newValue} as Partial<D>,
                    oldData: {[colDef.field as keyof D]: oldValue} as Partial<D>,
                    rowKey: Object.fromEntries(
                      _columns
                        .filter(col => col.isRowKey)
                        .map(col => [col.key, data[col.key]])
                    )
                  }]
                })
              }
              : undefined
          }
        />
      </DataGridContentContainer>
    </DataGridContainer>
  );
}
