<template>
  <div :id="chartId" class="vizr-chart-container">
    <div class="vizr-chart-header">
      <h3 data-description="title">{{ chartDef.title }}</h3>
      <p v-if="hasDescription" data-description="description">
        <em>{{ chartDef.description }}</em>
      </p>
      <p class="chart-controls">
        <a href="#" data-description="reload" role="button" @click.prevent="reloadChart">
          {{ messages.actions.reload }}
          <i class="fas fa-sync-alt" :title="messages.actions.reload"></i>
        </a>
        <a
          :href="formIdSelector"
          role="button"
          data-bs-toggle="collapse"
          data-description="edit"
          v-if="canEdit"
        >
          {{ messages.actions.edit }} <i class="far fa-edit"></i>
        </a>
        <a
          href="#"
          class="delete"
          data-description="delete"
          v-if="canEdit"
          @click.prevent="deleteChart"
        >
          {{ messages.actions.delete }} <i class="far fa-trash-alt"></i>
        </a>
      </p>
      <div v-if="hasWarnings" class="alert alert-warning warning">
        <button type="button" class="close" aria-label="Close" @click="resetWarnings">
          <span aria-hidden="true">&times;</span>
        </button>
        <ul>
          <li v-for="warning in warnings" :key="warning.key">{{ warning.message }}</li>
        </ul>
      </div>
    </div>
    <div class="vizr-chart-form row">
      <ChartForm
        class="col-md-12 collapse"
        :metadata="metadata"
        :chart-def="chartDef"
        v-if="canEdit"
        @save-chart="saveChart"
      />
    </div>

    <div class="row">
      <span class="vizr-event-select col-xs-3">
        <select
          class="form-control form-control-sm form-select"
          name="filter-event"
          v-if="hasMultipleEvents"
          v-model="selectedEvent"
          @change="chartFilterChanged"
          required
        >
          <option :value="allEventsSentinel">All Events</option>
          <option
            v-for="filterEvent in filterEvents"
            :key="filterEvent"
            :value="filterEvent"
          >
            {{ filterEvent }}
          </option>
        </select>
      </span>
      <span class="col-xs-9"></span>
    </div>

    <div class="vizr-chart-data-container">
      <div class="row">
        <div class="vizr-chart col-md-12">
          <a
            href="#"
            class="vizr-chart-legend-toggle pull-right float-right"
            data-description="toggle-legend"
            @click.prevent="toggleLegend"
          >
            {{ messages.actions.toggleLegend }}
          </a>
          <canvas ref="canvas" :id="id"></canvas>
        </div>
      </div>

      <ChartSummary
        class="vizr-chart-summary"
        :total-count="totalCount"
        :total-target="totalTarget"
        :group="chartDef.group"
        :group-data="summary"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted } from 'vue';
import moment from 'moment';
import { groupedByInterval, summarizeGroups, trendPoints as calcTrendPoints } from '@/bucket';
import { makeStackedChart } from '@/chart-config';

import ChartForm from '@/components/ChartForm';
import ChartSummary from '@/components/ChartSummary';

const ALL_EVENTS = 'ALL_EVENTS';

const messages = {
  actions: {
    confirmDelete: 'Permanently delete chart',
    delete: 'Delete',
    edit: 'Edit',
    reload: 'Reload',
    toggleLegend: 'Hide/Show Legend'
  },
  warnings: {
    responseError: 'Unable to generate a chart.'
  }
};

const props = defineProps({
  canEdit: Boolean,
  chartDef: Object,
  metadata: Object
});

const emit = defineEmits(['save-chart', 'delete-chart', 'toggle-legend']);

const dataService = inject('dataService');

// Template ref
const canvas = ref(null);

// Reactive state
const allEventsSentinel = ALL_EVENTS;
const loaded = ref(false);
const chart = ref(null);
const chartData = ref([]);
const filterEvents = ref([]);
const selectedEvent = ref(ALL_EVENTS);
const warnings = ref([]);
let dataPromise = null;

onMounted(() => {
  // capture the promise to synchronize tests
  dataPromise = fetchData();
});

watch(
  () => props.chartDef,
  () => reloadChart()
);

function fetchData() {
  const requestOptions = _makeRequestOptions();
  return dataService
    .getChartData(props.chartDef.field, requestOptions)
    .then(_captureData)
    .then(_makeChart)
    .catch(_showFetchError);
}

