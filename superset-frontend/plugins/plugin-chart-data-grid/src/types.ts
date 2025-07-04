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
  GenericDataType,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
  QueryMode,
} from '@superset-ui/core';
import React from 'react';

type SortDirection = 'asc' | 'desc';

type ColumnFilterType = 'text' | 'number' | 'date' | 'select' | 'custom' | null;

type SelectionType = 'row' | 'column' | 'range' | 'cell' | null;

type SelectionMode = 'single' | 'multiple';

type SortingMode = 'single' | 'multiple';

export type RowIndex = number | string | Date;

// TODO: define data format type
export type GenericDataFormat = {};

/** Column definition for data grid */
export type ColumnDef<D extends DataRecord = DataRecord> = {
  /** Unique identifier for the column */
  key: keyof D | string;

  /** Display name for the column header */
  header: string;

  /** Column data type */
  dataType?: GenericDataType;

  /** Column data format */
  dataFormat?: GenericDataFormat;

  /** Whether the column is the index for rows */
  index?: boolean;

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

  /** Type of filter control */
  filterType?: ColumnFilterType;

  /** Custom rendering function for cell data */
  render?: (value: D[keyof D], rowData: D, rowIndex: RowIndex) => React.ReactNode;

  /** Whether the column can be resized */
  resizable?: boolean;

  /** Whether the column can be reordered */
  reorderable?: boolean;

  /** Minimum width in pixels */
  minWidth?: number;

  /** Fixed column width */
  width?: number | string;

  /** Tooltip or helper text for the header */
  tooltip?: string | ((value: D[keyof D], rowData: D, rowIndex: RowIndex) => React.ReactNode);

  /** Custom CSS class for the column */
  className?: string;

  /** Custom function to format export data */
  exportFormatter?: (value: D[keyof D], rowData: D, rowIndex: RowIndex) => string;

  /** Whether this column is included in exports */
  exportable?: boolean;

  /** Whether this column is editable */
  editable?: boolean;

  /** Children columns */
  children?: ColumnDef<D>[];
};

/** Data grid definition */
export type DataGridDef<D extends DataRecord = DataRecord> = {
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

  /** Whether data can be edited */
  editable?: boolean;

  /** Whether data importing is enabled */
  importing?: boolean;

  /** Whether data exporting is enabled */
  exporting?: boolean;
};

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
    is_editable?: boolean;
    key_column?: QueryFormColumn | null;
    allow_update?: boolean;
    allow_insert?: boolean;
    allow_delete?: boolean;
    // options
    pagination?: boolean;
    pagination_page_size?: number;
    sorting?: boolean;
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
  formData: DataGridChartFormData;
  dataGrid: DataGridDef;
};
