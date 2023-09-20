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

<script>
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

/**
 * Vizr root component. Fetches configuration for the project and renders the charts
 * and forms.
 */
export default {
  name: 'Vizr',
  inject: ['dataService'],

  props: {
    pid: Number,
    canEdit: Boolean
  },

  components: {
    Chart,
    ChartForm,
    ExampleChart,
    Instructions,
    VizrVersion
  },

  data() {
    return {
      messages,
      config: {},
      loading: true,
      metadata: {},
      newChart: newChartDefinition(),
      errorMessage: '',
      errorDetails: []
    };
  },

  mounted() {
    // capture the promise to synchronize tests
    this.configPromise = this.fetchConfig();
  },

  methods: {
    /**
     * Gets project metadata and chart configuration.
     */
    fetchConfig() {
      const { dataService } = this;
      return dataService
        .getProjectConfig()
        .then(this.captureConfig)
        .catch(this.handleConfigError)
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * Sets metadata and chart configuration from `fetchConfig` response.
     * @param {Promise->Object[]} responseArray - `dataService.getProjectConfig` response
     * @see fetchConfig
     * @see data-service.js
     */
    captureConfig(responseArray) {
      const [metadata, chartConfig] = responseArray;
      this.metadata = metadata;
      this.config = chartConfig;
    },

    /**
     * Handles rejection of the `fetchConfig` request.
     * @param {Error} reason - the error that triggered rejection.
     */
    handleConfigError(reason) {
      this.config = { error: reason };
      this.errorMessage = messages.warnings.configError;
      this.errorDetails = [reason.message];
    },

    /**
     * Replaces chart configuration after a save request.
     * @param {Promise->Object[]} newCharts - new chart configuration
     */
    replaceCharts(newCharts) {
      const { config, charts } = this;
      config.charts = newCharts;
      if (newCharts.length !== charts.length) {
        this.newChart = newChartDefinition();
      }
    },

    /**
     * Handles rejection of `saveChartConfig` requests.
     * @param {Error} reason - the reason the `saveChartConfig` request rejected.
     * @see saveChartConfig
     * @see data-service.js
     */
    handleSaveError(reason) {
      const { message, redcapErrors } = reason;
      this.errorMessage = messages.warnings.saveError;
      this.errorDetails = [message, ...redcapErrors];
    },

    /**
     * Constructs the new state of the chart configuration array. The old chart config is
     * not mutated.
     * @param {Object[]} charts - the current chart configuration array
     * @param {Object} chartDef - the chart definition being changed (added, updated, or deleted)
     * @param {Boolean} deleteChart - whether the chart is being deleted (default is false)
     * @return {Object[]} a new array of chart definitions.
     */
    _makeNewChartsArray(charts, chartDef, deleteChart = false) {
      const { id } = chartDef;
      const index = charts.findIndex(c => c.id === id);
      const isNewChart = index === -1;
      const newCharts = Array.of(...charts);

      if (isNewChart) {
        newCharts.push(chartDef);
      } else if (deleteChart) {
        newCharts.splice(index, 1);
      } else {
        newCharts.splice(index, 1, chartDef);
      }

      return newCharts;
    },

    /**
     * Saves updated chart configuration. On success, the old configuration is replaced.
     * @param {Object[]} newCharts - array of new chart definitions
     */
    saveChartConfig(newCharts) {
      const { dataService } = this;
      dataService
        .saveChartConfig(newCharts)
        .then(() => this.replaceCharts(newCharts))
        .catch(this.handleSaveError);
    },

    /**
     * Handles deleting a chart.
     * @param {Object} chartDef - the chart definition to delete
     */
    deleteChart(chartDef) {
      const { charts } = this;
      const newCharts = this._makeNewChartsArray(charts, chartDef, true);
      this.saveChartConfig(newCharts);
    },

    /**
     * Handles saving a new or updated chart.
     * @param {Object} chartDef - the chart definition being added or updated
     */
    saveChart(chartDef) {
      const { charts } = this;
      const newCharts = this._makeNewChartsArray(charts, chartDef);

      // wait for the next tick so the form collapses
      this.$nextTick(() => {
        this.saveChartConfig(newCharts);
      });
    }
  },

  computed: {
    hasError() {
      const { errorMessage } = this;
      return Boolean(errorMessage);
    },

    hasErrorDetails() {
      const { errorDetails } = this;
      return Array.isArray(errorDetails) && errorDetails.length > 0;
    },

    hasConfigError() {
      const { config } = this;
      return Boolean(config.error);
    },

    hasCharts() {
      const { config } = this;
      return Boolean(config.charts && config.charts.length);
    },

    noCharts() {
      return !this.hasCharts;
    },

    charts() {
      const { config } = this;
      return config && config.charts ? config.charts : [];
    },

    newChartFormId() {
      const { newChart } = this;
      return `form-${newChart.id}`;
    }
  }
};
</script>
