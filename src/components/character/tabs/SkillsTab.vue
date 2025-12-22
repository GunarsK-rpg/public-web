<template>
  <div class="skills-tab">
    <!-- Dynamic sections from attribute types classifier -->
    <div v-for="attrType in classifiers.attributeTypes" :key="attrType.id" class="skill-category">
      <div class="category-title">{{ attrType.name }} Skills</div>
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
import { groupByChainedKey } from 'src/utils/arrayUtils';
import type { Skill } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Skills grouped by attribute type (via skill.attrId -> attribute.attrTypeId)
const skillsByAttrType = computed((): Record<number, Skill[]> => {
  return groupByChainedKey(classifiers.skills, 'attrId', classifiers.attributes, 'attrTypeId');
});

// Pre-computed attribute code lookup for O(1) access
const attributeCodeMap = computed(() => {
  const map = new Map<number, string>();
  for (const attr of classifiers.attributes) {
    map.set(attr.id, attr.code.toUpperCase());
  }
  return map;
});

function getAttributeCode(attrId: number): string {
  return attributeCodeMap.value.get(attrId) ?? '';
}

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
</script>

<style scoped>
.skill-category {
  margin-bottom: 16px;
}

.category-title {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 8px 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
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
