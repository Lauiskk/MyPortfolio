import type { APIRoute } from 'astro';
import { env, json } from '../../lib/env';
import { GITHUB_USER } from '../../data/profile';

export const prerender = false;

/**
 * Repo list + profile counters. A token lifts the anonymous 60 req/hr IP limit
 * that made v1 fall back to a hardcoded number; without one this still works,
 * just rate-limited, which the edge cache mostly absorbs.
 */
export const GET: APIRoute = async () => {
  const token = env('GITHUB_TOKEN');
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'lauiskk-portfolio',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, { headers }),
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error(`github ${userRes.status}/${reposRes.status}`);

    const user = await userRes.json();
    const repos: Array<{ name: string; stargazers_count: number; language: string | null; fork: boolean }> =
      await reposRes.json();

    const own = repos.filter((r) => !r.fork);
    return json(
      {
        repos: user.public_repos ?? own.length,
        followers: user.followers ?? 0,
        stars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
        list: own.map((r) => ({ name: r.name, stars: r.stargazers_count, language: r.language })),
      },
      3600,
    );
  } catch {
    // Never 500 the page over a third-party outage; the UI treats this as "no data".
    return json({ repos: null, followers: null, stars: null, list: [] }, 60);
  }
};
