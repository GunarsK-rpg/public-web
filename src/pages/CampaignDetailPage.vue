<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-spinner-dots v-if="loading" size="50px" color="primary" />

      <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
        {{ error }}
        <template v-slot:action>
          <q-btn flat label="Go Back" @click="goBack" />
        </template>
      </q-banner>

      <template v-else-if="campaign">
        <div class="text-h5 q-mb-sm">{{ campaign.name }}</div>
        <div class="text-body2 text-grey q-mb-lg">
          {{ campaign.description }}
        </div>

        <div class="row items-center q-mb-md">
          <div class="text-h6">Characters</div>
          <q-space />
          <q-btn
            color="primary"
            icon="sym_o_add"
            label="Create Character"
            @click="createCharacter"
          />
        </div>

        <div v-if="campaign.characters.length === 0" class="text-center q-pa-xl">
          <q-icon name="person_off" size="64px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">No characters</div>
          <div class="text-body2 text-grey-6 q-mb-md">No characters in this campaign yet.</div>
          <q-btn
            color="primary"
            icon="sym_o_add"
            label="Create Your First Character"
            @click="createCharacter"
          />
        </div>

        <div v-else class="row q-col-gutter-md">
          <div
            v-for="character in campaign.characters"
            :key="character.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card class="character-card cursor-pointer" @click="selectCharacter(character.id)">
              <q-card-section>
                <div class="text-h6">{{ character.name }}</div>
                <div class="text-subtitle2">
                  Level {{ character.level }}
                  {{ formatPaths(character.heroicPaths) }}
                  <span v-if="character.radiantOrder">
                    / {{ formatOrder(character.radiantOrder) }}
                  </span>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="health-bar">
                  <q-linear-progress
                    :value="character.currentHealth / character.maxHealth"
                    color="negative"
                    class="q-mb-xs"
                  />
                  <div class="text-caption">
                    HP: {{ character.currentHealth }} / {{ character.maxHealth }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCampaignStore } from 'stores/campaigns';
import type { HeroicPathCode, RadiantOrderCode } from 'src/types';

const props = defineProps<{
  campaignId: string;
}>();

const router = useRouter();
const campaignStore = useCampaignStore();

const campaign = computed(() => campaignStore.currentCampaign);
const loading = computed(() => campaignStore.loading);
const error = computed(() => campaignStore.error);

onMounted(async () => {
  await campaignStore.selectCampaign(Number(props.campaignId));
});

function selectCharacter(characterId: number): void {
  void router.push({
    name: 'character-sheet',
    params: {
      campaignId: props.campaignId,
      characterId: String(characterId),
    },
  });
}

function goBack(): void {
  void router.push({ name: 'campaigns' });
}

function createCharacter(): void {
  void router.push({
    name: 'character-create',
    params: { campaignId: props.campaignId },
  });
}

function formatPaths(pathCodes: HeroicPathCode[]): string {
  const names: Record<HeroicPathCode, string> = {
    agent: 'Agent',
    envoy: 'Envoy',
    hunter: 'Hunter',
    leader: 'Leader',
    scholar: 'Scholar',
    warrior: 'Warrior',
  };
  return pathCodes.map((code) => names[code] || code).join(' / ');
}

function formatOrder(orderCode: RadiantOrderCode): string {
  const names: Record<RadiantOrderCode, string> = {
    windrunner: 'Windrunner',
    skybreaker: 'Skybreaker',
    dustbringer: 'Dustbringer',
    edgedancer: 'Edgedancer',
    truthwatcher: 'Truthwatcher',
    lightweaver: 'Lightweaver',
    elsecaller: 'Elsecaller',
    willshaper: 'Willshaper',
    stoneward: 'Stoneward',
    bondsmith: 'Bondsmith',
  };
  return names[orderCode] || orderCode;
}
</script>

<style scoped>
.character-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.character-card:hover {
  transform: translateY(-2px);
}
</style>
