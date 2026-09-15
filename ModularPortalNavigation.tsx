import React from 'react';
import { 
  Building2, 
  Search, 
  Menu, 
  MoreVertical,
  X, 
  ChevronRight, 
  ChevronDown,
  Code2,
  Sparkles,
  Briefcase, 
  Lock,
  CheckCircle2,
  Users,
  ShieldCheck,
  Home,
  HardHat,
  GraduationCap,
  Wrench,
  LogOut,
  LogIn,
  UserPlus,
  Compass,
  FileText,
  Layers,
  BarChart3,
  Plus
} from 'lucide-react';
import { TariraLogo } from './TariraLogo';
import {
  TariraConnectIcon,
  TariraRecruitIcon,
  TariraOutsourcingIcon,
  TariraConsultingIcon,
  TariraStudioIcon
} from './TariraUnitIcons';

export interface ModularPortalNavigationProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currentLang: 'pt' | 'en';
  isUserLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  supabaseUser: any;
  supabaseProfile: any;
  selectedClient: any;
  selectedProfessional: any;
  onSignOut: () => void;
  onOpenAuthModal: (mode: 'signin' | 'signup', reason?: string) => void;
  onOpenCommercialModal: () => void;
  onOpenSolutionsDropdown: () => void;
  isSolutionsDropdownOpen: boolean;
  onCloseSolutionsDropdown: () => void;
  onNavigateToEcosystem: (unitId: string) => void;
  setClientSelectedCategory: (category: string) => void;
  headerSearchInput: string;
  setHeaderSearchInput: (text: string) => void;
  onSearchSubmit: (text: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onOpenTestAccounts: () => void;
}

