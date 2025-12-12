<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Choose your heroic paths and talents</div>

    <!-- Path Selection -->
    <div class="text-subtitle2 q-mb-sm">Heroic Paths</div>
    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="path in heroicPaths" :key="path.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          :class="['cursor-pointer', { 'card-selected': isPathSelected(path.id) }]"
          @click="togglePath(path.id)"
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
                  selection.specialtyId,
                  selection.talentIds
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
                      toggleTalent(selection.pathId, talentInfo.talent.id, talentInfo.available)
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
                      toggleAncestryTalent(talentInfo.talent.id, talentInfo.available)
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
              Ideal {{ idealLevel }} · {{ store.paths.radiantPath?.talentIds.length || 0 }} talents
              selected
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

            <!-- Radiant Talents -->
            <template v-if="radiantTalentsWithStatus.length > 0">
              <div class="text-caption q-mb-xs">Radiant Talents</div>
              <q-list bordered separator class="rounded-borders">
                <q-item
                  v-for="talentInfo in radiantTalentsWithStatus"
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
                        toggleRadiantTalent(talentInfo.talent.id, talentInfo.available)
                      "
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="{ [`text-${COLORS.muted}`]: !talentInfo.available }">
                      {{ talentInfo.talent.name }}
                      <q-icon v-if="!talentInfo.available" name="lock" size="xs" class="q-ml-xs" />
                      <q-badge
                        v-if="talentInfo.talent.surgeId"
                        :color="getSurgeColor(talentInfo.talent.surgeId)"
                        class="q-ml-sm"
                      >
                        {{ getSurgeName(talentInfo.talent.surgeId) }}
                      </q-badge>
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
                    <q-btn
                      flat
                      dense
                      icon="info"
                      @click.stop="showTalentDetails(talentInfo.talent)"
                    >
                      <q-tooltip>View details</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>

    <!-- Talent Detail Dialog -->
    <q-dialog v-model="talentDialogOpen">
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ selectedTalentForDetails?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedTalentForDetails">
          <div class="q-mb-sm">
            <q-badge :color="getActivationColor(selectedTalentForDetails.actionId)">
              {{ getActivationName(selectedTalentForDetails.actionId) }}
            </q-badge>
          </div>
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
import { computed, ref } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';
import { COLORS } from 'src/constants/theme';
import {
  getTalentsByPath,
  getTalentsBySpecialty,
  getPathKeyTalent,
  getTalentsByRadiantOrder,
  getTalentsByAncestry,
  getTalentsBySurge,
  getAncestryKeyTalent,
  getRadiantOrderKeyTalent,
  checkTalentPrerequisites,
  formatPrerequisite,
  type Talent,
  type TalentPrerequisite,
} from 'src/mock/talents';
import { getSpecialtiesByPathId } from 'src/mock/paths';

interface TalentWithStatus {
  talent: Talent;
  available: boolean;
  unmetPrereqs: TalentPrerequisite[];
}

const store = useCharacterCreationStore();
const classifiers = useClassifierStore();

// Dialog state
const talentDialogOpen = ref(false);
const selectedTalentForDetails = ref<Talent | null>(null);

// Basic computed values
const heroicPaths = computed(() => classifiers.heroicPaths);
const selectedPaths = computed(() => store.paths.paths);
const isRadiant = computed(() => store.isRadiant);
const isSinger = computed(() => store.isSinger);

const radiantOrderId = computed(() => store.paths.radiantPath?.orderId);
const idealLevel = computed(() => store.paths.radiantPath?.idealLevel || 0);

const radiantOrderOptions = computed(() =>
  classifiers.radiantOrders.map((o) => ({ value: o.id, label: o.name }))
);

// Build character skills map from store
const characterSkills = computed(() => {
  const skills = new Map<number, number>();
  for (const alloc of store.skills.allocations) {
    skills.set(alloc.skillId, alloc.rank);
  }
  return skills;
});

