import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Attribute,
  Skill,
  Weapon,
  Armor,
  Equipment,
  Condition,
  Expertise,
  Origin,
  HeroicPath,
  Specialty,
  RadiantOrder,
  Surge,
  Talent,
} from 'src/types';

interface Classifiers {
  attributes: Attribute[];
  skills: Skill[];
  weapons: Weapon[];
  armor: Armor[];
  equipment: Equipment[];
  conditions: Condition[];
  expertises: Expertise[];
  origins: Origin[];
  heroicPaths: HeroicPath[];
  specialties: Specialty[];
  radiantOrders: RadiantOrder[];
  surges: Surge[];
  talents: Talent[];
}

export const useClassifierStore = defineStore('classifiers', () => {
  const data = ref<Classifiers | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const attributes = computed(() => data.value?.attributes || []);
  const skills = computed(() => data.value?.skills || []);
  const weapons = computed(() => data.value?.weapons || []);
  const armor = computed(() => data.value?.armor || []);
  const equipment = computed(() => data.value?.equipment || []);
  const conditions = computed(() => data.value?.conditions || []);
  const expertises = computed(() => data.value?.expertises || []);
  const origins = computed(() => data.value?.origins || []);
  const heroicPaths = computed(() => data.value?.heroicPaths || []);
  const specialties = computed(() => data.value?.specialties || []);
  const radiantOrders = computed(() => data.value?.radiantOrders || []);
  const surges = computed(() => data.value?.surges || []);
  const talents = computed(() => data.value?.talents || []);

  function getSkillById(id: string): Skill | undefined {
    return skills.value.find((s) => s.id === id);
  }

  function getWeaponById(id: string): Weapon | undefined {
    return weapons.value.find((w) => w.id === id);
  }

  function getArmorById(id: string): Armor | undefined {
    return armor.value.find((a) => a.id === id);
  }

  function getEquipmentById(id: string): Equipment | undefined {
    return equipment.value.find((e) => e.id === id);
  }

  function getConditionById(id: string): Condition | undefined {
    return conditions.value.find((c) => c.id === id);
  }

  function getExpertiseById(id: string): Expertise | undefined {
    return expertises.value.find((e) => e.id === id);
  }

  function getOriginById(id: string): Origin | undefined {
    return origins.value.find((o) => o.id === id);
  }

  function getHeroicPathById(id: string): HeroicPath | undefined {
    return heroicPaths.value.find((p) => p.id === id);
  }

  function getSpecialtyById(id: string): Specialty | undefined {
    return specialties.value.find((s) => s.id === id);
  }

  function getRadiantOrderById(id: string): RadiantOrder | undefined {
    return radiantOrders.value.find((o) => o.id === id);
  }

  function getSurgeById(id: string): Surge | undefined {
    return surges.value.find((s) => s.id === id);
  }

  function getTalentById(id: string): Talent | undefined {
    return talents.value.find((t) => t.id === id);
  }

  async function initialize(): Promise<void> {
    if (initialized.value) return;

    loading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await classifierService.getAll();
      // data.value = response.data;

      // Mock: Import from mock data
      const mockData = await import('src/mock/classifiers');
      data.value = mockData.classifiers;
      initialized.value = true;
    } catch (err) {
      error.value = 'Failed to load classifiers';
      console.error('Failed to load classifiers:', err);
    } finally {
      loading.value = false;
    }
  }

  function reset(): void {
    data.value = null;
    loading.value = false;
    error.value = null;
    initialized.value = false;
  }

  return {
    data,
    loading,
    error,
    initialized,
    attributes,
    skills,
    weapons,
    armor,
    equipment,
    conditions,
    expertises,
    origins,
    heroicPaths,
    specialties,
    radiantOrders,
    surges,
    talents,
    getSkillById,
    getWeaponById,
    getArmorById,
    getEquipmentById,
    getConditionById,
    getExpertiseById,
    getOriginById,
    getHeroicPathById,
    getSpecialtyById,
    getRadiantOrderById,
    getSurgeById,
    getTalentById,
    initialize,
    reset,
  };
});
