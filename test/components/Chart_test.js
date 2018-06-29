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

    describe('when data for multiple events is received', () => {
      const response = JSON.parse(exampleResponses.data.longitudinalMultipleEvents.responseText);
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

      it('shows live event filter', () => {
        expect(wrapper.find('.vizr-event-select').isEmpty()).toBe(false);
      });

      it('filters the data when event is selected', () => {
        const allEventData = wrapper.vm.chartData;
        const allEventGrouped = wrapper.vm.grouped;
        const allEventSummary = wrapper.vm.summary;

        // Initially shows data for all events
        expect(wrapper.vm.filteredData).toEqual(allEventData);

        // Select an event - data should change
        wrapper.find('option[value=visit_1]').setSelected();
        expect(wrapper.vm.filteredData).not.toEqual(allEventData);
        expect(wrapper.vm.grouped).not.toEqual(allEventGrouped);
        expect(wrapper.vm.summary).not.toEqual(allEventSummary);

        // Select all events again - data should revert
        wrapper.findAll('option').at(0).setSelected();
        expect(wrapper.vm.filteredData).toEqual(allEventData);
        expect(wrapper.vm.grouped).toEqual(allEventGrouped);
        expect(wrapper.vm.summary).toEqual(allEventSummary);
      });
    });
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

  describe('chart delete link', () => {
    const response = JSON.parse(exampleResponses.data.longitudinal.responseText);
    let deleteSelector = '[data-description=delete]';
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

    it('is not shown if the user cannot edit', () => {
      expect(wrapper.find(deleteSelector).exists()).toBe(true);

      wrapper.setProps({ canEdit: false });
      expect(wrapper.find(deleteSelector).exists()).toBe(false);
    });

    it('does not emit an event if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      wrapper.find(deleteSelector).trigger('click');
      expect(wrapper.emitted('delete-chart')).toBeFalsy();
    });

    it('emits an event with the chart ID when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      wrapper.find(deleteSelector).trigger('click');
      expect(wrapper.emitted('delete-chart')).toBeTruthy();
      expect(wrapper.emitted('delete-chart')[0]).toEqual([ exampleLongitudinalChart.id ]);
    });
  });

  describe('legend toggle link', () => {
    const response = JSON.parse(exampleResponses.data.longitudinal.responseText);
    const legendToggleSelector = '[data-description=toggle-legend]';
    let wrapper, chartDef;

    beforeEach((done) => {
      chartDef = exampleLongitudinalChartDef();
      wrapper = shallowMount(Chart, {
        propsData: {
          chartDef,
          canEdit: true,
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

      wrapper.vm.dataPromise.then(() => {
        spyOn(wrapper.vm.chart, 'update').and.returnValue(undefined);
        done()
      });
    });

    it('toggles the legend flag in the chart config', () => {
      const chart = wrapper.vm.chart;
      expect(chart.config.options.legend.display).toBe(true);

      wrapper.find(legendToggleSelector).trigger('click');
      expect(chart.config.options.legend.display).toBe(false);
    });

    it('updates the chart', () => {
      const chart = wrapper.vm.chart;
      wrapper.find(legendToggleSelector).trigger('click');
      expect(chart.update).toHaveBeenCalled();
    });

    it('does not emit an event if the user cannot edit', () => {
      wrapper.setProps({ canEdit: false });
      wrapper.find(legendToggleSelector).trigger('click');
      expect(wrapper.emitted('toggle-legend')).toBeFalsy();
    });

    it('emits an event with the chart ID when user can edit', () => {
      wrapper.find(legendToggleSelector).trigger('click');
      expect(wrapper.emitted('toggle-legend')).toBeTruthy();
      expect(wrapper.emitted('toggle-legend')[0]).toEqual([ chartDef.id ]);
    });
  });
});
