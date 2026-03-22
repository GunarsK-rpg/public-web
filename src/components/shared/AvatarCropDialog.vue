<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="crop-card">
      <q-card-section class="text-h6">Crop Avatar</q-card-section>

      <div class="crop-container">
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
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const $q = useQuasar();

const CROP_SIZE = 256;

const props = defineProps<{
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

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      // Two ticks needed: first for q-dialog transition, second for img element render
      await nextTick();
      await nextTick();
      initCropper();
    } else {
      destroyCropper();
    }
  }
);

onBeforeUnmount(() => destroyCropper());

function initCropper(): void {
  if (!imageEl.value) return;
  destroyCropper();
  cropper = new Cropper(imageEl.value, {
    aspectRatio: 1,
    viewMode: 3,
    dragMode: 'move',
    autoCropArea: 0.8,
    cropBoxResizable: true,
    cropBoxMovable: true,
    guides: false,
    center: false,
    highlight: false,
    background: false,
    responsive: true,
    ready() {
      // Apply circular mask via CSS
      const cropBox = imageEl.value?.parentElement?.querySelector('.cropper-crop-box');
      if (cropBox) {
        cropBox.classList.add('cropper-circle');
      }
    },
  });
}

function destroyCropper(): void {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function onCancel(): void {
  emit('update:modelValue', false);
}

async function onConfirm(): Promise<void> {
  if (!cropper) return;
  saving.value = true;
  try {
    const canvas = cropper.getCroppedCanvas({
      width: CROP_SIZE,
      height: CROP_SIZE,
      imageSmoothingQuality: 'high',
    });
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.85)
    );
    if (!blob) {
      $q.notify({ message: 'Failed to create avatar image', type: 'negative', timeout: 2000 });
      return;
    }
    const file = new File([blob], 'avatar.webp', { type: 'image/webp' });
    emit('confirm', file);
    emit('update:modelValue', false);
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
</style>

<style>
/* Circular crop mask - unscoped to target cropperjs elements */
.cropper-circle .cropper-view-box,
.cropper-circle .cropper-face {
  border-radius: 50%;
}
</style>
