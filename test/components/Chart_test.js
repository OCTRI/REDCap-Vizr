import { shallowMount } from '@vue/test-utils';

import Chart from '@/components/Chart';
import ChartSummary from '@/components/ChartSummary';

import { exampleChartDef, exampleLongitudinalChartDef } from '../example-chart-def';
import { exampleMetadata, exampleLongitudinalMetadata } from '../example-metadata';
import { exampleResponses } from '../example-ajax-responses';

const exampleChart = exampleChartDef();
const exampleLongitudinalChart = exampleLongitudinalChartDef();

describe('Chart.vue', () => {
  describe('when chart is non-longitudinal', () => {
    describe('and data is received', () => {
      const response = JSON.parse(exampleResponses.data.nonlongitudinal.responseText);
      let wrapper;

      beforeEach((done) => {
        wrapper = shallowMount(Chart, {
          propsData: {
            canEdit: true,
            chartDef: exampleChart,
            metadata: exampleMetadata
          },
          provide: {
            dataService: {
              getChartData() {
                return Promise.resolve(response);
              }
            }
          }
        });

        wrapper.vm.dataPromise.then(() => done());
      });

      it('creates the chart container', () => {
        const chartContainer = wrapper.find('.vizr-chart-container');
        expect(chartContainer.exists()).toBe(true);
        expect(chartContainer.attributes().id).toEqual(`chart-${exampleChart.id}`);
      });

      it('shows a title and description', () => {
        const titleSelector = '[data-description=title]';
        const descriptionSelector = '[data-description=description]';
        expect(wrapper.find(titleSelector).text()).toMatch(exampleChart.title);
        expect(wrapper.find(descriptionSelector).text()).toMatch(exampleChart.description);
      });

      it('shows no errors', () => {
        expect(wrapper.find('.error').isEmpty()).toBe(true);
      });

      it('does not show live event filter', () => {
        expect(wrapper.find('.vizr-event-select').isEmpty()).toBe(true);
      });

      it('shows a chart summary', () => {
        expect(wrapper.contains(ChartSummary)).toBe(true);
      });

      it('shows a chart', () => {
        expect(wrapper.contains('.vizr-chart canvas')).toBe(true);
        expect(wrapper.findAll('[data-description=toggle-legend]').length).toEqual(1);
      });

      describe('derived data', () => {
        it('captures chart data', () => {
          expect(wrapper.vm.chartData).toEqual(response.data);
          expect(wrapper.vm.filterEvents).toEqual(response.filterEvents);
        });

        it('summarizes data', () => {
          expect(wrapper.vm.grouped).toBeTruthy();
          expect(wrapper.vm.summary).toBeTruthy();
        });

        it('calculates totals', () => {
          expect(wrapper.vm.totalCount).toBeTruthy();
          expect(wrapper.vm.totalTarget).toBeTruthy();
        });

        it('builds a Chart.js chart object', () => {
          expect(wrapper.vm.chart).toBeDefined();
        });
      });
    });

    describe('when the response contains warnings', () => {
      const response = JSON.parse(exampleResponses.data.noData.responseText);
      response.warnings = [{ key: 'noData', message: 'The filter returned 0 records.' }]
      let wrapper;

      beforeEach((done) => {
        wrapper = shallowMount(Chart, {
          propsData: {
            canEdit: true,
            chartDef: exampleChart,
            metadata: exampleMetadata
          },
          provide: {
            dataService: {
              getChartData() {
                return Promise.resolve(response);
              }
            }
          }
        });

        wrapper.vm.dataPromise.then(() => done());
      });

      it('displays the warnings', () => {
        const errorElement = wrapper.find('.error');
        expect(errorElement.isEmpty()).toBe(false);
        expect(errorElement.text()).toMatch(response.warnings[0].message);
      });
    });
  });

  describe('when chart is longitudinal', () => {
    describe('when expected data is received', () => {
      const response = JSON.parse(exampleResponses.data.longitudinal.responseText);
      let wrapper;

      beforeEach((done) => {
        wrapper = shallowMount(Chart, {
          propsData: {
            canEdit: true,
            chartDef: exampleLongitudinalChart,
            metadata: exampleLongitudinalMetadata
          },
          provide: {
            dataService: {
              getChartData() {
                return Promise.resolve(response);
              }
            }
          }
        });

        wrapper.vm.dataPromise.then(() => done());
      });

      it('shows a title', () => {
        const titleSelector = '[data-description=title]';
        expect(wrapper.find(titleSelector).text()).toMatch(exampleLongitudinalChart.title);
      });

      it('shows no errors', () => {
        expect(wrapper.find('.error').isEmpty()).toBe(true);
      });

      it('does not show live event filter', () => {
        expect(wrapper.find('.vizr-event-select').isEmpty()).toBe(true);
      });

      it('shows a chart summary', () => {
        expect(wrapper.contains(ChartSummary)).toBe(true);
      });

      it('shows a chart', () => {
        expect(wrapper.contains('.vizr-chart canvas')).toBe(true);
        expect(wrapper.findAll('[data-description=toggle-legend]').length).toEqual(1);
      });

      describe('derived data', () => {
        it('captures chart data', () => {
          expect(wrapper.vm.chartData).toEqual(response.data);
          expect(wrapper.vm.filterEvents).toEqual(response.filterEvents);
        });

        it('summarizes data', () => {
          expect(wrapper.vm.grouped).toBeTruthy();
          expect(wrapper.vm.summary).toBeTruthy();
        });

        it('calculates totals', () => {
          expect(wrapper.vm.totalCount).toBeTruthy();
          expect(wrapper.vm.totalTarget).toBeTruthy();
        });

        it('builds a Chart.js chart object', () => {
          expect(wrapper.vm.chart).toBeDefined();
        });
      });
    });

    describe('when the response contains warnings', () => {
      const response = JSON.parse(exampleResponses.data.longitudinalRepeating.responseText);
      response.warnings = [{ key: 'repeatingInstruments', message: 'Charts may not work as expected with repeating instruments.' }];
      let wrapper;

      beforeEach((done) => {
        wrapper = shallowMount(Chart, {
          propsData: {
            canEdit: true,
            chartDef: exampleChart,
            metadata: exampleMetadata
          },
          provide: {
            dataService: {
              getChartData() {
                return Promise.resolve(response);
              }
            }
          }
        });

        wrapper.vm.dataPromise.then(() => done());
      });

      it('displays the warnings', () => {
        const errorElement = wrapper.find('.error');
        expect(errorElement.isEmpty()).toBe(false);
        expect(errorElement.text()).toMatch(response.warnings[0].message);
      });
    });

    // TODO #28 live event filter
    // describe('when data for multiple events is received', () => {
    //   beforeEach(() => {
    //     dataRequest = jasmine.Ajax.requests.mostRecent();
    //     dataRequest.respondWith(exampleResponses.data.longitudinalMultipleEvents);
    //   });
    //
    //   it('shows errors', () => {
    //     expect($('.error')).not.toBeEmpty();
    //   });
    //
    //   it('shows live event filter', () => {
    //     expect($('.vizr-event-select')).not.toBeEmpty();
    //   });
    //
    //   it('changes the data when event is selected', () => {
    //     const oldChartDataContainer = $('.vizr-chart-data-container');
    //     // Select an event - data should change
    //     $('select[name=filter_event]').val('visit_1').change();
    //     expect($('.vizr-chart-data-container').html()).not.toEqual(oldChartDataContainer.html());
    //     // Select all events again - data should revert
    //     $('select[name=filter_event]').val('').change();
    //     expect($('.vizr-chart-data-container').html()).toEqual(oldChartDataContainer.html());
    //   });
    // });
  });

  describe('chart reload link', () => {
    const response = JSON.parse(exampleResponses.data.longitudinal.responseText);
    let wrapper, dataService;

    beforeEach((done) => {
      dataService = {
        getChartData() {
          return Promise.resolve(response);
        }
      };

      wrapper = shallowMount(Chart, {
        propsData: {
          canEdit: true,
          chartDef: exampleLongitudinalChart,
          metadata: exampleLongitudinalMetadata
        },
        provide: {
          dataService
        }
      });

      wrapper.vm.dataPromise.then(() => done());
    });

    it('refreshes chart data', (done) => {
      spyOn(dataService, 'getChartData').and.callThrough();
      wrapper.find('[data-description=reload]').trigger('click');
      wrapper.vm.dataPromise.then(() => {
        expect(dataService.getChartData).toHaveBeenCalled();
        done();
      });
    });
  });
});
