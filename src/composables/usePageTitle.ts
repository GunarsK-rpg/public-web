import { ref } from 'vue';

const dynamicTitle = ref<string | null>(null);

export function usePageTitle() {
  function setPageTitle(title: string) {
    dynamicTitle.value = title;
  }

  function clearPageTitle() {
    dynamicTitle.value = null;
  }

  return { dynamicTitle, setPageTitle, clearPageTitle };
}
