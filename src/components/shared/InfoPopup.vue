<template>
  <q-popup-proxy :breakpoint="0" :offset="[0, 8]">
    <q-banner dense class="text-body2"><slot /></q-banner>
  </q-popup-proxy>
</template>
