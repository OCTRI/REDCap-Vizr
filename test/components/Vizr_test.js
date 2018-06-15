/* eslint-env jasmine */
import { shallowMount } from '@vue/test-utils';
import Vizr from '../../js/components/Vizr';

describe('Vizr.vue', () => {
  it('renders', () => {
    const heading = shallowMount(Vizr).find('h1');
    expect(heading.text()).toBe('Vizr Charts');
  });
});
