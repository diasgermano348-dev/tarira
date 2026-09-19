import React, { useState, useMemo } from "react";
import { useBodyScrollLock } from "./useBodyScrollLock";
import { 
  ArrowLeft,
  Search, 
  X, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  CheckCircle2, 
  UserCheck, 
  FileText, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  GraduationCap, 
  ArrowRight,
  Eye,
  Calendar,
  Check,
  Upload,
  PhoneCall,
  Building2,
  FileCheck,
  Users,
  ShieldCheck,
  Home,
  Building,
  Info,
  Layers
} from "lucide-react";
import { Candidate, PartnerCompanyItem, UserAccountRole } from "./types";
import { HireProcessModal } from "./HireProcessModal";
import { VerticalOrbitBadge, TypewriterPromise } from "./TariraVisualEffects";

export const RECRUIT_HERO_SLIDES = [
  {
    id: "slide-exec-1",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1600",
    tag: "Liderança Executiva & C-Level",
    highlight: "Gestão estratégica, direção de operações e RH sénior multinacional"
  },
  {
    id: "slide-exec-2",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1600",
    tag: "Engenharia de Software, IA & Cloud",
    highlight: "Arquitetos de sistemas, especialistas em cibersegurança SOC e DevOps"
  },
  {
    id: "slide-exec-3",
    url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1600",
    tag: "Finanças Corporativas, IFRS & Auditoria",
    highlight: "Controllers financeiros, auditores Big-4 e peritos em contabilidade bancária"
  },
  {
    id: "slide-exec-4",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=1600",
    tag: "Atendimento de Excelência, CX & Contact Center",
    highlight: "Supervisores de call center, gestores de contas B2B e suporte multicanal"
  }
];

// Complete seed database of vetted corporate professionals & executive talents
export const FALLBACK_SEED_PROFESSIONALS: Candidate[] = [
  {
    id: "mockup-prof-01",
    name: "Dra. Nádia",
    surname: "Sitoe",
    title: "Senior AI & Data Solutions Architect",
    category: "recruitment",
    subCategory: "Inteligência Artificial & Dados 🤖",
    city: "Maputo",
    residence: "Sommerschield II, Maputo",
    email: "nadia.sitoe@tarira.recruit.mz",
    phone: "+258 84 910 2234",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    promiseScore: 99,
    rating: 4.98,
    experienceYears: 9,
    expectedSalaryMin: 190000,
    expectedSalaryMax: 280000,
    workType: "Híbrido / Remoto",
    bio: "Engenheira e arquiteta de inteligência artificial com 9 anos de experiência em machine learning, sistemas RAG (Retrieval-Augmented Generation), pipelines de dados em nuvem e governança de dados para o setor bancário moçambicano.",
    whyWork: "Foco em aplicar inteligência de dados ética para automação corporativa de alto impacto.",
    skills: ["Large Language Models (LLMs) & RAG", "Python, PyTorch & TensorFlow", "BigQuery, Snowflake & Databricks", "Engenharia de MLOps", "Governança de Dados & ISO 27001"],
    documents: [{ type: "cv", title: "Curriculum Vitae Executivo (PDF)", issuer: "Central TARIRA", status: "verified" }],
    reviews: [{ reviewer: "Diretor de TI Banco Comercial MZ", date: "10 Ago 2026", rating: 5.0, quality: 5, punctuality: 5, cleanliness: 5, text: "Arquiteta genial. Reduziu os custos de processamento analítico em 40%." }],
    matchScore: 99,
    feedback: "Perfil altamente técnico com forte visão de negócio.",
    status: "approved",
    timestamp: "2026-08-01T10:00:00.000Z",
    availableNow: true,
    isProfessional: true,
    hourlyRate: 1500,
    rateMzn: 12000
  },
  {
    id: "mockup-prof-02",
    name: "Dr. Hermenegildo",
    surname: "Langa",
    title: "Diretor de Recursos Humanos & People Operations",
    category: "recruitment",
    subCategory: "Gestão Executiva & RH 💼",
    city: "Maputo",
    residence: "Polana, Maputo",
    email: "hermenegildo.langa@tarira.recruit.mz",
    phone: "+258 82 334 5566",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
    promiseScore: 99,
    rating: 5.0,
    experienceYears: 11,
    expectedSalaryMin: 220000,
    expectedSalaryMax: 310000,
    workType: "Presencial Executivo / Estratégico",
    bio: "Líder executivo com sólida trajetória na reestruturação organizacional, atração de talentos de liderança, negociação laboral e implantação de políticas de avaliação de desempenho por OKR.",
    whyWork: "Construção de culturas corporativas resilientes, desenvolvimento de lideranças de topo e mitigação de litígios laborais.",
    skills: ["Legislação Laboral Moçambicana", "Gestão de Mudança & Cultura", "People Analytics & ATS", "Avaliação de Desempenho 360°", "Plano de Sucessão Executiva"],
    documents: [{ type: "cv", title: "Dossier Executivo de Carreira (PDF)", issuer: "Central TARIRA", status: "verified" }],
    reviews: [{ reviewer: "Presidente Grupo Hoteleiro", date: "09 Jul 2026", rating: 5.0, quality: 5, punctuality: 5, cleanliness: 5, text: "Excelente gestor de pessoas, com visão estratégica e domínio da legislação laboral." }],
    matchScore: 99,
    feedback: "Diretor de Recursos Humanos sénior com experiência multinacional.",
    status: "approved",
    timestamp: "2026-08-02T10:00:00.000Z",
    availableNow: true,
    isProfessional: true,
    hourlyRate: 1800,
    rateMzn: 14400
  }
];

interface TariraProfessionalsGalleryProps {
  candidates: Candidate[];
  setActiveTab: (tab: string) => void;
  onGoBack?: () => void;
  onSelectCandidate?: (candidate: Candidate) => void;
  onViewCandidate?: (candidate: Candidate) => void;
  onViewPortfolio?: (candidate: Candidate) => void;
  onRequestBriefing?: () => void;
  onContactCommercial?: () => void;
  checkAccess?: (action: string) => boolean;
  currentLang?: "pt" | "en";
  userRole?: UserAccountRole;
  userEmail?: string;
  onSwitchToConnect?: () => void;
  onOpenRegisterModal?: (initialType?: "company" | "condo" | "residential") => void;
  onSwitchRoleTest?: (role: UserAccountRole) => void;
  initialSpecialty?: string;
  initialCandidateId?: string;
  currentCandidateId?: string;
}

