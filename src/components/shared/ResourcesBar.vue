<template>
  <div class="row q-col-gutter-sm">
    <div v-for="res in visibleResources" :key="res.code" :class="colClass">
      <ResourceBox
        :label="res.label"
        :current="res.current"
        :color="res.color"
        v-bind="{
          ...(res.max ? { max: res.max } : {}),
          ...(res.suffix ? { suffix: res.suffix } : {}),
        }"
        :saving="saving"
        :readonly="readonly"
        :use-dialog="!readonly && res.code === 'max_health'"
        @update="$emit('update', res.code, $event)"
        @open-dialog="showHpDialog = true"
      />
    </div>
  </div>

  <HpManagementDialog
    v-if="!readonly && hpResource"
    v-model="showHpDialog"
    :current-hp="hpResource.current"
    :max-hp="hpResource.max"
    :saving="saving"
    @update="$emit('update', 'max_health', $event)"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RPG_COLORS } from 'src/constants/theme';
import ResourceBox from './ResourceBox.vue';
import HpManagementDialog from './HpManagementDialog.vue';
import type { TypedValue, ResourceValues } from 'src/types/shared';

const props = withDefaults(
  defineProps<{
    derivedStats: TypedValue[];
    current?: ResourceValues | null | undefined;
    saving?: boolean;
    readonly?: boolean;
  }>(),
  { saving: false, readonly: false }
);

defineEmits<{
  update: [code: string, value: number];
}>();

const showHpDialog = ref(false);

const resourceDefs = [
  { code: 'max_health', label: 'HP', color: 'negative', currentKey: 'currentHp' as const },
  {
    code: 'max_focus',
    label: 'Focus',
    color: RPG_COLORS.focus,
    currentKey: 'currentFocus' as const,
  },
  {
    code: 'max_investiture',
    label: 'Investiture',
    color: RPG_COLORS.investiture,
    currentKey: 'currentInvestiture' as const,
  },
];

const visibleResources = computed(() => {
  const resources = resourceDefs
    .map((def) => {
      const stat = props.derivedStats.find((s) => s.type.code === def.code);
      if (!stat || stat.value <= 0) return null;
      const current = props.current?.[def.currentKey] ?? stat.value;
      return {
        code: def.code,
        label: def.label,
        current,
        max: stat.value,
        color: def.color,
        suffix: undefined as string | undefined,
      };
    })
    .filter((r) => r !== null);

  if (props.current?.currency != null) {
    resources.push({
      code: 'currency',
      label: 'Marks',
      current: props.current.currency,
      max: 0,
      color: RPG_COLORS.investiture,
      suffix: 'mk',
    });
  }

  return resources;
});

const hpResource = computed(() => visibleResources.value.find((r) => r.code === 'max_health'));

const colClass = computed(() => {
  const count = visibleResources.value.length;
  if (count <= 2) return 'col-6';
  if (count === 3) return 'col-4';
  return 'col-3';
});
</script>
