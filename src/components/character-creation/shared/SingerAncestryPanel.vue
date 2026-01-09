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
        <div class="text-caption q-mb-xs">Ancestry Talents</div>
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
import { findByCode } from 'src/utils/arrayUtils';
import KeyTalentBanner from './KeyTalentBanner.vue';
import TalentListItem from './TalentListItem.vue';
import type { Talent } from 'src/types';

defineEmits<{
  toggleTalent: [talentId: number, available: boolean];
  showDetails: [talent: Talent];
}>();

const classifiers = useClassifierStore();
const {
  getTalentsByAncestry,
  getAncestryKeyTalent,
  mapTalentsWithStatus,
  isTalentSelected,
  formatPrereq,
} = useTalentPrerequisites();

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
