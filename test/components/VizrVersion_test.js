import { shallowMount } from '@vue/test-utils';
import VERSION_STRING from '@/version';
import VizrVersion from '@/components/VizrVersion';

describe('VizrVersion.vue', () => {
  it('renders a div with the version string', () => {
    const wrapper = shallowMount(VizrVersion);
    expect(wrapper.text()).toContain(VERSION_STRING);
  });
});
