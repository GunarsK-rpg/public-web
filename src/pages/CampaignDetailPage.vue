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

      <div v-else-if="!campaign" class="text-center q-pa-xl">
        <FolderX :size="64" class="text-grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">Campaign not found</div>
        <div class="text-body2 text-grey-6 q-mb-md">
          This campaign doesn't exist or you don't have access to it.
        </div>
        <q-btn color="primary" label="Back to Campaigns" @click="goBack" />
      </div>

      <template v-else>
        <div class="row items-center q-mb-xs">
          <div class="text-h5">{{ campaign.name }}</div>
          <template v-if="isOwner">
            <q-btn
              flat
              dense
              round
              size="sm"
              class="q-ml-sm"
              :disable="saving"
              aria-label="Edit campaign"
              @click="editCampaign"
              ><Pencil :size="20"
            /></q-btn>
            <q-btn
              flat
              dense
              round
              size="sm"
              color="negative"
              :disable="saving"
              aria-label="Delete campaign"
              @click="confirmDeleteCampaign"
              ><Trash2 :size="20"
            /></q-btn>
          </template>
        </div>
        <div v-if="campaign.description" class="text-body2 text-grey q-mb-sm">
          {{ campaign.description }}
        </div>

        <div v-if="isOwner" class="row items-center no-wrap q-mb-lg">
          <div class="text-caption text-grey-6">Invite link:</div>
          <div
            class="text-caption q-ml-xs gt-xs"
            style="min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
          >
            {{ inviteUrl }}
          </div>
          <q-btn
            flat
            dense
            round
            size="xs"
            class="q-ml-xs"
            aria-label="Copy invite link"
            @click="copyInviteLink"
          >
            <Copy :size="20" />
            <q-tooltip>Copy invite link</q-tooltip>
          </q-btn>
        </div>

        <div class="row items-center q-mb-md">
          <div class="text-h6">Characters</div>
          <q-space />
          <q-btn color="primary" @click="goToJoinPage"
            ><UserPlus :size="20" class="on-left" />Add Character</q-btn
          >
        </div>

        <div v-if="campaign.heroes.length === 0" class="text-center q-pa-xl">
          <UserX :size="64" class="text-grey-5" aria-hidden="true" />
          <div class="text-h6 text-grey-7 q-mt-md">No characters</div>
          <div class="text-body2 text-grey-6">No characters in this campaign yet.</div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="hero in campaign.heroes" :key="hero.id" class="col-12 col-sm-6 col-md-4">
            <q-card
              class="card-interactive cursor-pointer"
              tabindex="0"
              role="button"
              :aria-label="`View character: ${hero.name}`"
              @click="selectCharacter(hero.id)"
              @keydown.enter="selectCharacter(hero.id)"
              @keydown.space.prevent="selectCharacter(hero.id)"
            >
              <q-card-section>
                <div class="text-h6">{{ hero.name }}</div>
                <div class="text-subtitle2">
                  Level {{ hero.level }}
                  <span v-if="hero.radiantOrder"> · {{ hero.radiantOrder.name }} </span>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="text-caption">HP: {{ hero.currentHealth }}</div>
                <div v-if="hero.user" class="text-caption text-muted">
                  {{ hero.user.displayName }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <template v-if="isOwner">
          <div class="row items-center q-mb-md q-mt-lg">
            <div class="text-h6">Combats</div>
            <q-space />
            <q-btn color="primary" :disable="saving" @click="showCreateCombat = true"
              ><Swords :size="20" class="on-left" />New Combat</q-btn
            >
          </div>

          <div v-if="combatStore.combats.length === 0" class="text-center q-pa-xl">
            <Swords :size="64" class="text-grey-5" aria-hidden="true" />
            <div class="text-h6 text-grey-7 q-mt-md">No combats yet</div>
            <div class="text-body2 text-grey-6">Create a combat to start tracking encounters.</div>
          </div>

          <div v-else class="row q-col-gutter-md">
            <div
              v-for="combat in combatStore.combats"
              :key="combat.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                class="card-interactive cursor-pointer"
                :class="{ 'combat-inactive': !combat.isActive }"
                tabindex="0"
                role="button"
                :aria-label="`View combat: ${combat.name}`"
                @click="selectCombat(combat.id)"
                @keydown.enter="selectCombat(combat.id)"
                @keydown.space.prevent="selectCombat(combat.id)"
              >
                <q-card-section>
                  <div class="text-h6">{{ combat.name }}</div>
                  <div class="text-subtitle2">Round {{ combat.round }}</div>
                </q-card-section>

                <q-card-section>
                  <q-badge
                    :color="combat.isActive ? 'positive' : 'grey'"
                    :label="combat.isActive ? 'Active' : 'Finished'"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>

          <CreateCombatDialog
            v-model="showCreateCombat"
            :saving="combatStore.saving"
            @create="onCreateCombat"
          />
        </template>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { FolderX, Pencil, Trash2, Copy, UserPlus, UserX, Swords } from 'lucide-vue-next';
import { useQuasar, copyToClipboard } from 'quasar';
import { useRouter } from 'vue-router';
import { useCampaignStore } from 'src/stores/campaigns';
import { useCombatStore } from 'src/stores/combat';
import { useClassifierStore } from 'src/stores/classifiers';
import { useErrorHandler } from 'src/composables/useErrorHandler';
import { logger } from 'src/utils/logger';
import CreateCombatDialog from 'src/components/combat/CreateCombatDialog.vue';

const props = defineProps<{
  campaignId: string;
}>();

const $q = useQuasar();
const router = useRouter();
const campaignStore = useCampaignStore();
const combatStore = useCombatStore();
const classifiers = useClassifierStore();
const { showWarning } = useErrorHandler();

const showCreateCombat = ref(false);

const initializing = ref(true);
const campaign = computed(() => campaignStore.currentCampaign);
const loading = computed(() => initializing.value || campaignStore.loading);
const error = computed(() => campaignStore.error);
const isOwner = computed(() => campaignStore.isOwner);
const saving = computed(() => campaignStore.saving);

onMounted(async () => {
  const campaignId = Number(props.campaignId);
  if (isNaN(campaignId) || campaignId <= 0) {
    campaignStore.setError('Invalid campaign ID');
    initializing.value = false;
    return;
  }
  try {
    // Initialize classifiers before loading campaign to ensure radiant order names are available
    if (!classifiers.initialized) {
      await classifiers.initialize();
      if (!classifiers.initialized) {
        logger.error('Failed to initialize classifiers');
        showWarning(
          'Some data unavailable',
          'Character details like Radiant Order names may not display correctly.'
        );
      }
    }
    await campaignStore.selectCampaign(campaignId);
    if (campaignStore.isOwner) {
      void combatStore.fetchCombats(campaignId);
    }
  } finally {
    initializing.value = false;
  }
});

function selectCharacter(characterId: number): void {
  void router.push({
    name: 'character-sheet',
    params: { characterId: String(characterId) },
  });
}

function goBack(): void {
  void router.push({ name: 'campaigns' });
}

function goToJoinPage(): void {
  if (!campaign.value) return;
  void router.push({
    name: 'join-campaign',
    params: { code: campaign.value.code },
  });
}

function editCampaign(): void {
  void router.push({
    name: 'campaign-edit',
    params: { campaignId: props.campaignId },
  });
}

function confirmDeleteCampaign(): void {
  if (!campaign.value) return;
  $q.dialog({
    title: 'Delete Campaign',
    message: `Delete "${campaign.value.name}"? This cannot be undone.`,
    cancel: true,
    persistent: false,
  }).onOk(() => {
    if (!campaign.value) return;
    void campaignStore.deleteCampaign(campaign.value.id).then((deleted) => {
      if (deleted) {
        void router.push({ name: 'campaigns' });
      }
    });
  });
}

async function onCreateCombat(name: string, description: string | null): Promise<void> {
  if (!campaign.value) return;
  const combat = await combatStore.createCombat({
    campaignId: campaign.value.id,
    name,
    description,
  });
  if (combat) {
    showCreateCombat.value = false;
    void router.push({
      name: 'combat-detail',
      params: { campaignId: props.campaignId, combatId: String(combat.id) },
    });
  }
}

function selectCombat(combatId: number): void {
  void router.push({
    name: 'combat-detail',
    params: { campaignId: props.campaignId, combatId: String(combatId) },
  });
}

const inviteUrl = computed(() => {
  if (!campaign.value) return '';
  const resolved = router.resolve({
    name: 'join-campaign',
    params: { code: campaign.value.code },
  });
  return `${window.location.origin}${resolved.href}`;
});

function copyInviteLink(): void {
  if (!campaign.value) return;
  void copyToClipboard(inviteUrl.value)
    .then(() => {
      $q.notify({ message: 'Invite link copied', type: 'positive', timeout: 1500 });
    })
    .catch(() => {
      $q.notify({ message: 'Failed to copy invite link', type: 'negative', timeout: 2000 });
    });
}
</script>

<style scoped>
.combat-inactive {
  opacity: 0.6;
  filter: grayscale(40%);
}
</style>
