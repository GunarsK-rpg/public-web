import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Attribute,
  AttributeCode,
  AttributeTypeCode,
  Skill,
  SkillCode,
  Weapon,
  Armor,
  Equipment,
  Condition,
  ConditionCode,
  Expertise,
  ExpertiseCategoryCode,
  StartingKit,
  StartingKitCode,
  HeroicPath,
  HeroicPathCode,
  Specialty,
  SpecialtyCode,
  RadiantOrder,
  RadiantOrderCode,
  Surge,
  SurgeCode,
  Talent,
  Ancestry,
  AncestryCode,
  SingerForm,
  SingerFormCode,
  Culture,
  CultureCode,
} from 'src/types';
import { attributeTypes } from 'src/mock/attributes';
import { expertiseCategories } from 'src/mock/expertises';

interface Classifiers {
  attributes: Attribute[];
  skills: Skill[];
  weapons: Weapon[];
  armor: Armor[];
  equipment: Equipment[];
  conditions: Condition[];
  expertises: Expertise[];
  startingKits: StartingKit[];
  heroicPaths: HeroicPath[];
  specialties: Specialty[];
  radiantOrders: RadiantOrder[];
  surges: Surge[];
  talents: Talent[];
  ancestries: Ancestry[];
  singerForms: SingerForm[];
  cultures: Culture[];
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
  const startingKits = computed(() => data.value?.startingKits || []);
  const heroicPaths = computed(() => data.value?.heroicPaths || []);
  const specialties = computed(() => data.value?.specialties || []);
  const radiantOrders = computed(() => data.value?.radiantOrders || []);
  const surges = computed(() => data.value?.surges || []);
  const talents = computed(() => data.value?.talents || []);
  const ancestries = computed(() => data.value?.ancestries || []);
  const singerForms = computed(() => data.value?.singerForms || []);
  const cultures = computed(() => data.value?.cultures || []);

  // Lookup by numeric ID
  function getAttributeById(id: number): Attribute | undefined {
    return attributes.value.find((a) => a.id === id);
  }

  function getSkillById(id: number): Skill | undefined {
    return skills.value.find((s) => s.id === id);
  }

  function getWeaponById(id: number): Weapon | undefined {
    return weapons.value.find((w) => w.id === id);
  }

  function getArmorById(id: number): Armor | undefined {
    return armor.value.find((a) => a.id === id);
  }

  function getEquipmentById(id: number): Equipment | undefined {
    return equipment.value.find((e) => e.id === id);
  }

  function getConditionById(id: number): Condition | undefined {
    return conditions.value.find((c) => c.id === id);
  }

  function getExpertiseById(id: number): Expertise | undefined {
    return expertises.value.find((e) => e.id === id);
  }

  function getStartingKitById(id: number): StartingKit | undefined {
    return startingKits.value.find((k) => k.id === id);
  }

  function getHeroicPathById(id: number): HeroicPath | undefined {
    return heroicPaths.value.find((p) => p.id === id);
  }

  function getSpecialtyById(id: number): Specialty | undefined {
    return specialties.value.find((s) => s.id === id);
  }

  function getRadiantOrderById(id: number): RadiantOrder | undefined {
    return radiantOrders.value.find((o) => o.id === id);
  }

  function getSurgeById(id: number): Surge | undefined {
    return surges.value.find((s) => s.id === id);
  }

  function getTalentById(id: number): Talent | undefined {
    return talents.value.find((t) => t.id === id);
  }

  function getAncestryById(id: number): Ancestry | undefined {
    return ancestries.value.find((a) => a.id === id);
  }

  function getSingerFormById(id: number): SingerForm | undefined {
    return singerForms.value.find((f) => f.id === id);
  }

  function getCultureById(id: number): Culture | undefined {
    return cultures.value.find((c) => c.id === id);
  }

  // Lookup by code (for character references)
  function getAttributeByCode(code: AttributeCode): Attribute | undefined {
    return attributes.value.find((a) => a.code === code);
  }

  function getSkillByCode(code: SkillCode): Skill | undefined {
    return skills.value.find((s) => s.code === code);
  }

  function getWeaponByCode(code: string): Weapon | undefined {
    return weapons.value.find((w) => w.code === code);
  }

  function getArmorByCode(code: string): Armor | undefined {
    return armor.value.find((a) => a.code === code);
  }

  function getEquipmentByCode(code: string): Equipment | undefined {
    return equipment.value.find((e) => e.code === code);
  }

  function getConditionByCode(code: ConditionCode): Condition | undefined {
    return conditions.value.find((c) => c.code === code);
  }

  function getExpertiseByCode(code: string): Expertise | undefined {
    return expertises.value.find((e) => e.code === code);
  }

