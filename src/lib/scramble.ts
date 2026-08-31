const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

/**
 * Decodes text one character at a time out of random glyphs.
 * Used on the hero name and on every section title as it enters view.
 */
export function scramble(el: HTMLElement, text: string, duration = 900): () => void {
  const chars = [...text];
  const start = performance.now();
  const seeds = chars.map((_, i) => i / chars.length);
  let frame = 0;
  let done = false;

  const tick = (now: number) => {
    if (done) return;
    const p = Math.min(1, (now - start) / duration);
    el.textContent = chars
      .map((ch, i) => {
        if (ch === ' ') return ' ';
        // Each character settles at its own point along the run.
        return p > seeds[i] + 0.25 ? ch : GLYPHS[(frame + i * 7) % GLYPHS.length];
      })
      .join('');
    frame++;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = text;
  };

  requestAnimationFrame(tick);
  return () => {
    done = true;
    el.textContent = text;
  };
}

/** Fires `scramble` once, the first time the element scrolls into view. */
export function scrambleOnView(el: HTMLElement, duration?: number) {
  const text = el.dataset.text ?? el.textContent ?? '';
  el.textContent = text;

  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      scramble(el, text, duration);
    },
    { threshold: 0.4 },
  );
  io.observe(el);
  return () => io.disconnect();
}
