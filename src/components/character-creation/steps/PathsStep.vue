<template>
  <q-form ref="formRef" greedy>
    <div class="text-subtitle1 q-mb-sm">Choose your heroic paths and talents</div>
    <BudgetDisplay
      label="Talent slots remaining"
      :remaining="
        flexPool.budget > 0 ? Math.max(0, talentsBudget.remaining) : talentsBudget.remaining
      "
      :total="talentsBudget.budget"
      :show-total="true"
    />
    <BudgetDisplay
      v-if="flexPool.budget > 0"
      label="Flex points"
      :remaining="flexPool.remaining"
      :total="flexPool.budget"
      :show-total="true"
      suffix="shared with skills"
    />

    <!-- Tab Navigation -->
    <q-tabs
      v-model="activeTab"
      dense
      align="left"
      narrow-indicator
      mobile-arrows
      outside-arrows
      class="q-mb-md"
    >
      <q-tab name="heroic" label="Heroic Paths" />
      <q-tab name="radiant" label="Radiant" />
      <q-tab v-if="isSinger" name="singer" label="Singer" />
    </q-tabs>

    <!-- Heroic Paths Tab -->
    <div v-if="activeTab === 'heroic'">
      <q-btn outline color="primary" class="q-mb-md" @click="pathDialogOpen = true"
        ><Plus :size="20" class="on-left" aria-hidden="true" />Add Path</q-btn
      >
      <q-list v-if="selectedPaths.length > 0" bordered class="rounded-borders">
        <HeroicPathPanel
          v-for="selection in selectedPaths"
          :key="selection.pathId"
          :path-id="selection.pathId"
          :specialty-id="selection.specialtyId"
          :default-opened="selection.pathId === lastAddedPathId || selectedPaths.length === 1"
          @remove="removePath(selection.pathId)"
          @update:specialty-id="setSpecialty(selection.pathId, $event)"
          @toggle-talent="handleToggleTalent"
          @show-details="showTalentDetails"
        />
      </q-list>
    </div>

    <!-- Radiant Tab -->
    <div v-if="activeTab === 'radiant'">
      <div class="row items-center q-mb-md">
        <q-toggle
          :model-value="wantsRadiant"
          label="Become a Radiant"
          @update:model-value="toggleRadiant"
        />
      </div>
      <template v-if="wantsRadiant">
        <q-btn outline color="primary" class="q-mb-md" @click="orderDialogOpen = true"
          ><ArrowLeftRight
            v-if="radiantOrderId"
            :size="20"
            class="on-left"
            aria-hidden="true"
          /><Plus v-else :size="20" class="on-left" aria-hidden="true" />{{
            radiantOrderId ? 'Change Order' : 'Select Order'
          }}</q-btn
        >
        <q-list v-if="radiantOrderId" bordered class="rounded-borders">
          <RadiantPathPanel
            :key="radiantOrderId"
            :order-id="radiantOrderId"
            :ideal-level="idealLevel"
            @remove="toggleRadiant(false)"
            @update:ideal-level="setIdealLevel"
            @toggle-talent="handleToggleTalent"
            @show-details="showTalentDetails"
          />
        </q-list>
      </template>
    </div>

    <!-- Singer Tab -->
    <div v-if="activeTab === 'singer'">
      <q-list bordered class="rounded-borders">
        <SingerAncestryPanel
          @toggle-talent="handleToggleTalent"
          @show-details="showTalentDetails"
        />
      </q-list>
    </div>

    <!-- Dialogs -->
    <PathSelectionDialog
      v-model="pathDialogOpen"
      :selected-path-ids="selectedPathIds"
      @select="addPath"
    />
    <OrderSelectionDialog
      v-model="orderDialogOpen"
      :selected-order-id="radiantOrderId"
      @select="setRadiantOrder"
    />
    <TalentDetailDialog v-model="talentDialogOpen" :talent="selectedTalentForDetails" />
  </q-form>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted, watch } from 'vue';
import type { QForm } from 'quasar';
import { useHeroStore } from 'src/stores/hero';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { useTalentPrerequisites } from 'src/composables/useTalentPrerequisites';
import { useStepValidation } from 'src/composables/useStepValidation';
import { findById } from 'src/utils/arrayUtils';
import { Plus, ArrowLeftRight } from 'lucide-vue-next';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';
import { SPECIAL } from 'src/utils/specialUtils';
import BudgetDisplay from '../shared/BudgetDisplay.vue';
import HeroicPathPanel from '../shared/HeroicPathPanel.vue';
import SingerAncestryPanel from '../shared/SingerAncestryPanel.vue';
import RadiantPathPanel from '../shared/RadiantPathPanel.vue';
import PathSelectionDialog from '../shared/PathSelectionDialog.vue';
import OrderSelectionDialog from '../shared/OrderSelectionDialog.vue';
import TalentDetailDialog from '../shared/TalentDetailDialog.vue';
import type { Talent, HeroTalent } from 'src/types';

// UI state for tracking selected paths during wizard
interface PathSelection {
  pathId: number;
  specialtyId: number | undefined;
}

const formRef = ref<QForm | null>(null);

const heroStore = useHeroStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();
const deletionTracker = inject<DeletionTracker>('deletionTracker');
const { getSpecialtiesByPath, toggleTalent } = useTalentPrerequisites();
const { budget, flexBudget } = useStepValidation();

const talentsBudget = computed(() => budget('paths'));
const flexPool = computed(() => flexBudget.value.flex);

