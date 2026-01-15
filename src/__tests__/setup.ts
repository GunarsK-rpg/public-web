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
// Quasar Component Stubs
// ========================================
config.global.stubs = {
  QPage: true,
  QCard: true,
  QCardSection: true,
  QCardActions: true,
  QBtn: true,
  QInput: true,
  QForm: true,
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
