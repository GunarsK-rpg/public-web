<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h5 q-mb-md">
        {{ isEditMode ? 'Edit Campaign' : 'Create Campaign' }}
      </div>

      <q-spinner-dots v-if="loadingData" size="50px" color="primary" />

      <q-banner v-else-if="loadError" class="bg-negative text-white q-mb-md">
        {{ loadError }}
        <template v-slot:action>
          <q-btn flat label="Go Back" @click="goBack" />
        </template>
      </q-banner>

      <q-card v-else flat bordered style="max-width: 600px">
        <q-card-section>
          <q-input
            v-model="form.name"
            label="Campaign Name *"
            outlined
            :maxlength="MAX_CAMPAIGN_NAME_LENGTH"
            :rules="[(val: string) => !!val?.trim() || 'Campaign name is required']"
            class="q-mb-md"
          />

          <q-input
            v-model="form.description"
            label="Description"
            type="textarea"
            outlined
            autogrow
            class="q-mb-lg"
          />

          <div class="text-subtitle2 q-mb-xs">Hero Budget Modifiers</div>
          <div class="text-caption text-grey-6 q-mb-sm">
            Adjust talent, skill rank, and expertise budgets for heroes in this campaign.
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-input
                v-model.number="form.talentsModifier"
                type="number"
                label="Talents"
                outlined
                dense
              />
            </div>
            <div class="col-4">
              <q-input
                v-model.number="form.skillsModifier"
                type="number"
                label="Skill Ranks"
                outlined
                dense
              />
            </div>
            <div class="col-4">
              <q-input
                v-model.number="form.expertisesModifier"
                type="number"
                label="Expertises"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" :disable="saving" @click="goBack" />
          <q-btn
            color="primary"
            :label="isEditMode ? 'Save' : 'Create'"
            :loading="saving"
            :disable="!isFormValid"
            @click="handleSubmit"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCampaignStore } from 'src/stores/campaigns';
import { MAX_CAMPAIGN_NAME_LENGTH } from 'src/constants/validation';
import type { Campaign, CampaignBase } from 'src/types';

const props = defineProps<{
  campaignId?: string;
}>();

const router = useRouter();
const campaignStore = useCampaignStore();

const isEditMode = computed(() => !!props.campaignId);
const saving = computed(() => campaignStore.saving);
const loadingData = ref(false);
const loadError = ref<string | null>(null);

const form = ref({
  name: '',
  description: '' as string | null,
  talentsModifier: 0,
  skillsModifier: 0,
  expertisesModifier: 0,
});

const isFormValid = computed(() => form.value.name.trim().length > 0);

onMounted(async () => {
  if (!isEditMode.value) return;

  const id = Number(props.campaignId);
  if (isNaN(id) || id <= 0) {
    loadError.value = 'Invalid campaign ID';
    return;
  }

  loadingData.value = true;
  try {
    if (campaignStore.currentCampaign?.id === id) {
      populateForm(campaignStore.currentCampaign);
    } else {
      await campaignStore.selectCampaign(id);
      if (campaignStore.currentCampaign) {
        populateForm(campaignStore.currentCampaign);
      } else {
        loadError.value = campaignStore.error ?? 'Campaign not found';
      }
    }
  } finally {
    loadingData.value = false;
  }
});

function populateForm(campaign: Campaign): void {
  form.value = {
    name: campaign.name,
    description: campaign.description ?? '',
    talentsModifier: campaign.talentsModifier ?? 0,
    skillsModifier: campaign.skillsModifier ?? 0,
    expertisesModifier: campaign.expertisesModifier ?? 0,
  };
}

async function handleSubmit(): Promise<void> {
  if (!isFormValid.value) return;

  const data: CampaignBase = {
    name: form.value.name.trim(),
    description: form.value.description?.trim() || null,
    talentsModifier: form.value.talentsModifier || 0,
    skillsModifier: form.value.skillsModifier || 0,
    expertisesModifier: form.value.expertisesModifier || 0,
  };

  if (isEditMode.value) {
    const id = Number(props.campaignId);
    const result = await campaignStore.updateCampaign(id, data);
    if (result) {
      void router.push({
        name: 'campaign-detail',
        params: { campaignId: props.campaignId },
      });
    }
  } else {
    const result = await campaignStore.createCampaign(data);
    if (result) {
      void router.push({
        name: 'campaign-detail',
        params: { campaignId: String(result.id) },
      });
    }
  }
}

function goBack(): void {
  if (isEditMode.value) {
    void router.push({
      name: 'campaign-detail',
      params: { campaignId: props.campaignId },
    });
  } else {
    void router.push({ name: 'campaigns' });
  }
}
</script>
