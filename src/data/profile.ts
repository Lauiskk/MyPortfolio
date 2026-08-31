/**
 * Single source of truth for identity, links and the hero pitch.
 * Every user-facing string is bilingual — see `src/i18n/ui.ts` for the `t()` helper.
 */
export type Localized = { en: string; pt: string };

export const GITHUB_USER = 'Lauiskk';
export const TWITCH_USER = 'lauiskkj';

export const profile = {
  name: 'Luis Felipe Ribeiro Vieira',
  shortName: 'Luis Felipe R. Vieira',
  initials: 'LF',
  email: 'vrluis157@gmail.com',
  phone: '+55 62 99823-9851',
  phoneRaw: '+5562998239851',
  location: { en: 'Goiânia, Brazil', pt: 'Goiânia, Brasil' } satisfies Localized,

  /** Rotating roles in the hero typing effect. */
  roles: {
    en: ['Software Engineer', 'Backend Engineer', 'Go & Elixir Developer', 'Microservices Architect', 'Cloud & Kubernetes'],
    pt: ['Engenheiro de Software', 'Desenvolvedor Backend', 'Dev Go & Elixir', 'Arquiteto de Microsserviços', 'Cloud & Kubernetes'],
  },

  /** Straight from the CV. Keep these two in sync when the CV changes. */
  summary: {
    en: 'Software Engineer focused on backend development with Golang and Elixir, with experience in microservices architecture and fintech payment systems. Solid track record on high-transaction-volume projects, API integration and containerized environments. Full-stack when it is needed, with Svelte on the frontend.',
    pt: 'Engenheiro de Software com foco em desenvolvimento backend usando Golang e Elixir, com experiência em arquitetura de microsserviços e sistemas de pagamento em fintech. Sólida vivência em projetos de alto volume transacional, integração de APIs e ambientes containerizados. Atuação full-stack quando necessário, com Svelte no frontend.',
  } satisfies Localized,

  heroPitch: {
    en: 'I build **backend systems that move money and video** — Go and Elixir microservices on Kubernetes, Kafka between them, and an API surface that does not fall over.',
    pt: 'Eu construo **sistemas backend que movem dinheiro e vídeo** — microsserviços em Go e Elixir no Kubernetes, Kafka entre eles, e uma API que não cai.',
  } satisfies Localized,

  /** Flip `available` to false and the hero pill becomes the current employer. */
  status: {
    available: true,
    label: { en: 'Available for hire', pt: 'Disponível para contratação' } satisfies Localized,
  },

  education: {
    degree: { en: 'BSc Software Engineering', pt: 'Bacharelado em Engenharia de Software' } satisfies Localized,
    school: 'Faculdade Anhanguera',
    period: '2022 — 2025',
    status: { en: 'Completed', pt: 'Concluído' } satisfies Localized,
  },

  languages: [
    { name: { en: 'Portuguese', pt: 'Português' } satisfies Localized, level: { en: 'Native', pt: 'Nativo' } satisfies Localized },
    { name: { en: 'English', pt: 'Inglês' } satisfies Localized, level: { en: 'Advanced (C1)', pt: 'Avançado (C1)' } satisfies Localized },
  ],

  cv: { en: '/cv/LuisFelipeRibeiroCVEN.pdf', pt: '/cv/LuisFelipeRibeiroCV-PT.pdf' } satisfies Localized,
} as const;

/** One array, used by both the hero and the contact section. */
export const socials = [
  { id: 'github', label: 'GitHub', url: `https://github.com/${GITHUB_USER}`, icon: 'github' },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/luisinfelipe', icon: 'linkedin' },
  { id: 'email', label: 'Email', url: `mailto:${profile.email}`, icon: 'mail' },
  { id: 'whatsapp', label: 'WhatsApp', url: `https://wa.me/${profile.phoneRaw.replace('+', '')}`, icon: 'whatsapp' },
  { id: 'twitch', label: 'Twitch', url: `https://www.twitch.tv/${TWITCH_USER}`, icon: 'twitch' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/vrluisin/', icon: 'instagram' },
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/channel/UCPLYp5PjSwY9a3XGPqwVYRQ', icon: 'youtube' },
  { id: 'twitter', label: 'X', url: 'https://twitter.com/luisfelipe30856', icon: 'twitter' },
] as const;

export type Social = (typeof socials)[number];
