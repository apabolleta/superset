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
  ControlPanelConfig,
  getStandardizedControls,
} from '@superset-ui/chart-controls';
import { t } from '@superset-ui/core';
import {
  allColumnsControlSetItem,
  allowDeleteControlSetItem,
  allowInsertControlSetItem,
  allowUpdateControlSetItem,
  canEditable,
  columnConfigControlSetItem,
  exportingControlSetItem,
  filteringControlSetItem,
  groupByControlSetItem,
  importingControlSetItem,
  isEditable,
  isEditableControlSetItem,
  keyColumnsControlSetItem,
  metricsControlSetItem,
  orderByColumnsControlSetItem,
  orderDescendingControlSetItem,
  paginationControlSetItem,
  paginationPageSizeControlSetItem,
  queryModeControlSetItem,
  searchingControlSetItem,
  selectionControlSetItem,
  selectionModeControlSetItem,
  selectionTypeControlSetItem,
  seriesLimitMetricControlSetItem,
  sortingControlSetItem,
  sortingModeControlSetItem,
} from './controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [queryModeControlSetItem],
        [groupByControlSetItem],
        [metricsControlSetItem],
        [allColumnsControlSetItem],
        [seriesLimitMetricControlSetItem],
        [orderByColumnsControlSetItem],
        [orderDescendingControlSetItem],
        ['row_limit'],
        ['adhoc_filters'],
      ],
    },
    {
      label: t('Interactivity'),
      expanded: true,
      controlSetRows: [
        [isEditableControlSetItem],
        [keyColumnsControlSetItem],
      ],
      visibility: canEditable
    },
    {
      label: t('Permissions'),
      expanded: true,
      controlSetRows: [
        [allowUpdateControlSetItem],
        [allowInsertControlSetItem],
        [allowDeleteControlSetItem],
      ],
      visibility: isEditable
    },
    {
      label: t('Options'),
      expanded: true,
      controlSetRows: [
        [
          paginationControlSetItem,
          paginationPageSizeControlSetItem,
        ],
        [
          selectionControlSetItem,
          selectionTypeControlSetItem,
          selectionModeControlSetItem,
        ],
        [
          sortingControlSetItem,
          sortingModeControlSetItem,
        ],
        [filteringControlSetItem],
        [searchingControlSetItem],
        [
          importingControlSetItem,
          exportingControlSetItem,
        ],
        [columnConfigControlSetItem],
      ],
    },
    {
      label: t('Visual formatting'),
      expanded: true,
      controlSetRows: [
        // [formattingConfigControlSetItem],
      ],
    },
  ],
  formDataOverrides: formData => ({
    ...formData,
    groupby: getStandardizedControls().popAllColumns(),
    metrics: getStandardizedControls().popAllMetrics(),
  }),
};

export default config;
