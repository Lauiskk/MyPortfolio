import type { Localized } from './profile';

export type Job = {
  id: string;
  company: string;
  /** Short tag drawn on the horizontal rail. */
  node: string;
  role: Localized;
  start: string;
  end: Localized | null;
  period: string;
  summary: Localized;
  highlights: { en: string[]; pt: string[] };
  tech: string[];
  accent: 'cyan' | 'magenta' | 'purple' | 'blue';
};

/** Newest first. Dates come from the PT-BR CV (Aug 2026 revision). */
export const experience: Job[] = [
  {
    id: 'shopnomix',
    company: 'SHOPNOMIX',
    node: 'AI · VIDEO',
    role: { en: 'Software Engineer', pt: 'Engenheiro de Software' },
    start: '2025-07',
    end: { en: 'May 2026', pt: 'Mai 2026' },
    period: 'Jul 2025 — Mai 2026',
    summary: {
      en: 'Built AI-backed APIs for automated video processing, and shipped the interfaces in front of them.',
      pt: 'Construí APIs com IA para automação de processamento de vídeo, e entreguei as interfaces na frente delas.',
    },
    highlights: {
      en: [
        'Built APIs in Elixir and Golang integrating AI models over HTTP (OpenAI, Anthropic, Replicate) to automate video processing, driving FFmpeg for the media work.',
        'Worked the frontend in Svelte, shipping interfaces focused on the user experience rather than on the API shape.',
        'Owned features end to end — frontend through backend — in short delivery cycles.',
        'Worked on an international team, with ceremonies and day-to-day technical communication in English.',
      ],
      pt: [
        'Desenvolvi APIs em Elixir e Golang que integravam modelos de IA por API (OpenAI, Anthropic, Replicate) para automação de processamento de vídeo, usando FFmpeg para manipulação de mídia.',
        'Atuei no frontend com Svelte, entregando interfaces focadas na experiência do usuário e não no formato da API.',
        'Trabalhei de ponta a ponta nas features, conectando frontend e backend em ciclos curtos de entrega.',
        'Atuei em time internacional, com ritos e comunicação técnica do dia a dia em inglês.',
      ],
    },
    tech: ['Elixir', 'Golang', 'Svelte', 'FFmpeg', 'OpenAI', 'Anthropic', 'Replicate'],
    accent: 'cyan',
  },
  {
    id: 'zetti',
    company: 'ZETTI TECH',
    node: 'K8S · .NET',
    role: { en: 'Software Engineer', pt: 'Engenheiro de Software' },
    start: '2025-03',
    end: { en: 'Jul 2025', pt: 'Jul 2025' },
    period: 'Mar 2025 — Jul 2025',
    summary: {
      en: 'Focal point for architecture decisions across Go and C# microservices running on EKS.',
      pt: 'Ponto focal em decisões de arquitetura em microsserviços Go e C# rodando no EKS.',
    },
    highlights: {
      en: [
        'Worked on projects in Go and C# (.NET) under a microservices architecture, contributing to measurable system performance improvements.',
        'Acted as the focal point for architecture decisions in an environment with Kubernetes (EKS), SQL Server and containerized development with Docker.',
        'Owned the standardization of Gitflow and CI/CD processes on GitLab, applying agile practices for continuous delivery.',
      ],
      pt: [
        'Atuei em projetos com Go e C# (.NET) em arquitetura de microsserviços, contribuindo para melhoria na performance do sistema.',
        'Atuei como ponto focal em decisões de arquitetura, em ambiente com Kubernetes (EKS), SQL Server e desenvolvimento containerizado com Docker.',
        'Responsável pela padronização de processos de Gitflow e CI/CD no GitLab, aplicando práticas ágeis para entrega contínua.',
      ],
    },
    tech: ['Golang', 'C# / .NET', 'Kubernetes', 'EKS', 'SQL Server', 'Docker', 'GitLab CI/CD'],
    accent: 'magenta',
  },
  {
    id: 'fitbank',
    company: 'FITBANK',
    node: 'FINTECH',
    role: { en: 'Software Engineer', pt: 'Engenheiro de Software' },
    start: '2024-02',
    end: { en: 'Mar 2025', pt: 'Mar 2025' },
    period: 'Fev 2024 — Mar 2025',
    summary: {
      en: 'Receivables anticipation with J.P. Morgan — payment systems at high daily transaction volume.',
      pt: 'Antecipação de recebíveis com o J.P. Morgan — sistemas de pagamento com alto volume diário de transações.',
    },
    highlights: {
      en: [
        'Worked on the J.P. Morgan project for receivables anticipation, implementing payment systems in Golang and Java/Grails at high daily transaction volume.',
        'Implemented microservices in Go running on Kubernetes (EKS), with PostgreSQL on Amazon RDS and Kafka for asynchronous communication between services.',
        'Configured CI/CD pipelines on Azure DevOps, building Docker images and publishing to Azure Container Registry (ACR).',
        'Built DAGs and automated bots with Python, Selenium and Airflow.',
      ],
      pt: [
        'Atuei no projeto com o J.P. Morgan focado em antecipação de recebíveis, implementando sistemas de pagamento com Golang e Java/Grails com alto volume de transações diárias.',
        'Implementei microsserviços em Go rodando em Kubernetes (EKS), com PostgreSQL no Amazon RDS e Kafka para comunicação assíncrona entre serviços.',
        'Configurei pipelines de CI/CD no Azure DevOps, com build de imagens Docker e publicação no Azure Container Registry (ACR).',
        'Construí DAGs e bots automatizados com Python, Selenium e Airflow.',
      ],
    },
    tech: ['Golang', 'Java / Grails', 'Kafka', 'PostgreSQL', 'Amazon RDS', 'EKS', 'Azure DevOps', 'Airflow'],
    accent: 'purple',
  },
  {
    id: '3db',
    company: '3DB.CLOUD',
    node: 'SECURITY',
    role: { en: 'Security Analyst', pt: 'Analista de Segurança' },
    start: '2023-04',
    end: { en: 'Mar 2024', pt: 'Mar 2024' },
    period: 'Abr 2023 — Mar 2024',
    summary: {
      en: 'Firewalls, VPNs and Oracle Cloud infrastructure — the layer everything else runs on top of.',
      pt: 'Firewalls, VPNs e infraestrutura na Oracle Cloud — a camada em que todo o resto roda em cima.',
    },
    highlights: {
      en: [
        'Administered Fortinet and PFSense firewalls: rules, NAT, IPsec/SSL VPN site-to-site and client-to-site, VLAN segmentation and appliance hardening.',
        'Operated Oracle Cloud Infrastructure (OCI) environments: provisioning VCNs, subnets, security lists, Compute, Block Volumes, Object Storage, and IAM configuration (compartments, policies).',
      ],
      pt: [
        'Administrei firewalls Fortinet e PFSense: regras, NAT, VPN IPsec/SSL site-to-site e client-to-site, segmentação de VLANs e hardening dos appliances.',
        'Operei ambientes em Oracle Cloud Infrastructure (OCI): provisionamento de VCN, subnets, security lists, Compute, Block Volumes, Object Storage e configuração de IAM (compartments, policies).',
      ],
    },
    tech: ['Fortinet', 'PFSense', 'OCI', 'Linux', 'VPN / IPsec', 'IAM'],
    accent: 'blue',
  },
];
