import React, { useState, useEffect } from "react";
import { scrollToForm } from "./scrollToForm";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  CheckCircle2,
  X,
  Shield,
  Users,
  Check,
  Building,
  Award,
  Clock,
  FileCheck,
  PhoneCall,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  AlertCircle,
  Briefcase,
  Building2,
  Globe,
  Wrench,
  ShieldCheck,
  Scale,
  Compass,
  Zap,
  Search,
  Filter,
  UserCheck,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  Play,
  Pause,
  Mail,
  Send,
  RotateCw
} from "lucide-react";
import { PartnerCompanyItem } from "./types";
import { TariraOutsourcingGrowthChart } from "./TariraOutsourcingGrowthChart";
import { TariraOutsourcingIcon } from "./TariraUnitIcons";

export interface BusinessSubForm {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  operationType: string;
  headcount: number;
  slaLevel: string;
  comments: string;
  documentName?: string;
  documentSize?: string;
  documentData?: string;
}

interface CommercialContactForm {
  name: string;
  company: string;
  phone: string;
  email: string;
  serviceType: string;
  notes: string;
}

interface TariraOutsourcingModuleProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoBack?: () => void;
  partnerCompanies?: PartnerCompanyItem[];

  businessSubForm: BusinessSubForm;
  setBusinessSubForm: (v: BusinessSubForm | ((prev: BusinessSubForm) => BusinessSubForm)) => void;
  businessSubSubmitted: boolean;
  setBusinessSubSubmitted: (v: boolean) => void;
  businessSubActiveStep: number;
  setBusinessSubActiveStep: (v: number | ((prev: number) => number)) => void;

  isCommercialModalOpen: boolean;
  setIsCommercialModalOpen: (v: boolean) => void;
  commercialContactForm: CommercialContactForm;
  setCommercialContactForm: (v: CommercialContactForm | ((prev: CommercialContactForm) => CommercialContactForm)) => void;
  onAddCommercialProposal?: (proposal: any) => void;
}

