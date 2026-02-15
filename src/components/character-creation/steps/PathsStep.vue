<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Choose your heroic paths and talents</div>

    <!-- Path Selection -->
    <div class="text-subtitle2 q-mb-sm">Heroic Paths</div>
    <div class="row q-col-gutter-md q-mb-md" role="group" aria-label="Select heroic paths">
      <div v-for="path in heroicPaths" :key="path.id" class="col-12 col-sm-6 col-md-4">
        <SelectableCard
          :title="path.name"
          :subtitle="path.description ?? ''"
          :selected="isPathSelected(path.id)"
          :aria-label="`${path.name} path`"
          multi-select
          @select="togglePath(path.id)"
        />
      </div>
    </div>

    <!-- Selected Paths with Specialties and Talents -->
    <q-list v-if="selectedPaths.length > 0" bordered class="rounded-borders q-mb-md">
      <HeroicPathPanel
        v-for="selection in selectedPaths"
        :key="selection.pathId"
        :path-id="selection.pathId"
        :specialty-id="selection.specialtyId"
        :default-opened="selectedPaths.length === 1"
        @remove="togglePath(selection.pathId)"
        @update:specialty-id="setSpecialty(selection.pathId, $event)"
        @toggle-talent="handleToggleTalent"
        @show-details="showTalentDetails"
      />
    </q-list>

    <!-- Singer Ancestry Talents -->
    <q-list v-if="isSinger" bordered class="rounded-borders q-mb-md">
      <SingerAncestryPanel @toggle-talent="handleToggleTalent" @show-details="showTalentDetails" />
    </q-list>

    <!-- Radiant Path (Optional) -->
    <div class="row items-center q-mb-sm">
      <div class="text-subtitle2">Radiant Path (Optional)</div>
      <q-space />
      <q-toggle
        :model-value="isRadiant"
        label="Become a Radiant"
        @update:model-value="toggleRadiant"
      />
    </div>

    <!-- Radiant Order Selection -->
    <template v-if="isRadiant">
      <div class="row q-col-gutter-md q-mb-md" role="group" aria-label="Select Radiant Order">
        <div v-for="order in radiantOrders" :key="order.id" class="col-12 col-sm-6 col-md-4">
          <SelectableCard
            :title="order.name"
            :subtitle="getOrderSubtitle(order)"
            :selected="radiantOrderId === order.id"
            :aria-label="`${order.name} order`"
            @select="setRadiantOrder(order.id)"
          />
        </div>
      </div>

      <!-- Selected Radiant Order Panel -->
      <q-list v-if="radiantOrderId" bordered class="rounded-borders q-mb-md">
        <RadiantPathPanel
          :order-id="radiantOrderId"
          :ideal-level="idealLevel"
          @remove="toggleRadiant(false)"
          @update:ideal-level="setIdealLevel"
          @toggle-talent="handleToggleTalent"
          @show-details="showTalentDetails"
        />
      </q-list>
    </template>

    <!-- Talent Detail Dialog -->
    <TalentDetailDialog
      v-model="talentDialogOpen"
      :talent="selectedTalentForDetails"
      :format-prereq="formatPrereq"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted, watch } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { useTalentPrerequisites } from 'src/composables/useTalentPrerequisites';
import { findById } from 'src/utils/arrayUtils';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';
import SelectableCard from '../shared/SelectableCard.vue';
import HeroicPathPanel from '../shared/HeroicPathPanel.vue';
import SingerAncestryPanel from '../shared/SingerAncestryPanel.vue';
import RadiantPathPanel from '../shared/RadiantPathPanel.vue';
import TalentDetailDialog from '../shared/TalentDetailDialog.vue';
import type { Talent } from 'src/types';

// UI state for tracking selected paths during wizard
interface PathSelection {
  pathId: number;
  specialtyId: number | undefined;
}

const heroStore = useHeroStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();
const deletionTracker = inject<DeletionTracker>('deletionTracker');
const { getPathKeyTalent, getSpecialtiesByPath, toggleTalent, formatPrereq } =
  useTalentPrerequisites();

// Dialog state
const talentDialogOpen = ref(false);
const selectedTalentForDetails = ref<Talent | null>(null);

// Local UI state for path selections
const selectedPathIds = ref<number[]>([]);
const pathSpecialties = ref<Map<number, number>>(new Map());

// Basic computed values
const heroicPaths = computed(() => classifiers.paths);
const radiantOrders = computed(() => classifiers.radiantOrders);
const isRadiant = computed(() => talentStore.isRadiant);
const isSinger = computed(() => talentStore.isSinger);
const radiantOrderId = computed(() => talentStore.radiantOrderId);
const idealLevel = computed(() => talentStore.radiantIdeal);

