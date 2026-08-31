/**
 * One-time helper to obtain SPOTIFY_REFRESH_TOKEN.
 *
 *   1. Create an app at https://developer.spotify.com/dashboard
 *   2. Add  http://127.0.0.1:8888/callback  as a Redirect URI
 *   3. SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-token.mjs
 *   4. Open the printed URL, approve, and copy the refresh token into Vercel.
 *
 * The token does not expire; you run this once and never again.
 */
import { createServer } from 'node:http';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT = 'http://127.0.0.1:8888/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}

const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  client_id: CLIENT_ID,
  response_type: 'code',
  redirect_uri: REDIRECT,
  scope: 'user-read-currently-playing user-read-playback-state',
})}`;

console.log('\nOpen this URL and approve:\n\n' + authUrl + '\n');

const server = createServer(async (req, res) => {
  const code = new URL(req.url, 'http://127.0.0.1:8888').searchParams.get('code');
  if (!code) return res.writeHead(400).end('No code in callback.');

  const token = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT }),
  }).then((r) => r.json());

  if (!token.refresh_token) {
    console.error('\nNo refresh token returned:', token);
    res.writeHead(500).end('Failed — check the terminal.');
    return server.close();
  }

  console.log('\nSPOTIFY_REFRESH_TOKEN=' + token.refresh_token + '\n');
  res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done. Check your terminal, then close this tab.');
  server.close();
}).listen(8888, '127.0.0.1');
