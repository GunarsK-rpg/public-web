import { computed, ref } from 'vue';

export function useSavingState() {
  const savingCount = ref(0);
  const saving = computed(() => savingCount.value > 0);

  function startSaving() {
    savingCount.value++;
  }

  function stopSaving() {
    savingCount.value = Math.max(0, savingCount.value - 1);
  }

  function resetSaving() {
    savingCount.value = 0;
  }

  return { saving, startSaving, stopSaving, resetSaving };
}
