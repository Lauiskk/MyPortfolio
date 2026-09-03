import type { ReactNode } from 'react';
import { useTranslations, type Lang } from '../../i18n/ui';
import { currentTrack } from '../../lib/presence';
import { useLanyard } from './useLanyard';

/**
 * The nav's compact read of the same presence store the NOW section uses —
 * one socket, two islands. Priority is loudest first: streaming beats music,
 * music beats a running game. Nothing to report renders nothing at all.
 */
export default function LiveBadge({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const state = useLanyard();
  const track = currentTrack(state);
  const activity = state.presence?.activity ?? null;

  if (state.twitch) {
    return (
      <a
        href={state.twitch.url}
        target="_blank"
        rel="noopener noreferrer"
        title={state.twitch.game ? `${state.twitch.title} — ${state.twitch.game}` : state.twitch.title}
        aria-label={t('a11y.live')}
        className="flex items-center gap-2 lg:hidden xl:flex border border-[var(--color-pink)] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--color-pink)] transition-shadow hover:shadow-[0_0_18px_-4px_var(--color-pink)]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-pink)] animate-pulse-dot" />
        Live
      </a>
    );
  }

  if (track) {
    return (
      <Pill href={track.url ?? undefined} label={t('a11y.playing')}>
        <Bars />
        {/* The nav row is 68px with a four-button cluster on the right; at
            360px there is about 100px going spare, so the artist waits for a
            wider viewport rather than wrapping the header. */}
        <span className="truncate">
          {track.song}
          <span className="hidden sm:inline"> — {track.artist}</span>
        </span>
      </Pill>
    );
  }

  if (activity) {
    return (
      <Pill label={t('a11y.activity')}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
        <span className="truncate">{activity.name}</span>
      </Pill>
    );
  }

  return null;
}

function Pill({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: ReactNode;
}) {
  const className =
    'flex max-w-[104px] items-center gap-2 lg:hidden xl:flex border border-[var(--hair)] px-2.5 py-1 font-mono text-[0.62rem] text-[var(--ink-3)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:max-w-[190px] lg:max-w-[230px]';

  if (!href) {
    return (
      <span className={className} aria-label={label}>
        {children}
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
      {children}
    </a>
  );
}

/** Three bars bouncing like a tiny equaliser. Keyframe lives in global.css. */
function Bars() {
  return (
    <span className="flex h-3 shrink-0 items-end gap-[2px]" aria-hidden="true">
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