// Collect all classifier talent IDs belonging to a path (key + path-level + all specialties)
function getAllPathTalentIds(pathId: number): Set<number> {
  const pathSpecialtyIds = new Set(
    classifiers.specialties.filter((s) => s.path.id === pathId).map((s) => s.id)
  );

  const ids = new Set<number>();
  for (const talent of classifiers.talents) {
    // Key talent or path-level talent
    if (talent.path?.id === pathId) {
      ids.add(talent.id);
    }
    // Specialty talent (path is null, linked via specialties array)
    if (talent.specialties?.some((s) => pathSpecialtyIds.has(s.id))) {
      ids.add(talent.id);
    }
  }
  return ids;
}

// Tab and dialog state
const activeTab = ref('heroic');
const pathDialogOpen = ref(false);
const orderDialogOpen = ref(false);
const talentDialogOpen = ref(false);
const selectedTalentForDetails = ref<Talent | null>(null);

// Local UI state for path selections
const selectedPathIds = ref<number[]>([]);
const pathSpecialties = ref<Map<number, number>>(new Map());
const lastAddedPathId = ref<number | null>(null);
const wantsRadiant = ref(false);

// Basic computed values
const isSinger = computed(() => talentStore.isSinger);
const radiantOrderId = computed(() => talentStore.radiantOrderId);
const idealLevel = computed(() => talentStore.radiantIdeal);

// Reset singer tab when ancestry changes
watch(isSinger, (value) => {
  if (!value && activeTab.value === 'singer') {
    activeTab.value = 'heroic';
  }
});

// Sync local UI state from hero store (for edit mode / initial load)
function syncLocalStateFromHero() {
  const pathIds = new Set<number>();

  for (const ht of heroStore.talents) {
    const talent = findById(classifiers.talents, ht.talent.id);
    if (!talent) continue;
    // Only add path when its key talent is selected
    if (talent.path?.id && talent.isKey) {
      pathIds.add(talent.path.id);
    }
  }

  // Always default to first specialty per path
  const specialties = new Map<number, number>();
  for (const pathId of pathIds) {
    const available = getSpecialtiesByPath(pathId);
    if (available[0]) {
      specialties.set(pathId, available[0].id);
    }
  }

  selectedPathIds.value = Array.from(pathIds);
  pathSpecialties.value = specialties;
}

onMounted(() => {
  wantsRadiant.value = talentStore.isRadiant;
  syncLocalStateFromHero();
});

// Derive selected paths from hero's talents
const selectedPaths = computed((): PathSelection[] => {
  return selectedPathIds.value.map((pathId) => ({
    pathId,
    specialtyId: pathSpecialties.value.get(pathId),
  }));
});

// Path actions
function addPath(pathId: number) {
  if (selectedPathIds.value.includes(pathId)) return;
  lastAddedPathId.value = pathId;
  selectedPathIds.value.push(pathId);
  talentStore.addKeyTalentForPath(pathId);
  const specialties = getSpecialtiesByPath(pathId);
  const firstSpecialty = specialties[0];
  if (firstSpecialty) {
    pathSpecialties.value.set(pathId, firstSpecialty.id);
  }
}

function removePath(pathId: number) {
  selectedPathIds.value = selectedPathIds.value.filter((id) => id !== pathId);
  pathSpecialties.value.delete(pathId);

  // Remove all talents belonging to this path (key + path-level + specialty)
  const pathTalentIds = getAllPathTalentIds(pathId);
  const toRemove = (heroStore.hero?.talents ?? []).filter((ht) => pathTalentIds.has(ht.talent.id));
  for (const ht of toRemove) {
    if (ht.id > 0) deletionTracker?.trackDeletion('talents', ht.id);
    trackItemChoiceForDeletion(ht);
    talentStore.removeTalent(ht.talent.id);
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
    if (radiantClassifierIds.has(ht.talent.id) && ht.id > 0) {
      deletionTracker?.trackDeletion('talents', ht.id);
    }
  }
}

// Radiant actions
function toggleRadiant(value: boolean) {
  wantsRadiant.value = value;
  if (value) {
    orderDialogOpen.value = true;
  } else {
    trackRadiantTalentDeletions();
    talentStore.setRadiantOrder(null);
  }
}

function setRadiantOrder(orderId: number) {
  if (orderId === radiantOrderId.value) return;
  trackRadiantTalentDeletions();
  talentStore.setRadiantOrder(orderId);
}

function setIdealLevel(level: number | null) {
  if (level !== null) {
    talentStore.setRadiantIdeal(level);
  }
}

function trackItemChoiceForDeletion(ht: HeroTalent) {
  const itemSel = (ht.grantSelections ?? []).find((s) => s.type === SPECIAL.ITEM_CHOICE);
  for (const code of itemSel?.codes ?? []) {
    const heroEquips = heroStore.hero?.equipment.filter((e) => e.equipment?.code === code) ?? [];
    for (const equip of heroEquips) {
      if (equip.id > 0) deletionTracker?.trackDeletion('equipment', equip.id);
    }
  }
}

// Talent actions
function handleToggleTalent(talentId: number, available: boolean) {
  // Track deletion if talent is being removed (already selected)
  const heroTalent = heroStore.hero?.talents.find((t) => t.talent.id === talentId);
  if (heroTalent && heroTalent.id > 0) {
    deletionTracker?.trackDeletion('talents', heroTalent.id);
  }
  if (heroTalent) trackItemChoiceForDeletion(heroTalent);
  toggleTalent(talentId, available);
}

function showTalentDetails(talent: Talent) {
  selectedTalentForDetails.value = talent;
  talentDialogOpen.value = true;
}

async function validate(): Promise<boolean> {
  return (await formRef.value?.validate()) ?? true;
}

defineExpose({ validate });
</script>
