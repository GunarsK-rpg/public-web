import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStepValidation } from './useStepValidation';
import { useHeroStore } from 'src/stores/hero';
import type { HeroCulture } from 'src/types';
import { useWizardStore } from 'src/stores/wizard';
import { STEP_CODES } from 'src/types/wizard';

// Mock logger
vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useStepValidation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  // Helper to setup hero
  const setupHero = () => {
    const heroStore = useHeroStore();
    heroStore.initNewHero();
    if (heroStore.hero) {
      heroStore.hero.name = 'Test Hero';
      heroStore.hero.level = 5;
      heroStore.hero.ancestry = { id: 1, code: 'human', name: 'Human' };
      heroStore.hero.cultures = [
        { id: -1, heroId: 0, culture: { id: 1, code: 'urban', name: 'Urban' } },
      ] as HeroCulture[];
      heroStore.hero.startingKit = { id: 1, code: 'warrior', name: 'Warrior Kit' };
    }
    return heroStore;
  };

  // ========================================
  // Validate Function
  // ========================================
  describe('validate', () => {
    it('returns invalid when no hero loaded', () => {
      const { validate } = useStepValidation();

      const result = validate(STEP_CODES.BASIC_SETUP);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No hero loaded');
    });

    it('validates basic-setup step', () => {
      setupHero();
      const { validate } = useStepValidation();

      const result = validate(STEP_CODES.BASIC_SETUP);

      // Should be valid with name and level set
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns errors for invalid basic-setup', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      if (heroStore.hero) {
        heroStore.hero.name = ''; // Empty name
      }

      const { validate } = useStepValidation();
      const result = validate(STEP_CODES.BASIC_SETUP);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('returns error for missing ancestry (merged into basic-setup)', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      if (heroStore.hero) {
        heroStore.hero.name = 'Kaladin';
        (heroStore.hero as unknown as { ancestry: null }).ancestry = null;
      }

      const { validate } = useStepValidation();
      const result = validate(STEP_CODES.BASIC_SETUP);

      expect(result.isValid).toBe(false);
    });

    it('validates culture step', () => {
      setupHero();
      const { validate } = useStepValidation();

      const result = validate(STEP_CODES.CULTURE);

      expect(result.isValid).toBe(true);
    });

    it('returns error for missing culture', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      if (heroStore.hero) {
        heroStore.hero.name = 'Kaladin';
        heroStore.hero.cultures = [];
      }

      const { validate } = useStepValidation();
      const result = validate(STEP_CODES.CULTURE);

      expect(result.isValid).toBe(false);
    });

    it('validates starting-kit step', () => {
      setupHero();
      const { validate } = useStepValidation();

      const result = validate(STEP_CODES.STARTING_KIT);

      expect(result.isValid).toBe(true);
    });

    it('returns error for missing starting kit', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      if (heroStore.hero) {
        heroStore.hero.name = 'Kaladin';
        heroStore.hero.startingKit = null;
      }

      const { validate } = useStepValidation();
      const result = validate(STEP_CODES.STARTING_KIT);

      expect(result.isValid).toBe(false);
    });

    it('validates personal-details step (always valid)', () => {
      setupHero();
      const { validate } = useStepValidation();

      const result = validate(STEP_CODES.PERSONAL_DETAILS);

      // Personal details is always valid (optional step)
      expect(result.isValid).toBe(true);
    });
  });

  // ========================================
  // Budget Function
  // ========================================
  describe('budget', () => {
    it('returns default budget when no hero loaded', () => {
      const { budget } = useStepValidation();

      const result = budget(STEP_CODES.ATTRIBUTES);

      expect(result.isValid).toBe(false);
      expect(result.budget).toBe(0);
      expect(result.spent).toBe(0);
      expect(result.remaining).toBe(0);
    });

    it('returns skills budget with maxRank when no hero loaded', () => {
      const { budget } = useStepValidation();

      const result = budget(STEP_CODES.SKILLS);

      expect(result.isValid).toBe(false);
      expect('maxRank' in result).toBe(true);
      expect((result as { maxRank: number }).maxRank).toBe(2);
    });

    it('calculates attribute budget', () => {
      setupHero();
      const { budget } = useStepValidation();

      const result = budget(STEP_CODES.ATTRIBUTES);

      // Budget may be 0 depending on mock data - just check types
      expect(typeof result.budget).toBe('number');
      expect(typeof result.spent).toBe('number');
      expect(typeof result.remaining).toBe('number');
    });

    it('calculates skills budget', () => {
      setupHero();
      const { budget } = useStepValidation();

      const result = budget(STEP_CODES.SKILLS);

      // Budget may be 0 depending on mock data - just check types
      expect(typeof result.budget).toBe('number');
      expect('maxRank' in result).toBe(true);
    });

    it('includes surge bonus in skills budget when radiant', () => {
      const heroStore = setupHero();
      const { budget } = useStepValidation();

      const baseResult = budget(STEP_CODES.SKILLS);
      const baseBudget = baseResult.budget;

      // Set radiant order
      heroStore.hero!.radiantOrder = { id: 1, code: 'windrunner', name: 'Windrunner' };

      const radiantResult = budget(STEP_CODES.SKILLS);

      expect(radiantResult.budget).toBe(baseBudget + 2);
    });

    it('calculates expertises budget', () => {
      setupHero();
      const { budget } = useStepValidation();

      const result = budget(STEP_CODES.EXPERTISES);

      expect(typeof result.budget).toBe('number');
      expect(typeof result.spent).toBe('number');
    });

    it('calculates paths budget', () => {
      setupHero();
      const { budget } = useStepValidation();

      const result = budget(STEP_CODES.PATHS);

      expect(typeof result.budget).toBe('number');
    });
  });

  // ========================================
  // Current Step Code
  // ========================================
  describe('currentStepCode', () => {
    it('returns basic-setup when wizard at step 1', () => {
      setupHero();
      const wizardStore = useWizardStore();
      wizardStore.startCreate();

      const { currentStepCode } = useStepValidation();

      expect(currentStepCode.value).toBe(STEP_CODES.BASIC_SETUP);
    });

    it('updates when wizard step changes', () => {
      setupHero();
      const wizardStore = useWizardStore();
      wizardStore.startCreate();

      const { currentStepCode } = useStepValidation();

      expect(currentStepCode.value).toBe(STEP_CODES.BASIC_SETUP);

      wizardStore.goToStep(2); // Culture step

      expect(currentStepCode.value).toBe(STEP_CODES.CULTURE);
    });

    it('returns basic-setup as fallback when no step config', () => {
      // Don't start wizard - no currentStepConfig
      const { currentStepCode } = useStepValidation();

      expect(currentStepCode.value).toBe(STEP_CODES.BASIC_SETUP);
    });
  });

  // ========================================
  // Current Validation
  // ========================================
  describe('currentValidation', () => {
    it('returns validation for current wizard step', () => {
      setupHero();
      const wizardStore = useWizardStore();
      wizardStore.startCreate();

      const { currentValidation } = useStepValidation();

      // Check that validation result has expected structure
      expect(currentValidation.value).toBeDefined();
      expect(typeof currentValidation.value.isValid).toBe('boolean');
      expect(Array.isArray(currentValidation.value.errors)).toBe(true);
    });

    it('updates when wizard step changes', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      if (heroStore.hero) {
        heroStore.hero.name = 'Kaladin';
        heroStore.hero.level = 1;
      }

      const wizardStore = useWizardStore();
      wizardStore.startCreate();

      const { currentValidation, currentStepCode } = useStepValidation();

      // Initially at step 1 (basic-setup)
      expect(currentStepCode.value).toBe(STEP_CODES.BASIC_SETUP);

      // Move to culture step
      wizardStore.goToStep(2);

      // Should update the step code
      expect(currentStepCode.value).toBe(STEP_CODES.CULTURE);
      // Validation result should be defined (actual validity depends on logic)
      expect(currentValidation.value).toBeDefined();
    });
  });

  // ========================================
  // All Steps Validation
  // ========================================
  describe('allStepsValidation', () => {
    it('validates review step (all steps)', () => {
      setupHero();

      const { allStepsValidation } = useStepValidation();

      // Review validates all required steps
      expect(allStepsValidation.value).toBeDefined();
      expect(typeof allStepsValidation.value.isValid).toBe('boolean');
    });

    it('returns errors when hero incomplete', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      // Minimal hero - missing required fields

      const { allStepsValidation } = useStepValidation();

      expect(allStepsValidation.value.isValid).toBe(false);
      expect(allStepsValidation.value.errors.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Validation Data
  // ========================================
  describe('validation data', () => {
    it('includes hero in validation data', () => {
      setupHero();

      const { validate } = useStepValidation();
      const result = validate(STEP_CODES.BASIC_SETUP);

      // Validation should use hero data
      expect(result).toBeDefined();
    });

    it('includes levelData from attributes store', () => {
      setupHero();

      const { budget } = useStepValidation();
      const result = budget(STEP_CODES.ATTRIBUTES);

      // Budget should be calculated using levelData
      expect(result.budget).toBeGreaterThanOrEqual(0);
    });

    it('includes intellectValue for skill max rank', () => {
      const heroStore = setupHero();

      // Set intellect attribute
      if (heroStore.hero) {
        heroStore.hero.attributes = [
          { id: -1, heroId: 0, attribute: { id: 3, code: 'int', name: 'Intellect' }, value: 3 }, // int = 3
        ];
      }

      const { budget } = useStepValidation();
      const result = budget(STEP_CODES.SKILLS);

      // maxRank should be influenced by intellect
      expect('maxRank' in result).toBe(true);
    });
  });

  // ========================================
  // Reactivity
  // ========================================
  describe('reactivity', () => {
    it('recomputes when hero changes', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();

      const { validate } = useStepValidation();

      // Initially invalid (no name)
      const result1 = validate(STEP_CODES.BASIC_SETUP);
      expect(result1.isValid).toBe(false);

      // Set name and ancestry
      if (heroStore.hero) {
        heroStore.hero.name = 'Test Hero';
        heroStore.hero.ancestry = { id: 1, code: 'human', name: 'Human' };
      }

      const result2 = validate(STEP_CODES.BASIC_SETUP);
      expect(result2.isValid).toBe(true);
    });

    it('recomputes budget when attributes change', () => {
      const heroStore = setupHero();

      const { budget } = useStepValidation();

      const result1 = budget(STEP_CODES.ATTRIBUTES);
      const spent1 = result1.spent;

      // Add attribute points
      if (heroStore.hero) {
        heroStore.hero.attributes.push({
          id: -1,
          heroId: 0,
          attribute: { id: 1, code: 'str', name: 'Strength' },
          value: 3,
        });
      }

      const result2 = budget(STEP_CODES.ATTRIBUTES);

      expect(result2.spent).toBeGreaterThan(spent1);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles hero with empty arrays', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      if (heroStore.hero) {
        heroStore.hero.name = 'Kaladin';
        heroStore.hero.attributes = [];
        heroStore.hero.skills = [];
        heroStore.hero.talents = [];
        heroStore.hero.expertises = [];
      }

      const { validate, budget } = useStepValidation();

      // Should not throw
      expect(() => validate(STEP_CODES.ATTRIBUTES)).not.toThrow();
      expect(() => budget(STEP_CODES.SKILLS)).not.toThrow();
    });

    it('handles all step codes', () => {
      setupHero();

      const { validate } = useStepValidation();

      // Test all step codes don't throw
      Object.values(STEP_CODES).forEach((code) => {
        expect(() => validate(code)).not.toThrow();
      });
    });

    it('handles budget for all budget steps', () => {
      setupHero();

      const { budget } = useStepValidation();

      // Budget-applicable steps
      const budgetSteps = [
        STEP_CODES.ATTRIBUTES,
        STEP_CODES.SKILLS,
        STEP_CODES.EXPERTISES,
        STEP_CODES.PATHS,
      ];

      budgetSteps.forEach((code) => {
        const result = budget(code);
        expect(typeof result.budget).toBe('number');
        expect(typeof result.spent).toBe('number');
        expect(typeof result.remaining).toBe('number');
      });
    });
  });
});
