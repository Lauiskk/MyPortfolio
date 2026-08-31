import type { APIRoute } from 'astro';
import { env, json } from '../../lib/env';
import { GITHUB_USER } from '../../data/profile';

export const prerender = false;

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { contributionCount } }
      }
    }
  }
}`;

/**
 * The real contribution calendar, as levels 0–4 per day, for the snake board.
 * Only the GraphQL API exposes this, and it always requires a token — with no
 * token we answer `{ weeks: [] }` and the component shows its generated grid.
 */
export const GET: APIRoute = async () => {
  const token = env('GITHUB_TOKEN');
  if (!token) return json({ weeks: [], reason: 'no-token' }, 300);

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'lauiskk-portfolio',
      },
      body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_USER } }),
    });
    if (!res.ok) throw new Error(`graphql ${res.status}`);

    const body = await res.json();
    const raw: Array<{ contributionDays: Array<{ contributionCount: number }> }> =
      body?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];

    /*
     * Bucket into 0-4 by quartile over the *active* days, which is how GitHub
     * shades its own calendar. Scaling linearly against the maximum instead
     * lets a single outlier day flatten everything else onto level 1 — with
     * this account that put 101 of 111 active days in the same shade.
     */
    const active = raw
      .flatMap((w) => w.contributionDays.map((d) => d.contributionCount))
      .filter((n) => n > 0)
      .sort((a, b) => a - b);

    const at = (q: number) => active[Math.min(active.length - 1, Math.floor(active.length * q))] ?? 0;
    const [q1, q2, q3] = [at(0.25), at(0.5), at(0.75)];

    const level = (n: number) => (n <= 0 ? 0 : n > q3 ? 4 : n > q2 ? 3 : n > q1 ? 2 : 1);

    const weeks = raw.map((week) => week.contributionDays.map((day) => level(day.contributionCount)));

    return json({ weeks }, 3600);
  } catch {
    return json({ weeks: [], reason: 'error' }, 60);
  }
};
