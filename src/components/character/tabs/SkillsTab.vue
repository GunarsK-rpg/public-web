<template>
  <div class="skills-tab">
    <!-- Dynamic sections from attribute types classifier -->
    <div v-for="attrType in classifiers.attributeTypes" :key="attrType.id" class="skill-category">
      <div class="category-title">{{ attrType.name }} Skills</div>
      <q-list separator>
        <q-item v-for="skill in getSkillsByAttrTypeId(attrType.id)" :key="skill.id">
          <q-item-section avatar>
            <q-avatar color="grey" text-color="white" size="md">
              {{ formatModifier(getSkillModifier(skill.code)) }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ skill.name }}</q-item-label>
            <q-item-label caption>
              {{ getAttributeName(skill.attrId) }} + Rank {{ getSkillRank(skill.id) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="rank-pips">
              <span
                v-for="n in 5"
                :key="n"
                class="pip"
                :class="{ filled: n <= getSkillRank(skill.id) }"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import type { Skill } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

function getSkillsByAttrTypeId(attrTypeId: number): Skill[] {
  return classifiers.skills.filter((skill) => {
    const attr = classifiers.getById(classifiers.attributes, skill.attrId);
    return attr?.attrTypeId === attrTypeId;
  });
}

function getSkillRank(skillId: number): number {
  return heroStore.getSkillRank(skillId);
}

function getSkillModifier(skillCode: string): number {
  return heroStore.getSkillModifier(skillCode);
}

function getAttributeName(attrId: number): string {
  return classifiers.getById(classifiers.attributes, attrId)?.code.toUpperCase() ?? '';
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
