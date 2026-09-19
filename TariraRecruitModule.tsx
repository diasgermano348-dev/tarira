import React, { useState, useEffect, useMemo, useRef } from "react";
import { useBodyScrollLock } from "./useBodyScrollLock";
import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  PhoneCall, 
  Mail, 
  Building2, 
  Handshake, 
  ChevronLeft,
  BadgeCheck,
  MapPin,
  FileCheck,
  Check,
  X,
  Users,
  MessageCircle
} from "lucide-react";
import { Candidate, PartnerCompanyItem } from "./types";
import {
  ACCOUNT_MAINTENANCE_FEE_MZN,
  ACCOUNT_TRIAL_DAYS,
  ACCOUNT_BILLING_NOTE,
  ACCOUNT_BENEFITS,
  formatMzn,
  resolveMaintenanceFee,
  resolveAccountBenefits
} from "./accountPlan";
import { TariraBriefingModal } from "./TariraBriefingModal";
import { StandardRegistrationForm } from "./StandardRegistrationForm";
import { TypewriterPromise, VerticalOrbitBadge } from "./TariraVisualEffects";
import { TariraRecruitIcon } from "./TariraUnitIcons";

// Cópia local de contingência para os planos TARIRA Recruit
// Os antigos planos Starter/Business/Enterprise/Avulso foram eliminados. O
// Recruit passa a funcionar com o modelo único do ecossistema: a conta da
// empresa paga um valor fixo de manutenção pelo uso da plataforma (30 dias
// grátis) e cada colocação é faturada à parte. Ver accountPlan.ts.

interface TariraRecruitModuleProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoBack?: () => void;
  candidates: Candidate[];
  setCandidates?: (v: Candidate[] | ((prev: Candidate[]) => Candidate[])) => void;

  selectedProfessional?: Candidate | null;
  setSelectedProfessional?: (v: Candidate | null) => void;

  recruitSelectedCategory: string;
  setRecruitSelectedCategory: (v: string) => void;

  onSelectCandidateForGallery?: (candidateId: string, specialtyId?: string) => void;
  onOpenCommercialModal?: () => void;

  adminActiveSubTab?: any;
  setAdminActiveSubTab?: any;

  viewCandidateModal?: Candidate | null;
  setViewCandidateModal?: (v: Candidate | null) => void;
  portfolioCandidateModal?: Candidate | null;
  setPortfolioCandidateModal?: (v: Candidate | null) => void;

  partnerCompanies?: PartnerCompanyItem[];
  setPartnerCompanies?: (v: PartnerCompanyItem[] | ((prev: PartnerCompanyItem[]) => PartnerCompanyItem[])) => void;

  isBriefingFormOpen?: boolean;
  setIsBriefingFormOpen?: (v: boolean) => void;

  phaseExplainerModal?: any;
  setPhaseExplainerModal?: (v: any) => void;
  currentLang?: "pt" | "en";
  featuredRecruitTalentIds?: string[];
  socialLinks?: any;
}

// Banner images for TARIRA Recruit (vibrant, high resolution, optimal clarity)
const RECRUIT_BANNER_SLIDES = [
  {
    id: "slide-1",
    url: "https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Entrevista executiva e seleção de quadros de alta performance"
  },
  {
    id: "slide-2",
    url: "https://images.pexels.com/photos/5439152/pexels-photo-5439152.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Avaliação técnica de competências e alinhamento corporativo"
  },
  {
    id: "slide-3",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1920",
    alt: "Liderança e quadros de gestão executiva"
  },
  {
    id: "slide-4",
    url: "https://images.pexels.com/photos/7658405/pexels-photo-7658405.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Equipa sénior alinhada com objetivos estratégicos"
  }
];

// Available talent categories matching canonical IDs in the system
const RECRUIT_CATEGORIES = [
  { id: "financas", label: "Finanças & Auditoria", icon: "📊", desc: "Controllers, auditores e peritos fiscais" },
  { id: "callcenter", label: "Atendimento & CX", icon: "🎧", desc: "Supervisores, helpdesk e gestão de SAC" },
  { id: "cyber", label: "Cibersegurança", icon: "🛡️", desc: "Analistas SOC, pentesting e segurança da informação" },
  { id: "ai", label: "Inteligência Artificial & Dados", icon: "🤖", desc: "Engenheiros de IA, arquitetos e data scientists" },
  { id: "devops", label: "Software & Cloud", icon: "💻", desc: "Arquitetos cloud, full-stack e DevOps" },
  { id: "kyc", label: "Compliance & KYC", icon: "🏦", desc: "Gestão de risco, conformidade e auditoria regulatória" },
  { id: "exec", label: "Gestão Executiva & RH", icon: "💼", desc: "Diretores operacionais, People Ops e gestores" },
  { id: "projetos", label: "Gestão de Projetos & Eng.", icon: "📐", desc: "PMPs, scrum masters e coordenadores técnicos" },
  { id: "marketing", label: "Marketing & Comunicação", icon: "📱", desc: "Especialistas de growth, marca e canais B2B" },
  { id: "juridico", label: "Jurídico & Secretariado", icon: "⚖️", desc: "Assessores jurídicos corporativos e apoio executivo" }
];

