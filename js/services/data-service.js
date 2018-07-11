import assert from 'assert';
import axios from 'axios';
import qs from 'qs';

export const ENDPOINTS = {
  CHART_DATA: 'lib/data.php',
  CONFIG: 'lib/chart_defs.php',
  METADATA: 'lib/metadata.php',
  PERSISTENCE: 'lib/persist.php'
};

const warnings = {
  blankDateFields: ((count) => `Ignored ${count} ${count > 1 ? 'records' : 'record'} with blank date field.`),
  multipleEvents: 'The filter returned multiple events per record.',
  noData: 'The filter returned 0 records.',
  repeatingInstruments: 'Charts may not work as expected with repeating instruments.'
};

/**
 * Constructs a warning message object.
 * @param {String} key - unique message key in the `warnings` object. Required; must be
 *   present in `warnings`.
 * @param {Array} rest - any other parameters. Used as arguments when `warnings[key]` is
 *   a function.
 * @return {key: String, message: String} an object where the key is the input key and
 *   message is the descriptive message for the warning.
 */
function makeWarning(key, ...rest) {
  assert(warnings[key], `Warning ${key} is not defined`);
  let message;

  if (typeof warnings[key] === 'function') {
    message = warnings[key].apply(null, rest);
  } else {
    message = warnings[key];
  }

  return { key, message };
}

/**
 * Constructs a service that fetches data for the current project from REDCap.
 *
 * @param {Object} assetUrls - key/value pairs where the key is a relative file path
 *   like `lib/data.php`, and the value is the corresponding external module URL
 *   like `http://localhost/redcap/api/?type=module&prefix=vizr&page=lib%2Fdata&pid=14`
 * @return {Object} an object encapsulating REDCap HTTP requests
 */
export default function createDataService(assetUrls) {
  assert(assetUrls, 'Asset URL object is required');
  Object.keys(ENDPOINTS).forEach(key => {
    const endpoint = ENDPOINTS[key];
    assert(assetUrls[endpoint], `A URL for ${endpoint} is required`)
  });

  return {
    metadataUrl: assetUrls[ENDPOINTS.METADATA],
    configUrl: assetUrls[ENDPOINTS.CONFIG],
    persistenceUrl: assetUrls[ENDPOINTS.PERSISTENCE],
    dataUrl: assetUrls[ENDPOINTS.CHART_DATA],

    /**
     * Logs the response for debugging.
     * @param {Promise->Object} response - an axios response object.
     * @return {Promise->Object} the unchanged input response
     * @private
     */
    _logResponse(response) {
      // eslint-disable-next-line no-console
      console.log(response);
      return response;
    },

    /**
     * Extracts data returned by the request.
     * @param {Promise->Object} response - an axios response object.
     * @return {Promise->Object} the response's data
     * @private
     */
    _extractData(response) {
      return response.data;
    },

    /**
     * Inspects chart data and collects warnings.
     * @param {String} dateField - the name of the date field used by the chart.
     * @param {Promise->{data: Object[], filterEvents: String[]}} responseData - REDCap record
     *   data extracted from the request.
     * @return {Promise->{data: Object[], filterEvents: String[], warnings: Object[]}} the
     *   REDCap data response, with an array of warnings added if problematic data are found.
     */
    _validateChartData(dateField, responseData) {
      let { data, filterEvents } = responseData;
      data = data || [];
      filterEvents = filterEvents || [];

      let blankDates = 0;
      let repeatingInstruments = false;

      data.forEach(record => {
        if (record[dateField] === '') {
          blankDates++;
        }

        if (record.redcap_repeat_instance !== undefined) {
          repeatingInstruments = true;
        }
      });

      const warnings = [
        data.length === 0 ? makeWarning('noData') : null,
        filterEvents.length > 1 ? makeWarning('multipleEvents') : null,
        blankDates > 0 ? makeWarning('blankDateFields', blankDates) : null,
        repeatingInstruments ? makeWarning('repeatingInstruments') : null
      ].filter(Boolean);

      return {
        data,
        filterEvents,
        warnings
      };
    },

    /**
     * Removes records with blank dates from the data.
     * @param {String} dateField - the name of the date field used by the chart.
     * @param {Promise->{data: Object[], filterEvents: String[], warnings: Object[]}} validatedData -
     *   REDCap record data passed through `_validateChartData`.
     * @return {Promise->{data: Object[], filterEvents: String[], warnings: Object[]}} the
     *   REDCap record data, with records with blank dates removed.
     */
    _filterBlankDates(dateField, responseData) {
      const { data, filterEvents, warnings } = responseData;
      return {
        data: data.filter(record => record[dateField] !== ''),
        filterEvents,
        warnings
      };
    },

    /**
     * Convenience method that fetches both project metadata and chart configuration.
     *
     * @return {Promise->Object[]} returns a promise that resolves to an array, where the
     *   first entry is the metadata object and the second entry is the chart configuration
     * @see getMetadata
     * @see getChartConfig
     */
    getProjectConfig() {
      return Promise.all([ this.getMetadata(), this.getChartConfig() ]);
    },

    /**
     * Gets the metadata for the current project.
     *
     * @return {Promise->{recordIdField: String, dataDictionary: Object, events: Object[]}}
     *   Returns a promise that resolves to a configuraton object containing the project's
     *   recordIdField, dataDictionary, and events.
     */
    getMetadata() {
      return axios(this.metadataUrl)
        .then(this._extractData);
    },

    /**
     * Gets the current project's chart definitions from the external module settings.
     *
     * @return {Promise ->{charts: Object[]}} - Returns a promise that resolves to an array
     *   of chart configuration objects.
     */
    getChartConfig() {
      return axios(this.configUrl)
        .then(this._extractData)
        .then(data => {
          const { configArray } = data;
          const emptyConfig = Boolean(configArray && configArray.length < 1);
          let charts = emptyConfig ? [] : configArray;
          return { charts };
        });
    },

    /**
     * Gets data from the REDCap project for constructing a chart.
     *
     * @param {String} dateField - the name of the field containing the date used for the
     *   chart's x axis. Used to filter out records with blank dates.
     * @param {{recordIdField: String, filter: String, events: String[], fields: String[] }} -
     *   an object with metadata and chart configuraton needed to perform the data request.
     * @return {Promise->{data: Object[], filterEvents: String[], warnings: Object[]}} A
     *   promise that resolves to an object with the following keys:
     *
     *   - data: An array of REDCap record data objects
     *   - filterEvents: An array of event names if the project is longitudinal and records
     *     were returned from multiple events
     *   - warnings: An array of warning message objects (@see makeWarning)
     */
    getChartData(dateField, requestBody) {
      return axios.post(this.dataUrl, qs.stringify(requestBody))
        .then(this._extractData)
        .then(responseData => this._validateChartData(dateField, responseData))
        .then(validatedData => this._filterBlankDates(dateField, validatedData));
    }
  };
}
