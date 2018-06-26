<template>
  <transition name="fade">
    <div id="vizr-container" v-if="!loading">
      <h1>Vizr Charts</h1>

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
               :chart-def="chart"/>
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

      <!-- TODO new chart form -->

      <VizrVersion/>
    </div>
  </transition>
</template>

<script>
import Chart from './Chart';
import ExampleChart from './ExampleChart';
import Instructions from './Instructions';
import VizrVersion from './VizrVersion';

const messages = {
  actions : {
    create: 'Build a Chart',
  },
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
    ExampleChart,
    Instructions,
    VizrVersion
  },

  data() {
    return {
      messages,
      loading: true,
      metadata: {},
      config: {}
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
    }
  }
}
</script>