// Helper to detect if candidate is a corporate / recruit professional (Talentos e Quadros)
export const isCorporateCandidate = (c: any): boolean => {
  if (!c) return false;
  if (c.isProfessional === false || c.isProfessional === 'false' || c.isProfessional === 0) return false;
  if (c.isProfessional === true || c.isProfessional === 'true' || c.isProfessional === 1) return true;
  const cat = String(c.category || '').toLowerCase();
  const subCat = String(c.subCategory || '').toLowerCase();
  const cId = String(c.id || '').toLowerCase();
  const tradeKeywords = [
    'limpeza', 'manutencao', 'construcao', 'carpintaria', 'jardinagem', 'eletricidade',
    'canalizacao', 'climatizacao', 'refrigeracao', 'vidro', 'caixilharia', 'pintura',
    'domestica', 'dom_', 'baba', 'chef', 'cozinheiro', 'oficio', 'tech', 'seguranca_vigilancia',
    'elec', 'canal', 'pint', 'jard', 'limp', 'man', 'obra', 'carp', 'caix', 'dom', 'dom2'
  ];
  if (tradeKeywords.some(tk => cat.includes(tk) || subCat.includes(tk))) return false;
  if (cat === 'prof' || cat === 'recruitment' || cat === 'recrutamento' || cat === 'quadros' || cat.includes('recrutamento_') || cat.includes('corporativ')) return true;
  if (subCat.includes('recrutamento') || subCat.includes('corporativ')) return true;
  if (cId.includes('prof-') || cId.includes('recruit-')) return true;
  return false;
};

