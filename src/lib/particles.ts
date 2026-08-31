import { prefersReducedMotion } from './motion';

/**
 * The particle network from v1, ported: dots drift, link to nearby neighbours,
 * and shy away from the cursor. Pauses when the hero scrolls away or the tab
 * is hidden — this used to be the site's main idle CPU cost.
 */
type P = { x: number; y: number; vx: number; vy: number; r: number };

const CONNECT = 110;
const MOUSE_R = 150;

function densityFor(w: number) {
  if (w <= 480) return 30;
  if (w <= 768) return 48;
  if (w <= 1280) return 74;
  return 100;
}

export function initParticles(canvas: HTMLCanvasElement | null): () => void {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx || prefersReducedMotion()) return () => {};

  let dpr = Math.min(devicePixelRatio || 1, 2);
  let w = 0, h = 0;
  let particles: P[] = [];
  let raf = 0;
  let running = true;
  const mouse = { x: -9999, y: -9999 };

  // Canvas cannot resolve CSS variables, so read the RGB triplet and rebuild
  // the colour strings whenever the theme changes.
  let rgb = '0, 255, 255';
  const readPalette = () => {
    rgb = getComputedStyle(document.documentElement).getPropertyValue('--particle').trim() || '0, 255, 255';
  };
  readPalette();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = densityFor(w);
    particles = Array.from({ length: target }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: 1 + Math.random(),
    }));
  };

  const frame = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Repel from the pointer, falling off with distance.
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < MOUSE_R && dist > 0.01) {
        const push = (1 - dist / MOUSE_R) * 0.6;
        p.x += (dx / dist) * push;
        p.y += (dy / dist) * push;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, 0.75)`;
      ctx.fill();
    }

    // Links. O(n²) but n ≤ 100, and only while the hero is on screen.
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > CONNECT) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${rgb}, ${0.18 * (1 - d / CONNECT)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running && raf) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };
  const onLeave = () => { mouse.x = mouse.y = -9999; };
  const onVisibility = () => (document.hidden ? stop() : start());

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const themeWatcher = new MutationObserver(readPalette);
  themeWatcher.observe(document.documentElement, { attributeFilter: ['data-theme'] });

  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
  io.observe(canvas);

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  start();

  return () => {
    stop();
    ro.disconnect();
    themeWatcher.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
