<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">Allocate skill ranks</div>
    <div class="text-caption q-mb-md">
      Points remaining:
      <strong :class="pointsRemaining >= 0 ? 'text-positive' : 'text-negative'">{{
        pointsRemaining
      }}</strong>
      / {{ pointsBudget }}
    </div>

    <!-- Skill Groups by Attribute Type -->
    <div v-for="group in skillGroups" :key="group.typeId" class="q-mb-md">
      <div class="text-subtitle2 q-mb-sm">{{ group.typeName }} Skills</div>

      <q-list bordered separator>
        <q-item v-for="skill in group.skills" :key="skill.id">
          <q-item-section>
            <q-item-label>{{ skill.name }}</q-item-label>
            <q-item-label caption>{{ skill.attrAbbr }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center">
              <q-btn
                round
                dense
                flat
                size="sm"
                icon="remove"
                :aria-label="`Decrease ${skill.name} rank`"
                :disable="getSkillRank(skill.id) <= 0"
                @click="decrementSkill(skill.id)"
              />
              <div
                class="text-body1 q-mx-sm"
                style="min-width: 30px; text-align: center"
                :aria-label="`${skill.name} rank: ${getSkillRank(skill.id)}`"
              >
                {{ getSkillRank(skill.id) }}
              </div>
              <q-btn
                round
                dense
                flat
                size="sm"
                icon="add"
                :aria-label="`Increase ${skill.name} rank`"
                :disable="getSkillRank(skill.id) >= maxSkillRank || pointsRemaining <= 0"
                @click="incrementSkill(skill.id)"
              />
              <q-input
                :model-value="getSkillModifier(skill.id)"
                :aria-label="`${skill.name} modifier`"
                type="number"
                dense
                outlined
                class="modifier-input q-ml-sm"
                prefix="+"
                @update:model-value="setSkillModifier(skill.id, $event)"
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
import { useStepValidation } from 'src/composables/useStepValidation';
import type { SkillsBudgetValidation } from 'src/utils/characterValidation';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();
const { budget } = useStepValidation();

const skillsBudget = computed(() => budget('skills') as SkillsBudgetValidation);
const pointsRemaining = computed(() => skillsBudget.value.remaining);
const pointsBudget = computed(() => skillsBudget.value.budget);
const maxSkillRank = computed(() => skillsBudget.value.maxRank);

// Group skills by attribute type (physical, cognitive, spiritual)
const skillGroups = computed(() => {
  return classifiers.attributeTypes.map((attrType) => {
    // Get attribute IDs for this type
    const attrIds = classifiers.attributes
      .filter((a) => a.attrTypeId === attrType.id)
      .map((a) => a.id);

    // Get skills for these attributes
    const skills = classifiers.skills
      .filter((s) => attrIds.includes(s.attrId))
      .map((skill) => {
        const attr = classifiers.getById(classifiers.attributes, skill.attrId);
        return {
          ...skill,
          attrAbbr: attr?.code.toUpperCase() ?? '',
        };
      });

    return {
      typeId: attrType.id,
      typeName: attrType.name,
      skills,
    };
  });
});

function getSkillRank(skillId: number): number {
  return heroStore.getSkillRank(skillId);
}

function getSkillModifier(skillId: number): number {
  return heroStore.hero?.skills.find((s) => s.skillId === skillId)?.modifier ?? 0;
}

function setSkillModifier(skillId: number, value: string | number | null) {
  if (value === null) return;
  const numValue = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(numValue)) return;
  heroStore.setSkillModifier(skillId, numValue);
}

function incrementSkill(skillId: number) {
  const current = getSkillRank(skillId);
  if (current < maxSkillRank.value && pointsRemaining.value > 0) {
    heroStore.setSkillRank(skillId, current + 1);
  }
}

function decrementSkill(skillId: number) {
  const current = getSkillRank(skillId);
  if (current > 0) {
    heroStore.setSkillRank(skillId, current - 1);
  }
}
</script>
