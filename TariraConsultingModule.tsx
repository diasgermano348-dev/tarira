import React, { useState, useEffect } from "react";
import { scrollToForm } from "./scrollToForm";
import { 
  ArrowLeft, ShieldCheck, CheckCircle2, Check, Upload, 
  FileText, X, Download, Building2, TrendingUp, Phone, Mail, 
  FileCheck, Users, Zap, Briefcase, HelpCircle, Lightbulb,
  ChevronRight, ChevronLeft, Award, Clock, Camera, ArrowRight
} from "lucide-react";
import { uploadDocumentToSupabase, saveConsultingRequestToSupabase } from "./supabase";
import { CommercialProposal } from "./types";
import { TariraConsultingIcon } from "./TariraUnitIcons";

export interface ConsultingExternalForm {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType: string;
  requestType: "external_consulting" | "consulting_association";
  details: string;
  budget: string;
  documentName?: string;
  documentSize?: string;
  documentData?: string;
  documentUrl?: string;
}

interface TariraConsultingModuleProps {
  setActiveTab: (tab: string) => void;
  onGoBack?: () => void;
  isAdminLoggedIn: boolean;

  selectedHrModel: "outsourcing" | "recruitment";
  setSelectedHrModel: (v: "outsourcing" | "recruitment") => void;
  simHeadcount: number;
  setSimHeadcount: (v: number | ((prev: number) => number)) => void;
  simRecruitmentLevel: "junior" | "mid" | "senior" | "director";
  setSimRecruitmentLevel: (v: "junior" | "mid" | "senior" | "director") => void;

  consultingReqs: any[];
  setConsultingReqs: (v: any[] | ((prev: any[]) => any[])) => void;

  consultingExternalForm: ConsultingExternalForm;
  setConsultingExternalForm: (v: ConsultingExternalForm | ((prev: ConsultingExternalForm) => ConsultingExternalForm)) => void;
  consultingExternalSubmitted: boolean;
  setConsultingExternalSubmitted: (v: boolean) => void;

  ceoPhoto: string;
  setCeoPhoto: (v: string) => void;

  fetchBackendData: () => Promise<void> | void;
  handleUpdateCeoPhoto: (newPhotoBase64: string) => Promise<any> | any;
  uploadImageToImgBB: (file: File) => Promise<string>;
  onAddCommercialProposal?: (prop: CommercialProposal) => void;
}

