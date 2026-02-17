import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHeroEquipmentStore } from './heroEquipment';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';
import { MAX_EQUIPMENT_STACK } from 'src/constants';

// Mock classifiers data
const mockClassifiers = {
  attributeTypes: [],
  attributes: [],
  derivedStats: [],
  derivedStatValues: [],
  skills: [],
  expertiseTypes: [],
  expertises: [
    {
      id: 1,
      code: 'climbing',
      name: 'Climbing',
      expertiseType: { id: 1, code: 'general', name: 'General' },
    },
  ],
  activationTypes: [],
  actionTypes: [],
  actions: [],
  actionLinks: [],
  paths: [],
  specialties: [],
  surges: [],
  radiantOrders: [],
  singerForms: [],
  talents: [],
  units: [],
  equipmentTypes: [],
  damageTypes: [],
  equipmentAttributes: [],
  equipment: [
    { id: 1, code: 'sword', name: 'Sword' },
    { id: 2, code: 'shield', name: 'Shield' },
  ],
  conditions: [],
  injuries: [],
  goalStatuses: [],
  connectionTypes: [],
  companionTypes: [],
  startingKits: [
    {
      id: 1,
      code: 'warrior',
      name: 'Warrior Kit',
      startingSpheres: '',
      expertises: [{ id: 1, code: 'climbing', name: 'Climbing' }],
      equipment: [
        { id: 1, code: 'sword', name: 'Sword', quantity: 1 },
        { id: 2, code: 'shield', name: 'Shield', quantity: 1 },
      ],
    },
    {
      id: 2,
      code: 'empty',
      name: 'Empty Kit',
      startingSpheres: '',
      // No expertises or equipment arrays
    },
    {
      id: 3,
      code: 'null-arrays',
      name: 'Null Arrays Kit',
      startingSpheres: '',
      expertises: null,
      equipment: null,
    },
  ],
  ancestries: [],
  cultures: [],
  tiers: [],
  levels: [],
};

const { mockGetAllClassifiers } = vi.hoisted(() => ({
  mockGetAllClassifiers: vi.fn(),
}));

vi.mock('src/services/classifierService', () => ({
  default: {
    getAll: mockGetAllClassifiers,
  },
}));

