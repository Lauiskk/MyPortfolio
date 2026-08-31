export const languages = { en: 'EN', pt: 'PT' } as const;
export const defaultLang = 'en' as const;
export type Lang = keyof typeof languages;

/** English is the source of truth for the key set; `pt` is typed against it. */
const en = {
  'nav.about': 'About',
  'nav.experience': 'Experience',
  'nav.projects': 'Projects',
  'nav.skills': 'Skills',
  'nav.snake': 'Snake',
  'nav.terminal': 'Terminal',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.theme': 'Toggle theme',
  'nav.sound': 'Toggle sound',
  'nav.lang': 'Switch to Portuguese',

  'boot.skip': 'Press ESC or click to skip',

  'hero.greeting': "Hello, I'm",
  'hero.cta.work': 'See the work',
  'hero.cta.cv': 'Download CV',
  'hero.scroll': 'Scroll',

  'about.title': 'About',
  'about.stats.years': 'Years shipping',
  'about.stats.repos': 'Public repos',
  'about.stats.langs': 'Languages in prod',
  'about.stats.companies': 'Companies',
  'about.education': 'Education',
  'about.languages': 'Languages',
  'about.based': 'Based in',

  'exp.title': 'Experience',
  'exp.hint': 'Scroll to move along the line',
  'exp.present': 'Present',

  'projects.title': 'Projects',
  'projects.all': 'All',
  'projects.backend': 'Backend',
  'projects.fullstack': 'Full Stack',
  'projects.infra': 'Infra',
  'projects.live': 'Live',
  'projects.code': 'Code',
  'projects.case': 'Read the case study',
  'projects.more': 'All repositories',
  'projects.why': 'Why it is here',
  'projects.stack': 'Stack',
  'projects.back': 'Back to projects',
  'projects.architecture': 'Architecture',

  'skills.title': 'Skills',
  'skills.hint': 'Hover a node to see where it was used',

  'snake.title': 'The Snake',
  'snake.lead':
    'This is my real GitHub contribution grid. The snake eats through it on its own — or you can take the controls.',
  'snake.play': 'Play',
  'snake.stop': 'Stop',
  'snake.restart': 'Restart',
  'snake.score': 'Score',
  'snake.best': 'Best',
  'snake.controls': 'Arrows / WASD to steer · swipe on touch · ESC to stop',
  'snake.over': 'Game over',
  'snake.offline': 'Live grid unavailable — this is a sample board. Still playable.',

  'terminal.title': 'Terminal',
  'terminal.lead': "Type <code>help</code>. There are things in here that are not in the menu.",

  'contact.title': 'Contact',
  'contact.lead': "Let's build something",
  'contact.body':
    'Open to full-time and contract work — backend engineering in Go or Elixir, distributed systems, and the infrastructure under them.',
  'contact.note': 'Email or LinkedIn is fastest. I usually reply within a day.',
  'contact.email': 'Email me',
  'contact.form.name': 'Name',
  'contact.form.email': 'Email',
  'contact.form.message': 'Message',
  'contact.form.send': 'Send',
  'contact.form.sending': 'Sending…',
  'contact.form.ok': 'Sent. Talk soon.',
  'contact.form.error': 'That did not go through. Try email instead.',

  'footer.built': 'Built with',
  'footer.source': 'Source',
  'footer.rights': 'All rights reserved.',

  'palette.placeholder': 'Jump to a section, run a command…',
  'palette.sections': 'Sections',
  'palette.actions': 'Actions',
  'palette.projects': 'Projects',
  'palette.empty': 'Nothing matches that.',
  'palette.open': 'Open',

  'a11y.live': 'Live on Twitch',
  'a11y.playing': 'Now playing on Spotify',
  '404.title': 'Signal lost',
  '404.body': 'That route does not exist. The grid does.',
  '404.home': 'Back to the surface',
} as const;

