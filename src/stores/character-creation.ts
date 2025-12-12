import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  CharacterCreationState,
  BasicSetupData,
  AncestryData,
  CultureData,
  StartingKitData,
  StartingKitSelection,
  AttributeAllocation,
  ExpertiseAllocation,
  EquipmentData,
  EquipmentItem,
  PersonalDetailsData,
  GoalEntry,
  ConnectionEntry,
  PointBudgets,
  DerivedStatsPreview,
  StepValidation,
} from 'src/types';
import { DEFAULT_CHARACTER_CREATION_STATE, WIZARD_STEPS, STARTING_KITS } from 'src/types';
import {
  getMovement,
  getRecoveryDie,
  getLiftCapacity,
  getCarryCapacity,
  getSensesRange,
  getUnarmedDamage,
} from 'src/mock/derived-stats';
import { useClassifierStore } from './classifiers';

export const useCharacterCreationStore = defineStore('character-creation', () => {
  // ===================
  // STATE
  // ===================
  const state = ref<CharacterCreationState>({ ...DEFAULT_CHARACTER_CREATION_STATE });

  // ===================
  // GETTERS - Basic State
  // ===================
  const currentStep = computed(() => state.value.currentStep);
  const completedSteps = computed(() => state.value.completedSteps);
  const isDraft = computed(() => state.value.isDraft);

  const currentStepConfig = computed(() =>
    WIZARD_STEPS.find((s) => s.id === state.value.currentStep)
  );

  // ===================
  // GETTERS - Step Data
  // ===================
  const basicSetup = computed(() => state.value.basicSetup);
  const ancestry = computed(() => state.value.ancestry);
  const culture = computed(() => state.value.culture);
  const startingKit = computed(() => state.value.startingKit);
  const attributes = computed(() => state.value.attributes);
  const skills = computed(() => state.value.skills);
  const expertises = computed(() => state.value.expertises);
  const paths = computed(() => state.value.paths);
  const equipment = computed(() => state.value.equipment);
  const personalDetails = computed(() => state.value.personalDetails);

  // ===================
  // GETTERS - Point Budgets
  // ===================
  const pointBudgets = computed((): PointBudgets => {
    const level = state.value.basicSetup.level;

    // Attribute points: 12 at level 1, +2 per level after
    const attributePoints = 12 + Math.max(0, (level - 1) * 2);

    // Skill points: 8 base + 2 per level
    const skillPoints = 8 + level * 2;

    // Talent count: 1 key + 1 per 2 levels (simplified)
    const talentCount = 1 + Math.floor(level / 2);

    // Expertise slots: 2 cultural + INT score
    const intScore = state.value.attributes.allocation.intellect;
    const expertiseSlots = 2 + intScore;

    return {
      attributes: attributePoints,
      skills: skillPoints,
      talents: talentCount,
      expertises: expertiseSlots,
    };
  });

  const attributePointsSpent = computed(() => {
    const alloc = state.value.attributes.allocation;
    return (
      alloc.strength +
      alloc.speed +
      alloc.intellect +
      alloc.willpower +
      alloc.awareness +
      alloc.presence
    );
  });

  const attributePointsRemaining = computed(
    () => pointBudgets.value.attributes - attributePointsSpent.value
  );

  const skillPointsSpent = computed(() =>
    state.value.skills.allocations.reduce((sum, s) => sum + s.rank, 0)
  );

  const skillPointsRemaining = computed(() => pointBudgets.value.skills - skillPointsSpent.value);

  const expertiseSlotsUsed = computed(
    () => state.value.expertises.allocations.filter((e) => e.source !== 'starting_kit').length
  );

  const expertiseSlotsRemaining = computed(
    () => pointBudgets.value.expertises - expertiseSlotsUsed.value
  );

  // ===================
  // GETTERS - Derived Stats Preview
  // ===================
  const derivedStatsPreview = computed((): DerivedStatsPreview => {
    const level = state.value.basicSetup.level;
    const alloc = state.value.attributes.allocation;
    const hasRadiant = !!state.value.paths.radiantPath;

    const stats: DerivedStatsPreview = {
      maxHealth: 10 + alloc.strength + Math.floor(level / 2),
      maxFocus: 2 + alloc.willpower,
      physicalDefense: 10 + alloc.strength + alloc.speed,
      cognitiveDefense: 10 + alloc.intellect + alloc.willpower,
      spiritualDefense: 10 + alloc.awareness + alloc.presence,
      movement: getMovement(alloc.speed),
      recoveryDie: getRecoveryDie(alloc.willpower),
      liftCapacity: getLiftCapacity(alloc.strength),
      carryCapacity: getCarryCapacity(alloc.strength),
      sensesRange: getSensesRange(alloc.awareness),
      unarmedDamage: getUnarmedDamage(alloc.strength),
    };

    if (hasRadiant) {
      stats.maxInvestiture = 2 + Math.max(alloc.awareness, alloc.presence);
    }

    return stats;
  });

  // ===================
  // GETTERS - Singer-specific
  // ===================
  const isSinger = computed(() => state.value.ancestry.ancestryId === 2);

  // ===================
  // GETTERS - Radiant-specific
  // ===================
  const isRadiant = computed(() => !!state.value.paths.radiantPath);

  // ===================
  // ACTIONS - Navigation
  // ===================
  function goToStep(step: number) {
    if (step >= 1 && step <= WIZARD_STEPS.length) {
      state.value.currentStep = step;
    }
  }

  function nextStep() {
    if (state.value.currentStep < WIZARD_STEPS.length) {
      // Mark current step as completed if valid
      if (!state.value.completedSteps.includes(state.value.currentStep)) {
        state.value.completedSteps.push(state.value.currentStep);
      }
      state.value.currentStep++;
    }
  }

  function previousStep() {
    if (state.value.currentStep > 1) {
      state.value.currentStep--;
    }
  }

  // ===================
  // ACTIONS - Step Updates
  // ===================
  function updateBasicSetup(data: Partial<BasicSetupData>) {
    state.value.basicSetup = { ...state.value.basicSetup, ...data };
  }

  function updateAncestry(data: Partial<AncestryData>) {
    state.value.ancestry = { ...state.value.ancestry, ...data };
    // Reset singer form if switching to human
    if (data.ancestryId === 1) {
      delete state.value.ancestry.singerFormId;
    }
  }

  function updateCulture(data: Partial<CultureData>) {
    state.value.culture = { ...state.value.culture, ...data };
    // Auto-apply cultural expertises when cultures change
    if (data.primaryCultureId !== undefined || data.secondaryCultureId !== undefined) {
      applyCulturalExpertises();
    }
  }

  function clearSecondaryCulture() {
    delete state.value.culture.secondaryCultureId;
    applyCulturalExpertises();
  }

  function applyCulturalExpertises() {
    const classifiers = useClassifierStore();

    // Clear previous cultural expertises
    state.value.expertises.allocations = state.value.expertises.allocations.filter(
      (e) => e.source !== 'culture'
    );

    // Apply expertise for primary culture
    if (state.value.culture.primaryCultureId) {
      const primaryCulture = classifiers.cultures.find(
        (c) => c.id === state.value.culture.primaryCultureId
      );
      if (primaryCulture) {
        // Cultural expertises have the same name as cultures (category 2)
        const expertise = classifiers.expertises.find(
          (e) => e.categoryId === 2 && e.name === primaryCulture.name
        );
        if (expertise) {
          addExpertise(expertise.id, 'culture');
        }
      }
    }

    // Apply expertise for secondary culture
    if (state.value.culture.secondaryCultureId) {
      const secondaryCulture = classifiers.cultures.find(
        (c) => c.id === state.value.culture.secondaryCultureId
      );
      if (secondaryCulture) {
        const expertise = classifiers.expertises.find(
          (e) => e.categoryId === 2 && e.name === secondaryCulture.name
        );
        if (expertise) {
          addExpertise(expertise.id, 'culture');
        }
      }
    }
  }

  function updateStartingKit(data: Partial<StartingKitData>) {
    state.value.startingKit = { ...state.value.startingKit, ...data };
    // Apply starting kit bonuses when selected
    if (data.startingKitId) {
      applyStartingKitBonuses(data.startingKitId);
    }
  }

  function updateAttributes(allocation: Partial<AttributeAllocation>) {
    state.value.attributes.allocation = {
      ...state.value.attributes.allocation,
      ...allocation,
    };
  }

  function setSkillRank(skillId: number, rank: number) {
    const existing = state.value.skills.allocations.find((s) => s.skillId === skillId);
    if (existing) {
      existing.rank = rank;
    } else {
      state.value.skills.allocations.push({ skillId, rank });
    }
  }

  function addExpertise(expertiseId: number, source: ExpertiseAllocation['source']) {
    if (!state.value.expertises.allocations.find((e) => e.expertiseId === expertiseId)) {
      state.value.expertises.allocations.push({ expertiseId, source });
    }
  }

  function removeExpertise(expertiseId: number) {
    state.value.expertises.allocations = state.value.expertises.allocations.filter(
      (e) => e.expertiseId !== expertiseId
    );
  }

  function addPath(pathId: number) {
    if (!state.value.paths.paths.find((p) => p.pathId === pathId)) {
      state.value.paths.paths.push({ pathId, talentIds: [] });
    }
  }

  function removePath(pathId: number) {
    state.value.paths.paths = state.value.paths.paths.filter((p) => p.pathId !== pathId);
  }

  function setPathSpecialty(pathId: number, specialtyId: number) {
    const path = state.value.paths.paths.find((p) => p.pathId === pathId);
    if (path) {
      path.specialtyId = specialtyId;
    }
  }

  function addTalentToPath(pathId: number, talentId: number) {
    const path = state.value.paths.paths.find((p) => p.pathId === pathId);
    if (path && !path.talentIds.includes(talentId)) {
      path.talentIds.push(talentId);
    }
  }

  function removeTalentFromPath(pathId: number, talentId: number) {
    const path = state.value.paths.paths.find((p) => p.pathId === pathId);
    if (path) {
      path.talentIds = path.talentIds.filter((id) => id !== talentId);
    }
  }

  function setRadiantPath(orderId: number, idealLevel: number = 0) {
    state.value.paths.radiantPath = {
      orderId,
      idealLevel,
      talentIds: [],
    };
  }

  function removeRadiantPath() {
    delete state.value.paths.radiantPath;
  }

  function addRadiantTalent(talentId: number) {
    if (
      state.value.paths.radiantPath &&
      !state.value.paths.radiantPath.talentIds.includes(talentId)
    ) {
      state.value.paths.radiantPath.talentIds.push(talentId);
    }
  }

  function removeRadiantTalent(talentId: number) {
    if (state.value.paths.radiantPath) {
      state.value.paths.radiantPath.talentIds = state.value.paths.radiantPath.talentIds.filter(
        (id) => id !== talentId
      );
    }
  }

  function addAncestryTalent(talentId: number) {
    if (!state.value.paths.ancestryTalentIds) {
      state.value.paths.ancestryTalentIds = [];
    }
    if (!state.value.paths.ancestryTalentIds.includes(talentId)) {
      state.value.paths.ancestryTalentIds.push(talentId);
    }
  }

  function removeAncestryTalent(talentId: number) {
    if (state.value.paths.ancestryTalentIds) {
      state.value.paths.ancestryTalentIds = state.value.paths.ancestryTalentIds.filter(
        (id) => id !== talentId
      );
    }
  }

  function setStartingKit(kit: StartingKitSelection) {
    state.value.equipment.startingKit = kit;
    const kitData = STARTING_KITS.find((k) => k.code === kit);
    if (kitData) {
      state.value.equipment.spheres = 0; // Spheres set by dice roll in StartingKit step
      // Equipment items would be populated from kit data
    }
  }

  function addEquipmentItem(item: EquipmentItem) {
    state.value.equipment.equipment.push(item);
  }

  function removeEquipmentItem(equipmentId: number) {
    state.value.equipment.equipment = state.value.equipment.equipment.filter(
      (e) => e.equipmentId !== equipmentId
    );
  }

  function updateEquipment(data: Partial<EquipmentData>) {
    state.value.equipment = { ...state.value.equipment, ...data };
  }

  function updatePersonalDetails(data: Partial<PersonalDetailsData>) {
    state.value.personalDetails = { ...state.value.personalDetails, ...data };
  }

  function addGoal(goal: GoalEntry) {
    state.value.personalDetails.goals.push(goal);
  }

  function removeGoal(index: number) {
    state.value.personalDetails.goals.splice(index, 1);
  }

  function addConnection(connection: ConnectionEntry) {
    state.value.personalDetails.connections.push(connection);
  }

  function removeConnection(index: number) {
    state.value.personalDetails.connections.splice(index, 1);
  }

  // ===================
  // ACTIONS - Starting Kit Bonuses
  // ===================
  function applyStartingKitBonuses(startingKitId: number) {
    const classifiers = useClassifierStore();
    const kitData = classifiers.getStartingKitById(startingKitId);
    if (!kitData) return;

    // Clear previous starting kit expertises
    state.value.expertises.allocations = state.value.expertises.allocations.filter(
      (e) => e.source !== 'starting_kit'
    );

    // Apply expertise bonuses from kit
    if (kitData.expertises) {
      for (const exp of kitData.expertises) {
        addExpertise(exp.expertiseId, 'starting_kit');
      }
    }

    // Apply equipment from kit
    state.value.equipment.equipment = [];
    if (kitData.equipment) {
      for (const item of kitData.equipment) {
        state.value.equipment.equipment.push({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
          isEquipped: false,
        });
      }
    }

    // Set spheres from rolled amount if available
    if (state.value.startingKit.rolledSpheres !== undefined) {
      state.value.equipment.spheres = state.value.startingKit.rolledSpheres;
    }
  }

  // ===================
  // ACTIONS - Validation
  // ===================
  function validateStep(step: number): StepValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (step) {
      case 1: // Basic Setup
        if (!state.value.basicSetup.name.trim()) {
          errors.push('Character name is required');
        }
        if (state.value.basicSetup.level < 1 || state.value.basicSetup.level > 20) {
          errors.push('Level must be between 1 and 20');
        }
        break;

      case 2: // Ancestry
        if (!state.value.ancestry.ancestryId) {
          errors.push('Ancestry selection is required');
        }
        if (state.value.ancestry.ancestryId === 2 && !state.value.ancestry.singerFormId) {
          warnings.push('No initial form selected for Singer');
        }
        break;

      case 3: // Culture
        if (!state.value.culture.primaryCultureId) {
          errors.push('Primary culture selection is required');
        }
        break;

      case 4: {
        // Attributes
        if (attributePointsRemaining.value < 0) {
          errors.push('Attribute points exceeded');
        }
        if (attributePointsRemaining.value > 0) {
          warnings.push(`${attributePointsRemaining.value} attribute points remaining`);
        }
        // Check max attribute values
        const alloc = state.value.attributes.allocation;
        for (const [attr, value] of Object.entries(alloc)) {
          if (value < 0 || value > 5) {
            errors.push(`${attr} must be between 0 and 5`);
          }
        }
        break;
      }

      case 5: // Skills
        if (skillPointsRemaining.value < 0) {
          errors.push('Skill points exceeded');
        }
        if (skillPointsRemaining.value > 0) {
          warnings.push(`${skillPointsRemaining.value} skill points remaining`);
        }
        break;

      case 6: // Expertises
        if (expertiseSlotsRemaining.value < 0) {
          errors.push('Expertise slots exceeded');
        }
        break;

      case 7: // Paths
        if (state.value.paths.paths.length === 0) {
          errors.push('At least one heroic path is required');
        }
        break;

      case 8: // Starting Kit
        if (!state.value.startingKit.startingKitId) {
          errors.push('Starting kit selection is required');
        }
        break;

      case 9: // Equipment
        // Equipment is flexible, no hard requirements
        break;

      case 10: // Personal Details
        // Optional step
        break;

      case 11: // Review
        // Validate all previous steps
        for (let i = 1; i <= 10; i++) {
          const stepValidation = validateStep(i);
          errors.push(...stepValidation.errors.map((e) => `Step ${i}: ${e}`));
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  function isStepComplete(step: number): boolean {
    return validateStep(step).isValid;
  }

  // ===================
  // ACTIONS - Reset
  // ===================
  function reset() {
    state.value = { ...DEFAULT_CHARACTER_CREATION_STATE };
  }

  function resetStep(step: number) {
    switch (step) {
      case 1:
        state.value.basicSetup = { name: '', level: 1 };
        break;
      case 2:
        state.value.ancestry = { ancestryId: 0 };
        break;
      case 3:
        state.value.culture = { primaryCultureId: 0 };
        // Also clear cultural expertises
        state.value.expertises.allocations = state.value.expertises.allocations.filter(
          (e) => e.source !== 'culture'
        );
        break;
      case 4:
        state.value.attributes = {
          allocation: {
            strength: 0,
            speed: 0,
            intellect: 0,
            willpower: 0,
            awareness: 0,
            presence: 0,
          },
        };
        break;
      case 5:
        state.value.skills = { allocations: [] };
        break;
      case 6:
        state.value.expertises = { allocations: [] };
        break;
      case 7:
        state.value.paths = { paths: [] };
        break;
      case 8:
        state.value.startingKit = { startingKitId: 0 };
        break;
      case 9:
        state.value.equipment = { startingKit: 'custom', equipment: [], spheres: 0 };
        break;
      case 10:
        state.value.personalDetails = { goals: [], connections: [] };
        break;
    }
    // Remove from completed steps
    state.value.completedSteps = state.value.completedSteps.filter((s) => s !== step);
  }

  // ===================
  // RETURN
  // ===================
  return {
    // State
    state,
    currentStep,
    completedSteps,
    isDraft,
    currentStepConfig,

    // Step Data
    basicSetup,
    ancestry,
    culture,
    startingKit,
    attributes,
    skills,
    expertises,
    paths,
    equipment,
    personalDetails,

    // Point Budgets
    pointBudgets,
    attributePointsSpent,
    attributePointsRemaining,
    skillPointsSpent,
    skillPointsRemaining,
    expertiseSlotsUsed,
    expertiseSlotsRemaining,

    // Derived Stats
    derivedStatsPreview,

    // Flags
    isSinger,
    isRadiant,

    // Navigation
    goToStep,
    nextStep,
    previousStep,

    // Updates
    updateBasicSetup,
    updateAncestry,
    updateCulture,
    clearSecondaryCulture,
    updateStartingKit,
    updateAttributes,
    setSkillRank,
    addExpertise,
    removeExpertise,
    addPath,
    removePath,
    setPathSpecialty,
    addTalentToPath,
    removeTalentFromPath,
    setRadiantPath,
    removeRadiantPath,
    addRadiantTalent,
    removeRadiantTalent,
    addAncestryTalent,
    removeAncestryTalent,
    setStartingKit,
    addEquipmentItem,
    removeEquipmentItem,
    updateEquipment,
    updatePersonalDetails,
    addGoal,
    removeGoal,
    addConnection,
    removeConnection,

    // Validation
    validateStep,
    isStepComplete,

    // Reset
    reset,
    resetStep,
  };
});
