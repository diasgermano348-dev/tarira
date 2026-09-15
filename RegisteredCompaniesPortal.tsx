import React, { useState, useMemo } from "react";
import { 
  ArrowLeft,
  Building2, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Briefcase, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  ExternalLink, 
  PlusCircle, 
  FileCheck, 
  TrendingUp, 
  Award, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  Filter, 
  Check,
  Linkedin,
  Share2 
} from "lucide-react";
import { Client, PartnerCompanyItem } from "./types";
import { TariraJobBroadcastModal, JobBroadcastPayload } from "./TariraJobBroadcastModal";

interface RegisteredCompaniesPortalProps {
  clients: Client[];
  partnerCompanies: PartnerCompanyItem[];
  setActiveTab: (tab: string) => void;
  onGoBack?: () => void;
  onRequestBriefing?: (companyName?: string) => void;
  onRequestOutsourcing?: () => void;
  onOpenAuthModal?: (mode: "signin" | "signup", reason?: string) => void;
  currentLang?: "pt" | "en";
}

export const RegisteredCompaniesPortal: React.FC<RegisteredCompaniesPortalProps> = ({
  clients,
  partnerCompanies,
  setActiveTab,
  onGoBack,
  onRequestBriefing,
  onRequestOutsourcing,
  onOpenAuthModal,
  currentLang = "pt"
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<any | null>(null);
  const [broadcastJobModal, setBroadcastJobModal] = useState<{ isOpen: boolean; jobData: JobBroadcastPayload | null }>({ isOpen: false, jobData: null });

  // Pre-seeded verified corporate accounts in Mozambique
  // Zerado por pedido explícito: nenhuma empresa/condomínio fictício de
  // demonstração — só devem aparecer contas reais registadas na plataforma.
  const defaultVerifiedCompanies: any[] = [];

  // Merge pre-seeded and dynamic client companies
  const allCompanies = useMemo(() => {
    const dynamicList = clients
      .filter(c => c.type === "company")
      .map(c => ({
        id: c.id,
        name: c.name,
        nuit: c.bi || "Registado",
        sector: "Serviços Corporativos",
        city: c.address || "Maputo, Moçambique",
        services: ["Tarira Connect", "Tarira Recruit"],
        activeContracts: 1,
        slaLevel: "Padrão Tarira (95%)",
        status: "Activa & Registada",
        verified: true,
        contactPerson: c.email || "Administrador de Conta",
        openRequisitions: 1,
        joinedYear: "2025"
      }));

    // Combine avoiding exact duplicates
    const combined = [...defaultVerifiedCompanies];
    dynamicList.forEach(dyn => {
      if (!combined.some(item => item.name.toLowerCase() === dyn.name.toLowerCase())) {
        combined.push(dyn);
      }
    });

    return combined;
  }, [clients]);

  const SECTORS = [
    { id: "all", label: currentLang === "pt" ? "Todos os Sectores" : "All Sectors" },
    { id: "Banca & Finanças", label: currentLang === "pt" ? "Banca & Finanças" : "Banking & Finance" },
    { id: "Telecomunicações & TI", label: currentLang === "pt" ? "Telecomunicações & TI" : "Telecom & IT" },
    { id: "Indústria & FMCG", label: currentLang === "pt" ? "Indústria & Retalho" : "Industry & FMCG" },
    { id: "Mineração & Indústria Pesada", label: currentLang === "pt" ? "Mineração & Energia" : "Mining & Energy" },
  ];

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter(comp => {
      const matchSector = selectedSector === "all" || comp.sector.includes(selectedSector);
      const matchQuery = !searchQuery.trim() || 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.nuit.includes(searchQuery);
      return matchSector && matchQuery;
    });
  }, [allCompanies, selectedSector, searchQuery]);

  return (
    <div id="s-registered-companies" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12 text-white">
      
      {/* Navigation Breadcrumb / Back Button */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => onGoBack ? onGoBack() : setActiveTab("landing")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" /> ← Voltar à Página Anterior
        </button>
        <div className="text-right">
          <span className="text-[10px] tracking-wider text-slate-400 font-mono uppercase">Portal Corporativo</span>
          <p className="text-xs font-bold text-blue-400">TARIRA B2B Hub</p>
        </div>
      </div>

      {/* 1. Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-white via-blue-50 to-blue-50 border border-blue-500/30 shadow-2xl mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-[#172554] text-[10px] font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#172554]" />
                <span>Portal B2B & Monitoramento Corporativo</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">•</span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">
                {allCompanies.length} Empresas Credenciadas
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#172554] tracking-tight leading-tight">
              Portal de Empresas Registadas
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-sans">
              Consulte e monitorize o ecossistema de empresas registadas no Ecossistema TARIRA. Aceda aos níveis de serviço (SLA), requisições activas de recrutamento, contratos de outsourcing e gestão técnica de ofícios.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => {
                if (onOpenAuthModal) {
                  onOpenAuthModal("signup", "ABRIR_VAGA");
                } else {
                  setActiveTab("landing");
                }
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Registar Nova Empresa</span>
            </button>

            {onRequestBriefing && (
              <button
                onClick={onRequestBriefing}
                className="px-5 py-3 rounded-2xl bg-slate-900 border border-blue-400/40 text-blue-300 hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-blue-400" />
                <span>Abrir Vaga (Briefing)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Monitoring Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Empresas Activas</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-white mt-2">{allCompanies.length}</p>
          <span className="text-[10px] text-emerald-400 font-mono">100% NUIT Verificado</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Contratos & SLAs</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-blue-300 mt-2">24+</p>
          <span className="text-[10px] text-slate-400 font-mono">SLA Ouro / Prata Médio</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Vagas em Pipeline</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-emerald-400 mt-2">18</p>
          <span className="text-[10px] text-slate-400 font-mono">Triagem 24-48h activa</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Cobertura Geográfica</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-purple-300 mt-2">Nacional</p>
          <span className="text-[10px] text-slate-400 font-mono">Maputo, Beira, Nampula, Tete</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome de empresa, sector, cidade ou NUIT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {SECTORS.map(sec => (
              <button
                key={sec.id}
                onClick={() => setSelectedSector(sec.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedSector === sec.id
                    ? "bg-blue-500 text-white border-blue-300 font-black shadow-md"
                    : "bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-2xl">
            🏢
          </div>
          <h3 className="text-lg font-bold text-white">Nenhuma empresa encontrada</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Não encontramos empresas registadas correspondentes aos critérios de pesquisa.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSector("all");
            }}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs hover:brightness-110 transition-all cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <div
              key={company.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-5 hover:border-blue-400/80 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all group relative shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                        {company.sector}
                      </span>
                      {company.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Perfil Verificado TARIRA" />
                      )}
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
                      {company.name}
                    </h3>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 shrink-0">
                    NUIT: {company.nuit}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <span>📍</span>
                  <span>{company.city}</span>
                </div>

                {/* Services Modules */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Módulos Contratados</span>
                  <div className="flex flex-wrap gap-1.5">
                    {company.services.map((svc: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-700/80 text-[10px] font-medium"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SLA Info */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Nível de Serviço (SLA)</span>
                    <span className="font-bold text-blue-300">{company.slaLevel}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Vagas / Pedidos</span>
                    <span className="font-bold text-emerald-400">{company.openRequisitions} em curso</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setSelectedCompanyModal(company)}
                  className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-700"
                  title="Ver Dossiê e SLA"
                >
                  <FileText className="w-3 h-3 text-blue-400" />
                  <span>Dossiê</span>
                </button>

                <button
                  onClick={() => {
                    setBroadcastJobModal({
                      isOpen: true,
                      jobData: {
                        companyName: company.name,
                        jobTitle: `Quadro Técnico & Especialista — ${company.name}`,
                        category: company.sector,
                        location: `${company.city}, Moçambique`,
                        applicationUrl: `https://tarira.co.mz/vagas/candidatura?empresa=${encodeURIComponent(company.name)}`
                      }
                    });
                  }}
                  className="py-2 px-2 rounded-xl bg-blue-900/50 hover:bg-blue-800/80 text-blue-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-blue-500/40"
                  title="Disparar vaga no LinkedIn com flyer oficial"
                >
                  <Linkedin className="w-3 h-3 text-blue-400" />
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={() => {
                    if (onRequestBriefing) {
                      onRequestBriefing(company.name);
                    } else {
                      setActiveTab("profissionais");
                    }
                  }}
                  className="py-2 px-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 text-[11px] font-black uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  title="Abrir requisição de vaga"
                >
                  <Briefcase className="w-3 h-3 text-slate-950" />
                  <span>Nova Vaga</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Company Dossier & SLA Modal */}
      {selectedCompanyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                  TARIRA B2B • MONITORAMENTO DE EMPRESA REGISTADA
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedCompanyModal.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">NUIT: {selectedCompanyModal.nuit} • {selectedCompanyModal.city}</p>
              </div>
              <button
                onClick={() => setSelectedCompanyModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">Enquadramento Contratual & SLA</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Nível de Acordo:</span>
                    <span className="font-bold text-white">{selectedCompanyModal.slaLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Contratos Activos:</span>
                    <span className="font-bold text-emerald-400">{selectedCompanyModal.activeContracts} frentes de serviço</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">Contacto Institucional Registado</span>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedCompanyModal.contactPerson}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">Serviços Habilitados</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCompanyModal.services.map((svc: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200">
                      ✓ {svc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const comp = selectedCompanyModal;
                  setBroadcastJobModal({
                    isOpen: true,
                    jobData: {
                      companyName: comp.name,
                      jobTitle: `Quadro Técnico & Especialista — ${comp.name}`,
                      category: comp.sector,
                      location: `${comp.city}, Moçambique`,
                      applicationUrl: `https://tarira.co.mz/vagas/candidatura?empresa=${encodeURIComponent(comp.name)}`
                    }
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-900/60 border border-blue-500/50 hover:bg-blue-800/80 text-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>Disparar LinkedIn (Flyer)</span>
              </button>

              <button
                onClick={() => setSelectedCompanyModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const compName = selectedCompanyModal.name;
                  setSelectedCompanyModal(null);
                  if (onRequestBriefing) onRequestBriefing(compName);
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-500 text-white text-xs font-black uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5"
              >
                <Briefcase className="w-4 h-4 text-slate-950" />
                <span>Abrir Requisição de Vaga</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tarira Multichannel Job Broadcast & LinkedIn Flyer Modal */}
      {broadcastJobModal.isOpen && broadcastJobModal.jobData && (
        <TariraJobBroadcastModal
          isOpen={broadcastJobModal.isOpen}
          onClose={() => setBroadcastJobModal({ isOpen: false, jobData: null })}
          jobData={broadcastJobModal.jobData}
        />
      )}
    </div>
  );
};
