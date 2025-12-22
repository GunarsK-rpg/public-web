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
import { groupByChainedKey } from 'src/utils/arrayUtils';

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
const attributeCodeMap = computed(() => {
  const map = new Map<number, string>();
  for (const attr of classifiers.attributes) {
    map.set(attr.id, attr.code.toUpperCase());
  }
  return map;
});

// Build skill groups with attribute abbreviations
const skillGroups = computed(() => {
  return classifiers.attributeTypes.map((attrType) => {
    const skills = (skillsByAttrType.value[attrType.id] ?? []).map((skill) => ({
      ...skill,
      attrAbbr: attributeCodeMap.value.get(skill.attrId) ?? '',
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
  // Handle null and empty string - reset to 0
  if (value === null || value === '') {
    heroStore.setSkillModifier(skillId, 0);
    return;
  }
  const numValue = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(numValue)) return;
  // Clamp value to min/max bounds
  const clampedValue = Math.max(-10, Math.min(10, numValue));
  heroStore.setSkillModifier(skillId, clampedValue);
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
