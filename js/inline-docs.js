import {
  a,
  div,
  figcaption,
  figure,
  img,
  li,
  p,
  strong,
  ul
} from './html';

import vizrExample from '../lib/vizr_example.png';

const messages = {
  chartComponents: {
    recordFilter: "Select the data through a filter.",
    targetProjection: "Optionally, set target projections for data comparison.",
    timePoint: "Define a time point to graph the data."
  },
  dataConfig: {
    filterLogic: "Filter Logic",
    filterLogicDetails: "Use advanced syntax to select the data included in the chart, e.g. [gender] = '1'.",
    groupingEvent: "Group Field Event (optional)",
    groupingEventDetails: "The group field event is used for longitudinal projects to filter the Grouping Field drop-down list to the categorical variables designated for that event.",
    groupingField: "Field to Group Records (optional)",
    groupingFieldDetails: "Select a field with categorical data (field type = radio button, drop down, yes/no, true/false) to group data together in a stacked chart.",
    groupingFieldDefault: "The default value is no grouping."
  },
  example: {
    captionIntro: "Example",
    captionTitle:  ": This charted data has a screen date, is true for screened in = yes, and has a Trend Line comparing collected data to a target count",
    imgTitle: "Example Vizr Chart - Screened In Results"
  },
  inExampleAbove: "In the example above:",
  mainDescription: "Vizr Charts are temporal bar charts that visualize the collection, over time, of " +
    "specific data points captured in your project's individual records, and optionally, " +
    "compare that data to projected targets.",
  moreInfo: {
    dataConfigTitle: "Data Configuration (Y axis)",
    resultsTitle: "Longitudinal Data Notes",
    targetTitle: "Target (optional)",
    timeConfigTitle: "Time Configuration (X axis)",
    title: "How to Build a Chart"
  },
  results: {
    resultsData: "Data is returned for the events related to the date field, filter and grouping field, for each record returned.",
    resultsEvents: "When data is returned for multiple events, the chart will include a notification message and an event drop-down, " +
    "so the user can filter the chart by events.",
    resultsArms: "No data will be returned if the filter logic includes variables in different arms."
  },
  targetConfig: {
    targetCount: "Target Count(s)",
    targetCountDetails: "Define a target number for comparison with the result counts.",
    targetGroup: "If a grouping field is selected, inputs will display to enter a target for each group. The total target in the summary table will be the sum of these counts.",
    targetEndDate: "Target End Date",
    targetEndDateDetails: "Define a date (deadline) for meeting the target count.",
    targetReason: "The target count and date are used to calculate the grey trend line."
  },
  threeComponents: "There are 3 main components of a Vizr chart.",
  timeConfig: {
    dateEvent: "Date Field Event",
    dateEventDetails: "The date field event is used for longitudinal projects to filter the Date Field drop-down list to the temporal variables designated for that event.",
    dateField: "Date Field",
    dateFieldDetails: "Select a temporal variable from a list of fields in your project to which you've applied the date validation rule.",
    dateFieldGrouping: "The date field will be used to graph the data you've collected via the time interval.",
    dateFieldData: "Only data that contains a value for selected date field will be included in the chart.",
    endDate: "End Date",
    endDateDetails: "Enter a date MM/DD/YYYY to define the end of X axis timeline.",
    endDateDefault: "If no date is entered, the end date will be today's date.",
    interval: "Interval",
    intervalDetails: "Select days, months, weeks or years for the interval of time for the X axis grouping.",
    startDate: "Start Date",
    startDateDetails: "Enter a date MM/DD/YYYY to define the start of X axis timeline.",
    startDateDefault: "If no start date is entered, the start date will be the first date (returned in your chart results) that was captured for the selected date field."
  }
};

export function errorMessage(message) {
  return p({class: 'error'}, message);
}

/**
 * Returns markup for an example chart.
 *
 * @return {String} HTML fragment
 */
export function exampleChart() {
  return figure({class: 'pull-right vizr-example hide'},
    img({src: vizrExample, class: 'img-thumbnail', title: messages.example.imgTitle}),
    // Example - Screened In Subjects per Week ...
    figcaption(
      strong(messages.example.captionIntro),
      messages.example.captionTitle
    )
  );
}

/**
 * Returns markup for the list that describes the three main chart components.
 *
 * @return {String} HTML fragment
 */
function chartComponentsList() {
  return ul(
    li(messages.chartComponents.recordFilter), // Selecting records ...
    li(messages.chartComponents.timePoint),    // Defining a time point ...
    li(messages.chartComponents.targetProjection) // Optionally, setting target ...
  );
}

