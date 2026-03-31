<template>
  <q-form ref="formRef" greedy>
    <div class="text-subtitle1 q-mb-md">
      {{ isEditMode ? 'Review your changes' : 'Review your character before creation' }}
    </div>

    <!-- Validation Summary -->
    <q-banner v-if="!isValid" class="banner-error q-mb-md" role="alert" aria-live="polite">
      <template v-slot:avatar>
        <CircleAlert :size="24" aria-hidden="true" />
      </template>
      <div class="text-subtitle2">Validation Errors</div>
      <ul class="q-pl-md q-my-xs">
        <li v-for="(error, i) in validationErrors" :key="i">{{ error }}</li>
      </ul>
    </q-banner>

    <q-banner v-else class="banner-success q-mb-md" role="status" aria-live="polite">
      <template v-slot:avatar>
        <CircleCheck :size="24" aria-hidden="true" />
      </template>
      {{ isEditMode ? 'Character is ready to save!' : 'Character is ready to create!' }}
    </q-banner>

    <q-banner
      v-if="validationWarnings.length > 0"
      class="banner-warning q-mb-md"
      role="status"
      aria-live="polite"
    >
      <template v-slot:avatar>
        <TriangleAlert :size="24" aria-hidden="true" />
      </template>
      <div class="text-subtitle2">Warnings</div>
      <ul class="q-pl-md q-my-xs">
        <li v-for="(warning, i) in validationWarnings" :key="i">{{ warning }}</li>
      </ul>
    </q-banner>

    <!-- Character Summary -->
    <div class="row q-col-gutter-md">
      <!-- Basic Info -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">{{ heroStore.hero?.name || 'Unnamed Character' }}</div>
            <div class="text-subtitle2">Level {{ heroStore.hero?.level }} {{ ancestryName }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-6 col-md-3">
                <div class="text-caption">Ancestry</div>
                <div>{{ ancestryName }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-caption">Culture</div>
                <div>{{ cultureName }}</div>
              </div>
              <div v-if="campaignName" class="col-6 col-md-3">
                <div class="text-caption">Campaign</div>
                <div>{{ campaignName }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-caption">Starting Kit</div>
                <div>{{ startingKitName }}</div>
              </div>
              <div v-if="talentStore.isRadiant" class="col-6 col-md-3">
                <div class="text-caption">Radiant Order</div>
                <div>{{ radiantOrderName }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Attributes & Stats -->
      <div class="col-12">
        <DefensesSection :defenses="defenseValues" :deflect="deflectValue" />
        <AttributesSection :attributes="attributeValues">
          <template #header>
            <div class="row items-center">
              <div class="section-title section-title--lg q-mb-none">Attributes</div>
              <q-space />
              <BudgetDisplay
                label="Remaining"
                :remaining="attrBudget.remaining"
                :total="attrBudget.budget"
                :show-total="true"
              />
            </div>
          </template>
        </AttributesSection>
        <DerivedStatsSection :stats="derivedStatValues" />
      </div>

      <!-- Skills -->
      <div class="col-12">
        <DerivedStatsSection v-if="skillStatValues.length" :stats="skillStatValues">
          <template #header>
            <div class="row items-center">
              <div class="section-title section-title--lg q-mb-none">Skills</div>
              <q-space />
              <BudgetDisplay
                label="Remaining"
                :remaining="skillsBudget.remaining"
                :total="skillsBudget.budget"
                :show-total="true"
              />
            </div>
          </template>
        </DerivedStatsSection>
        <template v-else>
          <div class="row items-center q-mb-sm">
            <div class="section-title section-title--lg q-mb-none">Skills</div>
            <q-space />
            <BudgetDisplay
              label="Remaining"
              :remaining="skillsBudget.remaining"
              :total="skillsBudget.budget"
              :show-total="true"
            />
          </div>
          <div class="text-caption text-muted q-mb-md">No skills allocated</div>
        </template>
      </div>

      <!-- Expertises -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle2">Expertises</div>
              <q-space />
              <BudgetDisplay
                label="Remaining"
                :remaining="expertisesBudget.remaining"
                :total="expertisesBudget.budget"
                :show-total="true"
              />
            </div>
            <div>
              <q-chip
                v-for="exp in expertiseDisplay"
                :key="exp.id"
                color="grey-7"
                text-color="white"
              >
                {{ exp.name }}
              </q-chip>
            </div>
            <div v-if="expertiseDisplay.length === 0" class="text-caption text-muted">
              No expertises selected
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Talents -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle2">Talents</div>
              <q-space />
              <BudgetDisplay
                label="Remaining"
                :remaining="talentsBudget.remaining"
                :total="talentsBudget.budget"
                :show-total="true"
              />
            </div>
            <BudgetDisplay
              v-if="flexPool.budget > 0"
              label="Flex points"
              :remaining="flexPool.remaining"
              :total="flexPool.budget"
              :show-total="true"
              suffix="shared between skills and talents"
            />
            <div v-for="group in talentsBySource" :key="group.source" class="q-mb-sm">
              <div class="text-caption text-weight-medium">{{ group.source }}</div>
              <q-chip v-for="talent in group.talents" :key="talent.id" outline>
                {{ talent.name }}
              </q-chip>
            </div>
            <div v-if="talentsBySource.length === 0" class="text-caption text-muted">
              No talents selected
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Equipment -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Equipment</div>
            <div class="q-mb-sm">
              <span class="text-weight-medium">Currency:</span> {{ totalCurrency }} diamond marks
            </div>
            <div v-for="eqType in classifiers.equipmentTypes" :key="eqType.id" class="q-mb-sm">
              <template v-if="equipmentByType[eqType.id]?.length">
                <div class="text-caption text-weight-medium">{{ eqType.name }}</div>
                <q-chip v-for="item in equipmentByType[eqType.id]" :key="item.id" outline>
                  {{ item.name }} x{{ item.amount }}
                </q-chip>
              </template>
            </div>
            <div v-if="equipmentDisplay.length === 0" class="text-caption text-muted">
              No equipment
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Destructive actions (edit mode only) -->
    <template v-if="isEditMode && !heroStore.isNew">
      <q-card flat bordered class="q-mt-lg bg-grey-2">
        <q-card-section class="row q-gutter-sm">
          <q-btn
            v-if="campaignName"
            flat
            color="negative"
            data-testid="leave-campaign-btn"
            @click="leaveCampaign"
          >
            <LogOut :size="20" class="on-left" aria-hidden="true" />Leave Campaign
          </q-btn>
          <q-btn
            flat
            color="negative"
            data-testid="delete-hero-btn"
            @click="showDeleteDialog = true"
          >
            <Trash2 :size="20" class="on-left" aria-hidden="true" />Delete Character
          </q-btn>
        </q-card-section>
      </q-card>

      <DeleteHeroDialog
        v-model="showDeleteDialog"
        :hero-name="heroStore.hero?.name ?? ''"
        :deleting="deleting"
        @confirm="confirmDelete"
      />
    </template>
  </q-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, type QForm } from 'quasar';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { useWizardStore } from 'src/stores/wizard';
import { useStepValidation } from 'src/composables/useStepValidation';
import { buildDerivedStatsList } from 'src/utils/derivedStats';
import { findById } from 'src/utils/arrayUtils';
import { buildSpecialtyPathMap, getTalentPathId } from 'src/utils/talentUtils';
import { CircleAlert, CircleCheck, LogOut, Trash2, TriangleAlert } from 'lucide-vue-next';
import DefensesSection from 'src/components/shared/DefensesSection.vue';
import AttributesSection from 'src/components/shared/AttributesSection.vue';
import DerivedStatsSection from 'src/components/shared/DerivedStatsSection.vue';
import type { StatValue } from 'src/types/shared';
import heroService from 'src/services/heroService';
import { buildHeroCorePayload } from 'src/services/heroPayloads';
import { logger } from 'src/utils/logger';
import DeleteHeroDialog from '../../character/DeleteHeroDialog.vue';
import BudgetDisplay from '../shared/BudgetDisplay.vue';

const formRef = ref<QForm | null>(null);

const router = useRouter();
const $q = useQuasar();
const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();
const wizardStore = useWizardStore();
const { allStepsValidation, budget, flexBudget } = useStepValidation();
const flexPool = computed(() => flexBudget.value.flex);

const attrBudget = computed(() => budget('attributes'));
const skillsBudget = computed(() => budget('skills'));
const expertisesBudget = computed(() => budget('expertises'));
const talentsBudget = computed(() => budget('paths'));

const isEditMode = computed(() => wizardStore.mode === 'edit');

const validationErrors = computed(() => allStepsValidation.value.errors);
const validationWarnings = computed(() => allStepsValidation.value.warnings);
const isValid = computed(() => allStepsValidation.value.isValid);

// Basic info lookups
const campaignName = computed(() => heroStore.hero?.campaign?.name ?? null);

const ancestryName = computed(
  () => findById(classifiers.ancestries, heroStore.hero?.ancestry.id)?.name || 'Unknown'
);

const cultureName = computed(() => {
  const primaryCultureId = heroStore.hero?.cultures?.[0]?.culture.id;
  return findById(classifiers.cultures, primaryCultureId)?.name || 'None';
});

const startingKitName = computed(
  () => findById(classifiers.startingKits, heroStore.hero?.startingKit?.id)?.name || 'None'
);

const radiantOrderName = computed(
  () => findById(classifiers.radiantOrders, heroStore.hero?.radiantOrder?.id)?.name
);

// Defenses
const defenseValues = computed((): StatValue[] =>
  classifiers.attributeTypes.map((at) => ({
    type: { id: at.id, code: at.code, name: at.name },
    value: attrStore.getDefenseValue(at.code),
  }))
);

// Derived stats calculated from attributes (with bonuses from talents/equipment/singer form)
const allDerivedStats = computed(() =>
  buildDerivedStatsList(
    classifiers.derivedStats,
    classifiers.derivedStatValues,
    classifiers.attributes,
    attrStore.baseAttributeValues,
    attrStore.levelData,
    attrStore.tierData,
    (statId) => attrStore.getDerivedStatModifier(statId),
    (statCode) => attrStore.getStatBonus(statCode)
  )
);

const deflectValue = computed((): StatValue | null => {
  const stat = allDerivedStats.value.find((s) => s.code === 'deflect');
  if (!stat) return null;
  return {
    type: { id: stat.id, code: stat.code, name: stat.name },
    value: stat.totalValue,
  };
});

// Attributes
const attributeValues = computed((): StatValue[] =>
  classifiers.attributes.map((a) => ({
    type: { id: a.id, code: a.code, name: a.name },
    value: attrStore.baseAttributeValues[a.code] ?? 0,
  }))
);

// Derived stats display
function statBreakdown(stat: { baseDisplay: string; modifier: number; bonus: number }): string {
  let result = `(${stat.baseDisplay}`;
  if (stat.modifier !== 0) result += ` ${stat.modifier >= 0 ? '+' : ''}${stat.modifier}`;
  if (stat.bonus !== 0) result += ` ${stat.bonus >= 0 ? '+' : ''}${stat.bonus}`;
  return result + ')';
}

const derivedStatValues = computed((): StatValue[] =>
  allDerivedStats.value
    .filter((s) => s.code !== 'deflect')
    .map((s) => ({
      type: { id: s.id, code: s.code, name: s.name },
      value: s.totalValue,
      displayValue: s.totalDisplay,
      breakdown: s.hasModifier && (s.modifier !== 0 || s.bonus !== 0) ? statBreakdown(s) : null,
    }))
);

// Skills with ranks > 0
const skillStatValues = computed((): StatValue[] =>
  heroStore.skills
    .filter((s) => s.rank > 0)
    .map((s) => {
      const name = findById(classifiers.skills, s.skill.id)?.name || 'Unknown';
      const displayValue =
        s.modifier !== 0
          ? `${s.rank} (${s.modifier >= 0 ? '+' : ''}${s.modifier})`
          : String(s.rank);
      return {
        type: { id: s.skill.id, code: s.skill.code, name },
        value: s.rank,
        displayValue,
      };
    })
);

// Expertises
const expertiseDisplay = computed(() =>
  heroStore.expertises.map((e) => ({
    id: e.expertise ? `classifier-${e.expertise.id}` : `custom-${e.id}`,
    name: e.expertise
      ? findById(classifiers.expertises, e.expertise.id)?.name || 'Unknown'
      : e.customName || 'Custom',
  }))
);

const specialtyPathMap = computed(() => buildSpecialtyPathMap(classifiers.specialties));

// Talents grouped by source (path / radiant order / surge / ancestry)
const talentsBySource = computed(() => {
  const groups: { source: string; talents: { id: number; name: string }[] }[] = [];
  const pathGroups = new Map<number, { id: number; name: string }[]>();

  for (const t of heroStore.talents) {
    const talent = findById(classifiers.talents, t.talent.id);
    const name = talent?.name || 'Unknown';
    const entry = { id: t.talent.id, name };

    if (!talent) {
      const other = groups.find((g) => g.source === 'Other');
      if (other) other.talents.push(entry);
      else groups.push({ source: 'Other', talents: [entry] });
      continue;
    }

    const pathId = getTalentPathId(talent, specialtyPathMap.value);
    if (pathId) {
      if (!pathGroups.has(pathId)) pathGroups.set(pathId, []);
      pathGroups.get(pathId)!.push(entry);
      continue;
    }

    const source =
      talent.radiantOrder?.name ?? talent.surge?.name ?? talent.ancestry?.name ?? 'Other';
    const existing = groups.find((g) => g.source === source);
    if (existing) existing.talents.push(entry);
    else groups.push({ source, talents: [entry] });
  }

  const pathTabs = [...pathGroups.entries()].map(([pathId, talents]) => ({
    source: findById(classifiers.paths, pathId)?.name ?? 'Unknown Path',
    talents,
  }));

  return [...pathTabs, ...groups];
});

// Equipment
const equipmentDisplay = computed(() =>
  heroStore.equipment.map((e) => {
    const eq = e.equipment ? findById(classifiers.equipment, e.equipment.id) : null;
    return {
      id: e.id,
      equipmentId: e.equipment?.id ?? 0,
      name: eq?.name || e.customName || 'Custom Item',
      amount: e.amount,
      equipTypeId: eq?.equipType.id ?? e.equipType?.id,
    };
  })
);

// Pre-computed equipment grouped by type
const equipmentByType = computed(() => {
  const result: Record<number, typeof equipmentDisplay.value> = {};
  for (const eqType of classifiers.equipmentTypes) {
    result[eqType.id] = equipmentDisplay.value.filter((item) => item.equipTypeId === eqType.id);
  }
  return result;
});

// Currency in diamond marks
const totalCurrency = computed(() => heroStore.hero?.currency ?? 0);

// Danger zone
const showDeleteDialog = ref(false);
const deleting = ref(false);

function leaveCampaign(): void {
  $q.dialog({
    title: 'Leave Campaign',
    message: `Remove this character from "${campaignName.value}"? You can reassign them later.`,
    cancel: true,
    persistent: false,
  }).onOk(() => {
    if (!heroStore.hero || heroStore.hero.id <= 0) return;
    const prevCampaign = heroStore.hero.campaign;
    heroStore.setCampaign(null);
    const payload = buildHeroCorePayload(heroStore.hero);
    void heroService.update(heroStore.hero.id, payload).then(
      () => {},
      (err) => {
        heroStore.setCampaign(prevCampaign);
        logger.error('Failed to leave campaign', { error: err });
        $q.notify({ message: 'Failed to leave campaign', type: 'negative', timeout: 2000 });
      }
    );
  });
}

async function confirmDelete(): Promise<void> {
  deleting.value = true;
  try {
    const success = await heroStore.deleteHero();
    if (success) {
      showDeleteDialog.value = false;
      void router.push({ name: 'my-characters' });
    }
  } finally {
    deleting.value = false;
  }
}

async function validate(): Promise<boolean> {
  return (await formRef.value?.validate()) ?? true;
}

defineExpose({ validate });
</script>
