import type { APIRoute } from 'astro';
import { env, json } from '../../lib/env';
import { profile } from '../../data/profile';

export const prerender = false;

/** Tells the client whether to show the form at all. */
export const GET: APIRoute = async () => json({ enabled: Boolean(env('RESEND_API_KEY')) }, 600);

/** Crude per-instance throttle. Enough to blunt casual abuse. */
const seen = new Map<string, number[]>();
const WINDOW = 60_000;
const LIMIT = 3;

function throttled(ip: string): boolean {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW);
  hits.push(now);
  seen.set(ip, hits);
  return hits.length > LIMIT;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const key = env('RESEND_API_KEY');
  if (!key) return new Response('Contact form is not configured', { status: 501 });

  if (throttled(clientAddress ?? 'unknown')) {
    return new Response('Too many requests', { status: 429 });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // Honeypot — bots fill every field they find.
  if (body.company) return json({ ok: true });

  const name = (body.name ?? '').trim().slice(0, 120);
  const email = (body.email ?? '').trim().slice(0, 200);
  const message = (body.message ?? '').trim().slice(0, 5000);
  if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return new Response('Invalid input', { status: 422 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Portfolio <onboarding@resend.dev>',
      to: [env('CONTACT_TO_EMAIL') ?? profile.email],
      reply_to: email,
      subject: `Portfolio — ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    console.error('[contact] resend failed', res.status, await res.text());
    return new Response('Send failed', { status: 502 });
  }
  return json({ ok: true });
};
