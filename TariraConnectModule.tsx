import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Wrench, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Layers, 
  Home, 
  Zap, 
  Flame, 
  Sliders, 
  ArrowRight,
  FileText,
  BadgeCheck,
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  ChevronLeft,
  Phone,
  X
} from "lucide-react";
import { VerticalOrbitBadge, TypewriterPromise } from "./TariraVisualEffects";
import { TariraConnectIcon } from "./TariraUnitIcons";
import { StandardRegistrationForm } from "./StandardRegistrationForm";
import {
  ACCOUNT_MAINTENANCE_FEE_MZN,
  ACCOUNT_TRIAL_DAYS,
  ACCOUNT_BILLING_NOTE,
  ACCOUNT_BENEFITS,
  HOME_ACCOUNT_BENEFITS,
  formatMzn,
  resolveMaintenanceFee,
  resolveAccountBenefits,
  resolveHomeBenefits
} from "./accountPlan";

// Os antigos planos Bronze/Prata/Ouro foram eliminados. O Connect passa a
// funcionar com o modelo único do ecossistema: a conta Empresa/Condomínio paga
// um valor fixo de manutenção pelo uso da plataforma (30 dias grátis), a conta
// Particular/Lar é gratuita, e cada intervenção é orçamentada e paga à parte.
// Ver accountPlan.ts.

export interface ConnectSubForm {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  /** Tipo de conta com que o cliente vai contratar: "conta_activa" ou "conta_lar". */
  selectedPlan: string;
  selectedServices: string[];
  contractingModel: string;
  comments: string;
}

export interface ChurnSimParams {
  clientRepeatRate: number;
  chatContactExchanges: number;
  payoutDropPercent: number;
  offPlatformReport: boolean;
}

export interface TariraConnectModuleProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoBack?: () => void;

  connectSubForm?: ConnectSubForm;
  setConnectSubForm?: (v: ConnectSubForm | ((prev: ConnectSubForm) => ConnectSubForm)) => void;
  connectSubSubmitted?: boolean;
  setConnectSubSubmitted?: (v: boolean) => void;

  selectedCategory: string;
  setSelectedCategory: (v: string) => void;

  churnSimParams: ChurnSimParams;
  setChurnSimParams: (v: ChurnSimParams | ((prev: ChurnSimParams) => ChurnSimParams)) => void;

  getSubServiceImage: (item: any, catGroup: string) => string;
  onAddCommercialProposal?: (p: any) => void;
}

