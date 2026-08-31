/**
 * Renders the social card to public/og-default.png.
 *
 * Run after changing the tagline or palette:  node scripts/make-og.mjs
 * Kept as a committed PNG rather than a build-time render so the build stays
 * dependency-free and every deploy ships the identical card.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const html = `<!doctype html><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600&family=JetBrains+Mono:wght@400&display=swap');
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; display: flex; flex-direction: column;
    justify-content: center; padding: 72px; position: relative; overflow: hidden;
    background: #0a0e27; color: #fff; font-family: Rajdhani, sans-serif;
  }
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,255,255,.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,255,.07) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .glow {
    position: absolute; width: 760px; height: 760px; right: -220px; top: -180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(157,0,255,.42), rgba(255,0,255,.12) 45%, transparent 68%);
  }
  .inner { position: relative; }
  .pill {
    display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; margin-bottom: 30px;
    border: 1px solid rgba(0,255,255,.45); color: #00ffff;
    font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: .22em; text-transform: uppercase;
    clip-path: polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #00ffff; }
  h1 { font-family: Orbitron, sans-serif; font-weight: 900; font-size: 78px; line-height: 1.02; letter-spacing: -.01em; }
  h2 { font-family: Orbitron, sans-serif; font-weight: 700; font-size: 27px; color: #00ffff; margin-top: 14px; }
  p  { font-size: 25px; color: #a8b2d1; margin-top: 22px; max-width: 830px; line-height: 1.45; }
  .stack { display: flex; gap: 10px; margin-top: 38px; }
  .chip {
    padding: 7px 15px; border: 1px solid rgba(255,255,255,.14); color: #a8b2d1;
    font-family: 'JetBrains Mono', monospace; font-size: 16px;
  }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 6px;
         background: linear-gradient(90deg,#00ffff,#9d00ff 55%,#ff00ff); }
</style>
<div class="grid"></div><div class="glow"></div>
<div class="inner">
  <div class="pill"><span class="dot"></span>Available for hire</div>
  <h1>Luis Felipe R. Vieira</h1>
  <h2>Software Engineer &middot; Backend</h2>
  <p>Go and Elixir microservices on Kubernetes &mdash; fintech payments at J.P.&nbsp;Morgan scale, AI-driven video APIs, Kafka in between.</p>
  <div class="stack">
    <span class="chip">Golang</span><span class="chip">Elixir</span><span class="chip">Kubernetes</span>
    <span class="chip">Kafka</span><span class="chip">PostgreSQL</span><span class="chip">AWS</span>
  </div>
</div>
<div class="bar"></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: join(root, 'public/og-default.png') });
await browser.close();
console.log('wrote public/og-default.png');
