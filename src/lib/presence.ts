/**
 * One live-presence store for the whole page.
 *
 * Discord presence arrives over Lanyard's WebSocket — pushed, not polled, so
 * the panel reacts the moment a track or a game changes. Spotify and Twitch
 * are polled as a fallback for the case Lanyard cannot see: the Discord client
 * closed while music still plays somewhere else.
 *
 * This is a module singleton rather than a hook's local state because the nav
 * badge and the NOW section are separate React roots. One socket, one poll
 * timer, however many subscribers.
 */
import { DISCORD_USER_ID, TWITCH_USER } from '../data/profile';

const REST = 'https://api.lanyard.rest/v1/users';
const SOCKET = 'wss://api.lanyard.rest/socket';

/** Matches the cache on /api/spotify so the poll never outruns the edge. */
const POLL_MS = 30_000;
const TWITCH_POLL_MS = 120_000;
const MAX_BACKOFF_MS = 30_000;

/**
 * ClientRouter unmounts the old island *after* the swap, and the replacement
 * hydrates later still (client:idle waits for an idle callback). Tearing the
 * socket down the instant the refcount hits zero would therefore reconnect on
 * every single navigation. Wait long enough for the new island to claim it.
 */
const GRACE_MS = 8_000;

export type Status = 'online' | 'idle' | 'dnd' | 'offline';

/**
 * `live` is the socket; `rest` means the socket failed and we are polling the
 * REST endpoint instead; `unavailable` is terminal — no id configured, or the
 * account is not in the Lanyard guild, so retrying would never help.
 */
export type Conn = 'idle' | 'connecting' | 'live' | 'rest' | 'unavailable';

export type Track = {
  song: string;
  artist: string;
  album: string | null;
  art: string | null;
  url: string | null;
  trackId: string | null;
  /** Epoch ms. Null when the source reports no position. */
  start: number | null;
  end: number | null;
  source: 'discord' | 'spotify';
};

export type Activity = {
  name: string;
  details: string | null;
  state: string | null;
  image: string | null;
  start: number | null;
};

export type Presence = {
  status: Status;
  onDesktop: boolean;
  onMobile: boolean;
  onWeb: boolean;
  name: string | null;
  avatar: string | null;
  spotify: Track | null;
  activity: Activity | null;
};

export type Twitch = { title: string; game: string | null; url: string };

export type State = {
  conn: Conn;
  presence: Presence | null;
  /** From /api/spotify. Only consulted when Discord reports no music. */
  fallback: Track | null;
  twitch: Twitch | null;
};

const IDLE: State = { conn: 'idle', presence: null, fallback: null, twitch: null };

let state: State = IDLE;
const listeners = new Set<(s: State) => void>();
let refs = 0;
let started = false;
let grace: number | null = null;

let socket: WebSocket | null = null;
let heartbeat: number | null = null;
let retry: number | null = null;
let attempt = 0;
let spotifyTimer: number | null = null;
let twitchTimer: number | null = null;
/** Set once Lanyard says the account is not monitored. Stops all retrying. */
let dead = false;

/* ── store ──────────────────────────────────────────────────────────────── */

export function getSnapshot(): State {
  return state;
}

/** SSR has no socket and no window; every island starts from the same object. */
export function getServerSnapshot(): State {
  return IDLE;
}

function commit(next: State) {
  // useSyncExternalStore bails out on an unchanged reference, so only publish
  // a new object when something actually moved. The payload is a few hundred
  // bytes; stringify is cheaper than getting a hand-rolled compare wrong.
  if (JSON.stringify(next) === JSON.stringify(state)) return;
  state = next;
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn: (s: State) => void): () => void {
  listeners.add(fn);
  fn(state);
  refs += 1;

  if (grace !== null) {
    clearTimeout(grace);
    grace = null;
  }
  if (!started) {
    started = true;
    start();
  }

  return () => {
    listeners.delete(fn);
    if (--refs > 0 || grace !== null) return;
    grace = window.setTimeout(() => {
      grace = null;
      started = false;
      stop();
    }, GRACE_MS);
  };
}

/* ── lifecycle ──────────────────────────────────────────────────────────── */

function start() {
  if (typeof window === 'undefined') return;

  pollTwitch();
  twitchTimer = window.setInterval(pollTwitch, TWITCH_POLL_MS);

  if (!DISCORD_USER_ID) {
    // No Discord to watch, but /api/spotify may still have something.
    commit({ ...state, conn: 'unavailable' });
    pollSpotify();
    spotifyTimer = window.setInterval(pollSpotify, POLL_MS);
    return;
  }

  document.addEventListener('visibilitychange', onVisibility);
  connect();
}

