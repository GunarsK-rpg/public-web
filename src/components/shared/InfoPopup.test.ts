import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import InfoPopup from './InfoPopup.vue';

const QPopupProxyStub = {
  name: 'QPopupProxy',
  template: '<div class="q-popup-proxy-stub"><slot /></div>',
  props: ['breakpoint', 'offset'],
};

describe('InfoPopup', () => {
  const createWrapper = (slotContent = 'Test description') =>
    shallowMount(InfoPopup, {
      slots: { default: slotContent },
      global: {
        stubs: {
          QPopupProxy: QPopupProxyStub,
          QBanner: {
            template: '<div class="q-banner-stub"><slot /></div>',
            props: ['dense'],
          },
        },
      },
    });

  it('renders slot content inside banner', () => {
    const wrapper = createWrapper('Tooltip text');
    expect(wrapper.text()).toContain('Tooltip text');
  });

  it('passes breakpoint 0 and offset to popup proxy', () => {
    const wrapper = createWrapper();
    const proxy = wrapper.findComponent({ name: 'QPopupProxy' });
    expect(proxy.props('breakpoint')).toBe(0);
    expect(proxy.props('offset')).toEqual([0, 8]);
  });
});
