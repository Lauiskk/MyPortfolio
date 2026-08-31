import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations, type Lang } from '../../i18n/ui';
import { play } from '../../lib/sound';

const COLS = 53;
const ROWS = 7;
const GAP = 2;
const BEST_KEY = 'snake-best';

/**
 * Canvas has no access to CSS custom properties, so the palette is resolved
 * from the document once and re-resolved whenever the theme flips.
 */
type Palette = { levels: string[]; head: string; body: string };

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const cyan = css.getPropertyValue('--color-cyan').trim() || '#00ffff';
  const magenta = css.getPropertyValue('--color-magenta').trim() || '#ff00ff';
  const purple = css.getPropertyValue('--color-purple').trim() || '#9d00ff';
  const light = document.documentElement.dataset.theme === 'light';

  return {
    levels: [
      light ? 'rgba(10,14,39,0.07)' : 'rgba(255,255,255,0.055)',
      alpha(cyan, 0.26),
      alpha(cyan, 0.48),
      alpha(cyan, 0.72),
      cyan,
    ],
    head: magenta,
    body: purple,
  };
}

/** #rrggbb → rgba(). Falls back to the input for any other notation. */
function alpha(hex: string, a: number): string {
  const m = /^#?([\da-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

type Vec = { x: number; y: number };
type Mode = 'demo' | 'playing' | 'over';

const key = (x: number, y: number) => y * COLS + x;

/** A serpentine walk over every column — the path the demo snake follows. */
function serpentine(): Vec[] {
  const path: Vec[] = [];
  for (let x = 0; x < COLS; x++) {
    for (let i = 0; i < ROWS; i++) {
      path.push({ x, y: x % 2 === 0 ? i : ROWS - 1 - i });
    }
  }
  return path;
}

export default function SnakeGrid({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>('demo');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [offline, setOffline] = useState(false);

  /** Contribution levels, indexed by `key(x, y)`. Starts as a plausible grid. */
  const levels = useRef<Uint8Array>(new Uint8Array(COLS * ROWS));
  /** Cells already eaten this round. */
  const eaten = useRef<Set<number>>(new Set());

  const snake = useRef<Vec[]>([]);
  const dir = useRef<Vec>({ x: 1, y: 0 });
  const queued = useRef<Vec[]>([]);
  const demoStep = useRef(0);
  const path = useMemo(serpentine, []);
  const modeRef = useRef<Mode>('demo');
  modeRef.current = mode;
  const scoreRef = useRef(0);
  const bestRef = useRef(0);

  /* ── Data ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    bestRef.current = Number(localStorage.getItem(BEST_KEY) ?? 0);
    setBest(bestRef.current);

    // Placeholder shown while the request is in flight, and kept if it fails.
    // Weighted like a real calendar — mostly quiet, occasionally bright.
    const seeded = new Uint8Array(COLS * ROWS);
    for (let i = 0; i < seeded.length; i++) {
      const r = Math.random();
      seeded[i] = r < 0.46 ? 0 : r < 0.72 ? 1 : r < 0.88 ? 2 : r < 0.97 ? 3 : 4;
    }
    levels.current = seeded;

    fetch('/api/contributions')
      .then((r) => r.json())
      .then((data: { weeks?: number[][] }) => {
        if (!data.weeks?.length) { setOffline(true); return; }
        const next = new Uint8Array(COLS * ROWS);
        // The API returns the trailing 53 weeks, each 7 days, Sunday first.
        data.weeks.slice(-COLS).forEach((week, x) =>
          week.slice(0, ROWS).forEach((level, y) => { next[key(x, y)] = Math.min(4, level); }),
        );
        levels.current = next;
      })
      .catch(() => setOffline(true));
  }, []);

  /* ── Game reset ───────────────────────────────────────────────────────── */
  const reset = useCallback((next: Mode) => {
    snake.current = [
      { x: 4, y: 3 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
    ];
    dir.current = { x: 1, y: 0 };
    queued.current = [];
    eaten.current = new Set();
    demoStep.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setMode(next);
  }, []);

  /* ── Input ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const turn = (x: number, y: number) => {
      const last = queued.current.at(-1) ?? dir.current;
      // Reversing straight into yourself is an instant loss; ignore it.
      if (last.x === -x && last.y === -y) return;
      if (last.x === x && last.y === y) return;
      if (queued.current.length < 2) queued.current.push({ x, y });
    };

    const onKey = (e: KeyboardEvent) => {
      if (modeRef.current !== 'playing') return;
      const map: Record<string, Vec> = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
      };
      const v = map[e.key] ?? map[e.key.toLowerCase()];
      if (v) { e.preventDefault(); turn(v.x, v.y); }
      else if (e.key === 'Escape') { reset('demo'); }
    };

    let touch: Vec | null = null;
    const onStart = (e: TouchEvent) => {
      const p = e.touches[0];
      touch = { x: p.clientX, y: p.clientY };
    };
    const onEnd = (e: TouchEvent) => {
      if (!touch || modeRef.current !== 'playing') return;
      const p = e.changedTouches[0];
      const dx = p.clientX - touch.x;
      const dy = p.clientY - touch.y;
      if (Math.hypot(dx, dy) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0);
      else turn(0, Math.sign(dy));
      touch = null;
    };

    const onPlayEvent = () => reset('playing');

    document.addEventListener('keydown', onKey);
    document.addEventListener('snake:play', onPlayEvent);
    const el = wrapRef.current;
    el?.addEventListener('touchstart', onStart, { passive: true });
    el?.addEventListener('touchend', onEnd, { passive: true });

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('snake:play', onPlayEvent);
      el?.removeEventListener('touchstart', onStart);
      el?.removeEventListener('touchend', onEnd);
    };
  }, [reset]);

  /* ── Loop ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cell = 10;
    let palette = readPalette();
    let raf = 0;
    let acc = 0;
    let last = performance.now();

    const resize = () => {
      const width = canvas.parentElement?.clientWidth ?? 700;
      cell = Math.max(6, Math.floor((width - (COLS - 1) * GAP) / COLS));
      const w = COLS * cell + (COLS - 1) * GAP;
      const h = ROWS * cell + (ROWS - 1) * GAP;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const at = (n: number) => n * (cell + GAP);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
          const k = key(x, y);
          const level = eaten.current.has(k) ? 0 : levels.current[k] ?? 0;
          ctx.fillStyle = palette.levels[level] ?? palette.levels[0];
          ctx.fillRect(at(x), at(y), cell, cell);
        }
      }

      snake.current.forEach((seg, i) => {
        const head = i === 0;
        const fade = 1 - (i / Math.max(snake.current.length, 1)) * 0.55;
        ctx.fillStyle = head ? palette.head : palette.body;
        ctx.globalAlpha = head ? 1 : fade;
        ctx.fillRect(at(seg.x) - 1, at(seg.y) - 1, cell + 2, cell + 2);
        ctx.globalAlpha = 1;
      });
    };

    const die = () => {
      play('error');
      setMode('over');
      if (scoreRef.current > bestRef.current) {
        bestRef.current = scoreRef.current;
        localStorage.setItem(BEST_KEY, String(bestRef.current));
        setBest(bestRef.current);
      }
    };

    const step = () => {
      const body = snake.current;
      if (!body.length) return;

      let next: Vec;
      if (modeRef.current === 'playing') {
        const turn = queued.current.shift();
        if (turn) dir.current = turn;
        next = { x: body[0].x + dir.current.x, y: body[0].y + dir.current.y };

        if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) return die();
        if (body.some((s, i) => i < body.length - 1 && s.x === next.x && s.y === next.y)) return die();
      } else {
        // Demo: walk the fixed serpentine path, looping forever.
        demoStep.current = (demoStep.current + 1) % path.length;
        if (demoStep.current === 0) eaten.current = new Set();
        next = path[demoStep.current];
      }

      body.unshift(next);

      const k = key(next.x, next.y);
      const wasLit = (levels.current[k] ?? 0) > 0 && !eaten.current.has(k);
      if (wasLit) {
        eaten.current.add(k);
        if (modeRef.current === 'playing') {
          scoreRef.current += 1;
          setScore(scoreRef.current);
          play('eat');
        }
      }

      // Growing only on food, in play mode; the demo snake keeps a fixed length.
      const maxLen = modeRef.current === 'playing' ? 3 + eaten.current.size : 14;
      while (body.length > maxLen) body.pop();
    };

    const frame = (now: number) => {
      const dt = now - last;
      last = now;
      acc += dt;

      // Speeds up as the snake grows, floored so it stays playable.
      const interval = modeRef.current === 'playing'
        ? Math.max(70, 150 - snake.current.length * 2)
        : 105;

      while (acc >= interval) {
        acc -= interval;
        if (modeRef.current !== 'over') step();
      }
      draw();
      raf = requestAnimationFrame(frame);
    };

    reset('demo');
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const themeWatcher = new MutationObserver(() => { palette = readPalette(); });
    themeWatcher.observe(document.documentElement, { attributeFilter: ['data-theme', 'data-overdrive'] });

    if (reduced) {
      draw();
    } else {
      const io = new IntersectionObserver(([e]) => {
        cancelAnimationFrame(raf);
        if (e.isIntersecting) { last = performance.now(); raf = requestAnimationFrame(frame); }
      }, { threshold: 0 });
      io.observe(canvas);
      return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); themeWatcher.disconnect(); };
    }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); themeWatcher.disconnect(); };
  }, [path, reset]);

  return (
    <div>
      <div ref={wrapRef} className="panel clip-corner overflow-x-auto p-4 md:p-6">
        <canvas ref={canvasRef} className="block" role="img"
                aria-label="GitHub contribution grid with a snake moving across it" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {mode !== 'playing' ? (
          <button type="button" onClick={() => { reset('playing'); play('confirm'); }} className="btn clip-corner">
            ▶ {mode === 'over' ? t('snake.restart') : t('snake.play')}
          </button>
        ) : (
          <button type="button" onClick={() => reset('demo')} className="btn btn-ghost clip-corner">
            ■ {t('snake.stop')}
          </button>
        )}

        <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--ink-3)]">
          {t('snake.score')} <span className="text-[var(--accent)]">{score}</span>
          <span className="mx-2 opacity-40">·</span>
          {t('snake.best')} <span className="text-[var(--accent)]">{best}</span>
        </p>

        {mode === 'over' && (
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-pink)]" role="status">
            {t('snake.over')}
          </p>
        )}
      </div>

      <p className="mt-3 font-mono text-[0.66rem] text-[var(--ink-3)]">{t('snake.controls')}</p>
      {offline && <p className="mt-1 font-mono text-[0.66rem] text-[var(--ink-3)]">{t('snake.offline')}</p>}
    </div>
  );
}