function getOrderSubtitle(order: {
  surge1?: { id: number } | null;
  surge2?: { id: number } | null;
}): string {
  const surge1 = order.surge1?.id ? findById(classifiers.surges, order.surge1.id)?.name : null;
  const surge2 = order.surge2?.id ? findById(classifiers.surges, order.surge2.id)?.name : null;
  if (surge1 && surge2) return `${surge1} · ${surge2}`;
  if (surge1) return surge1;
  return '';
}

// Sync local UI state from hero store (for edit mode)
function syncLocalStateFromHero() {
  const pathIds = new Set<number>();
  const specialties = new Map<number, number>();

  for (const ht of heroStore.talents) {
    const talent = findById(classifiers.talents, ht.talent.id);
    if (talent?.path?.id) {
      pathIds.add(talent.path.id);
      const firstSpecialty = talent.specialties?.[0];
      if (firstSpecialty) {
        const specialty = findById(classifiers.specialties, firstSpecialty.id);
        if (specialty?.path.id) {
          specialties.set(specialty.path.id, firstSpecialty.id);
        }
      }
    }
  }

  selectedPathIds.value = Array.from(pathIds);
  pathSpecialties.value = specialties;
}

onMounted(() => {
  syncLocalStateFromHero();
});

watch(
  () => heroStore.hero?.talents.length,
  () => {
    syncLocalStateFromHero();
  }
);

// Derive selected paths from hero's talents
const selectedPaths = computed((): PathSelection[] => {
  return selectedPathIds.value.map((pathId) => ({
    pathId,
    specialtyId: pathSpecialties.value.get(pathId),
  }));
});

// Path actions
function isPathSelected(pathId: number): boolean {
  return selectedPathIds.value.includes(pathId);
}

function togglePath(pathId: number) {
  if (isPathSelected(pathId)) {
    selectedPathIds.value = selectedPathIds.value.filter((id) => id !== pathId);
    pathSpecialties.value.delete(pathId);
    const keyTalent = getPathKeyTalent(pathId);
    if (keyTalent) {
      // Track talent deletion before removing from local state
      const heroTalent = heroStore.hero?.talents.find((t) => t.talent.id === keyTalent.id);
      if (heroTalent) {
        deletionTracker?.trackDeletion('talents', heroTalent.id);
      }
      talentStore.removeTalent(keyTalent.id);
    }
  } else {
    selectedPathIds.value.push(pathId);
    talentStore.addKeyTalentForPath(pathId);
    const specialties = getSpecialtiesByPath(pathId);
    const firstSpecialty = specialties[0];
    if (firstSpecialty) {
      pathSpecialties.value.set(pathId, firstSpecialty.id);
    }
  }
}

function setSpecialty(pathId: number, specialtyId: number) {
  pathSpecialties.value.set(pathId, specialtyId);
}

// Track radiant talent deletions before order change/removal
function trackRadiantTalentDeletions() {
  if (!heroStore.hero?.radiantOrder) return;
  const prevOrderId = heroStore.hero.radiantOrder.id;
  const prevOrder = findById(classifiers.radiantOrders, prevOrderId);
  if (!prevOrder) return;

  const radiantClassifierIds = new Set<number>();
  for (const talent of classifiers.talents) {
    if (
      talent.radiantOrder?.id === prevOrder.id ||
      talent.surge?.id === prevOrder.surge1?.id ||
      talent.surge?.id === prevOrder.surge2?.id
    ) {
      radiantClassifierIds.add(talent.id);
    }
  }

  for (const ht of heroStore.hero.talents) {
    if (radiantClassifierIds.has(ht.talent.id)) {
      deletionTracker?.trackDeletion('talents', ht.id);
    }
  }
}

// Radiant actions
function toggleRadiant(value: boolean) {
  if (value) {
    const firstOrder = classifiers.radiantOrders[0];
    if (firstOrder) {
      trackRadiantTalentDeletions();
      talentStore.setRadiantOrder(firstOrder.id);
    }
  } else {
    trackRadiantTalentDeletions();
    talentStore.setRadiantOrder(null);
  }
}

function setRadiantOrder(orderId: number) {
  trackRadiantTalentDeletions();
  talentStore.setRadiantOrder(orderId);
}

function setIdealLevel(level: number | null) {
  if (level !== null) {
    talentStore.setRadiantIdeal(level);
  }
}

// Talent actions
function handleToggleTalent(talentId: number, available: boolean) {
  // Track deletion if talent is being removed (already selected)
  const heroTalent = heroStore.hero?.talents.find((t) => t.talent.id === talentId);
  if (heroTalent) {
    deletionTracker?.trackDeletion('talents', heroTalent.id);
  }
  toggleTalent(talentId, available);
}

function showTalentDetails(talent: Talent) {
  selectedTalentForDetails.value = talent;
  talentDialogOpen.value = true;
}
</script>
