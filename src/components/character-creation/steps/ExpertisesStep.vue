<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">Select your expertises</div>
    <div class="text-caption q-mb-md">
      Free slots:
      <strong :class="slotsRemaining >= 0 ? 'text-positive' : 'text-negative'">{{
        slotsRemaining
      }}</strong>
      ({{ intellectScore }} from Intellect)
    </div>

    <!-- Cultural Expertises Banner -->
    <q-banner v-if="culturalExpertises.length > 0" class="banner-info q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_language" />
      </template>
      <div>
        <strong>Cultural Expertises:</strong>
        {{ culturalExpertises.map((e) => e.name).join(', ') }}
      </div>
      <div class="text-caption text-muted">Auto-applied from your selected cultures</div>
    </q-banner>

    <!-- Starting Kit Expertises Banner -->
    <q-banner v-if="startingKitExpertises.length > 0" class="banner-info q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_backpack" />
      </template>
      <div>
        <strong>Starting Kit Expertises:</strong>
        {{ startingKitExpertises.map((e) => e.name).join(', ') }}
      </div>
      <div class="text-caption text-muted">Granted by your starting kit</div>
    </q-banner>

    <!-- Category Tabs -->
    <q-tabs
      v-model="selectedCategory"
      dense
      class="q-mb-md"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="all" label="All" />
      <q-tab name="cultural" label="Cultural" />
      <q-tab name="utility" label="Utility" />
      <q-tab name="weapon" label="Weapon" />
      <q-tab name="armor" label="Armor" />
      <q-tab name="specialist" label="Specialist" />
    </q-tabs>

    <!-- Expertise List -->
    <q-list bordered separator>
      <q-item
        v-for="expertise in filteredExpertises"
        :key="expertise.id"
        :class="{ 'item-selected': isSelected(expertise.id) }"
      >
        <q-item-section avatar>
          <q-checkbox
            :model-value="isSelected(expertise.id)"
            :disable="
              isReadOnly(expertise.id) || (!isSelected(expertise.id) && slotsRemaining <= 0)
            "
            @update:model-value="toggleExpertise(expertise.id)"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ expertise.name }}</q-item-label>
          <q-item-label caption>{{ expertise.description }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge
            v-if="getSource(expertise.id)"
            :color="getSourceColor(getSource(expertise.id) ?? '')"
          >
            {{ formatSource(getSource(expertise.id) ?? '') }}
          </q-badge>
          <q-badge v-if="expertise.isRestricted" color="warning">Restricted</q-badge>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';

const store = useCharacterCreationStore();
const classifiers = useClassifierStore();

const selectedCategory = ref('all');

const intellectScore = computed(() => store.attributes.allocation.intellect);
const slotsRemaining = computed(() => store.expertiseSlotsRemaining);

// Get cultural expertises (auto-applied from cultures)
const culturalExpertises = computed(() => {
  return store.expertises.allocations
    .filter((e) => e.source === 'culture')
    .map((e) => classifiers.getExpertiseById(e.expertiseId))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);
});

// Get expertises from starting kit
const startingKitExpertises = computed(() => {
  return store.expertises.allocations
    .filter((e) => e.source === 'starting_kit')
    .map((e) => classifiers.getExpertiseById(e.expertiseId))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);
});

const categoryMap: Record<string, number> = {
  armor: 1,
  cultural: 2,
  utility: 3,
  weapon: 4,
  specialist: 5,
};

const filteredExpertises = computed(() => {
  if (selectedCategory.value === 'all') {
    return classifiers.expertises;
  }
  const categoryId = categoryMap[selectedCategory.value];
  return classifiers.expertises.filter((e) => e.categoryId === categoryId);
});

function isSelected(expertiseId: number): boolean {
  return store.expertises.allocations.some((e) => e.expertiseId === expertiseId);
}

function isReadOnly(expertiseId: number): boolean {
  const source = getSource(expertiseId);
  // Cultural and starting kit expertises are read-only
  return source === 'culture' || source === 'starting_kit';
}

function getSource(expertiseId: number): string | null {
  const alloc = store.expertises.allocations.find((e) => e.expertiseId === expertiseId);
  return alloc?.source || null;
}

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    starting_kit: 'green',
    culture: 'blue',
    intellect: 'purple',
    talent: 'orange',
    training: 'grey',
  };
  return colors[source] || 'grey';
}

function formatSource(source: string): string {
  const labels: Record<string, string> = {
    starting_kit: 'Kit',
    culture: 'Culture',
    intellect: 'INT',
    talent: 'Talent',
    training: 'Training',
  };
  return labels[source] || source;
}

function toggleExpertise(expertiseId: number) {
  if (isSelected(expertiseId)) {
    // Don't remove read-only expertises
    if (!isReadOnly(expertiseId)) {
      store.removeExpertise(expertiseId);
    }
  } else if (slotsRemaining.value > 0) {
    store.addExpertise(expertiseId, 'intellect');
  }
}
</script>