function stop() {
  document.removeEventListener('visibilitychange', onVisibility);
  closeSocket();
  if (retry !== null) clearTimeout(retry);
  if (spotifyTimer !== null) clearInterval(spotifyTimer);
  if (twitchTimer !== null) clearInterval(twitchTimer);
  retry = spotifyTimer = twitchTimer = null;
  attempt = 0;
  dead = false;
  state = IDLE;
}

/**
 * A backgrounded tab does not need a socket held open. Dropping it also means
 * coming back to a fresh INIT_STATE rather than a presence that went stale
 * while the browser throttled timers.
 */
function onVisibility() {
  if (document.hidden) {
    closeSocket();
    if (retry !== null) clearTimeout(retry);
    retry = null;
  } else if (!socket && !dead) {
    attempt = 0;
    connect();
  }
}

function closeSocket() {
  if (heartbeat !== null) clearInterval(heartbeat);
  heartbeat = null;
  if (socket) {
    // Drop the handler first: close() fires onclose, which would otherwise
    // schedule a reconnect for a socket we are deliberately tearing down.
    socket.onclose = null;
    socket.close();
  }
  socket = null;
}

/* ── Lanyard socket ─────────────────────────────────────────────────────── */

function connect() {
  if (dead || typeof WebSocket === 'undefined') return;
  commit({ ...state, conn: state.presence ? state.conn : 'connecting' });

  let ws: WebSocket;
  try {
    ws = new WebSocket(SOCKET);
  } catch {
    fallToRest();
    return;
  }
  socket = ws;

  ws.onmessage = (e) => {
    let frame: { op: number; t?: string; d?: any };
    try {
      frame = JSON.parse(e.data);
    } catch {
      return; // a malformed frame is not worth tearing the socket down for
    }

    if (frame.op === 1) {
      const interval = frame.d?.heartbeat_interval ?? 30_000;
      if (heartbeat !== null) clearInterval(heartbeat);
      heartbeat = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
      }, interval);
      ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_USER_ID } }));
      return;
    }

    if (frame.op === 0 && (frame.t === 'INIT_STATE' || frame.t === 'PRESENCE_UPDATE')) {
      // subscribe_to_id answers with the presence; subscribe_to_ids answers
      // with a map keyed by id. Accept either rather than silently render null.
      const d = frame.d?.discord_user ? frame.d : frame.d?.[DISCORD_USER_ID];
      if (!d) return;
      attempt = 0;
      apply(d, 'live');
    }
  };

  ws.onclose = (e) => {
    if (heartbeat !== null) clearInterval(heartbeat);
    heartbeat = null;
    socket = null;
    // 4004 is Lanyard's "not monitored". Reconnecting would loop forever.
    if (e.code === 4004) return markDead();
    scheduleRetry();
  };

  ws.onerror = () => ws.close();
}

function scheduleRetry() {
  if (dead || document.hidden) return;
  if (attempt >= 3 && state.conn !== 'rest') fallToRest();

  const wait = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
  attempt += 1;
  // Jitter, so a Lanyard restart does not bring every open tab back at once.
  retry = window.setTimeout(connect, wait + Math.random() * 1000);
}

/**
 * The socket is unreachable. Fetch once over REST so the panel still shows
 * something true, and keep polling until the socket comes back.
 */
function fallToRest() {
  commit({ ...state, conn: 'rest' });
  void restOnce();
  if (spotifyTimer === null) {
    spotifyTimer = window.setInterval(() => {
      void restOnce();
      pollSpotify();
    }, POLL_MS);
  }
}

async function restOnce() {
  if (dead || !DISCORD_USER_ID) return;
  try {
    const res = await fetch(`${REST}/${DISCORD_USER_ID}`);
    if (res.status === 404) return markDead();
    if (!res.ok) return;
    const body = await res.json();
    if (body?.success && body.data) apply(body.data, 'rest');
  } catch {
    /* offline; the next tick tries again */
  }
}

function markDead() {
  dead = true;
  closeSocket();
  if (retry !== null) clearTimeout(retry);
  retry = null;
  commit({ ...state, conn: 'unavailable', presence: null });
  // Discord is out, but Spotify on its own may still be configured.
  if (spotifyTimer === null && typeof window !== 'undefined') {
    pollSpotify();
    spotifyTimer = window.setInterval(pollSpotify, POLL_MS);
  }
}

/* ── normalisation ──────────────────────────────────────────────────────── */

