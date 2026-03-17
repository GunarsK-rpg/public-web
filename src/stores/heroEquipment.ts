import { defineStore } from 'pinia';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';
import { useHeroAttributesStore } from './heroAttributes';
import { findById } from 'src/utils/arrayUtils';
import { MAX_EQUIPMENT_STACK } from 'src/constants';
import { SPECIAL } from 'src/utils/specialUtils';

export const useHeroEquipmentStore = defineStore('heroEquipment', () => {
  const heroStore = useHeroStore();
  const classifierStore = useClassifierStore();
  const attrStore = useHeroAttributesStore();

  // ===================
  // CURRENCY
  // ===================
  function setCurrency(amount: number) {
    if (!heroStore.hero) return;
    heroStore.hero.currency = Math.max(0, Math.floor(amount));
  }

  // ===================
  // EQUIPMENT
  // ===================
  function addEquipment(equipmentId: number, amount: number = 1) {
    if (!heroStore.hero) return;
    const validAmount = Math.max(1, Math.floor(amount));
    const equip = findById(classifierStore.equipment, equipmentId);
    if (!equip) return;

    const eqType = findById(classifierStore.equipmentTypes, equip.equipType.id);
    const isIndividual = !(eqType?.isStackable ?? false);

    if (!isIndividual) {
      const existing = heroStore.hero.equipment.find((e) => e.equipment?.id === equipmentId);
      if (existing) {
        existing.amount = Math.min(existing.amount + validAmount, MAX_EQUIPMENT_STACK);
        return;
      }
    }

    const count = isIndividual ? validAmount : 1;
    for (let i = 0; i < count; i++) {
      heroStore.hero.equipment.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        equipment: { id: equip.id, code: equip.code, name: equip.name },
        equipType: {
          id: equip.equipType.id,
          code: equip.equipType.code,
          name: equip.equipType.name,
        },
        special: equip.special ?? [],
        charges: equip.maxCharges ?? null,
        maxCharges: equip.maxCharges ?? null,
        amount: isIndividual ? 1 : Math.min(validAmount, MAX_EQUIPMENT_STACK),
        isEquipped: false,
        specialOverrides: [],
        modifications: [],
      });
    }
  }

  function removeEquipment(rowId: number, amount?: number) {
    if (!heroStore.hero) return;
    // If amount specified, decrement stack; otherwise remove entirely
    if (amount !== undefined) {
      const existing = heroStore.hero.equipment.find((e) => e.id === rowId);
      if (existing) {
        existing.amount -= Math.max(1, Math.floor(amount));
        if (existing.amount <= 0) {
          heroStore.hero.equipment = heroStore.hero.equipment.filter((e) => e.id !== rowId);
        }
        return;
      }
    }
    heroStore.hero.equipment = heroStore.hero.equipment.filter((e) => e.id !== rowId);
  }

  function setEquipmentEquipped(rowId: number, isEquipped: boolean) {
    if (!heroStore.hero) return;
    const item = heroStore.hero.equipment.find((e) => e.id === rowId);
    if (item) {
      item.isEquipped = isEquipped;
    }
  }

  // ===================
  // STARTING KIT
  // ===================
  function setStartingKit(startingKitId: number) {
    if (!heroStore.hero) return;
    const kit = findById(classifierStore.startingKits, startingKitId);
    if (!kit) return;
    heroStore.hero.startingKit = { id: kit.id, code: kit.code, name: kit.name };
    applyStartingKitBonuses(startingKitId);
  }

  function applyStartingKitBonuses(startingKitId: number) {
    if (!heroStore.hero) return;
    const kitData = findById(classifierStore.startingKits, startingKitId);
    if (!kitData) return;

    // Clear previous starting kit expertises
    heroStore.hero.expertises = heroStore.hero.expertises.filter(
      (e) => e.source?.sourceType !== 'starting_kit'
    );

    // Apply expertise bonuses from kit
    if (kitData.expertises) {
      for (const exp of kitData.expertises) {
        attrStore.addExpertise(exp.id, {
          sourceType: 'starting_kit',
          sourceId: startingKitId,
        });
      }
    }

    // Collect talent-granted item choices before clearing
    const talentGrantedCodes: string[] = [];
    for (const heroTalent of heroStore.hero.talents) {
      for (const sel of heroTalent.grantSelections ?? []) {
        if (sel.type === SPECIAL.ITEM_CHOICE) {
          talentGrantedCodes.push(...(sel.codes ?? []));
        }
      }
    }

    // Clear previous kit equipment and apply new kit equipment
    heroStore.hero.equipment = [];
    if (kitData.equipment) {
      for (const item of kitData.equipment) {
        addEquipment(item.id, item.quantity);
      }
    }

    // Re-add talent-granted items preserved from before the clear
    for (const code of talentGrantedCodes) {
      const equip = classifierStore.equipment.find((e) => e.code === code);
      if (equip) addEquipment(equip.id);
    }
  }

  return {
    // Currency
    setCurrency,

    // Equipment
    addEquipment,
    removeEquipment,
    setEquipmentEquipped,

    // Starting Kit
    setStartingKit,
  };
});