export const TariraConsultingModule: React.FC<TariraConsultingModuleProps> = (props) => {
  const {
    setActiveTab, onGoBack, isAdminLoggedIn,
    selectedHrModel, setSelectedHrModel, simHeadcount, setSimHeadcount, simRecruitmentLevel, setSimRecruitmentLevel,
    consultingReqs, setConsultingReqs,
    consultingExternalForm, setConsultingExternalForm, consultingExternalSubmitted, setConsultingExternalSubmitted,
    ceoPhoto, setCeoPhoto,
    fetchBackendData, handleUpdateCeoPhoto, uploadImageToImgBB, onAddCommercialProposal
  } = props;

  const [isDraggingDoc, setIsDraggingDoc] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>("");

  // Masthead banner — reutiliza exatamente a mesma imagem da unidade de
  // negócio "Consultoria" que já roda no banner principal da landing page.
  const [currentSlide, setCurrentSlide] = useState(0);
  const CONSULTING_BANNER_SLIDES = [
    {
      id: "b-consultoria",
      url: "https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: "Diagnóstico estratégico e governança operacional em reunião executiva",
      badge: "Divisão Estratégica & Advisory",
      desc: "Alianças duradouras, diagnóstico estratégico e equipas alinhadas que celebram cada conquista e marco atingido juntos."
    }
  ];

  useEffect(() => {
    if (CONSULTING_BANNER_SLIDES.length < 2) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CONSULTING_BANNER_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [CONSULTING_BANNER_SLIDES.length]);


  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isPdf = fileExt === ".pdf" || file.type === "application/pdf";
    
    if (!isPdf) {
      alert("Por favor selecione um documento exclusivamente em formato PDF (.pdf).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(`O ficheiro PDF excede o tamanho máximo permitido de 2MB (2 Megabytes). O ficheiro selecionado possui ${(file.size / (1024 * 1024)).toFixed(2)} MB. Por favor carregue um ficheiro com até 2MB.`);
      return;
    }

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    setUploadStatusMsg("A processar documento...");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;

      let supabaseUrl: string | undefined = undefined;
      try {
        const uploadResult = await uploadDocumentToSupabase(file, "consulting_proposals");
        if (uploadResult.url) {
          supabaseUrl = uploadResult.url;
        }
      } catch (err) {
        console.warn("Upload fallback local:", err);
      }

      setConsultingExternalForm(prev => ({
        ...prev,
        documentName: file.name,
        documentSize: formattedSize,
        documentData: base64Data,
        documentUrl: supabaseUrl
      }));
      setUploadStatusMsg("Ficheiro anexado com sucesso!");
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultingExternalForm.clientName || !consultingExternalForm.clientEmail || !consultingExternalForm.details) {
      alert("Por favor preencha os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Post to Backend REST API
      await fetch("/api/consulting/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consultingExternalForm)
      });

      // 2. Direct Supabase Table Persistence
      try {
        await saveConsultingRequestToSupabase({
          clientName: consultingExternalForm.clientName,
          clientEmail: consultingExternalForm.clientEmail,
          clientPhone: consultingExternalForm.clientPhone,
          serviceType: consultingExternalForm.serviceType,
          requestType: consultingExternalForm.requestType,
          details: consultingExternalForm.details,
          budget: consultingExternalForm.budget || "Sob Proposta Técnica",
          documentName: consultingExternalForm.documentName,
          documentSize: consultingExternalForm.documentSize,
          documentUrl: consultingExternalForm.documentUrl || consultingExternalForm.documentData,
          status: "pending",
          createdAt: new Date().toISOString()
        });
      } catch (sbErr) {
        console.warn("Aviso na persistência direta do Supabase:", sbErr);
      }

      // 3. Register as Commercial Proposal in Admin Commercial Desk
      if (onAddCommercialProposal) {
        const parsedBudget = parseInt(consultingExternalForm.budget.replace(/[^0-9]/g, "")) || 0;
        const newProposal: CommercialProposal = {
          id: `CONS-${Date.now().toString().slice(-6)}`,
          source: consultingExternalForm.requestType === "consulting_association" ? "consulting_association" : "consulting",
          businessUnit: "Tarira Consulting",
          companyName: consultingExternalForm.clientName,
          contactPerson: consultingExternalForm.clientName,
          contactEmail: consultingExternalForm.clientEmail,
          contactPhone: consultingExternalForm.clientPhone || "840000000",
          operationType: `Consultoria: ${consultingExternalForm.serviceType}`,
          headcount: 1,
          slaLevel: consultingExternalForm.requestType === "consulting_association" ? "Associação / Parceria Técnica" : "Diagnóstico & Implementação",
          comments: consultingExternalForm.details,
          submittedAt: new Date().toISOString(),
          status: "pending",
          documentName: consultingExternalForm.documentName,
          documentSize: consultingExternalForm.documentSize,
          documentData: consultingExternalForm.documentData,
          budgetEstimateMzn: parsedBudget,
          internalNotes: `Solicitação submetida via Subpágina de Consultoria. Tipo: ${consultingExternalForm.requestType === "consulting_association" ? "Associação Externa" : "Consultoria Especializada"}. Orçamento: ${consultingExternalForm.budget || "Sob Proposta Técnica"}`
        };
        onAddCommercialProposal(newProposal);
      }

      setConsultingExternalSubmitted(true);
      fetchBackendData();
    } catch (err) {
      console.error("Erro na submissão do pedido de consultoria:", err);
      setConsultingExternalSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="s-consulting-sub" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 text-slate-800">
      
      {/* ════════════════════════ TOP NAVIGATION BAR ════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5 mb-8">
        <div className="flex items-center gap-3">
          <button 
            id="btn-consulting-go-back"
            onClick={() => onGoBack ? onGoBack() : setActiveTab("landing")}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-border text-[#172554] text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Voltar à Página Anterior"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#172554] stroke-[2.5]" />
            <span>Voltar ao Menu Principal</span>
          </button>
          <div className="h-4 w-px bg-border hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>ECOSSISTEMA</span>
            <span>/</span>
            <span className="text-[#172554] font-bold">CONSULTORIA & GOVERNANÇA</span>
          </div>
        </div>

        {/* Executive Header Badge */}
        <div className="border-l-2 border-[#172554] pl-3 py-1 bg-blue-50/60 border border-blue-100 pr-4 rounded-r-xl flex items-center gap-3">
          <div className="p-1 rounded-lg bg-white border border-blue-200 text-[#172554] shadow-xs">
            <TariraConsultingIcon size={20} className="text-[#172554]" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest text-[#172554] font-mono uppercase font-bold block">Divisão Estratégica & Advisory</span>
            <p className="text-xs font-semibold text-[#172554] flex items-center gap-1.5">
              <span>TARIRA Consulting & Governança</span>
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════ MASTHEAD HERO: BANNER FOTOGRÁFICO ════════════════════════ */}
      <section className="relative rounded-3xl overflow-hidden mb-10 shadow-xl border border-blue-900/30 bg-[#172554] min-h-[420px] sm:min-h-[460px] flex items-center">

        {CONSULTING_BANNER_SLIDES.map((slide, idx) => (
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
              <TariraConsultingIcon size={14} className="text-blue-300" />
              <span>{CONSULTING_BANNER_SLIDES[currentSlide].badge}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal tracking-tight leading-[1.14] mb-4">
            Estruturação e{" "}
            <span className="relative inline-block text-blue-200 font-serif font-bold italic">
              governança operacional
              <span className="absolute -bottom-1.5 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 rounded-full animate-trace-line shadow-[0_0_10px_rgba(37,99,235,0.7)]" />
            </span>.
          </h1>

          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-sans max-w-2xl mb-7 font-normal">
            {CONSULTING_BANNER_SLIDES[currentSlide].desc}
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              type="button"
              id="btn-consulting-banner-solicitar"
              onClick={() => scrollToForm("consulting-tab-form")}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-[0.98]"
            >
              <Briefcase className="w-4 h-4 text-white" />
              <span>Solicitar Diagnóstico Estratégico</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 mt-6 border-t border-white/20">
            <div>
              <span className="block text-xl sm:text-2xl font-display font-bold text-white tracking-tight">+10 Anos</span>
              <span className="text-xs text-blue-200 font-medium">Governança no Terreno</span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-display font-bold text-white tracking-tight">SLA 100%</span>
              <span className="text-xs text-blue-200 font-medium">Auditoria & Produtividade</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xl sm:text-2xl font-display font-bold text-white tracking-tight">Qualquer Setor</span>
              <span className="text-xs text-blue-200 font-medium">Startups, PMEs & Grandes Operações</span>
            </div>
          </div>
        </div>

        {CONSULTING_BANNER_SLIDES.length > 1 && (
          <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + CONSULTING_BANNER_SLIDES.length) % CONSULTING_BANNER_SLIDES.length)}
              className="w-8 h-8 rounded-full bg-[#172554]/75 border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-[#172554] transition-all cursor-pointer backdrop-blur-md"
              title="Slide anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#172554]/60 backdrop-blur-md border border-white/20">
              {CONSULTING_BANNER_SLIDES.map((_, i) => (
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
              onClick={() => setCurrentSlide((prev) => (prev + 1) % CONSULTING_BANNER_SLIDES.length)}
              className="w-8 h-8 rounded-full bg-[#172554]/75 border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-[#172554] transition-all cursor-pointer backdrop-blur-md"
              title="Próximo slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* ════════════════════════ HERO EDITORIAL STAGE ════════════════════════ */}
      <div className="relative rounded-3xl bg-white border border-border p-7 sm:p-10 mb-10 text-left shadow-sm">
        <div className="relative z-10 max-w-4xl space-y-5">
          {/* Vertical Tag */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#172554] text-xs font-mono font-medium tracking-wider uppercase">
            <TariraConsultingIcon size={14} className="text-[#172554]" />
            <span>Consultoria Operacional, Estruturação de Processos & Governança</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-[#172554] leading-tight">
            Estruturação e Governança Operacional:{" "}
            <span className="text-[#172554] font-semibold">
              Para Startups & Empresas de Qualquer Setor
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans max-w-3xl">
            Estruturamos operações: processos, custos, dimensionamento de equipas e governança escalável — para startups, PMEs e grandes operações.
          </p>

          {/* 3 Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-border">
              <span className="block text-2xl font-bold font-mono text-[#172554]">Qualquer Setor</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-medium">Startups, PMEs & Grandes Operações</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-border">
              <span className="block text-2xl font-bold font-mono text-emerald-700">+10 Anos</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-medium">Governança no Terreno</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-border">
              <span className="block text-2xl font-bold font-mono text-[#172554]">SLA 100%</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-medium">Auditoria & Produtividade</span>
            </div>
          </div>

          {/* 4 Core Strategic Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-border">
            <div className="bg-slate-50 p-4 rounded-xl border border-border hover:border-[#172554]/40 hover:bg-blue-50/30 transition-all">
              <div className="flex items-center gap-2 text-[#172554] font-bold text-xs">
                <Lightbulb className="w-4 h-4 text-[#172554]" />
                <span>Startups & Novos Negócios</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Processos, custos e equipa inicial.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-border hover:border-[#172554]/40 hover:bg-blue-50/30 transition-all">
              <div className="flex items-center gap-2 text-[#172554] font-bold text-xs">
                <TrendingUp className="w-4 h-4 text-[#172554]" />
                <span>Produtividade & Escala</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Elimina gargalos, prepara a expansão.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-border hover:border-[#172554]/40 hover:bg-blue-50/30 transition-all">
              <div className="flex items-center gap-2 text-[#172554] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-[#172554]" />
                <span>Governança & Controlo</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Duplo controlo e SLAs auditados.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-border hover:border-[#172554]/40 hover:bg-blue-50/30 transition-all">
              <div className="flex items-center gap-2 text-[#172554] font-bold text-xs">
                <Users className="w-4 h-4 text-[#172554]" />
                <span>Associação & Mentoria</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Consultores sénior e conselho operacional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════ BANNER CENTRAL: PROMESSA DA GOVERNANÇA ════════════════════════ */}
      <div className="relative rounded-3xl bg-[#172554] border-2 border-[#172554] px-8 py-10 sm:px-14 sm:py-12 mb-10 overflow-hidden shadow-xl text-white">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left max-w-xl">
            <span className="text-[10px] tracking-[0.3em] text-blue-200 uppercase font-black mb-3 block font-mono">
              GOVERNANÇA QUE SE VÊ NO RESULTADO
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
              Menos retrabalho. <span className="text-blue-200">Mais controlo.</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => scrollToForm(document.getElementById("consulting-tab-form") || document.querySelector<HTMLElement>("form"))}
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-[#172554] font-black text-xs uppercase tracking-wider shadow-md hover:bg-blue-50 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Solicitar Consultoria</span>
            <ArrowRight className="w-4 h-4 text-[#172554]" />
          </button>
        </div>
      </div>

      {/* ════════════════════════ EXECUTIVE LEADERSHIP SPOTLIGHT ════════════════════════ */}
      <div className="rounded-3xl bg-white border border-border p-6 sm:p-8 mb-10 text-left shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Executive Photo Container */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[220px] aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-slate-100 shadow-sm group">
              <img 
                src={ceoPhoto || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=350&h=350"} 
                alt="Vicente Dias - CEO & Founder" 
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/15 to-transparent pointer-events-none"></div>
              
              {/* Admin Photo Edit Overlay */}
              {isAdminLoggedIn && (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 p-4 text-center">
                    <div className="p-2.5 rounded-full bg-white text-[#172554] mb-1.5 shadow-md">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-white tracking-wider uppercase">Alterar Foto do CEO</span>
                    <span className="text-[8px] text-blue-200 mt-0.5 font-mono">Clique para selecionar imagem</span>
                  </div>

                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadImageToImgBB(file).then((url) => {
                          handleUpdateCeoPhoto(url);
                          alert("Foto oficial de Vicente Dias atualizada com sucesso!");
                        }).catch(() => {
                          alert("Erro ao enviar imagem. Tente novamente.");
                        });
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    title="Carregar nova foto oficial de Vicente Dias"
                  />
                </>
              )}

              <div className="absolute bottom-3 left-3 text-left z-0 pointer-events-none">
                <h4 className="text-sm font-bold text-white drop-shadow-sm">Vicente Dias</h4>
                <p className="text-[10px] text-blue-200 font-mono uppercase font-bold tracking-wide">CEO & Founder</p>
              </div>
            </div>

            {isAdminLoggedIn && (
              <div className="mt-3 w-full max-w-[220px]">
                <label className="w-full cursor-pointer px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#172554] border border-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95">
                  <Camera className="w-3.5 h-3.5 text-[#172554]" />
                  <span>Atualizar Foto Oficial</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadImageToImgBB(file).then((url) => {
                          handleUpdateCeoPhoto(url);
                          alert("Foto de Vicente Dias atualizada com sucesso!");
                        }).catch(() => {
                          alert("Erro ao carregar ficheiro.");
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Executive Bio & Focus */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <div className="border-l-4 border-[#172554] pl-4">
              <span className="text-[10px] font-mono uppercase text-[#172554] tracking-wider font-bold block">Liderança & Experiência de Campo</span>
              <h2 className="text-xl sm:text-2xl font-serif text-[#172554] font-semibold mt-1">
                Mapeamento Operacional e Governança de Processos para Startups & Empresas
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Mais de uma década a desenhar operações e a liderar equipas de <strong className="text-[#172554] font-semibold">500+ profissionais</strong> em Moçambique. <strong>Vicente Dias</strong> aplica métodos rigorosos de custos, processos e governança escalável.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-border">
                <p className="text-[10px] text-[#172554] font-mono uppercase font-bold">Arquitetura de Startups</p>
                <p className="text-xs text-slate-600 mt-1">Fluxos de trabalho, arquitetura de custos e dimensionamento de equipa inicial.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-border">
                <p className="text-[10px] text-[#172554] font-mono uppercase font-bold">Controlo & Validação</p>
                <p className="text-xs text-slate-600 mt-1">Segregação de funções, duplo controlo e redução de desperdício operacional.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-border">
                <p className="text-[10px] text-[#172554] font-mono uppercase font-bold">Monitorização de SLAs & KPIs</p>
                <p className="text-xs text-slate-600 mt-1">Metas de produtividade e indicadores medidos em tempo real para qualquer setor.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════ INTERACTIVE SIMULATOR ════════════════════════ */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 mb-10 text-left shadow-sm">
        <div className="border-l-2 border-[#172554] pl-4 mb-6">
          <span className="text-[10px] font-mono uppercase text-[#172554] tracking-wider font-bold block">MODELAÇÃO OPERACIONAL INTERATIVA</span>
          <h3 className="text-xl font-serif text-[#172554] font-semibold mt-0.5">Calculadora de Otimização Operacional & Produtividade</h3>
          <p className="text-xs text-slate-600 mt-1 font-sans">Estime o impacto direto da padronização de processos, validação redundante e arquitetura de equipa nas operações diárias do seu negócio.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* Slider: Team Size */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-border">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-800 font-sans">Volume / Dimensão da Equipa</label>
                <span className="text-xs text-[#172554] bg-blue-100 px-2.5 py-0.5 rounded-full font-mono font-bold">{simHeadcount} profissionais</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="150" 
                value={simHeadcount} 
                onChange={(e) => setSimHeadcount(Number(e.target.value))}
                className="w-full accent-[#172554] h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 font-sans">Equipa operacional estimada atuando em processos de atendimento, operações ou backoffice.</p>
            </div>

            {/* Toggle: Validation Model */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-border">
              <label className="text-xs font-semibold text-slate-800 block font-sans">Modelo de Fluxo & Validação</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSelectedHrModel("outsourcing")} 
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border font-sans cursor-pointer ${
                    selectedHrModel === "outsourcing" 
                      ? "bg-[#172554] text-white border-[#172554] shadow-xs" 
                      : "bg-white text-slate-600 border-border hover:bg-slate-100"
                  }`}
                >
                  Validação Simples
                </button>
                <button 
                  onClick={() => setSelectedHrModel("recruitment")} 
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border font-sans cursor-pointer ${
                    selectedHrModel === "recruitment" 
                      ? "bg-[#172554] text-white border-[#172554] shadow-xs" 
                      : "bg-white text-slate-600 border-border hover:bg-slate-100"
                  }`}
                >
                  Fluxo Estruturado (Duplo)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                {selectedHrModel === "outsourcing" 
                  ? "Processo linear com revisão pontual. Maior vulnerabilidade a retrabalho." 
                  : "Fluxo com verificação dupla (maker & checker). Retrabalho reduzido a níveis mínimos."}
              </p>
            </div>

            {/* Toggle: Rigor Level */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-border">
              <label className="text-xs font-semibold text-slate-800 block font-sans">Nível de Rigor Operacional & Auditoria</label>
              <div className="flex bg-slate-200/80 p-1 rounded-lg border border-border">
                {[
                  { id: "junior", label: "Padrão" },
                  { id: "mid", label: "Auditado" },
                  { id: "senior", label: "Alta Performance" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSimRecruitmentLevel(item.id as any)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all font-sans cursor-pointer ${
                      simRecruitmentLevel === item.id 
                        ? "bg-[#172554] text-white shadow-xs" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 font-sans mt-1">Frequência de auditorias internas e monitorização contínua de produtividade.</p>
            </div>
          </div>

          {/* Metrics Output Display */}
          <div className="lg:col-span-7 bg-slate-50 border border-border rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#172554] tracking-widest block font-bold mb-4">
                INDICADORES DE DESEMPENHO OPERACIONAL ESTIMADOS
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Metric 1: Risk */}
                <div className="p-4 bg-white rounded-xl border border-border shadow-xs">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Taxa de Risco de Retrabalho / Erro</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-2xl font-bold font-mono ${
                      selectedHrModel === "recruitment" 
                        ? "text-emerald-600" 
                        : simRecruitmentLevel === "senior" ? "text-blue-600" : "text-rose-600"
                    }`}>
                      {selectedHrModel === "recruitment" 
                        ? simRecruitmentLevel === "senior" ? "0.01%" : "0.08%"
                        : simRecruitmentLevel === "senior" ? "2.50%" : "12.40%"}
                    </span>
                    <span className="text-[10px] text-slate-500">prevista</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className={`h-full ${selectedHrModel === "recruitment" ? "bg-emerald-500" : "bg-rose-500"}`} 
                      style={{ width: `${selectedHrModel === "recruitment" ? 4 : 82}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metric 2: Response Speed */}
                <div className="p-4 bg-white rounded-xl border border-border shadow-xs">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Tempo de Resposta Operacional</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-mono text-[#172554]">
                      {selectedHrModel === "recruitment" 
                        ? "12 minutos" 
                        : "1.5 horas"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 font-sans">Tempo médio para identificar e corrigir inconsistências em fluxo.</p>
                </div>

                {/* Metric 3: Quality Index */}
                <div className="p-4 bg-white rounded-xl border border-border shadow-xs">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Índice de Qualidade Consolidado</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-mono text-[#172554]">
                      {selectedHrModel === "recruitment" 
                        ? simRecruitmentLevel === "senior" ? "99.98%" : "99.50%"
                        : "91.20%"}
                    </span>
                    <span className="text-[10px] text-slate-500">SLA operacional</span>
                  </div>
                </div>

                {/* Metric 4: Annual Savings */}
                <div className="p-4 bg-white rounded-xl border border-border shadow-xs">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Economia Operacional Anual Estimada</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-mono text-emerald-600">
                      {((simHeadcount * 11500 * (selectedHrModel === "recruitment" ? 0.40 : 0.15)) * 12).toLocaleString("pt-PT", { maximumFractionDigits: 0 })} MZN
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">Redução direta de custos com ineficiências e retrabalhos.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#172554] flex-shrink-0" />
              <p className="text-xs text-slate-500 italic leading-relaxed font-sans">
                Simulador baseado em parâmetros de governança operacional e auditoria de processos do Ecossistema TARIRA.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════ CONSULTATION & PROPOSAL REQUEST FORM ════════════════════════ */}
      <div id="consulting-tab-form" className="max-w-3xl mx-auto w-full">
        <div className="space-y-6 text-left">
          
          {/* Request Type Selector */}
          <div className="bg-slate-100 border border-border p-1.5 rounded-2xl flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setConsultingExternalForm(prev => ({ ...prev, requestType: "external_consulting" }))}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                consultingExternalForm.requestType === "external_consulting"
                  ? "bg-[#172554] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#172554] hover:bg-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Solicitar Consultoria Operacional</span>
            </button>
            <button
              type="button"
              onClick={() => setConsultingExternalForm(prev => ({ ...prev, requestType: "consulting_association" }))}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                consultingExternalForm.requestType === "consulting_association"
                  ? "bg-[#172554] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#172554] hover:bg-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Solicitar Associação de Consultoria Externa</span>
            </button>
          </div>

          <div className="border-l-2 border-[#172554] pl-4">
            <h2 className="text-xl sm:text-2xl font-serif text-[#172554] font-semibold">
              {consultingExternalForm.requestType === "consulting_association"
                ? "Registo & Solicitação de Associação de Consultoria Externa"
                : "Solicitação de Consultoria Operacional & Estruturação"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1">
              {consultingExternalForm.requestType === "consulting_association"
                ? "Submeta a sua proposta de associação técnica como consultor independente sénior ou entidade técnica para atuação conjunta com a TARIRA."
                : "Descreva a sua iniciativa, desafio operacional ou projeto de estruturação para elaboração de proposta técnica personalizada."}
            </p>
          </div>

          {consultingExternalSubmitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-emerald-900">
                {consultingExternalForm.requestType === "consulting_association"
                  ? "Pedido de Associação Registado com Sucesso!"
                  : "Pedido de Consultoria Recebido com Sucesso!"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans max-w-lg mx-auto">
                O seu pedido foi recebido e registado com sucesso no ecossistema e encaminhado para o nosso <strong>Desk Comercial & Governança</strong>.
              </p>
              
              <div className="p-4 bg-white rounded-xl border border-border text-xs font-mono text-slate-800 text-left space-y-2 max-w-md mx-auto shadow-xs">
                <p className="flex justify-between border-b border-border pb-1">
                  <span className="text-slate-500">Modalidade:</span> 
                  <span className="font-bold text-[#172554]">{consultingExternalForm.requestType === "consulting_association" ? "Associação Externa" : "Consultoria Especializada"}</span>
                </p>
                <p className="flex justify-between border-b border-border pb-1">
                  <span className="text-slate-500">Solicitante:</span> 
                  <span className="text-slate-800 font-semibold">{consultingExternalForm.clientName}</span>
                </p>
                <p className="flex justify-between border-b border-border pb-1">
                  <span className="text-slate-500">E-mail:</span> 
                  <span className="text-slate-800 font-semibold">{consultingExternalForm.clientEmail}</span>
                </p>
                <p className="flex justify-between border-b border-border pb-1">
                  <span className="text-slate-500">Domínio:</span> 
                  <span className="text-[#172554] font-bold">{consultingExternalForm.serviceType}</span>
                </p>
                {consultingExternalForm.documentName && (
                  <p className="flex justify-between border-b border-border pb-1">
                    <span className="text-slate-500">Documento:</span> 
                    <span className="text-emerald-700 font-bold">{consultingExternalForm.documentName} ({consultingExternalForm.documentSize})</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-slate-500">Orçamento / Previsão:</span> 
                  <span className="text-slate-800 font-semibold">{consultingExternalForm.budget || "Sob Proposta Técnica"}</span>
                </p>
              </div>

              <p className="text-xs text-slate-500 italic font-sans">
                A nossa liderança executiva entrará em contacto com brevidade para alinhamento inicial.
              </p>

              <button 
                type="button"
                onClick={() => setConsultingExternalSubmitted(false)} 
                className="px-6 py-3 rounded-xl bg-[#172554] hover:bg-blue-900 text-white text-xs font-bold transition-all w-full max-w-md mx-auto font-sans cursor-pointer shadow-sm"
              >
                Submeter Novo Pedido / Associação
              </button>
            </div>
          ) : (
            <form 
              onSubmit={handleFormSubmit}
              className="p-6 sm:p-8 bg-white border border-border rounded-3xl space-y-5 shadow-sm text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 font-sans block">
                    {consultingExternalForm.requestType === "consulting_association" 
                      ? "Nome do Consultor / Entidade Técnica *" 
                      : "Nome da Empresa / Solicitante *"}
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Mozambique Mining & Logistics Lda"
                    value={consultingExternalForm.clientName}
                    onChange={(e) => setConsultingExternalForm(prev => ({ ...prev, clientName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-border text-xs text-[#172554] placeholder-slate-400 focus:outline-none focus:border-[#172554] focus:bg-white font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 font-sans block">E-mail Corporativo *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="gestao@empresa.co.mz"
                    value={consultingExternalForm.clientEmail}
                    onChange={(e) => setConsultingExternalForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-border text-xs text-[#172554] placeholder-slate-400 focus:outline-none focus:border-[#172554] focus:bg-white font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 font-sans block">Contacto Telefónico / WhatsApp</label>
                  <input 
                    type="tel" 
                    placeholder="+258 84 / 82 000 0000"
                    value={consultingExternalForm.clientPhone || ""}
                    onChange={(e) => setConsultingExternalForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-border text-xs text-[#172554] placeholder-slate-400 focus:outline-none focus:border-[#172554] focus:bg-white font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 font-sans block">
                    Orçamento Estimado / Expectativa Financeira <span className="text-slate-500 font-normal">(Opcional)</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Indique o valor previsto ou deixe em branco (Sob Proposta Técnica)"
                    value={consultingExternalForm.budget}
                    onChange={(e) => setConsultingExternalForm(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-border text-xs text-[#172554] placeholder-slate-400 focus:outline-none focus:border-[#172554] focus:bg-white font-sans"
                  />
                </div>
              </div>

              {/* Comprehensive Domain Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 font-sans block">
                  Segmento / Domínio de Consultoria Requerido *
                </label>
                <select 
                  value={consultingExternalForm.serviceType}
                  onChange={(e) => setConsultingExternalForm(prev => ({ ...prev, serviceType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-border text-xs text-[#172554] font-medium focus:outline-none focus:border-[#172554] focus:bg-white font-sans cursor-pointer"
                >
                  <optgroup label="Startups & Novos Negócios (Qualquer Setor)">
                    <option value="Início de Negócio: Fluxos de Trabalho, Arquitetura de Custos & Equipa">Início de Negócio: Fluxos de Trabalho, Arquitetura de Custos & Equipa</option>
                    <option value="Estruturação Operacional para Startups (Tech, Retalho, Serviços, Comércio)">Estruturação Operacional para Startups (Tech, Retalho, Serviços, Comércio)</option>
                    <option value="Redesenho de Processos & Eliminação de Gargalos">Redesenho de Processos & Eliminação de Gargalos</option>
                  </optgroup>

                  <optgroup label="Produtividade, Escala & Eficiência">
                    <option value="Otimização de Produtividade & Flexibilidade de Operações">Otimização de Produtividade & Flexibilidade de Operações</option>
                    <option value="Definição e Monitorização de KPIs e SLAs Operacionais">Definição e Monitorização de KPIs e SLAs Operacionais</option>
                    <option value="Estruturação de Serviços Partilhados & Backoffice">Estruturação de Serviços Partilhados & Backoffice</option>
                  </optgroup>

                  <optgroup label="Governança, Validação & Auditoria">
                    <option value="Auditoria de Processos Operacionais & Controlo Interno">Auditoria de Processos Operacionais & Controlo Interno</option>
                    <option value="Desenho de Fluxo com Dupla Validação (Makers & Checkers)">Desenho de Fluxo com Dupla Validação (Makers & Checkers)</option>
                    <option value="Plano de Contingência Operacional & Continuidade de Negócio">Plano de Contingência Operacional & Continuidade de Negócio</option>
                  </optgroup>

                  <optgroup label="Associação & Mentoria Executiva">
                    <option value="Associação de Consultoria Técnica Externa">Associação de Consultoria Técnica Externa (Projetos Conjuntos)</option>
                    <option value="Mentoria de Governança Operacional & Conselho">Mentoria de Governança Operacional & Conselho</option>
                  </optgroup>
                </select>
              </div>

              {/* Operational Challenge Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 font-sans block">
                  {consultingExternalForm.requestType === "consulting_association"
                    ? "Detalhes da Proposta de Associação & Perfil de Especialidade *"
                    : "Detalhes do Desafio Operacional / Projeto a Iniciar *"}
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder={
                    consultingExternalForm.requestType === "consulting_association"
                      ? "Descreva a sua experiência, área de especialização e proposta de colaboração..."
                      : "Descreva os principais desafios, equipa envolvida e objetivos da estruturação operacional..."
                  }
                  value={consultingExternalForm.details}
                  onChange={(e) => setConsultingExternalForm(prev => ({ ...prev, details: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-border text-xs text-[#172554] placeholder-slate-400 focus:outline-none focus:border-[#172554] focus:bg-white resize-none font-sans"
                />
              </div>

              {/* Document Upload Component */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 font-sans flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#172554]" />
                    <span>Anexar Termos de Referência / Caderno de Encargos (PDF)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Opcional • Máx 2MB</span>
                </div>

                {!consultingExternalForm.documentName ? (
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingDoc(true); }}
                    onDragLeave={() => setIsDraggingDoc(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingDoc(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                      isDraggingDoc 
                        ? "border-[#172554] bg-blue-50/50" 
                        : "border-border bg-[#F8FAFC] hover:border-[#172554]/60 hover:bg-slate-100/50"
                    }`}
                  >
                    <input 
                      type="file" 
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-[#172554]">
                        Arraste o documento aqui ou <span className="text-[#172554] underline font-bold">clique para carregar</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Formato: <strong className="text-slate-700">PDF (.pdf)</strong> • Tamanho máx: <strong>2MB</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-[#172554]">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#172554] font-mono flex items-center gap-1.5">
                          {consultingExternalForm.documentName}
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-[#172554] border border-blue-200">
                            {consultingExternalForm.documentSize}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                          {uploadStatusMsg || "Ficheiro pronto para envio com a proposta"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConsultingExternalForm(prev => ({
                        ...prev,
                        documentName: undefined,
                        documentSize: undefined,
                        documentData: undefined,
                        documentUrl: undefined
                      }))}
                      className="p-1.5 rounded-lg bg-white border border-border hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all cursor-pointer shadow-xs"
                      title="Remover ficheiro"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 bg-[#172554] hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm font-sans cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>A Processar e Submeter Pedido...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {consultingExternalForm.requestType === "consulting_association"
                        ? "Submeter Proposta de Associação Técnica →"
                        : "Submeter Solicitação de Consultoria Operacional →"}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ════════════════════════ ACTIVITY & AUDIT TRAIL ════════════════════════ */}
      <div className="mt-14 border-t border-border pt-8 text-left">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-md font-serif text-[#172554] font-semibold">Registo de Atividade & Pedidos de Consultoria</h4>
            <p className="text-xs text-slate-500 font-sans">Audit trail em tempo real das solicitações integradas no ecossistema e base de dados.</p>
          </div>
          <button 
            type="button"
            onClick={fetchBackendData} 
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-border rounded-lg text-xs text-slate-700 hover:text-[#172554] transition-all cursor-pointer font-sans shadow-xs"
          >
            Atualizar Auditoria
          </button>
        </div>

        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-slate-50 border border-border rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-mono uppercase text-[#172554] tracking-widest block font-bold border-b border-border pb-2">
              Solicitações Registadas On-Demand ({consultingReqs.length})
            </span>
            {consultingReqs.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-sans py-2">Sem pedidos de consultoria pendentes no momento.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                {consultingReqs.map((req: any) => (
                  <div key={req.id} className="p-3.5 bg-white border border-border rounded-xl space-y-2 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#172554] font-sans">{req.clientName}</p>
                        <p className="text-[11px] text-[#3B5998] font-mono mt-0.5">{req.serviceType}</p>
                      </div>
                      <span className={`text-[8px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono border ${
                        req.status === "completed" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : req.status === "approved" 
                            ? "bg-blue-50 text-[#172554] border-blue-200" 
                            : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {req.status === "pending" ? "pendente" : req.status === "approved" ? "aprovado" : "concluído"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 italic bg-slate-50 p-2 rounded-lg leading-relaxed font-sans border border-border">
                      "{req.details}"
                    </p>
                    <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-500 font-mono gap-2 pt-1 border-t border-border">
                      <span>E-mail: {req.clientEmail}</span>
                      {req.documentName && (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          <FileText className="w-3 h-3" /> {req.documentName}
                        </span>
                      )}
                      <span className="text-[#172554] font-bold">Orçamento: {req.budget || "Sob Proposta"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
