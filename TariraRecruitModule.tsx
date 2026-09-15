import React, { useState, useEffect } from "react";
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
  X
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

// Curated preview talent profiles matching exact canonical IDs in the catalog (Strictly NO salary info here)
const FEATURED_TALENTS = [
  {
    id: "mockup-prof-01",
    name: "Dra. Nádia Sitoe",
    role: "Senior AI & Data Solutions Architect",
    area: "Inteligência Artificial & Dados",
    specialtyId: "ai",
    experience: "9 anos exp.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "mockup-prof-02",
    name: "Dr. Hermenegildo Langa",
    role: "Diretor de Recursos Humanos & People Operations",
    area: "Gestão Executiva & RH",
    specialtyId: "exec",
    experience: "11 anos exp.",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600"
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

export const TariraRecruitModule: React.FC<TariraRecruitModuleProps> = (props) => {
  const {
    setActiveTab,
    onGoBack,
    setRecruitSelectedCategory,
    onSelectCandidateForGallery,
    onOpenCommercialModal,
    isBriefingFormOpen,
    setIsBriefingFormOpen,
    candidates
  } = props;

  // Amostra de talentos: usa candidatos reais e aprovados quando existem (perfil abre de verdade
  // ao clicar); só recorre aos exemplos ilustrativos ("mockup-...") se a base ainda estiver vazia.
  const realFeaturedTalents = (candidates || [])
    .filter(c => c.isProfessional && (c.status === "approved" || c.status === "hired") && c.photo)
    .slice(0, 6)
    .map(c => ({
      id: c.id,
      name: `${c.name}${c.surname ? " " + c.surname : ""}`,
      role: c.title || c.subCategory || "Profissional TARIRA",
      area: RECRUIT_CATEGORIES.find(cat => cat.id === c.category)?.label || c.category || "Talento TARIRA",
      specialtyId: c.category || "exec",
      experience: c.experienceYears ? `${c.experienceYears} anos exp.` : "",
      photo: c.photo as string
    }));

  const talentsToDisplay = realFeaturedTalents.length >= 3 ? realFeaturedTalents : FEATURED_TALENTS;

  // Banner carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Valor de manutenção de conta e vantagens — fonte única partilhada com o
  // registo. Carregados do servidor para refletirem edições do administrador.
  const [maintenanceFee, setMaintenanceFee] = useState<number>(ACCOUNT_MAINTENANCE_FEE_MZN);
  const [accountBenefits, setAccountBenefits] = useState<string[]>(ACCOUNT_BENEFITS);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

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
    if (specialtyId && specialtyId !== "all") {
      setRecruitSelectedCategory(specialtyId);
    } else {
      setRecruitSelectedCategory("all");
    }
    setActiveTab("profissionais");
  };

  // Navigates directly into the specific candidate's profile within the catalog.
  // Cartões ilustrativos (id "mockup-...") não existem no dataset real — nesse caso
  // navega para o catálogo já filtrado pela categoria, em vez de tentar abrir um
  // perfil inexistente (o que deixava o botão "sem efeito visível" para o utilizador).
  const handleViewCandidateProfile = (candidateId: string, specialtyId?: string) => {
    const isIllustrative = candidateId.startsWith("mockup-");
    if (!isIllustrative && onSelectCandidateForGallery) {
      onSelectCandidateForGallery(candidateId, specialtyId);
    } else {
      if (specialtyId) setRecruitSelectedCategory(specialtyId);
      setActiveTab("profissionais");
    }
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-border pb-5">
          <div>
            <span className="text-[11px] font-mono text-brand font-bold uppercase tracking-widest block mb-1">
              PERFIS EM DESTAQUE
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-text-primary font-medium">
              Amostra de Talentos
            </h2>
          </div>
          <p className="text-xs text-text-secondary max-w-sm">
            Clique em qualquer perfil para abrir diretamente o seu dossiê detalhado no catálogo.
          </p>
        </div>

        {/* 6 cards de profissionais em destaque (SEM valores/propostas salariais) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {talentsToDisplay.map((talent) => (
            <div
              key={talent.id}
              onClick={() => handleViewCandidateProfile(talent.id, talent.specialtyId)}
              className="p-6 rounded-3xl bg-background border border-border hover:border-brand hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-5 group shadow-sm"
              title={`Abrir perfil detalhado de ${talent.name}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="relative">
                    <img
                      src={talent.photo}
                      alt={talent.name}
                      className="w-16 h-16 rounded-2xl object-cover object-center border border-border group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-status-success border-2 border-background flex items-center justify-center text-white shadow-xs" title="Disponível">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Badge "Triado" com destaque */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success/10 border border-status-success/30 text-status-success text-[10px] font-mono font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                    <span>Triado</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-text-primary group-hover:text-brand transition-colors">
                    {talent.name}
                  </h3>
                  <p className="text-xs font-medium text-text-secondary mt-1 leading-snug">
                    {talent.role}
                  </p>
                </div>
              </div>

              {/* Ação direta: leva diretamente para o perfil no catálogo */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-text-secondary">
                  {talent.area}
                </span>
                <span className="text-brand font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Ver Perfil</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA por baixo: "Ver Talentos e Quadros" */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            id="btn-recruit-ver-talentos-quadros"
            onClick={() => handleNavigateToCatalog()}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-background hover:bg-background-secondary text-brand border border-border text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-sm"
          >
            <span>Ver Talentos e Quadros</span>
            <ArrowRight className="w-4 h-4 text-brand" />
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
        <div className="border-l-4 border-brand pl-4 mb-8">
          <span className="text-[11px] font-mono text-brand font-bold uppercase tracking-widest block">
            ACESSO À PLATAFORMA &amp; VETTING
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-text-primary font-medium">
            Uma Conta, Um Valor — Sem Planos
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Deixou de haver escalões de subscrição. A sua empresa paga um valor único pela conta
            activa e pelas vantagens que ela dá; cada colocação é faturada separadamente por vaga
            preenchida.
          </p>
        </div>

        {/* Banner de Transparência do Modelo de Cobrança */}
        <div className="p-4 mb-6 rounded-2xl bg-brand/5 border border-brand/20 flex items-start gap-3">
          <span className="text-brand font-bold text-sm mt-0.5">ℹ️</span>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-text-primary block">
              Modelo de Cobrança TARIRA Recruit
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">{ACCOUNT_BILLING_NOTE}</p>
          </div>
        </div>

        {/* ── Cartão de VANTAGENS da conta (substitui os antigos cartões de preço de plano) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Coluna 1: o valor */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-background-secondary border border-brand ring-2 ring-brand/20 shadow-md flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand text-white shadow-xs">
                {ACCOUNT_TRIAL_DAYS} dias grátis
              </span>

              <h3 className="text-lg font-serif font-bold text-text-primary mt-3">
                Manutenção de Conta TARIRA
              </h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                O mesmo valor para empresas e condomínios. Cobre o uso da plataforma e todas as
                vantagens da conta activa.
              </p>

              <div className="my-5 pt-4 border-t border-border">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-text-primary">
                    {formatMzn(maintenanceFee)}
                  </span>
                  <span className="text-xs font-mono text-text-secondary">/mês</span>
                </div>
                <span className="text-[11px] font-mono text-status-success block mt-1">
                  Hoje paga 0 MZN
                </span>
              </div>

              <div className="space-y-2 text-xs text-text-secondary">
                <p className="leading-relaxed">
                  <strong className="text-text-primary">Conta Particular / Lar:</strong> gratuita, sem
                  inscrição e sem mensalidade.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-text-primary">Colocações:</strong> faturadas à parte, por vaga
                  efectivamente preenchida.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-auto border-t border-border">
              <button
                type="button"
                id="btn-recruit-create-account"
                onClick={() => setIsRegistrationModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] bg-brand text-white hover:brightness-110 shadow-md shadow-brand-light/20"
              >
                Criar Conta Empresa
              </button>
            </div>
          </div>

          {/* Colunas 2-3: as vantagens */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-background border border-border shadow-sm">
            <span className="text-[11px] font-mono text-brand font-bold uppercase tracking-widest block mb-4">
              O que ganha com a conta activa
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs text-text-secondary">
              {accountBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-snug">
                  <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <p className="text-[11px] text-text-secondary leading-relaxed mt-6 pt-4 border-t border-border">
              Contratações em volume, RPO dedicado ou headhunting executivo continuado? A Direção
              Comercial monta um <strong className="text-text-primary">pacote especial</strong> à
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
            <span className="text-xs text-text-secondary font-mono">
              Segunda a Sexta • 08h00 às 17h30
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* E-mails Oficiais */}
            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-brand font-bold">
                <Mail className="w-4 h-4 text-brand" />
                <span>E-mails Oficiais de Contacto</span>
              </div>
              <p className="text-text-secondary text-[11px]">
                Interações monitoradas pela equipa de recrutamento e painel de gestão:
              </p>
              <div className="space-y-1 pt-1 font-mono">
                <a 
                  href="mailto:tarira.ecossistema@gmail.com?subject=Solicita%C3%A7%C3%A3o%20de%20Quadros%20-%20TARIRA%20Recruit" 
                  className="block text-brand hover:text-brand transition-colors font-semibold"
                >
                  tarira.ecossistema@gmail.com
                </a>
              </div>
            </div>

            {/* Linhas Telefónicas Oficiais */}
            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-brand font-bold">
                <PhoneCall className="w-4 h-4 text-brand" />
                <span>Linha Corporativa Direta</span>
              </div>
              <p className="text-text-secondary text-[11px]">
                Contacto telefónico oficial para atendimento a empresas e contratações:
              </p>
              <div className="space-y-1 pt-1 font-mono text-text-primary">
                <p>+258 84 330 0000 (Central Corporativa)</p>
                <p>+258 21 000 000 (Gabinete Executivo)</p>
              </div>
            </div>

            {/* Localização & Sede */}
            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-brand font-bold">
                <MapPin className="w-4 h-4 text-brand" />
                <span>Sede Corporativa TARIRA</span>
              </div>
              <p className="text-text-secondary text-[11px]">
                Escritórios centrais em Moçambique:
              </p>
              <div className="pt-1 text-text-primary leading-relaxed text-[11px]">
                Av. Julius Nyerere, Edifício Zenith, Polana Cimento, Maputo.
              </div>
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

      {/* Modal unificado de criação de conta (valor de manutenção no passo 2) */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-4 sm:p-8 relative">
            <button
              type="button"
              onClick={() => setIsRegistrationModalOpen(false)}
              className="absolute top-5 right-5 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 z-20 cursor-pointer transition-all"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <StandardRegistrationForm
              initialRole="empresa"
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
