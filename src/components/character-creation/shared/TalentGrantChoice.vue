<template>
  <div v-for="(choice, index) in choices" :key="index" class="q-mt-xs">
    <q-select
      :model-value="selectedValues[index] ?? null"
      :options="getOptions(choice)"
      :label="getLabel(choice)"
      option-value="code"
      option-label="name"
      emit-value
      map-options
      dense
      outlined
      clearable
      class="talent-grant-select"
      @update:model-value="(val: string | null) => onSelect(index, val)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroEquipmentStore } from 'src/stores/heroEquipment';
import { useHeroStore } from 'src/stores/hero';
import { filterSpecial } from 'src/utils/talentGrants';
import { SPECIAL } from 'src/utils/specialUtils';
import type { SpecialEntry } from 'src/types';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';

const props = withDefaults(
  defineProps<{
    talentId?: number;
    sourceType?: string;
    sourceId?: number;
    special: SpecialEntry[];
  }>(),
  { sourceType: 'talent' }
);

const resolvedSourceType = computed(() => props.sourceType);
const resolvedSourceId = computed(() => props.sourceId ?? props.talentId ?? 0);

const classifierStore = useClassifierStore();
const attrStore = useHeroAttributesStore();
const equipStore = useHeroEquipmentStore();
const heroStore = useHeroStore();
const deletionTracker = inject<DeletionTracker>('deletionTracker');

const choices = computed(() =>
  filterSpecial(
    props.special,
    SPECIAL.EXPERTISE_CHOICE,
    SPECIAL.EXPERTISE_TYPE_CHOICE,
    SPECIAL.ITEM_CHOICE
  )
);

const selectedValues = computed(() => {
  const sourceExpertises = (heroStore.hero?.expertises ?? []).filter(
    (e) =>
      e.source?.sourceType === resolvedSourceType.value &&
      e.source?.sourceId === resolvedSourceId.value
  );

  return choices.value.map((choice) => {
    if (choice.type === SPECIAL.ITEM_CHOICE) {
      const heroTalent = heroStore.hero?.talents.find(
        (t) => t.talent.id === resolvedSourceId.value
      );
      const sel = (heroTalent?.grantSelections ?? []).find((s) => s.type === SPECIAL.ITEM_CHOICE);
      return sel?.codes?.[0] ?? null;
    }
    const validCodes = new Set(getOptions(choice).map((e) => e.code));
    const match = sourceExpertises.find((e) => {
      const code = e.expertise?.code;
      return code && validCodes.has(code);
    });
    return match?.expertise?.code ?? null;
  });
});

function getOptions(choice: SpecialEntry) {
  const codes = choice.codes ?? [];
  const ownedIds = new Set(
    (heroStore.hero?.expertises ?? []).map((e) => e.expertise?.id).filter(Boolean)
  );

  if (choice.type === SPECIAL.EXPERTISE_CHOICE) {
    return classifierStore.expertises
      .filter((e) => codes.includes(e.code))
      .map((e) => ({ ...e, disable: ownedIds.has(e.id) }));
  }
  if (choice.type === SPECIAL.EXPERTISE_TYPE_CHOICE) {
    return classifierStore.expertises
      .filter((e) => codes.includes(e.expertiseType.code))
      .map((e) => ({ ...e, disable: ownedIds.has(e.id) }));
  }
  if (choice.type === SPECIAL.ITEM_CHOICE) {
    return classifierStore.equipment.filter((e) => codes.includes(e.code));
  }
  return [];
}

function getLabel(choice: SpecialEntry): string {
  if (choice.type === SPECIAL.ITEM_CHOICE) return 'Choose item';
  if (choice.type === SPECIAL.EXPERTISE_CHOICE) return 'Choose expertise';
  if (choice.type === SPECIAL.EXPERTISE_TYPE_CHOICE) {
    return `Choose ${(choice.codes ?? []).join(' or ')} expertise`;
  }
  return 'Choose';
}

function onSelect(choiceIndex: number, code: string | null) {
  const choice = choices.value[choiceIndex];
  if (!choice) return;

  if (choice.type === SPECIAL.ITEM_CHOICE) {
    onSelectItem(choiceIndex, code);
  } else if (
    choice.type === SPECIAL.EXPERTISE_CHOICE ||
    choice.type === SPECIAL.EXPERTISE_TYPE_CHOICE
  ) {
    onSelectExpertise(choiceIndex, code);
  }
}

function onSelectExpertise(choiceIndex: number, code: string | null) {
  const prevCode = selectedValues.value[choiceIndex];

  // Remove previous expertise selection
  if (prevCode) {
    const prevHeroExp = (heroStore.hero?.expertises ?? []).find(
      (e) =>
        e.expertise?.code === prevCode &&
        e.source?.sourceType === resolvedSourceType.value &&
        e.source?.sourceId === resolvedSourceId.value
    );
    if (prevHeroExp) {
      attrStore.removeCustomExpertise(prevHeroExp.id);
    }
  }

  if (code) {
    const exp = classifierStore.expertises.find((e) => e.code === code);
    if (exp) {
      attrStore.addExpertise(exp.id, {
        sourceType: resolvedSourceType.value,
        sourceId: resolvedSourceId.value,
      });
    }
  }
}

function onSelectItem(choiceIndex: number, code: string | null) {
  const prevCode = selectedValues.value[choiceIndex];

  // Remove previous item
  if (prevCode) {
    const heroEquip = heroStore.hero?.equipment.find((e) => e.equipment?.code === prevCode);
    if (heroEquip) {
      if (heroEquip.id > 0) deletionTracker?.trackDeletion('equipment', heroEquip.id);
      equipStore.removeEquipment(heroEquip.id);
    }
  }

  // Add new item
  if (code) {
    const equip = classifierStore.equipment.find((e) => e.code === code);
    if (equip) equipStore.addEquipment(equip.id);
  }

  // Track item choice in grantSelections (only for talent source)
  const heroTalent = heroStore.hero?.talents.find((t) => t.talent.id === resolvedSourceId.value);
  if (heroTalent) {
    if (!heroTalent.grantSelections) heroTalent.grantSelections = [];
    const existing = heroTalent.grantSelections.find((s) => s.type === SPECIAL.ITEM_CHOICE);
    if (code) {
      if (existing) {
        existing.codes = [code];
      } else {
        heroTalent.grantSelections.push({ type: SPECIAL.ITEM_CHOICE, codes: [code] });
      }
    } else if (existing) {
      heroTalent.grantSelections = heroTalent.grantSelections.filter(
        (s) => s.type !== SPECIAL.ITEM_CHOICE
      );
    }
  }
}
</script>
