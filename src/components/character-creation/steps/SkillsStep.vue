<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">Allocate skill ranks</div>
    <div class="text-caption q-mb-md">
      Points remaining:
      <strong :class="pointsRemaining >= 0 ? 'text-positive' : 'text-negative'">{{
        pointsRemaining
      }}</strong>
      / {{ pointBudgets.skills }}
    </div>

    <!-- Skill Groups -->
    <div v-for="group in skillGroups" :key="group.name" class="q-mb-md">
      <div class="text-subtitle2 q-mb-sm" :class="`text-${group.color}`">
        {{ group.name }} Skills
      </div>

      <q-list bordered separator>
        <q-item v-for="skill in group.skills" :key="skill.id">
          <q-item-section>
            <q-item-label>{{ skill.name }}</q-item-label>
            <q-item-label caption>{{ getAttrAbbr(skill.attrId) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center">
              <q-btn
                round
                dense
                flat
                size="sm"
                icon="remove"
                :disable="getSkillRank(skill.id) <= 0"
                @click="decrementSkill(skill.id)"
              />
              <div class="text-body1 q-mx-sm" style="min-width: 20px; text-align: center">
                {{ getSkillRank(skill.id) }}
              </div>
              <q-btn
                round
                dense
                flat
                size="sm"
                icon="add"
                :disable="getSkillRank(skill.id) >= 5 || pointsRemaining <= 0"
                @click="incrementSkill(skill.id)"
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
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';

const store = useCharacterCreationStore();
const classifiers = useClassifierStore();

const pointBudgets = computed(() => store.pointBudgets);
const pointsRemaining = computed(() => store.skillPointsRemaining);

// Group skills by attribute type
const skillGroups = computed(() => {
  const physicalAttrs = [1, 2]; // STR, SPD
  const cognitiveAttrs = [3, 4]; // INT, WIL
  const spiritualAttrs = [5, 6]; // AWA, PRE

  return [
    {
      name: 'Physical',
      color: 'red',
      skills: classifiers.skills.filter((s) => physicalAttrs.includes(s.attrId)),
    },
    {
      name: 'Cognitive',
      color: 'blue',
      skills: classifiers.skills.filter((s) => cognitiveAttrs.includes(s.attrId)),
    },
    {
      name: 'Spiritual',
      color: 'purple',
      skills: classifiers.skills.filter((s) => spiritualAttrs.includes(s.attrId)),
    },
  ];
});

function getAttrAbbr(attrId: number): string {
  const abbrs: Record<number, string> = {
    1: 'STR',
    2: 'SPD',
    3: 'INT',
    4: 'WIL',
    5: 'AWA',
    6: 'PRE',
  };
  return abbrs[attrId] || '';
}

function getSkillRank(skillId: number): number {
  const alloc = store.skills.allocations.find((s) => s.skillId === skillId);
  return alloc?.rank || 0;
}

function incrementSkill(skillId: number) {
  const current = getSkillRank(skillId);
  if (current < 5 && pointsRemaining.value > 0) {
    store.setSkillRank(skillId, current + 1);
  }
}

function decrementSkill(skillId: number) {
  const current = getSkillRank(skillId);
  if (current > 0) {
    store.setSkillRank(skillId, current - 1);
  }
}
</script>
