import { shallowMount } from '@vue/test-utils';
import Instructions from '@/components/Instructions';

describe('Instructions.vue', () => {
  it('renders initial use instructions when there are no charts', () => {
    const wrapper = shallowMount(Instructions, {
      propsData: {
        canEdit: false,
        hasCharts: false
      }
    });

    // instructions are present
    const instructionList = wrapper.find('ul#vizr-instructions');
    expect(instructionList.exists()).toBe(true);

    // no chart instructions are present
    const noChartsItems = instructionList.findAll('li[data-no-charts]');
    expect(noChartsItems.wrappers.length).toEqual(2);

    // detailed instructions are present
    const details = wrapper.find('div.collapse');
    expect(details.exists()).toBe(true);
  });

  it('renders instructions when there are charts and the user can edit', () => {
    const wrapper = shallowMount(Instructions, {
      propsData: {
        canEdit: true,
        hasCharts: true
      }
    });

    const instructionList = wrapper.find('ul#vizr-instructions');
    expect(instructionList.exists()).toBe(true);

    // no chart instructions are not present
    const noChartsItems = instructionList.findAll('li[data-no-charts]');
    expect(noChartsItems.wrappers.length).toEqual(0);

    // detailed instructions are present
    const details = wrapper.find('div.collapse');
    expect(details.exists()).toBe(true);
  });

  it('renders an empty div when there are charts but the user cannot edit', () => {
    const wrapper = shallowMount(Instructions, {
      propsData: {
        canEdit: false,
        hasCharts: true
      }
    });

    // instructions are not rendered
    expect(wrapper.find('ul#vizr-instructions').exists()).toBe(false);
  });
});
