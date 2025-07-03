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
  ColumnMeta,
  ControlConfig,
  ControlPanelsContainerProps,
  ControlPanelState,
  ControlSetItem,
  ControlState,
  ControlStateMapping,
  Dataset,
  defineSavedMetrics,
  ExtraControlProps,
  formatSelectOptions,
  QueryModeLabel,
  sharedControls,
} from '@superset-ui/chart-controls';
import {
  ensureIsArray,
  QueryFormColumn,
  QueryMode,
  t,
} from '@superset-ui/core';
import { isEmpty } from 'lodash';

export function getQueryMode(controls: ControlStateMapping): QueryMode {
  const mode = controls?.query_mode?.value;
  if (mode === QueryMode.Aggregate || mode === QueryMode.Raw) {
    return mode as QueryMode;
  }
  const rawColumns = controls?.all_columns?.value as
    | QueryFormColumn[]
    | undefined;
  const hasRawColumns = rawColumns && rawColumns.length > 0;
  return hasRawColumns ? QueryMode.Raw : QueryMode.Aggregate;
}

/**
 * Visibility check
 */
export function isQueryMode(mode: QueryMode) {
  return ({ controls }: Pick<ControlPanelsContainerProps, 'controls'>) =>
    getQueryMode(controls) === mode;
}

export const isAggMode = isQueryMode(QueryMode.Aggregate);
export const isRawMode = isQueryMode(QueryMode.Raw);

export const validateAggControlValues = (
  controls: ControlStateMapping,
  values: any[],
) => {
  const areControlsEmpty = values.every(val => ensureIsArray(val).length === 0);
  return areControlsEmpty && isAggMode({ controls })
    ? [t('Group By or Metrics must have a value')]
    : [];
};

export enum DatasetType {
  Physical = 'physical',
  Virtual = 'virtual',
}

export function getDatasetType(controls: ControlStateMapping): DatasetType | null {
  const datasource = controls?.datasource?.datasource;
  if (!datasource) return null;
  return datasource.sql ? DatasetType.Virtual : DatasetType.Physical;
}

export function checkEditable(controls: ControlStateMapping) {
  return getQueryMode(controls) === QueryMode.Raw && getDatasetType(controls) === DatasetType.Physical;
}

export function getEditable(controls: ControlStateMapping) {
  return checkEditable(controls) && controls?.is_editable?.value;
}

export const canEditable = ({ controls }: Pick<ControlPanelsContainerProps, 'controls'>) =>
  checkEditable(controls) === true;

export const isEditable = ({ controls }: Pick<ControlPanelsContainerProps, 'controls'>) =>
  getEditable(controls) === true;

/**
 * Controls
 */
const queryMode: ControlConfig<'RadioButtonControl'> = {
  type: 'RadioButtonControl',
  label: t('Query mode'),
  default: null,
  options: [
    [QueryMode.Aggregate, QueryModeLabel[QueryMode.Aggregate]],
    [QueryMode.Raw, QueryModeLabel[QueryMode.Raw]],
  ],
  mapStateToProps: ({ controls }) => ({ value: getQueryMode(controls) }),
  rerender: ['all_columns', 'groupby', 'metrics'],
};

export const queryModeControlSetItem: ControlSetItem = {
  name: 'query_mode',
  config: queryMode,
};

export const groupByControlSetItem: ControlSetItem = {
  name: 'groupby',
  override: {
    visibility: isAggMode,
    resetOnHide: false,
    mapStateToProps: (state: ControlPanelState, controlState: ControlState) => {
      const { controls } = state;
      const originalMapStateToProps = sharedControls?.groupby?.mapStateToProps;
      const newState = originalMapStateToProps?.(state, controlState) ?? {};
      newState.externalValidationErrors = validateAggControlValues(controls, [
        controls.metrics?.value,
        controlState.value,
      ]);
      return newState;
    },
    rerender: ['metrics'],
  },
};

export const metricsControlSetItem: ControlSetItem = {
  name: 'metrics',
  override: {
    validators: [],
    visibility: isAggMode,
    mapStateToProps: (
      { controls, datasource, form_data }: ControlPanelState,
      controlState: ControlState,
    ) => ({
      columns: datasource?.columns[0]?.hasOwnProperty('filterable')
        ? (datasource as Dataset)?.columns?.filter(
            (c: ColumnMeta) => c.filterable,
          )
        : datasource?.columns,
      savedMetrics: defineSavedMetrics(datasource),
      // current active adhoc metrics
      selectedMetrics:
        form_data.metrics || (form_data.metric ? [form_data.metric] : []),
      datasource,
      externalValidationErrors: validateAggControlValues(controls, [
        controls.groupby?.value,
        controlState.value,
      ]),
    }),
    rerender: ['groupby'],
    resetOnHide: false,
  },
};

