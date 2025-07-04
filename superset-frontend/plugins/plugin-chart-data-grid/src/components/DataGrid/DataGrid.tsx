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
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Flex, Input, Space } from '@superset-ui/core/components';
import { DataRecord, styled, t } from '@superset-ui/core';
import { DataGridDef, RowIndex } from 'src/types';

ModuleRegistry.registerModules([AllCommunityModule]);

export type UpdateEvent<D extends DataRecord = DataRecord> = {
  updates: {
    newData: Partial<D>;
    oldData: Partial<D>;
    rowIndex: RowIndex;
  }[];
};

export type InsertEvent<D extends DataRecord = DataRecord> = {
  inserts: {
    newData: D;
    rowIndex?: RowIndex;
  }[];
};

export type DeleteEvent<D extends DataRecord = DataRecord> = {
  deletes: {
    oldData: D;
    rowIndex: RowIndex;
  }[];
};

export interface DataGridProps<
  D extends DataRecord = DataRecord
> extends DataGridDef<D> {
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
  editable,
  importing,
  exporting,
  onUpdate,
  onInsert,
  onDelete,
}: DataGridProps<D>) {
  const gridRef = useRef<AgGridReact>(null);

  const columns: ColDef<D>[] = _columns.map((col) => ({
    field: col.key as ColDef<D>['field'],
    headerName: col.header,
  }));

  const data: D[] = _data.map((row) => ({ ...row }));

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
            editable: true,
          }}
          pagination={pagination}
          paginationAutoPageSize={paginationPageSize === 0}
          paginationPageSize={paginationPageSize ?? undefined}
          paginationPageSizeSelector={!paginationPageSize}
        />
      </DataGridContentContainer>
    </DataGridContainer>
  );
}
