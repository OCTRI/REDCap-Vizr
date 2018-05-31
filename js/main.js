import $ from 'jquery';
import uuid from 'uuid/v4';

import '../lib/vizr.css';

import { makeStackedChart } from './chart-config';
import { groupedByInterval, summarizeGroups, trendPoints } from './bucket';
import { a, button, canvas, div, h3, ul, li, select, option, p, em, span } from './html';
import { renderTotal, render, statistics } from './summary-table';
import { chartForm } from './chart-form';
import { errorMessage, exampleChart, noChartInstructions, existingChartInstructions } from './inline-docs';
import { copyLink, title, newChartDefinition } from './util';
import VERSION_STRING from './version';

const mainContainerSelector = '.vizr-container';
const chartsContainerSelector = '.vizr-charts';
const instructionsSelector = '#vizr-instructions';
const exampleChartSelector = '.vizr-example';
const addFormClass = 'add-chart-form';
const addFormSelector = `.${addFormClass}`;

const messages = {
  actions : {
    confirmDelete: 'Permanently delete chart',
    create: 'Build a Chart',
    delete: 'Delete',
    edit: ' Edit Chart',
    reload: 'Reload Chart ',
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

let endpointUrls = {};

/**
 * Shows more detailed instructions and an example chart if no charts are configured,
 * otherwise hides most documentation.
 */
function showInstructionsForConfig(config) {
  if (!config.charts || config.charts.length < 1) {
    showFirstUseInstructions();
  } else if (config.canEdit){
    showExistingChartInstructions();
  } else {
    $(exampleChartSelector).addClass('hide');
    $(instructionsSelector).addClass('hide');
  }
}

/**
 * Shows the first use instructions. For use when the last chart is deleted.
 */
function showFirstUseInstructions() {
  $(exampleChartSelector).removeClass('hide');
  $(instructionsSelector).replaceWith(noChartInstructions());
}

/**
 * For use after the first chart has been added. Hides the first use instructions and adds content
 * instructions and help for editing existing content.
 */
function showExistingChartInstructions() {
  $(exampleChartSelector).addClass('hide');
  $(instructionsSelector).replaceWith(existingChartInstructions());
}

/**
 * Creates the identified container that will hold all elements of the chart
 * including the header, form, event select, and chart data container
 *
 * @param {Object} metadata - project metadata returned from getMetadata
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 * @param {Object} chartDef - definition for this chart
 * @return {JQuery} - jQuery element for the container
 */
function chartContainer(metadata, config, chartDef) {
  const chartId = chartDef.id;
  const html = div({'id': `chart-${chartId}`, 'class': 'vizr-chart-container'});
  const chartContainer = $(html);

  const header = chartHeader(config, chartDef);
  const reload = reloadLink(metadata, config, chartDef);
  const form = formContainer(metadata, chartDef, updateCallback(chartId, metadata, config));
  const eventSelect = eventSelectContainer(chartDef);
  const chartData = chartDataContainer(config, chartDef);
  chartContainer.append(header);
  chartContainer.append(reload);
  chartContainer.append(form);
  chartContainer.append(eventSelect);
  chartContainer.append(chartData);

  return chartContainer;
}

/**
 * Creates a link that reloads the chart data when clicked. This was added to address spurious
 * issues where REDCap would fail to return data. see REDDEV-518
 *
 * @param {Object} metadata - project metadata returned from getMetadata
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 * @param {Object} chartDef - definition for this chart
 * @return {JQuery} - jQuery element for the reload link
 */
function reloadLink(metadata, config, chartDef) {
  const reloadLink = $(
    a({'href': `#reload-${chartDef.id}`, 'data-description': 'reload'},
      messages.actions.reload,
      span({'class': 'glyphicon glyphicon-refresh', 'aria-hidden': 'true','title': messages.actions.reload})
  ));

  reloadLink.on('click', () => {
    $(`#chart-${chartDef.id}`).find(".vizr-chart-summary").empty();
    $(`#chart-${chartDef.id}`).find('.error').empty();
    getChartData(config, null, chartDef, metadata.recordIdField)
  });

  return reloadLink;
}

/**
 * Creates the header for a chartjs chart. This includes the chart title, an edit link for users
 * with permission, and a div for displaying chart errors.
 *
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 * @param {Object} chartDef - definition for this chart
 * @return {JQuery} - jQuery element for the container
 */
function chartHeader(config, chartDef) {
  const editLink = a({'href': `#form-${chartDef.id}`, 'data-toggle': 'collapse', 'data-description': 'edit'},
    messages.actions.edit);
  const html = div({'class': 'vizr-chart-header'},
    h3({'data-description':'title'}, chartDef.title, config.canEdit ? editLink: null),
    (chartDef.description ? p({'data-description': 'description'}, em(chartDef.description)) : ''),
    div({'class': 'error'}));

  return $(html);
}

/**
 * Creates a container for a chart configuration form.
 *
 * @param {Object} metadata - project metadata returned from getMetadata
 * @param {Object} chartDef - definition for this chart
 * @param {Function} onSave - callback to call to save config changes
 *
 * @return {jQuery} jQuery element for the form
 */
function formContainer(metadata, chartDef, onSave) {
  const html = div({'class': 'vizr-chart-form row'},
                div({'class': 'col-md-12 collapse', 'id': `form-${chartDef.id}`}));
  const elem = $(html);

  // chartForm returns an element
  elem.find('.collapse').append(chartForm(metadata, chartDef, onSave));

  return elem;
}

/**
 * Creates a container to hold the event select dropdown if the data returned contains
 * multiple events.
 */
function eventSelectContainer(chartDef) {
  const html = div({'class': 'vizr-event-select pull-right'});
  return $(html);
}

/**
 * Creates a container for a chartjs chart.
 *
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 * @param {Object} chartDef - definition for this chart
 * @return {JQuery} - jQuery element for the container
 */
function chartDataContainer(config, chartDef) {
  const html = div({'class': 'vizr-chart-data-container'},
                  div({'class': 'row'},
                    div({'class': 'vizr-chart-summary col-md-4'}),
                    div({'class': 'vizr-chart col-md-8'},
                      canvas({'id': `${chartDef.id}`}))));

  const container = $(html);
  container.find('.vizr-chart').prepend(legendToggleLink(config, chartDef));

  // Only include the delete link for users with permission
  if (config.canEdit) {
    container.append(deleteLink(config, chartDef));
  }

  return $(container);
}

/**
 * Creates a link to toggle the chart legend. Clicking the link will modify the
 * configuration.
 *
 * @param {Object} config - configuration object for the project
 * @param {Object} chartDef - chart definition for the object to be deleted.
 */
function legendToggleLink(config, chartDef) {
  const link = $(a({'href': '#', 'class': 'vizr-chart-legend-toggle pull-right',
                    'data-description': 'toggle-legend'},
                   messages.actions.toggleLegend));

  // Add click handler that writes the config to the backend without refreshing
  // the chart. A separate click handler defined in addSummary manages the
  // chart.
  if (config.canEdit) {
    link.on('click', () => {
      chartDef.hide_legend = chartDef.hide_legend ? false : true;
      writeConfig(config, chartDef);
      return false;
    });
  }

  return link;
}

/**
 * Creates table and chart summaries of the data and adds it to the provided container.
 *
 * @param {Object} config - config object with the pid and the chart defs.
 * @param {Object} chartDef - definition for this chart
 * @param {Object[]} data - returned from the API
 */
function addSummary(config, chartDef, data) {
  const container = $(`#chart-${chartDef.id}`);
  const chartEnd = chartDef.chartEnd ? chartDef.chartEnd : new Date(); // today
  const dateInterval = chartDef.dateInterval || 'week'; // Set a default for backward compatibility
  const grouped = groupedByInterval(data, chartDef.field, chartDef.start, chartEnd,
    dateInterval, chartDef.group);
  const summary = summarizeGroups(grouped, chartDef.targets);

  let totalCount = 0;
  let totalTarget = 0;
  Object.keys(summary).forEach(g => {
    totalCount = totalCount + summary[g].count;
    totalTarget = totalTarget + summary[g].target;
  });

  const summaryTables = [renderTotal(totalCount, totalTarget)];
  // Don't render the group table if no group is selected
  if (chartDef.group) {
    summaryTables.push(render(statistics(summary, title(chartDef.group)), "Grouped Results"));
  }

  $(container).find('.vizr-chart-summary').append(...summaryTables);
  const pts = trendPoints(chartDef.start, chartDef.end, dateInterval, totalTarget);
  let chart = makeStackedChart(grouped, chartDef, pts);

  // Add click handler to the Toggle Legend link which toggles the chart legend
  $(container).find('.vizr-chart-legend-toggle').on('click', () => {
    chart.config.options.legend.display = !chart.config.options.legend.display;
    chart.update();
    return false;
  });

  // append links to copy table data
  $(container).find('.vizr-chart-summary table').each(function(index) {
    $(this).find('caption').append(copyLink($(this).get(0)));
  });
}

/**
 * Creates a button that toggles the new chart form.
 *
 * @return {String} HTML fragment
 */
function newChartButton() {
  return div({'class': 'spacious'},
    button({type: 'button', 'class': 'btn btn-warning btn-lg', 'data-toggle': 'collapse',
      'data-target': addFormSelector, 'aria-expanded': 'false', 'aria-controls': addFormClass},
      messages.actions.create
    )
  );
}

/**
 * Creates a form for adding a new chart definition.
 *
 * @param {Object} metadata - project metadata returned from getMetadata
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 *
 * @return {jQuery} jQuery element object for the chart configuration form
 */
function newChartForm(metadata, config) {
  const chartDef = newChartDefinition();
  const form = chartForm(metadata, chartDef, addCallback(metadata, config));
  return $(div({'class': `${addFormClass} collapse`, 'id': `form-${chartDef.id}`})).append(form);
}

/**
 * Appends a chart to the charts container.
 *
 * @param {Object} metadata - project metadata returned from getMetadata
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 * @param {Object} chartDef - definition for this chart
 */
function appendChartWithForm(metadata, config, chartDef) {
  const chartsContainer = $(chartsContainerSelector);

  // Need to add the containers here rather than after fetching data to get a deterministic ordering.
  const container = chartContainer(metadata, config, chartDef);
  chartsContainer.append(container);

  getChartData(config, container, chartDef, metadata.recordIdField);
}

/**
 * Creates a new callback for saving a new chart definition.
 *
 * @param {Object} metadata - project metadata returned from getMetadata
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 *
 * @return {Function} a function that saves the chart definition and loads chart data for
 *   the new definition
 */
function addCallback(metadata, config) {
  return (newChartDef) => {
    const addFormContainer = $(addFormSelector);
    addFormContainer.collapse('hide');

    // Ensure that the user has permission to persist chart before adding new chart.
    writeConfig(config, newChartDef).then(() => {
      // this will be the first chart; hide initial instructions
      showInstructionsForConfig(config);

      // display the new chart
      appendChartWithForm(metadata, config, newChartDef);

      // replace the add chart form
      addFormContainer.replaceWith(newChartForm(metadata, config));
    });
  };
}

/**
 * Creates a new callback for saving an updated chart definition.
 *
 * @param {String} chartID - ID of the chart being saved
 * @param {Object} metadata - project metadata returned from getMetadata;
 *     contains recordIdField, the field the project uses for the primary key.
 * @param {Object} config - config object with the pid of the config project
 *    and the chart defs.
 *
 * @return {Function} a function that saves the chart definition and reloads the chart
 *   with the new definition
 */
function updateCallback(chartId, metadata, config) {
  return (newChartDef) => {
    // Ensure that the user has permission to persist chart before updating.
    writeConfig(config, newChartDef).then(() => {
      const oldChartContainer = $(`#chart-${chartId}`);
      const newChartContainer = chartContainer(metadata, config, newChartDef);
      oldChartContainer.replaceWith(newChartContainer);

      // reload chart
      getChartData(config, newChartContainer, newChartDef, metadata.recordIdField);
    });
  };
}

/**
 * Writes the config to the REDCap configuration project.
 *
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 *     Note that this parameter may be updated by this method.
 * @param {Object} newChartDef - chart definition for the new/updated chart.
 * See #config function.
 * @return {} - result of a persistConfig call
 */
function writeConfig(config, newChartDef) {
  const i = config.charts.findIndex(c => { return c.id === newChartDef.id; });

  // Update config
  if (i < 0) {
    config.charts.push(newChartDef);
  } else {
    config.charts[i] = newChartDef;
  }

  return persistConfig(config);
}


/**
 * Deletes the configuration for a given chart.
 *
 * @param {Object} config - config object with the chart defs.
 * @param {String} chartId - id of the chart object to delete.
 */
function deleteConfig(config, chartId) {
  const i = config.charts.findIndex(c => { return c.id === chartId; });
  if (i >= 0) {
    config.charts.splice(i, 1);
  }
  persistConfig(config);
}

/**
 * Writes the given configuration to the REDCap config project.
 *
 * @param {Object} config - config object with the chart defs.
 * @return {Promise -> Object[]}
 */
function persistConfig(config) {
  return $.ajax({
    url: `${endpointUrls['lib/persist.php']}`,
    contentType: 'application/json',
    data: JSON.stringify({ charts: config.charts }),
    method: 'POST'
  });
}

/**
 * Gets the metadata for the current project.
 *
 * @param {Number} pid - project ID
 *
 * @return {Object} the recordIdField, dataDictionary, and events for the current project
 */
function getMetadata(pid) {
  return $.ajax({
    url: `${endpointUrls['lib/metadata.php']}`,
    method: "GET"
  });
}

/**
 * Gets data from REDCap, then displays a chart and summaries derived from it.
 *
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 * @param {jQuery} container - element where the chart should display
 * @param {Object} chartDef - definition for this chart
 * @param {String} recordIdField - the field the project uses for the primary key
 *
 * @return {Object} The response object with a key for 'data' and 'filterEvents' if the
 *  project is longitudinal
 */
function getChartData(config, container, chartDef, recordIdField) {
  $.ajax({
    url: `${endpointUrls['lib/data.php']}`,
    data: {
      "recordIdField": recordIdField,
      "filter": chartDef.filter,
      "events": [chartDef.dateFieldEvent, chartDef.groupFieldEvent].filter(Boolean), // Filter on events that exist
      "fields": [chartDef.field, chartDef.group].filter(Boolean)
    },
    method: "POST",
    success: function(response) {
      validateResponse(response, config, chartDef);
      // filter records with missing date to prevent errors
      addSummary(config, chartDef, response.data.filter(r => r[chartDef.field] !== ''));
    },
    error: function(response) {
      warn(chartDef.id, [messages.warnings.responseError]);
      console.error('Failed to get chart data. Response:');
      console.error(response);
    }
  });
}

/**
 * Inspect the data, display warnings, and add an event filter if necessary.
 *
 * @param {Object} response - the response object from getChartData
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 * @param {Object} chartDef - definition for this chart
*/
function validateResponse(response, config, chartDef) {
  let warnings = [];

  if (response.data.length === 0) {
    warnings.push(messages.warnings.noData);
  }

  if (response.filterEvents && response.filterEvents.length > 1) {
    warnings.push(messages.warnings.multipleEvents);
    $(`#chart-${chartDef.id} > .vizr-event-select`).append(
      eventSelect(response.filterEvents, config, chartDef, response.data));
  }

  let blankDates = 0;
  let repeatingInstruments = false;

  response.data.forEach(record => {
    if (record[chartDef.field] === '') {
      blankDates++;
    }

    if (record.redcap_repeat_instance !== undefined) {
      repeatingInstruments = true;
    }
  });

  if (blankDates > 0) {
    warnings.push(messages.warnings.blankDateFields(blankDates));
  }

  if (repeatingInstruments) {
    warnings.push(messages.warnings.repeatingInstruments);
  }

  if (warnings.length > 0) {
    warn(chartDef.id, warnings);
  }

}

/**
 * Display warnings on the chart as a bulleted list
 *
 * @param {String} id - The chart definition id
 * @param {Object[]} warnings - Array of strings representing the warnings to display
 *
 */
function warn(id, warnings) {
  const list = ul(...warnings.map(warning => { return li(warning); }));
  $(`#chart-${id}`).find('.error').append(list);
}

/**
 * Generates the HTML for the event selection if multiple events were returned in the data
 * and adds an event listener to change the data when an event is selected
 *
 * @param {Object[]} events - the set of events the data returned
 * @param {Object} config - config object with the pid of the config project and the chart defs.
 * @param {Object} chartDef - chart definition
 * @param {Object[]} data - the data to be aggregated
 *
 * @return {String} HTML for the select
 */
function eventSelect(events, config, chartDef, data) {
  let html = $(select({class: 'form-control', name: 'filter_event', required: 'required'},
    ...eventOptions(events, "")
  ));
  html.on('change', (evt) => {
    // Replace the chart data with a new empty container
    const oldchartDataContainer = $(`#chart-${chartDef.id} > .vizr-chart-data-container`);
    const newchartDataContainer = chartDataContainer(config, chartDef);
    oldchartDataContainer.replaceWith(newchartDataContainer);
    // Chart the data filtered by the event selection
    const filtered = filterByEventSelection(data, evt.target.value);
    addSummary(config, chartDef, filtered);
  });
  return html;
}

/**
 * Generates the HTML for the event selection if multiple events were returned in the data
 *
 * @param {Object[]} events - the set of events the data returned
 * @param {String} selection - the event selected
 *
 * @return {String} HTML for the options
 */
function eventOptions(events, selection) {
  return [
    option({value: ''}, 'All Events'),
    events
      .map(event => option((event===selection ? {value: event, selected: 'selected'} : {value: event}), event))
  ];
}

/**
 * Return the data filtered by the event selection or the full set of data if
 * no selection is made.
 */
function filterByEventSelection(data, selection) {
  return selection ?
    data.filter((record) => record['redcap_event_name'] === selection) : data;
}

/**
 * Retrieve the chart definitions from the REDCap configuration project.
 *
 * @param {Number} pid - project id for the current project
 * @return {Promise -> Object[]} - resolves to an Object with either the key 'error'
 *    or 'records'. Records is a list of 0 or 1 Objects of
 *    {record_id: Number/Str, config_array: JsonString}
 */
function queryChartDefs(pid) {
  return $.ajax({
    url: `${endpointUrls['lib/chart_defs.php']}`,
    method: "GET"
  });
}
/**
 * Construct a project configuration object. Chart definitions are retrieved from the config REDCap
 * project.
 *
 * @param {Number} pid - project id for the current project
 * @param {Boolean} canEdit - boolean indicating whether or not the links should display to
 *   create or edit charts.
 * @return {Promise -> {error: String, pid: Number, canEdit: Boolean charts: Object[]} -
 *   returns a configuration object with either the single key 'error' or the configuration
 */
function config(pid, canEdit) {
  return queryChartDefs(pid).then(chartDef => {
    const { error, configArray } = chartDef;
    if (error) {
      return { error };
    }
    const emptyConfig = (!!configArray && configArray.length < 1);
    let charts = emptyConfig ? [] : configArray;
    return { pid, canEdit, charts };
  });
}

/**
 * Creates a link to delete the chart and form for the provided chart definition. Also triggers the
 * method to persist the change in the config project.
 *
 * @param {Object} config - configuration object for the project
 * @param {Object} chartDef - chart definition for the object to be deleted.
 */
function deleteLink(config, chartDef) {
  const chartId = chartDef.id;
  const link = $(a({'href': '#', 'class': 'pull-right', 'data-description': 'delete'}, messages.actions.delete));
  link.on('click', () => {
    if (confirm(`${messages.actions.confirmDelete}: ${chartDef.title}?`) === true) {
      $(`#chart-${chartId}`).remove();
      deleteConfig(config, chartId);
      showInstructionsForConfig(config);
    }
  });
  return link;
}

/**
 * Creates a div to display the version of Vizr being used.
 */
function vizrVersion() {
  return div({'class': 'vizr-version'}, `REDCap Vizr ${VERSION_STRING}`);
}

/**
 * Main method that will create all the charts and populate them with data.
 *
 * @param {Number} pid - project id; used to construct the data queries.
 * @param {Boolean} canEdit - boolean indicating whether or not the links should display to
 *   create or edit charts.
 */
export function run(pid, canEdit, jsonEndpointUrls) {
  endpointUrls = JSON.parse(jsonEndpointUrls);
  getMetadata(pid).then(metadata => {
    config(pid, canEdit).then(config => {

      let mainContainerElem = $(mainContainerSelector);
      if (config.error) {
        mainContainerElem.append(errorMessage(config.error));
      } else {
        mainContainerElem.prepend(exampleChart());
        showInstructionsForConfig(config);

        config.charts.forEach(chartDef => {
          if (chartDef.id === undefined) {
            chartDef.id = uuid();
          }
          appendChartWithForm(metadata, config, chartDef);
        });

        if (config.canEdit) {
          mainContainerElem.append(newChartButton());
        }

        mainContainerElem.append(newChartForm(metadata, config));
        mainContainerElem.append(vizrVersion());
      }
    }, (jqXHR, status, error) => {
      console.error('Error fetching config');
      console.error(jqXHR, status, error);
    });
  }, (jqXHR, status, error) => {
    console.error('Error fetching metadata');
    console.error(jqXHR, status, error);
  });
}