  function getStartingKitByCode(code: StartingKitCode): StartingKit | undefined {
    return startingKits.value.find((k) => k.code === code);
  }

  function getHeroicPathByCode(code: HeroicPathCode): HeroicPath | undefined {
    return heroicPaths.value.find((p) => p.code === code);
  }

  function getSpecialtyByCode(code: SpecialtyCode): Specialty | undefined {
    return specialties.value.find((s) => s.code === code);
  }

  function getRadiantOrderByCode(code: RadiantOrderCode): RadiantOrder | undefined {
    return radiantOrders.value.find((o) => o.code === code);
  }

  function getSurgeByCode(code: SurgeCode): Surge | undefined {
    return surges.value.find((s) => s.code === code);
  }

  function getTalentByCode(code: string): Talent | undefined {
    return talents.value.find((t) => t.code === code);
  }

  function getAncestryByCode(code: AncestryCode): Ancestry | undefined {
    return ancestries.value.find((a) => a.code === code);
  }

  function getSingerFormByCode(code: SingerFormCode): SingerForm | undefined {
    return singerForms.value.find((f) => f.code === code);
  }

  function getCultureByCode(code: CultureCode): Culture | undefined {
    return cultures.value.find((c) => c.code === code);
  }

  // Helper to get attribute type code from attrTypeId
  function getAttributeTypeCode(attrTypeId: number): AttributeTypeCode | undefined {
    return attributeTypes.find((t) => t.id === attrTypeId)?.code;
  }

  // Helper to get skills by attribute type (physical/cognitive/spiritual)
  function getSkillsByAttributeType(attrTypeCode: AttributeTypeCode): Skill[] {
    const attrType = attributeTypes.find((t) => t.code === attrTypeCode);
    if (!attrType) return [];
    const attrIds = attributes.value.filter((a) => a.attrTypeId === attrType.id).map((a) => a.id);
    return skills.value.filter((s) => attrIds.includes(s.attrId));
  }

  // Helper to get expertise category code from categoryId
  function getExpertiseCategoryCode(categoryId: number): ExpertiseCategoryCode | undefined {
    return expertiseCategories.find((c) => c.id === categoryId)?.code;
  }

  // Helper to get expertises by category code
  function getExpertisesByCategoryCode(categoryCode: ExpertiseCategoryCode): Expertise[] {
    const category = expertiseCategories.find((c) => c.code === categoryCode);
    if (!category) return [];
    return expertises.value.filter((e) => e.categoryId === category.id);
  }

  // Helper to get specialties by path ID
  function getSpecialtiesByPathId(pathId: number): Specialty[] {
    return specialties.value.filter((s) => s.pathId === pathId);
  }

  // Helper to get talents by path ID
  function getTalentsByPathId(pathId: number): Talent[] {
    return talents.value.filter((t) => t.pathId === pathId);
  }

  // Helper to get talents by specialty ID
  function getTalentsBySpecialtyId(specialtyId: number): Talent[] {
    return talents.value.filter((t) => t.specialtyId === specialtyId);
  }

  // Helper to get talents by ancestry ID
  function getTalentsByAncestryId(ancestryId: number): Talent[] {
    return talents.value.filter((t) => t.ancestryId === ancestryId);
  }

  // Helper to get key talent for a path
  function getKeyTalentForPath(pathId: number): Talent | undefined {
    return talents.value.find((t) => t.pathId === pathId && t.isKey);
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
    startingKits,
    heroicPaths,
    specialties,
    radiantOrders,
    surges,
    talents,
    ancestries,
    singerForms,
    cultures,
    // By ID (numeric)
    getAttributeById,
    getSkillById,
    getWeaponById,
    getArmorById,
    getEquipmentById,
    getConditionById,
    getExpertiseById,
    getStartingKitById,
    getHeroicPathById,
    getSpecialtyById,
    getRadiantOrderById,
    getSurgeById,
    getTalentById,
    getAncestryById,
    getSingerFormById,
    getCultureById,
    // By code (string)
    getAttributeByCode,
    getSkillByCode,
    getWeaponByCode,
    getArmorByCode,
    getEquipmentByCode,
    getConditionByCode,
    getExpertiseByCode,
    getStartingKitByCode,
    getHeroicPathByCode,
    getSpecialtyByCode,
    getRadiantOrderByCode,
    getSurgeByCode,
    getTalentByCode,
    getAncestryByCode,
    getSingerFormByCode,
    getCultureByCode,
    // New helpers
    getAttributeTypeCode,
    getSkillsByAttributeType,
    getExpertiseCategoryCode,
    getExpertisesByCategoryCode,
    getSpecialtiesByPathId,
    getTalentsByPathId,
    getTalentsBySpecialtyId,
    getTalentsByAncestryId,
    getKeyTalentForPath,
    initialize,
    reset,
  };
});
