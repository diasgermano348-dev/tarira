export interface CategoryTaxonomyItem {
  id: string;
  name: string;
  group: 'trades' | 'office' | 'domestic';
  icon: string;
  badge: string;
  description: string;
  specialties: string[];
}

export const CATEGORIES_TAXONOMY: CategoryTaxonomyItem[] = [
  // ──────────────── OFÍCIOS & SERVIÇOS ESTRUTURADOS (TARIRA CONNECT — 7 CATEGORIAS) ────────────────
  {
    id: 'servicos_domesticos',
    name: 'Serviços Domésticos',
    group: 'trades',
    icon: '🧹',
    badge: 'Connect · Lar & Apoio',
    description: 'Empregadas domésticas, babás, cozinheiros, passadeiras, cuidadores e gestão integrada do lar.',
    specialties: [
      'Empregada doméstica (diarista ou mensal)',
      'Cozinheiro(a) doméstico(a)',
      'Passadeira / engomadoria ao domicílio',
      'Lavandaria ao domicílio',
      'Motorista particular',
      'Segurança doméstica / guarda-costas residencial',
      'Cuidador(a) de idosos',
      'Babá / ama para crianças',
      'Ama especializada em recém-nascidos',
      'Explicador / apoio escolar (ATL)',
      'Cuidador(a) de pessoas com necessidades especiais',
      'Governanta doméstica'
    ]
  },
  {
    id: 'limpeza_especializada',
    name: 'Limpeza Especializada',
    group: 'trades',
    icon: '✨',
    badge: 'Connect · Higienização',
    description: 'Limpeza pós-obra, escritórios, estofos, fossas sépticas, vidros, desinfestação e caixas de água.',
    specialties: [
      'Limpeza pós-obra',
      'Limpeza de escritórios e espaços comerciais',
      'Limpeza de estofos, sofás e tapetes',
      'Limpeza de fossas sépticas e tanques',
      'Limpeza de vidros e fachadas',
      'Desinfestação (baratas, ratos, térmitas)',
      'Limpeza e desinfeção de caixas de água'
    ]
  },
  {
    id: 'manutencao_reparacoes',
    name: 'Manutenção & Reparações',
    group: 'trades',
    icon: '🔧',
    badge: 'Connect · Campo & Reparos',
    description: 'Eletricistas, canalizadores, climatização AC, eletrodomésticos, geradores, caixilharia e portões.',
    specialties: [
      'Eletricista residencial e industrial',
      'Canalizador / picheleiro',
      'Técnico de climatização (ar condicionado)',
      'Técnico de eletrodomésticos',
      'Técnico de geradores',
      'Montador de Caixilharia de Alumínio (portas e janelas)',
      'Serralheiro',
      'Técnico de portões automáticos e motorização'
    ]
  },
  {
    id: 'carpintaria_marcenaria',
    name: 'Carpintaria & Marcenaria',
    group: 'trades',
    icon: '🪚',
    badge: 'Connect · Oficina & Madeira',
    description: 'Móveis sob medida, acabamentos em madeira, restauro, pavimentos laminados e estruturas.',
    specialties: [
      'Carpinteiro de mobiliário sob medida',
      'Marceneiro de acabamentos (portas, roupeiros, cozinhas)',
      'Restauro de móveis antigos',
      'Instalação de pavimentos em madeira/laminado',
      'Construção de estruturas em madeira (telhados, pérgolas, decks)'
    ]
  },
  {
    id: 'construcao_obras',
    name: 'Construção & Obras',
    group: 'trades',
    icon: '🧱',
    badge: 'Connect · Obras Civis',
    description: 'Pedreiros, pintores, ladrilhadores, gesseiros, soldadores, empreiteiros e impermeabilização.',
    specialties: [
      'Pedreiro / construtor civil',
      'Pintor de interiores e exteriores',
      'Ladrilhador (colocação de azulejos e cerâmica)',
      'Gesseiro / estucador',
      'Soldador e estruturas metálicas',
      'Empreiteiro (pequenas e médias obras)',
      'Técnico de impermeabilização de telhados e lajes'
    ]
  },
  {
    id: 'jardinagem_exteriores',
    name: 'Jardinagem & Exteriores',
    group: 'trades',
    icon: '🌿',
    badge: 'Connect · Áreas Verdes',
    description: 'Jardineiros, poda de árvores, rega automática, limpeza de quintais, muros e manutenção de piscinas.',
    specialties: [
      'Jardineiro / paisagismo',
      'Poda e corte de árvores',
      'Instalação de rega automática',
      'Limpeza de quintais e terrenos',
      'Construção de muros e vedações',
      'Manutenção de piscinas (piscineiro)'
    ]
  },
  {
    id: 'elite_tech',
    name: 'Elite Tech',
    group: 'trades',
    icon: '⚡',
    badge: 'Connect · Instalação Tech',
    description: 'Instalação técnica de câmaras CCTV, antenas parabólicas DSTV/GOtv e redes Wi-Fi/dados.',
    specialties: [
      'Montador de Câmaras de Segurança (CCTV)',
      'Instalador de Antenas Parabólicas (DSTV, GOtv)',
      'Instalador de Internet (Wi-Fi / Dados)'
    ]
  },

  // ──────────────── PROFISSIONAIS DE ESCRITÓRIO & QUADROS CORPORATIVOS (TARIRA RECRUIT) ────────────────
  {
    id: 'ti_software',
    name: 'Tecnologia, Software & IT',
    group: 'office',
    icon: '💻',
    badge: 'Recruit · Corporativo',
    description: 'Desenvolvimento web/mobile, arquitetura de software, DevOps e engenharia.',
    specialties: [
      'Desenvolvimento Frontend (React, Vue, TypeScript, Tailwind)',
      'Desenvolvimento Backend & APIs (Node.js, Python, Java, Go)',
      'Engenharia de Software Fullstack',
      'Desenvolvimento Mobile (iOS, Android, React Native, Flutter)',
      'Arquitetura de Sistemas & Microsserviços',
      'Administração de Redes, Servidores & Suporte IT / Helpdesk',
      'QA, Automação de Testes & Qualidade de Software'
    ]
  },
  {
    id: 'ciberseguranca',
    name: 'Cibersegurança & Cloud',
    group: 'office',
    icon: '🛡️',
    badge: 'Recruit · Corporativo',
    description: 'Defesa cibernética, SOC, auditoria de segurança, pentesting e cloud computing.',
    specialties: [
      'Segurança Ofensiva, Ethical Hacking & Pentesting',
      'Monitorização SOC & Análise de Ameaças SIEM',
      'Arquitetura Cloud (AWS, Microsoft Azure, Google Cloud)',
      'DevSecOps, CI/CD Seguro & Automação de Infraestrutura',
      'Governança de Segurança, Normas ISO 27001 & Compliance',
      'Gestão de Identidades e Controlo de Acesso (IAM)'
    ]
  },
  {
    id: 'ia_dados',
    name: 'Inteligência Artificial, Dados & BI',
    group: 'office',
    icon: '🤖',
    badge: 'Recruit · Corporativo',
    description: 'Engenharia de dados, business intelligence, machine learning e agentes IA.',
    specialties: [
      'Engenharia de Dados & Pipelines ETL / Data Lake',
      'Análise de Negócio & Dashboards (Power BI, Tableau, SQL)',
      'Modelos de Linguagem (LLMs), Prompt Engineering & Agentes IA',
      'Machine Learning, Modelos Preditivos & Visão Computacional',
      'Governança de Dados, Big Data & Qualidade Analítica'
    ]
  },
  {
    id: 'financas_contabilidade',
    name: 'Finanças, Contabilidade & Auditoria',
    group: 'office',
    icon: '📊',
    badge: 'Recruit · Corporativo',
    description: 'Contabilidade geral moçambicana (PGC-NIRF), fiscalidade, tesouraria e auditoria.',
    specialties: [
      'Contabilidade Geral & Fiscalidade Moçambicana (IRPC, IRPS, IVA)',
      'Auditoria Financeira, Controlo Interno & Due Diligence',
      'Controlo de Gestão, Orçamentação & Reporting Executivo',
      'Gestão de Tesouraria, Contas a Receber/Pagar & Conciliação',
      'Modelação Financeira & Avaliação de Projetos de Investimento',
      'Planeamento Estratégico & Gestão de Risco Financeiro'
    ]
  },
  {
    id: 'recursos_humanos',
    name: 'Recursos Humanos & Recrutamento',
    group: 'office',
    icon: '👥',
    badge: 'Recruit · Corporativo',
    description: 'Aquisição de talentos, processamento salarial, relações laborais e desenvolvimento.',
    specialties: [
      'Recrutamento Executivo, Triagem ATS & Seleção de Talentos',
      'Processamento Salarial, Folha de Pagamento & INSS',
      'Legislação Laboral de Moçambique & Relações de Trabalho',
      'Gestão de Desempenho, KPIs & Avaliação por Competências',
      'Formação, Capacitação & Onboarding Corporativo',
      'Cultura Organizacional, Clima Laboral & Benefícios'
    ]
  },
  {
    id: 'gestao_projetos',
    name: 'Gestão, Projetos & Operações',
    group: 'office',
    icon: '📋',
    badge: 'Recruit · Corporativo',
    description: 'Gestão ágil de projetos, supply chain, compras e otimização operacional.',
    specialties: [
      'Gestão de Projetos (Metodologias Ágeis Scrum / Kanban / PMP)',
      'Coordenação de Operações & Gestão de Processos (BPM / Lean)',
      'Gestão de Compras, Negociação & Fornecedores (Procurement)',
      'Logística, Armazenagem & Gestão de Cadeia de Suprimentos',
      'Gestão de Qualidade & Certificação ISO 9001',
      'Direção Geral, Gestão Executiva & Liderança Estratégica'
    ]
  },
  {
    id: 'juridico_compliance',
    name: 'Jurídico, Legal & Compliance',
    group: 'office',
    icon: '⚖️',
    badge: 'Recruit · Corporativo',
    description: 'Direito societário, contratos, regulação moçambicana e prevenção de riscos.',
    specialties: [
      'Direito Societário, Comercial & Contratos Empresariais',
      'Compliance Regulatório, KYC & Prevenção de Branqueamento (AML)',
      'Direito do Trabalho, Contencioso & Negociação Sindical',
      'Assessoria Jurídica Imobiliária, Fundiária & DUAT',
      'Propriedade Intelectual, Marcas & Patentes',
      'Contratação Pública & Parcerias Público-Privadas (PPP)'
    ]
  },
  {
    id: 'atendimento_secretariado',
    name: 'Atendimento, Secretariado & Escritório',
    group: 'office',
    icon: '📞',
    badge: 'Recruit · Corporativo',
    description: 'Secretariado executivo, receção bilíngue, contact center e suporte executivo.',
    specialties: [
      'Secretariado Executivo de Direção & Assessoria de Administração',
      'Atendimento ao Cliente, Suporte Multicanal & Fidelização',
      'Supervisão de Contact Center & Operações de Teleatendimento',
      'Receção Corporativa, Gestão de Agendas & Protocolo',
      'Assistência Administrativa Geral & Gestão de Ficheiros',
      'Organização de Viagens, Eventos Corporativos & Logística'
    ]
  },
  {
    id: 'marketing_vendas',
    name: 'Marketing, Comercial & Vendas',
    group: 'office',
    icon: '📈',
    badge: 'Recruit · Corporativo',
    description: 'Vendas corporativas B2B, marketing digital, design gráfico e comunicação.',
    specialties: [
      'Gestão de Contas Comerciais B2B & Negociação Corporativa',
      'Marketing Digital, Gestão de Tráfego Pago & Redes Sociais',
      'Design Gráfico, Branding, Identidade Visual & UI/UX',
      'Produção de Conteúdo, Copywriting & Comunicação Institucional',
      'Relações Públicas, Assessoria de Imprensa & Eventos',
      'Pesquisa de Mercado & Expansão Comercial'
    ]
  }
];

