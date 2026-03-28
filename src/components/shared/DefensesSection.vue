<template>
  <div>
    <div class="section-title section-title--lg">Defenses</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <template v-if="loading">
        <div v-for="n in 4" :key="n" class="col-3">
          <q-card class="defense-card">
            <q-card-section class="text-center q-pa-sm">
              <q-skeleton type="text" width="40px" height="28px" class="q-mx-auto" />
              <q-skeleton type="text" width="60px" height="14px" class="q-mx-auto q-mt-xs" />
            </q-card-section>
          </q-card>
        </div>
      </template>
      <template v-else>
        <div v-for="def in defenses" :key="def.type.code" class="col-3">
          <q-card class="defense-card">
            <q-card-section class="text-center q-pa-sm">
              <template v-if="editable">
                <q-input
                  :model-value="def.value"
                  type="number"
                  dense
                  borderless
                  input-style="text-align: center; font-size: 1.75rem; font-weight: 700; font-variant-numeric: tabular-nums"
                  :min="0"
                  :aria-label="`Edit ${def.type.name} defense`"
                  @update:model-value="
                    $emit('update', def.type.code, Math.max(0, Number($event) || 0))
                  "
                />
              </template>
              <template v-else>
                <div class="defense-value" :aria-label="`${def.type.name} defense: ${def.value}`">
                  {{ def.value }}
                </div>
              </template>
              <div class="defense-name">{{ def.type.name }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div v-if="deflect" class="col-3">
          <q-card
            class="defense-card"
            tabindex="0"
            role="button"
            aria-haspopup="dialog"
            @keydown.enter.prevent="($event.currentTarget as HTMLElement).click()"
            @keydown.space.prevent="($event.currentTarget as HTMLElement).click()"
          >
            <q-card-section class="text-center q-pa-sm">
              <div class="defense-value" :aria-label="`Deflect: ${deflect.value}`">
                {{ deflect.value }}
              </div>
              <div class="defense-name">
                Deflect
                <Info :size="12" class="q-ml-xs" aria-hidden="true" />
              </div>
            </q-card-section>
            <InfoPopup v-if="deflectDescription">{{ deflectDescription }}</InfoPopup>
          </q-card>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Info } from 'lucide-vue-next';
import { useClassifierStore } from 'src/stores/classifiers';
import InfoPopup from 'src/components/shared/InfoPopup.vue';
import type { StatValue } from 'src/types/shared';

withDefaults(
  defineProps<{
    defenses: StatValue[];
    deflect?: StatValue | null | undefined;
    editable?: boolean;
    loading?: boolean;
  }>(),
  { editable: false, loading: false }
);

defineEmits<{
  update: [code: string, value: number];
}>();

const classifiers = useClassifierStore();
const deflectDescription = computed(
  () => classifiers.derivedStats.find((s) => s.code === 'deflect')?.description ?? ''
);
</script>

<style scoped>
.defense-card {
  height: 100%;
}

.defense-value {
  font-size: 1.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.defense-name {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
