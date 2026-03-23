<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="npc-item-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="npc-item-card" role="dialog">
      <q-card-section>
        <div id="npc-item-dialog-title" class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input v-model="form.name" label="Name *" outlined dense autofocus class="q-mb-sm" />
        <q-select
          v-if="showActivationType"
          v-model="form.activation_type"
          :options="activationTypeOptions"
          label="Activation Type *"
          outlined
          dense
          emit-value
          map-options
          behavior="menu"
          class="q-mb-sm"
        />
        <q-input
          v-model="form.display_value"
          label="Description *"
          type="textarea"
          outlined
          autogrow
          :rows="4"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close" />
        <q-btn
          flat
          color="primary"
          :label="item ? 'Save' : 'Add'"
          :disable="!isValid"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import type { NpcFeature, NpcAction } from 'src/types';

const props = defineProps<{
  modelValue: boolean;
  item: NpcFeature | NpcAction | null;
  showActivationType?: boolean;
  itemLabel?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [item: NpcFeature | NpcAction];
}>();

const classifiers = useClassifierStore();
const activationTypeOptions = computed(() =>
  classifiers.activationTypes.map((at) => ({ label: at.name, value: at.code }))
);

const form = ref({
  name: '',
  activation_type: 'action',
  display_value: '',
});

const title = computed(() => {
  const label = props.itemLabel || 'Item';
  return props.item ? `Edit ${label}` : `Add ${label}`;
});

const isValid = computed(() => {
  if (!form.value.name.trim() || !form.value.display_value.trim()) return false;
  if (props.showActivationType && !form.value.activation_type) return false;
  return true;
});

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    if (props.item) {
      form.value.name = props.item.name;
      form.value.display_value = props.item.display_value;
      form.value.activation_type =
        'activation_type' in props.item
          ? props.item.activation_type
          : (activationTypeOptions.value[0]?.value ?? 'action');
    } else {
      form.value.name = '';
      form.value.display_value = '';
      form.value.activation_type = activationTypeOptions.value[0]?.value ?? 'action';
    }
  }
);

function onSubmit() {
  if (!isValid.value) return;
  const result: NpcFeature | NpcAction = props.showActivationType
    ? {
        name: form.value.name.trim(),
        activation_type: form.value.activation_type,
        display_value: form.value.display_value.trim(),
      }
    : {
        name: form.value.name.trim(),
        display_value: form.value.display_value.trim(),
      };
  emit('save', result);
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.npc-item-card {
  min-width: min(500px, 90vw);
  max-width: 600px;
}
</style>
