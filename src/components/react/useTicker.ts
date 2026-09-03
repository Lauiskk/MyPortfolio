import { useEffect, useState } from 'react';

/**
 * One shared second-hand for anything that counts up on screen: the elapsed
 * time on a track and on a running game. Paused while the tab is hidden —
 * browsers throttle background timers anyway, and nobody is reading it.
 */
export function useTicker(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    const onVisible = () => !document.hidden && tick();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [active]);

  return now;
}

/**
 * The global reduced-motion rule in global.css forces every transition to
 * 0.001ms, which would snap the progress bar straight to full. Components read
 * this to drive the width from the ticker instead.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return reduced;
}
