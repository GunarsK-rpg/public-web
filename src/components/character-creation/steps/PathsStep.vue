<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Choose your heroic paths and talents</div>

    <!-- Path Selection -->
    <div class="text-subtitle2 q-mb-sm">Heroic Paths</div>
    <div class="row q-col-gutter-md q-mb-md" role="group" aria-label="Select heroic paths">
      <div v-for="path in heroicPaths" :key="path.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          role="checkbox"
          tabindex="0"
          :aria-checked="isPathSelected(path.id)"
          :aria-label="`${path.name} path`"
          :class="['cursor-pointer', { 'card-selected': isPathSelected(path.id) }]"
          @click="togglePath(path.id)"
          @keydown.enter="togglePath(path.id)"
          @keydown.space.prevent="togglePath(path.id)"
        >
          <q-card-section>
            <div class="text-h6">{{ path.name }}</div>
            <div class="text-body2">{{ path.description }}</div>
          </q-card-section>
        </q-card>
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

    <!-- Radiant Order Selection & Talents -->
    <q-list v-if="isRadiant" bordered class="rounded-borders q-mb-md">
      <RadiantPathPanel
        :order-id="radiantOrderId"
        :ideal-level="idealLevel"
        @remove="toggleRadiant(false)"
        @update:order-id="setRadiantOrder"
        @update:ideal-level="setIdealLevel"
        @toggle-talent="handleToggleTalent"
        @show-details="showTalentDetails"
      />
    </q-list>

    <!-- Talent Detail Dialog -->
    <TalentDetailDialog
      v-model="talentDialogOpen"
      :talent="selectedTalentForDetails"
      :format-prereq="formatPrereq"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { useTalentPrerequisites } from 'src/composables/useTalentPrerequisites';
import { findById } from 'src/utils/arrayUtils';
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
const classifiers = useClassifierStore();
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
const isRadiant = computed(() => heroStore.isRadiant);
const isSinger = computed(() => heroStore.isSinger);
const radiantOrderId = computed(() => heroStore.hero?.radiantOrderId ?? null);
const idealLevel = computed(() => heroStore.hero?.radiantIdeal ?? 0);

// Sync local UI state from hero store (for edit mode)
function syncLocalStateFromHero() {
  const pathIds = new Set<number>();
  const specialties = new Map<number, number>();

  for (const ht of heroStore.talents) {
    const talent = findById(classifiers.talents, ht.talentId);
    if (talent?.pathId) {
      pathIds.add(talent.pathId);
      if (talent.specialtyId) {
        const specialty = findById(classifiers.specialties, talent.specialtyId);
        if (specialty?.pathId) {
          specialties.set(specialty.pathId, talent.specialtyId);
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
      heroStore.removeTalent(keyTalent.id);
    }
  } else {
    selectedPathIds.value.push(pathId);
    heroStore.addKeyTalentForPath(pathId);
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

// Radiant actions
function toggleRadiant(value: boolean) {
  if (value) {
    const firstOrder = classifiers.radiantOrders[0];
    if (firstOrder) {
      heroStore.setRadiantOrder(firstOrder.id);
    }
  } else {
    heroStore.setRadiantOrder(null);
  }
}

function setRadiantOrder(orderId: number) {
  heroStore.setRadiantOrder(orderId);
}

function setIdealLevel(level: number | null) {
  if (level !== null) {
    heroStore.setRadiantIdeal(level);
  }
}

// Talent actions
function handleToggleTalent(talentId: number, available: boolean) {
  toggleTalent(talentId, available);
}

function showTalentDetails(talent: Talent) {
  selectedTalentForDetails.value = talent;
  talentDialogOpen.value = true;
}
</script>