/**
 * Returns markup for the nested list that describes chart time axis configuration.
 *
 * @return {String} HTML fragment
 */
function timeConfigList() {
  return ul(
    li(messages.timeConfig.startDate, // Start Date
      ul(
        li(messages.timeConfig.startDateDetails),
        li(messages.timeConfig.startDateDefault)
      )
    ),
    li(messages.timeConfig.endDate, // End Date
      ul(
        li(messages.timeConfig.endDateDetails),
        li(messages.timeConfig.endDateDefault)
      )
    ),
    li(messages.timeConfig.dateEvent, // Date Event
      ul(
        li(messages.timeConfig.dateEventDetails)
      )
    ),
    li(messages.timeConfig.dateField, // Date Field
      ul(
        li(messages.timeConfig.dateFieldGrouping),
        li(messages.timeConfig.dateFieldDetails),
        li(messages.timeConfig.dateFieldData)
      )
    ),
    li(messages.timeConfig.interval, // Interval
      ul(
        li(messages.timeConfig.intervalDetails)
      )
    )
  );
}

/**
 * Returns markup for the nested list that describes chart value axis configuration.
 *
 * @return {String} HTML fragment
 */
function dataConfigList() {
  return ul(
    li(messages.dataConfig.filterLogic, // Record Filter Logic
      ul(
        li(messages.dataConfig.filterLogicDetails)
      )
    ),
    li(messages.dataConfig.groupingEvent, // Grouping Event
      ul(
        li(messages.dataConfig.groupingEventDetails)
      )
    ),
    li(messages.dataConfig.groupingField, // Grouping Field
      ul(
        li(messages.dataConfig.groupingFieldDetails),
        li(messages.dataConfig.groupingFieldDefault)
      )
    )
  );
}

/**
 * Returns markup for the nested list that describes the target and trend line config.
 *
 * @return {String} HTML fragment
 */
function targetConfigList() {
  return ul(
    li(messages.targetConfig.targetCount, // Target Count
      ul(
        li(messages.targetConfig.targetCountDetails),
        li(messages.targetConfig.targetGroup)
      )
    ),
    li(messages.targetConfig.targetEndDate, // Target End Date
      ul(
        li(messages.targetConfig.targetEndDateDetails)
      )
    ),
    li(messages.targetConfig.targetReason) // Trend Line
  );
}

/**
 * Returns markup for the nested list that describes longitudinal results
 *
 * @return {String} HTML fragment
 */
function resultsList() {
  return ul(
    li(messages.results.resultsData), // Data returned for events
    li(messages.results.resultsEvents), // Events messaging
    li(messages.results.resultsArms) // Arms messaging
  );
}

/**
 * Returns markup for the deeply-nested list in the collapsible div that describes chart
 * configuration options.
 *
 * @return {String} HTML fragment
 */
function moreInfoList() {
  return ul(
    li({class: 'more-li'}, messages.moreInfo.timeConfigTitle, timeConfigList()), // Time Configuration (X axis)
    li({class: 'more-li'}, messages.moreInfo.dataConfigTitle, dataConfigList()), // Data Configuration (Y axis)
    li({class: 'more-li'}, messages.moreInfo.targetTitle, targetConfigList()), // Target (optional)
    li({class: 'more-li'}, messages.moreInfo.resultsTitle, resultsList()) // Longitudianl results
  );
}

/**
 * Returns markup for the list item containing the collapsible list with more instructions.
 *
 * @return {String} HTML fragment
 */
function moreInfoItem() {
  return li(
    a({href: '#', 'data-toggle': 'collapse', 'data-target': '#collapseMore',
      'aria-expanded': 'false', 'aria-controls': 'collapseMore'},
      messages.moreInfo.title // More information about ...
    ),
    div({id: 'collapseMore', class: 'collapse'},
      moreInfoList()
    )
  );
}

/**
 * Returns markup for the inline documentation displayed when no charts are configured.
 *
 * @return {String} HTML fragment
 */
export function noChartInstructions() {
  return ul({id: 'vizr-instructions', class: 'list-unstyled'},
    li(messages.mainDescription), // Vizr Charts are temporal bar charts ...
    li(messages.threeComponents, chartComponentsList()), // There are 3 main components ...
    moreInfoItem()
  );
}

/**
 * Returns markup for the inline documentation that describes how to use the charts when
 * at least one chart is configured.
 *
 * @return {String} HTML fragment
 */
export function existingChartInstructions() {
  return ul({id: 'vizr-instructions', class: 'list-unstyled'},
    moreInfoItem()
  );
}
