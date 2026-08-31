import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../../i18n/ui';
import { useTranslations } from '../../i18n/ui';

const SESSION_KEY = 'boot-seen';

const LINES = [
  'POST ......................... OK',
  'MEMORY CHECK ................. OK',
  'MOUNTING /dev/portfolio ...... OK',
  'go1.24 · elixir 1.18 ......... OK',
  'kube-context: production ..... OK',
  'NEURAL LINK .................. OK',
];

/**
 * BIOS-style boot log, then a CRT wipe into the page. Skippable with a click
 * or Escape, and shown once per tab — a preloader you cannot dismiss is a toll
 * booth, not an intro.
 */
export default function Preloader({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const [shown, setShown] = useState(false);
  const [visible, setVisible] = useState(0);
  const [closing, setClosing] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = true;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Private mode: fall through and skip the intro rather than replay it.
    }
    if (seen || reduced) return;

    setShown(true);
    document.documentElement.style.overflow = 'hidden';

    LINES.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setVisible(i + 1), 160 + i * 150));
    });
    timers.current.push(window.setTimeout(() => setClosing(true), 160 + LINES.length * 150 + 320));

    return () => {
      timers.current.forEach(clearTimeout);
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!shown) return;
    const skip = () => setClosing(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skip();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shown]);

  useEffect(() => {
    if (!closing) return;
    const id = window.setTimeout(() => {
      setShown(false);
      document.documentElement.style.overflow = '';
    }, 600);
    return () => clearTimeout(id);
  }, [closing]);

  if (!shown) return null;

  return (
    <div
      onClick={() => setClosing(true)}
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center bg-[var(--color-bg)] transition-[opacity,clip-path] duration-500"
      style={
        closing
          ? { opacity: 0, clipPath: 'inset(50% 0 50% 0)' }
          : { opacity: 1, clipPath: 'inset(0 0 0 0)' }
      }
    >
      <pre className="font-mono text-[0.72rem] leading-[1.9] text-[var(--color-cyan)] sm:text-[0.8rem]">
        {LINES.slice(0, visible).map((line) => (
          <div key={line}>{line}</div>
        ))}
        <span className="animate-blink">█</span>
      </pre>
      <p className="mt-8 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-[var(--ink-3)]">
        {t('boot.skip')}
      </p>
    </div>
  );
}
