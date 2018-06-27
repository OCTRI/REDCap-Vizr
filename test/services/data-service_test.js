import 'jasmine-ajax';
import { exampleResponses } from '../example-ajax-responses';
import createDataService, { ENDPOINTS } from '@/services/data-service';

const mockUrls = {};
Object.keys(ENDPOINTS).forEach(key => {
  mockUrls[ENDPOINTS[key]] = '/' + ENDPOINTS[key];
});

describe('data service', () => {
  it('createDataService requires asset URLs', () => {
    expect(() => createDataService()).toThrowError(/Asset URL object is required/);
  });

  it('createDataService requires every endpoint to have a URL', () => {
    const missingUrls = Object.assign({}, mockUrls);
    missingUrls[ENDPOINTS.PERSISTENCE] = null;
    expect(() => createDataService(missingUrls))
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

    describe('getMetadata', () => {
      const expectedUrl = mockUrls[ENDPOINTS.METADATA];

      beforeEach(() => {
        jasmine.Ajax.stubRequest(expectedUrl)
          .andReturn(exampleResponses.metadata.longitudinal);
      });

      it('resolves with the metadata object', (done) => {
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
    });

    describe('getChartConfig', () => {
      const expectedUrl = mockUrls[ENDPOINTS.CONFIG];

      beforeEach(() => {
        jasmine.Ajax.stubRequest(expectedUrl)
          .andReturn(exampleResponses.config.longitudinal);
      });

      it('resolves with the chart config', (done) => {
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
    });

    describe('getProjectConfig', () => {
      const metadataUrl = mockUrls[ENDPOINTS.METADATA];
      const configUrl = mockUrls[ENDPOINTS.CONFIG];

      beforeEach(() => {
        jasmine.Ajax.stubRequest(metadataUrl)
          .andReturn(exampleResponses.metadata.longitudinal);
        jasmine.Ajax.stubRequest(configUrl)
          .andReturn(exampleResponses.config.longitudinal);
      });

      it('gets both metadata and chart config', (done) => {
        service.getProjectConfig().then(projectConfig => {
          const [ metadata, chartConfig ] = projectConfig;

          // first entry in the response is metadata
          expect(metadata).toBeDefined();
          expect(metadata.dataDictionary).toBeDefined();

          // second entry in the response is chart config
          expect(chartConfig).toBeDefined();
          expect(chartConfig.charts).toBeDefined();

          done();
        });
      });
    });

    describe('getChartData', () => {
      const expectedUrl = mockUrls[ENDPOINTS.CHART_DATA];
      const expectedContentType = 'application/x-www-form-urlencoded';

      describe('expected data', () => {
        beforeEach(() => {
          jasmine.Ajax.stubRequest(expectedUrl)
            .andReturn(exampleResponses.data.longitudinal);
        });

        it('constructs the expected request', (done) => {
          service.getChartData('screen_date', { a: 'b' }).then(chartData => {
            const request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toEqual(expectedUrl);

            // request parameters are URL encoded
            expect(request.requestHeaders['Content-Type']).toEqual(expectedContentType);
            expect(request.params).toEqual('a=b');

            done();
          });
        });

        it('extracts data from the response', (done) => {
          service.getChartData('screen_date', { a: 'b' }).then(chartData => {
            // it extracts data from the response
            expect(chartData.filterEvents).toBeDefined();
            expect(chartData.data).toBeDefined();

            done();
          });
        });

        it('has no warnings', (done) => {
          service.getChartData('screen_date', { a: 'b' }).then(chartData => {
            expect(chartData.warnings).toBeDefined();
            expect(chartData.warnings.length).toEqual(0);

            done();
          });
        });
      });

      describe('empty data', () => {
        beforeEach(() => {
          jasmine.Ajax.stubRequest(expectedUrl)
            .andReturn(exampleResponses.data.noData);
        });

        it('warns about the empty response', (done) => {
          service.getChartData('screen_date', { a: 'b' }).then(chartData => {
            expect(chartData.warnings).toBeDefined();
            expect(chartData.warnings.length).toEqual(1);
            expect(chartData.warnings[0].message).toMatch('0 records');

            done();
          });
        });
      });

      describe('longitudinal data for multiple events', () => {
        beforeEach(() => {
          jasmine.Ajax.stubRequest(expectedUrl)
            .andReturn(exampleResponses.data.longitudinalMultipleEvents);
        });

        it('warns about multiple events', (done) => {
          service.getChartData('screen_date', { a: 'b' }).then(chartData => {
            expect(chartData.warnings).toBeDefined();
            expect(chartData.warnings.length).toEqual(1);
            expect(chartData.warnings[0].message).toMatch('multiple events');

            done();
          });
        });
      });

      describe('repeating instrument data', () => {
        beforeEach(() => {
          jasmine.Ajax.stubRequest(expectedUrl)
            .andReturn(exampleResponses.data.longitudinalRepeating);
        });

        it('warns about repeating instruments', (done) => {
          service.getChartData('screen_date', { a: 'b' }).then(chartData => {
            expect(chartData.warnings).toBeDefined();
            expect(chartData.warnings.length).toEqual(1);
            expect(chartData.warnings[0].message).toMatch('repeating');

            done();
          });
        });
      });

      describe('blank date fields', () => {
        beforeEach(() => {
          jasmine.Ajax.stubRequest(expectedUrl)
            .andReturn(exampleResponses.data.longitudinalBlankDates);
        });

        it('filters out records with blank dates', (done) => {
          service.getChartData('screen_date', { a: 'b' }).then(chartData => {
            expect(chartData.data.length).toEqual(1);
            expect(chartData.data[0].screen_date).toBeTruthy();

            done();
          });
        });

        it('warns about records with missing dates', (done) => {
          service.getChartData('screen_date', { a: 'b' }).then(chartData => {
            expect(chartData.warnings).toBeDefined();
            expect(chartData.warnings.length).toEqual(1);
            expect(chartData.warnings[0].message).toMatch('blank date field');

            done();
          });
        });
      });
    });
  });
});
