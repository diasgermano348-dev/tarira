import React, { useState, useMemo, useEffect } from "react";
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
  ShieldCheck, 
  ArrowRight,
  Eye,
  Calendar,
  Check,
  PhoneCall,
  Zap,
  Wrench,
  Clock,
  Car,
  AlertTriangle,
  Award,
  Star,
  Layers,
  FileCheck,
  Phone,
  MessageSquare,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserPlus
} from "lucide-react";
import { Candidate } from "./types";
import { SERVICES } from "./data";
import { VerticalOrbitBadge, TypewriterPromise } from "./TariraVisualEffects";

interface TariraTechniciansDirectoryProps {
  candidates: Candidate[];
  setActiveTab: (tab: string) => void;
  onGoBack?: () => void;
  onSelectCandidate?: (candidate: Candidate) => void;
  onViewCandidate?: (candidate: Candidate) => void;
  onRequestBriefing?: () => void;
  onContactCommercial?: () => void;
  checkAccess?: (action: string) => boolean;
  currentLang?: "pt" | "en";
  initialCategory?: string;
  userRole?: "admin" | "empresa" | "condominio" | "lar" | "prestador" | "guest";
  onOpenRegisterModal?: (role?: "lar" | "company" | "provider") => void;
  onSwitchRoleTest?: (role: "admin" | "empresa" | "condominio" | "lar" | "prestador" | "guest") => void;
}

// Canonical 8 Service Categories matching the 35 Structured Services of TARIRA Connect
export const TECHNICIAN_CATEGORIES = [
  { 
    id: "all", 
    alias: ["all", "tech_trades", "elite_hub"],
    label: "Todos os Ofícios & Técnicos", 
    icon: "🌐",
    description: "Catálogo unificado de técnicos de campo, artífices e apoio ao lar homologados pela TARIRA Connect",
    services: []
  },
  { 
    id: "domesticos", 
    alias: ["dom", "domesticos", "servicos_domesticos", "babas", "dom2", "cuidados", "baba"],
    label: "Serviços Domésticos", 
    icon: "🧹",
    description: "Empregadas domésticas, babás, cozinheiros, passadeiras, cuidadores de idosos e gestão integrada do lar",
    services: [
      "Empregada doméstica (diarista ou mensal)",
      "Cozinheiro(a) doméstico(a)",
      "Passadeira / engomadoria ao domicílio",
      "Lavandaria ao domicílio",
      "Motorista particular",
      "Segurança doméstica / guarda-costas residencial",
      "Cuidador(a) de idosos",
      "Babá / ama para crianças",
      "Ama especializada em recém-nascidos",
      "Explicador / apoio escolar (ATL)",
      "Cuidador(a) de pessoas com necessidades especiais",
      "Governanta doméstica"
    ]
  },
  { 
    id: "limpeza", 
    alias: ["limp", "limpeza", "limpeza_especializada", "limpeza_higienizacao", "limpeza_tecnica"],
    label: "Limpeza Especializada", 
    icon: "✨",
    description: "Limpeza pós-obra, escritórios, estofos, fossas sépticas, vidros, desinfestação e caixas de água",
    services: [
      "Limpeza pós-obra",
      "Limpeza de escritórios e espaços comerciais",
      "Limpeza de estofos, sofás e tapetes",
      "Limpeza de fossas sépticas e tanques",
      "Limpeza de vidros e fachadas",
      "Desinfestação (baratas, ratos, térmitas)",
      "Limpeza e desinfeção de caixas de água"
    ]
  },
  { 
    id: "manutencao", 
    alias: ["man", "manutencao", "manutencao_reparacoes", "canal", "avac", "mec", "elet", "eletricidade", "eletricistas", "solar"],
    label: "Manutenção & Reparações", 
    icon: "🔧",
    description: "Eletricistas, canalizadores, climatização AC, eletrodomésticos, geradores, caixilharia e portões automáticos",
    services: [
      "Eletricista residencial e industrial",
      "Canalizador / picheleiro",
      "Técnico de climatização (ar condicionado)",
      "Técnico de eletrodomésticos",
      "Técnico de geradores",
      "Montador de Caixilharia de Alumínio (portas e janelas)",
      "Serralheiro",
      "Técnico de portões automáticos e motorização"
    ]
  },
  { 
    id: "carpintaria", 
    alias: ["carp", "carpintaria", "carpintaria_marcenaria"],
    label: "Carpintaria & Marcenaria", 
    icon: "🪚",
    description: "Mobiliário sob medida, acabamentos em madeira, restauro, pavimentos laminados e estruturas de madeira",
    services: [
      "Carpinteiro de mobiliário sob medida",
      "Marceneiro de acabamentos (portas, roupeiros, cozinhas)",
      "Restauro de móveis antigos",
      "Instalação de pavimentos em madeira/laminado",
      "Construção de estruturas em madeira (telhados, pérgolas, decks)"
    ]
  },
  { 
    id: "construcao", 
    alias: ["obra", "construcao", "construcao_obras", "pint", "pintura"],
    label: "Construção & Obras", 
    icon: "🧱",
    description: "Pedreiros, pintores, ladrilhadores, gesseiros, soldadores, empreiteiros e impermeabilização",
    services: [
      "Pedreiro / construtor civil",
      "Pintor de interiores e exteriores",
      "Ladrilhador (colocação de azulejos e cerâmica)",
      "Gesseiro / estucador",
      "Soldador e estruturas metálicas",
      "Empreiteiro (pequenas e médias obras)",
      "Técnico de impermeabilização de telhados e lajes"
    ]
  },
  { 
    id: "jardinagem", 
    alias: ["jard", "jardinagem", "jardinagem_exteriores"],
    label: "Jardinagem & Exteriores", 
    icon: "🌿",
    description: "Jardineiros, poda de árvores, rega automática, limpeza de quintais e terrenos, muros e piscinas",
    services: [
      "Jardineiro / paisagismo",
      "Poda e corte de árvores",
      "Instalação de rega automática",
      "Limpeza de quintais e terrenos",
      "Construção de muros e vedações",
      "Manutenção de piscinas (piscineiro)"
    ]
  },
  { 
    id: "tech", 
    alias: ["tech", "elite_tech", "cctv", "seguranca", "internet"],
    label: "Elite Tech", 
    icon: "⚡",
    description: "Instalação técnica de câmaras CCTV, antenas parabólicas DSTV/GOtv e redes de Internet Wi-Fi/dados",
    services: [
      "Montador de Câmaras de Segurança (CCTV)",
      "Instalador de Antenas Parabólicas (DSTV, GOtv)",
      "Instalador de Internet (Wi-Fi / Dados)"
    ]
  }
];

