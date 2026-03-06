<template>
  <div class="cosmere-showcase">
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
          <q-btn
            v-if="!readonly && hero?.id"
            flat
            dense
            round
            size="sm"
            class="q-ml-xs"
            aria-label="Delete character"
            @click="showDeleteDialog = true"
            ><Trash2 :size="20"
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
              @update="heroStore.patchHealth($event)"
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

    <DeleteHeroDialog
      v-model="showDeleteDialog"
      :hero-name="hero?.name ?? ''"
      :deleting="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { RPG_COLORS } from 'src/constants/theme';
import { Pencil, Trash2 } from 'lucide-vue-next';
import DeleteHeroDialog from './DeleteHeroDialog.vue';
import ResourceBox from './ResourceBox.vue';

const props = defineProps<{
  characterId: string;
  readonly?: boolean;
}>();

const router = useRouter();
const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const talentStore = useHeroTalentsStore();
const hero = computed(() => heroStore.hero);
const saving = computed(() => heroStore.saving);
const maxHealth = computed(() => attrStore.getDerivedStatTotal('max_health'));
const maxFocus = computed(() => attrStore.getDerivedStatTotal('max_focus'));
const maxInvestiture = computed(() => attrStore.getDerivedStatTotal('max_investiture'));
const isRadiant = computed(() => talentStore.isRadiant);

const orderName = computed(() => hero.value?.radiantOrder?.name);
const ancestryName = computed(() => hero.value?.ancestry?.name);
const activeSingerFormName = computed(() => hero.value?.activeSingerForm?.name);
const cultureName = computed(() => hero.value?.cultures?.[0]?.culture?.name);
const campaignName = computed(() => hero.value?.campaign?.name);

const showDeleteDialog = ref(false);
const deleting = ref(false);

function goToEdit(): void {
  void router.push({
    name: 'character-edit',
    params: { characterId: props.characterId },
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
</script>
