<template>
  <div class="actions-tab">
    <div class="text-h6 q-mb-md">Combat Actions</div>

    <!-- Basic Actions -->
    <q-expansion-item icon="flash_on" label="Basic Actions" default-opened class="q-mb-sm">
      <q-card>
        <q-card-section>
          <q-list separator>
            <q-item>
              <q-item-section avatar>
                <q-badge color="primary">1</q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>Strike</q-item-label>
                <q-item-label caption> Attack with equipped weapon </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-badge color="primary">1</q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>Move</q-item-label>
                <q-item-label caption> Move up to your movement rate </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-badge color="primary">1</q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>Defend</q-item-label>
                <q-item-label caption> +2 to all defenses until next turn </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Weapon Actions -->
    <q-expansion-item
      v-if="weaponActions.length > 0"
      icon="gps_fixed"
      label="Weapon Actions"
      class="q-mb-sm"
    >
      <q-card>
        <q-card-section>
          <q-list separator>
            <q-item v-for="action in weaponActions" :key="action.id">
              <q-item-section avatar>
                <q-badge :color="getActivationColor(action.activation)">
                  {{ getActivationCost(action.activation) }}
                </q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ action.name }}</q-item-label>
                <q-item-label caption>{{ action.description }}</q-item-label>
                <q-item-label v-if="action.effect" caption class="text-italic">
                  {{ action.effect }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <div class="column items-end q-gutter-xs">
                  <q-badge color="grey" outline>{{ action.sourceName }}</q-badge>
                  <q-badge v-if="action.focusCost" color="teal" outline>
                    {{ action.focusCost }} Focus
                  </q-badge>
                  <q-badge v-if="action.investitureCost" color="purple" outline>
                    {{ action.investitureCost }} Inv
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Talent Actions -->
    <q-expansion-item
      v-if="talentActions.length > 0"
      icon="auto_awesome"
      label="Talent Actions"
      class="q-mb-sm"
    >
      <q-card>
        <q-card-section>
          <q-list separator>
            <q-item v-for="action in talentActions" :key="action.id">
              <q-item-section avatar>
                <q-badge :color="getActivationColor(action.activation)">
                  {{ getActivationCost(action.activation) }}
                </q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ action.name }}</q-item-label>
                <q-item-label caption>{{ action.description }}</q-item-label>
                <q-item-label v-if="action.effect" caption class="text-italic">
                  {{ action.effect }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <div class="column items-end q-gutter-xs">
                  <q-badge color="grey" outline>{{ action.sourceName }}</q-badge>
                  <q-badge v-if="action.focusCost" color="teal" outline>
                    {{ action.focusCost }} Focus
                  </q-badge>
                  <q-badge v-if="action.investitureCost" color="purple" outline>
                    {{ action.investitureCost }} Inv
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Armor Actions -->
    <q-expansion-item
      v-if="armorActions.length > 0"
      icon="shield"
      label="Armor Actions"
      class="q-mb-sm"
    >
      <q-card>
        <q-card-section>
          <q-list separator>
            <q-item v-for="action in armorActions" :key="action.id">
              <q-item-section avatar>
                <q-badge :color="getActivationColor(action.activation)">
                  {{ getActivationCost(action.activation) }}
                </q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ action.name }}</q-item-label>
                <q-item-label caption>{{ action.description }}</q-item-label>
                <q-item-label v-if="action.effect" caption class="text-italic">
                  {{ action.effect }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <div class="column items-end q-gutter-xs">
                  <q-badge color="grey" outline>{{ action.sourceName }}</q-badge>
                  <q-badge v-if="action.charges" color="orange" outline>
                    {{ action.charges }} Charges
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Equipment Actions -->
    <q-expansion-item
      v-if="equipmentActions.length > 0"
      icon="inventory_2"
      label="Equipment Actions"
      class="q-mb-sm"
    >
      <q-card>
        <q-card-section>
          <q-list separator>
            <q-item v-for="action in equipmentActions" :key="action.id">
              <q-item-section avatar>
                <q-badge :color="getActivationColor(action.activation)">
                  {{ getActivationCost(action.activation) }}
                </q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ action.name }}</q-item-label>
                <q-item-label caption>{{ action.description }}</q-item-label>
                <q-item-label v-if="action.effect" caption class="text-italic">
                  {{ action.effect }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <div class="column items-end q-gutter-xs">
                  <q-badge color="grey" outline>{{ action.sourceName }}</q-badge>
                  <q-badge v-if="action.charges" color="orange" outline>
                    {{ action.charges }} Charges
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Surge Actions (Radiants) -->
    <q-expansion-item v-if="isRadiant" icon="whatshot" label="Surge Actions" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div class="text-center text-muted q-pa-md">
            Surge actions will be implemented based on Radiant order
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- No Actions Message -->
    <div v-if="grantedActions.length === 0 && !isRadiant" class="text-center text-muted q-pa-lg">
      No special actions available. Acquire talents, weapons, or equipment to gain new actions.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from 'stores/character';
import type { ActionActivation, GrantedAction } from 'src/types';

const characterStore = useCharacterStore();

const isRadiant = computed(() => characterStore.isRadiant);
const grantedActions = computed(() => characterStore.grantedActions);

// Filter actions by source
const weaponActions = computed((): GrantedAction[] =>
  grantedActions.value.filter((a) => a.source === 'weapon')
);

const talentActions = computed((): GrantedAction[] =>
  grantedActions.value.filter((a) => a.source === 'talent')
);

const armorActions = computed((): GrantedAction[] =>
  grantedActions.value.filter((a) => a.source === 'armor')
);

const equipmentActions = computed((): GrantedAction[] =>
  grantedActions.value.filter((a) => a.source === 'equipment')
);

function getActivationColor(activation: ActionActivation): string {
  const colors: Record<ActionActivation, string> = {
    action: 'primary',
    bonus: 'secondary',
    'double-action': 'secondary',
    'triple-action': 'accent',
    free: 'positive',
    'free-action': 'positive',
    reaction: 'warning',
    special: 'info',
    passive: 'grey',
  };
  return colors[activation] || 'grey';
}

function getActivationCost(activation: ActionActivation): string {
  const costs: Record<ActionActivation, string> = {
    action: '1',
    bonus: 'B',
    'double-action': '2',
    'triple-action': '3',
    free: 'F',
    'free-action': 'F',
    reaction: 'R',
    special: 'S',
    passive: '-',
  };
  return costs[activation] || '?';
}
</script>
