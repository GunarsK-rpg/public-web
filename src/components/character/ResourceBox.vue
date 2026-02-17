<template>
  <div class="resource-box">
    <div class="resource-label">{{ label }}</div>
    <div class="resource-controls">
      <q-btn
        flat
        dense
        round
        size="xs"
        icon="remove"
        :disable="saving || current <= 0"
        @click="$emit('update', current - 1)"
      />
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
        icon="add"
        :disable="saving || (max != null && current >= max)"
        @click="$emit('update', Math.min(current + 1, max ?? Infinity))"
      />
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
  return Math.max(0, Math.min(1, props.current / props.max));
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
  const clamped = Math.min(Math.max(0, parsed), props.max ?? Infinity);
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
