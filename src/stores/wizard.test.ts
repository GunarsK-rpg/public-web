import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWizardStore } from './wizard';
import { useHeroStore } from './hero';
import { WIZARD_STEPS } from 'src/types/wizard';

// Mock the heroes module for loadHero
vi.mock('src/mock/heroes', () => ({
  heroes: [
    {
      id: 1,
      userId: 1,
      campaignId: 1,
      ancestryId: 1,
      startingKitId: null,
      activeSingerFormId: null,
      radiantOrderId: null,
      radiantIdeal: 0,
      name: 'Test Hero',
      level: 5,
      currentHealth: 20,
      currentFocus: 10,
      currentInvestiture: 5,
      attributes: [],
      defenses: [],
      derivedStats: [],
      skills: [],
      talents: [],
      expertises: [],
      equipment: [],
      currency: 100,
      conditions: [],
      injuries: [],
      goals: [],
      connections: [],
      companions: [],
      cultures: [],
    },
  ],
}));

// Mock logger
vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useWizardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  // ========================================
  // Initial State
  // ========================================
  describe('initial state', () => {
    it('starts at step 1', () => {
      const store = useWizardStore();
      expect(store.currentStep).toBe(1);
    });

    it('starts with no completed steps', () => {
      const store = useWizardStore();
      expect(store.completedSteps).toEqual([]);
    });

    it('starts in create mode', () => {
      const store = useWizardStore();
      expect(store.mode).toBe('create');
    });

    it('starts inactive', () => {
      const store = useWizardStore();
      expect(store.isActive).toBe(false);
    });
  });

  // ========================================
  // Computed Properties
  // ========================================
  describe('computed properties', () => {
    it('currentStepConfig returns correct step', () => {
      const store = useWizardStore();
      expect(store.currentStepConfig?.id).toBe(1);
      expect(store.currentStepConfig?.code).toBe('basic-setup');
    });

    it('canGoNext is true when not at last step', () => {
      const store = useWizardStore();
      expect(store.canGoNext).toBe(true);
    });

    it('canGoNext is false at last step', () => {
      const store = useWizardStore();
      store.goToStep(WIZARD_STEPS.length);
      expect(store.canGoNext).toBe(false);
    });

    it('canGoPrev is false at first step', () => {
      const store = useWizardStore();
      expect(store.canGoPrev).toBe(false);
    });

    it('canGoPrev is true when not at first step', () => {
      const store = useWizardStore();
      store.goToStep(5);
      expect(store.canGoPrev).toBe(true);
    });

    it('progress calculates correctly', () => {
      const store = useWizardStore();
      store.markStepCompleted(1);
      store.markStepCompleted(2);

      expect(store.progress.current).toBe(1);
      expect(store.progress.total).toBe(WIZARD_STEPS.length);
      expect(store.progress.completed).toBe(2);
      expect(store.progress.percentage).toBe(Math.round((2 / WIZARD_STEPS.length) * 100));
    });
  });

  // ========================================
  // Navigation
  // ========================================
  describe('goToStep', () => {
    it('navigates to valid step', () => {
      const store = useWizardStore();
      store.goToStep(5);
      expect(store.currentStep).toBe(5);
    });

    it('ignores step below 1', () => {
      const store = useWizardStore();
      store.goToStep(0);
      expect(store.currentStep).toBe(1);
    });

    it('ignores step above max', () => {
      const store = useWizardStore();
      store.goToStep(100);
      expect(store.currentStep).toBe(1);
    });
  });

  describe('nextStep', () => {
    it('advances to next step', () => {
      const store = useWizardStore();
      store.nextStep();
      expect(store.currentStep).toBe(2);
    });

    it('marks current step as completed', () => {
      const store = useWizardStore();
      store.nextStep();
      expect(store.isStepCompleted(1)).toBe(true);
    });

    it('does not advance past last step', () => {
      const store = useWizardStore();
      store.goToStep(WIZARD_STEPS.length);
      store.nextStep();
      expect(store.currentStep).toBe(WIZARD_STEPS.length);
    });
  });

  describe('previousStep', () => {
    it('goes to previous step', () => {
      const store = useWizardStore();
      store.goToStep(5);
      store.previousStep();
      expect(store.currentStep).toBe(4);
    });

    it('does not go below step 1', () => {
      const store = useWizardStore();
      store.previousStep();
      expect(store.currentStep).toBe(1);
    });
  });

  // ========================================
  // Step Completion
  // ========================================
  describe('step completion', () => {
    it('markStepCompleted adds step to completed set', () => {
      const store = useWizardStore();
      store.markStepCompleted(3);
      expect(store.isStepCompleted(3)).toBe(true);
    });

    it('markStepIncomplete removes step from completed set', () => {
      const store = useWizardStore();
      store.markStepCompleted(3);
      store.markStepIncomplete(3);
      expect(store.isStepCompleted(3)).toBe(false);
    });

    it('isStepCompleted returns false for uncompleted step', () => {
      const store = useWizardStore();
      expect(store.isStepCompleted(5)).toBe(false);
    });

    it('completedSteps returns array of completed step ids', () => {
      const store = useWizardStore();
      store.markStepCompleted(1);
      store.markStepCompleted(3);
      store.markStepCompleted(5);

      expect(store.completedSteps).toContain(1);
      expect(store.completedSteps).toContain(3);
      expect(store.completedSteps).toContain(5);
      expect(store.completedSteps.length).toBe(3);
    });
  });

  // ========================================
  // Lifecycle - startCreate
  // ========================================
  describe('startCreate', () => {
    it('initializes new hero', () => {
      const wizardStore = useWizardStore();
      const heroStore = useHeroStore();

      wizardStore.startCreate();

      expect(heroStore.hero).not.toBeNull();
      expect(heroStore.isNew).toBe(true);
    });

    it('sets mode to create', () => {
      const store = useWizardStore();
      store.startCreate();
      expect(store.mode).toBe('create');
    });

    it('resets to step 1', () => {
      const store = useWizardStore();
      store.goToStep(5);
      store.startCreate();
      expect(store.currentStep).toBe(1);
    });

    it('clears completed steps', () => {
      const store = useWizardStore();
      store.markStepCompleted(1);
      store.markStepCompleted(2);
      store.startCreate();
      expect(store.completedSteps).toEqual([]);
    });

    it('sets isActive to true', () => {
      const store = useWizardStore();
      store.startCreate();
      expect(store.isActive).toBe(true);
    });

    it('passes campaignId to hero store', () => {
      const wizardStore = useWizardStore();
      const heroStore = useHeroStore();

      wizardStore.startCreate(42);

      expect(heroStore.hero?.campaignId).toBe(42);
    });
  });

  // ========================================
  // Lifecycle - startEdit
  // ========================================
  describe('startEdit', () => {
    it('loads hero by id', async () => {
      const wizardStore = useWizardStore();
      const heroStore = useHeroStore();

      const result = await wizardStore.startEdit(1);

      expect(result).toBe(true);
      expect(heroStore.hero?.id).toBe(1);
    });

    it('sets mode to edit', async () => {
      const store = useWizardStore();
      await store.startEdit(1);
      expect(store.mode).toBe('edit');
    });

    it('resets to step 1', async () => {
      const store = useWizardStore();
      store.goToStep(5);
      await store.startEdit(1);
      expect(store.currentStep).toBe(1);
    });

    it('marks all steps as completed', async () => {
      const store = useWizardStore();
      await store.startEdit(1);

      WIZARD_STEPS.forEach((step) => {
        expect(store.isStepCompleted(step.id)).toBe(true);
      });
    });

    it('sets isActive to true', async () => {
      const store = useWizardStore();
      await store.startEdit(1);
      expect(store.isActive).toBe(true);
    });

    it('handles hero not found (sets error but still activates)', async () => {
      const wizardStore = useWizardStore();
      const heroStore = useHeroStore();

      await wizardStore.startEdit(999);

      // loadHero doesn't throw, it sets error - wizard still activates
      expect(heroStore.error).toBe('Hero not found');
      expect(wizardStore.isActive).toBe(true);
    });

    it('returns false and resets on loadHero exception', async () => {
      const wizardStore = useWizardStore();
      const heroStore = useHeroStore();

      // Mock loadHero to throw
      const originalLoadHero = heroStore.loadHero;
      heroStore.loadHero = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await wizardStore.startEdit(1);

      expect(result).toBe(false);
      expect(wizardStore.isActive).toBe(false);

      // Restore original
      heroStore.loadHero = originalLoadHero;
    });
  });

  // ========================================
  // Lifecycle - startLevelUp
  // ========================================
  describe('startLevelUp', () => {
    it('loads hero by id', async () => {
      const wizardStore = useWizardStore();
      const heroStore = useHeroStore();

      const result = await wizardStore.startLevelUp(1);

      expect(result).toBe(true);
      expect(heroStore.hero?.id).toBe(1);
    });

    it('sets mode to levelup', async () => {
      const store = useWizardStore();
      await store.startLevelUp(1);
      expect(store.mode).toBe('levelup');
    });

    it('starts at attributes step (step 4)', async () => {
      const store = useWizardStore();
      await store.startLevelUp(1);
      expect(store.currentStep).toBe(4); // attributes step
    });

    it('marks steps before attributes as completed', async () => {
      const store = useWizardStore();
      await store.startLevelUp(1);

      // Steps 1-3 should be completed
      expect(store.isStepCompleted(1)).toBe(true);
      expect(store.isStepCompleted(2)).toBe(true);
      expect(store.isStepCompleted(3)).toBe(true);
      // Step 4 should not be completed
      expect(store.isStepCompleted(4)).toBe(false);
    });

    it('sets isActive to true', async () => {
      const store = useWizardStore();
      await store.startLevelUp(1);
      expect(store.isActive).toBe(true);
    });

    it('handles hero not found (sets error but still activates)', async () => {
      const wizardStore = useWizardStore();
      const heroStore = useHeroStore();

      await wizardStore.startLevelUp(999);

      // loadHero doesn't throw, it sets error - wizard still activates
      expect(heroStore.error).toBe('Hero not found');
      expect(wizardStore.isActive).toBe(true);
    });

    it('returns false and resets on loadHero exception', async () => {
      const wizardStore = useWizardStore();
      const heroStore = useHeroStore();

      // Mock loadHero to throw
      const originalLoadHero = heroStore.loadHero;
      heroStore.loadHero = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await wizardStore.startLevelUp(1);

      expect(result).toBe(false);
      expect(wizardStore.isActive).toBe(false);

      // Restore original
      heroStore.loadHero = originalLoadHero;
    });
  });

  // ========================================
  // Lifecycle - cancel and reset
  // ========================================
  describe('cancel', () => {
    it('clears hero from hero store', () => {
      const wizardStore = useWizardStore();
      const heroStore = useHeroStore();

      wizardStore.startCreate();
      expect(heroStore.hero).not.toBeNull();

      wizardStore.cancel();
      expect(heroStore.hero).toBeNull();
    });

    it('resets wizard state', () => {
      const store = useWizardStore();
      store.startCreate();
      store.goToStep(5);
      store.markStepCompleted(1);

      store.cancel();

      expect(store.currentStep).toBe(1);
      expect(store.completedSteps).toEqual([]);
      expect(store.isActive).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets currentStep to 1', () => {
      const store = useWizardStore();
      store.goToStep(5);
      store.reset();
      expect(store.currentStep).toBe(1);
    });

    it('clears completed steps', () => {
      const store = useWizardStore();
      store.markStepCompleted(1);
      store.markStepCompleted(2);
      store.reset();
      expect(store.completedSteps).toEqual([]);
    });

    it('sets mode to create', () => {
      const store = useWizardStore();
      store.startCreate();
      store.reset();
      expect(store.mode).toBe('create');
    });

    it('sets isActive to false', () => {
      const store = useWizardStore();
      store.startCreate();
      store.reset();
      expect(store.isActive).toBe(false);
    });
  });
});
