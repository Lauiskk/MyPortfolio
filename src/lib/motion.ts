import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  typeof matchMedia === 'function' && matchMedia('(hover: none), (pointer: coarse)').matches;

let lenis: Lenis | null = null;
let rafId = 0;

/**
 * Smooth scroll, wired into ScrollTrigger so pinned sections stay in step.
 * Skipped entirely under reduced motion — native scrolling takes over.
 */
export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return null;

  lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Native momentum on touch beats an emulated one.
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  const raf = (time: number) => {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  ScrollTrigger.defaults({ markers: false });
  return lenis;
}

export function destroySmoothScroll() {
  cancelAnimationFrame(rafId);
  lenis?.destroy();
  lenis = null;
}

export function scrollTo(target: string | HTMLElement, offset = -72) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.1 });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

/* ── Lifecycle ─────────────────────────────────────────────────────────────
   Astro's ClientRouter swaps the DOM without a reload, which orphans every
   ScrollTrigger. One registry, torn down and rebuilt on each navigation.    */

type Setup = () => void | (() => void);
const setups = new Set<Setup>();
const teardowns: Array<() => void> = [];

/** Register work that must run on every page view. Call at module scope. */
export function onView(setup: Setup) {
  setups.add(setup);
}

/**
 * Idempotent. `astro:page-load` fires on the very first load as well as after
 * each client-side navigation, so without this guard every setup ran twice —
 * which stacked two `gsap.from` tweens on the same nodes, the second capturing
 * the first's mid-flight opacity as its end state and leaving content invisible.
 */
let ran = false;

function run() {
  if (ran) return;
  ran = true;
  for (const setup of setups) {
    try {
      const teardown = setup();
      if (typeof teardown === 'function') teardowns.push(teardown);
    } catch (err) {
      console.error('[motion] setup failed', err);
    }
  }
  ScrollTrigger.refresh();
}

function cleanup() {
  ran = false;
  while (teardowns.length) teardowns.pop()?.();
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

export function bootMotion() {
  initSmoothScroll();

  document.addEventListener('astro:before-swap', cleanup);
  document.addEventListener('astro:after-swap', () => {
    lenis?.scrollTo(0, { immediate: true });
  });
  document.addEventListener('astro:page-load', run);

  // Runs now if ClientRouter never fires the event (or already did).
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();

  // Fonts change metrics; stale trigger positions cause visible drift.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, lenis };
