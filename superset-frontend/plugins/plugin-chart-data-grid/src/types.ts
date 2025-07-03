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
  ChartDataResponseResult,
  ChartProps,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
  QueryMode,
} from '@superset-ui/core';
import { DataGridProps } from './components/DataGrid/DataGrid';

export type ColumnConfig = {
  sorting?: boolean;
  filtering?: boolean;
  editable?: boolean;
};

export interface FormattingConfig {};

export interface DataGridChartStylesProps {
  width: number;
  height: number;
}

export type DataGridChartFormData = QueryFormData &
  DataGridChartStylesProps & {
    query_mode?: QueryMode;
    groupby?: QueryFormColumn[] | null;
    metrics?: QueryFormMetric[] | null;
    all_columns?: QueryFormColumn[] | null;
    series_limit_metric?: QueryFormMetric[] | QueryFormMetric | null;
    order_by_cols?: QueryFormColumn[] | null;
    order_desc?: boolean;
    // interactivity
    is_editable?: boolean;
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
  columns: DataGridProps['columns'];
  data: DataGridProps['data'];
};
