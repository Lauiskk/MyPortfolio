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
