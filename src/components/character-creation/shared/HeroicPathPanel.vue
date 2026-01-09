<template>
  <q-expansion-item
    :aria-label="`${pathName} path talents and specialties`"
    :default-opened="defaultOpened"
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
          {{ specialtyName }} · {{ selectedTalentCount }} talents selected
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
        <div class="text-caption q-mb-xs">Path Talents</div>
        <q-list bordered separator class="rounded-borders">
          <TalentListItem
            v-for="talentInfo in talentsWithStatus"
            :key="talentInfo.talent.id"
            :talent="talentInfo.talent"
            :selected="isTalentSelected(talentInfo.talent.id)"
            :available="talentInfo.available"
            :unmet-prereqs="talentInfo.unmetPrereqs"
            :format-prereq="formatPrereq"
            @toggle="$emit('toggleTalent', talentInfo.talent.id, talentInfo.available)"
            @show-details="$emit('showDetails', $event)"
          />
        </q-list>
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
import TalentListItem from './TalentListItem.vue';
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
  formatPrereq,
} = useTalentPrerequisites();

const pathName = computed(() => findById(classifiers.paths, props.pathId)?.name ?? 'Unknown');

const specialtyName = computed(() => {
  if (!props.specialtyId) return 'No specialty';
  return findById(classifiers.specialties, props.specialtyId)?.name ?? 'No specialty';
});

const specialtyOptions = computed(() =>
  getSpecialtiesByPath(props.pathId).map((s) => ({
    value: s.id,
    label: s.name,
  }))
);

const keyTalent = computed(() => getPathKeyTalent(props.pathId));

const selectedTalentCount = computed(() => {
  const pathTalents = getTalentsByPath(props.pathId);
  const specialtyTalents = props.specialtyId ? getTalentsBySpecialty(props.specialtyId) : [];
  const allTalents = [...pathTalents, ...specialtyTalents];
  return allTalents.filter((t) => isTalentSelected(t.id)).length;
});

const talentsWithStatus = computed((): TalentWithStatus[] => {
  const pathTalents = getTalentsByPath(props.pathId).filter((t) => !t.isKey);
  const specialtyTalents = props.specialtyId ? getTalentsBySpecialty(props.specialtyId) : [];
  return mapTalentsWithStatus([...pathTalents, ...specialtyTalents]);
});
</script>
