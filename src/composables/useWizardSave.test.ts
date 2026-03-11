import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useWizardSave } from './useWizardSave';
import { useDeletionTracker } from './useDeletionTracker';

// Mock stores
const mockHero = ref<Record<string, unknown> | null>(null);
const mockUpdateFromResponse = vi.fn();
const mockCurrentStepCode = ref('basic-setup');

const mockValidation = ref({ isValid: true, errors: [] as string[], warnings: [] as string[] });

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHero.value;
    },
    updateFromResponse: mockUpdateFromResponse,
  }),
}));

vi.mock('src/stores/wizard', () => ({
  useWizardStore: () => ({
    currentStep: 1,
    currentStepConfig: { code: 'basic-setup' },
  }),
}));

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    currentStepCode: mockCurrentStepCode,
    currentValidation: mockValidation,
  }),
}));

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockUpsertSubResource = vi.fn();
const mockDeleteSubResource = vi.fn();

vi.mock('src/services/heroService', () => ({
  default: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    upsertSubResource: (...args: unknown[]) => mockUpsertSubResource(...args),
    deleteSubResource: (...args: unknown[]) => mockDeleteSubResource(...args),
  },
}));

vi.mock('src/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    levelData: null,
    getAttributeValue: () => 0,
  }),
}));

function makeHero(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 0,
    userId: 0,
    user: { id: 0, username: '' },
    campaignId: null,
    campaign: { id: 1, code: 'test', name: 'Test' },
    ancestry: { id: 2, code: 'human', name: 'Human' },
    startingKit: null,
    activeSingerForm: null,
    radiantOrder: null,
    radiantIdeal: 0,
    name: 'Kaladin',
    level: 1,
    currentHealth: 10,
    currentFocus: 5,
    currentInvestiture: 0,
    currency: 50,
    attributes: [],
    defenses: [],
    derivedStats: [],
    skills: [],
    talents: [],
    expertises: [],
    equipment: [],
    conditions: [],
    injuries: [],
    goals: [],
    connections: [],
    companions: [],
    cultures: [],
    ...overrides,
  };
}

