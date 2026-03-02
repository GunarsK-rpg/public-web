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
                :disable="getSkillRank(skill.id) <= (skill.minRank ?? 0)"
                @click="decrementSkill(skill.id, skill.minRank)"
              />
              <div
                class="text-body1 q-mx-sm value-display"
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
                :min="MIN_SKILL_MODIFIER"
                :max="MAX_SKILL_MODIFIER"
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
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useStepValidation } from 'src/composables/useStepValidation';
import { groupByKey, buildIdCodeMap, findById } from 'src/utils/arrayUtils';
import { normalizeModifierInput } from 'src/composables/useModifierInput';
import { MIN_SKILL_MODIFIER, MAX_SKILL_MODIFIER } from 'src/constants';
import BudgetDisplay from '../shared/BudgetDisplay.vue';

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const classifiers = useClassifierStore();
const talentStore = useHeroTalentsStore();
const { budget } = useStepValidation();

const skillsBudget = computed(() => budget('skills'));
const pointsRemaining = computed(() => skillsBudget.value.remaining);
const pointsBudget = computed(() => skillsBudget.value.budget);
const maxSkillRank = computed(() => skillsBudget.value.maxRank);

// Base skills + hero's active surge skills
const visibleSkills = computed(() => {
  const order = findById(classifiers.radiantOrders, talentStore.radiantOrderId ?? 0);
  const surgeIds = order ? new Set([order.surge1.id, order.surge2.id]) : null;
  return classifiers.skills.filter(
    (s) => !s.surge || (surgeIds && s.surge && surgeIds.has(s.surge.id)),
  );
});

// Group by attribute type using chained FK lookup (skill -> attribute -> attributeType)
const skillsByAttrType = computed(() => {
  const attrToTypeMap: Record<number, number> = {};
  for (const attr of classifiers.attributes) {
    attrToTypeMap[attr.id] = attr.attrType.id;
  }
  return groupByKey(visibleSkills.value, (skill) => attrToTypeMap[skill.attr.id] ?? 0);
});

// Pre-computed attribute code map for O(1) lookups
const attributeCodeMap = computed(() => buildIdCodeMap(classifiers.attributes));

// Build skill groups with attribute abbreviations
const skillGroups = computed(() => {
  return classifiers.attributeTypes.map((attrType) => {
    const skills = (skillsByAttrType.value[attrType.id] ?? []).map((skill) => ({
      ...skill,
      attrAbbr: (attributeCodeMap.value.get(skill.attr.id) ?? '').toUpperCase(),
      minRank: skill.surge ? 1 : 0,
    }));

    return {
      typeId: attrType.id,
      typeName: attrType.name,
      skills,
    };
  });
});

function getSkillRank(skillId: number): number {
  return attrStore.getSkillRank(skillId);
}

function getSkillModifier(skillId: number): number {
  return heroStore.skills.find((s) => s.skill.id === skillId)?.modifier ?? 0;
}

function setSkillModifier(skillId: number, value: string | number | null) {
  const normalized = normalizeModifierInput(value, MIN_SKILL_MODIFIER, MAX_SKILL_MODIFIER);
  if (normalized !== null) {
    attrStore.setSkillModifier(skillId, normalized);
  }
}

function incrementSkill(skillId: number) {
  const current = getSkillRank(skillId);
  if (current < maxSkillRank.value && pointsRemaining.value > 0) {
    attrStore.setSkillRank(skillId, current + 1);
  }
}

function decrementSkill(skillId: number, minRank = 0) {
  const current = getSkillRank(skillId);
  if (current > minRank) {
    attrStore.setSkillRank(skillId, current - 1);
  }
}
</script>
