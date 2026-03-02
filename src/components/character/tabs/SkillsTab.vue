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
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useClassifierStore } from 'src/stores/classifiers';
import { groupByKey, findById } from 'src/utils/arrayUtils';
import { COLORS } from 'src/constants/theme';
import type { Skill } from 'src/types';

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const classifiers = useClassifierStore();

// Base skills + hero's active surge skills, grouped by attribute type
const skillsByAttrType = computed((): Record<number, Skill[]> => {
  const attrTypeMap = new Map<number, number>();
  for (const attr of classifiers.attributes) {
    attrTypeMap.set(attr.id, attr.attrType.id);
  }

  const orderId = heroStore.hero?.radiantOrder?.id;
  let activeSurgeIds: Set<number> | null = null;
  if (orderId) {
    const order = findById(classifiers.radiantOrders, orderId);
    if (order) activeSurgeIds = new Set([order.surge1.id, order.surge2.id]);
  }

  const visible = classifiers.skills.filter(
    (s) => !s.surge || (activeSurgeIds && s.surge && activeSurgeIds.has(s.surge.id))
  );
  return groupByKey(visible, (skill) => attrTypeMap.get(skill.attr?.id ?? 0) ?? 0);
});

function getAttributeCode(skill: Skill): string {
  return (skill.attr?.code ?? '').toUpperCase();
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
