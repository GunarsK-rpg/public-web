<template>
  <div class="skills-tab">
    <!-- Dynamic sections from attribute types classifier -->
    <div v-for="attrType in classifiers.attributeTypes" :key="attrType.id" class="skill-category">
      <div class="section-title section-title--md q-px-md q-py-sm">{{ attrType.name }} Skills</div>
      <q-list separator>
        <q-item v-for="skill in skillsByAttrType[attrType.id]" :key="skill.id">
          <q-item-section avatar>
            <q-avatar :color="COLORS.muted" text-color="white" size="md">
              {{ formatModifier(attrStore.getSkillModifier(skill.code)) }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ skill.name }}</q-item-label>
            <q-item-label caption>
              {{ getAttributeCode(skill) }} + Rank {{ attrStore.getSkillRank(skill.id) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div
              class="rank-pips"
              role="img"
              :aria-label="`Rank ${attrStore.getSkillRank(skill.id)} of 5`"
            >
              <span
                v-for="n in 5"
                :key="n"
                class="pip"
                :class="{ filled: n <= attrStore.getSkillRank(skill.id) }"
                aria-hidden="true"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useClassifierStore } from 'src/stores/classifiers';
import { groupByKey } from 'src/utils/arrayUtils';
import { COLORS } from 'src/constants/theme';
import type { Skill } from 'src/types';

const attrStore = useHeroAttributesStore();
const classifiers = useClassifierStore();

// Skills grouped by attribute type (via skill.attr.id -> attribute.attrType.id)
const skillsByAttrType = computed((): Record<number, Skill[]> => {
  const attrTypeMap = new Map<number, number>();
  for (const attr of classifiers.attributes) {
    attrTypeMap.set(attr.id, attr.attrType.id);
  }
  // Falls back to 0 (unmapped bucket, filtered out by template) when attr.id has no matching attribute type
  return groupByKey(classifiers.skills, (skill) => attrTypeMap.get(skill.attr.id) ?? 0);
});

function getAttributeCode(skill: Skill): string {
  return (skill.attr.code ?? '').toUpperCase();
}

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
</script>

<style scoped>
.skill-category {
  margin-bottom: 16px;
}

.rank-pips {
  display: flex;
  gap: 4px;
}

.pip {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--q-separator-color);
  border: 1px solid var(--q-separator-dark-color);
  opacity: 0.4;
}

.pip.filled {
  background: var(--q-primary);
  border-color: var(--q-primary);
  opacity: 1;
}
</style>
