<template>
  <div
    class="avatar-upload relative-position"
    :class="{ 'cursor-pointer': !readonly && !disabled && !loading }"
  >
    <AvatarDisplay :src="avatarSrc" size="80px" alt="Hero avatar" @click="onAvatarClick" />
    <q-btn
      v-if="avatarKey && !readonly && !disabled && !loading"
      flat
      dense
      round
      size="xs"
      color="negative"
      class="avatar-delete-btn"
      aria-label="Remove avatar"
      @click.stop="$emit('delete')"
    >
      <X :size="14" />
    </q-btn>
    <q-spinner-dots v-if="loading" size="20px" class="avatar-loading" />
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="onFileSelected"
    />
    <AvatarCropDialog v-model="showCrop" :image-src="cropImageSrc" @confirm="onCropConfirm" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import { useQuasar } from 'quasar';
import AvatarDisplay from './AvatarDisplay.vue';
import AvatarCropDialog from './AvatarCropDialog.vue';
import filesApi from 'src/services/filesApi';

const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10MB before crop (crop output is smaller)

const props = defineProps<{
  avatarKey: string | null;
  readonly?: boolean;
  disabled?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  upload: [file: File];
  delete: [];
}>();

const $q = useQuasar();
const fileInput = ref<HTMLInputElement | null>(null);
const showCrop = ref(false);
const cropImageSrc = ref('');

const avatarSrc = computed(() => {
  if (!props.avatarKey) return null;
  return filesApi.buildHeroAvatarUrl(props.avatarKey);
});

// Revoke object URL when crop dialog closes (cancel or confirm)
watch(showCrop, (open) => {
  if (!open && cropImageSrc.value) {
    URL.revokeObjectURL(cropImageSrc.value);
    cropImageSrc.value = '';
  }
});

function onAvatarClick(): void {
  if (props.readonly || props.disabled || props.loading) return;
  fileInput.value?.click();
}

function onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (file.size > MAX_AVATAR_SIZE) {
    $q.notify({ message: 'Image must be under 10MB', type: 'negative', timeout: 2000 });
    input.value = '';
    return;
  }

  cropImageSrc.value = URL.createObjectURL(file);
  showCrop.value = true;
  input.value = '';
}

function onCropConfirm(croppedFile: File): void {
  emit('upload', croppedFile);
}
</script>

<style scoped>
.avatar-upload {
  display: inline-block;
}

.avatar-delete-btn {
  position: absolute;
  top: -4px;
  right: -4px;
}

.avatar-loading {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
