const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

/** OVERDRIVE: flips a root attribute the whole palette keys off. */
export function initKonami(onUnlock?: () => void): () => void {
  let i = 0;

  const onKey = (e: KeyboardEvent) => {
    const want = SEQUENCE[i];
    const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = got === want.toLowerCase() ? i + 1 : got === SEQUENCE[0] ? 1 : 0;

    if (i === SEQUENCE.length) {
      i = 0;
      const on = document.documentElement.dataset.overdrive !== 'true';
      document.documentElement.dataset.overdrive = String(on);
      onUnlock?.();
      announce(on);
    }
  };

  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}

function announce(on: boolean) {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.className =
    'fixed left-1/2 top-24 z-[10000] -translate-x-1/2 border px-6 py-3 font-display text-sm tracking-[0.2em] uppercase clip-corner';
  el.style.cssText +=
    ';border-color:var(--accent);color:var(--accent);background:var(--surface-2);box-shadow:var(--glow)';
  el.textContent = on ? '// OVERDRIVE ENGAGED' : '// OVERDRIVE OFF';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}
