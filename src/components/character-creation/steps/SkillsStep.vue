<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">Allocate skill ranks</div>
    <BudgetDisplay
      label="Points remaining"
      :remaining="pointsRemaining"
      :total="pointsBudget"
      :show-total="true"
    />

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
                role="status"
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
                :prefix="getSkillModifier(skill.id) >= 0 ? '+' : ''"
                :min="-10"
                :max="10"
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
import { groupByChainedKey, buildIdCodeMap } from 'src/utils/arrayUtils';
import { normalizeModifierInput } from 'src/composables/useModifierInput';
import BudgetDisplay from '../shared/BudgetDisplay.vue';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();
const { budget } = useStepValidation();

const skillsBudget = computed(() => budget('skills'));
const pointsRemaining = computed(() => skillsBudget.value.remaining);
const pointsBudget = computed(() => skillsBudget.value.budget);
const maxSkillRank = computed(() => skillsBudget.value.maxRank);

// Group skills by attribute type using chained FK lookup (skill -> attribute -> attributeType)
const skillsByAttrType = computed(() =>
  groupByChainedKey(classifiers.skills, 'attrId', classifiers.attributes, 'attrTypeId')
);

// Pre-computed attribute code map for O(1) lookups
const attributeCodeMap = computed(() => buildIdCodeMap(classifiers.attributes));

// Build skill groups with attribute abbreviations
const skillGroups = computed(() => {
  return classifiers.attributeTypes.map((attrType) => {
    const skills = (skillsByAttrType.value[attrType.id] ?? []).map((skill) => ({
      ...skill,
      attrAbbr: (attributeCodeMap.value.get(skill.attrId) ?? '').toUpperCase(),
    }));

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
  return heroStore.hero?.skills?.find((s) => s.skillId === skillId)?.modifier ?? 0;
}

function setSkillModifier(skillId: number, value: string | number | null) {
  const normalized = normalizeModifierInput(value, -10, 10);
  if (normalized !== null) {
    heroStore.setSkillModifier(skillId, normalized);
  }
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

<style scoped>
.modifier-input {
  width: 70px;
}

.modifier-input :deep(.q-field__native) {
  text-align: center;
}
</style>