export const TariraRecruitModule: React.FC<TariraRecruitModuleProps> = (props) => {
  const {
    setActiveTab,
    onGoBack,
    setRecruitSelectedCategory,
    onSelectCandidateForGallery,
    onOpenCommercialModal,
    isBriefingFormOpen,
    setIsBriefingFormOpen,
    candidates,
    featuredRecruitTalentIds,
    socialLinks
  } = props;

  // 1. Obter todos os perfis reais de "Talentos e Quadros" (ordenados cronologicamente: primeiros inscritos primeiro)
  const corporateCandidatesPool = useMemo(() => {
    return (candidates || [])
      .filter(c => {
        if (!c || !c.name) return false;
        const idStr = String(c.id || '');
        // Exclui estritamente quaisquer mockups fictícios
        if (idStr.startsWith('mockup-')) return false;
        if (!isCorporateCandidate(c)) return false;
        if (c.status === 'rejected' || c.status === 'archived') return false;
        return true;
      })
      .sort((a, b) => {
        // Os primeiros três perfis que forem se inscrever na plataforma ficam como a amostra de talentos
        const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        if (tA && tB && tA !== tB) return tA - tB;
        return String(a.id || '').localeCompare(String(b.id || ''));
      });
  }, [candidates]);

  // 2. Amostra de exatamente três perfis:
  // - Respeita os IDs configurados pelo Administrador no Painel Central (se existirem)
  // - Preenche os restantes slots até 3 com os primeiros inscritos na plataforma
  const realFeaturedTalents = useMemo(() => {
    const selected: Candidate[] = [];
    const activeFeaturedIds = Array.isArray(featuredRecruitTalentIds) && featuredRecruitTalentIds.length > 0
      ? featuredRecruitTalentIds
      : (() => {
          try {
            const cached = localStorage.getItem("tarira_featured_recruit_talents");
            return cached ? JSON.parse(cached) : [];
          } catch (e) {
            return [];
          }
        })();

    // 1º: Adiciona os perfis expressamente configurados pelo Administrador
    for (const fid of activeFeaturedIds) {
      if (selected.length >= 3) break;
      const found = corporateCandidatesPool.find(c => String(c.id) === String(fid));
      if (found && !selected.some(s => String(s.id) === String(found.id))) {
        selected.push(found);
      }
    }

    // 2º: Preenche os slots restantes até 3 com os primeiros inscritos na plataforma
    for (const c of corporateCandidatesPool) {
      if (selected.length >= 3) break;
      if (!selected.some(s => String(s.id) === String(c.id))) {
        selected.push(c);
      }
    }

    return selected.slice(0, 3).map(c => {
      const fullName = `${c.name}${c.surname ? " " + c.surname : ""}`.trim();
      const photo = (typeof c.photo === 'string' && c.photo.trim().length > 0)
        ? c.photo
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=172554&color=fff&size=200`;
      return {
        id: c.id,
        name: fullName,
        role: c.title || c.subCategory || "Profissional TARIRA",
        area: RECRUIT_CATEGORIES.find(cat => cat.id === c.category)?.label || c.category || "Talento TARIRA",
        specialtyId: c.category || "exec",
        experience: c.experienceYears ? `${c.experienceYears} anos exp.` : ((c as any).experience || ""),
        photo: photo
      };
    });
  }, [corporateCandidatesPool, featuredRecruitTalentIds]);

  // Banner carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Valor de manutenção de conta e vantagens — fonte única partilhada com o
  // registo. Carregados do servidor para refletirem edições do administrador.
  const [maintenanceFee, setMaintenanceFee] = useState<number>(ACCOUNT_MAINTENANCE_FEE_MZN);
  const [accountBenefits, setAccountBenefits] = useState<string[]>(ACCOUNT_BENEFITS);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const registrationModalOverlayRef = useRef<HTMLDivElement>(null);
  const registrationModalCardRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(isRegistrationModalOpen);
  useEffect(() => {
    if (isRegistrationModalOpen) {
      if (registrationModalOverlayRef.current) {
        registrationModalOverlayRef.current.scrollTop = 0;
      }
      if (registrationModalCardRef.current) {
        registrationModalCardRef.current.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [isRegistrationModalOpen]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/registration-plans")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && Array.isArray(data.plans) && data.plans.length > 0) {
          setMaintenanceFee(resolveMaintenanceFee(data.plans));
          setAccountBenefits(resolveAccountBenefits(data.plans));
        }
      })
      .catch((err) => console.warn("[TariraRecruitModule] Falha ao carregar valor de manutenção:", err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotate banner smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % RECRUIT_BANNER_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // Commercial / Contact routing handler
  // Opens the official central commercial proposal modal that directly registers the request
  // into the administrator panel and routes to the recruitment department
  const handleOpenCommercial = () => {
    if (onOpenCommercialModal) {
      onOpenCommercialModal();
    } else {
      setActiveTab("commercial_admin");
    }
  };

  // Navigates directly to the catalog, optionally filtering by category
  const handleNavigateToCatalog = (specialtyId?: string) => {
    if (onSelectCandidateForGallery) {
      onSelectCandidateForGallery("", specialtyId || "all");
    }
    if (specialtyId && specialtyId !== "all") {
      setRecruitSelectedCategory(specialtyId);
    } else {
      setRecruitSelectedCategory("all");
    }
    setActiveTab("profissionais");
  };

  // Navigates directly into the catalog of talents and corporate specialists
  const handleViewCandidateProfile = (_candidateId?: string, specialtyId?: string) => {
    handleNavigateToCatalog(specialtyId);
  };

  return (
    <div id="s-recruit-sub" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 text-text-primary font-sans">
      
      {/* ════════════════════════ 🧭 NAVEGAÇÃO & TOPO ════════════════════════ */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            id="btn-recruit-go-back"
            onClick={() => onGoBack ? onGoBack() : setActiveTab("landing")}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-background border border-border text-text-primary text-xs font-semibold hover:border-brand hover:text-brand transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            title="Voltar ao portal principal"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary group-hover:text-brand transition-colors" />
            <span>Voltar ao Portal</span>
          </button>

          <span className="text-text-secondary">/</span>
          <span className="text-xs text-brand font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
            <TariraRecruitIcon size={16} className="text-[#172554]" />
            <span>TARIRA Recruit</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-blue-50 text-[#172554] border border-blue-100">
            <TariraRecruitIcon size={16} className="text-[#172554]" />
          </span>
          <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
            Divisão Corporativa
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
            Staffing Executivo
          </span>
        </div>
      </header>

      {/* ════════════════════════ 1. BANNER PRINCIPAL (24-48h, ILUMINADO & DIRETO) ════════════════════════ */}
      <section className="relative rounded-3xl overflow-hidden mb-16 shadow-lg border border-border bg-brand">
        
        {/* Carrossel de Imagens de Alta Resolução com Boa Iluminação */}
        <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full overflow-hidden">
          {RECRUIT_BANNER_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
            >
              <img
                src={slide.url}
                alt={slide.alt}
                className="w-full h-full object-cover object-center filter brightness-[0.94] contrast-[1.06] saturate-[1.05]"
                referrerPolicy="no-referrer"
              />
              {/* Duotone navy suave com opacidade reduzida para ver a foto com clareza */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand/75 via-brand/45 to-transparent sm:bg-gradient-to-r sm:from-brand/80 sm:via-brand/45 sm:to-transparent" />
            </div>
          ))}

          {/* Conteúdo do Banner */}
          <div className="absolute inset-0 z-10 p-6 sm:p-12 lg:p-16 flex flex-col justify-end sm:justify-center max-w-4xl text-left">
            
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-blue-200 text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-md w-fit">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Talento Pré-Auditado</span>
              </div>
              <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-bold text-blue-300 uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                ⚡ SLA Garantido
              </span>
            </div>

            {/* Título com promessa justa e rigorosa: 24 a 48 horas com efeito typewriter contínuo e linha animada */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white font-medium tracking-tight leading-[1.12] mb-4">
              <span className="relative inline-block">
                O candidato certo, em{" "}
                <span className="text-blue-200 font-bold inline-block min-w-[240px] sm:min-w-[340px]">
                  <TypewriterPromise
                    phrases={["24 a 48 horas.", "24 - 48 Horas.", "24h - 48h."]}
                    typingSpeed={110}
                    deletingSpeed={55}
                    pauseDelay={2500}
                    cursorClassName="bg-blue-300 shadow-[0_0_10px_#60a5fa]"
                  />
                </span>
                <span className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-[4px] sm:h-[5px] bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 rounded-full animate-trace-line shadow-[0_0_12px_rgba(37,99,235,0.7)]" />
              </span>
            </h1>

            {/* Subtítulo curto (1 linha) */}
            <p className="text-base sm:text-lg text-slate-200 font-light max-w-2xl mb-8 leading-relaxed">
              Talento qualificado, auditado e pronto a integrar a sua empresa com validação célere e rigorosa em Moçambique.
            </p>

            {/* Ações do Banner: CTA Principal "Talentos e Quadros" + Secundário Comercial Oficial */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                id="btn-recruit-banner-talentos"
                onClick={() => handleNavigateToCatalog()}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-brand-light/25 cursor-pointer active:scale-[0.98]"
              >
                <span>Talentos e Quadros</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                id="btn-recruit-banner-falar"
                onClick={handleOpenCommercial}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold transition-all cursor-pointer backdrop-blur-md active:scale-[0.98]"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-300" />
                <span>Falar com a Equipa Recruit</span>
              </button>
            </div>
          </div>

          {/* Destaque Vertical Flutuante com Linha Orbitante Giratória (Canto Superior Direito) */}
          <div className="hidden lg:flex absolute top-8 right-8 z-20 flex-col items-center gap-3">
            <VerticalOrbitBadge text="24•48•H" subtext="SLA" size="md" variant="glass" />
          </div>

          {/* Controles discretos de Slide */}
          <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + RECRUIT_BANNER_SLIDES.length) % RECRUIT_BANNER_SLIDES.length)}
              className="w-8 h-8 rounded-full bg-brand/70 border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-brand transition-all cursor-pointer backdrop-blur-md"
              title="Slide anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5 px-2">
              {RECRUIT_BANNER_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentSlide ? "w-6 bg-brand" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  title={`Ir para slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % RECRUIT_BANNER_SLIDES.length)}
              className="w-8 h-8 rounded-full bg-brand/70 border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-brand transition-all cursor-pointer backdrop-blur-md"
              title="Próximo slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════ 2. COMO FUNCIONA (3 PASSOS, LEVE, SEM DETALHE OPERACIONAL) ════════════════════════ */}
      <section className="mb-20 text-center">
        <div className="max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-mono text-brand font-bold uppercase tracking-widest block mb-2">
            SIMPLES & DIRETO
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-text-primary font-medium">
            Como Funciona
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-2">
            O caminho mais rápido entre a sua vaga e o profissional qualificado.
          </p>
        </div>

        {/* 3 Passos: Ícone + 3-5 palavras por passo, nada mais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10 text-left">
          
          {/* Passo 1 */}
          <div className="p-8 rounded-3xl bg-background border border-border shadow-sm hover:border-brand hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-2xl font-serif text-text-secondary/40 font-bold group-hover:text-brand transition-colors">
                  01
                </span>
              </div>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">
                1. Explore
              </h3>
              <p className="text-sm text-text-secondary font-light leading-relaxed">
                Veja talento já triado em <strong className="text-brand font-medium">Talentos e Quadros</strong>.
              </p>
            </div>
            <button
              onClick={() => handleNavigateToCatalog()}
              className="text-xs font-mono text-brand font-bold hover:text-brand flex items-center gap-1.5 cursor-pointer pt-2"
            >
              <span>Abrir catálogo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Passo 2 */}
          <div className="p-8 rounded-3xl bg-background border border-border shadow-sm hover:border-brand hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BadgeCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-2xl font-serif text-text-secondary/40 font-bold group-hover:text-brand transition-colors">
                  02
                </span>
              </div>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">
                2. Escolha
              </h3>
              <p className="text-sm text-text-secondary font-light leading-relaxed">
                Encontre o perfil certo para a sua necessidade.
              </p>
            </div>
            <span className="text-xs font-mono text-text-secondary pt-2 block">
              Filtro por especialidade
            </span>
          </div>

          {/* Passo 3 */}
          <div className="p-8 rounded-3xl bg-background border border-border shadow-sm hover:border-brand hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Handshake className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-2xl font-serif text-text-secondary/40 font-bold group-hover:text-brand transition-colors">
                  03
                </span>
              </div>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">
                3. Contrate
              </h3>
              <p className="text-sm text-text-secondary font-light leading-relaxed">
                A nossa equipa trata do fecho consigo.
              </p>
            </div>
            <button
              onClick={handleOpenCommercial}
              className="text-xs font-mono text-brand font-bold hover:text-brand flex items-center gap-1.5 cursor-pointer pt-2"
            >
              <span>Falar connosco</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* CTA logo a seguir aos 3 passos conforme especificado */}
        <div className="flex justify-center">
          <button
            type="button"
            id="btn-recruit-steps-falar"
            onClick={handleOpenCommercial}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-brand hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-brand-light/20 cursor-pointer active:scale-[0.98]"
          >
            <PhoneCall className="w-4 h-4 text-white stroke-[2.2]" />
            <span>Falar com a Equipa Recruit</span>
          </button>
        </div>
      </section>

      {/* ════════════════════════ 3. AMOSTRA VISUAL DE PERFIS (LINK DIRETO PARA O PERFIL NO CATÁLOGO) ════════════════════════ */}
      <section className="mb-20 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[11px] font-mono text-[#172554] font-bold uppercase tracking-widest block mb-1">
              PERFIS EM DESTAQUE
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-bold">
              Amostra de Talentos
            </h2>
          </div>
          <p className="text-xs text-slate-700 font-medium max-w-sm">
            Perfis reais de profissionais validados pela TARIRA Recruit. Clique em qualquer perfil para abrir o seu dossiê no catálogo.
          </p>
        </div>

        {/* Talentos corporativos reais (SEM dados fictícios e SEM valores salariais públicos) */}
        {realFeaturedTalents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {realFeaturedTalents.map((talent) => (
              <div
                key={talent.id}
                onClick={() => handleNavigateToCatalog(talent.specialtyId)}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#172554] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-5 group shadow-xs"
                title={`Ver catálogo de quadros e talentos em ${talent.area}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative">
                      <img
                        src={talent.photo}
                        alt={talent.name}
                        className="w-16 h-16 rounded-2xl object-cover object-center border border-slate-200 group-hover:scale-105 transition-transform bg-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs" title="Disponível">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verificado</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#172554] group-hover:text-blue-700 transition-colors">
                      {talent.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-800 mt-1 leading-snug">
                      {talent.role}
                    </p>
                    {talent.experience && (
                      <p className="text-[11px] text-slate-600 mt-1 font-mono">
                        {talent.experience}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ação direta: leva diretamente para o catálogo de quadros */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-700 font-medium">
                    {talent.area}
                  </span>
                  <span className="text-[#172554] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>Ver Catálogo de Quadros</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xs text-center max-w-2xl mx-auto mb-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554]">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#172554]">
              Catálogo de Quadros &amp; Talentos Reais
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-lg mx-auto">
              Os quadros executivos e talentos corporativos validados e triados pela comissão técnica da TARIRA Recruit aparecem diretamente aqui. Sem perfis fictícios ou simulações.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBriefingFormOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#172554] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1e3a8a] transition-all cursor-pointer shadow-xs"
              >
                Submeter Briefing de Vaga
              </button>
              <button
                type="button"
                onClick={() => handleNavigateToCatalog()}
                className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[#172554] text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all cursor-pointer shadow-xs"
              >
                Abrir Catálogo de Quadros
              </button>
            </div>
          </div>
        )}

        {/* CTA por baixo: "Ver Talentos e Quadros" */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            id="btn-recruit-ver-talentos-quadros"
            onClick={() => handleNavigateToCatalog()}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-[#172554] border border-slate-200 text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-xs"
          >
            <span>Ver Talentos e Quadros</span>
            <ArrowRight className="w-4 h-4 text-[#172554]" />
          </button>
        </div>
      </section>

      {/* ════════════════════════ 4. CATEGORIAS DISPONÍVEIS (GRID SIMPLES, CLICÁVEL) ════════════════════════ */}
      <section className="mb-20 text-left">
        <div className="border-l-4 border-brand pl-4 mb-8">
          <span className="text-[11px] font-mono text-brand font-bold uppercase tracking-widest block">
            ÁREAS DE ATUAÇÃO
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-text-primary font-medium">
            Categorias Disponíveis
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Selecione uma especialidade para abrir o catálogo diretamente nessa área.
          </p>
        </div>

        {/* Grelha clicável de especialidades */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {RECRUIT_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleNavigateToCatalog(cat.id)}
              className="p-5 rounded-2xl bg-background border border-border hover:bg-[#172554] hover:border-[#172554] hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-3 shadow-xs interactive-hover-blue"
            >
              <div>
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <h3 className="text-sm font-bold text-text-primary group-hover:!text-white transition-colors duration-200">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-text-secondary group-hover:!text-blue-100 leading-snug mt-1 transition-colors duration-200">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-text-secondary group-hover:!text-white transition-colors duration-200">
                <span>Filtrar</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 group-hover:!text-white transition-all duration-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════ 5. PROMESSA / CONFIANÇA (24-48h) ════════════════════════ */}
      <section className="mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-background-secondary border border-border p-8 sm:p-14 text-center shadow-sm">
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <VerticalOrbitBadge text="24•48•H" subtext="SLA" size="sm" variant="dark" />
              <span className="text-[11px] font-mono text-brand font-bold uppercase tracking-widest block">
                A NOSSA PROMESSA
              </span>
              <VerticalOrbitBadge text="RPO" subtext="VETTED" size="sm" variant="dark" />
            </div>

            <div className="text-5xl sm:text-7xl lg:text-8xl font-serif font-black text-brand tracking-tight leading-none min-h-[1.15em] flex items-center justify-center">
              <TypewriterPromise
                phrases={["24-48h", "24 a 48 Horas", "24 - 48h"]}
                typingSpeed={120}
                deletingSpeed={60}
                pauseDelay={2200}
                cursorClassName="bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)]"
              />
            </div>

            {/* Legenda curta */}
            <p className="text-base sm:text-xl text-text-primary font-medium max-w-lg mx-auto">
              Tempo médio de entrega e apresentação do perfil certo
            </p>

            {/* 3 badges curtos de reforço */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-brand text-xs font-mono font-semibold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-status-success" />
                <span>Triagem já feita</span>
              </span>

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-brand text-xs font-mono font-semibold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-status-success" />
                <span>Perfis verificados</span>
              </span>

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-brand text-xs font-mono font-semibold shadow-xs">
                <Handshake className="w-4 h-4 text-status-success" />
                <span>Acompanhamento até ao fecho</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ 6. CONTA TARIRA — VALOR ÚNICO DE MANUTENÇÃO ════════════════════════ */}
      <section className="mb-20 text-left">
        <div className="border-l-4 border-[#172554] pl-4 mb-8">
          <span className="text-[11px] font-mono text-[#172554] font-bold uppercase tracking-widest block">
            ACESSO À PLATAFORMA &amp; VETTING
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-bold">
            Vantagens da Conta Corporativa TARIRA Recruit
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1 max-w-2xl leading-relaxed">
            Sem múltiplos escalões de subscrição. A sua empresa usufrui de todas as vantagens de manter a conta activa para triagem contínua; cada colocação é faturada separadamente por vaga preenchida.
          </p>
        </div>

        {/* Banner de Transparência do Modelo de Cobrança */}
        <div className="p-4 mb-6 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
          <span className="text-[#172554] font-bold text-sm mt-0.5">ℹ️</span>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#172554] block">
              Modelo de Cobrança TARIRA Recruit
            </span>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">{ACCOUNT_BILLING_NOTE}</p>
          </div>
        </div>

        {/* ── Cartão de VANTAGENS da conta (substitui os antigos cartões de preço de plano) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Coluna 1: Acesso Corporativo */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#172554] shadow-md flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#172554] text-white shadow-xs">
                {ACCOUNT_TRIAL_DAYS} dias grátis
              </span>

              <h3 className="text-lg font-bold text-[#172554] mt-3">
                Conta Corporativa Activa
              </h3>
              <p className="text-xs text-slate-800 font-medium mt-1.5 leading-relaxed">
                Acesso contínuo ao ecossistema executivo, banco de talentos validados e garantia de substituição.
              </p>

              <div className="my-4 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-[#172554] font-medium leading-relaxed">
                O valor de manutenção mensal da conta e as condições do período gratuito de {ACCOUNT_TRIAL_DAYS} dias constam detalhadamente no formulário oficial de criação de conta.
              </div>

              <div className="space-y-2 text-xs text-slate-800 font-medium">
                <p className="leading-relaxed">
                  <strong className="text-[#172554]">Conta Particular / Lar:</strong> gratuita, sem inscrição e sem mensalidade.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-[#172554]">Colocações:</strong> faturadas à parte, por vaga efectivamente preenchida.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-auto border-t border-slate-200">
              <button
                type="button"
                id="btn-recruit-create-account"
                onClick={() => setIsRegistrationModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] bg-[#172554] text-white hover:bg-[#1e3a8a] shadow-sm"
              >
                Criar Conta Empresa
              </button>
            </div>
          </div>

          {/* Colunas 2-3: as vantagens */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] font-mono text-[#172554] font-bold uppercase tracking-widest block mb-4">
              O que ganha com a conta activa
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs text-slate-900 font-semibold">
              {accountBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-snug">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-slate-700 font-medium leading-relaxed mt-6 pt-4 border-t border-slate-200">
              Contratações em volume, RPO dedicado ou headhunting executivo continuado? A Direção
              Comercial monta um <strong className="text-[#172554] font-bold">pacote especial</strong> à
              medida, negociado caso a caso.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════ 7. CANAL OFICIAL B2B & CONTACTO CORPORATIVO ════════════════════════ */}
      <section className="mb-20 text-left">
        <div className="p-8 sm:p-10 rounded-3xl bg-background border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <span className="text-[11px] font-mono text-brand font-bold uppercase tracking-wider block">
                ATENDIMENTO INSTITUCIONAL B2B
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-text-primary font-medium mt-1">
                Canais Oficiais de Recrutamento & Direção Comercial
              </h3>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-background-secondary border border-border text-xs font-mono text-text-secondary shadow-xs">
              <Clock className="w-4 h-4 text-brand shrink-0" />
              <div className="leading-tight">
                <span className="font-bold text-text-primary block">Segunda a Sábado</span>
                <span className="text-[11px]">Seg–Sex: 08:00 – 17:30 • Sáb: 09:00 – 13:00</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            {/* 1. E-mails Oficiais */}
            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2.5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand font-bold">
                  <Mail className="w-4 h-4 text-brand" />
                  <span>E-mail Corporativo</span>
                </div>
                <p className="text-text-secondary text-[11px]">
                  Envio direto de briefings e solicitações contratuais:
                </p>
                <div className="pt-1 font-mono">
                  <a 
                    href={`mailto:${socialLinks?.email || "tarira.ecossistema@gmail.com"}?subject=Solicita%C3%A7%C3%A3o%20de%20Quadros%20-%20TARIRA%20Recruit`} 
                    className="block text-brand hover:underline transition-colors font-bold break-all"
                  >
                    {socialLinks?.email || "tarira.ecossistema@gmail.com"}
                  </a>
                </div>
              </div>
              <span className="text-[10px] text-text-secondary font-mono">Triagem executiva diária</span>
            </div>

            {/* 2. Linhas Telefónicas Oficiais */}
            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2.5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand font-bold">
                  <PhoneCall className="w-4 h-4 text-brand" />
                  <span>Linhas Telefónicas Oficiais</span>
                </div>
                <p className="text-text-secondary text-[11px]">
                  Contacto telefónico oficial para atendimento e contratações:
                </p>
                <div className="space-y-1.5 pt-1 font-mono text-xs">
                  <a
                    href={`tel:+${(socialLinks?.phone1 || "+258 87 142 5316").replace(/[^\d]/g, "")}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-background border border-border hover:border-brand/40 transition-colors group"
                    title="Ligar para Operações & Piquete"
                  >
                    <span className="font-bold text-text-primary group-hover:text-brand transition-colors">
                      {socialLinks?.phone1 || "+258 87 142 5316"}
                    </span>
                    <span className="text-[9px] font-sans font-medium text-text-secondary bg-background-secondary px-1.5 py-0.5 rounded border border-border">
                      Operações
                    </span>
                  </a>
                  <a
                    href={`tel:+${(socialLinks?.phone2 || "+258 83 536 1379").replace(/[^\d]/g, "")}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-background border border-border hover:border-brand/40 transition-colors group"
                    title="Ligar para Direção Comercial"
                  >
                    <span className="font-bold text-text-primary group-hover:text-brand transition-colors">
                      {socialLinks?.phone2 || "+258 83 536 1379"}
                    </span>
                    <span className="text-[9px] font-sans font-medium text-text-secondary bg-background-secondary px-1.5 py-0.5 rounded border border-border">
                      Comercial
                    </span>
                  </a>
                </div>
              </div>

              {/* Botões WhatsApp */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <a
                  href={`https://wa.me/${(socialLinks?.phone1 || "+258 87 142 5316").replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 text-[10px] font-bold text-center border border-emerald-500/20 transition-all flex items-center justify-center gap-1"
                  title="WhatsApp Operações & Piquete"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp 1</span>
                </a>
                <a
                  href={`https://wa.me/${(socialLinks?.phone2 || "+258 83 536 1379").replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 text-[10px] font-bold text-center border border-emerald-500/20 transition-all flex items-center justify-center gap-1"
                  title="WhatsApp Direção Comercial"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp 2</span>
                </a>
              </div>
            </div>

            {/* 3. Localização & Sede */}
            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2.5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand font-bold">
                  <MapPin className="w-4 h-4 text-brand" />
                  <span>Sede Operacional TARIRA</span>
                </div>
                <p className="text-text-secondary text-[11px]">
                  Escritórios centrais em Moçambique:
                </p>
                <div className="pt-1 text-text-primary leading-relaxed text-[11px] font-medium">
                  {socialLinks?.address || "Avenida Julius Nyerere, Edifício TARIRA Towers, Maputo, Moçambique"}
                </div>
              </div>
              <span className="text-[10px] text-text-secondary font-mono">Reuniões presenciais por agendamento</span>
            </div>

            {/* 4. Horário de Funcionamento */}
            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2.5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand font-bold">
                  <Clock className="w-4 h-4 text-brand" />
                  <span>Horário de Funcionamento</span>
                </div>
                <p className="text-text-secondary text-[11px]">
                  Período oficial de atendimento institucional:
                </p>
                <div className="space-y-1.5 pt-1 text-[11px] text-text-primary font-mono">
                  <div className="p-2 rounded-xl bg-background border border-border space-y-1">
                    <span className="font-bold block text-text-primary">Segunda a Sábado</span>
                    <p className="text-[10px] text-text-secondary">Seg–Sex: 08:00 – 17:30</p>
                    <p className="text-[10px] text-text-secondary">Sáb (Emergências): 09:00 – 13:00</p>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 font-mono font-medium">Suporte operacional disponível</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ 7. CTA FINAL ════════════════════════ */}
      <section className="mb-10 text-left">
        <div className="p-8 sm:p-12 rounded-3xl bg-background-secondary border border-border shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          <div className="space-y-3 max-w-xl">
            <span className="text-[11px] font-mono text-brand font-bold uppercase tracking-wider block">
              CONTRATAÇÃO SEM COMPLICAÇÃO
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif text-text-primary font-medium leading-tight">
              Pronto para encontrar o seu próximo talento?
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Submeta a sua requisição à Direção Comercial ou explore diretamente os perfis já validados.
            </p>
          </div>

          {/* Botões de Ação Final: Falar com a Equipa Recruit (abre o modal comercial oficial) + CTA Secundário */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto shrink-0">
            <button
              type="button"
              id="btn-recruit-cta-final-falar"
              onClick={handleOpenCommercial}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-brand hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-brand-light/25 cursor-pointer active:scale-[0.98]"
            >
              <FileCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Falar com a Equipa Recruit</span>
            </button>

            <button
              type="button"
              id="btn-recruit-cta-final-talentos"
              onClick={() => handleNavigateToCatalog()}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-background hover:bg-slate-100 text-text-primary border border-border text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-xs"
            >
              <span>Talentos e Quadros</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Briefing Modal wrapper se for acionado por outra via */}
      {isBriefingFormOpen && setIsBriefingFormOpen && (
        <TariraBriefingModal
          isOpen={isBriefingFormOpen}
          onClose={() => setIsBriefingFormOpen(false)}
          currentLang={props.currentLang || "pt"}
        />
      )}

      {/* Modal unificado de criação de conta empresa */}
      {isRegistrationModalOpen && (
        <div 
          ref={registrationModalOverlayRef}
          className="fixed inset-0 z-[100] overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 bg-slate-950/80 backdrop-blur-md flex justify-center items-start"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRegistrationModalOpen(false);
          }}
        >
          <div 
            ref={registrationModalCardRef}
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-4 sm:p-8 relative my-auto sm:my-2 animate-fade-up"
          >
            <button
              type="button"
              onClick={() => setIsRegistrationModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 z-20 cursor-pointer transition-all shadow-sm"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <StandardRegistrationForm
              initialRole="empresa"
              lockRole="empresa"
              isModal={true}
              onCancel={() => setIsRegistrationModalOpen(false)}
              onSuccess={() => setIsRegistrationModalOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
