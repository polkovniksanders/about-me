// Critical path: no heavy imports here
// Lazy-load non-critical modules after first paint to improve TBT

function bootstrap(): void {
  // Load timing field immediately (needed before user interacts with form)
  const loadTimeEl = document.getElementById('field-load-time') as HTMLInputElement | null;
  if (loadTimeEl) loadTimeEl.value = String(Date.now());

  // Lazy-load form and animation modules after first paint
  window.addEventListener('load', () => {
    Promise.all([
      import('./form').then(({ initForm }) => initForm()),
      import('./animations').then(({ initAnimations }) => initAnimations()),
    ]).catch((err: unknown) => {
      console.error('[main] module load error:', err);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
