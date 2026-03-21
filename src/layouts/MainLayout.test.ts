import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import MainLayout from './MainLayout.vue';

const mockRouteName = ref<string>('my-characters');
const mockIsAuthenticated = ref(true);
const mockUsername = ref('testuser');
const mockLogout = vi.fn();
const mockDarkToggle = vi.fn();
const mockDarkIsActive = ref(false);
const mockIsDesktop = ref(true);

vi.mock('vue-router', () => ({
  useRoute: () => ({
    name: mockRouteName.value,
    meta: { title: 'Test Page' },
  }),
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({
    dark: {
      toggle: mockDarkToggle,
      get isActive() {
        return mockDarkIsActive.value;
      },
    },
    screen: {
      gt: {
        get sm() {
          return mockIsDesktop.value;
        },
      },
      lt: {
        get md() {
          return !mockIsDesktop.value;
        },
      },
    },
    notify: vi.fn(),
  }),
}));

vi.mock('stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: mockIsAuthenticated.value,
    username: mockUsername.value,
    logout: mockLogout,
  }),
}));

describe('MainLayout', () => {
  const createWrapper = () =>
    shallowMount(MainLayout, {
      global: {
        stubs: {
          QLayout: {
            template: '<div class="q-layout"><slot /></div>',
          },
          QHeader: {
            template: '<header class="q-header"><slot /></header>',
          },
          QToolbar: {
            template: '<div class="q-toolbar"><slot /></div>',
          },
          QToolbarTitle: {
            template: '<div class="q-toolbar-title"><slot /></div>',
          },
          QBtn: {
            template: `<button class="q-btn" :aria-label="ariaLabel" :aria-expanded="ariaExpanded" :aria-controls="ariaControls" @click="$emit('click')"><slot /></button>`,
            props: ['flat', 'dense', 'round', 'ariaLabel', 'ariaExpanded', 'ariaControls'],
            emits: ['click'],
          },
          QMenu: {
            template: '<div class="q-menu"><slot /></div>',
          },
          QList: {
            template: '<div class="q-list"><slot /></div>',
          },
          QItem: {
            template: '<div class="q-item" @click="$emit(\'click\')"><slot /></div>',
            props: ['to', 'clickable'],
            emits: ['click'],
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
          },
          QItemLabel: {
            template: '<div class="q-item-label"><slot /></div>',
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          QFooter: {
            template: '<footer class="q-footer"><slot /></footer>',
          },
          QTabs: {
            template: '<div class="q-tabs"><slot /></div>',
            props: ['modelValue', 'dense', 'activeColor', 'indicatorColor'],
          },
          QTab: {
            template: '<div class="q-tab" @click="$emit(\'click\')"><slot /></div>',
            props: ['name', 'to'],
            emits: ['click'],
          },
          QDrawer: {
            template: '<aside class="q-drawer"><slot /></aside>',
            props: ['modelValue', 'side', 'breakpoint', 'mini', 'miniWidth', 'width'],
          },
          QTooltip: {
            template: '<span class="q-tooltip"><slot /></span>',
          },
          QPageContainer: {
            template: '<div class="q-page-container"><slot /></div>',
          },
          RouterView: {
            template: '<div class="router-view" />',
          },
          SunMoon: { template: '<span class="icon-sun-moon" />' },
          CircleUserRound: { template: '<span class="icon-circle-user" />' },
          LogOut: { template: '<span class="icon-logout" />' },
          User: { template: '<span class="icon-user" />' },
          Swords: { template: '<span class="icon-swords" />' },
          PanelLeftOpen: { template: '<span class="icon-panel-left-open" />' },
          PanelLeftClose: { template: '<span class="icon-panel-left-close" />' },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.value = true;
    mockUsername.value = 'testuser';
    mockRouteName.value = 'my-characters';
    mockIsDesktop.value = true;
  });

  // ========================================
  // Side Drawer (Desktop Navigation)
  // ========================================
  describe('side drawer', () => {
    it('renders side drawer when authenticated', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-drawer').exists()).toBe(true);
    });

    it('does not render side drawer when not authenticated', () => {
      mockIsAuthenticated.value = false;
      const wrapper = createWrapper();

      expect(wrapper.find('.q-drawer').exists()).toBe(false);
    });

    it('renders Characters nav item in drawer', () => {
      const wrapper = createWrapper();
      const drawer = wrapper.find('.q-drawer');

      expect(drawer.text()).toContain('Characters');
    });

    it('renders Campaigns nav item in drawer', () => {
      const wrapper = createWrapper();
      const drawer = wrapper.find('.q-drawer');

      expect(drawer.text()).toContain('Campaigns');
    });

    it('highlights Characters item when on character route', () => {
      mockRouteName.value = 'my-characters';
      const wrapper = createWrapper();
      const drawerItems = wrapper.find('.q-drawer').findAll('.q-item');
      const charactersItem = drawerItems.find((item) => item.text().includes('Characters'));

      expect(charactersItem!.classes()).toContain('nav-item--active');
    });

    it('highlights Campaigns item when on campaign route', () => {
      mockRouteName.value = 'campaigns';
      const wrapper = createWrapper();
      const drawerItems = wrapper.find('.q-drawer').findAll('.q-item');
      const campaignsItem = drawerItems.find((item) => item.text().includes('Campaigns'));

      expect(campaignsItem!.classes()).toContain('nav-item--active');
    });

    it('toggles mini state when sidebar toggle is clicked', async () => {
      const wrapper = createWrapper();
      const toggleBtn = wrapper.find('.q-btn[aria-label="Toggle sidebar"]');

      expect(toggleBtn.attributes('aria-expanded')).toBe('true');

      await toggleBtn.trigger('click');
      expect(toggleBtn.attributes('aria-expanded')).toBe('false');

      await toggleBtn.trigger('click');
      expect(toggleBtn.attributes('aria-expanded')).toBe('true');
    });
  });

  // ========================================
  // Bottom Navigation (Mobile)
  // ========================================
  describe('bottom navigation', () => {
    beforeEach(() => {
      mockIsDesktop.value = false;
    });

    it('renders bottom nav when authenticated', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-footer').exists()).toBe(true);
    });

    it('does not render bottom nav when not authenticated', () => {
      mockIsAuthenticated.value = false;
      const wrapper = createWrapper();

      expect(wrapper.find('.q-footer').exists()).toBe(false);
    });
  });

  // ========================================
  // Header
  // ========================================
  describe('header', () => {
    it('renders page title', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-toolbar-title').text()).toBe('Test Page');
    });

    it('renders dark mode toggle button', () => {
      const wrapper = createWrapper();
      const darkBtn = wrapper.find('.q-btn[aria-label="Toggle dark mode"]');

      expect(darkBtn.exists()).toBe(true);
    });

    it('renders account menu when authenticated', () => {
      const wrapper = createWrapper();
      const accountBtn = wrapper.find('.q-btn[aria-label="Account menu"]');

      expect(accountBtn.exists()).toBe(true);
    });

    it('does not render account menu when not authenticated', () => {
      mockIsAuthenticated.value = false;
      const wrapper = createWrapper();
      const accountBtn = wrapper.find('.q-btn[aria-label="Account menu"]');

      expect(accountBtn.exists()).toBe(false);
    });
  });
});
