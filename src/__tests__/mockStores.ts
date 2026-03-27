import { vi } from 'vitest';

// Factory functions for common Pinia store mocks.
// Usage: import in test file, spread into vi.mock return value.
//
//   import { heroStore, classifierStore } from 'src/__tests__/mockStores';
//   const mocks = heroStore();
//   vi.mock('src/stores/hero', () => ({ useHeroStore: () => mocks }));
//
// Override any default by passing overrides:
//   const mocks = heroStore({ saving: true, hero: { id: 42 } });

export function heroStore(overrides: Record<string, unknown> = {}) {
  return {
    hero: null,
    conditions: [],
    injuries: [],
    talents: [],
    skills: [],
    equipment: [],
    saving: false,
    error: null,
    patchHealth: vi.fn(),
    patchFocus: vi.fn(),
    patchInvestiture: vi.fn(),
    patchCurrency: vi.fn(),
    setName: vi.fn(),
    setLevel: vi.fn(),
    clearHero: vi.fn(),
    updateEquipment: vi.fn(),
    addEquipment: vi.fn().mockResolvedValue(true),
    addCustomEquipment: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function classifierStore(overrides: Record<string, unknown> = {}) {
  return {
    initialized: true,
    activationTypes: [],
    ancestries: [],
    attributes: [],
    attributeTypes: [],
    conditions: [],
    equipment: [],
    equipmentTypes: [],
    expertises: [],
    expertiseTypes: [],
    levels: [],
    startingKits: [],
    modifications: [],
    paths: [],
    radiantOrders: [],
    singerForms: [],
    skills: [],
    specialties: [],
    surges: [],
    talents: [],
    ...overrides,
  };
}

export function heroAttributesStore(overrides: Record<string, unknown> = {}) {
  return {
    getSkillRank: vi.fn().mockReturnValue(0),
    getSkillModifier: vi.fn().mockReturnValue(0),
    getDerivedStatTotal: vi.fn().mockReturnValue(0),
    setSkillRank: vi.fn(),
    setSkillModifier: vi.fn(),
    getAttributeValue: vi.fn().mockReturnValue(0),
    levelData: null,
    ...overrides,
  };
}

export function heroTalentsStore(overrides: Record<string, unknown> = {}) {
  return {
    isSinger: false,
    isRadiant: false,
    radiantOrderId: null,
    radiantIdeal: 0,
    setAncestry: vi.fn(),
    setSingerForm: vi.fn(),
    addKeyTalentForPath: vi.fn(),
    removeTalent: vi.fn(),
    setRadiantOrder: vi.fn(),
    setRadiantIdeal: vi.fn(),
    ...overrides,
  };
}

export function heroEquipmentStore(overrides: Record<string, unknown> = {}) {
  return {
    setCurrency: vi.fn(),
    addEquipment: vi.fn(),
    removeEquipment: vi.fn(),
    ...overrides,
  };
}

export function wizardStore(overrides: Record<string, unknown> = {}) {
  return {
    mode: 'create',
    currentStep: 1,
    currentStepConfig: null,
    completedSteps: [],
    isActive: true,
    ...overrides,
  };
}

export function campaignStore(overrides: Record<string, unknown> = {}) {
  return {
    campaigns: [],
    currentCampaign: null,
    loading: false,
    error: null,
    isOwner: false,
    saving: false,
    selectCampaign: vi.fn().mockResolvedValue(undefined),
    deleteCampaign: vi.fn().mockResolvedValue(true),
    removeHero: vi.fn(),
    setError: vi.fn(),
    ...overrides,
  };
}

export function combatStore(overrides: Record<string, unknown> = {}) {
  return {
    combats: [],
    saving: false,
    fetchCombats: vi.fn().mockResolvedValue(undefined),
    createCombat: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}
