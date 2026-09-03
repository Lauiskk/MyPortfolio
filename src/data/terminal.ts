import type { Lang } from '../i18n/ui';
import { profile, socials } from './profile';
import { experience } from './experience';
import { skillGroups } from './skills';
import { projects } from './projects';
import { loc } from '../i18n/ui';
import { currentTrack, getSnapshot, type State } from '../lib/presence';

export type Effect = 'clear' | 'matrix' | 'theme' | 'snake' | 'lang' | 'exit' | 'cv' | 'now';

export type CommandResult = {
  lines: string[];
  effect?: Effect;
  arg?: string;
  tone?: 'ok' | 'warn' | 'error';
};

export type Command = {
  name: string;
  /** Absent for easter eggs — they work but do not show up in `help`. */
  help?: { en: string; pt: string };
  run: (lang: Lang, args: string[]) => CommandResult;
};

const box = (title: string, rows: string[]) => [`┌─ ${title} ${'─'.repeat(Math.max(0, 44 - title.length))}`, ...rows.map((r) => `│ ${r}`), `└${'─'.repeat(48)}`];

/**
 * A still frame of the presence store, which is the right shape for a
 * transcript: a line that kept ticking after it was printed would be a lie
 * about when it was printed. Exported so Terminal.tsx can print the same
 * frame once the store warms up on a cold load.
 */
export function nowLines(s: State, lang: Lang): string[] {
  const track = currentTrack(s);
  const activity = s.presence?.activity ?? null;
  const rows: string[] = [];

  if (s.presence) {
    const where = [
      s.presence.onDesktop && 'desktop',
      s.presence.onMobile && (lang === 'pt' ? 'celular' : 'mobile'),
      s.presence.onWeb && 'web',
    ].filter(Boolean);
    rows.push(`discord     ${s.presence.status}${where.length ? ` · ${where.join(' · ')}` : ''}`);
  }

  if (s.twitch) {
    rows.push(`twitch      ${lang === 'pt' ? 'ao vivo' : 'live'}${s.twitch.game ? ` · ${s.twitch.game}` : ''}`);
  }

  if (track) {
    rows.push(`${lang === 'pt' ? 'ouvindo   ' : 'listening '}  ${track.song} — ${track.artist}`);
    if (track.start !== null && track.end !== null && track.end > track.start) {
      const span = track.end - track.start;
      const done = Math.min(Math.max(Date.now() - track.start, 0), span);
      rows.push(`            ${mmss(done)} / ${mmss(span)}  ${meter(done / span)}`);
    }
  }

  if (activity) {
    rows.push(`${lang === 'pt' ? 'rodando   ' : 'running   '}  ${activity.name}`);
    const detail = [activity.details, activity.state].filter(Boolean).join(' · ');
    if (detail) rows.push(`            ${detail}`);
  }

  if (rows.length === 0) {
    rows.push(lang === 'pt' ? 'nada acontecendo por aqui agora.' : 'nothing going on here right now.');
  }

  return box('NOW', rows);
}

const mmss = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const meter = (ratio: number) => {
  const filled = Math.round(Math.min(1, Math.max(0, ratio)) * 14);
  return `${'█'.repeat(filled)}${'░'.repeat(14 - filled)}`;
};

