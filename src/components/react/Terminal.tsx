import { useCallback, useEffect, useRef, useState } from 'react';
import { commands, commandNames, nowLines, type CommandResult } from '../../data/terminal';
import { profile } from '../../data/profile';
import { localizePath, type Lang } from '../../i18n/ui';
import { play } from '../../lib/sound';
import { toggleTheme } from '../../lib/theme';
import { awaitPresence } from '../../lib/presence';
import MatrixRain from './MatrixRain';

type Line = { id: number; text: string; kind: 'in' | 'out' | 'error' | 'warn' | 'ok' };

const PROMPT = 'luis@portfolio:~$';
let uid = 0;

/**
 * A controlled terminal. v1 recreated the <input> and swapped its id on every
 * Enter, which broke focus and screen readers; here the input never moves and
 * the transcript is plain state.
 */
export default function Terminal({ lang }: { lang: Lang }) {
  const greeting =
    lang === 'pt'
      ? ['Bem-vindo ao terminal do portfólio.', "Digite 'help' para ver os comandos."]
      : ['Welcome to the portfolio terminal.', "Type 'help' to see the commands."];

  const [lines, setLines] = useState<Line[]>(() =>
    greeting.map((text) => ({ id: uid++, text, kind: 'out' as const })),
  );
  const [value, setValue] = useState('');
  const [matrix, setMatrix] = useState(false);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /* Cancellers for anything still waiting on data when the island unmounts. */
  const pending = useRef<Set<() => void>>(new Set());

  useEffect(
    () => () => {
      pending.current.forEach((cancel) => cancel());
      pending.current.clear();
    },
    [],
  );

  const push = useCallback((text: string, kind: Line['kind'] = 'out') => {
    setLines((prev) => [...prev, { id: uid++, text, kind }]);
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  const applyEffect = useCallback(
    (result: CommandResult) => {
      switch (result.effect) {
        case 'clear':
          setLines([]);
          break;
        case 'matrix':
          setMatrix(true);
          break;
        case 'theme': {
          const next = toggleTheme();
          push(next === 'light' ? '// light' : '// dark', 'ok');
          break;
        }
        case 'snake':
          document.dispatchEvent(new CustomEvent('snake:play'));
          void import('../../lib/motion').then(({ scrollTo }) => {
            const el = document.getElementById('snake');
            if (el) scrollTo(el);
          });
          break;
        case 'cv':
          window.open(profile.cv[lang], '_blank', 'noopener');
          break;
        case 'now': {
          // Deliberately does not scroll to #now — you asked in the terminal,
          // you get the answer in the terminal.
          if (result.arg !== 'await') break;
          const cancel = awaitPresence((s) => {
            pending.current.delete(cancel);
            nowLines(s, lang).forEach((line) => push(line));
          });
          pending.current.add(cancel);
          break;
        }
        case 'lang':
          location.href = result.arg === 'pt' ? '/pt/' : '/';
          break;
        case 'exit':
          if (result.arg) location.href = localizePath(result.arg, lang);
          break;
      }
    },
    [lang, push],
  );

  const submit = useCallback(
    (raw: string) => {
      const input = raw.trim();
      push(`${PROMPT} ${input}`, 'in');
      if (!input) return;

      history.current.unshift(input);
      cursor.current = -1;

      const [name, ...args] = input.split(/\s+/);
      const command = commands.find((c) => c.name === name.toLowerCase());

      if (!command) {
        push(
          lang === 'pt'
            ? `${name}: comando não encontrado. Tente 'help'.`
            : `${name}: command not found. Try 'help'.`,
          'error',
        );
        play('error');
        return;
      }

      const result = command.run(lang, args);
      const kind: Line['kind'] = result.tone === 'error' ? 'error' : result.tone === 'warn' ? 'warn' : result.tone === 'ok' ? 'ok' : 'out';
      result.lines.forEach((line) => push(line, kind));
      play(result.tone === 'error' ? 'error' : 'confirm');
      applyEffect(result);
    },
    [applyEffect, lang, push],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(value);
      setValue('');
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!history.current.length) return;
      cursor.current = e.key === 'ArrowUp'
        ? Math.min(cursor.current + 1, history.current.length - 1)
        : Math.max(cursor.current - 1, -1);
      setValue(cursor.current === -1 ? '' : history.current[cursor.current]);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const partial = value.trim().toLowerCase();
      if (!partial) return;
      const matches = commandNames.filter((n) => n.startsWith(partial));
      if (matches.length === 1) {
        setValue(`${matches[0]} `);
        play('tick');
      } else if (matches.length > 1) {
        push(`${PROMPT} ${value}`, 'in');
        push(matches.join('   '));
      }
    }
  };

  return (
    <>
      <div
        className="panel clip-corner overflow-hidden border-[var(--accent)]/45 shadow-[0_0_44px_-16px_var(--accent)]"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center gap-2 border-b border-[var(--hair)] bg-[var(--surface-3)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          <span className="ml-2 font-mono text-[0.68rem] text-[var(--ink-3)]">{PROMPT}</span>
        </div>

        <div
          ref={bodyRef}
          className="h-[330px] overflow-y-auto bg-[color-mix(in_oklab,var(--color-bg)_92%,transparent)] p-4 font-mono text-[0.78rem] leading-[1.55]"
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
        >
          {lines.map((line) => (
            <div
              key={line.id}
              className={
                line.kind === 'in' ? 'text-[var(--color-cyan)]'
                : line.kind === 'error' ? 'text-[var(--color-pink)]'
                : line.kind === 'warn' ? 'text-[var(--color-yellow)]'
                : line.kind === 'ok' ? 'text-[var(--color-cyan)]'
                : 'text-[var(--ink-2)]'
              }
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {line.text || ' '}
            </div>
          ))}

          <div className="mt-1 flex items-center gap-2">
            <label htmlFor="terminal-input" className="shrink-0 text-[var(--color-cyan)]">{PROMPT}</label>
            <input
              id="terminal-input"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full flex-1 border-none bg-transparent font-mono text-[0.78rem] text-[var(--ink)] outline-none"
              autoComplete="off"
              spellCheck={false}
              aria-label={lang === 'pt' ? 'Entrada do terminal' : 'Terminal input'}
            />
          </div>
        </div>
      </div>

      {matrix && <MatrixRain onExit={() => setMatrix(false)} />}
    </>
  );
}
