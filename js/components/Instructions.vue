<template>
  <ul id="vizr-instructions" class="list-unstyled" v-if="showInstructions">
    <li v-if="showNoChartInstructions" data-no-charts>{{ messages.mainDescription }}</li>
    <li v-if="showNoChartInstructions" data-no-charts>
      {{ messages.threeComponents }}
      <ul>
        <li>{{ messages.chartComponents.recordFilter }}</li>
        <li>{{ messages.chartComponents.timePoint }}</li>
        <li>{{ messages.chartComponents.targetProjection }}</li>
      </ul>
    </li>
    <li>
      <a
        href="#"
        data-toggle="collapse"
        data-target="#collapseMore"
        aria-expanded="false"
        aria-controls="collapseMore"
        >{{ messages.moreInfo.title }}</a
      >
      <div id="collapseMore" class="collapse">
        <li class="more-li">
          {{ messages.moreInfo.timeConfigTitle }}
          <ul>
            <li>
              {{ messages.timeConfig.startDate }}
              <ul>
                <li>{{ messages.timeConfig.startDateDetails }}</li>
                <li>{{ messages.timeConfig.startDateDefault }}</li>
              </ul>
            </li>
            <li>
              {{ messages.timeConfig.endDate }}
              <ul>
                <li>{{ messages.timeConfig.endDateDetails }}</li>
                <li>{{ messages.timeConfig.endDateDefault }}</li>
              </ul>
            </li>
            <li>
              {{ messages.timeConfig.dateEvent }}
              <ul>
                <li>{{ messages.timeConfig.dateEventDetails }}</li>
              </ul>
            </li>
            <li>
              {{ messages.timeConfig.dateField }}
              <ul>
                <li>{{ messages.timeConfig.dateFieldGrouping }}</li>
                <li>{{ messages.timeConfig.dateFieldDetails }}</li>
                <li>{{ messages.timeConfig.dateFieldData }}</li>
              </ul>
            </li>
            <li>
              {{ messages.timeConfig.interval }}
              <ul>
                <li>{{ messages.timeConfig.intervalDetails }}</li>
              </ul>
            </li>
          </ul>
        </li>
        <li class="more-li">
          {{ messages.moreInfo.dataConfigTitle }}
          <ul>
            <li>
              {{ messages.dataConfig.filterLogic }}
              <ul>
                <li>{{ messages.dataConfig.filterLogicDetails }}</li>
              </ul>
            </li>
            <li>
              {{ messages.dataConfig.groupingEvent }}
              <ul>
                <li>{{ messages.dataConfig.groupingEventDetails }}</li>
              </ul>
            </li>
            <li>
              {{ messages.dataConfig.groupingField }}
              <ul>
                <li>{{ messages.dataConfig.groupingFieldDetails }}</li>
                <li>{{ messages.dataConfig.groupingFieldDefault }}</li>
              </ul>
            </li>
          </ul>
        </li>
        <li class="more-li">
          {{ messages.moreInfo.targetTitle }}
          <ul>
            <li>
              {{ messages.targetConfig.targetCount }}
              <ul>
                <li>{{ messages.targetConfig.targetCountDetails }}</li>
                <li>{{ messages.targetConfig.targetGroup }}</li>
              </ul>
            </li>
            <li>
              {{ messages.targetConfig.targetEndDate }}
              <ul>
                <li>{{ messages.targetConfig.targetEndDateDetails }}</li>
              </ul>
            </li>
            <li>{{ messages.targetConfig.targetReason }}</li>
          </ul>
        </li>
        <li class="more-li">
          {{ messages.moreInfo.resultsTitle }}
          <ul>
            <li>{{ messages.results.resultsData }}</li>
            <li>{{ messages.results.resultsEvents }}</li>
            <li>{{ messages.results.resultsArms }}</li>
          </ul>
        </li>
      </div>
    </li>
  </ul>
</template>

