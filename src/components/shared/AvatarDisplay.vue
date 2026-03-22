<template>
  <q-avatar
    :size="size"
    class="avatar-display"
    :class="{ 'cursor-pointer': expandable && src, 'avatar-has-image': !!src }"
    @click="onClick"
  >
    <img v-if="src" :src="src" :alt="alt" />
    <User v-else :size="iconSize" class="text-grey-5" />
  </q-avatar>

  <q-dialog v-if="expandable" v-model="showExpanded">
    <q-card class="avatar-expanded-card">
      <img :src="src!" :alt="alt" class="avatar-expanded-img" />
      <q-btn
        flat
        dense
        round
        size="sm"
        color="white"
        class="avatar-expanded-close"
        aria-label="Close"
        @click="showExpanded = false"
      >
        <X :size="20" />
      </q-btn>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { User, X } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    src: string | null;
    size?: string;
    alt?: string;
    expandable?: boolean;
  }>(),
  {
    size: '48px',
    alt: '',
    expandable: false,
  }
);

const emit = defineEmits<{
  click: [];
}>();

const showExpanded = ref(false);
const iconSize = computed(() => Math.round(parseInt(props.size) / 2));

function onClick(): void {
  if (props.expandable && props.src) {
    showExpanded.value = true;
  }
  emit('click');
}
</script>

<style scoped>
.avatar-has-image {
  outline: 2px solid var(--cosmere-gold-muted);
  outline-offset: -2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.avatar-expanded-card {
  background: transparent;
  box-shadow: none;
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
}

.avatar-expanded-img {
  display: block;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-expanded-close {
  position: absolute;
  top: 4px;
  right: 4px;
}
</style>
