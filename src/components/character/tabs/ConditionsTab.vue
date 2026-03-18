<template>
  <div>
    <!-- Grid of 14 condition cards -->
    <div class="conditions-grid">
      <div
        v-for="cond in classifiers.conditions"
        :key="cond.code"
        class="condition-card"
        :class="{
          'condition-active': isActive(cond.code),
          'condition-positive': cond.isPositive && isActive(cond.code),
          'condition-negative': !cond.isPositive && isActive(cond.code),
          'condition-interactive': !readonly && !isInjuryOnly(cond.code),
          'condition-locked': isInjuryOnly(cond.code),
        }"
        v-bind="
          readonly || isInjuryOnly(cond.code)
            ? {}
            : {
                role: 'button',
                tabindex: 0,
                'aria-label': `Toggle ${cond.name}`,
                'aria-pressed': isActive(cond.code),
              }
        "
        @click="!readonly && !isInjuryOnly(cond.code) && toggleCondition(cond)"
        @keydown.enter.space.prevent="
          !readonly && !isInjuryOnly(cond.code) && toggleCondition(cond)
        "
      >
        <div class="text-subtitle2">{{ cond.name }}</div>
      </div>
    </div>

    <!-- Enhanced inline expansion -->
    <div v-if="enhancedExpanded || enhancedInstances.length > 0" class="q-mt-md">
      <div class="text-subtitle2 q-mb-sm">Enhanced Attributes</div>
      <div
        v-for="inst in enhancedInstances"
        :key="inst.id"
        class="row items-center q-mb-xs q-gutter-sm"
      >
        <span>{{ getEnhancedLabel(inst) }}</span>
        <q-btn
          v-if="!readonly && !inst.sourceInjuryId"
          flat
          dense
          round
          size="xs"
          icon="close"
          :aria-label="`Remove enhanced: ${getEnhancedLabel(inst)}`"
          @click="removeCondition(inst.id)"
        />
      </div>
      <div v-if="!readonly" class="row items-center q-gutter-sm q-mt-xs">
        <q-select
          v-model="newEnhancedAttr"
          :options="classifiers.attributes"
          option-label="name"
          option-value="code"
          label="Attribute"
          dense
          outlined
          emit-value
          map-options
          behavior="menu"
          style="min-width: 140px"
        />
        <q-input
          v-model.number="newEnhancedValue"
          type="number"
          label="Bonus"
          :min="1"
          :max="10"
          dense
          outlined
          style="max-width: 80px"
        />
        <q-btn
          flat
          dense
          color="primary"
          label="Add"
          :disable="!canAddEnhanced"
          @click="addEnhanced"
        />
      </div>
    </div>

    <!-- Exhausted inline expansion -->
    <div v-if="exhaustedValue !== 0" class="q-mt-md">
      <div class="text-subtitle2 q-mb-sm">Exhausted Penalty</div>
      <div class="row items-center q-gutter-sm">
        <q-btn
          v-if="!readonly && manualExhausted"
          flat
          dense
          round
          icon="remove"
          aria-label="Decrease exhausted penalty"
          @click="adjustExhausted(1)"
        />
        <span class="text-h6">{{ exhaustedValue }}</span>
        <q-btn
          v-if="!readonly && manualExhausted"
          flat
          dense
          round
          icon="add"
          aria-label="Increase exhausted penalty"
          @click="adjustExhausted(-1)"
        />
      </div>
    </div>

    <!-- Afflicted inline expansion -->
    <div v-if="afflictedExpanded || afflictedInstances.length > 0" class="q-mt-md">
      <div class="text-subtitle2 q-mb-sm">Afflicted Effects</div>
      <div
        v-for="inst in afflictedInstances"
        :key="inst.id"
        class="row items-center q-mb-xs q-gutter-sm"
      >
        <span>{{ getAfflictedLabel(inst) }}</span>
        <q-btn
          v-if="!readonly && !inst.sourceInjuryId"
          flat
          dense
          round
          size="xs"
          icon="close"
          :aria-label="`Remove afflicted: ${getAfflictedLabel(inst)}`"
          @click="removeCondition(inst.id)"
        />
      </div>
      <div v-if="!readonly" class="row items-center q-gutter-sm q-mt-xs">
        <q-input
          v-model="newAfflictedDamage"
          label="Damage (e.g., 1d4 vital)"
          dense
          outlined
          style="min-width: 200px"
        />
        <q-btn
          flat
          dense
          color="primary"
          label="Add"
          :disable="!newAfflictedDamage?.trim()"
          @click="addAfflicted"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import type { Condition, HeroCondition } from 'src/types';
