import { describe, it, expect } from 'vitest';
import {
  getStepValidation,
  getBudgetValidation,
  type HeroValidationData,
} from './characterValidation';
import { STEP_CODES } from 'src/types/wizard';
import type {
  HeroSheet,
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
  level: 1,
  tier: { id: 1, code: 'test', name: 'Test' },
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
  attribute: { id: 1, code: 'test', name: 'Test' },
  value: 2,
  ...overrides,
});

const createSkill = (overrides: Partial<HeroSkill> = {}): HeroSkill => ({
  id: 1,
  heroId: 1,
  skill: { id: 1, code: 'test', name: 'Test' },
  rank: 1,
  modifier: 0,
  ...overrides,
});

const createExpertise = (overrides: Partial<HeroExpertise> = {}): HeroExpertise => ({
  id: 1,
  heroId: 1,
  expertise: { id: 1, code: 'test', name: 'Test' },
  expertiseType: { id: 1, code: 'general', name: 'General' },
  ...overrides,
});

const createTalent = (overrides: Partial<HeroTalent> = {}): HeroTalent => ({
  id: 1,
  heroId: 1,
  talent: { id: 1, code: 'test', name: 'Test' },
  special: [],
  ...overrides,
});

const createCulture = (overrides: Partial<HeroCulture> = {}): HeroCulture => ({
  id: 1,
  heroId: 1,
  culture: { id: 1, code: 'test', name: 'Test' },
  ...overrides,
});

