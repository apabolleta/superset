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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AllCommunityModule,
  ICellRendererParams,
  ModuleRegistry,
  RowEditingStartedEvent,
  RowEditingStoppedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
  Button,
  ConfirmStatusChange,
  Flex,
  Icons,
  Input,
  Space
} from '@superset-ui/core/components';
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

  const getRowKey = useCallback((row: D): RowKey => {
    const entries = _columns
      .filter(col => col.isRowKey)
      .map(col => [col.key, row[col.key]]);
    return Object.fromEntries(entries) as RowKey;
  }, [_columns]);

  const isEmptyRow = useCallback((row: D): boolean => {
    const rowCopy = { ...row };
    return !Object.values(rowCopy).some(value => value);
  }, []);

  const columns = useMemo(() => {
    const dataColumns = _columns.map((col) => ({
      field: col.key as string,
      headerName: col.header,
    }));

    if (editing) {
      const actionsColumn = {
        colId: 'actions',
        headerName: t('Actions'),
        sortable: false,
        filter: false,
        editable: false,
        suppressMenu: true,
        suppressMovable: true,
        suppressNavigable: true,
        suppressPaste: true,
        suppressKeyboardEvent: () => true,
        suppressSizeToFit: true,
        suppressAutoSize: true,
        cellRenderer: (params: ICellRendererParams) => {
          const [editingStatus, setEditingStatus] = useState<boolean | null>(editing ? false: null);
          const [editingDisabled, setEditingDisabled] = useState<boolean | null>(editing ? false: null);

          function onRowEditingStarted(event: RowEditingStartedEvent) {
            if (params.node === event.node) {
              setEditingStatus(true);
            } else {
              setEditingDisabled(true);
            }
          }

          function onRowEditingStopped(event: RowEditingStoppedEvent) {
            if (params.node === event.node) {
              // TODO: check behaviour
              if (isEmptyRow(event.data)) {
                event.api.applyTransaction({ remove: [event.rowIndex] });
                event.api.refreshCells({ force: true });
              } else {
                setEditingStatus(false);
              }
            } else {
              setEditingDisabled(false);
            }
          }

          useEffect(() => {
            params.api.addEventListener('rowEditingStarted', onRowEditingStarted);
            params.api.addEventListener('rowEditingStopped', onRowEditingStopped);

            return () => {
              params.api.removeEventListener('rowEditingStarted', onRowEditingStarted);
              params.api.removeEventListener('rowEditingStopped', onRowEditingStopped);
            };
          }, []);

          return (
            editingStatus
              ? (
                <>
                  <Button
                    type='text'
                    color='primary'
                    variant='filled'
                    disabled={!!editingDisabled}
                    onClick={() => params.api.stopEditing(false)}
                  >
                    {t('Submit')}
                  </Button>
                  <ConfirmStatusChange
                    title={t('Please confirm')}
                    description={t('Are you sure you want to cancel the update?')}
                    onConfirm={() => params.api.stopEditing(true)}
                  >
                    {showConfirm => (
                      <Button
                        type='text'
                        color='danger'
                        variant='filled'
                        disabled={!!editingDisabled}
                        onClick={showConfirm}
                      >
                        {t('Cancel')}
                      </Button>
                    )}
                  </ConfirmStatusChange>
                </>
              ) : (
                <>
                  {onUpdate && (
                    <Button
                      type='text'
                      color='default'
                      variant='filled'
                      disabled={!!editingDisabled}
                      onClick={() => {
                        params.api.startEditingCell({
                          rowIndex: params.node?.rowIndex!,
                          colKey: params.column?.getId()!,
                        });
                      }}
                    >
                      {t('Update')}
                      <Icons.EditOutlined />
                    </Button>
                  )}
                  {onDelete && (
                    <ConfirmStatusChange
                      title={t('Please confirm')}
                      description={t('Are you sure you want to delete the row?')}
                      onConfirm={() => {
                        onDelete({
                          type: 'delete',
                          deletes: [{
                            oldData: params.data,
                            rowKey: getRowKey(params.data),
                          }]
                        });
                      }}
                    >
                      {showConfirm => (
                        <Button
                          type='text'
                          color='danger'
                          variant='filled'
                          disabled={!!editingDisabled}
                          onClick={showConfirm}
                        >
                          {t('Delete')}
                          <Icons.DeleteOutlined />
                        </Button>
                      )}
                    </ConfirmStatusChange>
                  )}
                </>
              )
          );
        },
      };
      return [...dataColumns, actionsColumn];
    }

    return dataColumns;
  }, [_columns, editing]);

  const data = useMemo(() => _data.map((row) => ({
    ...row,
  })), [_data]);

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
        {editing && onInsert && (
          <Button
            type='text'
            color='default'
            variant='filled'
            onClick={() => {}}
          >
            {t('Insert')}
            <Icons.PlusOutlined />
          </Button>
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
            suppressKeyboardEvent: (params) => params.editing,
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
          suppressClickEdit={true}
          editType={editing ? 'fullRow' : undefined}
          onCellValueChanged={
            editing && onUpdate
              ? (event) => {
                const { colDef, oldValue, newValue, data } = event;
                onUpdate({
                  type: 'update',
                  updates: [{
                    newData: {[colDef.field as keyof D]: newValue} as Partial<D>,
                    oldData: {[colDef.field as keyof D]: oldValue} as Partial<D>,
                    rowKey: getRowKey(data),
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
