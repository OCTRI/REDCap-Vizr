<template>
  <div :id="chartId" class="vizr-chart-container">
    <div class="vizr-chart-header">
      <h3 data-description="title">{{ chartDef.title }}
        <a :href="formId" data-toggle="collapse" data-description="edit" v-if="canEdit">{{ messages.actions.edit }}</a>
      </h3>
      <p v-if="hasDescription" data-description="description"><em>{{ chartDef.description }}</em></p>
      <div class="error">
        <ul v-if="hasWarnings">
          <li v-for="warning in warnings" :key="warning.key">{{ warning.message }}</li>
        </ul>
      </div>
    </div>

    <a href="#" data-description="reload" role="button" @click.prevent="reloadChart">{{ messages.actions.reload }}
      <span class="glyphicon glyphicon-refresh" aria-hidden="true" :title="messages.actions.reload"></span>
    </a>

    <div class="vizr-chart-form row">
      <div class="col-md-12 collapse" :id="formId">
        <!-- TODO #18 ChartForm component -->
      </div>
    </div>

    <!-- TODO #28 event select -->
    <div class="vizr-event-select pull-right"></div>

    <div class="vizr-chart-data-container">
      <div class="row">
        <ChartSummary
          class="vizr-chart-summary col-md-4"
          :total-count="totalCount"
          :total-target="totalTarget"
          :group="chartDef.group"
          :group-data="summary"/>

        <div class="vizr-chart col-md-8">
          <!-- TODO #25 click handler for legend toggle -->
          <a href="#"
             class="vizr-chart-legend-toggle pull-right"
             data-description="toggle-legend"
             v-if="canEdit"
          >{{ messages.actions.toggleLegend }}</a>
          <canvas :id="id"></canvas>
        </div>
      </div>
      <!-- TODO #29 click handler for delete link -->
      <a href="#" class="pull-right" data-description="delete">{{ messages.actions.delete }}</a>
    </div>
  </div>
</template>

<script>
import { groupedByInterval, summarizeGroups, trendPoints } from '@/bucket';
import { makeStackedChart } from '@/chart-config';

import ChartSummary from '@/components/ChartSummary';

const messages = {
  actions : {
    confirmDelete: 'Permanently delete chart',
    delete: 'Delete',
    edit: ' Edit Chart',
    reload: 'Reload Chart ',
    toggleLegend: 'Hide/Show Legend'
  },
  warnings: {
    responseError: 'Unable to generate a chart.'
  }
};

/**
 * Chart component. Fetches chart data and constructs the chart and summary tables.
 */
export default {
  name: 'Chart',
  inject: ['dataService'],

  props: {
    canEdit: Boolean,
    chartDef: Object,
    metadata: Object
  },

  components: {
    ChartSummary
  },

  data() {
    return {
      messages,
      chart: null,
      chartData: null,
      chartEnd: null,
      dateInterval: null,
      filterEvents: null,
      grouped: null,
      summary: null,
      totalCount: 0,
      totalTarget: 0,
      trendPoints: null,
      warnings: []
    };
  },

  mounted() {
    // capture the promise to synchronize tests
    this.dataPromise = this.fetchData();
  },

  methods: {
    fetchData() {
      const { dataService, chartDef } = this;
      const requestOptions = this._makeRequestOptions();
      return dataService.getChartData(chartDef.field, requestOptions)
        .then(this._captureData)
        .then(this._summarizeData)
        .then(this._calculateTotals)
        .then(this._makeTrendPoints)
        .then(this._makeChart)
        .catch(this._showFetchError);
    },

    _captureData(dataResponse) {
      const { filterEvents, data, warnings } = dataResponse;
      const { chartDef } = this;

      this.chartData = data;
      this.filterEvents = filterEvents;
      this.warnings = warnings;

      this.chartEnd = chartDef.chartEnd ? chartDef.chartEnd : new Date();
      this.dateInterval = chartDef.dateInterval || 'week';
    },

    _summarizeData() {
      const { chartData, chartDef, chartEnd, dateInterval } = this;
      this.grouped = groupedByInterval(chartData, chartDef.field, chartDef.start, chartEnd,
        dateInterval, chartDef.group);
      this.summary = summarizeGroups(this.grouped, chartDef.targets);
    },

    _calculateTotals() {
      const { summary } = this;
      let totalCount = 0;
      let totalTarget = 0;

      Object.keys(summary).forEach(g => {
        totalCount = totalCount + summary[g].count;
        totalTarget = totalTarget + summary[g].target;
      });

      this.totalCount = totalCount;
      this.totalTarget = totalTarget;
    },

    _makeTrendPoints() {
      const { chartDef, dateInterval, totalTarget } = this;
      this.trendPoints = trendPoints(chartDef.start, chartDef.end, dateInterval, totalTarget);
    },

    _makeChart() {
      const { chartDef, grouped, trendPoints } = this;
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = makeStackedChart(grouped, chartDef, trendPoints);
    },

    _clearChart() {
      this.chartData = null;
      this.chartEnd = null;
      this.dateInterval = null;
      this.filterEvents = null;
      this.grouped = null;
      this.summary = null;
      this.totalCount = 0;
      this.totalTarget = 0;
      this.trendPoints = null;

      if (this.chart) {
        this.chart.destroy();
      }
    },

    _showFetchError() {
      const { responseError } = this;
      this._clearChart();
      this.warnings = [ responseError ];
    },

    _makeRequestOptions() {
      const { chartDef, metadata } = this;
      return {
        recordIdField: metadata.recordIdField,
        filter: chartDef.filter,
        events: [chartDef.dateFieldEvent, chartDef.groupFieldEvent].filter(Boolean),
        fields: [chartDef.field, chartDef.group].filter(Boolean)
      };
    },

    /**
     * Click event handler for the reload link.
     */
    reloadChart() {
      this.dataPromise = this.fetchData();
    }
  },

  computed: {
    id() {
      const { chartDef = {} } = this;
      return chartDef.id ? chartDef.id : '';
    },

    chartId() {
      const { id } = this;
      return `chart-${id}`;
    },

    formId() {
      const { id } = this;
      return `form-${id}`;
    },

    responseError() {
      return { key: 'responseError', message: messages.warnings.responseError };
    },

    hasDescription() {
      const { chartDef } = this;
      return Boolean(chartDef && chartDef.description);
    },

    hasWarnings() {
      const { warnings } = this;
      return Boolean(warnings && warnings.length);
    }
  }
};
</script>
