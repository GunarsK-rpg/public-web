import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Character, GrantedAction } from 'src/types';
import { useClassifierStore } from './classifiers';

export const useCharacterStore = defineStore('character', () => {
  const character = ref<Character | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  const isLoaded = computed(() => !!character.value);

  const characterName = computed(() => character.value?.name || '');

  const characterLevel = computed(() => character.value?.level || 1);

  /**
   * Max health = 10 + STR + floor(level / 2)
   */
  const maxHealth = computed(() => {
    if (!character.value) return 10;
    return 10 + (character.value.strength || 0) + Math.floor((character.value.level || 1) / 2);
  });

  /**
   * Max focus = 2 + WIL
   */
  const maxFocus = computed(() => {
    if (!character.value) return 2;
    return 2 + (character.value.willpower || 0);
  });

  /**
   * Max investiture = 2 + max(AWA, PRE) for Radiants
   */
  const maxInvestiture = computed(() => {
    if (!character.value || !character.value.radiantOrder) return 0;
    const awa = character.value.awareness || 0;
    const pre = character.value.presence || 0;
    return 2 + Math.max(awa, pre);
  });

  /**
   * Physical defense = 10 + STR + SPD
   */
  const physicalDefense = computed(() => {
    if (!character.value) return 10;
    return 10 + (character.value.strength || 0) + (character.value.speed || 0);
  });

  /**
   * Cognitive defense = 10 + INT + WIL
   */
  const cognitiveDefense = computed(() => {
    if (!character.value) return 10;
    return 10 + (character.value.intellect || 0) + (character.value.willpower || 0);
  });

  /**
   * Spiritual defense = 10 + AWA + PRE
   */
  const spiritualDefense = computed(() => {
    if (!character.value) return 10;
    return 10 + (character.value.awareness || 0) + (character.value.presence || 0);
  });

  /**
   * Deflect from equipped armor
   */
  const deflect = computed(() => {
    if (!character.value?.armor) return 0;
    const classifiers = useClassifierStore();
    const armorData = classifiers.getArmorById(character.value.armor.armorId);
    return armorData?.deflect || 0;
  });

  /**
   * Check if character is a Radiant
   */
  const isRadiant = computed(() => !!character.value?.radiantOrder);

  /**
   * Get all actions granted to the character from talents, weapons, armor, and equipment
   * TODO: Implement when action classifiers are added to the store
   */
  const grantedActions = computed((): GrantedAction[] => {
    // Actions are now linked via actionId on classifier items
    // This will need to be reimplemented when we add actions to the classifier store
    return [];
  });

  /**
   * Get skill rank by skill ID (numeric)
   */
  function getSkillRank(skillId: number): number {
    if (!character.value?.skills) return 0;
    const skill = character.value.skills.find((s) => s.skillId === skillId);
    return skill?.rank || 0;
  }

  /**
   * Get skill modifier (attribute + rank) by skill code
   */
  function getSkillModifier(skillCode: string): number {
    const classifiers = useClassifierStore();
    const skillData = classifiers.getSkillByCode(
      skillCode as Parameters<typeof classifiers.getSkillByCode>[0]
    );
    if (!skillData || !character.value) return 0;

    // Look up the attribute by ID to get its code
    const attribute = classifiers.getAttributeById(skillData.attrId);
    if (!attribute) return 0;

    const attrValue = character.value[attribute.code as keyof Character] || 0;
    const rank = getSkillRank(skillData.id);
    return (attrValue as number) + rank;
  }

  /**
   * Load character by ID
   */
  async function loadCharacter(id: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await characterService.getById(id);
      // character.value = response.data;

      // Mock: Import from mock data
      const { characters } = await import('src/mock/characters');
      const found = characters.find((c) => c.id === id);
      if (found) {
        character.value = found;
      } else {
        error.value = 'Character not found';
      }
    } catch (err) {
      error.value = 'Failed to load character';
      console.error('Failed to load character:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update character resources
   */
  function updateResources(resources: {
    currentHealth?: number;
    currentFocus?: number;
    currentInvestiture?: number;
  }): { success: boolean; error?: string } {
    if (!character.value) return { success: false, error: 'No character' };

    saving.value = true;
    error.value = null;

    try {
      // TODO: API call
      Object.assign(character.value, resources);
      return { success: true };
    } catch {
      error.value = 'Failed to update resources';
      return { success: false, error: error.value };
    } finally {
      saving.value = false;
    }
  }

  /**
   * Clear character state
   */
  function clearCharacter(): void {
    character.value = null;
    error.value = null;
  }

  /**
   * Reset store
   */
  function reset(): void {
    character.value = null;
    loading.value = false;
    saving.value = false;
    error.value = null;
  }

  return {
    character,
    loading,
    saving,
    error,
    isLoaded,
    characterName,
    characterLevel,
    maxHealth,
    maxFocus,
    maxInvestiture,
    physicalDefense,
    cognitiveDefense,
    spiritualDefense,
    deflect,
    isRadiant,
    grantedActions,
    getSkillRank,
    getSkillModifier,
    loadCharacter,
    updateResources,
    clearCharacter,
    reset,
  };
});