vi.mock('src/services/heroService', () => ({
  default: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getSheet: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getSubResource: vi.fn(),
    upsertSubResource: vi.fn(),
    deleteSubResource: vi.fn(),
  },
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useHeroEquipmentStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetAllClassifiers.mockResolvedValue({ data: mockClassifiers });

    // Initialize classifiers and hero for all tests
    const classifierStore = useClassifierStore();
    await classifierStore.initialize();

    const heroStore = useHeroStore();
    heroStore.initNewHero();
  });

  // ========================================
  // Currency
  // ========================================
  describe('setCurrency', () => {
    it('sets currency amount', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.setCurrency(100);

      expect(heroStore.hero?.currency).toBe(100);
    });

    it('clamps negative values to 0', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.setCurrency(-50);

      expect(heroStore.hero?.currency).toBe(0);
    });

    it('floors decimal values', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.setCurrency(75.9);

      expect(heroStore.hero?.currency).toBe(75);
    });

    it('does nothing when no hero loaded', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      store.setCurrency(100);

      expect(heroStore.hero).toBeNull();
    });
  });

  // ========================================
  // Equipment - Add
  // ========================================
  describe('addEquipment', () => {
    it('adds equipment with default amount of 1', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1);

      expect(heroStore.hero!.equipment.length).toBe(1);
      expect(heroStore.hero!.equipment[0]!.equipment.id).toBe(1);
      expect(heroStore.hero!.equipment[0]!.amount).toBe(1);
    });

    it('adds equipment with specified amount', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 5);

      expect(heroStore.hero!.equipment[0]!.amount).toBe(5);
    });

    it('stacks existing equipment', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 3);
      store.addEquipment(1, 2);

      expect(heroStore.hero!.equipment.length).toBe(1);
      expect(heroStore.hero!.equipment[0]!.amount).toBe(5);
    });

    it('caps at max stack size', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, MAX_EQUIPMENT_STACK + 1);

      expect(heroStore.hero!.equipment[0]!.amount).toBe(MAX_EQUIPMENT_STACK);
    });

    it('caps stacking at max stack size', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 500);
      store.addEquipment(1, 600);

      expect(heroStore.hero!.equipment[0]!.amount).toBe(MAX_EQUIPMENT_STACK);
    });

    it('sets isEquipped to false by default', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1);

      expect(heroStore.hero!.equipment[0]!.isEquipped).toBe(false);
    });

    it('generates temp id for new equipment', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1);
      store.addEquipment(2);

      expect(heroStore.hero!.equipment[0]!.id).toBe(-1);
      expect(heroStore.hero!.equipment[1]!.id).toBe(-2);
    });

    it('floors decimal amounts', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 3.7);

      expect(heroStore.hero!.equipment[0]!.amount).toBe(3);
    });

    it('treats negative amount as 1', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, -5);

      expect(heroStore.hero!.equipment[0]!.amount).toBe(1);
    });
  });

  // ========================================
  // Equipment - Remove
  // ========================================
  describe('removeEquipment', () => {
    it('removes equipment entirely when no amount specified', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 5);
      store.removeEquipment(1);

      expect(heroStore.hero!.equipment.length).toBe(0);
    });

    it('decrements stack when amount specified', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 5);
      store.removeEquipment(1, 2);

      expect(heroStore.hero!.equipment[0]!.amount).toBe(3);
    });

    it('removes equipment when stack reaches 0', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 3);
      store.removeEquipment(1, 3);

      expect(heroStore.hero!.equipment.length).toBe(0);
    });

    it('removes equipment when decrement exceeds stack', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 3);
      store.removeEquipment(1, 10);

      expect(heroStore.hero!.equipment.length).toBe(0);
    });

    it('does nothing for non-existent equipment', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1);
      store.removeEquipment(999);

      expect(heroStore.hero!.equipment.length).toBe(1);
    });

    it('does nothing when no hero loaded', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      store.removeEquipment(1);

      expect(heroStore.hero).toBeNull();
    });

    it('does nothing when amount specified but equipment not found', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 5);
      store.removeEquipment(999, 2); // Non-existent equipment with amount

      expect(heroStore.hero!.equipment.length).toBe(1);
      expect(heroStore.hero!.equipment[0]!.amount).toBe(5);
    });

    it('floors decimal amounts when decrementing', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 5);
      store.removeEquipment(1, 2.7);

      expect(heroStore.hero!.equipment[0]!.amount).toBe(3);
    });

    it('treats negative amount as 1 when decrementing', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1, 5);
      store.removeEquipment(1, -3);

      expect(heroStore.hero!.equipment[0]!.amount).toBe(4);
    });
  });

  // ========================================
  // Equipment - Equipped
  // ========================================
  describe('setEquipmentEquipped', () => {
    it('sets equipment as equipped', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1);
      store.setEquipmentEquipped(1, true);

      expect(heroStore.hero!.equipment[0]!.isEquipped).toBe(true);
    });

    it('sets equipment as unequipped', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1);
      store.setEquipmentEquipped(1, true);
      store.setEquipmentEquipped(1, false);

      expect(heroStore.hero!.equipment[0]!.isEquipped).toBe(false);
    });

    it('does nothing for non-existent equipment', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.addEquipment(1);
      store.setEquipmentEquipped(999, true);

      expect(heroStore.hero!.equipment[0]!.isEquipped).toBe(false);
    });

    it('does nothing when no hero loaded', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      store.setEquipmentEquipped(1, true);

      expect(heroStore.hero).toBeNull();
    });
  });

  // ========================================
  // Starting Kit
  // ========================================
  describe('setStartingKit', () => {
    it('sets starting kit id on hero', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.setStartingKit(1);

      expect(heroStore.hero?.startingKit?.id).toBe(1);
    });

    it('applies kit equipment', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.setStartingKit(1);

      // Warrior kit has sword and shield
      expect(heroStore.hero!.equipment.length).toBe(2);
      expect(heroStore.hero!.equipment.find((e) => e.equipment.id === 1)).toBeTruthy();
      expect(heroStore.hero!.equipment.find((e) => e.equipment.id === 2)).toBeTruthy();
    });

    it('clears previous equipment when applying kit', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      // Add some equipment first
      store.addEquipment(1, 10);

      store.setStartingKit(1);

      // Should only have kit equipment, not stacked with previous
      const sword = heroStore.hero!.equipment.find((e) => e.equipment.id === 1);
      expect(sword?.amount).toBe(1);
    });

    it('applies kit expertises', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.setStartingKit(1);

      // Warrior kit has climbing expertise
      const hasClimbingExpertise = heroStore.hero!.expertises.some(
        (e) => e.expertise.id === 1 && e.source?.sourceType === 'starting_kit'
      );
      expect(hasClimbingExpertise).toBe(true);
    });

    it('clears previous starting kit expertises', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      // Apply kit, then apply again
      store.setStartingKit(1);
      store.setStartingKit(1);

      // Should not duplicate expertises
      const startingKitExpertises = heroStore.hero?.expertises.filter(
        (e) => e.source?.sourceType === 'starting_kit'
      );
      expect(startingKitExpertises?.length).toBe(1);
    });

    it('does nothing for non-existent kit', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.setStartingKit(999);

      // Kit not found — startingKit stays null, no equipment/expertises applied
      expect(heroStore.hero?.startingKit).toBeNull();
      expect(heroStore.hero!.equipment.length).toBe(0);
    });

    it('does nothing when no hero loaded', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      store.setStartingKit(1);

      expect(heroStore.hero).toBeNull();
    });

    it('handles kit with no expertises array', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.setStartingKit(2); // Empty kit

      expect(heroStore.hero?.startingKit?.id).toBe(2);
      expect(heroStore.hero!.equipment.length).toBe(0);
      expect(heroStore.hero!.expertises.length).toBe(0);
    });

    it('handles kit with null expertises/equipment', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      store.setStartingKit(3); // Null arrays kit

      expect(heroStore.hero?.startingKit?.id).toBe(3);
      expect(heroStore.hero!.equipment.length).toBe(0);
    });

    it('does nothing in applyStartingKitBonuses when no hero', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();

      // Set kit first, then clear hero
      store.setStartingKit(1);
      heroStore.clearHero();

      // Call setStartingKit again - should return early
      store.setStartingKit(1);

      expect(heroStore.hero).toBeNull();
    });
  });

  // ========================================
  // Add Equipment - No Hero
  // ========================================
  describe('addEquipment edge cases', () => {
    it('does nothing when no hero loaded', () => {
      const store = useHeroEquipmentStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      store.addEquipment(1);

      expect(heroStore.hero).toBeNull();
    });
  });
});
