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
import { ensureIsArray } from '@superset-ui/core';
import {
  DataGridChartProps,
  DataGridChartTransformedProps,
} from '../types';

export default function transformProps(
  chartProps: DataGridChartProps
): DataGridChartTransformedProps {
  const {
    width,
    height,
    datasource,
    rawFormData: formData,
    queriesData,
  } = chartProps;

  const columns = queriesData[0].colnames.map((item, index) => ({
    key: item,
    header: item,
    dataType: queriesData[0].coltypes[index],
    isRowKey: ensureIsArray(formData.key_columns).includes(item),
  }));

  const data = queriesData[0].data;

  const dataGrid = {
    columns,
    data,
    pagination: formData.pagination,
    paginationPageSize: formData.pagination_page_size,
    selection: formData.selection,
    selectionType: formData.selection_type,
    selectionMode: formData.selection_mode,
    sorting: formData.sorting,
    sortingMode: formData.sorting_mode,
    filtering: formData.filtering,
    searching: formData.searching,
    editing: formData.is_editable ?? undefined,
    importing: formData.importing,
    exporting: formData.exporting,
  };

  return {
    width,
    height,
    datasource,
    formData,
    dataGrid,
  };
}
