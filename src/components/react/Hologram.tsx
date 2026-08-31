import { lazy, Suspense, useEffect, useState } from 'react';

// Code-split: three + R3F (~860 KB) is fetched only when `ready` flips true.
const Scene = lazy(() => import('./HologramScene'));

/**
 * Reserves the hero's right-hand square immediately, then loads the 3D scene
 * once the browser is idle — so the decoration never competes with the hero
 * animation or first input. Skipped entirely under reduced motion.
 */
export default function Hologram() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const start = () => setReady(true);

    // Older Safari has no requestIdleCallback; a short timeout is close enough.
    // The DOM lib types it as always present, hence the explicit optional read.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const useIdle = typeof w.requestIdleCallback === 'function';
    const handle = useIdle
      ? w.requestIdleCallback!(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);

    return () => {
      if (useIdle) w.cancelIdleCallback?.(handle);
      else clearTimeout(handle);
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] animate-float" aria-hidden="true">
      {/* Bloom stand-in: a blurred radial behind the mesh, for a fraction of the cost. */}
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_28%,transparent),transparent_68%)] blur-2xl" />

      {ready && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}

      {/* Scanline sweep across the hologram. */}
      <div className="pointer-events-none absolute inset-[12%] overflow-hidden rounded-full">
        <div
          className="h-6 w-full bg-gradient-to-b from-transparent via-[var(--accent)]/18 to-transparent blur-[2px]"
          style={{ animation: 'sweep-down 4.5s linear infinite' }}
        />
      </div>
    </div>
  );
}
