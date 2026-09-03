import { useEffect, useRef, type SyntheticEvent } from 'react';
import { loc, type Lang } from '../../i18n/ui';
import { currentTrack, type Activity, type State, type Track } from '../../lib/presence';
import { useLanyard } from './useLanyard';
import { usePrefersReducedMotion, useTicker } from './useTicker';

/**
 * What I am actually doing, right now.
 *
 * Discord presence over Lanyard's socket is the primary source — it carries
 * the album art and exact timestamps, so the progress bar is real rather than
 * estimated. When Discord is closed the panel falls back to the Spotify API,
 * and when there is nothing to report it says so. It never fills the space
 * with something invented.
 */

const copy = {
  discord: { en: 'discord', pt: 'discord' },
  connecting: { en: 'connecting', pt: 'conectando' },
  offline: { en: 'offline', pt: 'offline' },
  online: { en: 'online', pt: 'online' },
  idle: { en: 'away', pt: 'ausente' },
  dnd: { en: 'do not disturb', pt: 'não perturbe' },
  desktop: { en: 'desktop', pt: 'desktop' },
  mobile: { en: 'mobile', pt: 'celular' },
  web: { en: 'web', pt: 'web' },
  listening: { en: 'listening', pt: 'ouvindo' },
  running: { en: 'running', pt: 'rodando' },
  live: { en: 'live on twitch', pt: 'ao vivo na twitch' },
  nothing: {
    en: 'nothing playing right now — the panel fills itself in when it is',
    pt: 'nada tocando agora — o painel se preenche sozinho quando estiver',
  },
  viaSpotify: { en: 'via spotify', pt: 'via spotify' },
  justNow: { en: 'just started', pt: 'começou agora' },
} as const;

const statusColor: Record<string, string> = {
  online: 'var(--accent)',
  idle: 'var(--color-yellow)',
  dnd: 'var(--color-pink)',
  offline: 'var(--ink-3)',
};

export default function NowPanel({ lang }: { lang: Lang }) {
  const state = useLanyard();
  const track = currentTrack(state);
  const activity = state.presence?.activity ?? null;
  const reduced = usePrefersReducedMotion();
  const now = useTicker(!!track || !!activity);

  useOwnerWarning(state);

  const status = state.presence?.status ?? 'offline';
  const platforms = [
    state.presence?.onDesktop && copy.desktop,
    state.presence?.onMobile && copy.mobile,
    state.presence?.onWeb && copy.web,
  ].filter(Boolean) as Array<{ en: string; pt: string }>;

  return (
    <div className="panel spotlight clip-corner max-w-3xl overflow-hidden">
      {state.twitch && <TwitchRow lang={lang} twitch={state.twitch} />}

      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--hair)] px-5 py-3">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          style={{
            background: statusColor[status] ?? statusColor.offline,
            boxShadow: status === 'offline' ? 'none' : `0 0 10px ${statusColor[status]}`,
          }}
        />
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--ink-2)]">
          {state.conn === 'connecting' ? loc(copy.connecting, lang) : loc(copy[status], lang)}
        </span>
        {platforms.length > 0 && (
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--ink-3)]">
            · {platforms.map((p) => loc(p, lang)).join(' · ')}
          </span>
        )}
        <span className="ml-auto font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[var(--accent)]">
          {loc(copy.discord, lang)}
        </span>
      </header>

      {track ? (
        <TrackRow lang={lang} track={track} now={now} reduced={reduced} />
      ) : (
        !activity && (
          <p className="px-5 py-10 text-center font-mono text-[0.72rem] leading-relaxed text-[var(--ink-3)]">
            {loc(copy.nothing, lang)}
          </p>
        )
      )}

      {activity && <ActivityRow lang={lang} activity={activity} now={now} />}

      <SpokenState lang={lang} track={track} activity={activity} />
    </div>
  );
}

/* ── rows ───────────────────────────────────────────────────────────────── */

function TwitchRow({ lang, twitch }: { lang: Lang; twitch: NonNullable<State['twitch']> }) {
  return (
    <a
      href={twitch.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 border-b border-[var(--hair)] bg-[color-mix(in_oklab,var(--color-pink)_12%,transparent)] px-5 py-3 transition-colors hover:bg-[color-mix(in_oklab,var(--color-pink)_20%,transparent)]"
      data-cursor-label="twitch"
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-pink)] animate-pulse-dot" aria-hidden="true" />
      <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--color-pink)]">
        {loc(copy.live, lang)}
      </span>
      <span className="truncate font-mono text-[0.7rem] text-[var(--ink-2)]">
        {twitch.game ? `${twitch.title} — ${twitch.game}` : twitch.title}
      </span>
    </a>
  );
}