import { SPECIAL } from 'src/utils/specialUtils';

defineProps<{
  readonly?: boolean;
}>();

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// ===================
// STATE
// ===================
const newEnhancedAttr = ref<string | null>(null);
const newEnhancedValue = ref<number>(1);
const enhancedExpanded = ref(false);
const newAfflictedDamage = ref('');
const afflictedExpanded = ref(false);

// ===================
// COMPUTED
// ===================
const enhancedInstances = computed(() =>
  heroStore.conditions.filter((c) => c.condition.code === 'enhanced')
);

const manualExhausteds = computed(() =>
  heroStore.conditions.filter((c) => c.condition.code === 'exhausted')
);

const manualExhausted = computed(() => manualExhausteds.value.find((c) => !c.sourceInjuryId));

const exhaustedValue = computed(() =>
  manualExhausteds.value.reduce((sum, c) => sum + (c.special?.[0]?.value ?? 0), 0)
);

const afflictedInstances = computed(() =>
  heroStore.conditions.filter((c) => c.condition.code === 'afflicted')
);

const canAddEnhanced = computed(
  () => newEnhancedAttr.value && newEnhancedValue.value >= 1 && newEnhancedValue.value <= 10
);

// ===================
// HELPERS
// ===================
function isActive(code: string): boolean {
  if (code === 'enhanced' && enhancedExpanded.value) return true;
  if (code === 'afflicted' && afflictedExpanded.value) return true;
  return heroStore.conditions.some((c) => c.condition.code === code);
}

function isInjuryOnly(code: string): boolean {
  const instances = heroStore.conditions.filter((c) => c.condition.code === code);
  return instances.length > 0 && instances.every((c) => c.sourceInjuryId != null);
}

function getEnhancedLabel(inst: HeroCondition): string {
  if (!inst.special?.length) return 'Enhanced';
  const entry = inst.special[0];
  return entry?.display_value ?? 'Enhanced';
}

function getAfflictedLabel(inst: HeroCondition): string {
  if (!inst.special?.length) return 'Afflicted';
  const entry = inst.special[0];
  return entry?.display_value ?? 'Afflicted';
}

function exhaustedSpecial(value: number) {
  return [{ type: SPECIAL.EXHAUSTED_PENALTY, value, display_value: `${value} to all tests` }];
}

