<template>
  <transition name="fade">
    <div id="vizr-container" v-if="!loading">
      <h1>{{ messages.heading }}</h1>

      <ExampleChart v-show="noCharts"/>
      <Instructions :can-edit="canEdit" :has-charts="hasCharts"/>

      <div class="error" v-if="hasConfigError">
        {{ messages.warnings.configError }} {{ config.error.message }}
      </div>

      <div class="vizr-charts">
        <Chart v-for="chart in charts"
               :key="chart.id"
               :can-edit="canEdit"
               :metadata="metadata"
               :chart-def="chart"
               @delete-chart="deleteChart"
               @toggle-legend="saveChart"/>
      </div>

      <div class="spacious" v-if="canEdit">
        <button type="button"
                class="btn btn-lg btn-warning"
                data-toggle="collapse"
                data-target=".add-chart-form"
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
        @save-chart="saveChart"/>

      <VizrVersion/>
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
  actions : {
    create: 'Build a Chart',
  },
  heading: 'Vizr Charts',
  warnings: {
    configError: 'Project configuration could not be loaded due to an error: '
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
      newChart: newChartDefinition()
    };
  },

  mounted() {
    // capture the promise to synchronize tests
    this.configPromise = this.fetchConfig();
  },

  methods: {
    fetchConfig() {
      const { dataService } = this;
      return dataService.getProjectConfig()
        .then(responseArray => {
          const [ metadata, chartConfig ] = responseArray;
          this.metadata = metadata;
          this.config = chartConfig;
        })
        .catch(reason => {
          this.config = { error: reason };
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * Handles deleting a chart.
     */
    deleteChart(id) {
      console.log(`delete chart ${id}`);
      const { config } = this;
      const index = config.charts.findIndex(c => c.id === id);
      if (index >= 0) {
        config.charts.splice(index, 1);
      }
    },

    /**
     * Handles saving a new or updated chart.
     */
    saveChart(chartDef) {
      const { config } = this;
      const { id } = chartDef;
      const index = config.charts.findIndex(c => c.id === id);
      if (index >= 0) {
        console.log(`found existing chart at index ${index}`);
        config.charts[index] = chartDef;
      } else {
        console.log(`chart ${id} is a new chart`);
        config.charts.push(chartDef);
        this.newChart = newChartDefinition();
      }
    }
  },

  computed: {
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
}
</script>
