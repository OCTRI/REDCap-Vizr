import Vue from 'vue';
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

      beforeEach(async () => {
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

        await wrapper.vm.dataPromise;
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
        expect(wrapper.find(descriptionSelector).text()).toMatch(
          exampleChart.description
        );
      });

      it('shows no errors', () => {
        expect(wrapper.find('.warning').exists()).toBeFalse();
      });

      it('does not show live event filter', () => {
        expect(wrapper.find('.vizr-event-select select').exists()).toBeFalse();
      });

      it('shows a chart summary', () => {
        expect(wrapper.findComponent(ChartSummary).exists()).toBeTrue();
      });

      it('shows a chart', () => {
        expect(wrapper.find('.vizr-chart canvas').exists()).toBeTrue();
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
      response.warnings = [{ key: 'noData', message: 'The filter returned 0 records.' }];
      let wrapper;

      beforeEach(async () => {
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

        await wrapper.vm.dataPromise;
      });

      it('displays the warnings', () => {
        const errorElement = wrapper.find('.warning');
        expect(errorElement.exists()).toBeTrue();
        expect(errorElement.text()).toMatch(response.warnings[0].message);
      });
    });
  });

  describe('when chart is longitudinal', () => {
    describe('when expected data is received', () => {
      const response = JSON.parse(exampleResponses.data.longitudinal.responseText);
      let wrapper;

      beforeEach(async () => {
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

        await wrapper.vm.dataPromise;
      });

      it('shows a title', () => {
        const titleSelector = '[data-description=title]';
        expect(wrapper.find(titleSelector).text()).toMatch(
          exampleLongitudinalChart.title
        );
      });

      it('shows no errors', () => {
        expect(wrapper.find('.warning').exists()).toBeFalse();
      });

      it('does not show live event filter', () => {
        expect(wrapper.find('.vizr-event-select select').exists()).toBeFalse();
      });

      it('shows a chart summary', () => {
        expect(wrapper.findComponent(ChartSummary).exists()).toBeTrue();
      });

      it('shows a chart', () => {
        expect(wrapper.find('.vizr-chart canvas').exists()).toBeTrue();
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
      const response = JSON.parse(
        exampleResponses.data.longitudinalRepeating.responseText
      );
      response.warnings = [
        {
          key: 'repeatingInstruments',
          message: 'Charts may not work as expected with repeating instruments.'
        }
      ];
      let wrapper;

      beforeEach(async () => {
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

        await wrapper.vm.dataPromise;
      });

      it('displays the warnings', () => {
        const errorElement = wrapper.find('.warning');
        expect(errorElement.exists()).toBeTrue();
        expect(errorElement.text()).toMatch(response.warnings[0].message);
      });
    });

    describe('when data for multiple events is received', () => {
      const response = JSON.parse(
        exampleResponses.data.longitudinalMultipleEvents.responseText
      );
      let wrapper;

      beforeEach(async () => {
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

        await wrapper.vm.dataPromise;
      });

      it('shows live event filter', () => {
        expect(wrapper.find('.vizr-event-select select').exists()).toBeTrue();
      });

      it('filters the data when event is selected', async () => {
        const allEventData = wrapper.vm.chartData;
        const allEventGrouped = wrapper.vm.grouped;
        const allEventSummary = wrapper.vm.summary;

        // Initially shows data for all events
        expect(wrapper.vm.filteredData).toEqual(allEventData);

        // Select an event - data should change
        const visit1Option = wrapper.find('option[value=visit_1]');
        await wrapper.find('select').setValue(visit1Option.element.value);
        expect(wrapper.vm.filteredData).not.toEqual(allEventData);
        expect(wrapper.vm.grouped).not.toEqual(allEventGrouped);
        expect(wrapper.vm.summary).not.toEqual(allEventSummary);

        // Select all events again - data should revert
        const allEventsOption = wrapper.findAll('option').at(0);
        await wrapper.find('select').setValue(allEventsOption.element.value);
        expect(wrapper.vm.filteredData).toEqual(allEventData);
        expect(wrapper.vm.grouped).toEqual(allEventGrouped);
        expect(wrapper.vm.summary).toEqual(allEventSummary);
      });
    });
  });

  describe('chart reload link', () => {
    const response = JSON.parse(exampleResponses.data.longitudinal.responseText);
    let wrapper, dataService;

    beforeEach(async () => {
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

      await wrapper.vm.dataPromise;
    });

    it('refreshes chart data', async () => {
      spyOn(dataService, 'getChartData').and.callThrough();
      await wrapper.find('[data-description=reload]').trigger('click');
      await wrapper.vm.dataPromise;
      expect(dataService.getChartData).toHaveBeenCalled();
    });
  });

  describe('chartDef watcher', () => {
    const response = JSON.parse(exampleResponses.data.longitudinal.responseText);
    let wrapper, dataService;

    beforeEach(async () => {
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

      await wrapper.vm.dataPromise;
    });

    it('refreshes chart data when chartDef is replaced', async () => {
      const newChart = exampleLongitudinalChartDef('different');

      spyOn(dataService, 'getChartData').and.callThrough();
      await wrapper.setProps({ chartDef: newChart });

      await wrapper.vm.dataPromise;
      expect(dataService.getChartData).toHaveBeenCalled();
    });
  });

  describe('chart delete link', () => {
    const response = JSON.parse(exampleResponses.data.longitudinal.responseText);
    let deleteSelector = '[data-description=delete]';
    let wrapper;

    beforeEach(async () => {
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

      await wrapper.vm.dataPromise;;
    });

    it('is not shown if the user cannot edit', async () => {
      expect(wrapper.find(deleteSelector).exists()).toBe(true);

      await wrapper.setProps({ canEdit: false });
      expect(wrapper.find(deleteSelector).exists()).toBe(false);
    });

    it('does not emit an event if not confirmed', async () => {
      spyOn(window, 'confirm').and.returnValue(false);
      await wrapper.find(deleteSelector).trigger('click');
      expect(wrapper.emitted('delete-chart')).toBeFalsy();
    });

    it('emits an event with the chart definition when confirmed', async () => {
      spyOn(window, 'confirm').and.returnValue(true);
      await wrapper.find(deleteSelector).trigger('click');
      expect(wrapper.emitted('delete-chart')).toBeTruthy();
      expect(wrapper.emitted('delete-chart')[0]).toEqual([exampleLongitudinalChart]);
    });
  });

  describe('legend toggle link', () => {
    const response = JSON.parse(exampleResponses.data.longitudinal.responseText);
    const legendToggleSelector = '[data-description=toggle-legend]';
    let wrapper, chartDef;

    beforeEach(async () => {
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

      await wrapper.vm.dataPromise;
      spyOn(wrapper.vm.chart, 'update').and.returnValue(undefined);
    });

    it('toggles the legend flag in the chart config', async () => {
      const chart = wrapper.vm.chart;
      expect(chart.config.options.legend.display).toBe(true);

      await wrapper.find(legendToggleSelector).trigger('click');
      expect(chart.config.options.legend.display).toBe(false);
    });

    it('updates the chart', async () => {
      const chart = wrapper.vm.chart;
      await wrapper.find(legendToggleSelector).trigger('click');
      expect(chart.update).toHaveBeenCalled();
    });

    it('does not emit an event if the user cannot edit', async () => {
      await wrapper.setProps({ canEdit: false });
      await wrapper.find(legendToggleSelector).trigger('click');
      expect(wrapper.emitted('toggle-legend')).toBeFalsy();
    });

    it('emits an event with the chart definition when user can edit', async () => {
      await wrapper.find(legendToggleSelector).trigger('click');
      expect(wrapper.emitted('toggle-legend')).toBeTruthy();
      expect(wrapper.emitted('toggle-legend')[0]).toEqual([chartDef]);
    });
  });
});
