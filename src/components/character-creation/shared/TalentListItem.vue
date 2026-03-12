<template>
  <q-item :class="{ 'item-disabled': !available }">
    <q-item-section avatar>
      <q-checkbox
        :model-value="selected"
        :disable="!available && !selected"
        @update:model-value="$emit('toggle')"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label :class="{ [`text-${COLORS.muted}`]: !available }">
        {{ talent.name }}
        <Lock v-if="!available" :size="14" class="q-ml-xs" aria-hidden="true" />
      </q-item-label>
      <q-item-label caption>{{ talent.descriptionShort || talent.description }}</q-item-label>
      <q-item-label v-if="unmetPrereqs.length > 0" caption :class="`text-${COLORS.error}`">
        <strong>Requires:</strong>
        {{ unmetPrereqs.map(formatPrerequisite).join(', ') }}
      </q-item-label>
      <TalentGrantChoice v-if="showChoices" :talent-id="talent.id" :special="talent.special" />
      <TalentSkillModifierChoice
        v-if="showSkillModifiers"
        :talent-id="talent.id"
        :special="talent.special"
      />
    </q-item-section>
    <q-item-section side>
      <q-btn flat dense aria-label="View talent details" @click.stop="$emit('showDetails', talent)">
        <Info :size="20" aria-hidden="true" />
        <q-tooltip>View details</q-tooltip>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { COLORS } from 'src/constants/theme';
import { formatPrerequisite } from 'src/utils/talentUtils';
import { filterSpecial } from 'src/utils/talentGrants';
import { SPECIAL } from 'src/utils/specialUtils';
import { Info, Lock } from 'lucide-vue-next';
import TalentGrantChoice from './TalentGrantChoice.vue';
import TalentSkillModifierChoice from './TalentSkillModifierChoice.vue';
import type { Talent, TalentPrerequisite } from 'src/types';

const props = defineProps<{
  talent: Talent;
  selected: boolean;
  available: boolean;
  unmetPrereqs: TalentPrerequisite[];
}>();

defineEmits<{
  toggle: [];
  showDetails: [talent: Talent];
}>();

const showChoices = computed(
  () =>
    props.selected &&
    filterSpecial(
      props.talent.special ?? [],
      SPECIAL.EXPERTISE_CHOICE,
      SPECIAL.EXPERTISE_TYPE_CHOICE,
      SPECIAL.ITEM_CHOICE
    ).length > 0
);

const showSkillModifiers = computed(
  () =>
    props.selected &&
    filterSpecial(props.talent.special ?? [], SPECIAL.SKILL_MODIFIER_CHOICE).length > 0
);
</script>
