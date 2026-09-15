import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Upload, FileText, CheckCircle, X, Layers, Cpu, Globe, Rocket, Shield, ExternalLink, Code, Database, Check, ChevronRight, ChevronLeft, AlertCircle, Compass, MapPin, Handshake, Info, MessageSquare, Zap, Server, Building2, User, Paperclip, Home, Lock, ShieldCheck, Instagram } from "lucide-react";
import { Candidate } from "./types";
import { OrgOperator, OperatorAuditAction } from "./OrganizationAuditPanel";
import { TariraStudioIcon } from "./TariraUnitIcons";
import { uploadImageToImgBB } from "./imgbbUpload";

export interface StudioProjectForm {
  founderName: string;
  clientType?: "company" | "individual";
  companyName?: string;
  projectName: string;
  email: string;
  phone: string;
  solutionType?: string;
  problemDescription?: string;
  projectIdea?: string;
  keyFeatures?: string;
  budgetRange?: string;
  targetDeadline?: string;
  supportNeeded?: string;
  documentName?: string;
  documentSize?: string;
  documentDataUrl?: string;
}

interface TariraStudioModuleProps {
  setActiveTab: (tab: string) => void;
  onGoBack?: () => void;
  candidates: Candidate[];
  hires: any[];

  studioActiveTab: "axofacil" | "tree" | "submit" | "operators" | any;
  setStudioActiveTab: (v: "axofacil" | "tree" | "submit" | "operators" | any) => void;

  studioMerchantStep?: number;
  setStudioMerchantStep?: (v: number | ((prev: number) => number)) => void;
  studioMerchantForm?: any;
  setStudioMerchantForm?: (v: any) => void;
  studioMerchantSubmitted?: boolean;
  setStudioMerchantSubmitted?: (v: boolean) => void;

  studioProjectForm: StudioProjectForm;
  setStudioProjectForm: (v: StudioProjectForm | ((prev: StudioProjectForm) => StudioProjectForm)) => void;
  studioProjectSubmitted: boolean;
  setStudioProjectSubmitted: (v: boolean) => void;

  orgOperators: OrgOperator[];
  setOrgOperators: (v: OrgOperator[] | ((prev: OrgOperator[]) => OrgOperator[])) => void;
  activeOperator: OrgOperator;
  setActiveOperator: (v: OrgOperator) => void;
  operatorAuditLogs: OperatorAuditAction[];
  setOperatorAuditLogs: (v: OperatorAuditAction[] | ((prev: OperatorAuditAction[]) => OperatorAuditAction[])) => void;

  triggerOperationLog: (type: string, detail: string) => Promise<void> | void;
  onAddCommercialProposal?: (p: any) => void;
}

/**
 * TARIRA STUDIO
 * Unidade de Desenvolvimento de Microserviços, Micro-SaaS e Soluções Digitais
 * para Clientes Particulares e Empresas com design editorial e destaques verticais.
 */