// Gather all selected talent IDs across paths, ancestry, and radiant
const allSelectedTalentIds = computed(() => {
  const ids: number[] = [];

  // Add key talents from selected paths
  for (const path of selectedPaths.value) {
    const keyTalent = getPathKeyTalent(path.pathId);
    if (keyTalent) ids.push(keyTalent.id);
    ids.push(...path.talentIds);
  }

  // Add singer key talent and selected ancestry talents
  if (isSinger.value) {
    const singerKey = getAncestryKeyTalent(2);
    if (singerKey) ids.push(singerKey.id);
    ids.push(...selectedAncestryTalentIds.value);
  }

  // Add radiant key talent and selected radiant talents
  if (isRadiant.value && radiantOrderId.value) {
    const radiantKey = getRadiantOrderKeyTalent(radiantOrderId.value);
    if (radiantKey) ids.push(radiantKey.id);
    if (store.paths.radiantPath) {
      ids.push(...store.paths.radiantPath.talentIds);
    }
  }

  return ids;
});

// Singer ancestry talents
const selectedAncestryTalentIds = computed(() => store.paths.ancestryTalentIds || []);

const singerKeyTalent = computed(() => getAncestryKeyTalent(2));

const singerTalentsWithStatus = computed((): TalentWithStatus[] => {
  if (!isSinger.value) return [];

  const talents = getTalentsByAncestry(2).filter((t) => !t.isKey);
  return talents.map((talent) => {
    const { met, unmetPrereqs } = checkTalentPrerequisites(
      talent,
      allSelectedTalentIds.value,
      characterSkills.value
    );
    return { talent, available: met, unmetPrereqs };
  });
});

// Radiant talents
const radiantKeyTalent = computed(() =>
  radiantOrderId.value ? getRadiantOrderKeyTalent(radiantOrderId.value) : null
);

const radiantTalentsWithStatus = computed((): TalentWithStatus[] => {
  if (!radiantOrderId.value) return [];

  // Get order-specific talents (non-key)
  const orderTalents = getTalentsByRadiantOrder(radiantOrderId.value).filter((t) => !t.isKey);

  // Get surge talents for Windrunner (Adhesion + Gravitation)
  // TODO: Map orders to their surges dynamically
  const surgeTalents: Talent[] = [];
  if (radiantOrderId.value === 1) {
    // Windrunner has Adhesion (1) and Gravitation (2)
    surgeTalents.push(...getTalentsBySurge(1));
    surgeTalents.push(...getTalentsBySurge(2));
  }

  const allTalents = [...orderTalents, ...surgeTalents];

  return allTalents.map((talent) => {
    const { met, unmetPrereqs } = checkTalentPrerequisites(
      talent,
      allSelectedTalentIds.value,
      characterSkills.value
    );
    return { talent, available: met, unmetPrereqs };
  });
});

// Helper functions
function isPathSelected(pathId: number): boolean {
  return selectedPaths.value.some((p) => p.pathId === pathId);
}

function togglePath(pathId: number) {
  if (isPathSelected(pathId)) {
    store.removePath(pathId);
  } else {
    store.addPath(pathId);
  }
}

function getPathName(pathId: number): string {
  return classifiers.heroicPaths.find((p) => p.id === pathId)?.name || '';
}

function getSpecialtyName(pathId: number, specialtyId: number | undefined): string {
  if (!specialtyId) return 'No specialty';
  const specialty = getSpecialtiesByPathId(pathId).find((s) => s.id === specialtyId);
  return specialty?.name || 'No specialty';
}

function getRadiantOrderName(orderId: number | undefined): string {
  if (!orderId) return '';
  return classifiers.radiantOrders.find((o) => o.id === orderId)?.name || '';
}

function getSpecialtyOptions(pathId: number) {
  return getSpecialtiesByPathId(pathId).map((s) => ({
    value: s.id,
    label: s.name,
  }));
}

function setSpecialty(pathId: number, specialtyId: number) {
  store.setPathSpecialty(pathId, specialtyId);
}

function getKeyTalent(pathId: number) {
  return getPathKeyTalent(pathId);
}

