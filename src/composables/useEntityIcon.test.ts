import { describe, it, expect, vi } from 'vitest';
import { computed, ref } from 'vue';
import { useEntityIcon } from './useEntityIcon';

// Mock the iconUrl utility
vi.mock('src/utils/iconUrl', () => ({
  getIconUrl: vi.fn((icon: string | undefined, category: string) => {
    if (!icon) return '';
    return `/icons/${category}/${icon}`;
  }),
}));

describe('useEntityIcon', () => {
  interface TestEntity {
    id: number;
    name: string;
    icon?: string;
  }

  const mockEntities: TestEntity[] = [
    { id: 1, name: 'Sword', icon: 'sword.png' },
    { id: 2, name: 'Shield', icon: 'shield.png' },
    { id: 3, name: 'Potion' }, // No icon
  ];

  // ========================================
  // Entity Resolution
  // ========================================
  describe('entity resolution', () => {
    it('returns entity for valid id', () => {
      const entityId = computed(() => 1);
      const entities = computed(() => mockEntities);

      const { entity } = useEntityIcon(entityId, entities, 'equipment');

      expect(entity.value).toEqual({ id: 1, name: 'Sword', icon: 'sword.png' });
    });

    it('returns undefined for missing entity', () => {
      const entityId = computed(() => 999);
      const entities = computed(() => mockEntities);

      const { entity } = useEntityIcon(entityId, entities, 'equipment');

      expect(entity.value).toBeUndefined();
    });

    it('returns undefined for undefined id', () => {
      const entityId = computed(() => undefined);
      const entities = computed(() => mockEntities);

      const { entity } = useEntityIcon(entityId, entities, 'equipment');

      expect(entity.value).toBeUndefined();
    });

    it('returns entity without icon property', () => {
      const entityId = computed(() => 3);
      const entities = computed(() => mockEntities);

      const { entity } = useEntityIcon(entityId, entities, 'equipment');

      expect(entity.value).toEqual({ id: 3, name: 'Potion' });
    });
  });

  // ========================================
  // Icon URL Resolution
  // ========================================
  describe('icon URL resolution', () => {
    it('returns icon URL for entity with icon', () => {
      const entityId = computed(() => 1);
      const entities = computed(() => mockEntities);

      const { iconUrl } = useEntityIcon(entityId, entities, 'equipment');

      expect(iconUrl.value).toBe('/icons/equipment/sword.png');
    });

    it('returns empty string for entity without icon', () => {
      const entityId = computed(() => 3);
      const entities = computed(() => mockEntities);

      const { iconUrl } = useEntityIcon(entityId, entities, 'equipment');

      expect(iconUrl.value).toBe('');
    });

    it('returns empty string for missing entity', () => {
      const entityId = computed(() => 999);
      const entities = computed(() => mockEntities);

      const { iconUrl } = useEntityIcon(entityId, entities, 'equipment');

      expect(iconUrl.value).toBe('');
    });

    it('uses correct icon category', () => {
      const entityId = computed(() => 2);
      const entities = computed(() => mockEntities);

      const { iconUrl } = useEntityIcon(entityId, entities, 'actions');

      expect(iconUrl.value).toBe('/icons/actions/shield.png');
    });
  });

  // ========================================
  // Reactivity
  // ========================================
  describe('reactivity', () => {
    it('updates when entity id changes', () => {
      const entityIdRef = ref<number | undefined>(1);
      const entityId = computed(() => entityIdRef.value);
      const entities = computed(() => mockEntities);

      const { entity, iconUrl } = useEntityIcon(entityId, entities, 'equipment');

      expect(entity.value?.name).toBe('Sword');
      expect(iconUrl.value).toBe('/icons/equipment/sword.png');

      entityIdRef.value = 2;

      expect(entity.value?.name).toBe('Shield');
      expect(iconUrl.value).toBe('/icons/equipment/shield.png');
    });

    it('updates when entities array changes', () => {
      const entityId = computed(() => 1);
      const entitiesRef = ref<TestEntity[]>([{ id: 1, name: 'Axe', icon: 'axe.png' }]);
      const entities = computed(() => entitiesRef.value);

      const { entity, iconUrl } = useEntityIcon(entityId, entities, 'equipment');

      expect(entity.value?.name).toBe('Axe');

      entitiesRef.value = [{ id: 1, name: 'Hammer', icon: 'hammer.png' }];

      expect(entity.value?.name).toBe('Hammer');
      expect(iconUrl.value).toBe('/icons/equipment/hammer.png');
    });

    it('handles entity becoming undefined', () => {
      const entityIdRef = ref<number | undefined>(1);
      const entityId = computed(() => entityIdRef.value);
      const entities = computed(() => mockEntities);

      const { entity, iconUrl } = useEntityIcon(entityId, entities, 'equipment');

      expect(entity.value).toBeDefined();

      entityIdRef.value = undefined;

      expect(entity.value).toBeUndefined();
      expect(iconUrl.value).toBe('');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles empty entities array', () => {
      const entityId = computed(() => 1);
      const entities = computed<TestEntity[]>(() => []);

      const { entity, iconUrl } = useEntityIcon(entityId, entities, 'equipment');

      expect(entity.value).toBeUndefined();
      expect(iconUrl.value).toBe('');
    });

    it('handles zero as valid id', () => {
      const entitiesWithZero: TestEntity[] = [{ id: 0, name: 'None', icon: 'none.png' }];
      const entityId = computed(() => 0);
      const entities = computed(() => entitiesWithZero);

      const { entity, iconUrl } = useEntityIcon(entityId, entities, 'equipment');

      expect(entity.value?.name).toBe('None');
      expect(iconUrl.value).toBe('/icons/equipment/none.png');
    });

    it('handles empty icon string', () => {
      const entitiesWithEmptyIcon: TestEntity[] = [{ id: 1, name: 'Test', icon: '' }];
      const entityId = computed(() => 1);
      const entities = computed(() => entitiesWithEmptyIcon);

      const { iconUrl } = useEntityIcon(entityId, entities, 'equipment');

      expect(iconUrl.value).toBe('');
    });
  });
});
