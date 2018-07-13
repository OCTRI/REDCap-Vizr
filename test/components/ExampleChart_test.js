import { shallowMount } from '@vue/test-utils';

import ExampleChart from '@/components/ExampleChart';
import chartImage from '../../lib/vizr_example.png';

describe('ExampleChart.vue', () => {
  it('renders a figure with an image and caption', () => {
    const mockUrl = `https://example.com${chartImage}`;
    const wrapper = shallowMount(ExampleChart, {
      provide: {
        assetUrls: {
          [chartImage]: mockUrl
        }
      }
    });

    expect(wrapper.find('figure.vizr-example').exists()).toBe(true);
    expect(wrapper.find('figure figcaption').exists()).toBe(true);

    // it gets the image URL via injection
    expect(wrapper.find('figure img').exists()).toBe(true);
    expect(wrapper.find('img').attributes().src).toEqual(mockUrl);
  });
});
