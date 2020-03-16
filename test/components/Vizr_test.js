import { v4 as uuid } from 'uuid';
import { shallowMount } from '@vue/test-utils';
import Vue from 'vue';

import { exampleMetadata } from '../example-metadata';
import { exampleChartDef } from '../example-chart-def';

import Vizr from '@/components/Vizr';
import Instructions from '@/components/Instructions';
import ExampleChart from '@/components/ExampleChart';
import Chart from '@/components/Chart';
import VizrVersion from '@/components/VizrVersion';

function createChartConfig() {
  return {
    charts: [exampleChartDef(uuid()), exampleChartDef(uuid())]
  };
}

function createProvideObject(chartConfig) {
  return {
    assetUrls: {},
    dataService: {
      getProjectConfig() {
        return Promise.resolve([exampleMetadata, chartConfig]);
      },
      saveChartConfig() {
        return Promise.resolve({ item_count: 1 });
      }
    }
  };
}

describe('Vizr.vue', () => {
  let mockProvide, exampleChartConfig, wrapper;

  beforeEach(done => {
    exampleChartConfig = createChartConfig();
    mockProvide = createProvideObject(exampleChartConfig);
    spyOn(mockProvide.dataService, 'getProjectConfig').and.callThrough();
    spyOn(mockProvide.dataService, 'saveChartConfig').and.callThrough();

    wrapper = shallowMount(Vizr, {
      propsData: {
        canEdit: true
      },
      provide: mockProvide
    });

    wrapper.vm.configPromise.then(() => done());
  });

  it('requests metadata and chart config when mounted', () => {
    const { dataService } = mockProvide;
    expect(dataService.getProjectConfig).toHaveBeenCalled();
  });

  it('renders elements visible to all users', () => {
    const heading = wrapper.find('h1');
    expect(heading.text()).toBe('Vizr Charts');

    expect(wrapper.find(Instructions).exists()).toBe(true);
    expect(wrapper.find(ExampleChart).exists()).toBe(true);
    expect(wrapper.find(VizrVersion).exists()).toBe(true);

    // renders a chart component for each chart
    expect(wrapper.findAll(Chart).length).toEqual(exampleChartConfig.charts.length);
  });

  it('shows the example chart if no charts are defined yet', async () => {
    expect(wrapper.find(ExampleChart).isVisible()).toBe(false);

    wrapper.setData({ config: { charts: [] } });
    await Vue.nextTick();
    expect(wrapper.find(ExampleChart).isVisible()).toBe(true);
  });

  describe('when the user can edit', () => {
    it('shows the button to create a chart', () => {
      wrapper.setProps({ canEdit: true });
      expect(wrapper.find('button').exists()).toBe(true);
    });
  });

  describe('when user cannot edit', () => {
    it('the button to create a chart is not shown', async () => {
      wrapper.setProps({ canEdit: false });
      await Vue.nextTick();
      expect(wrapper.find('button').exists()).toBe(false);
    });
  });

  describe('when fetching config fails', () => {
    it('shows an error message', done => {
      const provideObject = createProvideObject();
      provideObject.dataService.getProjectConfig = () => {
        return Promise.reject(new Error('Timeout'));
      };

      const errorWrapper = shallowMount(Vizr, {
        propsData: {
          canEdit: true
        },
        provide: provideObject
      });

      errorWrapper.vm.configPromise.then(() => {
        expect(errorWrapper.find('.error').exists()).toBe(true);
        expect(errorWrapper.find('button').attributes().disabled).toBeTruthy();
        done();
      });
    });
  });

  describe('saving a chart', () => {
    beforeEach(() => {
      mockProvide.dataService.saveChartConfig.calls.reset();
    });

    describe('when the chart is new', () => {
      it('persists the new configuration', done => {
        const newChart = exampleChartDef(uuid());
        const expectedCharts = [...exampleChartConfig.charts, newChart];

        wrapper.vm.saveChart(newChart);

        // schedule on the task queue to allow promises to resolve
        setTimeout(() => {
          // new chart is added to the array
          expect(mockProvide.dataService.saveChartConfig).toHaveBeenCalledWith(
            expectedCharts
          );
          expect(wrapper.vm.charts).toEqual(expectedCharts);
          done();
        });
      });
    });

    describe('when the chart is updated', () => {
      it('persists the new configuration', done => {
        // second chart config will be replaced
        const updatedChart = Object.assign({}, exampleChartConfig.charts[1]);
        updatedChart.title = 'Different Title';
        const expectedCharts = [exampleChartConfig.charts[0], updatedChart];

        wrapper.vm.saveChart(updatedChart);

        // schedule on the task queue to allow promises to resolve
        setTimeout(() => {
          // updated chart is replaced
          expect(mockProvide.dataService.saveChartConfig).toHaveBeenCalledWith(
            expectedCharts
          );
          expect(wrapper.vm.charts).toEqual(expectedCharts);
          done();
        });
      });
    });

    describe('when saving fails', () => {
      let errorWrapper;

      beforeEach(done => {
        const provideObject = createProvideObject(exampleChartConfig);
        provideObject.dataService.saveChartConfig = () => {
          const error = new Error('Expected to change 1 record, but 0 records changed.');
          error.redcapErrors = ['Some error'];
          return Promise.reject(error);
        };

        errorWrapper = shallowMount(Vizr, {
          propsData: {
            canEdit: true
          },
          provide: provideObject
        });

        errorWrapper.vm.configPromise.then(() => done());
      });

      it('displays errors', done => {
        const chartDef = exampleChartConfig.charts[0];
        errorWrapper.vm.saveChart(chartDef);

        // schedule on the task queue to allow promises to resolve
        setTimeout(() => {
          const errorBlock = errorWrapper.find('.error');
          // error message is displayed
          expect(errorBlock.exists()).toBe(true);
          // error details are displayed
          expect(errorWrapper.find('ul').exists()).toBe(true);
          done();
        });
      });
    });
  });

  describe('deleting a chart', () => {
    it('persists the new configuration', done => {
      mockProvide.dataService.saveChartConfig.calls.reset();

      const toDelete = exampleChartConfig.charts[1];
      const expectedCharts = exampleChartConfig.charts.slice(0, 1);

      wrapper.vm.deleteChart(toDelete);

      // schedule on the task queue to allow promises to resolve
      setTimeout(() => {
        // chart is removed
        expect(mockProvide.dataService.saveChartConfig).toHaveBeenCalledWith(
          expectedCharts
        );
        expect(wrapper.vm.charts).toEqual(expectedCharts);
        done();
      });
    });
  });

  describe('new charts array creation', () => {
    describe('adding new charts', () => {
      it('adds correctly when the array is empty', () => {
        const oldCharts = [];
        const newChart = { id: 'new' };
        const output = wrapper.vm._makeNewChartsArray(oldCharts, newChart);

        // input array is not mutated
        expect(output).not.toEqual(oldCharts);
        expect(oldCharts).toEqual([]);

        expect(output).toEqual([newChart]);
      });

      it('adds correctly when the array contains charts', () => {
        const oldCharts = [{ id: 'old' }];
        const newChart = { id: 'new' };
        const output = wrapper.vm._makeNewChartsArray(oldCharts, newChart);

        // input array is not mutated
        expect(output).not.toEqual(oldCharts);
        expect(oldCharts).toEqual([{ id: 'old' }]);

        expect(output.length).toEqual(2);
        expect(output[0]).toEqual(oldCharts[0]);
        expect(output[1]).toEqual(newChart);
      });
    });

    describe('replacing a chart', () => {
      it('replaces correctly when the chart is first in the array', () => {
        const oldCharts = [{ id: 'test', status: 'old' }];
        const newChart = { id: 'test', status: 'new' };
        const output = wrapper.vm._makeNewChartsArray(oldCharts, newChart);

        // input array is not mutated
        expect(output).not.toEqual(oldCharts);
        expect(oldCharts).toEqual([{ id: 'test', status: 'old' }]);

        expect(output.length).toEqual(1);
        expect(output[0].status).toEqual('new');
      });

      it('replaces correctly when the chart is in the middle of the array', () => {
        const oldCharts = [{ id: 'start' }, { id: 'test', status: 'old' }, { id: 'end' }];
        const newChart = { id: 'test', status: 'new' };
        const output = wrapper.vm._makeNewChartsArray(oldCharts, newChart);

        // input array is not mutated
        expect(output).not.toEqual(oldCharts);
        expect(oldCharts[1].status).toEqual('old');

        expect(output[1].status).toEqual('new');
      });

      it('replaces correctly when the chart is at the end of the array', () => {
        const oldCharts = [{ id: 'start' }, { id: 'test', status: 'old' }];
        const newChart = { id: 'test', status: 'new' };
        const output = wrapper.vm._makeNewChartsArray(oldCharts, newChart);

        // input array is not mutated
        expect(output).not.toEqual(oldCharts);
        expect(oldCharts[1].status).toEqual('old');

        expect(output[1].status).toEqual('new');
      });
    });

    describe('deleting a chart', () => {
      it('deletes correctly when the chart is first in the array', () => {
        const oldCharts = [{ id: 'test' }, { id: 'after' }];
        const toDelete = oldCharts[0];
        const output = wrapper.vm._makeNewChartsArray(oldCharts, toDelete, true);

        // input array is not mutated
        expect(output).not.toEqual(oldCharts);
        expect(oldCharts.length).toEqual(2);
        expect(oldCharts[0]).toEqual(toDelete);

        expect(output).toEqual([{ id: 'after' }]);
      });

      it('deletes correctly when the chart is in the middle of the array', () => {
        const oldCharts = [{ id: 'before' }, { id: 'test' }, { id: 'after' }];
        const toDelete = oldCharts[1];
        const output = wrapper.vm._makeNewChartsArray(oldCharts, toDelete, true);

        // input array is not mutated
        expect(output).not.toEqual(oldCharts);
        expect(oldCharts.length).toEqual(3);
        expect(oldCharts[1]).toEqual(toDelete);

        expect(output).toEqual([{ id: 'before' }, { id: 'after' }]);
      });

      it('deletes correctly when the chart is at the end of the array', () => {
        const oldCharts = [{ id: 'before' }, { id: 'test' }];
        const toDelete = oldCharts[1];
        const output = wrapper.vm._makeNewChartsArray(oldCharts, toDelete, true);

        // input array is not mutated
        expect(output).not.toEqual(oldCharts);
        expect(oldCharts.length).toEqual(2);
        expect(oldCharts[1]).toEqual(toDelete);

        expect(output).toEqual([{ id: 'before' }]);
      });

      it('deletes correctly when the chart is the last chart', () => {
        const oldCharts = [{ id: 'test' }];
        const toDelete = oldCharts[0];
        const output = wrapper.vm._makeNewChartsArray(oldCharts, toDelete, true);

        // input array is not mutated
        expect(output).not.toEqual(oldCharts);
        expect(oldCharts.length).toEqual(1);
        expect(oldCharts[0]).toEqual(toDelete);

        expect(output).toEqual([]);
      });
    });
  });
});
