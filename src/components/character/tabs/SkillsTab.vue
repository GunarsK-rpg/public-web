<template>
  <div class="skills-tab">
    <!-- Physical Skills -->
    <div class="skill-category">
      <div class="category-title physical">Physical Skills</div>
      <q-list separator>
        <q-item v-for="skill in physicalSkills" :key="skill.id">
          <q-item-section avatar>
            <q-avatar
              :color="getModifierColor(getSkillModifier(skill.code))"
              text-color="white"
              size="md"
            >
              {{ getSkillModifier(skill.code) }}
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

    <!-- Cognitive Skills -->
    <div class="skill-category">
      <div class="category-title cognitive">Cognitive Skills</div>
      <q-list separator>
        <q-item v-for="skill in cognitiveSkills" :key="skill.id">
          <q-item-section avatar>
            <q-avatar
              :color="getModifierColor(getSkillModifier(skill.code))"
              text-color="white"
              size="md"
            >
              {{ getSkillModifier(skill.code) }}
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

    <!-- Spiritual Skills -->
    <div class="skill-category">
      <div class="category-title spiritual">Spiritual Skills</div>
      <q-list separator>
        <q-item v-for="skill in spiritualSkills" :key="skill.id">
          <q-item-section avatar>
            <q-avatar
              :color="getModifierColor(getSkillModifier(skill.code))"
              text-color="white"
              size="md"
            >
              {{ getSkillModifier(skill.code) }}
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
import { computed } from 'vue';
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';
import type { SkillCode } from 'src/types';

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const physicalSkills = computed(() => classifierStore.getSkillsByAttributeType('physical'));
const cognitiveSkills = computed(() => classifierStore.getSkillsByAttributeType('cognitive'));
const spiritualSkills = computed(() => classifierStore.getSkillsByAttributeType('spiritual'));

function getSkillRank(skillId: number): number {
  return characterStore.getSkillRank(skillId);
}

function getSkillModifier(skillCode: SkillCode): number {
  return characterStore.getSkillModifier(skillCode);
}

function getAttributeName(attrId: number): string {
  const attr = classifierStore.getAttributeById(attrId);
  return attr?.abbreviation || 'UNK';
}

function getModifierColor(mod: number): string {
  if (mod >= 7) return 'positive';
  if (mod >= 5) return 'primary';
  if (mod >= 3) return 'info';
  return 'grey';
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
}

.category-title.physical {
  background: color-mix(in srgb, var(--q-info) 15%, transparent);
  color: var(--q-info);
}

.category-title.cognitive {
  background: color-mix(in srgb, var(--q-accent) 15%, transparent);
  color: var(--q-accent);
}

.category-title.spiritual {
  background: color-mix(in srgb, var(--q-warning) 15%, transparent);
  color: var(--q-warning);
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