function apply(d: any, conn: Conn) {
  const presence: Presence = {
    status: (d?.discord_status as Status) ?? 'offline',
    onDesktop: !!d?.active_on_discord_desktop,
    onMobile: !!d?.active_on_discord_mobile,
    onWeb: !!d?.active_on_discord_web,
    name: d?.discord_user?.display_name ?? d?.discord_user?.global_name ?? d?.discord_user?.username ?? null,
    avatar: d?.discord_user?.avatar
      ? `https://cdn.discordapp.com/avatars/${d.discord_user.id}/${d.discord_user.avatar}.png?size=128`
      : null,
    spotify: toTrack(d),
    activity: toActivity(d?.activities),
  };
  commit({ ...state, conn, presence });
}

function toTrack(d: any): Track | null {
  if (!d?.listening_to_spotify || !d?.spotify) return null;
  const s = d.spotify;
  return {
    song: s.song ?? '',
    artist: s.artist ?? '',
    album: s.album ?? null,
    art: s.album_art_url ?? null,
    url: s.track_id ? `https://open.spotify.com/track/${s.track_id}` : null,
    trackId: s.track_id ?? null,
    start: s.timestamps?.start ?? null,
    end: s.timestamps?.end ?? null,
    source: 'discord',
  };
}

/**
 * Spotify shows up twice in a Lanyard payload — once as `spotify`, once as an
 * activity of type 2. Type 4 is the custom status, which has no name worth
 * printing. Both are dropped so the activity row means "running", not "playing
 * the song we already rendered above".
 */
function toActivity(activities: any[] | undefined): Activity | null {
  const a = (activities ?? []).find((x) => x?.type !== 2 && x?.type !== 4 && x?.name);
  if (!a) return null;
  return {
    name: a.name,
    details: a.details ?? null,
    state: a.state ?? null,
    image: assetUrl(a.application_id, a.assets?.large_image),
    start: a.timestamps?.start ?? null,
  };
}

/** Discord serves activity art from three different places. */
function assetUrl(appId: string | undefined, image: string | undefined): string | null {
  if (!image) return null;
  if (image.startsWith('mp:')) return `https://media.discordapp.net/${image.slice(3)}`;
  if (image.startsWith('spotify:')) return `https://i.scdn.co/image/${image.slice(8)}`;
  if (!appId) return null;
  return `https://cdn.discordapp.com/app-assets/${appId}/${image}.png`;
}

/* ── polled fallbacks ───────────────────────────────────────────────────── */

async function pollSpotify() {
  try {
    const res = await fetch('/api/spotify');
    const d = await res.json();
    if (!d?.playing) return commit({ ...state, fallback: null });

    // The route sends absolute epochs precisely so they survive its own edge
    // cache — nothing to re-anchor here, and the bar never jumps backwards.
    commit({
      ...state,
      fallback: {
        song: d.track ?? '',
        artist: d.artist ?? '',
        album: d.album ?? null,
        art: d.art ?? null,
        url: d.url ?? null,
        trackId: d.trackId ?? null,
        start: d.startedAt ?? null,
        end: d.endsAt ?? null,
        source: 'spotify',
      },
    });
  } catch {
    /* a third-party outage must never break the page */
  }
}

async function pollTwitch() {
  if (!TWITCH_USER) return;
  try {
    const res = await fetch('/api/twitch');
    const d = await res.json();
    commit({
      ...state,
      twitch: d?.live ? { title: d.title ?? '', game: d.game ?? null, url: d.url } : null,
    });
  } catch {
    /* same */
  }
}

/**
 * Calls back once the store holds real data, or gives up after `ms` and hands
 * over whatever it has. It waits through `subscribe`, so it holds a refcount
 * and the socket it is waiting on cannot be torn down underneath it.
 */
export function awaitPresence(fn: (s: State) => void, ms = 4000): () => void {
  let done = false;
  let off: (() => void) | null = null;

  const finish = (s: State) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    // Unsubscribing from inside the listener would mutate the set being
    // iterated; let the current dispatch unwind first.
    queueMicrotask(() => off?.());
    fn(s);
  };

  const timer = window.setTimeout(() => finish(state), ms);
  off = subscribe((s) => {
    if (s.conn !== 'idle' && s.conn !== 'connecting') finish(s);
  });

  return () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    off?.();
  };
}

/* ── derived ────────────────────────────────────────────────────────────── */

/** Discord first — it is pushed and carries the album art. */
export function currentTrack(s: State): Track | null {
  return s.presence?.spotify ?? s.fallback;
}

/** True once we know enough to render anything at all. */
export function hasSignal(s: State): boolean {
  return !!(s.twitch || currentTrack(s) || s.presence?.activity || s.presence);
}
