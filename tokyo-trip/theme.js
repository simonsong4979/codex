// Apply the saved/system theme before styles paint; storage may be unavailable.
(() => {
  const key = 'tokyo-family-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const stored = localStorage.getItem(key);
    if (stored === 'light' || stored === 'dark') preference = stored;
  } catch { /* Theme switching still works for this visit. */ }
  const apply = () => {
    const mode = preference || (system.matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = mode;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = mode === 'dark' ? '#101820' : '#f6f7f9';
    window.dispatchEvent(new Event('tripthemechange'));
  };
  window.tripTheme = {
    toggle() {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key,preference); } catch { /* Do not block UI. */ }
      apply();
    }
  };
  system.addEventListener('change', () => { if (!preference) apply(); });
  window.addEventListener('storage',(event) => {
    if (event.key !== key) return;
    preference = ['light','dark'].includes(event.newValue) ? event.newValue : null;
    apply();
  });
  apply();
})();
