// Run before styles paint. Storage may be unavailable in private/restricted contexts.
(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try { preference = localStorage.getItem('signalrank-theme') || 'system'; } catch {}
  if (!['system', 'light', 'dark'].includes(preference)) preference = 'system';
  function apply() {
    document.documentElement.dataset.theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
  }
  apply();
  media.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const control = document.getElementById('theme-choice');
    control.value = preference;
    control.addEventListener('change', () => {
      preference = control.value;
      apply();
      try { localStorage.setItem('signalrank-theme', preference); } catch {}
    });
  });
})();