const dndAllColumns: typeof sharedControls.groupby = {
  type: 'DndColumnSelect',
  label: t('Columns'),
  description: t('Columns to display'),
  default: [],
  mapStateToProps({ datasource, controls }, controlState) {
    const newState: ExtraControlProps = {};
    if (datasource) {
      if (datasource?.columns[0]?.hasOwnProperty('filterable')) {
        newState.options = (datasource as Dataset)?.columns?.filter(
          (c: ColumnMeta) => c.filterable,
        );
      } else newState.options = datasource.columns;
    }
    newState.queryMode = getQueryMode(controls);
    newState.externalValidationErrors =
      isRawMode({ controls }) && ensureIsArray(controlState?.value).length === 0
        ? [t('must have a value')]
        : [];
    return newState;
  },
  visibility: isRawMode,
  resetOnHide: false,
};

export const allColumnsControlSetItem: ControlSetItem = {
  name: 'all_columns',
  config: dndAllColumns,
};

export const seriesLimitMetricControlSetItem: ControlSetItem = {
  name: 'series_limit_metric',
  override: {
    visibility: isAggMode,
    resetOnHide: false,
  },
};

export const orderDescendingControlSetItem: ControlSetItem = {
  name: 'order_desc',
  override: {
    visibility: ({ controls }) =>
      !!(
        isAggMode({ controls }) &&
        controls?.series_limit_metric.value &&
        !isEmpty(controls?.series_limit_metric.value)
      ),
    resetOnHide: false,
  },
};

export const orderByColumnsControlSetItem: ControlSetItem = {
  name: 'order_by_cols',
  config: {
    type: 'SelectControl',
    label: t('Ordering'),
    description: t('Order results by selected columns'),
    multi: true,
    default: [],
    mapStateToProps: ({ datasource }) => ({
      choices: datasource?.hasOwnProperty('order_by_choices')
        ? (datasource as Dataset)?.order_by_choices
        : datasource?.columns || [],
    }),
    visibility: isRawMode,
    resetOnHide: false,
  },
};

export const isEditableControlSetItem: ControlSetItem = {
  name: 'is_editable',
  config: {
    type: 'CheckboxControl',
    label: t('Editable'),
    description: t('If enabled, this control allows interactive editing'),
    visibility: canEditable,
    rerender: ['allow_update', 'allow_insert', 'allow_delete'],
  }
};

export const allowUpdateControlSetItem: ControlSetItem = {
  name: 'allow_update',
  config: {
    type: 'CheckboxControl',
    label: t('Allow update'),
    description: t('Allows UPDATE operation'),
    visibility: isEditable,
  }
};

export const allowInsertControlSetItem: ControlSetItem = {
  name: 'allow_insert',
  config: {
    type: 'CheckboxControl',
    label: t('Allow insert'),
    description: t('Allows INSERT operation'),
    visibility: isEditable,
  }
};

export const allowDeleteControlSetItem: ControlSetItem = {
  name: 'allow_delete',
  config: {
    type: 'CheckboxControl',
    label: t('Allow delete'),
    description: t('Allows DELETE operation'),
    visibility: isEditable,
  }
};

export const keyColumnControlSetItem: ControlSetItem = {
  name: 'entity',
  override: {
    label: t('Key column'),
    description: t('Column that uniquely identifies rows'),
    validators: [],
    visibility: isEditable,
    resetOnHide: false,
  },
};

export const paginationControlSetItem: ControlSetItem = {
  name: 'pagination',
  config: {
    type: 'CheckboxControl',
    label: t('Pagination'),
    description: t('Enable pagination'),
    renderTrigger: true,
  }
};

export const PAGINATION_PAGE_SIZE_OPTIONS = formatSelectOptions<number>([
  [0, t('Auto')],
  10,
  20,
  50,
  100,
  200,
  500,
]);

export const paginationPageSizeControlSetItem: ControlSetItem = {
  name: 'pagination_page_size',
  config: {
    type: 'SelectControl',
    label: t('Page size'),
    description: t('Pagination page size'),
    choices: PAGINATION_PAGE_SIZE_OPTIONS,
    renderTrigger: true,
    visibility: ({ controls }) => controls?.pagination?.value === true,
  }
};

export const sortingControlSetItem: ControlSetItem = {
  name: 'sorting',
  config: {
    type: 'CheckboxControl',
    label: t('Sorting'),
    description: t('Enable sorting'),
    renderTrigger: true,
  }
};

export const filteringControlSetItem: ControlSetItem = {
  name: 'filtering',
  config: {
    type: 'CheckboxControl',
    label: t('Filtering'),
    description: t('Enable filtering'),
    renderTrigger: true,
  }
};

export const searchingControlSetItem: ControlSetItem = {
  name: 'searching',
  config: {
    type: 'CheckboxControl',
    label: t('Searching'),
    description: t('Enable searching'),
    renderTrigger: true,
  }
};

export const columnConfigControlSetItem: ControlSetItem = {
  name: 'column_config',
  config: {
    type: 'ColumnConfigControl',
    label: t('Customize columns'),
    description: t('Further customize how to display each column'),
    width: 400,
    height: 320,
    renderTrigger: true,
    shouldMapStateToProps: () => true,
    mapStateToProps: (explore, _, chart) => ({
      columnsPropsObject: {
        colnames: chart?.queriesResponse?.[0]?.colnames,
        coltypes: chart?.queriesResponse?.[0]?.coltypes,
      }
    }),
  }
}
