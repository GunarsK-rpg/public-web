import { defineStore } from 'pinia';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';
import { useHeroAttributesStore } from './heroAttributes';
import { findById } from 'src/utils/arrayUtils';
import { MAX_EQUIPMENT_STACK } from 'src/constants';

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
    // Validate amount - must be positive
    const validAmount = Math.max(1, Math.floor(amount));
    const existing = heroStore.hero.equipment.find((e) => e.equipment.id === equipmentId);
    if (existing) {
      // Cap at max stack size
      existing.amount = Math.min(existing.amount + validAmount, MAX_EQUIPMENT_STACK);
    } else {
      const equip = findById(classifierStore.equipment, equipmentId);
      if (!equip) return;
      heroStore.hero.equipment.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        equipment: { id: equip.id, code: equip.code, name: equip.name },
        special: equip.special ?? [],
        charges: equip.maxCharges ?? null,
        maxCharges: equip.maxCharges ?? null,
        amount: Math.min(validAmount, MAX_EQUIPMENT_STACK),
        isEquipped: false,
      });
    }
  }

  function removeEquipment(equipmentId: number, amount?: number) {
    if (!heroStore.hero) return;
    // If amount specified, decrement stack; otherwise remove entirely
    if (amount !== undefined) {
      const existing = heroStore.hero.equipment.find((e) => e.equipment.id === equipmentId);
      if (existing) {
        existing.amount -= Math.max(1, Math.floor(amount));
        if (existing.amount <= 0) {
          heroStore.hero.equipment = heroStore.hero.equipment.filter(
            (e) => e.equipment.id !== equipmentId
          );
        }
        return;
      }
    }
    heroStore.hero.equipment = heroStore.hero.equipment.filter(
      (e) => e.equipment.id !== equipmentId
    );
  }

  function setEquipmentEquipped(equipmentId: number, isEquipped: boolean) {
    if (!heroStore.hero) return;
    const item = heroStore.hero.equipment.find((e) => e.equipment.id === equipmentId);
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

    // Clear ALL equipment and apply new kit equipment
    // (during character creation, equipment only comes from kits)
    heroStore.hero.equipment = [];
    if (kitData.equipment) {
      for (const item of kitData.equipment) {
        addEquipment(item.id, item.quantity);
      }
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
