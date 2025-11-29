<template>
  <div class="equipment-tab">
    <!-- Weapons -->
    <div class="section-title">Weapons</div>
    <div v-if="weapons.length === 0" class="text-grey q-pa-md">No weapons equipped</div>
    <q-list v-else separator class="q-mb-md">
      <q-item v-for="weapon in weapons" :key="weapon.weaponId">
        <q-item-section avatar>
          <q-icon
            :name="weapon.isPrimary ? 'shield' : 'radio_button_unchecked'"
            :color="weapon.isPrimary ? 'primary' : 'grey'"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ weapon.customName || getWeaponName(weapon.weaponId) }}
          </q-item-label>
          <q-item-label caption>
            {{ getWeaponDamage(weapon.weaponId) }}
            {{ getWeaponDamageType(weapon.weaponId) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="weapon-traits">
            <q-badge
              v-for="trait in getWeaponTraits(weapon.weaponId)"
              :key="trait"
              outline
              class="q-mr-xs"
            >
              {{ trait }}
            </q-badge>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Armor -->
    <div class="section-title">Armor</div>
    <div v-if="!armor" class="text-grey q-pa-md">No armor equipped</div>
    <q-card v-else flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <div class="text-subtitle1">{{ getArmorName(armor.armorId) }}</div>
            <div class="text-caption text-grey">Deflect: {{ getArmorDeflect(armor.armorId) }}</div>
          </div>
          <div class="col-auto" v-if="armor.charges !== undefined">
            <q-badge color="primary"> {{ armor.charges }} charges </q-badge>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Equipment -->
    <div class="section-title">Equipment</div>
    <div v-if="equipment.length === 0" class="text-grey q-pa-md">No equipment</div>
    <q-list v-else separator>
      <q-item v-for="item in equipment" :key="item.itemId">
        <q-item-section>
          <q-item-label>{{ getEquipmentName(item.itemId) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge v-if="item.quantity > 1" color="grey"> x{{ item.quantity }} </q-badge>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Currency -->
    <div class="section-title q-mt-md">Currency</div>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ spheres }} marks</div>
        <div class="text-caption text-grey">Spheres and currency</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const character = computed(() => characterStore.character);
const weapons = computed(() => character.value?.weapons || []);
const armor = computed(() => character.value?.armor);
const equipment = computed(() => character.value?.equipment || []);
const spheres = computed(() => character.value?.spheres || 0);

function getWeaponName(id: string): string {
  return classifierStore.getWeaponById(id)?.name || id;
}

function getWeaponDamage(id: string): string {
  return classifierStore.getWeaponById(id)?.damage || '';
}

function getWeaponDamageType(id: string): string {
  return classifierStore.getWeaponById(id)?.damageType || '';
}

function getWeaponTraits(id: string): string[] {
  return classifierStore.getWeaponById(id)?.traits || [];
}

function getArmorName(id: string): string {
  return classifierStore.getArmorById(id)?.name || id;
}

function getArmorDeflect(id: string): number {
  return classifierStore.getArmorById(id)?.deflect || 0;
}

function getEquipmentName(id: string): string {
  return classifierStore.getEquipmentById(id)?.name || id;
}
</script>

<style scoped>
.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 8px;
}
</style>
