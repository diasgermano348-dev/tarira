import React, { useState } from "react";
import { useBodyScrollLock } from "./useBodyScrollLock";
import {
  User,
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  Award,
  CheckCircle2,
  FileText,
  Download,
  ExternalLink,
  Zap,
  Clock,
  Car,
  Wrench,
  Sparkles,
  Camera,
  Layers,
  ChevronRight,
  Eye,
  Check,
  Building,
  HeartHandshake,
  Lock,
  Image as ImageIcon,
  Info,
  X
} from "lucide-react";
import { Candidate, UserAccountRole } from "./types";

interface CandidateProfileMockupViewerProps {
  onClose?: () => void;
  onContactCommercial?: () => void;
  onRequestBriefing?: () => void;
  onRegisterAccount?: () => void;
  currentLang?: "pt" | "en";
  userRole?: UserAccountRole;
  onSwitchToConnect?: () => void;
  onOpenRegisterModal?: (initialType?: "company" | "condo" | "residential") => void;
}

export const CandidateProfileMockupViewer: React.FC<CandidateProfileMockupViewerProps> = ({
  onClose,
  onContactCommercial,
  onRequestBriefing,
  onRegisterAccount,
  currentLang = "pt",
  userRole = "empresa",
  onSwitchToConnect,
  onOpenRegisterModal
}) => {
  const [profileType, setProfileType] = useState<"technician" | "professional">("technician");
  const [selectedTechIndex, setSelectedTechIndex] = useState<number>(0);
  const [selectedProfIndex, setSelectedProfIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"public_view" | "structure_guide">("public_view");
  const [showRoleGateModal, setShowRoleGateModal] = useState<boolean>(false);
  useBodyScrollLock(showRoleGateModal);

  const canAccessCorporateRecruit = userRole === "empresa" || userRole === "condominio" || userRole === "admin";

  // ══════════════════════════════════════════════════════════════════════════
  // 2 MOCKUPS: TÉCNICOS DE OFÍCIO (TARIRA CONNECT ⚡)
  // ══════════════════════════════════════════════════════════════════════════
  const technicianProfiles: Candidate[] = [
    {
      id: "mockup-tech-01",
      name: "Mateus",
      surname: "Bila",
      title: "Mestre Eletricista & Técnico Solar Certificado",
      category: "tech",
      subCategory: "Instalação Solar & Energia ⚡",
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
        "Climatização & Inversores Híbridos",
        "Automação Predial Básica",
        "Piquete de Emergência 24/7"
      ],
      personalValues: ["Segurança Rigorosa", "Pontualidade Absoluta", "Garantia Escrita"],
      documents: [
        { type: "cv", title: "Currículo Técnico Homologado (PDF)", issuer: "Arquivo de Registo / ATS Homologado", status: "verified" },
        { type: "cert", title: "Certificado de Técnico Eletricista Nível V (IFPELAC)", issuer: "IFPELAC Moçambique", expiry: "2028", status: "verified" },
        { type: "cert", title: "Instalações Solares Fotovoltaicas Avançadas", issuer: "Solar Academy Maputo", status: "verified" },
        { type: "police", title: "Registo Criminal Válido e Limpo", issuer: "Ministério da Justiça MZ", status: "verified" }
      ],
      portfolio: [
        { url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80", caption: "Sistema Solar 12kWp com 8 Baterias de Lítio (Triunfo, Maputo)" },
        { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80", caption: "Remodelação Integral de Quadro Geral Trifásico e Proteção Diferencial" },
        { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80", caption: "Montagem de Inversores Híbridos e Estabilizadores Industriais" }
      ],
      reviews: [
        { reviewer: "Eng. Armindo Cossa (Gestor de Condomínio Marés)", date: "14 Jul 2026", rating: 5.0, quality: 5, punctuality: 5, cleanliness: 5, text: "Excelente prestador! O Mateus resolveu uma avaria crítica no quadro geral do edifício em menos de 2 horas. Diagnóstico preciso e área de trabalho impecavelmente limpa." }
      ]
    },
    {
      id: "mockup-tech-02",
      name: "Celso",
      surname: "Nhantumbo",
      title: "Técnico Especialista em Hidráulica & Eletrobombas",
      category: "tech",
      subCategory: "Canalização & Redes de Água 🚰",
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
        { type: "cv", title: "Currículo e Folha de Obra (PDF)", issuer: "Arquivo de Registo / ATS Homologado", status: "verified" },
        { type: "cert", title: "Certificado de Redes Hídricas Prediais", issuer: "Instituto Industrial de Maputo", status: "verified" }
      ],
      portfolio: [
        { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80", caption: "Substituição completa de prumada hidráulica em edifício de 6 andares" },
        { url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80", caption: "Instalação de banco de 2 eletrobombas com tanque de pressão de 500L" }
      ],
      reviews: [
        { reviewer: "Teresa Mabjaia (Proprietária em Sommerschield)", date: "08 Ago 2026", rating: 5.0, text: "O Celso localizou uma fuga de água subterrânea que ninguém conseguia achar há 3 meses. Serviço limpo, rápido e muito educado." }
      ]
    }
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // 2 MOCKUPS: TALENTOS E QUADROS CORPORATIVOS (TARIRA RECRUIT 💼)
  // ══════════════════════════════════════════════════════════════════════════
  const professionalProfiles: Candidate[] = [
    {
      id: "mockup-prof-01",
      name: "Dra. Nádia",
      surname: "Sitoe",
      title: "Senior AI & Data Solutions Architect",
      category: "prof",
      subCategory: "Inteligência Artificial & Dados 🤖",
      city: "Maputo (Disponibilidade Híbrida / Remota)",
      residence: "Polana Cimento, Maputo",
      email: "nadia.sitoe@tarira.recruit.mz",
      phone: "+258 82 450 9921",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      promiseScore: 99,
      rating: 5.0,
      experienceYears: 7,
      expectedSalaryMin: 190000,
      expectedSalaryMax: 260000,
      workType: "Híbrido / Remoto / Presencial Executivo",
      bio: "Engenheira de Dados e Especialista em Arquitetura de IA com 7 anos de experiência no setor financeiro e telecomunicações. Liderou a implantação de pipelines preditivos de crédito, modelos LLM e conformidade regulatória de dados.",
      whyWork: "Foco na criação de valor através de inteligência artificial prática, redução de custos operacionais e governança de dados escalável.",
      skills: [
        "Large Language Models (LLMs) & RAG",
        "Python, PyTorch & TensorFlow",
        "Data Warehousing (BigQuery, Snowflake)",
        "Governança & Segurança de Dados (ISO 27001)",
        "MLOps & CI/CD Pipelines",
        "Liderança Técnica Ágil"
      ],
      documents: [
        { type: "cv", title: "Curriculum Vitae Executivo (PDF)", issuer: "Arquivo de Registo / ATS Homologado", status: "verified" },
        { type: "degree", title: "Mestrado em Ciência da Computação e IA", issuer: "Universidade Eduardo Mondlane", status: "verified" },
        { type: "cert", title: "Google Cloud Professional Data Engineer", issuer: "Google Cloud", expiry: "2028", status: "verified" }
      ],
      reviews: [{ reviewer: "Dr. Fernando Tembe (Diretor de Tecnologia - Banco MZ)", date: "28 Mai 2026", rating: 5.0, text: "A Nádia é uma das mais brilhantes mentes em arquitetura de dados no país. A sua capacidade de desenhar sistemas preditivos seguros é excecional." }]
    },
    {
      id: "mockup-prof-02",
      name: "Eng. Lucas",
      surname: "Macuácua",
      title: "Lead Cybersecurity Specialist & SOC Analyst",
      category: "prof",
      subCategory: "Cibersegurança & Proteção de Redes 🛡️",
      city: "Maputo, Moçambique",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      promiseScore: 98,
      rating: 4.95,
      experienceYears: 6,
      expectedSalaryMin: 160000,
      expectedSalaryMax: 220000,
      workType: "Híbrido / Presencial",
      bio: "Especialista em segurança ofensiva e defensiva, testes de intrusão (pentest), monitorização de incidentes SOC 24/7 e conformidade com diretrizes do Banco de Moçambique.",
      skills: ["Penetration Testing (Kali Linux)", "SIEM (Splunk, Elastic)", "Firewalls Palo Alto & Fortinet", "Normas ISO 27001 & NIST", "Resposta a Incidentes & Forense Digital"],
      documents: [
        { type: "cv", title: "CV Executivo de Segurança (PDF)", issuer: "Arquivo de Registo / ATS Homologado", status: "verified" },
        { type: "cert", title: "Certified Ethical Hacker (CEH v12)", issuer: "EC-Council", status: "verified" }
      ]
    }
  ];

  const currentCandidateList = profileType === "technician" ? technicianProfiles : professionalProfiles;
  const currentCandidate =
    profileType === "technician"
      ? technicianProfiles[selectedTechIndex] || technicianProfiles[0]
      : professionalProfiles[selectedProfIndex] || professionalProfiles[0];

  return (
    <div className="w-full text-left space-y-6 animate-fade-up">
      {/* Top Banner / Explanation of Profile Structure */}
      <div className="p-6 rounded-3xl bg-background border border-border shadow-xs relative overflow-hidden text-text-primary">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-light" />
              <span>CATÁLOGO DE MOCKUPS OFICIAIS • 10 TÉCNICOS & 10 PROFISSIONAIS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Estrutura Visual do Perfil do Prestador & Profissional
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-3xl mt-1 leading-relaxed">
              Explore <strong>10 perfis técnicos completos</strong> (TARIRA Connect) e <strong>10 perfis executivos qualificados</strong> (TARIRA Recruit). Inclui <strong>foto de rosto proporcional 1:1</strong>, <strong>portfólio visual</strong>, <strong>carreira</strong> e <strong>documentos protegidos para a Central TARIRA / Administrador</strong>.
            </p>

            {/* Profile Visibility & Access Guide */}
            <div className="mt-3 p-3 rounded-2xl bg-background-secondary border border-border grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="text-sm">🏢</span>
                <div>
                  <strong className="text-text-primary block">Perfil Empresa (B2B):</strong>
                  <span className="text-text-secondary">Acesso total (Connect + Recruit)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm">🏛️</span>
                <div>
                  <strong className="text-text-primary block">Perfil Condomínio:</strong>
                  <span className="text-text-secondary">Acesso total (Connect + Recruit)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm">🏠</span>
                <div>
                  <strong className="text-brand block">Perfil Lar:</strong>
                  <span className="text-text-secondary">Foco em Técnicos & Ofícios (Connect)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === "public_view" ? "structure_guide" : "public_view")}
              className="px-4 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-brand border border-border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Layers className="w-4 h-4" />
              <span>{viewMode === "public_view" ? "Regras & Uploads" : "Ver Perfil Público"}</span>
            </button>
            {onRegisterAccount && (
              <button
                onClick={onRegisterAccount}
                className="px-5 py-2.5 rounded-xl bg-brand-light hover:bg-brand text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                + Criar Conta Agora
              </button>
            )}
          </div>
        </div>

        {/* Profile Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-6 mt-4 border-t border-border">
          <button
            onClick={() => setProfileType("technician")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              profileType === "technician"
                ? "bg-brand text-white border-brand shadow-xs font-bold"
                : "bg-background text-text-secondary border-border hover:bg-background-secondary hover:text-text-primary"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>🔧 10 Perfis: Técnicos de Ofício (TARIRA Connect)</span>
          </button>

          <button
            onClick={() => setProfileType("professional")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              profileType === "professional"
                ? "bg-brand text-white border-brand shadow-xs font-bold"
                : "bg-background text-text-secondary border-border hover:bg-background-secondary hover:text-text-primary"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>💼 10 Perfis: Profissionais Qualificados (TARIRA Recruit)</span>
          </button>
        </div>

        {/* Sub-selector for each of the 10 profiles */}
        <div className="flex flex-wrap gap-1.5 pt-3">
          {currentCandidateList.map((cand, idx) => {
            const isSelected = profileType === "technician" ? selectedTechIndex === idx : selectedProfIndex === idx;
            return (
              <button
                key={cand.id}
                onClick={() => {
                  if (profileType === "technician") setSelectedTechIndex(idx);
                  else setSelectedProfIndex(idx);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-brand/10 border-brand text-brand font-bold shadow-xs ring-1 ring-brand"
                    : "bg-background border-border text-text-secondary hover:text-text-primary hover:bg-background-secondary"
                }`}
              >
                <span className="font-mono text-[10px] text-brand-light">#{idx + 1}</span>
                <span>{cand.name} {cand.surname}</span>
                <span className="text-[10px] opacity-70 hidden sm:inline">({cand.subCategory?.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: PUBLIC PROFILE MOCKUP */}
      {viewMode === "public_view" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Profile Identification & Primary Metrics */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Main Identification Card */}
            <div className="p-6 rounded-3xl bg-background border border-border shadow-xs space-y-5 text-center relative overflow-hidden text-text-primary">
              
              {/* Top verification badge */}
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success/15 border border-status-success/30 text-[10px] font-mono font-bold text-status-success">
                  <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                  <span>PERFIL VETTED TARIRA</span>
                </span>
                <span className="text-[10px] font-mono text-brand font-bold bg-brand/10 px-2.5 py-0.5 rounded-full border border-brand/20">
                  {currentCandidate.category === "tech" || currentCandidate.category === "dom" ? "TARIRA Connect ⚡" : "TARIRA Recruit 💼"}
                </span>
              </div>

              {/* Photo 1:1 Dimension Box with Visible Framing */}
              <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-1 bg-background-secondary border border-border shadow-md">
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-background relative group">
                  <img
                    src={currentCandidate.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400"}
                    alt={currentCandidate.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Photo dimension indicator tag */}
                  <div className="absolute bottom-2 inset-x-2 bg-background/90 backdrop-blur-xs py-0.5 px-2 rounded-lg text-[9px] font-mono text-text-primary font-semibold border border-border">
                    📷 Rosto / Ombros (1:1 HD)
                  </div>
                </div>
                {/* Active Availability Dot */}
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-status-success border-2 border-background flex items-center justify-center text-[10px] text-white shadow-xs font-bold" title="Disponível para Trabalho">
                  ✓
                </div>
              </div>

              {/* Candidate Names & Title */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {currentCandidate.name} {currentCandidate.surname}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-brand-light mt-1">
                  {currentCandidate.title}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary mt-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-light shrink-0" />
                  <span>{currentCandidate.city || "Maputo, Moçambique"}</span>
                </div>
              </div>

              {/* Rating & Promise Score Grid */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                <div className="p-2.5 rounded-2xl bg-background-secondary border border-border text-center">
                  <span className="text-[10px] font-mono text-text-secondary block uppercase">Avaliação Clientes</span>
                  <div className="flex items-center justify-center gap-1 text-sm font-black text-brand mt-0.5">
                    <Star className="w-4 h-4 fill-status-warning text-status-warning" />
                    <span>{currentCandidate.rating || 4.9}</span>
                    <span className="text-[10px] text-text-secondary font-normal">({currentCandidate.completedJobs || 45})</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-background-secondary border border-border text-center">
                  <span className="text-[10px] font-mono text-text-secondary block uppercase">Promise Score SLA</span>
                  <div className="flex items-center justify-center gap-1 text-sm font-black text-status-success mt-0.5">
                    <Zap className="w-4 h-4 text-status-success" />
                    <span>{currentCandidate.promiseScore || 98}%</span>
                  </div>
                </div>
              </div>

              {/* Financial Rate or Expected Salary */}
              <div className="p-3.5 rounded-2xl bg-background-secondary border border-border text-left space-y-1">
                <span className="text-[10px] font-mono uppercase text-brand font-bold block">
                  {currentCandidate.category === "tech" || currentCandidate.category === "dom" ? "Tarifa Operacional Homologada" : "Faixa Salarial / Remuneração"}
                </span>
                <div className="text-base sm:text-lg font-mono font-black text-text-primary">
                  {currentCandidate.category === "tech" || currentCandidate.category === "dom" ? (
                    <span>{currentCandidate.rateMzn?.toLocaleString()} MZN <span className="text-xs text-text-secondary font-normal">/ dia (ou serviço)</span></span>
                  ) : (
                    <span>{currentCandidate.expectedSalaryMin?.toLocaleString()} - {currentCandidate.expectedSalaryMax?.toLocaleString()} MZN <span className="text-xs text-text-secondary font-normal">/ mês</span></span>
                  )}
                </div>
                {currentCandidate.availableForEmergency && (
                  <p className="text-[10px] text-status-success font-medium flex items-center gap-1 pt-1">
                    <span>⚡ Disponível para Piquete & Emergências 24h</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    if (profileType === "professional" && !canAccessCorporateRecruit) {
                      setShowRoleGateModal(true);
                    } else if (onContactCommercial) {
                      onContactCommercial();
                    }
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
                    profileType === "professional" && !canAccessCorporateRecruit
                      ? "bg-background-secondary text-brand border border-border hover:bg-slate-200"
                      : "bg-brand-light hover:bg-brand text-white shadow-xs"
                  }`}
                >
                  {profileType === "professional" && !canAccessCorporateRecruit ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-brand-light" />
                      <span>Recrutamento B2B (Exclusivo Empresa / Condomínio)</span>
                    </>
                  ) : (
                    <span>🚀 Solicitar Alocação / Contratação</span>
                  )}
                </button>
                {onRequestBriefing && (
                  <button
                    onClick={() => {
                      if (profileType === "professional" && !canAccessCorporateRecruit) {
                        setShowRoleGateModal(true);
                      } else {
                        onRequestBriefing();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-background hover:bg-background-secondary text-text-primary font-bold text-xs transition-all cursor-pointer border border-border flex items-center justify-center gap-2 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-light" />
                    <span>Abrir Briefing / Vaga Técnica</span>
                  </button>
                )}
              </div>
            </div>

            {/* Practical Logistics & Availability Card */}
            <div className="p-5 rounded-3xl bg-background border border-border shadow-xs space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-brand tracking-wider">
                📍 Condições Operacionais
              </h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex items-center justify-between">
                  <span className="text-text-secondary">Anos de Experiência:</span>
                  <strong className="text-text-primary font-mono">{currentCandidate.experienceYears || 7} Anos Comprovados</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-text-secondary">Regime de Trabalho:</span>
                  <strong className="text-brand">{currentCandidate.workType || "Presencial & Campo"}</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-text-secondary">Transporte / Ferramental:</span>
                  <strong className="text-status-success">{currentCandidate.ownTransport ? "Viatura & Ferramental Próprio" : "Equipamento Móvel"}</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-text-secondary">Raio de Deslocação:</span>
                  <strong className="text-text-primary font-mono">{currentCandidate.travelRadius || 35} km</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Detailed Career Bio, Skills, Portfolio Gallery, Experience & Reviews */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Career Summary & What They Do (Bio) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-background border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="text-sm font-bold uppercase text-brand tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-light" />
                  <span>Apresentação da Carreira & O que Faz</span>
                </h4>
                <span className="text-[11px] font-mono text-text-secondary bg-background-secondary px-2.5 py-1 rounded-lg border border-border">
                  {currentCandidate.subCategory || "Especialista"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                {currentCandidate.bio}
              </p>
              {currentCandidate.whyWork && (
                <div className="p-3.5 rounded-2xl bg-background-secondary border-l-4 border-brand-light text-xs text-text-primary italic leading-relaxed shadow-xs">
                  "{currentCandidate.whyWork}"
                </div>
              )}
            </div>

            {/* 2. Skills & Competencies */}
            <div className="p-6 rounded-3xl bg-background border border-border shadow-xs space-y-4">
              <h4 className="text-sm font-bold uppercase text-brand tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-light" />
                <span>Competências Chave & Especializações</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {(currentCandidate.skills || []).map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-3 py-1.5 rounded-xl bg-background-secondary text-brand border border-border text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Visual Portfolio Gallery (Images of field works / projects) */}
            {currentCandidate.portfolio && currentCandidate.portfolio.length > 0 && (
              <div className="p-6 rounded-3xl bg-background border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-sm font-bold uppercase text-brand tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-brand-light" />
                    <span>Portfólio de Obras & Trabalhos Realizados</span>
                  </h4>
                  <div className="inline-flex items-center gap-1.5 text-xs text-brand font-mono bg-brand/10 px-2.5 py-0.5 rounded-full border border-brand/20">
                    <Lock className="w-3 h-3" />
                    <span>🔒 Visível para Central & Clientes Homologados</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentCandidate.portfolio.map((item, pIdx) => (
                    <div key={pIdx} className="group relative rounded-2xl overflow-hidden bg-background-secondary border border-border shadow-xs">
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="p-2.5 bg-background-secondary border-t border-border text-[11px] text-text-primary font-medium leading-snug">
                        {item.caption}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Verified Documentation & Credentials (Strictly protected for Central / Admin) */}
            <div className="p-6 rounded-3xl bg-background border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="text-sm font-bold uppercase text-brand tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-light" />
                  <span>Documentos & CVs Carregados</span>
                </h4>
                <span className="text-[10px] font-mono text-status-success bg-status-success/15 px-2.5 py-1 rounded-full border border-status-success/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-status-success" />
                  <span>Acesso Restrito: Central TARIRA / Admin</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(currentCandidate.documents || [
                  { type: "cv", title: "Currículo Vitae em PDF (Opcional)", issuer: "Central Administrativa TARIRA", status: "verified" },
                  { type: "cert", title: "Certificado de Formação Técnica", issuer: "Entidade Homologada", status: "verified" }
                ]).map((doc, dIdx) => (
                  <div key={dIdx} className="p-3 rounded-2xl bg-background-secondary border border-border flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-status-success/15 border border-status-success/30 flex items-center justify-center text-status-success shrink-0 mt-0.5 font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{doc.title}</p>
                      <p className="text-[10px] text-text-secondary font-mono">{doc.issuer || "Central TARIRA"} • Homologado</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Client Reviews & Endorsements */}
            {currentCandidate.reviews && currentCandidate.reviews.length > 0 && (
              <div className="p-6 rounded-3xl bg-background border border-border shadow-xs space-y-4">
                <h4 className="text-sm font-bold uppercase text-brand tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-brand-light" />
                  <span>Depoimentos & Avaliações de Clientes</span>
                </h4>

                <div className="space-y-3">
                  {currentCandidate.reviews.map((rev, rIdx) => (
                    <div key={rIdx} className="p-4 rounded-2xl bg-background-secondary border border-border space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand">{rev.reviewer}</span>
                        <div className="flex items-center gap-1 text-xs text-status-warning font-mono">
                          <span>★ {rev.rating}</span>
                          {rev.date && <span className="text-text-secondary text-[10px]">({rev.date})</span>}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary italic leading-relaxed">
                        "{rev.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: REGISTRATION ARCHITECTURE GUIDE */
        <div className="p-6 sm:p-8 rounded-3xl bg-background border border-border shadow-xs space-y-6 text-text-primary">
          <div className="border-b border-border pb-4">
            <span className="text-[10px] font-mono uppercase text-brand font-bold bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
              📋 REGRAS DE CARREGAMENTO & PRIVACIDADE DA CENTRAL
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-2">
              Diretrizes de Carregamento de Documentos e Portfólio
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Saiba como os ficheiros de CV e portfólio de imagens são tratados com privacidade estrita:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-brand font-bold text-xs font-mono uppercase">
                <FileText className="w-4 h-4" />
                <span>1. Carregamento de CV em PDF (Opcional)</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Para <strong>Técnicos de Ofício</strong> e <strong>Profissionais</strong>, o carregamento do CV deve ser em formato <strong>PDF (.pdf)</strong>. O campo é <strong>opcional</strong> na criação de conta: caso o candidato não tenha no momento, o registo é concluído e a <strong>Central TARIRA solicita ou cobra os dados adicionais a posteriori</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-brand font-bold text-xs font-mono uppercase">
                <ImageIcon className="w-4 h-4" />
                <span>2. Portfólio de Imagens & Link de Website (Opcional)</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                O prestador e o profissional têm à disposição campos opcionais para carregar <strong>fotografias de obras/projetos</strong> e/ou inserir o <strong>link do website/portfólio online</strong> (GitHub, Behance, LinkedIn, website próprio) com visualização instantânea.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-brand font-bold text-xs font-mono uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>3. Validação Central & Modelo ATS</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                A submissão de documentos e portfólios assegura triagem estruturada e validação de conformidade técnica e executiva para processos de alocação de serviços e recrutamento corporativo.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-brand font-bold text-xs font-mono uppercase">
                <Camera className="w-4 h-4" />
                <span>4. Foto Pessoal de Rosto / Ombros (1:1)</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Enquadramento proporcional de rosto e ombros (1:1 Head & Shoulders) para assegurar apresentação de alta fidelidade e credibilidade em ambos os portais (Connect e Recruit).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role Gate Modal for Lar Profile attempting to recruit corporate professionals */}
      {showRoleGateModal && (
        <div data-modal-scroll className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md overflow-y-auto p-3 sm:p-6 py-16 sm:py-20 flex justify-center items-center">
          <div className="bg-background border border-border rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left animate-fade-up my-auto max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] overflow-y-auto text-text-primary">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xl font-bold">
                  🏢
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary">
                    Recrutamento Corporativo (TARIRA Recruit)
                  </h3>
                  <p className="text-xs text-brand-light font-mono">
                    Acesso Exclusivo para Empresas (B2B) & Condomínios
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRoleGateModal(false)}
                className="p-1 rounded-full bg-background hover:bg-slate-200 text-text-secondary border border-border cursor-pointer shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
              <p>
                O perfil <strong>Lar (Residencial)</strong> está direcionado para a contratação de <strong>Técnicos de Campo e Ofícios de Apoio ao Lar</strong> (diaristas, eletricistas, canalizadores, reparações, refrigeração).
              </p>
              <p>
                A contratação direta de quadros corporativos e especialistas de engenharia e tecnologia (TARIRA Recruit) é liberada para contas com <strong>Perfil Empresa (B2B)</strong> ou <strong>Perfil Condomínio</strong>.
              </p>

              {/* Roles matrix */}
              <div className="p-4 rounded-2xl bg-background-secondary border border-border space-y-2.5 shadow-xs">
                <div className="text-[11px] font-mono font-bold text-brand uppercase">
                  Estrutura de Acesso:
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-base">🏢</span>
                  <div>
                    <strong className="text-text-primary">Perfil Empresa (B2B):</strong>
                    <p className="text-[11px] text-text-secondary">Acesso total a técnicos (Connect) e profissionais corporativos (Recruit).</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-base">🏛️</span>
                  <div>
                    <strong className="text-text-primary">Perfil Condomínio:</strong>
                    <p className="text-[11px] text-text-secondary">Acesso total a técnicos de manutenção (Connect) e gestores (Recruit).</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-base">🏠</span>
                  <div>
                    <strong className="text-brand">Perfil Lar:</strong>
                    <p className="text-[11px] text-text-secondary">Foco em técnicos e ofícios para serviços domésticos e residenciais.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRoleGateModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-background hover:bg-slate-200 text-text-primary text-xs font-bold cursor-pointer border border-border shadow-xs"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRoleGateModal(false);
                  setProfileType("technician");
                  if (onSwitchToConnect) {
                    onSwitchToConnect();
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-brand text-xs font-bold transition-all border border-border flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>⚡ Ver Técnicos de Ofício (TARIRA Connect)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRoleGateModal(false);
                  if (onOpenRegisterModal) {
                    onOpenRegisterModal("company");
                  } else if (onRegisterAccount) {
                    onRegisterAccount();
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-light hover:bg-brand text-white text-xs font-bold uppercase tracking-wider transition-all border border-brand flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>🏢 Criar Conta Empresa / Condomínio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
