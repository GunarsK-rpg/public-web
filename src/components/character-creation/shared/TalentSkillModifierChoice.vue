<template>
  <div v-for="(grant, grantIndex) in grants" :key="grantIndex">
    <div v-for="slotIndex in grant.value" :key="`${grantIndex}-${slotIndex}`" class="q-mt-xs">
      <q-select
        :model-value="selectedCodes[slotIndex - 1] ?? null"
        :options="getAvailableSkills(grant, slotIndex - 1)"
        :label="`Choose skill (+1 modifier)${(grant.value ?? 0) > 1 ? ` — slot ${slotIndex}` : ''}`"
        option-value="code"
        option-label="name"
        emit-value
        map-options
        dense
        outlined
        clearable
        class="talent-skill-modifier-select"
        @update:model-value="(val: string | null) => onSelectSkill(slotIndex - 1, val)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroStore } from 'src/stores/hero';
import { filterSpecial } from 'src/utils/talentGrants';
import { SPECIAL } from 'src/utils/specialUtils';
import type { SpecialEntry } from 'src/types';

const props = defineProps<{
  talentId: number;
  special: SpecialEntry[];
}>();

const classifierStore = useClassifierStore();
const attrStore = useHeroAttributesStore();
const heroStore = useHeroStore();

const grants = computed(() => filterSpecial(props.special, SPECIAL.SKILL_MODIFIER_CHOICE));

const selectedCodes = computed(() => attrStore.getSkillModifierSelections(props.talentId));

function getAvailableSkills(grant: SpecialEntry, slotIndex: number) {
  const selectedInOtherSlots = new Set(selectedCodes.value.filter((_, i) => i !== slotIndex));

  return classifierStore.skills.filter(
    (s) =>
      (grant.codes ?? []).includes(s.attr.code) && !s.surge && !selectedInOtherSlots.has(s.code)
  );
}

function onSelectSkill(slotIndex: number, code: string | null) {
  const prevCode = selectedCodes.value[slotIndex] ?? null;

  // Remove previous modifier
  if (prevCode) {
    const prevSkill = classifierStore.skills.find((s) => s.code === prevCode);
    if (prevSkill) {
      const currentModifier =
        heroStore.hero?.skills.find((s) => s.skill.id === prevSkill.id)?.modifier ?? 0;
      attrStore.setSkillModifier(prevSkill.id, currentModifier - 1);
    }
  }

  // Add new modifier (+1)
  if (code) {
    const skill = classifierStore.skills.find((s) => s.code === code);
    if (skill) {
      const currentModifier =
        heroStore.hero?.skills.find((s) => s.skill.id === skill.id)?.modifier ?? 0;
      attrStore.setSkillModifier(skill.id, currentModifier + 1);
    }
  }

  // Update tracking
  const newCodes = [...selectedCodes.value];
  if (code) {
    newCodes[slotIndex] = code;
  } else {
    newCodes[slotIndex] = '';
  }
  attrStore.setSkillModifierSelections(props.talentId, newCodes);
}
</script>
