import { config } from '@vue/test-utils';
import { vi, afterEach } from 'vitest';

// ========================================
// localStorage Mock (full Storage interface)
// ========================================
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn().mockReturnValue(null),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ========================================
// Quasar Mock
// ========================================
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: vi.fn(),
  }),
}));

// ========================================
// Vue Router Mock
// ========================================
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  resolve: vi.fn().mockReturnValue({ href: '/' }),
};
const mockRoute = {
  params: {},
  query: {},
  path: '/',
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}));

// Export for test access
export { mockRouter, mockRoute, localStorageMock };

// ========================================
// Quasar Directives
// ========================================
config.global.directives = {
  'close-popup': {},
};

// ========================================
// Quasar Component Stubs
// ========================================
config.global.stubs = {
  QPage: true,
  QCard: true,
  QCardSection: true,
  QCardActions: true,
  QBtn: true,
  QInput: true,
  QForm: {
    template: '<form><slot /></form>',
    methods: {
      validate: vi.fn(() => Promise.resolve(true)),
    },
  },
  QDialog: true,
  QList: true,
  QItem: true,
  QItemSection: true,
  QItemLabel: true,
  QIcon: true,
  QTabs: true,
  QTab: true,
  QTabPanels: true,
  QTabPanel: true,
  QSelect: true,
  QSeparator: true,
  QSpace: true,
  QAvatar: true,
  QBadge: true,
  QChip: true,
  QExpansionItem: true,
  QSlider: true,
  QLinearProgress: true,
};

// ========================================
// Cleanup
// ========================================
afterEach(() => {
  vi.clearAllMocks();
});
