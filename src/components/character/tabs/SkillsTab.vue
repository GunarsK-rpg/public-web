<template>
  <div class="skills-tab">
    <!-- Dynamic sections from attribute types classifier -->
    <div v-for="attrType in classifiers.attributeTypes" :key="attrType.id" class="skill-category">
      <div class="section-title section-title--md q-px-md q-py-sm">{{ attrType.name }} Skills</div>
      <q-list separator>
        <q-item v-for="skill in skillsByAttrType[attrType.id]" :key="skill.id">
          <q-item-section avatar>
            <q-avatar color="grey" text-color="white" size="md">
              {{ formatModifier(heroStore.getSkillModifier(skill.code)) }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ skill.name }}</q-item-label>
            <q-item-label caption>
              {{ getAttributeCode(skill.attrId) }} + Rank {{ heroStore.getSkillRank(skill.id) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div
              class="rank-pips"
              role="img"
              :aria-label="`Rank ${heroStore.getSkillRank(skill.id)} of 5`"
            >
              <span
                v-for="n in 5"
                :key="n"
                class="pip"
                :class="{ filled: n <= heroStore.getSkillRank(skill.id) }"
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
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { groupByChainedKey, buildIdCodeMap } from 'src/utils/arrayUtils';
import type { Skill } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Skills grouped by attribute type (via skill.attrId -> attribute.attrTypeId)
const skillsByAttrType = computed((): Record<number, Skill[]> => {
  return groupByChainedKey(classifiers.skills, 'attrId', classifiers.attributes, 'attrTypeId');
});

// Pre-computed attribute code lookup for O(1) access
const attributeCodeMap = computed(() => buildIdCodeMap(classifiers.attributes));

function getAttributeCode(attrId: number): string {
  return (attributeCodeMap.value.get(attrId) ?? '').toUpperCase();
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
