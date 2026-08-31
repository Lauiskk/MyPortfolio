/**
 * Feeds `--mx` / `--my` to `.spotlight` elements so their border lights up
 * under the cursor. One delegated listener for the whole page.
 */
export function initSpotlight(): () => void {
  if (matchMedia('(pointer: coarse)').matches) return () => {};

  let raf = 0;
  let pending: { el: HTMLElement; x: number; y: number } | null = null;

  const flush = () => {
    raf = 0;
    if (!pending) return;
    const { el, x, y } = pending;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    pending = null;
  };

  const onMove = (e: PointerEvent) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('.spotlight');
    if (!el) return;
    const r = el.getBoundingClientRect();
    pending = { el, x: e.clientX - r.left, y: e.clientY - r.top };
    if (!raf) raf = requestAnimationFrame(flush);
  };

  document.addEventListener('pointermove', onMove, { passive: true });
  return () => {
    document.removeEventListener('pointermove', onMove);
    cancelAnimationFrame(raf);
  };
}