export const TariraProfessionalsGallery: React.FC<TariraProfessionalsGalleryProps> = ({
  candidates,
  setActiveTab,
  onGoBack,
  onSelectCandidate,
  onViewCandidate,
  onViewPortfolio,
  onRequestBriefing,
  onContactCommercial,
  checkAccess,
  currentLang = "pt",
  userRole = "guest",
  userEmail,
  onSwitchToConnect,
  onOpenRegisterModal,
  onSwitchRoleTest,
  initialSpecialty = "all",
  initialCandidateId,
  currentCandidateId
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty || "all");

  React.useEffect(() => {
    if (initialSpecialty) {
      setSelectedSpecialty(initialSpecialty);
    }
  }, [initialSpecialty]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [selectedProfileModal, setSelectedProfileModal] = useState<Candidate | null>(null);
  const [selectedPortfolioModal, setSelectedPortfolioModal] = useState<Candidate | null>(null);
  const [activePortfolioZoom, setActivePortfolioZoom] = useState<{ url: string; title: string; caption?: string } | null>(null);
  const [isHireModalOpen, setIsHireModalOpen] = useState<boolean>(false);
  const [hireTargetCandidate, setHireTargetCandidate] = useState<Candidate | null>(null);

  // Role Gate Modal State (Restricted access for Lar profile, guests, and providers)
  const [isRoleGateModalOpen, setIsRoleGateModalOpen] = useState<boolean>(false);
  const [roleGateCandidate, setRoleGateCandidate] = useState<Candidate | null>(null);
  const [roleGateAction, setRoleGateAction] = useState<"recrutar" | "portfolio" | "perfil">("recrutar");
  const [roleGateExplanationType, setRoleGateExplanationType] = useState<"guest" | "lar" | "prestador">("guest");

  // Bloqueia a rolagem do fundo enquanto qualquer modal (perfil, portfólio, zoom, acesso restrito) está aberto
  // e repõe a rolagem do modal a 0 ao passar de um perfil/ação para outro.
  useBodyScrollLock(
    !!selectedProfileModal || !!selectedPortfolioModal || !!activePortfolioZoom || isRoleGateModalOpen,
    `${selectedProfileModal?.id ?? ""}|${selectedPortfolioModal?.id ?? ""}|${roleGateCandidate?.id ?? ""}|${roleGateAction}`
  );

  // Local simulated role for testing RBAC flows smoothly
  const [internalRole, setInternalRole] = useState<UserAccountRole | null>(null);
  const effectiveRole: UserAccountRole = internalRole || userRole || "guest";

  const handleSwitchRole = (role: UserAccountRole) => {
    setInternalRole(role);
    if (onSwitchRoleTest) {
      onSwitchRoleTest(role);
    }
  };

  // Corporate Domain Detection: Any email that has a corporate domain (not public free webmail)
  const isCorporateDomain = React.useMemo(() => {
    const email = (userEmail || "").toLowerCase().trim();
    if (!email || !email.includes("@")) return false;
    const domain = email.split("@")[1];
    const genericDomains = [
      "gmail.com", "googlemail.com", "yahoo.com", "hotmail.com", "outlook.com", 
      "icloud.com", "live.com", "aol.com", "mail.com", "proton.me", "protonmail.com", "yandex.com", "zoho.com"
    ];
    return Boolean(domain && !genericDomains.includes(domain));
  }, [userEmail]);

  // Corporate recruitment permissions:
  // - Admin
  // - Empresa (Company)
  // - Condomínio (Condo)
  // - Authenticated account with corporate domain (excluding prestador/lar)
  const canAccessCorporateRecruit = 
    effectiveRole === "empresa" || 
    effectiveRole === "condominio" || 
    effectiveRole === "admin" ||
    (isCorporateDomain && effectiveRole !== "prestador" && effectiveRole !== "lar");

  const isGuest = effectiveRole === "guest" || !effectiveRole;
  const isParticular = effectiveRole === "lar";
  const isProvider = effectiveRole === "prestador";

  // Pretensão Salarial Mensal só pode ser vista por quem está a recrutar (Empresa,
  // Condomínio ou Central/Admin) ou pelo próprio dono do perfil a ver o seu cartão —
  // outros candidatos/técnicos nunca devem ver a pretensão salarial de terceiros.
  const canViewSalary = (candidate: Candidate): boolean => {
    if (effectiveRole === "empresa" || effectiveRole === "condominio" || effectiveRole === "admin") {
      return true;
    }
    return Boolean(currentCandidateId && candidate.id === currentCandidateId);
  };

  // Hire inquiry form state
  const [hireForm, setHireForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    roleRequested: "",
    contractDuration: "indefinite",
    notes: "",
    documentName: "",
    documentSize: "",
    documentData: ""
  });
  const [hireSubmitted, setHireSubmitted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % RECRUIT_HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Quick suggestions for one-click search
  const SEARCH_SUGGESTIONS = [
    "Telecomunicações",
    "Inserção de Dados Telecom",
    "Contact Center & CX",
    "Auditor",
    "Finanças",
    "Cibersegurança",
    "React",
    "Recursos Humanos",
    "Provisioning Telecom",
    "Compliance",
    "PMP",
    "Marketing"
  ];

  const SPECIALTIES = [
    { id: "all", label: currentLang === "pt" ? "Todos os Talentos" : "All Profiles", icon: "🌐" },
    { id: "telecom_data", label: currentLang === "pt" ? "Telecom & Dados" : "Telecom & Data", icon: "📡" },
    { id: "callcenter", label: currentLang === "pt" ? "Atendimento & CX Telecom" : "Customer Support & CX", icon: "🎧" },
    { id: "financas", label: currentLang === "pt" ? "Finanças & Auditoria" : "Finance & Audit", icon: "📊" },
    { id: "cyber", label: currentLang === "pt" ? "Cibersegurança" : "Cybersecurity", icon: "🛡️" },
    { id: "ai", label: currentLang === "pt" ? "Inteligência Artificial & Dados" : "AI & Data", icon: "🤖" },
    { id: "devops", label: currentLang === "pt" ? "Software, Cloud & DevOps" : "Software & Cloud", icon: "💻" },
    { id: "kyc", label: currentLang === "pt" ? "Compliance & KYC" : "Compliance & KYC", icon: "🏦" },
    { id: "exec", label: currentLang === "pt" ? "Gestão Executiva & RH" : "Executive & HR", icon: "💼" },
    { id: "projetos", label: currentLang === "pt" ? "Gestão de Projetos & Eng." : "Project Management", icon: "📐" },
    { id: "marketing", label: currentLang === "pt" ? "Marketing & Comunicação" : "Marketing & Growth", icon: "📱" },
    { id: "juridico", label: currentLang === "pt" ? "Jurídico & Secretariado" : "Legal & Executive Support", icon: "⚖️" },
  ];

  const CITIES = [
    { id: "all", label: currentLang === "pt" ? "Todas as Cidades" : "All Cities" },
    { id: "Maputo", label: "Maputo" },
    { id: "Matola", label: "Matola" },
    { id: "Beira", label: "Beira" },
    { id: "Nampula", label: "Nampula" },
    { id: "Tete", label: "Tete" },
    { id: "Pemba", label: "Pemba" },
  ];

  // Helper to normalize strings for search (case-insensitive, accent-insensitive)
  const normalizeText = (text: any): string => {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  // Helper to detect if candidate is a corporate / recruit professional (Talentos e Quadros)
  const isProfessionalCandidate = (c: any): boolean => {
    if (!c) return false;

    // REGRA DE OURO: Se foi explicitamente registado como prestador de campo / técnico de ofício (isProfessional === false), NUNCA deve aparecer em Talentos e Quadros!
    if (c.isProfessional === false || c.isProfessional === 'false' || c.isProfessional === 0) {
      return false;
    }

    // Se foi explicitamente registado como profissional corporativo / recrutamento (isProfessional === true)
    if (c.isProfessional === true || c.isProfessional === 'true' || c.isProfessional === 1) {
      return true;
    }

    // Heurísticas rigorosas para registos legados ou sem a flag booleana explícita
    const cat = String(c.category || '').toLowerCase();
    const subCat = String(c.subCategory || '').toLowerCase();
    const title = String(c.title || '').toLowerCase();
    const cId = String(c.id || '').toLowerCase();

    // Se pertence a qualquer ofício / serviço de campo / doméstico, NUNCA é talento ou quadro corporativo
    const tradeKeywords = [
      'limpeza', 'manutencao', 'construcao', 'carpintaria', 'jardinagem', 'eletricidade',
      'canalizacao', 'climatizacao', 'refrigeracao', 'vidro', 'caixilharia', 'pintura',
      'domestica', 'dom_', 'baba', 'chef', 'cozinheiro', 'oficio', 'tech', 'seguranca_vigilancia',
      'elec', 'canal', 'pint', 'jard', 'limp', 'man', 'obra', 'carp', 'caix', 'dom', 'dom2'
    ];
    if (tradeKeywords.some(tk => cat.includes(tk) || subCat.includes(tk))) {
      return false;
    }

    // Apenas categorias corporativas legítimas de recrutamento e quadros executivos
    if (cat === 'prof' || cat === 'recruitment' || cat === 'recrutamento' || cat === 'quadros' || cat.includes('recrutamento_') || cat.includes('corporativ')) {
      return true;
    }
    if (subCat.includes('recrutamento') || subCat.includes('corporativ')) {
      return true;
    }
    if (cId.includes('prof-') || cId.includes('recruit-')) {
      return true;
    }

    return false;
  };

  // Build candidate pool from live candidates only.
  const professionalPool = useMemo(() => {
    const map = new Map<string, Candidate>();

    (candidates || []).forEach((c) => {
      if (!c) return;
      // REGRA ESTRITA: Apenas perfis reais confirmados como profissionais corporativos pertencem a Talentos e Quadros
      if (isProfessionalCandidate(c)) {
        map.set(String(c.id), c);
      }
    });

    return Array.from(map.values());
  }, [candidates]);

  // Auto-focus and scroll to card if navigated from Recruit landing preview (without opening popup modal)
  React.useEffect(() => {
    if (initialCandidateId && professionalPool.length > 0) {
      const found = professionalPool.find((c) => String(c.id) === String(initialCandidateId));
      if (found) {
        setSelectedSpecialty("all");
        setTimeout(() => {
          const el = document.getElementById(`cand-card-${initialCandidateId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);
      }
    }
  }, [initialCandidateId, professionalPool]);

  // Resolve which specialty tab(s) a professional candidate truly belongs to.
  // IMPORTANT: this reads ONLY the candidate's category/subCategory — never the
  // free-text bio, whyWork or skills. The old logic scanned the whole bio for
  // generic words ("gestão", "dados", "cliente"...) which almost every profile
  // contains somewhere, so a profile created under one category ended up
  // matching nearly every tab. Resolving strictly from category/subCategory
  // means a profile only ever belongs to the tab it was actually created in.
  const getCandidateSpecialtyTabs = (c: any): string[] => {
    const categoryId = normalizeText(c.category || "");
    const subCat = normalizeText(c.subCategory || "");

    // 1) Preferred path: category was saved using the canonical taxonomy id
    //    (categoriesData.ts) — this is what the profile-creation form stores,
    //    so it's a direct, unambiguous 1:1 mapping to a single tab.
    const directTabByCategory: Record<string, string> = {
      ti_software: "devops",
      ciberseguranca: "cyber",
      ia_dados: "ai",
      financas_contabilidade: "financas",
      recursos_humanos: "exec",
      gestao_projetos: "projetos",
      marketing_vendas: "marketing",
    };
    if (directTabByCategory[categoryId]) {
      return [directTabByCategory[categoryId]];
    }

    // 2) Categories that legitimately cover two gallery tabs — disambiguate
    //    using the specific specialty (subCategory) chosen at creation time.
    if (categoryId === "juridico_compliance") {
      return [/compliance|kyc|aml|branqueamento/.test(subCat) ? "kyc" : "juridico"];
    }
    if (categoryId === "atendimento_secretariado") {
      return [/secretariado|recepcao|assessoria|protocolo|agendas/.test(subCat) ? "juridico" : "callcenter"];
    }

    // 3) Legacy / manually-entered records without a canonical category id
    //    (e.g. seed data saved with category "recruitment") — read the
    //    specialty straight out of the category/subCategory text only.
    const legacyText = `${categoryId} ${subCat}`;
    if (/telecom|insercao de dados|provisioning|\boss\b|\bbss\b/.test(legacyText)) return ["telecom_data"];
    if (/compliance|kyc|aml|branqueamento/.test(legacyText)) return ["kyc"];
    if (/atendimento|contact center|call center|teleatendimento/.test(legacyText)) return ["callcenter"];
    if (/financ|auditor|fiscal|contab/.test(legacyText)) return ["financas"];
    if (/ciberseguran|cyber|pentest|\bsoc\b/.test(legacyText)) return ["cyber"];
    if (/intelig[e]ncia artificial|machine learning|\bia\b|\bllm\b/.test(legacyText)) return ["ai"];
    if (/software|devops|cloud|fullstack/.test(legacyText)) return ["devops"];
    if (/recursos humanos|\brh\b/.test(legacyText)) return ["exec"];
    if (/projet|scrum|procurement|supply chain/.test(legacyText)) return ["projetos"];
    if (/marketing|branding|comercial/.test(legacyText)) return ["marketing"];
    if (/jur[i]dico|advogado|direito|secretariado/.test(legacyText)) return ["juridico"];

    return [];
  };

  // Filter candidate pool with multi-field, multi-token normalized search
  const filteredCandidates = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const queryTokens = normalizeText(rawQuery).split(/\s+/).filter(Boolean);

    return professionalPool
      .filter((c) => {
        if (!c) return false;
        // Don't filter out active / pending / approved / Ativo / em_analise
        // Only exclude if explicitly rejected, archived, or suspended
        const st = String(c.status || "").toLowerCase();
        if (st === "rejected" || st === "archived" || st === "suspenso") {
          return false;
        }
        return true;
      })
      .filter((c) => {
        // Garante de forma absoluta que apenas profissionais corporativos (Talentos e Quadros) passam
        if (!isProfessionalCandidate(c)) {
          return false;
        }

        // City filter
        if (selectedCity !== "all" && c.city && c.city !== selectedCity) {
          return false;
        }

        // Availability filter
        if (onlyAvailable && c.availableNow === false) {
          return false;
        }

        // Build comprehensive searchable corpus for this professional
        const nameText = `${c.name || ""} ${c.surname || ""}`;
        const titleText = c.title || "";
        const subCatText = c.subCategory || "";
        const categoryText = c.category || "";
        const bioText = c.bio || "";
        const whyWorkText = c.whyWork || "";
        const rawSkills = Array.isArray(c.skills) ? c.skills : (typeof c.skills === "string" ? (c.skills as string).split(",") : []);
        const skillsText = rawSkills.map(s => String(s).trim()).join(" ");
        const valuesText = Array.isArray(c.personalValues) ? c.personalValues.join(" ") : "";
        const cityText = c.city || "";
        const residenceText = c.residence || "";
        const workTypeText = c.workType || "";
        const docsText = Array.isArray(c.documents) ? c.documents.map((d: any) => d?.title || "").join(" ") : "";

        const tNorm = normalizeText(titleText);
        const sNorm = normalizeText(subCatText);
        const skillsNorm = normalizeText(skillsText);
        const bNorm = normalizeText(bioText);

        // Synonyms expansion for corporate roles and specialities
        let synonyms = "";
        const combinedText = `${tNorm} ${sNorm} ${skillsNorm} ${bNorm}`;

        if (combinedText.includes("auditor") || combinedText.includes("fiscal") || combinedText.includes("control") || combinedText.includes("finan")) {
          synonyms += " auditor auditoria auditora auditor financeiro auditor interno controlo gestao fiscal fiscalidade tributario nirf ifrs ocam contabilidade contabilista balanco revisor contas due diligence";
        }
        if (combinedText.includes("atendimento") || combinedText.includes("customer") || combinedText.includes("cx") || combinedText.includes("suporte") || combinedText.includes("helpdesk") || combinedText.includes("call center") || combinedText.includes("contact center")) {
          synonyms += " atendimento apoio ao cliente customer service customer care contact center call center telemarketing sac helpdesk suporte assistencia rececao recepcao telefonista relacoes publicas nps csat zendesk";
        }
        if (combinedText.includes("recursos humanos") || combinedText.includes("rh") || combinedText.includes("people") || combinedText.includes("recrutamento")) {
          synonyms += " rh recursos humanos recrutamento selecao people operations departamento pessoal legislacao laboral gestao de talentos headcount";
        }
        if (combinedText.includes("ciberseguran") || combinedText.includes("seguranca") || combinedText.includes("soc") || combinedText.includes("pentest")) {
          synonyms += " ciberseguranca cyber seguranca da informacao soc siem pentest ethical hacker firewalls redes cissp iso 27001";
        }
        if (combinedText.includes("inteligencia artificial") || combinedText.includes("ia") || combinedText.includes("dados") || combinedText.includes("machine learning")) {
          synonyms += " ia inteligencia artificial artificial intelligence data science cientista de dados machine learning llm python engenharia de dados analytics";
        }
        if (combinedText.includes("software") || combinedText.includes("program") || combinedText.includes("desenvolv") || combinedText.includes("fullstack")) {
          synonyms += " software desenvolvedor programador engenheiro de software fullstack frontend backend developer programacao react node typescript javascript";
        }
        if (combinedText.includes("cloud") || combinedText.includes("devops") || combinedText.includes("aws") || combinedText.includes("kubernetes")) {
          synonyms += " cloud nuvem devops devsecops kubernetes docker terraform iac infraestrutura ci cd sysadmin";
        }
        if (combinedText.includes("projeto") || combinedText.includes("pmp") || combinedText.includes("infraestrutura")) {
          synonyms += " gestor de projetos project manager pmp gerenciamento gestao empreitada pmo cronograma orcamento fidic engenheiro";
        }
        if (combinedText.includes("marketing") || combinedText.includes("comunicacao") || combinedText.includes("growth")) {
          synonyms += " marketing comunicacao publicidade propaganda growth trafego pago redes sociais branding relacoes publicas midia vendas";
        }
        if (combinedText.includes("compliance") || combinedText.includes("kyc") || combinedText.includes("aml") || combinedText.includes("risco")) {
          synonyms += " compliance kyc aml conformidade risco bancario regulamentar banco de mocambique branqueamento de capitais governanca auditoria";
        }
        if (combinedText.includes("juridico") || combinedText.includes("advogado") || combinedText.includes("direito") || combinedText.includes("legal")) {
          synonyms += " juridico direito advogado jurista legal consultor juridico oam contratos laboral contencioso societario";
        }
        if (combinedText.includes("secretari") || combinedText.includes("assistente") || combinedText.includes("administrativ")) {
          synonyms += " secretaria secretariado assistente executiva administracao diretoria atas recepcao protocolo bilingue apoio administrativo";
        }
        if (combinedText.includes("telecom") || combinedText.includes("dados") || combinedText.includes("insercao") || combinedText.includes("data entry") || combinedText.includes("provisioning") || combinedText.includes("oss") || combinedText.includes("bss")) {
          synonyms += " telecom telecomunicacoes insercao de dados data entry gestao de dados provisioning oss bss redes moveis crm digitacao cadastros validacao de dados fibra gsm lte 5g sim esim faturamento telecom tarifarios";
        }

        const candidateCorpus = normalizeText([
          nameText,
          titleText,
          subCatText,
          categoryText,
          bioText,
          whyWorkText,
          skillsText,
          valuesText,
          cityText,
          residenceText,
          workTypeText,
          docsText,
          synonyms
        ].join(" "));

        // Check if user search query matches
        const matchesQuery = queryTokens.length === 0 || queryTokens.every((token) => candidateCorpus.includes(token));

        if (!matchesQuery) {
          return false;
        }

        // Specialty (category) filter — a candidate only shows under the tab it
        // actually belongs to, resolved strictly from category/subCategory (see
        // getCandidateSpecialtyTabs above). "Todos os Talentos" ("all") is
        // unaffected by this and keeps showing every candidate, as expected.
        if (selectedSpecialty !== "all" && queryTokens.length === 0) {
          const candidateTabs = getCandidateSpecialtyTabs(c);
          if (!candidateTabs.includes(selectedSpecialty)) return false;
        }

        return true;
      });
  }, [professionalPool, selectedSpecialty, selectedCity, onlyAvailable, searchQuery]);

  const handleFileUpload = (file: File) => {
    setUploadError("");
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const isDoc = ["pdf", "doc", "docx", "txt"].includes(ext || "");

    if (!validTypes.includes(file.type) && !isDoc) {
      setUploadError(currentLang === "pt" ? "Por favor, anexe apenas ficheiros em formato PDF ou Word (.doc, .docx)." : "Please attach only PDF or Word documents (.doc, .docx).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError(currentLang === "pt" ? "O ficheiro é demasiado grande (máximo 15MB)." : "File is too large (max 15MB).");
      return;
    }

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setHireForm(prev => ({
        ...prev,
        documentName: file.name,
        documentSize: formattedSize,
        documentData: result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenHireModal = (candidate: Candidate) => {
    if (checkAccess && !checkAccess("SOLICITAR_PROFISSIONAL")) {
      return;
    }
    setHireTargetCandidate(candidate);
    setHireForm({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      roleRequested: candidate.title || candidate.subCategory || "Profissional Especialista",
      contractDuration: "indefinite",
      notes: "",
      documentName: "",
      documentSize: "",
      documentData: ""
    });
    setUploadError("");
    setHireSubmitted(false);
    setIsHireModalOpen(true);
  };

  const handleSubmitHire = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/recruit/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: hireTargetCandidate?.id,
          candidateName: `${hireTargetCandidate?.name} ${hireTargetCandidate?.surname || ""}`,
          ...hireForm
        })
      });
    } catch {
      // fallback
    }
    setHireSubmitted(true);
  };

  const handleProfileClick = (c: Candidate) => {
    if (onViewCandidate) {
      onViewCandidate(c);
    } else {
      setSelectedProfileModal(c);
    }
  };

  const handlePortfolioClick = (c: Candidate) => {
    if (onViewPortfolio) {
      onViewPortfolio(c);
    } else {
      setSelectedPortfolioModal(c);
    }
  };

  const handleRecruitClick = (c: Candidate) => {
    if (onSelectCandidate) {
      onSelectCandidate(c);
    } else {
      handleOpenHireModal(c);
    }
  };

  return (
    <div id="s-profissionais" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-text-primary">
      
      {/* Navigation Breadcrumb / Back Button */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => onGoBack ? onGoBack() : setActiveTab("landing")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-brand text-xs font-bold hover:bg-background-secondary transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-brand" /> ← Voltar à Página Anterior
        </button>
        <div className="text-right">
          <span className="text-[10px] tracking-wider text-text-secondary font-mono uppercase">Recrutamento Corporativo</span>
          <p className="text-xs font-bold text-brand">TARIRA Recruit • Talentos & Quadros</p>
        </div>
      </div>

      {/* 1. Header Banner - Dynamic High-Impact Visual Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden mb-6 shadow-2xl border border-blue-950/40 text-white group">
        {/* Dynamic Background Image with Smooth Crossfade & Optical Navy Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={RECRUIT_HERO_SLIDES[heroSlideIndex]?.url || RECRUIT_HERO_SLIDES[0].url}
            alt={RECRUIT_HERO_SLIDES[heroSlideIndex]?.tag || "Talentos Corporativos"}
            className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 ease-out"
            key={RECRUIT_HERO_SLIDES[heroSlideIndex]?.id || "slide-0"}
          />
          {/* Deep Navy High-Contrast Scrim Layer for pristine legibility with softened opacity */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070e22]/75 via-[#172554]/70 to-[#071330]/70 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.18),transparent_60%)]" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
          {/* Top Row: Kicker & Slide Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                TARIRA RECRUIT · TALENTOS & QUADROS CORPORATIVOS
              </div>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-blue-500/25 border border-blue-400/30 text-blue-200 text-xs font-medium backdrop-blur-xs">
                {RECRUIT_HERO_SLIDES[heroSlideIndex]?.tag || "Contratos Flexíveis"}
              </span>
            </div>

            {/* Slide Navigation Indicator Dots */}
            <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <span className="text-[10px] font-mono text-blue-200 mr-1 uppercase">Galeria:</span>
              {RECRUIT_HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setHeroSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    heroSlideIndex === idx ? "w-6 bg-blue-400 shadow-[0_0_8px_#60a5fa]" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  title={s.tag}
                />
              ))}
            </div>
          </div>

          {/* Main Title with Animated Typewriter Hook */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 text-left space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                Talentos & Quadros de{" "}
                <TypewriterPromise
                  phrases={[
                    "Gestão & Inserção de Dados Telecom",
                    "Contact Center & Suporte CX",
                    "Finanças & Auditoria Big-4",
                    "Inteligência Artificial & Cloud",
                    "Cibersegurança & SOC",
                    "Gestão Executiva & RH"
                  ]}
                  typingSpeed={85}
                  deletingSpeed={45}
                  pauseDelay={3500}
                  className="text-blue-300 drop-shadow-[0_2px_12px_rgba(37,99,235,0.5)] font-serif"
                />
              </h1>

              <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed font-normal">
                Banco homologado de especialistas corporativos, analistas seniores e líderes operacionais com disponibilidade imediata. 
                {RECRUIT_HERO_SLIDES[heroSlideIndex]?.highlight ? ` ${RECRUIT_HERO_SLIDES[heroSlideIndex].highlight}.` : ""} Modelos flexíveis de alocação direta ou outsourcing sob SLA garantido.
              </p>

              {/* Real-Time Live Ticker & Trust Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono backdrop-blur-sm shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-bold text-emerald-300">Triagem Expressa:</span>
                  <span className="text-[11px] text-blue-100">Shortlist em 24-48 horas</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  <span className="text-[11px] text-blue-100">100% Homologados & Testados</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono backdrop-blur-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-[11px] text-blue-100">{filteredCandidates.length} Candidatos Ativos</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Orbit Badge & Quick Action Buttons */}
            <div className="lg:col-span-4 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4">
              <div className="hidden sm:block">
                <VerticalOrbitBadge text="RECRUIT" subtext="24•48H" size="md" variant="glass" />
              </div>

              <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                <button
                  id="btn-register-talent-hero"
                  onClick={() => setActiveTab("spontaneous_apply")}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#172554] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <GraduationCap className="w-4 h-4 text-white" />
                  <span>Registar como Profissional</span>
                </button>
                <button
                  id="btn-request-briefing-hero"
                  onClick={() => onRequestBriefing ? onRequestBriefing() : setActiveTab("landing")}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#172554] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Building2 className="w-4 h-4 text-[#172554]" />
                  <span>Pedir Briefing Corporativo B2B</span>
                </button>
              </div>
            </div>
          </div>

          {/* Integrated RBAC Status & Simulation Test Bar */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-blue-300 font-mono text-[11px] font-bold">Estado de Acesso RBAC:</span>
              {effectiveRole === "admin" && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-200 font-bold text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administrador: Acesso Total Irrestrito
                </span>
              )}
              {(effectiveRole === "empresa" || effectiveRole === "condominio" || isCorporateDomain) && effectiveRole !== "admin" && effectiveRole !== "prestador" && effectiveRole !== "lar" && (
                <span className="px-2.5 py-1 rounded-full bg-blue-500/30 border border-blue-400 text-blue-200 font-bold text-[11px] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> {isCorporateDomain && effectiveRole !== "empresa" ? "Domínio Corporativo Verificado" : `Conta ${effectiveRole === "empresa" ? "Empresa" : "Condomínio"}`}: Acesso B2B Total Ativo
                </span>
              )}
              {effectiveRole === "lar" && (
                <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-blue-100 font-semibold text-[11px] flex items-center gap-1.5 backdrop-blur-md">
                  <Home className="w-3.5 h-3.5 text-blue-200" /> Conta Particular (Lar): Acesso Livre para Consulta • Dossiês Corporativos Protegidos
                </span>
              )}
              {effectiveRole === "prestador" && (
                <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-blue-100 font-bold text-[11px] flex items-center gap-1.5 backdrop-blur-md">
                  <UserCheck className="w-3.5 h-3.5 text-blue-200" /> Profissional / Técnico: Gestão Exclusiva do Próprio Perfil
                </span>
              )}
              {isGuest && (
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-white font-semibold text-[11px] flex items-center gap-1.5 backdrop-blur-md shadow-xs">
                  <Users className="w-3.5 h-3.5 text-blue-200" /> Visitante: Consulta Livre • Criar Conta Corporativa para Recrutar
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-blue-200/80">Simular Papel:</span>
              <button
                type="button"
                onClick={() => handleSwitchRole("guest")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isGuest ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular visitante sem conta (Guest)"
              >
                Visitante
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("empresa")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  effectiveRole === "empresa" ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular conta Empresa / Domínio Corporativo B2B"
              >
                Empresa / Domínio
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("condominio")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  effectiveRole === "condominio" ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular conta Condomínio"
              >
                Condomínio
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("prestador")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isProvider ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular técnico / profissional credenciado"
              >
                Profissional / Técnico
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("lar")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isParticular ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular cliente particular residencial (Lar)"
              >
                Particular (Lar)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("admin")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  effectiveRole === "admin" ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular Administrador"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Specialty Buttons Grid (Vertical card layout matching canonical categories) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2 sm:gap-2.5 mb-6">
        {SPECIALTIES.map((spec) => {
          const isActive = selectedSpecialty === spec.id;
          return (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.id)}
              className={`p-2.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[82px] sm:min-h-[88px] group shadow-xs ${
                isActive
                  ? "bg-[#172554] text-white border-[#172554] font-bold shadow-sm scale-[1.02]"
                  : "bg-background text-text-primary border-border hover:bg-[#172554] hover:border-[#172554] hover:text-white hover:shadow-md"
              }`}
            >
              <span className="text-xl sm:text-2xl drop-shadow-sm group-hover:scale-110 transition-transform duration-200">{spec.icon}</span>
              <span className={`text-[10.5px] font-bold leading-tight text-center line-clamp-2 max-w-[110px] transition-colors duration-200 ${
                isActive ? "text-white" : "text-text-primary group-hover:text-white"
              }`}>
                {spec.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & City Filters Bar */}
      <div className="bg-background rounded-2xl border border-border p-3 sm:p-4 mb-6 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Main Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-brand absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLang === "pt" ? "Pesquisar por nome, cargo (Auditor, Atendimento...), competências..." : "Search candidate name, title, skills..."}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* City Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-background border border-border text-xs text-text-primary focus:outline-none focus:border-brand font-sans"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Availability Toggle */}
          <div className="sm:col-span-3 flex items-center justify-end">
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                onlyAvailable
                  ? "bg-status-success/15 text-status-success border-status-success/30"
                  : "bg-background text-text-secondary border-border hover:bg-background-secondary hover:text-text-primary"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${onlyAvailable ? "bg-status-success animate-pulse" : "bg-text-secondary"}`} />
              <span>{currentLang === "pt" ? "Disponíveis Imediatamente" : "Available Now"}</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] text-text-secondary font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand" />
            {currentLang === "pt" ? "Sugestões de busca:" : "Quick suggestions:"}
          </span>
          {SEARCH_SUGGESTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(tag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer border ${
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? "bg-[#172554] text-white border-[#172554] font-bold shadow-xs"
                  : "bg-background text-text-secondary border-border hover:bg-[#172554] hover:border-[#172554] hover:text-white shadow-xs"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Active Search Context Feedback */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-background-secondary border border-border text-xs">
            <div className="flex items-center gap-2 text-brand">
              <Search className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>
                {currentLang === "pt"
                  ? `A pesquisar por "${searchQuery}" em nomes, cargos, competências e bairros (${filteredCandidates.length} ${filteredCandidates.length === 1 ? "talento encontrado" : "talentos encontrados"})`
                  : `Searching for "${searchQuery}" in candidate names, titles and skills (${filteredCandidates.length} found)`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-brand hover:underline font-bold text-xs cursor-pointer"
            >
              {currentLang === "pt" ? "Limpar pesquisa ✕" : "Clear ✕"}
            </button>
          </div>
        )}
      </div>

      {/* 3. Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-background border border-border space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto text-2xl text-brand">
            🔍
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-text-primary">Nenhum profissional encontrado para os critérios</h3>
            <p className="text-xs text-text-secondary max-w-lg mx-auto mt-2 leading-relaxed">
              Não encontrou o especialista exato para o seu departamento ou projeto? O nosso time de <strong>TARIRA Recruit & Hunting</strong> realiza a busca ativa e triagem customizada para a sua organização.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedSpecialty("all");
                setSearchQuery("");
                setSelectedCity("all");
                setOnlyAvailable(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-text-primary font-bold text-xs transition-all cursor-pointer border border-border shadow-xs"
            >
              Limpar Todos os Filtros
            </button>

            {onRequestBriefing && (
              <button
                onClick={onRequestBriefing}
                className="px-5 py-2.5 rounded-xl bg-brand hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Abrir Requisição de Vaga (Fase 1 Briefing)</span>
              </button>
            )}

            {onContactCommercial && (
              <button
                onClick={onContactCommercial}
                className="px-5 py-2.5 rounded-xl bg-background border border-border text-brand hover:bg-background-secondary font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contactar Área Comercial</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((c) => {
            const isAvailable = c.availableNow !== false;

            return (
              <div
                key={c.id}
                id={`cand-card-${c.id}`}
                className="rounded-3xl bg-background border border-border p-5 flex flex-col justify-between space-y-4 hover:border-brand hover:shadow-md transition-all shadow-xs group relative"
              >
                {/* Photo & Top Details */}
                <div 
                  onClick={() => handleProfileClick(c)}
                  className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-border bg-background-secondary shadow-inner group-hover:border-brand transition-all cursor-pointer"
                  title={`Visualizar perfil de ${c.name}`}
                >
                  {c.photo ? (
                    <img
                      src={c.photo}
                      alt={`${c.name} ${c.surname || ""}`}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-background-secondary text-brand">
                      <span className="font-serif text-4xl font-bold">
                        {(c.name || "P")[0]}{(c.surname || "")[0] || ""}
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay com opacidade suave para permitir ver a foto nitidamente por trás */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />

                  {/* Badges on Top */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center gap-1 pointer-events-none">
                    {isAvailable ? (
                      <span className="text-[9px] bg-status-success/90 text-white border border-status-success px-2.5 py-1 rounded-lg font-mono font-bold uppercase backdrop-blur-md shadow-xs">
                        🟢 Disponível
                      </span>
                    ) : (
                      <span className="text-[9px] bg-status-danger/90 text-white border border-status-danger px-2.5 py-1 rounded-lg font-mono font-bold uppercase backdrop-blur-md shadow-xs">
                        🔴 Alocado
                      </span>
                    )}
                    <span className="text-[9px] bg-background/90 text-text-primary border border-border px-2.5 py-1 rounded-lg font-mono font-bold backdrop-blur-md shadow-xs">
                      📍 {c.city || "Maputo"}
                    </span>
                  </div>

                  {/* Details Overlay at Bottom of Photo */}
                  <div className="absolute bottom-3 left-3 right-3 pointer-events-none space-y-1">
                    <span
                      className="max-w-full truncate px-2.5 py-0.5 rounded-full bg-brand text-white text-[9px] font-bold uppercase tracking-wider inline-block align-top"
                      title={c.title || c.subCategory || "Especialista"}
                    >
                      {c.title || c.subCategory || "Especialista"}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-white drop-shadow-md leading-tight truncate">
                      {c.name} {c.surname || ""}
                    </h3>
                    {canViewSalary(c) && (
                      <p className="text-[10px] text-white/95 font-mono font-bold drop-shadow-md">
                        💰 {c.expectedSalaryMin ? `${c.expectedSalaryMin.toLocaleString()} - ${(c.expectedSalaryMax || c.expectedSalaryMin * 1.35).toLocaleString()} MZN/mês` : "35.000 - 55.000 MZN/mês"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio Excerpt */}
                <div className="space-y-2">
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed bg-background-secondary p-2.5 rounded-xl border border-border italic font-sans">
                    "{c.bio || "Profissional especializado com sólida formação e experiência comprovada no mercado nacional."}"
                  </p>

                  {/* Skills Tags */}
                  {(() => {
                    const candidateSkills = Array.isArray(c.skills) ? c.skills : (typeof c.skills === "string" ? (c.skills as string).split(",") : []);
                    const trimmedSkills = candidateSkills.map(s => String(s).trim()).filter(Boolean);
                    if (trimmedSkills.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-1">
                        {trimmedSkills.slice(0, 4).map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-background text-brand border border-border text-[9px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                        {trimmedSkills.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-background text-brand border border-border text-[9px] font-bold">
                            +{trimmedSkills.length - 4}
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  {/* Languages */}
                  {Array.isArray(c.languages) && c.languages.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                      <span className="font-bold text-brand">🗣️ Línguas:</span>
                      <span className="font-medium text-text-primary">{c.languages.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons (Perfil, Portfólio, Recrutar) */}
                <div className="pt-2 border-t border-border">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      id={`btn-cand-profile-${c.id}`}
                      onClick={() => handleProfileClick(c)}
                      className="py-2 px-2.5 rounded-xl bg-background hover:bg-background-secondary text-brand text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-border shadow-xs active:scale-95"
                      title="Ver Perfil Detalhado & Dossiê"
                    >
                      <Eye className="w-3.5 h-3.5 text-brand" />
                      <span>Perfil</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-cand-portfolio-${c.id}`}
                      onClick={() => handlePortfolioClick(c)}
                      className="py-2 px-2.5 rounded-xl bg-background hover:bg-background-secondary text-brand text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-border shadow-xs active:scale-95"
                      title="Ver Portfólio de Obras & Projetos"
                    >
                      <Layers className="w-3.5 h-3.5 text-brand" />
                      <span>Portfólio</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-cand-recruit-${c.id}`}
                      onClick={() => handleRecruitClick(c)}
                      className="py-2 px-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white border border-[#172554] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      title="Recrutar / Iniciar Processo"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-white" />
                      <span>Recrutar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Full Profile Modal */}
      {selectedProfileModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm overflow-y-auto p-3 sm:p-6"
          onClick={() => setSelectedProfileModal(null)}
        >
          <div className="min-h-full flex items-center justify-center py-16 sm:py-20 pointer-events-none">
            <div 
              data-modal-scroll 
              className="pointer-events-auto relative bg-background border border-border rounded-3xl max-w-2xl w-full max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-left text-text-primary"
              onClick={(e) => e.stopPropagation()}
            >
            
            {/* Notice for Lar Profile if viewing recruit profile */}
            {!canAccessCorporateRecruit && (
              <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-brand">
                    Visualização Informativa de Recrutamento Corporativo (TARIRA Recruit)
                  </p>
                  <p className="text-text-secondary leading-relaxed">
                    A sua conta atual é <strong>Perfil Lar</strong>, que está direcionada para a busca de <strong>Técnicos & Ofícios</strong>. A contratação direta e consulta de portfólios completos é exclusiva para contas <strong>Empresa (B2B)</strong> e <strong>Condomínio</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-background-secondary border border-border overflow-hidden shrink-0">
                  {selectedProfileModal.photo ? (
                    <img
                      src={selectedProfileModal.photo}
                      alt={selectedProfileModal.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand font-bold text-2xl">
                      {selectedProfileModal.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20 uppercase">
                    {selectedProfileModal.title || "Especialista"}
                  </span>
                  <h2 className="text-xl font-bold text-text-primary mt-1">
                    {selectedProfileModal.name} {selectedProfileModal.surname || ""}
                  </h2>
                  <p className="text-xs text-text-secondary">📍 {selectedProfileModal.city || "Maputo, Moçambique"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfileModal(null)}
                className="p-1 rounded-full bg-background-secondary hover:bg-border text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand font-mono mb-1">Resumo Profissional</h4>
                <p className="text-xs text-text-secondary leading-relaxed bg-background-secondary p-4 rounded-xl border border-border">
                  {selectedProfileModal.bio || "Profissional qualificado com aptidão validada pelo processo de triagem TARIRA Recruit."}
                </p>
              </div>

              {(() => {
                const modalSkills = Array.isArray(selectedProfileModal.skills) 
                  ? selectedProfileModal.skills 
                  : (typeof selectedProfileModal.skills === "string" ? (selectedProfileModal.skills as string).split(",") : []);
                const trimmedModalSkills = modalSkills.map(s => String(s).trim()).filter(Boolean);
                if (trimmedModalSkills.length === 0) return null;
                return (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand font-mono mb-1.5">Competências & Tecnologias</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {trimmedModalSkills.map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-background-secondary border border-border text-xs text-text-primary">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className={`grid gap-4 bg-background-secondary p-4 rounded-xl border border-border ${canViewSalary(selectedProfileModal) ? "grid-cols-2" : "grid-cols-1"}`}>
                {canViewSalary(selectedProfileModal) && (
                  <div>
                    <span className="text-[10px] text-text-secondary uppercase font-mono block">Pretensão Salarial</span>
                    <span className="text-sm font-bold text-brand">
                      {selectedProfileModal.expectedSalaryMin
                        ? `${selectedProfileModal.expectedSalaryMin.toLocaleString()} - ${(selectedProfileModal.expectedSalaryMax || Math.round(selectedProfileModal.expectedSalaryMin * 1.3)).toLocaleString()} MZN/mês`
                        : "Sob Consulta"}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-mono block">Disponibilidade</span>
                  <span className="text-sm font-bold text-status-success">
                    {selectedProfileModal.availableNow !== false ? "🟢 Imediata" : "🟡 Com Aviso Prévio"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setSelectedProfileModal(null)}
                className="px-4 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-text-secondary text-xs font-bold border border-border transition-colors cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedProfileModal;
                    setSelectedProfileModal(null);
                    handlePortfolioClick(c);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-brand text-xs font-bold border border-border transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-brand" />
                  <span>Ver Portfólio de Obras</span>
                </button>

                {!canAccessCorporateRecruit && onSwitchToConnect && (
                  <button
                    onClick={() => {
                      setSelectedProfileModal(null);
                      onSwitchToConnect();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-brand/10 text-brand border border-brand/20 text-xs font-bold hover:bg-brand/20 transition-colors cursor-pointer"
                  >
                    ⚡ Ver Técnicos & Ofícios para o Lar
                  </button>
                )}

                <button
                  onClick={() => {
                    const c = selectedProfileModal;
                    if (canAccessCorporateRecruit) {
                      setSelectedProfileModal(null);
                      if (onSelectCandidate) {
                        onSelectCandidate(c);
                      } else {
                        handleOpenHireModal(c);
                      }
                    } else {
                      setSelectedProfileModal(null);
                      handleRecruitClick(c);
                    }
                  }}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shadow-xs cursor-pointer flex items-center gap-2 ${
                    canAccessCorporateRecruit
                      ? "bg-[#172554] hover:brightness-110 text-white border-[#172554] hover:border-[#172554]"
                      : "bg-[#172554] hover:brightness-110 text-white border-[#172554] hover:border-[#172554]"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-white" />
                  <span>{canAccessCorporateRecruit ? "Solicitar Contratação / Entrevista" : isGuest ? "Criar Conta Empresa para Recrutar" : "Recrutar Especialista"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 5. Dedicated Portfolio Modal */}
      {selectedPortfolioModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm overflow-y-auto p-3 sm:p-6"
          onClick={() => setSelectedPortfolioModal(null)}
        >
          <div className="min-h-full flex items-center justify-center py-16 sm:py-20 pointer-events-none">
            <div 
              data-modal-scroll 
              className="pointer-events-auto relative bg-background border border-border rounded-3xl max-w-3xl w-full max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-left text-text-primary animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-background-secondary border border-border overflow-hidden shrink-0">
                  {selectedPortfolioModal.photo ? (
                    <img
                      src={selectedPortfolioModal.photo}
                      alt={selectedPortfolioModal.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand font-bold text-2xl">
                      {selectedPortfolioModal.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20 uppercase">
                      Portfólio Validado
                    </span>
                    <span className="text-[10px] font-mono text-status-success font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verificado TARIRA
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-text-primary mt-1">
                    {selectedPortfolioModal.name} {selectedPortfolioModal.surname || ""}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {selectedPortfolioModal.title || "Especialista Qualificado"} • 📍 {selectedPortfolioModal.city || "Maputo, Moçambique"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPortfolioModal(null)}
                className="p-1 rounded-full bg-background-secondary hover:bg-border text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Bio / Resumo Real */}
            {selectedPortfolioModal.bio && (
              <div className="p-4 rounded-2xl bg-background-secondary border border-border space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand font-bold">
                  Resumo Profissional do Candidato
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  "{selectedPortfolioModal.bio}"
                </p>
              </div>
            )}

            {/* Candidate Real Skills */}
            {selectedPortfolioModal.skills && selectedPortfolioModal.skills.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand font-bold">
                  Competências Registadas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPortfolioModal.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-background-secondary text-text-primary text-[11px] font-medium border border-border"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Highlights / Gallery */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand font-mono flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand" />
                  <span>Projetos & Obras Realizadas</span>
                </h4>
                <span className="text-[10px] text-text-secondary font-mono">
                  Supervisionado pelo Protocolo TARIRA
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {selectedPortfolioModal.portfolio && selectedPortfolioModal.portfolio.length > 0 ? (
                  selectedPortfolioModal.portfolio.map((item, idx) => (
                    <div
                      key={idx}
                      className="group rounded-2xl bg-background-secondary border border-border p-3.5 space-y-2.5 transition-all hover:border-brand/40 shadow-xs"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-border/50">
                        <img
                          src={item.url}
                          alt={item.caption || "Projeto"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setActivePortfolioZoom({ url: item.url, title: item.caption || `Projeto #${idx + 1}` })}
                          className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs cursor-pointer hover:bg-black/90"
                        >
                          <Eye className="w-3 h-3" /> Ampliar
                        </button>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-text-primary">
                          {item.caption || `Projeto #${idx + 1}`}
                        </h5>
                        <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                          Registo visual de projeto ou obra executada e anexada pelo profissional.
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-6 rounded-2xl bg-background-secondary/60 border border-dashed border-border text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto text-base">
                      📂
                    </div>
                    <h5 className="text-xs font-bold text-text-primary">
                      Sem fotografias de projetos anexadas
                    </h5>
                    <p className="text-xs text-text-secondary max-w-md mx-auto">
                      Este profissional ainda não anexou fotografias ou prints de obras à sua galeria de projetos.
                    </p>
                  </div>
                )}
              </div>

              {/* External Links / Repositories / Portfolios */}
              <div className="p-4 rounded-2xl bg-background-secondary border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand font-bold">
                    Presença Digital & Portfólio Externo
                  </span>
                  <p className="text-xs text-text-secondary">
                    {(selectedPortfolioModal.portfolioWebsite || (selectedPortfolioModal as any).website || (selectedPortfolioModal as any).portfolioUrl)
                      ? "Website, repositório ou portfólio externo fornecido pelo profissional."
                      : "Nenhum website ou portfólio externo fornecido pelo profissional."}
                  </p>
                </div>
                {(selectedPortfolioModal.portfolioWebsite || (selectedPortfolioModal as any).website || (selectedPortfolioModal as any).portfolioUrl) ? (
                  <a
                    href={selectedPortfolioModal.portfolioWebsite || (selectedPortfolioModal as any).website || (selectedPortfolioModal as any).portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-background hover:bg-border text-brand text-xs font-bold border border-border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-brand" />
                    <span>Visitar Portfólio Externo</span>
                  </a>
                ) : (
                  <span className="text-[11px] font-mono text-text-secondary bg-background px-3 py-1.5 rounded-xl border border-border">
                    Sem link externo
                  </span>
                )}
              </div>

              {/* Verified Documents & Certificates */}
              {selectedPortfolioModal.documents && selectedPortfolioModal.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand font-mono">
                    Documentos & Certificações Homologadas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPortfolioModal.documents.map((doc, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-background-secondary border border-border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-status-success shrink-0" />
                          <span className="truncate font-medium text-text-primary">{doc.title}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-status-success/10 text-status-success font-bold uppercase shrink-0">
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedPortfolioModal(null)}
                className="px-4 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-text-secondary text-xs font-bold border border-border transition-colors cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedPortfolioModal;
                    setSelectedPortfolioModal(null);
                    setSelectedProfileModal(c);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-brand text-xs font-bold border border-border transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-brand" />
                  <span>Ver Dossiê Completo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const c = selectedPortfolioModal;
                    setSelectedPortfolioModal(null);
                    handleRecruitClick(c);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#172554] hover:brightness-110 text-white border border-[#172554] hover:border-[#172554] text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5 text-white" />
                  <span>Recrutar Especialista</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Image Zoom Lightbox */}
      {activePortfolioZoom && (
        <div 
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActivePortfolioZoom(null)}
        >
          <div 
            className="bg-background border border-border rounded-3xl max-w-2xl w-full p-4 space-y-3 shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-text-primary">{activePortfolioZoom.title}</h4>
              <button
                type="button"
                onClick={() => setActivePortfolioZoom(null)}
                className="p-1 rounded-full bg-background-secondary hover:bg-border text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
              <img src={activePortfolioZoom.url} alt={activePortfolioZoom.title} className="w-full h-full object-contain" />
            </div>
            {activePortfolioZoom.caption && (
              <p className="text-xs text-text-secondary">{activePortfolioZoom.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* 6. Role Gate Modal (Explains Access Hierarchy between Guest vs Lar vs Prestador vs Empresa vs Condomínio) */}
      {isRoleGateModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm overflow-y-auto p-3 sm:p-6"
          onClick={() => setIsRoleGateModalOpen(false)}
        >
          <div className="min-h-full flex items-center justify-center py-16 sm:py-20 pointer-events-none">
            <div 
              data-modal-scroll
              className="pointer-events-auto relative bg-background border border-border rounded-3xl max-w-xl w-full max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-left text-text-primary animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
            
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xl font-bold">
                  {roleGateExplanationType === "prestador" ? "👤" : roleGateExplanationType === "lar" ? "🏠" : "🏢"}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-text-primary">
                    {roleGateExplanationType === "guest" 
                      ? "Acesso a Dossiês & Recrutamento" 
                      : roleGateExplanationType === "lar"
                      ? "Dossiê Exclusivo B2B & Condomínio"
                      : "Dossiê Reservado a Empresas"}
                  </h3>
                  <p className="text-xs text-brand font-mono">
                    {roleGateExplanationType === "guest"
                      ? "Requer Conta Empresa ou Condomínio"
                      : roleGateExplanationType === "lar"
                      ? "Perfil Residencial / Lar Ativo"
                      : "Gestão no Perfil Profissional Próprio"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRoleGateModalOpen(false)}
                className="p-1 rounded-full bg-background-secondary hover:bg-border text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
              {roleGateExplanationType === "guest" ? (
                <p>
                  Para visualizar o <strong>Perfil Detalhado</strong>, consultar o <strong>Portfólio de Obras</strong> ou <strong>Recrutar</strong> especialistas e quadros da TARIRA Recruit, é necessário possuir uma <strong>Conta Empresa (B2B)</strong>, <strong>Condomínio</strong> ou conta com <strong>domínio corporativo</strong>. Outras entidades que precisem de aceder aos perfis e portfólios devem criar conta connosco.
                </p>
              ) : roleGateExplanationType === "lar" ? (
                <p>
                  A sua conta atual está configurada como <strong>Perfil Particular (Lar)</strong>, vocacionada para a contratação ágil de <strong>Técnicos & Ofícios</strong> residenciais (TARIRA Connect). Os dossiês de quadros executivos e recrutamento corporativo são exclusivos para empresas e condomínios.
                </p>
              ) : (
                <p>
                  Enquanto técnico de campo ou profissional registado, o seu acesso na plataforma é dedicado exclusivamente à consulta e gestão do seu <strong>próprio perfil</strong>, histórico de obras e certificações. A visualização detalhada de dossiês e o recrutamento são reservados a empresas contratantes.
                </p>
              )}

              {/* Access Architecture Matrix */}
              <div className="p-4 rounded-2xl bg-background-secondary border border-border space-y-3">
                <div className="text-[11px] font-mono font-bold text-brand uppercase">
                  Estrutura de Acesso da Plataforma TARIRA:
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base">🏢</span>
                    <div>
                      <strong className="text-text-primary">Perfil Empresa (B2B) / Domínio Corporativo:</strong>
                      <p className="text-[11px] text-text-secondary">
                        Acesso total aos técnicos de campo da <strong>TARIRA Connect</strong> e talentos executivos com portfólio completo da <strong>TARIRA Recruit</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-base">🏛️</span>
                    <div>
                      <strong className="text-text-primary">Perfil Condomínio:</strong>
                      <p className="text-[11px] text-text-secondary">
                        Acesso total para gestão de manutenção predial, áreas comuns e contratação de quadros técnicos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-base">👤</span>
                    <div>
                      <strong className="text-text-primary">Perfil Profissional / Técnico de Campo:</strong>
                      <p className="text-[11px] text-text-secondary">
                        Gestão exclusiva do seu perfil profissional, disponibilidade, certificados e histórico de intervenções.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-base">🏠</span>
                    <div>
                      <strong className="text-brand">Perfil Particular (Lar):</strong>
                      <p className="text-[11px] text-text-secondary">
                        Direcionado para a contratação ágil de <strong>Técnicos e Ofícios</strong> para residências familiares (Connect).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {roleGateCandidate && (
                <div className="p-3 rounded-xl bg-background border border-border flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background-secondary border border-border overflow-hidden shrink-0">
                      {roleGateCandidate.photo ? (
                        <img src={roleGateCandidate.photo} alt={roleGateCandidate.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand font-bold">{roleGateCandidate.name[0]}</div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary">{roleGateCandidate.name} {roleGateCandidate.surname}</p>
                      <p className="text-[10px] text-brand font-mono">{roleGateCandidate.title || roleGateCandidate.subCategory}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20 font-bold">
                    Recruit B2B
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsRoleGateModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-text-secondary text-xs font-bold border border-border transition-colors cursor-pointer"
              >
                Voltar à Galeria
              </button>

              {roleGateExplanationType === "prestador" ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleGateModalOpen(false);
                    setActiveTab("professional_profile");
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold uppercase tracking-wider transition-all border border-[#172554] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>👤 Ir para o Meu Perfil Pessoal →</span>
                </button>
              ) : roleGateExplanationType === "lar" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRoleGateModalOpen(false);
                      if (onSwitchToConnect) {
                        onSwitchToConnect();
                      } else {
                        setActiveTab("client_find");
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-brand text-xs font-bold transition-all border border-border flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>⚡ Ver Técnicos de Campo (Connect)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRoleGateModalOpen(false);
                      if (onOpenRegisterModal) {
                        onOpenRegisterModal("company");
                      } else {
                        setActiveTab("spontaneous_apply");
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold uppercase tracking-wider transition-all border border-[#172554] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>🏢 Criar Conta Empresa (B2B)</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRoleGateModalOpen(false);
                      if (onOpenRegisterModal) {
                        onOpenRegisterModal("company");
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-[#172554] text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
                  >
                    Já tenho conta • Iniciar Sessão
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRoleGateModalOpen(false);
                      if (onOpenRegisterModal) {
                        onOpenRegisterModal("company");
                      } else {
                        setActiveTab("spontaneous_apply");
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold uppercase tracking-wider transition-all border border-[#172554] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>🏢 Criar Conta Empresa (B2B)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 6. Hire / Interview Request Modal (Using Universal HireProcessModal) */}
      {isHireModalOpen && hireTargetCandidate && (
        <HireProcessModal
          isOpen={isHireModalOpen}
          selectedProfessional={hireTargetCandidate}
          isTechnicianCandidate={false}
          onClose={() => {
            setIsHireModalOpen(false);
            setHireTargetCandidate(null);
          }}
          onHireSuccess={() => {
            setIsHireModalOpen(false);
            setHireTargetCandidate(null);
          }}
        />
      )}

    </div>
  );
};