export function getCategoriesByRole(role: 'prestador' | 'profissional' | 'lar' | 'empresa' | 'condominio' | 'all'): CategoryTaxonomyItem[] {
  if (role === 'prestador') {
    return CATEGORIES_TAXONOMY.filter(c => c.group === 'trades');
  }
  if (role === 'profissional') {
    return CATEGORIES_TAXONOMY.filter(c => c.group === 'office');
  }
  if (role === 'lar') {
    return CATEGORIES_TAXONOMY.filter(c => c.id === 'servicos_domesticos' || c.id === 'limpeza_especializada' || c.id === 'manutencao_reparacoes' || c.id === 'jardinagem_exteriores');
  }
  return CATEGORIES_TAXONOMY;
}

export function getSpecialtiesForCategory(categoryNameOrId: string): string[] {
  if (!categoryNameOrId) return [];
  const normalized = categoryNameOrId.toLowerCase().trim();
  
  const found = CATEGORIES_TAXONOMY.find(c => 
    c.name.toLowerCase() === normalized || 
    c.id.toLowerCase() === normalized ||
    c.name.toLowerCase().includes(normalized) ||
    normalized.includes(c.name.toLowerCase()) ||
    normalized.includes(c.id.toLowerCase())
  );
  
  return found ? found.specialties : [];
}

export function findCategoryItem(categoryNameOrId: string): CategoryTaxonomyItem | undefined {
  if (!categoryNameOrId) return undefined;
  const normalized = categoryNameOrId.toLowerCase().trim();
  return CATEGORIES_TAXONOMY.find(c => 
    c.name.toLowerCase() === normalized || 
    c.id.toLowerCase() === normalized ||
    c.name.toLowerCase().includes(normalized) ||
    normalized.includes(c.name.toLowerCase())
  );
}