function getPathTalentsWithStatus(
  pathId: number,
  specialtyId: number | undefined,
  currentPathTalentIds: number[]
): TalentWithStatus[] {
  // Get path talents (non-key, non-specialty)
  const pathTalents = getTalentsByPath(pathId).filter((t: Talent) => !t.isKey && !t.specialtyId);

  // Get specialty talents if a specialty is selected
  const specialtyTalents = specialtyId ? getTalentsBySpecialty(specialtyId) : [];

  const allTalents = [...pathTalents, ...specialtyTalents];

  // Build talent IDs including the key talent for this path
  const pathKeyTalent = getPathKeyTalent(pathId);
  const talentIdsWithKey = pathKeyTalent
    ? [pathKeyTalent.id, ...currentPathTalentIds, ...allSelectedTalentIds.value]
    : [...currentPathTalentIds, ...allSelectedTalentIds.value];

  return allTalents.map((talent) => {
    const { met, unmetPrereqs } = checkTalentPrerequisites(
      talent,
      talentIdsWithKey,
      characterSkills.value
    );
    return { talent, available: met, unmetPrereqs };
  });
}

function toggleTalent(pathId: number, talentId: number, available: boolean) {
  const path = selectedPaths.value.find((p) => p.pathId === pathId);
  if (!path) return;

  if (path.talentIds.includes(talentId)) {
    store.removeTalentFromPath(pathId, talentId);
  } else if (available) {
    store.addTalentToPath(pathId, talentId);
  }
}

function toggleAncestryTalent(talentId: number, available: boolean) {
  const currentIds = selectedAncestryTalentIds.value;
  if (currentIds.includes(talentId)) {
    store.removeAncestryTalent?.(talentId);
  } else if (available) {
    store.addAncestryTalent?.(talentId);
  }
}

function toggleRadiant(value: boolean) {
  if (value) {
    store.setRadiantPath(1, 0); // Default to Windrunner
  } else {
    store.removeRadiantPath();
  }
}

function setRadiantOrder(orderId: number) {
  store.setRadiantPath(orderId, idealLevel.value);
}

function setIdealLevel(level: number | null) {
  if (radiantOrderId.value && level !== null) {
    store.setRadiantPath(radiantOrderId.value, level);
  }
}

function isRadiantTalentSelected(talentId: number): boolean {
  return store.paths.radiantPath?.talentIds.includes(talentId) || false;
}

function toggleRadiantTalent(talentId: number, available: boolean) {
  if (isRadiantTalentSelected(talentId)) {
    store.removeRadiantTalent?.(talentId);
  } else if (available) {
    store.addRadiantTalent(talentId);
  }
}

function formatPrereq(prereq: TalentPrerequisite): string {
  return formatPrerequisite(prereq);
}

function getPrerequisitesArray(talent: Talent): TalentPrerequisite[] {
  if (!talent.prerequisites) return [];
  if (Array.isArray(talent.prerequisites)) return talent.prerequisites;
  return [];
}

function showTalentDetails(talent: Talent) {
  selectedTalentForDetails.value = talent;
  talentDialogOpen.value = true;
}

// Activation type helpers
function getActivationName(actionId: number | undefined): string {
  const names: Record<number, string> = {
    1: 'Action',
    4: 'Free Action',
    5: 'Reaction',
    6: 'Special',
    7: 'Always Active',
  };
  return actionId ? names[actionId] || 'Unknown' : 'Unknown';
}

function getActivationColor(actionId: number | undefined): string {
  const colors: Record<number, string> = {
    1: COLORS.primary,
    4: COLORS.success,
    5: COLORS.warning,
    6: COLORS.secondary,
    7: COLORS.muted,
  };
  return actionId ? colors[actionId] || COLORS.muted : COLORS.muted;
}

// Surge helpers
function getSurgeName(surgeId: number): string {
  const names: Record<number, string> = {
    1: 'Adhesion',
    2: 'Gravitation',
  };
  return names[surgeId] || 'Unknown Surge';
}

function getSurgeColor(surgeId: number): string {
  const colors: Record<number, string> = {
    1: COLORS.accent,
    2: COLORS.secondary,
  };
  return colors[surgeId] || COLORS.muted;
}
</script>
