import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import ModificationLabel from './ModificationLabel.vue';
import type { AppliedModification } from 'src/types';

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    modifications: [],
  }),
}));

const QBadgeStub = defineComponent({
  name: 'QBadge',
  setup(_, { slots }) {
    return () => h('span', { class: 'q-badge' }, slots.default?.());
  },
});

function createWrapper(mod: AppliedModification) {
  return shallowMount(ModificationLabel, {
    props: { mod },
    global: {
      stubs: { QBadge: QBadgeStub },
    },
  });
}

describe('ModificationLabel', () => {
  describe('tier badge', () => {
    it('renders basic tier badge for basic modifications', () => {
      const wrapper = createWrapper({
        id: 1,
        modType: 'upgrade',
        modification: { id: 10, code: 'sturdy', name: 'Sturdy' },
        special: [],
        customText: null,
        tier: 'basic',
      });

      expect(wrapper.text()).toContain('Basic');
    });

    it('renders advanced tier badge for advanced modifications', () => {
      const wrapper = createWrapper({
        id: 1,
        modType: 'upgrade',
        modification: { id: 20, code: 'lethal_design', name: 'Lethal Design' },
        special: [],
        customText: null,
        tier: 'advanced',
      });

      expect(wrapper.text()).toContain('Advanced');
    });

    it('does not render tier badge for custom text modifications', () => {
      const wrapper = createWrapper({
        id: 1,
        modType: 'drawback',
        modification: null,
        special: [],
        customText: 'GM cursed this item',
        tier: null,
      });

      expect(wrapper.text()).not.toContain('Basic');
      expect(wrapper.text()).not.toContain('Advanced');
    });
  });
});
