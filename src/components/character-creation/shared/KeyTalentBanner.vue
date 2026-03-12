<template>
  <q-banner class="banner-key-talent" dense rounded>
    <template v-slot:avatar>
      <Sparkles aria-hidden="true" data-testid="key-talent-icon" />
    </template>
    <strong>{{ label }}:</strong> {{ talent?.name }}
    <div class="text-caption">
      {{ talent?.descriptionShort || talent?.description }}
    </div>
    <TalentGrantChoice
      v-if="talent && showChoices"
      :talent-id="talent.id"
      :special="talent.special"
    />
    <TalentSkillModifierChoice
      v-if="talent && showSkillModifiers"
      :talent-id="talent.id"
      :special="talent.special"
    />
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Sparkles } from 'lucide-vue-next';
import { filterSpecial } from 'src/utils/talentGrants';
import { SPECIAL } from 'src/utils/specialUtils';
import TalentGrantChoice from './TalentGrantChoice.vue';
import TalentSkillModifierChoice from './TalentSkillModifierChoice.vue';
import type { Talent } from 'src/types';

const props = withDefaults(
  defineProps<{
    talent: Talent | null | undefined;
    label?: string;
  }>(),
  {
    label: 'Key Talent',
  }
);

const showChoices = computed(
  () =>
    filterSpecial(
      props.talent?.special ?? [],
      SPECIAL.EXPERTISE_CHOICE,
      SPECIAL.EXPERTISE_TYPE_CHOICE,
      SPECIAL.ITEM_CHOICE
    ).length > 0
);

const showSkillModifiers = computed(
  () => filterSpecial(props.talent?.special ?? [], SPECIAL.SKILL_MODIFIER_CHOICE).length > 0
);
</script>
