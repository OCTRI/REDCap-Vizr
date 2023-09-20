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

<script>
import moment from 'moment';
import { groupedByInterval, summarizeGroups, trendPoints } from '@/bucket';
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
    ChartForm,
    ChartSummary
  },

  data() {
    return {
      messages,
      allEventsSentinel: ALL_EVENTS,
      loaded: false,
      chart: null,
      chartData: [],
      filterEvents: [],
      selectedEvent: ALL_EVENTS,
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
      return dataService
        .getChartData(chartDef.field, requestOptions)
        .then(this._captureData)
        .then(this._makeChart)
        .catch(this._showFetchError);
    },

    _captureData(dataResponse) {
      const { filterEvents, data, warnings } = dataResponse;

      this.chartData = data;
      this.filterEvents = filterEvents;
      this.warnings = warnings;
      this.loaded = true;
    },

    _makeChart() {
      const { chartDef, grouped, trendPoints } = this;
      const { canvas } = this.$refs;
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = makeStackedChart(canvas, grouped, chartDef, trendPoints);
    },

    _clearChart() {
      this.chartData = [];
      this.filterEvents = [];
      this.selectedEvent = ALL_EVENTS;

      if (this.chart) {
        this.chart.destroy();
      }
    },

    _showFetchError() {
      const { responseError } = this;
      this._clearChart();
      this.warnings = [responseError];
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
     * Save handler for the chart form.
     */
    saveChart(chartDef) {
      this.$emit('save-chart', chartDef);
    },

    /**
     * Click event handler for the delete link.
     */
    deleteChart() {
      const { chartDef, messages } = this;
      if (confirm(`${messages.actions.confirmDelete}: ${chartDef.title}?`)) {
        this.$emit('delete-chart', chartDef);
      }
    },

    /**
     * Click event handler for the reload link. Fetches chart data again.
     */
    reloadChart() {
      this.dataPromise = this.fetchData();
    },

    /**
     * Click event handler for the legend toggle link.
     */
    toggleLegend() {
      const { canEdit, chart, chartDef } = this;
      chart.config.options.legend.display = !chart.config.options.legend.display;
      chart.update();

      if (canEdit) {
        chartDef.hide_legend = !chartDef.hide_legend;
        this.$emit('toggle-legend', chartDef);
      }
    },

    /**
     * Refreshes the chart after the event filter changes.
     */
    chartFilterChanged() {
      this._makeChart();
    },

    /**
     * Reset the warnings.
     */
    resetWarnings() {
      this.warnings = [];
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

    formIdSelector() {
      const { formId } = this;
      return `#${formId}`;
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
    },

    hasMultipleEvents() {
      const { filterEvents } = this;
      return Boolean(filterEvents && filterEvents.length > 1);
    },

    chartEnd() {
      const { chartDef } = this;
      return chartDef.chartEnd ? chartDef.chartEnd : moment().format('YYYY-MM-DD');
    },

    dateInterval() {
      const { chartDef } = this;
      return chartDef.dateInterval ? chartDef.dateInterval : 'week';
    },

    filteredData() {
      const { allEventsSentinel, selectedEvent, chartData } = this;
      const eventFilter = record => record.redcap_event_name === selectedEvent;
      return selectedEvent === allEventsSentinel
        ? chartData
        : chartData.filter(eventFilter);
    },

    grouped() {
      const { loaded, filteredData, chartDef, chartEnd, dateInterval } = this;
      return loaded
        ? groupedByInterval(
            filteredData,
            chartDef.field,
            chartDef.start,
            chartEnd,
            dateInterval,
            chartDef.group
          )
        : {};
    },

    summary() {
      const { grouped, chartDef } = this;
      return summarizeGroups(grouped, chartDef.targets);
    },

    totalCount() {
      const { summary } = this;
      return summary
        ? Object.keys(summary).reduce((total, k) => total + summary[k].count, 0)
        : 0;
    },

    totalTarget() {
      const { summary } = this;
      return summary
        ? Object.keys(summary).reduce((total, k) => total + summary[k].target, 0)
        : 0;
    },

    trendPoints() {
      const { chartDef, dateInterval, totalTarget } = this;
      return trendPoints(chartDef.start, chartDef.end, dateInterval, totalTarget);
    }
  },

  watch: {
    /**
     * Watches the `chartDef` prop for changes, indicating that it was replaced by a save.
     */
    chartDef() {
      this.reloadChart();
    }
  }
};
</script>