<script>
const messages = {
  chartComponents: {
    recordFilter: 'Select the data through a filter.',
    targetProjection: 'Optionally, set target projections for data comparison.',
    timePoint: 'Define a time point to graph the data.'
  },
  dataConfig: {
    filterLogic: 'Filter Logic',
    filterLogicDetails:
      "Use advanced syntax to select the data included in the chart, e.g. [gender] = '1'.",
    groupingEvent: 'Group Field Event (optional)',
    groupingEventDetails:
      'The group field event is used for longitudinal projects to filter the Grouping Field drop-down list to the categorical variables designated for that event.',
    groupingField: 'Field to Group Records (optional)',
    groupingFieldDetails:
      'Select a field with categorical data (field type = radio button, drop down, yes/no, true/false) to group data together in a stacked chart.',
    groupingFieldDefault: 'The default value is no grouping.'
  },
  inExampleAbove: 'In the example above:',
  mainDescription:
    'Vizr Charts are temporal bar charts that visualize the collection, over time, of ' +
    "specific data points captured in your project's individual records, and optionally, " +
    'compare that data to projected targets.',
  moreInfo: {
    dataConfigTitle: 'Data Configuration (Y axis)',
    resultsTitle: 'Longitudinal Data Notes',
    targetTitle: 'Target (optional)',
    timeConfigTitle: 'Time Configuration (X axis)',
    title: 'How to Build a Chart'
  },
  results: {
    resultsData:
      'Data is returned for the events related to the date field, filter and grouping field, for each record returned.',
    resultsEvents:
      'When data is returned for multiple events, the chart will include a notification message and an event drop-down, ' +
      'so the user can filter the chart by events.',
    resultsArms:
      'No data will be returned if the filter logic includes variables in different arms.'
  },
  targetConfig: {
    targetCount: 'Target Count(s)',
    targetCountDetails: 'Define a target number for comparison with the result counts.',
    targetGroup:
      'If a grouping field is selected, inputs will display to enter a target for each group. The total target in the summary table will be the sum of these counts.',
    targetEndDate: 'Target End Date',
    targetEndDateDetails: 'Define a date (deadline) for meeting the target count.',
    targetReason: 'The target count and date are used to calculate the grey trend line.'
  },
  threeComponents: 'There are 3 main components of a Vizr chart.',
  timeConfig: {
    dateEvent: 'Date Field Event',
    dateEventDetails:
      'The date field event is used for longitudinal projects to filter the Date Field drop-down list to the temporal variables designated for that event.',
    dateField: 'Date Field',
    dateFieldDetails:
      "Select a temporal variable from a list of fields in your project to which you've applied the date validation rule.",
    dateFieldGrouping:
      "The date field will be used to graph the data you've collected via the time interval.",
    dateFieldData:
      'Only data that contains a value for selected date field will be included in the chart.',
    endDate: 'End Date',
    endDateDetails: 'Enter a date MM/DD/YYYY to define the end of X axis timeline.',
    endDateDefault: "If no date is entered, the end date will be today's date.",
    interval: 'Interval',
    intervalDetails:
      'Select days, months, weeks or years for the interval of time for the X axis grouping.',
    startDate: 'Start Date',
    startDateDetails: 'Enter a date MM/DD/YYYY to define the start of X axis timeline.',
    startDateDefault:
      'If no start date is entered, the start date will be the first date (returned in your chart results) that was captured for the selected date field.'
  }
};

export default {
  name: 'Instructions',

  props: {
    canEdit: Boolean,
    hasCharts: Boolean
  },

  data() {
    return {
      messages
    };
  },

  computed: {
    showInstructions() {
      return this.showNoChartInstructions || this.showExistingChartInstructions;
    },

    showNoChartInstructions() {
      return !this.hasCharts;
    },

    showExistingChartInstructions() {
      return this.hasCharts && this.canEdit;
    }
  }
};
</script>