export const commands: Command[] = [
  {
    name: 'help',
    help: { en: 'List every command', pt: 'Lista todos os comandos' },
    run: (lang) => ({
      lines: [
        lang === 'pt' ? 'Comandos disponíveis:' : 'Available commands:',
        '',
        ...commands
          .filter((c) => c.help)
          .map((c) => `  ${c.name.padEnd(12)} ${c.help![lang]}`),
        '',
        lang === 'pt'
          ? '  Dica: Tab completa, ↑/↓ percorre o histórico. E tem coisa que não está nessa lista.'
          : '  Tip: Tab completes, ↑/↓ walks history. And some things are not on this list.',
      ],
    }),
  },
  {
    name: 'whoami',
    help: { en: 'Who is behind this', pt: 'Quem está por trás disso' },
    run: (lang) => ({
      lines: [
        profile.name,
        lang === 'pt' ? 'Engenheiro de Software · Goiânia, Brasil' : 'Software Engineer · Goiânia, Brazil',
        '',
        loc(profile.summary, lang),
      ],
    }),
  },
  {
    name: 'about',
    help: { en: 'The short version', pt: 'A versão curta' },
    run: (lang) => ({ lines: [loc(profile.heroPitch, lang).replace(/\*\*/g, ''), '', loc(profile.summary, lang)] }),
  },
  {
    name: 'skills',
    help: { en: 'What I work with', pt: 'Com o que eu trabalho' },
    run: (lang) => ({
      lines: skillGroups.flatMap((g) => [
        `${loc(g.label, lang).toUpperCase()}`,
        ...g.skills.map((s) => `  ${s.name.padEnd(16)} ${loc(s.where, lang)}`),
        '',
      ]),
    }),
  },
  {
    name: 'experience',
    help: { en: 'Where I have worked', pt: 'Onde eu trabalhei' },
    run: (lang) => ({
      lines: experience.flatMap((job) => [
        `${job.company} — ${loc(job.role, lang)}`,
        `  ${job.period}`,
        `  ${loc(job.summary, lang)}`,
        '',
      ]),
    }),
  },
  {
    name: 'education',
    help: { en: 'Degree and languages', pt: 'Formação e idiomas' },
    run: (lang) => ({
      lines: [
        `${loc(profile.education.degree, lang)} — ${profile.education.school}`,
        `${profile.education.period} · ${loc(profile.education.status, lang)}`,
        '',
        ...profile.languages.map((l) => `${loc(l.name, lang)}: ${loc(l.level, lang)}`),
      ],
    }),
  },
  {
    name: 'projects',
    help: { en: 'Things I have built', pt: 'Coisas que eu construí' },
    run: (lang) => ({
      lines: [
        ...projects.flatMap((p) => [
          `${p.name}${p.live ? '  [live]' : ''}`,
          `  ${loc(p.tagline, lang)}`,
          `  ${p.tech.join(', ')}`,
          '',
        ]),
        lang === 'pt' ? "Use 'open <nome>' para abrir um." : "Use 'open <name>' to open one.",
      ],
    }),
  },
  {
    name: 'open',
    help: { en: 'open <project> — open a project', pt: 'open <projeto> — abre um projeto' },
    run: (lang, args) => {
      const q = args.join(' ').toLowerCase();
      if (!q) return { lines: [lang === 'pt' ? 'Uso: open <projeto>' : 'Usage: open <project>'], tone: 'warn' };
      const hit = projects.find((p) => p.slug.includes(q) || p.name.toLowerCase().includes(q));
      if (!hit) return { lines: [`open: ${q}: ${lang === 'pt' ? 'não encontrado' : 'not found'}`], tone: 'error' };
      return { lines: [`${lang === 'pt' ? 'Abrindo' : 'Opening'} ${hit.name}…`], effect: 'exit', arg: `/projects/${hit.slug}` };
    },
  },
  {
    name: 'contact',
    help: { en: 'How to reach me', pt: 'Como falar comigo' },
    run: () => ({
      lines: box('CONTACT', [
        `email     ${profile.email}`,
        `phone     ${profile.phone}`,
        `linkedin  linkedin.com/in/luisinfelipe`,
        `github    github.com/Lauiskk`,
      ]),
    }),
  },
  {
    name: 'social',
    help: { en: 'Every link', pt: 'Todos os links' },
    run: () => ({ lines: socials.map((s) => `${s.label.padEnd(11)} ${s.url}`) }),
  },
  {
    name: 'resume',
    help: { en: 'Download the CV', pt: 'Baixar o CV' },
    run: (lang) => ({ lines: [lang === 'pt' ? 'Baixando CV…' : 'Downloading CV…'], effect: 'cv' }),
  },
  {
    name: 'neofetch',
    help: { en: 'System info, the fun way', pt: 'Info do sistema, do jeito divertido' },
    run: (lang) => ({
      lines: [
        '        ▄▄▄▄▄▄▄        luis@portfolio',
        '     ▄█████████▄      ─────────────────────────',
        '   ▄███▀     ▀███▄    OS       Linux (always)',
        '  ████   ▄▄▄   ████   Shell    go · elixir',
        '  ████  █████  ████   Uptime   ' + (new Date().getFullYear() - 2022) + ' years shipping',
        '  ████   ▀▀▀   ████   Editor   neovim',
        '   ▀███▄     ▄███▀    Cloud    aws · gcp · azure · oci',
        '     ▀█████████▀      Runtime  kubernetes',
        '        ▀▀▀▀▀▀▀       Broker   kafka',
        '                      Coffee   ' + (lang === 'pt' ? 'crítico' : 'critical'),
      ],
    }),
  },
  {
    name: 'snake',
    help: { en: 'Play snake on my contribution graph', pt: 'Jogar cobrinha no meu gráfico de contribuições' },
    run: (lang) => ({ lines: [lang === 'pt' ? 'Iniciando a cobrinha…' : 'Booting the snake…'], effect: 'snake' }),
  },
  {
    name: 'now',
    help: { en: 'What I am doing right now', pt: 'O que eu estou fazendo agora' },
    run: (lang) => {
      const s = getSnapshot();
      // The nav badge mounts client:idle on every page, so the store is
      // normally already warm. On a cold load the effect waits for one frame.
      if (s.conn === 'idle' || s.conn === 'connecting') {
        return {
          lines: [lang === 'pt' ? 'Lendo presença…' : 'Reading presence…'],
          effect: 'now',
          arg: 'await',
        };
      }
      return { lines: nowLines(s, lang), effect: 'now' };
    },
  },
  {
    name: 'matrix',
    help: { en: 'Follow the white rabbit', pt: 'Siga o coelho branco' },
    run: () => ({ lines: ['Wake up…'], effect: 'matrix' }),
  },
  {
    name: 'theme',
    help: { en: 'Toggle dark / light', pt: 'Alternar escuro / claro' },
    run: () => ({ lines: [], effect: 'theme' }),
  },
  {
    name: 'lang',
    help: { en: 'lang en | pt', pt: 'lang en | pt' },
    run: (lang, args) => {
      const want = args[0]?.toLowerCase();
      if (want !== 'en' && want !== 'pt') return { lines: ['Usage: lang en | pt'], tone: 'warn' };
      if (want === lang) return { lines: [`Already ${want}.`] };
      return { lines: [`→ ${want}`], effect: 'lang', arg: want };
    },
  },
  { name: 'ls', help: { en: 'List sections', pt: 'Lista as seções' },
    run: () => ({ lines: ['about/  experience/  projects/  skills/  snake/  now/  contact/  cv.pdf'] }) },
  { name: 'pwd', help: { en: 'Where am I', pt: 'Onde eu estou' }, run: () => ({ lines: ['/home/luis/portfolio'] }) },
  { name: 'date', help: { en: 'Current time', pt: 'Hora atual' }, run: () => ({ lines: [new Date().toString()] }) },
  { name: 'clear', help: { en: 'Clear the screen', pt: 'Limpa a tela' }, run: () => ({ lines: [], effect: 'clear' }) },

  /* ── Easter eggs: work, but never listed in `help`. ── */
  {
    name: 'sudo',
    run: (lang) => ({
      lines: [
        lang === 'pt' ? 'luis não está no arquivo sudoers. Este incidente será reportado.' : 'luis is not in the sudoers file. This incident will be reported.',
      ],
      tone: 'error',
    }),
  },
  {
    name: 'rm',
    run: (lang, args) => {
      if (args.join(' ').includes('-rf')) {
        return {
          lines: [
            lang === 'pt' ? 'Boa tentativa.' : 'Nice try.',
            lang === 'pt' ? 'Isto roda no seu navegador. O único prejudicado seria você.' : 'This runs in your browser. The only casualty would be you.',
          ],
          tone: 'warn',
        };
      }
      return { lines: [`rm: ${lang === 'pt' ? 'faltou o operando' : 'missing operand'}`], tone: 'error' };
    },
  },
  {
    name: 'hack',
    run: () => ({
      lines: [
        'ACCESSING MAINFRAME ████████████████ 100%',
        'BYPASSING FIREWALL  ████████████████ 100%',
        'DOWNLOADING DATA    ████████████████ 100%',
        '',
        "…it's a static site. There is nothing to hack. But you look great doing it.",
      ],
      tone: 'ok',
    }),
  },
  { name: 'coffee', run: (lang) => ({ lines: ['      ( (', '       ) )', '    ┌──────┐', '    │      │]', '    └──────┘', lang === 'pt' ? '  Café servido. ☕' : '  Coffee served. ☕'] }) },
  { name: 'hello', run: (lang) => ({ lines: [lang === 'pt' ? 'Olá! 👋 Digite `help` se estiver perdido.' : 'Hey there! 👋 Type `help` if you are lost.'] }) },
  { name: 'exit', run: (lang) => ({ lines: [lang === 'pt' ? 'Não dá pra sair. Você já está aqui.' : "You can't exit. You're already here."] }) },
];

export const commandNames = commands.map((c) => c.name);
export const publicCommandNames = commands.filter((c) => c.help).map((c) => c.name);
