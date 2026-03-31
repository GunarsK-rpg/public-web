import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import PrivacyPolicyPage from './PrivacyPolicyPage.vue';

describe('PrivacyPolicyPage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QCard: { template: '<div class="q-card"><slot /></div>' },
    QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
    QSeparator: { template: '<hr />' },
    QBtn: { template: '<button class="q-btn">{{ label }}</button>', props: ['label', 'to'] },
  };

  const createWrapper = () => shallowMount(PrivacyPolicyPage, { global: { stubs } });

  it('renders page title', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Privacy Policy');
  });

  it('renders all section headings', () => {
    const wrapper = createWrapper();
    const text = wrapper.text();

    expect(text).toContain('What We Collect');
    expect(text).toContain('What We Log');
    expect(text).toContain('How We Use Your Data');
    expect(text).toContain('Third-Party Services');
    expect(text).toContain('Cookies');
    expect(text).toContain('Data Storage and Security');
    expect(text).toContain('Your Rights');
    expect(text).toContain('Data Retention');
    expect(text).toContain('Contact');
  });

  it('renders fan content disclaimer', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Fan Content Disclaimer');
  });

  it('renders GDPR rights', () => {
    const wrapper = createWrapper();
    const text = wrapper.text();

    expect(text).toContain('Access');
    expect(text).toContain('Correct');
    expect(text).toContain('Delete');
    expect(text).toContain('Export');
  });

  it('renders contact email', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('privacy@gunarsk.com');
  });
});
