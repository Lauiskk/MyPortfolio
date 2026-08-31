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

    // Scale counts to 0–4 against this year's own maximum, so a quiet year
    // still produces a readable board instead of one flat colour.
    const max = Math.max(1, ...raw.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)));
    const weeks = raw.map((week) =>
      week.contributionDays.map((day) =>
        day.contributionCount === 0 ? 0 : Math.max(1, Math.ceil((day.contributionCount / max) * 4)),
      ),
    );

    return json({ weeks }, 3600);
  } catch {
    return json({ weeks: [], reason: 'error' }, 60);
  }
};
