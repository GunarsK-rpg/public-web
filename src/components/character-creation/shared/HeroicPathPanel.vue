<template>
  <q-expansion-item
    :aria-label="`${pathName} path talents and specialties`"
    :default-opened="defaultOpened"
    group="heroic-paths"
    header-class="banner-heroic-path"
    expand-icon-class="text-white"
  >
    <template v-slot:header>
      <q-item-section avatar>
        <q-icon name="sym_o_route" color="white" aria-hidden="true" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-white text-weight-medium"> {{ pathName }} Path </q-item-label>
        <q-item-label class="text-white text-secondary-emphasis" caption>
          {{ subtitleText }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          dense
          round
          icon="close"
          color="white"
          size="sm"
          aria-label="Remove path"
          @click.stop="$emit('remove')"
        >
          <q-tooltip>Remove path</q-tooltip>
        </q-btn>
      </q-item-section>
    </template>

    <q-card>
      <q-card-section>
        <!-- Specialty Selection -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">Select Specialty</div>
          <q-btn-toggle
            :model-value="specialtyId"
            :options="specialtyOptions"
            spread
            no-caps
            @update:model-value="$emit('update:specialtyId', $event)"
          />
        </div>

        <!-- Key Talent (auto-granted) -->
        <div class="q-mb-md">
          <KeyTalentBanner :talent="keyTalent" />
        </div>

        <!-- Available Talents -->
        <TalentListPanel
          label="Path Talents"
          :talents="talentsWithStatus"
          @toggle-talent="(id: number, available: boolean) => $emit('toggleTalent', id, available)"
          @show-details="(talent: Talent) => $emit('showDetails', talent)"
        />
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import {
  useTalentPrerequisites,
  type TalentWithStatus,
} from 'src/composables/useTalentPrerequisites';
import { findById } from 'src/utils/arrayUtils';
import KeyTalentBanner from './KeyTalentBanner.vue';
import TalentListPanel from './TalentListPanel.vue';
import type { Talent } from 'src/types';

const props = defineProps<{
  pathId: number;
  specialtyId: number | undefined;
  defaultOpened?: boolean;
}>();

defineEmits<{
  remove: [];
  'update:specialtyId': [specialtyId: number];
  toggleTalent: [talentId: number, available: boolean];
  showDetails: [talent: Talent];
}>();

const classifiers = useClassifierStore();
const {
  getTalentsByPath,
  getTalentsBySpecialty,
  getPathKeyTalent,
  getSpecialtiesByPath,
  mapTalentsWithStatus,
  isTalentSelected,
} = useTalentPrerequisites();

const pathName = computed(() => findById(classifiers.paths, props.pathId)?.name ?? 'Unknown');

const specialtyOptions = computed(() =>
  getSpecialtiesByPath(props.pathId).map((s) => ({
    value: s.id,
    label: s.name,
  }))
);

const keyTalent = computed(() => getPathKeyTalent(props.pathId));

const selectedTalentCount = computed(() => {
  const selectedIds = new Set<number>();
  for (const t of getTalentsByPath(props.pathId)) {
    if (isTalentSelected(t.id)) selectedIds.add(t.id);
  }
  for (const s of getSpecialtiesByPath(props.pathId)) {
    for (const t of getTalentsBySpecialty(s.id)) {
      if (isTalentSelected(t.id)) selectedIds.add(t.id);
    }
  }
  return selectedIds.size;
});

const activeSpecialtyNames = computed(() =>
  getSpecialtiesByPath(props.pathId)
    .filter((s) => getTalentsBySpecialty(s.id).some((t) => isTalentSelected(t.id)))
    .map((s) => s.name)
);

const subtitleText = computed(() => {
  const specs = activeSpecialtyNames.value.join(', ');
  const count = `${selectedTalentCount.value} talents selected`;
  return specs ? `${specs} · ${count}` : count;
});

const talentsWithStatus = computed((): TalentWithStatus[] => {
  const pathTalents = getTalentsByPath(props.pathId).filter((t) => !t.isKey);
  const specialtyTalents = props.specialtyId ? getTalentsBySpecialty(props.specialtyId) : [];
  return mapTalentsWithStatus([...pathTalents, ...specialtyTalents]);
});
</script>
