import type { Localized } from './profile';
import { GITHUB_USER } from './profile';

export type Project = {
  slug: string;
  /**
   * GitHub repo name, or null when the source lives nowhere public.
   * Used to merge live stars/language from /api/github, which only ever
   * returns public non-fork repos — so a private name simply never matches.
   */
  repo: string | null;
  /**
   * Whether a visitor can actually open the source.
   *
   * Linking a private repo gives a signed-out reader a 404, which reads as a
   * broken portfolio rather than as a deliberate boundary. Saying "private"
   * costs nothing and is true.
   */
  visibility: 'public' | 'private' | 'unpublished';
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
  /**
   * Mounts a live demo island on the case-study page. Only `vigil` exists so
   * far; the union keeps a typo from silently rendering nothing.
   */
  livePanel?: 'vigil';
  accent: 'cyan' | 'magenta' | 'purple' | 'blue';
};

const repoUrl = (r: string) => `https://github.com/${GITHUB_USER}/${r}`;

export const projects: Project[] = [
  {
    slug: 'vigil',
    repo: 'vigil',
    visibility: 'public',
    name: 'Vigil',
    tagline: {
      en: 'Streaming anomaly detection you can watch',
      pt: 'Detecção de anomalias em streaming, ao vivo',
    },
    description: {
      en: 'Card transactions, transcode jobs and air sensors flow into Kafka; a stateful Go processor keeps a time window per entity and flags impossible travel, card testing, stalled jobs and threshold breaches — end to end in about 25 milliseconds.',
      pt: 'Transações de cartão, jobs de transcodificação e sensores de ar entram no Kafka; um processador Go com estado mantém uma janela de tempo por entidade e sinaliza viagem impossível, teste de cartão, jobs travados e violações de limite — ponta a ponta em cerca de 25 milissegundos.',
    },
    body: {
      en: 'Kafka Streams is the obvious answer to this problem and it is *JVM-only*, so the parts it would have supplied are written here: partition-local state, sliding windows advanced by event time rather than wall clock, a grace period for records that arrive out of order, and a compacted changelog replayed on rebalance — flushed *before* offsets are committed, because a consumer that commits first acknowledges work whose state was never made durable.\n\nOne engine serves three unrelated domains. Five generic primitives — velocity, geo-velocity, z-score, stall, threshold — mean card testing in payments, a retry storm in video, and a sensor flapping in the mesh. Adding a fourth domain is configuration, not code.\n\nA Kafka Streams topology does sit beside it, in Java, doing the tumbling aggregation that is genuinely better as a library than by hand. An ADR in the repo sets out exactly which guarantees are and are not reproduced — no interactive queries, no exactly-once across topics — because a README claiming parity would be wrong, and wrong in a way anyone who knows the library would catch.\n\nThe numbers on the panel are measured, not asserted. So is the claim that ordinary traffic raises nothing: twenty-four independent ten-minute simulated runs, zero false positives. Four bugs were found by running it rather than reading it, and each left a regression test behind — the best of them a timestamp computed as *now.Add(d)*, which keeps the monotonic reading but serialises a wall-clock value that assumes the two advance at the same rate. Under NTP slew they do not, and alerts arrived detected before the events that caused them.',
      pt: 'Kafka Streams é a resposta óbvia para esse problema e é *só para JVM*, então o que ele daria está escrito aqui: estado local por partição, janelas deslizantes avançadas por tempo de evento e não por relógio de parede, um período de tolerância para registros fora de ordem, e um changelog compactado reproduzido no rebalanceamento — gravado *antes* do commit dos offsets, porque um consumidor que faz o commit primeiro confirma um trabalho cujo estado nunca foi persistido.\n\nUm único motor atende três domínios sem relação. Cinco primitivas genéricas — velocidade, geo-velocidade, z-score, silêncio e limiar — significam teste de cartão em pagamentos, tempestade de retentativas em vídeo e um sensor oscilando na malha. Adicionar um quarto domínio é configuração, não código.\n\nUma topologia Kafka Streams roda ao lado, em Java, fazendo a agregação em janelas fixas que realmente fica melhor com a biblioteca do que na mão. Um ADR no repositório diz exatamente quais garantias são e não são reproduzidas — sem interactive queries, sem exactly-once entre tópicos — porque um README alegando paridade estaria errado, e errado de um jeito que qualquer um que conheça a biblioteca perceberia.\n\nOs números no painel são medidos, não afirmados. A afirmação de que tráfego normal não gera alerta também: vinte e quatro execuções simuladas independentes de dez minutos, zero falsos positivos. Quatro bugs apareceram rodando o sistema, não lendo o código, e cada um deixou um teste de regressão — o melhor deles um timestamp calculado como *now.Add(d)*, que preserva a leitura monotônica mas serializa um valor de relógio de parede que assume que os dois avançam no mesmo ritmo. Sob ajuste de NTP eles não avançam, e alertas chegavam detectados antes dos eventos que os causaram.',
    },
    why: {
      en: 'My CV puts Kafka at the top and had nothing to click. This is that claim as running code — and the panel below is a real recorded run, not a mockup.',
      pt: 'Meu CV coloca Kafka no topo e não tinha nada para clicar. Este é esse argumento como código rodando — e o painel abaixo é uma execução real gravada, não uma maquete.',
    },
    tech: ['Golang', 'Kafka', 'Kafka Streams', 'Redpanda', 'AWS Lambda', 'DynamoDB', 'Terraform', 'Java 21', 'Docker'],
    category: 'backend',
    featured: true,
    live: null,
    livePanel: 'vigil',
    diagram: `  generator ──▶ vigil.events ──▶ processor (Go) ──┬──▶ vigil.alerts ──▶ gateway ──▶ SSE
   3 streams                    window per key     │
   fault API                    5 rules            ├──▶ vigil.state   compacted changelog,
                                                   │                  replayed on rebalance
                                                   └──▶ vigil.dlq     undecodable records
                                     │
        vigil.events ──▶ Kafka Streams (Java) ──▶ vigil.metrics   tumbling 10s windows
                                     │
                 vigil.alerts ──▶ AWS Lambda ──▶ DynamoDB   idempotent on alert id`,
    accent: 'magenta',
  },
  {
    slug: 'clearing',
    repo: 'clearing',
    visibility: 'public',
    name: 'Clearing',
    tagline: {
      en: 'A ledger whose invariants live in the database',
      pt: 'Um ledger cujas invariantes vivem no banco',
    },
    description: {
      en: 'Double-entry accounting in Elixir, with a process per account serving as the lock manager. Money is an integer count of minor units and nothing else, entries are append-only, and the rule that a transaction sums to zero is enforced by Postgres at COMMIT rather than by the code above it.',
      pt: 'Contabilidade de partidas dobradas em Elixir, com um processo por conta funcionando como gerenciador de locks. Dinheiro é uma contagem inteira de unidades menores e nada mais, os lançamentos são somente-inserção, e a regra de que uma transação soma zero é imposta pelo Postgres no COMMIT, não pelo código acima dele.',
    },
    body: {
      en: 'Three invariants are enforced *in Postgres*, so they hold for a migration, a psql session and any service written later. The entries of a transaction sum to zero per currency, checked once at COMMIT by a deferred constraint trigger — deferred because every intermediate state of a transfer is unbalanced, and an eager check would reject every correct posting. An entry\'s currency must match the account it lands on. A customer balance may not go negative, while the system\'s own accounts must be able to, which is what it means to owe someone money.\n\nConcurrency is a process per account, started on demand, holding its balance in memory. A posting sorts the account ids before acquiring, so every posting in the system takes its locks in the same global order and two of them can never each hold what the other wants — one line, and it is the whole deadlock-freedom argument. A holder that crashes is released by a monitor; a caller that gives up waiting takes its own grant back. An ADR argues why this is a process rather than *SELECT … FOR UPDATE*, including what it costs, because OTP removing the registry and the restart semantics does not remove having to decide the lock ordering.\n\nThe balances table is a cache of the entries, and a reconciliation query exists to prove it — asserted to return nothing after arbitrary concurrent load, which is what makes the cache safe to read from. Twenty concurrent requests against a ten-thousand balance, a thousand each: exactly ten post, exactly ten are refused, and the balance lands on zero. A property test asserts that no random sequence of transfers changes the ledger\'s total.\n\n*Phase 1 of 8.* The ledger is finished and stands on its own; the service registry, the edge, the risk scorer and the saga orchestrator are not built yet. The README says which is which rather than describing the finished shape as though it existed.',
      pt: 'Três invariantes são impostas *no Postgres*, então valem para uma migration, uma sessão psql e qualquer serviço escrito depois. Os lançamentos de uma transação somam zero por moeda, verificado uma vez no COMMIT por um constraint trigger adiado — adiado porque todo estado intermediário de uma transferência está desbalanceado, e uma checagem ansiosa rejeitaria todo lançamento correto. A moeda de um lançamento tem que bater com a da conta em que ele cai. O saldo de um cliente não pode ficar negativo, enquanto as contas do próprio sistema precisam poder, que é o que significa dever dinheiro a alguém.\n\nA concorrência é um processo por conta, iniciado sob demanda, guardando o saldo em memória. Um lançamento ordena os ids das contas antes de adquirir, então todo lançamento do sistema pega seus locks na mesma ordem global e dois deles nunca podem segurar cada um o que o outro quer — uma linha, e é o argumento inteiro de ausência de deadlock. Um detentor que morre é liberado por um monitor; quem desiste de esperar devolve o próprio direito. Um ADR defende por que isso é um processo e não *SELECT … FOR UPDATE*, incluindo o que custa, porque o OTP tirar o registro e a semântica de restart não tira ter que decidir a ordem dos locks.\n\nA tabela de saldos é um cache dos lançamentos, e existe uma query de reconciliação para provar isso — verificada como vazia depois de carga concorrente arbitrária, que é o que torna o cache seguro de ler. Vinte requisições concorrentes contra um saldo de dez mil, mil cada: exatamente dez passam, exatamente dez são recusadas, e o saldo para em zero. Um teste de propriedade garante que nenhuma sequência aleatória de transferências muda o total do ledger.\n\n*Fase 1 de 8.* O ledger está pronto e se sustenta sozinho; o registro de serviços, o edge, o avaliador de risco e o orquestrador de saga ainda não existem. O README diz qual é qual em vez de descrever a forma final como se ela já estivesse lá.',
    },
    why: {
      en: 'Elixir sits at the top of my CV backed by a one-sentence stub and two repositories nobody can open. This is that claim as code — and the interesting part is not the language, it is putting the rules that matter somewhere the application cannot get them wrong.',
      pt: 'Elixir está no topo do meu CV apoiado por um projeto de uma frase e dois repositórios que ninguém consegue abrir. Este é esse argumento como código — e a parte interessante não é a linguagem, é colocar as regras que importam onde a aplicação não consegue errar.',
    },
    tech: ['Elixir', 'Phoenix', 'OTP', 'Ecto', 'PostgreSQL', 'Golang', 'Docker', 'Terraform'],
    category: 'backend',
    featured: true,
    live: null,
    diagram: `  built ────────────────────────────────────────────────────────────────────
  POST /v1/transfers ──▶ ledger (Elixir) ──▶ ledger_db
                         a process per account, locks taken in sorted order
                         entries are append-only; balances are a cache of them

  enforced in the database, not in the application:
     sum(entries) = 0 per currency    deferred trigger, checked at COMMIT
     entry currency = account currency
     a customer balance may not go negative; house accounts must be able to

  planned ──────────────────────────────────────────────────────────────────
  edge (Go) · risk (Go) · orchestrator (Elixir, saga) · control (Elixir, registry)`,
    accent: 'purple',
  },
  {
    slug: 'gantry',
    repo: 'gantry',
    visibility: 'public',
    name: 'Gantry',
    tagline: {
      en: 'A cluster built to be broken on purpose',
      pt: 'Um cluster feito para ser quebrado de propósito',
    },
    description: {
      en: 'The platform the other two run on: namespaces with quotas and default-deny network policy, admission policies that ship with a test suite, and images pinned by digest. Its workloads are not toys built to be orchestrated — they are Vigil and Clearing.',
      pt: 'A plataforma onde os outros dois rodam: namespaces com quotas e network policy default-deny, políticas de admissão que vêm com suíte de testes, e imagens fixadas por digest. Suas cargas de trabalho não são brinquedos feitos para serem orquestrados — são o Vigil e o Clearing.',
    },
    body: {
      en: 'A Kubernetes portfolio project is usually a Deployment, a Service and a screenshot of *kubectl get pods*. That demonstrates nothing, because nothing was ever asked of it. This one is built to be broken under load with a client counting: delete a pod, drain a node, roll a deploy, kill a broker — how many requests did the platform lose, and which specific setting changed that number?\n\nThe admission policies ship with fixtures: one compliant pod and six copies of it with exactly one thing wrong each, so a failing test names a single policy. They run offline in CI on every push. Two subtleties came out of writing them. The namespace LimitRange deliberately sets bounds but *no defaults* — LimitRanger is a mutating admission plugin and runs before any validating webhook, so a defaultRequest would quietly fill in the resources the policy exists to demand. And JMESPath\'s *||* returns its right-hand side whenever the left is falsy, and false is falsy, so the first version of the privilege policy admitted a pod with a writable root filesystem. The test caught it.\n\nRunning Vigil for real needed three changes sent back to it, and none were visible from inside that repository. It had no readiness endpoint at all: its processor rebuilds a window store from a compacted changelog on every rebalance, and until that finishes it owns partitions with no history, so every stateful rule quietly reports nothing — from a pod Kubernetes believed was working. Nobody finds that by reading code.\n\n*Phase 2 of 9.* The cluster definition, the policies and the images are done. Argo CD, the observability stack and the chaos measurements are not. An ADR states plainly what k3d cannot show — no cloud load balancer, no multi-AZ, no IAM, no EBS — before anyone has to ask, and the EKS Terraform is written in full and has never been applied, because EKS has no free tier.',
      pt: 'Um projeto de Kubernetes em portfólio costuma ser um Deployment, um Service e um print do *kubectl get pods*. Isso não demonstra nada, porque nada foi exigido dele. Este foi feito para ser quebrado sob carga com um cliente contando: apague um pod, drene um nó, faça um rollout, mate um broker — quantas requisições a plataforma perdeu, e qual configuração específica mudou esse número?\n\nAs políticas de admissão vêm com fixtures: um pod em conformidade e seis cópias dele com exatamente uma coisa errada cada, então um teste que falha aponta uma única política. Rodam offline no CI a cada push. Duas sutilezas saíram de escrevê-las. O LimitRange do namespace define limites mas *nenhum default* de propósito — o LimitRanger é um plugin de admissão que muta e roda antes de qualquer webhook de validação, então um defaultRequest preencheria silenciosamente os recursos que a política existe para exigir. E o *||* do JMESPath devolve o lado direito sempre que o esquerdo é falsy, e false é falsy, então a primeira versão da política de privilégios aceitou um pod com raiz gravável. O teste pegou.\n\nRodar o Vigil de verdade exigiu três mudanças devolvidas a ele, e nenhuma era visível de dentro daquele repositório. Ele não tinha endpoint de readiness nenhum: o processador reconstrói uma janela de estado a partir de um changelog compactado a cada rebalanceamento, e até isso terminar ele detém partições sem histórico, então toda regra com estado silenciosamente não reporta nada — de um pod que o Kubernetes considerava saudável. Ninguém descobre isso lendo código.\n\n*Fase 2 de 9.* A definição do cluster, as políticas e as imagens estão prontas. Argo CD, a stack de observabilidade e as medições de caos não. Um ADR diz abertamente o que o k3d não consegue mostrar — sem load balancer de nuvem, sem multi-AZ, sem IAM, sem EBS — antes de alguém precisar perguntar, e o Terraform do EKS está escrito por inteiro e nunca foi aplicado, porque EKS não tem free tier.',
    },
    why: {
      en: 'Kubernetes is joint-highest on my CV, and a search for *kind: Deployment* across everything I had written returned zero files. This is the first project evidence that claim has ever had — and it is deliberately the kind that can fail a test.',
      pt: 'Kubernetes é uma das notas mais altas do meu CV, e uma busca por *kind: Deployment* em tudo que eu tinha escrito retornou zero arquivos. Esta é a primeira evidência em projeto que essa afirmação já teve — e é de propósito do tipo que pode reprovar em um teste.',
    },
    tech: ['Kubernetes', 'Helm', 'k3d', 'Kyverno', 'Argo CD', 'Prometheus', 'Terraform', 'Docker'],
    category: 'infra',
    featured: true,
    live: null,
    diagram: `  built ────────────────────────────────────────────────────────────────────
  k3d: 1 server + 3 agents        namespaces  quota · limit range · net policy
       three, because drain and               restricted pod security
       spread mean nothing on one             default-deny, both directions

  Kyverno   declare your resources · pin the image tag · declare your probes
            no writable root, no root user, no retained capabilities
            each with a fixture that MUST be rejected, asserted in CI

  ghcr.io/lauiskk/vigil-*   five images, pinned by digest, built by vigil CI

  planned ──────────────────────────────────────────────────────────────────
  vigil on the cluster · Argo CD · Prometheus · chaos runs · EKS in Terraform`,
    accent: 'blue',
  },
  {
    slug: 'ascension',
    repo: 'ascension',
    visibility: 'private',
    name: 'Ascension',
    tagline: {
      en: 'A tabletop character sheet that runs the rules',
      pt: 'Uma ficha de RPG que roda as regras de verdade',
    },
    description: {
      en: 'A digital sheet for the Assimilação RPG with the book\'s rules engine actually implemented — dice, the Assimilation Test, card draws and point spending by suit. Vue on the front, Phoenix and PostgreSQL behind it, and it keeps working with the network off.',
      pt: 'Ficha digital para o RPG Assimilação com o motor de regras do livro implementado de verdade — rolagem, Teste de Assimilação, sorteio de cartas e gasto de pontos por naipe. Vue na frente, Phoenix e PostgreSQL atrás, e continua funcionando sem rede.',
    },
    body: {
      en: 'It exists because the sheets that already existed reduced the Assimilation catalogue to one summary line per card — so the draw and the point spending, which are the heart of the game, were not in them at all.\n\nThe sheet is *offline-first*: everything lives in the browser and syncs upward when it can. Closing the tab, losing signal, or the free-tier backend going to sleep does not interrupt a session at the table. The rules engine is a pure module with no dependencies, and the book declares the symbol distribution of each die on page 35 — so those distributions became assertions. Mistype one face and the suite breaks.\n\nThe part worth telling is about a font. The book writes "replace any number of ◆ with ●" using icons, and in the PDF those icons are *characters in a private font*. Reading the page with the obvious API returns the letters and throws the font away, which is where "gains an A" and "spends a d" came from. Substituting letters for icons in the app cannot work either: in Portuguese `A` is also an article and `e` is also a conjunction. The difference was never in the letter, it was in the font — so the extractor marks them at the one stage that can still see it.\n\nThe book\'s prose is licensed content and is *never versioned or served*. The repository carries only the mechanical skeleton — suit, number, cost, level requirement, page number — which is enough for the app to work and not a substitute for owning the book. Anyone with the PDF generates their own datapack.',
      pt: 'Existe porque as fichas que já havia reduziam o catálogo de Assimilações a uma linha de resumo por carta — ou seja, o sorteio e o gasto de pontos, que são o coração do jogo, não estavam nelas.\n\nA ficha é *offline-first*: tudo vive no navegador e sobe para o servidor quando dá. Fechar a aba, ficar sem rede ou o backend hibernar não interrompem uma sessão de jogo. O motor de regras é um módulo puro, sem dependências, e o livro declara a distribuição de símbolos de cada dado na página 35 — então essas distribuições viraram asserções. Digite uma face errada e a suíte quebra.\n\nA parte que vale contar é sobre uma fonte. O livro escreve "substitua qualquer quantidade de ◆ por ●" com ícones, e no PDF esses ícones são *caracteres de uma fonte própria*. Ler a página pela API óbvia devolve as letras e joga a fonte fora, e era daí que vinham os "ganha um A adicional" e "gasta um d". Trocar letras por ícones no app também não funciona: em português `A` também é artigo e `e` também é conjunção. A diferença nunca esteve na letra, e sim na fonte — então quem marca é o extrator, na única etapa que ainda a enxerga.\n\nO texto do livro é conteúdo licenciado e *nunca é versionado nem servido*. O repositório carrega só o esqueleto mecânico — naipe, número, custo, requisito de nível, página — o suficiente para o app funcionar e não um substituto para ter o livro. Quem tem o PDF gera o próprio datapack.',
    },
    why: {
      en: 'The Elixir on my CV needed something larger than a side experiment behind it: a Phoenix API with invite-only accounts, syncing a client that is designed to work without it.',
      pt: 'O Elixir do meu CV precisava de algo maior que um experimento por trás: uma API Phoenix com contas só por convite, sincronizando um cliente feito para funcionar sem ela.',
    },
    tech: ['Elixir', 'Phoenix', 'Vue 3', 'TypeScript', 'PostgreSQL', 'Pinia', 'Ecto', 'Vercel', 'Neon'],
    category: 'fullstack',
    featured: true,
    live: 'https://ascension-eight-mu.vercel.app',
    diagram: `  Vue 3 SPA (Vercel) ──▶ localStorage      the sheet works with no backend
        │                     ▲
        │  /api/* rewrite     │ cache, so it opens before the network answers
        ▼                     │
  Phoenix 1.8 (Render) ──▶ PostgreSQL (Neon)
        │                    accounts by invite only, no self-signup
        └──▶ datapack         imported once, follows the account everywhere

  compartilhado/  the dice face table — one source of truth for TS and Elixir`,
    accent: 'purple',
  },
  {
    slug: 'ticket-to-ride',
    repo: 'ticket-to-ride',
    visibility: 'public',
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
    visibility: 'public',
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
    visibility: 'public',
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
    slug: 'pride-vision',
    repo: 'pride-vision-platform',
    visibility: 'private',
    name: 'PRIDE Vision',
    tagline: {
      en: 'Which vulnerability do I fix first?',
      pt: 'Qual vulnerabilidade eu conserto primeiro?',
    },
    description: {
      en: 'A security posture platform that reads Semgrep and Nuclei reports, works out which findings are the same problem seen from two sides, and ranks them by real risk. It runs no scanners of its own — it answers the question the scanners leave open.',
      pt: 'Uma plataforma de postura de segurança que lê relatórios do Semgrep e do Nuclei, descobre quais achados são o mesmo problema visto de dois ângulos, e ordena por risco real. Não roda scanner nenhum — responde a pergunta que os scanners deixam em aberto.',
    },
    body: {
      en: 'Semgrep reads source and points at suspicious lines: fast, cheap, and unable to tell you whether the line is actually reachable. Nuclei attacks the running application from outside and proves the flaw exists, but cannot tell you which line it is. At the end of the day a team has two hundred alerts, no ordering, and *the same problem under two different names* — `reflected-xss` in `src/views/busca.py` from one, "Cross Site Scripting" at a URL from the other.\n\nSo the work is correlation, not scanning. Findings are normalised, matched across the two vocabularies, deduplicated, and scored by evidence — a static finding that a dynamic probe confirmed outranks one that nothing ever reached. The category has a name in industry, *ASPM*, and the honest description of the product is that it organises application security rather than looking for holes.\n\nFastAPI and SQLAlchemy 2 behind a React front end, JWT sessions, and a deliberate default of SQLite with PostgreSQL available — because the free hosting it targets has no persistent disk. Around 270 tests.',
      pt: 'O Semgrep lê o código-fonte e aponta trechos suspeitos: rápido, barato, e incapaz de dizer se aquele trecho está realmente exposto. O Nuclei ataca a aplicação de fora e prova que a falha existe, mas não sabe em que linha do código está. No fim do dia a equipe tem duzentos alertas, nenhuma ordem, e *o mesmo problema com dois nomes diferentes* — `reflected-xss` em `src/views/busca.py` de um lado, "Cross Site Scripting" numa URL do outro.\n\nEntão o trabalho é correlação, não varredura. Os achados são normalizados, casados entre os dois vocabulários, deduplicados e pontuados por evidência — um achado estático que uma sonda dinâmica confirmou vale mais do que um que nada nunca alcançou. A categoria tem nome no mercado, *ASPM*, e a descrição honesta do produto é que ele organiza a segurança das aplicações em vez de procurar falhas.\n\nFastAPI e SQLAlchemy 2 atrás de um front em React, sessões JWT, e um padrão deliberado de SQLite com PostgreSQL disponível — porque a hospedagem gratuita que ele mira não tem disco persistente. Cerca de 270 testes.',
    },
    why: {
      en: 'I spent a year on firewalls, VPNs and hardening at 3DB.CLOUD. This is the same instinct pointed at application security, and it is the only project here where the hard part is deciding what *not* to alert on.',
      pt: 'Passei um ano em firewalls, VPNs e hardening na 3DB.CLOUD. Este é o mesmo instinto apontado para segurança de aplicações, e é o único projeto aqui em que a parte difícil é decidir sobre o que *não* alertar.',
    },
    tech: ['Python', 'FastAPI', 'Semgrep', 'Nuclei', 'SQLAlchemy', 'React', 'PostgreSQL', 'JWT'],
    category: 'fullstack',
    featured: false,
    live: null,
    diagram: `  Semgrep report ──┐                     static: a line of code
                   ├──▶ normalise ──▶ correlate ──▶ rank by evidence
  Nuclei report ───┘                     │            confirmed  > unreachable
     dynamic: a URL that answered        │
                                         ▼
                              one finding, two sources, one owner`,
    accent: 'blue',
  },
  {
    slug: 'career-os',
    repo: 'JobHunter',
    visibility: 'private',
    name: 'Career OS',
    tagline: {
      en: 'CV generation that has to cite its evidence',
      pt: 'Geração de currículo que precisa citar a evidência',
    },
    description: {
      en: 'A multi-pass pipeline that scores how well a real history fits a job posting, then writes a CV for it — grounded in what actually happened rather than in what would read well. FastAPI and SQLAlchemy behind Next.js, with the client types generated from the server schema.',
      pt: 'Um pipeline multi-passo que pontua o quanto uma trajetória real se encaixa numa vaga, e então escreve um currículo para ela — ancorado no que de fato aconteceu, não no que soaria bem. FastAPI e SQLAlchemy atrás de Next.js, com os tipos do cliente gerados a partir do schema do servidor.',
    },
    body: {
      en: 'The interesting constraint is *evidence-grounded*. A model asked to write a CV for a posting will happily invent the experience the posting asks for. So each claim has to trace back to something in the stored history, the rubric weights are documented along with how confident they are, and a fit score that cannot be justified is a score that does not get shown.\n\nIt is also a merge of two projects that should never have been apart. One analysed a LinkedIn profile and planned content; the other matched postings and generated CVs. Keeping them separate meant two databases, two LinkedIn parsers, two GitHub fetchers and two job matchers — and they had drifted far enough that *the jobs page read a PostgreSQL table while everything that writes job records wrote to SQLite*. It was permanently empty and could not have been anything else. The merge kept the repository holding the history worth keeping, not the one with the nicer name.\n\nOne architectural rule survives it: one frontend, one backend, and the API owns the schema. The TypeScript client is generated from the server\'s own OpenAPI document, so the two cannot disagree about a field without the build saying so. Around 310 tests on the API.',
      pt: 'A restrição interessante é ser *ancorado em evidência*. Um modelo a quem se pede um currículo para uma vaga inventa alegremente a experiência que a vaga pede. Então cada afirmação precisa remeter a algo no histórico armazenado, os pesos da rubrica são documentados junto com o quanto se confia neles, e uma nota de aderência que não dá para justificar é uma nota que não aparece.\n\nTambém é a fusão de dois projetos que nunca deveriam ter estado separados. Um analisava um perfil do LinkedIn e planejava conteúdo; o outro casava vagas e gerava currículos. Mantê-los separados significava dois bancos, dois parsers de LinkedIn, dois coletores do GitHub e dois matchers de vaga — e já tinham divergido a ponto de *a página de vagas ler uma tabela PostgreSQL enquanto tudo que escreve vaga escrevia em SQLite*. Ficava permanentemente vazia e não tinha como ser outra coisa. A fusão manteve o repositório com o histórico que valia, não o de nome mais bonito.\n\nUma regra de arquitetura sobreviveu: um frontend, um backend, e a API é dona do schema. O cliente TypeScript é gerado a partir do próprio documento OpenAPI do servidor, então os dois não conseguem discordar sobre um campo sem o build avisar. Cerca de 310 testes na API.',
    },
    why: {
      en: 'Every step is a place where a language model would rather be fluent than correct. Most of the work is refusing to let it.',
      pt: 'Cada etapa é um lugar onde um modelo de linguagem prefere ser fluente a ser correto. A maior parte do trabalho é não deixar.',
    },
    tech: ['Python', 'Next.js', 'FastAPI', 'React 19', 'SQLAlchemy', 'Alembic', 'OpenAPI', 'Tailwind v4'],
    category: 'fullstack',
    featured: false,
    live: null,
    diagram: `  history ──▶ parse ──▶ score against posting ──▶ draft ──▶ verify
                          │  documented rubric        │        every claim
                          │  weights + confidence     │        traced back
                          ▼                           ▼        to the history
                    a score you can argue with    a CV, plus what it leaned on

  apps/api  owns the schema ──▶ OpenAPI ──▶ generated TS client (apps/web)`,
    accent: 'cyan',
  },
  {
    slug: 'prism',
    repo: null,
    visibility: 'unpublished',
    name: 'Prism',
    tagline: {
      en: 'Reverse-engineering an ad, then rebuilding it',
      pt: 'Engenharia reversa de um anúncio, e depois a reconstrução',
    },
    description: {
      en: 'Takes an example video ad, breaks it into scenes and audio, works out the creative logic underneath, and generates new image and video variants stitched together with voiceover. Elixir and Phoenix throughout, with Broadway moving the pipeline and a ledger counting the credits.',
      pt: 'Recebe um vídeo de anúncio como exemplo, separa cenas e áudio, deduz a lógica criativa por baixo, e gera novas variantes de imagem e vídeo costuradas com locução. Elixir e Phoenix do começo ao fim, com Broadway movendo o pipeline e um ledger contando os créditos.',
    },
    body: {
      en: 'The pipeline is the project. Ingest, scene analysis, audio extraction, creative inference, generation, stitching — each stage can fail, cost money, and take minutes, which rules out doing any of it in a request. *Broadway* over a Redis stream carries the work, *Reactor* orchestrates the multi-step jobs so a failure half way through unwinds cleanly instead of leaving a half-built ad, and a double-entry *ledger* holds the credits so a generation that fails does not silently bill for itself.\n\nOTP is the reason for the language choice rather than a preference: a supervision tree is the right shape for hundreds of long-running jobs that are each allowed to die. Feature flags gate the expensive stages, and the interface is LiveView, so a job\'s progress arrives over the socket that is already open.\n\nThe CI is the strictest I write — five parallel jobs: tests against real PostgreSQL and Redis, a compile with warnings as errors, `credo --strict`, `sobelow` for security, and a formatting check. Around 1,600 tests across 147 files.',
      pt: 'O pipeline é o projeto. Ingestão, análise de cena, extração de áudio, inferência criativa, geração, costura — cada etapa pode falhar, custar dinheiro e levar minutos, o que descarta fazer qualquer uma delas dentro de uma requisição. *Broadway* sobre um stream do Redis carrega o trabalho, *Reactor* orquestra os jobs multi-etapa para que uma falha no meio desfaça tudo limpo em vez de deixar um anúncio pela metade, e um *ledger* de partidas dobradas guarda os créditos para que uma geração que falha não se cobre em silêncio.\n\nOTP é o motivo da escolha da linguagem, não uma preferência: uma árvore de supervisão é o formato certo para centenas de jobs longos que têm permissão para morrer. Feature flags controlam as etapas caras, e a interface é LiveView, então o progresso de um job chega pelo socket que já está aberto.\n\nO CI é o mais rígido que escrevo — cinco jobs em paralelo: testes contra PostgreSQL e Redis de verdade, compilação com warnings como erro, `credo --strict`, `sobelow` para segurança, e verificação de formatação. Cerca de 1.600 testes em 147 arquivos.',
    },
    why: {
      en: 'It is the argument for Elixir in one place: supervised concurrency, a streaming pipeline, and a money ledger, in a domain where every stage is slow and allowed to fail.',
      pt: 'É o argumento a favor de Elixir num lugar só: concorrência supervisionada, um pipeline de streaming e um ledger de dinheiro, num domínio em que toda etapa é lenta e tem permissão para falhar.',
    },
    tech: ['Elixir', 'Phoenix LiveView', 'Broadway', 'Reactor', 'PostgreSQL', 'Redis', 'FFmpeg', 'Fly.io'],
    category: 'backend',
    featured: false,
    live: null,
    diagram: `  example ad ──▶ scenes + audio ──▶ creative inference
                                          │
        Broadway over a Redis stream ─────┤  each stage: slow, paid, fallible
                                          ▼
              image variants ──▶ video variants ──▶ stitch + voiceover
                                          │
                       Reactor unwinds a half-finished job cleanly
                       ledger refuses to bill for one that failed`,
    accent: 'magenta',
  },
  {
    slug: 'gymhat',
    repo: null,
    visibility: 'unpublished',
    name: 'gymHat',
    tagline: {
      en: 'Built around one number: 0.6 ms',
      pt: 'Construído em torno de um número: 0,6 ms',
    },
    description: {
      en: 'A training and diet log for exactly one person, running on their own machine and opening on their phone. Go and PostgreSQL behind a React client that works with the gym wifi off, and an acceptance criterion that is a latency rather than a feature.',
      pt: 'Um diário de treino e dieta de uma pessoa só, rodando na própria máquina e abrindo no celular. Go e PostgreSQL atrás de um cliente React que funciona com o wi-fi da academia fora do ar, e um critério de aceite que é uma latência, não uma funcionalidade.',
    },
    body: {
      en: 'The premise is that this is *not a form*. You open it mid-set to remember a number — what you lifted last time — not to record data. So the previous session\'s number is the largest element on the screen, and acceptance criterion number one is the time it takes to log a set. Measured in the production binary: **0.6 ms** from tap to the set on disk, with a written rule that if it ever passes three seconds, that gets fixed before anything else.\n\nThat single constraint decided the architecture. The client writes to IndexedDB first and reconciles with the server afterwards, so gym wifi is irrelevant. The Go service is `chi` and `pgx` with no ORM, because the queries are few and known. State reaches the phone over a websocket rather than by polling.\n\nThe pure packages — domain, training rules, nutrition — sit behind a *blocking 100% coverage gate* in the task runner, alongside `gofmt`, `go vet` and `-race`. They are the parts where being wrong means telling someone the wrong weight to put on a bar.',
      pt: 'A premissa é que isto *não é um formulário*. Você abre no meio de uma série para lembrar de um número — quanto levantou da última vez — não para preencher um dado. Por isso o número da sessão anterior é o maior elemento da tela, e o critério de aceite número um é o tempo de registrar uma série. Medido no binário de produção: **0,6 ms** do toque até a série gravada no disco, com uma regra escrita de que se um dia passar de três segundos, isso se conserta antes de qualquer outra coisa.\n\nEssa única restrição decidiu a arquitetura. O cliente escreve no IndexedDB primeiro e reconcilia com o servidor depois, então o wi-fi da academia é irrelevante. O serviço Go é `chi` e `pgx` sem ORM, porque as queries são poucas e conhecidas. O estado chega ao celular por websocket, não por polling.\n\nOs pacotes puros — domínio, regras de treino, nutrição — ficam atrás de um *gate bloqueante de 100% de cobertura* no task runner, junto de `gofmt`, `go vet` e `-race`. São as partes em que estar errado significa dizer a alguém o peso errado para colocar na barra.',
    },
    why: {
      en: 'Every decision in it traces back to a measured number rather than a preference, which is the only kind of argument that survives someone disagreeing with you.',
      pt: 'Toda decisão nele remete a um número medido e não a uma preferência, que é o único tipo de argumento que sobrevive a alguém discordando de você.',
    },
    tech: ['Golang', 'React', 'PostgreSQL', 'pgx', 'chi', 'IndexedDB', 'WebSocket', 'Tailwind'],
    category: 'fullstack',
    featured: false,
    live: null,
    diagram: `  phone ──▶ IndexedDB ──▶ reconcile ──▶ Go (chi + pgx) ──▶ PostgreSQL
              │  writes land here first — gym wifi is not a dependency
              ▼
        0.6 ms  tap to disk, measured in the production binary
                if it ever exceeds 3 s, that is the next thing fixed

  task check ──▶ gofmt · vet · -race · 100% on domain, rules, nutrition`,
    accent: 'blue',
  },
  {
    slug: 'cronus',
    repo: 'cronus',
    visibility: 'public',
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
    visibility: 'public',
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
    visibility: 'public',
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
/** The repo URL, or null when there is nothing a visitor could open. */
export const projectRepoUrl = (p: Project) =>
  p.repo && p.visibility === 'public' ? repoUrl(p.repo) : null;