export const TariraStudioModule: React.FC<TariraStudioModuleProps> = (props) => {
  const {
    setActiveTab,
    onGoBack,
    studioActiveTab,
    setStudioActiveTab,
    studioProjectForm,
    setStudioProjectForm,
    studioProjectSubmitted,
    setStudioProjectSubmitted,
    triggerOperationLog,
    onAddCommercialProposal,
  } = props;

  const [isAxofacilLinkModalOpen, setIsAxofacilLinkModalOpen] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Masthead banner — reutiliza exatamente a mesma imagem da unidade de
  // negócio "Studio" que já roda no banner principal da landing page.
  const [currentSlide, setCurrentSlide] = useState(0);
  const STUDIO_BANNER_SLIDES = [
    {
      id: "b-studio",
      url: "https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: "Equipa de engenharia de software a desenvolver plataformas digitais",
      badge: "Fábrica de Microserviços & Micro-SaaS",
      desc: "Concepção, design UX/UI e desenvolvimento de plataformas digitais modernas e escaláveis em Moçambique com equipas ágeis e conectadas."
    }
  ];

  useEffect(() => {
    if (STUDIO_BANNER_SLIDES.length < 2) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % STUDIO_BANNER_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [STUDIO_BANNER_SLIDES.length]);


  // Ficheiros de imagem (PNG/JPG) são enviados para o ImgBB; documentos e
  // outros formatos (PDF, Word, Excel, PowerPoint, ZIP) continuam como
  // Base64 local, já que não são imagens e o ImgBB não os aceita.
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("O ficheiro excede o tamanho máximo permitido de 15 MB.");
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    if (file.type.startsWith("image/")) {
      setIsUploadingDoc(true);
      uploadImageToImgBB(file)
        .then((url) => {
          setStudioProjectForm((prev) => ({
            ...prev,
            documentName: file.name,
            documentSize: sizeFormatted,
            documentDataUrl: url,
          }));
          setUploadFeedback(`✓ Imagem "${file.name}" anexada com sucesso.`);
        })
        .catch(() => alert("Erro ao carregar a imagem selecionada."))
        .finally(() => setIsUploadingDoc(false));
      return;
    }

    setIsUploadingDoc(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      setStudioProjectForm((prev) => ({
        ...prev,
        documentName: file.name,
        documentSize: sizeFormatted,
        documentDataUrl: dataUrl,
      }));
      setIsUploadingDoc(false);
      setUploadFeedback(`✓ Documento "${file.name}" anexado com sucesso.`);
    };
    reader.onerror = () => {
      setIsUploadingDoc(false);
      alert("Erro ao ler o ficheiro selecionado.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUploadedDoc = () => {
    setStudioProjectForm((prev) => ({
      ...prev,
      documentName: undefined,
      documentSize: undefined,
      documentDataUrl: undefined,
    }));
    setUploadFeedback(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioProjectForm.founderName || !studioProjectForm.projectName || !studioProjectForm.email || !studioProjectForm.phone) {
      alert("Por favor preencha os campos obrigatórios: Nome, Nome do Projeto, E-mail e Telefone/WhatsApp.");
      return;
    }

    const propId = `PROP-STUDIO-${Date.now().toString().slice(-6)}`;
    const parsedBudget = studioProjectForm.budgetRange ? parseInt(String(studioProjectForm.budgetRange).replace(/[^0-9]/g, "")) || undefined : undefined;
    const proposalData = {
      id: propId,
      source: "study",
      businessUnit: "Tarira Study",
      companyName: studioProjectForm.clientType === "company" && studioProjectForm.companyName ? studioProjectForm.companyName : studioProjectForm.founderName,
      contactPerson: studioProjectForm.founderName,
      contactEmail: studioProjectForm.email,
      contactPhone: studioProjectForm.phone,
      operationType: `Tarira Study: ${studioProjectForm.projectName} (${studioProjectForm.solutionType || "Micro-SaaS & Solução Digital"})`,
      headcount: 1,
      slaLevel: studioProjectForm.targetDeadline || "Normal (3-6 semanas)",
      comments: `Descrição do Projeto: ${studioProjectForm.projectIdea || studioProjectForm.problemDescription || "Desenvolvimento Digital"}. Funcionalidades: ${studioProjectForm.keyFeatures || "A definir"}. Apoio Requerido: ${studioProjectForm.supportNeeded || "Completo"}.`,
      submittedAt: new Date().toISOString(),
      status: "pending" as const,
      documentName: studioProjectForm.documentName,
      documentSize: studioProjectForm.documentSize,
      documentData: studioProjectForm.documentDataUrl,
      budgetEstimateMzn: parsedBudget,
      internalNotes: `Projeto de Plataforma/SaaS submetido via portal TARIRA Studio por ${studioProjectForm.founderName}.`
    };

    try {
      await fetch("/api/commercial-proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData)
      });
    } catch (err) {
      console.warn("Aviso ao registar proposta Studio na API:", err);
    }

    if (onAddCommercialProposal) {
      onAddCommercialProposal(proposalData);
    }

    setStudioProjectSubmitted(true);
    triggerOperationLog(
      "STUDIO_PROJECT_SUBMIT",
      `Novo projeto submetido ao Tarira Studio: "${studioProjectForm.projectName}" por ${studioProjectForm.founderName} (${studioProjectForm.clientType === 'company' ? 'Empresa: ' + (studioProjectForm.companyName || 'N/A') : 'Particular'}) - Notificação oficial por e-mail expedida para tariraecossystem@gmail.com (Ref: ${propId})`
    );
  };

  return (
    <div id="s-studio-sub" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-16 text-slate-800">
      
      {/* 🧭 TOP EDITORIAL NAVIGATION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 pt-2 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            id="studio-btn-back-home"
            onClick={() => onGoBack ? onGoBack() : setActiveTab("landing")}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-border text-[#172554] text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#172554] stroke-[2.5]" />
            <span>Voltar ao Menu Principal</span>
          </button>
          <div className="h-4 w-px bg-border hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>ECOSSISTEMA</span>
            <span>/</span>
            <span className="text-[#172554] font-bold">TARIRA STUDIO</span>
          </div>
        </div>

        {/* Vertical Highlight Badge */}
        <div className="border-l-2 border-[#172554] pl-3 py-1 bg-blue-50/60 border border-blue-100 pr-4 rounded-r-xl flex items-center gap-3">
          <div className="p-1 rounded-lg bg-white border border-blue-200 text-[#172554] shadow-xs">
            <TariraStudioIcon size={20} className="text-[#172554]" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest text-[#172554] font-mono uppercase font-bold block">Fábrica de Microserviços & Micro-SaaS</span>
            <p className="text-xs font-semibold text-[#172554] flex items-center gap-1.5">
              <span>TARIRA Studio Software Lab</span>
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════ MASTHEAD HERO: BANNER FOTOGRÁFICO ════════════════════════ */}
      <section className="relative rounded-3xl overflow-hidden mb-10 shadow-xl border border-blue-900/30 bg-[#172554] min-h-[420px] sm:min-h-[460px] flex items-center">

        {STUDIO_BANNER_SLIDES.map((slide, idx) => (
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#172554]/75 via-[#172554]/60 to-[#172554]/30 sm:bg-gradient-to-r sm:from-[#172554]/75 sm:via-[#172554]/60 sm:to-transparent" />
          </div>
        ))}

        <div className="relative z-10 p-6 sm:p-12 lg:p-14 max-w-3xl text-left text-white w-full">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-[11px] font-mono font-bold tracking-wide backdrop-blur-md">
              <TariraStudioIcon size={14} className="text-blue-300" />
              <span>{STUDIO_BANNER_SLIDES[currentSlide].badge}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal tracking-tight leading-[1.14] mb-4">
            Microserviços & Micro-SaaS com{" "}
            <span className="relative inline-block text-blue-200 font-serif font-bold italic">
              engenharia ágil
              <span className="absolute -bottom-1.5 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 rounded-full animate-trace-line shadow-[0_0_10px_rgba(37,99,235,0.7)]" />
            </span>.
          </h1>

          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-sans max-w-2xl mb-7 font-normal">
            {STUDIO_BANNER_SLIDES[currentSlide].desc}
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              type="button"
              id="btn-studio-banner-iniciar-projeto"
              onClick={() => {
                setStudioActiveTab("submit");
                requestAnimationFrame(() => {
                  document.getElementById("studio-tab-submit")?.scrollIntoView({ behavior: "smooth", block: "center" });
                });
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-[0.98]"
            >
              <Rocket className="w-4 h-4 text-white" />
              <span>Iniciar o Meu Projeto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 mt-6 border-t border-white/20">
            <div>
              <span className="block text-xl sm:text-2xl font-display font-bold text-white tracking-tight">1-4 Semanas</span>
              <span className="text-xs text-blue-200 font-medium">Ciclo de Entrega MVP</span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-display font-bold text-white tracking-tight">M-Pesa / e-Mola</span>
              <span className="text-xs text-blue-200 font-medium">Gateways Nativos de Pagamento</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xl sm:text-2xl font-display font-bold text-white tracking-tight">100% Código Seu</span>
              <span className="text-xs text-blue-200 font-medium">Propriedade Intelectual Plena</span>
            </div>
          </div>
        </div>

        {STUDIO_BANNER_SLIDES.length > 1 && (
          <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + STUDIO_BANNER_SLIDES.length) % STUDIO_BANNER_SLIDES.length)}
              className="w-8 h-8 rounded-full bg-[#172554]/75 border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-[#172554] transition-all cursor-pointer backdrop-blur-md"
              title="Slide anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#172554]/60 backdrop-blur-md border border-white/20">
              {STUDIO_BANNER_SLIDES.map((_, i) => (
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
              onClick={() => setCurrentSlide((prev) => (prev + 1) % STUDIO_BANNER_SLIDES.length)}
              className="w-8 h-8 rounded-full bg-[#172554]/75 border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-[#172554] transition-all cursor-pointer backdrop-blur-md"
              title="Próximo slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* HERO EDITORIAL PRESENTATION */}
      <div className="relative rounded-3xl bg-white border border-border p-7 sm:p-10 mb-10 text-left shadow-sm">
        <div className="relative z-10 max-w-4xl space-y-5">
          {/* Vertical Pill Tag */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#172554] text-xs font-mono font-medium tracking-wider uppercase">
            <TariraStudioIcon size={14} className="text-[#172554]" />
            <span>ENGENHARIA DE SOFTWARE ÁGIL & PLATAFORMAS DIGITAIS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-[#172554] leading-tight">
            Desenvolvimento de <span className="text-[#172554] font-semibold">
              Microserviços & Micro-SaaS
            </span> para Empresas e Fundadores
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans max-w-3xl">
            APIs de pagamento (M-Pesa, e-Mola), portais web, sistemas de gestão e MVPs — entregues em 1 a 4 semanas.
          </p>

          {/* 3 Vertical Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="border-l-2 border-[#172554] pl-4 py-2 bg-slate-50 rounded-r-xl border-y border-r border-border">
              <span className="block text-2xl font-bold font-mono text-[#172554]">1-4 Semanas</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-semibold">Ciclo de Entrega MVP</span>
            </div>

            <div className="border-l-2 border-[#172554] pl-4 py-2 bg-slate-50 rounded-r-xl border-y border-r border-border">
              <span className="block text-2xl font-bold font-mono text-[#172554]">M-Pesa / e-Mola</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-semibold">Gateways Nativos de Pagamento</span>
            </div>

            <div className="border-l-2 border-emerald-600 pl-4 py-2 bg-slate-50 rounded-r-xl border-y border-r border-border">
              <span className="block text-2xl font-bold font-mono text-emerald-700">100% Código Seu</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-semibold">Propriedade Intelectual Plena</span>
            </div>
          </div>

          {/* Subtabs Selection */}
          <div className="pt-4 flex flex-wrap gap-2.5">
            <button
              id="studio-tab-overview"
              onClick={() => setStudioActiveTab("tree")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                studioActiveTab === "tree"
                  ? "bg-[#172554] border-[#172554] text-white shadow-xs"
                  : "bg-slate-100 border-border text-slate-600 hover:bg-white hover:text-[#172554]"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-current" />
              <span>Visão Geral & Pilares de Engenharia</span>
            </button>
            
            <button
              id="studio-tab-axofacil"
              onClick={() => setStudioActiveTab("axofacil")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                studioActiveTab === "axofacil"
                  ? "bg-[#172554] border-[#172554] text-white shadow-xs"
                  : "bg-slate-100 border-border text-slate-600 hover:bg-white hover:text-[#172554]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-current" />
              <span>Plataforma Axofacil (Em Produção)</span>
            </button>

            <button
              id="studio-tab-submit"
              onClick={() => setStudioActiveTab("submit")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                studioActiveTab === "submit"
                  ? "bg-[#172554] border-[#172554] text-white shadow-xs"
                  : "bg-slate-100 border-border text-slate-600 hover:bg-white hover:text-[#172554]"
              }`}
            >
              <Handshake className="w-3.5 h-3.5 text-current" />
              <span>Solicitar Desenvolvimento do Seu Projeto</span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════ ABA 1: VISÃO GERAL & MODELO DE NEGÓCIO ════════════════════════ */}
      {studioActiveTab === "tree" && (
        <div className="space-y-10 animate-fade-in text-left">
          
          {/* 4 Pilares de Engenharia */}
          <div>
            <div className="border-l-2 border-[#172554] pl-4 mb-6">
              <span className="text-[10px] font-mono text-[#172554] font-bold uppercase tracking-widest block">CAPACIDADES TÉCNICAS</span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-bold">
                O Que Desenvolvemos no TARIRA Studio
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Arquitetura modular focada no ecossistema de negócios de Moçambique.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Pillar 1 */}
              <div className="p-6 rounded-2xl bg-white border border-border space-y-3 hover:border-[#172554]/40 hover:bg-blue-50/20 transition-all shadow-xs">
                <div className="flex items-center justify-between">
                  <Server className="w-6 h-6 text-[#172554]" />
                  <span className="text-[10px] font-mono font-bold text-[#172554] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">01 • APIs</span>
                </div>
                <h3 className="text-sm font-bold text-[#172554]">Microserviços & APIs de Pagamento</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gateways C2B/B2C para M-Pesa, e-Mola, SMS transacional e autenticação multifator para integrar no seu sistema.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 rounded-2xl bg-white border border-border space-y-3 hover:border-[#172554]/40 hover:bg-blue-50/20 transition-all shadow-xs">
                <div className="flex items-center justify-between">
                  <Layers className="w-6 h-6 text-[#172554]" />
                  <span className="text-[10px] font-mono font-bold text-[#172554] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">02 • SaaS</span>
                </div>
                <h3 className="text-sm font-bold text-[#172554]">Plataformas Micro-SaaS</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aplicações focadas em verticais de nicho: directórios, reservas de serviços, controlo de stocks e gestão de clientes.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 rounded-2xl bg-white border border-border space-y-3 hover:border-[#172554]/40 hover:bg-blue-50/20 transition-all shadow-xs">
                <div className="flex items-center justify-between">
                  <Building2 className="w-6 h-6 text-[#172554]" />
                  <span className="text-[10px] font-mono font-bold text-[#172554] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">03 • B2B</span>
                </div>
                <h3 className="text-sm font-bold text-[#172554]">Sistemas Sob Medida para Empresas</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Portais internos de gestão, painéis de auditoria operacional e automação de processos corporativos.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-6 rounded-2xl bg-white border border-border space-y-3 hover:border-[#172554]/40 hover:bg-blue-50/20 transition-all shadow-xs">
                <div className="flex items-center justify-between">
                  <Code className="w-6 h-6 text-[#172554]" />
                  <span className="text-[10px] font-mono font-bold text-[#172554] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">04 • MVPs</span>
                </div>
                <h3 className="text-sm font-bold text-[#172554]">MVPs para Empreendedores</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transformamos a sua ideia em software funcional pronto para utilizadores reais, com prototipagem rápida e escalável.
                </p>
              </div>

            </div>
          </div>

          {/* Destaque de Projetos em Produção */}
          <div className="p-7 sm:p-9 rounded-3xl bg-white border border-border shadow-sm space-y-6">
            <div className="border-l-4 border-[#172554] pl-4">
              <span className="text-[10px] font-mono text-[#172554] font-bold uppercase tracking-widest block">CASES DE SUCESSO & PRODUÇÃO</span>
              <h3 className="text-2xl font-serif text-[#172554] font-bold">Plataformas em Funcionamento Real</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card Axofacil */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-border flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-[#172554]" />
                      <div>
                        <h4 className="text-base font-bold text-[#172554]">Plataforma Axofacil</h4>
                        <p className="text-[10px] font-mono text-slate-500">Directório Comercial & Guia Digital</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      EM PRODUÇÃO
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Directório comercial inteligente que conecta empresas e prestadores de serviços aos clientes em todo o território moçambicano, com geolocalização e contacto direto via WhatsApp.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#172554]" /> WhatsApp Direto</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#172554]" /> Geolocalização</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#172554]" /> Sem intermediários</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#172554]" /> Indexado no Google</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setStudioActiveTab("axofacil")}
                    className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#172554] font-bold text-xs transition-all cursor-pointer border border-blue-200 shadow-xs"
                  >
                    Ver Detalhes do Projeto →
                  </button>
                  <a
                    href="http://axofacil.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-border shadow-xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-600" />
                    <span>Visitar Website ↗</span>
                  </a>
                  <a
                    href="https://www.instagram.com/axofacil"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Oficial Axofacil"
                    title="Instagram Oficial Axofacil (@axofacil)"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-border shadow-xs"
                  >
                    <Instagram className="w-3.5 h-3.5 text-slate-600" />
                    <span>@axofacil</span>
                  </a>
                </div>
              </div>

              {/* Card Submissão de Ideia */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-border flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-6 h-6 text-[#172554]" />
                      <div>
                        <h4 className="text-base font-bold text-[#172554]">Tem Uma Ideia ou Necessidade?</h4>
                        <p className="text-[10px] font-mono text-slate-500">Microserviço Sob Medida</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-100 text-[#172554] border border-blue-200">
                      ACEITA PROJETOS
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Precisa de uma automação comercial, integração com M-Pesa, CRM próprio ou plataforma web para o seu negócio? Envie a sua ideia e receba o cronograma técnico em até 48h.
                  </p>

                  <div className="p-3 rounded-xl bg-white border border-border text-xs text-slate-700 flex items-center gap-2 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-[#172554] shrink-0" />
                    <span>Contrato de confidencialidade e entrega de código-fonte inclusos.</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <button
                    onClick={() => setStudioActiveTab("submit")}
                    className="w-full py-2.5 rounded-xl bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Handshake className="w-4 h-4" />
                    <span>Solicitar Desenvolvimento do Seu Projeto →</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ════ BANNER DE FECHO ════ */}
          <div className="relative rounded-3xl bg-[#172554] border-2 border-[#172554] px-8 py-10 sm:px-14 sm:py-12 overflow-hidden shadow-xl text-white">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left max-w-xl">
                <span className="text-[10px] tracking-[0.3em] text-blue-200 uppercase font-black mb-3 block font-mono">
                  DA IDEIA AO SOFTWARE EM PRODUÇÃO
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                  A sua ideia. <span className="text-blue-200">O nosso código.</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStudioActiveTab("submit")}
                className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-[#172554] font-black text-xs uppercase tracking-wider shadow-md hover:bg-blue-50 hover:scale-105 transition-all cursor-pointer"
              >
                <span>Solicitar Desenvolvimento</span>
                <ArrowRight className="w-4 h-4 text-[#172554]" />
              </button>
            </div>
          </div>

        </div>
      )}
      {studioActiveTab === "axofacil" && (
        <div className="space-y-8 animate-fade-in text-left">
          
          <div className="p-7 sm:p-9 rounded-3xl bg-white border border-border shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-[#172554] font-bold uppercase tracking-widest">
                    PROJETO DESENVOLVIDO PELO TARIRA STUDIO
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    EM PRODUÇÃO
                  </span>
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#172554] flex items-center gap-2">
                  <MapPin className="w-7 h-7 text-[#172554]" />
                  <span>Plataforma Axofacil</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <a
                  id="btn-visit-axofacil-platform"
                  href="http://axofacil.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center gap-2 active:scale-95"
                >
                  <Globe className="w-4 h-4" />
                  <span>Aceder a Axofacil ↗</span>
                </a>
                <a
                  href="https://www.instagram.com/axofacil"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Oficial Axofacil"
                  title="Instagram Oficial Axofacil (@axofacil)"
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-[#172554] text-xs font-bold transition-all cursor-pointer border border-border shadow-xs"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsAxofacilLinkModalOpen(true)}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-[#172554] text-xs font-bold transition-all cursor-pointer border border-border shadow-xs"
                  title="Ver detalhes de acesso"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Descrição & Arquitetura */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                <div className="border-l-2 border-[#172554] pl-3">
                  <h3 className="text-base font-bold text-[#172554]">Directório Comercial & Guia Digital de Moçambique</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                  A <strong>Axofacil</strong> é uma plataforma digital desenvolvida integralmente pelo <strong>TARIRA Studio</strong> para conectar os consumidores a comércios, prestadores de serviços e empresas locais em todo o país, eliminando burocracias e permitindo contacto direto via WhatsApp oficial.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-1">
                    <MapPin className="w-5 h-5 text-[#172554]" />
                    <h4 className="text-xs font-bold text-[#172554]">Geolocalização</h4>
                    <p className="text-[11px] text-slate-600">Busca contextual por província e bairro.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-1">
                    <MessageSquare className="w-5 h-5 text-[#172554]" />
                    <h4 className="text-xs font-bold text-[#172554]">WhatsApp Direto</h4>
                    <p className="text-[11px] text-slate-600">Sem comissões sobre as vendas do lojista.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-1">
                    <Zap className="w-5 h-5 text-[#172554]" />
                    <h4 className="text-xs font-bold text-[#172554]">Velocidade SPA</h4>
                    <p className="text-[11px] text-slate-600">Carregamento instantâneo em redes móveis.</p>
                  </div>
                </div>
              </div>

              {/* Stack Técnica Utilizada */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-border space-y-3">
                <div className="border-l-2 border-[#172554] pl-2.5">
                  <span className="text-[10px] font-mono text-[#172554] uppercase font-bold block">STACK TÉCNICA</span>
                  <h4 className="text-xs font-bold text-[#172554]">Tecnologias Utilizadas</h4>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 font-mono">
                  <li className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-[#172554] shrink-0" />
                    <span>React 18 + TypeScript + Tailwind</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#172554] shrink-0" />
                    <span>PostgreSQL Cloud + REST API</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#172554] shrink-0" />
                    <span>Vercel Edge Network Deployment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#172554] shrink-0" />
                    <span>Auditoria de Segurança & CDN</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <a
                    href="http://axofacil.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 text-[#172554] border border-border font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Ver Projeto em Produção</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

            {/* CTA to submit project */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-[#172554]">Quer construir uma solução como esta para o seu setor?</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">O TARIRA Studio estrutura a arquitetura e entrega a solução pronta.</p>
              </div>
              <button
                onClick={() => setStudioActiveTab("submit")}
                className="px-5 py-2.5 rounded-xl bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
              >
                Submeter Projeto ao TARIRA Studio →
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ════════════════════════ ABA 3: SOLICITAR DESENVOLVIMENTO / SUBMETER PROJETO ════════════════════════ */}
      {studioActiveTab === "submit" && (
        <div className="p-7 sm:p-10 rounded-3xl bg-white border border-border text-left shadow-sm animate-fade-in relative">
          
          <div className="border-l-2 border-[#172554] pl-4 mb-8">
            <span className="text-[10px] font-mono text-[#172554] font-bold uppercase tracking-widest block">
              SOLICITAÇÃO DE ENGENHARIA
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-bold">
              Submeter Novo Projeto para o TARIRA Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Particulares e empresas: descreva os requisitos técnicos para receber orçamento e estimativa de entrega em 48h.
            </p>
          </div>

          {studioProjectSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4 max-w-2xl mx-auto animate-fade-in shadow-sm">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-2xl font-serif font-bold text-emerald-900">Solicitação Enviada com Sucesso!</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                A sua proposta para o projeto <strong>"{studioProjectForm.projectName}"</strong> foi registada na fila de engenharia do <strong>TARIRA Studio</strong>.
              </p>

              <div className="p-4 rounded-xl bg-white border border-border text-left text-xs space-y-1.5 font-mono text-slate-800 shadow-xs">
                <p><strong className="text-slate-500">Solicitante:</strong> <span className="text-[#172554] font-semibold">{studioProjectForm.founderName}</span></p>
                <p><strong className="text-slate-500">Contacto:</strong> <span className="text-slate-800">{studioProjectForm.email} • {studioProjectForm.phone}</span></p>
                <p><strong className="text-slate-500">Tipo de Solução:</strong> <span className="text-[#172554] font-semibold">{studioProjectForm.solutionType || "Microserviço Sob Medida"}</span></p>
                {studioProjectForm.documentName && (
                  <p><strong className="text-slate-500">Documento Anexado:</strong> <span className="text-emerald-700 font-semibold">{studioProjectForm.documentName}</span></p>
                )}
              </div>

              <div className="pt-3 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setStudioProjectSubmitted(false);
                    setStudioProjectForm({
                      founderName: "",
                      clientType: "individual",
                      companyName: "",
                      projectName: "",
                      email: "",
                      phone: "",
                      solutionType: "microservico",
                      projectIdea: "",
                      keyFeatures: "",
                      budgetRange: "padrao",
                      targetDeadline: "1_mes",
                      documentName: undefined,
                      documentSize: undefined,
                      documentDataUrl: undefined,
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-border text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-xs"
                >
                  Submeter Outra Solicitação
                </button>
                <button
                  onClick={() => setActiveTab("landing")}
                  className="px-5 py-2.5 rounded-xl bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Voltar ao Início</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* 1. Tipo de Solicitante */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2 font-sans">
                  Tipo de Solicitante *
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setStudioProjectForm((prev) => ({ ...prev, clientType: "individual" }))}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      (studioProjectForm.clientType || "individual") === "individual"
                        ? "bg-[#172554] border-[#172554] text-white shadow-xs"
                        : "bg-[#F8FAFC] border-border text-slate-600 hover:bg-white hover:text-[#172554]"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Particular / Empreendedor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioProjectForm((prev) => ({ ...prev, clientType: "company" }))}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      studioProjectForm.clientType === "company"
                        ? "bg-[#172554] border-[#172554] text-white shadow-xs"
                        : "bg-[#F8FAFC] border-border text-slate-600 hover:bg-white hover:text-[#172554]"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Empresa / Organização</span>
                  </button>
                </div>
              </div>

              {/* 2. Dados de Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 font-sans">
                    Nome Completo do Representante *
                  </label>
                  <input
                    type="text"
                    required
                    value={studioProjectForm.founderName || ""}
                    onChange={(e) => setStudioProjectForm((prev) => ({ ...prev, founderName: e.target.value }))}
                    placeholder="Ex: João Machel"
                    className="w-full bg-[#F8FAFC] border border-border rounded-xl px-4 py-3 text-xs text-[#172554] focus:border-[#172554] focus:bg-white outline-none"
                  />
                </div>

                {studioProjectForm.clientType === "company" && (
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1 font-sans">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      value={studioProjectForm.companyName || ""}
                      onChange={(e) => setStudioProjectForm((prev) => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Ex: Maputo Logística Lda"
                      className="w-full bg-[#F8FAFC] border border-border rounded-xl px-4 py-3 text-xs text-[#172554] focus:border-[#172554] focus:bg-white outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 font-sans">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={studioProjectForm.email || ""}
                    onChange={(e) => setStudioProjectForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="contacto@empresa.co.mz"
                    className="w-full bg-[#F8FAFC] border border-border rounded-xl px-4 py-3 text-xs text-[#172554] focus:border-[#172554] focus:bg-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 font-sans">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={studioProjectForm.phone || ""}
                    onChange={(e) => setStudioProjectForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+258 84 / 82 000 0000"
                    className="w-full bg-[#F8FAFC] border border-border rounded-xl px-4 py-3 text-xs text-[#172554] focus:border-[#172554] focus:bg-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* 3. Projeto & Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 font-sans">
                    Título do Projeto ou Microserviço *
                  </label>
                  <input
                    type="text"
                    required
                    value={studioProjectForm.projectName || ""}
                    onChange={(e) => setStudioProjectForm((prev) => ({ ...prev, projectName: e.target.value }))}
                    placeholder="Ex: Integração M-Pesa para E-Commerce"
                    className="w-full bg-[#F8FAFC] border border-border rounded-xl px-4 py-3 text-xs text-[#172554] focus:border-[#172554] focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 font-sans">
                    Tipo de Solução Desejada *
                  </label>
                  <select
                    value={studioProjectForm.solutionType || "microservico"}
                    onChange={(e) => setStudioProjectForm((prev) => ({ ...prev, solutionType: e.target.value }))}
                    className="w-full bg-[#F8FAFC] border border-border rounded-xl px-4 py-3 text-xs text-[#172554] focus:border-[#172554] focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="microservico">Microserviço / API de Pagamento (M-Pesa, e-Mola, SMS)</option>
                    <option value="microsaas">Plataforma Micro-SaaS (Assinatura Recorrente / Directório)</option>
                    <option value="web_app">Portal Web de Atendimento & Dashboard</option>
                    <option value="mobile_app">App Mobile (Android / iOS)</option>
                    <option value="sistema_gestao">Sistema de Gestão Interno / ERP Sob Medida</option>
                    <option value="outro">Consultoria Técnica Especializada</option>
                  </select>
                </div>
              </div>

              {/* 4. Descrição do Problema */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 font-sans">
                  Descrição da Ideia & Principais Funcionalidades *
                </label>
                <textarea
                  required
                  rows={4}
                  value={studioProjectForm.projectIdea || studioProjectForm.problemDescription || ""}
                  onChange={(e) => setStudioProjectForm((prev) => ({ ...prev, projectIdea: e.target.value, problemDescription: e.target.value }))}
                  placeholder="Descreva detalhadamente o objetivo da plataforma, público-alvo e principais requisitos técnicos..."
                  className="w-full bg-[#F8FAFC] border border-border rounded-xl p-4 text-xs text-[#172554] focus:border-[#172554] focus:bg-white outline-none leading-relaxed"
                ></textarea>
              </div>

              {/* 5. Upload de Documento / Briefing */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#172554]" />
                    <div>
                      <h4 className="text-xs font-bold text-[#172554]">Anexo de Especificações ou Termos de Referência</h4>
                      <p className="text-[11px] text-slate-600">
                        Envie documentos comerciais, wireframes ou rascunhos para análise técnica.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">PDF, DOCX, XLSX (Máx 15MB)</span>
                </div>

                {studioProjectForm.documentName ? (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-[#172554]" />
                      <div>
                        <p className="text-xs font-bold text-[#172554] truncate max-w-xs sm:max-w-md">
                          {studioProjectForm.documentName}
                        </p>
                        <p className="text-[10px] font-mono text-slate-600">
                          {studioProjectForm.documentSize} • Pronto para análise
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveUploadedDoc}
                      className="px-3 py-1 rounded-lg bg-white hover:bg-rose-50 border border-border text-slate-600 hover:text-rose-600 font-bold text-xs transition-all cursor-pointer shadow-xs"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-border hover:border-[#172554]/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#F8FAFC] hover:bg-white transition-all text-center">
                      <Upload className="w-6 h-6 text-[#172554]" />
                      <span className="text-xs font-bold text-[#172554]">
                        {isUploadingDoc ? "A carregar documento..." : "Clique para selecionar ou arraste o ficheiro aqui"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Suporta Documentos PDF, Word, Planilhas ou Imagens
                      </span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                        className="hidden"
                      />
                    </label>
                    {uploadFeedback && (
                      <p className="text-xs text-emerald-700 font-mono mt-2">{uploadFeedback}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Botão de Envio */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500 text-center sm:text-left flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Informações protegidas sob acordo de confidencialidade técnica do TARIRA Studio.</span>
                </p>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Submeter Proposta ao TARIRA Studio</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* ════════════════════════ MODAL: VISITAR AXOFACIL ════════════════════════ */}
      {isAxofacilLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-white max-w-lg w-full text-left space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsAxofacilLinkModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 border border-border text-slate-600 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="border-b border-border pb-3 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-[#172554]" />
              <div>
                <span className="text-[10px] font-mono text-[#172554] font-bold uppercase tracking-wider">
                  PLATAFORMA EM PRODUÇÃO
                </span>
                <h3 className="font-serif text-xl font-bold text-[#172554]">Plataforma Axofacil</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-sans">
              <p>
                A <strong>Plataforma Axofacil</strong> é o directório comercial inteligente concebido pelo <strong>TARIRA Studio</strong> para Moçambique.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-border text-[#172554] font-mono text-xs break-all flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#172554] shrink-0" />
                <span>URL Oficial: <a href="http://axofacil.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[#172554] font-bold underline hover:text-blue-700">http://axofacil.vercel.app/</a></span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-border text-[#172554] font-mono text-xs flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[#172554] shrink-0" />
                <span>Instagram: <a href="https://www.instagram.com/axofacil" target="_blank" rel="noopener noreferrer" className="text-[#172554] font-bold underline hover:text-blue-700">@axofacil</a></span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-between items-center gap-2">
              <button
                onClick={() => setIsAxofacilLinkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
              
              <a
                href="http://axofacil.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>Aceder ao Website Axofacil ↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
