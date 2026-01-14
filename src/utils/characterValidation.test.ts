import { describe, it, expect } from 'vitest';
import {
  getStepValidation,
  getBudgetValidation,
  type HeroValidationData,
} from './characterValidation';
import { STEP_CODES } from 'src/types/wizard';
import type {
  Hero,
  Level,
  HeroAttribute,
  HeroSkill,
  HeroExpertise,
  HeroTalent,
  HeroCulture,
} from 'src/types';

// =============================================================================
// Test Fixtures
// =============================================================================

const createLevel = (overrides: Partial<Level> = {}): Level => ({
  id: 1,
  code: 'level_1',
  name: 'Level 1',
  level: 1,
  tierId: 1,
  attributePoints: 12,
  healthBase: 10,
  maxSkillRank: 2,
  skillRanks: 8,
  talentSlots: 3,
  ...overrides,
});

const createAttribute = (overrides: Partial<HeroAttribute> = {}): HeroAttribute => ({
  id: 1,
  heroId: 1,
  attrId: 1,
  value: 2,
  ...overrides,
});

const createSkill = (overrides: Partial<HeroSkill> = {}): HeroSkill => ({
  id: 1,
  heroId: 1,
  skillId: 1,
  rank: 1,
  modifier: 0,
  ...overrides,
});

const createExpertise = (overrides: Partial<HeroExpertise> = {}): HeroExpertise => ({
  id: 1,
  heroId: 1,
  expertiseId: 1,
  ...overrides,
});

const createTalent = (overrides: Partial<HeroTalent> = {}): HeroTalent => ({
  id: 1,
  heroId: 1,
  talentId: 1,
  ...overrides,
});

const createCulture = (overrides: Partial<HeroCulture> = {}): HeroCulture => ({
  id: 1,
  heroId: 1,
  cultureId: 1,
  ...overrides,
});

const createHero = (overrides: Partial<Hero> = {}): Hero => ({
  id: 1,
  userId: 1,
  campaignId: null,
  ancestryId: 1,
  startingKitId: 1,
  activeSingerFormId: null,
  radiantOrderId: null,
  radiantIdeal: 0,
  name: 'Test Hero',
  level: 1,
  currentHealth: 10,
  currentFocus: 2,
  currentInvestiture: 0,
  currency: 100,
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
});

const createValidationData = (overrides: Partial<HeroValidationData> = {}): HeroValidationData => ({
  hero: createHero(),
  levelData: createLevel(),
  intellectValue: 2,
  ...overrides,
});

// =============================================================================
// getStepValidation - Wizard Step Validation
// =============================================================================

