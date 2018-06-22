import 'jasmine-ajax';
import { exampleResponses } from '../example-ajax-responses';
import createDataService, { ENDPOINTS } from '@/services/data-service';

describe('data service', () => {
  let mockUrls;

  beforeEach(() => {
    mockUrls = {};
    Object.keys(ENDPOINTS).forEach(key => {
      mockUrls[ENDPOINTS[key]] = '/' + ENDPOINTS[key];
    });
  });

  it('createDataService requires asset URLs', () => {
    expect(() => createDataService()).toThrowError(/Asset URL object is required/);
  });

  it('createDataService requires every endpoint to have a URL', () => {
    mockUrls[ENDPOINTS.PERSISTENCE] = null;
    expect(() => createDataService(mockUrls))
      .toThrowError(/A URL for lib\/persist.php is required/);
  });

  describe('requests', () => {
    let service;

    beforeEach(function() {
      service = createDataService(mockUrls);
      jasmine.Ajax.install();
    });

    afterEach(function() {
      jasmine.Ajax.uninstall();
    });

    it('getMetadata', (done) => {
      const expectedUrl = mockUrls[ENDPOINTS.METADATA];
      jasmine.Ajax.stubRequest(expectedUrl)
        .andReturn(exampleResponses.metadata.longitudinal);

      service.getMetadata().then(metadata => {
        const request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toEqual(expectedUrl);

        // it resolves with the metadata object
        expect(metadata.recordIdField).toBeDefined();
        expect(metadata.dataDictionary).toBeDefined();
        expect(metadata.events).toBeDefined();

        done();
      });
    });

    it('getChartConfig', (done) => {
      const expectedUrl = mockUrls[ENDPOINTS.CONFIG];
      jasmine.Ajax.stubRequest(expectedUrl)
        .andReturn(exampleResponses.config.longitudinal);

      service.getChartConfig().then(chartConfig => {
        const request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toEqual(expectedUrl);

        // it resolves with the chart configuration
        expect(chartConfig.error).not.toBeDefined();
        expect(chartConfig.charts).toBeDefined();
        expect(chartConfig.charts.length).toEqual(1);

        done();
      });
    });

    it('getProjectConfig', (done) => {
      const metadataUrl = mockUrls[ENDPOINTS.METADATA];
      const configUrl = mockUrls[ENDPOINTS.CONFIG];

      jasmine.Ajax.stubRequest(metadataUrl)
        .andReturn(exampleResponses.metadata.longitudinal);
      jasmine.Ajax.stubRequest(configUrl)
        .andReturn(exampleResponses.config.longitudinal);

      service.getProjectConfig().then(projectConfig => {
        const [ metadata, chartConfig ] = projectConfig;

        // first entry in the response is metadata
        expect(metadata).toBeDefined();
        expect(metadata.dataDictionary).toBeDefined();

        // second entry in the response is chart config
        expect(chartConfig).toBeDefined();
        expect(chartConfig.charts).toBeDefined();

        done();
      })
    });

    it('getChartData', (done) => {
      const expectedUrl = mockUrls[ENDPOINTS.CHART_DATA];
      const expectedContentType = 'application/x-www-form-urlencoded';
      jasmine.Ajax.stubRequest(expectedUrl)
        .andReturn(exampleResponses.data.longitudinal);

      service.getChartData({ a: 'b' }).then(chartData => {
        const request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toEqual(expectedUrl);

        // request parameters are URL encoded
        expect(request.requestHeaders['Content-Type']).toEqual(expectedContentType);
        expect(request.params).toEqual('a=b');

        // it extracts data from the response
        expect(chartData.filterEvents).toBeDefined();
        expect(chartData.data).toBeDefined();

        done();
      });
    });
  });
});
