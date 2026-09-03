import { DISCORD_USER_ID } from '../data/profile';

/**
 * Server-side secrets. Astro exposes non-PUBLIC_ vars on `import.meta.env`;
 * Vercel functions see them on `process.env`. Check both so the same code
 * works in `astro dev`, `astro preview` and on the deployed function.
 */
export function env(name: string): string | undefined {
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[name];
  if (fromMeta) return fromMeta;
  return typeof process !== 'undefined' ? process.env?.[name] : undefined;
}

/**
 * The NOW section needs at least one source it can actually reach. Discord is
 * a build-time constant; Spotify is a server secret. With neither, the section
 * is not built at all — same contract as every other feature here.
 */
export const nowEnabled = () => Boolean(DISCORD_USER_ID || env('SPOTIFY_CLIENT_ID'));

export const json = (data: unknown, seconds = 0) =>
  new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      // Vercel's edge cache serves the stale copy while it revalidates.
      'Cache-Control': seconds
        ? `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 4}`
        : 'no-store',
    },
  });