export const TariraConnectModule: React.FC<TariraConnectModuleProps> = (props) => {
  const {
    activeTab, setActiveTab, onGoBack,
    connectSubForm, setConnectSubForm, connectSubSubmitted, setConnectSubSubmitted,
    selectedCategory, setSelectedCategory,
    churnSimParams, setChurnSimParams,
    getSubServiceImage,
    onAddCommercialProposal,
  } = props;

  // Valor de manutenção de conta e vantagens — fonte única partilhada com o
  // registo. Carregados do servidor para refletirem edições do administrador.
  const [maintenanceFee, setMaintenanceFee] = useState<number>(ACCOUNT_MAINTENANCE_FEE_MZN);
  const [accountBenefits, setAccountBenefits] = useState<string[]>(ACCOUNT_BENEFITS);
  const [homeBenefits, setHomeBenefits] = useState<string[]>(HOME_ACCOUNT_BENEFITS);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<'empresa' | 'lar'>('empresa');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/registration-plans')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && Array.isArray(data.plans) && data.plans.length > 0) {
          setMaintenanceFee(resolveMaintenanceFee(data.plans));
          setAccountBenefits(resolveAccountBenefits(data.plans));
          setHomeBenefits(resolveHomeBenefits(data.plans));
        }
      })
      .catch((err) => console.warn('[TariraConnectModule] Falha ao carregar valor de manutenção:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  const openRegistration = (role: 'empresa' | 'lar') => {
    setRegistrationRole(role);
    setIsRegistrationModalOpen(true);
  };

  const [showMoreGuarantees, setShowMoreGuarantees] = useState(false);
  const [showRiskSimulator, setShowRiskSimulator] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const CONNECT_BANNER_SLIDES = [
    {
      id: "slide-blueprint-collaboration",
      url: "https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=",
      alt: "Engenharia de campo, blueprint de infraestrutura e vistoria técnica de obras",
      badge: "Engenharia de Campo & Obras",
      title: "Técnicos Credenciados & Vistoria Rigorosa",
      desc: "Acordo de conformidade técnica, fiscalização presencial de obras e gestão de intervenções na Grande Maputo."
    },
    {
      id: "slide-electrician-field",
      url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80",
      alt: "Técnico eletricista de campo, manutenção preventiva e quadros elétricos",
      badge: "Eletricidade & Manutenção Geral",
      title: "Quadros Elétricos, Redes & Força Motriz",
      desc: "Eletricistas industriais e residenciais certificados com prontidão operacional e ferramentas calibradas."
    },
    {
      id: "slide-solar-field",
      url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1920&q=80",
      alt: "Instalação de energia solar fotovoltaica e climatização AVAC",
      badge: "Energia Solar & Climatização",
      title: "Sistemas Fotovoltaicos & AVAC Industrial",
      desc: "Dimensionamento e instalação de sistemas solares, inversores, baterias e manutenção de ar condicionado."
    },
    {
      id: "slide-carpentry-field",
      url: "https://images.unsplash.com/photo-1581850518616-bcb8077fa213?auto=format&fit=crop&w=1920&q=80",
      alt: "Carpintaria, caixilharia de alumínio e acabamentos de precisão",
      badge: "Marcenaria & Caixilharia",
      title: "Acabamentos Arquitetónicos & Estruturas",
      desc: "Montagem de divisórias, portas corta-fogo, caixilharia de alumínio e marcenaria técnica sob medida."
    },
    {
      id: "slide-plumbing-field",
      url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1920&q=80",
      alt: "Canalização predial, redes de água e desentupimentos de alta pressão",
      badge: "Canalização & Redes Hidráulicas",
      title: "Intervenções Hidráulicas & Prumadas",
      desc: "Diagnóstico com câmara de inspeção, reparação de fugas não visíveis e substituição integral de prumadas."
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CONNECT_BANNER_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [CONNECT_BANNER_SLIDES.length]);

  const CATEGORIES = [
    { 
      title: "Serviços Domésticos", 
      desc: "Empregadas domésticas, cozinheiros, passadeiras, babás e cuidadores com triagem presencial e antecedentes auditados.", 
      g: "dom" 
    },
    { 
      title: "Limpeza Especializada", 
      desc: "Limpeza pós-obra, manutenção de escritórios, higienização de estofos, desinfestação e lavagem de vidros em altura.", 
      g: "limp" 
    },
    { 
      title: "Manutenção & Reparações", 
      desc: "Eletricistas qualificados, canalizadores, manutenção de ar condicionado (AC), geradores e equipamentos industriais.", 
      g: "man" 
    },
    { 
      title: "Carpintaria & Marcenaria", 
      desc: "Móveis por medida, estruturas de madeira, caixilharia, restauro e instalação de portas e armários embutidos.", 
      g: "carp" 
    },
    { 
      title: "Construção & Acabamentos", 
      desc: "Pedreiros, pintores de precisão, ladrilhadores, gesso cartonado (pladur) e impermeabilização de terraços.", 
      g: "obra" 
    },
    { 
      title: "Jardinagem & Exteriores", 
      desc: "Paisagismo, poda e corte de árvores, sistemas de rega automática, tratamento de relva e manutenção de piscinas.", 
      g: "jard" 
    },
    { 
      title: "Segurança Eletrónica & Redes", 
      desc: "Instalação de câmaras CCTV, controlo de acessos biométrico, cercas elétricas, redes Wi-Fi e parabólicas DSTV.", 
      g: "tech" 
    }
  ];

  const calculatedChurnScore = Math.min(
    99,
    Math.max(
      2,
      Math.round(
        5 +
        (churnSimParams.clientRepeatRate > 60 ? (churnSimParams.clientRepeatRate - 60) * 0.8 : 0) +
        (churnSimParams.chatContactExchanges * 7) +
        (churnSimParams.payoutDropPercent * 0.35) +
        (churnSimParams.offPlatformReport ? 40 : 0)
      )
    )
  );

  const churnRiskLevel =
    calculatedChurnScore >= 70
      ? { label: "Risco Alto de Bypass", bg: "bg-rose-50 border-rose-300 text-rose-800", status: "Retenção preventiva de saldo e auditoria direta" }
      : calculatedChurnScore >= 35
      ? { label: "Risco Moderado", bg: "bg-blue-50 border-blue-300 text-blue-800", status: "Alerta de supervisão e verificação de ordens" }
      : { label: "Risco Baixo (Fidelizado)", bg: "bg-emerald-50 border-emerald-300 text-emerald-800", status: "Prestador certificado em conformidade total" };

  return (
    <div id="s-connect-sub" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 text-slate-800 font-sans">
      
      {/* ── Top Bar: Navigation & Brand Context ── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5 mb-8">
        <button 
          id="btn-connect-go-back"
          onClick={() => onGoBack ? onGoBack() : setActiveTab("landing")}
          className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-border text-[#172554] text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          title="Voltar ao portal principal"
        >
          <ArrowLeft className="w-4 h-4 text-[#172554] group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar ao Portal Principal</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#172554] block">
              Rede de Ofícios & Serviços Técnicos
            </span>
            <span className="text-sm font-semibold text-slate-800 tracking-tight">
              TARIRA Connect • Gestão de Intervenções
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554] shadow-xs">
            <TariraConnectIcon size={20} className="text-[#172554]" />
          </div>
        </div>
      </header>

      {/* ── Masthead Hero: Banner com Slides de Técnicos de Campo & Ofícios Certificados ── */}
      <section className="relative rounded-3xl overflow-hidden mb-12 shadow-xl border border-blue-900/30 bg-[#172554] min-h-[480px] sm:min-h-[520px] flex items-center">
        
        {/* Slides de Fundo com Transição Suave de Opacidade e Escala */}
        {CONNECT_BANNER_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              idx === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            <img
              src={slide.url}
              alt={slide.alt}
              className="w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.05]"
              referrerPolicy="no-referrer"
            />
            {/* Gradiente Corporativo TARIRA com opacidade suavizada */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#172554]/75 via-[#172554]/60 to-[#172554]/30 sm:bg-gradient-to-r sm:from-[#172554]/75 sm:via-[#172554]/60 sm:to-transparent" />
          </div>
        ))}

        {/* Destaque Vertical Flutuante com Linha Orbitante Giratória (Canto Superior Direito) */}
        <div className="hidden lg:flex absolute top-8 right-8 z-20 flex-col items-center gap-2">
          <VerticalOrbitBadge text="CONNECT" subtext="CAMPO" size="md" variant="glass" />
        </div>

        {/* Conteúdo Dinâmico sobreposto ao Banner */}
        <div className="relative z-10 p-6 sm:p-12 lg:p-14 max-w-3xl text-left text-white w-full">
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-[11px] font-mono font-bold tracking-wide backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>{CONNECT_BANNER_SLIDES[currentSlide].badge}</span>
            </div>
            <span className="inline-flex items-center text-[10px] font-mono font-bold text-blue-200 uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              ⚡ Intervenção Rápida
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal tracking-tight leading-[1.14] mb-4">
            Manutenção técnica com{" "}
            <span className="relative inline-block text-blue-200 font-serif font-bold italic">
              supervisão certificada
              <span className="absolute -bottom-1.5 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 rounded-full animate-trace-line shadow-[0_0_10px_rgba(37,99,235,0.7)]" />
            </span>.
          </h1>

          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-sans max-w-2xl mb-7 font-normal">
            {CONNECT_BANNER_SLIDES[currentSlide].desc} Técnicos credenciados em canalização, eletricidade, AVAC e obras com prontidão operacional em Moçambique.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-1 mb-8">
            <button
              type="button"
              id="btn-connect-solicitar-intervencao"
              onClick={() => {
                const el = document.getElementById("connect-registration-gateway");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-white stroke-[2.2]" />
              <span>Solicitar Intervenção</span>
            </button>

            <button
              type="button"
              id="btn-connect-explorar-servicos"
              onClick={() => setActiveTab("services")}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold text-xs tracking-wide transition-all cursor-pointer backdrop-blur-md active:scale-[0.98]"
            >
              <Wrench className="w-4 h-4 text-blue-200" />
              <span>Explorar Catálogo</span>
            </button>

            <a
              href="tel:+258871425314"
              className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
              title="Ligar para Linha Direta de Emergência e Atendimento Técnico"
            >
              <Phone className="w-3.5 h-3.5 text-blue-300" />
              <span>+258 87 142 5314</span>
            </a>
          </div>

          {/* Metrics Row com Estilo Glass Elevado */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-white/20">
            <div>
              <span className="block text-xl sm:text-2xl font-display font-bold text-white tracking-tight">30 Dias</span>
              <span className="text-xs text-blue-200 font-medium">Garantia integral de re-execução</span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-display font-bold text-white tracking-tight">&lt; 2 Horas</span>
              <span className="text-xs text-blue-200 font-medium">Atendimento a emergências técnicas</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xl sm:text-2xl font-display font-bold text-white tracking-tight">NUIT & Recibo</span>
              <span className="text-xs text-blue-200 font-medium">Faturação legal discriminada</span>
            </div>
          </div>
        </div>

        {/* Controles de Navegação de Slides */}
        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + CONNECT_BANNER_SLIDES.length) % CONNECT_BANNER_SLIDES.length)}
            className="w-8 h-8 rounded-full bg-[#172554]/75 border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-[#172554] transition-all cursor-pointer backdrop-blur-md"
            title="Slide anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#172554]/60 backdrop-blur-md border border-white/20">
            {CONNECT_BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentSlide ? "w-5 bg-blue-400" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                title={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % CONNECT_BANNER_SLIDES.length)}
            className="w-8 h-8 rounded-full bg-[#172554]/75 border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-[#172554] transition-all cursor-pointer backdrop-blur-md"
            title="Próximo slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Section 1: Curated Categories Taxonomy ── */}
      <section className="mb-14 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-4 mb-8">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#172554] font-bold block mb-1">
              Catálogo de Especialidades
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-semibold tracking-tight">
              Categorias de Serviços Disponíveis
            </h2>
          </div>
          <p className="text-xs text-slate-600 max-w-md">
            Selecione as especialidades pretendidas para associar ao seu pedido ou agendar intervenção imediata.
          </p>
        </div>

        {/* Selected Category Real-Time Feedback Banner */}
        <div className="p-5 rounded-2xl bg-blue-50/50 text-slate-800 border border-blue-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white text-[#172554] font-mono font-bold flex items-center justify-center text-base border border-blue-200 shrink-0 shadow-xs">
              {connectSubForm.selectedServices.length}
            </span>
            <div>
              <h4 className="text-xs font-bold text-[#172554] font-mono uppercase tracking-wider">
                Especialidades Associadas ao Pedido
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {(!connectSubForm || connectSubForm.selectedServices.length === 0) ? (
                  <span className="text-slate-500">Nenhuma especialidade associada. Clique em "+ Adicionar ao Pedido" nos cartões abaixo.</span>
                ) : (
                  <span><strong>Selecionadas:</strong> {connectSubForm.selectedServices.join(" • ")}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            {/* Já não há planos: o cliente indica apenas o tipo de conta com que
                vai contratar. O valor da intervenção é sempre orçamentado à parte. */}
            <select
              value={connectSubForm?.selectedPlan || 'conta_activa'}
              onChange={(e) => {
                if (setConnectSubForm && connectSubForm) {
                  setConnectSubForm({ ...connectSubForm, selectedPlan: e.target.value });
                }
              }}
              className="px-3 py-2 rounded-xl bg-white border border-border text-[#172554] font-bold text-xs focus:outline-none focus:border-[#172554] cursor-pointer"
            >
              <option value="conta_activa">
                Conta Empresa / Condomínio ({formatMzn(maintenanceFee)}/mês de manutenção)
              </option>
              <option value="conta_lar">Conta Particular / Lar (sem custo)</option>
            </select>

            {connectSubForm && connectSubForm.selectedServices.length > 0 && setConnectSubForm && (
              <button
                type="button"
                onClick={() => setConnectSubForm({ ...connectSubForm, selectedServices: [] })}
                className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Limpar Seleção
              </button>
            )}
          </div>
        </div>

        {/* ── Destaque: Gestão Contratual TARIRA (Serviços Domésticos) ── */}
        <div className="relative rounded-2xl bg-[#172554] overflow-hidden px-6 py-8 sm:px-10 sm:py-10 mb-8">
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col items-center text-center gap-1.5">
            <span className="text-[9px] tracking-[0.3em] text-blue-200 uppercase font-bold font-mono">
              Serviços Domésticos · Decreto n.º 52/2026
            </span>
            <div className="relative inline-block py-1">
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight leading-none">
                A TARIRA GERE TODO O PROCESSO CONTRATUAL
              </h2>
              <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent pointer-events-none" />
            </div>
            <span className="text-[10px] text-blue-200/90 font-mono">
              Contrato · Carga Horária · Renovações — sempre dentro da lei
            </span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, idx) => {
            const cardImg = getSubServiceImage({ n: cat.title }, cat.g);
            const isSelected = connectSubForm.selectedServices.includes(cat.title);

            return (
              <div 
                key={idx} 
                className={`group rounded-2xl border bg-white overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-[#172554] cursor-pointer ${
                  isSelected ? "border-[#172554] ring-2 ring-[#172554]/20" : "border-border"
                }`}
              >
                <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                  <img 
                    src={cardImg} 
                    alt={cat.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/45 via-brand/10 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white tracking-wide drop-shadow-sm">{cat.title}</h3>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-md bg-[#172554] text-white font-bold text-[9px] uppercase tracking-wider">
                        Selecionado
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4 bg-white group-hover:bg-[#172554] transition-colors duration-300 group-hover-card-blue interactive-hover-blue">
                  <p className="text-xs text-slate-600 group-hover:!text-blue-100 leading-relaxed font-sans transition-colors">{cat.desc}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border group-hover:border-white/20 transition-colors">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.g);
                        setActiveTab("services");
                      }}
                      className="w-full py-2 rounded-xl text-xs font-semibold text-center border border-border group-hover:border-white/30 text-[#172554] group-hover:!text-white group-hover:!bg-white/15 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Ver Tabela
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const svcs = [...connectSubForm.selectedServices];
                        const key = cat.title;
                        if (svcs.includes(key)) {
                          setConnectSubForm({ ...connectSubForm, selectedServices: svcs.filter(s => s !== key) });
                        } else {
                          setConnectSubForm({ ...connectSubForm, selectedServices: [...svcs, key] });
                        }
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#172554] text-white group-hover:bg-white group-hover:text-[#172554]"
                          : "bg-slate-100 group-hover:bg-white group-hover:text-[#172554] text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? "✓ Adicionado" : "+ Adicionar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 2: Modelo de Conta & Como se Paga ── */}
      <section className="mb-14 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-4 mb-8">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#172554] font-bold block mb-1">
              Estrutura de Contratação
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-semibold tracking-tight">
              Uma Conta, Um Valor. Os Serviços Pagam-se à Parte.
            </h2>
          </div>
          <p className="text-xs text-slate-600 max-w-md">
            Não existem planos nem escalões. Paga-se o uso da plataforma e, separadamente,
            cada intervenção que decidir contratar.
          </p>
        </div>

        {/* Como funciona o modelo — 3 passos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              step: "01",
              title: "Cria a conta",
              text: `Empresa ou condomínio paga ${formatMzn(maintenanceFee)}/mês de manutenção de conta. Os primeiros ${ACCOUNT_TRIAL_DAYS} dias são gratuitos. Lares particulares não pagam nada.`
            },
            {
              step: "02",
              title: "Pede a intervenção",
              text: "Abre pedidos ilimitados a técnicos verificados. Recebe orçamento antes da execução e aprova-o na plataforma."
            },
            {
              step: "03",
              title: "Paga o serviço executado",
              text: "Mão-de-obra e materiais são faturados por serviço prestado, com fatura fiscal com NUIT e pagamento protegido em escrow."
            }
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-2xl bg-white border border-border shadow-xs">
              <span className="text-[10px] font-mono font-bold text-[#172554]/50 block">{item.step}</span>
              <h3 className="text-sm font-bold text-[#172554] tracking-tight mt-1">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Banner de Transparência do Modelo de Cobrança */}
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3 mb-8">
          <span className="text-[#172554] font-bold text-sm mt-0.5">ℹ️</span>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#172554] block">
              Modelo de Cobrança TARIRA Connect
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">{ACCOUNT_BILLING_NOTE}</p>
          </div>
        </div>

        {/* ── Cartões de VANTAGENS da conta (substituem os antigos cartões de preço de plano) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conta Empresa / Condomínio */}
          <div className="p-7 rounded-2xl bg-white border-2 border-[#172554] shadow-md flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#172554] text-white font-mono font-bold text-[10px] uppercase tracking-wider shadow-xs whitespace-nowrap">
              {ACCOUNT_TRIAL_DAYS} dias grátis
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 pt-1">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-50 text-[#172554]">
                  Empresa &amp; Condomínio
                </span>
                <span className="text-xs font-mono text-[#172554] font-semibold">Manutenção de conta</span>
              </div>
              <h3 className="text-xl font-bold text-[#172554] tracking-tight">Conta TARIRA Activa</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Empresas e condomínios pagam exactamente o mesmo valor pelo uso da plataforma e por
                todas as vantagens de manter a conta activa.
              </p>

              <div className="mt-6 pt-5 border-t border-border">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-[#172554]">
                    {maintenanceFee.toLocaleString('pt-PT')}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">MZN</span>
                  <span className="text-xs text-slate-500 font-mono">/mês</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                  Hoje paga 0 MZN — primeiros {ACCOUNT_TRIAL_DAYS} dias gratuitos
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-slate-700 font-medium">
                {accountBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#172554] shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => openRegistration('empresa')}
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs text-center active:scale-[0.98] bg-[#172554] hover:bg-[#1e3a8a] text-white"
            >
              Criar Conta Empresa / Condomínio
            </button>
          </div>

          {/* Conta Particular / Lar */}
          <div className="p-7 rounded-2xl bg-white border border-border shadow-xs hover:shadow-md flex flex-col justify-between space-y-6 transition-all duration-200">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
                  Particular / Lar
                </span>
                <span className="text-xs font-mono text-slate-500">Sem custo</span>
              </div>
              <h3 className="text-xl font-bold text-[#172554] tracking-tight">Conta Particular</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Para lares e clientes particulares. A conta não tem qualquer custo — paga apenas o
                serviço que contratar.
              </p>

              <div className="mt-6 pt-5 border-t border-border">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-[#172554]">0</span>
                  <span className="text-sm font-semibold text-slate-700">MZN</span>
                  <span className="text-xs text-slate-500 font-mono">de inscrição e manutenção</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-slate-700 font-medium">
                {homeBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#172554] shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => openRegistration('lar')}
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs text-center active:scale-[0.98] bg-[#172554] hover:bg-[#1e3a8a] text-white"
            >
              Criar Conta Particular (Grátis)
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed mt-5 text-center">
          Volumes elevados, SLA dedicado ou cobertura 24/7? A Direção Comercial monta um{" "}
          <strong className="text-[#172554]">pacote especial</strong> à medida — fale connosco.
        </p>
      </section>

      {/* ── Section 3: Institutional Standards vs Informal Market ── */}
      <section className="mb-14 p-8 sm:p-10 rounded-3xl bg-white border border-border text-left shadow-xs">
        <div className="border-b border-border pb-5 mb-8">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#172554] font-bold block mb-1">
            Garantia de Qualidade & Proteção
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-semibold tracking-tight">
            Padrão Institucional TARIRA Connect vs Mercado Informal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            A TARIRA Connect substitui a incerteza do "boca a boca" informal por uma infraestrutura auditada com garantia jurídica, supervisão de campo e faturação fiscal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Identidade & Registo Criminal",
              tarira: "B.I., NUIT, Registo Criminal limpo, comprovativo de morada e validação presencial.",
              informal: "Pessoa sem identificação confirmada, sem morada verificável e sem histórico auditado."
            },
            {
              title: "Garantia de Re-Execução 30 Dias",
              tarira: "Se o problema persistir, a equipa retorna a 0 MZN adicionais até à resolução definitiva.",
              informal: "Se a avaria reincidir, o contacto é frequentemente bloqueado com perda do valor pago."
            },
            {
              title: "Pagamento Protegido em Escrow",
              tarira: "O valor é custodiado com segurança e transferido ao profissional apenas após aprovação.",
              informal: "Exigência de adiantamentos em dinheiro vivo antes da conclusão do serviço."
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-50/70 border border-border flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#172554] tracking-tight mb-3">{item.title}</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#172554] uppercase block">✓ Na TARIRA Connect</span>
                    <p className="text-slate-700 leading-relaxed">{item.tarira}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-border space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">✕ No Mercado Informal</span>
                    <p className="text-slate-500 leading-relaxed">{item.informal}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Accordion: restantes 3 garantias, colapsadas por defeito para manter a secção leve */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowMoreGuarantees(!showMoreGuarantees)}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white border border-border text-[#172554] text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
          >
            <span>{showMoreGuarantees ? "Ocultar restantes garantias" : "Ver mais garantias"}</span>
            {showMoreGuarantees ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showMoreGuarantees && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 animate-fade-up">
              {[
                {
                  title: "Faturação Fiscal com NUIT",
                  tarira: "Preçário padronizado oficial com emissão de fatura dedutível para contabilidade.",
                  informal: "Cobranças arbitrárias no momento, sem recibo, sem IVA e com custos surpresa."
                },
                {
                  title: "Supervisão Técnica & EPIs",
                  tarira: "Inspetores seniores acompanham intervenções críticas assegurando normas de segurança.",
                  informal: "Execução improvisada, sem equipamento de proteção individual e risco elevado de danos."
                },
                {
                  title: "Substituição Ágil em 24-48h",
                  tarira: "Troca rápida de técnico sem burocracia nem custo adicional através do portal.",
                  informal: "Necessidade de recomeçar a busca do zero com perda de tempo e novos custos."
                }
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50/70 border border-border flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#172554] tracking-tight mb-3">{item.title}</h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-[#172554] uppercase block">✓ Na TARIRA Connect</span>
                        <p className="text-slate-700 leading-relaxed">{item.tarira}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-border space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">✕ No Mercado Informal</span>
                        <p className="text-slate-500 leading-relaxed">{item.informal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Section 4: Platform Integrity & Compliance Engine ── */}
      <section className="mb-14 p-8 sm:p-10 rounded-3xl bg-white text-slate-800 border border-border text-left shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#172554] uppercase tracking-wider mb-2">
              <span>Mecanismo de Conformidade Contratual GESC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#172554] tracking-tight">
              Proteção de Plataforma & Garantia Anti-Bypass
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Para assegurar a continuidade das garantias de segurança e o cumprimento das obrigações fiscais e laborais, a TARIRA monitoriza a conformidade das ordens de serviço.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-border shrink-0 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Taxa de Conformidade</span>
              <span className="text-2xl font-bold text-[#172554]">98.4%</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Retenção Ativa</span>
              <span className="text-2xl font-bold text-slate-800">99.1%</span>
            </div>
          </div>
        </div>

        {/* Pillars of Platform Trust — conteúdo principal, sempre visível (já são só 3 pontos) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#172554] border-b border-border pb-3">
            Porquê Manter as Ordens no Ecossistema TARIRA
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1">
              <span className="font-bold text-[#172554] block font-mono uppercase text-[10px]">1. Seguro de Responsabilidade e Re-Execução</span>
              <p className="text-slate-600 leading-relaxed">
                Intervenções acordadas fora do portal perdem a garantia de 30 dias e a cobertura contra eventuais danos materiais.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1">
              <span className="font-bold text-[#172554] block font-mono uppercase text-[10px]">2. Garantia de Liquidação ao Profissional</span>
              <p className="text-slate-600 leading-relaxed">
                A TARIRA assegura que o prestador recebe o valor acordado imediatamente na sua carteira digital, prevenindo calotes de clientes.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1">
              <span className="font-bold text-[#172554] block font-mono uppercase text-[10px]">3. Faturação Fiscal e Dedutibilidade Legal</span>
              <p className="text-slate-600 leading-relaxed">
                Todas as faturas geradas contêm NUIT e enquadramento fiscal, indispensável para a contabilidade de empresas e condomínios.
              </p>
            </div>
          </div>
        </div>

        {/* Accordion: simulador interativo de risco — ferramenta avançada/auditoria, colapsada por defeito */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowRiskSimulator(!showRiskSimulator)}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white border border-border text-[#172554] text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#172554]" />
              <span>{showRiskSimulator ? "Ocultar Simulador de Risco Operacional" : "Ver Simulador de Risco Operacional"}</span>
            </span>
            {showRiskSimulator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRiskSimulator && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-border space-y-6 mt-4 animate-fade-up">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="text-base font-bold text-[#172554] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#172554]" />
                  <span>Simulador de Risco Operacional</span>
                </h3>
                <span className="text-[10px] bg-white border border-border text-slate-600 px-2.5 py-1 rounded-md font-mono">
                  Auditoria Algorítmica
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>Repetição de Atendimento fora do Portal:</span>
                    <span className="font-mono font-bold text-[#172554]">{churnSimParams.clientRepeatRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={churnSimParams.clientRepeatRate}
                    onChange={(e) => setChurnSimParams({ ...churnSimParams, clientRepeatRate: Number(e.target.value) })}
                    className="w-full accent-[#172554] bg-slate-200 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>Troca de Contactos Diretos não Auditados:</span>
                    <span className="font-mono font-bold text-blue-700">{churnSimParams.chatContactExchanges} ocorrências</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={churnSimParams.chatContactExchanges}
                    onChange={(e) => setChurnSimParams({ ...churnSimParams, chatContactExchanges: Number(e.target.value) })}
                    className="w-full accent-blue-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>Queda Súbita no Histórico de Faturação:</span>
                    <span className="font-mono font-bold text-rose-600">{churnSimParams.payoutDropPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={churnSimParams.payoutDropPercent}
                    onChange={(e) => setChurnSimParams({ ...churnSimParams, payoutDropPercent: Number(e.target.value) })}
                    className="w-full accent-rose-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-border">
                  <span className="text-slate-700 font-semibold">Sinalização Externa de Atendimento Fora:</span>
                  <button
                    type="button"
                    onClick={() => setChurnSimParams({ ...churnSimParams, offPlatformReport: !churnSimParams.offPlatformReport })}
                    className={`px-3 py-1 rounded-lg font-mono font-bold uppercase text-[10px] transition-all cursor-pointer ${
                      churnSimParams.offPlatformReport ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {churnSimParams.offPlatformReport ? "Sinalizado" : "Normal"}
                  </button>
                </div>
              </div>

              {/* Result Box */}
              <div className={`p-4 rounded-xl border space-y-2 ${churnRiskLevel.bg}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase font-mono tracking-wider">Score de Risco Calculado:</span>
                  <span className="text-2xl font-black font-mono">{calculatedChurnScore}%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span>Estado: {churnRiskLevel.label}</span>
                  <span className="text-[11px] font-mono">{churnRiskLevel.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Section 5: Registo & Criação de Conta ── */}
      <section id="connect-registration-gateway" className="p-8 sm:p-10 rounded-3xl bg-white border border-border text-left shadow-xs">
        <div className="max-w-2xl mb-8">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#172554] font-bold block mb-1">
            Formulário Oficial de Registo & Ativação
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-semibold tracking-tight">
            Criar Conta no TARIRA Connect
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Registe a sua empresa, condomínio ou residência através do formulário oficial, com verificação cadastral imediata. O valor de manutenção da conta é apresentado no segundo passo do registo.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#172554] text-white uppercase">
                Acesso Seguro
              </span>
              <span className="text-sm font-bold text-[#172554]">Registo Corporativo & Residencial TARIRA Connect</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ativação transparente, verificação de identidade, emissão de faturas com NUIT e cobertura de técnicos com antecedentes criminais verificados na Grande Maputo e Matola.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openRegistration('empresa')}
            className="px-6 py-3.5 rounded-xl bg-[#172554] hover:bg-[#1e3a8a] text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-all shadow-md cursor-pointer active:scale-95"
          >
            Abrir Formulário de Registo
          </button>
        </div>
      </section>

      {/* Modal de criação de conta (o valor de manutenção aparece no passo 2 do formulário) */}
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
              initialRole={registrationRole}
              isModal={true}
              onCancel={() => setIsRegistrationModalOpen(false)}
              onSuccess={() => {
                setIsRegistrationModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