// ===================
// ACTIONS
// ===================
async function toggleCondition(cond: Condition): Promise<void> {
  if (!heroStore.hero) return;
  const code = cond.code;

  // Parameterized conditions: toggle shows/hides expansion, doesn't remove directly
  if (cond.isParameterized) {
    if (code === 'enhanced') {
      if (enhancedExpanded.value || enhancedInstances.value.length > 0) {
        // Collapse and remove manual instances only
        for (const inst of enhancedInstances.value) {
          if (!inst.sourceInjuryId) await heroStore.removeCondition(inst.id);
        }
        enhancedExpanded.value = false;
      } else {
        // Expand the form — user picks attribute and value
        enhancedExpanded.value = true;
      }
      return;
    }
    if (code === 'exhausted') {
      if (manualExhausted.value) {
        await heroStore.removeCondition(manualExhausted.value.id);
      } else {
        await heroStore.upsertCondition({
          heroId: heroStore.hero.id,
          condition: { code },
          special: exhaustedSpecial(-1),
        });
      }
      return;
    }
    if (code === 'afflicted') {
      if (afflictedExpanded.value || afflictedInstances.value.length > 0) {
        for (const inst of afflictedInstances.value) {
          if (!inst.sourceInjuryId) await heroStore.removeCondition(inst.id);
        }
        afflictedExpanded.value = false;
      } else {
        afflictedExpanded.value = true;
      }
      return;
    }
  }

  // Focused: auto-populate special on toggle
  if (code === 'focused') {
    if (isActive(code)) {
      const inst = heroStore.conditions.find(
        (c) => c.condition.code === 'focused' && !c.sourceInjuryId
      );
      if (inst) await heroStore.removeCondition(inst.id);
    } else {
      await heroStore.upsertCondition({
        heroId: heroStore.hero.id,
        condition: { code },
        special: [{ type: SPECIAL.FOCUSED, value: 1, display_value: 'Focus costs -1' }],
      });
    }
    return;
  }

  // Simple toggle conditions
  if (isActive(code)) {
    const inst = heroStore.conditions.find((c) => c.condition.code === code && !c.sourceInjuryId);
    if (inst) await heroStore.removeCondition(inst.id);
  } else {
    await heroStore.upsertCondition({
      heroId: heroStore.hero.id,
      condition: { code },
    });
  }
}

async function removeCondition(id: number): Promise<void> {
  await heroStore.removeCondition(id);
  // Collapse expansion when last instance removed
  if (enhancedInstances.value.length === 0) enhancedExpanded.value = false;
  if (afflictedInstances.value.length === 0) afflictedExpanded.value = false;
}

async function addEnhanced(): Promise<void> {
  if (!heroStore.hero || !newEnhancedAttr.value) return;
  const attrCode = newEnhancedAttr.value;
  const value = newEnhancedValue.value;
  const displayValue = `${attrCode.toUpperCase().slice(0, 3)} +${value}`;

  await heroStore.upsertCondition({
    heroId: heroStore.hero.id,
    condition: { code: 'enhanced' },
    special: [{ type: `attribute_${attrCode}`, value, display_value: displayValue }],
  });
  newEnhancedAttr.value = null;
  newEnhancedValue.value = 1;
}

async function adjustExhausted(delta: number): Promise<void> {
  if (!heroStore.hero || !manualExhausted.value) return;
  const currentManual = manualExhausted.value.special?.[0]?.value ?? 0;
  const newValue = currentManual + delta;
  if (newValue >= 0) {
    await heroStore.removeCondition(manualExhausted.value.id);
    return;
  }
  await heroStore.upsertCondition({
    id: manualExhausted.value.id,
    heroId: heroStore.hero.id,
    condition: { code: 'exhausted' },
    special: exhaustedSpecial(newValue),
  });
}

async function addAfflicted(): Promise<void> {
  if (!heroStore.hero || !newAfflictedDamage.value?.trim()) return;
  await heroStore.upsertCondition({
    heroId: heroStore.hero.id,
    condition: { code: 'afflicted' },
    special: [{ type: SPECIAL.AFFLICTED_DAMAGE, display_value: newAfflictedDamage.value.trim() }],
  });
  newAfflictedDamage.value = '';
}
</script>

<style scoped>
.conditions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.condition-card {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid rgba(128, 128, 128, 0.3);
  opacity: 0.5;
  transition:
    opacity 0.2s,
    border-color 0.2s;
}

.condition-interactive {
  cursor: pointer;
}

.condition-active {
  opacity: 1;
}

.condition-positive {
  border-color: var(--q-positive);
}

.condition-negative {
  border-color: var(--q-warning);
}

.condition-locked {
  cursor: not-allowed;
}
</style>
