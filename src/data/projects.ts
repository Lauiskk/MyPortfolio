import type { Localized } from './profile';
import { GITHUB_USER } from './profile';

export type Project = {
  slug: string;
  /** GitHub repo name — used to merge live stars/language from /api/github. */
  repo: string;
  name: string;
  tagline: Localized;
  description: Localized;
  /** Long-form body for the case-study page. Markdown-ish paragraphs. */
  body: Localized;
  /** What is genuinely hard about it — the reason it earns a slot. */
  why: Localized;
  tech: string[];
  category: 'backend' | 'fullstack' | 'infra';
  featured: boolean;
  live: string | null;
  /** Rendered as a small ASCII architecture panel on the case-study page. */
  diagram: string | null;
  accent: 'cyan' | 'magenta' | 'purple' | 'blue';
};

const repoUrl = (r: string) => `https://github.com/${GITHUB_USER}/${r}`;

export const projects: Project[] = [
  {
    slug: 'ticket-to-ride',
    repo: 'ticket-to-ride',
    name: 'Ticket to Ride',
    tagline: { en: 'Events and ticketing, live in production', pt: 'Eventos e ingressos, no ar em produção' },
    description: {
      en: 'An organizer builds an event from the Ticketmaster/TMDb catalogue, the customer picks a seat and pays, gets a ticket with a signed QR code, and the gate validates it at the door.',
      pt: 'O organizador monta um evento a partir do catálogo do Ticketmaster/TMDb, o cliente escolhe o lugar e paga, recebe um ingresso com QR assinado, e a portaria valida na entrada.',
    },
    body: {
      en: 'Four distinct roles — organizer, customer, gate, and a second customer for testing transfers — each with its own view of the same event. Payment runs through Stripe end to end, including the declined-card path. The ticket itself carries a cryptographically signed QR so the gate can validate offline without trusting the device presenting it.\n\nThe frontend is deployed on Vercel, the API on Railway, and the whole thing is walkable in five minutes with the seeded test accounts in the README.',
      pt: 'Quatro papéis distintos — organizador, cliente, portaria e um segundo cliente para testar transferências — cada um com sua própria visão do mesmo evento. O pagamento roda de ponta a ponta pelo Stripe, incluindo o caminho de cartão recusado. O ingresso carrega um QR assinado criptograficamente, então a portaria valida offline sem precisar confiar no aparelho que apresenta o código.\n\nO frontend está na Vercel, a API no Railway, e dá para percorrer tudo em cinco minutos com as contas de teste do README.',
    },
    why: {
      en: 'It is the only one you can click through right now, with real payments and a real trust boundary at the gate.',
      pt: 'É o único que dá para clicar agora, com pagamento de verdade e uma fronteira de confiança real na portaria.',
    },
    tech: ['TypeScript', 'Stripe', 'PostgreSQL', 'QR / JWT', 'Vercel', 'Railway'],
    category: 'fullstack',
    featured: true,
    live: 'https://ticket-to-ride-psi.vercel.app',
    diagram: `  ORGANIZER ──┐
              ├──▶ API (Railway) ──▶ PostgreSQL
  CUSTOMER ───┤          │
              │          ├──▶ Stripe (payment intent)
  GATE ───────┘          └──▶ signed QR ──▶ offline validation`,
    accent: 'cyan',
  },
  {
    slug: 'junto',
    repo: 'junto',
    name: 'Junto',
    tagline: { en: 'Share a window — with its sound', pt: 'Compartilhe uma janela — com o som dela' },
    description: {
      en: 'Stream your screen with audio, live, to friends. The host runs a desktop app; viewers just open a link. Media goes straight from one machine to the other over WebRTC — the server only introduces the two sides.',
      pt: 'Transmita sua tela com som, ao vivo, para amigos. Quem transmite abre um app desktop; quem assiste só abre um link. A mídia vai direto de um computador ao outro via WebRTC — o servidor só apresenta os dois lados.',
    },
    body: {
      en: 'The interesting constraint: a browser cannot capture a single window *with its audio*. Chrome will give you a window, or a tab with sound, but not an arbitrary application window plus the sound it is producing. Junto solves that by putting the capture side in Electron, where the OS audio APIs are reachable, and leaving the viewer side as plain browser — nothing to install for the people watching.\n\nCinema mode goes further: instead of re-encoding and streaming a local video file, it ships the original to each viewer and plays it locally, in sync. Everyone gets the quality of the file rather than the quality of the host uplink.',
      pt: 'A restrição interessante: o navegador não consegue capturar uma janela isolada *com o áudio dela*. O Chrome te dá uma janela, ou uma aba com som, mas não uma janela de aplicativo qualquer mais o som que ela produz. O Junto resolve colocando o lado da captura no Electron, onde as APIs de áudio do sistema estão acessíveis, e deixando o lado de quem assiste como navegador puro — nada para instalar para quem só quer ver.\n\nO modo cinema vai além: em vez de recodificar e transmitir um arquivo de vídeo local, ele manda o original para cada espectador e reproduz localmente, em sincronia. Todo mundo recebe a qualidade do arquivo, não a qualidade do seu upload.',
    },
    why: {
      en: 'It does the one thing no browser can do on its own, and it does it without any media touching a server.',
      pt: 'Faz a única coisa que navegador nenhum consegue sozinho, e faz sem nenhuma mídia passar por um servidor.',
    },
    tech: ['TypeScript', 'Electron', 'WebRTC', 'P2P', 'Node.js'],
    category: 'fullstack',
    featured: true,
    live: null,
    diagram: `  HOST (Electron)                        VIEWER (browser)
    │ capture window + system audio          │
    ├────── signalling ──▶ server ◀──────────┤
    └═══════════ WebRTC media (P2P) ═════════┘
                 no media touches the server`,
    accent: 'magenta',
  },
  {
    slug: 'movies-api',
    repo: 'AwesomeProject',
    name: 'Movies API',
    tagline: { en: 'Go microservices over gRPC, hexagonal', pt: 'Microsserviços Go sobre gRPC, hexagonal' },
    description: {
      en: 'A REST API for movie management split into an API gateway and a movies service talking over gRPC, with MongoDB behind it, ports-and-adapters layering, Swagger docs and unit tests both with and without mocks.',
      pt: 'Uma API REST de gerenciamento de filmes dividida em API gateway e serviço de filmes conversando por gRPC, com MongoDB atrás, camadas em ports-and-adapters, documentação Swagger e testes unitários com e sem mocks.',
    },
    body: {
      en: 'This is the reference implementation of the architecture I work in professionally, stripped down to something you can read in one sitting: a gateway that owns HTTP and knows nothing about storage, a service that owns the domain and knows nothing about HTTP, and Protocol Buffers as the contract between them.\n\nThe whole stack comes up with a single command.',
      pt: 'Esta é a implementação de referência da arquitetura em que trabalho profissionalmente, reduzida a algo que se lê de uma sentada: um gateway que é dono do HTTP e não sabe nada de armazenamento, um serviço que é dono do domínio e não sabe nada de HTTP, e Protocol Buffers como o contrato entre os dois.\n\nA stack inteira sobe com um comando só.',
    },
    why: {
      en: 'It shows the microservices claim on the CV as actual code, with the layer boundaries drawn where they belong.',
      pt: 'Mostra a afirmação de microsserviços do CV como código de verdade, com as fronteiras de camada desenhadas onde devem estar.',
    },
    tech: ['Golang', 'gRPC', 'MongoDB', 'Docker', 'Swagger', 'Protocol Buffers'],
    category: 'backend',
    featured: true,
    live: null,
    diagram: `  ┌──────────────┐   gRPC    ┌────────────────┐        ┌─────────┐
  │ API Gateway  │──────────▶│ Movies Service │───────▶│ MongoDB │
  │  :8080 HTTP  │           │  :50051        │        └─────────┘
  └──────────────┘           └────────────────┘
      owns HTTP                 owns the domain`,
    accent: 'purple',
  },
  {
    slug: 'cronus',
    repo: 'cronus',
    name: 'Cronus',
    tagline: { en: 'Elixir / Phoenix service', pt: 'Serviço em Elixir / Phoenix' },
    description: {
      en: 'A Phoenix application in Elixir — the BEAM side of the stack, where supervision trees and lightweight processes do the work that a thread pool does elsewhere.',
      pt: 'Uma aplicação Phoenix em Elixir — o lado BEAM da stack, onde árvores de supervisão e processos leves fazem o trabalho que uma thread pool faria em outro lugar.',
    },
    body: {
      en: 'Elixir is half of what I write professionally, and this is where I keep the patterns: supervision, GenServers, and the Phoenix request lifecycle.',
      pt: 'Elixir é metade do que escrevo profissionalmente, e é aqui que guardo os padrões: supervisão, GenServers e o ciclo de vida de requisição do Phoenix.',
    },
    why: {
      en: 'Backs the Elixir half of the CV with something readable.',
      pt: 'Sustenta a metade Elixir do CV com algo legível.',
    },
    tech: ['Elixir', 'Phoenix', 'OTP'],
    category: 'backend',
    featured: false,
    live: null,
    diagram: null,
    accent: 'blue',
  },
  {
    slug: 'lru-cache',
    repo: 'Cache-LRU-challenge',
    name: 'LRU Cache',
    tagline: { en: 'O(1) get and put, from scratch in Go', pt: 'get e put em O(1), do zero em Go' },
    description: {
      en: 'A least-recently-used cache built the way it is meant to be built: a hash map for lookup and a doubly linked list for recency, so both operations stay constant time.',
      pt: 'Um cache least-recently-used construído do jeito certo: um hash map para busca e uma lista duplamente encadeada para recência, mantendo as duas operações em tempo constante.',
    },
    body: {
      en: 'Small on purpose. The point is the data-structure choice, not the line count.',
      pt: 'Pequeno de propósito. O ponto é a escolha da estrutura de dados, não a quantidade de linhas.',
    },
    why: { en: 'Fundamentals, shown rather than claimed.', pt: 'Fundamentos, mostrados em vez de afirmados.' },
    tech: ['Golang'],
    category: 'backend',
    featured: false,
    live: null,
    diagram: null,
    accent: 'cyan',
  },
  {
    slug: 'blockchain',
    repo: 'BlockChain',
    name: 'Blockchain',
    tagline: { en: 'A chain, hashed and validated, in Go', pt: 'Uma cadeia, com hash e validação, em Go' },
    description: {
      en: 'Blocks, hashes, proof of work and chain validation implemented from first principles to understand what the abstraction is actually doing.',
      pt: 'Blocos, hashes, prova de trabalho e validação de cadeia implementados do zero para entender o que a abstração realmente faz.',
    },
    body: {
      en: 'Written to answer "what is actually in a block" without a library in the way.',
      pt: 'Escrito para responder "o que tem de fato dentro de um bloco" sem uma biblioteca no caminho.',
    },
    why: { en: 'Curiosity, followed all the way down.', pt: 'Curiosidade, seguida até o fim.' },
    tech: ['Golang', 'SHA-256'],
    category: 'backend',
    featured: false,
    live: null,
    diagram: null,
    accent: 'magenta',
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const projectRepoUrl = (p: Project) => repoUrl(p.repo);
