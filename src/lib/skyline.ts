/**
 * Deterministic city generator for the hero parallax.
 *
 * Seeded so every build produces the identical skyline — a random one would
 * change the hero on each deploy and make visual regressions impossible to
 * spot. Runs at build time; nothing here ships to the browser.
 */
export type Building = { x: number; y: number; w: number; h: number; lights: [number, number][] };
export type Layer = { id: string; depth: number; buildings: Building[]; opacity: number; color: string };

/** mulberry32 — small, fast, and stable across engines. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VIEW_W = 1600;
const VIEW_H = 600;

function buildLayer(seed: number, count: number, minH: number, maxH: number, lit: number): Building[] {
  const rand = rng(seed);
  const out: Building[] = [];
  let x = -40;

  while (x < VIEW_W + 40 && out.length < count) {
    const w = 40 + rand() * 90;
    const h = minH + rand() * (maxH - minH);
    const y = VIEW_H - h;
    const lights: [number, number][] = [];

    // Window grid, sparsely lit.
    const cols = Math.max(1, Math.floor(w / 16));
    const rows = Math.max(1, Math.floor(h / 20));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() < lit) lights.push([Math.round(x + 8 + c * 16), Math.round(y + 12 + r * 20)]);
      }
    }

    out.push({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), lights });
    x += w + 6 + rand() * 26;
  }
  return out;
}

/** Back to front. `depth` drives both scroll and pointer parallax strength. */
export const layers: Layer[] = [
  { id: 'far',  depth: 0.08, opacity: 0.28, color: 'var(--city-far)', buildings: buildLayer(11, 30, 90, 210, 0.05) },
  { id: 'mid',  depth: 0.18, opacity: 0.45, color: 'var(--city-mid)',   buildings: buildLayer(29, 24, 150, 320, 0.09) },
  { id: 'near', depth: 0.34, opacity: 0.72, color: 'var(--city-near)',   buildings: buildLayer(47, 18, 220, 430, 0.13) },
];

export const VIEWBOX = `0 0 ${VIEW_W} ${VIEW_H}`;
