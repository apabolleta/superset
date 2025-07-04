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
  ColumnDef,
  DataGridChartProps,
  DataGridChartTransformedProps,
  DataGridDef
} from '../types';

export default function transformProps(
  chartProps: DataGridChartProps
): DataGridChartTransformedProps {
  const {
    width,
    height,
    rawFormData: formData,
    queriesData,
  } = chartProps;

  const columns: ColumnDef[] = queriesData[0].colnames.map((item) => ({
    key: item,
    header: item,
  }));

  const data = queriesData[0].data;

  const dataGrid: DataGridDef = {
    columns,
    data,
    pagination: formData.pagination,
    paginationPageSize: formData.pagination_page_size,
    sorting: formData.sorting,
    filtering: formData.filtering,
    searching: formData.searching,
  };

  return {
    width,
    height,
    formData,
    dataGrid,
  };
}
