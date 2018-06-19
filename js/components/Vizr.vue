<template>
  <div>
    <h1>Vizr Charts</h1>

    <ExampleChart v-show="noCharts"/>
    <Instructions :can-edit="canEdit" :has-charts="hasCharts"/>

    <div class="vizr-charts">
    </div>

    <div class="spacious">
      <button type="button"
              class="btn btn-lg btn-warning"
              data-toggle="collapse"
              data-target=".add-chart-form"
              aria-expanded="false"
              aria-controls="add-chart-form"
      >
        {{ messages.actions.create }}
      </button>
    </div>

    <!-- TODO new chart form -->

    <VizrVersion/>
  </div>
</template>

<script>
import ExampleChart from './ExampleChart';
import Instructions from './Instructions';
import VizrVersion from './VizrVersion';

const messages = {
  actions : {
    confirmDelete: 'Permanently delete chart',
    create: 'Build a Chart',
    delete: 'Delete',
    edit: ' Edit Chart',
    toggleLegend: 'Hide/Show Legend'
  },
  warnings: {
    blankDateFields: ((count) => `Ignored ${count} records with blank date field.`),
    multipleEvents: 'The filter returned multiple events per record.',
    noData: 'The filter returned 0 records.',
    repeatingInstruments: 'Charts may not work as expected with repeating instruments.',
    responseError: 'Unable to generate a chart.'
  }
};

export default {
  name: 'Vizr',

  props: {
    pid: Number,
    canEdit: Boolean
  },

  data() {
    return {
      messages,
      config: {},
    };
  },

  computed: {
    hasCharts() {
      const config = this.config;
      return !!(config.charts && config.charts.length);
    },

    noCharts() {
      return !this.hasCharts;
    }
  },

  components: {
    ExampleChart,
    Instructions,
    VizrVersion
  }
}
</script>
