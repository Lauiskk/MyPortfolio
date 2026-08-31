import type { Localized } from './profile';

/**
 * Skills carry *where they were used* instead of an invented percentage —
 * "Kafka · FitBank" is a claim someone can check, "Kafka 90%" is not.
 */
export type Skill = {
  name: string;
  /** Company id from `experience.ts`, or a project slug. Powers the hover tooltip. */
  where: Localized;
  /** Visual weight in the constellation: 3 = core, 1 = supporting. */
  weight: 1 | 2 | 3;
};

export type SkillGroup = {
  id: string;
  label: Localized;
  accent: 'cyan' | 'magenta' | 'purple' | 'blue';
  skills: Skill[];
};

export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    label: { en: 'Languages', pt: 'Linguagens' },
    accent: 'cyan',
    skills: [
      { name: 'Golang', weight: 3, where: { en: 'Shopnomix, Zetti, FitBank — payment services and AI APIs', pt: 'Shopnomix, Zetti, FitBank — serviços de pagamento e APIs de IA' } },
      { name: 'Elixir', weight: 3, where: { en: 'Shopnomix — video-processing APIs; Cronus (Phoenix)', pt: 'Shopnomix — APIs de processamento de vídeo; Cronus (Phoenix)' } },
      { name: 'C# / .NET', weight: 2, where: { en: 'Zetti Tech — microservices', pt: 'Zetti Tech — microsserviços' } },
      { name: 'Java / Grails', weight: 2, where: { en: 'FitBank — the J.P. Morgan receivables system', pt: 'FitBank — sistema de recebíveis do J.P. Morgan' } },
      { name: 'Python', weight: 2, where: { en: 'FitBank — Airflow DAGs, Selenium bots', pt: 'FitBank — DAGs no Airflow, bots com Selenium' } },
      { name: 'TypeScript', weight: 2, where: { en: 'Junto, Ticket to Ride, this portfolio', pt: 'Junto, Ticket to Ride, este portfólio' } },
    ],
  },
  {
    id: 'architecture',
    label: { en: 'Architecture', pt: 'Arquitetura' },
    accent: 'magenta',
    skills: [
      { name: 'Microservices', weight: 3, where: { en: 'FitBank and Zetti — services on EKS', pt: 'FitBank e Zetti — serviços no EKS' } },
      { name: 'REST APIs', weight: 3, where: { en: 'Every backend role since 2024', pt: 'Todos os cargos de backend desde 2024' } },
      { name: 'Kafka', weight: 3, where: { en: 'FitBank — async communication between services', pt: 'FitBank — comunicação assíncrona entre serviços' } },
      { name: 'gRPC', weight: 2, where: { en: 'Movies API — gateway ↔ service over Protocol Buffers', pt: 'Movies API — gateway ↔ serviço via Protocol Buffers' } },
      { name: 'Hexagonal', weight: 2, where: { en: 'Movies API — ports and adapters, isolated layers', pt: 'Movies API — ports and adapters, camadas isoladas' } },
      { name: 'WebRTC', weight: 1, where: { en: 'Junto — peer-to-peer media, no server hop', pt: 'Junto — mídia peer-to-peer, sem passar pelo servidor' } },
    ],
  },
  {
    id: 'cloud',
    label: { en: 'Cloud & Infra', pt: 'Cloud & Infra' },
    accent: 'purple',
    skills: [
      { name: 'Kubernetes', weight: 3, where: { en: 'Zetti and FitBank — services on AWS EKS', pt: 'Zetti e FitBank — serviços no AWS EKS' } },
      { name: 'Docker', weight: 3, where: { en: 'Everywhere — containerized development and builds', pt: 'Em todo lugar — desenvolvimento e builds containerizados' } },
      { name: 'AWS', weight: 3, where: { en: 'EC2, S3, SQS, EKS, RDS', pt: 'EC2, S3, SQS, EKS, RDS' } },
      { name: 'GCP', weight: 1, where: { en: 'FitBank — Cloud Storage, BigQuery', pt: 'FitBank — Cloud Storage, BigQuery' } },
      { name: 'Azure', weight: 2, where: { en: 'FitBank — DevOps pipelines, Container Registry', pt: 'FitBank — pipelines DevOps, Container Registry' } },
      { name: 'OCI', weight: 2, where: { en: '3DB.CLOUD — VCN, IAM, Compute, Object Storage', pt: '3DB.CLOUD — VCN, IAM, Compute, Object Storage' } },
      { name: 'Linux', weight: 3, where: { en: '3DB.CLOUD onward — servers, hardening, day-to-day', pt: 'Desde a 3DB.CLOUD — servidores, hardening, dia a dia' } },
    ],
  },
  {
    id: 'data',
    label: { en: 'Data & Delivery', pt: 'Dados & Entrega' },
    accent: 'blue',
    skills: [
      { name: 'PostgreSQL', weight: 3, where: { en: 'FitBank — on Amazon RDS, transactional volume', pt: 'FitBank — no Amazon RDS, volume transacional' } },
      { name: 'SQL Server', weight: 2, where: { en: 'Zetti Tech', pt: 'Zetti Tech' } },
      { name: 'MongoDB', weight: 1, where: { en: 'Movies API', pt: 'Movies API' } },
      { name: 'GitLab CI/CD', weight: 3, where: { en: 'Zetti Tech — standardized the pipelines', pt: 'Zetti Tech — padronizei os pipelines' } },
      { name: 'Gitflow', weight: 2, where: { en: 'Zetti Tech — process ownership', pt: 'Zetti Tech — dono do processo' } },
      { name: 'Airflow', weight: 1, where: { en: 'FitBank — scheduled DAGs', pt: 'FitBank — DAGs agendadas' } },
      { name: 'Svelte', weight: 2, where: { en: 'Shopnomix — the product frontend', pt: 'Shopnomix — o frontend do produto' } },
    ],
  },
];

/** Flat list for the ⌘K palette and the terminal `skills` command. */
export const allSkills = skillGroups.flatMap((g) => g.skills);
