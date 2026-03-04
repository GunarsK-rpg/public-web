<template>
  <div class="resource-box">
    <div class="resource-label">{{ label }}</div>
    <div class="resource-controls">
      <q-btn
        flat
        dense
        round
        size="xs"
        :disable="saving || current <= 0"
        :aria-label="`Decrease ${label}`"
        @click="$emit('update', current - 1)"
        ><Minus :size="20" aria-hidden="true"
      /></q-btn>
      <span
        v-if="!editing"
        class="resource-value clickable"
        role="button"
        tabindex="0"
        @click="startEdit"
        @keyup.enter="startEdit"
      >
        {{ current }}{{ max != null ? ` / ${max}` : '' }}{{ suffix ? ` ${suffix}` : '' }}
      </span>
      <span v-else class="resource-edit">
        <input
          ref="inputEl"
          v-model.number="editValue"
          type="number"
          min="0"
          :max="max"
          class="resource-input"
          @blur="commitEdit"
          @keyup.enter="commitEdit"
          @keyup.escape="cancelEdit"
        />
        <span v-if="max != null" class="resource-max"> / {{ max }}</span>
        <span v-if="suffix" class="resource-max"> {{ suffix }}</span>
      </span>
      <q-btn
        flat
        dense
        round
        size="xs"
        :disable="saving || (max != null && current >= max)"
        :aria-label="`Increase ${label}`"
        @click="$emit('update', clamp(current + 1, 0, max ?? Infinity))"
        ><Plus :size="20" aria-hidden="true"
      /></q-btn>
    </div>
    <q-linear-progress
      v-if="max != null"
      :value="progressValue"
      :color="color"
      track-color="grey-6"
      role="progressbar"
      :aria-valuenow="current"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-label="label"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { clamp } from 'src/utils/numberUtils';
import { Minus, Plus } from 'lucide-vue-next';

const props = defineProps<{
  label: string;
  current: number;
  max?: number;
  color?: string;
  suffix?: string;
  saving: boolean;
}>();

const emit = defineEmits<{
  update: [value: number];
}>();

const editing = ref(false);
const editValue = ref(0);
const inputEl = ref<HTMLInputElement>();

const progressValue = computed(() => {
  if (props.max == null || props.max <= 0) return 0;
  return clamp(props.current / props.max, 0, 1);
});

function startEdit() {
  editValue.value = props.current;
  editing.value = true;
  void nextTick(() => {
    inputEl.value?.focus();
    inputEl.value?.select();
  });
}

function cancelEdit() {
  editing.value = false;
}

function commitEdit() {
  if (!editing.value) return;
  const raw = editValue.value;
  const parsed = Number.isFinite(raw) ? raw : props.current;
  const clamped = clamp(parsed, 0, props.max ?? Infinity);
  editing.value = false;
  if (clamped !== props.current) {
    emit('update', clamped);
  }
}
</script>

<style scoped>
.resource-box {
  text-align: center;
  padding: 8px;
  border-radius: 4px;
}

.resource-label {
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  opacity: 0.7;
}

.resource-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-bottom: 4px;
  white-space: nowrap;
}

.resource-value {
  font-size: 0.85rem;
  font-weight: 600;
}

.resource-value.clickable {
  cursor: pointer;
  border-bottom: 1px dashed transparent;
}

.resource-value.clickable:hover {
  border-bottom-color: currentColor;
}

.resource-edit {
  display: inline-flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
}

.resource-input {
  width: 3em;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 4px;
  color: inherit;
  outline: none;
  padding: 0 2px;
  -moz-appearance: textfield;
}

.resource-input::-webkit-outer-spin-button,
.resource-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.resource-max {
  margin-left: 2px;
}
</style>
