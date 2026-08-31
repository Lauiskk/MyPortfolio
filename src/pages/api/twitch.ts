import type { APIRoute } from 'astro';
import { env, json } from '../../lib/env';
import { TWITCH_USER } from '../../data/profile';

export const prerender = false;

/** Client-credentials token. Cached in module scope between warm invocations. */
let cached: { token: string; expires: number } | null = null;

async function appToken(id: string, secret: string): Promise<string | null> {
  if (cached && cached.expires > Date.now() + 30_000) return cached.token;

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: 'client_credentials' }),
  });
  if (!res.ok) return null;

  const data = await res.json();
  cached = { token: data.access_token, expires: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cached.token;
}

export const GET: APIRoute = async () => {
  const id = env('TWITCH_CLIENT_ID');
  const secret = env('TWITCH_CLIENT_SECRET');
  if (!id || !secret) return json({ live: false, reason: 'not-configured' }, 600);

  try {
    const token = await appToken(id, secret);
    if (!token) throw new Error('token');

    const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${TWITCH_USER}`, {
      headers: { 'Client-Id': id, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`helix ${res.status}`);

    const stream = (await res.json()).data?.[0];
    if (!stream) return json({ live: false }, 60);

    return json(
      {
        live: true,
        title: stream.title ?? '',
        game: stream.game_name || null,
        viewers: stream.viewer_count ?? 0,
        url: `https://twitch.tv/${TWITCH_USER}`,
      },
      60,
    );
  } catch {
    return json({ live: false, reason: 'error' }, 60);
  }
};
