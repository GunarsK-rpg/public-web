<template>
  <div class="others-tab">
    <!-- Ancestry & Culture Section -->
    <q-expansion-item icon="public" label="Ancestry & Culture" default-opened class="q-mb-sm">
      <q-card>
        <q-card-section>
          <!-- Ancestry -->
          <div class="text-subtitle2 q-mb-sm">Ancestry</div>
          <div class="row items-center q-mb-md">
            <q-icon
              :name="ancestry?.code === 'singer' ? 'music_note' : 'person'"
              size="md"
              class="q-mr-sm"
              :color="ancestry?.code === 'singer' ? 'purple' : 'primary'"
            />
            <div>
              <div class="text-body1 text-weight-medium">{{ ancestry?.name || 'Unknown' }}</div>
              <div class="text-caption text-grey">{{ ancestry?.description }}</div>
            </div>
          </div>

          <!-- Singer Form (if Singer) -->
          <template v-if="character?.ancestry === 'singer' && activeSingerForm">
            <div class="text-subtitle2 q-mb-sm">Current Form</div>
            <div class="row items-center q-mb-md">
              <q-chip color="purple" text-color="white">
                {{ activeSingerForm.name }}
              </q-chip>
              <span class="text-caption q-ml-sm">{{ activeSingerForm.sprenType }} spren</span>
            </div>
            <div v-if="activeSingerForm.passiveAbilities?.length" class="q-mb-md">
              <q-badge
                v-for="ability in activeSingerForm.passiveAbilities"
                :key="ability"
                color="purple-4"
                class="q-mr-xs q-mb-xs"
              >
                {{ ability }}
              </q-badge>
            </div>
          </template>

          <!-- Cultures -->
          <div class="text-subtitle2 q-mb-sm">Cultures</div>
          <div v-if="characterCultures.length === 0" class="text-grey q-mb-md">
            No cultures selected
          </div>
          <q-list v-else separator class="q-mb-md">
            <q-item v-for="culture in characterCultures" :key="culture.id" dense>
              <q-item-section avatar>
                <q-icon name="groups" color="teal" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ culture.name }}</q-item-label>
                <q-item-label caption>{{ culture.region }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge v-for="lang in culture.languages" :key="lang" outline class="q-mr-xs">
                  {{ lang }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Expertises Section -->
    <q-expansion-item icon="school" label="Expertises" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="expertisesByCategory.length === 0" class="text-grey">No expertises</div>
          <template v-else>
            <div v-for="category in expertisesByCategory" :key="category.category" class="q-mb-md">
              <div class="text-subtitle2 q-mb-xs text-capitalize">
                {{ category.category }} Expertises
              </div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="exp in category.expertises"
                  :key="exp.expertiseId"
                  :color="getExpertiseCategoryColor(category.category)"
                  :outline="exp.source !== 'culture'"
                  size="sm"
                >
                  {{ getExpertiseName(exp.expertiseId) }}
                  <q-tooltip v-if="exp.source">Source: {{ exp.source }}</q-tooltip>
                </q-chip>
              </div>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Goals Section -->
    <q-expansion-item icon="flag" label="Goals" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="goals.length === 0" class="text-grey">No goals set</div>
          <q-list v-else separator>
            <q-item v-for="goal in goals" :key="goal.name">
              <q-item-section avatar>
                <q-icon
                  :name="getGoalIcon(goal.type)"
                  :color="goal.status === 'completed' ? 'positive' : 'primary'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label :class="{ 'text-strike': goal.status === 'completed' }">
                  {{ goal.name }}
                </q-item-label>
                <q-item-label caption>{{ goal.description }}</q-item-label>
                <q-item-label caption>
                  <q-badge :color="getGoalTypeColor(goal.type)" class="q-mr-xs">
                    {{ goal.type }}
                  </q-badge>
                  <q-badge outline>{{ goal.category }}</q-badge>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="goal.status === 'completed' ? 'positive' : 'grey'">
                  {{ goal.status }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Connections Section -->
    <q-expansion-item icon="people" label="Connections" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="connections.length === 0" class="text-grey">No connections</div>
          <q-list v-else separator>
            <q-item v-for="conn in connections" :key="conn.name">
              <q-item-section avatar>
                <q-icon
                  :name="getConnectionIcon(conn.type)"
                  :color="getConnectionColor(conn.type)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ conn.name }}</q-item-label>
                <q-item-label caption>{{ conn.description }}</q-item-label>
                <q-item-label v-if="conn.organization" caption>
                  Organization: {{ conn.organization }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="getConnectionColor(conn.type)">
                  {{ conn.type }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Companions Section -->
    <q-expansion-item icon="pets" label="Companions" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="companions.length === 0" class="text-grey">No companions</div>
          <q-list v-else separator>
            <q-item v-for="comp in companions" :key="comp.name">
              <q-item-section avatar>
                <q-icon :name="getCompanionIcon(comp.type)" :color="getCompanionColor(comp.type)" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ comp.name }}</q-item-label>
                <q-item-label caption>{{ comp.type }}</q-item-label>
                <q-item-label v-if="comp.personality" caption>
                  {{ comp.personality }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Biography Section -->
    <q-expansion-item icon="person" label="Biography" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Appearance</div>
          <div class="text-body2 q-mb-md">
            {{ character?.appearance || 'No appearance description' }}
          </div>

          <div class="text-subtitle2 q-mb-sm">Biography</div>
          <div class="text-body2 q-mb-md">
            {{ character?.biography || 'No biography' }}
          </div>

          <div class="text-subtitle2 q-mb-sm">Notes</div>
          <div class="text-body2">
            {{ character?.notes || 'No notes' }}
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Conditions Section -->
    <q-expansion-item icon="warning" label="Conditions & Injuries" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Active Conditions</div>
          <div v-if="conditions.length === 0" class="text-grey q-mb-md">No active conditions</div>
          <div v-else class="q-mb-md">
            <q-chip
              v-for="cond in conditions"
              :key="cond.id"
              :color="isPositiveCondition(cond.conditionId) ? 'positive' : 'negative'"
              text-color="white"
            >
              {{ getConditionName(cond.conditionId) }}
              <span v-if="cond.value">[{{ cond.value }}]</span>
            </q-chip>
          </div>

          <div class="text-subtitle2 q-mb-sm">Injuries</div>
          <div v-if="injuries.length === 0" class="text-grey">No injuries</div>
          <q-list v-else dense>
            <q-item v-for="injury in injuries" :key="injury.id">
              <q-item-section>
                <q-item-label>{{ injury.injuryId }}</q-item-label>
                <q-item-label caption v-if="injury.daysRemaining">
                  {{ injury.daysRemaining }} days remaining
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';
import type {
  GoalType,
  ConnectionTypeCode,
  CompanionTypeCode,
  ExpertiseCategoryCode,
  CharacterExpertise,
  Culture,
} from 'src/types';

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const character = computed(() => characterStore.character);
const goals = computed(() => character.value?.goals || []);
const connections = computed(() => character.value?.connections || []);
const companions = computed(() => character.value?.companions || []);
const conditions = computed(() => character.value?.conditions || []);
const injuries = computed(() => character.value?.injuries || []);

// Ancestry & Culture
const ancestry = computed(() => {
  if (!character.value?.ancestry) return null;
  return classifierStore.getAncestryByCode(character.value.ancestry);
});

const activeSingerForm = computed(() => {
  if (!character.value?.activeSingerForm) return null;
  return classifierStore.getSingerFormByCode(character.value.activeSingerForm);
});

const characterCultures = computed((): Culture[] => {
  if (!character.value?.cultures) return [];
  return character.value.cultures
    .map((cultureCode) => classifierStore.getCultureByCode(cultureCode))
    .filter((c): c is Culture => c !== undefined);
});

// Expertises grouped by category
interface ExpertiseGroup {
  category: ExpertiseCategoryCode;
  expertises: CharacterExpertise[];
}

const expertisesByCategory = computed((): ExpertiseGroup[] => {
  const expertises = character.value?.expertises || [];
  if (expertises.length === 0) return [];

  const groups: Record<string, CharacterExpertise[]> = {};

  for (const exp of expertises) {
    const expertise = classifierStore.getExpertiseById(exp.expertiseId);
    const categoryCode = classifierStore.getExpertiseCategoryCode(expertise?.categoryId ?? 0) || 'utility';
    if (!groups[categoryCode]) {
      groups[categoryCode] = [];
    }
    groups[categoryCode].push(exp);
  }

  const order: ExpertiseCategoryCode[] = ['cultural', 'weapon', 'armor', 'utility', 'specialist'];
  return order
    .filter((cat) => groups[cat] && groups[cat].length > 0)
    .map((category) => ({
      category,
      expertises: groups[category] as CharacterExpertise[],
    }));
});

function getExpertiseName(id: number): string {
  return classifierStore.getExpertiseById(id)?.name || String(id);
}

function getExpertiseCategoryColor(category: ExpertiseCategoryCode): string {
  const colors: Record<ExpertiseCategoryCode, string> = {
    cultural: 'teal',
    weapon: 'red',
    armor: 'blue-grey',
    utility: 'orange',
    specialist: 'purple',
  };
  return colors[category] || 'grey';
}

function getGoalIcon(type: GoalType): string {
  const icons: Record<GoalType, string> = {
    drive: 'local_fire_department',
    burden: 'fitness_center',
    personal: 'person',
    'short-term': 'schedule',
    'long-term': 'trending_up',
  };
  return icons[type] || 'flag';
}

function getGoalTypeColor(type: GoalType): string {
  const colors: Record<GoalType, string> = {
    drive: 'orange',
    burden: 'red',
    personal: 'teal',
    'short-term': 'blue',
    'long-term': 'purple',
  };
  return colors[type] || 'grey';
}

function getConnectionIcon(type: ConnectionTypeCode): string {
  const icons: Record<ConnectionTypeCode, string> = {
    ally: 'handshake',
    contact: 'contact_phone',
    rival: 'sports_kabaddi',
    enemy: 'dangerous',
    patron: 'volunteer_activism',
    follower: 'group',
  };
  return icons[type] || 'person';
}

function getConnectionColor(type: ConnectionTypeCode): string {
  const colors: Record<ConnectionTypeCode, string> = {
    ally: 'positive',
    contact: 'info',
    rival: 'warning',
    enemy: 'negative',
    patron: 'purple',
    follower: 'teal',
  };
  return colors[type] || 'grey';
}

function getCompanionIcon(type: CompanionTypeCode): string {
  const icons: Record<CompanionTypeCode, string> = {
    spren: 'auto_awesome',
    animal: 'pets',
    follower: 'person',
    other: 'help_outline',
  };
  return icons[type] || 'pets';
}

function getCompanionColor(type: CompanionTypeCode): string {
  const colors: Record<CompanionTypeCode, string> = {
    spren: 'amber',
    animal: 'brown',
    follower: 'blue',
    other: 'grey',
  };
  return colors[type] || 'grey';
}

function getConditionName(id: number): string {
  return classifierStore.getConditionById(id)?.name || String(id);
}

function isPositiveCondition(id: number): boolean {
  return classifierStore.getConditionById(id)?.isPositive || false;
}
</script>
