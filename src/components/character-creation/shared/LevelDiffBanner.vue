<template>
  <q-banner class="banner-info q-mt-md">
    <template v-slot:avatar>
      <Info aria-hidden="true" />
    </template>

    <!-- Diff mode: show deltas between two levels -->
    <template v-if="fromLevel">
      <div class="text-subtitle2 q-mb-xs">Level {{ fromLevel.level }} → {{ toLevel.level }}</div>
      <div class="row q-gutter-md">
        <div v-for="delta in deltas" :key="delta.label" class="col-auto">
          <span class="text-caption">{{ delta.label }}:</span>
          <strong>{{ delta.value > 0 ? '+' : '' }}{{ delta.value }}</strong>
        </div>
      </div>
    </template>

    <!-- Totals mode: show absolute values -->
    <template v-else>
      Starting at level {{ toLevel.level }} gives you {{ toLevel.attributePoints }} attribute
      points, {{ toLevel.skillRanks }} skill ranks, and {{ toLevel.talentSlots }} talent
      slots.<template v-if="toLevel.skillTalentFlex > 0">
        Plus {{ toLevel.skillTalentFlex }} flexible point{{
          toLevel.skillTalentFlex > 1 ? 's' : ''
        }}
        (skill ranks or talent slots).
      </template>
    </template>
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Info } from 'lucide-vue-next';
import type { Level } from 'src/types';

const props = defineProps<{
  fromLevel?: Level;
  toLevel: Level;
}>();

const deltas = computed(() => {
  if (!props.fromLevel) return [];
  const from = props.fromLevel;
  const to = props.toLevel;
  const items = [
    { label: 'Attribute Points', value: to.attributePoints - from.attributePoints },
    { label: 'Health Base', value: to.healthBase - from.healthBase },
    { label: 'Skill Ranks', value: to.skillRanks - from.skillRanks },
    { label: 'Talent Slots', value: to.talentSlots - from.talentSlots },
    { label: 'Max Skill Rank', value: to.maxSkillRank - from.maxSkillRank },
    { label: 'Flex Points', value: to.skillTalentFlex - from.skillTalentFlex },
  ];
  return items.filter((d) => d.value !== 0);
});
</script>
