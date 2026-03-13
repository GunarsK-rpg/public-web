<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    :aria-labelledby="dialogTitleId"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="other-dialog-card" role="dialog">
      <q-card-section>
        <div :id="dialogTitleId" class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-select
          v-if="hasTypes"
          v-model="typeCode"
          :options="types"
          option-label="name"
          option-value="code"
          :label="typeLabel"
          dense
          outlined
          emit-value
          map-options
          behavior="menu"
          class="q-mb-sm"
        />
        <q-input v-model="name" label="Name" dense outlined maxlength="200" class="q-mb-sm" />
        <q-input v-model="description" label="Description" dense outlined maxlength="500" />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close" />
        <q-btn flat color="primary" label="Add" :disable="!canSave" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Classifier } from 'src/types/classifier';

const props = defineProps<{
  modelValue: boolean;
  title: string;
  typeLabel?: string;
  types?: Classifier[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  add: [name: string, description: string | null, typeCode: string | null];
}>();

const dialogTitleId = computed(
  () => `other-dialog-title-${props.title.replace(/\s+/g, '-').toLowerCase()}`
);

const hasTypes = computed(() => props.types && props.types.length > 0);

const typeCode = ref<string | null>(null);
const name = ref('');
const description = ref('');

const canSave = computed(() => {
  if (!name.value.trim()) return false;
  if (hasTypes.value && !typeCode.value) return false;
  return true;
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      typeCode.value = null;
      name.value = '';
      description.value = '';
    }
  }
);

function submit() {
  if (!canSave.value) return;
  emit('add', name.value.trim(), description.value.trim() || null, typeCode.value);
  close();
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.other-dialog-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
