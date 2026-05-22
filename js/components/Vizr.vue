<template>
  <transition name="fade">
    <div id="vizr-container" v-if="!loading">
      <h1>{{ messages.heading }}</h1>

      <ExampleChart v-show="noCharts" />
      <Instructions :can-edit="canEdit" :has-charts="hasCharts" />

      <div class="error" v-if="hasError">
        {{ errorMessage }}
        <ul v-if="hasErrorDetails">
          <li v-for="message in errorDetails" :key="message">{{ message }}</li>
        </ul>
      </div>

      <div class="vizr-charts">
        <Chart
          v-for="chart in charts"
          :key="chart.id"
          :can-edit="canEdit"
          :metadata="metadata"
          :chart-def="chart"
          @delete-chart="deleteChart"
          @toggle-legend="saveChart"
          @save-chart="saveChart"
        />
      </div>

      <div class="spacious" v-if="canEdit">
        <button
          type="button"
          class="btn btn-warning"
          data-bs-toggle="collapse"
          data-bs-target=".add-chart-form"
          aria-expanded="false"
          aria-controls="add-chart-form"
          :disabled="hasConfigError"
        >
          {{ messages.actions.create }}
        </button>
      </div>

      <ChartForm
        class="add-chart-form col-md-12 collapse"
        :metadata="metadata"
        :chart-def="newChart"
        v-if="canEdit"
        @save-chart="saveChart"
      />

      <VizrVersion />
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, inject, onMounted, nextTick } from 'vue';

import Chart from './Chart';
import ExampleChart from './ExampleChart';
import Instructions from './Instructions';
import VizrVersion from './VizrVersion';
import ChartForm from './ChartForm';

import { newChartDefinition } from '@/util';

const messages = {
  actions: {
    create: 'Build a Chart'
  },
  heading: 'Vizr Charts',
  warnings: {
    configError: 'Project configuration could not be loaded due to an error: ',
    saveError: 'Your chart changes could not be saved:'
  }
};

defineProps({
  pid: Number,
  canEdit: Boolean
});

const dataService = inject('dataService');

// Reactive state
const config = ref({});
const loading = ref(true);
const metadata = ref({});
const newChart = ref(newChartDefinition());
const errorMessage = ref('');
const errorDetails = ref([]);
let configPromise = null;

onMounted(() => {
  // capture the promise to synchronize tests
  configPromise = fetchConfig();
});

/**
 * Gets project metadata and chart configuration.
 */
function fetchConfig() {
  return dataService
    .getProjectConfig()
    .then(captureConfig)
    .catch(handleConfigError)
    .finally(() => {
      loading.value = false;
    });
}

/**
 * Sets metadata and chart configuration from `fetchConfig` response.
 */
function captureConfig(responseArray) {
  const [meta, chartConfig] = responseArray;
  metadata.value = meta;
  config.value = chartConfig;
}

/**
 * Handles rejection of the `fetchConfig` request.
 */
function handleConfigError(reason) {
  config.value = { error: reason };
  errorMessage.value = messages.warnings.configError;
  errorDetails.value = [reason.message];
}

/**
 * Replaces chart configuration after a save request.
 */
function replaceCharts(newCharts) {
  config.value.charts = newCharts;
  if (newCharts.length !== charts.value.length) {
    newChart.value = newChartDefinition();
  }
}

/**
 * Handles rejection of `saveChartConfig` requests.
 */
function handleSaveError(reason) {
  const { message, redcapErrors } = reason;
  errorMessage.value = messages.warnings.saveError;
  errorDetails.value = [message, ...redcapErrors];
}

/**
 * Constructs the new state of the chart configuration array. The old chart config is
 * not mutated.
 */
function _makeNewChartsArray(chartsArr, chartDef, doDeleteChart = false) {
  const { id } = chartDef;
  const index = chartsArr.findIndex(c => c.id === id);
  const isNewChart = index === -1;
  const newCharts = Array.of(...chartsArr);

  if (isNewChart) {
    newCharts.push(chartDef);
  } else if (doDeleteChart) {
    newCharts.splice(index, 1);
  } else {
    newCharts.splice(index, 1, chartDef);
  }

  return newCharts;
}

/**
 * Saves updated chart configuration. On success, the old configuration is replaced.
 */
function saveChartConfig(newCharts) {
  dataService
    .saveChartConfig(newCharts)
    .then(() => replaceCharts(newCharts))
    .catch(handleSaveError);
}

/**
 * Handles deleting a chart.
 */
function deleteChart(chartDef) {
  const newCharts = _makeNewChartsArray(charts.value, chartDef, true);
  saveChartConfig(newCharts);
}

/**
 * Handles saving a new or updated chart.
 */
function saveChart(chartDef) {
  const newCharts = _makeNewChartsArray(charts.value, chartDef);

  // wait for the next tick so the form collapses
  nextTick(() => {
    saveChartConfig(newCharts);
  });
}

// Computed
const hasError = computed(() => Boolean(errorMessage.value));

const hasErrorDetails = computed(
  () => Array.isArray(errorDetails.value) && errorDetails.value.length > 0
);

const hasConfigError = computed(() => Boolean(config.value.error));

const hasCharts = computed(
  () => Boolean(config.value.charts && config.value.charts.length)
);

const noCharts = computed(() => !hasCharts.value);

const charts = computed(() =>
  config.value && config.value.charts ? config.value.charts : []
);

defineExpose({
  get configPromise() { return configPromise; },
  set configPromise(val) { configPromise = val; },
  charts,
  saveChart,
  deleteChart,
  _makeNewChartsArray
});
</script>