describe('useWizardSave', () => {
  let tracker: ReturnType<typeof useDeletionTracker>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    tracker = useDeletionTracker();
    mockHero.value = makeHero();
    mockCurrentStepCode.value = 'basic-setup';
    mockValidation.value = { isValid: true, errors: [], warnings: [] };
    mockCreate.mockResolvedValue({
      data: { id: 42, userId: 1, user: { id: 1, username: 'p1' } },
    });
    mockUpdate.mockResolvedValue({
      data: { id: 42, userId: 1, user: { id: 1, username: 'p1' } },
    });
    mockUpsertSubResource.mockResolvedValue({ data: { id: 100 } });
    mockDeleteSubResource.mockResolvedValue({ data: null });
  });

  // ========================================
  // Validation
  // ========================================
  describe('validation', () => {
    it('returns false and sets error when validation fails', async () => {
      mockValidation.value = { isValid: false, errors: ['Name is required'], warnings: [] };
      const { saveCurrentStep, saveError } = useWizardSave(tracker);

      const result = await saveCurrentStep();

      expect(result).toBe(false);
      expect(saveError.value).toBe('Name is required');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('does not save when no hero loaded', async () => {
      mockHero.value = null;
      const { saveCurrentStep, saveError } = useWizardSave(tracker);

      const result = await saveCurrentStep();

      expect(result).toBe(false);
      expect(saveError.value).toBe('No hero loaded');
    });
  });

  // ========================================
  // Review step
  // ========================================
  describe('review step', () => {
    it('skips save and returns true for review step', async () => {
      mockCurrentStepCode.value = 'review';
      const { saveCurrentStep } = useWizardSave(tracker);

      const result = await saveCurrentStep();

      expect(result).toBe(true);
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Hero creation (step 1, id = 0)
  // ========================================
  describe('hero creation', () => {
    it('creates hero when id is 0', async () => {
      mockHero.value = makeHero({ id: 0 });
      mockCurrentStepCode.value = 'basic-setup';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockUpdateFromResponse).toHaveBeenCalled();
    });

    it('updates hero when id > 0', async () => {
      mockHero.value = makeHero({ id: 42 });
      mockCurrentStepCode.value = 'basic-setup';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Sub-resource sync
  // ========================================
  describe('sub-resource sync', () => {
    it('upserts cultures and expertises on culture step', async () => {
      mockHero.value = makeHero({
        id: 42,
        cultures: [{ id: -1, heroId: 42, culture: { id: 1, code: 'alethi', name: 'Alethi' } }],
        expertises: [{ id: -1, heroId: 42, expertise: { id: 1, code: 'lore', name: 'Lore' } }],
      });
      mockCurrentStepCode.value = 'culture';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockUpsertSubResource).toHaveBeenCalledWith(42, 'cultures', expect.any(Object));
      expect(mockUpsertSubResource).toHaveBeenCalledWith(42, 'expertises', expect.any(Object));
    });

    it('upserts attributes on attributes step', async () => {
      mockHero.value = makeHero({
        id: 42,
        attributes: [
          { id: -1, heroId: 42, attribute: { id: 1, code: 'str', name: 'Strength' }, value: 3 },
        ],
      });
      mockCurrentStepCode.value = 'attributes';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockUpsertSubResource).toHaveBeenCalledWith(42, 'attributes', expect.any(Object));
    });

    it('filters skills with rank 0 and modifier 0', async () => {
      mockHero.value = makeHero({
        id: 42,
        skills: [
          {
            id: -1,
            heroId: 42,
            skill: { id: 1, code: 'athletics', name: 'Athletics' },
            rank: 2,
            modifier: 0,
          },
          {
            id: -2,
            heroId: 42,
            skill: { id: 2, code: 'stealth', name: 'Stealth' },
            rank: 0,
            modifier: 0,
          },
        ],
      });
      mockCurrentStepCode.value = 'skills';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      // Only athletics should be upserted (rank > 0)
      expect(mockUpsertSubResource).toHaveBeenCalledTimes(1);
      expect(mockUpsertSubResource).toHaveBeenCalledWith(
        42,
        'skills',
        expect.objectContaining({ skill: { code: 'athletics' } })
      );
    });

    it('tracks previously-saved zeroed skills for deletion', async () => {
      mockHero.value = makeHero({
        id: 42,
        skills: [
          {
            id: 55,
            heroId: 42,
            skill: { id: 2, code: 'stealth', name: 'Stealth' },
            rank: 0,
            modifier: 0,
          },
        ],
      });
      mockCurrentStepCode.value = 'skills';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      // Zeroed skill with real DB ID should be deleted, not upserted
      expect(mockDeleteSubResource).toHaveBeenCalledWith(42, 'skills', 55);
      expect(mockUpsertSubResource).not.toHaveBeenCalled();
    });

    it('does not track temp-id zeroed skills for deletion', async () => {
      mockHero.value = makeHero({
        id: 42,
        skills: [
          {
            id: -1,
            heroId: 42,
            skill: { id: 2, code: 'stealth', name: 'Stealth' },
            rank: 0,
            modifier: 0,
          },
        ],
      });
      mockCurrentStepCode.value = 'skills';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      // Temp ID skills should not trigger deletion or upsert
      expect(mockDeleteSubResource).not.toHaveBeenCalled();
      expect(mockUpsertSubResource).not.toHaveBeenCalled();
    });

    it('includes skills with rank 0 but non-zero modifier', async () => {
      mockHero.value = makeHero({
        id: 42,
        skills: [
          {
            id: -1,
            heroId: 42,
            skill: { id: 1, code: 'stealth', name: 'Stealth' },
            rank: 0,
            modifier: 2,
          },
        ],
      });
      mockCurrentStepCode.value = 'skills';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockUpsertSubResource).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================
  // Deletion tracking
  // ========================================
  describe('deletion tracking', () => {
    it('deletes tracked sub-resources', async () => {
      mockHero.value = makeHero({ id: 42 });
      mockCurrentStepCode.value = 'culture';
      tracker.trackDeletion('cultures', 5);
      tracker.trackDeletion('cultures', 10);
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockDeleteSubResource).toHaveBeenCalledWith(42, 'cultures', 5);
      expect(mockDeleteSubResource).toHaveBeenCalledWith(42, 'cultures', 10);
    });

    it('clears deletions after successful sync', async () => {
      mockHero.value = makeHero({ id: 42 });
      mockCurrentStepCode.value = 'culture';
      tracker.trackDeletion('cultures', 5);
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(tracker.getDeletions('cultures')).toEqual([]);
    });

    it('preserves failed deletion IDs for retry', async () => {
      mockHero.value = makeHero({ id: 42 });
      mockCurrentStepCode.value = 'culture';
      tracker.trackDeletion('cultures', 5);
      tracker.trackDeletion('cultures', 10);
      mockDeleteSubResource
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: null });
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      // Failed ID should be re-tracked for retry; successful one cleared
      const remaining = tracker.getDeletions('cultures');
      expect(remaining).toContain(5);
      expect(remaining).not.toContain(10);
    });
  });

  // ========================================
  // ID reconciliation
  // ========================================
  describe('ID reconciliation', () => {
    it('updates temp IDs with real IDs from response', async () => {
      const culture = {
        id: -1,
        heroId: 42,
        culture: { id: 1, code: 'alethi', name: 'Alethi' },
      };
      mockHero.value = makeHero({ id: 42, cultures: [culture] });
      mockCurrentStepCode.value = 'culture';
      mockUpsertSubResource.mockResolvedValue({ data: { id: 77 } });
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(culture.id).toBe(77);
    });

    it('does not update real IDs', async () => {
      const culture = {
        id: 50,
        heroId: 42,
        culture: { id: 1, code: 'alethi', name: 'Alethi' },
      };
      mockHero.value = makeHero({ id: 42, cultures: [culture] });
      mockCurrentStepCode.value = 'culture';
      mockUpsertSubResource.mockResolvedValue({ data: { id: 50 } });
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(culture.id).toBe(50);
    });
  });

  // ========================================
  // Error handling
  // ========================================
  describe('error handling', () => {
    it('returns false and sets error on API failure', async () => {
      mockCreate.mockRejectedValue(new Error('Network error'));
      const { saveCurrentStep, saveError } = useWizardSave(tracker);

      const result = await saveCurrentStep();

      expect(result).toBe(false);
      expect(saveError.value).toBe('Network error');
    });

    it('handles non-Error thrown values', async () => {
      mockCreate.mockRejectedValue('string error');
      const { saveCurrentStep, saveError } = useWizardSave(tracker);

      const result = await saveCurrentStep();

      expect(result).toBe(false);
      expect(saveError.value).toBe('Save failed');
    });
  });

  // ========================================
  // Saving state
  // ========================================
  describe('saving state', () => {
    it('sets saving true during save and false after', async () => {
      let savingDuringCall = false;
      mockCreate.mockImplementation(() => {
        savingDuringCall = saving.value;
        return Promise.resolve({ data: { id: 42 } });
      });
      const { saveCurrentStep, saving } = useWizardSave(tracker);

      expect(saving.value).toBe(false);
      await saveCurrentStep();
      expect(savingDuringCall).toBe(true);
      expect(saving.value).toBe(false);
    });

    it('clears saveError on new save attempt', async () => {
      mockCreate.mockRejectedValueOnce(new Error('First failure'));
      const { saveCurrentStep, saveError } = useWizardSave(tracker);

      await saveCurrentStep();
      expect(saveError.value).toBe('First failure');

      mockCreate.mockResolvedValueOnce({ data: { id: 42 } });
      await saveCurrentStep();
      expect(saveError.value).toBeNull();
    });
  });

  // ========================================
  // Steps with core + sub-resources
  // ========================================
  describe('combined core and sub-resource saves', () => {
    it('saves hero core AND talents on paths step', async () => {
      mockHero.value = makeHero({
        id: 42,
        talents: [
          { id: -1, heroId: 42, talent: { id: 5, code: 'shield-mastery', name: 'Shield Mastery' } },
        ],
      });
      mockCurrentStepCode.value = 'paths';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpsertSubResource).toHaveBeenCalledWith(42, 'talents', expect.any(Object));
    });

    it('saves hero core AND equipment on equipment step', async () => {
      mockHero.value = makeHero({
        id: 42,
        equipment: [
          {
            id: -1,
            heroId: 42,
            equipment: { id: 3, code: 'longsword', name: 'Longsword' },
            equipType: { id: 1, code: 'weapon', name: 'Weapon' },
            amount: 1,
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
            charges: null,
            maxCharges: null,
            notes: null,
            customName: null,
          },
        ],
      });
      mockCurrentStepCode.value = 'equipment';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpsertSubResource).toHaveBeenCalledWith(42, 'equipment', expect.any(Object));
    });

    it('saves core + equipment + expertises on starting-kit step', async () => {
      mockHero.value = makeHero({
        id: 42,
        equipment: [
          {
            id: -1,
            heroId: 42,
            equipment: { id: 3, code: 'longsword', name: 'Longsword' },
            equipType: { id: 1, code: 'weapon', name: 'Weapon' },
            amount: 1,
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
            charges: null,
            maxCharges: null,
            notes: null,
            customName: null,
          },
        ],
        expertises: [{ id: -1, heroId: 42, expertise: { id: 1, code: 'lore', name: 'Lore' } }],
      });
      mockCurrentStepCode.value = 'starting-kit';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpsertSubResource).toHaveBeenCalledWith(42, 'equipment', expect.any(Object));
      expect(mockUpsertSubResource).toHaveBeenCalledWith(42, 'expertises', expect.any(Object));
    });

    it('saves core + goals + connections + companions on personal-details step', async () => {
      mockHero.value = makeHero({
        id: 42,
        goals: [
          {
            id: -1,
            heroId: 42,
            status: { id: 1, code: 'active', name: 'Active' },
            name: 'Goal',
            value: 1,
          },
        ],
        connections: [
          {
            id: -2,
            heroId: 42,
            connectionType: { id: 1, code: 'ally', name: 'Ally' },
          },
        ],
        companions: [],
      });
      mockCurrentStepCode.value = 'personal-details';
      const { saveCurrentStep } = useWizardSave(tracker);

      await saveCurrentStep();

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpsertSubResource).toHaveBeenCalledWith(42, 'goals', expect.any(Object));
      expect(mockUpsertSubResource).toHaveBeenCalledWith(42, 'connections', expect.any(Object));
    });
  });
});
