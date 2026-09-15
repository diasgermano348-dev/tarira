import React, { useState, useEffect, useRef, useMemo, FormEvent } from "react";
import { 
  Sparkles, 
  Users, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Search, 
  Star, 
  Clock, 
  AlertTriangle, 
  Play, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  X, 
  ArrowLeft, 
  Mail, 
  FileText, 
  Settings, 
  Activity, 
  Wrench, 
  Award,
  Lock,
  Compass,
  Database,
  Building,
  Building2,
  HardHat,
  GraduationCap,
  Code2,
  Layers,
  Phone,
  PhoneCall,
  FileCheck,
  BriefcaseBusiness,
  Hammer,
  HelpCircle,
  Info,
  ArrowRight,
  RefreshCw,
  Eye,
  Briefcase,
  Linkedin,
  Instagram,
  Menu,
  MessageCircle,
  FileSpreadsheet
} from "lucide-react";
import { SERVICES } from "./data";
import { TariraOutsourcingGrowthChart } from "./TariraOutsourcingGrowthChart";
import { Candidate, AuditLog, ServiceItem, ServiceCategory, Client, LandingBannerItem, SpontaneousApplication, SpontaneousExperience, PartnerCompanyItem, PartnerStoreItem, PaymentOrder, CommercialProposal, UserAccountRole } from "./types";
import { ConnectLocationMap } from "./ConnectLocationMap";
import { Tab } from "./tabs";
import { Lang, LANGUAGES } from "./translations";
import { TariraStudioModule } from "./TariraStudioModule";
import { TariraConsultingModule } from "./TariraConsultingModule";
import { TariraRecruitModule } from "./TariraRecruitModule";
import { TariraProfessionalsGallery } from "./TariraProfessionalsGallery";
import { TariraTechniciansDirectory } from "./TariraTechniciansDirectory";
import { TariraProviderWalletPanel } from "./TariraProviderWalletPanel";
import { TariraOutsourcingModule } from "./TariraOutsourcingModule";
import { TariraConnectModule } from "./TariraConnectModule";
import { TariraCommercialAdminModule } from "./TariraCommercialAdminModule";
import { InvestorDocumentsModal } from "./InvestorDocumentsModal";
import { OrganizationAuditPanel, OrgOperator, OperatorAuditAction } from "./OrganizationAuditPanel";
import { SupabaseAuthModal } from "./SupabaseAuthModal";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";
import { ModularPortalNavigation } from "./ModularPortalNavigation";
import { AuthPage } from "./AuthPage";
import { CandidateProfileMockupViewer } from "./CandidateProfileMockupViewer";
import { RevenueBarChart } from "./RevenueBarChart";
import { RegisteredCompaniesPortal } from "./RegisteredCompaniesPortal";
import { StandardRegistrationForm } from "./StandardRegistrationForm";
import { isSupabaseConfigured, getSupabaseClient, UserProfile } from "./supabase";
import { getAuthHeaders } from "./authClient";
import { HireProcessModal } from "./HireProcessModal";
import { TariraCentralModule } from "./TariraCentralModule";
import { TariraProviderCrudModal } from "./TariraProviderCrudModal";
import { TariraDeleteConfirmModal } from "./TariraDeleteConfirmModal";
import { TariraInternalApplicationModal } from "./TariraInternalApplicationModal";
import { TariraBriefingModal } from "./TariraBriefingModal";
import { TariraCommercialModal } from "./TariraCommercialModal";
import { TariraEmailComposerModal } from "./TariraEmailComposerModal";
import { TariraCompanyUnitsHub } from "./TariraCompanyUnitsHub";
import { TariraServiceSelectionModal } from "./TariraServiceSelectionModal";
import { TariraPaymentCheckoutModal } from "./TariraPaymentCheckoutModal";
import { TariraLandingBusinessUnitsGrid } from "./TariraLandingBusinessUnitsGrid";
import {
  TariraConnectIcon,
  TariraRecruitIcon,
  TariraOutsourcingIcon,
  TariraConsultingIcon,
  TariraStudioIcon,
  TariraBusinessUnitIcon
} from "./TariraUnitIcons";

// High-fidelity Tarira Logo matching the Version C Refined branding guidelines (Selo de Elo Duplo + Nome + Tagline Bilingue)
export function TariraLogo({ 
  className = "", 
  sizeClass = "", 
  withRecruit = false, 
  withSlogan = true,
  size,
  align = "center",
  lightBg = false
}: { 
  className?: string; 
  sizeClass?: string;
  withRecruit?: boolean; 
  withSlogan?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "left" | "center";
  lightBg?: boolean;
}) {
  // Map sizeClass or determine the best size to guarantee perfect ergonomics
  let finalSize: "xs" | "sm" | "md" | "lg" | "xl" = size || "md";
  if (!size && sizeClass) {
    if (sizeClass.includes("text-lg") || sizeClass.includes("text-xl") || sizeClass.includes("text-2xl")) {
      finalSize = "xs";
    } else if (sizeClass.includes("text-3xl") || sizeClass.includes("text-4xl")) {
      finalSize = "sm";
    } else if (sizeClass.includes("text-5xl")) {
      finalSize = "lg";
    } else if (sizeClass.includes("text-7xl") || sizeClass.includes("text-8xl") || sizeClass.includes("text-9xl") || sizeClass.includes("text-[5.5rem]")) {
      finalSize = "xl";
    }
  }

  // Visual variables for the 5 size levels to guarantee perfect ergonomics (with highly visible taglines)
  const configs = {
    xs: {
      iconWidth: "w-[48px] xs:w-[52px] sm:w-[58px]",
      iconHeight: "h-[28px] xs:h-[30px] sm:h-[34px]",
      wordmarkClass: "text-[12.5px] xs:text-[13.5px] sm:text-[15px]",
      letterSpacing: "3px",
      spacing1: "mt-1", // Spacing between icon and wordmark
      spacing2: "mt-1", // Spacing between wordmark and hairline
      spacing3: "mt-0.5", // Spacing between hairline and tagline
      hairlineWidth: "w-14 sm:w-20",
      taglinePT: "text-[7.5px] xs:text-[8.5px] sm:text-[9.5px]",
      taglineEN: "text-[6px] xs:text-[6.5px] sm:text-[7.5px] tracking-[0.12em] xs:tracking-[0.14em] sm:tracking-[0.16em] mt-0.5"
    },
    sm: {
      iconWidth: "w-[64px]",
      iconHeight: "h-[38px]",
      wordmarkClass: "text-[17px]",
      letterSpacing: "4px",
      spacing1: "mt-2",
      spacing2: "mt-2",
      spacing3: "mt-0.5",
      hairlineWidth: "w-18",
      taglinePT: "text-[9.5px]",
      taglineEN: "text-[7.5px] tracking-[0.16em] mt-0.5"
    },
    md: {
      iconWidth: "w-[84px]",
      iconHeight: "h-[49px]",
      wordmarkClass: "text-[21px]",
      letterSpacing: "5px",
      spacing1: "mt-2.5",
      spacing2: "mt-2",
      spacing3: "mt-1",
      hairlineWidth: "w-24",
      taglinePT: "text-[11px]",
      taglineEN: "text-[8.5px] tracking-[0.18em] mt-0.5"
    },
    lg: {
      iconWidth: "w-[120px]",
      iconHeight: "h-[70px]",
      wordmarkClass: "text-[32px]",
      letterSpacing: "5.5px",
      spacing1: "mt-3",
      spacing2: "mt-2.5",
      spacing3: "mt-1",
      hairlineWidth: "w-32",
      taglinePT: "text-[12.5px]",
      taglineEN: "text-[9.5px] tracking-[0.2em] mt-0.5"
    },
    xl: {
      iconWidth: "w-[180px] sm:w-[200px]",
      iconHeight: "h-[105px] sm:h-[117px]",
      wordmarkClass: "text-[52px] sm:text-[60px] md:text-[68px]",
      letterSpacing: "8.5px",
      spacing1: "mt-4 sm:mt-5",
      spacing2: "mt-3 sm:mt-4",
      spacing3: "mt-1.5 sm:mt-2",
      hairlineWidth: "w-36 sm:w-44",
      taglinePT: "text-[13px] sm:text-[15px] md:text-[16px]",
      taglineEN: "text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.22em] mt-1"
    }
  };

  const c = configs[finalSize];
  const isLeft = align === "left";

  const leftColor = lightBg ? "#2563EB" : "#38BDF8";
  const rightColor = lightBg ? "#101E34" : "#60A5FA";
  const wordmarkTextColor = lightBg ? "text-[#101E34]" : "text-white font-bold";
  const ptSloganColor = lightBg ? "text-[#1E3A8A] font-bold" : "text-blue-200 font-bold";
  const enSloganColor = lightBg ? "text-slate-600 font-semibold" : "text-slate-300 font-medium tracking-[0.18em]";
  const hairlineBg = lightBg ? "bg-slate-300" : "bg-blue-400/40";

  return (
    <div className={`flex flex-col ${isLeft ? "items-start text-left" : "items-center text-center justify-center"} shrink-0 ${className}`}>
      {/* 1. Elo Duplo (Double linked ovals/ellipses) Seal - Traço mais espesso (strokeWidth=6) e overlap mais fechado */}
      <div className={`relative flex ${isLeft ? "justify-start" : "justify-center"} items-center transition-transform duration-300 hover:scale-105 shrink-0`}>
        <svg 
          viewBox="0 0 102 60" 
          className={`${c.iconWidth} ${c.iconHeight} relative shrink-0 block`} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Tarira Seal Icon"
        >
          {/* Left Oval (complete) */}
          <ellipse cx="41" cy="30" rx="20" ry="14" stroke={leftColor} strokeWidth="6" fill="none" />
          {/* Right Oval (complete) */}
          <ellipse cx="61" cy="30" rx="20" ry="14" stroke={rightColor} strokeWidth="6" fill="none" />
          {/* Weave Segment: Top-right quarter of Left Ellipse to interlock perfectly */}
          <path d="M 41 16 A 20 14 0 0 1 61 30" stroke={leftColor} strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* 2. Wordmark TARIRA */}
      <h1 
        className={`font-serif select-none font-normal leading-none shrink-0 ${wordmarkTextColor} ${c.wordmarkClass} ${c.spacing1}`}
        style={{ 
          letterSpacing: c.letterSpacing, 
          textIndent: isLeft ? "0" : c.letterSpacing,
          marginLeft: isLeft ? "2px" : "0px"
        }}
      >
        TARIRA
      </h1>

      {/* 3. Hairline Separator & Bilingual Tagline */}
      {withSlogan && (
        <div className={`w-full flex flex-col ${isLeft ? "items-start" : "items-center"} shrink-0 ${c.spacing2}`}>
          {/* Hairline line */}
          <div className={`${c.hairlineWidth} h-[1px] ${hairlineBg}`} />
          
          {/* PT: Main tagline */}
          <p className={`font-serif italic font-bold tracking-wide leading-tight whitespace-nowrap ${ptSloganColor} ${c.taglinePT} ${c.spacing3}`}>
            Supervisionamos para que não precise.
          </p>
          
          {/* EN: Sans-serif, tracking, smaller */}
          <p className={`font-sans font-medium uppercase leading-tight whitespace-nowrap ${enSloganColor} ${c.taglineEN}`}>
            We oversee so you don't have to.
          </p>

        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTabRaw] = useState<Tab>("landing");
  const [previousServiceZoneTab, setPreviousServiceZoneTab] = useState<Tab | null>("landing");
  const [navHistory, setNavHistory] = useState<Tab[]>(["landing"]);

  const setActiveTab = (tab: Tab | string) => {
    const target = tab as Tab;
    setActiveTabRaw((current) => {
      if (current !== target) {
        setPreviousServiceZoneTab(current);
        setNavHistory((prev) => {
          if (prev[prev.length - 1] === target) return prev;
          return [...prev, target];
        });
      }
      return target;
    });
  };

  const handleGoBack = () => {
    setNavHistory((prev) => {
      if (prev.length > 1) {
        const nextHistory = [...prev];
        nextHistory.pop(); // remove current active tab
        const prevTab = nextHistory[nextHistory.length - 1] || "landing";
        setActiveTabRaw(prevTab);
        setPreviousServiceZoneTab(prevTab);
        return nextHistory;
      } else {
        const fallback = previousServiceZoneTab && previousServiceZoneTab !== activeTab ? previousServiceZoneTab : "landing";
        setActiveTabRaw(fallback);
        return [fallback];
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [currentLang, setCurrentLang] = useState<Lang>("pt");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState<boolean>(false);
  const [headerSearchInput, setHeaderSearchInput] = useState<string>("");
  // O projeto arranca sem quaisquer perfis de demonstração — a lista de
  // candidatos começa vazia e é preenchida exclusivamente pelos dados reais
  // devolvidos pelo servidor (ver fetch mais abaixo). Pronto para perfis reais.
  // Para evitar que os cards apareçam "vazios" por instantes em cada
  // navegação/ligação lenta, arranca já com a última lista real conhecida
  // (guardada localmente) e só depois é confirmada/atualizada pelo servidor.
  const INITIAL_SEEDS: Candidate[] = (() => {
    try {
      const cached = localStorage.getItem("tarira_candidates_cache");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  })();
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_SEEDS);
  useEffect(() => {
    // Só grava em cache quando já há dados reais — nunca apaga um cache bom
    // com um resultado vazio transitório (ex: falha momentânea de rede).
    if (candidates.length > 0) {
      try {
        localStorage.setItem("tarira_candidates_cache", JSON.stringify(candidates));
      } catch (e) {}
    }
  }, [candidates]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(true);

  // Login, Test Accounts, and Registration States
  const [isTestAccountsModalOpen, setIsTestAccountsModalOpen] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<"signin" | "signup" | "forgot" | "reset-password">("signin");
  const [loginRole, setLoginRole] = useState<"company" | "residential" | "condo" | "provider">("company");
  const [loginSelectedClientId, setLoginSelectedClientId] = useState<string>("");
  const [loginSelectedCandidateId, setLoginSelectedCandidateId] = useState<string>("");
  const [loginFullName, setLoginFullName] = useState<string>("");
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerAddress, setRegisterAddress] = useState("");
  const [registerBI, setRegisterBI] = useState("");
  const [registerLinkedin, setRegisterLinkedin] = useState("");

  const [registerProviderName, setRegisterProviderName] = useState("");
  const [registerProviderSurname, setRegisterProviderSurname] = useState("");
  const [registerProviderEmail, setRegisterProviderEmail] = useState("");
  const [registerProviderPhone, setRegisterProviderPhone] = useState("");
  const [registerProviderResidence, setRegisterProviderResidence] = useState("");
  const [registerProviderCategory, setRegisterProviderCategory] = useState("tech");
  const [registerProviderBio, setRegisterProviderBio] = useState("");
  const [registerProviderBI, setRegisterProviderBI] = useState("");
  const [registerProviderRate, setRegisterProviderRate] = useState<number>(1500);

  // Provider Portfolio Onboarding Modal States
  const [isPortfolioSetupModalOpen, setIsPortfolioSetupModalOpen] = useState<boolean>(false);
  const [newlyRegisteredProvider, setNewlyRegisteredProvider] = useState<Candidate | null>(null);
  const [portfolioImageUrlInput, setPortfolioImageUrlInput] = useState<string>("");
  const [portfolioImagesList, setPortfolioImagesList] = useState<Array<{ url: string; caption: string }>>([]);
  const [portfolioWebsiteInput, setPortfolioWebsiteInput] = useState<string>("");
  const [portfolioBioInput, setPortfolioBioInput] = useState<string>("");
  const [portfolioExperienceYearsInput, setPortfolioExperienceYearsInput] = useState<number>(3);
  const [portfolioSkillsInput, setPortfolioSkillsInput] = useState<string>("");

  // Client Management and Separation
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const cached = localStorage.getItem("tarira_clients_cache");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  useEffect(() => {
    if (clients.length > 0) {
      try {
        localStorage.setItem("tarira_clients_cache", JSON.stringify(clients));
      } catch (e) {}
    }
  }, [clients]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClients, setLoadingClients] = useState<boolean>(true);
  const [isAdminClientCreateOpen, setIsAdminClientCreateOpen] = useState<boolean>(false);
  const [isAdminClientEditOpen, setIsAdminClientEditOpen] = useState<boolean>(false);
  const [clientForm, setClientForm] = useState({
    id: "",
    name: "",
    type: "company" as "company" | "residential" | "condo" | "individual",
    email: "",
    phone: "",
    address: "",
    bi: "",
    linkedin: ""
  });

  // Provider side withdrawal states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState<boolean>(false);

  // Complete Service Request Journey States
  const [hires, setHires] = useState<any[]>([]);
  const [loadingHires, setLoadingHires] = useState<boolean>(true);
  const [selectedProfessional, setSelectedProfessional] = useState<Candidate | null>(null);
  const [isHireModalOpen, setIsHireModalOpen] = useState<boolean>(false);


  // Service Request Wizard & Multimedia States
  const [hireStep, setHireStep] = useState<number>(1);
  const [hireForm, setHireForm] = useState({
    description: "",
    targetDate: "",
    type: "normal" as "normal" | "emergency" | "scheduled",
    location: "Maputo, Bairro Central",
    voiceUrl: "",
    voiceDuration: 0,
    photoName: "",
    photoUrl: "",
    paymentModality: "half" as "half" | "full",
    paymentChannel: "mpesa" as "mpesa" | "emola" | "izi" | "bank",
    contractModel: "recruitment" as "recruitment" | "outsourcing",
    contractDuration: "monthly" as "weekly" | "monthly" | "quarterly" | "fixed" | "indefinite" | "indeterminate",
    recruitmentLevel: "mid" as "junior" | "mid" | "senior" | "director",
    connectWorkloadHours: 4,
    connectEffortLevel: "medium" as "light" | "medium" | "heavy",
    recruitmentSalaryProposal: 15000,
    recruitmentNegotiationNotes: "",
    negotiationEmail: "",
    documentName: "",
    documentUrl: "",
    workModel: "presential" as "presential" | "remote" | "hybrid",
    workSchedule: "full_time" as "full_time" | "part_time" | "flexible"
  });

  const isCandidateTechnician = (candidate: Candidate | null): boolean => {
    if (!candidate) return false;
    const cat = (candidate.category || "").toLowerCase();
    if (
      cat === "recruitment" || 
      cat === "elite_hub" || 
      cat === "prof" || 
      cat === "pro" || 
      cat === "corporate" || 
      cat === "recruit" || 
      cat === "it" ||
      cat === "dev"
    ) {
      return false;
    }
    
    const tradeCats = ["elec", "canal", "pint", "jard", "limp", "man", "obra", "carp", "caix", "vidro", "dom", "dom2", "dom_clean", "dom_baba", "dom_chef", "tech", "tecnico"];
    if (tradeCats.includes(cat)) {
      const t = (candidate.title || "").toLowerCase();
      if (
        t.includes("engenheiro de software") ||
        t.includes("developer") ||
        t.includes("programador") ||
        t.includes("cibersegurança") ||
        t.includes("cybersecurity") ||
        t.includes("devops") ||
        t.includes("compliance") ||
        t.includes("diretor") ||
        t.includes("gestor") ||
        t.includes("analista") ||
        t.includes("consultor") ||
        t.includes("executivo") ||
        t.includes("call center")
      ) {
        return false;
      }
      return true;
    }

    const title = (candidate.title || "").toLowerCase();
    const subCat = (candidate.subCategory || "").toLowerCase();
    const skills = (candidate.skills || []).join(" ").toLowerCase();
    const combined = `${title} ${subCat} ${skills}`;

    if (
      combined.includes("eletricista") ||
      combined.includes("canalizador") ||
      combined.includes("pintor") ||
      combined.includes("jardineiro") ||
      combined.includes("pedreiro") ||
      combined.includes("marceneiro") ||
      combined.includes("ar condicionado") ||
      combined.includes("avac") ||
      combined.includes("refrigeração") ||
      combined.includes("empregada doméstica") ||
      combined.includes("cozinheira") ||
      combined.includes("babá") ||
      combined.includes("cuidadora")
    ) {
      return true;
    }

    return false;
  };

  const isTechnicianCandidate = isCandidateTechnician(selectedProfessional);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [voiceNoteName, setVoiceNoteName] = useState<string>("");
  const [recordingIntervalId, setRecordingIntervalId] = useState<any>(null);

  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState<number>(0);
  const playVoiceIntervalRef = useRef<any>(null);

  const playToneSim = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.error(e);
    }
  };

  const togglePlayVoice = () => {
    if (isPlayingVoice) {
      setIsPlayingVoice(false);
      if (playVoiceIntervalRef.current) clearInterval(playVoiceIntervalRef.current);
    } else {
      setIsPlayingVoice(true);
      setVoicePlaybackProgress(0);
      playToneSim();
      
      const duration = hireForm.voiceDuration || 5;
      const intervalTime = 100;
      const steps = (duration * 1000) / intervalTime;
      let currentStep = 0;
      
      playVoiceIntervalRef.current = setInterval(() => {
        currentStep++;
        const progress = Math.min((currentStep / steps) * 100, 100);
        setVoicePlaybackProgress(progress);
        
        if (progress >= 100) {
          setIsPlayingVoice(false);
          clearInterval(playVoiceIntervalRef.current);
        }
      }, intervalTime);
    }
  };
  
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [emergencyEta, setEmergencyEta] = useState<string>("35 min");
  const [emergencyProfessional, setEmergencyProfessional] = useState<Candidate | null>(null);
  const [viewAsClient, setViewAsClient] = useState<boolean>(true); // true = limited client mode, false = complete admin view

  // TARIRA Custom HR Models & Simulator States
  const [selectedHrModel, setSelectedHrModel] = useState<"outsourcing" | "recruitment">("outsourcing");
  const [selectedEcosystemSegment, setSelectedEcosystemSegment] = useState<"business" | "recrute" | "consultoria" | "connect" | "studio">("business");
  const [simHeadcount, setSimHeadcount] = useState<number>(5);
  const [simAvgSalary, setSimAvgSalary] = useState<number>(25000); // MZN
  const [simDuration, setSimDuration] = useState<number>(6); // Months
  const [simRecruitmentLevel, setSimRecruitmentLevel] = useState<"junior" | "mid" | "senior" | "director">("mid");

  // State for TARIRA Studio — unidade de desenvolvimento de plataformas (a Axofacil é uma das plataformas, não a Studio em si)
  const [studioActiveTab, setStudioActiveTab] = useState<"axofacil" | "tree" | "submit" | "operators">("tree");
  const [studioMerchantStep, setStudioMerchantStep] = useState<number>(1);
  const [studioMerchantForm, setStudioMerchantForm] = useState({
    businessName: "",
    category: "lojas_baixa",
    whatsapp: "",
    location: "Alto Maé, Maputo",
    description: "",
    productsList: "",
    promoOffer: "10% de Desconto na primeira compra"
  });
  const [studioMerchantSubmitted, setStudioMerchantSubmitted] = useState<boolean>(false);

  const [studioProjectForm, setStudioProjectForm] = useState({
    founderName: "",
    projectName: "",
    email: "",
    phone: "",
    niche: "Educação / Gestão Escolar",
    problemDescription: "",
    supportNeeded: "Desenvolvimento & Incubação"
  });
  const [studioProjectSubmitted, setStudioProjectSubmitted] = useState<boolean>(false);

  // State for TARIRA Outsourcing interactive subpage
  const [businessSubForm, setBusinessSubForm] = useState<{
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
  }>({
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    operationType: "Atendimento ao Cliente, Helpdesk & Call Center",
    headcount: 8,
    slaLevel: "Ouro (99% de Disponibilidade)",
    comments: "",
    documentName: undefined,
    documentSize: undefined,
    documentData: undefined
  });
  const [businessSubSubmitted, setBusinessSubSubmitted] = useState<boolean>(false);
  const [businessSubActiveStep, setBusinessSubActiveStep] = useState<number>(0);

  // State for TARIRA Connect (Subscrição de Serviços)
  const [connectSubForm, setConnectSubForm] = useState({
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    selectedPlan: "conta_activa", // conta_activa (Empresa/Condomínio) | conta_lar (Particular)
    selectedServices: [] as string[], // dom, limp, man, carp, obra, jard, dom2, eletricista
    contractingModel: "variable", // variable, fixed, hybrid
    comments: ""
  });
  const [connectSubSubmitted, setConnectSubSubmitted] = useState<boolean>(false);
  const [connectActiveStep, setConnectActiveStep] = useState<number>(0);

  // State for TARIRA Recruit (Sourcing em Massa e Contratos Temporários)
  const [recruitSubForm, setRecruitSubForm] = useState({
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    jobTitle: "Operadores de Linha de Produção",
    requiredStaffCount: 50, // 20, 50, 100, etc.
    targetLevel: "Médio",
    durationContract: "Contrato Temporário (6 meses)",
    externalSourcingAllowed: true,
    comments: ""
  });
  const [recruitSubSubmitted, setRecruitSubSubmitted] = useState<boolean>(false);
  const [recruitSubActiveStep, setRecruitSubActiveStep] = useState<number>(0);
  const [recruitSelectedCategory, setRecruitSelectedCategory] = useState<string>("all");
  const [recruitSelectedCandidateId, setRecruitSelectedCandidateId] = useState<string | null>(null);

  // Responsive & Mobile Menu states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // TARIRA Consultoria States
  const [consultingReqs, setConsultingReqs] = useState<any[]>([]);
  const [loadingConsulting, setLoadingConsulting] = useState<boolean>(true);

  // Forms for TARIRA Consultoria

  const [consultingExternalForm, setConsultingExternalForm] = useState<{
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
  }>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    serviceType: "Início de Negócio: Fluxos de Trabalho, Arquitetura de Custos & Equipa",
    requestType: "external_consulting",
    details: "",
    budget: "",
    documentName: undefined,
    documentSize: undefined,
    documentData: undefined,
    documentUrl: undefined
  });
  const [consultingExternalSubmitted, setConsultingExternalSubmitted] = useState<boolean>(false);

  // Helpers for live voice recording simulation
  const startRecordingSim = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    setRecordingIntervalId(interval);
  };

  const stopRecordingSim = (currentDuration: number) => {
    setIsRecording(false);
    if (recordingIntervalId) {
      clearInterval(recordingIntervalId);
      setRecordingIntervalId(null);
    }
    const simulatedName = `gravacao_servico_${Date.now()}.mp3`;
    setVoiceNoteName(simulatedName);
    setHireForm(prev => ({
      ...prev,
      voiceUrl: simulatedName,
      voiceDuration: currentDuration || recordingDuration
    }));
  };

  const deleteRecordingSim = () => {
    setIsRecording(false);
    if (recordingIntervalId) {
      clearInterval(recordingIntervalId);
      setRecordingIntervalId(null);
    }
    setIsPlayingVoice(false);
    if (playVoiceIntervalRef.current) {
      clearInterval(playVoiceIntervalRef.current);
    }
    setVoicePlaybackProgress(0);
    setRecordingDuration(0);
    setVoiceNoteName("");
    setHireForm(prev => ({
      ...prev,
      voiceUrl: "",
      voiceDuration: 0
    }));
  };

  // Professional side simulation states
  const [showCandidateMockupViewer, setShowCandidateMockupViewer] = useState<boolean>(false);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [portfolioUploading, setPortfolioUploading] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoCaption, setPhotoCaption] = useState<string>("");

  // AI Bio Assistant state
  const [aiBioPrompt, setAiBioPrompt] = useState<string>("");
  const [generatingBio, setGeneratingBio] = useState<boolean>(false);

  // Feedback review stars
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    text: "",
    quality: 5,
    punctuality: 5,
    cleanliness: 5
  });
  const [activeReviewHireId, setActiveReviewHireId] = useState<string | null>(null);
  const [validationNotes, setValidationNotes] = useState<{[key: string]: string}>({});

  // Search & Category states for Services Catalog
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedServiceCat, setSelectedServiceCat] = useState<string>("");
  const [serviceHiringTarget, setServiceHiringTarget] = useState<{
    serviceName: string;
    category: string;
    categoryTitle: string;
    basePrice: number;
  } | null>(null);

  // Search & Filters on client find view
  const [clientSearchQuery, setClientSearchQuery] = useState<string>("");
  const [clientSelectedCategory, setClientSelectedCategory] = useState<string>("all");
  const [clientSelectedCity, setClientSelectedCity] = useState<string>("all");
  const [clientOnlyAvailable, setClientOnlyAvailable] = useState<boolean>(false);
  const [clientOnlyEmergency, setClientOnlyEmergency] = useState<boolean>(false);

  // Analytics sub-tab
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<string>("overview");

  // Client Dashboard sub-tabs ("hub" | "pedidos" | "colaboradores" | "analytics" | "airflow" | "sla" | "operators" | "payments")
  const [clientActiveTab, setClientActiveTab] = useState<"hub" | "pedidos" | "colaboradores" | "analytics" | "airflow" | "sla" | "operators" | "payments">("hub");

  // Multi-Login & Operator Audit Control States for Non-Singular Profiles
  // Zerado por pedido explícito: nenhum operador/log fictício de mockup.
  // Só operadores reais, criados no painel admin e persistidos no Supabase,
  // devem aparecer em "Gestão de Todos os Perfis & Contas".
  const [orgOperators, setOrgOperators] = useState<OrgOperator[]>([]);

  // Sem operadores fictícios por defeito: o operador ativo só fica definido
  // quando um admin/operador real inicia sessão (ver setActiveOperator nos
  // fluxos de login mais abaixo).
  const [activeOperator, setActiveOperator] = useState<OrgOperator | undefined>(orgOperators[0]);

  const [operatorAuditLogs, setOperatorAuditLogs] = useState<OperatorAuditAction[]>([]);

  // About view sub-section ("about" | "careers" | "contact")
  const [aboutActiveSection, setAboutActiveSection] = useState<"about" | "careers" | "contact">("about");
  const [isInternalApplicationModalOpen, setIsInternalApplicationModalOpen] = useState<boolean>(false);
  const [ceoPhoto, setCeoPhoto] = useState<string>(() => {
    return localStorage.getItem("ceo_photo") || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=800";
  });

  const [isUploadingImgBB, setIsUploadingImgBB] = useState<boolean>(false);

  // Links sociais e canais oficiais da TARIRA (email institucional, LinkedIn, WhatsApp, Linhas Telefónicas)
  const [socialLinks, setSocialLinks] = useState<{
    email: string;
    linkedin: string;
    whatsapp: string;
    instagram?: string;
    phone1: string;
    phone2: string;
  }>({
    email: "tarira.ecossistema@gmail.com",
    linkedin: "https://www.linkedin.com/in/tarira-ecossistema",
    whatsapp: "https://wa.me/258871425316",
    instagram: "https://www.instagram.com/tarira.weoversee",
    phone1: "+258 87 142 5316",
    phone2: "+258 83 536 1379"
  });

  // Estado e controlador do Compositor de E-mail oficial TARIRA (Abertura no Navegador / Cliente Default)
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState<boolean>(false);
  const [emailComposerData, setEmailComposerData] = useState<{
    targetEmail: string;
    subject: string;
    body: string;
  }>({
    targetEmail: "tarira.ecossistema@gmail.com",
    subject: "Contacto via TARIRA Ecossystem — Solicitação de Informações",
    body: "Olá equipa TARIRA,\n\nGostaria de solicitar informações sobre os vossos serviços e soluções corporativas.\n\nAtenciosamente,"
  });

  const handleOpenEmailComposer = (
    e?: React.MouseEvent,
    targetEmail?: string,
    customSubject?: string,
    customBody?: string
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const to = targetEmail || socialLinks.email || "tarira.ecossistema@gmail.com";
    const subject = customSubject || "Contacto via TARIRA Ecossystem — Solicitação de Informações";
    const body =
      customBody ||
      "Olá equipa TARIRA,\n\nGostaria de solicitar informações sobre os vossos serviços e soluções corporativas.\n\nAtenciosamente,";

    setEmailComposerData({
      targetEmail: to,
      subject,
      body
    });

    // Vai diretamente para o formulário de contacto em modal — já não se tenta
    // abrir um separador/aplicação de e-mail externa (mailto/target="_blank"),
    // que em ambientes de pré-visualização em iframe pode falhar e levar à
    // recuperação de erro do portal.
    setIsEmailComposerOpen(true);
  };

  // Portal-Wide Automatic Language Translator Effect
  useEffect(() => {
    if (typeof document === "undefined") return;

    const translatePortalDOM = () => {
      const dictionary: Record<string, string> = {
        "Dois Mundos, Uma Plataforma Unificada": "Two Worlds, One Unified Platform",
        "Confiança Auditada": "Audited Trust",
        "Prontidão TARIRA": "TARIRA Readiness",
        "Pilares Fundamentais": "Core Pillars",
        "Maestria Técnica": "Technical Mastery",
        "Garantia Operacional Estrita": "Strict Operational SLA Guarantee",
        "Sustentabilidade Local": "Local Sustainability",
        "Taxa de Sucesso em Correspondência": "Matching Success Rate",
        "Trabalhe Connosco na TARIRA": "Work With Us at TARIRA",
        "Supervisor de Operações de Campo": "Field Operations Supervisor",
        "Engenheiro de Software Full-Stack": "Full-Stack Software Engineer",
        "Especialista em Triagem & Compliance": "Screening & Compliance Specialist",
        "Formulário de Contacto Rápido": "Quick Contact Form",
        "Nome Completo": "Full Name",
        "Email Corporativo": "Corporate Email",
        "Telefone / WhatsApp": "Phone / WhatsApp",
        "Assunto de Contacto": "Contact Subject",
        "Como podemos ajudar o seu negócio?": "How can we help your business?",
        "Enviar Mensagem de Confiança ✓": "Send Trusted Message ✓",
        "Sede Operacional": "Operational Headquarters",
        "Suporte & Atendimento WhatsApp": "WhatsApp Support & Customer Care",
        "PAINEL DO CLIENTE": "CLIENT DASHBOARD",
        "Gestão & Histórico de Pedidos": "Management & Order History",
        "CONTA: EMPRESA": "ACCOUNT: COMPANY",
        "CONTA: CONDOMÍNIO": "ACCOUNT: CONDO",
        "CONTA: SINGULAR": "ACCOUNT: INDIVIDUAL",
        "CONTA: LAR": "ACCOUNT: HOME",
        "OPERADOR EM SESSÃO": "SESSION OPERATOR",
        "Total de Pedidos": "Total Requests",
        "Pedidos Pendentes": "Pending Requests",
        "Pedidos Activos": "Active Requests",
        "Pedidos com Sucesso": "Successful Requests",
        "Solicitações efectuadas": "Submitted requests",
        "Em análise de triagem": "Under screening review",
        "Trabalhos em progresso": "Works in progress",
        "Controlo activo": "Active control",
        "Colaboradores & Contratos (Ativos / Desativos)": "Staff & Contracts (Active / Inactive)",
        "Pedidos & Contratações": "Requests & Hires",
        "Analytics do Cliente": "Client Analytics",
        "Airflow (Hiring Flow)": "Airflow (Hiring Flow)",
        "SLA & Feedback Físico": "SLA & Physical Feedback",
        "Operadores & Validações Auditadas": "Operators & Audited Validations",
        "AUTENTICAÇÃO E REGISTO DE CONTA": "ACCOUNT AUTHENTICATION & REGISTRATION",
        "Consola de Acesso Tarira": "Tarira Access Console",
        "Iniciar Sessão": "Sign In",
        "Criar Nova Conta": "Create New Account",
        "Selecione o Tipo de Perfil / Conta:": "Select Profile / Account Type:",
        "Empresa": "Company",
        "Lar": "Home",
        "Condomínio": "Condo",
        "Prestador": "Service Provider",
        "Aceder como Administrador": "Access as Administrator",
        "Institucional & Ecossistema TARIRA": "Institutional & TARIRA Ecosystem",
        "Quem Somos": "About Us",
        "Carreiras": "Careers",
        "Contacto": "Contact",
        "Sair": "Exit",
        "Registrar-me": "Register Now"
      };

      const elements = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, span, button, a, label, option"
      );

      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.tagName === "INPUT" || htmlEl.tagName === "TEXTAREA" || htmlEl.tagName === "SCRIPT") return;

        if (!htmlEl.hasAttribute("data-pt-original")) {
          htmlEl.setAttribute("data-pt-original", htmlEl.textContent || "");
        }

        const original = htmlEl.getAttribute("data-pt-original") || "";
        if (!original.trim()) return;

        if (currentLang === "en") {
          const trimmed = original.trim();
          if (dictionary[trimmed]) {
            htmlEl.textContent = original.replace(trimmed, dictionary[trimmed]);
          } else {
            let trans = original;
            trans = trans.replace(/Painel do Cliente/gi, "Client Dashboard");
            trans = trans.replace(/Iniciar Sessão/gi, "Sign In");
            trans = trans.replace(/Criar Nova Conta/gi, "Create New Account");
            trans = trans.replace(/Sobre Nós/gi, "About Us");
            trans = trans.replace(/Carreiras/gi, "Careers");
            trans = trans.replace(/Contacto/gi, "Contact");
            trans = trans.replace(/Aceder como Administrador/gi, "Access as Administrator");
            trans = trans.replace(/Administrador/gi, "Administrator");
            trans = trans.replace(/Colaboradores/gi, "Staff & Employees");
            trans = trans.replace(/Contratos/gi, "Contracts");
            trans = trans.replace(/Pedidos/gi, "Requests");
            trans = trans.replace(/Serviços/gi, "Services");
            trans = trans.replace(/Empresa/gi, "Company");
            trans = trans.replace(/Condomínio/gi, "Condo");
            trans = trans.replace(/Prestador/gi, "Provider");
            trans = trans.replace(/Especialista/gi, "Specialist");
            trans = trans.replace(/Total de Pedidos/gi, "Total Requests");
            trans = trans.replace(/Pedidos Pendentes/gi, "Pending Requests");
            trans = trans.replace(/Pedidos Activos/gi, "Active Requests");
            trans = trans.replace(/Pedidos com Sucesso/gi, "Successful Requests");
            
            if (trans !== original) {
              htmlEl.textContent = trans;
            }
          }
        } else {
          if (htmlEl.textContent !== original) {
            htmlEl.textContent = original;
          }
        }
      });
    };

    translatePortalDOM();
    const timer = setTimeout(translatePortalDOM, 120);
    return () => clearTimeout(timer);
  }, [currentLang, activeTab, aboutActiveSection, clientActiveTab]);

  // Dynamic category images loaded from server (or fallback to defaults)
  const [categoryImages, setCategoryImages] = useState<{ [key: string]: string }>({
    dom: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    limp: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80",
    man: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    carp: "https://images.unsplash.com/photo-1581850518616-bcb8077fa213?auto=format&fit=crop&w=600&q=80",
    obra: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80",
    jard: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
    tech: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
    dom2: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80",
    elet: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    elite_hub: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80"
  });

  // Custom uploaded sub-service images state
  const [subServiceImages, setSubServiceImages] = useState<{ [key: string]: string }>({});

  // Helper to ensure every sub-service card item has an accurate, high-quality background image
  const getSubServiceImage = (item: any, catGroup: string) => {
    if (item?.n && subServiceImages[item.n]) {
      return subServiceImages[item.n];
    }

    const name = (item?.n || "").toLowerCase();

    // 1. Limpeza Profunda, Pós-Obra & Sanitização (High quality cleaning/sanitization, NEVER electrician)
    if (name.includes("profunda") || name.includes("pós-obra") || name.includes("sanitizaç") || name.includes("desinfec")) {
      return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80";
    }

    // 2. Limpeza Doméstica Regular & Diarista
    if (name.includes("regular") || name.includes("residencial") || name.includes("doméstica") || name.includes("casas") || name.includes("limpeza geral")) {
      return "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80";
    }

    // 3. Limpeza de Escritório, Condomínio & Armazém
    if (name.includes("condomínio") || name.includes("escritório") || name.includes("prédio") || name.includes("armazém") || name.includes("loja") || name.includes("industrial")) {
      return "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80";
    }

    // 4. Canalização, Torneira & Tubagens
    if (name.includes("canalização") || name.includes("torneira") || name.includes("cano") || name.includes("fuga") || name.includes("desentup") || name.includes("esgoto") || name.includes("hidráulica")) {
      return "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80";
    }

    // 5. Electricidade, Tomadas & Quadros Eléctricos
    if (name.includes("electricidade") || name.includes("eletricidade") || name.includes("tomada") || name.includes("chuveiro") || name.includes("disjuntor") || name.includes("fio") || name.includes("quadro el")) {
      return "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80";
    }

    // 6. Carpintaria, Móveis & Fechaduras
    if (name.includes("móve") || name.includes("porta") || name.includes("carpint") || name.includes("fechadura") || name.includes("madeira")) {
      return "https://images.unsplash.com/photo-1581850518616-bcb8077fa213?auto=format&fit=crop&w=600&q=80";
    }

    // 7. Pintura, Obras, Azulejo & Reboco
    if (name.includes("obra") || name.includes("pintura") || name.includes("azulejo") || name.includes("reboco") || name.includes("gesso") || name.includes("impermeab") || name.includes("alvenaria")) {
      return "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80";
    }

    // 8. Jardinagem & Espaços Verdes
    if (name.includes("jard") || name.includes("relva") || name.includes("quintal") || name.includes("paisagismo") || name.includes("poda")) {
      return "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80";
    }

    // 9. Babá, Cuidadora Infantil & Apoio Familiar
    if (name.includes("babá") || name.includes("infantil") || name.includes("criança") || name.includes("babysitt")) {
      return "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80";
    }

    // 10. Empregada Doméstica, Diarista & Passadeira
    if (name.includes("empregada") || name.includes("diarista") || name.includes("loiça") || name.includes("lavandaria") || name.includes("engomar") || name.includes("passar")) {
      return "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80";
    }

    // 11. Tech / Elite Hub / Software / IA
    if (name.includes("ia") || name.includes("ciber") || name.includes("devops") || name.includes("cloud") || name.includes("software") || name.includes("engenharia")) {
      return "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80";
    }

    return categoryImages[catGroup] || categoryImages.dom;
  };

  // Index of the currently visible slide in the full-bleed hero banner (crossfade rotation)
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Dynamic landing page hero banners loaded from server representing each business unit
  const [landingBanners, setLandingBanners] = useState<LandingBannerItem[]>([
  {
    id: "b-recrute",
    category: "recrute",
    title: "TARIRA Recruit",
    tagline: "Talento Profissional de Elite, Quadros de TI & Finanças Vetted",
    desc: "Atração, validação técnica rigorosa e conexão direta de quadros profissionais de alta performance em Moçambique com integridade e competência comprovada.",
    url: "https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  },
  {
    id: "b-recrute-2",
    category: "recrute",
    title: "TARIRA Recruit • Avaliação & Seleção",
    tagline: "Entrevistas Estruturadas & Alinhamento Cultural de Excelência",
    desc: "Processos seletivos humanizados e rigorosos para integrar os melhores quadros executivos e especialistas do mercado nas empresas líderes em Moçambique.",
    url: "https://images.pexels.com/photos/5439152/pexels-photo-5439152.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  },
  {
    id: "b-connect",
    category: "connect",
    title: "TARIRA Connect",
    tagline: "Ofícios Técnicos, Engenharia de Campo & Intervenções Certificadas",
    desc: "Eletricistas qualificados, engenheiros de campo, técnicos de climatização e mestres de obras com contacto direto, pontualidade e rigor técnico em Moçambique.",
    url: "https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=",
    active: true
  },
  {
    id: "b-business",
    category: "business",
    title: "TARIRA Outsourcing (RPO)",
    tagline: "Recrutamento como parceria, não como transação.",
    desc: "O seu recrutamento. Sem limites. Recruitment Process Outsourcing (RPO) — a sua função de recrutamento, entregue por nós.",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1920",
    active: true
  },
  {
    id: "b-business-2",
    category: "business",
    title: "TARIRA Outsourcing (RPO) • Equipas Dedicadas",
    tagline: "Supervisão Contínua, Produtividade & Escalabilidade Operacional",
    desc: "Alocação estratégica de mão de obra e squads especializados para impulsionar a capacidade produtiva e operacional do seu negócio sem atrito.",
    url: "https://images.pexels.com/photos/7658405/pexels-photo-7658405.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  },
  {
    id: "b-studio",
    category: "studio",
    title: "TARIRA Studio",
    tagline: "Inovação Digital, Engenharia de Software & Soluções Ágeis",
    desc: "Concepção, design UX/UI e desenvolvimento de plataformas digitais modernas e escaláveis em Moçambique com equipas ágeis e conectadas.",
    url: "https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  },
  {
    id: "b-consultoria",
    category: "consultoria",
    title: "TARIRA Consulting & Alianças",
    tagline: "Diagnóstico Estratégico, Governação & Sinergia de Equipa",
    desc: "Alianças duradouras, diagnóstico estratégico e equipas alinhadas que celebram cada conquista e marco atingido juntos.",
    url: "https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  }
]);

  // Auto-rotate the full-bleed hero banner through the active business-unit images (crossfade)
  useEffect(() => {
    const activeCount = landingBanners.filter(b => b.active).length;
    if (activeCount < 2) return;
    const interval = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % activeCount);
    }, 5000);
    return () => clearInterval(interval);
  }, [landingBanners]);

  // Asynchronous image and document (PDF) upload helper with ImgBB and Supabase sync
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    setIsUploadingImgBB(true);
    try {
      const isImage = file.type.startsWith("image/");
      let fileUrl = "";

      if (isImage) {
        try {
          const formData = new FormData();
          formData.append("image", file);
          const imgbbApiKey = ((import.meta as any).env?.VITE_IMGBB_API_KEY || "").trim();
          const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          if (result.success && result.data?.url) {
            fileUrl = result.data.url;
          }
        } catch (imgErr) {
          console.warn("Aviso: Upload ImgBB falhou, a tentar Supabase / Fallback Base64:", imgErr);
        }
      }

      // Se não for imagem ou o ImgBB falhou, tenta Supabase Storage se o cliente estiver ativo
      if (!fileUrl) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
            const { data, error } = await supabase.storage.from("uploads").upload(cleanName, file, {
              cacheControl: "3600",
              upsert: true
            });
            if (!error && data) {
              const { data: publicData } = supabase.storage.from("uploads").getPublicUrl(cleanName);
              if (publicData?.publicUrl) {
                fileUrl = publicData.publicUrl;
              }
            }
          } catch (supErr) {
            console.warn("Aviso: Upload para Supabase Storage não disponível:", supErr);
          }
        }
      }

      // Fallback universal para Data URL (base64)
      if (!fileUrl) {
        fileUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") resolve(reader.result);
            else reject(new Error("Erro ao converter ficheiro para Base64"));
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      }

      // Regista os metadados do ficheiro na tabela site_content do Supabase se o cliente estiver ativo
      const supabase = getSupabaseClient();
      if (supabase && fileUrl) {
        try {
          const recordKey = `file_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          await supabase.from("site_content").upsert({
            key: recordKey,
            value: {
              url: fileUrl,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type || "application/octet-stream",
              uploadedAt: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          }, { onConflict: "key" });
        } catch (syncErr) {
          console.warn("Aviso: Registo de metadados no Supabase ignorado:", syncErr);
        }
      }

      return fileUrl;
    } catch (error) {
      console.error("Erro no processamento de ficheiro:", error);
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Erro ao ler dados"));
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    } finally {
      setIsUploadingImgBB(false);
    }
  };

  // Admin Sub-tabs ("central_dispatch" | "validation" | "hiring" | "pipeline" | "feedback" | "analytics" | "saas_monitor" | "spontaneous" | "banners" | "partner_companies" | "partner_stores" | "audit_operators" | "payments" | "commercial_proposals" | "providers_directory")
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<string>("saas_monitor");
  const [adminProviderCategoryFilter, setAdminProviderCategoryFilter] = useState<string>("all");
  const [adminProviderSearch, setAdminProviderSearch] = useState<string>("");
  const [adminProviderAvailabilityFilter, setAdminProviderAvailabilityFilter] = useState<"all" | "available" | "emergency">("all");

  // Central & Admin Provider/Professional CRUD Modals
  const [providerCrudModal, setProviderCrudModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    type: "provider" | "professional";
    data?: Partial<Candidate>;
  }>({
    isOpen: false,
    mode: "create",
    type: "provider",
    data: {}
  });

  const [providerDeleteModal, setProviderDeleteModal] = useState<{
    isOpen: boolean;
    entityType: "prestador" | "profissional" | "candidatura_espontanea" | "categoria" | "pedido" | "empresa_parceira" | "loja_parceira" | "banner" | "cliente" | "operador" | "proposta" | string;
    entityId: string;
    entityName: string;
  }>({
    isOpen: false,
    entityType: "prestador",
    entityId: "",
    entityName: ""
  });

  const handleCreateCandidateDirect = async (newCandData: Partial<Candidate>) => {
    // Mesmo problema dos updates: se o POST falhar, esta função criava na
    // mesma um registo "local" e a pessoa via o perfil aparecer na lista
    // como se tivesse sido criado — mas por não ter chegado ao servidor,
    // desaparecia na próxima vez que a lista fosse recarregada do backend.
    // Agora avisamos claramente quando isso acontece.
    const payload = {
      ...newCandData,
      id: newCandData.id || `cand-${Date.now()}`
    };
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const savedCand = data as Candidate;
        setCandidates(prev => [savedCand, ...prev.filter(c => c.id !== savedCand.id)]);
        return { success: true };
      }
      alert(`Erro ao criar o perfil: ${data?.error || "tente novamente."}`);
      return { success: false, error: data?.error };
    } catch (e) {
      alert("Erro de ligação ao criar o perfil. Verifique a sua ligação e tente novamente.");
      return { success: false, error: "Erro de ligação" };
    }
  };

  const handleApprovePayoutRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/payout-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }
      });
      if (res.ok) {
        const data = await res.json();
        setPayoutRequests(prev => prev.map(p => p.id === id ? { ...p, status: "paid", updatedAt: new Date().toISOString() } : p));
        if (data?.candidate) {
          setCandidates(prev => prev.map(c => c.id === data.candidate.id ? { ...c, withdrawnAmount: data.candidate.withdrawnAmount } : c));
        }
      }
    } catch (e) {
      console.error("Erro ao aprovar saque:", e);
    }
  };

  const handleRejectPayoutRequest = async (id: string, notes?: string) => {
    try {
      const res = await fetch(`/api/payout-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ adminNotes: notes || "" })
      });
      if (res.ok) {
        setPayoutRequests(prev => prev.map(p => p.id === id ? { ...p, status: "rejected", adminNotes: notes || "", updatedAt: new Date().toISOString() } : p));
      }
    } catch (e) {
      console.error("Erro ao rejeitar saque:", e);
    }
  };

  // Prestador/Profissional solicita o saque do saldo acumulado — usado no "O Meu Perfil"
  const handleRequestCandidateWithdraw = async (candidateId: string, amount: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ amount })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.request) {
        setPayoutRequests(prev => [data.request, ...prev]);
        triggerOperationLog("SOLICITAR_SAQUE", `Prestador solicitou saque de ${amount} MZN.`);
        return { success: true };
      }
      return { success: false, error: data?.error || "Não foi possível registar o pedido de saque." };
    } catch (e) {
      return { success: false, error: "Erro de ligação ao solicitar o saque. Tente novamente." };
    }
  };

  // Prestador solicita adiantamento sobre um pedido/serviço técnico específico ainda em curso
  const handleRequestHirePayout = async (hireId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/hires/${hireId}/payout-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.hire) {
        setHires(prev => prev.map(h => h.id === hireId ? data.hire : h));
        triggerOperationLog("SOLICITAR_ADIANTAMENTO", `Prestador solicitou adiantamento para o pedido ${hireId}.`);
        return { success: true };
      }
      return { success: false, error: data?.error || "Não foi possível solicitar o adiantamento." };
    } catch (e) {
      return { success: false, error: "Erro de ligação ao solicitar o adiantamento. Tente novamente." };
    }
  };

  const handleUpdateCandidateDirect = async (candToUpdate: Candidate) => {
    // Antes, esta função aplicava a alteração ao estado local (otimista) e
    // nunca verificava se o PUT ao servidor tinha realmente sido aceite —
    // se a gravação no Supabase falhasse (ex.: sessão expirada, campo
    // inválido, erro de ligação), o painel continuava a mostrar "gravado
    // com sucesso" e a alteração desaparecia silenciosamente na próxima
    // vez que a lista de candidatos fosse recarregada do servidor. Agora
    // confirmamos a resposta do servidor: em caso de erro, revertemos o
    // estado local e avisamos o administrador; em caso de sucesso,
    // sincronizamos com o registo tal como o servidor o gravou de facto.
    const previous = candidates.find(c => c.id === candToUpdate.id);
    setCandidates(prev => prev.map(c => c.id === candToUpdate.id ? candToUpdate : c));
    try {
      const res = await fetch(`/api/candidates/${candToUpdate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(candToUpdate)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (previous) setCandidates(prev => prev.map(c => c.id === candToUpdate.id ? previous : c));
        alert(`Erro ao gravar as alterações do perfil: ${data?.error || "tente novamente."}`);
        return;
      }
      if (data?.candidate) {
        setCandidates(prev => prev.map(c => c.id === candToUpdate.id ? data.candidate : c));
      }
    } catch (e) {
      console.error("Erro ao atualizar candidato:", e);
      if (previous) setCandidates(prev => prev.map(c => c.id === candToUpdate.id ? previous : c));
      alert("Erro de ligação ao gravar as alterações do perfil. Verifique a sua ligação e tente novamente.");
    }
  };

  const handleDeleteCandidateDirect = async (candidateId: string, auditData: any) => {
    try {
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      await fetch(`/api/candidates/${candidateId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(auditData || {})
      });
      if (auditData) {
        const opId = activeOperator?.id || "admin-master";
        const opName = auditData.operatorName || activeOperator?.name || "Administrador Master";
        const opRole = auditData.operatorRole || activeOperator?.role || "admin";
        const opOrg = activeOperator?.orgName || "Central TARIRA Admin";

        setOperatorAuditLogs(prev => [
          {
            id: `op-log-${Date.now()}`,
            timestamp: "Agora mesmo",
            operatorId: opId,
            operatorName: opName,
            operatorRole: opRole,
            orgName: opOrg,
            actionType: "ELIMINAÇÃO",
            details: `ELIMINAÇÃO DE PERFIL: ${opName} (${opRole}) eliminou o perfil ID: ${candidateId}. Motivo: ${auditData.reason || "Auditoria"}`,
            targetEntity: `Perfil #${candidateId}`,
            ipAddress: "197.218.42.10 (Audit Trail)"
          },
          ...prev
        ]);
      }
    } catch (e) {
      console.error("Erro ao eliminar candidato:", e);
    }
  };

  // ----------------------------------------------------------------------------
  // CRUD real de Operadores (contas internas/staff) — antes, os handlers
  // onAddOperator/onUpdateOperator/onDeleteOperator só faziam
  // setOrgOperators(...) em estado local do React, sem nenhum pedido ao
  // servidor. Isso fazia parecer que a eliminação/edição funcionava (o item
  // desaparecia do ecrã naquele momento), mas na próxima vez que os dados
  // fossem recarregados (refresh da página, outra sessão, etc.) o operador
  // "eliminado" reaparecia, porque nunca tinha sido removido de lado nenhum
  // de forma persistente. Agora chamam mesmo a API /api/operators.
  const handleCreateOperatorDirect = async (newOp: OrgOperator) => {
    try {
      const res = await fetch("/api/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(newOp)
      });
      if (res.ok) {
        const created = await res.json();
        setOrgOperators(prev => [created, ...prev]);
      } else {
        setOrgOperators(prev => [newOp, ...prev]);
      }
    } catch (e) {
      console.error("Erro ao criar operador:", e);
      setOrgOperators(prev => [newOp, ...prev]);
    }
  };

  const handleUpdateOperatorDirect = async (updOp: OrgOperator) => {
    // Guarda o estado anterior para poder reverter a atualização otimista
    // caso o pedido ao servidor falhe — sem isto, o painel mostrava a
    // alteração como "gravada" mesmo quando o Supabase/servidor a rejeitava,
    // e ela desaparecia silenciosamente na próxima leitura.
    const previous = orgOperators.find((o) => o.id === updOp.id);
    setOrgOperators(prev => prev.map((o) => (o.id === updOp.id ? updOp : o)));
    try {
      const res = await fetch(`/api/operators/${updOp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updOp)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (previous) setOrgOperators(prev => prev.map((o) => (o.id === updOp.id ? previous : o)));
        alert(`Erro ao gravar as alterações do operador: ${data?.error || "tente novamente."}`);
        return;
      }
      // Reconcilia com o registo tal como o servidor o gravou de facto
      if (data?.operator) {
        setOrgOperators(prev => prev.map((o) => (o.id === updOp.id ? data.operator : o)));
      }
    } catch (e) {
      console.error("Erro ao atualizar operador:", e);
      if (previous) setOrgOperators(prev => prev.map((o) => (o.id === updOp.id ? previous : o)));
      alert("Erro de ligação ao gravar as alterações do operador. Verifique a sua ligação e tente novamente.");
    }
  };

  const handleDeleteOperatorDirect = async (operatorId: string) => {
    setOrgOperators(prev => prev.filter((o) => o.id !== operatorId));
    try {
      await fetch(`/api/operators/${operatorId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }
      });
    } catch (e) {
      console.error("Erro ao eliminar operador:", e);
    }
  };

  // ----------------------------------------------------------------------------
  // CRUD real de Clientes/Empresas a partir da Central (Gestão de Perfis) —
  // mesmo problema dos operadores: onAddClient/onUpdateClient/onDeleteClient
  // só tocavam em estado local. O endpoint DELETE /api/clients/:id também
  // tinha um bug próprio (corrigido no servidor) que fazia o registo
  // "ressuscitar" no Supabase; isto aqui garante que o pedido é mesmo
  // enviado ao servidor em vez de só desaparecer localmente.
  const handleCreateClientDirect = async (newCl: Client) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(newCl)
      });
      if (res.ok) {
        const created = await res.json();
        setClients(prev => [created, ...prev]);
      } else {
        setClients(prev => [newCl, ...prev]);
      }
    } catch (e) {
      console.error("Erro ao criar cliente:", e);
      setClients(prev => [newCl, ...prev]);
    }
  };

  const handleUpdateClientDirect = async (updCl: Client) => {
    // Ver nota em handleUpdateOperatorDirect: guardamos o estado anterior
    // para reverter a atualização otimista se o servidor recusar o pedido,
    // e avisamos o administrador em vez de fingir sucesso silenciosamente.
    const previous = clients.find((c) => c.id === updCl.id);
    setClients(prev => prev.map((c) => (c.id === updCl.id ? updCl : c)));
    try {
      const res = await fetch(`/api/clients/${updCl.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updCl)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (previous) setClients(prev => prev.map((c) => (c.id === updCl.id ? previous : c)));
        alert(`Erro ao gravar as alterações do cliente: ${data?.error || "tente novamente."}`);
        return;
      }
      if (data?.client) {
        setClients(prev => prev.map((c) => (c.id === updCl.id ? data.client : c)));
      }
    } catch (e) {
      console.error("Erro ao atualizar cliente:", e);
      if (previous) setClients(prev => prev.map((c) => (c.id === updCl.id ? previous : c)));
      alert("Erro de ligação ao gravar as alterações do cliente. Verifique a sua ligação e tente novamente.");
    }
  };

  const handleDeleteClientDirect = async (clientId: string) => {
    setClients(prev => prev.filter((c) => c.id !== clientId));
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }
      });
    } catch (e) {
      console.error("Erro ao eliminar cliente:", e);
    }
  };

  const handleUpdateHireStatusDirect = async (hireId: string, newStatus: string, notes?: string) => {
    setHires(prev => prev.map(h => h.id === hireId ? { ...h, status: newStatus as any, notes: notes || h.notes } : h));
    try {
      await fetch(`/api/hires/${hireId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus, notes })
      });
    } catch (e) {
      console.error("Erro ao actualizar estado do pedido:", e);
    }
  };

  // Commercial Proposals / Tenders State
  const [commercialProposals, setCommercialProposals] = useState<CommercialProposal[]>(() => {
    const saved = localStorage.getItem("tarira_commercial_proposals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar propostas comerciais locais:", e);
      }
    }
    // Zerado por pedido explícito: nenhuma proposta comercial fictícia/de teste —
    // só devem aparecer propostas reais submetidas pelos clientes.
    return [];
  });

  useEffect(() => {
    localStorage.setItem("tarira_commercial_proposals", JSON.stringify(commercialProposals));
  }, [commercialProposals]);

  const handleAddCommercialProposal = (newProposal: CommercialProposal) => {
    setCommercialProposals(prev => [newProposal, ...prev]);
    setLogs(prev => [
      {
        id: `log-${Date.now()}`,
        type: "COMMERCIAL_PROPOSAL",
        detail: `Nova Proposta Comercial Recebida: ${newProposal.companyName} (${newProposal.operationType}) - Headcount: ${newProposal.headcount} - Anexo: ${newProposal.documentName || "Nenhum"}`,
        timestamp: new Date().toLocaleString()
      },
      ...prev
    ]);
  };

  // MANUAL ASSISTED PAYMENT SYSTEM STATES (M-Pesa / e-Mola / Bank Transfer)
  const [paymentOrders, setPaymentOrders] = useState<Array<{
    id: string;
    userId?: string;
    userName: string;
    userEmail?: string;
    userPhone?: string;
    userType?: "company" | "residential" | "condo" | "provider";
    serviceTitle: string;
    amount: number;
    method: "mpesa" | "emola" | "bank_transfer";
    reference: string;
    proofUrl?: string;
    status: "pending" | "confirmed" | "rejected";
    adminNotes?: string;
    createdAt: string;
    updatedAt?: string;
    hireId?: string;
  }>>([]);

  // Pedidos de saque de prestadores, pendentes de aprovação pelo Admin
  const [payoutRequests, setPayoutRequests] = useState<Array<{
    id: string;
    candidateId: string;
    candidateName: string;
    phone?: string;
    amount: number;
    status: "pending" | "paid" | "rejected";
    adminNotes?: string;
    createdAt: string;
    updatedAt?: string;
  }>>([]);

  const [isPaymentCheckoutModalOpen, setIsPaymentCheckoutModalOpen] = useState<boolean>(false);
  const [paymentCheckoutData, setPaymentCheckoutData] = useState<{
    serviceTitle: string;
    amount: number;
    hireId?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    userType?: "company" | "residential" | "condo" | "provider";
    isTrial?: boolean;
  } | null>(null);

  // Assim que a conta (Empresa/Condomínio) recém-registada entra no seu
  // Painel, abre automaticamente o fluxo de pagamento do plano escolhido
  // no registo, já pré-preenchido — quer o cliente tenha escolhido "Pagar
  // Já" (isTrial=false) quer "Começar Grátis" (isTrial=true, caso em que o
  // modal apenas informa os 30 dias grátis e permite avançar sem pagar). A
  // "ponte" é feita via sessionStorage porque o AuthPage regista a conta
  // antes de o Painel do Cliente (e este modal) sequer existirem no DOM.
  useEffect(() => {
    if (!selectedClient) return;
    try {
      const raw = sessionStorage.getItem("tarira_open_payment_checkout");
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (pending?.clientId && pending.clientId === selectedClient.id) {
        setPaymentCheckoutData({ serviceTitle: pending.serviceTitle, amount: pending.amount, isTrial: Boolean(pending.isTrial) });
        setIsPaymentCheckoutModalOpen(true);
        sessionStorage.removeItem("tarira_open_payment_checkout");
      }
    } catch {
      sessionStorage.removeItem("tarira_open_payment_checkout");
    }
  }, [selectedClient]);

  const [paymentSelectedMethod, setPaymentSelectedMethod] = useState<"mpesa" | "emola" | "bank_transfer">("mpesa");
  const [paymentTxReference, setPaymentTxReference] = useState<string>("");
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>("");
  const [isSubmittingPaymentOrder, setIsSubmittingPaymentOrder] = useState<boolean>(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [paymentOrderSuccess, setPaymentOrderSuccess] = useState<boolean>(false);
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<any>(null);
  const [adminPaymentAuditFilter, setAdminPaymentAuditFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`✓ ${label} (${text}) copiado para a área de transferência!`);
  };

  // Spontaneous Applications (Candidaturas Espontâneas - ATS & Recrutamento sem Experiência / Operações Business)
  // Inicia rigorosamente como array vazio: apenas dados de contas reais submetidas no portal aparecem
  const [spontaneousApplications, setSpontaneousApplications] = useState<SpontaneousApplication[]>([]);

  // Form State for Spontaneous Applications
  const [spontaneousForm, setSpontaneousForm] = useState<{
    fullName: string;
    phone: string;
    email: string;
    residence: string;
    careerFocus: "recruitment_no_exp" | "business_volume" | "technical_trades";
    nuit: string;
    idDocumentName: string;
    cvDocumentName: string;
    isAtsValidated: boolean;
    atsScore: number;
    experiences: SpontaneousExperience[];
  }>({
    fullName: "",
    phone: "",
    email: "",
    residence: "",
    careerFocus: "recruitment_no_exp",
    nuit: "",
    idDocumentName: "",
    cvDocumentName: "",
    isAtsValidated: false,
    atsScore: 0,
    experiences: []
  });

  const [spontaneousSubmitting, setSpontaneousSubmitting] = useState<boolean>(false);
  const [spontaneousResult, setSpontaneousResult] = useState<SpontaneousApplication | null>(null);
  const [spontaneousModalDetail, setSpontaneousModalDetail] = useState<SpontaneousApplication | null>(null);
  const [spontaneousFilterCareer, setSpontaneousFilterCareer] = useState<string>("all");

  // Candidate Profile Detail Modal State
  const [viewCandidateModal, setViewCandidateModal] = useState<Candidate | null>(null);
  const [portfolioCandidateModal, setPortfolioCandidateModal] = useState<Candidate | null>(null);

  // External Integration Modals (Supabase)
  const [isSupabaseAuthOpen, setIsSupabaseAuthOpen] = useState<boolean>(false);
  const [isExternalConfigModalOpen, setIsExternalConfigModalOpen] = useState<boolean>(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [supabaseProfile, setSupabaseProfile] = useState<UserProfile | null>(null);
  const [authInitialRole, setAuthInitialRole] = useState<'empresa' | 'lar' | 'condominio' | 'prestador' | 'profissional' | 'admin'>('lar');

  // Guest / Visitor Lock Modal & Navigation Limits
  const [guestGateReason, setGuestGateReason] = useState<string | null>(null);
  const [guestViewCount, setGuestViewCount] = useState<number>(() => {
    try {
      return parseInt(sessionStorage.getItem("tarira_guest_views") || "0", 10);
    } catch {
      return 0;
    }
  });

  const checkVisitorAccess = (actionReason?: string): boolean => {
    if (supabaseUser || isAdminLoggedIn || (supabaseProfile && supabaseProfile.email)) {
      return true;
    }
    const newCount = guestViewCount + 1;
    setGuestViewCount(newCount);
    try {
      sessionStorage.setItem("tarira_guest_views", String(newCount));
    } catch (err) {
      console.error(err);
    }

    if (actionReason || newCount >= 3) {
      setGuestGateReason(actionReason || "LIMITE_NAVEGACAO");
      setIsSupabaseAuthOpen(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    // 1. Restaurar sessão ativa persistida (Google, Supabase ou Email)
    try {
      const savedAuthSession = localStorage.getItem("tarira_authenticated_session") || sessionStorage.getItem("tarira_auth_session");
      if (savedAuthSession) {
        const parsed = JSON.parse(savedAuthSession);
        if (parsed.user) setSupabaseUser(parsed.user);
        if (parsed.profile) {
          setSupabaseProfile(parsed.profile);
          const profEmail = parsed.profile.email?.toLowerCase() || "";
          if (profEmail === "tariraecossystem@gmail.com" || profEmail === "tarira.ecossistema@gmail.com" || profEmail === "diasexpress3@gmail.com" || profEmail.includes("tarira") || parsed.profile.role === "admin") {
            setIsAdminLoggedIn(true);
          }
        }
        if (parsed.isAdmin) setIsAdminLoggedIn(true);
        if (parsed.client) setSelectedClient(parsed.client);
        if (parsed.professional) setSelectedProfessional(parsed.professional);
      } else {
        const savedGoogleSession = localStorage.getItem("tarira_google_session");
        if (savedGoogleSession) {
          const parsed = JSON.parse(savedGoogleSession);
          if (parsed.user) {
            setSupabaseUser(parsed.user);
            const gEmail = parsed.user.email?.toLowerCase() || "";
            if (gEmail === "tariraecossystem@gmail.com" || gEmail === "tarira.ecossistema@gmail.com" || gEmail === "diasexpress3@gmail.com" || gEmail.includes("tarira")) {
              setIsAdminLoggedIn(true);
            }
          }
          if (parsed.profile) {
            setSupabaseProfile(parsed.profile);
            if (parsed.profile.role === "admin" || parsed.profile.email?.toLowerCase() === "diasexpress3@gmail.com") setIsAdminLoggedIn(true);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao restaurar sessão guardada:", err);
    }

    // 2. Detetar se o utilizador abriu um link de recuperação de password do Supabase
    const checkRecoveryUrl = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const isRecovery =
        hash.includes("type=recovery") ||
        hash.includes("type=invite") ||
        search.includes("type=recovery") ||
        (hash.includes("access_token") && (hash.includes("recovery") || hash.includes("type=recovery"))) ||
        hash.includes("error_description") ||
        search.includes("error_description");

      if (isRecovery) {
        setLoginMode("reset-password");
        setIsSupabaseAuthOpen(true);
      }
    };

    checkRecoveryUrl();
    window.addEventListener("hashchange", checkRecoveryUrl);

    // 3. Escuta evento de autenticação do Supabase de forma segura
    try {
      const supabase = getSupabaseClient();
      if (supabase && supabase.auth) {
        supabase.auth.getSession().then(async (res) => {
          const session = res?.data?.session;
          if (session?.user) {
            setSupabaseUser(session.user);
            const uEmail = session.user.email?.toLowerCase() || "";
            const uRole = session.user.user_metadata?.role;
            if (uEmail === "tarira.ecossistema@gmail.com" || uEmail === "tariraecossystem@gmail.com" || uEmail === "diasexpress3@gmail.com" || uEmail.includes("tarira") || uRole === "admin") {
              setIsAdminLoggedIn(true);
            }
            try {
              const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
              if (prof) {
                setSupabaseProfile(prof);
                const pEmail = prof.email?.toLowerCase() || "";
                if (prof.role === 'admin' || pEmail === 'diasexpress3@gmail.com' || pEmail.includes('tarira')) {
                  setIsAdminLoggedIn(true);
                }
              }
            } catch (e) {}
          }
        }).catch((err) => {
          console.warn("Aviso ao carregar sessão inicial do Supabase:", err);
        });

        const authResponse = supabase.auth.onAuthStateChange(async (event, session) => {
          try {
            if (event === "PASSWORD_RECOVERY") {
              setLoginMode("reset-password");
              setIsSupabaseAuthOpen(true);
            } else if (event === "SIGNED_IN" && session?.user) {
              setSupabaseUser(session.user);
              const uEmail = session.user.email?.toLowerCase() || "";
              const uRole = session.user.user_metadata?.role;
              if (uEmail === "tarira.ecossistema@gmail.com" || uEmail === "tariraecossystem@gmail.com" || uEmail === "diasexpress3@gmail.com" || uEmail.includes("tarira") || uRole === "admin") {
                setIsAdminLoggedIn(true);
              }
              try {
                const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
                if (prof) {
                  setSupabaseProfile(prof);
                  const pEmail = prof.email?.toLowerCase() || "";
                  if (prof.role === 'admin' || pEmail === 'diasexpress3@gmail.com' || pEmail.includes('tarira')) {
                    setIsAdminLoggedIn(true);
                  }
                }
              } catch (e) {}
            } else if (event === "SIGNED_OUT") {
              setSupabaseUser(null);
              setSupabaseProfile(null);
              setIsAdminLoggedIn(false);
            }
          } catch (listenerErr) {
            console.warn("Error inside onAuthStateChange listener:", listenerErr);
          }
        });

        const subscription = authResponse?.data?.subscription;
        return () => {
          window.removeEventListener("hashchange", checkRecoveryUrl);
          if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
          }
        };
      }
    } catch (authErr) {
      console.warn("Erro ao configurar listener do Supabase Auth:", authErr);
    }
    return () => {
      window.removeEventListener("hashchange", checkRecoveryUrl);
    };
  }, []);

  // Alteração de credenciais do Admin (painel Definições > Credenciais)
  const [credCurrentPassword, setCredCurrentPassword] = useState<string>("");
  const [credNewEmail, setCredNewEmail] = useState<string>("");
  const [credNewPassword, setCredNewPassword] = useState<string>("");
  const [credConfirmPassword, setCredConfirmPassword] = useState<string>("");
  const [credLoading, setCredLoading] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Computes active administrative status safely across all auth providers & accounts
  const isEffectiveAdmin = Boolean(
    isAdminLoggedIn ||
    supabaseProfile?.role === "admin" ||
    supabaseUser?.user_metadata?.role === "admin" ||
    (supabaseUser?.email && (
      supabaseUser.email.toLowerCase() === "tarira.ecossistema@gmail.com" ||
      supabaseUser.email.toLowerCase() === "tariraecossystem@gmail.com" ||
      supabaseUser.email.toLowerCase() === "diasexpress3@gmail.com" ||
      supabaseUser.email.toLowerCase().includes("tarira")
    )) ||
    (supabaseProfile?.email && (
      supabaseProfile.email.toLowerCase() === "tarira.ecossistema@gmail.com" ||
      supabaseProfile.email.toLowerCase() === "tariraecossystem@gmail.com" ||
      supabaseProfile.email.toLowerCase() === "diasexpress3@gmail.com" ||
      supabaseProfile.email.toLowerCase().includes("tarira")
    ))
  );

  // Computes precise user role for access-controlled areas (Recruit B2B, Connect, etc.)
  const resolvedUserRole: UserAccountRole = useMemo(() => {
    if (isEffectiveAdmin) return "admin";
    const profRole = (supabaseProfile?.role || supabaseProfile?.account_type || supabaseUser?.user_metadata?.role || "").toLowerCase();
    if (profRole === "admin") return "admin";
    if (profRole === "empresa" || profRole === "company" || selectedClient?.type === "company") return "empresa";
    if (profRole === "condominio" || profRole === "condo" || selectedClient?.type === "condo") return "condominio";
    if (profRole === "lar" || profRole === "particular" || profRole === "residential" || profRole === "individual" || selectedClient?.type === "residential") return "lar";
    if (profRole === "prestador" || profRole === "tecnico" || profRole === "technician") return "prestador";
    if (profRole === "profissional" || profRole === "professional" || profRole === "candidate") return "prestador";
    if (selectedProfessional) return "prestador";
    if (supabaseUser || supabaseProfile) {
      if (selectedClient?.type === "company") return "empresa";
      if (selectedClient?.type === "condo") return "condominio";
      return "lar";
    }
    return "guest";
  }, [isEffectiveAdmin, supabaseProfile, supabaseUser, selectedClient, selectedProfessional]);

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Erro ao terminar sessão:", err);
    }
    try {
      localStorage.removeItem("tarira_admin_logged");
      localStorage.removeItem("tarira_admin_session");
      localStorage.removeItem("tarira_google_session");
      localStorage.removeItem("tarira_authenticated_session");
      localStorage.removeItem("tarira_session_token");
      sessionStorage.removeItem("tarira_auth_session");
    } catch (e) {}
    setSupabaseUser(null);
    setSupabaseProfile(null);
    setIsAdminLoggedIn(false);
    setSelectedClient(null);
    setSelectedProfessional(null);
    setIsMobileMenuOpen(false);
    setActiveTab("landing");
  };

  // Central Terminology Info Modal State
  const [centralInfoModal, setCentralInfoModal] = useState<{ title: string; desc: string; details: string[]; icon: string } | null>(null);

  // Commercial Contact Modal State (Contactar a Comercial / Pedir Proposta com Upload de PDF ou Word)
  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState<boolean>(false);
  const [commercialContactForm, setCommercialContactForm] = useState<{
    name: string;
    company: string;
    phone: string;
    email: string;
    serviceType: string;
    notes: string;
    documentName: string;
    documentSize: string;
    documentData: string;
  }>({
    name: "",
    company: "",
    phone: "",
    email: "",
    serviceType: "business",
    notes: "",
    documentName: "",
    documentSize: "",
    documentData: ""
  });
  const [commercialContactSubmitted, setCommercialContactSubmitted] = useState<boolean>(false);
  const [commercialDragging, setCommercialDragging] = useState<boolean>(false);
  const [commercialUploadError, setCommercialUploadError] = useState<string>("");

  const handleCommercialFileUpload = (file: File) => {
    setCommercialUploadError("");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setCommercialUploadError("Formato não suportado. Por favor anexe exclusivamente um ficheiro em formato PDF (.pdf).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setCommercialUploadError(`O ficheiro PDF excede o tamanho máximo permitido de 2MB (2 Megabytes). O ficheiro selecionado possui ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    const sizeFormatted = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCommercialContactForm((prev) => ({
        ...prev,
        documentName: file.name,
        documentSize: sizeFormatted,
        documentData: (e.target?.result as string) || ""
      }));
    };
    reader.onerror = () => {
      setCommercialUploadError("Erro ao processar o ficheiro anexado. Tente novamente.");
    };
    reader.readAsDataURL(file);
  };

  const handleCommercialContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commercialContactForm.name || !commercialContactForm.phone) {
      alert("Por favor preencha o seu Nome e Contacto Telefónico.");
      return;
    }
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: commercialContactForm.name,
          phone: commercialContactForm.phone,
          email: commercialContactForm.email,
          company: commercialContactForm.company,
          serviceType: commercialContactForm.serviceType,
          notes: commercialContactForm.notes,
          documentName: commercialContactForm.documentName,
          documentSize: commercialContactForm.documentSize,
          documentData: commercialContactForm.documentData
        })
      });
    } catch (err) {
      console.warn("Aviso ao enviar contacto comercial para a API (fallback local):", err);
    }

    // Auto-create proposal in Commercial Admin Desk
    const mappedOperation = 
      commercialContactForm.serviceType === "business" ? "Atendimento ao Cliente, Helpdesk & Call Center / Outsourcing" :
      commercialContactForm.serviceType === "recruitment" ? "Recrutamento & Seleção B2B" :
      commercialContactForm.serviceType === "consulting" ? "Consultoria & Diagnóstico Operacional" :
      "Consulta Comercial Geral";

    const proposalPayload = {
      source: "direct_contact",
      companyName: commercialContactForm.company || commercialContactForm.name,
      contactPerson: commercialContactForm.name,
      contactEmail: commercialContactForm.email || "contacto@cliente.co.mz",
      contactPhone: commercialContactForm.phone,
      operationType: mappedOperation,
      headcount: 5,
      slaLevel: "Ouro (99% de Disponibilidade)",
      comments: commercialContactForm.notes,
      documentName: commercialContactForm.documentName || undefined,
      documentSize: commercialContactForm.documentSize || undefined,
      documentData: commercialContactForm.documentData || undefined,
      submittedAt: new Date().toISOString(),
      status: "pending",
      internalNotes: `Contacto directo submetido via modal comercial do site. Área: ${commercialContactForm.serviceType}${commercialContactForm.documentName ? ` | Ficheiro em anexo: ${commercialContactForm.documentName} (${commercialContactForm.documentSize})` : ""}`
    };

    // Regista a proposta no SERVIDOR (não só localmente) — isto garante que a
    // notificação por e-mail é expedida e que a proposta fica visível no painel
    // do administrador em qualquer sessão, não apenas no navegador de quem submeteu.
    try {
      const propRes = await fetch("/api/commercial-proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalPayload)
      });
      if (propRes.ok) {
        const propData = await propRes.json();
        if (propData.proposal) {
          handleAddCommercialProposal(propData.proposal);
        }
      } else {
        // Servidor recusou/falhou — mantém o registo local para não perder o pedido do cliente
        handleAddCommercialProposal({ id: `PROP-${Date.now().toString().slice(-6)}`, ...proposalPayload } as CommercialProposal);
      }
    } catch (err) {
      console.warn("Aviso ao registar proposta comercial no servidor (fallback local):", err);
      handleAddCommercialProposal({ id: `PROP-${Date.now().toString().slice(-6)}`, ...proposalPayload } as CommercialProposal);
    }

    setCommercialContactSubmitted(true);
  };

  // Client Selection Modal ("Selecionar Novo Serviço": Ofícios Técnicos - Connect vs Profissionais - Recrute)
  const [isServiceSelectionModalOpen, setIsServiceSelectionModalOpen] = useState<boolean>(false);

  // Churn & Anti-Bypass Protection Engine States (TARIRA Connect)
  const [churnSimParams, setChurnSimParams] = useState<{
    clientRepeatRate: number; // 0-100%
    chatContactExchanges: number; // 0-10
    payoutDropPercent: number; // 0-100%
    offPlatformReport: boolean;
  }>({
    clientRepeatRate: 45,
    chatContactExchanges: 1,
    payoutDropPercent: 20,
    offPlatformReport: false
  });
  const [isChurnInfoModalOpen, setIsChurnInfoModalOpen] = useState<boolean>(false);
  const [hasSignedProviderNonBypassContract, setHasSignedProviderNonBypassContract] = useState<boolean>(false);
  const [isInvestorDocsModalOpen, setIsInvestorDocsModalOpen] = useState<boolean>(false);

  // Partner Companies & Non-Participating Companies (Network & Benchmark) CRUD State
  const [partnerCompanies, setPartnerCompanies] = useState<PartnerCompanyItem[]>(() => {
    try {
      const saved = localStorage.getItem("tarira_partner_companies");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [isPartnerCompanyModalOpen, setIsPartnerCompanyModalOpen] = useState<boolean>(false);
  const [partnerCompanyEditId, setPartnerCompanyEditId] = useState<string | null>(null);
  const [partnerCompanyForm, setPartnerCompanyForm] = useState<Omit<PartnerCompanyItem, "id">>({
    name: "",
    type: "participating",
    sector: "",
    location: "Maputo",
    status: "active",
    notes: ""
  });

  // Partner Stores for Connect Materials & Products CRUD State
  const [partnerStores, setPartnerStores] = useState<PartnerStoreItem[]>(() => {
    try {
      const saved = localStorage.getItem("tarira_partner_stores");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [isPartnerStoreModalOpen, setIsPartnerStoreModalOpen] = useState<boolean>(false);
  const [partnerStoreEditId, setPartnerStoreEditId] = useState<string | null>(null);
  const [partnerStoreForm, setPartnerStoreForm] = useState<Omit<PartnerStoreItem, "id">>({
    name: "",
    category: "painting",
    categoryLabel: "Pintura & Acabamentos",
    address: "",
    phone: "",
    discountInfo: "10% Desconto p/ Clientes TARIRA",
    website: "",
    active: true
  });

  // CRUD Candidate Form Modal State
  const [crudCandidateModal, setCrudCandidateModal] = useState<{ mode: "create" | "edit"; candidate?: Partial<Candidate> } | null>(null);
  const [crudCandidateForm, setCrudCandidateForm] = useState<Partial<Candidate>>({});

  // Briefing Modal State for Central Team
  const [briefingModal, setBriefingModal] = useState<{ requestId: string; clientName: string; title: string; notes: string } | null>(null);

  // Client Collaborator Management States
  const [collaboratorSubTab, setCollaboratorSubTab] = useState<"ativos" | "desativos">("ativos");
  const [renewModalCollaborator, setRenewModalCollaborator] = useState<any | null>(null);
  const [renewDurationMonths, setRenewDurationMonths] = useState<number>(3);
  const [replaceModalCollaborator, setReplaceModalCollaborator] = useState<any | null>(null);
  const [replaceNote, setReplaceNote] = useState<string>("");
  const [deactivateModalCollaborator, setDeactivateModalCollaborator] = useState<any | null>(null);
  const [deactivateReason, setDeactivateReason] = useState<string>("Término de Contrato");
  const [reactivateModalCollaborator, setReactivateModalCollaborator] = useState<any | null>(null);
  const [reactivateDurationMonths, setReactivateDurationMonths] = useState<number>(3);

  // Admin Export Menu State & Candidate Detail Preview Modal
  const [adminExportDropdownOpen, setAdminExportDropdownOpen] = useState<boolean>(false);
  const [adminCandidatePreviewModal, setAdminCandidatePreviewModal] = useState<any | null>(null);

  // Helper function for Exporting Data in CSV/Excel format
  const handleExportData = (exportType: "trades" | "professionals" | "spontaneous" | "consolidated" | "clients") => {
    let filename = "";
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (exportType === "trades") {
      filename = "TARIRA_Novos_Registos_Oficios_Tecnicos";
      headers = ["ID", "Nome Completo", "Ofício / Especialidade", "Telefone", "Província/Cidade", "Tarifa MZN/h", "Status Validação", "Data Registo"];
      const tradesCandidates = candidates.filter(c => c.category === "trades" || !c.category);
      rows = tradesCandidates.map(c => [
        c.id,
        c.name,
        c.serviceName || c.primaryTrade || "Técnico de Ofício",
        c.phone || "N/A",
        c.location || "Maputo",
        c.rateMzn || 1000,
        c.status || "Ativo",
        new Date().toLocaleDateString("pt-MZ")
      ]);
    } else if (exportType === "professionals") {
      filename = "TARIRA_Novos_Registos_Profissionais_TI";
      headers = ["ID", "Nome Completo", "Especialidade TI/Executivo", "Telefone", "Email", "Anos Experiência", "Pretenção Salarial", "Status", "Data Registo"];
      const proCandidates = candidates.filter(c => c.category === "pro" || c.category === "recruit" || c.category === "connect");
      rows = proCandidates.map(c => [
        c.id,
        c.name,
        c.serviceName || "Profissional de TI / Gestão",
        c.phone || "N/A",
        c.email || "N/A",
        c.experienceYears || "3+ Anos",
        c.rateMzn ? `${c.rateMzn * 160} MZN/Mês` : "A combinar",
        c.status || "Ativo",
        new Date().toLocaleDateString("pt-MZ")
      ]);
    } else if (exportType === "spontaneous") {
      filename = "TARIRA_Candidaturas_Espontaneas_ATS";
      headers = ["ID Candidatura", "Nome Completo", "Contacto", "Email", "Residência", "Foco de Carreira", "NUIT", "Score ATS %", "Ficheiro CV", "Ficheiro ID", "Status", "Data Submissão"];
      rows = spontaneousApplications.map(app => [
        app.id,
        app.fullName,
        app.phone,
        app.email || "N/A",
        app.residence,
        app.careerFocus === "recruitment_no_exp" ? "Recrutamento Sem Experiência" : app.careerFocus === "business_volume" ? "Operações Business (Lote)" : "Ofícios Técnicos",
        app.nuit,
        `${app.atsScore}%`,
        app.cvDocumentName,
        app.idDocumentName,
        app.status === "approved_pool" ? "Aprovado / Banco de Talentos" : "Pendente Triagem",
        app.submittedAt || new Date().toLocaleDateString("pt-MZ")
      ]);
    } else if (exportType === "consolidated") {
      filename = "TARIRA_Relatorio_Consolidado_Colaboradores_Contratos";
      headers = ["ID Pedido", "Cliente", "Colaborador", "Serviço / Função", "Modelo Contrato", "Duração", "Data Início", "Data Término", "Dias Restantes", "Status", "Qualidade / Rating"];
      rows = hires.map(h => {
        const duration = h.contractDurationMonths || 3;
        const start = h.contractStartDate || h.createdAt?.slice(0, 10) || "2026-05-01";
        return [
          h.id,
          h.clientName || "Cliente Corporativo",
          h.candidateName,
          h.serviceName,
          h.contractModel || "Outsourcing / Prestação de Serviço",
          `${duration} Meses`,
          start,
          h.contractEndDate || "2026-08-15",
          h.remainingDays || 25,
          h.isActive === false ? "Desativo / Finalizado" : (h.status || "Ativo"),
          h.review?.rating ? `${h.review.rating}/5` : "Aguardando Avaliação"
        ];
      });
    } else if (exportType === "clients") {
      filename = "TARIRA_Registo_Empresas_Parceiras";
      headers = ["ID Cliente", "Empresa", "Nuit", "Sector", "Contacto", "Email", "Pedidos Efetuados", "Status Contratação"];
      rows = clients.map(cl => [
        cl.id,
        cl.name,
        cl.nuit || "400192831",
        cl.sector || "Banca & Serviços",
        cl.contactPhone || "+258 84 000 0000",
        cl.email || "contacto@empresa.co.mz",
        hires.filter(h => h.clientId === cl.id).length,
        cl.status || "Ativo / Verificado"
      ]);
    }

    const BOM = "\uFEFF";
    const csvText = BOM + [
      headers.join(";"),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    ].join("\r\n");

    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setAdminExportDropdownOpen(false);
  };

  // Helper function for Downloading Candidate Documents
  const handleDownloadCandidateDocument = (candidateName: string, docName: string, docType: string, candidateData?: any) => {
    const content = `================================================================
REPÚBLICA DE MOÇAMBIQUE • PLATAFORMA DE GESTÃO TARIRA
DOCUMENTO OFICIAL REGISTADO NO BANCO DE TALENTOS & ATS
================================================================
Candidato: ${candidateName}
Tipo de Documento: ${docType} (${docName})
Data do Download: ${new Date().toLocaleString("pt-MZ")}
----------------------------------------------------------------
DADOS DO CANDIDATO:
- Nome Completo: ${candidateName}
- NUIT: ${candidateData?.nuit || "108392019"}
- Contacto: ${candidateData?.phone || "+258 84 000 0000"}
- Email: ${candidateData?.email || "candidato@tarira.co.mz"}
- Residência: ${candidateData?.residence || candidateData?.location || "Maputo"}
- Foco de Carreira: ${candidateData?.careerFocus || candidateData?.serviceName || "Talento Registado TARIRA"}
- Validação ATS: ${candidateData?.atsScore ? candidateData.atsScore + "% Match Score" : "Validado por Agentes TARIRA"}

HISTÓRICO DE EXPERIÊNCIA & CURRICULUM:
${candidateData?.experiences?.map((e: any) => `- ${e.role} em ${e.company} (${e.duration}): ${e.responsibilities}`).join("\n") || "- Profissional verificado com experiência em operações corporativas e de campo."}

----------------------------------------------------------------
Este documento constitui uma cópia digital verificada pela Central de Operações TARIRA.
================================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docName.replace(/\.[^/.]+$/, "")}_${candidateName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper functions for Collaborator Contract Lifecycle
  const handleRenewContract = (hireId: string, additionalMonths: number) => {
    setHires(prev => prev.map(h => {
      if (h.id === hireId) {
        const currentMonths = h.contractDurationMonths || 3;
        const newDuration = currentMonths + additionalMonths;
        const today = new Date();
        const newEndDate = new Date(today.setMonth(today.getMonth() + additionalMonths)).toISOString().slice(0, 10);
        return {
          ...h,
          contractDurationMonths: newDuration,
          contractEndDate: newEndDate,
          isActive: true,
          status: "active",
          checkins: [
            `🔄 RENOVAÇÃO CONTRATUAL — Contrato renovado por +${additionalMonths} meses (Duração total: ${newDuration} meses). Novo término: ${newEndDate}.`,
            ...(h.checkins || [])
          ]
        };
      }
      return h;
    }));
    setRenewModalCollaborator(null);
    alert("Contrato renovado com sucesso! As informações de vigência foram atualizadas.");
  };

  const handleRequestReplacement = (hireId: string, note: string) => {
    setHires(prev => prev.map(h => {
      if (h.id === hireId) {
        return {
          ...h,
          replacementRequested: true,
          replacementNote: note,
          checkins: [
            `🔁 SOLICITAÇÃO DE SUBSTITUIÇÃO — Cliente solicitou substituição do colaborador. Nota: "${note}". Agentes TARIRA acionados.`,
            ...(h.checkins || [])
          ]
        };
      }
      return h;
    }));
    setReplaceModalCollaborator(null);
    setReplaceNote("");
    alert("Solicitação de substituição enviada aos operadores da TARIRA com sucesso!");
  };

  const handleDeactivateCollaborator = (hireId: string, reason: string) => {
    setHires(prev => prev.map(h => {
      if (h.id === hireId) {
        return {
          ...h,
          isActive: false,
          status: "deactivated",
          deactivationReason: reason,
          deactivatedAt: new Date().toLocaleDateString("pt-MZ"),
          checkins: [
            `🛑 COLABORADOR DESATIVADO — Colaborador movido para lista de desativos. Motivo: ${reason}.`,
            ...(h.checkins || [])
          ]
        };
      }
      return h;
    }));
    setDeactivateModalCollaborator(null);
    alert("Colaborador desativado e arquivado no histórico. Poderá reativá-lo ou recuperá-lo a qualquer momento na aba de Desativos!");
  };

  const handleReactivateCollaborator = (hireId: string, newDurationMonths: number) => {
    setHires(prev => prev.map(h => {
      if (h.id === hireId) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const endDateObj = new Date();
        endDateObj.setMonth(endDateObj.getMonth() + newDurationMonths);
        const newEndDateStr = endDateObj.toISOString().slice(0, 10);
        return {
          ...h,
          isActive: true,
          status: "active",
          contractDurationMonths: newDurationMonths,
          contractStartDate: todayStr,
          contractEndDate: newEndDateStr,
          deactivationReason: undefined,
          deactivatedAt: undefined,
          checkins: [
            `⚡ COLABORADOR REATIVADO / RECUPERADO — Recontratação efetuada por ${newDurationMonths} meses (Início: ${todayStr} • Término: ${newEndDateStr}).`,
            ...(h.checkins || [])
          ]
        };
      }
      return h;
    }));
    setReactivateModalCollaborator(null);
    alert("Colaborador reativado com sucesso! Foi re-adicionado à lista de Colaboradores Ativos com um novo período contratual.");
  };

  // Central Team Operations Workspace States (Equipa Central & Pipeline TARIRA)
  const [centralSubTab, setCentralSubTab] = useState<"inbox" | "pipeline" | "agents" | "methodology" | "candidates_crud">("inbox");
  const [centralAgents, setCentralAgents] = useState<Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    photo: string;
    status: "active" | "inactive";
    activeCases: number;
    specialty: string;
    languages: string[];
    domainExperience: string;
  }>>([
    {
      id: "ag-1",
      name: "Dinis Mandlate",
      role: "Especialista de Atendimento & Suporte Financeiro",
      email: "dinis.mandlate@tarira.co.mz",
      phone: "+258 84 102 3040",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      status: "active",
      activeCases: 6,
      specialty: "Suporte Financeiro, Conciliação e Reclamações de Clientes",
      languages: ["Português", "Changana (Shangaan)", "Inglês"],
      domainExperience: "Área Financeira, Apoio Bancário & Carteiras Móveis (M-Pesa / e-Mola)"
    },
    {
      id: "ag-2",
      name: "Sheila Tembe",
      role: "Coordenadora de Atendimento em Telecomunicações",
      email: "sheila.tembe@tarira.co.mz",
      phone: "+258 82 450 1122",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      status: "active",
      activeCases: 11,
      specialty: "Apoio ao Cliente Telecom, Resolução de Incidências e Helpdesk",
      languages: ["Português", "Emakhuwa (Makua)", "Inglês"],
      domainExperience: "Telecomunicações & Call Center Corporativo"
    },
    {
      id: "ag-3",
      name: "Élio Guambe",
      role: "Agente Trilingue de Atendimento & Finanças",
      email: "elio.guambe@tarira.co.mz",
      phone: "+258 84 990 8820",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      status: "active",
      activeCases: 8,
      specialty: "Atendimento Multilingue, Cobranças e Reconciliação",
      languages: ["Português", "Emakhuwa (Makua)", "Changana (Shangaan)", "Inglês"],
      domainExperience: "Telecomunicações, Suporte Financeiro & Microfinanças"
    },
    {
      id: "ag-4",
      name: "Ancha Mabote",
      role: "Supervisora de Atendimento ao Cliente & Qualidade",
      email: "ancha.mabote@tarira.co.mz",
      phone: "+258 87 330 4050",
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      status: "active",
      activeCases: 4,
      specialty: "Gestão da Experiência do Cliente & Retenção",
      languages: ["Português", "Emakhuwa (Makua)", "Inglês"],
      domainExperience: "Atendimento ao Cliente & Operações Telecom"
    },
    {
      id: "ag-5",
      name: "Celso Macamo",
      role: "Agente de Atendimento em Apoio Bancário e Finanças",
      email: "celso.macamo@tarira.co.mz",
      phone: "+258 84 551 2020",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      status: "active",
      activeCases: 5,
      specialty: "Apoio a Contas, Faturação e Cobrança",
      languages: ["Português", "Changana (Shangaan)", "Inglês"],
      domainExperience: "Finanças, Apoio Bancário & Cobranças"
    },
    {
      id: "ag-6",
      name: "Amina Abdala",
      role: "Agente de Atendimento ao Cliente e Helpdesk Telecom",
      email: "amina.abdala@tarira.co.mz",
      phone: "+258 86 112 9900",
      photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200",
      status: "active",
      activeCases: 7,
      specialty: "Helpdesk Técnico & Telecomunicações",
      languages: ["Português", "Emakhuwa (Makua)", "Inglês"],
      domainExperience: "Telecomunicações & Suporte Técnico de Linha 1 e 2"
    }
  ]);

  const [isAgentModalOpen, setIsAgentModalOpen] = useState<boolean>(false);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [agentForm, setAgentForm] = useState({
    name: "",
    role: "Agente de Atendimento ao Cliente",
    email: "",
    phone: "",
    photo: "",
    specialty: "Atendimento ao Cliente & Suporte Financeiro",
    languagesStr: "Português, Emakhuwa (Makua), Inglês",
    domainExperience: "Telecomunicações & Finanças",
    status: "active" as "active" | "inactive"
  });

  // Central Pipeline & Ecosystem Incoming Requests State
  const [centralPipelineRequests, setCentralPipelineRequests] = useState<Array<{
    id: string;
    title: string;
    clientName: string;
    clientType: "company" | "residential" | "condo";
    module: "recruit" | "connect" | "business" | "consulting" | "studio";
    stage: "briefing" | "sourcing" | "community" | "shortlist" | "interview" | "hired";
    assignedAgentId: string;
    assignedAgentName: string;
    candidatesCount: number;
    salaryProposal: string;
    createdAt: string;
    priority: "high" | "medium" | "low";
    feedbacks: Array<{ id: string; author: string; role: string; text: string; stage: string; timestamp: string }>;
  }>>([
    {
      id: "REQ-2026-001",
      title: "Senior Full Stack Engineer (Node/React) - Sourcing Ativo TARIRA",
      clientName: "Vodacom Moçambique",
      clientType: "company",
      module: "recruit",
      stage: "shortlist",
      assignedAgentId: "ag-1",
      assignedAgentName: "Dinis Mandlate",
      candidatesCount: 4,
      salaryProposal: "120.000 MZN/mês",
      createdAt: "22/07/2026",
      priority: "high",
      feedbacks: [
        {
          id: "fb-1",
          author: "Dinis Mandlate",
          role: "Talent Partner",
          stage: "Briefing do Cliente",
          text: "Briefing concluído com o CTO da Vodacom. Foco total em autonomia, arquitetura cloud e liderança técnica de equipa.",
          timestamp: "22/07/2026 10:30"
        },
        {
          id: "fb-2",
          author: "Élio Guambe",
          role: "Sourcing Especialista",
          stage: "Sourcing Ativo (Base TARIRA)",
          text: "Mapeados 18 perfis na base TARIRA. 5 candidatos passivos aceitaram abordagem inicial.",
          timestamp: "23/07/2026 14:15"
        },
        {
          id: "fb-3",
          author: "Dinis Mandlate",
          role: "Talent Partner",
          stage: "Shortlist & Fit Cultural",
          text: "Curadoria realizada. 4 candidatos aprovados com fit cultural A+. Apresentados ao cliente para entrevista.",
          timestamp: "24/07/2026 08:45"
        }
      ]
    },
    {
      id: "REQ-2026-002",
      title: "Especialista em Logística e Cadeia de Mantimentos",
      clientName: "Cervejas de Moçambique (CDM)",
      clientType: "company",
      module: "recruit",
      stage: "sourcing",
      assignedAgentId: "ag-3",
      assignedAgentName: "Élio Guambe",
      candidatesCount: 7,
      salaryProposal: "95.000 MZN/mês",
      createdAt: "21/07/2026",
      priority: "medium",
      feedbacks: [
        {
          id: "fb-4",
          author: "Élio Guambe",
          role: "Sourcing Especialista",
          stage: "Sourcing Ativo (Base TARIRA)",
          text: "Em triagem ativa de candidatos com certificação em SAP e gestão de frotas em Maputo e Matola.",
          timestamp: "22/07/2026 11:20"
        }
      ]
    },
    {
      id: "REQ-2026-003",
      title: "Intervenção Técnica de Manutenção Climatização & Elétrica",
      clientName: "Condomínio Maresias (Sommerchield)",
      clientType: "condo",
      module: "connect",
      stage: "interview",
      assignedAgentId: "ag-2",
      assignedAgentName: "Sheila Tembe",
      candidatesCount: 2,
      salaryProposal: "1.200 MZN/hora (4h)",
      createdAt: "23/07/2026",
      priority: "high",
      feedbacks: [
        {
          id: "fb-5",
          author: "Sheila Tembe",
          role: "Coordenadora Connect",
          stage: "Entrevista / Apresentação",
          text: "Equipa técnica selecionada e credenciada com selo de verificação BI. Validação presencial agendada.",
          timestamp: "23/07/2026 16:00"
        }
      ]
    },
    {
      id: "REQ-2026-004",
      title: "Consultoria de Reestruturação do Processo de R&S",
      clientName: "Banco Millennium BIM",
      clientType: "company",
      module: "consulting",
      stage: "briefing",
      assignedAgentId: "ag-4",
      assignedAgentName: "Ancha Mabote",
      candidatesCount: 1,
      salaryProposal: "350.000 MZN (Projeto)",
      createdAt: "24/07/2026",
      priority: "medium",
      feedbacks: [
        {
          id: "fb-6",
          author: "Ancha Mabote",
          role: "Gestora de Fit Cultural",
          stage: "Briefing do Cliente",
          text: "Sessão de diagnóstico iniciada. Mapeamento das fragilidades no funil de atração e retenção de quadros jovens.",
          timestamp: "24/07/2026 09:10"
        }
      ]
    },
    {
      id: "REQ-2026-005",
      title: "Gestão SLA de Operações & Equipas de Campo (B2B)",
      clientName: "Moçambique Distribuição & Serviços S.A.",
      clientType: "company",
      module: "business",
      stage: "shortlist",
      assignedAgentId: "ag-1",
      assignedAgentName: "Dinis Mandlate",
      candidatesCount: 5,
      salaryProposal: "480.000 MZN/mês (SLA Corporativo)",
      createdAt: "25/07/2026",
      priority: "high",
      feedbacks: [
        {
          id: "fb-7",
          author: "Dinis Mandlate",
          role: "Talent Partner & Business Lead",
          stage: "Shortlist & Acordo B2B",
          text: "Proposta B2B de gestão SLA aprovada com nivelamento de equipas e garantia contratual de 98% de uptime de frota.",
          timestamp: "25/07/2026 15:30"
        }
      ]
    },
    {
      id: "REQ-2026-006",
      title: "Produção Multimédia, Branding & Campanha Digital de Recrutamento",
      clientName: "Standard Bank Moçambique",
      clientType: "company",
      module: "studio",
      stage: "interview",
      assignedAgentId: "ag-2",
      assignedAgentName: "Sheila Tembe",
      candidatesCount: 3,
      salaryProposal: "320.000 MZN (Projeto Multimédia)",
      createdAt: "26/07/2026",
      priority: "high",
      feedbacks: [
        {
          id: "fb-8",
          author: "Sheila Tembe",
          role: "Coordenadora Studio",
          stage: "Produção & Apresentação",
          text: "Storyboard e maquetas de vídeos de Employer Branding apresentados e aprovados pela equipa de Marketing do Banco.",
          timestamp: "26/07/2026 11:45"
        }
      ]
    }
  ]);

  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<any | null>(null);
  const [newFeedbackText, setNewFeedbackText] = useState<string>("");
  const [selectedPipelineFilter, setSelectedPipelineFilter] = useState<string>("all");

  // Agent CRUD Operations Handlers
  const handleSaveAgent = () => {
    if (!agentForm.name || !agentForm.email) {
      alert("Por favor preencha o nome e o email do agente.");
      return;
    }

    const parsedLanguages = agentForm.languagesStr
      ? agentForm.languagesStr.split(",").map(l => l.trim()).filter(Boolean)
      : ["Português", "Inglês"];

    if (editingAgent) {
      setCentralAgents(prev => prev.map(ag => ag.id === editingAgent.id ? {
        ...ag,
        name: agentForm.name,
        role: agentForm.role,
        email: agentForm.email,
        phone: agentForm.phone || ag.phone,
        specialty: agentForm.specialty,
        languages: parsedLanguages,
        domainExperience: agentForm.domainExperience || ag.domainExperience || "Telecomunicações & Finanças",
        photo: agentForm.photo || ag.photo,
        status: agentForm.status
      } : ag));
      alert("Dados do agente atualizados com sucesso!");
    } else {
      const newAg = {
        id: `ag-${Date.now()}`,
        name: agentForm.name,
        role: agentForm.role,
        email: agentForm.email,
        phone: agentForm.phone || "+258 84 000 0000",
        photo: agentForm.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        status: agentForm.status || "active",
        activeCases: 0,
        specialty: agentForm.specialty || "Atendimento ao Cliente",
        languages: parsedLanguages,
        domainExperience: agentForm.domainExperience || "Telecomunicações & Finanças"
      };
      setCentralAgents(prev => [...prev, newAg]);
      alert("Novo agente da Central cadastrado com sucesso!");
    }

    setIsAgentModalOpen(false);
    setEditingAgent(null);
    setAgentForm({
      name: "",
      role: "Agente de Atendimento ao Cliente",
      email: "",
      phone: "",
      photo: "",
      specialty: "Atendimento ao Cliente & Suporte Financeiro",
      languagesStr: "Português, Emakhuwa (Makua), Inglês",
      domainExperience: "Telecomunicações & Finanças",
      status: "active"
    });
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirm("Tem certeza de que deseja remover este agente da Equipa Central?")) {
      setCentralAgents(prev => prev.filter(a => a.id !== agentId));
      alert("Agente removido.");
    }
  };

  const handleToggleAgentStatus = (agentId: string) => {
    setCentralAgents(prev => prev.map(a => a.id === agentId ? {
      ...a,
      status: a.status === "active" ? "inactive" : "active"
    } : a));
  };

  // Pipeline Feedback Handler
  const handleAddPipelineFeedback = (requestId: string) => {
    if (!newFeedbackText.trim()) return;
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newFb = {
      id: `fb-${Date.now()}`,
      author: "Agente Central (Você)",
      role: "Talent Partner / Operações",
      stage: selectedRequestForDetail?.stage ? getStageLabel(selectedRequestForDetail.stage) : "Processamento",
      text: newFeedbackText,
      timestamp
    };

    setCentralPipelineRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updatedFeedbacks = [...req.feedbacks, newFb];
        const updatedReq = { ...req, feedbacks: updatedFeedbacks };
        if (selectedRequestForDetail?.id === requestId) {
          setSelectedRequestForDetail(updatedReq);
        }
        return updatedReq;
      }
      return req;
    }));

    setNewFeedbackText("");
  };

  const handleMovePipelineStage = (requestId: string, newStage: any) => {
    setCentralPipelineRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updated = { ...req, stage: newStage };
        if (selectedRequestForDetail?.id === requestId) {
          setSelectedRequestForDetail(updated);
        }
        return updated;
      }
      return req;
    }));
  };

  const handleAssignAgentToRequest = (requestId: string, agentId: string) => {
    const agent = centralAgents.find(a => a.id === agentId);
    if (!agent) return;

    setCentralPipelineRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updated = { ...req, assignedAgentId: agent.id, assignedAgentName: agent.name };
        if (selectedRequestForDetail?.id === requestId) {
          setSelectedRequestForDetail(updated);
        }
        return updated;
      }
      return req;
    }));
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "briefing": return "1. Briefing do Cliente";
      case "sourcing": return "2. Sourcing Ativo (Base TARIRA)";
      case "community": return "3. Curadoria de Comunidade";
      case "shortlist": return "4. Shortlist & Fit Cultural";
      case "interview": return "5. Entrevista / Apresentação";
      case "hired": return "6. Contratado & Onboarding";
      default: return stage;
    }
  };

  // Hiring Flow active step detail
  const [activeFlowStep, setActiveFlowStep] = useState<number | null>(0);
  
  // Interactive simulator for Step 4
  const [simulatingTriageStep, setSimulatingTriageStep] = useState<boolean>(false);
  const [simulatedTriageResult, setSimulatedTriageResult] = useState<any>(null);

  // SMS/WhatsApp simulation states
  const [notificationLogs, setNotificationLogs] = useState<Array<{
    id: string;
    timestamp: string;
    channel: "SMS" | "WhatsApp";
    recipient: string;
    phone: string;
    step: string;
    message: string;
    status: "success" | "pending";
  }>>([
    {
      id: "notif-0",
      timestamp: "14/07/2026, 09:15",
      channel: "WhatsApp",
      recipient: "Mateus Tembe",
      phone: "+258 87 142 5314",
      step: "Triagem Automatizada",
      message: "Olá Mateus! O seu perfil foi avaliado pelo nosso motor automático de triagem da TARIRA Recruit e obteve uma compatibilidade de 96%. Entraremos em contacto brevemente.",
      status: "success"
    }
  ]);
  const [notifRecipient, setNotifRecipient] = useState<string>("Mateus Tembe");
  const [notifPhone, setNotifPhone] = useState<string>("+258 87 142 5314");
  const [notifChannel, setNotifChannel] = useState<"SMS" | "WhatsApp">("WhatsApp");
  const [notifMessage, setNotifMessage] = useState<string>("");
  const [isSendingNotif, setIsSendingNotif] = useState<boolean>(false);

  useEffect(() => {
    if (activeFlowStep === 4) {
      setNotifMessage(`Olá ${notifRecipient}! O seu perfil foi avaliado pelo nosso motor automático de triagem da TARIRA Recruit e obteve uma compatibilidade de 96% (IFPELAC Válido). Aguarde pela convocatória da entrevista.`);
    } else if (activeFlowStep === 5) {
      setNotifMessage(`Olá ${notifRecipient}! Temos o prazer de informar que o seu perfil foi selecionado para a Shortlist da TARIRA Recruit. Convocamos-lo para uma entrevista técnica presencial em Maputo.`);
    } else if (activeFlowStep === 6) {
      setNotifMessage(`Olá ${notifRecipient}! A decisão técnica para a sua candidatura na TARIRA Recruit foi tomada. Queremos fornecer-lhe um feedback completo e construtivo. Aceda à consola para mais detalhes.`);
    } else if (activeFlowStep === 7) {
      setNotifMessage(`Prezado ${notifRecipient}, parabéns! A sua minuta de contrato de prestação de serviços técnicos foi gerada com sucesso pela TARIRA Recruit. O documento já está disponível para assinatura digital.`);
    }
  }, [activeFlowStep, notifRecipient]);

  // Set HTML document lang dynamically for browser auto-translation compatibility
  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Persist partnerCompanies and partnerStores to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tarira_partner_companies", JSON.stringify(partnerCompanies));
    } catch (e) {
      console.error(e);
    }
  }, [partnerCompanies]);

  useEffect(() => {
    try {
      localStorage.setItem("tarira_partner_stores", JSON.stringify(partnerStores));
    } catch (e) {
      console.error(e);
    }
  }, [partnerStores]);

  // NOTA: removido o auto-scroll forçado até à secção de pesquisa em "client_find"
  // (Técnicos de Campo) — fazia a página abrir a meio (na barra de pesquisa) em vez
  // de no topo/banner, ao contrário de "profissionais" (Talentos e Quadros), que já
  // abria corretamente no topo. Agora os dois menus têm o mesmo comportamento.

  // Interactive state for Step 9 (Gross salary custom calculator)
  const [simulatedGrossSalary, setSimulatedGrossSalary] = useState<number>(15000);

  // Interactive Pipeline step for "Electricista Sénior"
  const [pipelineStage, setPipelineStage] = useState<number>(3); // Default to "Entrevistas"

  // Feedback Configuration Tab states
  const [activeFeedbackPhase, setActiveFeedbackPhase] = useState<number>(0);
  const [feedbackTemplates, setFeedbackTemplates] = useState([
    {
      phase: 1,
      title: "Triagem Inicial",
      sla: "⏱ 48h SLA",
      subject: "[TARIRA Recruit] Actualização da sua candidatura — Fase 1",
      body: "Caro/a {nome},\n\nObrigado pelo seu interesse na vaga de {vaga}.\n\nApós análise inicial, verificámos que o seu perfil não corresponde aos requisitos específicos desta posição neste momento.\n\nEncorajamo-lo a candidatar-se a futuras oportunidades e manter o seu perfil actualizado no nosso ecossistema Candidatura Aberta."
    },
    {
      phase: 2,
      title: "Após Entrevista",
      sla: "⏱ 72h SLA",
      subject: "[TARIRA Recruit] Feedback sobre a sua entrevista — Fase 2",
      body: "Olá {nome},\n\nAgradecemos a sua presença na entrevista para a vaga de {vaga}.\n\nFoi um prazer conhecer a sua trajectória. No entanto, optámos por avançar com candidatos cujas competências práticas estão mais alinhadas com as especificações imediatas da empresa.\n\nDesejamos-lhe o maior sucesso profissional."
    },
    {
      phase: 3,
      title: "Shortlist Final",
      sla: "⏱ 96h SLA",
      subject: "[TARIRA Recruit] Resultado do processo de selecção — Fase 3",
      body: "Prezado/a {nome},\n\nChegámos à fase final do processo de recrutamento para {vaga}.\n\nEmbora o seu perfil técnico seja de altíssimo nível, decidimos seleccionar outro profissional para esta vaga específica.\n\nO seu registo permanece na nossa base recomendada com prioridade máxima para as próximas solicitações."
    },
    {
      phase: 4,
      title: "Reengajamento",
      sla: "Automático",
      subject: "[TARIRA Recruit] Temos novas oportunidades compatíveis com o seu perfil!",
      body: "Olá {nome},\n\nO nosso motor inteligente de triagem identificou uma nova oportunidade para {vaga} que possui alta compatibilidade com as competências que registou na TARIRA.\n\nGostaria de submeter a sua candidatura directamente? Responda a este email para confirmar."
    }
  ]);

  // Candidatura Aberta Form states
  const [applyForm, setApplyForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    residence: "",
    latitude: -25.9692,
    longitude: 32.5732,
    addressZone: "",
    bio: "",
    category: "tech",
    identityDocName: "",
    cvDocName: "",
    certificatesDocName: "",
    photo: ""
  });
  const [submittingApply, setSubmittingApply] = useState<boolean>(false);
  const [applyResult, setApplyResult] = useState<any>(null);

  // TARIRA Recruit Briefing Form (Fase 1 - Levantamento de Necessidades)
  const [isBriefingFormOpen, setIsBriefingFormOpen] = useState<boolean>(false);
  const [briefingTargetCompany, setBriefingTargetCompany] = useState<string>("");
  const [activeRecruitMethodologyPhase, setActiveRecruitMethodologyPhase] = useState<number>(1);
  const [briefingForm, setBriefingForm] = useState({
    companyName: "",
    category: "tech",
    qtdVagas: 1,
    technicalProfile: "",
    mandatoryCriteria: "",
    desirableCriteria: "",
    minExperience: "2 anos de experiência na área",
    location: "Maputo / Matola",
    urgency: "Normal (3-5 dias)",
    salaryBudget: "60.000 MZN - 90.000 MZN/mês",
    validationChannel: "email_interno" as "virtual" | "presencial" | "email_interno",
    selectionMechanism: "curadoria_tarira" as "curadoria_tarira" | "acesso_direto_empresa",
    directSelection: false,
    contactEmail: "",
    contactPhone: "",
    documentName: "",
    documentSize: "",
    documentData: ""
  });
  const [briefingSubmitted, setBriefingSubmitted] = useState<any | null>(null);
  const [briefingDragging, setBriefingDragging] = useState<boolean>(false);
  const [briefingUploadError, setBriefingUploadError] = useState<string>("");

  const handleBriefingFileUpload = (file: File) => {
    setBriefingUploadError("");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setBriefingUploadError("Formato não suportado. Por favor anexe exclusivamente um ficheiro em formato PDF (.pdf).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setBriefingUploadError(`O ficheiro PDF excede o tamanho máximo permitido de 2MB (2 Megabytes). O ficheiro selecionado possui ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    const sizeFormatted = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      setBriefingForm((prev) => ({
        ...prev,
        documentName: file.name,
        documentSize: sizeFormatted,
        documentData: (e.target?.result as string) || ""
      }));
    };
    reader.onerror = () => {
      setBriefingUploadError("Erro ao processar o ficheiro anexado. Tente novamente.");
    };
    reader.readAsDataURL(file);
  };

  // Explanatory Modal State for the 6 Phases of TARIRA Recruit
  const [phaseExplainerModal, setPhaseExplainerModal] = useState<{
    phase: number;
    title: string;
    subtitle: string;
    icon: string;
    badge: string;
    gradientClass: string;
    borderClass: string;
    textAccentClass: string;
    keyPoints: string[];
    advantage: string;
    explanation: string;
  } | null>(null);

  const handleBriefingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefingForm.companyName || !briefingForm.technicalProfile) {
      alert("Por favor, preencha o Nome da Empresa e o Perfil Técnico Exigido.");
      return;
    }

    const newReqId = `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newReq = {
      id: newReqId,
      title: `${briefingForm.technicalProfile} (${briefingForm.qtdVagas} vaga${briefingForm.qtdVagas > 1 ? 's' : ''})`,
      clientName: briefingForm.companyName,
      clientType: "company" as const,
      module: "recruit" as const,
      stage: "briefing" as const,
      assignedAgentId: "ag-1",
      assignedAgentName: "Dinis Mandlate (Recruitment Lead)",
      candidatesCount: Math.min(briefingForm.qtdVagas * 3, 12),
      salaryProposal: briefingForm.salaryBudget,
      createdAt: new Date().toLocaleDateString("pt-MZ"),
      priority: briefingForm.urgency.includes("Urgente") ? ("high" as const) : ("medium" as const),
      briefingData: {
        ...briefingForm,
        submittedAt: new Date().toISOString(),
        fichaStatus: "Validada e Processada - Fase 1"
      },
      feedbacks: [
        {
          id: `fb-${Date.now()}`,
          author: "Sistema TARIRA Recruit",
          role: "Plataforma de R&S",
          stage: "Fase 1 — Briefing Registado",
          text: `Ficha de Requisição de Vaga submetida via Painel da Empresa (sem WhatsApp). Validação via ${
            briefingForm.validationChannel === "virtual" ? "Canal Virtual" : briefingForm.validationChannel === "presencial" ? "Reunião Presencial" : "E-mail Interno Formal"
          }. Mecanismo de Seleção: ${
            briefingForm.selectionMechanism === "curadoria_tarira" ? "Curadoria TARIRA (Mecanismo A)" : "Acesso Direto à Base (Mecanismo B)"
          }.`,
          timestamp: `${new Date().toLocaleDateString("pt-MZ")} ${new Date().toLocaleTimeString("pt-MZ", { hour: '2-digit', minute: '2-digit' })}`
        }
      ]
    };

    try {
      await fetch("/api/briefings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: briefingForm.companyName,
          category: briefingForm.category,
          qtdVagas: briefingForm.qtdVagas,
          technicalProfile: briefingForm.technicalProfile,
          mandatoryCriteria: briefingForm.mandatoryCriteria,
          desirableCriteria: briefingForm.desirableCriteria,
          salaryBudget: briefingForm.salaryBudget,
          urgency: briefingForm.urgency
        })
      });
    } catch (err) {
      console.warn("Aviso ao submeter briefing para a API (fallback local):", err);
    }

    setCentralPipelineRequests(prev => [newReq, ...prev]);
    setBriefingSubmitted(newReq);
  };

  // Admin CRUD states
  const [isAdminCreateOpen, setIsAdminCreateOpen] = useState<boolean>(false);
  const [isAdminEditOpen, setIsAdminEditOpen] = useState<boolean>(false);
  const [adminForm, setAdminForm] = useState({
    id: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    bio: "",
    category: "tech",
    matchScore: 85,
    feedback: "",
    status: "pending" as "pending" | "approved" | "rejected",
    photo: ""
  });

  // Handle manual candidate creation from Admin panel (CRUD Create)
  const handleAdminCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminForm.name,
          surname: adminForm.surname,
          email: adminForm.email,
          phone: adminForm.phone,
          bio: adminForm.bio,
          category: adminForm.category,
          matchScore: Number(adminForm.matchScore),
          feedback: adminForm.feedback || "Registo manual de conformidade pelo administrador.",
          status: adminForm.status,
          photo: adminForm.photo
        })
      });
      if (res.ok) {
        setIsAdminCreateOpen(false);
        setAdminForm({
          id: "",
          name: "",
          surname: "",
          email: "",
          phone: "",
          bio: "",
          category: "tech",
          matchScore: 85,
          feedback: "",
          status: "pending",
          photo: ""
        });
        fetchBackendData();
        alert("Prestador/Candidato registado manualmente no sistema com sucesso!");
      } else {
        const err = await res.json();
        alert(`Erro ao registar candidato: ${err.error}`);
      }
    } catch (err) {
      console.error("Erro ao criar candidato:", err);
    }
  };

  // Handle manual candidate update from Admin panel (CRUD Update)
  const handleAdminUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminForm.id) return;
    try {
      const res = await fetch(`/api/candidates/${adminForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: adminForm.name,
          surname: adminForm.surname,
          email: adminForm.email,
          phone: adminForm.phone,
          bio: adminForm.bio,
          category: adminForm.category,
          matchScore: Number(adminForm.matchScore),
          feedback: adminForm.feedback,
          status: adminForm.status,
          photo: adminForm.photo
        })
      });
      if (res.ok) {
        setIsAdminEditOpen(false);
        fetchBackendData();
        alert("Ficha do Prestador/Candidato actualizada com sucesso!");
      } else {
        const err = await res.json();
        alert(`Erro ao actualizar: ${err.error}`);
      }
    } catch (err) {
      console.error("Erro ao actualizar candidato:", err);
    }
  };

  // Handle candidate deletion from Admin panel (CRUD Delete)
  const handleAdminDelete = async (id: string, name: string, surname: string) => {
    if (!confirm(`Tem a certeza absoluta de que deseja eliminar do ecossistema a ficha de ${name} ${surname}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() }
      });
      if (res.ok) {
        fetchBackendData();
        alert("Candidato eliminado com sucesso do ecossistema TARIRA!");
      } else {
        alert("Erro ao eliminar o candidato.");
      }
    } catch (err) {
      console.error("Erro ao eliminar candidato:", err);
    }
  };

  // Handle client deletion from Admin panel (CRUD Delete)
  const handleAdminClientDelete = async (id: string, name: string) => {
    if (!confirm(`Tem a certeza absoluta de que deseja eliminar o cliente "${name}" do ecossistema?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() }
      });
      if (res.ok) {
        fetchBackendData();
        alert("Cliente eliminado com sucesso do ecossistema TARIRA!");
      } else {
        alert("Erro ao eliminar o cliente.");
      }
    } catch (err) {
      console.error("Erro ao eliminar cliente:", err);
    }
  };

  // Handle client creation from Admin panel (CRUD Create)
  const handleAdminClientCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientForm.name,
          type: clientForm.type,
          email: clientForm.email,
          phone: clientForm.phone,
          address: clientForm.address,
          bi: clientForm.bi,
          linkedin: clientForm.linkedin
        })
      });
      if (res.ok) {
        setIsAdminClientCreateOpen(false);
        fetchBackendData();
        setClientForm({
          id: "",
          name: "",
          type: "company",
          email: "",
          phone: "",
          address: "",
          bi: "",
          linkedin: ""
        });
        alert("Cliente registado com sucesso!");
      } else {
        const err = await res.json();
        alert(`Erro ao registar cliente: ${err.error}`);
      }
    } catch (err) {
      console.error("Erro ao registar cliente:", err);
    }
  };

  // Handle client update from Admin panel (CRUD Update)
  const handleAdminClientUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clients/${clientForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: clientForm.name,
          type: clientForm.type,
          email: clientForm.email,
          phone: clientForm.phone,
          address: clientForm.address,
          bi: clientForm.bi,
          linkedin: clientForm.linkedin
        })
      });
      if (res.ok) {
        setIsAdminClientEditOpen(false);
        fetchBackendData();
        setClientForm({
          id: "",
          name: "",
          type: "company",
          email: "",
          phone: "",
          address: "",
          bi: "",
          linkedin: ""
        });
        alert("Ficha do Cliente actualizada com sucesso!");
      } else {
        const err = await res.json();
        alert(`Erro ao actualizar: ${err.error}`);
      }
    } catch (err) {
      console.error("Erro ao actualizar cliente:", err);
    }
  };

  // Devolve `persisted: true` apenas quando a imagem ficou gravada
  // na base de dados partilhada (Supabase via client ou servidor).
  const handleUpdateCeoPhoto = async (newPhotoBase64: string): Promise<boolean> => {
    try {
      setCeoPhoto(newPhotoBase64);
      try {
        localStorage.setItem("ceo_photo", newPhotoBase64);
      } catch (e) {}
      
      let persisted = false;

      // 1. Grava directamente no Supabase se o cliente estiver ativo (Vercel / SPA / Direct)
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { error } = await supabase.from("site_content").upsert({
            key: "ceo_photo",
            value: { url: newPhotoBase64, __val: newPhotoBase64 },
            updated_at: new Date().toISOString()
          }, { onConflict: "key" });
          if (!error) {
            persisted = true;
          } else {
            console.warn("Aviso Supabase upsert site_content:", error.message);
          }
        } catch (sErr) {
          console.warn("Aviso ao sincronizar foto com o Supabase client:", sErr);
        }
      }

      // 2. Grava através da API do servidor backend Express
      try {
        const res = await fetch("/api/ceo-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ photo: newPhotoBase64 })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.persisted || data.success) persisted = true;
        }
      } catch (errApi) {
        // Backend offline ou rota servida em modo estático Vercel
      }

      return persisted;
    } catch (err) {
      console.error("Erro ao salvar foto do CEO:", err);
      return false;
    }
  };

  const handleUpdateSocialLinks = async (updated: { email: string; linkedin: string; whatsapp: string; instagram?: string; phone1: string; phone2: string }) => {
    setSocialLinks(updated);
    try {
      const res = await fetch("/api/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updated)
      });
      if (!res.ok) {
        throw new Error("Failed to save social links on server");
      }
    } catch (err) {
      console.error("Erro ao salvar links sociais:", err);
    }
  };

  // Alteração das credenciais reais do administrador (email/password no
  // Supabase Auth). Exige sempre a palavra-passe actual, para confirmar que
  // é mesmo o administrador autenticado a fazer a alteração — mesmo que o
  // browser já tenha uma sessão aberta (ex: computador partilhado).
  const handleUpdateAdminCredentials = async () => {
    if (!isSupabaseConfigured || !getSupabaseClient()) {
      alert("O serviço de autenticação administrativa não está disponível no momento.");
      return;
    }
    if (!supabaseUser?.email) {
      alert("Sessão administrativa não encontrada. Saia e entre novamente através do formulário de acesso.");
      return;
    }
    if (!credCurrentPassword) {
      alert("Introduza a sua palavra-passe actual para confirmar a alteração.");
      return;
    }
    if (!credNewEmail && !credNewPassword) {
      alert("Preencha o novo email e/ou a nova palavra-passe.");
      return;
    }
    if (credNewPassword && credNewPassword.length < 8) {
      alert("A nova palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    if (credNewPassword && credNewPassword !== credConfirmPassword) {
      alert("A confirmação da nova palavra-passe não coincide.");
      return;
    }

    setCredLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Cliente Supabase indisponível");

      // 1. Reautenticação: confirma a palavra-passe actual antes de alterar nada.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: supabaseUser.email,
        password: credCurrentPassword
      });
      if (reauthError) {
        alert("Palavra-passe actual incorrecta. Nenhuma alteração foi feita.");
        setCredLoading(false);
        return;
      }

      // 2. Aplica a alteração real via Supabase Auth.
      const updates: { email?: string; password?: string } = {};
      if (credNewEmail) updates.email = credNewEmail.trim().toLowerCase();
      if (credNewPassword) updates.password = credNewPassword;

      const { error: updateError } = await supabase.auth.updateUser(updates);
      if (updateError) {
        alert(`Erro ao actualizar credenciais: ${updateError.message}`);
        setCredLoading(false);
        return;
      }

      setCredCurrentPassword("");
      setCredNewPassword("");
      setCredConfirmPassword("");
      if (credNewEmail) {
        alert("Pedido de alteração de email enviado! Verifique a caixa de entrada do NOVO email para confirmar antes de o login mudar definitivamente.");
        setCredNewEmail("");
      } else {
        alert("Palavra-passe actualizada com sucesso.");
      }
    } catch (err: any) {
      alert(err.message || "Erro ao actualizar credenciais.");
    } finally {
      setCredLoading(false);
    }
  };

  const handleNavigateToEcosystem = (segment: "business" | "outsourcing" | "recrute" | "recruit" | "consultoria" | "consulting" | "connect" | "studio" | string) => {
    const cleanSegment = (segment || "").toString().toLowerCase().trim();
    if (cleanSegment === "business" || cleanSegment === "outsourcing") {
      setSelectedEcosystemSegment("business");
      setActiveTab("business_sub");
    } else if (cleanSegment === "recrute" || cleanSegment === "recruit" || cleanSegment === "recruiting") {
      setSelectedEcosystemSegment("recrute");
      setActiveTab("recruit_sub");
    } else if (cleanSegment === "consultoria" || cleanSegment === "consulting") {
      setSelectedEcosystemSegment("consultoria");
      setActiveTab("consulting_sub");
    } else if (cleanSegment === "connect") {
      setSelectedEcosystemSegment("connect");
      setActiveTab("connect_sub");
    } else if (cleanSegment === "studio") {
      setSelectedEcosystemSegment("studio");
      setActiveTab("studio_sub");
    } else {
      setActiveTab("landing");
    }
  };

  // Helper seguro para chamadas à API que previne erros de parsing HTML no Vercel SPA
  const safeJsonFetch = async (url: string, options?: RequestInit): Promise<any | null> => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) return null;
      const cType = res.headers.get("content-type");
      if (!cType || !cType.includes("application/json")) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  // Load candidates, logs and hires from our Backend or Supabase
  const fetchBackendData = async () => {
    try {
      const supabase = getSupabaseClient();

      // 1. Load CEO photo
      if (supabase) {
        try {
          const { data: dbData } = await supabase
            .from("site_content")
            .select("value")
            .eq("key", "ceo_photo")
            .maybeSingle();
          if (dbData?.value) {
            let extractedUrl = "";
            if (typeof dbData.value === "string") {
              extractedUrl = dbData.value;
            } else if (typeof dbData.value === "object") {
              extractedUrl = (dbData.value as any).url || (dbData.value as any).__val || "";
            }
            if (extractedUrl) {
              setCeoPhoto(extractedUrl);
              try {
                localStorage.setItem("ceo_photo", extractedUrl);
              } catch (e) {}
            }
          }
        } catch (e) {
          // ignore
        }
      }

      const ceoData = await safeJsonFetch("/api/ceo-photo");
      if (ceoData?.photo) {
        setCeoPhoto(ceoData.photo);
        try {
          localStorage.setItem("ceo_photo", ceoData.photo);
        } catch (e) {}
      }

      // 2. Load category images
      if (supabase) {
        try {
          const { data: catDb } = await supabase
            .from("site_content")
            .select("value")
            .eq("key", "category_images")
            .maybeSingle();
          if (catDb?.value && typeof catDb.value === "object") {
            setCategoryImages(prev => ({ ...prev, ...(catDb.value as any) }));
          }
        } catch (e) {}
      }
      const catData = await safeJsonFetch("/api/category-images");
      if (catData && typeof catData === "object") {
        setCategoryImages(prev => ({ ...prev, ...catData }));
      }

      // 3. Load subservice custom images
      if (supabase) {
        try {
          const { data: subDb } = await supabase
            .from("site_content")
            .select("value")
            .eq("key", "subservice_images")
            .maybeSingle();
          if (subDb?.value && typeof subDb.value === "object") {
            setSubServiceImages(subDb.value as any);
          }
        } catch (e) {}
      }
      const subData = await safeJsonFetch("/api/subservice-images");
      if (subData && typeof subData === "object") {
        setSubServiceImages(subData);
      }

      // 4. Load landing page banners (com normalização rigorosa para fotografias de pessoas de pele negra)
      const bannerMapByCat: Record<string, string> = {
        "b-recrute": "https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-recrute-2": "https://images.pexels.com/photos/5439152/pexels-photo-5439152.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-connect": "https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=",
        "b-business": "https://images.pexels.com/photos/5816283/pexels-photo-5816283.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-business-2": "https://images.pexels.com/photos/7658405/pexels-photo-7658405.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-studio": "https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-consultoria": "https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920",
        recrute: "https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920",
        connect: "https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=",
        business: "https://images.pexels.com/photos/5816283/pexels-photo-5816283.jpeg?auto=compress&cs=tinysrgb&w=1920",
        studio: "https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920",
        consultoria: "https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920"
      };

      const normalizeBanners = (items: LandingBannerItem[]): LandingBannerItem[] => {
        if (!Array.isArray(items) || items.length === 0) return items;
        return items.map((b) => {
          let u = b.url || "";
          const exp = bannerMapByCat[b.category] || bannerMapByCat[b.id?.replace("b-", "")] || "";
          if (
            exp && (
              !u ||
              u.includes("photo-1600880292203") ||
              u.includes("photo-1551836022") ||
              u.includes("photo-1504307651254") ||
              u.includes("photo-1621905251189") ||
              u.includes("photo-1522071820081") ||
              u.includes("photo-1552664730") ||
              u.includes("photo-1531403009284") ||
              u.includes("photo-1519389950473") ||
              u.includes("photo-1560250097") ||
              u.includes("photo-1581092921461")
            )
          ) {
            u = exp;
          }
          return { ...b, url: u };
        });
      };

      if (supabase) {
        try {
          const { data: banDb } = await supabase
            .from("site_content")
            .select("value")
            .eq("key", "landing_banners")
            .maybeSingle();
          if (banDb?.value && Array.isArray(banDb.value) && banDb.value.length > 0) {
            setLandingBanners(normalizeBanners(banDb.value as any));
          }
        } catch (e) {}
      }

      const banData = await safeJsonFetch("/api/landing-banners");
      if (Array.isArray(banData) && banData.length > 0) {
        setLandingBanners(normalizeBanners(banData));
      }

      // 5. Load social links (email/LinkedIn/WhatsApp)
      if (supabase) {
        try {
          const { data: socDb } = await supabase
            .from("site_content")
            .select("value")
            .eq("key", "social_links")
            .maybeSingle();
          if (socDb?.value && typeof socDb.value === "object") {
            setSocialLinks(prev => ({ ...prev, ...(socDb.value as any) }));
          }
        } catch (e) {}
      }
      const socData = await safeJsonFetch("/api/social-links");
      if (socData && typeof socData === "object") {
        setSocialLinks(prev => ({ ...prev, ...socData }));
      }

      // 6. Candidates
      const candData = await safeJsonFetch("/api/candidates");
      if (Array.isArray(candData)) setCandidates(candData);

      // 6.1 Operators (contas internas/staff) — antes viviam só em estado
      // local (useState fixo, nunca persistido). Agora carregam do backend
      // real, para que criar/editar/eliminar em "Gestão de Perfis" seja
      // visível para qualquer sessão/dispositivo e sobreviva a um reload.
      const opData = await safeJsonFetch("/api/operators");
      // Substitui sempre (mesmo com lista vazia) — nunca deve "colar" a um
      // estado antigo/fictício só porque o backend devolveu 0 operadores reais.
      if (Array.isArray(opData)) setOrgOperators(opData);

      // 7. Logs
      const logData = await safeJsonFetch("/api/logs");
      if (Array.isArray(logData)) setLogs(logData);
      
      // 8. Hires data
      const hireData = await safeJsonFetch("/api/hires");
      if (Array.isArray(hireData)) setHires(hireData);

      // 9. Payments data
      const payData = await safeJsonFetch("/api/payments");
      if (Array.isArray(payData)) setPaymentOrders(payData);

      // 10. Payout requests
      const payoutData = await safeJsonFetch("/api/payout-requests");
      if (Array.isArray(payoutData)) setPayoutRequests(payoutData);

      // 11. Clients data
      const clientData = await safeJsonFetch("/api/clients");
      if (Array.isArray(clientData)) {
        setClients(clientData);
        setSelectedClient(prev => {
          if (prev) {
            return clientData.find((c: any) => c.id === prev.id) || prev;
          }
          return null;
        });
      }

      // 12. Consulting requests
      const reqData = await safeJsonFetch("/api/consulting/requests");
      if (Array.isArray(reqData)) setConsultingReqs(reqData);

      // 13. Commercial proposals — antes só existiam no localStorage do navegador;
      // agora sincronizam com o servidor, para que propostas submetidas a partir de
      // qualquer formulário (Outsourcing, Connect, Studio, Contacto Comercial, etc.)
      // apareçam sempre no painel do administrador, em qualquer sessão/dispositivo.
      const proposalsData = await safeJsonFetch("/api/commercial-proposals");
      if (Array.isArray(proposalsData)) setCommercialProposals(proposalsData);

      // 14. Candidaturas Espontâneas & Triagem ATS — carrega dados das contas reais do servidor
      const spData = await safeJsonFetch("/api/spontaneous-applications");
      if (Array.isArray(spData)) setSpontaneousApplications(spData);
      
      setLoadingCandidates(false);
      setLoadingHires(false);
      setLoadingClients(false);
      setLoadingConsulting(false);
    } catch {
      setLoadingCandidates(false);
      setLoadingHires(false);
      setLoadingClients(false);
      setLoadingConsulting(false);
    }
  };

  const triggerOperationLog = async (type: string, detail: string) => {
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, detail })
      });
      if (res.ok) {
        const logRes = await fetch("/api/logs");
        if (logRes.ok) {
          const logData = await logRes.json();
          setLogs(logData);
        }
      }
    } catch (err) {
      console.error("Erro ao enviar log:", err);
    }
  };

  const handleSwitchTestAccount = (accountKey: string) => {
    // Qualquer impersonação de uma conta real (cliente ou prestador) exige
    // confirmação explícita e fica sempre registada no log de auditoria —
    // isto não é um atalho escondido, é uma ferramenta de suporte visível e
    // responsabilizável. O caso "admin" fica de fora da confirmação porque
    // não é impersonação de terceiros, é a própria sessão do administrador.
    if (accountKey !== "admin") {
      const proceed = confirm(
        currentLang === "pt"
          ? "Está prestes a aceder à conta de outra pessoa para fins de suporte. Esta ação fica registada no registo de auditoria. Deseja continuar?"
          : "You are about to access another person's account for support purposes. This action is logged in the audit trail. Continue?"
      );
      if (!proceed) return;
    }
    setIsTestAccountsModalOpen(false);
    switch (accountKey) {
      case "admin": {
        setIsAdminLoggedIn(true);
        setActiveTab("admin");
        const op = orgOperators.find(o => o.id === "op-admin-1") || orgOperators[0];
        if (op) setActiveOperator(op);
        const adminProfile = {
          id: "admin-1",
          name: "Administrador Master TARIRA",
          email: "tarira.ecossistema@gmail.com",
          role: "admin",
          phone: "+258 84 000 0000"
        };
        setSupabaseProfile(adminProfile);
        setSupabaseUser({ id: "admin-1", email: "tarira.ecossistema@gmail.com", user_metadata: { full_name: "Administrador Master TARIRA", role: "admin" } } as any);
        localStorage.setItem("tarira_authenticated_session", JSON.stringify({
          userId: "admin-1",
          email: "tarira.ecossistema@gmail.com",
          role: "admin",
          name: "Administrador Master TARIRA",
          timestamp: Date.now()
        }));
        triggerOperationLog("TEST_LOGIN", "Sessão iniciada: Administrador Geral TARIRA (tariraecossystem@gmail.com)");
        alert("🔑 Sessão iniciada com sucesso como Administrador Geral do Ecossistema TARIRA!");
        break;
      }
      case "company_bci":
      case "company_sb": {
        const sbClient = clients.find(c => c.name.toLowerCase().includes("standard") || c.email === "instalacoes@standardbank.co.mz") || clients.find(c => c.type === "company") || clients[0];
        if (sbClient) setSelectedClient(sbClient);
        setIsAdminLoggedIn(false);
        const op = orgOperators.find(o => o.id === "op-sb-1") || orgOperators[0];
        if (op) setActiveOperator(op);
        setLoginRole("company");
        setActiveTab("company");
        const compProfile = {
          id: sbClient?.id || "sb-1",
          name: sbClient?.name || "Standard Bank Moçambique",
          email: sbClient?.email || "instalacoes@standardbank.co.mz",
          role: "empresa",
          client_id: sbClient?.id
        };
        setSupabaseProfile(compProfile);
        setSupabaseUser({ id: sbClient?.id || "sb-1", email: sbClient?.email || "instalacoes@standardbank.co.mz", user_metadata: { full_name: sbClient?.name || "Standard Bank Moçambique", role: "empresa" } } as any);
        localStorage.setItem("tarira_authenticated_session", JSON.stringify({
          userId: sbClient?.id || "sb-1",
          email: sbClient?.email || "instalacoes@standardbank.co.mz",
          role: "empresa",
          name: sbClient?.name || "Standard Bank Moçambique",
          clientId: sbClient?.id,
          timestamp: Date.now()
        }));
        triggerOperationLog("TEST_LOGIN", `Sessão iniciada: Cliente Empresa (${sbClient?.name || "Standard Bank"})`);
        alert(`🔑 Sessão iniciada com sucesso como Cliente Empresa: ${sbClient?.name || "Standard Bank Moçambique"}!`);
        break;
      }
      case "company_vodacom": {
        const vcl = clients.find(c => c.name.toLowerCase().includes("vodacom") || c.email === "vodacom@tarira.co.mz") || clients.find(c => c.type === "company") || clients[0];
        if (vcl) setSelectedClient(vcl);
        setIsAdminLoggedIn(false);
        const op = orgOperators.find(o => o.id === "op-vcl-1") || orgOperators[0];
        if (op) setActiveOperator(op);
        setLoginRole("company");
        setActiveTab("company");
        const compProfile = {
          id: vcl?.id || "vcl-1",
          name: vcl?.name || "Vodacom Moçambique",
          email: vcl?.email || "vodacom@tarira.co.mz",
          role: "empresa",
          client_id: vcl?.id
        };
        setSupabaseProfile(compProfile);
        setSupabaseUser({ id: vcl?.id || "vcl-1", email: vcl?.email || "vodacom@tarira.co.mz", user_metadata: { full_name: vcl?.name || "Vodacom Moçambique", role: "empresa" } } as any);
        localStorage.setItem("tarira_authenticated_session", JSON.stringify({
          userId: vcl?.id || "vcl-1",
          email: vcl?.email || "vodacom@tarira.co.mz",
          role: "empresa",
          name: vcl?.name || "Vodacom Moçambique",
          clientId: vcl?.id,
          timestamp: Date.now()
        }));
        triggerOperationLog("TEST_LOGIN", `Sessão iniciada: Cliente Empresa (${vcl?.name || "Vodacom"})`);
        alert(`🔑 Sessão iniciada com sucesso como Cliente Empresa: ${vcl?.name || "Vodacom Moçambique"}!`);
        break;
      }
      case "residential": {
        const resCl = clients.find(c => c.type === "residential" || c.type === "individual" || c.email === "carlos.mondlane@gmail.com") || clients.find(c => c.type === "residential") || clients[0];
        if (resCl) setSelectedClient(resCl);
        setIsAdminLoggedIn(false);
        setLoginRole("residential");
        setActiveTab("company");
        const larProfile = {
          id: resCl?.id || "res-1",
          name: resCl?.name || "Carlos Mondlane",
          email: resCl?.email || "carlos.mondlane@gmail.com",
          role: "lar",
          client_id: resCl?.id
        };
        setSupabaseProfile(larProfile);
        setSupabaseUser({ id: resCl?.id || "res-1", email: resCl?.email || "carlos.mondlane@gmail.com", user_metadata: { full_name: resCl?.name || "Carlos Mondlane", role: "lar" } } as any);
        localStorage.setItem("tarira_authenticated_session", JSON.stringify({
          userId: resCl?.id || "res-1",
          email: resCl?.email || "carlos.mondlane@gmail.com",
          role: "lar",
          name: resCl?.name || "Carlos Mondlane",
          clientId: resCl?.id,
          timestamp: Date.now()
        }));
        triggerOperationLog("TEST_LOGIN", `Sessão iniciada: Cliente Lar (${resCl?.name})`);
        alert(`🔑 Sessão iniciada com sucesso como Cliente Lar: ${resCl?.name || "Carlos Mondlane"}!`);
        break;
      }
      case "condo": {
        const condoCl = clients.find(c => c.type === "condo" || c.email.includes("aloevera")) || clients.find(c => c.type === "condo") || clients[0];
        if (condoCl) setSelectedClient(condoCl);
        setIsAdminLoggedIn(false);
        const op = orgOperators.find(o => o.id === "op-condo-1") || orgOperators[0];
        if (op) setActiveOperator(op);
        setLoginRole("condo");
        setActiveTab("company");
        const condoProfile = {
          id: condoCl?.id || "condo-1",
          name: condoCl?.name || "Condomínio Aloe Vera",
          email: condoCl?.email || "gestao@condominioaloevera.co.mz",
          role: "condominio",
          client_id: condoCl?.id
        };
        setSupabaseProfile(condoProfile);
        setSupabaseUser({ id: condoCl?.id || "condo-1", email: condoCl?.email || "gestao@condominioaloevera.co.mz", user_metadata: { full_name: condoCl?.name || "Condomínio Aloe Vera", role: "condominio" } } as any);
        localStorage.setItem("tarira_authenticated_session", JSON.stringify({
          userId: condoCl?.id || "condo-1",
          email: condoCl?.email || "gestao@condominioaloevera.co.mz",
          role: "condominio",
          name: condoCl?.name || "Condomínio Aloe Vera",
          clientId: condoCl?.id,
          timestamp: Date.now()
        }));
        triggerOperationLog("TEST_LOGIN", `Sessão iniciada: Cliente Condomínio (${condoCl?.name})`);
        alert(`🔑 Sessão iniciada com sucesso como Gestor de Condomínio: ${condoCl?.name || "Condomínio Aloe Vera"}!`);
        break;
      }
      case "provider_tech": {
        const provTech = candidates.find(c => c.id === "cand-jard-2" || c.email.includes("mateus") || c.category === "tech" || c.category === "jard") || candidates[0];
        if (provTech) setSelectedProfessional({ ...provTech, isProfessional: false });
        setIsAdminLoggedIn(false);
        setLoginRole("provider");
        setActiveTab("professional_profile");
        const techFullName = `${provTech?.name || "Mateus"} ${provTech?.surname || "Nhaca"}`.trim();
        const techSpec = provTech?.title || "Técnico Eletricista Certificado";
        const techProfile = {
          id: provTech?.id || "prov-tech-1",
          name: techFullName,
          email: provTech?.email || "mateus.nhaca@tarira.co.mz",
          role: "prestador",
          category: techSpec,
          candidate_id: provTech?.id
        };
        setSupabaseProfile(techProfile);
        setSupabaseUser({ id: provTech?.id || "prov-tech-1", email: provTech?.email || "mateus.nhaca@tarira.co.mz", user_metadata: { full_name: techFullName, role: "prestador" } } as any);
        localStorage.setItem("tarira_authenticated_session", JSON.stringify({
          userId: provTech?.id || "prov-tech-1",
          email: provTech?.email || "mateus.nhaca@tarira.co.mz",
          role: "prestador",
          name: techFullName,
          candidateId: provTech?.id,
          timestamp: Date.now()
        }));
        triggerOperationLog("TEST_LOGIN", `Sessão iniciada: Prestador Técnico (${provTech?.name} ${provTech?.surname})`);
        alert(`🔑 Sessão iniciada com sucesso como Prestador Técnico: ${provTech?.name} ${provTech?.surname} (${provTech?.title || "Técnico Eletricista Certified"})!`);
        break;
      }
      case "provider_prof": {
        const provProf = candidates.find(c => c.id === "cand-paulo-dev" || c.email.includes("paulo") || c.category === "elite_hub" || c.category === "prof") || candidates[0];
        if (provProf) setSelectedProfessional({ ...provProf, isProfessional: true });
        setIsAdminLoggedIn(false);
        setLoginRole("provider");
        setActiveTab("professional_profile");
        const profFullName = `${provProf?.name || "Paulo"} ${provProf?.surname || "Sitoe"}`.trim();
        const profSpec = provProf?.title || "Engenheiro de Software";
        const profProfile = {
          id: provProf?.id || "prov-prof-1",
          name: profFullName,
          email: provProf?.email || "paulo.dev@tarira.co.mz",
          role: "profissional",
          category: profSpec,
          candidate_id: provProf?.id
        };
        setSupabaseProfile(profProfile);
        setSupabaseUser({ id: provProf?.id || "prov-prof-1", email: provProf?.email || "paulo.dev@tarira.co.mz", user_metadata: { full_name: profFullName, role: "profissional" } } as any);
        localStorage.setItem("tarira_authenticated_session", JSON.stringify({
          userId: provProf?.id || "prov-prof-1",
          email: provProf?.email || "paulo.dev@tarira.co.mz",
          role: "profissional",
          name: profFullName,
          candidateId: provProf?.id,
          timestamp: Date.now()
        }));
        triggerOperationLog("TEST_LOGIN", `Sessão iniciada: Quadro Técnico TI (${provProf?.name} ${provProf?.surname})`);
        alert(`🔑 Sessão iniciada com sucesso como Quadro Técnico / TI: ${provProf?.name} ${provProf?.surname} (${provProf?.title || "Engenheiro de Software"})!`);
        break;
      }
      case "studio_merchant": {
        setActiveTab("studio_sub");
        const op = orgOperators.find(o => o.id === "op-studio-1") || orgOperators[0];
        if (op) setActiveOperator(op);
        triggerOperationLog("TEST_LOGIN", "Sessão iniciada: Comerciante Micro-SaaS (Axofacil)");
        alert("🔑 Sessão iniciada com sucesso como Comerciante Micro-SaaS na plataforma Axofacil (Tarira Studio)");
        break;
      }
    }
  };

  const handleSendNotification = () => {
    if (!notifRecipient.trim() || !notifPhone.trim() || !notifMessage.trim()) {
      alert("Por favor preencha todos os campos da notificação!");
      return;
    }
    
    setIsSendingNotif(true);
    
    setTimeout(() => {
      setIsSendingNotif(false);
      
      const stepName = HIRING_FLOW_STEPS[activeFlowStep || 0]?.title || "Hiring Flow";
      const newLog = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toLocaleString("pt-PT", { hour12: false }),
        channel: notifChannel,
        recipient: notifRecipient,
        phone: notifPhone,
        step: stepName,
        message: notifMessage,
        status: "success" as const
      };
      
      setNotificationLogs(prev => [newLog, ...prev]);
      
      triggerOperationLog(
        "NOTIF_DISPATCH", 
        `Notificação de ${notifChannel} enviada para ${notifRecipient} (${notifPhone}) - Etapa: ${stepName}`
      );
      
      alert(`[${notifChannel}] Mensagem enviada com sucesso para o candidato ${notifRecipient}!`);
    }, 1200);
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Handle Candidate status updates from dashboard
  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected" | "pending") => {
    try {
      const res = await fetch(`/api/candidates/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh local memory and logs
        fetchBackendData();
      }
    } catch (err) {
      console.error("Erro ao alterar estado do candidato:", err);
    }
  };

  // Helper to read and convert candidate/provider photo files to ImgBB (with base64 fallback)
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isApplyForm: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const url = await uploadImageToImgBB(file);
        if (isApplyForm) {
          setApplyForm(prev => ({ ...prev, photo: url }));
        } else {
          setAdminForm(prev => ({ ...prev, photo: url }));
        }
      } catch (err) {
        console.error("Erro ao carregar a fotografia do candidato:", err);
      }
    }
  };

  // Handle open application submission to AI Triage endpoint
  const handleApplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.surname || !applyForm.bio || !applyForm.phone || !applyForm.residence) {
      alert("Por favor preencha todos os campos obrigatórios (Nome, Apelido, Biografia/Experiência, Contacto de Telefone e Residência).");
      return;
    }
    setSubmittingApply(true);
    try {
      const res = await fetch("/api/triagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applyForm)
      });
      if (res.ok) {
        const data = await res.json();
        setApplyResult(data);
        // Reset form
        setApplyForm({
          name: "",
          surname: "",
          email: "",
          phone: "",
          residence: "",
          bio: "",
          category: "tech",
          identityDocName: "",
          cvDocName: "",
          certificatesDocName: "",
          photo: ""
        });
        // Reload dashboard candidates and logs
        fetchBackendData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Ocorreu um erro no servidor ao processar a candidatura.");
      }
    } catch (err) {
      console.error("Erro de submissão:", err);
      alert("Não foi possível contactar o servidor.");
    } finally {
      setSubmittingApply(false);
    }
  };

  // Spontaneous Application Handlers (Candidatura Espontânea)
  const handleSpontaneousAddExperience = () => {
    setSpontaneousForm(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: `exp-${Date.now()}`,
          company: "",
          role: "",
          duration: "",
          responsibilities: ""
        }
      ]
    }));
  };

  const handleSpontaneousRemoveExperience = (id: string) => {
    setSpontaneousForm(prev => ({
      ...prev,
      experiences: prev.experiences.filter(e => e.id !== id)
    }));
  };

  const handleSpontaneousExperienceChange = (id: string, field: keyof SpontaneousExperience, value: string) => {
    setSpontaneousForm(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const handleValidateAtsCv = () => {
    setSpontaneousForm(prev => ({
      ...prev,
      isAtsValidated: true,
      atsScore: Math.floor(Math.random() * 11) + 88, // 88% to 98%
      cvDocumentName: prev.cvDocumentName 
        ? (prev.cvDocumentName.includes("_Modelo_ATS") ? prev.cvDocumentName : prev.cvDocumentName.replace(/(\.pdf|\.docx?)$/i, "_Modelo_ATS.pdf"))
        : "Curriculum_Modelo_ATS_Verificado.pdf"
    }));
  };

  const handleSpontaneousSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!spontaneousForm.fullName || !spontaneousForm.phone || !spontaneousForm.nuit) {
      alert("Por favor preencha os campos obrigatórios: Nome Completo, Contacto Telefónico e NUIT.");
      return;
    }

    setSpontaneousSubmitting(true);
    const newAppPayload = {
      id: `sp-${Date.now()}`,
      fullName: spontaneousForm.fullName,
      phone: spontaneousForm.phone,
      email: spontaneousForm.email || "candidato@tarira.co.mz",
      residence: spontaneousForm.residence || "Maputo Cidade",
      careerFocus: spontaneousForm.careerFocus,
      nuit: spontaneousForm.nuit,
      idDocumentName: spontaneousForm.idDocumentName || "BI_Candidato_Anexado.pdf",
      cvDocumentName: spontaneousForm.cvDocumentName || "CV_Modelo_ATS_Processado.pdf",
      isAtsValidated: spontaneousForm.isAtsValidated || true,
      atsScore: spontaneousForm.atsScore || 95,
      experiences: spontaneousForm.experiences,
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "pending",
      notes: spontaneousForm.careerFocus === "recruitment_no_exp" 
        ? "Candidatura Espontânea: Carreira de Recrutamento (Sem experiência / Início de carreira) - Direcionada para o Painel Administrador."
        : spontaneousForm.careerFocus === "business_volume"
          ? "Candidatura Espontânea: Operações de Business em Lote (Contratação massiva) - Direcionada para o Painel Administrador."
          : "Candidatura Espontânea: Ofícios Técnicos Gerais - Direcionada para o Painel Administrador."
    };

    try {
      const res = await fetch("/api/spontaneous-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppPayload)
      });
      if (res.ok) {
        const created: SpontaneousApplication = await res.json();
        setSpontaneousApplications(prev => [created, ...prev]);
        setSpontaneousResult(created);
      } else {
        setSpontaneousApplications(prev => [newAppPayload as any, ...prev]);
        setSpontaneousResult(newAppPayload as any);
      }
    } catch (err) {
      console.warn("Aviso ao enviar candidatura espontânea (utilizando fallback local):", err);
      setSpontaneousApplications(prev => [newAppPayload as any, ...prev]);
      setSpontaneousResult(newAppPayload as any);
    } finally {
      setSpontaneousSubmitting(false);
      setLogs(prev => [
        {
          id: `log-${Date.now()}`,
          type: "SPONTANEOUS_APPLICATION",
          detail: `Nova Candidatura Espontânea: ${newAppPayload.fullName} (${newAppPayload.careerFocus === "recruitment_no_exp" ? "Sem Exp." : "Business Volume"}) - NUIT: ${newAppPayload.nuit}`,
          timestamp: new Date().toLocaleString()
        },
        ...prev
      ]);
    }
  };

  // Pre-configured static stages of our Electricista Pipeline
  const PIPELINE_STAGES = [
    { label: "Publicada", icon: "📣" },
    { label: "Triagem Inteligente", icon: "⚙️" },
    { label: "Entrevistas", icon: "🎙️" },
    { label: "Shortlist", icon: "🏆" },
    { label: "Proposta", icon: "📨" },
    { label: "Contratado", icon: "✅" }
  ];

  // 🥧 Interactive Pie / Donut Chart Component with hover slice expansion ("tarte que aumenta")
  const InteractivePieChart = ({
    title,
    subtitle,
    data,
    centerLabel,
    centerValue
  }: {
    title: string;
    subtitle?: string;
    data: { label: string; value: number; color: string; icon?: string }[];
    centerLabel?: string;
    centerValue?: string;
  }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
    const cx = 100;
    const cy = 100;
    const rOuter = 76;
    const rInner = 44;

    let currentAngle = -Math.PI / 2;

    const slices = data.map((item, index) => {
      const angleSpan = (item.value / total) * (2 * Math.PI);
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSpan;
      const midAngle = startAngle + angleSpan / 2;
      currentAngle = endAngle;

      const isHovered = hoveredIndex === index;
      const shift = isHovered ? 8 : 0;
      const shiftX = Math.cos(midAngle) * shift;
      const shiftY = Math.sin(midAngle) * shift;

      const scx = cx + shiftX;
      const scy = cy + shiftY;

      const x1 = scx + rOuter * Math.cos(startAngle);
      const y1 = scy + rOuter * Math.sin(startAngle);
      const x2 = scx + rOuter * Math.cos(endAngle);
      const y2 = scy + rOuter * Math.sin(endAngle);

      const x3 = scx + rInner * Math.cos(endAngle);
      const y3 = scy + rInner * Math.sin(endAngle);
      const x4 = scx + rInner * Math.cos(startAngle);
      const y4 = scy + rInner * Math.sin(startAngle);

      const largeArcFlag = angleSpan > Math.PI ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        "Z"
      ].join(" ");

      const percentage = Math.round((item.value / total) * 100);

      return {
        pathData,
        color: item.color,
        label: item.label,
        value: item.value,
        percentage,
        icon: item.icon,
        isHovered,
        index
      };
    });

    const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

    return (
      <div className="glass-panel rounded-2xl p-5 border border-gold/20 bg-deep/90 hover:border-gold/40 transition-all flex flex-col justify-between shadow-xl">
        <div>
          <h4 className="font-serif text-base text-gold font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold inline-block"></span> {title}
          </h4>
          {subtitle && <p className="text-[11px] text-mist/70 mt-0.5 leading-snug">{subtitle}</p>}
        </div>

        <div className="flex flex-col items-center my-3 w-full">
          {/* SVG Donut / Pie */}
          <div className="relative w-40 h-40 my-2 flex-shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl overflow-visible">
              {slices.map((slice) => (
                <path
                  key={slice.index}
                  d={slice.pathData}
                  fill={slice.color}
                  className="transition-all duration-300 cursor-pointer hover:brightness-125 stroke-slate-950 stroke-2"
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
              <span className="text-base font-extrabold text-ivory font-mono drop-shadow-md">
                {activeSlice ? `${activeSlice.percentage}%` : (centerValue || total)}
              </span>
              <span className="text-[10px] font-bold text-blue-300 font-mono uppercase tracking-wider leading-none mt-0.5 px-1 truncate max-w-[120px]">
                {activeSlice ? activeSlice.label : (centerLabel || "Total")}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-1.5 mt-2">
            {slices.map((slice) => (
              <div
                key={slice.index}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                  slice.isHovered 
                    ? "bg-blue-500/30 border-blue-400 text-white font-extrabold scale-[1.02] shadow-md" 
                    : "bg-slate-900 border-slate-700/80 hover:border-gold/50 text-white font-semibold"
                }`}
              >
                <div className="flex items-center gap-2 pr-2 min-w-0">
                  {slice.icon && (
                    <span className="text-sm flex-shrink-0 bg-slate-800 p-1 rounded-md border border-slate-700 text-blue-300 shadow-xs">{slice.icon}</span>
                  )}
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm border border-white/40"
                    style={{ backgroundColor: slice.color }}
                  ></span>
                  <span className="text-[11px] text-white font-semibold leading-tight break-words">
                    {slice.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono flex-shrink-0 ml-1">
                  <span className="text-[11px] text-slate-300 font-bold">{slice.value}</span>
                  <span className="text-[10px] font-black text-blue-300 bg-blue-500/25 px-1.5 py-0.5 rounded border border-blue-500/40">
                    {slice.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticsContent = () => {
    return (
      <div id="s-analytics" className="flex-1 overflow-auto p-0 animate-fade-up">
        <div className="max-w-6xl mx-auto w-full">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold/8 pb-5 mb-6">
            <div>
              <span className="text-xs text-mist/35 font-medium leading-none block mb-1">DASHBOARD EXECUTIVO NACIONAL</span>
              <h1 className="font-serif text-3xl font-light tracking-wide text-ivory/95">Métricas de Desempenho</h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-sage font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sage animate-ping"></span> Live • Actualizado agora
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 bg-deep border border-gold/10 p-1.5 rounded-xl mb-6 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveAnalyticsTab("overview")} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "overview" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
            >
              📊 Visão Geral
            </button>
            <button 
              onClick={() => setActiveAnalyticsTab("efficiency")} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "efficiency" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
            >
              ⚡ Eficiência
            </button>
            <button 
              onClick={() => setActiveAnalyticsTab("quality")} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "quality" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
            >
              ⭐ Qualidade
            </button>
            <button 
              onClick={() => setActiveAnalyticsTab("financial")} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "financial" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
            >
              💰 Financeiro
            </button>
            <button 
              onClick={() => setActiveAnalyticsTab("geo")} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "geo" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
            >
              🗺️ Geográfico
            </button>
          </div>

          {/* Visual Panels depending on active analytics sub-tab */}
          {activeAnalyticsTab === "overview" && (
            <div className="space-y-6 animate-fade-up">
              {/* Indicators */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-2xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">RECEITA RECORRENTE (MRR)</span>
                  <span className="font-serif text-2xl text-gold block font-semibold leading-tight">520K MZN</span>
                  <span className="text-[10px] text-sage font-medium mt-1 inline-block">↑ +28% vs Mês anterior</span>
                </div>
                <div className="glass-panel rounded-2xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">PRESTADORES VERIFICADOS</span>
                  <span className="font-serif text-2xl block font-semibold leading-tight">2.1K</span>
                  <span className="text-[10px] text-sage font-medium mt-1 inline-block">↑ +42 este mês</span>
                </div>
                <div className="glass-panel rounded-2xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">JOB FILL RATE</span>
                  <span className="font-serif text-2xl text-sage block font-semibold leading-tight">88%</span>
                  <span className="text-[10px] text-sage font-medium mt-1 inline-block">Meta: 80% atingida ✓</span>
                </div>
                <div className="glass-panel rounded-2xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">MÉDIA DE AVALIAÇÕES</span>
                  <span className="font-serif text-2xl text-gold block font-semibold leading-tight">4.7 / 5.0</span>
                  <span className="text-[10px] text-mist/35 mt-1 inline-block">1.2K avaliações físicas</span>
                </div>
              </div>

              {/* Recharts Interactive Revenue Bar Chart (Projetado vs Realizado 2025/2026) */}
              <RevenueBarChart />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekly fill rate */}
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="font-serif text-lg text-gold font-light mb-6">Taxa de Preenchimento Semanal (%)</h3>
                  <div className="flex items-end justify-between gap-3 h-32 pb-2 border-b border-gold/10">
                    {[62, 71, 68, 79, 82, 78, 85, 88].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-mist/35 font-mono">{val}%</span>
                        <div className="w-full bg-gradient-to-t from-gold/40 to-gold rounded-t-sm" style={{ height: `${val}%` }}></div>
                        <span className="text-[9px] text-mist/30 font-mono mt-0.5">S{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

              {/* 🥧 GRÁFICOS CIRCULARES DE TARTE DO PAINEL DO ADMINISTRADOR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InteractivePieChart
                  title="Ações do Administrador"
                  subtitle="Contagem de ações operacionais e validações efetuadas"
                  centerLabel="Ações Total"
                  centerValue="1,420"
                  data={[
                    { label: "Validação Documental & Antecedentes", value: 480, color: "#10b981", icon: "🛡️" },
                    { label: "Aprovação de Perfis em Destaque", value: 320, color: "#f59e0b", icon: "⭐" },
                    { label: "Atribuição de Agentes na Central", value: 260, color: "#3b82f6", icon: "🎯" },
                    { label: "Auditoria de Contratos Mensais", value: 210, color: "#a855f7", icon: "📄" },
                    { label: "Gestão de Tabela e Títulos", value: 150, color: "#ec4899", icon: "🏷️" }
                  ]}
                />

                <InteractivePieChart
                  title="Distribuição de Avaliações"
                  subtitle="Proporção de notas de satisfação no ecossistema"
                  centerLabel="Avaliações"
                  centerValue="1.2K"
                  data={[
                    { label: "5 Estrelas", value: 58, color: "#f59e0b", icon: "⭐" },
                    { label: "4 Estrelas", value: 28, color: "#10b981", icon: "⭐" },
                    { label: "3 Estrelas", value: 10, color: "#3b82f6", icon: "⭐" },
                    { label: "2 Estrelas", value: 3, color: "#f97316", icon: "⭐" },
                    { label: "1 Estrela", value: 1, color: "#ef4444", icon: "⭐" }
                  ]}
                />

                <InteractivePieChart
                  title="Demandas por Categoria"
                  subtitle="Distribuição de solicitações por segmento técnico"
                  centerLabel="Pedidos"
                  centerValue="890"
                  data={[
                    { label: "Serviços Domésticos & Lares", value: 340, color: "#f59e0b", icon: "🧹" },
                    { label: "Construção & Manutenção", value: 250, color: "#3b82f6", icon: "⚡" },
                    { label: "Liderança, TI & Cibersegurança", value: 180, color: "#10b981", icon: "💻" },
                    { label: "Consultoria & Especialistas", value: 120, color: "#a855f7", icon: "💡" }
                  ]}
                />
              </div>
              </div>

            </div>
          )}

          {activeAnalyticsTab === "efficiency" && (
            <div className="space-y-6 animate-fade-up">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">TIME-TO-HIRE</span>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-3xl font-semibold text-sage">9</span>
                    <span className="text-xs text-mist/45">dias</span>
                  </div>
                  <div className="h-1.5 bg-night rounded-full overflow-hidden">
                    <div className="h-full bg-sage" style={{ width: "60%" }}></div>
                  </div>
                  <span className="text-[9px] text-mist/30 block mt-2">Meta: ≤ 15 dias ✓</span>
                </div>

                <div className="glass-panel rounded-xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">JOB FILL RATE</span>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-3xl font-semibold text-gold">88%</span>
                  </div>
                  <div className="h-1.5 bg-night rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: "88%" }}></div>
                  </div>
                  <span className="text-[9px] text-mist/30 block mt-2">Meta: 80% • +8pp</span>
                </div>

                <div className="glass-panel rounded-xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">PRECISÃO DO MATCH</span>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-3xl font-semibold text-gold">82%</span>
                  </div>
                  <div className="h-1.5 bg-night rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: "82%" }}></div>
                  </div>
                  <span className="text-[9px] text-mist/30 block mt-2">Meta: 85% • Excelente</span>
                </div>

                <div className="glass-panel rounded-xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">RESPOSTA EMERGÊNCIA</span>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-3xl font-semibold text-sage">22</span>
                    <span className="text-xs text-mist/45">min</span>
                  </div>
                  <div className="h-1.5 bg-night rounded-full overflow-hidden">
                    <div className="h-full bg-sage" style={{ width: "73%" }}></div>
                  </div>
                  <span className="text-[9px] text-mist/30 block mt-2">Meta: ≤ 30min ✓</span>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-serif text-lg text-gold font-light mb-4">Média de Time-to-Hire por Categoria (Dias)</h3>
                <div className="space-y-4 pt-2">
                  {[
                    { category: "Doméstico", days: 5, pct: 33 },
                    { category: "Técnico Especializado", days: 8, pct: 53 },
                    { category: "Profissional Técnico", days: 14, pct: 93 },
                    { category: "Construção & Obras", days: 10, pct: 66 },
                    { category: "Jardinagem", days: 4, pct: 26 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-mist/45 w-32 flex-shrink-0">{item.category}</span>
                      <div className="flex-1 h-2.5 bg-night rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-copper to-gold rounded-full" style={{ width: `${item.pct}%` }}></div>
                      </div>
                      <span className="text-xs text-gold font-bold font-mono w-8 text-right">{item.days}d</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeAnalyticsTab === "quality" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
              <div className="glass-panel rounded-xl p-5">
                <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">PROMISE COMPLIANCE</span>
                <span className="font-serif text-2xl text-sage block font-semibold leading-none mb-1">96%</span>
                <div className="h-1 bg-night rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-sage" style={{ width: "96%" }}></div>
                </div>
                <p className="text-[10px] text-mist/40">Acordo de presença física e SLA.</p>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">VERIFICATION RATE</span>
                <span className="font-serif text-2xl text-gold block font-semibold leading-none mb-1">68%</span>
                <div className="h-1 bg-night rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gold" style={{ width: "68%" }}></div>
                </div>
                <p className="text-[10px] text-mist/40">Profissionais verificados presencialmente.</p>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">AVALIAÇÃO MÉDIA</span>
                <span className="font-serif text-2xl text-gold block font-semibold leading-none mb-1">4.7 ⭐</span>
                <div className="h-1 bg-night rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gold" style={{ width: "94%" }}></div>
                </div>
                <p className="text-[10px] text-mist/40">Meta global de excelência: 4.5</p>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">TAXA DE RETENÇÃO</span>
                <span className="font-serif text-2xl text-sage block font-semibold leading-none mb-1">88%</span>
                <div className="h-1 bg-night rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-sage" style={{ width: "88%" }}></div>
                </div>
                <p className="text-[10px] text-mist/40">Re-contratados no ecossistema.</p>
              </div>
            </div>
          )}

          {activeAnalyticsTab === "financial" && (
            <div className="space-y-6 animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">MRR GLOBAL</span>
                  <span className="font-serif text-2xl text-gold block font-semibold leading-none mb-1">520.000 MZN</span>
                  <div className="h-1 bg-night rounded-full overflow-hidden mt-3 mb-1">
                    <div className="h-full bg-gold" style={{ width: "100%" }}></div>
                  </div>
                  <p className="text-[10px] text-sage">104% da meta para Agosto</p>
                </div>
                <div className="glass-panel rounded-xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">TARIRA REVENUE (18%-20% FEE)</span>
                  <span className="font-serif text-2xl text-copper block font-semibold leading-none mb-1">78.000 MZN</span>
                  <div className="h-1 bg-night rounded-full overflow-hidden mt-3 mb-1">
                    <div className="h-full bg-copper" style={{ width: "94%" }}></div>
                  </div>
                  <p className="text-[10px] text-mist/35">Taxa de intermediação acumulada</p>
                </div>
                <div className="glass-panel rounded-xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">CUSTOMER LTV</span>
                  <span className="font-serif text-2xl text-gold block font-semibold leading-none mb-1">115.800 MZN</span>
                  <div className="h-1 bg-night rounded-full overflow-hidden mt-3 mb-1">
                    <div className="h-full bg-gold" style={{ width: "96%" }}></div>
                  </div>
                  <p className="text-[10px] text-mist/35">Valor de vida útil projectado</p>
                </div>
                <div className="glass-panel rounded-xl p-5">
                  <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">CHURN RATE</span>
                  <span className="font-serif text-2xl text-sage block font-semibold leading-none mb-1">3.2%</span>
                  <div className="h-1 bg-night rounded-full overflow-hidden mt-3 mb-1">
                    <div className="h-full bg-sage" style={{ width: "64%" }}></div>
                  </div>
                  <p className="text-[10px] text-sage">Meta: &lt; 5% ✓ Excelente</p>
                </div>
              </div>

              {/* Interactive Revenue Chart */}
              <RevenueBarChart />
            </div>
          )}

          {activeAnalyticsTab === "geo" && (
            <div className="glass-panel rounded-2xl p-6 animate-fade-up">
              <h3 className="font-serif text-lg text-gold font-light mb-6">Prestadores & Serviços por Província (Moçambique)</h3>
              <div className="space-y-6">
                {[
                  { prov: "Maputo", providers: 48, jobs: 142, pctJobs: 100, pctProv: 100 },
                  { prov: "Gaza", providers: 12, jobs: 28, pctJobs: 20, pctProv: 25 },
                  { prov: "Sofala", providers: 18, jobs: 45, pctJobs: 31, pctProv: 37 },
                  { prov: "Nampula", providers: 22, jobs: 51, pctJobs: 35, pctProv: 45 },
                  { prov: "Zambézia", providers: 9, jobs: 18, pctJobs: 12, pctProv: 18 },
                  { prov: "Cabo Delgado", providers: 6, jobs: 12, pctJobs: 8, pctProv: 12 }
                ].map((d, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-xs font-semibold text-mist/50 w-32 flex-shrink-0">{d.prov}</span>
                    <div className="flex-1 space-y-1">
                      {/* Jobs */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-night rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: `${d.pctJobs}%` }}></div>
                        </div>
                        <span className="text-[10px] font-semibold text-gold font-mono w-20 flex-shrink-0">{d.jobs} obras</span>
                      </div>
                      {/* Providers */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-night rounded-full overflow-hidden">
                          <div className="h-full bg-copper" style={{ width: `${d.pctProv}%` }}></div>
                        </div>
                        <span className="text-[10px] font-semibold text-copper font-mono w-20 flex-shrink-0">{d.providers} técnicos</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };

  // Pre-configured 10 Hiring Flow steps
  const HIRING_FLOW_STEPS = [
    { num: 1, icon: "🎯", title: "Definição de Necessidade", pillar: "Pessoas", color: "text-gold bg-gold/10 border-gold/20", desc: "A empresa contratante identifica as suas necessidades específicas em conjunto com a TARIRA. É desenhado o perfil profissional ideal, competências críticas, carga horária pretendida e orçamento de referência." },
    { num: 2, icon: "📣", title: "Publicação da Vaga", pillar: "Tecnologia", color: "text-copper bg-copper/10 border-copper/20", desc: "A vaga é lançada e indexada no motor de buscas interno da TARIRA Recruit. Através de canais integrados, a oportunidade é visível para milhares de profissionais de Moçambique que atendem ao tier de qualidade exigido." },
    { num: 3, icon: "📋", title: "Candidatura Directa", pillar: "Tecnologia", color: "text-copper bg-copper/10 border-copper/20", desc: "Profissionais qualificados enviam as suas candidaturas de forma ágil pela plataforma. O perfil deles já carrega informações consolidadas, histórico de actuação e documentação previamente avaliada." },
    { num: 4, icon: "🌐", title: "Candidatura Aberta", pillar: "Tecnologia", color: "text-copper bg-copper/10 border-copper/20", desc: "Não há vaga aberta específica no momento? O profissional submete o seu perfil na Candidatura Aberta. Nosso motor inteligente executa um match passivo constante para futuras oportunidades ideais." },
    { num: 5, icon: "⚙️", title: "Triagem Automatizada", pillar: "Tecnologia", color: "text-copper bg-copper/10 border-copper/20", desc: "Utilizando um avançado motor cognitivo de mapeamento, a plataforma analisa a apresentação, competências técnicas expressas e atribui uma classificação objectiva de Match, eliminando vieses e acelerando a triagem." },
    { num: 6, icon: "🎙️", title: "Shortlist & Entrevista", pillar: "Processo", color: "text-sage bg-sage/10 border-sage/20", desc: "A empresa acede aos perfis recomendados com maior Match Score, consulta os feedbacks do motor, analisa as avaliações anteriores e agenda as entrevistas directamente pela consola unificada." },
    { num: 7, icon: "✅", title: "Decisão & Feedback", pillar: "Pessoas", color: "text-gold bg-gold/10 border-gold/20", desc: "Decisão tomada. Os candidatos seleccionados avançam. Os não seleccionados recebem de forma atempada e transparente feedbacks construtivos baseados nos 4 princípios TARIRA." },
    { num: 8, icon: "📝", title: "Contratação", pillar: "Processo", color: "text-sage bg-sage/10 border-sage/20", desc: "A TARIRA gere os aspectos jurídicos, contratação formal, registos administrativos, onboarding básico e preparação burocrática para garantir total conformidade legal em Moçambique." },
    { num: 9, icon: "👁️", title: "Supervisão & SLA", pillar: "Processo", color: "text-sage bg-sage/10 border-sage/20", desc: "A cereja do bolo: a TARIRA Recruit supervisiona activamente o desempenho do prestador no terreno, monitorizando assiduidade, qualidade e o cumprimento rigoroso dos acordos de nível de serviço (SLAs)." },
    { num: 10, icon: "💰", title: "Pagamento & Avaliação", pillar: "Processo", color: "text-sage bg-sage/10 border-sage/20", desc: "Processamento seguro do pagamento após aprovação das horas ou tarefas. O cliente classifica o serviço prestado, alimentando a reputação digital e reiniciando o ciclo virtuoso do ecossistema." }
  ];

  return (
    <div className="min-h-screen bg-white text-[#172554] font-sans flex flex-col selection:bg-[#172554] selection:text-white transition-colors duration-300">
      
      {/* ================= MODULAR HIGH-PERFORMANCE NAVIGATION & MOBILE DRAWER (PORTAL) ================= */}
      <ModularPortalNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLang={currentLang}
        isUserLoggedIn={Boolean(
          isEffectiveAdmin ||
          supabaseUser ||
          (supabaseProfile && (supabaseProfile.email || supabaseProfile.id || supabaseProfile.name))
        )}
        isAdminLoggedIn={isEffectiveAdmin}
        supabaseUser={supabaseUser}
        supabaseProfile={supabaseProfile}
        selectedClient={selectedClient}
        selectedProfessional={selectedProfessional}
        onSignOut={handleSignOut}
        onOpenAuthModal={(mode, reason, initialRole) => {
          setLoginMode(mode);
          setGuestGateReason(reason || null);
          if (initialRole) {
            setAuthInitialRole(initialRole);
          } else {
            setAuthInitialRole('lar');
          }
          setIsSupabaseAuthOpen(true);
        }}
        onOpenCommercialModal={() => setIsCommercialModalOpen(true)}
        onOpenSolutionsDropdown={() => setIsSolutionsDropdownOpen(true)}
        isSolutionsDropdownOpen={isSolutionsDropdownOpen}
        onCloseSolutionsDropdown={() => setIsSolutionsDropdownOpen(false)}
        onNavigateToEcosystem={handleNavigateToEcosystem}
        setClientSelectedCategory={setClientSelectedCategory}
        headerSearchInput={headerSearchInput}
        setHeaderSearchInput={setHeaderSearchInput}
        onSearchSubmit={(query) => {
          if (query.trim()) {
            setSearchQuery(query.trim());
            setActiveTab("services");
          }
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onOpenTestAccounts={() => setIsTestAccountsModalOpen(true)}
      />

      {/* ================= MAIN WRAPPER ================= */}
      <main className="flex-1 pt-[116px] sm:pt-[122px] lg:pt-28 flex flex-col">

        {/* ════════════════════════ LANDING PAGE ════════════════════════ */}
        {activeTab === "landing" && (
          <div id="s-landing" className="flex flex-col w-full animate-fade-up bg-white min-h-screen text-[#172554]">
            {/* ════════════════ FULL-BLEED HERO BANNER — Deep Brand Blue Animated Showcase with Multiply Curtain ════════════════ */}
            <section className="relative w-full min-h-[82vh] sm:min-h-[92vh] overflow-hidden bg-[#0a162c] border-b border-border group">

              {/* Luminous Background Images with Blue Multiply Curtain Treatment & Zoom */}
              <div className="absolute inset-0 overflow-hidden">
                {landingBanners.filter(b => b.active).map((b, idx) => {
                  const isCurrent = idx === heroSlideIndex;
                  return (
                    <div
                      key={b.id || idx}
                      className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                        isCurrent ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      <img
                        src={b.url}
                        alt={b.title}
                        referrerPolicy="no-referrer"
                        loading="eager"
                        className={`w-full h-full object-cover will-change-transform transition-all duration-[7000ms] ease-out brightness-[1.22] contrast-[1.08] ${
                          isCurrent ? "scale-105 sm:scale-108" : "scale-100"
                        }`}
                      />
                    </div>
                  );
                })}

                {/* Cortina azul sutil e transparente para máxima visibilidade e nitidez das fotos do banner */}
                <div className="absolute inset-0 bg-[#0f285a]/28 mix-blend-multiply pointer-events-none z-[2]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/65 via-[#0b1b3d]/15 to-[#060e20]/45 pointer-events-none z-[2]"></div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none z-[3]"></div>
              </div>

              {/* Dynamic Animated Business Unit Spotlight Badge (Top-Right Floating Glass) */}
              {(() => {
                const activeBanners = landingBanners.filter(b => b.active);
                const currentBanner = activeBanners[heroSlideIndex] || activeBanners[0];
                if (!currentBanner) return null;
                const unitIcons: Record<string, React.ReactNode> = {
                  connect: <TariraConnectIcon size={18} className="text-blue-300" />,
                  recrute: <TariraRecruitIcon size={18} className="text-blue-300" />,
                  business: <TariraOutsourcingIcon size={18} className="text-blue-300" />,
                  consultoria: <TariraConsultingIcon size={18} className="text-blue-300" />,
                  studio: <TariraStudioIcon size={18} className="text-blue-300" />
                };
                const iconElement = unitIcons[currentBanner.category] || <Layers className="w-4 h-4 text-blue-300" />;
                return (
                  <div 
                    onClick={() => handleNavigateToEcosystem(currentBanner.category)}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/20 backdrop-blur-xl shadow-xl transition-transform transform hover:scale-105 cursor-pointer group"
                    title={currentLang === "pt" ? `Clique para aceder a ${currentBanner.title}` : `Click to open ${currentBanner.title}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      {iconElement}
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping"></span>
                        <span className="text-[11px] sm:text-xs font-mono font-bold text-white uppercase tracking-wider group-hover:text-blue-200">
                          {currentBanner.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-200 hidden md:inline truncate max-w-[260px] font-sans font-medium">
                        {currentBanner.tagline}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Previous / Next slide controls (Light Glass) */}
              {(() => {
                const activeBanners = landingBanners.filter(b => b.active);
                if (activeBanners.length < 2) return null;
                return (
                  <>
                    <button
                      onClick={() => setHeroSlideIndex(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1))}
                      className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-white/20 text-white hover:text-blue-200 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                      aria-label="Unidade anterior"
                      title="Unidade anterior no banner"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setHeroSlideIndex(prev => (prev + 1) % activeBanners.length)}
                      className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-white/20 text-white hover:text-blue-200 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                      aria-label="Próxima unidade"
                      title="Próxima unidade no banner"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                );
              })()}

              {/* Hero Central Content */}
              <div className="relative z-10 flex flex-col items-center text-center px-4 py-16 sm:py-20 max-w-4xl mx-auto min-h-[82vh] sm:min-h-[92vh] justify-center">

                {/* Brand pill badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm mb-7">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white tracking-widest uppercase font-mono">
                    {currentLang === "pt" ? "ECOSSISTEMA TARIRA • PLATAFORMA INTEGRADA" : "TARIRA ECOSYSTEM • INTEGRATED PLATFORM"}
                  </span>
                </div>

                <div className="mb-7">
                  <TariraLogo size="xl" lightBg={false} withSlogan={true} />
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white font-light tracking-tight mb-6 leading-tight drop-shadow-md">
                  {currentLang === "pt" ? (
                    <>A confiança que demora semanas a construir — <span className="relative inline-block text-blue-200 font-medium drop-shadow-md">a TARIRA tem pronta.<span className="absolute -bottom-1 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 via-sky-300 to-blue-400 rounded-full animate-trace-line shadow-[0_0_12px_rgba(96,165,250,0.6)]" /></span></>
                  ) : (
                    <>The trust that takes weeks to build — <span className="relative inline-block text-blue-200 font-medium drop-shadow-md">TARIRA has it ready.<span className="absolute -bottom-1 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 via-sky-300 to-blue-400 rounded-full animate-trace-line shadow-[0_0_12px_rgba(96,165,250,0.6)]" /></span></>
                  )}
                </h1>

                <p className="text-sm sm:text-lg text-blue-100/95 max-w-2xl mb-8 leading-relaxed font-sans font-normal drop-shadow-xs">
                  {currentLang === "pt" ? (
                    <>Plataforma unificada para <strong className="text-white font-bold">Talento Corporativo</strong> e <strong className="text-white font-bold">Ofícios Técnicos Certificados</strong> em Moçambique com supervisão de campo e garantia total.</>
                  ) : (
                    <>Unified platform for <strong className="text-white font-bold">Corporate Talent</strong> and <strong className="text-white font-bold">Certified Technical Trades</strong> in Mozambique with on-site oversight and full guarantee.</>
                  )}
                </p>

                {/* Business Units Interactive Showcase Strip */}
                {(() => {
                  const activeBanners = landingBanners.filter(b => b.active);
                  const currentBanner = activeBanners[heroSlideIndex] || activeBanners[0];
                  return (
                    <div className="w-full max-w-3xl mb-9">
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-white/20 shadow-xl">
                        {[
                          { key: "connect", label: "Connect", icon: <TariraConnectIcon size={15} /> },
                          { key: "recrute", label: "Recruit", icon: <TariraRecruitIcon size={15} /> },
                          { key: "business", label: "Outsourcing", icon: <TariraOutsourcingIcon size={15} /> },
                          { key: "consultoria", label: "Consulting", icon: <TariraConsultingIcon size={15} /> },
                          { key: "studio", label: "Studio", icon: <TariraStudioIcon size={15} /> },
                        ].map(unit => {
                          const isCurrent = currentBanner?.category === unit.key;
                          return (
                            <button
                              key={unit.key}
                              id={`hero-btn-unit-${unit.key}`}
                              onClick={() => {
                                const foundIndex = activeBanners.findIndex(b => b.category === unit.key);
                                if (foundIndex !== -1) setHeroSlideIndex(foundIndex);
                                handleNavigateToEcosystem(unit.key);
                              }}
                              title={currentLang === "pt" ? `Aceder ao ecossistema ${unit.label}` : `Navigate to ${unit.label}`}
                              className={`relative px-3.5 sm:px-4 py-2.5 rounded-xl transition-all duration-300 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wide cursor-pointer flex items-center gap-2 overflow-hidden ${
                                isCurrent
                                  ? "bg-white text-[#172554] shadow-lg font-extrabold scale-105"
                                  : "bg-white/10 border border-white/15 hover:border-blue-300/40 hover:bg-white/20 text-white"
                              }`}
                            >
                              <span className="shrink-0">{unit.icon}</span>
                              <span>{unit.label}</span>
                              {isCurrent && (
                                <span className="flex h-1.5 w-1.5 rounded-full bg-[#172554] animate-ping"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Animated Current Unit Sub-Banner Highlight with direct navigation */}
                      {currentBanner && (
                        <div 
                          onClick={() => handleNavigateToEcosystem(currentBanner.category)}
                          className="mt-3 px-4 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900/80 border border-white/20 backdrop-blur-md flex items-center justify-between text-left text-xs transition-all animate-fade-up cursor-pointer group shadow-sm"
                          title={currentLang === "pt" ? `Clique para abrir o módulo ${currentBanner.title}` : `Click to open ${currentBanner.title}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-blue-200 font-bold font-mono group-hover:text-white transition-colors flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5" />
                              <span>{currentBanner.title}:</span>
                            </span>
                            <span className="text-blue-100 font-medium">{currentBanner.tagline}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-200 font-bold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                            <span>{currentLang === "pt" ? "Abrir Unidade" : "Open Unit"}</span>
                            <span>→</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3.5">
                  <button
                    onClick={() => setActiveTab("apply")}
                    className="px-7 py-3.5 rounded-2xl bg-[#172554] hover:bg-[#1A3478] text-white font-black text-xs uppercase tracking-wider shadow-xl border-2 border-blue-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 group"
                    title="Cadastro para Eletricistas, Canalizadores, Pintores, Obras, Limpeza e Reparações (Connect)"
                  >
                    <HardHat className="w-5 h-5 shrink-0 text-white" />
                    <div className="flex flex-col items-center leading-tight">
                      <span>{currentLang === "pt" ? "Registar como Técnico de Ofício" : "Register as Trade Technician"}</span>
                      <span className="text-[10px] font-mono tracking-widest font-black text-blue-200 uppercase animate-zoom-in-out mt-0.5">
                        TARIRA Connect
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("spontaneous_apply")}
                    className="px-7 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-[#172554] font-black text-xs uppercase tracking-wider border-2 border-white hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2.5 group"
                    title="Cadastro para TI, Cibersegurança, Atendimento, Finanças, Escriturário e Gestão (Recruit)"
                  >
                    <GraduationCap className="w-5 h-5 shrink-0 text-[#172554]" />
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[#172554]">{currentLang === "pt" ? "Registar como Profissional" : "Register as Professional"}</span>
                      <span className="text-[10px] font-mono tracking-widest font-black text-[#172554] uppercase animate-zoom-in-out mt-0.5">
                        TARIRA Recruit
                      </span>
                    </div>
                  </button>
                </div>

              </div>

              {/* Slide position indicators with animated active progress bar */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 border border-white/20 backdrop-blur-md shadow-md">
                {landingBanners.filter(b => b.active).map((b, idx) => {
                  const isCurrent = idx === heroSlideIndex;
                  return (
                    <button
                      key={b.id || idx}
                      onClick={() => setHeroSlideIndex(idx)}
                      aria-label={`Slide ${idx + 1} - ${b.title}`}
                      title={b.title}
                      className={`relative h-2 rounded-full transition-all duration-500 cursor-pointer overflow-hidden ${
                        isCurrent ? "w-8 bg-blue-400 shadow-xs" : "w-2.5 bg-white/40 hover:bg-white/60"
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute inset-0 bg-white/40 animate-pulse"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* SECTION 1: DOIS MUNDOS. UMA PLATAFORMA. */}
            <section className="py-16 px-6 max-w-7xl mx-auto w-full border-t border-border section-white bg-white">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-[10px] tracking-[0.35em] text-[#172554] uppercase font-bold mb-2 block font-mono">TARIRA ECOSYSTEM</span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#172554] font-medium">
                  <span className="relative inline-block">
                    Supervisionamos para que não precise.
                    <span className="absolute -bottom-1.5 left-0 w-full h-[4px] bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 rounded-full animate-trace-line shadow-[0_0_10px_rgba(23,37,84,0.3)]" />
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#3B5998] mt-3 font-medium">Do recrutamento de quadros executivos à manutenção técnica predial e residencial.</p>
              </div>

              {/* DUAL LIGHT TEASER CARDS — Connect em Cartão Branco e Recruit em Cartão Azul do Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Ofícios Técnicos (Connect) — White Card with Brand Blue Accent */}
                <div
                  onClick={() => setActiveTab("connect_sub")}
                  className="group cursor-pointer rounded-3xl p-7 border-l-4 border-[#172554] border-t border-r border-b border-border bg-white hover:border-[#172554] hover:shadow-md transition-all flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-2xl bg-blue-50 text-[#172554] flex items-center justify-center border border-blue-200 shrink-0">
                      <Wrench className="w-6 h-6 text-[#172554]" />
                    </span>
                    <div>
                      <span className="text-[10px] text-[#172554] uppercase font-mono font-bold tracking-wider">TARIRA CONNECT</span>
                      <h3 className="text-lg font-serif text-[#172554] font-bold leading-tight">Ofícios & Técnicos de Campo</h3>
                      <p className="text-[11px] text-[#3B5998] mt-0.5">Eletricistas, canalizadores, AC, obras — com garantia de 30 dias.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#172554] shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Talento Profissional & Especialistas (Recruit) — Signature Header Blue Card with White Text */}
                <div
                  onClick={() => setActiveTab("recruit_sub")}
                  className="group cursor-pointer card-header-blue rounded-3xl p-7 border-l-4 border-blue-400 border-t border-r border-b border-[#172554] bg-[#172554] hover:bg-[#1A3478] hover:shadow-xl transition-all flex items-center justify-between gap-4 shadow-md text-white"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-2xl bg-white/15 text-white flex items-center justify-center border border-white/25 shrink-0">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </span>
                    <div>
                      <span className="text-[10px] text-blue-200 uppercase font-mono font-bold tracking-wider">TARIRA RECRUIT</span>
                      <h3 className="text-lg font-serif text-white font-bold leading-tight">Profissionais & Especialistas</h3>
                      <p className="text-[11px] text-blue-100 mt-0.5">Talentos e Quadros já triados — prontos em 24-48h.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* UNIDADES DE NEGÓCIO TARIRA MAP & CAROUSEL */}
              <section id="ecosystem-section" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full border border-border bg-white rounded-3xl my-8 shadow-sm">
                {/* Section Header with vertical highlight bar */}
                <div className="mb-10 text-left space-y-2 border-l-4 border-[#172554] pl-4">
                  <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#172554] px-3.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
                    <Building2 className="w-3.5 h-3.5 text-[#172554]" />
                    <span>UNIDADES DE NEGÓCIO TARIRA</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-4xl text-[#172554] font-bold">
                    {currentLang === "pt" ? (
                      <>
                        Nossas Unidades de Negócio{" "}
                        <span className="relative inline-block text-[#172554]">
                          Integradas
                          <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 rounded-full animate-trace-line shadow-[0_0_8px_rgba(23,37,84,0.3)]" />
                        </span>
                      </>
                    ) : (
                      "Our Integrated Business Units"
                    )}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#3B5998] max-w-3xl leading-relaxed">
                    {currentLang === "pt"
                      ? "Conheça os 5 pilares operacionais do ecossistema TARIRA para recrutamento, serviços técnicos, terceirização B2B, consultoria estratégica e inovação tecnológica."
                      : "Explore TARIRA's 5 core operational pillars for recruitment, technical services, B2B outsourcing, strategic consulting, and tech innovation."}
                  </p>
                </div>

                {/* 🖥️ ECOSYSTEM CARD GRID FOR ALL 5 BUSINESS UNITS */}
                <TariraLandingBusinessUnitsGrid onNavigate={handleNavigateToEcosystem} />
              </section>

              {/* B2B COMPANY REGISTRATION & PACKAGES EXPLANATION SECTION */}
              <div className="rounded-3xl p-8 lg:p-10 border border-border bg-white shadow-sm mb-14 text-[#172554]">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-border">
                  <div className="space-y-2 max-w-3xl">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#172554] border border-blue-200 inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#172554]" />
                      <span>Registo & Acesso Corporativo para Empresas (B2B)</span>
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif text-[#172554] font-bold">
                      Como a sua Empresa se pode Cadastrar e Contratar
                    </h3>
                    <p className="text-xs sm:text-sm text-[#3B5998] leading-relaxed">
                      Criamos um canal institucional unificado para organizações empresariais, condomínios, fábricas e redes de retalho terem acesso prioritário a prestadores de ofícios técnicos e especialistas corporativos.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                    <button
                      onClick={() => {
                        setLoginMode("signup");
                        setAuthInitialRole("empresa");
                        setGuestGateReason(null);
                        setIsSupabaseAuthOpen(true);
                      }}
                      className="px-6 py-3.5 rounded-xl bg-[#172554] text-white font-black text-xs uppercase tracking-wider shadow-md hover:bg-[#1A3478] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#172554]"
                    >
                      <Building2 className="w-4 h-4 text-white" />
                      <span>Criar Perfil de Empresa / Registar</span>
                    </button>
                    <button
                      onClick={() => {
                        setCommercialContactForm(prev => ({ ...prev, serviceType: "tender" }));
                        setIsCommercialModalOpen(true);
                      }}
                      className="px-6 py-3.5 rounded-xl bg-white border border-border text-[#172554] hover:bg-slate-50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <FileCheck className="w-4 h-4 text-[#172554]" />
                      <span>Submeter Concurso / Proposta</span>
                    </button>
                  </div>
                </div>

                {/* 3 Step Onboarding Guide for Companies */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-border">
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-border space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#172554] flex items-center justify-center font-mono font-bold text-sm border border-blue-200">
                      01
                    </div>
                    <h4 className="text-sm font-bold text-[#172554]">Registo Institucional & NUIT</h4>
                    <p className="text-xs text-[#3B5998] leading-relaxed">
                      Dados da empresa e NUIT — validação imediata.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-border space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#172554] flex items-center justify-center font-mono font-bold text-sm border border-blue-200">
                      02
                    </div>
                    <h4 className="text-sm font-bold text-[#172554]">Escolha da Modalidade</h4>
                    <p className="text-xs text-[#3B5998] leading-relaxed">
                      Connect (técnicos) ou Recruit (quadros).
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-border space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#172554] flex items-center justify-center font-mono font-bold text-sm border border-blue-200">
                      03
                    </div>
                    <h4 className="text-sm font-bold text-[#172554]">Ativação com SLA</h4>
                    <p className="text-xs text-[#3B5998] leading-relaxed">
                      Equipa alocada, seguro e faturação única.
                    </p>
                  </div>
                </div>

                {/* Company Packages Cards — Cartão do Meio (Recruit) em Azul do Header com Texto Branco */}
                <div className="pt-8 space-y-4">
                  <div className="text-center md:text-left">
                    <span className="text-[10px] font-mono font-bold text-[#172554] uppercase tracking-widest block mb-1">PACOTES CORPORATIVOS</span>
                    <h4 className="text-lg font-serif text-[#172554] font-bold">Soluções Adaptadas à Escala da Sua Organização</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {/* Pacote 1: Connect (White Card) */}
                    <div className="p-6 rounded-2xl bg-white border border-border flex flex-col justify-between space-y-4 hover:border-blue-500 hover:shadow-md transition-all shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#172554] text-[10px] font-mono font-bold uppercase border border-blue-200">
                            Tarira Connect
                          </span>
                          <span className="p-2 rounded-xl bg-blue-50 text-[#172554] border border-blue-200">
                            <Wrench className="w-5 h-5 text-[#172554]" />
                          </span>
                        </div>
                        <h5 className="text-base font-bold text-[#172554]">Ofícios & Manutenção Contínua</h5>
                        <p className="text-xs text-[#3B5998] leading-relaxed">
                          Técnicos de campo com garantia, sem contratação fixa.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!checkVisitorAccess("CONTRATAR_OFICIOS")) return;
                          setClientSelectedCategory("tech_trades");
                          setActiveTab("client_find");
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        Contratar Ofícios
                      </button>
                    </div>

                    {/* Pacote 2: Recruit — Signature Header Blue Card with White Text */}
                    <div className="card-header-blue p-6 rounded-2xl bg-[#172554] border-2 border-[#172554] flex flex-col justify-between space-y-4 hover:shadow-2xl transition-all relative text-white shadow-lg">
                      <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-white text-[#172554] text-[9px] font-mono font-black uppercase shadow-xs border border-white/50">
                        Mais Procurado
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-white/15 text-white text-[10px] font-mono font-bold uppercase border border-white/20">
                            Tarira Recruit
                          </span>
                          <span className="p-2 rounded-xl bg-white/15 text-white border border-white/20">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </span>
                        </div>
                        <h5 className="text-base font-bold text-white">Recrutamento Especializado</h5>
                        <p className="text-xs text-blue-100 leading-relaxed">
                          Quadros qualificados, shortlist validada em 48h.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!checkVisitorAccess("ABRIR_VAGA")) return;
                          setIsBriefingFormOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl bg-white hover:bg-blue-50 !text-[#172554] text-[#172554] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        Abrir Requisição de Vaga
                      </button>
                    </div>

                    {/* Pacote 3: RPO (White Card) */}
                    <div className="p-6 rounded-2xl bg-white border border-border flex flex-col justify-between space-y-4 hover:border-blue-500 hover:shadow-md transition-all shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#172554] text-[10px] font-mono font-bold uppercase border border-blue-200">
                            Tarira RPO
                          </span>
                          <span className="p-2 rounded-xl bg-blue-50 text-[#172554] border border-blue-200">
                            <Building2 className="w-5 h-5 text-[#172554]" />
                          </span>
                        </div>
                        <h5 className="text-base font-bold text-[#172554]">RPO & Gestão de SLAs</h5>
                        <p className="text-xs text-[#3B5998] leading-relaxed">
                          Equipas terceirizadas com SLA contratual de 98%+.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCommercialContactForm(prev => ({ ...prev, serviceType: "business" }));
                          setIsCommercialModalOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        Pedir Proposta RPO
                      </button>
                    </div>
                  </div>
                </div>
              </div>


            </section>

            {/* LIGHT TEASER: TARIRA OUTSOURCING (RPO) — Signature Header Blue Card with White Text */}
            <section className="py-14 px-6 max-w-7xl mx-auto w-full space-y-6 section-white bg-white">
              <div
                onClick={() => handleNavigateToEcosystem("business")}
                className="group cursor-pointer card-header-blue rounded-3xl border-2 border-[#172554] bg-[#172554] px-8 py-10 sm:px-12 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl hover:shadow-2xl transition-all text-white"
                title={currentLang === "pt" ? "Abrir TARIRA Outsourcing (RPO)" : "Open TARIRA Outsourcing (RPO)"}
              >
                <div className="text-center sm:text-left">
                  <span className="text-[10px] tracking-[0.35em] text-blue-200 uppercase font-black mb-2 block font-mono">
                    TARIRA OUTSOURCING (RPO)
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                    {currentLang === "pt"
                      ? <>O seu recrutamento. <span className="text-blue-200">Sem limites.</span></>
                      : <>Your hiring. <span className="text-blue-200">Without limits.</span></>}
                  </h3>
                  <p className="text-sm text-blue-100 max-w-xl">
                    {currentLang === "pt"
                      ? "Outsourcing operacional, recrutamento flexível e gestão completa da equipa alocada — a sua empresa foca-se no essencial."
                      : "Operational outsourcing, flexible staffing, and full management of your allocated team — so your business can focus on what matters most."}
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white !text-[#172554] text-[#172554] hover:bg-slate-100 font-black text-xs uppercase tracking-wider shadow-md group-hover:scale-105 transition-transform">
                  <span className="!text-[#172554] text-[#172554]">{currentLang === "pt" ? "Conhecer o Outsourcing RPO" : "Explore Outsourcing RPO"}</span>
                  <span className="!text-[#172554] text-[#172554]">→</span>
                </span>
              </div>

              {/* Gráfico animado de expansão de candidatos — clicável, leva também à página RPO */}
              <div onClick={() => handleNavigateToEcosystem("business")} className="cursor-pointer">
                <TariraOutsourcingGrowthChart compact />
              </div>
            </section>


            {/* PROMINENT LANDING SECTION: CANDIDATURAS ESPONTÂNEAS */}
            <section className="max-w-7xl mx-auto px-6 py-12 w-full section-white bg-white">
              <div className="rounded-3xl p-8 sm:p-10 border border-border bg-white shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-[#172554]">
                <div className="space-y-4 max-w-2xl text-left relative z-10">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEmailComposer(e, socialLinks.email, "Candidatura Espontânea & CV — TARIRA Talent Pool", "Olá equipa de Recrutamento TARIRA,\n\nGostaria de submeter a minha candidatura espontânea e disponibilizar o meu currículo para futuras oportunidades.\n\nNome:\nÁrea de Atuação:\nTelefone:\n\nEm anexo envio o meu CV.\n\nAtenciosamente,")}
                    className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#172554] px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer"
                    title="Clique para enviar candidatura espontânea por e-mail"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#172554]" />
                    <span>CANAL DE OPORTUNIDADES ABERTAS • ENVIAR POR E-MAIL ↗</span>
                  </button>
                  <h2 className="font-serif text-2xl sm:text-4xl text-[#172554] font-bold leading-tight">
                    Candidatura Espontânea & Banco de Talentos
                  </h2>
                  <p className="text-xs sm:text-sm text-[#3B5998] leading-relaxed font-sans">
                    Não encontrou uma vaga aberta específica? Inscreva o seu perfil no nosso banco de dados. Este canal alimenta diretamente os processos de recrutamento da TARIRA para:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-border flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-[#172554] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-[#172554] font-sans">Carreira de Recrutamento (Sem Experiência)</h4>
                        <p className="text-[10px] text-[#3B5998] leading-normal mt-0.5">Jovens talentos, recém-graduados, estagiários e primeiro emprego.</p>
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-border flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-[#172554] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-[#172554] font-sans">Carreira de Business (Operações em Lote)</h4>
                        <p className="text-[10px] text-[#3B5998] leading-normal mt-0.5">Volume de profissionais para grandes operações corporativas.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3 w-full lg:w-auto shrink-0 relative z-10">
                  <button
                    onClick={() => setActiveTab("spontaneous_apply")}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#172554] hover:bg-[#1A3478] text-white font-bold text-sm shadow-md border border-[#172554] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Submeter Candidatura Espontânea</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] text-[#3B5998] font-mono font-medium">
                    ✓ Modelo ATS Automático • Documentos BI/NUIT
                  </span>
                </div>
              </div>
            </section>

            {/* Corporate Header-Blue Footer with Crisp White Text */}
            <footer className="border-t border-[#1A3478] px-6 py-12 bg-[#172554] text-white">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                
                {/* Column 1: Branding & Description */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex flex-col">
                    <span className="text-white font-serif text-2xl tracking-[0.2em] font-extrabold block">TARIRA Ecossystem</span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed max-w-sm font-medium">
                    {currentLang === "pt"
                      ? "A plataforma definitiva para contratação de talentos em África. Parte do ecossistema TARIRA. Unimos verificação operacional rigorosa e inteligência preditiva."
                      : "The ultimate talent acquisition platform in Africa. Part of the TARIRA ecosystem. Combining rigorous operational verification and predictive intelligence."}
                  </p>
                  <div className="flex gap-3 pt-2">
                    <a
                      href={`mailto:${socialLinks.email || "tarira.ecossistema@gmail.com"}?subject=${encodeURIComponent("Contacto via Portal TARIRA")}`}
                      onClick={(e) => {
                        const mailtoUri = `mailto:${socialLinks.email || "tarira.ecossistema@gmail.com"}?subject=${encodeURIComponent("Contacto via Portal TARIRA")}`;
                        window.location.href = mailtoUri;
                      }}
                      aria-label="Escrever E-mail para TARIRA"
                      title={`Escrever E-mail (Abre o seu correio eletrónico com o destinatário ${socialLinks.email || "tarira.ecossistema@gmail.com"} preenchido)`}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-[#172554] border border-white/20 flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                    <a
                      href={socialLinks.linkedin || "https://www.linkedin.com/in/tarira-ecossistema"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn Oficial TARIRA"
                      title="LinkedIn Oficial TARIRA (www.linkedin.com/in/tarira-ecossistema)"
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-[#172554] border border-white/20 flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={socialLinks.whatsapp || "https://wa.me/258871425316?text=Ol%C3%A1%20TARIRA,%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp TARIRA"
                      title={`WhatsApp Oficial TARIRA (${socialLinks.phone1 || "+258 87 142 5316"})`}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-[#172554] border border-white/20 flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                    <a
                      href={socialLinks.instagram || "https://www.instagram.com/tarira.weoversee"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram Oficial TARIRA"
                      title="Instagram Oficial TARIRA (@tarira.weoversee)"
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-[#172554] border border-white/20 flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Column 2: Plataforma Links / Unidades com Fundo Branco & Efeito Hover */}
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 font-mono border-b border-white/20 pb-1">
                    {currentLang === "pt" ? "Ecossistema TARIRA" : "TARIRA Ecosystem"}
                  </h4>
                  <ul className="space-y-2 text-xs font-bold">
                    {[
                      { id: "connect", label: "TARIRA Connect", icon: <TariraConnectIcon size={14} className="text-[#172554]" /> },
                      { id: "recrute", label: "TARIRA Recruit", icon: <TariraRecruitIcon size={14} className="text-[#172554]" /> },
                      { id: "business", label: "TARIRA Outsourcing", icon: <TariraOutsourcingIcon size={14} className="text-[#172554]" /> },
                      { id: "consultoria", label: "TARIRA Consulting", icon: <TariraConsultingIcon size={14} className="text-[#172554]" /> },
                      { id: "studio", label: "TARIRA Studio", icon: <TariraStudioIcon size={14} className="text-[#172554]" /> }
                    ].map((unit) => (
                      <li key={unit.id}>
                        <button 
                          onClick={() => handleNavigateToEcosystem(unit.id as any)} 
                          className="w-full text-left bg-white text-[#172554] px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-xs hover:bg-blue-50 hover:text-[#172554] transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                        >
                          <span className="flex items-center gap-2">
                            <span className="shrink-0">{unit.icon}</span>
                            <span>{unit.label}</span>
                          </span>
                          <span className="text-blue-400 group-hover:text-[#172554]">→</span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-3 border-t border-white/20 space-y-1.5 text-xs text-blue-100 font-medium">
                    <button onClick={() => { setActiveTab("client_find"); setClientSelectedCategory("all"); }} className="block w-full text-left hover:text-white transition-all">
                      • {currentLang === "pt" ? "Banco de Talentos" : "Talent Pool"}
                    </button>
                    <button onClick={() => { setActiveTab("client_find"); setClientSelectedCategory("elite_hub"); }} className="block w-full text-left hover:text-white transition-all">
                      • Elite Hub (IA)
                    </button>
                    <button onClick={() => { setActiveTab("services"); }} className="block w-full text-left hover:text-white transition-all">
                      • {currentLang === "pt" ? "Preços & Serviços" : "Pricing & Services"}
                    </button>
                  </div>
                </div>

                {/* Column 3: Empresa Links (Texto Branco e Alta Legibilidade) */}
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 font-mono border-b border-white/20 pb-1">
                    {currentLang === "pt" ? "Empresa" : "Company"}
                  </h4>
                  <ul className="space-y-2.5 text-xs text-white font-semibold">
                    <li>
                      <button onClick={() => { setAboutActiveSection("about"); setActiveTab("about"); }} className="hover:text-blue-200 transition-all text-left flex items-center gap-1.5">
                        <span>ℹ️</span> {currentLang === "pt" ? "Sobre Nós" : "About Us"}
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setAboutActiveSection("careers"); setActiveTab("about"); }} className="hover:text-blue-200 transition-all text-left flex items-center gap-1.5">
                        <span>💼</span> {currentLang === "pt" ? "Carreiras & Recrute" : "Careers & Recruiting"}
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setAboutActiveSection("contact"); setActiveTab("about"); }} className="hover:text-blue-200 transition-all text-left flex items-center gap-1.5">
                        <span>📞</span> {currentLang === "pt" ? "Contacto Directo" : "Direct Contact"}
                      </button>
                    </li>
                  </ul>
                </div>

              </div>

              <div className="max-w-7xl mx-auto pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-blue-100">
                <span>
                  © 2026 TARIRA · Moçambique · {currentLang === "pt" ? "Todos os direitos reservados." : "All rights reserved."}
                </span>
                <span className="font-mono text-[10px] tracking-widest text-white font-bold">
                  TARIRA ALLIANCE · SECURE & AUDITED
                </span>
              </div>
            </footer>

          </div>
        )}

        {/* ════════════════════════ SUBPÁGINA OPERACIONAL: TARIRA BUSINESS ════════════════════════ */}
        {activeTab === "business_sub" && (
          <TariraOutsourcingModule
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onGoBack={handleGoBack}
            partnerCompanies={partnerCompanies}
            businessSubForm={businessSubForm}
            setBusinessSubForm={setBusinessSubForm}
            businessSubSubmitted={businessSubSubmitted}
            setBusinessSubSubmitted={setBusinessSubSubmitted}
            businessSubActiveStep={businessSubActiveStep}
            setBusinessSubActiveStep={setBusinessSubActiveStep}
            isCommercialModalOpen={isCommercialModalOpen}
            setIsCommercialModalOpen={setIsCommercialModalOpen}
            commercialContactForm={commercialContactForm}
            setCommercialContactForm={setCommercialContactForm}
            onAddCommercialProposal={handleAddCommercialProposal}
          />
        )}

        {/* ════════════════════════ SUBPÁGINA DE ASSINATURA: TARIRA CONNECT ════════════════════════ */}
        {activeTab === "connect_sub" && (
          <TariraConnectModule
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onGoBack={handleGoBack}
            connectSubForm={connectSubForm}
            setConnectSubForm={setConnectSubForm}
            connectSubSubmitted={connectSubSubmitted}
            setConnectSubSubmitted={setConnectSubSubmitted}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            churnSimParams={churnSimParams}
            setChurnSimParams={setChurnSimParams}
            getSubServiceImage={getSubServiceImage}
            onAddCommercialProposal={handleAddCommercialProposal}
          />
        )}

        {/* ════════════════════════ SUBPÁGINA DE RECRUTAMENTO: TARIRA RECRUIT #pipelines ════════════════════════ */}
        {activeTab === "recruit_sub" && (
          <TariraRecruitModule
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onGoBack={handleGoBack}
            candidates={candidates}
            setCandidates={setCandidates}
            selectedProfessional={selectedProfessional}
            setSelectedProfessional={setSelectedProfessional}
            recruitSelectedCategory={recruitSelectedCategory}
            setRecruitSelectedCategory={setRecruitSelectedCategory}
            onSelectCandidateForGallery={(candId, specId) => {
              setRecruitSelectedCandidateId(candId);
              if (specId) setRecruitSelectedCategory(specId);
              setActiveTab("profissionais");
            }}
            onOpenCommercialModal={() => setIsCommercialModalOpen(true)}
            adminActiveSubTab={adminActiveSubTab}
            setAdminActiveSubTab={setAdminActiveSubTab}
            viewCandidateModal={viewCandidateModal}
            setViewCandidateModal={(cand) => {
              if (cand === null) {
                setViewCandidateModal(null);
              } else if (checkVisitorAccess("VER_CONTACTO")) {
                setViewCandidateModal(cand);
              }
            }}
            portfolioCandidateModal={portfolioCandidateModal}
            setPortfolioCandidateModal={(cand) => {
              if (cand === null) {
                setPortfolioCandidateModal(null);
              } else if (checkVisitorAccess("VER_CONTACTO")) {
                setViewCandidateModal(cand);
              }
            }}
            partnerCompanies={partnerCompanies}
            setPartnerCompanies={setPartnerCompanies}
            isBriefingFormOpen={isBriefingFormOpen}
            setIsBriefingFormOpen={(open) => {
              if (!open) {
                setIsBriefingFormOpen(false);
              } else if (checkVisitorAccess("BRIEFING_SUBMIT")) {
                setIsBriefingFormOpen(true);
              }
            }}
            phaseExplainerModal={phaseExplainerModal}
            setPhaseExplainerModal={setPhaseExplainerModal}
          />
        )}

        {/* ════════════════════════ SUBPÁGINA DE CONSULTORIA: TARIRA CONSULTING ════════════════════════ */}
        {activeTab === "consulting_sub" && (
          <TariraConsultingModule
            setActiveTab={setActiveTab}
            onGoBack={handleGoBack}
            isAdminLoggedIn={isAdminLoggedIn}
            selectedHrModel={selectedHrModel}
            setSelectedHrModel={setSelectedHrModel}
            simHeadcount={simHeadcount}
            setSimHeadcount={setSimHeadcount}
            simRecruitmentLevel={simRecruitmentLevel}
            setSimRecruitmentLevel={setSimRecruitmentLevel}
            consultingReqs={consultingReqs}
            setConsultingReqs={setConsultingReqs}
            consultingExternalForm={consultingExternalForm}
            setConsultingExternalForm={setConsultingExternalForm}
            consultingExternalSubmitted={consultingExternalSubmitted}
            setConsultingExternalSubmitted={setConsultingExternalSubmitted}
            ceoPhoto={ceoPhoto}
            setCeoPhoto={setCeoPhoto}
            fetchBackendData={fetchBackendData}
            handleUpdateCeoPhoto={handleUpdateCeoPhoto}
            uploadImageToImgBB={uploadImageToImgBB}
            onAddCommercialProposal={handleAddCommercialProposal}
          />
        )}

        {/* ════════════════════════ SUBPÁGINA: TARIRA STUDIO (UNIDADE DE PLATAFORMAS DIGITAIS) ════════════════════════ */}
        {activeTab === "studio_sub" && (
          <TariraStudioModule
            setActiveTab={setActiveTab}
            onGoBack={handleGoBack}
            candidates={candidates}
            hires={hires}
            studioActiveTab={studioActiveTab}
            setStudioActiveTab={setStudioActiveTab}
            studioMerchantStep={studioMerchantStep}
            setStudioMerchantStep={setStudioMerchantStep}
            studioMerchantForm={studioMerchantForm}
            setStudioMerchantForm={setStudioMerchantForm}
            studioMerchantSubmitted={studioMerchantSubmitted}
            setStudioMerchantSubmitted={setStudioMerchantSubmitted}
            studioProjectForm={studioProjectForm}
            setStudioProjectForm={setStudioProjectForm}
            studioProjectSubmitted={studioProjectSubmitted}
            setStudioProjectSubmitted={setStudioProjectSubmitted}
            orgOperators={orgOperators}
            setOrgOperators={setOrgOperators}
            activeOperator={activeOperator}
            setActiveOperator={setActiveOperator}
            operatorAuditLogs={operatorAuditLogs}
            setOperatorAuditLogs={setOperatorAuditLogs}
            triggerOperationLog={triggerOperationLog}
            onAddCommercialProposal={handleAddCommercialProposal}
          />
        )}

        {/* ════════════════════════ SOBRE NÓS / CARREIRAS / CONTACTO SCREEN ════════════════════════ */}
        {activeTab === "about" && (
          <div id="s-about" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 bg-white text-[#172554]">
            
            {/* Header section with category toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
              <div>
                <span className="text-xs tracking-[0.25em] text-[#172554] uppercase font-bold font-mono block">TARIRA ECOSYSTEM</span>
                <h1 className="font-serif text-3xl sm:text-4xl text-[#172554] font-bold mt-1">
                  Institucional & <span className="relative inline-block text-[#172554]">Ecossistema TARIRA<span className="absolute -bottom-1 left-0 w-full h-[3px] bg-blue-600 rounded-full animate-trace-line shadow-[0_0_8px_rgba(37,99,235,0.4)]" /></span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal">
                  Transparência, governança de processos e infraestrutura de confiança para Moçambique.
                </p>
              </div>
              
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-xs">
                <button 
                  onClick={() => setAboutActiveSection("about")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${aboutActiveSection === "about" ? "bg-[#172554] text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                >
                  ℹ️ Quem Somos
                </button>
                <button 
                  onClick={() => setAboutActiveSection("careers")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${aboutActiveSection === "careers" ? "bg-[#172554] text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                >
                  💼 Carreiras
                </button>
                <button 
                  onClick={() => setAboutActiveSection("contact")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${aboutActiveSection === "contact" ? "bg-[#172554] text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                >
                  📞 Contacto
                </button>
              </div>
            </div>

            {/* Sub-section 1: About Us */}
            {aboutActiveSection === "about" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-up">
                
                {/* Main branding & text block */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <h2 className="text-xl sm:text-2xl font-serif text-[#172554] font-bold">
                      Dois Mundos, <span className="relative inline-block text-blue-700">Uma Plataforma Unificada<span className="absolute -bottom-1 left-0 w-full h-[3px] bg-blue-600 rounded-full animate-trace-line shadow-[0_0_8px_rgba(37,99,235,0.4)]" /></span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      A <strong className="text-[#172554] font-bold">TARIRA</strong> integra recrutamento especializado e serviços técnicos operacionais numa plataforma unificada em Moçambique, unindo processos ágeis e supervisão contínua.
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      Construímos uma ponte sólida de confiança através de validação presencial, auditoria documental e acompanhamento de campo de cada técnico e profissional antes de qualquer alocação.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-all">
                      <span className="text-2xl">🛡️</span>
                      <h3 className="text-xs font-bold text-[#172554] uppercase tracking-wider font-mono">Confiança Auditada</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Triagem presencial de antecedentes criminais, verificação de identidade e auditoria prática de qualificações técnicas.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-all">
                      <span className="text-2xl">⚡</span>
                      <h3 className="text-xs font-bold text-[#172554] uppercase tracking-wider font-mono">Prontidão Operacional</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Prestadores homologados disponíveis em tempo real com supervisão e acompanhamento direto no terreno.
                      </p>
                    </div>
                  </div>

                  {/* Seção LIDERANÇA: Vicente Dias */}
                  <div id="ceo-section" className={`p-6 sm:p-8 rounded-3xl bg-white border shadow-xs space-y-6 transition-all ${isEffectiveAdmin ? 'border-blue-400/50 shadow-blue-500/10 ring-1 ring-blue-400/30' : 'border-slate-200'}`}>
                    <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] tracking-[0.25em] text-[#172554] uppercase font-bold font-mono block">LIDERANÇA</span>
                        <h2 className="text-xl font-serif text-[#172554] font-bold mt-1">
                          Liderança & <span className="relative inline-block text-blue-700">Fundador<span className="absolute -bottom-1 left-0 w-full h-[3px] bg-blue-600 rounded-full animate-trace-line shadow-[0_0_8px_rgba(37,99,235,0.4)]" /></span>
                        </h2>
                      </div>
                      {isEffectiveAdmin && (
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Modo Administrador Activo</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                      {/* Photo Area */}
                      <div className="md:col-span-5 flex flex-col items-center justify-center">
                        <div className="relative w-full max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-md group">
                          <img 
                            src={ceoPhoto} 
                            alt="Vicente Dias - CEO & Founder" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90 pointer-events-none"></div>
                          
                          {/* Hover Upload Overlay & File Input (Admin Only) */}
                          {isEffectiveAdmin && (
                            <>
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 p-4 text-center">
                                <div className="p-3 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 mb-2 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                  📷
                                </div>
                                <span className="text-[11px] font-bold text-blue-300 tracking-wider uppercase">Alterar Foto do CEO</span>
                                <span className="text-[9px] text-blue-200/80 mt-1 font-mono">Clique para selecionar imagem</span>
                              </div>

                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    uploadImageToImgBB(file).then((url) => {
                                      handleUpdateCeoPhoto(url).then((persisted) => {
                                        alert(persisted
                                          ? "Foto de Vicente Dias atualizada com sucesso e visível para todos os utilizadores."
                                          : "Foto atualizada com sucesso no navegador.");
                                      });
                                    }).catch(() => {
                                      alert("Erro ao carregar a imagem. Tente novamente.");
                                    });
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                title="Carregar nova foto oficial de Vicente Dias (CEO & Founder)"
                              />
                            </>
                          )}

                          <div className="absolute bottom-4 left-4 text-left z-0 pointer-events-none">
                            <h4 className="text-sm font-bold text-white">Vicente Dias</h4>
                            <p className="text-[10px] text-blue-200 font-mono uppercase">CEO & Founder</p>
                          </div>
                        </div>

                        {isEffectiveAdmin && (
                          <div className="mt-4 flex flex-col items-center gap-2 w-full max-w-[240px]">
                            <label className="w-full cursor-pointer px-4 py-2.5 rounded-xl bg-[#172554] hover:bg-[#1a3478] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                              <span>📷</span>
                              <span>Carregar Nova Imagem</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    uploadImageToImgBB(file).then((url) => {
                                      handleUpdateCeoPhoto(url).then((persisted) => {
                                        alert(persisted
                                          ? "Foto de Vicente Dias atualizada com sucesso e sincronizada."
                                          : "Foto atualizada com sucesso.");
                                      });
                                    }).catch(() => {
                                      alert("Erro ao carregar a imagem. Tente novamente.");
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[10px] text-slate-500 font-mono text-center">
                              Apenas visível para Administradores
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description Text Area */}
                      <div className="md:col-span-7 space-y-4 text-left">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-serif text-[#172554] font-bold tracking-tight">Vicente Dias</h3>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">CEO & Founder, TARIRA Ecosystem</p>
                        </div>
                        
                        <div className="space-y-3 text-[13px] text-slate-600 leading-relaxed font-sans">
                          <p>
                            Com mais de 10 anos de experiência na coordenação de operações de backoffice e governança de processos em Moçambique, Vicente Dias construiu uma trajetória sólida em gestão de riscos operacionais e cumprimento regulatório.
                          </p>
                          <p>
                            A sua prática na liderança de equipas multifuncionais e acompanhamento de KPIs e SLAs garantiu alta qualidade em ambientes de grande escala. Na <strong className="text-[#172554] font-bold">TARIRA</strong>, traduz essa experiência corporativa em soluções ágeis, seguras e transparentes para empresas e cidadãos.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-50/70 border-l-4 border-[#172554] text-xs italic text-[#172554] leading-relaxed font-serif mt-6">
                          "A verdadeira inovação acontece quando a tecnologia encontra a realidade das pessoas. Na <strong className="font-bold text-[#172554]">TARIRA</strong>, simplificamos o dia a dia e criamos oportunidades reais para Moçambique."
                          <span className="block text-[10px] font-sans font-bold text-slate-700 not-italic mt-2.5 tracking-wider font-mono uppercase">— Vicente Dias, CEO & Founder</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side metrics panel & values */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-[#172554] uppercase tracking-wider font-mono">Pilares Fundamentais</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#172554] text-xs flex items-center justify-center flex-shrink-0 font-bold border border-blue-200">1</span>
                        <div>
                          <h4 className="text-xs font-bold text-[#172554]">Maestria Técnica</h4>
                          <p className="text-xs text-slate-600 mt-0.5">Triagem rigorosa de qualificações e formação homologada para serviços técnicos e corporativos.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#172554] text-xs flex items-center justify-center flex-shrink-0 font-bold border border-blue-200">2</span>
                        <div>
                          <h4 className="text-xs font-bold text-[#172554]">Garantia Operacional Estrita</h4>
                          <p className="text-xs text-slate-600 mt-0.5">Garantia com acompanhamento contínuo e substituição célere em caso de desalinhamento.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#172554] text-xs flex items-center justify-center flex-shrink-0 font-bold border border-blue-200">3</span>
                        <div>
                          <h4 className="text-xs font-bold text-[#172554]">Sustentabilidade Local</h4>
                          <p className="text-xs text-slate-600 mt-0.5">Valorização da mão de obra moçambicana e criação de oportunidades estruturadas de emprego.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic stats */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
                    <span className="text-4xl font-serif text-[#172554] font-extrabold">98.4%</span>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Taxa de Sucesso em Correspondência</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Processos auditados de triagem que minimizam rotações operacionais e garantem retenção de qualidade.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Sub-section 2: Careers (Talent Network / General Corporate Applications) */}
            {aboutActiveSection === "careers" && (
              <div className="space-y-8 animate-fade-up">
                
                {/* Hero / Status Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/60 border border-blue-200 shadow-xs relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#172554] text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                          <span>Talent Community • Equipa Interna</span>
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200 text-[10px] font-mono font-semibold">
                          🟡 Sem vagas imediatas • Candidaturas Espontâneas Abertas
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-serif text-[#172554] font-bold tracking-tight">
                        Faça Parte da Equipa Central da TARIRA
                      </h2>
                      
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        De momento <strong className="text-[#172554]">não temos vagas internas em aberto</strong>, mas estamos continuamente a mapear talentos de excelência para futuras contratações corporativas. Se tem paixão por operações de alto impacto, engenharia de produto, vendas B2B, conformidade ou tecnologia, submeta a sua candidatura espontânea e garanta prioridade absoluta quando novas posições forem criadas.
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-start sm:items-end justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-mono uppercase text-[#172554] font-bold tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        Banco de Talentos
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-1">
                        Comunidade Corporativa TARIRA
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        Triagem contínua & sem taxas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Canadian-Style Talent Pool 3-Step Process */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#172554] tracking-widest font-extrabold block">COMO FUNCIONA O NOSSO BANCO DE TALENTOS</span>
                    <h3 className="text-lg sm:text-xl font-serif text-[#172554] font-bold">Processo de Candidatura Espontânea para Oportunidades Futuras</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-[#172554] text-xs font-mono font-bold flex items-center justify-center">
                        01
                      </div>
                      <h4 className="text-xs font-bold text-[#172554]">Submissão do Perfil Corporativo</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Preencha os seus dados de contacto, link do LinkedIn, áreas de interesse corporativo e carregue o seu currículo atualizado.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-[#172554] text-xs font-mono font-bold flex items-center justify-center">
                        02
                      </div>
                      <h4 className="text-xs font-bold text-[#172554]">Indexação Contínua no ATS</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        A nossa equipa de People Ops analisa e indexa o seu perfil por competências e senioridade na nossa base interna de talentos.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-[#172554] text-xs font-mono font-bold flex items-center justify-center">
                        03
                      </div>
                      <h4 className="text-xs font-bold text-[#172554]">Prioridade em Novas Vagas</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Quando uma vaga corporativa interna é aberta, contactamos os candidatos da Talent Community antes de qualquer publicação pública.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Culture & Working Environment Pillars */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#172554] tracking-widest font-extrabold block">CULTURA & AMBIENTE</span>
                    <h3 className="text-lg font-serif text-[#172554] font-bold">Por que Trabalhar na Equipa Interna TARIRA?</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="text-[#172554] font-bold text-sm flex items-center gap-2">
                        <span>🇲🇿</span>
                        <span>Impacto Real</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Construa a infraestrutura de confiança operacional que gera empregos e simplifica a vida de milhares de moçambicanos.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[#172554] font-bold text-sm flex items-center gap-2">
                        <span>🚀</span>
                        <span>Meritocracia & Autonomia</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Ambiente orientado a resultados com liberdade para inovar, propor soluções e crescer rapidamente na carreira.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[#172554] font-bold text-sm flex items-center gap-2">
                        <span>🏢</span>
                        <span>Flexibilidade Híbrida</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Escritório moderno em Maputo conjugado com modelos flexíveis e remotos para garantir equilíbrio e produtividade.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[#172554] font-bold text-sm flex items-center gap-2">
                        <span>💡</span>
                        <span>Tecnologia de Ponta</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Trabalhe com Inteligência Artificial, ferramentas digitais ágeis e padrões internacionais de governança corporativa.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section: Candidatar à Equipe Interna (Formulário Unificado) - Spotlight Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#172554] text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-blue-300 tracking-widest font-extrabold block">
                          JUNTE-SE À EQUIPA CENTRAL
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[9px] font-mono text-blue-200">
                          Talent Community • Prioridade em Novas Posições
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white font-bold">
                        Candidatar à Equipe Interna da TARIRA
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                        Submeta o seu currículo em formato PDF com indicação do departamento ou função pretendida. A nossa equipa de People Operations realiza triagem e mapeamento contínuo de talentos em operações, engenharia de produto, vendas B2B, conformidade e gestão, garantindo contacto prioritário assim que surgirem oportunidades corporativas.
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
                      <button
                        onClick={() => setIsInternalApplicationModalOpen(true)}
                        className="px-6 py-3.5 rounded-2xl bg-blue-400 hover:bg-blue-300 text-white font-black text-xs sm:text-sm transition-all shadow-xl hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2.5"
                      >
                        <Briefcase className="w-4 h-4 text-slate-950" />
                        <span>Candidatar-me à Equipa Interna</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </button>
                      <span className="text-[10px] text-blue-200 text-center sm:text-right font-mono">
                        ✓ Processo 100% corporativo • Análise contínua • Confidencial • Sem taxas
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Sub-section 3: Contact Form */}
            {aboutActiveSection === "contact" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-up">
                
                {/* Visual office details info card */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-[#172554] uppercase tracking-wider font-mono">Sede Operacional & Contactos</h3>
                    
                    <div className="space-y-4 text-xs text-slate-600 font-medium">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#172554] mt-0.5 flex-shrink-0" />
                        <span>Avenida Julius Nyerere, Edifício TARIRA Towers, Maputo, Moçambique</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleOpenEmailComposer(e, socialLinks.email || "tarira.ecossistema@gmail.com", "Contacto com a Sede Operacional TARIRA")}
                        className="w-full flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-all text-left group cursor-pointer border border-transparent hover:border-slate-200"
                        title={`Clique para compor e-mail para ${socialLinks.email || "tarira.ecossistema@gmail.com"} no navegador ou cliente padrão`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Mail className="w-4 h-4 text-[#172554] mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="break-all font-mono text-[#172554] font-bold group-hover:underline">{socialLinks.email || "tarira.ecossistema@gmail.com"}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-[#172554] shrink-0 ml-2">Compor E-mail →</span>
                      </button>

                      {/* Official Phone Lines */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Linhas Telefónicas Oficiais</span>
                        <div className="flex flex-col gap-1.5 font-mono text-xs">
                          <a 
                            href={`tel:+${(socialLinks.phone1 || "+258 87 142 5316").replace(/[^\d]/g, "")}`} 
                            className="flex items-center justify-between text-[#172554] hover:underline font-bold"
                          >
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-blue-600" />
                              {socialLinks.phone1 || "+258 87 142 5316"}
                            </span>
                            <span className="text-[10px] font-sans font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">Operações & Piquete</span>
                          </a>
                          <a 
                            href={`tel:+${(socialLinks.phone2 || "+258 83 536 1379").replace(/[^\d]/g, "")}`} 
                            className="flex items-center justify-between text-[#172554] hover:underline font-bold"
                          >
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-blue-600" />
                              {socialLinks.phone2 || "+258 83 536 1379"}
                            </span>
                            <span className="text-[10px] font-sans font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">Direção Comercial</span>
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-[#172554] mt-0.5 flex-shrink-0" />
                        <span>Segunda a Sexta-feira: 08:00 – 17:30<br/>Sábado (Emergências): 09:00 – 13:00</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-blue-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-blue-700">💼 LinkedIn Oficial TARIRA</h4>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded-full uppercase">Rede Profissional</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Acompanhe as nossas novidades de ecossistema, vagas em aberto e artigos corporativos:
                    </p>
                    <a 
                      href={socialLinks.linkedin || "https://www.linkedin.com/in/tarira-ecossistema"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>Visitar Perfil no LinkedIn</span>
                      <span>→</span>
                    </a>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-[#172554]">💬 Atendimento Corporativo WhatsApp</h4>
                      <span className="text-[10px] bg-blue-50 text-[#172554] border border-blue-200 font-bold px-2 py-0.5 rounded-full uppercase">Canal Oficial</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Atendimento comercial, triagem de recrutamento e orçamentos imediatos via canais oficiais TARIRA:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a 
                        href={`https://wa.me/${(socialLinks.phone1 || "+258 87 142 5316").replace(/[^\d]/g, "")}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="py-2.5 px-3 bg-[#172554] hover:bg-[#1a3478] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{socialLinks.phone1 || "+258 87 142 5316"}</span>
                      </a>
                      <a 
                        href={`https://wa.me/${(socialLinks.phone2 || "+258 83 536 1379").replace(/[^\d]/g, "")}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-[#172554] border border-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>{socialLinks.phone2 || "+258 83 536 1379"}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact submission form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("A sua mensagem foi transmitida com sucesso para a central de triagem da TARIRA. Um de nossos assessores operacionais entrará em contacto em menos de 24 horas. Obrigado pela sua confiança!");
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <h3 className="text-sm font-bold text-[#172554] uppercase tracking-wider font-mono">Formulário de Contacto Rápido</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700 uppercase font-mono font-bold">Nome Completo</label>
                      <input required type="text" placeholder="" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#172554] focus:bg-white font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700 uppercase font-mono font-bold">Email Corporativo</label>
                      <input required type="email" placeholder="" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#172554] focus:bg-white font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700 uppercase font-mono font-bold">Telefone / WhatsApp</label>
                      <input type="text" placeholder="" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#172554] focus:bg-white font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700 uppercase font-mono font-bold">Assunto de Contacto</label>
                      <select required className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#172554] focus:bg-white font-medium">
                        <option value="corporate">Contratar Talento Elite (IA / Tech)</option>
                        <option value="trades">Manutenção Técnica / Ofícios Residencial</option>
                        <option value="partnership">Parceria Estratégica TARIRA Ecosystem</option>
                        <option value="support">Dúvidas, Reclamações & Suporte Técnico</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-700 uppercase font-mono font-bold">Como podemos ajudar o seu negócio?</label>
                    <textarea required rows={4} placeholder="" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#172554] focus:bg-white font-medium resize-none" />
                  </div>

                  <button type="submit" className="w-full py-3.5 rounded-xl bg-[#172554] hover:bg-[#1a3478] text-white font-bold text-xs transition-all text-center uppercase tracking-wider font-mono cursor-pointer shadow-md">
                    Enviar Mensagem de Confiança ✓
                  </button>
                </form>

              </div>
            )}

          </div>
        )}

        {/* ════════════════════════ LOGIN & REGISTER SCREEN ════════════════════════ */}
        {activeTab === "login" && (
          <div id="s-login" className="flex-1 bg-slate-950 min-h-[85vh] w-full py-10 px-4 animate-fade-up">
            <AuthPage
              initialMode={loginMode}
              initialRole={loginRole === "company" ? "empresa" : loginRole === "condo" ? "condominio" : loginRole === "provider" ? "prestador" : "lar"}
              guestGateReason={guestGateReason}
              onNavigate={(tab) => setActiveTab(tab as any)}
              onUserChange={(user, profile, linkedRecord) => {
                if (!user && !profile) {
                  handleSignOut();
                  return;
                }
                setSupabaseUser(user);
                setSupabaseProfile(profile);
                const uEmail = (user?.email || profile?.email || "").toLowerCase();
                const isAdm = Boolean(
                  uEmail === "tariraecossystem@gmail.com" ||
                  uEmail === "tarira.ecossistema@gmail.com" ||
                  uEmail === "diasexpress3@gmail.com" ||
                  uEmail.includes("tarira") ||
                  profile?.role === "admin" ||
                  user?.user_metadata?.role === "admin"
                );
                let matchClient: any = null;
                let matchProf: any = null;
                if (isAdm) {
                  setIsAdminLoggedIn(true);
                  setActiveTab("admin");
                } else if (profile?.role === "empresa" || profile?.role === "lar" || profile?.role === "condominio") {
                  setIsAdminLoggedIn(false);
                  matchClient = linkedRecord || clients.find(c => c.email === profile?.email || c.id === profile?.client_id) || {
                    id: profile?.client_id || profile?.id || 'client-' + Date.now(),
                    name: profile?.name || user?.user_metadata?.full_name || 'Minha Conta',
                    type: (profile?.role === 'condominio' ? 'condo' : profile?.role === 'lar' ? 'residential' : 'company') as any,
                    email: profile?.email || user?.email || '',
                    phone: profile?.phone || '',
                  };
                  setSelectedClient(matchClient);
                  setActiveTab("company");
                } else if (profile?.role === "prestador" || profile?.role === "profissional") {
                  setIsAdminLoggedIn(false);
                  matchProf = linkedRecord || candidates.find(c => c.email === profile?.email || c.id === profile?.candidate_id) || {
                    id: profile?.candidate_id || profile?.id || 'cand-' + Date.now(),
                    name: profile?.name || user?.user_metadata?.full_name || 'Prestador TARIRA',
                    email: profile?.email || user?.email || '',
                    phone: profile?.phone || '+258 84 000 0000',
                    category: profile?.category || 'Instalação Solar & Energia',
                    status: 'approved',
                    rating: 4.9,
                    completedJobs: 18,
                    matchScore: 98,
                    isProfessional: profile?.role === "profissional"
                  };
                  setSelectedProfessional(matchProf);
                  setActiveTab("professional_profile");
                }
                try {
                  localStorage.setItem("tarira_authenticated_session", JSON.stringify({
                    user,
                    profile,
                    isAdmin: isAdm,
                    client: matchClient,
                    professional: matchProf,
                    timestamp: Date.now()
                  }));
                } catch (e) {}
              }}
              onClose={() => setActiveTab("landing")}
            />
          </div>
        )}

        {false && activeTab === "login_old" && (
          <div id="s-login" className="flex-1 bg-slate-50 min-h-[85vh] w-full py-10 px-4 flex justify-center items-center text-left animate-fade-up">
            <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-slate-900">
              
              {/* Header */}
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300 uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                  <span>🔑</span> AUTENTICAÇÃO E REGISTO DE CONTA
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 font-bold">
                  Consola de Acesso Tarira
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
                  Inicie sessão na sua conta ou crie um novo registo para aceder aos ecossistemas de serviços, gestão de pedidos e portais dedicados.
                </p>
              </div>

              {/* Mode Switcher Tabs (Iniciar Sessão / Criar Conta) */}
              <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  id="tab-signin-mode"
                  onClick={() => setLoginMode("signin")}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                    loginMode === "signin"
                      ? "bg-blue-500 text-white shadow-md font-black"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  🔑 Iniciar Sessão
                </button>
                <button
                  type="button"
                  id="tab-signup-mode"
                  onClick={() => setLoginMode("signup")}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                    loginMode === "signup"
                      ? "bg-blue-500 text-white shadow-md font-black"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  ✨ Criar Nova Conta
                </button>
              </div>

              {/* Role Selector Buttons */}
              <div className="space-y-2">
                <label className="block text-slate-800 font-mono text-[11px] uppercase font-bold tracking-wider">
                  Selecione o Tipo de Perfil / Conta:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLoginRole("company")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      loginRole === "company"
                        ? "bg-blue-50 border-2 border-blue-500 text-blue-950 font-black shadow-sm"
                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                    }`}
                  >
                    <span className="block text-xs font-bold">🏢 Empresa</span>
                    <span className="block text-[10px] text-slate-500">B2B / Corporativo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginRole("residential")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      loginRole === "residential"
                        ? "bg-blue-50 border-2 border-blue-500 text-blue-950 font-black shadow-sm"
                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                    }`}
                  >
                    <span className="block text-xs font-bold">🏠 Lar</span>
                    <span className="block text-[10px] text-slate-500">Residencial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginRole("condo")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      loginRole === "condo"
                        ? "bg-blue-50 border-2 border-blue-500 text-blue-950 font-black shadow-sm"
                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                    }`}
                  >
                    <span className="block text-xs font-bold">🏛️ Condomínio</span>
                    <span className="block text-[10px] text-slate-500">Gestão Predial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginRole("provider")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      loginRole === "provider"
                        ? "bg-blue-50 border-2 border-blue-500 text-blue-950 font-black shadow-sm"
                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                    }`}
                  >
                    <span className="block text-xs font-bold">👷 Técnico de Ofício</span>
                    <span className="block text-[10px] text-slate-500">Ofícios & Serviços Técnicos</span>
                  </button>
                </div>
              </div>

              {/* Form Content Panel */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">

                {/* SIGN IN FORM */}
                {loginMode === "signin" && (
                  <div className="space-y-4">
                    {/* Full Name Input */}
                    <div>
                      <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1.5">
                        Nome Completo com que se registou
                      </label>
                      <input 
                        type="text" 
                        id="login-fullname-input"
                        placeholder=""
                        autoComplete="off"
                        value={loginFullName}
                        onChange={(e) => setLoginFullName(e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm font-mono"
                      />
                    </div>

                    {/* Contact (Phone) or Email and Password Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1.5">
                          Contacto (Telefone/WhatsApp) ou E-mail
                        </label>
                        <input 
                          type="text" 
                          id="login-email-input"
                          placeholder=""
                          autoComplete="off"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1.5">
                          Palavra-Passe
                        </label>
                        <input 
                          type="password" 
                          id="login-password-input"
                          placeholder=""
                          autoComplete="off"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono shadow-sm"
                        />
                      </div>
                    </div>

                    <button 
                      id="btn-submit-login"
                      onClick={() => {
                        const termName = loginFullName.trim().toLowerCase();
                        const termContact = loginEmail.trim().toLowerCase();

                        // NOTA DE SEGURANÇA: este formulário identifica a conta pelo
                        // email/telefone e nome exactos — ainda NÃO é uma autenticação
                        // real com password verificada (ver aviso enviado ao administrador
                        // sobre migrar para o Supabase Auth). Por isso é essencial que,
                        // sem uma correspondência exacta, o acesso seja recusado — nunca
                        // deve abrir automaticamente a conta de outra pessoa.
                        if (!termContact) {
                          alert("Por favor, insira o email ou o número de telefone associado à sua conta.");
                          return;
                        }

                        if (loginRole === "provider") {
                          const found = candidates.find(c => {
                            const matchesContact = (c.phone && c.phone.toLowerCase().includes(termContact)) || (c.email && c.email.toLowerCase().includes(termContact));
                            if (!matchesContact) return false;
                            if (!termName) return true;
                            const full = `${c.name} ${c.surname || ''}`.toLowerCase();
                            return full.includes(termName) || termName.includes(c.name.toLowerCase());
                          });

                          if (!found) {
                            alert("Não encontrámos nenhuma conta de técnico de ofício com esse email/telefone e nome. Verifique os dados ou registe-se primeiro.");
                            return;
                          }

                          setSelectedProfessional(found);
                          setActiveTab("professional_profile");
                        } else {
                          const found = clients.find(c => {
                            const matchesType = loginRole === "company" ? c.type === "company" : loginRole === "residential" ? c.type === "residential" : c.type === "condo";
                            if (!matchesType) return false;
                            const matchesContact = (c.phone && c.phone.toLowerCase().includes(termContact)) || (c.email && c.email.toLowerCase().includes(termContact));
                            if (!matchesContact) return false;
                            if (!termName) return true;
                            return c.name.toLowerCase().includes(termName);
                          });

                          if (!found) {
                            alert("Não encontrámos nenhuma conta com esse email/telefone e nome. Verifique os dados ou registe-se primeiro.");
                            return;
                          }

                          setSelectedClient(found);
                          setActiveTab("company");
                        }
                      }}
                      className="w-full py-4 mt-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex justify-center items-center gap-2 shadow-lg hover:scale-[1.005] active:scale-[0.995]"
                    >
                      <span>Entrar na Consola de {loginRole === "provider" ? "Técnico de Ofício" : loginRole === "company" ? "Empresa" : loginRole === "residential" ? "Lar" : "Condomínio"} 🚀</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* SIGN UP FORM */}
                {loginMode === "signup" && (
                  <div>
                    {loginRole === "provider" ? (
                      /* Provider Registration Form */
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">Nome Completo</label>
                            <input 
                              type="text" 
                              id="reg-provider-name"
                              placeholder=""
                              value={registerProviderName}
                              onChange={(e) => setRegisterProviderName(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">Categoria Principal</label>
                            <select 
                              id="reg-provider-spec"
                              value={registerProviderCategory}
                              onChange={(e) => setRegisterProviderCategory(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 rounded-xl p-3 text-xs font-semibold outline-none cursor-pointer shadow-sm"
                            >
                              <option value="dom">🧹 Serviços Domésticos</option>
                              <option value="limp">✨ Limpeza Especializada</option>
                              <option value="man">🔧 Manutenção & Reparações</option>
                              <option value="carp">🪚 Carpintaria & Marcenaria</option>
                              <option value="obra">🧱 Construção & Obras</option>
                              <option value="jard">🌿 Jardinagem & Exteriores</option>
                              <option value="tech">⚡ Elite Tech</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">Telefone / WhatsApp</label>
                            <input 
                              type="text" 
                              id="reg-provider-phone"
                              placeholder=""
                              value={registerProviderPhone}
                              onChange={(e) => setRegisterProviderPhone(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">Cidade / Residência</label>
                            <input 
                              type="text"
                              id="reg-provider-city"
                              placeholder=""
                              value={registerProviderResidence}
                              onChange={(e) => setRegisterProviderResidence(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] tracking-wider text-emerald-700 uppercase font-mono font-bold block mb-1">
                              Valor por Intervenção / Diária (MZN) *
                            </label>
                            <input 
                              type="number" 
                              min={0}
                              id="reg-provider-rate"
                              placeholder="Ex: 1500"
                              value={registerProviderRate || ''}
                              onChange={(e) => setRegisterProviderRate(Number(e.target.value))}
                              className="w-full bg-white border-2 border-emerald-400 focus:border-emerald-600 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-bold outline-none shadow-sm font-mono"
                            />
                            <span className="text-[9px] text-emerald-700 block mt-0.5 font-medium">Tarifa por serviço / diária</span>
                          </div>
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">Breve Descrição de Experiência</label>
                            <input 
                              type="text" 
                              id="reg-provider-bio"
                              placeholder="Ex: 5 anos de obras e reparações"
                              value={registerProviderBio}
                              onChange={(e) => setRegisterProviderBio(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">
                              BI / NUIT <span className="text-blue-600 font-normal lowercase">(Opcional)</span>
                            </label>
                            <input 
                              type="text" 
                              id="reg-provider-bi"
                              placeholder="Número do documento"
                              value={registerProviderBI}
                              onChange={(e) => setRegisterProviderBI(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm"
                            />
                            <span className="text-[9px] text-slate-500 block mt-0.5">
                              💡 Pode fornecer a posteriori.
                            </span>
                          </div>
                        </div>

                        <button 
                          id="btn-register-provider"
                          onClick={async () => {
                            if (!registerProviderName || !registerProviderPhone) {
                              alert("Por favor, preencha o Nome e o Telefone para registar o técnico de ofício.");
                              return;
                            }
                            try {
                              const res = await fetch("/api/candidates", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  name: registerProviderName,
                                  surname: "Técnico",
                                  role: registerProviderCategory,
                                  experienceYears: 3,
                                  rating: 5.0,
                                  dailyRate: Number(registerProviderRate) || 1500,
                                  rateMzn: Number(registerProviderRate) || 1500,
                                  hourlyRate: Math.round((Number(registerProviderRate) || 1500) / 8),
                                  status: "approved",
                                  category: registerProviderCategory,
                                  city: registerProviderResidence || "Maputo",
                                  biNumber: registerProviderBI,
                                  phone: registerProviderPhone,
                                  bio: registerProviderBio || "Técnico de ofício qualificado do ecossistema TARIRA."
                                })
                              });
                              if (res.ok) {
                                const newCand = await res.json();
                                await fetchBackendData();
                                setSelectedProfessional(newCand);
                                setNewlyRegisteredProvider(newCand);
                                setPortfolioBioInput(registerProviderBio || "");
                                setPortfolioImagesList([]);
                                setPortfolioImageUrlInput("");
                                setPortfolioWebsiteInput("");
                                setPortfolioSkillsInput("");
                                setIsPortfolioSetupModalOpen(true);
                                
                                setRegisterProviderName("");
                                setRegisterProviderPhone("");
                                setRegisterProviderBio("");
                                setRegisterProviderBI("");
                              } else {
                                const err = await res.json();
                                alert(`Erro ao registar: ${err.error}`);
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="w-full py-4 mt-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex justify-center items-center gap-2 shadow-md hover:scale-[1.005] active:scale-[0.995]"
                        >
                          <span>Criar Conta no TARIRA Connect ⚡ (Valor por Intervenção Diária)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Client Registration Form (Empresa / Lar / Condomínio) */
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">
                              {loginRole === "company" ? "Razão Social / Nome da Empresa" : "Nome do Proprietário / Titular"}
                            </label>
                            <input 
                              type="text" 
                              id="reg-client-name"
                              placeholder={loginRole === "company" ? "Ex: Mozambique Logistics S.A." : "Ex: Manuel Cossa"}
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">E-mail Corporativo / Pessoal</label>
                            <input 
                              type="email" 
                              id="reg-client-email"
                              placeholder="contacto@empresa.co.mz"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">Telemóvel de Contacto</label>
                            <input 
                              type="text" 
                              id="reg-client-phone"
                              placeholder="+258 84 999 0000"
                              value={registerPhone}
                              onChange={(e) => setRegisterPhone(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">
                              Documento BI / NUIT / Registo <span className="text-blue-600 font-normal lowercase">(Opcional - Pode fornecer a posteriori)</span>
                            </label>
                            <input 
                              type="text" 
                              id="reg-client-bi"
                              placeholder="NUIT nº 400123456 (Opcional)"
                              value={registerBI}
                              onChange={(e) => setRegisterBI(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm font-mono"
                            />
                            <span className="text-[9.5px] text-slate-500 block mt-1">
                              💡 O fornecimento de BI/NUIT nesta fase é opcional. Entraremos em contacto para solicitar e validar os dados posteriormente.
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">Endereço Detalhado (Sede / Localização)</label>
                          <input 
                            type="text" 
                            id="reg-client-address"
                            placeholder="Av. Julius Nyerere, Edifício Zenith, Maputo"
                            value={registerAddress}
                            onChange={(e) => setRegisterAddress(e.target.value)}
                            className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm"
                          />
                        </div>

                        {loginRole === "company" && (
                          <div>
                            <label className="text-[10px] tracking-wider text-slate-700 uppercase font-mono font-bold block mb-1">LinkedIn Corporativo (Opcional)</label>
                            <input 
                              type="text" 
                              id="reg-client-linkedin"
                              placeholder="https://linkedin.com/company/..."
                              value={registerLinkedin}
                              onChange={(e) => setRegisterLinkedin(e.target.value)}
                              className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 placeholder-slate-400 rounded-xl p-3 text-xs font-semibold outline-none shadow-sm font-mono"
                            />
                          </div>
                        )}

                        <button 
                          id="btn-register-client"
                          onClick={async () => {
                            if (!registerName || !registerPhone || !registerAddress) {
                              alert("Por favor, preencha os campos obrigatórios (Nome, Telefone e Endereço Detalhado)");
                              return;
                            }
                            try {
                              const res = await fetch("/api/clients", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  name: registerName,
                                  type: loginRole === "residential" ? "residential" : loginRole === "condo" ? "condo" : "company",
                                  email: registerEmail,
                                  phone: registerPhone,
                                  address: registerAddress,
                                  bi: registerBI,
                                  linkedin: loginRole === "company" ? registerLinkedin : ""
                                })
                              });
                              if (res.ok) {
                                const newClientObj = await res.json();
                                alert(`Conta de ${loginRole === "company" ? "Empresa" : loginRole === "residential" ? "Lar" : "Condomínio"} Criada com Sucesso!\n\nSeja bem-vindo, ${registerName}!\nA sua conta já está integrada no painel de controlo de contas.`);
                                
                                // Reset state inputs
                                setRegisterName("");
                                setRegisterEmail("");
                                setRegisterPhone("");
                                setRegisterAddress("");
                                setRegisterBI("");
                                setRegisterLinkedin("");
                                
                                // Refresh, log and login
                                await fetchBackendData();
                                setSelectedClient(newClientObj);
                                setActiveTab("company");
                              } else {
                                const err = await res.json();
                                alert(`Erro ao registar: ${err.error}`);
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="w-full py-4 mt-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex justify-center items-center gap-2 shadow-md hover:scale-[1.005] active:scale-[0.995]"
                        >
                          <span>Criar Conta de {loginRole === "company" ? "Empresa" : loginRole === "residential" ? "Lar" : "Condomínio"} ⚡</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-500 text-center mt-6 font-medium leading-relaxed">
                🔒 Encriptação ponta-a-ponta · Monitorização proactiva TARIRA · Ligação segura TLS 1.3
              </p>

              {/* Discrete Admin Access Button inside Login screen
                  OCULTO DE PROPÓSITO: este botão dava acesso total de
                  Administrador com um único clique, sem pedir nenhuma
                  credencial. Está escondido com "false &&" em vez de
                  removido, a pedido do utilizador — o código fica exactamente
                  como estava, só deixa de poder ser renderizado ou clicado,
                  mesmo que o modal de login (SupabaseAuthModal) que hoje o
                  tapa venha a mudar no futuro. O acesso real de Administrador
                  passou a ser feito pela zona "Acesso Administrativo TARIRA"
                  no fundo do formulário de login novo, com password real
                  verificada pelo Supabase Auth. */}
              {false && (
              <div className="pt-4 border-t border-slate-200/60 flex justify-center">
                <button 
                  type="button"
                  id="login-page-admin-access"
                  onClick={() => {
                    setIsAdminLoggedIn(true);
                    setIsTestAccountsModalOpen(true);
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-medium transition-all cursor-pointer flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100"
                  title={currentLang === "pt" ? "Acesso exclusivo de Administrador" : "Exclusive Administrator access"}
                >
                  <span className="opacity-60">🛡️</span>
                  <span>{currentLang === "pt" ? "Aceder como Administrador" : "Access as Administrator"}</span>
                </button>
              </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════ CLIENT & REQUESTS PANEL (DASHBOARD) ════════════════════════ */}
        {activeTab === "company" && (
          <div id="s-company" className="flex-1 flex flex-col md:flex-row animate-fade-up">
            
            {/* Sidebar menu block */}
            <aside className="w-full md:w-64 bg-deep border-r border-gold/8 flex flex-col p-4 flex-shrink-0">
              <div className="px-3 py-2.5 border-b border-gold/8 mb-6 flex items-center gap-2">
                <Building className="w-4 h-4 text-gold" />
                <div>
                  <span className="text-xs font-bold text-ivory uppercase block leading-none">PAINEL DO CLIENTE</span>
                  <span className="text-[9px] text-slate-500 tracking-wider">Gestão & Histórico de Pedidos</span>
                </div>
              </div>

              {/* SIMULADOR DE CONTA — visível apenas para Administradores.
                  Antes, este seletor aparecia para QUALQUER conta autenticada
                  (Empresa, Condomínio ou Lar) e permitia trocar livremente
                  para o painel de outro cliente real só escolhendo-o na
                  lista — ou seja, qualquer Empresa/Condomínio conseguia abrir
                  o painel (pedidos, pagamentos, colaboradores) de outra
                  Empresa/Condomínio/Lar real. É a mesma classe de bug da
                  "troca de perfis" já corrigida para o técnico, mas mais
                  grave por expor dados de terceiros. Passa a só renderizar
                  para isEffectiveAdmin; uma conta real nunca a vê nem pode
                  alterar o selectedClient para outra conta. */}
              {isEffectiveAdmin && (
              <div className="bg-night/45 p-4 rounded-xl border border-gold/10 mb-6">
                <span className="text-[9px] text-gold font-bold uppercase tracking-wider block mb-2">Simular Cliente / Conta (Admin)</span>
                {clients.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">Nenhum cliente registado no Admin. Por favor, registe um cliente no separador Admin primeiro.</p>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[8px] tracking-widest text-slate-500 uppercase block font-bold">Seleccione Conta Activa</label>
                    <select
                      value={selectedClient?.id || ""}
                      onChange={(e) => {
                        const cl = clients.find(c => c.id === e.target.value);
                        if (cl) setSelectedClient(cl);
                      }}
                      className="w-full bg-night border border-gold/12 text-ivory rounded-lg p-2 text-[11px] outline-none cursor-pointer"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.type === "residential" || c.type === "individual" 
                            ? `🏠 Lar: ${c.name}` 
                            : c.type === "company" 
                            ? `🏢 Empresa: ${c.name}` 
                            : c.type === "condo" 
                            ? `🏘️ Condomínio: ${c.name}` 
                            : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              )}

              {/* VIEW LIMITATION MODE TOGGLER — também restrito ao Admin,
                  pelo mesmo motivo acima; uma conta real (Empresa,
                  Condomínio ou Lar) fica sempre em modo "Cliente" (a
                  variável viewAsClient já nasce como true por omissão) e
                  vê apenas o cartão informativo da sua própria conta. */}
              {isEffectiveAdmin && selectedClient?.type !== "residential" && selectedClient?.type !== "individual" ? (
                <div className="bg-night/45 p-4 rounded-xl border border-gold/10 mb-6 space-y-2">
                  <span className="text-[9px] text-gold font-bold uppercase tracking-wider block">Controle de Visualização</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Defina o modo de acesso para testar a limitação de informações vista pelo cliente final:
                  </p>
                  <div className="grid grid-cols-2 gap-1 bg-night p-1 rounded-lg border border-gold/5">
                    <button
                      onClick={() => setViewAsClient(false)}
                      className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                        !viewAsClient ? "bg-gold text-night" : "text-slate-500 hover:text-ivory"
                      }`}
                      title="Acesso ilimitado de Administrador"
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => setViewAsClient(true)}
                      className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                        viewAsClient ? "bg-gold text-night" : "text-slate-500 hover:text-ivory"
                      }`}
                      title="Acesso limitado de Cliente"
                    >
                      Cliente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-night/45 p-3.5 rounded-xl border border-emerald-500/20 mb-6">
                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block mb-1">
                    {selectedClient?.type === "company" ? "Perfil da Empresa" : selectedClient?.type === "condo" ? "Perfil do Condomínio" : "Perfil do Lar / Residencial"}
                  </span>
                  <p className="text-[10px] text-mist/60 leading-relaxed">
                    Acesso exclusivo de <strong>{selectedClient?.type === "company" ? "Titular da Empresa" : selectedClient?.type === "condo" ? "Gestor do Condomínio" : "Cliente / Titular do Lar"}</strong>. A gestão administrativa é centralizada pela plataforma TARIRA.
                  </p>
                </div>
              )}

              {/* Sidebar Navigation Info */}
              <div className="space-y-4 pt-4 border-t border-gold/8 mt-auto">
                <div className="px-3">
                  <span className="text-[9px] tracking-widest text-slate-500 uppercase font-bold block">Status do Acesso</span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`w-2 h-2 rounded-full ${viewAsClient ? "bg-gold animate-pulse" : "bg-sage animate-pulse"}`}></span>
                    <span className="text-[10px] font-bold text-ivory font-mono uppercase">
                      {selectedClient?.type === "residential" || selectedClient?.type === "individual" 
                        ? "Acesso Cliente (Lar)" 
                        : (viewAsClient ? "Vista Limitada" : "Vista Total Admin")}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Dashboard Workspace */}
            <div className="flex-1 overflow-auto p-6 sm:p-8">
              
              {!selectedClient ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <Building className="w-12 h-12 text-slate-500 mb-4 animate-pulse" />
                  <h3 className="font-serif text-2xl text-gold font-light mb-1">Nenhum cliente activo seleccionado</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-6">
                    Para visualizar e gerir o painel de pedidos do cliente, adicione ou active um cliente/empresa no separador **Admin** ou use o simulador lateral.
                  </p>
                </div>
              ) : (
                <div className="space-y-8 font-sans">
                  
                  {/* Header Title Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-blue-700 font-extrabold leading-none uppercase tracking-wider font-mono">
                          CONTA: {selectedClient.type === "residential" || selectedClient.type === "individual" 
                            ? "LAR (CLIENTE)" 
                            : selectedClient.type === "company" 
                            ? "EMPRESA (B2B)" 
                            : selectedClient.type === "condo" 
                            ? "CONDOMÍNIO" 
                            : "CLIENTE"}
                        </span>
                        <span className="bg-blue-500/20 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/40 font-mono">
                          ID: {selectedClient.id}
                        </span>
                        {(selectedClient.type === "company" || selectedClient.type === "condo") && selectedClient.planStatus === "trial" && (
                          <span className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                            🎁 Grátis até {selectedClient.trialEndsAt ? new Date(selectedClient.trialEndsAt).toLocaleDateString("pt-PT") : "30 dias após registo"}
                          </span>
                        )}
                        {(selectedClient.type === "company" || selectedClient.type === "condo") && selectedClient.planStatus === "pending" && (
                          <button
                            onClick={() => {
                              setPaymentCheckoutData({
                                serviceTitle: `Manutenção de Conta TARIRA — ${selectedClient.type === "condo" ? "Condomínio" : "Empresa"}`,
                                amount: selectedClient.planPriceMzn || 0
                              });
                              setIsPaymentCheckoutModalOpen(true);
                            }}
                            className="bg-amber-500/15 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 font-mono cursor-pointer hover:bg-amber-500/25 transition-all"
                            title="Concluir o pagamento manual da manutenção da conta"
                          >
                            💳 Pagamento Pendente — Activar
                          </button>
                        )}
                      </div>
                      <h1 className="font-serif text-3xl font-bold tracking-tight text-[#172554] mt-1 flex flex-wrap items-center gap-2">
                        <span>
                          {selectedClient.type === "residential" || selectedClient.type === "individual" ? (
                            <>Painel do Lar: <span className="text-blue-700">{selectedClient.name}</span></>
                          ) : selectedClient.type === "company" ? (
                            <>Painel da Empresa: <span className="text-blue-700">{selectedClient.name}</span></>
                          ) : selectedClient.type === "condo" ? (
                            <>Painel do Condomínio: <span className="text-blue-700">{selectedClient.name}</span></>
                          ) : (
                            <>Painel do Cliente: <span className="text-blue-700">{selectedClient.name}</span></>
                          )}
                        </span>
                      </h1>
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 flex-wrap">
                      {/* Active Company Operator Status Badge — reflete os operadores reais
                          atribuídos a ESTA conta (orgOperators filtrado por orgId/orgName),
                          a mesma lista gerida no Painel Central/Admin em "Auditoria & Operadores".
                          Assim que um operador for atribuído por lá, aparece aqui automaticamente
                          (mesmo estado partilhado — sem nomes fictícios de teste). */}
                      {(() => {
                        const clientOperators = orgOperators.filter(
                          op => op.orgName === selectedClient.name || op.orgId === selectedClient.id
                        );
                        const accountOperator = clientOperators.find(
                          op => /operador|gestor|responsável/i.test(op.role)
                        ) || clientOperators[0];
                        const qualityAuditor = clientOperators.find(op => /auditor/i.test(op.role));

                        return (
                          <>
                            {accountOperator ? (
                              <div className="px-3.5 py-2 rounded-xl bg-white text-[#172554] border border-blue-500/30 flex items-center gap-2.5 shadow-md">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                                <div>
                                  <span className="text-[8px] text-slate-500 font-mono font-bold uppercase block leading-none">OPERADOR DA CONTA</span>
                                  <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                                    {accountOperator.avatar || "👨‍🔧"} {accountOperator.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => setClientActiveTab("operators")}
                                  className="ml-1 text-[10px] font-bold text-blue-700 hover:text-white bg-blue-500/20 hover:bg-blue-500/30 px-2.5 py-1 rounded-lg border border-blue-500/30 cursor-pointer transition-all whitespace-nowrap"
                                  title="Ver operadores da empresa"
                                >
                                  Operadores
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setClientActiveTab("operators")}
                                className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-dashed border-amber-400/60 flex items-center gap-2.5 shadow-sm cursor-pointer hover:bg-amber-100 transition-all"
                                title="Ainda não há um operador de conta atribuído a este cliente"
                              >
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                                <div className="text-left">
                                  <span className="text-[8px] font-mono font-bold uppercase block leading-none">OPERADOR DA CONTA</span>
                                  <span className="text-xs font-bold">Nenhum atribuído — Ativar Operador</span>
                                </div>
                              </button>
                            )}

                            {qualityAuditor ? (
                              <div
                                onClick={() => setClientActiveTab("operators")}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 via-blue-50 to-white text-[#172554] border border-blue-500/40 flex items-center gap-2.5 shadow-md cursor-pointer hover:border-blue-400 transition-all"
                                title="Auditoria de qualidade e conformidade licenciada pela TARIRA (supervisão passiva, sem encargo)"
                              >
                                <span className="text-xl">{qualityAuditor.avatar || "👩‍💼"}</span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] text-blue-700 font-mono font-bold uppercase block leading-none">AUDITOR DE QUALIDADE (LICENCIADO TARIRA)</span>
                                    <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 font-mono font-bold border border-emerald-500/30">Taxa 0 MT</span>
                                  </div>
                                  <span className="text-xs font-bold text-[#172554] flex items-center gap-1">
                                    {qualityAuditor.name} <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">• Supervisão Passiva</span>
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setClientActiveTab("operators")}
                                className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-dashed border-amber-400/60 flex items-center gap-2.5 shadow-sm cursor-pointer hover:bg-amber-100 transition-all"
                                title="Ainda não há um auditor de qualidade atribuído a este cliente"
                              >
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                                <div className="text-left">
                                  <span className="text-[8px] font-mono font-bold uppercase block leading-none">AUDITOR DE QUALIDADE</span>
                                  <span className="text-xs font-bold">Nenhum atribuído — Ativar Auditor</span>
                                </div>
                              </button>
                            )}
                          </>
                        );
                      })()}

                      <button 
                        onClick={() => setIsServiceSelectionModalOpen(true)} 
                        className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] whitespace-nowrap"
                      >
                        + Solicitar Novo Serviço ⚡
                      </button>
                    </div>
                  </div>

                  {/* Client Sub-Tab Navigation Bar */}
                  <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setClientActiveTab("hub")}
                      className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer rounded-xl border ${
                        clientActiveTab === "hub"
                          ? "bg-blue-500 text-white border-blue-400 shadow-md font-black"
                          : "bg-white text-slate-200 hover:bg-slate-50 hover:text-[#172554] border-blue-500/20 shadow-sm"
                      }`}
                    >
                      <span className="text-sm">🏢</span>
                      <span>Capa de Interação & Unidades</span>
                      {selectedClient?.planName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-blue-700 font-mono border border-blue-500/30">
                          {selectedClient.planName}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setClientActiveTab("colaboradores")}
                      className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer rounded-xl border ${
                        clientActiveTab === "colaboradores"
                          ? "bg-blue-500 text-white border-blue-400 shadow-md font-black"
                          : "bg-white text-slate-200 hover:bg-slate-50 hover:text-[#172554] border-blue-500/20 shadow-sm"
                      }`}
                    >
                      👥 Colaboradores & Contratos (Ativos / Desativos)
                    </button>
                    <button
                      onClick={() => setClientActiveTab("pedidos")}
                      className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer rounded-xl border ${
                        clientActiveTab === "pedidos"
                          ? "bg-blue-500 text-white border-blue-400 shadow-md font-black"
                          : "bg-white text-slate-200 hover:bg-slate-50 hover:text-[#172554] border-blue-500/20 shadow-sm"
                      }`}
                    >
                      📋 Pedidos & Contratações
                    </button>
                    <button
                      onClick={() => setClientActiveTab("analytics")}
                      className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer rounded-xl border ${
                        clientActiveTab === "analytics"
                          ? "bg-blue-500 text-white border-blue-400 shadow-md font-black"
                          : "bg-white text-slate-200 hover:bg-slate-50 hover:text-[#172554] border-blue-500/20 shadow-sm"
                      }`}
                    >
                      📊 Analytics do Cliente
                    </button>
                    <button
                      onClick={() => setClientActiveTab("airflow")}
                      className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer rounded-xl border ${
                        clientActiveTab === "airflow"
                          ? "bg-blue-500 text-white border-blue-400 shadow-md font-black"
                          : "bg-white text-slate-200 hover:bg-slate-50 hover:text-[#172554] border-blue-500/20 shadow-sm"
                      }`}
                    >
                      🗺️ Airflow (Hiring Flow)
                    </button>
                    <button
                      onClick={() => setClientActiveTab("sla")}
                      className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer rounded-xl border ${
                        clientActiveTab === "sla"
                          ? "bg-blue-500 text-white border-blue-400 shadow-md font-black"
                          : "bg-white text-slate-200 hover:bg-slate-50 hover:text-[#172554] border-blue-500/20 shadow-sm"
                      }`}
                    >
                      💬 SLA & Feedback Físico
                    </button>
                    <button
                      onClick={() => setClientActiveTab("payments")}
                      className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer rounded-xl border ${
                        clientActiveTab === "payments"
                          ? "bg-blue-500 text-white border-blue-400 shadow-md font-black"
                          : "bg-white text-slate-200 hover:bg-slate-50 hover:text-[#172554] border-blue-500/20 shadow-sm"
                      }`}
                    >
                      💳 Pagamentos & Faturação Assistida
                    </button>
                    <button
                      onClick={() => setClientActiveTab("operators")}
                      className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer rounded-xl border ${
                        clientActiveTab === "operators"
                          ? "bg-blue-500 text-white border-blue-400 shadow-md font-black"
                          : "bg-white text-slate-200 hover:bg-slate-50 hover:text-[#172554] border-blue-500/20 shadow-sm"
                      }`}
                    >
                      🛡️ Operadores & Validações Auditadas
                    </button>
                  </div>

              {/* Executive Indicators Stats Grid */}
              {(() => {
                const clientHires = hires.filter(h => h.clientId === selectedClient.id);
                const totalRequests = clientHires.length;
                const successRequests = clientHires.filter(h => h.status === "completed").length;
                const pendingRequests = clientHires.filter(h => h.status === "pending").length;
                const activeRequests = clientHires.filter(h => h.status === "active").length;
                const totalSpent = clientHires.reduce((acc, h) => acc + ((h.rate || 15) * 950), 0);

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 border border-blue-500/30 shadow-xl">
                      <span className="text-[10px] tracking-wider text-slate-400 font-extrabold uppercase block mb-1.5 font-mono">Total de Pedidos</span>
                      <span className="font-serif text-3xl text-blue-700 block font-bold leading-none">{totalRequests}</span>
                      <span className="text-[11px] text-slate-500 font-medium mt-2 block">Solicitações efectuadas</span>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-blue-500/30 shadow-xl">
                      <span className="text-[10px] tracking-wider text-slate-400 font-extrabold uppercase block mb-1.5 font-mono">Pedidos Pendentes</span>
                      <span className="font-serif text-3xl block font-bold text-blue-700 leading-none">{pendingRequests}</span>
                      <span className="text-[11px] text-blue-700 font-medium mt-2 block">Em análise de triagem</span>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-blue-500/30 shadow-xl">
                      <span className="text-[10px] tracking-wider text-slate-400 font-extrabold uppercase block mb-1.5 font-mono">Pedidos Activos</span>
                      <span className="font-serif text-3xl text-sky-400 block font-bold leading-none">{activeRequests}</span>
                      <span className="text-[11px] text-sky-300 font-medium mt-2 block">Trabalhos em progresso</span>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-blue-500/30 shadow-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] tracking-wider text-slate-400 font-extrabold uppercase block mb-1.5 font-mono">Pedidos com Sucesso</span>
                        <span className="font-serif text-3xl text-emerald-600 block font-bold leading-none">{successRequests}</span>
                      </div>
                      {!viewAsClient ? (
                        <span className="text-[11px] text-emerald-700 font-bold mt-2 block font-mono">
                          Gasto: {totalSpent.toLocaleString()} MZN
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium mt-2 block">
                          Controlo activo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Capa de Interação & Unidades (Tarira Business Units & Subscription Hub) */}
              {clientActiveTab === "hub" && (
                <div className="mt-4">
                  <TariraCompanyUnitsHub
                    client={selectedClient}
                    onUpdateClient={async (updated) => {
                      setSelectedClient(updated);
                      setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
                      try {
                        await fetch(`/api/clients/${updated.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(updated)
                        });
                      } catch (e) {
                        console.error("Erro ao actualizar cliente:", e);
                      }
                    }}
                    onNavigate={(tab) => {
                      if (tab === "comercial") { setIsCommercialModalOpen(true); return; }
                      if (["profissionais", "connect_sub", "business_sub", "consulting_sub", "studio_sub"].includes(tab)) {
                        setActiveTab(tab as Tab);
                      } else {
                        setClientActiveTab(tab as any);
                      }
                    }}
                    onAddCommercialProposal={handleAddCommercialProposal}
                    currentLang={currentLang as "pt" | "en"}
                  />
                </div>
              )}

              {/* Main Grid Content for other tabs */}
              {clientActiveTab !== "hub" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                
                {/* Orders Table Column */}
                <div className="lg:col-span-2 space-y-4">
                  {clientActiveTab === "colaboradores" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gold/10">
                        <div>
                          <h3 className="font-serif text-2xl text-ivory font-light flex items-center gap-2">
                            <span>👥</span> Gestão de Colaboradores & Períodos Contratuais
                          </h3>
                          <p className="text-xs text-mist/60 mt-0.5">
                            Monitorize colaboradores alocados, prazos de renovação (3, 6 ou 12 meses), solicite substituições e recupere ex-colaboradores desativos.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCollaboratorSubTab("ativos")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              collaboratorSubTab === "ativos"
                                ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 shadow-sm"
                                : "bg-night/80 text-mist/60 border border-gold/10 hover:text-ivory"
                            }`}
                          >
                            🟢 Colaboradores Ativos ({hires.filter(h => h.clientId === selectedClient.id && h.isActive !== false).length})
                          </button>
                          <button
                            onClick={() => setCollaboratorSubTab("desativos")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              collaboratorSubTab === "desativos"
                                ? "bg-rose-500/20 text-rose-700 border border-rose-500/40 shadow-sm"
                                : "bg-night/80 text-mist/60 border border-gold/10 hover:text-ivory"
                            }`}
                          >
                            🔴 Desativos & Histórico ({hires.filter(h => h.clientId === selectedClient.id && h.isActive === false).length})
                          </button>
                        </div>
                      </div>

                      {/* Summary Cards Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-night/80 border border-gold/10">
                          <span className="text-[10px] text-mist/50 uppercase font-mono block">Colaboradores Ativos</span>
                          <span className="text-xl font-bold text-emerald-600 mt-1 block">
                            {hires.filter(h => h.clientId === selectedClient.id && h.isActive !== false).length}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-night/80 border border-blue-500/20">
                          <span className="text-[10px] text-blue-700 uppercase font-mono block">A Expirar (&lt;15 Dias)</span>
                          <span className="text-xl font-bold text-blue-700 mt-1 block">
                            {hires.filter(h => h.clientId === selectedClient.id && h.isActive !== false && (h.remainingDays || 20) <= 15).length}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-night/80 border border-gold/10">
                          <span className="text-[10px] text-mist/50 uppercase font-mono block">Desativos & Histórico</span>
                          <span className="text-xl font-bold text-rose-600 mt-1 block">
                            {hires.filter(h => h.clientId === selectedClient.id && h.isActive === false).length}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-night/80 border border-gold/10">
                          <span className="text-[10px] text-mist/50 uppercase font-mono block">Duração Padrão</span>
                          <span className="text-xl font-bold text-gold mt-1 block">3 Meses</span>
                        </div>
                      </div>

                      {/* SUB TAB 1: ATIVOS */}
                      {collaboratorSubTab === "ativos" && (
                        <div className="space-y-4">
                          {hires.filter(h => h.clientId === selectedClient.id && h.isActive !== false).length === 0 ? (
                            <div className="p-8 text-center rounded-2xl border border-dashed border-gold/20 bg-night/40">
                              <span className="text-3xl block mb-2">🧑‍💼</span>
                              <p className="text-sm font-semibold text-ivory">Nenhum colaborador ativo no momento.</p>
                              <p className="text-xs text-mist/50 mt-1">Solicite uma nova contratação no botão "+ Solicitar Novo Serviço" para alocar talentos.</p>
                            </div>
                          ) : (
                            hires.filter(h => h.clientId === selectedClient.id && h.isActive !== false).map(hire => {
                              const remainingDays = hire.remainingDays || 22;
                              const durationMonths = hire.contractDurationMonths || 3;
                              const totalContractDays = durationMonths * 30;
                              const elapsedDays = Math.max(0, totalContractDays - remainingDays);
                              const progressPct = Math.min(100, Math.round((elapsedDays / totalContractDays) * 100));
                              const isExpiringSoon = remainingDays <= 15;

                              return (
                                <div 
                                  key={hire.id}
                                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                                    isExpiringSoon 
                                      ? "bg-blue-50/15 border-blue-500/40 shadow-lg shadow-blue-950/20" 
                                      : "bg-night/90 border-gold/20 hover:border-gold/40"
                                  }`}
                                >
                                  {/* Top Row: Candidate Header */}
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gold/10">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gold/30 bg-night shrink-0">
                                        <img 
                                          src={hire.candidateAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                                          alt={hire.candidateName} 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4 className="font-bold text-ivory text-base">{hire.candidateName}</h4>
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                                            🟢 Efetivo
                                          </span>
                                          {isExpiringSoon && (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-700 border border-blue-500/40 animate-pulse">
                                              ⚠️ Expira em breve ({remainingDays} dias)
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gold mt-0.5">{hire.serviceName}</p>
                                      </div>
                                    </div>

                                    <div className="text-left sm:text-right">
                                      <span className="text-[10px] text-mist/50 block font-mono">DURAÇÃO DO CONTRATO</span>
                                      <span className="text-xs font-bold text-ivory">Contrato a Prazo Certo — {durationMonths} Meses</span>
                                    </div>
                                  </div>

                                  {/* Contract Validity Progress Bar */}
                                  <div className="space-y-1.5 bg-black/30 p-3 rounded-xl border border-gold/10">
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-mist/70 font-medium">
                                        🗓️ Vigência: <strong className="text-ivory">{hire.contractStartDate || hire.createdAt?.slice(0,10) || "15/05/2026"}</strong> até <strong className="text-gold">{hire.contractEndDate || "15/08/2026"}</strong>
                                      </span>
                                      <span className={`font-bold ${isExpiringSoon ? "text-blue-700 font-mono" : "text-emerald-600"}`}>
                                        ⏳ {remainingDays} dias restantes ({progressPct}% decorrido)
                                      </span>
                                    </div>

                                    {/* Progress Track */}
                                    <div className="w-full h-2.5 rounded-full bg-slate-50 overflow-hidden relative">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          isExpiringSoon 
                                            ? "bg-gradient-to-r from-blue-500 to-rose-500" 
                                            : "bg-gradient-to-r from-emerald-500 to-gold"
                                        }`}
                                        style={{ width: `${progressPct}%` }}
                                      />
                                    </div>
                                    <p className="text-[10px] text-mist/50 italic mt-1">
                                      * A empresa pode controlar a necessidade de renovação contratual ou substituição preventiva do colaborador.
                                    </p>
                                  </div>

                                  {/* Check-ins & Audit History preview */}
                                  {hire.checkins && hire.checkins.length > 0 && (
                                    <div className="p-2.5 rounded-lg bg-gold/5 border border-gold/10 text-[11px] text-mist/80 space-y-1">
                                      <span className="text-[9px] font-bold uppercase text-gold block font-mono">ÚLTIMO REGISTO OPERACIONAL / CONTRATUAL</span>
                                      <p className="text-ivory">{hire.checkins[0]}</p>
                                    </div>
                                  )}

                                  {/* Action Buttons Row */}
                                  <div className="flex items-center gap-2 pt-2 border-t border-gold/10 flex-wrap">
                                    <button
                                      onClick={() => {
                                        setRenewModalCollaborator(hire);
                                        setRenewDurationMonths(3);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-gold text-night text-xs font-bold hover:scale-[1.02] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                      🔄 Renovação Contratual (+3M / +6M)
                                    </button>

                                    <button
                                      onClick={() => setReplaceModalCollaborator(hire)}
                                      className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-700 border border-blue-500/30 hover:bg-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      🔁 Solicitar Substituição
                                    </button>

                                    <button
                                      onClick={() => setActiveReviewHireId(hire.id)}
                                      className="px-3 py-1.5 rounded-xl bg-night/80 text-mist/70 border border-gold/20 hover:text-ivory text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      💬 Feedback / Avaliação
                                    </button>

                                    <button
                                      onClick={() => setDeactivateModalCollaborator(hire)}
                                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-700 border border-rose-500/30 hover:bg-rose-500/25 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                                    >
                                      🛑 Mover p/ Desativos
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* SUB TAB 2: DESATIVOS E HISTÓRICO */}
                      {collaboratorSubTab === "desativos" && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-rose-50/20 border border-rose-500/30 text-xs text-rose-200">
                            💡 <strong>Histórico de Colaboradores Desativos & Recontratação:</strong> Esta lista permite à empresa acompanhar colaboradores que concluíram contratos de 3, 6 ou 12 meses e <strong>recuperar ou reativar</strong> qualquer profissional para um novo período contratual a qualquer momento.
                          </div>

                          {hires.filter(h => h.clientId === selectedClient.id && h.isActive === false).length === 0 ? (
                            <div className="p-8 text-center rounded-2xl border border-dashed border-gold/20 bg-night/40">
                              <span className="text-3xl block mb-2">📁</span>
                              <p className="text-sm font-semibold text-ivory">Nenhum colaborador desativo no histórico.</p>
                              <p className="text-xs text-mist/50 mt-1">Quando um contrato for concluído ou desativado, o histórico aparecerá aqui para fácil recuperação.</p>
                            </div>
                          ) : (
                            hires.filter(h => h.clientId === selectedClient.id && h.isActive === false).map(hire => (
                              <div 
                                key={hire.id}
                                className="p-5 rounded-2xl border border-rose-500/20 bg-night/90 space-y-4 hover:border-gold/30 transition-all"
                              >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-rose-500/30 bg-night grayscale shrink-0">
                                      <img 
                                        src={hire.candidateAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                                        alt={hire.candidateName} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-ivory text-base">{hire.candidateName}</h4>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-700 border border-rose-500/30">
                                          🔴 Desativo / Arquivado
                                        </span>
                                      </div>
                                      <p className="text-xs text-gold mt-0.5">{hire.serviceName}</p>
                                    </div>
                                  </div>

                                  <div className="text-left sm:text-right">
                                    <span className="text-[10px] text-mist/50 block font-mono">MOTIVO DA DESATIVAÇÃO</span>
                                    <span className="text-xs font-bold text-rose-700">{hire.deactivationReason || "Término de Contrato de 3 Meses"}</span>
                                  </div>
                                </div>

                                <div className="p-3 rounded-xl bg-black/40 border border-gold/10 text-xs text-mist/80 space-y-1">
                                  <p><strong>Período Anterior em Efetividade:</strong> {hire.contractStartDate || "15/02/2026"} a {hire.contractEndDate || "15/05/2026"} ({hire.contractDurationMonths || 3} Meses)</p>
                                  <p className="text-[11px] text-mist/50">Desativado em: {hire.deactivatedAt || "15/05/2026"}</p>
                                </div>

                                {/* Recontratação / Reativação CTA */}
                                <div className="flex items-center justify-between pt-2 border-t border-gold/10">
                                  <span className="text-xs text-gold font-medium">
                                    Deseja re-alocar este colaborador para um novo contrato?
                                  </span>
                                  <button
                                    onClick={() => setReactivateModalCollaborator(hire)}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-night text-xs font-extrabold hover:scale-[1.03] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                                  >
                                    ⚡ Reativar / Recuperar Colaborador
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {clientActiveTab === "pedidos" && (
                    <>
                      <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xl text-gold font-light">Controlo de Pedidos do Cliente</h3>
                    <button onClick={fetchBackendData} className="text-slate-500 hover:text-gold text-xs font-semibold flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                    </button>
                  </div>
                  
                  {/* INLINE EVALUATION FORM */}
                  {activeReviewHireId && hires.find(h => h.id === activeReviewHireId)?.clientId === selectedClient.id && (
                    <div className="p-5 rounded-2xl border border-gold bg-gold/5 space-y-4 animate-fade-up">
                      <div className="flex justify-between items-center pb-2 border-b border-gold/10">
                        <div>
                          <span className="text-[9px] tracking-widest text-gold font-bold uppercase">VALOR JÁ PAGO — CONFIRMAÇÃO DO CLIENTE</span>
                          <h3 className="font-serif text-lg text-ivory">Avaliar e Confirmar Execução do Serviço</h3>
                        </div>
                        <button onClick={() => setActiveReviewHireId(null)} className="text-slate-500 hover:text-[#172554] text-xs">✕ Fechar</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-night/40 p-4 rounded-xl border border-gold/5">
                        <div>
                          <label className="text-[9px] tracking-wider text-slate-500 uppercase block font-bold mb-1">Nota Geral (★ 1-5)</label>
                          <select 
                            value={reviewForm.rating}
                            onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                            className="w-full bg-night border border-gold/12 text-ivory rounded-lg p-2 text-xs outline-none cursor-pointer"
                          >
                            <option value="5">★ 5 - Excelente</option>
                            <option value="4">★ 4 - Muito Bom</option>
                            <option value="3">★ 3 - Regular</option>
                            <option value="2">★ 2 - Insatisfatório</option>
                            <option value="1">★ 1 - Mau</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] tracking-wider text-slate-500 uppercase block font-bold mb-1">Qualidade Técnica (1-5)</label>
                          <input 
                            type="number" min="1" max="5"
                            value={reviewForm.quality}
                            onChange={(e) => setReviewForm({...reviewForm, quality: Number(e.target.value)})}
                            className="w-full bg-night border border-gold/12 text-ivory rounded-lg p-2 text-xs outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] tracking-wider text-slate-500 uppercase block font-bold mb-1">Pontualidade (1-5)</label>
                          <input 
                            type="number" min="1" max="5"
                            value={reviewForm.punctuality}
                            onChange={(e) => setReviewForm({...reviewForm, punctuality: Number(e.target.value)})}
                            className="w-full bg-night border border-gold/12 text-ivory rounded-lg p-2 text-xs outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] tracking-wider text-slate-500 uppercase block font-bold mb-1">Limpeza/Postura (1-5)</label>
                          <input 
                            type="number" min="1" max="5"
                            value={reviewForm.cleanliness}
                            onChange={(e) => setReviewForm({...reviewForm, cleanliness: Number(e.target.value)})}
                            className="w-full bg-night border border-gold/12 text-ivory rounded-lg p-2 text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] tracking-wider text-slate-500 uppercase block font-bold mb-1">Relato de Satisfação & Feedback Final</label>
                        <textarea 
                          rows={2}
                          placeholder="Fale sobre a sua satisfação com o técnico e o trabalho realizado..."
                          value={reviewForm.text}
                          onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                          className="w-full bg-night border border-gold/12 text-ivory rounded-xl p-3 text-xs outline-none focus:border-gold/30 transition-all"
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => setActiveReviewHireId(null)}
                          className="px-4 py-2 rounded-lg border border-white/10 text-slate-500 hover:text-[#172554] text-xs"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/hires/${activeReviewHireId}/review`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                                body: JSON.stringify(reviewForm)
                              });
                              if (res.ok) {
                                alert("Feedback registado com sucesso! O serviço foi finalizado e o prestador devidamente pontuado.");
                                setActiveReviewHireId(null);
                                fetchBackendData();
                              } else {
                                alert("Erro ao registar feedback.");
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="px-6 py-2 rounded-lg bg-gold text-night font-bold text-xs hover:scale-[1.01] transition-all"
                        >
                          Confirmar & Concluir Serviço ✓
                        </button>
                      </div>
                    </div>
                  )}

                  {hires.filter(h => h.clientId === selectedClient.id).length === 0 ? (
                    <div className="text-center py-12 glass-panel rounded-2xl border border-gold/5">
                      <span className="text-3xl block mb-2">📋</span>
                      <p className="text-xs text-mist/45 font-semibold">Sem Solicitações de Serviço Ativas</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                        Ainda não efetuou nenhum pedido de contratação. Escolha um profissional qualificado no catálogo ou no separador "Contratar" para iniciar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hires
                        .filter(h => h.clientId === selectedClient.id)
                        .map((hire) => (
                          <div key={hire.id} className="glass-panel rounded-2xl p-5 border border-gold/10 hover:border-gold/20 transition-all space-y-4">
                            
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gold/5 pb-3">
                              <div>
                                <span className="text-[9px] tracking-wider text-slate-500 font-bold uppercase font-mono block">
                                  ID PEDIDO: {hire.id}
                                </span>
                                <h4 className="text-sm font-semibold text-ivory">
                                  {hire.serviceName}
                                </h4>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase font-mono border ${
                                hire.status === "pending_validation" ? "bg-blue-500/10 text-blue-700 border-blue-500/20" :
                                hire.status === "validated" ? "bg-blue-500/10 text-blue-700 border-blue-500/20" :
                                hire.status === "executed" ? "bg-gold/10 text-gold border-gold/20 animate-pulse" :
                                "bg-sage/10 text-sage border-sage/20"
                              }`}>
                                {hire.status === "pending_validation" ? "⏳ Aguardando Validação Tarira" :
                                 hire.status === "validated" ? "👷 Despachado / Em Rota" :
                                 hire.status === "executed" ? "⚡ Executado (Por Validar)" :
                                 "✓ Concluído"}
                              </span>
                            </div>

                            {/* Service Meta Details */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
                              <div>
                                <span className="text-slate-500 text-[9px] uppercase font-bold block mb-0.5">Técnico Atribuído</span>
                                <span className="text-ivory font-semibold">{hire.candidateName}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[9px] uppercase font-bold block mb-0.5">Local do Serviço</span>
                                <span className="text-ivory truncate block" title={hire.location}>{hire.location}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[9px] uppercase font-bold block mb-0.5">Data/Hora Pretendida</span>
                                <span className="text-gold font-mono">{hire.targetDate || "Urgente / Imediata"}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[9px] uppercase font-bold block mb-0.5">Pagamento / Canal</span>
                                <span className="text-sage font-bold font-mono uppercase">
                                  {hire.paymentStatus === "fully_paid" ? "💰 100% Pleno" : "💳 50% Upfront"} • {hire.paymentChannel}
                                </span>
                              </div>
                            </div>

                            {/* Validation and arrival notes from Tarira Agents */}
                            {hire.tariraAgentValidated && (
                              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 text-xs">
                                <span className="text-[9px] tracking-wider text-blue-700 font-bold uppercase block mb-1">✓ INFORMAÇÕES DE DESPACHO E CONEXÃO TARIRA:</span>
                                <p className="text-mist/65 leading-relaxed">{hire.tariraValidationNotes}</p>
                              </div>
                            )}

                            {/* Operational Timeline Check-ins Terminal */}
                            <div className="space-y-1.5 bg-black/40 border border-gold/5 rounded-xl p-3">
                              <span className="text-[8px] tracking-wider text-slate-300 font-bold uppercase block mb-1">HISTÓRICO E TIMELINE OPERACIONAL:</span>
                              <div className="max-h-28 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                                {hire.checkins?.map((log: string, idx: number) => (
                                  <p key={idx} className="text-[10px] text-mist/45 font-mono leading-relaxed">
                                    {log}
                                  </p>
                                ))}
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            {hire.status === "executed" && (
                              <div className="flex justify-end pt-2 border-t border-gold/5">
                                <button 
                                  onClick={() => {
                                    setReviewForm({
                                      rating: 5,
                                      text: "",
                                      quality: 5,
                                      punctuality: 5,
                                      cleanliness: 5
                                    });
                                    setActiveReviewHireId(hire.id);
                                  }}
                                  className="px-5 py-2 rounded-xl bg-gold text-night text-xs font-bold hover:scale-[1.01] transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-gold/5"
                                >
                                  ⭐ Avaliar & Confirmar Conclusão
                                </button>
                              </div>
                            )}

                            {hire.status === "completed" && hire.review && (
                              <div className="bg-sage/5 border border-sage/15 rounded-xl p-3 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] tracking-wider text-sage font-bold uppercase">SUA AVALIAÇÃO SUBMETIDA:</span>
                                  <span className="text-gold font-bold font-mono">★ {hire.review.rating}/5</span>
                                </div>
                                <p className="text-mist/65 leading-relaxed italic">"{hire.review.text}"</p>
                              </div>
                            )}

                          </div>
                        ))}
                    </div>
                  )}
                  </>
                )}

                {/* 📊 CLIENT ANALYTICS PANEL */}
                {clientActiveTab === "analytics" && (
                  <div className="space-y-6 animate-fade-up">
                    <div className="flex justify-between items-center pb-2 border-b border-gold/10">
                      <div>
                        <span className="text-[9px] tracking-widest text-gold font-bold uppercase">ANALYTICS EXCLUSIVO DE CONTA</span>
                        <h3 className="font-serif text-2xl text-ivory/95 font-light">Métricas de Alocação de Recursos</h3>
                      </div>
                      <span className="text-[10px] text-sage font-semibold font-mono">Filtro: {selectedClient.name}</span>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-night/40 border border-gold/5 p-4 rounded-xl text-center">
                        <span className="text-[8px] text-slate-500 block font-bold uppercase mb-1">Investimento Total</span>
                        <span className="font-serif text-lg text-gold block font-semibold">
                          {(hires.filter(h => h.clientId === selectedClient.id).reduce((acc, h) => acc + ((h.rate || 15) * 950), 0)).toLocaleString()} MZN
                        </span>
                      </div>
                      <div className="bg-night/40 border border-gold/5 p-4 rounded-xl text-center">
                        <span className="text-[8px] text-slate-500 block font-bold uppercase mb-1">Avaliação Média</span>
                        <span className="font-serif text-lg text-gold block font-semibold">
                          {(() => {
                            const clientHires = hires.filter(h => h.clientId === selectedClient.id);
                            const reviewed = clientHires.filter(h => h.review);
                            if (reviewed.length === 0) return "5.0 / 5";
                            const avg = reviewed.reduce((acc, h) => acc + (h.review?.rating || 5), 0) / reviewed.length;
                            return `${avg.toFixed(1)} / 5`;
                          })()}
                        </span>
                      </div>
                      <div className="bg-night/40 border border-gold/5 p-4 rounded-xl text-center">
                        <span className="text-[8px] text-slate-500 block font-bold uppercase mb-1">Aderência SLA</span>
                        <span className="font-serif text-lg text-sage block font-semibold">99.4%</span>
                      </div>
                    </div>

                    {/* Spending by Service Chart */}
                    <div className="bg-night/30 border border-gold/10 p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold text-ivory tracking-wide uppercase">Distribuição de Alocação por Serviço</h4>
                      <div className="space-y-3">
                        {(() => {
                          const clientHires = hires.filter(h => h.clientId === selectedClient.id);
                          if (clientHires.length === 0) {
                            return <p className="text-xs text-slate-500 italic">Sem dados de investimento registados.</p>;
                          }
                          const maxVal = Math.max(...clientHires.map(hi => (hi.rate || 15) * 950), 1);
                          return clientHires.map((h) => {
                            const value = (h.rate || 15) * 950;
                            const percentage = Math.min((value / maxVal) * 100, 100);
                            return (
                              <div key={h.id} className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-mist/75 font-medium">{h.serviceName} ({h.candidateName})</span>
                                  <span className="text-gold font-mono font-semibold">{value.toLocaleString()} MZN</span>
                                </div>
                                <div className="h-2 bg-night rounded-full overflow-hidden border border-gold/5">
                                  <div 
                                    className="h-full bg-gradient-to-r from-copper to-gold rounded-full transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Top Hired Professionals */}
                    <div className="bg-night/30 border border-gold/10 p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold text-ivory tracking-wide uppercase">Técnicos Alocados à Conta</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(() => {
                          const clientHires = hires.filter(h => h.clientId === selectedClient.id);
                          if (clientHires.length === 0) {
                            return <p className="text-xs text-slate-500 italic col-span-2">Sem técnicos alocados.</p>;
                          }
                          return clientHires.map((h) => {
                            const prof = candidates.find(c => c.id === h.candidateId);
                            return (
                              <div key={h.id} className="p-3 bg-night/45 rounded-xl border border-gold/5 flex items-center gap-3">
                                <img 
                                  src={prof?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                                  alt={h.candidateName} 
                                  className="w-10 h-10 rounded-full object-cover border border-gold/20"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <span className="text-xs font-bold text-ivory block">{h.candidateName}</span>
                                  <span className="text-[10px] text-gold block">{h.serviceName}</span>
                                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Status: {h.status === "completed" ? "Concluído" : "Ativo"}</span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* 🗺️ HIRING FLOW (AIRFLOW DAG) PANEL */}
                {clientActiveTab === "airflow" && (
                  <div className="space-y-6 animate-fade-up">
                    <div className="flex justify-between items-center pb-2 border-b border-gold/10">
                      <div>
                        <span className="text-[9px] tracking-widest text-gold font-bold uppercase">ORQUESTRADOR DE CONTRATAÇÃO (AIRFLOW DAG)</span>
                        <h3 className="font-serif text-2xl text-ivory/95 font-light">Pipelines de Despacho Automatizado</h3>
                      </div>
                      <span className="text-[10px] text-blue-500 font-mono font-semibold">Orquestrador Ativo</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Abaixo estão mapeados os fluxos operacionais ativos para cada pedido. Cada nó do grafo (DAG) representa um checkpoint crítico de SLA verificado fisicamente ou por IA em tempo real.
                    </p>

                    {(() => {
                      const clientHires = hires.filter(h => h.clientId === selectedClient.id);
                      if (clientHires.length === 0) {
                        return (
                          <div className="p-8 text-center bg-slate-50 rounded-xl border border-gold/10">
                            <p className="text-xs text-slate-500 italic">Nenhuma pipeline activa de serviço encontrada para este cliente.</p>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-8">
                          {clientHires.map((h) => {
                            const isTriggerDone = true;
                            const isMatchDone = true;
                            const isDispatchDone = ["validated", "executed", "completed", "active"].includes(h.status);
                            const isPresenceDone = ["executed", "completed"].includes(h.status);
                            const isReviewDone = h.status === "completed";

                            return (
                              <div key={h.id} className="p-5 bg-night/30 border border-gold/8 rounded-2xl space-y-5">
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                  <div>
                                    <span className="text-[9px] text-slate-500 font-mono font-bold uppercase block">PIPELINE RUN ID: run-{h.id}</span>
                                    <h4 className="text-sm font-semibold text-ivory">{h.serviceName} (Técnico: {h.candidateName})</h4>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                                    h.status === "completed" ? "bg-sage/20 text-sage border border-sage/30" : "bg-blue-500/20 text-blue-700 border border-blue-500/30 animate-pulse"
                                  }`}>
                                    {h.status === "completed" ? "Success" : "Running"}
                                  </span>
                                </div>

                                {/* Visual DAG Nodes Graph */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-black/35 rounded-xl border border-gold/5 overflow-x-auto no-scrollbar">
                                  
                                  {/* Node 1 */}
                                  <div className="flex flex-col items-center text-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                                      isTriggerDone ? "bg-sage/20 border-sage text-sage shadow-md shadow-sage/5" : "bg-night border-gold/10 text-mist/30"
                                    }`}>
                                      ✓
                                    </div>
                                    <span className="text-[9px] font-bold text-ivory mt-1">1. Pedido</span>
                                    <span className="text-[8px] text-slate-300">Trigger Ativado</span>
                                  </div>

                                  {/* Connector */}
                                  <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-sage to-sage"></div>

                                  {/* Node 2 */}
                                  <div className="flex flex-col items-center text-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                                      isMatchDone ? "bg-sage/20 border-sage text-sage shadow-md shadow-sage/5" : "bg-night border-gold/10 text-mist/30"
                                    }`}>
                                      ✓
                                    </div>
                                    <span className="text-[9px] font-bold text-ivory mt-1">2. IA Triagem</span>
                                    <span className="text-[8px] text-slate-300">TARIRA Matcher</span>
                                  </div>

                                  {/* Connector */}
                                  <div className={`hidden md:block flex-1 h-[2px] ${isDispatchDone ? "bg-sage" : "bg-gold/10"}`}></div>

                                  {/* Node 3 */}
                                  <div className="flex flex-col items-center text-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                                      isDispatchDone ? "bg-sage/20 border-sage text-sage" : h.status === "pending_validation" ? "bg-blue-500/10 border-blue-500 text-blue-700 animate-pulse" : "bg-night border-gold/10 text-mist/30"
                                    }`}>
                                      {isDispatchDone ? "✓" : h.status === "pending_validation" ? "⚡" : "○"}
                                    </div>
                                    <span className="text-[9px] font-bold text-ivory mt-1">3. Despacho</span>
                                    <span className="text-[8px] text-slate-300">Supervisor SLA</span>
                                  </div>

                                  {/* Connector */}
                                  <div className={`hidden md:block flex-1 h-[2px] ${isPresenceDone ? "bg-sage" : "bg-gold/10"}`}></div>

                                  {/* Node 4 */}
                                  <div className="flex flex-col items-center text-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                                      isPresenceDone ? "bg-sage/20 border-sage text-sage" : ["validated", "active"].includes(h.status) ? "bg-blue-500/10 border-blue-500 text-blue-700 animate-pulse" : "bg-night border-gold/10 text-mist/30"
                                    }`}>
                                      {isPresenceDone ? "✓" : ["validated", "active"].includes(h.status) ? "⚡" : "○"}
                                    </div>
                                    <span className="text-[9px] font-bold text-ivory mt-1">4. Execução</span>
                                    <span className="text-[8px] text-slate-300">Trabalho Terreno</span>
                                  </div>

                                  {/* Connector */}
                                  <div className={`hidden md:block flex-1 h-[2px] ${isReviewDone ? "bg-sage" : "bg-gold/10"}`}></div>

                                  {/* Node 5 */}
                                  <div className="flex flex-col items-center text-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                                      isReviewDone ? "bg-sage/20 border-sage text-sage" : h.status === "executed" ? "bg-blue-500/10 border-blue-500 text-blue-700 animate-pulse" : "bg-night border-gold/10 text-mist/30"
                                    }`}>
                                      {isReviewDone ? "✓" : "○"}
                                    </div>
                                    <span className="text-[9px] font-bold text-ivory mt-1">5. Fecho</span>
                                    <span className="text-[8px] text-slate-300">Feedback & Payout</span>
                                  </div>

                                </div>

                                {/* Terminal-style DAG Logs */}
                                <div className="bg-black/60 border border-gold/5 rounded-xl p-3 font-mono text-[10px] text-mist/50 space-y-1 max-h-28 overflow-y-auto">
                                  <p className="text-[8px] text-gold uppercase tracking-wider block border-b border-gold/5 pb-1 mb-1 font-sans">Console Output:</p>
                                  <p className="text-sage/65">[INFO] Pipeline run-id 'run-{h.id}' triggered by {selectedClient.name}.</p>
                                  <p className="text-sage/65">[INFO] Match candidate {h.candidateName} selected via automatic vector indexing.</p>
                                  {isDispatchDone ? (
                                    <p className="text-sage/65">[INFO] Task 'SLA_Supervisor_Dispatch' completed successfully. Logs verified by manager.</p>
                                  ) : (
                                    <p className="text-blue-500/80">[WAIT] Task 'SLA_Supervisor_Dispatch' currently active. Awaiting manager validation.</p>
                                  )}
                                  {isPresenceDone ? (
                                    <p className="text-sage/65">[INFO] Task 'Ground_Execution_Verify' completed. GPS location check-in matches target address.</p>
                                  ) : isDispatchDone ? (
                                    <p className="text-blue-500/80">[WAIT] Task 'Ground_Execution_Verify' active. Provider in-route to {h.location || "Endereço do Cliente"}.</p>
                                  ) : null}
                                  {isReviewDone ? (
                                    <p className="text-sage/65">[SUCCESS] Pipeline completed successfully. Rating of {h.review?.rating}/5 registered. Escrow payout released.</p>
                                  ) : h.status === "executed" ? (
                                    <p className="text-blue-500/80">[WAIT] Task 'Client_Review_Escrow' active. Awaiting client review submission.</p>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 💬 SLA FEEDBACK PANEL */}
                {clientActiveTab === "sla" && (
                  <div className="space-y-6 animate-fade-up">
                    <div className="flex justify-between items-center pb-2 border-b border-gold/10">
                      <div>
                        <span className="text-[9px] tracking-widest text-gold font-bold uppercase">SUPERVISÃO FÍSICA E ACORDO DE NÍVEL DE SERVIÇO (SLA)</span>
                        <h3 className="font-serif text-2xl text-ivory/95 font-light">Garantia Operacional TARIRA</h3>
                      </div>
                      <span className="text-[10px] text-sage font-mono font-semibold">98.4% Disponibilidade</span>
                    </div>

                    {/* SLA Gauge Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-sage/5 border border-sage/15 p-4 rounded-xl flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <span className="text-[9px] text-slate-500 block font-bold uppercase">Tempo de Resposta</span>
                          <span className="text-xs font-bold text-ivory block">19 minutos de média</span>
                          <span className="text-[8px] text-sage block font-mono">✓ Limite: 30 minutos</span>
                        </div>
                      </div>
                      <div className="bg-gold/5 border border-gold/15 p-4 rounded-xl flex items-center gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div>
                          <span className="text-[9px] text-slate-500 block font-bold uppercase">Auditoria de EPIs</span>
                          <span className="text-xs font-bold text-ivory block">100% Conformidade</span>
                          <span className="text-[8px] text-gold block font-mono">✓ Cobertura total de riscos</span>
                        </div>
                      </div>
                      <div className="bg-blue-500/5 border border-blue-500/15 p-4 rounded-xl flex items-center gap-3">
                        <span className="text-2xl">📍</span>
                        <div>
                          <span className="text-[9px] text-slate-500 block font-bold uppercase">Check-in Supervisor</span>
                          <span className="text-xs font-bold text-ivory block">Presencial via Coordenadas</span>
                          <span className="text-[8px] text-blue-700 block font-mono">✓ Validação GPS no local</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Auditing Timeline logs */}
                    <div className="bg-night/30 border border-gold/10 p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold text-ivory tracking-wide uppercase">Relatórios de Fiscalização por Atendimento</h4>
                      {(() => {
                        const clientHires = hires.filter(h => h.clientId === selectedClient.id);
                        if (clientHires.length === 0) {
                          return <p className="text-xs text-slate-500 italic">Sem auditorias de SLA pendentes ou finalizadas.</p>;
                        }
                        return (
                          <div className="space-y-4">
                            {clientHires.map((h) => (
                              <div key={h.id} className="p-4 bg-night/50 border border-gold/5 rounded-xl space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                  <span className="text-xs font-bold text-gold">{h.serviceName}</span>
                                  <span className="text-[9px] text-slate-500 font-mono">SLA Ref: SLA-{h.id}</span>
                                </div>

                                {/* Timeline events */}
                                <div className="space-y-2 text-[11px] leading-relaxed">
                                  <div className="flex items-start gap-2">
                                    <span className="text-sage">●</span>
                                    <p className="text-mist/75">
                                      <strong className="text-ivory">SLA de Despacho Atendido:</strong> Profissional qualificado <strong className="text-ivory">{h.candidateName}</strong> alocado e notificado em 4 minutos após abertura do pedido.
                                    </p>
                                  </div>

                                  {h.checkins && h.checkins.length > 0 ? (
                                    h.checkins.map((checkin, idx) => (
                                      <div key={idx} className="flex items-start gap-2">
                                        <span className="text-sage">●</span>
                                        <p className="text-mist/75">{checkin}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex items-start gap-2">
                                      <span className="text-blue-500">●</span>
                                      <p className="text-mist/50 italic">Técnico triado e aguardando ativação presencial do supervisor de turno no terreno.</p>
                                    </div>
                                  )}
                                  
                                  <div className="p-2.5 bg-black/35 rounded-lg border border-gold/5 flex justify-between items-center mt-2">
                                    <span className="text-[10px] text-mist/50">Garantia Civil Ativa de Danos Materiais:</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded bg-sage/20 text-sage font-bold border border-sage/30 uppercase font-mono">Cobertura TARIRA</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 🛡️ OPERATORS & AUDIT CONTROL PANEL */}
                {clientActiveTab === "operators" && (
                  <div className="space-y-6 animate-fade-up">
                    <OrganizationAuditPanel
                      orgName={selectedClient.name}
                      orgType={selectedClient.type === "company" ? "company" : selectedClient.type === "condo" ? "condo" : "company"}
                      orgId={selectedClient.id}
                      operators={(() => {
                        const matched = orgOperators.filter(op => op.orgName === selectedClient.name || op.orgId === selectedClient.id);
                        if (matched.length > 0) return matched;
                        return [
                          {
                            id: `op-${selectedClient.id}-default`,
                            name: `Gestor de Operações (${selectedClient.name.split(' ')[0]})`,
                            role: "Responsável Operacional da Conta",
                            email: selectedClient.email || `gestao@${selectedClient.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.mz`,
                            orgId: selectedClient.id,
                            orgName: selectedClient.name,
                            permissions: ["Validar Candidatos", "Agendar Intervenções", "Aprovar Serviços"],
                            status: "Ativo",
                            lastActive: "Agora mesmo",
                            avatar: "👔"
                          }
                        ];
                      })()}
                      activeOperator={activeOperator}
                      onSwitchOperator={(op) => {
                        setActiveOperator(op);
                        triggerOperationLog("OPERATOR_SWITCH", `Sessão alterada para operador: ${op.name} (${op.role})`);
                      }}
                      onAddOperator={async (newOp) => {
                        await handleCreateOperatorDirect(newOp as OrgOperator);
                        triggerOperationLog("OPERATOR_ADD", `Adicionado operador ${newOp.name} (${newOp.role}) para ${selectedClient.name}`);
                      }}
                      auditLogs={operatorAuditLogs}
                      onAddAuditAction={(newLog) => {
                        setOperatorAuditLogs(prev => [newLog as OperatorAuditAction, ...prev]);
                        triggerOperationLog(newLog.actionType || "VALIDAÇÃO", `${newLog.operatorName}: ${newLog.details}`);
                      }}
                      candidates={candidates}
                      hires={hires.filter(h => h.clientId === selectedClient.id)}
                    />
                  </div>
                )}

                {/* 💳 CLIENT PAYMENTS SUBTAB */}
                {clientActiveTab === "payments" && (
                  <div className="space-y-6 animate-fade-up text-left">
                    <div className="p-6 rounded-3xl bg-white border border-blue-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="text-[10px] tracking-[0.2em] text-blue-700 font-mono uppercase font-bold">FATURAÇÃO TARIRA ECOSSISTEMA</span>
                        <h2 className="text-xl font-serif font-bold text-slate-100 mt-0.5">Pagamentos Manuais Assistidos</h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Acompanhe o estado das suas transferências via M-Pesa, e-Mola ou Banco para {selectedClient.name}.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setPaymentCheckoutData({
                            serviceTitle: "Pagamento de Serviço / Adiantamento de Fatura",
                            amount: 5000,
                            userName: selectedClient.name,
                            userEmail: selectedClient.email,
                            userPhone: selectedClient.phone,
                            userType: selectedClient.type
                          });
                          setIsPaymentCheckoutModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.01]"
                      >
                        ➕ Efetuar Novo Pagamento Manual 💳
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {paymentOrders
                        .filter(p => p.userName === selectedClient.name || p.userId === selectedClient.id)
                        .map((p) => (
                          <div key={p.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-mono text-sm font-black text-blue-700">{p.amount.toLocaleString()} MT</span>
                              {p.status === "pending" && (
                                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-700 text-[10px] font-bold border border-blue-500/30 font-mono">
                                  🟡 Em Verificação
                                </span>
                              )}
                              {p.status === "confirmed" && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 text-[10px] font-bold border border-emerald-500/30 font-mono">
                                  🟢 Confirmado
                                </span>
                              )}
                              {p.status === "rejected" && (
                                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-700 text-[10px] font-bold border border-rose-500/30 font-mono">
                                  🔴 Rejeitado
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-100">{p.serviceTitle}</h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">Ref: {p.reference}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-[10px] text-slate-400">
                              <span className="uppercase font-mono font-bold">
                                {p.method === "mpesa" ? "🔴 M-Pesa" : p.method === "emola" ? "🟠 e-Mola" : "🏦 Banco"}
                              </span>
                              <span>{new Date(p.createdAt).toLocaleDateString("pt-MZ")}</span>
                            </div>
                            {p.adminNotes && (
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-500 font-mono">
                                📌 Central TARIRA: {p.adminNotes}
                              </div>
                            )}
                          </div>
                        ))}
                      {paymentOrders.filter(p => p.userName === selectedClient.name || p.userId === selectedClient.id).length === 0 && (
                        <div className="md:col-span-3 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                          💳 Nenhum histórico de pagamento manual registado para este cliente ainda.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  )}

        {/* ════════════════════════ PERFIL DO PRESTADOR/PROFISSIONAL (PÓS-LOGIN) ════════════════════════ */}
        {activeTab === "professional_profile" && (() => {
          // "O Meu Perfil" TEM de identificar sempre primeiro o registo do
          // utilizador autenticado (por email/candidate_id) — nunca deve usar
          // como primeira opção um "selectedProfessional" que possa ter ficado
          // de uma navegação anterior (ex: ter visto o perfil de outra pessoa em
          // Talentos e Quadros), ou mostraria momentaneamente o perfil errado.
          const currentUserEmail = (supabaseUser?.email || supabaseProfile?.email || "")?.toLowerCase();
          const activeProf =
            (currentUserEmail ? candidates.find(c => c.email && c.email.toLowerCase() === currentUserEmail) : null) ||
            (supabaseProfile?.candidate_id ? candidates.find(c => c.id === supabaseProfile.candidate_id) : null) ||
            selectedProfessional ||
            (candidates.length > 0 ? (candidates.find(c => c.isProfessional) || candidates[0]) : null);

          if (!activeProf) {
            return (
              <div id="s-professional-profile-empty" className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto p-8 text-center bg-white my-12 rounded-3xl border border-slate-200 shadow-sm animate-fade-up">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl mb-4 text-[#172554]">
                  👤
                </div>
                <h2 className="text-xl font-serif font-bold text-[#172554] mb-2">Nenhum Perfil Encontrado</h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-md">
                  Ainda não tem um perfil profissional associado a esta sessão. Crie a sua candidatura de talento corporativo ou registo de prestador de ofício para ter o seu dossiê completo.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setActiveTab("spontaneous_apply")}
                    className="px-5 py-2.5 rounded-xl bg-[#172554] text-white text-xs font-bold hover:bg-[#1A3478] transition-all shadow-sm cursor-pointer"
                  >
                    Criar Perfil Profissional
                  </button>
                  <button
                    onClick={() => setActiveTab("profissionais")}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#172554] text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Explorar Talentos e Quadros
                  </button>
                </div>
              </div>
            );
          }

          const myHires = hires.filter(h => h.candidateId === activeProf.id);
          const completedCount = myHires.filter(h => h.status === "completed").length;
          const activeCount = myHires.filter(h => h.status === "active" || h.status === "pending" || h.status === "confirmed_escrow").length;
          const isQuadro = Boolean(activeProf.isProfessional);
          const cleanPhone = (activeProf.phone || "").replace(/\D/g, "");
          const whatsappNum = (activeProf.whatsapp || activeProf.phone || "").replace(/\D/g, "");

          return (
            <div id="s-professional-profile" className="flex-1 flex flex-col w-full animate-fade-up max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-[#172554] bg-white">

              {/* Cabeçalho: voltar e identificador de tipo */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab(isQuadro ? "profissionais" : "client_find")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#172554] text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar ao Diretório
                </button>
                <span className="text-[10px] tracking-[0.2em] text-[#172554] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase font-mono font-bold">
                  {isQuadro ? "Talentos & Quadros · Perfil Corporativo" : "Técnico de Ofício · Prestador Homologado"}
                </span>
              </div>

              {/* Cartão principal: identidade */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <img
                    src={activeProf.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"}
                    alt={activeProf.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#172554]">
                        {activeProf.name} {activeProf.surname || ""}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Homologado TARIRA
                      </span>
                    </div>
                    <p className="text-sm text-[#3B5998] font-bold">{activeProf.title || activeProf.category || (isQuadro ? "Talento Corporativo" : "Prestador de Serviço")}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{activeProf.residence ? `${activeProf.residence}, ` : ""}{activeProf.city || "Maputo"}, Moçambique</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => setProviderCrudModal({
                        isOpen: true,
                        mode: 'edit',
                        type: activeProf.isProfessional ? 'professional' : 'provider',
                        initialData: activeProf
                      })}
                      className="px-4 py-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Editar Perfil
                    </button>
                  </div>
                </div>

                {/* Estatísticas rápidas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200">
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-center">
                    <span className="text-lg font-serif font-bold text-[#172554] block">{activeProf.rating ? activeProf.rating.toFixed(1) : "5.0"}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Avaliação</span>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-center">
                    <span className="text-lg font-serif font-bold text-[#172554] block">{activeProf.completedJobs ?? completedCount}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Serviços / Projetos</span>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-center">
                    <span className="text-lg font-serif font-bold text-[#172554] block">{activeProf.matchScore || 95}%</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Índice Match AI</span>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-center">
                    <span className="text-lg font-serif font-bold text-[#172554] block">{activeProf.experienceYears ? `${activeProf.experienceYears} Anos` : "5+ Anos"}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Experiência</span>
                  </div>
                </div>
              </div>

              {/* Informações de Contacto & Comunicação Direta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#172554] flex items-center justify-center font-bold text-lg shrink-0">
                    📞
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Telefone</span>
                    <a href={cleanPhone ? `tel:${cleanPhone}` : undefined} className="text-xs font-bold text-[#172554] truncate hover:underline block">
                      {activeProf.phone || "Contacto sob consulta"}
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">WhatsApp</span>
                    {whatsappNum ? (
                      <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 truncate hover:underline block">
                        +{whatsappNum}
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-slate-500">Disponível na contratação</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-lg shrink-0">
                    ✉️
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Email</span>
                    <a href={activeProf.email ? `mailto:${activeProf.email}` : undefined} className="text-xs font-bold text-[#172554] truncate hover:underline block">
                      {activeProf.email || "Email sob consulta"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Remuneração & Condições Contratuais */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
                <h3 className="text-xs uppercase font-bold text-slate-400 mb-4 tracking-wider font-mono">
                  Enquadramento Salarial & Contratação
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      {isQuadro ? "Expectativa Salarial Mensal" : "Tarifa Base por Hora"}
                    </span>
                    <span className="text-base sm:text-lg font-serif font-bold text-[#172554] block">
                      {isQuadro
                        ? `${activeProf.expectedSalaryMin ? Number(activeProf.expectedSalaryMin).toLocaleString() : '85.000'} MZN a ${activeProf.expectedSalaryMax ? Number(activeProf.expectedSalaryMax).toLocaleString() : '160.000'} MZN`
                        : `${activeProf.rateMzn || (activeProf.rate ? activeProf.rate * 70 : 1500)} MZN / hora`}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {activeProf.salaryNegotiable !== false ? "Valor indicativo negociável conforme pacote de benefícios" : "Valor fixo tabelado"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Regime Pretendido
                    </span>
                    <span className="text-sm font-bold text-[#172554] block">
                      {activeProf.workType === 'presencial' ? 'Presencial (Full-time)' : activeProf.workType === 'remoto' ? 'Remoto (Trabalho à Distância)' : 'Híbrido / Flexível'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Disponibilidade imediata para alocação
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Website / Portfólio Digital
                    </span>
                    {activeProf.portfolioWebsite ? (
                      <a href={activeProf.portfolioWebsite.startsWith('http') ? activeProf.portfolioWebsite : `https://${activeProf.portfolioWebsite}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-700 hover:underline truncate block">
                        {activeProf.portfolioWebsite} ↗
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">Dossiê disponível no ecossistema TARIRA</span>
                    )}
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Validado pela Direção de Operações
                    </span>
                  </div>
                </div>
              </div>

              {/* Biografia & Apresentação */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
                <h3 className="text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider font-mono">Resumo Executivo & Biografia</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activeProf.bio || "Profissional qualificado e homologado no ecossistema TARIRA, apto para alocações técnicas e contratações corporativas em Moçambique."}
                </p>
                {activeProf.whyWork && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-[#172554] uppercase font-mono block mb-1">Objetivo Profissional & Motivação</span>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{activeProf.whyWork}"</p>
                  </div>
                )}
              </div>

              {/* Competências */}
              {activeProf.skills && activeProf.skills.length > 0 && (
                <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider font-mono">Competências & Especialidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeProf.skills.map((sk, idx) => (
                      <span key={idx} className="px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#172554] text-xs font-semibold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentação Homologada */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
                <h3 className="text-xs uppercase font-bold text-slate-400 mb-4 tracking-wider font-mono">Documentos & Certificações Homologadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#172554] flex items-center justify-center font-bold text-sm">
                        📄
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#172554] block">Currículo Vitae (CV)</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">Arquivo Anexado & Verificado</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Dossiê profissional de ${activeProf.name} validado pela equipa de Talentos TARIRA.`)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-[#172554] hover:bg-slate-100 cursor-pointer shadow-xs"
                    >
                      Visualizar
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                        🪪
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#172554] block">Identificação Oficial (BI / NUIT)</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">{activeProf.identityDocName || "Documento Verificado"}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Aprovado
                    </span>
                  </div>
                </div>
              </div>

              {/* Portfólio de Obras e Projetos */}
              {activeProf.portfolio && activeProf.portfolio.length > 0 && (
                <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider font-mono">Portfólio de Obras & Projetos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeProf.portfolio.map((item, pIdx) => (
                      <div key={pIdx} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 group">
                        <img
                          src={item.url}
                          alt={item.caption || `Projeto ${pIdx + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        {item.caption && (
                          <div className="p-2 text-[10px] text-slate-600 truncate font-medium">
                            {item.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Carteira & Faturamento */}
              <TariraProviderWalletPanel
                candidate={activeProf}
                hires={hires}
                payoutRequests={payoutRequests}
                onRequestWithdraw={(amount) => handleRequestCandidateWithdraw(activeProf.id, amount)}
                onRequestHirePayout={handleRequestHirePayout}
                onContactCentral={() =>
                  handleOpenEmailComposer(
                    undefined,
                    socialLinks.email || "tarira.ecossistema@gmail.com",
                    `Contacto via Painel do Prestador — ${activeProf.name} ${activeProf.surname || ""}`
                  )
                }
              />

              {/* Histórico de Serviços */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider font-mono">Histórico de Alocações & Serviços</h3>
                {myHires.length === 0 ? (
                  <p className="text-sm text-slate-500">Ainda não tem serviços registados.</p>
                ) : (
                  <div className="space-y-2.5">
                    {myHires.map((h) => (
                      <div key={h.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                        <div>
                          <p className="text-sm font-semibold text-[#172554]">{h.serviceName}</p>
                          <p className="text-xs text-slate-500">{h.clientName} · {h.targetDate || h.createdAt || ""}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          h.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          h.status === "pending" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}>
                          {h.status || "registado"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ════════════════════════ SERVIÇOS (SERVICES CATALOG) TAB ════════════════════════ */}
        {activeTab === "services" && (
          <div id="s-services" className="flex-1 flex flex-col w-full animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-[#172554] bg-white">

              {/* TOP NAVIGATION BREADCRUMB & BACK TO PREVIOUS ZONE BUTTON */}
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveTab(previousServiceZoneTab || "company");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    title="Voltar à Zona Anterior"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                    <span>← Voltar à Zona Anterior</span>
                  </button>
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-[#3B5998] font-mono uppercase tracking-wider block leading-tight font-bold">
                      {previousServiceZoneTab === "company" ? "Painel de Gestão do Cliente" : "Ecossistema TARIRA"}
                    </span>
                    <span className="text-xs font-bold text-[#172554]">
                      Catálogo Executivo de Serviços
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-50 text-[#172554] border border-blue-200 px-3 py-1.5 rounded-xl font-mono font-bold">
                    📋 Catálogo de Serviços Estruturados
                  </span>
                </div>
              </div>

              {/* Header Title */}
              <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="text-xs tracking-[0.35em] text-[#172554] uppercase font-black font-mono mb-1.5">CATÁLOGO EXECUTIVO</p>
                <h1 className="font-serif text-4xl sm:text-5xl text-[#172554] font-bold tracking-wide">
                  35+ <span className="relative inline-block text-[#172554]">Serviços Estruturados<span className="absolute -bottom-1 left-0 w-full h-[4px] bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 rounded-full animate-trace-line shadow-[0_0_10px_rgba(23,37,84,0.3)]" /></span>
                </h1>
                <p className="text-xs sm:text-sm text-[#3B5998] mt-2.5 leading-relaxed font-medium">
                  Para cada serviço requisitado, a TARIRA garante triagem rigorosa, homologação documental e supervisão de campo no terreno.
                </p>

                {/* Quick stats on services */}
                <div className="flex justify-center gap-4 sm:gap-6 mt-6 flex-wrap">
                  <div className="text-center bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="font-serif text-2xl text-[#172554] block font-bold">35+</span>
                    <span className="text-[10px] text-[#3B5998] uppercase tracking-widest font-extrabold font-mono">Serviços</span>
                  </div>
                  <div className="text-center bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="font-serif text-2xl text-[#172554] block font-bold">{SERVICES.length}</span>
                    <span className="text-[10px] text-[#3B5998] uppercase tracking-widest font-extrabold font-mono">Categorias</span>
                  </div>
                  <div className="text-center bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="font-serif text-2xl text-blue-600 block font-bold">⚡ 8</span>
                    <span className="text-[10px] text-[#3B5998] uppercase tracking-widest font-extrabold font-mono">Intervenções Urgentes</span>
                  </div>
                  <div className="text-center bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="font-serif text-2xl text-[#172554] block font-bold">30 min</span>
                    <span className="text-[10px] text-[#3B5998] uppercase tracking-widest font-extrabold font-mono">SLA Feedback Inicial</span>
                  </div>
                </div>

                {/* Clear Business Rule Notice regarding Emergency & Operational Hours */}
                <div className="mt-4 max-w-2xl mx-auto px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#172554] flex items-center justify-center gap-2 text-center font-sans shadow-xs">
                  <span className="text-sm shrink-0">ℹ️</span>
                  <span>
                    <strong>Horário de Atividade:</strong> Seg a Sex (08h–17h30) e Sáb (08h–13h) • <strong>Feedback Inicial:</strong> SLA de 30 min para confirmação técnica.
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="max-w-md mx-auto mb-8 relative">
                <Search className="w-4 h-4 text-[#172554] absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por serviços (ex: canalização, babá, pintura)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] placeholder-slate-400 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium outline-none focus:border-[#172554] focus:ring-1 focus:ring-[#172554] shadow-xs transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#172554]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category selector pills */}
              <div className="flex gap-2 flex-wrap justify-center mb-10">
                <button 
                  onClick={() => setSelectedCategory("all")} 
                  className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer border ${
                    selectedCategory === "all" 
                      ? "bg-[#172554] text-white font-black border-[#172554] shadow-sm" 
                      : "bg-white text-slate-700 border-slate-200 hover:bg-[#172554] hover:!text-white hover:border-[#172554] hover:shadow-md"
                  }`}
                >
                  Ver Categorias
                </button>
                {SERVICES.map((cat) => (
                  <button 
                    key={cat.g}
                    onClick={() => setSelectedCategory(cat.g)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer border ${
                      selectedCategory === cat.g 
                        ? "bg-[#172554] text-white font-black border-[#172554] shadow-sm" 
                        : "bg-white text-slate-700 border-slate-200 hover:bg-[#172554] hover:!text-white hover:border-[#172554] hover:shadow-md"
                    }`}
                  >
                    {cat.icon} {cat.cat.split(" — ")[0]}
                  </button>
                ))}
              </div>

              {/* Catalog View */}
              {selectedCategory === "all" ? (
                /* MAIN GRID OF LARGE CATEGORY BOXES */
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6">
                    <div className="text-left">
                      <h2 className="font-serif text-2xl text-[#172554] font-bold tracking-wide">
                        Áreas de <span className="relative inline-block text-[#172554]">Serviço Disponíveis<span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 rounded-full animate-trace-line shadow-[0_0_8px_rgba(23,37,84,0.3)]" /></span>
                      </h2>
                      <p className="text-xs text-[#3B5998] tracking-wider uppercase font-mono font-extrabold mt-1">Especialidades Geridas pela TARIRA</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {SERVICES.map((cat) => {
                      const bgImg = categoryImages[cat.g] || categoryImages.dom;
                      return (
                        <div 
                          key={cat.g}
                          onClick={() => setSelectedCategory(cat.g)}
                          className="group category-interactive-card interactive-hover-blue relative rounded-3xl overflow-hidden border border-slate-200 hover:border-[#172554] cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between bg-white text-left"
                        >
                          {/* Top Image Banner */}
                          <div 
                            className="relative h-44 w-full bg-cover bg-center overflow-hidden transition-transform duration-500 group-hover:scale-105"
                            style={{ 
                              backgroundImage: `linear-gradient(to top, rgba(23, 37, 84, 0.4) 0%, rgba(23, 37, 84, 0.05) 100%), url(${bgImg})` 
                            }}
                          >
                            {/* File input for updating the image instantly (Admin Only) */}
                            {isAdminLoggedIn && (
                              <div 
                                className="absolute top-3 left-3 z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-[#172554] text-white text-[9px] font-bold border border-white/20 transition-all cursor-pointer shadow-md">
                                  <span className="text-[10px]">📷</span> Alterar Imagem
                                  <input 
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          const uploadedUrl = await uploadImageToImgBB(file);
                                          if (uploadedUrl) {
                                            const res = await fetch("/api/category-images", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                                              body: JSON.stringify({ category: cat.g, url: uploadedUrl })
                                            });
                                            if (res.ok) {
                                              setCategoryImages(prev => ({
                                                ...prev,
                                                [cat.g]: uploadedUrl
                                              }));
                                            } else {
                                              alert("Erro ao salvar no servidor.");
                                            }
                                          }
                                        } catch (err: any) {
                                          alert("Erro ao fazer upload da imagem: " + (err.message || err));
                                        } finally {
                                          setIsUploadingImgBB(false);
                                        }
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            )}

                            <div className="absolute top-3 right-3 text-xl p-2 rounded-xl bg-white/90 border border-slate-200 text-[#172554] shadow-xs backdrop-blur-xs group-hover:bg-[#172554] group-hover:!text-white group-hover:border-white/30 transition-all">
                              {cat.icon}
                            </div>
                          </div>
                          
                          {/* Card Body - turns blue with white text on hover */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white group-hover:bg-[#172554] transition-colors duration-300 group-hover-card-blue">
                            <div>
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#172554] group-hover:!text-white bg-blue-50 group-hover:!bg-white/20 border border-blue-200 group-hover:!border-white/30 px-2 py-0.5 rounded-full inline-block mb-1.5 card-kicker-hover transition-colors">
                                TARIRA CONNECT
                              </span>
                              <h3 className="font-serif text-lg text-[#172554] card-title-hover group-hover:!text-white transition-colors leading-tight font-bold">
                                {cat.cat}
                              </h3>
                              <p className="text-xs text-[#3B5998] card-subtitle-hover group-hover:!text-blue-100 font-mono mt-1 transition-colors">
                                {cat.items.length} serviços estruturados
                              </p>
                            </div>
                            
                            <div className="pt-2 border-t border-slate-100 group-hover:border-white/20 flex items-center justify-between transition-colors">
                              <span className="text-xs text-[#172554] card-cta-hover group-hover:!text-white font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-colors">
                                Ver Serviços →
                              </span>
                              <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase group-hover:!bg-emerald-500/25 group-hover:!text-emerald-200 group-hover:!border-emerald-400/40 transition-colors">
                                SLA Ativo
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* DETAILED CATEGORY SUB-PAGE */
                <div className="space-y-8 animate-fade-up">
                  {(() => {
                    const cat = SERVICES.find(c => c.g === selectedCategory);
                    if (!cat) return null;
                    
                    const bgImg = categoryImages[cat.g] || categoryImages.dom;
                    const filteredItems = cat.items.filter(item => 
                      item.n.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      item.d.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    return (
                      <>
                        {/* Sub-page Category Banner - Solid Blue Feature Card for high visual contrast */}
                        <div 
                          className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-blue-900 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#172554] text-white"
                          style={{ 
                            backgroundImage: `linear-gradient(to right, rgba(23, 37, 84, 0.95) 0%, rgba(23, 37, 84, 0.88) 50%, rgba(23, 37, 84, 0.75) 100%), url(${bgImg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          {/* Absolute position edit button for the banner (Admin Only) */}
                          {isAdminLoggedIn && (
                            <div 
                              className="absolute top-4 right-4 z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-[#172554] border border-white/30 text-[10px] font-bold transition-all cursor-pointer shadow-md">
                                <span>📷</span> Alterar Foto desta Área
                                <input 
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const uploadedUrl = await uploadImageToImgBB(file);
                                        if (uploadedUrl) {
                                          const res = await fetch("/api/category-images", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                                            body: JSON.stringify({ category: cat.g, url: uploadedUrl })
                                          });
                                          if (res.ok) {
                                            setCategoryImages(prev => ({
                                              ...prev,
                                              [cat.g]: uploadedUrl
                                            }));
                                          } else {
                                            alert("Erro ao salvar no servidor.");
                                          }
                                        }
                                      } catch (err: any) {
                                        alert("Erro ao fazer upload da imagem: " + (err.message || err));
                                      } finally {
                                        setIsUploadingImgBB(false);
                                      }
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          )}

                          <div className="relative z-10 max-w-2xl text-left space-y-3">
                            <button 
                              onClick={() => setSelectedCategory("all")}
                              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white text-white hover:text-[#172554] border border-white/25 text-[10px] font-bold transition-all inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                            >
                              ← Voltar ao Catálogo
                            </button>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-4xl sm:text-5xl">{cat.icon}</span>
                              <div>
                                <span className="text-[9px] font-mono text-blue-300 bg-black/30 px-2.5 py-0.5 rounded tracking-widest uppercase inline-block font-bold">
                                  Subpágina de Especialidade
                                </span>
                                <h2 className="font-serif text-2xl sm:text-3.5xl text-white font-bold leading-none mt-1 drop-shadow-md">{cat.cat}</h2>
                              </div>
                            </div>
                            <p className="text-xs text-blue-100 leading-relaxed max-w-xl">
                              Explore e contrate serviços regulados pela Tarira. Todos os profissionais passam por triagem de antecedentes criminais e testes técnicos.
                            </p>
                          </div>
                          
                          <div className="relative z-10 flex gap-3 flex-shrink-0">
                            <span className="px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/20 text-[10px] text-white font-semibold inline-flex items-center gap-1.5">
                              💼 {cat.items.length} Serviços
                            </span>
                            <span className="px-3.5 py-1.5 rounded-xl bg-blue-400 text-white font-bold uppercase tracking-wider text-[10px] shadow-sm">
                              🛡️ Supervisão SLA
                            </span>
                          </div>
                        </div>

                        {/* Items Grid with 90% white cards */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-[#3B5998] font-bold">Serviços Disponíveis para Contratação</span>
                            {searchQuery && (
                              <span className="text-[10px] text-[#172554] font-semibold font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                Filtrado por: "{searchQuery}"
                              </span>
                            )}
                          </div>

                          {filteredItems.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
                              <span className="text-3xl">🔍</span>
                              <p className="text-xs text-[#3B5998] mt-2 font-medium">Nenhum serviço correspondente encontrado para a sua pesquisa.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {filteredItems.map((item, i) => {
                                const subBgImg = getSubServiceImage(item, cat.g);
                                return (
                                  <div 
                                    key={i} 
                                    onClick={() => {
                                      setSelectedService(item);
                                      setSelectedServiceCat(cat.cat);
                                    }}
                                    className="relative subservice-hover-card interactive-hover-blue rounded-3xl p-5 border border-slate-200 hover:border-[#172554] hover:bg-[#172554] transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 shadow-xs hover:shadow-xl bg-white text-left"
                                  >
                                    {/* Upload Button for sub-service photo (Admin Only) */}
                                    {isAdminLoggedIn && (
                                      <div 
                                        className="absolute top-3 right-3 z-20"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-blue-600 text-white text-[9px] font-bold border border-white/20 transition-all cursor-pointer shadow-md">
                                          <span className="text-[10px]">📷</span> Alterar Foto
                                          <input 
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                try {
                                                  const uploadedUrl = await uploadImageToImgBB(file);
                                                  if (uploadedUrl) {
                                                    const res = await fetch("/api/subservice-images", {
                                                      method: "POST",
                                                      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                                                      body: JSON.stringify({ serviceName: item.n, url: uploadedUrl })
                                                    });
                                                    if (res.ok) {
                                                      setSubServiceImages(prev => ({
                                                        ...prev,
                                                        [item.n]: uploadedUrl
                                                      }));
                                                    } else {
                                                      alert("Erro ao salvar no servidor.");
                                                    }
                                                  }
                                                } catch (err: any) {
                                                  alert("Erro ao fazer upload da imagem: " + (err.message || err));
                                                } finally {
                                                  setIsUploadingImgBB(false);
                                                }
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                    )}

                                    <div className="space-y-2">
                                      <div className="flex justify-between items-start gap-2 mb-1 pr-14">
                                        <span className="font-bold text-base text-[#172554] group-hover:!text-white subservice-title-hover transition-colors leading-snug">
                                          {item.n}
                                        </span>
                                      </div>
                                      {item.emg && (
                                        <span className="text-[9px] bg-red-50 group-hover:!bg-red-500/25 text-red-700 group-hover:!text-red-100 border border-red-200 group-hover:!border-red-300/40 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider inline-block transition-colors">
                                          🚨 EMERGÊNCIA EM HORÁRIO DE ATIVIDADE
                                        </span>
                                      )}
                                      <div className="bg-slate-50 group-hover:!bg-white/10 p-3.5 rounded-2xl border border-slate-100 group-hover:!border-white/20 text-left my-2 transition-colors">
                                        <p className="text-xs text-[#3B5998] group-hover:!text-blue-100 subservice-desc-hover font-medium leading-relaxed transition-colors">
                                          {item.d.slice(0, 110)}{item.d.length > 110 ? "..." : ""}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Tailored Estimate & Simulator Badge */}
                                    <div className="flex items-center justify-between border-t border-slate-100 group-hover:border-white/20 pt-3 mt-3 gap-2 transition-colors">
                                      <span className="text-[10px] text-[#172554] group-hover:!text-white font-mono font-bold inline-flex items-center gap-1 bg-blue-50 group-hover:!bg-white/15 px-2.5 py-1 rounded-lg border border-blue-200 group-hover:!border-white/25 transition-colors">
                                        <span>📋</span> Orçamento Sob Medida
                                      </span>
                                      <span className="card-invert-btn text-[10px] font-bold text-white group-hover:!text-[#172554] font-mono bg-[#172554] group-hover:!bg-white px-3 py-1 rounded-lg shadow-xs transition-colors">
                                        ✨ Simulador →
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Synchronized Partner Stores Banner */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 text-left shadow-xs mt-8 text-[#172554]">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                            <div>
                              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#172554] uppercase tracking-wider mb-1">
                                🏬 LOJAS PARCEIRAS RECOMENDADAS TARIRA CONNECT
                              </div>
                              <h3 className="font-serif text-xl sm:text-2xl text-[#172554] font-bold">Compre Materiais com Garantia & Desconto Exclusivo</h3>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                              🛡️ Qualidade Certificada TARIRA
                            </span>
                          </div>

                          <p className="text-xs text-[#3B5998] leading-relaxed">
                            Incentivamos a aquisição de materiais de construção, tintas, componentes elétricos, ferramentas e peças nas nossas lojas parceiras credenciadas. Garantimos produtos 100% autênticos com suporte direto do fabricante e <strong>até 15% de Desconto Exclusivo</strong> para clientes do ecossistema TARIRA.
                          </p>

                          {partnerStores.filter(s => s.active && (s.category === cat.g || s.category === "hardware" || cat.g === "all")).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                              {partnerStores
                                .filter(s => s.active && (s.category === cat.g || s.category === "hardware" || cat.g === "all"))
                                .slice(0, 6)
                                .map((store) => (
                                  <div key={store.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 shadow-xs">
                                    <div>
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="text-[9px] font-mono text-[#172554] font-bold uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                          {store.categoryLabel}
                                        </span>
                                        <span className="text-xs">🏪</span>
                                      </div>
                                      <h4 className="font-bold text-[#172554] text-sm mt-1">{store.name}</h4>
                                      <p className="text-[11px] text-emerald-700 font-bold mt-1">🏷️ {store.discountInfo}</p>
                                      <p className="text-[10px] text-slate-500 mt-2 font-mono">📍 {store.address}</p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
                                      <span className="text-slate-600 font-mono">📞 {store.phone}</span>
                                      <span className="text-[#172554] font-bold">Garantia Ativa ✓</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 py-6">
                              🏪 Nenhuma loja parceira credenciada nesta categoria de momento. Novas lojas são adicionadas via painel administrativo.
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

            {/* Service Detail Modal */}
            {selectedService && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start sm:items-center">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative border border-slate-200 shadow-2xl text-left space-y-4 my-auto text-[#172554]">
                  <button 
                    onClick={() => setSelectedService(null)} 
                    className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 z-30"
                    title="Fechar"
                    aria-label="Fechar"
                  >
                    <span className="text-base sm:text-lg leading-none font-bold">✕</span>
                  </button>
                  
                  <div>
                    <span className="text-3xl block mb-1 text-left">🔧</span>
                    <span className="text-[10px] tracking-widest text-[#3B5998] font-bold uppercase block mb-1 text-left">{selectedServiceCat}</span>
                    <h3 className="font-serif text-2xl text-[#172554] font-bold text-left">{selectedService.n}</h3>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-xs text-[#172554] leading-relaxed font-sans font-medium text-left">
                      {selectedService.d}
                    </p>
                  </div>

                  {/* Solid Blue Estimated Customizable Value Frame */}
                  <div className="bg-[#172554] rounded-2xl p-4 text-left space-y-2 shadow-md text-white">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
                      <span>🧮</span> Estimativa Customizada & Simulador de Pedidos
                    </div>
                    <p className="text-xs text-blue-100 leading-relaxed font-sans font-medium">
                      A duração provável e o valor orçamental são definidos após indicar a descrição do pedido (espaço, horas estimadas e tarefas requeridas).
                    </p>
                  </div>

                  {/* Synchronized Partner Stores Recommendation Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#172554] uppercase tracking-wider flex items-center gap-1">
                        <span>🏬</span> Lojas Parceiras Recomendadas para Materiais
                      </span>
                      <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">100% Qualidade & Garantia</span>
                    </div>
                    <p className="text-[11px] text-[#3B5998] leading-snug">
                      Incentivamos a compra de materiais e equipamentos nas lojas oficiais parceiras TARIRA para garantir máxima durabilidade, certificado de garantia e até <strong>15% de Desconto Exclusivo</strong>.
                    </p>
                    {partnerStores.filter(s => s.active && (s.category === (SERVICES.find(c => c.cat === selectedServiceCat)?.g || "painting") || s.category === "hardware")).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {partnerStores
                          .filter(s => s.active && (s.category === (SERVICES.find(c => c.cat === selectedServiceCat)?.g || "painting") || s.category === "hardware"))
                          .slice(0, 2)
                          .map(store => (
                            <div key={store.id} className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-[10px] text-[#172554] flex-1 min-w-[140px] shadow-xs">
                              <span className="font-bold text-[#172554] block">{store.name}</span>
                              <span className="text-[9px] text-emerald-700 font-bold block">{store.discountInfo}</span>
                              <span className="text-[8px] text-slate-500 block font-mono">📞 {store.phone}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {selectedService.emg && (
                    <div className="bg-blue-50 border border-blue-200 text-[#172554] rounded-2xl p-3 text-xs leading-relaxed text-left font-sans shadow-xs">
                      <p className="font-bold text-[#172554] flex items-center gap-1.5 mb-1 text-xs">
                        <span>🚨</span> Atendimento em Horário de Atividade
                      </p>
                      <div className="space-y-0.5 text-slate-700 text-[11px]">
                        <p>• <strong>Horário:</strong> Seg a Sex (08h–17h30) | Sáb (08h–13h)</p>
                        <p>• <strong>Feedback Inicial:</strong> SLA de 30 min para confirmação técnica</p>
                        <p className="text-slate-500 text-[10px] pt-0.5"><em>(Pedidos no horário são atendidos até à conclusão. Sem cobertura de emergência fora de horas).</em></p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-1">
                    <button 
                      onClick={() => {
                        const targetCategory = SERVICES.find(c => c.cat === selectedServiceCat)?.g || "all";
                        setServiceHiringTarget({
                          serviceName: selectedService.n,
                          category: targetCategory,
                          categoryTitle: selectedServiceCat,
                          basePrice: selectedService.p
                        });
                        setSelectedService(null);
                        setClientSelectedCategory(targetCategory);
                        setSelectedProfessional(null);
                        setActiveTab("client_find");
                      }}
                      className="w-full py-3.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold transition-all flex justify-center items-center gap-2 cursor-pointer shadow-md uppercase tracking-wider"
                    >
                      🎯 Contratar Prestador para este Serviço →
                    </button>
                    
                    <button 
                      onClick={() => {
                        setSelectedService(null);
                        setActiveTab("apply");
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[#172554] text-[11px] font-bold transition-all flex justify-center items-center gap-2 cursor-pointer"
                    >
                      👷 Quero Registar-me para Fornecer este serviço →
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ════════════════════════ ANALYTICS TAB ════════════════════════ */}
        {false && activeTab === "analytics" && (
          <div id="s-analytics" className="flex-1 overflow-auto p-6 sm:p-10 animate-fade-up">
            <div className="max-w-6xl mx-auto w-full">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold/8 pb-5 mb-6">
                <div>
                  <span className="text-xs text-mist/35 font-medium leading-none block mb-1">DASHBOARD EXECUTIVO NACIONAL</span>
                  <h1 className="font-serif text-3xl font-light tracking-wide text-ivory/95">Métricas de Desempenho</h1>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-sage font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-sage animate-ping"></span> Live • Actualizado agora
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1 bg-deep border border-gold/10 p-1.5 rounded-xl mb-6 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveAnalyticsTab("overview")} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "overview" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
                >
                  📊 Visão Geral
                </button>
                <button 
                  onClick={() => setActiveAnalyticsTab("efficiency")} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "efficiency" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
                >
                  ⚡ Eficiência
                </button>
                <button 
                  onClick={() => setActiveAnalyticsTab("quality")} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "quality" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
                >
                  ⭐ Qualidade
                </button>
                <button 
                  onClick={() => setActiveAnalyticsTab("financial")} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "financial" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
                >
                  💰 Financeiro
                </button>
                <button 
                  onClick={() => setActiveAnalyticsTab("geo")} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeAnalyticsTab === "geo" ? "bg-gold/12 text-gold" : "text-mist/40 hover:text-ivory"}`}
                >
                  🗺️ Geográfico
                </button>
              </div>

              {/* Visual Panels depending on active analytics sub-tab */}
              {activeAnalyticsTab === "overview" && (
                <div className="space-y-6 animate-fade-up">
                  {/* Indicators */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-panel rounded-2xl p-5">
                      <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">RECEITA RECORRENTE (MRR)</span>
                      <span className="font-serif text-2xl text-gold block font-semibold leading-tight">520K MZN</span>
                      <span className="text-[10px] text-sage font-medium mt-1 inline-block">↑ +28% vs Mês anterior</span>
                    </div>
                    <div className="glass-panel rounded-2xl p-5">
                      <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">PRESTADORES VERIFICADOS</span>
                      <span className="font-serif text-2xl block font-semibold leading-tight">2.1K</span>
                      <span className="text-[10px] text-sage font-medium mt-1 inline-block">↑ +42 este mês</span>
                    </div>
                    <div className="glass-panel rounded-2xl p-5">
                      <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">JOB FILL RATE</span>
                      <span className="font-serif text-2xl text-sage block font-semibold leading-tight">88%</span>
                      <span className="text-[10px] text-sage font-medium mt-1 inline-block">Meta: 80% atingida ✓</span>
                    </div>
                    <div className="glass-panel rounded-2xl p-5">
                      <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">MÉDIA DE AVALIAÇÕES</span>
                      <span className="font-serif text-2xl text-gold block font-semibold leading-tight">4.7 / 5.0</span>
                      <span className="text-[10px] text-mist/35 mt-1 inline-block">1.2K avaliações físicas</span>
                    </div>
                  </div>

                  {/* MRR Progress Bar Chart (Faithful CSS reconstruction) */}
                  <div className="glass-panel rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-serif text-lg text-gold font-light">MRR vs Meta — 2025</h3>
                        <p className="text-[10px] text-mist/30">Valores expressos em milhares de MZN</p>
                      </div>
                      <span className="badge b-sage text-[9px] uppercase">Jan - Ago</span>
                    </div>

                    {/* Chart Container */}
                    <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 border-b border-gold/10">
                      {[
                        { month: "Jan", val: 120, target: 150 },
                        { month: "Fev", val: 185, target: 180 },
                        { month: "Mar", val: 210, target: 200 },
                        { month: "Abr", val: 265, target: 250 },
                        { month: "Mai", val: 340, target: 320 },
                        { month: "Jun", val: 410, target: 380 },
                        { month: "Jul", val: 480, target: 450 },
                        { month: "Ago", val: 520, target: 500 }
                      ].map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 max-w-[50px]">
                          <span className="text-[9px] text-gold/80 font-bold font-mono">{d.val}K</span>
                          <div className="w-full bg-gradient-to-t from-bronze to-gold rounded-t-md transition-all duration-500" style={{ height: `${(d.val / 520) * 110}px` }}></div>
                          <div className="w-full h-0.5 bg-mist/20"></div>
                          <span className="text-[9px] text-mist/30 font-mono mt-0.5">{d.month}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 mt-4">
                      <span className="text-[10px] text-gold/75 inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-1 bg-gold rounded-sm block"></span> Receita Registada
                      </span>
                      <span className="text-[10px] text-mist/30 inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-1 bg-gradient-to-r from-mist/20 to-mist/40 rounded-sm block"></span> Meta Projectada
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weekly fill rate */}
                    <div className="glass-panel rounded-2xl p-6">
                      <h3 className="font-serif text-lg text-gold font-light mb-6">Taxa de Preenchimento Semanal (%)</h3>
                      <div className="flex items-end justify-between gap-3 h-32 pb-2 border-b border-gold/10">
                        {[62, 71, 68, 79, 82, 78, 85, 88].map((val, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px] text-mist/35 font-mono">{val}%</span>
                            <div className="w-full bg-gradient-to-t from-gold/40 to-gold rounded-t-sm" style={{ height: `${val}%` }}></div>
                            <span className="text-[9px] text-mist/30 font-mono mt-0.5">S{i+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quality Ratings bars */}
                    <div className="glass-panel rounded-2xl p-6">
                      <h3 className="font-serif text-lg text-gold font-light mb-4">Distribuição de Avaliações</h3>
                      <div className="space-y-3 pt-2">
                        {[
                          { rating: "5⭐", pct: 58, color: "bg-gold" },
                          { rating: "4⭐", pct: 28, color: "bg-bronze" },
                          { rating: "3⭐", pct: 10, color: "bg-cobalt" },
                          { rating: "2⭐", pct: 3, color: "bg-copper" },
                          { rating: "1⭐", pct: 1, color: "bg-red-500" }
                        ].map((r, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-mist/40 w-6 font-mono">{r.rating}</span>
                            <div className="flex-1 h-2 bg-night rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }}></div>
                            </div>
                            <span className="text-xs text-mist/35 w-8 text-right font-mono">{r.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {activeAnalyticsTab === "efficiency" && (
                <div className="space-y-6 animate-fade-up">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-panel rounded-xl p-5">
                      <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">TIME-TO-HIRE</span>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="font-serif text-3xl font-semibold text-sage">9</span>
                        <span className="text-xs text-mist/45">dias</span>
                      </div>
                      <div className="h-1.5 bg-night rounded-full overflow-hidden">
                        <div className="h-full bg-sage" style={{ width: "60%" }}></div>
                      </div>
                      <span className="text-[9px] text-mist/30 block mt-2">Meta: ≤ 15 dias ✓</span>
                    </div>

                    <div className="glass-panel rounded-xl p-5">
                      <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">JOB FILL RATE</span>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="font-serif text-3xl font-semibold text-gold">88%</span>
                      </div>
                      <div className="h-1.5 bg-night rounded-full overflow-hidden">
                        <div className="h-full bg-gold" style={{ width: "88%" }}></div>
                      </div>
                      <span className="text-[9px] text-mist/30 block mt-2">Meta: 80% • +8pp</span>
                    </div>

                    <div className="glass-panel rounded-xl p-5">
                      <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">PRECISÃO DO MATCH</span>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="font-serif text-3xl font-semibold text-gold">82%</span>
                      </div>
                      <div className="h-1.5 bg-night rounded-full overflow-hidden">
                        <div className="h-full bg-gold" style={{ width: "82%" }}></div>
                      </div>
                      <span className="text-[9px] text-mist/30 block mt-2">Meta: 85% • Excelente</span>
                    </div>

                    <div className="glass-panel rounded-xl p-5">
                      <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">RESPOSTA EMERGÊNCIA</span>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="font-serif text-3xl font-semibold text-sage">22</span>
                        <span className="text-xs text-mist/45">min</span>
                      </div>
                      <div className="h-1.5 bg-night rounded-full overflow-hidden">
                        <div className="h-full bg-sage" style={{ width: "73%" }}></div>
                      </div>
                      <span className="text-[9px] text-mist/30 block mt-2">Meta: ≤ 30min ✓</span>
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl p-6">
                    <h3 className="font-serif text-lg text-gold font-light mb-4">Média de Time-to-Hire por Categoria (Dias)</h3>
                    <div className="space-y-4 pt-2">
                      {[
                        { category: "Doméstico", days: 5, pct: 33 },
                        { category: "Técnico Especializado", days: 8, pct: 53 },
                        { category: "Profissional Técnico", days: 14, pct: 93 },
                        { category: "Construção & Obras", days: 10, pct: 66 },
                        { category: "Jardinagem", days: 4, pct: 26 }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-xs font-semibold text-mist/45 w-32 flex-shrink-0">{item.category}</span>
                          <div className="flex-1 h-2.5 bg-night rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-copper to-gold rounded-full" style={{ width: `${item.pct}%` }}></div>
                          </div>
                          <span className="text-xs text-gold font-bold font-mono w-8 text-right">{item.days}d</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeAnalyticsTab === "quality" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
                  <div className="glass-panel rounded-xl p-5">
                    <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">PROMISE COMPLIANCE</span>
                    <span className="font-serif text-2xl text-sage block font-semibold leading-none mb-1">96%</span>
                    <div className="h-1 bg-night rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-sage" style={{ width: "96%" }}></div>
                    </div>
                    <p className="text-[10px] text-mist/40">Acordo de presença física e SLA.</p>
                  </div>
                  <div className="glass-panel rounded-xl p-5">
                    <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">VERIFICATION RATE</span>
                    <span className="font-serif text-2xl text-gold block font-semibold leading-none mb-1">68%</span>
                    <div className="h-1 bg-night rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gold" style={{ width: "68%" }}></div>
                    </div>
                    <p className="text-[10px] text-mist/40">Profissionais verificados presencialmente.</p>
                  </div>
                  <div className="glass-panel rounded-xl p-5">
                    <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">AVALIAÇÃO MÉDIA</span>
                    <span className="font-serif text-2xl text-gold block font-semibold leading-none mb-1">4.7 ⭐</span>
                    <div className="h-1 bg-night rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gold" style={{ width: "94%" }}></div>
                    </div>
                    <p className="text-[10px] text-mist/40">Meta global de excelência: 4.5</p>
                  </div>
                  <div className="glass-panel rounded-xl p-5">
                    <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">TAXA DE RETENÇÃO</span>
                    <span className="font-serif text-2xl text-sage block font-semibold leading-none mb-1">88%</span>
                    <div className="h-1 bg-night rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-sage" style={{ width: "88%" }}></div>
                    </div>
                    <p className="text-[10px] text-mist/40">Re-contratados no ecossistema.</p>
                  </div>
                </div>
              )}

              {activeAnalyticsTab === "financial" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
                  <div className="glass-panel rounded-xl p-5">
                    <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">MRR GLOBAL</span>
                    <span className="font-serif text-2xl text-gold block font-semibold leading-none mb-1">520.000 MZN</span>
                    <div className="h-1 bg-night rounded-full overflow-hidden mt-3 mb-1">
                      <div className="h-full bg-gold" style={{ width: "100%" }}></div>
                    </div>
                    <p className="text-[10px] text-sage">104% da meta para Agosto</p>
                  </div>
                  <div className="glass-panel rounded-xl p-5">
                    <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">TARIRA REVENUE (18%-20% FEE)</span>
                    <span className="font-serif text-2xl text-copper block font-semibold leading-none mb-1">78.000 MZN</span>
                    <div className="h-1 bg-night rounded-full overflow-hidden mt-3 mb-1">
                      <div className="h-full bg-copper" style={{ width: "94%" }}></div>
                    </div>
                    <p className="text-[10px] text-mist/35">Taxa de intermediação acumulada</p>
                  </div>
                  <div className="glass-panel rounded-xl p-5">
                    <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">CUSTOMER LTV</span>
                    <span className="font-serif text-2xl text-gold block font-semibold leading-none mb-1">115.800 MZN</span>
                    <div className="h-1 bg-night rounded-full overflow-hidden mt-3 mb-1">
                      <div className="h-full bg-gold" style={{ width: "96%" }}></div>
                    </div>
                    <p className="text-[10px] text-mist/35">Valor de vida útil projectado</p>
                  </div>
                  <div className="glass-panel rounded-xl p-5">
                    <span className="text-[8px] tracking-wider text-mist/30 font-bold uppercase block mb-1">CHURN RATE</span>
                    <span className="font-serif text-2xl text-sage block font-semibold leading-none mb-1">3.2%</span>
                    <div className="h-1 bg-night rounded-full overflow-hidden mt-3 mb-1">
                      <div className="h-full bg-sage" style={{ width: "64%" }}></div>
                    </div>
                    <p className="text-[10px] text-sage">Meta: &lt; 5% ✓ Excelente</p>
                  </div>
                </div>
              )}

              {activeAnalyticsTab === "geo" && (
                <div className="glass-panel rounded-2xl p-6 animate-fade-up">
                  <h3 className="font-serif text-lg text-gold font-light mb-6">Prestadores & Serviços por Província (Moçambique)</h3>
                  <div className="space-y-6">
                    {[
                      { prov: "Maputo", providers: 48, jobs: 142, pctJobs: 100, pctProv: 100 },
                      { prov: "Gaza", providers: 12, jobs: 28, pctJobs: 20, pctProv: 25 },
                      { prov: "Sofala", providers: 18, jobs: 45, pctJobs: 31, pctProv: 37 },
                      { prov: "Nampula", providers: 22, jobs: 51, pctJobs: 35, pctProv: 45 },
                      { prov: "Zambézia", providers: 9, jobs: 18, pctJobs: 12, pctProv: 18 },
                      { prov: "Cabo Delgado", providers: 6, jobs: 12, pctJobs: 8, pctProv: 12 }
                    ].map((d, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="text-xs font-semibold text-mist/50 w-32 flex-shrink-0">{d.prov}</span>
                        <div className="flex-1 space-y-1">
                          {/* Jobs */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-night rounded-full overflow-hidden">
                              <div className="h-full bg-gold" style={{ width: `${d.pctJobs}%` }}></div>
                            </div>
                            <span className="text-[10px] font-semibold text-gold font-mono w-20 flex-shrink-0">{d.jobs} obras</span>
                          </div>
                          {/* Providers */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-night rounded-full overflow-hidden">
                              <div className="h-full bg-copper" style={{ width: `${d.pctProv}%` }}></div>
                            </div>
                            <span className="text-[10px] font-semibold text-copper font-mono w-20 flex-shrink-0">{d.providers} técnicos</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ════════════════════════ CANDIDATURA / REGISTO DE PRESTADOR DE OFÍCIO TAB ════════════════════════ */}
        {activeTab === "apply" && (
          <div id="s-apply" className="flex-1 overflow-y-auto p-2 sm:p-6 md:p-8 flex flex-col items-center justify-start animate-fade-up w-full">
            <div className="max-w-4xl w-full">
              <StandardRegistrationForm
                lockRole="prestador"
                onSuccess={(res: any) => {
                  fetchBackendData();
                  if (res?.candidate) {
                    setSelectedProfessional(res.candidate);
                  } else if (res?.candidateId) {
                    const found = candidates.find(c => c.id === res.candidateId);
                    if (found) setSelectedProfessional(found);
                  }
                  setActiveTab("professional_profile");
                }}
                onCancel={() => {
                  handleGoBack();
                }}
              />
            </div>
          </div>
        )}

        {/* ════════════════════════ CANDIDATURA / REGISTO DE PROFISSIONAL QUALIFICADO TAB ════════════════════════ */}
        {activeTab === "spontaneous_apply" && (
          <div id="s-spontaneous-apply" className="flex-1 overflow-y-auto p-2 sm:p-6 md:p-8 flex flex-col items-center justify-start animate-fade-up w-full">
            <div className="max-w-4xl w-full">
              <StandardRegistrationForm
                lockRole="profissional"
                onSuccess={(res: any) => {
                  fetchBackendData();
                  if (res?.candidate) {
                    setSelectedProfessional(res.candidate);
                  } else if (res?.candidateId) {
                    const found = candidates.find(c => c.id === res.candidateId);
                    if (found) setSelectedProfessional(found);
                  }
                  setActiveTab("professional_profile");
                }}
                onCancel={() => {
                  handleGoBack();
                }}
              />
            </div>
          </div>
        )}


        {/* ════════════════════════ DIRETÓRIO DE TÉCNICOS & OFÍCIOS (TARIRA CONNECT) ════════════════════════ */}
        {activeTab === "client_find" && (
          <TariraTechniciansDirectory
            candidates={candidates}
            setActiveTab={setActiveTab}
            onGoBack={handleGoBack}
            onSelectCandidate={(cand) => {
              setSelectedProfessional(cand);
              setIsHireModalOpen(true);
            }}
            onViewCandidate={(cand) => {
              if (checkVisitorAccess("VER_CONTACTO")) {
                setViewCandidateModal(cand);
              }
            }}
            onRequestBriefing={() => {
              if (checkVisitorAccess("BRIEFING_SUBMIT")) {
                setIsBriefingFormOpen(true);
              }
            }}
            onContactCommercial={() => setIsCommercialModalOpen(true)}
            checkAccess={checkVisitorAccess}
            userRole={resolvedUserRole}
            userEmail={supabaseUser?.email || supabaseProfile?.email}
            currentLang={currentLang}
            initialCategory={clientSelectedCategory || "all"}
          />
        )}

        {/* ════════════════════════ GALERIA DE PROFISSIONAIS (TARIRA RECRUIT) ════════════════════════ */}
        {activeTab === "profissionais" && (
          <TariraProfessionalsGallery
            candidates={candidates}
            setActiveTab={setActiveTab}
            initialSpecialty={recruitSelectedCategory}
            initialCandidateId={recruitSelectedCandidateId || undefined}
            onGoBack={handleGoBack}
            userRole={resolvedUserRole}
            userEmail={supabaseUser?.email || supabaseProfile?.email}
            currentCandidateId={selectedProfessional?.id}
            onOpenRegisterModal={(initialType) => {
              setLoginRole(initialType || "company");
              setLoginMode("register");
              setIsSupabaseAuthOpen(true);
            }}
            onSelectCandidate={(cand) => {
              setSelectedProfessional(cand);
              setIsHireModalOpen(true);
            }}
            onViewCandidate={(cand) => {
              setViewCandidateModal(cand);
            }}
            onViewPortfolio={(cand) => {
              setPortfolioCandidateModal(cand);
            }}
            onRequestBriefing={() => {
              if (checkVisitorAccess("BRIEFING_SUBMIT")) {
                setIsBriefingFormOpen(true);
              }
            }}
            onContactCommercial={() => setIsCommercialModalOpen(true)}
            checkAccess={checkVisitorAccess}
            currentLang={currentLang}
          />
        )}

        {/* ════════════════════════ PORTAL DE EMPRESAS REGISTADAS ════════════════════════ */}
        {activeTab === "registered_companies" && (
          <RegisteredCompaniesPortal
            clients={clients}
            partnerCompanies={partnerCompanies}
            setActiveTab={setActiveTab}
            onGoBack={handleGoBack}
            onRequestBriefing={(companyName) => {
              setBriefingTargetCompany(companyName || "");
              if (checkVisitorAccess("BRIEFING_SUBMIT")) {
                setIsBriefingFormOpen(true);
              }
            }}
            onRequestOutsourcing={() => {
              setActiveTab("business_sub");
            }}
            onOpenAuthModal={(mode, reason) => {
              setLoginMode(mode);
              setGuestGateReason(reason || null);
              setIsSupabaseAuthOpen(true);
            }}
            currentLang={currentLang}
          />
        )}

        {/* ════════════════════════ CENTRAL DE CONTROLO & GESTÃO OPERACIONAL ════════════════════════ */}
        {(activeTab === "central" || activeTab === "central_ops" || activeTab === "admin") && (
          <div id="s-central-ops" className="flex-1 overflow-auto p-4 sm:p-8 pt-28 sm:pt-32 lg:pt-28 animate-fade-up">
            {/* GATE DE SEGURANÇA: a Central Operacional (edição/eliminação de
                prestadores, clientes e operadores) antes renderizava sempre
                que activeTab="admin"/"central" — o "isAdminLoggedIn" passado
                ao TariraCentralModule não era verificado dentro do próprio
                componente, por isso qualquer sessão (mesmo Empresa, Lar ou
                Técnico) que chegasse a este separador via estado antigo/
                manipulação via devtools via a Central completa, incluindo
                editar e eliminar perfis de terceiros. Corrigido: sem
                isEffectiveAdmin, mostra-se apenas o aviso de acesso restrito. */}
            {!isEffectiveAdmin ? (
              <div className="max-w-lg mx-auto text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-3xl mb-4 mx-auto text-red-600">🔒</div>
                <h2 className="text-xl font-serif font-bold text-[#172554] mb-2">Acesso Restrito</h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">Esta área é exclusiva da equipa TARIRA. Inicie sessão com uma conta de Administrador para continuar.</p>
                <button onClick={() => setActiveTab("landing")} className="px-5 py-2.5 rounded-xl bg-[#172554] text-white text-xs font-bold hover:bg-[#1A3478] transition-all shadow-sm cursor-pointer">Voltar ao Início</button>
              </div>
            ) : (
            <>
            {/* Quick Admin Hub Switcher */}
            {isEffectiveAdmin && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-900/90 border border-blue-400/40 shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 text-lg">🛡️</span>
                  <div>
                    <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wide">Painel do Administrador Geral</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Gestão unificada e controlo integral do ecossistema TARIRA</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "admin" || activeTab === "central" ? "bg-blue-500 text-white shadow-md font-black" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    🎯 Central Operacional
                  </button>
                  <button
                    onClick={() => setActiveTab("commercial_admin")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "commercial_admin" ? "bg-blue-500 text-white shadow-md font-black" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    🏢 Gestão Comercial
                  </button>
                  <button
                    onClick={() => setActiveTab("organization_audit")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "organization_audit" ? "bg-blue-500 text-white shadow-md font-black" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    🛡️ Auditoria & Operadores
                  </button>
                  <button
                    onClick={() => setActiveTab("registered_companies")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    🏛️ Empresas
                  </button>
                </div>
              </div>
            )}
            <TariraCentralModule
              candidates={candidates}
              hires={hires}
              clients={clients}
              activeOperator={activeOperator}
              isAdminLoggedIn={isEffectiveAdmin}
              operators={orgOperators}
              onAddOperator={async (newOp) => {
                await handleCreateOperatorDirect(newOp);
                triggerOperationLog("CRIAR_OPERADOR", "Novo operador/admin criado: " + newOp.name);
              }}
              onAddClient={async (newCl) => {
                await handleCreateClientDirect(newCl);
                triggerOperationLog("CRIAR_CLIENTE", "Novo cliente/empresa registado: " + newCl.name);
              }}
              categoryImages={categoryImages}
              onUpdateCategoryImages={(imgs) => setCategoryImages(imgs)}
              subServiceImages={subServiceImages}
              onUpdateSubServiceImages={(imgs) => setSubServiceImages(imgs)}
              landingBanners={landingBanners}
              onUpdateLandingBanners={setLandingBanners}
              partnerCompanies={partnerCompanies}
              onUpdatePartnerCompanies={setPartnerCompanies}
              paymentOrders={paymentOrders}
              onUpdatePaymentOrders={setPaymentOrders}
              spontaneousApplications={spontaneousApplications}
              onUpdateSpontaneousApplications={setSpontaneousApplications}
              proposals={commercialProposals}
              onUpdateProposals={setCommercialProposals}
              onAddHire={(newHire) => {
                setHires((prev) => [newHire, ...prev]);
                triggerOperationLog("CRIAR_PEDIDO_MANUAL", "Novo pedido criado: " + newHire.serviceName);
              }}
              onUpdateHire={(updHire) => {
                setHires((prev) => prev.map((h) => (h.id === updHire.id ? updHire : h)));
                triggerOperationLog("EDITAR_PEDIDO", "Pedido #" + updHire.id + " atualizado.");
              }}
              onDeleteHire={(hireId, reason) => {
                setHires((prev) => prev.filter((h) => h.id !== hireId));
                triggerOperationLog("ELIMINAR_PEDIDO", "Pedido #" + hireId + " eliminado. Motivo: " + (reason || "N/A"));
              }}
              onUpdateOperator={async (updOp) => {
                await handleUpdateOperatorDirect(updOp);
                triggerOperationLog("EDITAR_OPERADOR", `Operador ${updOp.name} (#${updOp.id}) atualizado.`);
              }}
              onDeleteOperator={async (opId) => {
                const opName = orgOperators.find((o) => o.id === opId)?.name || opId;
                await handleDeleteOperatorDirect(opId);
                triggerOperationLog("ELIMINAR_OPERADOR", `Operador ${opName} (#${opId}) eliminado.`);
              }}
              onUpdateClient={async (updCl) => {
                await handleUpdateClientDirect(updCl);
                triggerOperationLog("EDITAR_CLIENTE", `Cliente ${updCl.name} (#${updCl.id}) atualizado.`);
              }}
              onDeleteClient={async (clId) => {
                const clName = clients.find((c) => c.id === clId)?.name || clId;
                await handleDeleteClientDirect(clId);
                triggerOperationLog("ELIMINAR_CLIENTE", `Cliente ${clName} (#${clId}) eliminado.`);
              }}
              onUpdateCandidate={async (updated) => {
                await handleUpdateCandidateDirect(updated);
                triggerOperationLog("EDITAR_PRESTADOR", `Perfil ${updated.name} ${updated.surname || ""} (#${updated.id}) atualizado na Central.`);
              }}
              onDeleteCandidate={async (candId, auditData) => {
                await handleDeleteCandidateDirect(candId, auditData);
                triggerOperationLog("ELIMINAR_PRESTADOR", "Prestador " + candId + " eliminado. Motivo: " + (auditData?.reason || "N/A"));
              }}
              onCreateCandidate={async (newCand) => {
                const created: Candidate = {
                  ...newCand,
                  id: newCand.id || "cand-" + Date.now(),
                  name: newCand.name || "Novo Prestador",
                  surname: newCand.surname || "",
                  category: (newCand.category as any) || "tech",
                  title: newCand.title || (newCand.isProfessional ? "Especialista Corporativo" : "Técnico Especialista"),
                  rating: newCand.rating || 5.0,
                  reviewsCount: newCand.reviewsCount || 0,
                  city: newCand.city || "Maputo",
                  experienceYears: newCand.experienceYears || 3,
                  hourlyRate: newCand.hourlyRate || 500,
                  rateMzn: newCand.rateMzn || (newCand.hourlyRate ? newCand.hourlyRate * 8 : 3500),
                  availableNow: newCand.availableNow ?? true,
                  availableForEmergency: newCand.availableForEmergency ?? !newCand.isProfessional,
                  // isProfessional TEM de refletir exatamente o tipo escolhido no formulário
                  // (Prestador/Ofício vs Profissional/Quadro), nunca ficar indefinido —
                  // é este campo que decide se o perfil aparece em "Técnicos de Campo" ou "Talentos e Quadros".
                  isProfessional: newCand.isProfessional === true,
                  status: newCand.status || "approved",
                  phone: newCand.phone || "+258 84 000 0000",
                  email: newCand.email || "prestador@tarira.co.mz",
                  // Sem foto, o perfil fica invisível nas listagens públicas (Talentos e Quadros /
                  // Técnicos de Campo exigem c.photo preenchido) — garantir sempre um avatar por defeito.
                  photo: newCand.photo || (newCand.isProfessional
                    ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
                    : "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400"),
                  bio: newCand.bio || "Profissional qualificado verificado pelo ecossistema Tarira.",
                  skills: newCand.skills || [],
                  timestamp: newCand.timestamp || new Date().toISOString()
                };
                // Persiste no backend (handleCreateCandidateDirect) em vez de apenas manter
                // o registo em memória — garante que o perfil sobrevive a um refresh e que
                // aparece de imediato em todas as listagens (Connect e Recruit) que partilham
                // o mesmo array "candidates".
                const createResult = await handleCreateCandidateDirect(created);
                if (createResult?.success) {
                  triggerOperationLog("CRIAR_PRESTADOR", "Novo perfil registado: " + created.name);
                }
              }}
              onUpdateHireStatus={async (hireId, newStatus, notes) => {
                setHires((prev) => prev.map((h) => (h.id === hireId ? { ...h, status: newStatus, notes: notes || h.notes } : h)));
                triggerOperationLog("ATUALIZAR_ESTADO_PEDIDO", "Pedido " + hireId + " alterado para " + newStatus);
              }}
              onSelectCandidateProfile={(cand) => {
                setViewCandidateModal(cand);
              }}
              auditLogs={operatorAuditLogs}
              onAddAuditLog={(log) => {
                triggerOperationLog(log.action || "ACAO_CENTRAL", log.details || "");
              }}
              socialLinks={socialLinks}
              onUpdateSocialLinks={handleUpdateSocialLinks}
              payoutRequests={payoutRequests}
              onApprovePayout={handleApprovePayoutRequest}
              onRejectPayout={handleRejectPayoutRequest}
            />
            </>
            )}
          </div>
        )}

        {/* ════════════════════════ AUDITORIA DE OPERAÇÕES & MULTI-LOGINS ════════════════════════ */}
        {(activeTab === "organization_audit" || activeTab === "audit_logs") && (
          <div id="s-audit-panel" className="flex-1 overflow-auto p-4 sm:p-8 pt-28 sm:pt-32 lg:pt-28 animate-fade-up">
            {/* GATE DE SEGURANÇA — ver nota equivalente na Central Operacional
                acima: o OrganizationAuditPanel também não valida internamente
                isAdminLoggedIn, por isso o acesso tem de ser bloqueado aqui. */}
            {!isEffectiveAdmin ? (
              <div className="max-w-lg mx-auto text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-3xl mb-4 mx-auto text-red-600">🔒</div>
                <h2 className="text-xl font-serif font-bold text-[#172554] mb-2">Acesso Restrito</h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">Esta área é exclusiva da equipa TARIRA. Inicie sessão com uma conta de Administrador para continuar.</p>
                <button onClick={() => setActiveTab("landing")} className="px-5 py-2.5 rounded-xl bg-[#172554] text-white text-xs font-bold hover:bg-[#1A3478] transition-all shadow-sm cursor-pointer">Voltar ao Início</button>
              </div>
            ) : (
            <>
            {/* Quick Admin Hub Switcher */}
            {isEffectiveAdmin && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-900/90 border border-blue-400/40 shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 text-lg">🛡️</span>
                  <div>
                    <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wide">Painel do Administrador Geral</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Auditoria e Supervisão de Operadores</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    🎯 Central Operacional
                  </button>
                  <button
                    onClick={() => setActiveTab("commercial_admin")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    🏢 Gestão Comercial
                  </button>
                  <button
                    onClick={() => setActiveTab("organization_audit")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500 text-white shadow-md font-black transition-all cursor-pointer"
                  >
                    🛡️ Auditoria & Operadores
                  </button>
                  <button
                    onClick={() => setActiveTab("registered_companies")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    🏛️ Empresas
                  </button>
                </div>
              </div>
            )}
            <OrganizationAuditPanel
              currentLang={currentLang}
              isAdminLoggedIn={isEffectiveAdmin}
              operators={orgOperators}
              setOperators={setOrgOperators}
              activeOperator={activeOperator}
              setActiveOperator={setActiveOperator}
              auditLogs={operatorAuditLogs}
              setAuditLogs={setOperatorAuditLogs}
              onTriggerLog={triggerOperationLog}
            />
            </>
            )}
          </div>
        )}

        {/* ════════════════════════ ADMINISTRAÇÃO COMERCIAL & PROPOSTAS ════════════════════════ */}
        {activeTab === "commercial_admin" && (
          <div id="s-commercial-admin" className="flex-1 overflow-auto p-4 sm:p-8 pt-28 sm:pt-32 lg:pt-28 animate-fade-up">
            {/* GATE DE SEGURANÇA — ver nota equivalente na Central Operacional
                acima: o TariraCommercialAdminModule também não recebe nem
                valida nenhum indicador de admin, por isso o acesso tem de
                ser bloqueado aqui, antes de o módulo ser sequer montado. */}
            {!isEffectiveAdmin ? (
              <div className="max-w-lg mx-auto text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-3xl mb-4 mx-auto text-red-600">🔒</div>
                <h2 className="text-xl font-serif font-bold text-[#172554] mb-2">Acesso Restrito</h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">Esta área é exclusiva da equipa TARIRA. Inicie sessão com uma conta de Administrador para continuar.</p>
                <button onClick={() => setActiveTab("landing")} className="px-5 py-2.5 rounded-xl bg-[#172554] text-white text-xs font-bold hover:bg-[#1A3478] transition-all shadow-sm cursor-pointer">Voltar ao Início</button>
              </div>
            ) : (
            <>
            {/* Quick Admin Hub Switcher */}
            {isEffectiveAdmin && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-900/90 border border-blue-400/40 shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 text-lg">🛡️</span>
                  <div>
                    <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wide">Painel do Administrador Geral</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Gestão Comercial e Propostas B2B</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    🎯 Central Operacional
                  </button>
                  <button
                    onClick={() => setActiveTab("commercial_admin")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500 text-white shadow-md font-black transition-all cursor-pointer"
                  >
                    🏢 Gestão Comercial
                  </button>
                  <button
                    onClick={() => setActiveTab("organization_audit")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    🛡️ Auditoria & Operadores
                  </button>
                  <button
                    onClick={() => setActiveTab("registered_companies")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    🏛️ Empresas
                  </button>
                </div>
              </div>
            )}
            <TariraCommercialAdminModule
              currentLang={currentLang}
              proposals={commercialProposals}
              setProposals={setCommercialProposals}
              onAddProposal={handleAddCommercialProposal}
            />
            </>
            )}
          </div>
        )}

      </main>

      {/* ================= GLOBAL MODALS ================= */}
      {/* Supabase Authentication Modal */}
      <SupabaseAuthModal
        isOpen={isSupabaseAuthOpen}
        onClose={() => setIsSupabaseAuthOpen(false)}
        initialMode={loginMode}
        initialRole={authInitialRole}
        guestGateReason={guestGateReason}
        onNavigate={(tab) => {
          setIsSupabaseAuthOpen(false);
          setActiveTab(tab as any);
        }}
        onUserChange={(user, profile, linkedRecord) => {
          if (!user && !profile) {
            setSupabaseUser(null);
            setSupabaseProfile(null);
            setIsAdminLoggedIn(false);
            setSelectedClient(null);
            setSelectedProfessional(null);
            try {
              localStorage.removeItem("tarira_authenticated_session");
              sessionStorage.removeItem("tarira_auth_session");
            } catch (e) {}
            return;
          }

          setSupabaseUser(user);
          setSupabaseProfile(profile);

          const uEmail = (user?.email || profile?.email || "").toLowerCase();
          const isAdm = Boolean(
            uEmail === "tariraecossystem@gmail.com" ||
            uEmail === "tarira.ecossistema@gmail.com" ||
            uEmail === "diasexpress3@gmail.com" ||
            uEmail.includes("tarira") ||
            profile?.role === "admin" ||
            user?.user_metadata?.role === "admin"
          );

          let resolvedClient: any = null;
          let resolvedProf: any = null;

          if (isAdm) {
            setIsAdminLoggedIn(true);
            setActiveTab("admin");
          } else if (profile?.role === "empresa" || profile?.role === "lar" || profile?.role === "condominio") {
            // Prioriza o registo tal como acabou de ser criado (linkedRecord,
            // devolvido pelo próprio POST /api/clients dentro do modal de
            // registo) em vez de depender só da lista "clients" em memória —
            // essa lista só é atualizada num refresh completo dos dados e,
            // logo a seguir a um registo novo, ainda não contém o cliente
            // recém-criado. Sem isto, o Painel abria com um objeto "stub"
            // sem plano/preço, e só corrigia (ou não) horas depois.
            resolvedClient = linkedRecord || clients.find(c => c.email === profile?.email || c.id === profile?.client_id) || {
              id: profile?.client_id || profile?.id || 'client-' + Date.now(),
              name: profile?.name || user?.user_metadata?.full_name || 'Minha Conta',
              type: (profile?.role === 'condominio' ? 'condo' : profile?.role === 'lar' ? 'residential' : 'company') as any,
              email: profile?.email || user?.email || '',
              phone: profile?.phone || '',
            };
            setSelectedClient(resolvedClient);
            setActiveTab("company");
          } else if (profile?.role === "prestador" || profile?.role === "profissional") {
            const isProfRole = profile?.role === "profissional";
            resolvedProf = linkedRecord || candidates.find(c => 
              (c.email && profile?.email && c.email.toLowerCase() === profile.email.toLowerCase()) || 
              c.id === profile?.candidate_id ||
              (c.phone && profile?.phone && c.phone.replace(/\D/g, '') === profile.phone.replace(/\D/g, ''))
            ) || {
              id: profile?.candidate_id || profile?.id || 'cand-' + Date.now(),
              name: profile?.name || user?.user_metadata?.full_name || (isProfRole ? 'Profissional TARIRA' : 'Prestador TARIRA'),
              email: profile?.email || user?.email || '',
              phone: profile?.phone || '+258 84 000 0000',
              category: profile?.category || (isProfRole ? 'Talentos e Quadros' : 'Instalação Solar & Energia'),
              status: 'approved',
              rating: 4.9,
              completedJobs: 18,
              matchScore: 98,
              isProfessional: isProfRole
            };
            setSelectedProfessional(resolvedProf);
            setActiveTab("professional_profile");
          }

          try {
            localStorage.setItem("tarira_authenticated_session", JSON.stringify({
              user,
              profile,
              isAdmin: isAdm,
              client: resolvedClient,
              professional: resolvedProf,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.warn("Could not persist session to localStorage:", e);
          }
        }}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNavigationDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentLang={currentLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isEffectiveAdmin}
        supabaseUser={supabaseUser}
        supabaseProfile={supabaseProfile}
        selectedClient={selectedClient}
        selectedProfessional={selectedProfessional}
        handleSignOut={handleSignOut}
        onOpenSignIn={() => {
          setLoginMode('signin');
          setIsSupabaseAuthOpen(true);
        }}
        onOpenSignUp={() => {
          setLoginMode('signup');
          setIsSupabaseAuthOpen(true);
        }}
        onOpenCommercialModal={() => setIsCommercialModalOpen(true)}
        setClientSelectedCategory={setClientSelectedCategory}
        handleNavigateToEcosystem={handleNavigateToEcosystem}
      />

      {/* Hire Process Modal */}
      {isHireModalOpen && (
        <HireProcessModal
          isOpen={isHireModalOpen}
          onClose={() => setIsHireModalOpen(false)}
          selectedProfessional={selectedProfessional || candidates[0] || null}
          selectedClient={selectedClient || clients[0] || null}
          triggerOperationLog={triggerOperationLog}
          onHireSuccess={(createdHire) => {
            setHires(prev => [createdHire, ...prev]);
            setIsHireModalOpen(false);
          }}
          isTechnicianCandidate={
            activeTab === "client_find" ||
            activeTab === "services" ||
            activeTab === "tecnicos" ||
            (selectedProfessional ? (
              selectedProfessional.category !== "recruitment" && 
              selectedProfessional.category !== "prof" && 
              !selectedProfessional.isProfessional &&
              !selectedProfessional.expectedSalaryMin &&
              !["inteligência artificial", "senior ai", "data solution", "cibersegurança", "cybersecurity", "soc analyst", "cloud & devops", "cloud architect", "compliance", "gestão executiva"].some(t => (selectedProfessional.title || "").toLowerCase().includes(t) || (selectedProfessional.subCategory || "").toLowerCase().includes(t))
            ) : true)
          }
        />
      )}

      {/* Tarira Commercial Modal */}
      <TariraCommercialModal
        isOpen={isCommercialModalOpen}
        onClose={() => setIsCommercialModalOpen(false)}
        currentLang={currentLang}
        onSubmitProposal={(prop) => {
          handleAddCommercialProposal(prop);
          setIsCommercialModalOpen(false);
        }}
      />

      {/* Tarira Service Selection Modal (Solicitar Novo Serviço ⚡) */}
      {selectedClient && (
        <TariraServiceSelectionModal
          isOpen={isServiceSelectionModalOpen}
          onClose={() => setIsServiceSelectionModalOpen(false)}
          client={selectedClient}
          currentLang={currentLang as "pt" | "en"}
          onSelectOption={(option) => {
            setIsServiceSelectionModalOpen(false);
            if (option.action === "proposal") {
              setIsCommercialModalOpen(true);
            } else if (option.unit === "connect") {
              // "Explorar Técnicos Credenciados" -> catálogo real de técnicos (não "connect_sub", que é a página de assinatura)
              setActiveTab("client_find");
            } else if (option.unit === "recruit") {
              // "Ver Galeria de Talentos" -> galeria real de profissionais (não "recruit_sub")
              setActiveTab("profissionais");
            } else if (option.unit === "outsourcing") {
              // "Ver Modelo Outsourcing" -> "outsourcing" nunca existiu como aba; o módulo real é "business_sub"
              setActiveTab("business_sub");
            } else if (option.unit === "consulting") {
              setActiveTab("consulting_sub");
            } else if (option.unit === "studio") {
              setActiveTab("studio_sub");
            }
          }}
        />
      )}

      {/* Tarira Payment Checkout Modal (Efetuar Novo Pagamento Manual 💳) */}
      {selectedClient && (
        <TariraPaymentCheckoutModal
          isOpen={isPaymentCheckoutModalOpen}
          onClose={() => {
            setIsPaymentCheckoutModalOpen(false);
            setPaymentCheckoutData(null);
          }}
          client={selectedClient}
          currentLang={currentLang as "pt" | "en"}
          initialServiceTitle={paymentCheckoutData?.serviceTitle}
          initialAmount={paymentCheckoutData?.amount}
          isTrial={paymentCheckoutData?.isTrial}
          onSkipTrial={() => {
            setIsPaymentCheckoutModalOpen(false);
            setPaymentCheckoutData(null);
          }}
          onPaymentSuccess={(newPayment) => {
            setPaymentOrders(prev => [newPayment, ...prev]);
            setIsPaymentCheckoutModalOpen(false);
            setPaymentCheckoutData(null);
            triggerOperationLog(
              "PAYMENT_SUBMITTED",
              `Novo pagamento submetido por ${selectedClient.name}: ${newPayment.amount.toLocaleString()} MT (${newPayment.method}) - Ref: ${newPayment.reference}`
            );
          }}
        />
      )}

      {/* Investor Documents Modal */}
      {isInvestorDocsModalOpen && (
        <InvestorDocumentsModal
          isOpen={isInvestorDocsModalOpen}
          onClose={() => setIsInvestorDocsModalOpen(false)}
        />
      )}

      {/* Tarira Internal Application Modal */}
      <TariraInternalApplicationModal
        isOpen={isInternalApplicationModalOpen}
        onClose={() => setIsInternalApplicationModalOpen(false)}
        onSuccess={(app) => {
          setSpontaneousApplications(prev => [app, ...prev]);
          setIsInternalApplicationModalOpen(false);
        }}
      />

      {/* Tarira Provider / Professional CRUD Modal */}
      {providerCrudModal.isOpen && (
        <TariraProviderCrudModal
          isOpen={providerCrudModal.isOpen}
          mode={providerCrudModal.mode}
          type={providerCrudModal.type}
          initialData={providerCrudModal.initialData}
          onClose={() => setProviderCrudModal({ isOpen: false, mode: 'create', type: 'provider' })}
          onSave={async (data) => {
            if (providerCrudModal.mode === 'create') {
              await handleCreateCandidateDirect(data);
            } else if (providerCrudModal.initialData?.id) {
              await handleUpdateCandidateDirect({ ...providerCrudModal.initialData, ...data } as Candidate);
            }
            setProviderCrudModal({ isOpen: false, mode: 'create', type: 'provider' });
          }}
          operatorName={activeOperator?.name || 'Administrador Geral'}
          operatorRole={activeOperator?.role || 'admin'}
        />
      )}

      {/* Tarira Delete Confirm Modal */}
      {providerDeleteModal.isOpen && (
        <TariraDeleteConfirmModal
          isOpen={providerDeleteModal.isOpen}
          entityType={providerDeleteModal.entityType}
          entityId={providerDeleteModal.entityId}
          entityName={providerDeleteModal.entityName}
          operatorName={activeOperator?.name || 'Administrador Geral'}
          operatorEmail={activeOperator?.email || 'tarira.ecossistema@gmail.com'}
          operatorRole={activeOperator?.role || 'admin'}
          onClose={() => setProviderDeleteModal({ isOpen: false, entityType: 'prestador', entityId: '', entityName: '' })}
          onConfirm={async (data) => {
            await handleDeleteCandidateDirect(data.entityId, data);
            setProviderDeleteModal({ isOpen: false, entityType: 'prestador', entityId: '', entityName: '' });
          }}
        />
      )}

      {/* Tarira Briefing Modal (Nova Vaga / Briefing Formal) */}
      {isBriefingFormOpen && (
        <TariraBriefingModal
          isOpen={isBriefingFormOpen}
          initialCompanyName={briefingTargetCompany}
          isAdminMode={isEffectiveAdmin}
          currentLang={currentLang}
          onClose={() => {
            setIsBriefingFormOpen(false);
            setBriefingTargetCompany("");
          }}
          onSuccess={(newReq) => {
            if (isEffectiveAdmin && activeOperator) {
              setOperatorAuditLogs(prev => [
                {
                  id: `op-log-${Date.now()}`,
                  timestamp: "Agora mesmo",
                  operatorId: activeOperator.id,
                  operatorName: activeOperator.name,
                  operatorRole: activeOperator.role,
                  orgName: activeOperator.orgName,
                  actionType: "DISPARO_VAGA",
                  details: `DISPARO DE VAGA DELEGADA: Requisição de vaga aberta para ${newReq?.companyName || 'Empresa'}: ${newReq?.technicalProfile || 'Vaga'} (${newReq?.qtdVagas || 1} vagas)`,
                  targetEntity: `Vaga #${newReq?.id || Date.now()}`,
                  ipAddress: "197.218.42.10 (Audit Trail)"
                },
                ...prev
              ]);
            }
            setIsBriefingFormOpen(false);
            setBriefingTargetCompany("");
          }}
        />
      )}

      {/* Tarira Official Email Composer Modal */}
      <TariraEmailComposerModal
        isOpen={isEmailComposerOpen}
        onClose={() => setIsEmailComposerOpen(false)}
        targetEmail={emailComposerData.targetEmail}
        initialSubject={emailComposerData.subject}
        initialBody={emailComposerData.body}
        defaultSenderName={supabaseProfile?.name || ""}
        defaultSenderEmail={supabaseProfile?.email || (supabaseUser as any)?.email || ""}
        defaultSenderPhone={supabaseProfile?.phone || ""}
      />

      {/* Visualizador do Dossiê do Candidato Selecionado */}
      {viewCandidateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-left text-[#172554] animate-fade-up">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={viewCandidateModal.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"}
                  alt={viewCandidateModal.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#172554] border border-blue-200 uppercase">
                    {viewCandidateModal.isProfessional ? "Talentos e Quadros" : "Técnico de Ofício"}
                  </span>
                  <h2 className="text-xl font-serif font-bold text-[#172554] mt-1">
                    {viewCandidateModal.name} {viewCandidateModal.surname || ""}
                  </h2>
                  <p className="text-xs text-slate-500">📍 {viewCandidateModal.city || "Maputo"}, Moçambique</p>
                </div>
              </div>
              <button
                onClick={() => setViewCandidateModal(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">Especialidade / Título</h4>
                <p className="text-sm font-bold text-[#172554]">{viewCandidateModal.title || viewCandidateModal.category || "Profissional Especializado"}</p>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">Resumo Profissional / Biografia</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {viewCandidateModal.bio || "Candidato homologado no banco de talentos e quadros do Ecossistema TARIRA."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Avaliação</span>
                  <span className="text-sm font-bold text-[#172554]">{viewCandidateModal.rating?.toFixed(1) || "5.0"} ⭐</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Match Score AI</span>
                  <span className="text-sm font-bold text-[#172554]">{viewCandidateModal.matchScore || 95}%</span>
                </div>
              </div>

              {viewCandidateModal.skills && viewCandidateModal.skills.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">Competências</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewCandidateModal.skills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#172554] text-xs font-semibold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contactos */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                {viewCandidateModal.phone && (
                  <a
                    href={`tel:${viewCandidateModal.phone.replace(/\D/g, '')}`}
                    className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-[#172554] text-white text-xs font-bold text-center hover:bg-[#1A3478] transition-all"
                  >
                    📞 Ligar ({viewCandidateModal.phone})
                  </a>
                )}
                {(viewCandidateModal.whatsapp || viewCandidateModal.phone) && (
                  <a
                    href={`https://wa.me/${(viewCandidateModal.whatsapp || viewCandidateModal.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center hover:bg-emerald-700 transition-all"
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
    
       
          