const pt: Record<keyof typeof en, string> = {
  'nav.about': 'Sobre',
  'nav.experience': 'Experiência',
  'nav.projects': 'Projetos',
  'nav.skills': 'Skills',
  'nav.snake': 'Cobrinha',
  'nav.terminal': 'Terminal',
  'nav.contact': 'Contato',
  'nav.menu': 'Menu',
  'nav.theme': 'Alternar tema',
  'nav.sound': 'Alternar som',
  'nav.lang': 'Mudar para inglês',

  'boot.skip': 'Aperte ESC ou clique para pular',

  'hero.greeting': 'Olá, eu sou',
  'hero.cta.work': 'Ver o trabalho',
  'hero.cta.cv': 'Baixar CV',
  'hero.scroll': 'Rolar',

  'about.title': 'Sobre',
  'about.stats.years': 'Anos entregando',
  'about.stats.repos': 'Repos públicos',
  'about.stats.langs': 'Linguagens em prod',
  'about.stats.companies': 'Empresas',
  'about.education': 'Formação',
  'about.languages': 'Idiomas',
  'about.based': 'Baseado em',

  'exp.title': 'Experiência',
  'exp.hint': 'Role para andar pela linha',
  'exp.present': 'Atual',

  'projects.title': 'Projetos',
  'projects.all': 'Todos',
  'projects.backend': 'Backend',
  'projects.fullstack': 'Full Stack',
  'projects.infra': 'Infra',
  'projects.live': 'No ar',
  'projects.code': 'Código',
  'projects.case': 'Ler o case study',
  'projects.more': 'Todos os repositórios',
  'projects.why': 'Por que está aqui',
  'projects.stack': 'Stack',
  'projects.back': 'Voltar aos projetos',
  'projects.architecture': 'Arquitetura',

  'skills.title': 'Skills',
  'skills.hint': 'Passe o mouse num nó para ver onde foi usado',

  'snake.title': 'A Cobrinha',
  'snake.lead':
    'Este é o meu gráfico de contribuições real do GitHub. A cobrinha come sozinha por ele — ou você assume o controle.',
  'snake.play': 'Jogar',
  'snake.stop': 'Parar',
  'snake.restart': 'Recomeçar',
  'snake.score': 'Pontos',
  'snake.best': 'Recorde',
  'snake.controls': 'Setas / WASD para virar · deslize no toque · ESC para parar',
  'snake.over': 'Fim de jogo',
  'snake.offline': 'Grid ao vivo indisponível — este é um tabuleiro de exemplo. Dá pra jogar do mesmo jeito.',

  'terminal.title': 'Terminal',
  'terminal.lead': 'Digite <code>help</code>. Tem coisa aqui que não está no menu.',

  'contact.title': 'Contato',
  'contact.lead': 'Vamos construir algo',
  'contact.body':
    'Aberto a vagas CLT e contrato — engenharia backend em Go ou Elixir, sistemas distribuídos, e a infraestrutura embaixo deles.',
  'contact.note': 'E-mail ou LinkedIn é o caminho mais rápido. Costumo responder em um dia.',
  'contact.email': 'Me mandar e-mail',
  'contact.form.name': 'Nome',
  'contact.form.email': 'E-mail',
  'contact.form.message': 'Mensagem',
  'contact.form.send': 'Enviar',
  'contact.form.sending': 'Enviando…',
  'contact.form.ok': 'Enviado. Falo com você em breve.',
  'contact.form.error': 'Isso não passou. Tente por e-mail.',

  'footer.built': 'Construído com',
  'footer.source': 'Código',
  'footer.rights': 'Todos os direitos reservados.',

  'palette.placeholder': 'Ir para uma seção, rodar um comando…',
  'palette.sections': 'Seções',
  'palette.actions': 'Ações',
  'palette.projects': 'Projetos',
  'palette.empty': 'Nada corresponde a isso.',
  'palette.open': 'Abrir',

  'a11y.live': 'Ao vivo na Twitch',
  'a11y.playing': 'Ouvindo agora no Spotify',
  '404.title': 'Sinal perdido',
  '404.body': 'Essa rota não existe. O grid existe.',
  '404.home': 'Voltar à superfície',
};

export const ui = { en, pt } as const;
export type UIKey = keyof typeof en;

/** `/pt/anything` → 'pt'; everything else → 'en'. */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  return seg in languages ? (seg as Lang) : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** Picks the right side of a `{ en, pt }` pair. */
export function loc<T>(value: { en: T; pt: T }, lang: Lang): T {
  return value[lang];
}

/** Prefixes a path with the locale. `/` stays `/` for English. */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === defaultLang ? clean : `/${lang}${clean === '/' ? '' : clean}`;
}

/** The other language and the equivalent URL, for the header toggle. */
export function alternateFor(url: URL, lang: Lang) {
  const other: Lang = lang === 'en' ? 'pt' : 'en';
  const bare = lang === 'en' ? url.pathname : url.pathname.replace(/^\/pt/, '') || '/';
  return { lang: other, href: localizePath(bare, other) };
}
