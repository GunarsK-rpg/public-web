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
      <q-expansion-item
        v-for="selection in selectedPaths"
        :key="selection.pathId"
        :default-opened="selectedPaths.length === 1"
        header-class="banner-heroic-path"
        expand-icon-class="text-white"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-icon name="sym_o_route" color="white" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-white text-weight-medium">
              {{ getPathName(selection.pathId) }} Path
            </q-item-label>
            <q-item-label class="text-white text-secondary-emphasis" caption>
              {{ getSpecialtyName(selection.pathId, selection.specialtyId) }}
              · {{ selection.talentIds.length }} talents selected
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
              @click.stop="togglePath(selection.pathId)"
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
                :model-value="selection.specialtyId"
                :options="getSpecialtyOptions(selection.pathId)"
                spread
                no-caps
                @update:model-value="setSpecialty(selection.pathId, $event)"
              />
            </div>

            <!-- Key Talent (auto-granted) -->
            <div class="q-mb-md">
              <q-banner class="banner-key-talent" dense rounded>
                <template v-slot:avatar>
                  <q-icon name="sym_o_stars" />
                </template>
                <strong>Key Talent:</strong> {{ getKeyTalent(selection.pathId)?.name }}
                <div class="text-caption">
                  {{
                    getKeyTalent(selection.pathId)?.descriptionShort ||
                    getKeyTalent(selection.pathId)?.description
                  }}
                </div>
              </q-banner>
            </div>

            <!-- Available Talents -->
            <div class="text-caption q-mb-xs">Path Talents</div>
            <q-list bordered separator class="rounded-borders">
              <q-item
                v-for="talentInfo in getPathTalentsWithStatus(
                  selection.pathId,
                  selection.specialtyId
                )"
                :key="talentInfo.talent.id"
                :class="{ 'item-disabled': !talentInfo.available }"
              >
                <q-item-section avatar>
                  <q-checkbox
                    :model-value="selection.talentIds.includes(talentInfo.talent.id)"
                    :disable="
                      !talentInfo.available && !selection.talentIds.includes(talentInfo.talent.id)
                    "
                    @update:model-value="
                      toggleHeroTalent(talentInfo.talent.id, talentInfo.available)
                    "
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label :class="{ [`text-${COLORS.muted}`]: !talentInfo.available }">
                    {{ talentInfo.talent.name }}
                    <q-icon v-if="!talentInfo.available" name="lock" size="xs" class="q-ml-xs" />
                  </q-item-label>
                  <q-item-label caption>{{
                    talentInfo.talent.descriptionShort || talentInfo.talent.description
                  }}</q-item-label>
                  <!-- Show unmet prerequisites -->
                  <q-item-label
                    v-if="talentInfo.unmetPrereqs.length > 0"
                    caption
                    :class="`text-${COLORS.error}`"
                  >
                    <strong>Requires:</strong>
                    {{ talentInfo.unmetPrereqs.map(formatPrereq).join(', ') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense icon="info" @click.stop="showTalentDetails(talentInfo.talent)">
                    <q-tooltip>View details</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>

    <!-- Singer Ancestry Talents -->
    <q-list v-if="isSinger" bordered class="rounded-borders q-mb-md">
      <q-expansion-item
        default-opened
        header-class="banner-ancestry-path"
        expand-icon-class="text-white"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-icon name="sym_o_change_circle" color="white" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-white text-weight-medium"> Singer Ancestry </q-item-label>
            <q-item-label class="text-white text-secondary-emphasis" caption>
              {{ selectedAncestryTalentIds.length }} talents selected
            </q-item-label>
          </q-item-section>
        </template>

        <q-card>
          <q-card-section>
            <!-- Key Talent (auto-granted) -->
            <div class="q-mb-md">
              <q-banner class="banner-key-talent" dense rounded>
                <template v-slot:avatar>
                  <q-icon name="sym_o_stars" />
                </template>
                <strong>Key Talent:</strong> {{ singerKeyTalent?.name }}
                <div class="text-caption">
                  {{ singerKeyTalent?.descriptionShort || singerKeyTalent?.description }}
                </div>
              </q-banner>
            </div>

            <!-- Ancestry Talents -->
            <div class="text-caption q-mb-xs">Ancestry Talents</div>
            <q-list bordered separator class="rounded-borders">
              <q-item
                v-for="talentInfo in singerTalentsWithStatus"
                :key="talentInfo.talent.id"
                :class="{ 'item-disabled': !talentInfo.available }"
              >
                <q-item-section avatar>
                  <q-checkbox
                    :model-value="selectedAncestryTalentIds.includes(talentInfo.talent.id)"
                    :disable="
                      !talentInfo.available &&
                      !selectedAncestryTalentIds.includes(talentInfo.talent.id)
                    "
                    @update:model-value="
                      toggleHeroTalent(talentInfo.talent.id, talentInfo.available)
                    "
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label :class="{ [`text-${COLORS.muted}`]: !talentInfo.available }">
                    {{ talentInfo.talent.name }}
                    <q-icon v-if="!talentInfo.available" name="lock" size="xs" class="q-ml-xs" />
                  </q-item-label>
                  <q-item-label caption>{{
                    talentInfo.talent.descriptionShort || talentInfo.talent.description
                  }}</q-item-label>
                  <q-item-label
                    v-if="talentInfo.unmetPrereqs.length > 0"
                    caption
                    :class="`text-${COLORS.error}`"
                  >
                    <strong>Requires:</strong>
                    {{ talentInfo.unmetPrereqs.map(formatPrereq).join(', ') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense icon="info" @click.stop="showTalentDetails(talentInfo.talent)">
                    <q-tooltip>View details</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
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
      <q-expansion-item
        default-opened
        header-class="banner-radiant-path"
        expand-icon-class="text-white"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-icon name="sym_o_auto_awesome" color="white" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-white text-weight-medium">
              {{ getRadiantOrderName(radiantOrderId) || 'Select Order' }}
            </q-item-label>
            <q-item-label class="text-white text-secondary-emphasis" caption>
              Ideal {{ idealLevel }} · {{ selectedRadiantTalentIds.length }} talents selected
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
              @click.stop="toggleRadiant(false)"
            >
              <q-tooltip>Remove Radiant path</q-tooltip>
            </q-btn>
          </q-item-section>
        </template>

        <q-card>
          <q-card-section>
            <div class="text-caption q-mb-md">
              Choose an order of Knights Radiant to bond with a spren and gain access to surges.
            </div>

            <q-select
              :model-value="radiantOrderId"
              :options="radiantOrderOptions"
              label="Radiant Order"
              outlined
              emit-value
              map-options
              class="q-mb-md"
              @update:model-value="setRadiantOrder"
            />

            <div v-if="radiantOrderId" class="q-mb-md">
              <div class="text-caption q-mb-xs">Ideal Level (0-5)</div>
              <q-slider
                :model-value="idealLevel"
                :min="0"
                :max="5"
                :step="1"
                label
                markers
                @update:model-value="setIdealLevel"
              />
            </div>

            <!-- Radiant Key Talent -->
            <div v-if="radiantKeyTalent" class="q-mb-md">
              <q-banner class="banner-key-talent" dense rounded>
                <template v-slot:avatar>
                  <q-icon name="sym_o_stars" />
                </template>
                <strong>Order Talent:</strong> {{ radiantKeyTalent.name }}
                <div class="text-caption">
                  {{ radiantKeyTalent.descriptionShort || radiantKeyTalent.description }}
                </div>
              </q-banner>
            </div>

            <!-- Surge/Order Tab Selection -->
            <div v-if="radiantOrderId" class="q-mb-md">
              <div class="text-caption q-mb-xs">Select Talent Tree</div>
              <q-btn-toggle
                v-model="radiantTalentTab"
                :options="radiantTabOptions"
                spread
                no-caps
              />
            </div>

            <!-- Radiant Talents List (filtered by selected tab) -->
            <div class="text-caption q-mb-xs">{{ radiantTalentTabLabel }} Talents</div>
            <q-list bordered separator class="rounded-borders">
              <q-item
                v-for="talentInfo in currentRadiantTalentsWithStatus"
                :key="talentInfo.talent.id"
                :class="{ 'item-disabled': !talentInfo.available }"
              >
                <q-item-section avatar>
                  <q-checkbox
                    :model-value="isRadiantTalentSelected(talentInfo.talent.id)"
                    :disable="
                      !talentInfo.available && !isRadiantTalentSelected(talentInfo.talent.id)
                    "
                    @update:model-value="
                      toggleHeroTalent(talentInfo.talent.id, talentInfo.available)
                    "
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label :class="{ [`text-${COLORS.muted}`]: !talentInfo.available }">
                    {{ talentInfo.talent.name }}
                    <q-icon v-if="!talentInfo.available" name="lock" size="xs" class="q-ml-xs" />
                  </q-item-label>
                  <q-item-label caption>{{
                    talentInfo.talent.descriptionShort || talentInfo.talent.description
                  }}</q-item-label>
                  <q-item-label
                    v-if="talentInfo.unmetPrereqs.length > 0"
                    caption
                    :class="`text-${COLORS.error}`"
                  >
                    <strong>Requires:</strong>
                    {{ talentInfo.unmetPrereqs.map(formatPrereq).join(', ') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense icon="info" @click.stop="showTalentDetails(talentInfo.talent)">
                    <q-tooltip>View details</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-item v-if="currentRadiantTalentsWithStatus.length === 0">
                <q-item-section class="text-muted">
                  No {{ radiantTalentTabLabel }} talents available
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>

    <!-- Talent Detail Dialog -->
    <q-dialog v-model="talentDialogOpen">
      <q-card style="min-width: min(400px, 90vw); max-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ selectedTalentForDetails?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedTalentForDetails">
          <div class="text-body2" style="white-space: pre-wrap">
            {{ selectedTalentForDetails.description }}
          </div>
          <template v-if="getPrerequisitesArray(selectedTalentForDetails).length">
            <q-separator class="q-my-sm" />
            <div class="text-caption text-muted">
              <strong>Prerequisites:</strong>
              {{ getPrerequisitesArray(selectedTalentForDetails).map(formatPrereq).join(', ') }}
            </div>
          </template>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { COLORS } from 'src/constants/theme';
import type { Talent, TalentPrerequisite } from 'src/types';

interface TalentWithStatus {
  talent: Talent;
  available: boolean;
  unmetPrereqs: TalentPrerequisite[];
}

// UI state for tracking selected paths during wizard
// This is separate from heroStore.hero.talents which stores the final selections
interface PathSelection {
  pathId: number;
  specialtyId: number | undefined;
  talentIds: number[]; // Computed from hero talents for this path
}

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Dialog state
const talentDialogOpen = ref(false);
const selectedTalentForDetails = ref<Talent | null>(null);

// Local UI state for path selections (tracks which paths are expanded/selected in UI)
const selectedPathIds = ref<number[]>([]);
const pathSpecialties = ref<Map<number, number>>(new Map());

// Basic computed values
const heroicPaths = computed(() => classifiers.paths);
const isRadiant = computed(() => heroStore.isRadiant);
const isSinger = computed(() => heroStore.isSinger);

const radiantOrderId = computed(() => heroStore.hero?.radiantOrderId ?? null);
const idealLevel = computed(() => heroStore.hero?.radiantIdeal ?? 0);

const radiantOrderOptions = computed(() =>
  classifiers.radiantOrders.map((o) => ({ value: o.id, label: o.name }))
);

// Hero's selected talent IDs
const heroTalentIds = computed(() => heroStore.hero?.talents.map((t) => t.talentId) ?? []);

// Build character skills map from hero
const characterSkills = computed(() => {
  const skills = new Map<number, number>();
  for (const skill of heroStore.hero?.skills ?? []) {
    skills.set(skill.skillId, skill.rank);
  }
  return skills;
});

// Sync local UI state from hero store (for edit mode)
function syncLocalStateFromHero() {
  const pathIds = new Set<number>();
  const specialties = new Map<number, number>();

  for (const ht of heroStore.hero?.talents ?? []) {
    const talent = classifiers.getById(classifiers.talents, ht.talentId);
    if (talent?.pathId) {
      pathIds.add(talent.pathId);
      if (talent.specialtyId) {
        // Find path for this specialty
        const specialty = classifiers.getById(classifiers.specialties, talent.specialtyId);
        if (specialty?.pathId) {
          specialties.set(specialty.pathId, talent.specialtyId);
        }
      }
    }
  }

  selectedPathIds.value = Array.from(pathIds);
  pathSpecialties.value = specialties;
}

// Initialize on mount and watch for hero changes
onMounted(() => {
  syncLocalStateFromHero();
});

watch(
  () => heroStore.hero?.talents,
  () => {
    syncLocalStateFromHero();
  },
  { deep: true }
);

// Derive selected paths from hero's talents
const selectedPaths = computed((): PathSelection[] => {
  const paths: PathSelection[] = [];
  for (const pathId of selectedPathIds.value) {
    const specialtyId = pathSpecialties.value.get(pathId);
    // Get all hero talents that belong to this path or its specialty
    const pathTalentIds = heroTalentIds.value.filter((talentId) => {
      const talent = classifiers.getById(classifiers.talents, talentId);
      if (!talent) return false;
      // Talent belongs to this path directly or to the selected specialty
      return talent.pathId === pathId || (specialtyId && talent.specialtyId === specialtyId);
    });
    paths.push({
      pathId,
      specialtyId,
      talentIds: pathTalentIds,
    });
  }
  return paths;
});

// ===================
// TALENT LOOKUP HELPERS (using classifiers)
// ===================
function getTalentsByPath(pathId: number): Talent[] {
  return classifiers.talents.filter((t) => t.pathId === pathId && !t.specialtyId);
}

function getTalentsBySpecialty(specialtyId: number): Talent[] {
  return classifiers.talents.filter((t) => t.specialtyId === specialtyId);
}

function getPathKeyTalent(pathId: number): Talent | undefined {
  return classifiers.talents.find((t) => t.pathId === pathId && t.isKey);
}

function getTalentsByAncestry(ancestryId: number): Talent[] {
  return classifiers.talents.filter((t) => t.ancestryId === ancestryId);
}

function getAncestryKeyTalent(ancestryId: number): Talent | undefined {
  return classifiers.talents.find((t) => t.ancestryId === ancestryId && t.isKey);
}

function getTalentsByRadiantOrder(orderId: number): Talent[] {
  return classifiers.talents.filter((t) => t.radiantOrderId === orderId && !t.surgeId);
}

function getRadiantOrderKeyTalent(orderId: number): Talent | undefined {
  return classifiers.talents.find((t) => t.radiantOrderId === orderId && t.isKey);
}

function getTalentsBySurge(surgeId: number): Talent[] {
  return classifiers.talents.filter((t) => t.surgeId === surgeId);
}

function getSpecialtiesByPath(pathId: number) {
  return classifiers.specialties.filter((s) => s.pathId === pathId);
}

// ===================
// PREREQUISITE CHECKING
// ===================
function checkTalentPrerequisites(
  talent: Talent,
  selectedTalentIds: number[],
  skills: Map<number, number>
): { met: boolean; unmetPrereqs: TalentPrerequisite[] } {
  if (!talent.prerequisites || talent.prerequisites.length === 0) {
    return { met: true, unmetPrereqs: [] };
  }

  const unmetPrereqs: TalentPrerequisite[] = [];

  for (const prereq of talent.prerequisites) {
    let isMet = false;

    switch (prereq.type) {
      case 'talent':
        if (prereq.talentId !== undefined) {
          isMet = selectedTalentIds.includes(prereq.talentId);
        }
        break;
      case 'skill':
        if (prereq.skillId !== undefined && prereq.skillRank !== undefined) {
          const currentRank = skills.get(prereq.skillId) ?? 0;
          isMet = currentRank >= prereq.skillRank;
        }
        break;
      case 'ideal':
        // Check radiant ideal level
        isMet = idealLevel.value >= (prereq.skillRank ?? 0);
        break;
      case 'level':
        isMet = (heroStore.hero?.level ?? 1) >= (prereq.skillRank ?? 0);
        break;
      default:
        isMet = true;
    }

    if (!isMet) {
      unmetPrereqs.push(prereq);
    }
  }

  return { met: unmetPrereqs.length === 0, unmetPrereqs };
}

function formatPrerequisite(prereq: TalentPrerequisite): string {
  switch (prereq.type) {
    case 'talent': {
      const talent = classifiers.getById(classifiers.talents, prereq.talentId);
      return talent?.name ?? 'Unknown talent';
    }
    case 'skill': {
      const skill = classifiers.getById(classifiers.skills, prereq.skillId);
      return `${skill?.name ?? 'Unknown skill'} ${prereq.skillRank}+`;
    }
    case 'ideal':
      return `Ideal ${prereq.skillRank}+`;
    case 'level':
      return `Level ${prereq.skillRank}+`;
    default:
      return prereq.description ?? 'Unknown';
  }
}

// Map talents to TalentWithStatus (reusable helper)
function mapTalentsWithStatus(talents: Talent[]): TalentWithStatus[] {
  return talents.map((talent) => {
    const { met, unmetPrereqs } = checkTalentPrerequisites(
      talent,
      heroTalentIds.value,
      characterSkills.value
    );
    return { talent, available: met, unmetPrereqs };
  });
}

// Toggle any talent selection
function toggleHeroTalent(talentId: number, available: boolean) {
  if (heroTalentIds.value.includes(talentId)) {
    heroStore.removeTalent(talentId);
  } else if (available) {
    heroStore.addTalent(talentId);
  }
}

// ===================
// SINGER ANCESTRY
// ===================
const singerAncestryId = computed(() => {
  const singer = classifiers.getByCode(classifiers.ancestries, 'singer');
  return singer?.id;
});

const singerKeyTalent = computed(() =>
  singerAncestryId.value ? getAncestryKeyTalent(singerAncestryId.value) : null
);

const selectedAncestryTalentIds = computed(() => {
  if (!singerAncestryId.value) return [];
  const ancestryTalentIds = getTalentsByAncestry(singerAncestryId.value).map((t) => t.id);
  return heroTalentIds.value.filter((id) => ancestryTalentIds.includes(id));
});

const singerTalentsWithStatus = computed((): TalentWithStatus[] => {
  if (!isSinger.value || !singerAncestryId.value) return [];
  const talents = getTalentsByAncestry(singerAncestryId.value).filter((t) => !t.isKey);
  return mapTalentsWithStatus(talents);
});

// ===================
// RADIANT PATH
// ===================
const radiantKeyTalent = computed(() =>
  radiantOrderId.value ? getRadiantOrderKeyTalent(radiantOrderId.value) : null
);

const selectedRadiantOrder = computed(() =>
  classifiers.getById(classifiers.radiantOrders, radiantOrderId.value)
);

const surge1Id = computed(() => selectedRadiantOrder.value?.surge1Id ?? null);
const surge2Id = computed(() => selectedRadiantOrder.value?.surge2Id ?? null);

const surge1Name = computed(
  () => classifiers.getById(classifiers.surges, surge1Id.value)?.name ?? 'Surge 1'
);
const surge2Name = computed(
  () => classifiers.getById(classifiers.surges, surge2Id.value)?.name ?? 'Surge 2'
);

const radiantTalentTab = ref<'order' | 'surge1' | 'surge2'>('surge1');

const radiantTabOptions = computed(() => [
  { value: 'order', label: getRadiantOrderName(radiantOrderId.value) || 'Order' },
  { value: 'surge1', label: surge1Name.value },
  { value: 'surge2', label: surge2Name.value },
]);

const selectedRadiantTalentIds = computed(() => {
  if (!radiantOrderId.value) return [];
  // Get all radiant-related talent IDs (order + surges)
  const orderTalentIds = getTalentsByRadiantOrder(radiantOrderId.value).map((t) => t.id);
  const surge1TalentIds = surge1Id.value ? getTalentsBySurge(surge1Id.value).map((t) => t.id) : [];
  const surge2TalentIds = surge2Id.value ? getTalentsBySurge(surge2Id.value).map((t) => t.id) : [];
  const allRadiantIds = [...orderTalentIds, ...surge1TalentIds, ...surge2TalentIds];
  return heroTalentIds.value.filter((id) => allRadiantIds.includes(id));
});

const radiantTalentTabLabel = computed(() => {
  if (radiantTalentTab.value === 'order')
    return getRadiantOrderName(radiantOrderId.value) || 'Order';
  if (radiantTalentTab.value === 'surge1') return surge1Name.value;
  return surge2Name.value;
});

const orderTalentsWithStatus = computed((): TalentWithStatus[] => {
  if (!radiantOrderId.value) return [];
  const orderTalents = getTalentsByRadiantOrder(radiantOrderId.value).filter((t) => !t.isKey);
  return mapTalentsWithStatus(orderTalents);
});

const surge1TalentsWithStatus = computed((): TalentWithStatus[] => {
  if (!surge1Id.value) return [];
  return mapTalentsWithStatus(getTalentsBySurge(surge1Id.value));
});

const surge2TalentsWithStatus = computed((): TalentWithStatus[] => {
  if (!surge2Id.value) return [];
  return mapTalentsWithStatus(getTalentsBySurge(surge2Id.value));
});

const currentRadiantTalentsWithStatus = computed((): TalentWithStatus[] => {
  if (radiantTalentTab.value === 'order') return orderTalentsWithStatus.value;
  if (radiantTalentTab.value === 'surge1') return surge1TalentsWithStatus.value;
  return surge2TalentsWithStatus.value;
});

// ===================
// PATH ACTIONS
// ===================
function isPathSelected(pathId: number): boolean {
  return selectedPathIds.value.includes(pathId);
}

function togglePath(pathId: number) {
  if (isPathSelected(pathId)) {
    // Remove path and its key talent
    selectedPathIds.value = selectedPathIds.value.filter((id) => id !== pathId);
    pathSpecialties.value.delete(pathId);
    const keyTalent = getPathKeyTalent(pathId);
    if (keyTalent) {
      heroStore.removeTalent(keyTalent.id);
    }
  } else {
    // Add path and its key talent
    selectedPathIds.value.push(pathId);
    heroStore.addKeyTalentForPath(pathId);
    // Select first specialty by default
    const specialties = getSpecialtiesByPath(pathId);
    const firstSpecialty = specialties[0];
    if (firstSpecialty) {
      pathSpecialties.value.set(pathId, firstSpecialty.id);
    }
  }
}

function getPathName(pathId: number): string {
  return classifiers.paths.find((p) => p.id === pathId)?.name || '';
}

function getSpecialtyName(pathId: number, specialtyId: number | undefined): string {
  if (!specialtyId) return 'No specialty';
  const specialty = classifiers.specialties.find((s) => s.id === specialtyId);
  return specialty?.name || 'No specialty';
}

function getRadiantOrderName(orderId: number | null | undefined): string {
  if (!orderId) return '';
  return classifiers.radiantOrders.find((o) => o.id === orderId)?.name || '';
}

function getSpecialtyOptions(pathId: number) {
  return getSpecialtiesByPath(pathId).map((s) => ({
    value: s.id,
    label: s.name,
  }));
}

function setSpecialty(pathId: number, specialtyId: number) {
  pathSpecialties.value.set(pathId, specialtyId);
}

function getKeyTalent(pathId: number) {
  return getPathKeyTalent(pathId);
}

function getPathTalentsWithStatus(
  pathId: number,
  specialtyId: number | undefined
): TalentWithStatus[] {
  const pathTalents = getTalentsByPath(pathId).filter((t) => !t.isKey);
  const specialtyTalents = specialtyId ? getTalentsBySpecialty(specialtyId) : [];
  return mapTalentsWithStatus([...pathTalents, ...specialtyTalents]);
}

function toggleRadiant(value: boolean) {
  if (value) {
    // Default to first order (Windrunner)
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

function isRadiantTalentSelected(talentId: number): boolean {
  return heroTalentIds.value.includes(talentId);
}

function formatPrereq(prereq: TalentPrerequisite): string {
  return formatPrerequisite(prereq);
}

function getPrerequisitesArray(talent: Talent): TalentPrerequisite[] {
  return talent.prerequisites ?? [];
}

function showTalentDetails(talent: Talent) {
  selectedTalentForDetails.value = talent;
  talentDialogOpen.value = true;
}
</script>