const createHero = (overrides: Partial<HeroSheet> = {}): HeroSheet => ({
  id: 1,
  userId: 1,
  user: { id: 1, username: 'test' },
  campaignId: null,
  campaign: { id: 0, code: 'none', name: 'None' },
  ancestry: { id: 1, code: 'test', name: 'Test' },
  startingKit: { id: 1, code: 'test', name: 'Test' },
  activeSingerForm: null,
  radiantOrder: null,
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
  talentsModifier: 0,
  skillsModifier: 0,
  expertisesModifier: 0,
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
  // Ancestry (merged into Basic Setup)
  // ---------------------------------------------------------------------------
  describe('BASIC_SETUP ancestry validation', () => {
    it('fails with null ancestry', () => {
      const data = createValidationData({
        hero: createHero({
          name: 'Test',
          level: 1,
          ancestry: null as unknown as { id: number; code: string; name: string },
        }),
      });
      const result = getStepValidation(STEP_CODES.BASIC_SETUP, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ancestry is required');
    });

    it('validates with selected ancestry', () => {
      const data = createValidationData({
        hero: createHero({
          name: 'Test',
          level: 1,
          ancestry: { id: 1, code: 'test', name: 'Test' },
        }),
      });
      const result = getStepValidation(STEP_CODES.BASIC_SETUP, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Culture Step
  // ---------------------------------------------------------------------------
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
  // Attributes Step (Budget-based, soft warnings)
  // ---------------------------------------------------------------------------
  describe('ATTRIBUTES step', () => {
    it('validates when budget is exactly spent', () => {
      const attributes = [
        createAttribute({ attribute: { id: 1, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ attribute: { id: 2, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ attribute: { id: 3, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ attribute: { id: 4, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ attribute: { id: 5, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ attribute: { id: 6, code: 'test', name: 'Test' }, value: 2 }),
      ]; // Total: 12
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getStepValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('warns when budget is exceeded (soft validation)', () => {
      const attributes = [
        createAttribute({ attribute: { id: 1, code: 'test', name: 'Test' }, value: 5 }),
        createAttribute({ attribute: { id: 2, code: 'test', name: 'Test' }, value: 5 }),
        createAttribute({ attribute: { id: 3, code: 'test', name: 'Test' }, value: 5 }),
      ]; // Total: 15
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getStepValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Attribute points exceeded');
    });

    it('warns when budget is not fully spent', () => {
      const attributes = [
        createAttribute({ attribute: { id: 1, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ attribute: { id: 2, code: 'test', name: 'Test' }, value: 2 }),
      ]; // Total: 4
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getStepValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('8 attribute points remaining');
    });

    it('fails with attribute value above 5 (DB constraint)', () => {
      const attributes = [
        createAttribute({ attribute: { id: 1, code: 'test', name: 'Test' }, value: 6 }),
      ];
      const data = createValidationData({
        hero: createHero({ attributes }),
        levelData: createLevel({ attributePoints: 12 }),
      });
      const result = getStepValidation(STEP_CODES.ATTRIBUTES, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Attribute values must be between 0 and 5');
    });

    it('fails with negative attribute value (DB constraint)', () => {
      const attributes = [
        createAttribute({ attribute: { id: 1, code: 'test', name: 'Test' }, value: -1 }),
      ];
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
  // Skills Step (Budget-based, soft warnings)
  // ---------------------------------------------------------------------------
  describe('SKILLS step', () => {
    it('validates when skill budget is exactly spent', () => {
      const skills = [
        createSkill({ skill: { id: 1, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 2, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 3, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 4, code: 'test', name: 'Test' }, rank: 2 }),
      ]; // Total: 8
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
      });
      const result = getStepValidation(STEP_CODES.SKILLS, data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('warns when skill budget is exceeded (soft validation)', () => {
      const skills = [
        createSkill({ skill: { id: 1, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 2, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 3, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 4, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 5, code: 'test', name: 'Test' }, rank: 2 }),
      ]; // Total: 10
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
      });
      const result = getStepValidation(STEP_CODES.SKILLS, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Skill ranks exceeded');
    });

    it('warns when skill rank exceeds maximum (soft validation)', () => {
      const skills = [createSkill({ skill: { id: 1, code: 'test', name: 'Test' }, rank: 3 })]; // Max is 2
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
      });
      const result = getStepValidation(STEP_CODES.SKILLS, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Skill rank exceeds maximum of 2');
    });

    it('warns when skill budget is not fully spent', () => {
      const skills = [createSkill({ skill: { id: 1, code: 'test', name: 'Test' }, rank: 2 })]; // Total: 2
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
      });
      const result = getStepValidation(STEP_CODES.SKILLS, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('6 skill ranks remaining');
    });

    it('applies skillsModifier to budget', () => {
      const skills = [
        createSkill({ skill: { id: 1, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 2, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 3, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 4, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ skill: { id: 5, code: 'test', name: 'Test' }, rank: 2 }),
      ]; // Total: 10, Budget: 8 + 3 = 11
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8, maxSkillRank: 2 }),
        skillsModifier: 3,
      });
      const result = getStepValidation(STEP_CODES.SKILLS, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).not.toContain('Skill ranks exceeded');
      expect(result.warnings).toContain('1 skill ranks remaining');
    });
  });

  // ---------------------------------------------------------------------------
  // Expertises Step (Budget: base + intellect, soft warnings)
  // ---------------------------------------------------------------------------
  describe('EXPERTISES step', () => {
    it('validates within budget (base 2 + intellect)', () => {
      const expertises = [
        createExpertise({ expertise: { id: 1, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 2, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 3, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 4, code: 'test', name: 'Test' } }),
      ]; // Total: 4, Budget: 2 + 2 = 4
      const data = createValidationData({
        hero: createHero({ expertises }),
        intellectValue: 2,
      });
      const result = getStepValidation(STEP_CODES.EXPERTISES, data);

      expect(result.isValid).toBe(true);
    });

    it('warns when expertise slots exceeded (soft validation)', () => {
      const expertises = [
        createExpertise({ expertise: { id: 1, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 2, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 3, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 4, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 5, code: 'test', name: 'Test' } }),
      ]; // Total: 5, Budget: 2 + 2 = 4
      const data = createValidationData({
        hero: createHero({ expertises }),
        intellectValue: 2,
      });
      const result = getStepValidation(STEP_CODES.EXPERTISES, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Expertise slots exceeded');
    });

    it('excludes starting_kit expertises from count', () => {
      const expertises = [
        createExpertise({ expertise: { id: 1, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 2, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 3, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 4, code: 'test', name: 'Test' } }),
        createExpertise({
          expertise: { id: 5, code: 'test', name: 'Test' },
          source: { sourceType: 'starting_kit' },
        }),
        createExpertise({
          expertise: { id: 6, code: 'test', name: 'Test' },
          source: { sourceType: 'starting_kit' },
        }),
      ]; // Non-kit: 4, Budget: 2 + 2 = 4
      const data = createValidationData({
        hero: createHero({ expertises }),
        intellectValue: 2,
      });
      const result = getStepValidation(STEP_CODES.EXPERTISES, data);

      expect(result.isValid).toBe(true);
    });

    it('applies expertisesModifier to budget', () => {
      const expertises = [
        createExpertise({ expertise: { id: 1, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 2, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 3, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 4, code: 'test', name: 'Test' } }),
        createExpertise({ expertise: { id: 5, code: 'test', name: 'Test' } }),
      ]; // Total: 5, Budget: 2 + 2 + 2 = 6
      const data = createValidationData({
        hero: createHero({ expertises }),
        intellectValue: 2,
        expertisesModifier: 2,
      });
      const result = getStepValidation(STEP_CODES.EXPERTISES, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).not.toContain('Expertise slots exceeded');
    });
  });

  // ---------------------------------------------------------------------------
  // Paths Step (Talent slots, soft warnings)
  // ---------------------------------------------------------------------------
  describe('PATHS step', () => {
    it('validates with talents within budget', () => {
      const talents = [
        createTalent({ talent: { id: 1, code: 'test', name: 'Test' } }),
        createTalent({ talent: { id: 2, code: 'test', name: 'Test' } }),
      ];
      const data = createValidationData({
        hero: createHero({ talents }),
        levelData: createLevel({ talentSlots: 3 }),
      });
      const result = getStepValidation(STEP_CODES.PATHS, data);

      expect(result.isValid).toBe(true);
    });

    it('warns with no talents (soft validation)', () => {
      const data = createValidationData({
        hero: createHero({ talents: [] }),
        levelData: createLevel({ talentSlots: 3 }),
      });
      const result = getStepValidation(STEP_CODES.PATHS, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No talents selected');
    });

    it('warns when talent slots exceeded (soft validation)', () => {
      const talents = [
        createTalent({ talent: { id: 1, code: 'test', name: 'Test' } }),
        createTalent({ talent: { id: 2, code: 'test', name: 'Test' } }),
        createTalent({ talent: { id: 3, code: 'test', name: 'Test' } }),
        createTalent({ talent: { id: 4, code: 'test', name: 'Test' } }),
      ];
      const data = createValidationData({
        hero: createHero({ talents }),
        levelData: createLevel({ talentSlots: 3 }),
      });
      const result = getStepValidation(STEP_CODES.PATHS, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Talent slots exceeded');
    });

    it('applies talentsModifier to budget', () => {
      const talents = [
        createTalent({ talent: { id: 1, code: 'test', name: 'Test' } }),
        createTalent({ talent: { id: 2, code: 'test', name: 'Test' } }),
        createTalent({ talent: { id: 3, code: 'test', name: 'Test' } }),
        createTalent({ talent: { id: 4, code: 'test', name: 'Test' } }),
      ]; // Total: 4, Budget: 3 + 2 = 5
      const data = createValidationData({
        hero: createHero({ talents }),
        levelData: createLevel({ talentSlots: 3 }),
        talentsModifier: 2,
      });
      const result = getStepValidation(STEP_CODES.PATHS, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings).not.toContain('Talent slots exceeded');
    });
  });

  // ---------------------------------------------------------------------------
  // Starting Kit & Optional Steps
  // ---------------------------------------------------------------------------
  describe('STARTING_KIT step', () => {
    it('validates with selected starting kit', () => {
      const data = createValidationData({
        hero: createHero({ startingKit: { id: 1, code: 'test', name: 'Test' } }),
      });
      const result = getStepValidation(STEP_CODES.STARTING_KIT, data);

      expect(result.isValid).toBe(true);
    });

    it('fails with no starting kit', () => {
      const data = createValidationData({
        hero: createHero({ startingKit: null }),
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
        createAttribute({ id: 1, attribute: { id: 1, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ id: 2, attribute: { id: 2, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ id: 3, attribute: { id: 3, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ id: 4, attribute: { id: 4, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ id: 5, attribute: { id: 5, code: 'test', name: 'Test' }, value: 2 }),
        createAttribute({ id: 6, attribute: { id: 6, code: 'test', name: 'Test' }, value: 2 }),
      ]; // Total: 12

      // Create skills that sum to exactly the budget (8 ranks)
      const skills = [
        createSkill({ id: 1, skill: { id: 1, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ id: 2, skill: { id: 2, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ id: 3, skill: { id: 3, code: 'test', name: 'Test' }, rank: 2 }),
        createSkill({ id: 4, skill: { id: 4, code: 'test', name: 'Test' }, rank: 2 }),
      ]; // Total: 8

      const data = createValidationData({
        hero: createHero({
          name: 'Test Hero',
          level: 1,
          ancestry: { id: 1, code: 'test', name: 'Test' },
          cultures: [createCulture()],
          attributes,
          skills,
          expertises: [createExpertise()],
          talents: [createTalent()],
          startingKit: { id: 1, code: 'test', name: 'Test' },
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
          ancestry: null as unknown as { id: number; code: string; name: string },
          cultures: [],
          talents: [],
          startingKit: null,
        }),
      });
      const result = getStepValidation(STEP_CODES.REVIEW, data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Level must be between 1 and 20');
      expect(result.errors).toContain('Ancestry is required');
      expect(result.errors).toContain('At least one culture is required');
      expect(result.errors).toContain('Starting kit is required');
    });

    it('collects warnings from all required steps', () => {
      const data = createValidationData({
        hero: createHero({
          name: 'Test',
          level: 1,
          ancestry: { id: 1, code: 'test', name: 'Test' },
          cultures: [createCulture()],
          attributes: [], // 0 spent, 12 budget => warning
          skills: [], // 0 spent, 8 budget => warning
          expertises: [],
          talents: [], // no talents => warning
          startingKit: { id: 1, code: 'test', name: 'Test' },
        }),
        levelData: createLevel({
          attributePoints: 12,
          skillRanks: 8,
          talentSlots: 3,
        }),
      });
      const result = getStepValidation(STEP_CODES.REVIEW, data);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('12 attribute points remaining');
      expect(result.warnings).toContain('8 skill ranks remaining');
      expect(result.warnings).toContain('No talents selected');
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

    it('includes skillsModifier in budget', () => {
      const skills = [createSkill({ rank: 2 })];
      const data = createValidationData({
        hero: createHero({ skills }),
        levelData: createLevel({ skillRanks: 8 }),
        skillsModifier: 3,
      });
      const result = getBudgetValidation(STEP_CODES.SKILLS, data);

      expect(result.budget).toBe(11);
      expect(result.spent).toBe(2);
      expect(result.remaining).toBe(9);
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

    it('includes expertisesModifier in budget', () => {
      const expertises = [createExpertise()];
      const data = createValidationData({
        hero: createHero({ expertises }),
        intellectValue: 2, // Budget: 2 + 2 + 1 = 5
        expertisesModifier: 1,
      });
      const result = getBudgetValidation(STEP_CODES.EXPERTISES, data);

      expect(result.budget).toBe(5);
      expect(result.spent).toBe(1);
      expect(result.remaining).toBe(4);
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

    it('includes talentsModifier in budget', () => {
      const talents = [createTalent()];
      const data = createValidationData({
        hero: createHero({ talents }),
        levelData: createLevel({ talentSlots: 3 }),
        talentsModifier: 2,
      });
      const result = getBudgetValidation(STEP_CODES.PATHS, data);

      expect(result.budget).toBe(5);
      expect(result.spent).toBe(1);
      expect(result.remaining).toBe(4);
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

    it('handles negative modifiers', () => {
      const data = createValidationData({
        levelData: createLevel({ skillRanks: 8 }),
        skillsModifier: -3,
      });
      const result = getBudgetValidation(STEP_CODES.SKILLS, data);

      expect(result.budget).toBe(5);
    });
  });
});