describe('getStepValidation', () => {
  // ---------------------------------------------------------------------------
  // Basic Setup Step
  // ---------------------------------------------------------------------------
  describe('BASIC_SETUP step', () => {
    it('validates with valid name and level', () => {
      const data = createValidationData({
        hero: createHero({ name: 'Valid Name', level: 5 }),
      });
      const result = getStepValidation(STEP_CODES.BASIC_SETUP, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails with empty name', () => {
      const data = createValidationData({
        hero: createHero({ name: '', level: 1 }),
      });
      const result = getStepValidation(STEP_CODES.BASIC_SETUP, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    it('fails with whitespace-only name', () => {
      const data = createValidationData({
        hero: createHero({ name: '   ', level: 1 }),
      });
      const result = getStepValidation(STEP_CODES.BASIC_SETUP, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    it('fails with level 0', () => {
      const data = createValidationData({
        hero: createHero({ name: 'Test', level: 0 }),
      });
      const result = getStepValidation(STEP_CODES.BASIC_SETUP, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Level must be between 1 and 20');
    });

    it('fails with level above 20', () => {
      const data = createValidationData({
        hero: createHero({ name: 'Test', level: 21 }),
      });
      const result = getStepValidation(STEP_CODES.BASIC_SETUP, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Level must be between 1 and 20');
    });
  });

  // ---------------------------------------------------------------------------
  // Ancestry & Culture Steps
  // ---------------------------------------------------------------------------
  describe('ANCESTRY step', () => {
    it('validates with selected ancestry', () => {
      const data = createValidationData({
        hero: createHero({ ancestryId: 1 }),
      });
      const result = getStepValidation(STEP_CODES.ANCESTRY, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails with null ancestry', () => {
      const data = createValidationData({
        hero: createHero({ ancestryId: null as unknown as number }),
      });
      const result = getStepValidation(STEP_CODES.ANCESTRY, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ancestry is required');
    });
  });

  describe('CULTURE step', () => {
    it('validates with at least one culture', () => {
      const data = createValidationData({
        hero: createHero({ cultures: [createCulture()] }),
      });
      const result = getStepValidation(STEP_CODES.CULTURE, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails with no cultures', () => {
      const data = createValidationData({
        hero: createHero({ cultures: [] }),
      });
      const result = getStepValidation(STEP_CODES.CULTURE, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one culture is required');
    });
  });

  // ---------------------------------------------------------------------------
  // Attributes Step (Budget-based)
  // ---------------------------------------------------------------------------
  describe('ATTRIBUTES step', () => {
    it('validates when budget is exactly spent', () => {
      const attributes = [
        createAttribute({ attrId: 1, value: 2 }),
        createAttribute({ attrId: 2, value: 2 }),
        createAttribute({ attrId: 3, value: 2 }),
        createAttribute({ attrId: 4, value: 2 }),
        createAttribute({ attrId: 5, value: 2 }),
        createAttribute({ attrId: 6, value: 2 }),
      ]; // Total: 12
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getStepValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when budget is exceeded', () => {
      const attributes = [
        createAttribute({ attrId: 1, value: 5 }),
        createAttribute({ attrId: 2, value: 5 }),
        createAttribute({ attrId: 3, value: 5 }),
      ]; // Total: 15
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getStepValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Attribute points exceeded');
    });

    it('warns when budget is not fully spent', () => {
      const attributes = [
        createAttribute({ attrId: 1, value: 2 }),
        createAttribute({ attrId: 2, value: 2 }),
      ]; // Total: 4
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getStepValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('8 attribute points remaining');
    });

    it('fails with attribute value above 5', () => {
      const attributes = [createAttribute({ attrId: 1, value: 6 })];
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getStepValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Attribute values must be between 0 and 5');
    });

    it('fails with negative attribute value', () => {
      const attributes = [createAttribute({ attrId: 1, value: -1 })];
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getStepValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Attribute values must be between 0 and 5');
    });
  });

  // ---------------------------------------------------------------------------
  // Skills Step (Budget-based)
  // ---------------------------------------------------------------------------
  describe('SKILLS step', () => {
    it('validates when skill budget is exactly spent', () => {
      const skills = [
        createSkill({ skillId: 1, rank: 2 }),
        createSkill({ skillId: 2, rank: 2 }),
        createSkill({ skillId: 3, rank: 2 }),
        createSkill({ skillId: 4, rank: 2 }),
      ]; // Total: 8
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
      });
      const result = getStepValidation(STEP_CODES.SKILLS, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when skill budget is exceeded', () => {
      const skills = [
        createSkill({ skillId: 1, rank: 2 }),
        createSkill({ skillId: 2, rank: 2 }),
        createSkill({ skillId: 3, rank: 2 }),
        createSkill({ skillId: 4, rank: 2 }),
        createSkill({ skillId: 5, rank: 2 }),
      ]; // Total: 10
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
      });
      const result = getStepValidation(STEP_CODES.SKILLS, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Skill ranks exceeded');
    });

    it('fails when skill rank exceeds maximum', () => {
      const skills = [createSkill({ skillId: 1, rank: 3 })]; // Max is 2
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
      });
      const result = getStepValidation(STEP_CODES.SKILLS, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Skill rank exceeds maximum of 2');
    });

    it('warns when skill budget is not fully spent', () => {
      const skills = [createSkill({ skillId: 1, rank: 2 })]; // Total: 2
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
      });
      const result = getStepValidation(STEP_CODES.SKILLS, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('6 skill ranks remaining');
    });
  });

  // ---------------------------------------------------------------------------
  // Expertises Step (Budget: base + intellect)
  // ---------------------------------------------------------------------------
  describe('EXPERTISES step', () => {
    it('validates within budget (base 2 + intellect)', () => {
      const expertises = [
        createExpertise({ expertiseId: 1 }),
        createExpertise({ expertiseId: 2 }),
        createExpertise({ expertiseId: 3 }),
        createExpertise({ expertiseId: 4 }),
      ]; // Total: 4, Budget: 2 + 2 = 4
      const data = createValidationData({
        hero: createHero({ expertises }),
        intellectValue: 2,
      });
      const result = getStepValidation(STEP_CODES.EXPERTISES, data);

      expect(result.isValid).toBe(true);
    });

    it('fails when expertise slots exceeded', () => {
      const expertises = [
        createExpertise({ expertiseId: 1 }),
        createExpertise({ expertiseId: 2 }),
        createExpertise({ expertiseId: 3 }),
        createExpertise({ expertiseId: 4 }),
        createExpertise({ expertiseId: 5 }),
      ]; // Total: 5, Budget: 2 + 2 = 4
      const data = createValidationData({
        hero: createHero({ expertises }),
        intellectValue: 2,
      });
      const result = getStepValidation(STEP_CODES.EXPERTISES, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expertise slots exceeded');
    });

    it('excludes starting_kit expertises from count', () => {
      const expertises = [
        createExpertise({ expertiseId: 1 }),
        createExpertise({ expertiseId: 2 }),
        createExpertise({ expertiseId: 3 }),
        createExpertise({ expertiseId: 4 }),
        createExpertise({ expertiseId: 5, source: { sourceType: 'starting_kit' } }),
        createExpertise({ expertiseId: 6, source: { sourceType: 'starting_kit' } }),
      ]; // Non-kit: 4, Budget: 2 + 2 = 4
      const data = createValidationData({
        hero: createHero({ expertises }),
        intellectValue: 2,
      });
      const result = getStepValidation(STEP_CODES.EXPERTISES, data);

      expect(result.isValid).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Paths Step (Talent slots)
  // ---------------------------------------------------------------------------
  describe('PATHS step', () => {
    it('validates with talents within budget', () => {
      const talents = [createTalent({ talentId: 1 }), createTalent({ talentId: 2 })];
      const data = createValidationData({
        hero: createHero({ talents }),
        levelData: createLevel({ talentSlots: 3 }),
      });
      const result = getStepValidation(STEP_CODES.PATHS, data);

      expect(result.isValid).toBe(true);
    });

    it('fails with no talents', () => {
      const data = createValidationData({
        hero: createHero({ talents: [] }),
        levelData: createLevel({ talentSlots: 3 }),
      });
      const result = getStepValidation(STEP_CODES.PATHS, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one talent is required');
    });

    it('fails when talent slots exceeded', () => {
      const talents = [
        createTalent({ talentId: 1 }),
        createTalent({ talentId: 2 }),
        createTalent({ talentId: 3 }),
        createTalent({ talentId: 4 }),
      ];
      const data = createValidationData({
        hero: createHero({ talents }),
        levelData: createLevel({ talentSlots: 3 }),
      });
      const result = getStepValidation(STEP_CODES.PATHS, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Talent slots exceeded (4/3)');
    });
  });

  // ---------------------------------------------------------------------------
  // Starting Kit & Optional Steps
  // ---------------------------------------------------------------------------
  describe('STARTING_KIT step', () => {
    it('validates with selected starting kit', () => {
      const data = createValidationData({
        hero: createHero({ startingKitId: 1 }),
      });
      const result = getStepValidation(STEP_CODES.STARTING_KIT, data);

      expect(result.isValid).toBe(true);
    });

    it('fails with no starting kit', () => {
      const data = createValidationData({
        hero: createHero({ startingKitId: null }),
      });
      const result = getStepValidation(STEP_CODES.STARTING_KIT, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Starting kit is required');
    });
  });

  describe('optional steps', () => {
    it('EQUIPMENT is always valid', () => {
      const data = createValidationData();
      const result = getStepValidation(STEP_CODES.EQUIPMENT, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('PERSONAL_DETAILS is always valid', () => {
      const data = createValidationData();
      const result = getStepValidation(STEP_CODES.PERSONAL_DETAILS, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Review Step (Aggregates all validations)
  // ---------------------------------------------------------------------------
  describe('REVIEW step', () => {
    it('validates when all required steps are valid', () => {
      // Create attributes that sum to exactly the budget (12 points)
      const attributes = [
        createAttribute({ id: 1, attrId: 1, value: 2 }),
        createAttribute({ id: 2, attrId: 2, value: 2 }),
        createAttribute({ id: 3, attrId: 3, value: 2 }),
        createAttribute({ id: 4, attrId: 4, value: 2 }),
        createAttribute({ id: 5, attrId: 5, value: 2 }),
        createAttribute({ id: 6, attrId: 6, value: 2 }),
      ]; // Total: 12

      // Create skills that sum to exactly the budget (8 ranks)
      const skills = [
        createSkill({ id: 1, skillId: 1, rank: 2 }),
        createSkill({ id: 2, skillId: 2, rank: 2 }),
        createSkill({ id: 3, skillId: 3, rank: 2 }),
        createSkill({ id: 4, skillId: 4, rank: 2 }),
      ]; // Total: 8

      const data = createValidationData({
        hero: createHero({
          name: 'Test Hero',
          level: 1,
          ancestryId: 1,
          cultures: [createCulture()],
          attributes,
          skills,
          expertises: [createExpertise()],
          talents: [createTalent()],
          startingKitId: 1,
        }),
        levelData: createLevel({
          attributePoints: 12,
          skillRanks: 8,
          maxSkillRank: 2,
          talentSlots: 3,
        }),
        intellectValue: 2,
      });
      const result = getStepValidation(STEP_CODES.REVIEW, data);

      expect(result.isValid).toBe(true);
    });

    it('collects errors from all required steps', () => {
      const data = createValidationData({
        hero: createHero({
          name: '',
          level: 0,
          ancestryId: null as unknown as number,
          cultures: [],
          talents: [],
          startingKitId: null,
        }),
      });
      const result = getStepValidation(STEP_CODES.REVIEW, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Level must be between 1 and 20');
      expect(result.errors).toContain('Ancestry is required');
      expect(result.errors).toContain('At least one culture is required');
      expect(result.errors).toContain('At least one talent is required');
      expect(result.errors).toContain('Starting kit is required');
    });
  });
});

// =============================================================================
// getBudgetValidation - Budget Tracking
// =============================================================================

describe('getBudgetValidation', () => {
  // ---------------------------------------------------------------------------
  // Budget-based Steps
  // ---------------------------------------------------------------------------
  describe('ATTRIBUTES budget', () => {
    it('returns correct budget info', () => {
      const attributes = [createAttribute({ value: 3 }), createAttribute({ value: 2 })]; // Total: 5
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getBudgetValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.budget).toBe(12);
      expect(result.spent).toBe(5);
      expect(result.remaining).toBe(7);
    });
  });

  describe('SKILLS budget', () => {
    it('returns correct budget info with maxRank', () => {
      const skills = [createSkill({ rank: 2 }), createSkill({ rank: 1 })]; // Total: 3
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
      });
      const result = getBudgetValidation(STEP_CODES.SKILLS, data);

      expect(result.budget).toBe(8);
      expect(result.spent).toBe(3);
      expect(result.remaining).toBe(5);
      expect(result.maxRank).toBe(2);
    });
  });

  describe('EXPERTISES budget', () => {
    it('returns budget based on intellect + base slots', () => {
      const expertises = [createExpertise(), createExpertise()]; // Total: 2
      const data = createValidationData({
        hero: createHero({ expertises }),
        intellectValue: 3, // Budget: 2 + 3 = 5
      });
      const result = getBudgetValidation(STEP_CODES.EXPERTISES, data);

      expect(result.budget).toBe(5);
      expect(result.spent).toBe(2);
      expect(result.remaining).toBe(3);
    });
  });

  describe('PATHS budget', () => {
    it('returns correct talent slot budget', () => {
      const talents = [createTalent()]; // Total: 1
      const data = createValidationData({
        hero: createHero({ talents }),
        levelData: createLevel({ talentSlots: 3 }),
      });
      const result = getBudgetValidation(STEP_CODES.PATHS, data);

      expect(result.budget).toBe(3);
      expect(result.spent).toBe(1);
      expect(result.remaining).toBe(2);
    });
  });

  // ---------------------------------------------------------------------------
  // Non-budget Steps & Edge Cases
  // ---------------------------------------------------------------------------
  describe('non-budget steps', () => {
    it('returns default budget for BASIC_SETUP', () => {
      const data = createValidationData();
      const result = getBudgetValidation(STEP_CODES.BASIC_SETUP, data);

      expect(result.budget).toBe(0);
      expect(result.spent).toBe(0);
      expect(result.remaining).toBe(0);
      expect(result.isValid).toBe(true);
    });

    it('returns default budget for ANCESTRY', () => {
      const data = createValidationData();
      const result = getBudgetValidation(STEP_CODES.ANCESTRY, data);

      expect(result.budget).toBe(0);
      expect(result.spent).toBe(0);
      expect(result.remaining).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles undefined levelData gracefully', () => {
      const data = createValidationData({
        levelData: undefined,
      });
      const result = getBudgetValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.budget).toBe(0);
      expect(result.remaining).toBe(0);
    });

    it('handles zero intellect for expertises', () => {
      const data = createValidationData({
        intellectValue: 0,
      });
      const result = getBudgetValidation(STEP_CODES.EXPERTISES, data);

      expect(result.budget).toBe(2); // Base slots only
    });
  });
});