function TrackRow({
  lang,
  track,
  now,
  reduced,
}: {
  lang: Lang;
  track: Track;
  now: number;
  reduced: boolean;
}) {
  const timed = track.start !== null && track.end !== null && track.end > track.start;
  const elapsed = timed ? Math.min(now - track.start!, track.end! - track.start!) : 0;
  const total = timed ? track.end! - track.start! : 0;

  const art = track.art ? (
    <img
      src={track.art}
      alt=""
      width={112}
      height={112}
      loading="lazy"
      decoding="async"
      onError={hideBroken}
      className="h-[88px] w-[88px] shrink-0 object-cover sm:h-28 sm:w-28"
    />
  ) : (
    <div className="grid h-[88px] w-[88px] shrink-0 place-items-center bg-[var(--surface-3)] sm:h-28 sm:w-28">
      <Bars />
    </div>
  );

  return (
    <div className="flex items-stretch gap-4 p-4 sm:gap-5 sm:p-5">
      {track.url ? (
        <a
          href={track.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${loc(copy.listening, lang)}: ${track.song} — ${track.artist}`}
          className="shrink-0 transition-shadow hover:shadow-[0_0_24px_-6px_var(--accent)]"
          data-cursor-label="spotify"
        >
          {art}
        </a>
      ) : (
        art
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[var(--ink-3)]">
          <Bars />
          <span>{loc(copy.listening, lang)}</span>
          {track.source === 'spotify' && <span>· {loc(copy.viaSpotify, lang)}</span>}
        </div>

        <p className="truncate font-display text-base font-bold text-[var(--ink)] sm:text-lg">
          {track.song}
        </p>
        <p className="truncate font-mono text-[0.74rem] text-[var(--ink-2)]">{track.artist}</p>

        {timed && (
          <div className="mt-2 flex items-center gap-3">
            <ProgressBar start={track.start!} end={track.end!} reduced={reduced} now={now} />
            <span
              className="shrink-0 font-mono text-[0.62rem] tabular-nums text-[var(--ink-3)]"
              aria-hidden="true"
            >
              {clock(elapsed)} / {clock(total)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Position is known exactly, so the bar does not need a frame loop: anchor it
 * at the current offset and hand the remainder to a linear CSS transition,
 * which the compositor runs without waking the main thread.
 *
 * Under reduced motion that trick is dead on arrival — global.css forces every
 * transition to 0.001ms, which would snap the bar to full — so the width comes
 * from the same one-second tick that drives the clock.
 */
function ProgressBar({
  start,
  end,
  reduced,
  now,
}: {
  start: number;
  end: number;
  reduced: boolean;
  now: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const at = Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
    const remaining = Math.max(0, end - Date.now());

    el.style.transition = 'none';
    el.style.width = `${at}%`;
    const id = requestAnimationFrame(() => {
      el.style.transition = `width ${remaining}ms linear`;
      el.style.width = '100%';
    });
    return () => cancelAnimationFrame(id);
    // Re-anchors when the track changes, not on every tick — `now` here would
    // restart the transition once a second and defeat the whole point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, reduced]);

  return (
    <div className="h-[3px] flex-1 overflow-hidden bg-[var(--hair)]" aria-hidden="true">
      <div
        ref={ref}
        className="h-full bg-[var(--accent)]"
        style={reduced ? { width: `${pct}%` } : undefined}
      />
    </div>
  );
}

function ActivityRow({ lang, activity, now }: { lang: Lang; activity: Activity; now: number }) {
  const detail = [activity.details, activity.state].filter(Boolean).join(' · ');

  return (
    <div className="flex items-center gap-3 border-t border-[var(--hair)] px-5 py-3">
      {activity.image ? (
        <img
          src={activity.image}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          decoding="async"
          onError={hideBroken}
          className="h-9 w-9 shrink-0 object-cover"
        />
      ) : (
        <span className="grid h-9 w-9 shrink-0 place-items-center bg-[var(--surface-3)] font-mono text-[0.7rem] text-[var(--accent)]" aria-hidden="true">
          ▶
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[var(--ink-3)]">
          {loc(copy.running, lang)}
        </div>
        <p className="truncate font-mono text-[0.78rem] text-[var(--ink)]">{activity.name}</p>
        {detail && <p className="truncate font-mono text-[0.66rem] text-[var(--ink-2)]">{detail}</p>}
      </div>

      {activity.start && (
        <span
          className="shrink-0 font-mono text-[0.62rem] tabular-nums text-[var(--ink-3)]"
          aria-hidden="true"
        >
          {since(now - activity.start, lang)}
        </span>
      )}
    </div>
  );
}

/* ── bits ───────────────────────────────────────────────────────────────── */

/** The same three-bar equaliser the nav badge uses. */
function Bars() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-eq w-[2px] bg-current"
          style={{ animationDelay: `${i * 0.15}s`, height: '40%' }}
        />
      ))}
    </span>
  );
}

function hideBroken(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none';
}

/**
 * The one thing a screen reader should hear. Everything visible either ticks
 * once a second or is decorative, so it is all aria-hidden and this sentence
 * carries the meaning — re-announced only when the track or the game changes.
 */
function SpokenState({
  lang,
  track,
  activity,
}: {
  lang: Lang;
  track: Track | null;
  activity: Activity | null;
}) {
  const said = [
    track && `${loc(copy.listening, lang)}: ${track.song} — ${track.artist}`,
    activity && `${loc(copy.running, lang)}: ${activity.name}`,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <p className="sr-only" aria-live="polite">
      {said}
    </p>
  );
}

function clock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function since(ms: number, lang: Lang): string {
  const min = Math.floor(Math.max(0, ms) / 60_000);
  if (min < 1) return loc(copy.justNow, lang);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}min`;
}

/**
 * A configured id that Lanyard does not monitor looks identical to "Discord is
 * closed" from the outside. Visitors get the honest offline state; the owner
 * gets told what to fix, once, in the console.
 */
function useOwnerWarning(state: State) {
  const warned = useRef(false);
  useEffect(() => {
    if (state.conn !== 'unavailable' || warned.current) return;
    warned.current = true;
    console.warn(
      '[now] Lanyard is not monitoring this Discord account. Join https://discord.gg/lanyard with it (and stay in the server) for presence to appear.',
    );
  }, [state.conn]);
}
