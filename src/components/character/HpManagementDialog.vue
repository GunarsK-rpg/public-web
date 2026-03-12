<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="hp-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="hp-dialog-card" role="dialog">
      <q-card-section>
        <div class="row items-center no-wrap">
          <div id="hp-dialog-title" class="text-h6">HP</div>
          <q-space />
          <div class="text-h6">{{ currentHp }} / {{ maxHp }}</div>
        </div>
        <q-linear-progress
          :value="progressValue"
          color="negative"
          track-color="grey-6"
          class="q-mt-xs"
          :aria-valuenow="currentHp"
          :aria-valuemax="maxHp"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model.number="inputValue"
          outlined
          dense
          type="number"
          label="Amount"
          class="hp-input"
          :min="0"
          @keydown="blockInvalidKeys"
          inputmode="numeric"
        />
        <div class="row q-gutter-sm q-mt-sm">
          <q-btn
            class="col heal-btn"
            label="Heal"
            color="positive"
            :disable="healDisabled"
            @click="applyHeal"
          />
          <q-btn
            class="col damage-btn"
            label="Damage"
            color="negative"
            :disable="damageDisabled"
            @click="applyDamage"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-subtitle2 q-mb-xs">Set HP</div>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model.number="overrideValue"
            outlined
            dense
            type="number"
            label="Value"
            class="override-input col"
            :min="0"
            :max="maxHp"
            @keydown="blockInvalidKeys"
            inputmode="numeric"
          />
          <q-btn class="set-btn" flat label="Set" :disable="setDisabled" @click="applyOverride" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { clamp } from 'src/utils/numberUtils';

const props = defineProps<{
  modelValue: boolean;
  currentHp: number;
  maxHp: number;
  saving: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  update: [value: number];
}>();

const inputValue = ref<number | null>(null);
const overrideValue = ref<number | null>(null);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      inputValue.value = null;
      overrideValue.value = null;
    }
  }
);

const progressValue = computed(() => {
  if (props.maxHp <= 0) return 0;
  return clamp(props.currentHp / props.maxHp, 0, 1);
});

const parsedInput = computed(() => {
  const v = inputValue.value;
  if (v == null || !Number.isFinite(v)) return 0;
  return Math.floor(Math.abs(v));
});

const parsedOverride = computed(() => {
  const v = overrideValue.value;
  if (v == null || !Number.isFinite(v)) return null;
  return Math.floor(Math.abs(v));
});

const healResult = computed(() => clamp(props.currentHp + parsedInput.value, 0, props.maxHp));
const damageResult = computed(() => clamp(props.currentHp - parsedInput.value, 0, props.maxHp));

const healDisabled = computed(
  () => props.saving || parsedInput.value === 0 || props.currentHp >= props.maxHp
);
const damageDisabled = computed(
  () => props.saving || parsedInput.value === 0 || props.currentHp <= 0
);
const setDisabled = computed(() => props.saving || parsedOverride.value == null);

function blockInvalidKeys(e: KeyboardEvent) {
  if (['-', '+', '.', ',', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
}

function applyHeal() {
  emit('update', healResult.value);
  close();
}

function applyDamage() {
  emit('update', damageResult.value);
  close();
}

function applyOverride() {
  if (parsedOverride.value != null) {
    emit('update', clamp(parsedOverride.value, 0, props.maxHp));
    close();
  }
}

function close() {
  emit('update:modelValue', false);
  inputValue.value = null;
  overrideValue.value = null;
}
</script>

<style scoped>
.hp-dialog-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
