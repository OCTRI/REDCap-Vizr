import assert from 'assert';
import axios from 'axios';
import qs from 'qs';

export const ENDPOINTS = {
  CHART_DATA: 'lib/data.php',
  CONFIG: 'lib/chart_defs.php',
  METADATA: 'lib/metadata.php',
  PERSISTENCE: 'lib/persist.php'
};

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
     * @return {Promise-> {recordIdField: string, dataDictionary: Object, charts: Object[]}}
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
     * @return {Promise -> {error: String} | {charts: Object[]}} -
     *   Returns a promise that configuration object with either the single key 'error' or
     *   an array of chart configuration objects.
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
     * @param {{recordIdField: string, filter: string, events: string[], fields: string[] }} -
     *   an object with metadata and chart configuraton needed to perform the data request.
     * @return {Promise-> {data: Object, filterEvents: string[]}} A promise that resolves to
     *   an object with a key for 'data' and 'filterEvents' if the  project is longitudinal.
     */
    getChartData(requestBody) {
      // TODO validate / filter response data (main.js line 460)
      return axios.post(this.dataUrl, qs.stringify(requestBody))
        .then(this._extractData);
    }
  };
}
