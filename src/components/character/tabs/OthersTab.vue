<template>
  <div class="others-tab">
    <!-- Ancestry & Culture Section -->
    <SectionPanel label="Ancestry & Culture" default-opened>
      <template #icon><Globe /></template>

      <div class="text-subtitle2 q-mb-sm">Ancestry</div>
      <div class="row items-center q-mb-md">
        <div>
          <div class="text-body1 text-weight-medium">{{ ancestry?.name ?? 'Unknown' }}</div>
          <div class="text-caption text-muted">{{ ancestry?.description }}</div>
        </div>
      </div>

      <template v-if="talentStore.isSinger && activeSingerForm">
        <div class="text-subtitle2 q-mb-sm">Current Form</div>
        <div class="row items-center q-mb-md">
          <q-chip>{{ activeSingerForm.name }}</q-chip>
        </div>
        <div v-if="activeSingerForm.description" class="text-caption q-mb-md">
          {{ activeSingerForm.description }}
        </div>
      </template>

      <div class="text-subtitle2 q-mb-sm">Cultures</div>
      <div v-if="heroStore.cultures.length === 0" class="text-empty q-mb-md">
        No cultures selected
      </div>
      <q-list v-else separator class="q-mb-md">
        <q-item v-for="heroCulture in heroStore.cultures" :key="heroCulture.id" dense>
          <q-item-section>
            <q-item-label>{{ getCultureName(heroCulture.culture?.id) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </SectionPanel>

    <!-- Goals Section -->
    <SectionPanel label="Goals">
      <template #icon><Flag /></template>

      <div v-if="heroStore.goals.length === 0" class="text-empty">No goals set</div>
      <q-list v-else separator>
        <q-item v-for="goal in heroStore.goals" :key="goal.id">
          <q-item-section>
            <q-item-label>{{ goal.name }}</q-item-label>
            <q-item-label v-if="goal.description" caption>{{ goal.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="goal-progress row items-center no-wrap">
              <q-checkbox
                v-for="step in 3"
                :key="step"
                :model-value="goal.value >= step"
                :disable="readonly"
                :aria-label="`Goal progress step ${step} of 3`"
                @update:model-value="handleGoalProgress(goal, step)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </SectionPanel>

    <!-- Connections Section -->
    <SectionPanel label="Connections">
      <template #icon><Users /></template>

      <div v-if="heroStore.connections.length === 0" class="text-empty">No connections</div>
      <q-list v-else separator>
        <q-item v-for="conn in heroStore.connections" :key="conn.id">
          <q-item-section>
            <q-item-label>{{ conn.description ?? 'Connection' }}</q-item-label>
            <q-item-label v-if="conn.notes" caption>{{ conn.notes }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="RPG_COLORS.badgeMuted">{{
              getConnectionTypeName(conn.connectionType?.id)
            }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </SectionPanel>

    <!-- Companions Section -->
    <SectionPanel label="Companions">
      <template #icon><PawPrint /></template>

      <div v-if="heroStore.companions.length === 0" class="text-empty">No companions</div>
      <q-list v-else separator>
        <q-item v-for="comp in heroStore.companions" :key="comp.id">
          <q-item-section>
            <q-item-label>{{ comp.description ?? 'Companion' }}</q-item-label>
            <q-item-label v-if="comp.notes" caption>{{ comp.notes }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="RPG_COLORS.badgeMuted">{{
              getCompanionTypeName(comp.companionType?.id)
            }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </SectionPanel>

    <!-- Biography Section -->
    <SectionPanel label="Biography">
      <template #icon><User /></template>

      <div class="text-subtitle2 q-mb-sm">Appearance</div>
      <div class="text-body2 q-mb-md">
        {{ heroAppearance }}
      </div>

      <div class="text-subtitle2 q-mb-sm">Biography</div>
      <div class="text-body2 q-mb-md">
        {{ heroBiography }}
      </div>

      <div class="text-subtitle2 q-mb-sm">Notes</div>
      <div class="text-body2">
        {{ heroNotes }}
      </div>
    </SectionPanel>

    <!-- Injuries Section -->
    <SectionPanel label="Injuries">
      <template #icon><TriangleAlert /></template>
      <template v-if="heroStore.injuries.length > 0" #header-side>
        <q-item-section side>
          <q-badge color="negative">{{ heroStore.injuries.length }}</q-badge>
        </q-item-section>
      </template>

      <div v-if="heroStore.injuries.length === 0" class="text-empty">No injuries</div>
      <q-list v-if="heroStore.injuries.length > 0" dense separator>
        <q-item v-for="injury in heroStore.injuries" :key="injury.id">
          <q-item-section>
            <q-item-label>{{ getInjuryName(injury.injury?.id) }}</q-item-label>
            <q-item-label v-if="getInjuryConditionName(injury.injury?.id)" caption>
              Applies: {{ getInjuryConditionName(injury.injury?.id) }}
            </q-item-label>
            <q-item-label v-if="injury.notes" caption>{{ injury.notes }}</q-item-label>
          </q-item-section>
          <q-item-section v-if="!readonly" side>
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="close"
              :aria-label="`Remove injury: ${getInjuryName(injury.injury?.id)}`"
              @click="handleRemoveInjury(injury)"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <q-btn
        v-if="!readonly"
        flat
        dense
        color="primary"
        label="Add Injury"
        class="q-mt-sm"
        @click="showInjuryDialog = true"
      />
    </SectionPanel>

    <AddInjuryDialog
      v-if="!readonly"
      v-model="showInjuryDialog"
      :injuries="classifiers.injuries"
      @add="handleAddInjury"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById, buildIdNameMap, makeNameGetter } from 'src/utils/arrayUtils';
import { RPG_COLORS } from 'src/constants/theme';
import { Globe, Flag, Users, PawPrint, User, TriangleAlert } from 'lucide-vue-next';
import SectionPanel from 'src/components/shared/SectionPanel.vue';
import AddInjuryDialog from 'src/components/character/AddInjuryDialog.vue';
import type { HeroInjury } from 'src/types/conditions';
import type { HeroGoal } from 'src/types/goals';

defineProps<{
  readonly?: boolean;
}>();

const heroStore = useHeroStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();

// ===================
// STATE
// ===================
const showInjuryDialog = ref(false);

// Biography fields - computed for consistency with other hero data access
const heroAppearance = computed(() => heroStore.hero?.appearance ?? 'No appearance description');
const heroBiography = computed(() => heroStore.hero?.biography ?? 'No biography');
const heroNotes = computed(() => heroStore.hero?.notes ?? 'No notes');

// Ancestry & Singer Form
const ancestry = computed(() => findById(classifiers.ancestries, heroStore.hero?.ancestry?.id));

const activeSingerForm = computed(() =>
  findById(classifiers.singerForms, heroStore.hero?.activeSingerForm?.id)
);

// Name getter functions using factory pattern
const getCultureName = makeNameGetter(computed(() => buildIdNameMap(classifiers.cultures)));
const getConnectionTypeName = makeNameGetter(
  computed(() => buildIdNameMap(classifiers.connectionTypes))
);
const getCompanionTypeName = makeNameGetter(
  computed(() => buildIdNameMap(classifiers.companionTypes))
);
const getInjuryName = makeNameGetter(computed(() => buildIdNameMap(classifiers.injuries)));

// Injury condition name lookup
function getInjuryConditionName(injuryId: number | undefined): string | null {
  if (!injuryId) return null;
  const injury = classifiers.injuries.find((i) => i.id === injuryId);
  return injury?.condition?.name ?? null;
}

// ===================
// GOAL ACTIONS
// ===================
async function handleGoalProgress(goal: HeroGoal, step: number): Promise<void> {
  const newValue = goal.value >= step ? step - 1 : step;
  await heroStore.updateGoalValue(goal.id, newValue);
}

// ===================
// INJURY ACTIONS
// ===================
async function handleAddInjury(injuryCode: string, notes: string | null): Promise<void> {
  if (!heroStore.hero) return;
  const injuryClassifier = classifiers.injuries.find((i) => i.code === injuryCode);
  if (!injuryClassifier) return;

  await heroStore.upsertInjury(
    {
      heroId: heroStore.hero.id,
      injury: { code: injuryCode },
      notes,
    },
    injuryClassifier
  );
}

async function handleRemoveInjury(injury: HeroInjury): Promise<void> {
  // Find the linked condition to auto-remove
  const injuryClassifier = classifiers.injuries.find((i) => i.id === injury.injury?.id);
  let linkedConditionId: number | undefined;

  if (injuryClassifier?.condition) {
    // Find the condition instance that was auto-applied for this injury
    const condCode = injuryClassifier.condition.code;
    const match = heroStore.conditions.find(
      (c) => c.condition.code === condCode && c.notes === `From injury: ${injuryClassifier.name}`
    );
    linkedConditionId = match?.id;
  }

  await heroStore.removeInjury(injury.id, linkedConditionId);
}
</script>

<style scoped>
.others-tab :deep(.q-expansion-item .q-item__label) {
  font-family: 'Roboto', sans-serif;
  font-variant: small-caps;
  font-weight: 700;
  font-size: 0.95rem;
}

.others-tab :deep(.q-expansion-item .q-item-section--avatar) {
  color: var(--cosmere-gold-muted);
}

.body--dark .others-tab :deep(.q-expansion-item .q-item-section--avatar) {
  color: var(--cosmere-gold);
}
</style>
