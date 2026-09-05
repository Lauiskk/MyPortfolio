import type { Localized } from './profile';

/**
 * The three projects are one system, and it was not planned that way.
 *
 * `clearing` moves money, `vigil`'s flagship stream is payment fraud
 * detection, and `gantry` runs both. That is the architecture of a payments
 * company, arrived at by building three things that each answered a different
 * gap on a CV. This file is the relation the rest of the site had no way to
 * express: `Project` has `category`, which is a filter taxonomy, and nothing
 * that points one project at another.
 */

export type Plane = {
  /** A slug in `projects.ts`, so a plane can link to its case study. */
  slug: string;
  /** Short label on the diagram. */
  role: Localized;
  /** What this plane is responsible for. */
  blurb: Localized;
  /**
   * What actually runs today. Kept separate from `blurb` so the section can
   * describe the design and the state of it in the same breath, rather than
   * letting the design imply the state.
   */
  state: Localized;
};

export type Edge = {
  from: string;
  to: string;
  label: Localized;
  /** False while the connection is designed but not yet built. */
  built: boolean;
};

export type System = {
  id: string;
  title: Localized;
  thesis: Localized;
  planes: Plane[];
  edges: Edge[];
  /**
   * Said out loud, because a system diagram is exactly the kind of drawing
   * that implies more than exists.
   */
  caveat: Localized;
};

export const system: System = {
  id: 'payments',
  title: {
    en: 'Three repositories, one system',
    pt: 'Três repositórios, um sistema',
  },
  thesis: {
    en: 'Each of these started as an answer to a different gap: Kafka, microservices, Kubernetes. Built, they turned out to be the three planes of one payments company — money moves, the movement is watched, and both run somewhere. So they are being wired together: the ledger publishes what it posts, the detector consumes it, and the platform runs both.',
    pt: 'Cada um começou como resposta a uma lacuna diferente: Kafka, microsserviços, Kubernetes. Prontos, mostraram ser os três planos de uma mesma empresa de pagamentos — o dinheiro se move, o movimento é observado, e os dois rodam em algum lugar. Então estão sendo ligados: o ledger publica o que lança, o detector consome, e a plataforma roda os dois.',
  },
  planes: [
    {
      slug: 'clearing',
      role: { en: 'Transactional', pt: 'Transacional' },
      blurb: {
        en: 'Money moves. A double-entry ledger whose invariants are enforced by Postgres, not by the code above it.',
        pt: 'O dinheiro se move. Um ledger de partidas dobradas cujas invariantes são impostas pelo Postgres, não pelo código acima dele.',
      },
      state: {
        en: 'The ledger runs. The edge, the registry, the risk scorer and the saga are designed and not yet built.',
        pt: 'O ledger roda. O edge, o registro, o avaliador de risco e a saga estão desenhados e ainda não construídos.',
      },
    },
    {
      slug: 'vigil',
      role: { en: 'Detection', pt: 'Detecção' },
      blurb: {
        en: 'The movement is watched. A stateful stream processor holding a time window per entity, flagging what does not fit.',
        pt: 'O movimento é observado. Um processador de stream com estado que mantém uma janela por entidade e sinaliza o que não se encaixa.',
      },
      state: {
        en: 'Complete, and measured — detection p50 at 12.8 ms, zero false positives across twenty-four ten-minute runs.',
        pt: 'Completo e medido — detecção p50 em 12,8 ms, zero falsos positivos em vinte e quatro execuções de dez minutos.',
      },
    },
    {
      slug: 'gantry',
      role: { en: 'Platform', pt: 'Plataforma' },
      blurb: {
        en: 'Both run somewhere. Namespaces, quotas, network policy and admission control that comes with its own test suite.',
        pt: 'Os dois rodam em algum lugar. Namespaces, quotas, network policy e controle de admissão que vem com a própria suíte de testes.',
      },
      state: {
        en: 'The cluster and its policies are done, and it already pins Vigil’s images by digest. Nothing runs on it yet.',
        pt: 'O cluster e suas políticas estão prontos, e ele já fixa as imagens do Vigil por digest. Nada roda nele ainda.',
      },
    },
  ],
  edges: [
    {
      from: 'clearing',
      to: 'vigil',
      label: { en: 'payment.posted.v1', pt: 'payment.posted.v1' },
      built: false,
    },
    {
      from: 'gantry',
      to: 'vigil',
      label: { en: 'runs', pt: 'roda' },
      built: true,
    },
    {
      from: 'gantry',
      to: 'clearing',
      label: { en: 'runs', pt: 'roda' },
      built: false,
    },
  ],
  caveat: {
    en: 'The dotted edges are designed, not running. Clearing publishes nothing yet and nothing is deployed on the cluster — the connection lands with Clearing’s outbox, and the deployment when the platform has a broker to point at. A diagram that showed all three edges solid would be describing a system that does not exist.',
    pt: 'As ligações pontilhadas estão desenhadas, não rodando. O Clearing ainda não publica nada e nada está implantado no cluster — a conexão chega junto com o outbox do Clearing, e o deploy quando a plataforma tiver um broker para apontar. Um diagrama com as três ligações sólidas estaria descrevendo um sistema que não existe.',
  },
};
