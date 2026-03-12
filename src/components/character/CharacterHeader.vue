<template>
  <div class="cosmere-showcase" :class="{ 'hero-dead': isDead }">
    <div class="q-pa-md row items-center q-col-gutter-md">
      <!-- Name and Level -->
      <div class="col-12 col-sm-6">
        <div class="row items-center no-wrap">
          <div class="text-h5 text-heading">{{ hero?.name }}</div>
          <q-btn
            v-if="!readonly"
            flat
            dense
            round
            size="sm"
            class="q-ml-sm"
            aria-label="Edit character"
            @click="goToEdit"
            ><Pencil :size="20"
          /></q-btn>
        </div>
        <div class="text-subtitle1 text-muted">
          Level {{ hero?.level }}
          {{ ancestryName }}
          <span v-if="cultureName"> · {{ cultureName }}</span>
          <span v-if="orderName"> · {{ orderName }} ({{ hero?.radiantIdeal ?? 0 }})</span>
          <span v-if="campaignName"> · {{ campaignName }}</span>
        </div>
        <div v-if="activeSingerFormName" :class="`text-caption text-${RPG_COLORS.singerForm}`">
          {{ activeSingerFormName }}
        </div>
        <!-- Death Indicator -->
        <div v-if="isDead" class="q-mt-xs" role="status">
          <q-badge color="negative" class="text-bold">DEAD</q-badge>
        </div>
        <!-- Active Condition Badges -->
        <div
          v-if="activeConditionBadges.length"
          class="row items-center q-gutter-xs q-mt-xs"
          style="flex-wrap: wrap"
        >
          <q-badge
            v-for="badge in activeConditionBadges"
            :key="badge.id"
            :color="badge.positive ? 'positive' : 'warning'"
            outline
            class="cursor-pointer"
          >
            {{ badge.label }}
            <InfoPopup>{{ badge.description }}</InfoPopup>
          </q-badge>
        </div>
      </div>

      <!-- Resources -->
      <div class="col-12 col-sm-6">
        <div class="row q-col-gutter-sm">
          <div :class="isRadiant ? 'col-3' : 'col-4'">
            <ResourceBox
              label="HP"
              :current="hero?.currentHealth ?? 0"
              :max="maxHealth"
              color="negative"
              :saving="saving"
              :readonly="readonly"
              :use-dialog="!readonly"
              @update="heroStore.patchHealth($event)"
              @open-dialog="showHpDialog = true"
            />
          </div>
          <div :class="isRadiant ? 'col-3' : 'col-4'">
            <ResourceBox
              label="Focus"
              :current="hero?.currentFocus ?? 0"
              :max="maxFocus"
              :color="RPG_COLORS.focus"
              :saving="saving"
              :readonly="readonly"
              @update="heroStore.patchFocus($event)"
            />
          </div>
          <div v-if="isRadiant" class="col-3">
            <ResourceBox
              label="Investiture"
              :current="hero?.currentInvestiture ?? 0"
              :max="maxInvestiture"
              :color="RPG_COLORS.investiture"
              :saving="saving"
              :readonly="readonly"
              @update="heroStore.patchInvestiture($event)"
            />
          </div>
          <div :class="isRadiant ? 'col-3' : 'col-4'">
            <ResourceBox
              label="Marks"
              :current="hero?.currency ?? 0"
              suffix="mk"
              :saving="saving"
              :readonly="readonly"
              @update="heroStore.patchCurrency($event)"
            />
          </div>
        </div>
      </div>
    </div>
    <q-separator />
    <HpManagementDialog
      v-if="!readonly"
      v-model="showHpDialog"
      :current-hp="hero?.currentHealth ?? 0"
      :max-hp="maxHealth"
      :saving="saving"
      @update="heroStore.patchHealth($event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { RPG_COLORS } from 'src/constants/theme';
import { Pencil } from 'lucide-vue-next';
import ResourceBox from './ResourceBox.vue';
import HpManagementDialog from './HpManagementDialog.vue';
import InfoPopup from 'src/components/shared/InfoPopup.vue';

const props = defineProps<{
  characterId: string;
  readonly?: boolean;
}>();

const router = useRouter();
const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();
const hero = computed(() => heroStore.hero);
const showHpDialog = ref(false);
const saving = computed(() => heroStore.saving);
const maxHealth = computed(() => attrStore.getDerivedStatTotal('max_health'));
const maxFocus = computed(() => attrStore.getDerivedStatTotal('max_focus'));
const maxInvestiture = computed(() => attrStore.getDerivedStatTotal('max_investiture'));
const isRadiant = computed(() => talentStore.isRadiant);

const isDead = computed(() => heroStore.injuries.some((i) => i.injury?.code === 'death'));

const orderName = computed(() => hero.value?.radiantOrder?.name);
const ancestryName = computed(() => hero.value?.ancestry?.name);
const activeSingerFormName = computed(() => hero.value?.activeSingerForm?.name);
const cultureName = computed(() => hero.value?.cultures?.[0]?.culture?.name);
const campaignName = computed(() => hero.value?.campaign?.name);

const activeConditionBadges = computed(() => {
  if (!heroStore.conditions.length) return [];
  return heroStore.conditions.map((c) => {
    const classifier = classifiers.conditions.find((cl) => cl.id === c.condition.id);
    const dv = c.special?.[0]?.display_value;
    const label = dv ? `${c.condition.name} [${dv}]` : c.condition.name;

    return {
      id: c.id,
      label,
      description: classifier?.description ?? '',
      positive: classifier?.isPositive ?? false,
    };
  });
});

function goToEdit(): void {
  void router.push({
    name: 'character-edit',
    params: { characterId: props.characterId },
  });
}
</script>

<style scoped>
.hero-dead {
  opacity: 0.6;
  filter: grayscale(40%);
}
</style>
