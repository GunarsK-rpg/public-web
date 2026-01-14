<template>
  <q-expansion-item
    aria-label="Singer ancestry talents"
    default-opened
    header-class="banner-ancestry-path"
    expand-icon-class="text-white"
  >
    <template v-slot:header>
      <q-item-section avatar>
        <q-icon name="sym_o_change_circle" color="white" aria-hidden="true" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-white text-weight-medium"> Singer Ancestry </q-item-label>
        <q-item-label class="text-white text-secondary-emphasis" caption>
          {{ selectedTalentCount }} talents selected
        </q-item-label>
      </q-item-section>
    </template>

    <q-card>
      <q-card-section>
        <!-- Key Talent (auto-granted) -->
        <div class="q-mb-md">
          <KeyTalentBanner :talent="keyTalent" />
        </div>

        <!-- Ancestry Talents -->
        <TalentListPanel
          label="Ancestry Talents"
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
import { findByCode } from 'src/utils/arrayUtils';
import KeyTalentBanner from './KeyTalentBanner.vue';
import TalentListPanel from './TalentListPanel.vue';
import type { Talent } from 'src/types';

defineEmits<{
  toggleTalent: [talentId: number, available: boolean];
  showDetails: [talent: Talent];
}>();

const classifiers = useClassifierStore();
const { getTalentsByAncestry, getAncestryKeyTalent, mapTalentsWithStatus, isTalentSelected } =
  useTalentPrerequisites();

const singerAncestryId = computed(() => {
  const singer = findByCode(classifiers.ancestries, 'singer');
  return singer?.id;
});

const keyTalent = computed(() =>
  singerAncestryId.value ? getAncestryKeyTalent(singerAncestryId.value) : null
);

const selectedTalentCount = computed(() => {
  if (!singerAncestryId.value) return 0;
  const ancestryTalents = getTalentsByAncestry(singerAncestryId.value);
  return ancestryTalents.filter((t) => isTalentSelected(t.id)).length;
});

const talentsWithStatus = computed((): TalentWithStatus[] => {
  if (!singerAncestryId.value) return [];
  const talents = getTalentsByAncestry(singerAncestryId.value).filter((t) => !t.isKey);
  return mapTalentsWithStatus(talents);
});
</script>
