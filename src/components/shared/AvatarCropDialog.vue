<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
    @show="initCropper"
    @hide="destroyCropper"
  >
    <q-card class="crop-card">
      <q-card-section class="text-h6">Crop Avatar</q-card-section>

      <div ref="containerEl" class="crop-container">
        <img ref="imageEl" :src="imageSrc" alt="Crop preview" />
      </div>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="onCancel" />
        <q-btn color="primary" label="Save" :loading="saving" @click="onConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';
import Cropper from 'cropperjs';
import { logger } from 'src/utils/logger';

const $q = useQuasar();

const CROP_SIZE = 256;

defineProps<{
  modelValue: boolean;
  imageSrc: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [file: File];
}>();

const imageEl = ref<HTMLImageElement | null>(null);
const saving = ref(false);
let cropper: Cropper | null = null;

onBeforeUnmount(() => destroyCropper());

function onKeyDown(event: KeyboardEvent): void {
  if (!cropper) return;
  if (event.key === 'Delete' || (event.key === 'Backspace' && event.metaKey)) {
    event.preventDefault();
    return;
  }
  if (event.key === '+' || event.key === '=') {
    event.preventDefault();
    cropper.getCropperImage()?.$zoom(0.1);
  } else if (event.key === '-') {
    event.preventDefault();
    cropper.getCropperImage()?.$zoom(-0.1);
  }
}

function initCropper(): void {
  if (!imageEl.value) return;
  destroyCropper();
  document.addEventListener('keydown', onKeyDown, true);
  cropper = new Cropper(imageEl.value, {
    template: `
      <cropper-canvas background>
        <cropper-image
          translatable
          scalable
          initial-center-size="contain"
        ></cropper-image>
        <cropper-shade hidden></cropper-shade>
        <cropper-handle action="move" plain></cropper-handle>
        <cropper-selection
          initial-coverage="0.8"
          aspect-ratio="1"
          movable
          resizable
          outlined
          keyboard
        >
          <cropper-handle action="move" plain></cropper-handle>
          <cropper-handle action="n-resize"></cropper-handle>
          <cropper-handle action="e-resize"></cropper-handle>
          <cropper-handle action="s-resize"></cropper-handle>
          <cropper-handle action="w-resize"></cropper-handle>
          <cropper-handle action="ne-resize"></cropper-handle>
          <cropper-handle action="nw-resize"></cropper-handle>
          <cropper-handle action="se-resize"></cropper-handle>
          <cropper-handle action="sw-resize"></cropper-handle>
        </cropper-selection>
      </cropper-canvas>
    `,
  });
}

function destroyCropper(): void {
  document.removeEventListener('keydown', onKeyDown, true);
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function onCancel(): void {
  emit('update:modelValue', false);
}

async function onConfirm(): Promise<void> {
  if (!cropper || saving.value) return;
  const active = cropper;
  saving.value = true;
  try {
    const selection = active.getCropperSelection();
    if (!selection) return;
    const canvas = await selection.$toCanvas({
      width: CROP_SIZE,
      height: CROP_SIZE,
    });
    if (cropper !== active) return;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.85)
    );
    if (cropper !== active) return;
    if (!blob) {
      $q.notify({ message: 'Failed to create avatar image', type: 'negative', timeout: 2000 });
      return;
    }
    const file = new File([blob], 'avatar.webp', { type: 'image/webp' });
    emit('confirm', file);
    emit('update:modelValue', false);
  } catch (err) {
    logger.error('Avatar crop failed', err instanceof Error ? err : undefined);
    $q.notify({ message: 'Failed to create avatar image', type: 'negative', timeout: 2000 });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.crop-card {
  width: 360px;
  max-width: calc(90vw);
}

.crop-container {
  margin: 0 16px 16px;
  height: 300px;
  overflow: hidden;
  position: relative;
}

.crop-container img {
  display: block;
  max-width: 100%;
}

/* Force cropper canvas to fill the container */
.crop-container :deep(cropper-canvas) {
  width: 100%;
  height: 300px;
}

/* Circular crop mask on the selection */
.crop-container :deep(cropper-selection[outlined]) {
  border-radius: 50%;
  overflow: hidden;
}
</style>
