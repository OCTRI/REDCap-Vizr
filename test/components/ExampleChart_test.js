import { shallowMount } from '@vue/test-utils';
import ExampleChart from '@/components/ExampleChart';

describe('ExampleChart.vue', () => {
  it('renders a figure with an image and caption', () => {
    const wrapper = shallowMount(ExampleChart);
    expect(wrapper.find('figure.vizr-example').exists()).toBe(true);
    expect(wrapper.find('figure img').exists()).toBe(true);
    expect(wrapper.find('figure figcaption').exists()).toBe(true);
  });
});
