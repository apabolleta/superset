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
  AdhocFilter,
  ChartDataResponseResult,
  ChartProps,
  DataRecord,
  Datasource,
  GenericDataType,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
  QueryMode,
} from '@superset-ui/core';
import React from 'react';

export type DataRecordKeyValue = number | string | Date;

export type RowKey = { [key: string]: DataRecordKeyValue };

export type SortDirection = 'asc' | 'desc';

export type ColumnFilterType = 'text' | 'number' | 'date' | 'select' | 'custom' | null;

export type SelectionType = 'row' | 'column' | 'range' | 'cell' | null;

export type SelectionMode = 'single' | 'multiple' | null;

export type SortingMode = 'single' | 'multiple' | null;

export type TextAlign = 'left' | 'right' | 'center' | 'justify' | null;

export type CellStyle = CSSStyleDeclaration | { [key: string]: string } | null;

export type EditingType = 'row' | 'cell' | null;

export type EditingMode = 'single' | 'multiple' | null;

/** Column definition */
export interface ColumnDef<D extends DataRecord = DataRecord> {
  /** Unique identifier for the column */
  columnId?: string;

  /** Key of the data record to get the column data from */
  key: keyof D | string;

  /** Display name for the column header */
  header: string;

  /** Column data type */
  dataType?: GenericDataType;

  /** Whether the column is key identifier for rows */
  isRowKey?: boolean;

  /** Custom formatting function for cell data */
  formatter?: (value: D[keyof D], rowData: D, rowKey: RowKey) => string;

  /** Whether the column is visible */
  visible?: boolean;

  /** Custom sorting function */
  sorter?: (a: D, b: D) => number;

  /** Whether the column can be sorted */
  sortable?: boolean;

  /** Sort direction */
  sortDirection?: SortDirection;

  /** Whether the column can be filtered */
  filterable?: boolean;

  /** Filter type */
  filterType?: ColumnFilterType;

  /** Custom rendering function for cell data */
  render?: (value: D[keyof D], rowData: D, rowKey: RowKey) => React.ReactNode;

  /** Whether the column can be resized */
  resizable?: boolean;

  /** Whether the column can be reordered */
  reorderable?: boolean;

  /** Minimum width in pixels */
  minWidth?: number;

  /** Fixed column width */
  width?: number | string;

  /** Text alignment */
  textAlign?: TextAlign;

  /** Tooltip for column cells */
  tooltip?: React.ReactNode | ((value: D[keyof D], rowData: D, rowKey: RowKey) => React.ReactNode);

  /** Tooltip for the column header */
  headerTooltip?: React.ReactNode;

  /** Custom CSS class for the column */
  className?: string;

  /** Custom CSS class for the column header */
  headerClassName?: string;

  /** Custom style for column cells */
  style?: CellStyle | ((value: D[keyof D], rowData: D, rowKey: RowKey) => CellStyle);

  /** Custom style for the column header */
  headerStyle?: CellStyle;

  /** Custom function to format export data */
  exportFormatter?: (value: D[keyof D], rowData: D, rowKey: RowKey) => string;

  /** Whether this column is included in exports */
  exportable?: boolean;

  /** Whether this column is editable */
  editable?: boolean;

  /** Children columns */
  children?: ColumnDef<D>[];
}

/** Data Grid definition */
export interface DataGridDef<D extends DataRecord = DataRecord> {
  /** Column definitions */
  columns: ColumnDef<D>[];

  /** Data records */
  data: D[];

  /** Whether pagination is enabled */
  pagination?: boolean;

  /** Pagination page size */
  paginationPageSize?: number | null;

  /** Whether selection is enabled */
  selection?: boolean;

  /** Selection type */
  selectionType?: SelectionType;

  /** Selection mode */
  selectionMode?: SelectionMode;

  /** Whether sorting is enabled */
  sorting?: boolean;

  /** Sorting mode */
  sortingMode?: SortingMode;

  /** Whether filtering is enabled */
  filtering?: boolean;

  /** Whether searching is enabled */
  searching?: boolean;

  /** Whether editing is enabled */
  editing?: boolean;

  /** Editing type */
  editingType?: EditingType;

  /** Editing mode */
  editingMode?: EditingMode;

  /** Whether data importing is enabled */
  importing?: boolean;

  /** Whether data exporting is enabled */
  exporting?: boolean;
}

// TODO: define column configurable parameters
type ColumnConfig = {};

// TODO: define formatting configurable parameters
type FormattingConfig = {};

export interface DataGridChartStylesProps {
  width: number;
  height: number;
}

export type DataGridChartFormData = QueryFormData &
  DataGridChartStylesProps & {
    // query
    query_mode?: QueryMode;
    columns?: QueryFormColumn[] | null;
    groupby?: QueryFormColumn[] | null;
    all_columns?: QueryFormColumn[] | null;
    metrics?: QueryFormMetric[] | null;
    series_limit_metric?: QueryFormMetric[] | QueryFormMetric | null;
    order_by_cols?: QueryFormColumn[] | null;
    order_desc?: boolean;
    row_limit?: string | number | null;
    adhoc_filters?: AdhocFilter[] | null;
    // interactivity
    is_editable?: boolean | null;
    key_columns?: QueryFormColumn[] | null;
    // permissions
    allow_update?: boolean;
    allow_insert?: boolean;
    allow_delete?: boolean;
    // options
    pagination?: boolean;
    pagination_page_size?: number;
    selection?: boolean;
    selection_type?: SelectionType;
    selection_mode?: SelectionMode;
    sorting?: boolean;
    sorting_mode?: SortingMode;
    filtering?: boolean;
    searching?: boolean;
    column_config?: Record<string, ColumnConfig>;
    // visual formatting
    formatting_config?: FormattingConfig;
  };

export interface DataGridChartProps extends ChartProps<DataGridChartFormData> {
  queriesData: ChartDataResponseResult[];
}

export type DataGridChartTransformedProps = DataGridChartStylesProps & {
  datasource: Datasource;
  formData: DataGridChartFormData;
  dataGrid: DataGridDef;
};
