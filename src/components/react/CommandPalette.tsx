import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toggleTheme } from '../../lib/theme';
import { useTranslations, localizePath, type Lang } from '../../i18n/ui';
import { projects } from '../../data/projects';
import { profile } from '../../data/profile';

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  run: () => void;
};

/** ⌘K / Ctrl+K. Navigation, theme, language, CV, and every project. */
export default function CommandPalette({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => () => {
      close();
      // Deferred so the palette's own unmount does not fight the scroll.
      requestAnimationFrame(() => {
        import('../../lib/motion').then(({ scrollTo }) => {
          const el = document.getElementById(id);
          if (el) scrollTo(el);
          else location.href = `${localizePath('/', lang)}#${id}`;
        });
      });
    };

    const sections = ['about', 'experience', 'projects', 'skills', 'snake', 'terminal', 'contact'].map((id) => ({
      id: `go-${id}`,
      label: t(`nav.${id}` as never),
      group: t('palette.sections'),
      run: go(id),
    }));

    const actions: Item[] = [
      {
        id: 'theme',
        label: t('nav.theme'),
        group: t('palette.actions'),
        run: () => { toggleTheme(); close(); },
      },
      {
        id: 'lang',
        label: t('nav.lang'),
        group: t('palette.actions'),
        run: () => { location.href = lang === 'en' ? '/pt/' : '/'; },
      },
      {
        id: 'cv',
        label: t('hero.cta.cv'),
        hint: 'PDF',
        group: t('palette.actions'),
        run: () => { window.open(profile.cv[lang], '_blank', 'noopener'); close(); },
      },
      {
        id: 'snake-play',
        label: `${t('snake.play')} — ${t('snake.title')}`,
        group: t('palette.actions'),
        run: () => { close(); document.dispatchEvent(new CustomEvent('snake:play')); },
      },
    ];

    const projectItems: Item[] = projects.map((p) => ({
      id: `p-${p.slug}`,
      label: p.name,
      hint: p.tech.slice(0, 2).join(' · '),
      group: t('palette.projects'),
      run: () => { location.href = localizePath(`/projects/${p.slug}`, lang); },
    }));

    return [...sections, ...actions, ...projectItems];
  }, [lang, t, close]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.hint ?? ''} ${i.group}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        close();
      }
    };
    const onOpen = () => setOpen(true);

    document.addEventListener('keydown', onKey);
    document.querySelectorAll('[data-palette-open]').forEach((b) => b.addEventListener('click', onOpen));
    return () => {
      document.removeEventListener('keydown', onKey);
      document.querySelectorAll('[data-palette-open]').forEach((b) => b.removeEventListener('click', onOpen));
    };
  }, [open, close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % Math.max(1, results.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + results.length) % Math.max(1, results.length)); }
    else if (e.key === 'Enter') { e.preventDefault(); results[active]?.run(); }
  };

  let lastGroup = '';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      role="dialog"
      aria-modal="true"
      aria-label={t('palette.placeholder')}
    >
      <div className="panel clip-corner w-full max-w-xl border-[var(--accent)]/40 shadow-[0_0_60px_-20px_var(--accent)]">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('palette.placeholder')}
          className="w-full border-b border-[var(--hair)] bg-transparent px-5 py-4 font-mono text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]"
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
        />

        <ul ref={listRef} id="palette-list" role="listbox" className="max-h-[46vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-5 py-6 text-center font-mono text-xs text-[var(--ink-3)]">{t('palette.empty')}</li>
          )}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? ((lastGroup = item.group), item.group) : null;
            return (
              <li key={item.id}>
                {header && (
                  <div className="px-5 pb-1 pt-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--ink-3)]">
                    {header}
                  </div>
                )}
                <button
                  id={`palette-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-active={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={item.run}
                  className={`flex w-full items-center gap-3 px-5 py-2.5 text-left font-sans text-sm transition-colors ${
                    i === active ? 'bg-[var(--accent)]/12 text-[var(--accent)]' : 'text-[var(--ink-2)]'
                  }`}
                >
                  <span className="flex-1">{item.label}</span>
                  {item.hint && <span className="font-mono text-[0.65rem] text-[var(--ink-3)]">{item.hint}</span>}
                  {i === active && <span className="font-mono text-[0.65rem] text-[var(--ink-3)]">↵</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
