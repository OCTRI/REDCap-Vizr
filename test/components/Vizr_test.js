import uuid from 'uuid/v4';
import { shallowMount } from '@vue/test-utils';

import { exampleMetadata } from '../example-metadata';
import { exampleChartDef } from '../example-chart-def';

import Vizr from '@/components/Vizr';
import Instructions from '@/components/Instructions';
import ExampleChart from '@/components/ExampleChart';
import Chart from '@/components/Chart';
import VizrVersion from '@/components/VizrVersion';

const exampleChartConfig = {
  charts: [
    exampleChartDef(uuid()),
    exampleChartDef(uuid())
  ]
};

function createProvideObject() {
  return {
    assetUrls: {},
    dataService: {
      getProjectConfig() {
        return Promise.resolve([ exampleMetadata, exampleChartConfig ]);
      }
    }
  };
}

describe('Vizr.vue', () => {
  let mockProvide, wrapper;

  beforeEach((done) => {
    mockProvide = createProvideObject();
    spyOn(mockProvide.dataService, 'getProjectConfig').and.callThrough();

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

  it('shows the example chart if no charts are defined yet', () => {
    expect(wrapper.find(ExampleChart).isVisible()).toBe(false);

    wrapper.setData({ config: { charts: [] } });
    expect(wrapper.find(ExampleChart).isVisible()).toBe(true);
  });

  describe('when the user can edit', () => {
    it('shows the button to create a chart', () => {
      wrapper.setProps({ canEdit: true });
      expect(wrapper.find('button').exists()).toBe(true);
    });
  });

  describe('when user cannot edit', () => {
    it('the button to create a chart is not shown', () => {
      wrapper.setProps({ canEdit: false });
      expect(wrapper.find('button').exists()).toBe(false);
    });
  });

  describe('when fetching config fails', () => {
    it('shows an error message', (done) => {
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
        done();
      });
    });
  });
});
