import type { APIRoute } from 'astro';
import { env, json } from '../../lib/env';

export const prerender = false;

/**
 * Now-playing. Needs a one-time OAuth grant to obtain the refresh token —
 * run `node scripts/spotify-token.mjs`. Missing credentials answer
 * `{ playing: false }` and the badge stays hidden.
 */
export const GET: APIRoute = async () => {
  const id = env('SPOTIFY_CLIENT_ID');
  const secret = env('SPOTIFY_CLIENT_SECRET');
  const refresh = env('SPOTIFY_REFRESH_TOKEN');
  if (!id || !secret || !refresh) return json({ playing: false, reason: 'not-configured' }, 600);

  try {
    const auth = btoa(`${id}:${secret}`);
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
    });
    if (!tokenRes.ok) throw new Error(`token ${tokenRes.status}`);
    const { access_token } = await tokenRes.json();

    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    // 204 = nothing playing, which is the normal case, not an error.
    if (res.status === 204 || !res.ok) return json({ playing: false }, 30);

    const data = await res.json();
    if (!data?.is_playing || !data.item) return json({ playing: false }, 30);

    // Send the absolute start, not progress_ms. This response is cached at the
    // edge for 30s, and an elapsed offset would be that much too small by the
    // time a client read it; an absolute epoch is correct for the whole window.
    // A pause or a seek still invalidates it until the cache turns over, which
    // is the accepted cost of the degraded path.
    const startedAt = Date.now() - (data.progress_ms ?? 0);

    return json(
      {
        playing: true,
        track: data.item.name,
        artist: (data.item.artists ?? []).map((a: { name: string }) => a.name).join(', '),
        album: data.item.album?.name ?? null,
        art: data.item.album?.images?.[0]?.url ?? null,
        trackId: data.item.id ?? null,
        startedAt,
        endsAt: data.item.duration_ms ? startedAt + data.item.duration_ms : null,
        url: data.item.external_urls?.spotify ?? 'https://open.spotify.com',
      },
      30,
    );
  } catch {
    return json({ playing: false, reason: 'error' }, 60);
  }
};
