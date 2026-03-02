import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import SpecialBadges from './SpecialBadges.vue';
import type { SpecialEntry } from 'src/types';

vi.mock('src/constants/theme', () => ({
  RPG_COLORS: {
    talentAvailable: 'positive',
    cognitive: 'info',
    badgeMuted: 'grey',
  },
}));

describe('SpecialBadges', () => {
  const createWrapper = (specials: SpecialEntry[]) =>
    shallowMount(SpecialBadges, {
      props: { specials },
      global: {
        stubs: {
          QBadge: {
            template:
              '<span class="q-badge" :class="`color-${color}`" :title="$attrs.title"><slot /></span>',
            props: ['color', 'outline'],
          },
        },
      },
    });

  it('renders nothing when specials array is empty', () => {
    const wrapper = createWrapper([]);
    expect(wrapper.findAll('.q-badge').length).toBe(0);
  });

  it('renders badge for numeric attribute bonus', () => {
    const wrapper = createWrapper([
      { type: 'attribute_str', value: 1, display_value: '+1 Strength' },
    ]);
    expect(wrapper.text()).toContain('+1 Strength');
  });

  it('renders badge for defense bonus', () => {
    const wrapper = createWrapper([
      { type: 'defense_cognitive', value: 2, display_value: '+2 Cognitive Defense' },
    ]);
    expect(wrapper.text()).toContain('+2 Cognitive Defense');
  });

  it('renders badge for derived stat bonus', () => {
    const wrapper = createWrapper([
      { type: 'health_per_level', value: 1, display_value: '+1 Health/Level' },
    ]);
    expect(wrapper.text()).toContain('+1 Health/Level');
  });

  it('renders multiple badges', () => {
    const wrapper = createWrapper([
      { type: 'attribute_str', value: 1, display_value: '+1 Strength' },
      { type: 'deflect', value: 1, display_value: '+1 Deflect' },
    ]);
    expect(wrapper.findAll('.q-badge').length).toBe(2);
  });

  it('skips entries without display_value and without value', () => {
    const wrapper = createWrapper([{ type: 'narrative' }]);
    expect(wrapper.findAll('.q-badge').length).toBe(0);
  });

  it('uses value as fallback when display_value is missing', () => {
    const wrapper = createWrapper([{ type: 'attribute_str', value: 2 }]);
    expect(wrapper.text()).toContain('2');
  });

  it('uses attribute color for attribute types', () => {
    const wrapper = createWrapper([{ type: 'attribute_str', value: 1, display_value: '+1 STR' }]);
    expect(wrapper.find('.color-positive').exists()).toBe(true);
  });

  it('uses defense color for defense types', () => {
    const wrapper = createWrapper([
      { type: 'defense_cognitive', value: 2, display_value: '+2 Cognitive' },
    ]);
    expect(wrapper.find('.color-info').exists()).toBe(true);
  });

  it('uses muted color for other types', () => {
    const wrapper = createWrapper([{ type: 'skill', display_value: 'Athletics' }]);
    expect(wrapper.find('.color-grey').exists()).toBe(true);
  });
});