// Helper to normalize strings for accent-insensitive, case-insensitive, robust multi-token search
const normalizeText = (str: string = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const TECHNICIAN_SEARCH_SUGGESTIONS = [
  "Eletricista",
  "Canalizador",
  "Climatização",
  "Pintor",
  "Pedreiro",
  "Jardinagem",
  "Carpintaria",
  "Geradores",
  "Limpeza",
  "Babá",
  "Cozinheira",
  "CCTV",
  "Polana",
  "Matola",
  "Khongolote",
  "Zimpeto",
  "Costa do Sol",
  "Triunfo"
];

// Fallback seed technicians covering 100% of the 8 trade categories with high credibility
export const FALLBACK_SEED_TECHNICIANS: Candidate[] = [
  {
    id: "mockup-tech-01",
    name: "Mateus",
    surname: "Bila",
    title: "Mestre Eletricista & Técnico Solar Certificado",
    category: "elet",
    subCategory: "Eletricistas & Energia ⚡",
    city: "Maputo & Matola (Raio 40 km)",
    residence: "Bairro do Jardim, Maputo",
    email: "mateus.bila@tarira.connect.mz",
    phone: "+258 84 392 1084",
    whatsapp: "+258 84 392 1084",
    photo: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400",
    promiseScore: 99,
    rating: 4.95,
    completedJobs: 148,
    experienceYears: 8,
    rate: 25,
    rateMzn: 1800,
    availableNow: true,
    availableForEmergency: true,
    emergencyRate: 2500,
    ownTransport: true,
    travelRadius: 40,
    bio: "Profissional credenciado com mais de 8 anos de experiência prática em dimensionamento e montagem de sistemas solares fotovoltaicos, quadros elétricos trifásicos e manutenção preventiva industrial e residencial.",
    whyWork: "O meu compromisso é a entrega rigorosa no prazo, segurança máxima conforme as normas elétricas de Moçambique e garantia de 12 meses em todas as instalações.",
    skills: [
      "Instalação Fotovoltaica Off-Grid & Grid-Tie",
      "Quadros Elétricos Trifásicos",
      "Diagnóstico com Câmara Termográfica",
      "Cercas Elétricas & Videovigilância CCTV",
      "Piquete de Emergência 24/7"
    ],
    personalValues: ["Segurança Rigorosa", "Pontualidade Absoluta", "Garantia Escrita"],
    documents: [
      { type: "cv", title: "Currículo Técnico Homologado (PDF)", issuer: "Central TARIRA", status: "verified" },
      { type: "cert", title: "Certificado de Técnico Eletricista Nível V (IFPELAC)", issuer: "IFPELAC Moçambique", expiry: "2028", status: "verified" },
      { type: "cert", title: "Instalações Solares Fotovoltaicas Avançadas", issuer: "Solar Academy Maputo", status: "verified" },
      { type: "police", title: "Registo Criminal Válido e Limpo", issuer: "Ministério da Justiça MZ", status: "verified" }
    ],
    portfolio: [
      { url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80", caption: "Sistema Solar 12kWp com 8 Baterias de Lítio (Triunfo, Maputo)" },
      { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80", caption: "Remodelação Integral de Quadro Geral Trifásico e Proteção Diferencial" }
    ],
    reviews: [
      { reviewer: "Eng. Armindo Cossa (Gestor de Condomínio Marés)", date: "14 Jul 2026", rating: 5.0, quality: 5, punctuality: 5, cleanliness: 5, text: "Excelente prestador! O Mateus resolveu uma avaria crítica no quadro geral do edifício em menos de 2 horas. Diagnóstico preciso e área de trabalho impecavelmente limpa." }
    ],
    matchScore: 99,
    status: "approved",
    timestamp: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "mockup-tech-02",
    name: "Celso",
    surname: "Nhantumbo",
    title: "Técnico Especialista em Hidráulica, Canalização & Eletrobombas",
    category: "man",
    subCategory: "Manutenção & Reparações 🔧",
    city: "Grande Maputo & Matola (Raio 35 km)",
    residence: "Bairro de Khongolote, Matola",
    email: "celso.nhantumbo@tarira.connect.mz",
    phone: "+258 84 551 2290",
    whatsapp: "+258 84 551 2290",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    promiseScore: 98,
    rating: 4.9,
    completedJobs: 212,
    experienceYears: 9,
    rateMzn: 1500,
    availableNow: true,
    availableForEmergency: true,
    emergencyRate: 2200,
    ownTransport: true,
    travelRadius: 35,
    bio: "Mestre canalizador com 9 anos de experiência em redes de água quente/fria, substituição de tubagens em PPR e multicamada, pressurizadores, eletrobombas de poço e desentupimentos mecanizados.",
    whyWork: "Diagnóstico rigoroso sem quebra desnecessária de paredes através de equipamentos de escuta acústica e garantia em cada junção soldada.",
    skills: ["Termofusão PPR & Soldadura Cobre", "Bombas Submersíveis & Pressurizadores", "Deteção Acústica de Fugas", "Redes de Esgoto & Drenagem", "Intervenções Rápidas de Emergência"],
    documents: [
      { type: "cv", title: "Currículo e Folha de Obra (PDF)", issuer: "Central TARIRA", status: "verified" },
      { type: "cert", title: "Certificado de Redes Hídricas Prediais", issuer: "Instituto Industrial de Maputo", status: "verified" }
    ],
    portfolio: [
      { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80", caption: "Substituição completa de prumada hidráulica em edifício de 6 andares" }
    ],
    reviews: [
      { reviewer: "Teresa Mabjaia (Proprietária em Sommerschield)", date: "08 Ago 2026", rating: 5.0, quality: 5, punctuality: 5, cleanliness: 5, text: "O Celso localizou uma fuga de água subterrânea que ninguém conseguia achar há 3 meses. Serviço limpo, rápido e muito educado." }
    ],
    matchScore: 98,
    status: "approved",
    timestamp: "2026-08-02T10:00:00.000Z"
  }
];

const CONNECT_HERO_SLIDES = [
  {
    id: "slide-elec",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1600",
    tag: "Eletricidade & Manutenção Predial",
    highlight: "Instalação, reparação de avarias e manutenção preventiva 24h"
  },
  {
    id: "slide-plumb",
    url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=1600",
    tag: "Canalização & Hidráulica Técnica",
    highlight: "Deteção de fugas, eletrobombas, esgotos e redes de água com garantia"
  },
  {
    id: "slide-hvac",
    url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=1600",
    tag: "Climatização & Refrigeração AC",
    highlight: "Manutenção preventiva, recarga de gás e montagem de splits"
  },
  {
    id: "slide-carp",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1600",
    tag: "Carpintaria, Caixilharia & Acabamentos",
    highlight: "Mobiliário sob medida, serralharia de alumínio e pinturas técnicas"
  }
];

export const TariraTechniciansDirectory: React.FC<TariraTechniciansDirectoryProps> = ({
  candidates,
  setActiveTab,
  onGoBack,
  onSelectCandidate,
  onViewCandidate,
  onRequestBriefing,
  onContactCommercial,
  checkAccess,
  currentLang = "pt",
  initialCategory = "all",
  userRole = "guest",
  onOpenRegisterModal,
  onSwitchRoleTest,
}) => {
  const [selectedTradeCategory, setSelectedTradeCategory] = useState<string>(initialCategory);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [onlyAvailableNow, setOnlyAvailableNow] = useState<boolean>(false);
  const [onlyEmergency, setOnlyEmergency] = useState<boolean>(false);
  const [onlyOwnTransport, setOnlyOwnTransport] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"rating" | "experience" | "rate_asc">("rating");
  
  // Local profile details modal state
  const [localModalCandidate, setLocalModalCandidate] = useState<Candidate | null>(null);

  // RBAC Role Gate Modal State
  const [isRoleGateModalOpen, setIsRoleGateModalOpen] = useState<boolean>(false);
  const [roleGateAction, setRoleGateAction] = useState<"perfil" | "requisitar">("perfil");
  const [roleGateCandidate, setRoleGateCandidate] = useState<Candidate | null>(null);

  // Hero slideshow state
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % CONNECT_HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const CITIES = [
    { id: "all", label: currentLang === "pt" ? "Todas as Cidades & Regiões" : "All Cities & Regions" },
    { id: "Maputo", label: "Maputo (Cidade & Bairros)" },
    { id: "Matola", label: "Matola & Machava" },
    { id: "Beira", label: "Beira (Sofala)" },
    { id: "Nampula", label: "Nampula" },
    { id: "Tete", label: "Tete" },
    { id: "Pemba", label: "Pemba (Cabo Delgado)" },
  ];

  // Get active category object
  const currentCategoryObj = useMemo(() => {
    return TECHNICIAN_CATEGORIES.find(c => 
      c.id === selectedTradeCategory || 
      (c.alias && c.alias.includes(selectedTradeCategory))
    ) || TECHNICIAN_CATEGORIES[0];
  }, [selectedTradeCategory]);

  // Dynamic specialties available for the selected category (or all 35 services if 'all')
  const availableSpecialties = useMemo(() => {
    if (selectedTradeCategory !== "all" && currentCategoryObj && currentCategoryObj.services.length > 0) {
      return currentCategoryObj.services;
    }
    // Collect all services from all categories (35 services)
    const allServices: string[] = [];
    TECHNICIAN_CATEGORIES.forEach(c => {
      if (c.services && c.services.length > 0) {
        allServices.push(...c.services);
      }
    });
    return allServices;
  }, [selectedTradeCategory, currentCategoryObj]);

  // Utiliza apenas os candidatos reais fornecidos pela plataforma. Já não recorremos
  // a perfis de exemplo/demo como reserva — se a lista estiver vazia, o ecrã mostra
  // o estado "Nenhum técnico encontrado", pronto para receber perfis reais.
  const allTechnicians = useMemo(() => {
    return candidates || [];
  }, [candidates]);

  // Filter candidate pool strictly for field technicians, trades and domestic specialists
  const filteredTechnicians = useMemo(() => {
    return allTechnicians
      .filter((c) => c.status === "approved" || !c.status || c.status === "pending")
      .filter((c) => {
        // STRICT RULE: Exclude any corporate / white-collar / office / recruit candidates
        // (Senior DEIA, Data Solution Architect, Cybersecurity, DevOps, Legal, Accounting, HR, BPO, etc.)
        // REGRA PRINCIPAL: "isProfessional" é o campo decisivo — sempre que vier
        // definido, respeitamo-lo e nunca o sobrepomos com heurísticas de texto.
        if (c.category === "recruitment" || c.category === "prof" || c.isProfessional === true) {
          return false;
        }

        const t = (c.title || "").toLowerCase();
        const b = (c.bio || "").toLowerCase();
        const s = (c.subCategory || "").toLowerCase();
        const cat = (c.category || "").toLowerCase();
        const skillsTxt = (c.skills || []).join(" ").toLowerCase();
        const fullTxt = `${t} ${b} ${s} ${cat} ${skillsTxt}`;

        // Fallback apenas para registos legados sem isProfessional definido
        // (undefined) — nunca aplicado quando isProfessional === false, para não
        // fazer desaparecer um perfil de técnico de ofício legítimo e já confirmado.
        if (c.isProfessional !== false) {
          const isOfficeCorporateKeyword = [
            "senior ai",
            "data solution",
            "data solutions",
            "architect",
            "cibersegurança",
            "cybersecurity",
            "soc analyst",
            "cloud & devops",
            "cloud architect",
            "compliance & kyc",
            "atendimento ao cliente / bpo",
            "gestão executiva & rh",
            "marketing digital",
            "software engineer",
            "full stack",
            "frontend developer",
            "backend developer",
            "advogado",
            "auditor financeiro",
            "controller financeiro"
          ].some(term => fullTxt.includes(term));

          if (isOfficeCorporateKeyword && !fullTxt.includes("eletricista") && !fullTxt.includes("canalizador") && !fullTxt.includes("carpinteiro") && !fullTxt.includes("pintor") && !fullTxt.includes("obras")) {
            return false;
          }
        }

        // City filter
        if (selectedCity !== "all") {
          const cCity = normalizeText(c.city || "");
          const cRes = normalizeText(c.residence || "");
          const targetCity = normalizeText(selectedCity);
          if (!cCity.includes(targetCity) && !cRes.includes(targetCity)) {
            return false;
          }
        }

        // Emergency filter
        if (onlyEmergency && !c.availableForEmergency) {
          return false;
        }

        // Available now filter
        if (onlyAvailableNow && !c.availableNow) {
          return false;
        }

        // Own transport filter
        if (onlyOwnTransport && !c.ownTransport) {
          return false;
        }

        // Trade Category filter based on the 8 Canonical Categories
        if (selectedTradeCategory !== "all" && selectedTradeCategory !== "tech_trades" && selectedTradeCategory !== "elite_hub") {
          // REGRA PRINCIPAL: se o campo "category" do candidato já corresponde a
          // um dos 8 ids/aliases canónicos (ex.: "limpeza_especializada",
          // "manutencao_reparacoes", "construcao_obras", "elite_tech"), essa é a
          // categoria definitiva do candidato e ele só aparece nela — nunca
          // recorremos à pesquisa de texto/palavras-chave neste caso. Isto evita
          // que uma especialidade como "Limpeza pós-obra" (contém "obra") ou
          // "caixas de água" (contém "água") faça um técnico de Limpeza aparecer
          // também em Construção & Obras ou Manutenção & Reparações.
          const resolvedCandidateCategory = TECHNICIAN_CATEGORIES.find(
            (tc) => tc.id !== "all" && (tc.id === cat || (tc.alias && tc.alias.includes(cat)))
          );

          if (resolvedCandidateCategory) {
            if (resolvedCandidateCategory.id !== currentCategoryObj.id) {
              return false;
            }
          } else if (selectedTradeCategory === "eletricistas" || selectedTradeCategory === "elet") {
            const matchesElet = fullTxt.includes("eletric") || fullTxt.includes("solar") || fullTxt.includes("energia") || fullTxt.includes("quadro") || fullTxt.includes("cctv") || fullTxt.includes("cerca");
            if (!matchesElet) return false;
          } else if (selectedTradeCategory === "manutencao" || selectedTradeCategory === "man") {
            const matchesMan = fullTxt.includes("canaliz") || fullTxt.includes("água") || fullTxt.includes("hidráulic") || fullTxt.includes("bomba") || fullTxt.includes("esgoto") || fullTxt.includes("fuga") || fullTxt.includes("avac") || fullTxt.includes("ar condicionado") || fullTxt.includes("climatiz") || fullTxt.includes("gerador") || fullTxt.includes("mecânic") || fullTxt.includes("móve");
            if (!matchesMan) return false;
          } else if (selectedTradeCategory === "carpintaria" || selectedTradeCategory === "carp") {
            const matchesCarp = fullTxt.includes("carpin") || fullTxt.includes("marcen") || fullTxt.includes("madeira") || fullTxt.includes("armário") || fullTxt.includes("cozinha") || fullTxt.includes("deck") || fullTxt.includes("afagamento");
            if (!matchesCarp) return false;
          } else if (selectedTradeCategory === "construcao" || selectedTradeCategory === "obra") {
            const matchesObra = fullTxt.includes("pedreiro") || fullTxt.includes("alvenaria") || fullTxt.includes("porcelanato") || fullTxt.includes("construção civil") || fullTxt.includes("impermeabiliz") || fullTxt.includes("pintor") || fullTxt.includes("pintura") || fullTxt.includes("pladur") || fullTxt.includes("telhado") || fullTxt.includes("empreiteiro") || fullTxt.includes("ladrilhad") || fullTxt.includes("gesseiro") || fullTxt.includes("soldador");
            if (!matchesObra) return false;
          } else if (selectedTradeCategory === "jardinagem" || selectedTradeCategory === "jard") {
            const matchesJard = fullTxt.includes("jard") || fullTxt.includes("paisag") || fullTxt.includes("rega") || fullTxt.includes("relva") || fullTxt.includes("árvore") || fullTxt.includes("piscina") || fullTxt.includes("quintal");
            if (!matchesJard) return false;
          } else if (selectedTradeCategory === "limpeza" || selectedTradeCategory === "limp") {
            const matchesLimp = fullTxt.includes("limpeza") || fullTxt.includes("pós-obra") || fullTxt.includes("higieniz") || fullTxt.includes("desinfe") || fullTxt.includes("estofado") || fullTxt.includes("vidro");
            if (!matchesLimp) return false;
          } else if (selectedTradeCategory === "domesticos" || selectedTradeCategory === "dom") {
            const matchesDom = fullTxt.includes("doméstic") || fullTxt.includes("cozinheira") || fullTxt.includes("governanta") || fullTxt.includes("arrumação") || fullTxt.includes("engomadoria") || fullTxt.includes("lar");
            if (!matchesDom) return false;
          } else if (selectedTradeCategory === "babas" || selectedTradeCategory === "dom2") {
            const matchesBabas = fullTxt.includes("babá") || fullTxt.includes("baba") || fullTxt.includes("infantil") || fullTxt.includes("criança") || fullTxt.includes("idoso") || fullTxt.includes("geriátric") || fullTxt.includes("cuidador") || fullTxt.includes("motorista");
            if (!matchesBabas) return false;
          } else if (selectedTradeCategory === "tech" || selectedTradeCategory === "elite_tech") {
            // Categoria "Elite Tech" não tinha nenhum ramo de filtragem — por isso
            // mostrava TODOS os técnicos sem filtrar, incluindo os de outras
            // categorias (ex.: Limpeza). Agora filtra corretamente por CCTV,
            // antenas/DSTV e instalação de internet/redes.
            const matchesTech = fullTxt.includes("cctv") || fullTxt.includes("câmara") || fullTxt.includes("camera") || fullTxt.includes("antena") || fullTxt.includes("dstv") || fullTxt.includes("gotv") || fullTxt.includes("wifi") || fullTxt.includes("wi-fi") || fullTxt.includes("internet") || fullTxt.includes("rede");
            if (!matchesTech) return false;
          }
        }

        // Specialty filter
        if (selectedSpecialty !== "all") {
          const specNorm = normalizeText(selectedSpecialty);
          const specTerms = specNorm.split(/[\s,&/]+/).filter(t => t.length > 3);
          const matchesSpecialty = specTerms.some(term => fullTxt.includes(term));
          if (!matchesSpecialty) {
            return false;
          }
        }

        // Robust normalized multi-token search for Technicians:
        // Covers Candidate Name, Trade (Ofício), Skill (Habilidade), and Neighborhood (Bairro)
        const nameText = `${c.name || ""} ${c.surname || ""}`;
        const titleText = c.title || "";
        const subCatText = c.subCategory || "";
        const categoryText = c.category || "";
        const bioText = c.bio || "";
        const whyWorkText = c.whyWork || "";
        const skillsText = (c.skills || []).join(" ");
        const valuesText = (c.personalValues || []).join(" ");
        const cityText = c.city || "";
        const residenceText = c.residence || "";
        const addressText = c.addressZone || "";
        const docsText = (c.documents || []).map(d => `${d.title} ${d.issuer}`).join(" ");

        // Expand synonyms for trades (ofícios), skills (habilidades) and neighborhoods (bairros)
        let synonyms = "";
        const combinedText = normalizeText(`${nameText} ${titleText} ${subCatText} ${categoryText} ${skillsText} ${bioText} ${cityText} ${residenceText}`);

        // Ofício: Eletricistas / Energia Solar
        if (combinedText.includes("eletric") || combinedText.includes("solar") || combinedText.includes("energia") || combinedText.includes("inversor") || combinedText.includes("disjuntor")) {
          synonyms += " eletricista electricista solar fotovoltaica inversor gerador quadro eletrico trifasico disjuntor cablagem fusiveis cerca eletrica automacao piquete iluminacao curto-circuito";
        }

        // Ofício: Canalizadores / Hidráulica / Bombas de água
        if (combinedText.includes("canaliz") || combinedText.includes("hidraul") || combinedText.includes("bomba") || combinedText.includes("picheleiro") || combinedText.includes("agua") || combinedText.includes("fuga") || combinedText.includes("esgoto")) {
          synonyms += " canalizador canalizacao picheleiro fontanaria hidraulica agua eletrobomba bomba de agua pressurizador fuga esgoto tubagem ppr termofusao torneira autoclismo sanita ralo fossa infiltracao desentupimento";
        }

        // Ofício: Climatização / AVAC / Refrigeração
        if (combinedText.includes("climatiz") || combinedText.includes("ar condicionado") || combinedText.includes("avac") || combinedText.includes("refriger") || combinedText.includes("frio") || combinedText.includes("split")) {
          synonyms += " climatizacao climatizador ar condicionado avac refrigeracao frio split inverter gas freon r410 r32 compressor camara frigorifica ventilacao higienizacao";
        }

        // Ofício: Pintores / Revestimentos / Microcimento
        if (combinedText.includes("pint") || combinedText.includes("microcimento") || combinedText.includes("impermeabiliz") || combinedText.includes("humidade") || combinedText.includes("verniz")) {
          synonyms += " pintor pintura microcimento tinta verniz lacagem impermeabilizacao paredes fachada teto salitre lixar anti-humidade betao afagado epoxi";
        }

        // Ofício: Pedreiros / Construção / Alvenaria / Cerâmica / Pladur
        if (combinedText.includes("obra") || combinedText.includes("constru") || combinedText.includes("pedreiro") || combinedText.includes("alvenaria") || combinedText.includes("porcelanato") || combinedText.includes("ceramica") || combinedText.includes("pladur")) {
          synonyms += " pedreiro pedreiros construcao civil obras alvenaria porcelanato ceramica ladrilhador ladrilho azulejo mosaico cimento betao armado pladur drywall teto falso reboco fundacao telhado laje";
        }

        // Ofício: Jardinagem / Paisagismo / Piscinas
        if (combinedText.includes("jard") || combinedText.includes("paisag") || combinedText.includes("relva") || combinedText.includes("rega") || combinedText.includes("piscina") || combinedText.includes("arvore")) {
          synonyms += " jardineiro jardineiros jardinagem paisagismo relva rega irrigacao aspersao poda arvore plantas adubo quintal piscina tratamento de piscina";
        }

        // Ofício: Carpintaria / Marcenaria
        if (combinedText.includes("carpin") || combinedText.includes("marcen") || combinedText.includes("madeira") || combinedText.includes("armario") || combinedText.includes("soalho") || combinedText.includes("deck")) {
          synonyms += " carpinteiro marceneiro carpintaria marcenaria madeira moveis mobilia armarios cozinha roupeiro deck portas fechaduras fechadura digital soalho afagamento chanfuta umbila";
        }

        // Ofício: Mecânica / Geradores
        if (combinedText.includes("mecanic") || combinedText.includes("gerador") || combinedText.includes("diesel") || combinedText.includes("qta") || combinedText.includes("perkins")) {
          synonyms += " mecanico mecanica gerador geradores grupo eletrogeneo motor diesel perkins cummins quadro qta combustivel manutencao de geradores piquete";
        }

        // Ofício: Limpeza Profissional & Pós-Obra
        if (combinedText.includes("limp") || combinedText.includes("pos-obra") || combinedText.includes("higieniz") || combinedText.includes("estofado") || combinedText.includes("sofa")) {
          synonyms += " limpeza diarista faxina faxineira limpadora pos-obra higienizacao estofados sofa colchao tapetes vidros fachadas desinfeccao desengorduramento escritorio sanitizacao";
        }

        // Ofício: Serviços Domésticos / Cozinheiros / Governantas
        if (combinedText.includes("domest") || combinedText.includes("cozinh") || combinedText.includes("governant") || combinedText.includes("engomad") || combinedText.includes("lar")) {
          synonyms += " domestica empregada cozinheira cozinheiro culinaria gastronomia governanta arrumacao engomadoria lavandaria gestao do lar motorista particular diarista residencial";
        }

        // Ofício: Babás / Cuidadores / Cuidados Infantis & Idosos
        if (combinedText.includes("baba") || combinedText.includes("cuid") || combinedText.includes("infantil") || combinedText.includes("crianca") || combinedText.includes("idoso") || combinedText.includes("pedagog")) {
          synonyms += " baba babá cuidadora cuidador ama infantil crianca criancas bebes berçario apoio escolar explicador pedagogico primeiros socorros idoso idosos geriatrico necessidades especiais";
        }

        // Ofício: CCTV / Antenas / Redes / Telecom / Caixilharia / Portões
        if (combinedText.includes("cctv") || combinedText.includes("camera") || combinedText.includes("antena") || combinedText.includes("dstv") || combinedText.includes("wifi") || combinedText.includes("internet") || combinedText.includes("alarme") || combinedText.includes("portao") || combinedText.includes("caixilharia") || combinedText.includes("serralh")) {
          synonyms += " cctv camera cameras de seguranca instalador antenas parabolica dstv gotv internet wifi redes cabo de rede fibra alarme interfone portao automatico caixilharia aluminio serralharia motor centurion";
        }

        // Bairros expansion:
        if (combinedText.includes("polana") || combinedText.includes("canico")) {
          synonyms += " polana polana canico bairro da polana maputo cidade";
        }
        if (combinedText.includes("matola") || combinedText.includes("machava") || combinedText.includes("fomento") || combinedText.includes("khongolote") || combinedText.includes("liberdade")) {
          synonyms += " matola machava fomento khongolote liberdade matola gare grande maputo";
        }
        if (combinedText.includes("jardim") || combinedText.includes("alto mae") || combinedText.includes("chamanculo") || combinedText.includes("malhangalene") || combinedText.includes("maxaquene") || combinedText.includes("mavalane")) {
          synonyms += " jardim bairro do jardim alto mae chamanculo malhangalene maxaquene mavalane maputo cidade";
        }
        if (combinedText.includes("triunfo") || combinedText.includes("costa do sol") || combinedText.includes("sommerschield") || combinedText.includes("albazine") || combinedText.includes("zimpeto") || combinedText.includes("marracuene")) {
          synonyms += " triunfo bairro do triunfo costa do sol sommerschield albazine zimpeto marracuene circular maputo";
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
          addressText,
          docsText,
          synonyms
        ].join(" "));

        // Multi-token search matching for query (matches candidate name, trade/ofício, skill/habilidade, or neighborhood/bairro)
        const queryTokens = normalizeText(searchQuery).split(/\s+/).filter((t) => t.length > 0);
        const matchesQuery = queryTokens.length === 0 || queryTokens.every((token) => candidateCorpus.includes(token));

        if (!matchesQuery) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") {
          return (b.rating || 4.8) - (a.rating || 4.8);
        }
        if (sortBy === "experience") {
          return (b.experienceYears || 0) - (a.experienceYears || 0);
        }
        if (sortBy === "rate_asc") {
          return (a.rateMzn || a.hourlyRate || 1500) - (b.rateMzn || b.hourlyRate || 1500);
        }
        return 0;
      });
  }, [allTechnicians, selectedTradeCategory, selectedSpecialty, selectedCity, onlyEmergency, onlyAvailableNow, onlyOwnTransport, searchQuery, sortBy]);

  const [internalRole, setInternalRole] = useState<typeof userRole | null>(null);
  const effectiveUserRole = internalRole || userRole || "guest";
  const isGuest = !effectiveUserRole || effectiveUserRole === "guest";
  const isLar = effectiveUserRole === "lar";
  const isB2B = effectiveUserRole === "empresa" || effectiveUserRole === "condominio";
  const isAdmin = effectiveUserRole === "admin";
  const isPrestador = effectiveUserRole === "prestador";

  // RBAC Access Matrix: Authenticated clients (Lar/Particular, Empresa, Condomínio, Admin) have access!
  const hasAccountAccess = isLar || isB2B || isAdmin;

  const handleOpenTechnician = (tech: Candidate) => {
    if (hasAccountAccess || isPrestador) {
      // IMPORTANTE: usar sempre o modal PRÓPRIO deste diretório (Tarira Connect),
      // que só mostra info de serviço/técnico — nunca o "onViewCandidate" partilhado,
      // que aponta para o estado global "viewCandidateModal" usado pelo Recruit
      // (Talentos e Quadros, com abas de Portfólio/Recrutar). Encaminhar para lá
      // fazia o popup não abrir aqui (o modal do Recruit só é renderizado dentro do
      // separador "recruit_sub") e, por vezes, acabava a abrir mais tarde no
      // separador errado, com abas que não pertencem à Tarira Connect.
      setLocalModalCandidate(tech);
    } else {
      // Guest: must create account to view full verified contacts & details
      setRoleGateCandidate(tech);
      setRoleGateAction("perfil");
      setIsRoleGateModalOpen(true);
    }
  };

  const handleHireTechnician = (tech: Candidate) => {
    if (hasAccountAccess) {
      if (onSelectCandidate) {
        onSelectCandidate(tech);
      } else if (setActiveTab) {
        setActiveTab("services");
      }
    } else {
      // Guest: must create account to requisition technicians with TARIRA escrow guarantee
      setRoleGateCandidate(tech);
      setRoleGateAction("requisitar");
      setIsRoleGateModalOpen(true);
    }
  };

  const currentSlide = CONNECT_HERO_SLIDES[heroSlideIndex] || CONNECT_HERO_SLIDES[0];

  return (
    <div id="s-tecnicos-directory" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-[#172554] bg-white">
      
      {/* 1. Header Navigation Bar / Breadcrumb */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
        <button 
          id="btn-tecnicos-go-back"
          onClick={() => onGoBack ? onGoBack() : setActiveTab("landing")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#172554] text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Voltar ao Catálogo"
        >
          <ArrowLeft className="w-4 h-4 text-[#172554]" />
          <span>← Voltar ao Catálogo de Serviços</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            id="btn-switch-to-recruitment"
            onClick={() => setActiveTab("profissionais")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#172554] border border-[#172554] text-white text-xs font-bold hover:bg-[#1A3478] transition-all cursor-pointer shadow-xs"
          >
            <span>💼 Ir para Talentos & Quadros (Recruit) →</span>
          </button>
        </div>
      </div>

      {/* 2. Page Header Hero Showcase - Dynamic High-Impact Visual Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-6 shadow-2xl border border-blue-950/40 text-white group">
        {/* Dynamic Background Image with Smooth Crossfade & Optical Navy Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentSlide.url}
            alt={currentSlide.tag}
            className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 ease-out"
            key={currentSlide.id}
          />
          {/* Deep Navy High-Contrast Scrim Layer for perfect legibility with softened opacity */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070e22]/75 via-[#172554]/70 to-[#071330]/70 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.18),transparent_60%)]" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
          {/* Top Row: Kicker & Quick Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                TARIRA CONNECT · TÉCNICOS DE CAMPO & OFÍCIOS
              </div>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-blue-500/25 border border-blue-400/30 text-blue-200 text-xs font-medium backdrop-blur-xs">
                {currentSlide.tag}
              </span>
            </div>

            {/* Slide Navigation Indicator Pills */}
            <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <span className="text-[10px] font-mono text-blue-200 mr-1 uppercase">Galeria:</span>
              {CONNECT_HERO_SLIDES.map((s, idx) => (
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

          {/* Main Title & Typewriter Hook */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 text-left space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-bold tracking-tight leading-tight">
                Técnicos de Campo &{" "}
                <TypewriterPromise
                  phrases={[
                    "Eletricistas Certificados",
                    "Canalizadores de Piquete 24h",
                    "Técnicos de Climatização AC",
                    "Apoio ao Lar & Domésticos",
                    "Carpinteiros & Serralheiros"
                  ]}
                  typingSpeed={85}
                  deletingSpeed={45}
                  pauseDelay={2200}
                  className="text-blue-300 drop-shadow-[0_2px_12px_rgba(37,99,235,0.5)] font-serif"
                />
              </h1>

              <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed font-normal">
                Conectamos a sua residência, condomínio ou empresa aos melhores prestadores homologados de Moçambique. 
                {currentSlide.highlight ? ` ${currentSlide.highlight}.` : ""} Garantia de 30 dias com custódia segura escrow.
              </p>

              {/* Real-Time Live Ticker & Trust Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono backdrop-blur-sm shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-bold text-emerald-300">Piquete Ativo:</span>
                  <span className="text-[11px] text-blue-100">Despacho médio em até 45 min</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  <span className="text-[11px] text-blue-100">Garantia 30 Dias Certificada</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5 text-blue-300 fill-blue-300" />
                  <span className="text-[11px] text-blue-100">4.9/5 em 2.450+ Avaliações</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Orbit Badge & Quick Action Buttons */}
            <div className="lg:col-span-4 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4">
              <div className="hidden sm:block">
                <VerticalOrbitBadge text="CONNECT" subtext="24/7 SLA" size="md" variant="glass" />
              </div>

              <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                <button 
                  id="btn-request-urgent-piquete"
                  onClick={() => {
                    setOnlyEmergency(true);
                    setSelectedTradeCategory("all");
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#172554] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <Zap className="w-4 h-4 text-white animate-pulse" />
                  <span>Piquete Urgente 24 Horas</span>
                </button>
                <button 
                  id="btn-request-team-briefing"
                  onClick={() => onRequestBriefing ? onRequestBriefing() : setActiveTab("briefing")}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#172554] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <FileCheck className="w-4 h-4 text-[#172554]" />
                  <span>📋 Solicitar Equipa ou Projeto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Integrated RBAC Status & Simulation Test Bar */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-blue-300 font-mono text-[11px] font-bold">Estado de Acesso RBAC:</span>
              {isAdmin && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-200 font-bold text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administrador: Acesso Total
                </span>
              )}
              {isB2B && !isAdmin && (
                <span className="px-2.5 py-1 rounded-full bg-blue-500/30 border border-blue-400 text-blue-200 font-bold text-[11px] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Conta {effectiveUserRole === "empresa" ? "Empresa" : "Condomínio"}: Acesso B2B Ativo
                </span>
              )}
              {isLar && (
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 border border-indigo-400 text-indigo-200 font-bold text-[11px] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> Conta Particular (Lar): Acesso Total a Técnicos
                </span>
              )}
              {isPrestador && (
                <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-blue-100 font-bold text-[11px] flex items-center gap-1.5 backdrop-blur-md">
                  <Wrench className="w-3.5 h-3.5 text-blue-200" /> Prestador Homologado
                </span>
              )}
              {isGuest && (
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-white font-semibold text-[11px] flex items-center gap-1.5 backdrop-blur-md shadow-xs">
                  <Users className="w-3.5 h-3.5 text-blue-200" /> Visitante: Consulta Livre • Criar Conta para Requisitar
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-blue-200/80">Simular Papel:</span>
              <button
                type="button"
                onClick={() => {
                  setInternalRole("guest");
                  if (onSwitchRoleTest) onSwitchRoleTest("guest");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isGuest ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular visitante sem conta (Guest)"
              >
                Visitante
              </button>
              <button
                type="button"
                onClick={() => {
                  setInternalRole("lar");
                  if (onSwitchRoleTest) onSwitchRoleTest("lar");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isLar ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular cliente particular com conta (Lar)"
              >
                Lar (Particular)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInternalRole("empresa");
                  if (onSwitchRoleTest) onSwitchRoleTest("empresa");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  effectiveUserRole === "empresa" ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular conta Empresa B2B"
              >
                Empresa
              </button>
              <button
                type="button"
                onClick={() => {
                  setInternalRole("condominio");
                  if (onSwitchRoleTest) onSwitchRoleTest("condominio");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  effectiveUserRole === "condominio" ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular conta Condomínio"
              >
                Condomínio
              </button>
              <button
                type="button"
                onClick={() => {
                  setInternalRole("prestador");
                  if (onSwitchRoleTest) onSwitchRoleTest("prestador");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isPrestador ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular prestador / técnico homologado"
              >
                Prestador
              </button>
              <button
                type="button"
                onClick={() => {
                  setInternalRole("admin");
                  if (onSwitchRoleTest) onSwitchRoleTest("admin");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isAdmin ? "bg-white text-[#172554] shadow-xs" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Simular Administrador"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div id="candidate-search-section" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-6 shadow-xs space-y-4 text-left text-[#172554]">
        
        {/* Row 1: Search and dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#172554]" />
            <input 
              id="input-search-technicians"
              type="text"
              placeholder="Pesquisar por nome, ofício, habilidade ou bairro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-[#172554] placeholder:text-slate-400 text-xs font-medium focus:border-[#172554] focus:outline-hidden transition-all shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#172554]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Specialty Filter Dropdown (matching 35 structured services) */}
          <div className="md:col-span-4">
            <select
              id="select-specialty-filter"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-[#172554] text-xs font-medium focus:border-[#172554] focus:outline-hidden transition-all cursor-pointer shadow-xs"
            >
              <option value="all">⭐ Todos os 35 Serviços Estruturados</option>
              {availableSpecialties.map((spec, i) => (
                <option key={i} value={spec} className="text-[#172554]">
                  • {spec}
                </option>
              ))}
            </select>
          </div>

          {/* City select */}
          <div className="md:col-span-2">
            <select
              id="select-city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-[#172554] text-xs font-medium focus:border-[#172554] focus:outline-hidden transition-all cursor-pointer shadow-xs"
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id} className="text-[#172554]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By select */}
          <div className="md:col-span-2">
            <select
              id="select-sort-technicians"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-[#172554] text-xs font-medium focus:border-[#172554] focus:outline-hidden transition-all cursor-pointer shadow-xs"
            >
              <option value="rating" className="text-[#172554]">⭐ Melhor Avaliados</option>
              <option value="experience" className="text-[#172554]">🏆 Mais Experientes</option>
              <option value="rate_asc" className="text-[#172554]">💰 Menor Tarifa/Hora</option>
            </select>
          </div>
        </div>

        {/* Quick Suggestion Pills for Technicians */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="text-[11px] text-[#3B5998] font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#172554]" />
            {currentLang === "pt" ? "Sugestões de busca:" : "Quick suggestions:"}
          </span>
          {TECHNICIAN_SEARCH_SUGGESTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(tag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? "bg-[#172554] text-white border-[#172554] font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:text-[#172554]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Active Search Feedback */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#172554]">
            <div className="flex items-center gap-2 text-[#172554]">
              <Search className="w-3.5 h-3.5 text-[#172554] shrink-0" />
              <span>
                {currentLang === "pt"
                  ? `A pesquisar por "${searchQuery}" em nomes de candidatos, ofícios, habilidades e bairros (${filteredTechnicians.length} ${filteredTechnicians.length === 1 ? "técnico encontrado" : "técnicos encontrados"})`
                  : `Searching for "${searchQuery}" in candidate names, trades, skills and neighborhoods (${filteredTechnicians.length} found)`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[#172554] hover:text-blue-700 font-bold text-xs underline cursor-pointer"
            >
              {currentLang === "pt" ? "Limpar pesquisa ✕" : "Clear ✕"}
            </button>
          </div>
        )}

        {/* Row 2: 8 Service Category Navigation Tabs */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#172554] font-black font-mono">
              Categorias de Serviços de Campo (TARIRA Connect)
            </span>
            <span className="text-[11px] text-[#3B5998] font-medium">
              {filteredTechnicians.length} técnico(s) encontrado(s)
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
            {TECHNICIAN_CATEGORIES.map((cat) => {
              const isActive = selectedTradeCategory === cat.id || (cat.alias && cat.alias.includes(selectedTradeCategory));
              return (
                <button
                  key={cat.id}
                  id={`btn-cat-${cat.id}`}
                  onClick={() => {
                    setSelectedTradeCategory(cat.id);
                    setSelectedSpecialty("all");
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? "bg-[#172554] text-white border-[#172554] shadow-sm scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-[#172554] hover:!text-white hover:border-[#172554] hover:shadow-xs"
                  }`}
                >
                  <div className="text-base leading-none">{cat.icon}</div>
                  <div>{cat.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Quick filter toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyAvailableNow(!onlyAvailableNow)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                onlyAvailableNow 
                  ? "bg-blue-50 border-blue-300 text-[#172554] font-bold" 
                  : "bg-white border-slate-200 text-slate-600 hover:text-[#172554]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${onlyAvailableNow ? "bg-[#172554] animate-pulse" : "bg-slate-400"}`} />
              <span>Disponível Hoje</span>
            </button>

            <button
              onClick={() => setOnlyEmergency(!onlyEmergency)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                onlyEmergency 
                  ? "bg-slate-100 border-slate-300 text-[#172554] font-bold" 
                  : "bg-white border-slate-200 text-slate-600 hover:text-[#172554]"
              }`}
            >
              <Zap className="w-3 h-3 text-[#172554]" />
              <span>Piquete Urgente</span>
            </button>

            <button
              onClick={() => setOnlyOwnTransport(!onlyOwnTransport)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                onlyOwnTransport 
                  ? "bg-blue-50 border-blue-300 text-[#172554] font-bold" 
                  : "bg-white border-slate-200 text-slate-600 hover:text-[#172554]"
              }`}
            >
              <Car className="w-3 h-3 text-[#172554]" />
              <span>Transporte Próprio</span>
            </button>
          </div>

          {(searchQuery || selectedTradeCategory !== "all" || selectedSpecialty !== "all" || selectedCity !== "all" || onlyAvailableNow || onlyEmergency || onlyOwnTransport) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTradeCategory("all");
                setSelectedSpecialty("all");
                setSelectedCity("all");
                setOnlyAvailableNow(false);
                setOnlyEmergency(false);
                setOnlyOwnTransport(false);
              }}
              className="text-[#172554] hover:text-blue-700 underline font-semibold text-[11px] cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      </div>

      {/* 4. Active Category Context Banner */}
      {selectedTradeCategory !== "all" && currentCategoryObj && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-white rounded-xl border border-blue-200 shadow-xs">{currentCategoryObj.icon}</span>
            <div>
              <h3 className="text-sm font-bold text-[#172554]">{currentCategoryObj.label}</h3>
              <p className="text-xs text-[#3B5998]">{currentCategoryObj.description}</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedTradeCategory("all")}
            className="text-xs text-[#172554] hover:bg-slate-50 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs whitespace-nowrap cursor-pointer font-bold"
          >
            Ver todos os ofícios ✕
          </button>
        </div>
      )}

      {/* 5. Technicians Grid */}
      {filteredTechnicians.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center my-6 shadow-xs text-[#172554]">
          <Wrench className="w-12 h-12 text-[#172554]/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#172554] font-bold mb-1">Nenhum técnico encontrado com estes filtros</h3>
          <p className="text-xs text-[#3B5998] max-w-md mx-auto mb-5">
            Tente expandir a pesquisa ou redefinir a categoria de ofício para encontrar outros técnicos homologados.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTradeCategory("all");
              setSelectedSpecialty("all");
              setSelectedCity("all");
              setOnlyAvailableNow(false);
              setOnlyEmergency(false);
              setOnlyOwnTransport(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#172554] text-white text-xs font-bold hover:bg-[#1A3478] transition-all cursor-pointer shadow-sm"
          >
            Ver Todos os Técnicos de Ofício
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTechnicians.map((tech) => {
            const fullName = `${tech.name} ${tech.surname || ""}`.trim();
            const rating = tech.rating || 4.9;
            const completedJobs = tech.completedJobs || Math.floor(40 + (tech.experienceYears || 5) * 12);
            const rateMzn = tech.rateMzn || (tech.rate ? tech.rate * 60 : 1500);
            const verifiedDocs = tech.documents ? tech.documents.filter(d => d.status === "verified").length : 3;

            return (
              <div 
                key={tech.id}
                id={`card-tech-${tech.id}`}
                className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400 p-5 transition-all hover:shadow-lg flex flex-col justify-between group shadow-xs text-left text-[#172554]"
              >
                <div>
                  {/* Top row: Badges & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#172554] text-[10px] font-mono font-bold">
                      <ShieldCheck className="w-3 h-3 text-[#172554]" />
                      HOMOLOGADO TARIRA
                    </span>

                    <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 text-[#172554] text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#172554] text-[#172554]" />
                      <span>{rating.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-500">({completedJobs})</span>
                    </div>
                  </div>

                  {/* Profile Header: Photo + Name + Title */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="relative shrink-0">
                      <img 
                        src={tech.photo || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400"}
                        alt={fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 group-hover:border-blue-400 transition-all shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      {tech.availableNow && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#172554] border-2 border-white rounded-full" title="Disponível Hoje" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base font-bold text-[#172554] group-hover:text-blue-700 transition-colors truncate">
                        {fullName}
                      </h3>
                      <p className="text-xs text-[#3B5998] font-semibold line-clamp-2 mt-0.5">
                        {tech.title}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-[#172554] shrink-0" />
                        <span className="truncate">
                          {tech.residence 
                            ? `${tech.residence}${tech.city && !tech.residence.toLowerCase().includes(tech.city.toLowerCase()) ? ` · ${tech.city}` : ""}`
                            : (tech.city || "Maputo, Moçambique")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges / Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tech.availableForEmergency && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#172554] text-[10px] font-bold flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-[#172554]" /> Piquete 24h
                      </span>
                    )}
                    {tech.experienceYears && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold flex items-center gap-1">
                        <Award className="w-2.5 h-2.5 text-[#172554]" /> {tech.experienceYears} anos exp.
                      </span>
                    )}
                    {tech.ownTransport && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold flex items-center gap-1">
                        <Car className="w-2.5 h-2.5 text-slate-500" /> Viatura própria
                      </span>
                    )}
                  </div>

                  {/* Bio snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {tech.bio || "Técnico especialista com rigor de execução, credenciação técnica e garantia em todos os trabalhos realizados."}
                  </p>

                  {/* Skills tags */}
                  {tech.skills && tech.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tech.skills.slice(0, 3).map((sk, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-[#172554] text-[10px] border border-blue-200 truncate max-w-[200px] font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                      {tech.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200 text-[10px]">
                          +{tech.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer: Price + Actions */}
                <div className="border-t border-slate-100 pt-3.5 mt-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimativa Base</span>
                      <span className="text-sm font-bold text-[#172554] font-mono">
                        {rateMzn.toLocaleString()} MZN
                        <span className="text-[10px] text-slate-500 font-normal"> / intervenção</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#172554] font-medium flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3 text-[#172554]" />
                        Garantia 30 Dias
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {verifiedDocs} Docs Verificados
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`btn-view-tech-${tech.id}`}
                      onClick={() => handleOpenTechnician(tech)}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-[#172554] text-xs font-semibold border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      title={isGuest ? "Visualização do perfil técnico" : "Ver perfil completo"}
                    >
                      <Eye className="w-3.5 h-3.5 text-[#172554]" />
                      <span>Ver Perfil</span>
                    </button>

                    <button
                      id={`btn-hire-tech-${tech.id}`}
                      onClick={() => handleHireTechnician(tech)}
                      className="py-2.5 px-3 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 uppercase tracking-wider"
                      title="Requisitar intervenção do técnico"
                    >
                      <Zap className="w-3.5 h-3.5 text-blue-200 fill-blue-200" />
                      <span>Requisitar →</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 6. Guarantee & Assurance Footer */}
      <div className="mt-12 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs text-[#172554]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[#172554] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#172554] mb-1">Triagem & Homologação Rigorosa</h4>
              <p className="text-xs text-[#3B5998] leading-relaxed">
                Verificação de registo criminal, identidade biométrica, certificações técnicas e referências no terreno.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[#172554] shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#172554] mb-1">Garantia Técnica de 30 Dias</h4>
              <p className="text-xs text-[#3B5998] leading-relaxed">
                Se o serviço apresentar qualquer anomalia no prazo de 30 dias, reparamos ou substituímos sem custos adicionais.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[#172554] shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#172554] mb-1">Pagamento Seguro em Escrow</h4>
              <p className="text-xs text-[#3B5998] leading-relaxed">
                O seu pagamento (M-Pesa, E-Mola ou Cartão) fica protegido pela TARIRA e só é libertado ao técnico após a sua validação.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Local Profile Modal (if external viewer is not triggered) */}
      {localModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto text-[#172554] shadow-2xl space-y-4 text-left">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={localModalCandidate.photo || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400"}
                  alt={localModalCandidate.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-lg text-[#172554]">{localModalCandidate.name} {localModalCandidate.surname || ""}</h3>
                  <p className="text-xs text-[#3B5998] font-semibold">{localModalCandidate.title}</p>
                  <p className="text-[11px] text-slate-500">{localModalCandidate.city || "Maputo"}</p>
                </div>
              </div>
              <button 
                onClick={() => setLocalModalCandidate(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold text-[#3B5998] mb-1">Biografia Profissional</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{localModalCandidate.bio}</p>
            </div>

            {localModalCandidate.skills && localModalCandidate.skills.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-bold text-[#3B5998] mb-1.5">Especialidades & Competências</h4>
                <div className="flex flex-wrap gap-1.5">
                  {localModalCandidate.skills.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#172554] text-xs font-medium">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {localModalCandidate.documents && localModalCandidate.documents.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-bold text-[#3B5998] mb-1.5">Documentos Homologados</h4>
                <div className="space-y-1.5">
                  {localModalCandidate.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-blue-200 text-xs">
                      <span className="text-slate-700">📄 {doc.title}</span>
                      <span className="text-[10px] text-[#172554] font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">VERIFICADO</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => setLocalModalCandidate(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const target = localModalCandidate;
                  setLocalModalCandidate(null);
                  handleHireTechnician(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {isGuest ? "Criar Conta para Requisitar" : "Requisitar Intervenção →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. RBAC Role Gate Modal for Guest Visitors */}
      {isRoleGateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-[#172554] space-y-5 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[#172554]">
                <ShieldCheck className="w-6 h-6 text-[#172554]" />
              </div>
              <button
                onClick={() => {
                  setIsRoleGateModalOpen(false);
                  setRoleGateCandidate(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                TARIRA CONNECT · ACESSO & SEGURANÇA RBAC
              </span>
              <h3 className="text-lg font-bold text-[#172554] mt-2">
                {roleGateAction === "requisitar"
                  ? "Criar Conta para Requisitar Técnico"
                  : "Criar Conta para Visualizar Perfil Completo"}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {roleGateAction === "requisitar"
                  ? "Para requisitar intervenções de técnicos homologados com garantia de 30 dias, acompanhamento operacional presencial e pagamento seguro em caução Escrow, é necessário ter uma conta de cliente (Particular ou Empresa)."
                  : "Os perfis completos de técnicos, identificação profissional, documentos e contactos diretos são exclusivos para utilizadores registados na plataforma."}
              </p>
            </div>

            {roleGateCandidate && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={roleGateCandidate.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"}
                  alt={roleGateCandidate.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#172554] truncate">{roleGateCandidate.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{roleGateCandidate.title}</p>
                  <p className="text-[10px] text-[#172554] font-medium">📍 {roleGateCandidate.city || "Maputo"}</p>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsRoleGateModalOpen(false);
                  if (onOpenRegisterModal) {
                    onOpenRegisterModal("lar");
                  } else if (setActiveTab) {
                    setActiveTab("services");
                  }
                }}
                className="w-full py-3 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta de Cliente Gratuita (Particular / Lar)</span>
              </button>

              <button
                onClick={() => {
                  setIsRoleGateModalOpen(false);
                  if (onOpenRegisterModal) {
                    onOpenRegisterModal("company");
                  } else if (setActiveTab) {
                    setActiveTab("services");
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#172554] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>Criar Conta Corporativa (Empresa / Condomínio)</span>
              </button>

              <button
                onClick={() => {
                  setIsRoleGateModalOpen(false);
                  if (onOpenRegisterModal) {
                    onOpenRegisterModal("lar");
                  }
                }}
                className="w-full py-2 text-center text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                Já tem conta? Iniciar Sessão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
