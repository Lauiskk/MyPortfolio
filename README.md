<div align="center">

```
╔══════════════════════════════════════════════════════════════╗
║   L F   /D E V   ·   C Y B E R P U N K   P O R T F O L I O   ║
║        go · elixir · kubernetes · kafka · postgres            ║
╚══════════════════════════════════════════════════════════════╝
```

**[Live site](https://luisfelipe-theta.vercel.app)** · **[Português](https://luisfelipe-theta.vercel.app/pt/)**

[![Astro](https://img.shields.io/badge/Astro-0a0e27?style=for-the-badge&logo=astro&logoColor=00ffff)](https://astro.build)
[![React](https://img.shields.io/badge/React-0a0e27?style=for-the-badge&logo=react&logoColor=00a8ff)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_v4-0a0e27?style=for-the-badge&logo=tailwindcss&logoColor=9d00ff)](https://tailwindcss.com)
[![GSAP](https://img.shields.io/badge/GSAP-0a0e27?style=for-the-badge&logo=greensock&logoColor=ff00ff)](https://gsap.com)
[![Vercel](https://img.shields.io/badge/Vercel-0a0e27?style=for-the-badge&logo=vercel&logoColor=ffffff)](https://vercel.com)

</div>

---

A portfolio that behaves like a product rather than a résumé in HTML: a parallax
city you can scroll into, a work history that runs sideways on a rail, a terminal
that actually parses what you type, and a snake you can play **on my real GitHub
contribution graph**.

Bilingual (EN/PT-BR), static-first, and every server-backed feature hides itself
when its credentials are missing — clone it, run it, and nothing is broken.

## What is in here

| | |
|---|---|
| **Parallax hero** | Three procedurally generated skyline layers, each scrubbed by scroll *and* damped pointer movement, over a hand-rolled particle network. |
| **Horizontal experience rail** | Four roles on a pinned track that scrubs sideways. Collapses to a vertical timeline below `lg` and under `prefers-reduced-motion`. |
| **Playable snake** | The real contribution calendar via the GitHub GraphQL API, drawn to canvas. It grazes on its own, or you take the controls. High score in `localStorage`. |
| **Terminal** | 21 commands plus 6 unlisted ones. History, Tab completion, and a `matrix` you will want to leave running. |
| **Skills constellation** | Orbital map instead of invented percentages — every node says *where* the skill was actually used. |
| **⌘K palette** | Jump to any section, open any project, flip the theme or the language. |
| **3D hologram** | React Three Fiber, desktop only, behind `client:media` — never downloaded on a phone. |
| **Live presence** | A Discord presence socket driving a NOW section: what I am listening to with album art and a progress bar that actually advances, what I have open with its rich-presence detail, and the Twitch LIVE state. Falls back to the Spotify API when Discord is closed. |
| **Live badges** | The same socket, condensed into a nav pill. One connection serves both. |
| **Konami code** | ↑↑↓↓←→←→BA. |

## Running it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static pages + Vercel functions
npm run check      # astro check (TypeScript)
```

Node 20+. No environment variables are needed to run it.

## Environment

Every variable is optional. Each feature detects its own absence and disappears
cleanly rather than erroring — the site is fully functional on a bare deploy.

| Variable | Powers | Without it |
|---|---|---|
| `GITHUB_TOKEN` | Live repo stats, the snake's real contribution grid | Falls back to the anonymous API (60 req/hr) and a sample board |
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | The LIVE badge | Badge never renders |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` / `SPOTIFY_REFRESH_TOKEN` | Now-playing badge | Badge never renders |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` | Contact form | Form is hidden; the mailto link remains |
| `PUBLIC_VIGIL_URL` | Live streaming in the Vigil case study | The panel replays a recorded run and says so |

Discord presence needs no key at all: set `DISCORD_USER_ID` in
`src/data/profile.ts` — a Discord id is public — and join
[discord.gg/lanyard](https://discord.gg/lanyard) with that account. Leave it
empty and the NOW section is never built.

```bash
cp .env.example .env
node scripts/spotify-token.mjs   # one-time, prints SPOTIFY_REFRESH_TOKEN
```

## Terminal commands

| | | | |
|---|---|---|---|
| `help` | `whoami` | `about` | `skills` |
| `experience` | `education` | `projects` | `open <project>` |
| `contact` | `social` | `resume` | `neofetch` |
| `snake` | `now` | `matrix` | `theme` |
| `lang en\|pt` | `ls` | `pwd` | `date` |
| `clear` | | | |

Six more are not in `help`. `sudo` is a good place to start.

## Layout

```
src/
├─ data/         profile · experience · skills · projects · terminal   ← all content lives here
├─ i18n/         ui.ts — every string, both languages, one key set
├─ components/
│  ├─ astro/     server-rendered sections (zero JS shipped)
│  └─ react/     the interactive islands only
├─ lib/          motion · particles · scramble · cursor · sound · theme · konami · presence
├─ pages/
│  ├─ api/       github · contributions · twitch · spotify · contact
│  └─ projects/  case studies, EN and PT
└─ styles/       global.css — tokens, chamfers, scanlines, spotlight borders
```

Content is data, not markup. Editing `src/data/experience.ts` updates the rail,
the terminal, and the structured data at once.

## Deploying

```bash
npx vercel        # link the project
npx vercel --prod
```

Add the environment variables in the Vercel dashboard. The
[snake workflow](.github/workflows/snake.yml) regenerates
`public/snake/*.svg` daily and pushes, which triggers a redeploy.

To regenerate the social card after changing the tagline:

```bash
node scripts/make-og.mjs
```

## Accessibility and motion

`prefers-reduced-motion: reduce` disables the parallax, the scramble decoding,
the pinned rail, the particles, the custom cursor and the boot sequence. The
page stays complete and readable — nothing is behind an animation. Every
interactive element is reachable by keyboard, and the constellation nodes are
focusable with a live region announcing them.

## The previous version

The original vanilla HTML/CSS/JS site is preserved on the
[`legacy-static`](../../tree/legacy-static) branch.

---

<div align="center">

```js
while (alive) { eat(); sleep(); code(); repeat(); }
```

**Luis Felipe Ribeiro Vieira** · Goiânia, Brazil
[GitHub](https://github.com/Lauiskk) · [LinkedIn](https://www.linkedin.com/in/luisinfelipe) · [vrluis157@gmail.com](mailto:vrluis157@gmail.com)

</div>
