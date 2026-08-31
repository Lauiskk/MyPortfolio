import { useEffect, useState } from 'react';
import { useTranslations, type Lang } from '../../i18n/ui';

type Live = { live: true; title: string; game: string | null; url: string };
type Playing = { playing: true; track: string; artist: string; url: string };

/**
 * Shows a Twitch LIVE pill when streaming, otherwise the current Spotify track.
 * Both endpoints answer `{ live: false }` / `{ playing: false }` when their
 * credentials are absent, so the badge simply never renders on a bare deploy.
 */
export default function LiveBadge({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const [twitch, setTwitch] = useState<Live | null>(null);
  const [spotify, setSpotify] = useState<Playing | null>(null);

  useEffect(() => {
    let cancelled = false;

    const pull = async () => {
      const [tw, sp] = await Promise.allSettled([
        fetch('/api/twitch').then((r) => r.json()),
        fetch('/api/spotify').then((r) => r.json()),
      ]);
      if (cancelled) return;
      setTwitch(tw.status === 'fulfilled' && tw.value?.live ? tw.value : null);
      setSpotify(sp.status === 'fulfilled' && sp.value?.playing ? sp.value : null);
    };

    void pull();
    const id = setInterval(pull, 90_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (twitch) {
    return (
      <a
        href={twitch.url}
        target="_blank"
        rel="noopener noreferrer"
        title={twitch.game ? `${twitch.title} — ${twitch.game}` : twitch.title}
        aria-label={t('a11y.live')}
        className="hidden items-center gap-2 border border-[var(--color-pink)] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--color-pink)] transition-shadow hover:shadow-[0_0_18px_-4px_var(--color-pink)] sm:flex"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-pink)] animate-pulse-dot" />
        Live
      </a>
    );
  }

  if (spotify) {
    return (
      <a
        href={spotify.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('a11y.playing')}
        className="hidden max-w-[190px] items-center gap-2 border border-[var(--hair)] px-2.5 py-1 font-mono text-[0.62rem] text-[var(--ink-3)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] lg:flex"
      >
        <Bars />
        <span className="truncate">{spotify.track} — {spotify.artist}</span>
      </a>
    );
  }

  return null;
}

/** Three bars bouncing like a tiny equaliser. */
function Bars() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[2px] bg-current"
          style={{ animation: `eq 0.9s ease-in-out ${i * 0.15}s infinite alternate`, height: '40%' }}
        />
      ))}
      <style>{`@keyframes eq { from { height: 25% } to { height: 100% } }`}</style>
    </span>
  );
}
