import { prefersReducedMotion } from './motion';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary, .cursor-target';

/**
 * A neon reticle that lags behind the real pointer and snaps onto anything
 * interactive. The native cursor is hidden only over the page body, never
 * globally — v1 used `* { cursor: none !important }`, which also killed the
 * text caret and every resize handle.
 */
export function initCursor(): () => void {
  if (!matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return () => {};

  const root = document.createElement('div');
  root.className = 'cyber-cursor';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <span class="cyber-cursor__ring"></span>
    <span class="cyber-cursor__dot"></span>
    <span class="cyber-cursor__label"></span>`;
  document.body.appendChild(root);
  document.body.classList.add('has-cyber-cursor');

  const ring = root.querySelector<HTMLElement>('.cyber-cursor__ring')!;
  const dot = root.querySelector<HTMLElement>('.cyber-cursor__dot')!;

  let tx = innerWidth / 2, ty = innerHeight / 2;   // target (real pointer)
  let rx = tx, ry = ty;                             // ring (eased)
  let snap: DOMRect | null = null;
  let raf = 0;
  let last = performance.now();

  /**
   * Exponential smoothing rates, per second. Time-based rather than per-frame:
   * a fixed `* 0.18` each tick makes the ring track at whatever rate the
   * display happens to run at — sluggish at 30fps, twitchy at 144Hz.
   * FREE is high enough that the ring reads as attached to the pointer;
   * SNAP is softer so landing on a button still feels magnetic.
   */
  const FREE_RATE = 34;
  const SNAP_RATE = 20;

  const onMove = (e: PointerEvent) => {
    tx = e.clientX;
    ty = e.clientY;

    const hit = (e.target as HTMLElement | null)?.closest<HTMLElement>(INTERACTIVE);
    if (hit) {
      snap = hit.getBoundingClientRect();
      root.dataset.state = hit.dataset.cursor ?? 'link';
      root.querySelector('.cyber-cursor__label')!.textContent = hit.dataset.cursorLabel ?? '';
    } else {
      snap = null;
      root.dataset.state = 'default';
    }
  };

  const tick = (now: number) => {
    // Clamped so a backgrounded tab does not resume with one giant jump.
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    // Magnetic pull: the ring settles on the element's centre, not the pointer.
    const gx = snap ? snap.left + snap.width / 2 : tx;
    const gy = snap ? snap.top + snap.height / 2 : ty;
    const k = 1 - Math.exp(-(snap ? SNAP_RATE : FREE_RATE) * dt);
    rx += (gx - rx) * k;
    ry += (gy - ry) * k;

    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;

    if (snap) {
      ring.style.width = `${snap.width + 14}px`;
      ring.style.height = `${snap.height + 14}px`;
    } else {
      ring.style.width = '';
      ring.style.height = '';
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const down = () => root.classList.add('is-down');
  const up = () => root.classList.remove('is-down');
  const leave = () => (root.style.opacity = '0');
  const enter = () => (root.style.opacity = '');

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerdown', down);
  document.addEventListener('pointerup', up);
  document.addEventListener('pointerleave', leave);
  document.addEventListener('pointerenter', enter);

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerdown', down);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointerleave', leave);
    document.removeEventListener('pointerenter', enter);
    root.remove();
    document.body.classList.remove('has-cyber-cursor');
  };
}
