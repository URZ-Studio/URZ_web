/* Resolve the theme before the first paint. */
(() => {
  let theme;
  try { theme = localStorage.getItem('urz-theme'); } catch {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
})();