export const ModularPortalNavigation: React.FC<ModularPortalNavigationProps> = ({
  activeTab,
  setActiveTab,
  currentLang,
  isUserLoggedIn,
  isAdminLoggedIn,
  supabaseUser,
  supabaseProfile,
  selectedClient,
  selectedProfessional,
  onSignOut,
  onOpenAuthModal,
  onOpenCommercialModal,
  onOpenSolutionsDropdown,
  isSolutionsDropdownOpen,
  onCloseSolutionsDropdown,
  onNavigateToEcosystem,
  setClientSelectedCategory,
  headerSearchInput,
  setHeaderSearchInput,
  onSearchSubmit,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onOpenTestAccounts,
}) => {
  // Check if any user profile/account or administrator is logged in via actual authentication
  const isUserAuthenticated = Boolean(
    isAdminLoggedIn ||
    supabaseUser ||
    (supabaseProfile && (supabaseProfile.email || supabaseProfile.id || supabaseProfile.name))
  );

  const getUserRoleAndProfileDetails = () => {
    // 1. Administrador Geral (Master)
    const isAdm = Boolean(
      isAdminLoggedIn ||
      supabaseProfile?.role === 'admin' ||
      supabaseUser?.user_metadata?.role === 'admin' ||
      (supabaseUser?.email && (
        supabaseUser.email.toLowerCase().includes('tarira.ecossistema@gmail.com') ||
        supabaseUser.email.toLowerCase().includes('tariraecossystem@gmail.com') ||
        supabaseUser.email.toLowerCase().includes('tarira')
      )) ||
      (supabaseProfile?.email && (
        supabaseProfile.email.toLowerCase().includes('tarira.ecossistema@gmail.com') ||
        supabaseProfile.email.toLowerCase().includes('tariraecossystem@gmail.com') ||
        supabaseProfile.email.toLowerCase().includes('tarira')
      ))
    );

    if (isAdm) {
      const adminName =
        supabaseProfile?.name ||
        supabaseUser?.user_metadata?.full_name ||
        (supabaseUser?.email ? supabaseUser.email.split('@')[0] : 'Administrador Master TARIRA');
      return {
        roleKey: 'admin',
        roleLabel: currentLang === 'pt' ? 'Administrador' : 'Administrator',
        displayName: adminName,
        specialty: null,
        fullTitle: `${currentLang === 'pt' ? 'Administrador' : 'Administrator'}: ${adminName}`,
        icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />,
        badgeStyle: 'bg-white/20 text-white border-white/40'
      };
    }

    const rawRole = (
      supabaseProfile?.role ||
      (supabaseUser?.user_metadata?.role as string) ||
      ''
    ).toLowerCase();

    // 2. Condomínio (Gestão Predial & Comum)
    if (rawRole === 'condominio' || rawRole === 'condo') {
      const condoName =
        supabaseProfile?.condo_name ||
        supabaseProfile?.name ||
        supabaseUser?.user_metadata?.full_name ||
        (currentLang === 'pt' ? 'Condomínio Residencial' : 'Condominium');
      return {
        roleKey: 'condominio',
        roleLabel: currentLang === 'pt' ? 'Condomínio' : 'Condominium',
        displayName: condoName,
        specialty: null,
        fullTitle: `${currentLang === 'pt' ? 'Condomínio' : 'Condo'}: ${condoName}`,
        icon: <Building2 className="w-3.5 h-3.5 text-blue-200" />,
        badgeStyle: 'bg-white/20 hover:bg-white/30 text-white border-white/40'
      };
    }

    // 3. Lar Particular (Residencial / Habitação)
    if (
      rawRole === 'lar' ||
      rawRole === 'particular' ||
      rawRole === 'residential' ||
      rawRole === 'individual'
    ) {
      const personName =
        supabaseProfile?.name ||
        supabaseUser?.user_metadata?.full_name ||
        (supabaseUser?.email ? supabaseUser.email.split('@')[0] : (currentLang === 'pt' ? 'Particular' : 'Resident'));
      return {
        roleKey: 'lar',
        roleLabel: currentLang === 'pt' ? 'Particular' : 'Individual',
        displayName: personName,
        specialty: null,
        fullTitle: `${currentLang === 'pt' ? 'Particular' : 'Individual'}: ${personName}`,
        icon: <Home className="w-3.5 h-3.5 text-emerald-300" />,
        badgeStyle: 'bg-white/20 hover:bg-white/30 text-white border-white/40'
      };
    }

    // 4. Profissional (TARIRA Recruit / Executivos e Quadros)
    if (
      rawRole === 'profissional' ||
      rawRole === 'professional' ||
      rawRole === 'candidato'
    ) {
      const profName =
        supabaseProfile?.name ||
        supabaseUser?.user_metadata?.full_name ||
        (supabaseUser?.email ? supabaseUser.email.split('@')[0] : (currentLang === 'pt' ? 'Profissional' : 'Professional'));
      const rawSpec = supabaseProfile?.category || (currentLang === 'pt' ? 'Quadro Técnico & Gestão' : 'Professional');
      const cleanSpec = rawSpec === 'prof' || rawSpec === 'elite_hub' ? (currentLang === 'pt' ? 'Gestão & TI' : 'Management & IT') : rawSpec;

      return {
        roleKey: 'profissional',
        roleLabel: currentLang === 'pt' ? 'Profissional' : 'Professional',
        displayName: profName,
        specialty: cleanSpec,
        fullTitle: `${currentLang === 'pt' ? 'Profissional' : 'Professional'}: ${profName} (${cleanSpec})`,
        icon: <Briefcase className="w-3.5 h-3.5 text-blue-200" />,
        badgeStyle: 'bg-white/20 hover:bg-white/30 text-white border-white/40'
      };
    }

    // 5. Técnico (TARIRA Connect / Manutenção e Campo)
    if (
      rawRole === 'prestador' ||
      rawRole === 'tecnico' ||
      rawRole === 'technician' ||
      rawRole === 'provider'
    ) {
      const techName =
        supabaseProfile?.name ||
        supabaseUser?.user_metadata?.full_name ||
        (supabaseUser?.email ? supabaseUser.email.split('@')[0] : (currentLang === 'pt' ? 'Técnico Credenciado' : 'Field Technician'));
      const rawSpec = supabaseProfile?.category || (currentLang === 'pt' ? 'Técnico Especialista' : 'Field Specialist');
      const cleanSpec = rawSpec === 'tech' ? (currentLang === 'pt' ? 'Técnico de Campo' : 'Field Tech')
        : rawSpec === 'dom' ? (currentLang === 'pt' ? 'Apoio ao Lar' : 'Home Support')
        : rawSpec === 'jard' ? (currentLang === 'pt' ? 'Jardinagem' : 'Gardening')
        : rawSpec;

      return {
        roleKey: 'tecnico',
        roleLabel: currentLang === 'pt' ? 'Técnico' : 'Technician',
        displayName: techName,
        specialty: cleanSpec,
        fullTitle: `${currentLang === 'pt' ? 'Técnico' : 'Technician'}: ${techName} (${cleanSpec})`,
        icon: <Wrench className="w-3.5 h-3.5 text-blue-200" />,
        badgeStyle: 'bg-white/20 hover:bg-white/30 text-white border-white/40'
      };
    }

    // 6. Empresa (Corporativo B2B)
    if (rawRole === 'empresa' || rawRole === 'company' || rawRole === 'corporate') {
      const compName =
        supabaseProfile?.company_name ||
        supabaseProfile?.name ||
        supabaseUser?.user_metadata?.full_name ||
        (supabaseUser?.email ? supabaseUser.email.split('@')[0] : (currentLang === 'pt' ? 'Empresa Cliente' : 'Corporate Client'));
      return {
        roleKey: 'empresa',
        roleLabel: currentLang === 'pt' ? 'Empresa' : 'Company',
        displayName: compName,
        specialty: supabaseProfile?.company_sector || null,
        fullTitle: `${currentLang === 'pt' ? 'Empresa' : 'Company'}: ${compName}`,
        icon: <Building2 className="w-3.5 h-3.5 text-blue-200" />,
        badgeStyle: 'bg-white/20 hover:bg-white/30 text-white border-white/40'
      };
    }

    // 7. Fallback para utilizador autenticado genérico
    const fallbackName =
      supabaseProfile?.name ||
      supabaseUser?.user_metadata?.full_name ||
      (supabaseUser?.email ? supabaseUser.email.split('@')[0] : (currentLang === 'pt' ? 'Particular' : 'Individual'));
    return {
      roleKey: 'lar',
      roleLabel: currentLang === 'pt' ? 'Particular' : 'Individual',
      displayName: fallbackName,
      specialty: null,
      fullTitle: `${currentLang === 'pt' ? 'Particular' : 'Individual'}: ${fallbackName}`,
      icon: <Home className="w-3.5 h-3.5 text-emerald-400" />,
      badgeStyle: 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border-emerald-500/50'
    };
  };

  const roleInfo = getUserRoleAndProfileDetails();

  // Contas de Técnico/Profissional (candidatos) não precisam de navegar para os
  // catálogos de "Técnicos de Campo" / "Talentos e Quadros" — esses menus servem
  // para clientes procurarem e contratarem candidatos, não para o próprio candidato.
  // Escondê-los reduz o menu ao que é realmente necessário no fluxo do técnico.
  const isCandidateRole = isUserAuthenticated && (roleInfo.roleKey === 'tecnico' || roleInfo.roleKey === 'profissional');

  const handleDashboardNavigation = () => {
    if (roleInfo.roleKey === 'admin') {
      setActiveTab('admin');
    } else if (roleInfo.roleKey === 'tecnico' || roleInfo.roleKey === 'profissional') {
      setActiveTab('professional_profile');
    } else {
      setActiveTab('company');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#172554] border-b border-blue-900/80 shadow-[0_8px_30px_rgba(30,58,138,0.28)] px-2 sm:px-4 xl:px-6 py-1 sm:py-1.5 transition-colors duration-300 text-white">
        {/* TOP MINI STATUS BAR (Ultra-compact with luminous balance) */}
        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-blue-800/60 w-full overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate text-white">
            <span className="flex items-center gap-1.5 text-white font-mono font-bold tracking-wide shrink-0 text-[10px] sm:text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PORTAL TARIRA <span className="hidden xs:inline">• 2026</span>
            </span>
            <span className="hidden md:inline text-blue-300/60">|</span>
            <span className="hidden md:inline text-blue-100 font-sans font-medium tracking-wide truncate">
              {currentLang === 'pt' ? 'Ecossistema TARIRA • Unidades Principais' : 'TARIRA Ecosystem • Main Units'}
            </span>
          </div>

          {/* Right side: Operational Ticker & Regional Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-sans shrink-0">
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-white font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden xs:inline">Maputo, MZ • </span>
              {currentLang === 'pt' ? '24/7' : '24/7'}
            </span>
            <span className="hidden sm:inline text-[10px] text-blue-200 font-mono font-semibold">
              {currentLang === 'pt' ? 'Moçambique' : 'Mozambique'}
            </span>
          </div>
        </div>

        {/* MAIN HEADER ROW */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 xl:gap-3 pt-1 w-full min-w-0">
          {/* Logo - Marca e Identidade Visual Completa: Ícone + TARIRA + Slogans visíveis em Mobile, Tablet e Desktop */}
          <div 
            id="header-tarira-brand-logo"
            className="flex items-center cursor-pointer shrink-0" 
            onClick={() => setActiveTab('landing')}
            title="TARIRA - Início"
          >
            <TariraLogo lightBg={false} size="xs" align="left" withSlogan={true} />
          </div>

          {/* Desktop Navigation Links - Menu Original: Início, Sobre, Serviços, Técnicos de Campo, Talentos e Quadros */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink min-w-0">
            <button
              id="desktop-nav-home-btn"
              onClick={() => setActiveTab('landing')}
              className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'landing'
                  ? 'bg-white text-[#172554] shadow-md font-black'
                  : 'text-white hover:text-white hover:bg-white/15 font-bold'
              }`}
            >
              {currentLang === 'pt' ? 'Início' : 'Home'}
            </button>

            <button
              id="desktop-nav-about-btn"
              onClick={() => setActiveTab('about')}
              className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'about'
                  ? 'bg-white text-[#172554] shadow-md font-black'
                  : 'text-white hover:text-white hover:bg-white/15 font-bold'
              }`}
            >
              {currentLang === 'pt' ? 'Sobre' : 'About'}
            </button>

            <button
              id="desktop-nav-services-btn"
              onClick={() => setActiveTab('services')}
              className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-white text-[#172554] shadow-md font-black'
                  : 'text-white hover:text-white hover:bg-white/15 font-bold'
              }`}
              title="Serviços Técnicos e Especialidades"
            >
              <Wrench className={`w-3.5 h-3.5 ${activeTab === 'services' ? 'text-[#172554]' : 'text-blue-200'} shrink-0`} />
              <span>{currentLang === 'pt' ? 'Serviços' : 'Services'}</span>
            </button>

            {!isCandidateRole && (
              <button
                id="desktop-nav-techs-btn"
                onClick={() => {
                  setClientSelectedCategory('tech_trades');
                  setActiveTab('client_find');
                }}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'client_find'
                    ? 'bg-white text-[#172554] shadow-md font-black'
                    : 'text-white hover:text-white hover:bg-white/15 font-bold'
                }`}
                title="Técnicos de Campo e Prestadores de Ofício (TARIRA Connect)"
              >
                <HardHat className={`w-3.5 h-3.5 ${activeTab === 'client_find' ? 'text-[#172554]' : 'text-blue-200'} shrink-0`} />
                <span>{currentLang === 'pt' ? 'Técnicos de Campo' : 'Field Technicians'}</span>
              </button>
            )}

            {!isCandidateRole && (
              <button
                id="desktop-nav-talent-btn"
                onClick={() => setActiveTab('profissionais')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'profissionais'
                    ? 'bg-white text-[#172554] shadow-md font-black'
                    : 'text-white hover:text-white hover:bg-white/15 font-bold'
                }`}
                title="Talentos Corporativos, Analistas e Quadros Especialistas (TARIRA Recruit)"
              >
                <GraduationCap className={`w-3.5 h-3.5 ${activeTab === 'profissionais' ? 'text-[#172554]' : 'text-blue-200'} shrink-0`} />
                <span>{currentLang === 'pt' ? 'Talentos e Quadros' : 'Talent & Executives'}</span>
              </button>
            )}

            {/* Desktop Ecosystem Units Dropdown */}
            <div className="relative">
              <button
                id="desktop-nav-units-dropdown-btn"
                type="button"
                onClick={() => {
                  if (isSolutionsDropdownOpen) {
                    onCloseSolutionsDropdown();
                  } else {
                    onOpenSolutionsDropdown();
                  }
                }}
                className={`px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSolutionsDropdownOpen
                    ? 'bg-white text-[#172554] border-white shadow-md'
                    : 'text-white hover:text-white bg-white/10 hover:bg-white/20 border-white/20 font-bold shadow-xs'
                }`}
                title="Unidades Especializadas do Ecossistema TARIRA"
              >
                <Layers className={`w-3.5 h-3.5 ${isSolutionsDropdownOpen ? 'text-[#172554]' : 'text-white'}`} />
                <span>{currentLang === 'pt' ? 'Unidades' : 'Units'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isSolutionsDropdownOpen ? 'rotate-180 text-[#172554]' : 'text-white'}`} />
              </button>

              {isSolutionsDropdownOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 w-80 bg-white border border-border rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] p-2.5 z-50 animate-fade-up"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2.5 py-1.5 border-b border-border flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-brand uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-brand" />
                      5 Unidades de Negócio
                    </span>
                    <button 
                      onClick={onCloseSolutionsDropdown}
                      className="text-text-secondary hover:text-brand text-xs p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 pt-1.5">
                    {[
                      { id: 'connect', name: 'TARIRA Connect', desc: 'Técnicos de campo & serviços práticos', badge: 'Diária / Serviço', badgeColor: 'bg-blue-50 text-[#172554] border-blue-200', icon: <TariraConnectIcon size={18} className="text-[#172554]" /> },
                      { id: 'recrute', name: 'TARIRA Recruit', desc: 'Talentos corporativos & vagas permanentes', badge: 'Recrutamento', badgeColor: 'bg-blue-50 text-[#172554] border-blue-200', icon: <TariraRecruitIcon size={18} className="text-[#172554]" /> },
                      { id: 'business', name: 'TARIRA Outsourcing (RPO)', desc: 'Gestão de processos e terceirização BPO', badge: 'BPO / Gestão', badgeColor: 'bg-blue-50 text-[#172554] border-blue-200', icon: <TariraOutsourcingIcon size={18} className="text-[#172554]" /> },
                      { id: 'consultoria', name: 'TARIRA Consulting', desc: 'Auditoria, diagnóstico e assessoria', badge: 'Consultoria', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200', icon: <TariraConsultingIcon size={18} className="text-[#172554]" /> },
                      { id: 'studio', name: 'TARIRA Studio', desc: 'Software Lab, Micro-SaaS & Axofacil', badge: 'Software Lab', badgeColor: 'bg-blue-50 text-[#172554] border-blue-200', icon: <TariraStudioIcon size={18} className="text-[#172554]" /> },
                    ].map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          onNavigateToEcosystem(unit.id);
                          onCloseSolutionsDropdown();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-background-secondary border border-transparent hover:border-border transition-all flex items-start gap-2.5 group cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-background-secondary border border-border shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          {unit.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                              {unit.name}
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${unit.badgeColor}`}>
                              {unit.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-secondary truncate mt-0.5">
                            {unit.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right side search, commercial & 🌟 AUTH BUTTONS + THREE DOTS MENU
              NOTA DE RESPONSIVIDADE: este contentor já NÃO usa "shrink-0" —
              em ecrãs estreitos (telemóvel) isso obrigava toda a fila a
              manter a sua largura total, o que empurrava o botão de "três
              pontinhos" (e por vezes o botão "Sair") para fora da área
              visível do ecrã, sem scroll horizontal para o alcançar. Agora o
              contentor pode encolher (min-w-0) e o bloco de autenticação
              abaixo tem o seu próprio scroll horizontal interno, garantindo
              que o botão de três pontinhos — o mais importante em mobile —
              nunca fica escondido. */}
          <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 min-w-0 flex-1 justify-end">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit(headerSearchInput);
              }}
              className="hidden 2xl:flex items-center relative"
            >
              <Search className="w-3.5 h-3.5 text-blue-200 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={headerSearchInput}
                onChange={(e) => setHeaderSearchInput(e.target.value)}
                placeholder={currentLang === 'pt' ? 'Pesquisar no portal...' : 'Search portal...'}
                className="bg-white/15 border border-white/25 rounded-full pl-8 pr-3 py-1 text-xs text-white placeholder:text-white/60 focus:outline-none focus:bg-white focus:text-[#172554] focus:placeholder:text-[#172554]/50 w-36 xl:w-44 transition-all shadow-xs"
              />
            </form>

            {/* Contact Commercial Button (Only visible on wide 2xl screens to leave room for auth controls) */}
            <button
              id="header-commercial-btn"
              type="button"
              onClick={onOpenCommercialModal}
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/15 hover:bg-white text-white hover:text-[#172554] border border-white/30 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Aceder à Gestão Comercial B2B"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{currentLang === 'pt' ? 'Comercial' : 'Sales'}</span>
            </button>

            {/* 🌟 PADRÃO OURO: AUTHENTICATION / ACCOUNT PORTAL CONTROLS
                Envolvido num contentor com "min-w-0" + scroll horizontal
                próprio: se o crachá de perfil + botão "Sair" não couberem
                todos no espaço disponível em ecrãs muito estreitos, este
                bloco desliza internamente em vez de empurrar o botão de
                três pontinhos (mobile-three-dots-trigger-btn) para fora do
                ecrã. */}
            <div className="flex items-center min-w-0 overflow-x-auto no-scrollbar">
            {isUserAuthenticated ? (
              /* Authenticated Controls */
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* 🛡️ PERFIL ADMINISTRADOR: APENAS O INDICADOR DO PERFIL + BOTÃO SAIR */}
                {roleInfo.roleKey === 'admin' ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink min-w-0">
                    <div
                      id="header-admin-profile-badge"
                      className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 text-white border border-white/30 shadow-xs select-none min-w-0 shrink"
                      title={currentLang === 'pt' ? 'Sessão Ativa: Perfil Administrador' : 'Active Session: Administrator Profile'}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                      <span className="font-extrabold uppercase text-[11px] text-white tracking-wide truncate">
                        {currentLang === 'pt' ? 'Administrador' : 'Administrator'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ring-2 ring-emerald-950 ml-0.5" title="Sessão Activa"></span>
                    </div>

                    {/* O ÚNICO BOTÃO DISPONÍVEL NO PAINEL ADMINISTRADOR: SAIR */}
                    <button
                      id="top-btn-logout"
                      onClick={() => {
                        onSignOut();
                        setActiveTab('landing');
                      }}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-black text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 shadow-md active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                      title={currentLang === 'pt' ? 'Terminar Sessão e Voltar ao Menu Principal' : 'Log out and return to main menu'}
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                      <span className="hidden xs:inline font-bold">{currentLang === 'pt' ? 'Sair' : 'Log out'}</span>
                    </button>
                  </div>
                ) : (
                  /* Outros perfis autenticados (Empresa, Lar, Condomínio, Prestador) */
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0">
                    <button
                      id="header-auth-dashboard-btn"
                      onClick={handleDashboardNavigation}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer border shadow-xs active:scale-95 min-w-0 shrink max-w-[92px] xs:max-w-[130px] sm:max-w-[220px] 2xl:max-w-[380px] ${
                        activeTab === 'company' || activeTab === 'professional_profile'
                          ? 'bg-white !text-[#172554] text-[#172554] border-white shadow-md'
                          : roleInfo.badgeStyle
                      }`}
                      title={`${roleInfo.fullTitle} - ${currentLang === 'pt' ? 'Clique para aceder ao painel' : 'Click to view dashboard'}`}
                    >
                      <span className="shrink-0">{roleInfo.icon}</span>
                      <span className={`font-black uppercase text-[10px] sm:text-[11px] shrink-0 ${
                        activeTab === 'company' || activeTab === 'professional_profile'
                          ? '!text-[#172554] text-[#172554]'
                          : 'text-white'
                      }`}>
                        {roleInfo.roleLabel}:
                      </span>
                      <span className={`truncate font-extrabold text-[11px] sm:text-xs ${
                        activeTab === 'company' || activeTab === 'professional_profile'
                          ? '!text-[#172554] text-[#172554]'
                          : 'text-slate-100'
                      }`}>
                        {roleInfo.displayName}
                      </span>
                      {roleInfo.specialty && (
                        <span className={`hidden sm:inline text-[10px] truncate font-medium ${
                          activeTab === 'company' || activeTab === 'professional_profile'
                            ? '!text-[#3B5998] text-[#3B5998]'
                            : 'text-slate-300/80'
                        }`}>
                          ({roleInfo.specialty})
                        </span>
                      )}
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ring-2 ring-emerald-950 ml-0.5" title="Sessão Activa"></span>
                    </button>

                    <button
                      id="top-btn-logout"
                      onClick={() => {
                        onSignOut();
                        setActiveTab('landing');
                      }}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-600 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
                      title={currentLang === 'pt' ? 'Terminar Sessão (Sair da Conta)' : 'Log out'}
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-300 hover:text-white shrink-0" />
                      <span className="hidden xs:inline font-bold">{currentLang === 'pt' ? 'Sair' : 'Log out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Public / Visitor Authentication CTAs: [Entrar] + [Criar Conta] organizados perfeitamente */
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  id="header-btn-signin"
                  onClick={() => onOpenAuthModal('signin')}
                  className="flex items-center gap-1 text-white hover:text-white font-bold py-1 sm:py-1.5 px-2 sm:px-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 transition-all text-xs cursor-pointer shadow-xs shrink-0 whitespace-nowrap active:scale-95"
                  title={currentLang === 'pt' ? 'Iniciar Sessão (Entrar)' : 'Sign In'}
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                  <span className="font-bold">{currentLang === 'pt' ? 'Entrar' : 'Sign In'}</span>
                </button>

                <button
                  id="header-btn-signup"
                  onClick={() => onOpenAuthModal('signup')}
                  className="flex items-center gap-1 !text-[#172554] text-[#172554] font-black py-1 sm:py-1.5 px-2.5 sm:px-4 rounded-full bg-white hover:bg-blue-50 shadow-md transition-all text-xs cursor-pointer shrink-0 whitespace-nowrap border border-white hover:scale-[1.02] active:scale-95"
                  title="Criar Nova Conta no Portal TARIRA"
                >
                  <UserPlus className="w-3.5 h-3.5 !text-[#172554] text-[#172554] stroke-[2.5] shrink-0" />
                  <span className="!text-[#172554] text-[#172554] font-black">{currentLang === 'pt' ? 'Criar Conta' : 'Sign Up'}</span>
                </button>
              </div>
            )}
            </div>

            {/* 🌟 MENU DE TRÊS PONTINHOS (Sempre visível no Mobile e Tablet) */}
            <button
              id="mobile-three-dots-trigger-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-white text-[#172554] font-black border border-white shadow-md active:scale-95 transition-all cursor-pointer shrink-0 min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px]"
              title={isMobileMenuOpen ? 'Fechar Menu' : 'Abrir Menu (Três Pontinhos)'}
              aria-label="Abrir Menu de Três Pontinhos"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#172554] stroke-[3]" />
              ) : (
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-[#172554] stroke-[3]" />
              )}
            </button>
          </div>
        </div>

        {/* 📱 MOBILE & TABLET MAIN HORIZONTAL NAVIGATION PILLS */}
        <div className="flex lg:hidden flex-col gap-1 pt-1 pb-0.5 w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
            {isAdminLoggedIn && (
              <button
                id="mobile-pill-admin-btn"
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border whitespace-nowrap cursor-pointer transition-all shadow-md shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'admin' || activeTab === 'central' || activeTab === 'central_ops'
                    ? 'bg-white text-[#172554] border-white font-black'
                    : 'bg-white/15 text-white border-white/30 hover:bg-white/25 font-bold'
                }`}
                title="Aceder ao Painel de Administrador Geral"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentLang === 'pt' ? 'Painel Admin' : 'Admin Panel'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border whitespace-nowrap cursor-pointer transition-all shadow-xs shrink-0 flex items-center gap-1.5 ${
                activeTab === 'landing'
                  ? 'bg-white text-[#172554] border-white font-black'
                  : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{currentLang === 'pt' ? 'Início' : 'Home'}</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border whitespace-nowrap cursor-pointer transition-all shadow-xs shrink-0 flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-white text-[#172554] border-white font-black'
                  : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{currentLang === 'pt' ? 'Sobre' : 'About'}</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border whitespace-nowrap cursor-pointer transition-all shadow-xs shrink-0 flex items-center gap-1.5 ${
                activeTab === 'services'
                  ? 'bg-white text-[#172554] border-white font-black'
                  : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{currentLang === 'pt' ? 'Serviços' : 'Services'}</span>
            </button>

            {!isCandidateRole && (
              <button
                onClick={() => {
                  setClientSelectedCategory('tech_trades');
                  setActiveTab('client_find');
                }}
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border whitespace-nowrap cursor-pointer transition-all shadow-xs shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'client_find'
                    ? 'bg-white text-[#172554] border-white font-black'
                    : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>{currentLang === 'pt' ? 'Técnicos de Campo' : 'Field Techs'}</span>
              </button>
            )}

            {!isCandidateRole && (
              <button
                onClick={() => setActiveTab('profissionais')}
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border whitespace-nowrap cursor-pointer transition-all shadow-xs shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'profissionais'
                    ? 'bg-white text-[#172554] border-white font-black'
                    : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{currentLang === 'pt' ? 'Talentos e Quadros' : 'Recruit Talent'}</span>
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border whitespace-nowrap cursor-pointer transition-all shadow-xs shrink-0 flex items-center gap-1.5 bg-white/15 text-white border-white/20 hover:bg-white/25"
              title="Ver Unidades de Negócio do Ecossistema"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{currentLang === 'pt' ? 'Unidades' : 'Units'}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