export const TariraOutsourcingModule: React.FC<TariraOutsourcingModuleProps> = (props) => {
  const {
    activeTab, setActiveTab, onGoBack, partnerCompanies = [],
    businessSubForm, setBusinessSubForm, businessSubSubmitted, setBusinessSubSubmitted, businessSubActiveStep, setBusinessSubActiveStep,
    isCommercialModalOpen, setIsCommercialModalOpen, commercialContactForm, setCommercialContactForm,
    onAddCommercialProposal,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // ════════════════════════ BANNER SUPERIOR (CARROSSEL NO TOPO) ════════════════════════
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const carouselSlides = [
    {
      id: "slide-1",
      caption: "Sourcing de Talento",
      tagline: "Mapeamento ativo no mercado",
      image: "https://images.pexels.com/photos/5439453/pexels-photo-5439453.jpeg?auto=compress&cs=tinysrgb&w=1600",
      description: "Identificação direta de candidatos passivos e ativos com perfis técnicos e de liderança."
    },
    {
      id: "slide-2",
      caption: "Entrevistas & Triagem",
      tagline: "Avaliação técnica e comportamental",
      image: "https://images.pexels.com/photos/7658398/pexels-photo-7658398.jpeg?auto=compress&cs=tinysrgb&w=1600",
      description: "Crivo rigoroso por especialistas, validação curricular e comprovação de referências."
    },
    {
      id: "slide-3",
      caption: "Employer Branding",
      tagline: "Posicionamento e atratividade",
      image: "https://images.pexels.com/photos/7658184/pexels-photo-7658184.jpeg?auto=compress&cs=tinysrgb&w=1600",
      description: "A sua marca projetada como primeiro destino para os profissionais mais disputados."
    },
    {
      id: "slide-4",
      caption: "Equipas Dedicadas",
      tagline: "Imersão no seu negócio",
      image: "https://images.pexels.com/photos/5816298/pexels-photo-5816298.jpeg?auto=compress&cs=tinysrgb&w=1600",
      description: "Recrutadores TARIRA operando como extensão direta do seu departamento interno."
    },
    {
      id: "slide-5",
      caption: "Onboarding",
      tagline: "Integração rápida e segura",
      image: "https://media.istockphoto.com/id/1192068841/photo/customer-service-representative-working-in-call-centre.jpg?s=1024x1024&w=is&k=20&c=WpIbYpP1v60tvM7kPkWOZgcVrbvoyE1d8SrkOGHlwkQ=",
      description: "Acompanhamento nos primeiros 90 dias com garantia de retenção e adaptação cultural."
    }
  ];

  // Carousel autoplay timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, carouselSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  // ════════════════════════ COMO FUNCIONA (5 ETAPAS) ════════════════════════
  const workflowSteps = [
    {
      num: 1,
      title: "Diagnóstico",
      subtitle: "Levantamento e Alinhamento",
      desc: "Análise aprofundada da cultura, objetivos estratégicos, perfil ideal dos cargos e definição das metas de contratação.",
      icon: Compass,
      metric: "Etapa 01"
    },
    {
      num: 2,
      title: "Equipa Dedicada",
      subtitle: "Alocação Especializada",
      desc: "Designação de recrutadores seniores TARIRA que absorvem as diretrizes e processos da sua empresa.",
      icon: Users,
      metric: "Etapa 02"
    },
    {
      num: 3,
      title: "Sourcing",
      subtitle: "Busca Ativa de Mercado",
      desc: "Mapeamento contínuo de talentos nas principais indústrias em Moçambique e no mercado regional.",
      icon: Search,
      metric: "Etapa 03"
    },
    {
      num: 4,
      title: "Entrevistas",
      subtitle: "Triagem & Validação Técnica",
      desc: "Condução de entrevistas por competências, testes práticos e validação ética antes do envio dos finalistas.",
      icon: UserCheck,
      metric: "Etapa 04"
    },
    {
      num: 5,
      title: "Relatórios",
      subtitle: "Visibilidade e Gestão",
      desc: "Dashboards em tempo real, métricas de SLA, tempo médio de preenchimento e relatórios de desempenho.",
      icon: BarChart3,
      metric: "Etapa 05"
    },
    {
      num: 6,
      title: "Gestão & Entrega",
      subtitle: "Acompanhamento Contínuo & Fluxo RH",
      desc: "Para além da contratação, a TARIRA assume a gestão de todo o fluxo contínuo do RH e entrega os resultados diretamente à sua empresa — assegurando que a conformidade trabalhista e legal processa-se de forma 100% automática.",
      icon: Layers,
      metric: "Etapa 06"
    }
  ];

  // ════════════════════════ TIPOS DE SERVIÇO (5 CARDS) ════════════════════════
  const serviceCards = [
    {
      id: "sourcing",
      title: "Sourcing de Talento",
      line: "Encontramos quem não está à procura.",
      icon: Search,
      tag: "Busca Ativa",
      accent: "from-blue-600/20 to-blue-600/5",
      border: "border-blue-500/30",
      color: "text-[#172554]"
    },
    {
      id: "employer-branding",
      title: "Employer Branding",
      line: "A sua marca, atrativa para os melhores.",
      icon: Sparkles,
      tag: "Posicionamento",
      accent: "from-blue-500/20 to-blue-500/5",
      border: "border-blue-500/30",
      color: "text-blue-400"
    },
    {
      id: "equipas-embutidas",
      title: "Equipas Embutidas",
      line: "Recrutadores TARIRA dentro da sua empresa.",
      icon: Users,
      tag: "Embedded Team",
      accent: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/30",
      color: "text-emerald-400"
    },
    {
      id: "tecnologia-recrutamento",
      title: "Tecnologia de Recrutamento",
      line: "Dados e ferramentas ao seu serviço.",
      icon: Cpu,
      tag: "Tech & ATS",
      accent: "from-cyan-500/20 to-cyan-500/5",
      border: "border-cyan-500/30",
      color: "text-cyan-400"
    },
    {
      id: "relatorios-performance",
      title: "Relatórios de Performance",
      line: "Visibilidade total do processo.",
      icon: BarChart3,
      tag: "KPIs & SLAs",
      accent: "from-indigo-500/20 to-indigo-500/5",
      border: "border-indigo-500/30",
      color: "text-indigo-400"
    }
  ];

  const handleFileUpload = (file: File) => {
    setUploadError("");
    
    const ext = file.name.split(".").pop()?.toLowerCase();
    const isPdf = ext === "pdf" || file.type === "application/pdf";

    if (!isPdf) {
      setUploadError("Por favor, anexe exclusivamente ficheiros em formato PDF (.pdf).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError(`O ficheiro PDF excede o tamanho máximo permitido de 2MB. Tamanho selecionado: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBusinessSubForm(prev => ({
        ...prev,
        documentName: file.name,
        documentSize: formattedSize,
        documentData: result
      }));
    };
    reader.readAsDataURL(file);
  };

  const scrollToContactOrOpenModal = (preferredService?: string) => {
    if (preferredService) {
      setBusinessSubForm(prev => ({
        ...prev,
        operationType: preferredService
      }));
    }
    const formEl = document.getElementById("outsourcing-solicitation-form");
    if (formEl) {
      scrollToForm(formEl);
    } else {
      setIsCommercialModalOpen(true);
    }
  };

  const handleDirectB2BContact = () => {
    setCommercialContactForm(prev => ({
      ...prev,
      serviceType: "TARIRA Outsourcing (RPO B2B)",
      notes: "Contacto Direto B2B — Solicitação de agendamento de apresentação e termos de parceria para Outsourcing de Recrutamento."
    }));
    setIsCommercialModalOpen(true);
  };

  return (
    <div id="s-business-sub" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-20 text-[#172554] bg-white">
      
      {/* ════════════════════════ 🧭 NAVEGAÇÃO & RETORNO ════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 pt-2 border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            id="btn-outsourcing-go-back"
            onClick={() => onGoBack ? onGoBack() : setActiveTab("landing")}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-border text-[#172554] text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#172554] stroke-[2.5]" />
            <span>Voltar ao Menu Principal</span>
          </button>
          <div className="h-4 w-px bg-border hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#3B5998] font-mono">
            <span>ECOSSISTEMA</span>
            <span>/</span>
            <span className="text-[#172554] font-bold">OUTSOURCING B2B</span>
          </div>
        </div>

        <div className="border-l-4 border-[#172554] pl-3 py-1 bg-[#F8FAFC] border border-border pr-4 rounded-r-xl flex items-center gap-3">
          <div className="p-1 rounded-lg bg-blue-50 text-[#172554]">
            <TariraOutsourcingIcon size={22} className="text-[#172554]" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest text-[#172554] font-mono uppercase font-bold block">Divisão Corporativa</span>
            <p className="text-xs font-semibold text-[#172554] flex items-center gap-1.5">
              <span>TARIRA Outsourcing & RPO</span>
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════ 1. CABEÇALHO ════════════════════════ */}
      <header className="mb-6 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#172554] text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <TariraOutsourcingIcon size={14} className="text-[#172554]" />
          <span>Solução Corporativa de Recrutamento</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#172554] font-medium tracking-tight leading-tight flex items-center gap-4">
          <TariraOutsourcingIcon size={44} className="text-[#172554] shrink-0" />
          <span className="relative inline-block text-[#172554]">
            TARIRA Outsourcing
            <span className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-[4px] sm:h-[5px] bg-[#172554] rounded-full" />
          </span>
        </h1>

        <p className="text-lg sm:text-2xl text-[#3B5998] font-light mt-2 max-w-3xl leading-snug">
          Recrutamento como parceria, não como transação.
        </p>
      </header>

      {/* ════════════════════════ 2. BANNER PRINCIPAL (CARROSSEL NO TOPO) ════════════════════════ */}
      {/* Movido para cima conforme solicitado pelo utilizador para dar clareza imediata do objetivo */}
      <section className="mb-12 text-left">
        <div 
          className="relative overflow-hidden rounded-3xl border border-border shadow-2xl bg-brand group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Slide Background Image with Transitions */}
          <div className="relative h-[390px] sm:h-[470px] w-full overflow-hidden">
            {carouselSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105 pointer-events-none"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.caption}
                  className="w-full h-full object-cover object-center filter brightness-[0.96] sm:brightness-[1] contrast-[1.03] saturate-[1.05] transition-transform duration-1000 ease-out scale-100"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/5439453/pexels-photo-5439453.jpeg?auto=compress&cs=tinysrgb&w=1600";
                  }}
                />
                {/* Suave degradê que preserva a visibilidade límpida da fotografia de fundo */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#172554]/60 via-[#172554]/15 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#172554]/40 via-transparent to-transparent"></div>
              </div>
            ))}

            {/* Overlaid Banner Content - Opacidade reduzida para destacar a imagem de fundo */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-left pointer-events-none">
              <div className="max-w-3xl space-y-3 sm:space-y-4 p-4 sm:p-6 rounded-2xl bg-[#172554]/35 backdrop-blur-xs border border-white/25 pointer-events-auto shadow-xl">
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/40 text-white text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span>Slide {currentSlide + 1} de {carouselSlides.length} • {carouselSlides[currentSlide].caption}</span>
                </div>

                {/* Título sobreposto */}
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white font-medium tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                  O seu recrutamento. Sem limites.
                </h2>

                {/* Linha de apoio */}
                <p className="text-base sm:text-xl text-blue-200 font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  Equipa dedicada. Resultados contínuos.
                </p>

                <p className="text-xs sm:text-sm text-slate-200 max-w-xl line-clamp-2 font-sans drop-shadow-sm">
                  {carouselSlides[currentSlide].description}
                </p>

                {/* Botão CTA: Fale Connosco */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => scrollToContactOrOpenModal(carouselSlides[currentSlide].caption)}
                    className="px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-[#172554] text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-xl flex items-center gap-2 active:scale-95"
                  >
                    <span>Fale Connosco</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDirectB2BContact}
                    className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <PhoneCall className="w-4 h-4 text-white" />
                    <span>Contacto Direto B2B</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
              <button
                onClick={handlePrevSlide}
                className="w-10 h-10 rounded-xl bg-brand/70 hover:bg-white hover:text-brand text-white border border-white/25 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                title="Slide Anterior"
                aria-label="Slide Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="w-10 h-10 rounded-xl bg-brand/70 hover:bg-white hover:text-brand text-white border border-white/25 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                title="Próximo Slide"
                aria-label="Próximo Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-brand border-t border-white/10 p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {carouselSlides.map((slide, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                      isActive
                        ? "bg-white/20 border-white/50 text-white shadow-sm font-bold"
                        : "bg-white/5 border-white/10 text-blue-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[9px] font-mono font-bold uppercase ${isActive ? "text-white" : "text-blue-300"}`}>
                        0{idx + 1}
                      </span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </div>
                    <span className="text-xs font-bold block truncate">
                      {slide.caption}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════ 3. DESTAQUE "RPO" VERTICAL COM ANIMAÇÃO ORBITAL ════════════════════════ */}
      {/* Signature Header Blue Card with White Text */}
      <section className="mb-12 text-left">
        <div className="card-header-blue relative overflow-hidden rounded-3xl bg-[#172554] border-2 border-[#172554] p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center gap-8 sm:gap-12 text-white">
          
          {/* Ambient Subtle Glow */}
          <div className="absolute top-1/2 -left-10 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* ════ BLOCO RPO COM ANIMAÇÃO ORBITAL CIRCULAR CONTÍNUA ════ */}
          <div className="relative shrink-0 flex flex-col items-center justify-center p-3 select-none">
            
            {/* Cápsula estrutural onde o feixe de luz orbita externamente */}
            <div className="relative w-[130px] sm:w-[150px] h-[270px] sm:h-[300px] flex flex-col items-center justify-center rounded-[28px] bg-[#162C6A] border border-white/20 shadow-2xl backdrop-blur-md">
              
              {/* SVG COM O CAMINHO ORBITAL */}
              <svg 
                className="absolute -inset-[6px] w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none overflow-visible z-20"
                viewBox="0 0 162 312"
                fill="none"
              >
                <defs>
                  <linearGradient id="rpo-gold-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="25%" stopColor="#93c5fd" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="75%" stopColor="#93c5fd" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                  </linearGradient>

                  <filter id="rpo-orbit-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Trilho de fundo subtil */}
                <rect 
                  x="6" y="6" width="150" height="300" rx="30"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                />

                {/* LINHA EM ANIMAÇÃO CONTÍNUA */}
                <rect 
                  x="6" y="6" width="150" height="300" rx="30"
                  stroke="url(#rpo-gold-orbit)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="140 500"
                  filter="url(#rpo-orbit-glow)"
                  className="animate-rpo-orbit"
                />
              </svg>

              {/* Indicador direcional subtil com a rotação contínua */}
              <div className="absolute top-2.5 right-3.5 z-30 opacity-80">
                <RotateCw className="w-3 h-3 text-white animate-spin" style={{ animationDuration: '6s' }} />
              </div>

              {/* As três letras R, P, O em disposição vertical elegante no centro */}
              <div className="relative z-10 flex flex-col items-center justify-between gap-2.5 text-4xl sm:text-5xl font-black font-mono tracking-tighter text-white py-2">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-[#172554] border border-white/30 flex items-center justify-center shadow-lg hover:border-white transition-colors group">
                  <span className="drop-shadow-sm text-white group-hover:scale-105 transition-transform">
                    R
                  </span>
                </div>
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-[#172554] border border-white/30 flex items-center justify-center shadow-lg hover:border-white transition-colors group">
                  <span className="drop-shadow-sm text-white group-hover:scale-105 transition-transform">
                    P
                  </span>
                </div>
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-[#172554] border border-white/30 flex items-center justify-center shadow-lg hover:border-white transition-colors group">
                  <span className="drop-shadow-sm text-white group-hover:scale-105 transition-transform">
                    O
                  </span>
                </div>
              </div>

              {/* Badge na base do bloco */}
              <div className="relative z-10 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[9px] font-mono text-white uppercase tracking-widest font-bold">
                  Modelo B2B
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-100 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>Circuito Ativo 360°</span>
            </div>
          </div>

          {/* ════ TEXTO DE APOIO COM O SLOGAN OFICIAL DA TARIRA ════ */}
          <div className="flex-1 space-y-4 text-left">
            {/* Slogan com a frase oficial da TARIRA */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white font-medium leading-tight">
              Recruitment Process Outsourcing — <span className="text-blue-200">Supervisionamos para que não precise.</span>
            </h2>

            <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-sans max-w-2xl">
              A sua função de recrutamento gerida e assegurada pela TARIRA com excelência: cuidamos de cada detalhe — do diagnóstico cultural ao sourcing, triagem técnica e admissão —, para que a liderança da sua empresa foque 100% no crescimento do negócio principal.
            </p>

            {/* Pilares rápidos de garantia */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white/10 border border-white/20 flex items-center gap-2.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-xs font-semibold text-white">Garantia de 90 dias</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/20 flex items-center gap-2.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-xs font-semibold text-white">SLAs rigorosos</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/20 flex items-center gap-2.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-xs font-semibold text-white">Recrutadores seniores</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => scrollToContactOrOpenModal("Modelo RPO Integral")}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-[#172554] font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 active:scale-95"
              >
                <span>Fale Connosco</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Contacto Direto B2B para envio imediato */}
              <button
                onClick={handleDirectB2BContact}
                className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-white" />
                <span>Contacto Direto B2B</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════ 3.5 GRÁFICO ANIMADO: EXPANSÃO DE CANDIDATOS ════════════════════════ */}
      <section className="mb-14 text-left">
        <TariraOutsourcingGrowthChart />
      </section>

      {/* ════════════════════════ 4. O QUE É / PARA QUE SERVE ════════════════════════ */}
      <section className="mb-14 text-left">
        <div className="p-7 sm:p-10 rounded-2xl bg-white border border-border shadow-sm space-y-8">
          
          <div className="border-l-4 border-[#172554] pl-4 sm:pl-5 space-y-2">
            <span className="text-[10px] font-mono text-[#172554] font-bold uppercase tracking-widest block">
              DEFINIÇÃO OPERACIONAL
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#172554] font-medium leading-relaxed max-w-4xl">
              Assumimos o recrutamento da sua empresa do início ao fim — como se fôssemos o seu próprio departamento de RH.
            </h2>
          </div>

          {/* Ícones + palavra-chave (4): Sourcing, Triagem, Entrevistas, Relatórios */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
            
            {/* 1. Sourcing */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-border hover:border-[#172554]/40 transition-all text-left space-y-3 group shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554] group-hover:scale-110 group-hover:bg-[#172554] group-hover:text-white transition-all">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">01 • Atração</span>
                <h3 className="text-base font-bold text-[#172554] transition-colors">
                  Sourcing
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Busca ativa e contínua dos profissionais mais preparados em Moçambique e no mercado regional.
              </p>
            </div>

            {/* 2. Triagem */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-border hover:border-[#172554]/40 transition-all text-left space-y-3 group shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554] group-hover:scale-110 group-hover:bg-[#172554] group-hover:text-white transition-all">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">02 • Filtragem</span>
                <h3 className="text-base font-bold text-[#172554] transition-colors">
                  Triagem
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Crivo minucioso de perfis, competências comportamentais e conformidade de antecedentes.
              </p>
            </div>

            {/* 3. Entrevistas */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-border hover:border-[#172554]/40 transition-all text-left space-y-3 group shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554] group-hover:scale-110 group-hover:bg-[#172554] group-hover:text-white transition-all">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">03 • Avaliação</span>
                <h3 className="text-base font-bold text-[#172554] transition-colors">
                  Entrevistas
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Entrevistas estruturadas por competências, testes práticos e alinhamento com a cultura da sua empresa.
              </p>
            </div>

            {/* 4. Relatórios */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-border hover:border-[#172554]/40 transition-all text-left space-y-3 group shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554] group-hover:scale-110 group-hover:bg-[#172554] group-hover:text-white transition-all">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">04 • Métricas</span>
                <h3 className="text-base font-bold text-[#172554] transition-colors">
                  Relatórios
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dados consolidados de funil, tempo médio de contratação, custos e cumprimento de SLAs.
              </p>
            </div>

          </div>

          {/* ════ COMPONENTE DESTAQUE: GESTÃO DE TODO O FLUXO DO RH ════ */}
          <div className="pt-6 border-t border-border">
            <div className="p-6 sm:p-8 rounded-2xl bg-blue-50/50 border border-blue-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-[#172554] font-mono text-[10px] font-bold uppercase tracking-wider">
                    Componente Estratégica
                  </span>
                  <span className="text-xs font-mono text-[#3B5998]">• Ciclo Integral</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif text-[#172554] font-bold">
                  Gestão de Todo o Fluxo do RH — <span className="text-blue-700">Conformidade e Compliance Automáticos</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  Quando a TARIRA assume a <strong>gestão de todo o fluxo de Recursos Humanos</strong> — desde o diagnóstico, sourcing, triagem técnica por patamares e entrevistas, até à admissão, contratos e supervisão contínua no posto —, todo o <strong>compliance trabalhista, fiscal e de segurança social</strong> é assegurado de forma 100% integrada e automática, eliminando fricções burocráticas para a sua empresa.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto">
                <div className="px-4 py-2.5 rounded-xl bg-white border border-blue-200 flex items-center gap-2.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-[#172554]">Zero passivos trabalhistas</span>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-white border border-blue-200 flex items-center gap-2.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-[#172554]">Gestão de ponta a ponta</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════ 5. COMO FUNCIONA ════════════════════════ */}
      <section className="mb-14 text-left">
        <div className="border-l-4 border-[#172554] pl-4 mb-6">
          <span className="text-[10px] font-mono text-[#172554] font-bold uppercase tracking-widest block">
            FLUXO DE PARCERIA RPO
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-medium">
            Como Funciona
          </h2>
          <p className="text-xs sm:text-sm text-[#3B5998] mt-1">
            As 6 fases estruturadas para transformar o recrutamento e a gestão contínua da sua equipa.
          </p>
        </div>

        {/* 6 Etapas: 1. Diagnóstico, 2. Equipa Dedicada, 3. Sourcing, 4. Entrevistas, 5. Relatórios, 6. Gestão & Entrega */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {workflowSteps.map((step, idx) => {
            const IconComponent = step.icon;
            const isSelected = businessSubActiveStep === idx;
            return (
              <div
                key={step.num}
                onClick={() => setBusinessSubActiveStep(idx)}
                className={`p-5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? "bg-blue-50/70 border-[#172554] shadow-md scale-[1.02]"
                    : "bg-white border-border hover:border-blue-200 hover:bg-slate-50/50"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-[#172554] font-mono font-bold text-xs flex items-center justify-center">
                      0{step.num}
                    </span>
                    <IconComponent className="w-4 h-4 text-slate-400" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#172554]">
                      {step.num}. {step.title}
                    </h3>
                    <span className="text-[11px] font-mono text-[#3B5998] block mt-0.5 font-semibold">
                      {step.subtitle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {step.metric}
                  </span>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-[#172554]" : "text-slate-300"}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════ 6. CTA FINAL ════════════════════════ */}
      <section className="mb-14 text-left">
        <div className="relative overflow-hidden rounded-3xl bg-[#172554] border-2 border-[#172554] p-8 sm:p-12 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-white" />
              <span>Próximo Passo</span>
            </div>

            {/* Título: Pronto para simplificar o seu recrutamento? */}
            <h2 className="text-2xl sm:text-4xl font-serif text-white font-medium leading-tight">
              Pronto para simplificar o seu recrutamento?
            </h2>

            <p className="text-xs sm:text-sm text-blue-100">
              Converse com os nossos especialistas em RPO e descubra como uma equipa dedicada pode acelerar a contratação dos melhores talentos para o seu negócio.
            </p>
          </div>

          {/* Botão: Fale Connosco */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => scrollToContactOrOpenModal()}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-blue-50 text-[#172554] font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Fale Connosco</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleDirectB2BContact}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5 text-white" />
              <span>Contacto Direto B2B</span>
            </button>
          </div>

        </div>
      </section>

      {/* ════════════════════════ FORMULÁRIO B2B INTEGRADO ════════════════════════ */}
      <section id="outsourcing-solicitation-form" className="p-7 sm:p-10 rounded-3xl bg-white border border-border text-left shadow-lg relative">
        <div className="border-l-4 border-[#172554] pl-4 mb-8">
          <span className="text-[10px] font-mono text-[#172554] font-bold uppercase tracking-widest block">SOLICITAÇÃO DE PROPOSTA RPO</span>
          <h3 className="text-2xl sm:text-3xl font-serif text-[#172554] font-bold">Configurar Proposta de Recrutamento & Outsourcing</h3>
          <p className="text-xs sm:text-sm text-[#3B5998] mt-1">
            Preencha os dados da sua empresa para receber uma proposta técnica detalhada com SLAs e cronograma em até 24 horas úteis.
          </p>
        </div>

        {businessSubSubmitted ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fade-in">
            <span className="text-5xl block">🎉</span>
            <h4 className="text-xl font-bold text-emerald-800">Solicitação Registada com Sucesso!</h4>
            <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
              Obrigado, <strong>{businessSubForm.companyName}</strong>. O seu pedido para <strong>{businessSubForm.operationType}</strong> ({businessSubForm.headcount} vagas / posições estimadas) foi recebido pela nossa equipa de consultores de RPO.
            </p>
            
            <div className="p-4 rounded-xl bg-white border border-border inline-block text-xs text-left max-w-md font-mono space-y-1.5 text-slate-800 mx-auto w-full shadow-xs">
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-slate-500">ID da Solicitação:</span>
                <span className="text-[#172554] font-bold">RPO-{Math.floor(1000 + Math.random() * 9000)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-slate-500">Serviço Selecionado:</span>
                <span className="text-[#172554] font-bold">{businessSubForm.operationType}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-slate-500">Dimensão Prevista:</span>
                <span className="text-[#172554] font-bold">{businessSubForm.headcount} Posições</span>
              </div>
              {businessSubForm.documentName && (
                <div className="flex justify-between text-[#172554] pt-1">
                  <span>📎 Termos de Referência:</span>
                  <span className="truncate max-w-[200px]">{businessSubForm.documentName}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setBusinessSubSubmitted(false);
                  setBusinessSubForm({
                    companyName: "",
                    contactEmail: "",
                    contactPhone: "",
                    operationType: "Sourcing de Talento",
                    headcount: 5,
                    slaLevel: "Ouro (SLA 99%)",
                    comments: "",
                    documentName: undefined,
                    documentSize: undefined,
                    documentData: undefined
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-[#172554] hover:bg-blue-900 text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
              >
                Submeter Nova Solicitação
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!businessSubForm.companyName || !businessSubForm.contactEmail) {
                alert("Por favor, preencha o Nome da Empresa e o E-mail de Contacto.");
                return;
              }

              const proposalData = {
                id: `PROP-RPO-${Date.now().toString().slice(-6)}`,
                source: "outsourcing_rpo",
                businessUnit: "TARIRA Outsourcing (RPO)",
                companyName: businessSubForm.companyName,
                contactPerson: businessSubForm.companyName,
                contactEmail: businessSubForm.contactEmail,
                contactPhone: businessSubForm.contactPhone,
                operationType: businessSubForm.operationType,
                headcount: businessSubForm.headcount,
                slaLevel: businessSubForm.slaLevel,
                comments: businessSubForm.comments,
                documentName: businessSubForm.documentName,
                documentSize: businessSubForm.documentSize,
                documentData: businessSubForm.documentData,
                submittedAt: new Date().toISOString(),
                status: "pending" as const,
                internalNotes: "Solicitação recebida via portal TARIRA Outsourcing / RPO."
              };

              try {
                await fetch("/api/commercial-proposals", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(proposalData)
                });
              } catch (err) {
                console.warn("Aviso ao registar proposta RPO na API:", err);
              }

              if (onAddCommercialProposal) {
                onAddCommercialProposal(proposalData);
              }

              try {
                await fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: businessSubForm.companyName,
                    company: businessSubForm.companyName,
                    phone: businessSubForm.contactPhone,
                    email: businessSubForm.contactEmail,
                    serviceType: `TARIRA Outsourcing - ${businessSubForm.operationType}`,
                    notes: `Vagas/Headcount: ${businessSubForm.headcount}. Nível de SLA: ${businessSubForm.slaLevel}. Detalhes: ${businessSubForm.comments}`
                  })
                });
              } catch (err) {
                console.warn("Aviso ao registar proposta no contacto:", err);
              }

              setBusinessSubSubmitted(true);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172554] block">Nome da Empresa / Instituição *</label>
              <input
                type="text"
                required
                placeholder="Ex: Standard Bank Moçambique, Sasol, Heineken..."
                value={businessSubForm.companyName}
                onChange={(e) => setBusinessSubForm({ ...businessSubForm, companyName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] text-[#172554] text-xs focus:outline-none focus:border-[#172554] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172554] block">E-mail Corporativo *</label>
              <input
                type="email"
                required
                placeholder="rh@empresa.co.mz"
                value={businessSubForm.contactEmail}
                onChange={(e) => setBusinessSubForm({ ...businessSubForm, contactEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] text-[#172554] text-xs focus:outline-none focus:border-[#172554] focus:bg-white font-mono transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172554] block">Telefone / WhatsApp Comercial</label>
              <input
                type="text"
                placeholder="+258 84 000 0000"
                value={businessSubForm.contactPhone}
                onChange={(e) => setBusinessSubForm({ ...businessSubForm, contactPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] text-[#172554] text-xs focus:outline-none focus:border-[#172554] focus:bg-white font-mono transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172554] block">Serviço Principal Requerido *</label>
              <select
                value={businessSubForm.operationType}
                onChange={(e) => setBusinessSubForm({ ...businessSubForm, operationType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] text-[#172554] text-xs focus:outline-none focus:border-[#172554] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="Sourcing de Talento">Card 1 • Sourcing de Talento (Encontramos quem não está à procura)</option>
                <option value="Employer Branding">Card 2 • Employer Branding (A sua marca, atrativa para os melhores)</option>
                <option value="Equipas Embutidas">Card 3 • Equipas Embutidas (Recrutadores TARIRA dentro da sua empresa)</option>
                <option value="Tecnologia de Recrutamento">Card 4 • Tecnologia de Recrutamento (Dados e ferramentas ao seu serviço)</option>
                <option value="Relatórios de Performance">Card 5 • Relatórios de Performance (Visibilidade total do processo)</option>
                <option value="Modelo RPO Integral (End-to-End)">Modelo RPO Integral (End-to-End — Supervisionamos para que não precise)</option>
              </select>
            </div>

            {/* Slider de Volume / Headcount */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#F8FAFC] border border-border">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#172554]">Previsão de Vagas / Contratações</label>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#172554] font-mono font-bold text-xs">
                  {businessSubForm.headcount} Posições
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={businessSubForm.headcount}
                onChange={(e) => setBusinessSubForm({ ...businessSubForm, headcount: Number(e.target.value) })}
                className="w-full accent-[#172554] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 vaga</span>
                <span>10 vagas</span>
                <span>30 equipa</span>
                <span>100+ expansão</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172554] block">Acordo de Nível de Serviço (SLA Requerido)</label>
              <select
                value={businessSubForm.slaLevel}
                onChange={(e) => setBusinessSubForm({ ...businessSubForm, slaLevel: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] text-[#172554] text-xs focus:outline-none focus:border-[#172554] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="Ouro (SLA 99%)">Ouro (SLA 99% • Prioridade Alta e Dedicação Exclusiva)</option>
                <option value="Prata (SLA 95%)">Prata (SLA 95% • Resposta em 48 Horas)</option>
                <option value="Bronze (SLA 90%)">Bronze (SLA 90% • Gestão Padronizada)</option>
                <option value="Personalizado (Concurso / RFP)">Personalizado (Concurso Público / RFP / Grande Escala)</option>
              </select>
            </div>

            {/* Anexo de Documento Comercial / Caderno de Encargos */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#172554] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#172554]" />
                  <span>Anexar Perfil das Vagas ou Termos de Referência (Opcional - PDF)</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">PDF até 2MB</span>
              </div>

              {!businessSubForm.documentName ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-[#172554] bg-blue-50/50 scale-[1.01]"
                      : "border-border hover:border-[#172554]/60 bg-[#F8FAFC] hover:bg-slate-100/50"
                  }`}
                  onClick={() => {
                    const input = document.getElementById("proposal-doc-upload") as HTMLInputElement;
                    if (input) input.click();
                  }}
                >
                  <input
                    id="proposal-doc-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554] mb-1">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-[#172554]">
                      Arraste o ficheiro aqui, ou <span className="text-[#172554] font-bold underline">clique para selecionar</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Descritivos de funções ou cadernos de encargos (Formato PDF • Máx: 2MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#172554] flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#172554] truncate max-w-xs sm:max-w-md block">
                          {businessSubForm.documentName}
                        </span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {businessSubForm.documentSize} • Pronto para encaminhamento comercial
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessSubForm(prev => ({
                        ...prev,
                        documentName: undefined,
                        documentSize: undefined,
                        documentData: undefined
                      }));
                    }}
                    className="p-1.5 rounded-lg bg-white border border-border text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer shadow-xs"
                    title="Remover ficheiro"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {uploadError && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#172554] block">Detalhes Adicionais ou Requisitos Específicos</label>
              <textarea
                placeholder="Indique prazos pretendidos, perfis de competências ou qualquer particularidade da sua empresa..."
                value={businessSubForm.comments}
                onChange={(e) => setBusinessSubForm({ ...businessSubForm, comments: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8FAFC] text-[#172554] text-xs focus:outline-none focus:border-[#172554] focus:bg-white transition-colors"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#172554] hover:bg-blue-900 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Submeter Solicitação de Proposta RPO</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </section>

    </div>
  );
};
