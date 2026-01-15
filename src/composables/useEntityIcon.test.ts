import { describe, it, expect, vi } from 'vitest';
import { ref, computed } from 'vue';
import { useEntityIcon, useChainedEntityIcon } from './useEntityIcon';

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

describe('useChainedEntityIcon', () => {
  interface Equipment {
    id: number;
    name: string;
    typeId: number;
  }

  interface EquipmentType {
    id: number;
    name: string;
    icon?: string;
  }

  const mockEquipment: Equipment[] = [
    { id: 1, name: 'Iron Sword', typeId: 100 },
    { id: 2, name: 'Steel Shield', typeId: 200 },
    { id: 3, name: 'Magic Orb', typeId: 999 }, // Invalid type
  ];

  const mockTypes: EquipmentType[] = [
    { id: 100, name: 'Weapon', icon: 'weapon.png' },
    { id: 200, name: 'Armor', icon: 'armor.png' },
    { id: 300, name: 'Accessory' }, // No icon
  ];

  const getRelatedId = (equipment: Equipment) => equipment.typeId;

  // ========================================
  // Primary Entity Resolution
  // ========================================
  describe('primary entity resolution', () => {
    it('returns primary entity for valid id', () => {
      const primaryId = computed(() => 1);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { primaryEntity } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(primaryEntity.value).toEqual({ id: 1, name: 'Iron Sword', typeId: 100 });
    });

    it('returns undefined for missing primary', () => {
      const primaryId = computed(() => 999);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { primaryEntity } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(primaryEntity.value).toBeUndefined();
    });
  });

  // ========================================
  // Related Entity Resolution
  // ========================================
  describe('related entity resolution', () => {
    it('returns related entity via chain', () => {
      const primaryId = computed(() => 1);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { relatedEntity } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(relatedEntity.value).toEqual({ id: 100, name: 'Weapon', icon: 'weapon.png' });
    });

    it('returns undefined when primary not found', () => {
      const primaryId = computed(() => 999);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { relatedEntity } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(relatedEntity.value).toBeUndefined();
    });

    it('returns undefined when related not found', () => {
      const primaryId = computed(() => 3); // Magic Orb with invalid typeId 999
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { primaryEntity, relatedEntity } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(primaryEntity.value?.name).toBe('Magic Orb');
      expect(relatedEntity.value).toBeUndefined();
    });
  });

  // ========================================
  // Icon URL Resolution
  // ========================================
  describe('icon URL resolution', () => {
    it('returns icon from related entity', () => {
      const primaryId = computed(() => 1);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { iconUrl } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(iconUrl.value).toBe('/icons/equipment/weapon.png');
    });

    it('returns empty when primary missing', () => {
      const primaryId = computed(() => 999);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { iconUrl } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(iconUrl.value).toBe('');
    });

    it('returns empty when related missing', () => {
      const primaryId = computed(() => 3);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { iconUrl } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(iconUrl.value).toBe('');
    });

    it('returns empty when related has no icon', () => {
      // Create equipment linked to type without icon
      const equipmentWithNoIconType: Equipment[] = [{ id: 10, name: 'Ring', typeId: 300 }];
      const primaryId = computed(() => 10);
      const primaryEntities = computed(() => equipmentWithNoIconType);
      const relatedEntities = computed(() => mockTypes);

      const { relatedEntity, iconUrl } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(relatedEntity.value?.name).toBe('Accessory');
      expect(iconUrl.value).toBe('');
    });
  });

  // ========================================
  // Reactivity
  // ========================================
  describe('reactivity', () => {
    it('updates all values when primary id changes', () => {
      const primaryIdRef = ref<number | undefined>(1);
      const primaryId = computed(() => primaryIdRef.value);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { primaryEntity, relatedEntity, iconUrl } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(primaryEntity.value?.name).toBe('Iron Sword');
      expect(relatedEntity.value?.name).toBe('Weapon');
      expect(iconUrl.value).toBe('/icons/equipment/weapon.png');

      primaryIdRef.value = 2;

      expect(primaryEntity.value?.name).toBe('Steel Shield');
      expect(relatedEntity.value?.name).toBe('Armor');
      expect(iconUrl.value).toBe('/icons/equipment/armor.png');
    });

    it('handles undefined getRelatedId result', () => {
      const getRelatedIdWithUndefined = (eq: Equipment) => (eq.id === 1 ? undefined : eq.typeId);

      const primaryId = computed(() => 1);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed(() => mockTypes);

      const { primaryEntity, relatedEntity, iconUrl } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedIdWithUndefined,
        relatedEntities,
        'equipment'
      );

      expect(primaryEntity.value?.name).toBe('Iron Sword');
      expect(relatedEntity.value).toBeUndefined();
      expect(iconUrl.value).toBe('');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles empty primary entities', () => {
      const primaryId = computed(() => 1);
      const primaryEntities = computed<Equipment[]>(() => []);
      const relatedEntities = computed(() => mockTypes);

      const { primaryEntity, relatedEntity, iconUrl } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(primaryEntity.value).toBeUndefined();
      expect(relatedEntity.value).toBeUndefined();
      expect(iconUrl.value).toBe('');
    });

    it('handles empty related entities', () => {
      const primaryId = computed(() => 1);
      const primaryEntities = computed(() => mockEquipment);
      const relatedEntities = computed<EquipmentType[]>(() => []);

      const { primaryEntity, relatedEntity, iconUrl } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(primaryEntity.value?.name).toBe('Iron Sword');
      expect(relatedEntity.value).toBeUndefined();
      expect(iconUrl.value).toBe('');
    });

    it('handles zero as valid related id', () => {
      const equipmentWithZeroType: Equipment[] = [{ id: 1, name: 'Test', typeId: 0 }];
      const typesWithZero: EquipmentType[] = [{ id: 0, name: 'None', icon: 'none.png' }];

      const primaryId = computed(() => 1);
      const primaryEntities = computed(() => equipmentWithZeroType);
      const relatedEntities = computed(() => typesWithZero);

      const { relatedEntity, iconUrl } = useChainedEntityIcon(
        primaryId,
        primaryEntities,
        getRelatedId,
        relatedEntities,
        'equipment'
      );

      expect(relatedEntity.value?.name).toBe('None');
      expect(iconUrl.value).toBe('/icons/equipment/none.png');
    });
  });
});