function _captureData(dataResponse) {
  const { filterEvents: fe, data, warnings: w } = dataResponse;

  chartData.value = data;
  filterEvents.value = fe;
  warnings.value = w;
  loaded.value = true;
}

function _makeChart() {
  if (chart.value) {
    chart.value.destroy();
  }
  chart.value = makeStackedChart(canvas.value, grouped.value, props.chartDef, trendPoints.value);
}

function _clearChart() {
  chartData.value = [];
  filterEvents.value = [];
  selectedEvent.value = ALL_EVENTS;

  if (chart.value) {
    chart.value.destroy();
  }
}

function _showFetchError() {
  _clearChart();
  warnings.value = [responseError.value];
}

function _makeRequestOptions() {
  const { chartDef, metadata } = props;
  return {
    recordIdField: metadata.recordIdField,
    filter: chartDef.filter,
    events: [chartDef.dateFieldEvent, chartDef.groupFieldEvent].filter(Boolean),
    fields: [chartDef.field, chartDef.group].filter(Boolean)
  };
}

/**
 * Save handler for the chart form.
 */
function saveChart(chartDef) {
  emit('save-chart', chartDef);
}

/**
 * Click event handler for the delete link.
 */
function deleteChart() {
  const { chartDef } = props;
  if (confirm(`${messages.actions.confirmDelete}: ${chartDef.title}?`)) {
    emit('delete-chart', chartDef);
  }
}

/**
 * Click event handler for the reload link. Fetches chart data again.
 */
function reloadChart() {
  dataPromise = fetchData();
}

/**
 * Click event handler for the legend toggle link.
 */
function toggleLegend() {
  const { canEdit, chartDef } = props;
  chart.value.config.options.legend.display = !chart.value.config.options.legend.display;
  chart.value.update();

  if (canEdit) {
    chartDef.hide_legend = !chartDef.hide_legend;
    emit('toggle-legend', chartDef);
  }
}

/**
 * Refreshes the chart after the event filter changes.
 */
function chartFilterChanged() {
  _makeChart();
}

/**
 * Reset the warnings.
 */
function resetWarnings() {
  warnings.value = [];
}

// Computed
const id = computed(() => {
  const { chartDef = {} } = props;
  return chartDef.id ? chartDef.id : '';
});

const chartId = computed(() => `chart-${id.value}`);

const formId = computed(() => `form-${id.value}`);

const formIdSelector = computed(() => `#${formId.value}`);

const responseError = computed(() => ({
  key: 'responseError',
  message: messages.warnings.responseError
}));

const hasDescription = computed(() => Boolean(props.chartDef && props.chartDef.description));

const hasWarnings = computed(() => Boolean(warnings.value && warnings.value.length));

const hasMultipleEvents = computed(
  () => Boolean(filterEvents.value && filterEvents.value.length > 1)
);

const chartEnd = computed(() => {
  const { chartDef } = props;
  return chartDef.chartEnd ? chartDef.chartEnd : moment().format('YYYY-MM-DD');
});

const dateInterval = computed(() => {
  const { chartDef } = props;
  return chartDef.dateInterval ? chartDef.dateInterval : 'week';
});

const filteredData = computed(() => {
  const eventFilter = record => record.redcap_event_name === selectedEvent.value;
  return selectedEvent.value === allEventsSentinel
    ? chartData.value
    : chartData.value.filter(eventFilter);
});

const grouped = computed(() => {
  const { chartDef } = props;
  return loaded.value
    ? groupedByInterval(
        filteredData.value,
        chartDef.field,
        chartDef.start,
        chartEnd.value,
        dateInterval.value,
        chartDef.group
      )
    : {};
});

const summary = computed(() => summarizeGroups(grouped.value, props.chartDef.targets));

const totalCount = computed(() =>
  summary.value
    ? Object.keys(summary.value).reduce((total, k) => total + summary.value[k].count, 0)
    : 0
);

const totalTarget = computed(() =>
  summary.value
    ? Object.keys(summary.value).reduce((total, k) => total + summary.value[k].target, 0)
    : 0
);

const trendPoints = computed(() =>
  calcTrendPoints(
    props.chartDef.start,
    props.chartDef.end,
    dateInterval.value,
    totalTarget.value
  )
);

defineExpose({
  get dataPromise() { return dataPromise; },
  set dataPromise(val) { dataPromise = val; },
  chart,
  chartData,
  filterEvents,
  filteredData,
  grouped,
  summary,
  totalCount,
  totalTarget
});
</script>
