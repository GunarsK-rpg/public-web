import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import PrerequisiteList from './PrerequisiteList.vue';
import type { TalentPrerequisite } from 'src/types/talents';

describe('PrerequisiteList', () => {
  const createWrapper = (prerequisites: TalentPrerequisite[]) =>
    shallowMount(PrerequisiteList, {
      props: { prerequisites },
      global: {
        stubs: {
          QSeparator: { template: '<hr class="q-separator" />' },
        },
      },
    });

  it('renders nothing when prerequisites array is empty', () => {
    const wrapper = createWrapper([]);
    expect(wrapper.find('.prerequisite-list').exists()).toBe(false);
  });

  it('renders talent prerequisite with name', () => {
    const wrapper = createWrapper([
      { type: 'talent', codes: [{ id: 1, code: 'swift', name: 'Swift Strike' }] },
    ]);
    expect(wrapper.text()).toContain('Swift Strike');
  });

  it('renders skill prerequisite with rank', () => {
    const wrapper = createWrapper([
      { type: 'skill', codes: [{ id: 1, code: 'athletics', name: 'Athletics' }], value: 3 },
    ]);
    expect(wrapper.text()).toContain('Athletics 3+');
  });

  it('renders level prerequisite', () => {
    const wrapper = createWrapper([{ type: 'level', value: 5 }]);
    expect(wrapper.text()).toContain('Level 5+');
  });

  it('renders narrative prerequisite', () => {
    const wrapper = createWrapper([{ type: 'narrative', description: 'Must have a patron' }]);
    expect(wrapper.text()).toContain('Must have a patron');
  });

  it('renders multiple prerequisites', () => {
    const wrapper = createWrapper([
      { type: 'talent', codes: [{ id: 1, code: 'swift', name: 'Swift Strike' }] },
      { type: 'level', value: 3 },
    ]);
    expect(wrapper.text()).toContain('Swift Strike');
    expect(wrapper.text()).toContain('Level 3+');
  });
});
