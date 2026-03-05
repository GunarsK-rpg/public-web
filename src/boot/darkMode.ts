import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  const { $q } = app.config.globalProperties;
  try {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      $q.dark.set(true);
    } else if (saved === 'false') {
      $q.dark.set(false);
    }
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
});
