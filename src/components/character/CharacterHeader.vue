<template>
  <div class="cosmere-showcase" :class="{ 'hero-dead': isDead }">
    <div class="q-pa-md row items-center q-col-gutter-md">
      <!-- Avatar + Name -->
      <div class="col-12 col-sm-6 row items-start no-wrap q-gutter-x-sm">
        <AvatarDisplay :avatar-key="hero?.avatarKey" size="48px" alt="Hero avatar" expandable />
        <div>
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
              :to="{ name: 'character-edit', params: { characterId } }"
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
      </div>

      <!-- Resources -->
      <div class="col-12 col-sm-6">
        <ResourcesBar
          :derived-stats="resourceDerivedStats"
          :current="resourceCurrent"
          :saving="saving"
          :readonly="readonly"
          @update="onResourceUpdate"
        />
      </div>
    </div>
    <q-separator />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { RPG_COLORS } from 'src/constants/theme';
import { Pencil } from 'lucide-vue-next';
import ResourcesBar from 'src/components/shared/ResourcesBar.vue';
import InfoPopup from 'src/components/shared/InfoPopup.vue';
import AvatarDisplay from 'src/components/shared/AvatarDisplay.vue';
import type { TypedValue, ResourceValues } from 'src/types/shared';

defineProps<{
  characterId: string;
  readonly?: boolean;
}>();

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();
const hero = computed(() => heroStore.hero);
const saving = computed(() => heroStore.saving);
// Synthetic TypedValue array for ResourcesBar — id:0 is a placeholder, matching is by type.code only
const resourceDerivedStats = computed((): TypedValue[] => {
  const stats: TypedValue[] = [
    {
      type: { id: 0, code: 'max_health', name: 'HP' },
      value: attrStore.getDerivedStatTotal('max_health'),
    },
    {
      type: { id: 0, code: 'max_focus', name: 'Focus' },
      value: attrStore.getDerivedStatTotal('max_focus'),
    },
  ];
  if (talentStore.isRadiant) {
    stats.push({
      type: { id: 0, code: 'max_investiture', name: 'Investiture' },
      value: attrStore.getDerivedStatTotal('max_investiture'),
    });
  }
  return stats;
});

const resourceCurrent = computed(
  (): ResourceValues => ({
    currentHp: hero.value?.currentHealth ?? 0,
    currentFocus: hero.value?.currentFocus ?? 0,
    currentInvestiture: hero.value?.currentInvestiture ?? 0,
    currency: hero.value?.currency ?? 0,
  })
);

const patchMap: Record<string, (value: number) => void> = {
  max_health: (v) => void heroStore.patchHealth(v),
  max_focus: (v) => void heroStore.patchFocus(v),
  max_investiture: (v) => void heroStore.patchInvestiture(v),
  currency: (v) => void heroStore.patchCurrency(v),
};

function onResourceUpdate(code: string, value: number) {
  patchMap[code]?.(value);
}

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
</script>

<style scoped>
.hero-dead {
  opacity: 0.6;
  filter: grayscale(40%);
}
</style>
