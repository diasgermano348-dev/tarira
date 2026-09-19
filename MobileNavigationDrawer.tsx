import React from 'react';
import { useBodyScrollLock, forceUnlockScroll } from './useBodyScrollLock';
import { 
  X, 
  Home, 
  Compass, 
  Wrench, 
  HardHat, 
  GraduationCap, 
  FileText, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  BarChart3, 
  Code2, 
  Briefcase,
  LogIn,
  UserPlus,
  Users
} from 'lucide-react';
import { TariraLogo } from './TariraLogo';
import {
  TariraConnectIcon,
  TariraRecruitIcon,
  TariraOutsourcingIcon,
  TariraConsultingIcon,
  TariraStudioIcon
} from './TariraUnitIcons';

export interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: 'pt' | 'en';
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isAdminLoggedIn: boolean;
  supabaseUser: any;
  supabaseProfile: any;
  selectedClient: any;
  selectedProfessional: any;
  handleSignOut: () => void;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onOpenCommercialModal: () => void;
  setClientSelectedCategory: (cat: string) => void;
  handleNavigateToEcosystem: (unitId: string) => void;
  onOpenTestAccounts?: () => void;
}

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentLang,
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  supabaseUser,
  supabaseProfile,
  selectedClient,
  selectedProfessional,
  handleSignOut,
  onOpenSignIn,
  onOpenSignUp,
  onOpenCommercialModal,
  setClientSelectedCategory,
  handleNavigateToEcosystem,
}) => {
  // Lock body scroll when drawer is open
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  // Determine if user has an active authenticated session
  const isUserAuthenticated = Boolean(
    isAdminLoggedIn ||
    supabaseUser ||
    (supabaseProfile && (supabaseProfile.email || supabaseProfile.name || supabaseProfile.id))
  );

  const navigateAndClose = (tab: string, callback?: () => void) => {
    if (callback) callback();
    setActiveTab(tab);
    onClose();
    forceUnlockScroll();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

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
        subDetail: currentLang === 'pt' ? 'Painel de Controlo Master' : 'Master Control Dashboard',
        badge: 'ADMIN',
        icon: <ShieldCheck className="w-4 h-4 text-blue-200" />
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
        subDetail: currentLang === 'pt' ? 'Gestão Predial & Comum' : 'Condo Management',
        badge: currentLang === 'pt' ? 'CONDOMÍNIO' : 'CONDO',
        icon: <Building2 className="w-4 h-4 text-blue-400" />
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
        subDetail: currentLang === 'pt' ? 'Residencial / Habitação' : 'Residential',
        badge: currentLang === 'pt' ? 'PARTICULAR' : 'INDIVIDUAL',
        icon: <Home className="w-4 h-4 text-emerald-400" />
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
        subDetail: `${currentLang === 'pt' ? 'Especialidade' : 'Specialty'}: ${cleanSpec}`,
        badge: currentLang === 'pt' ? 'PROFISSIONAL' : 'PROFESSIONAL',
        icon: <Briefcase className="w-4 h-4 text-blue-300" />
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
        subDetail: `${currentLang === 'pt' ? 'Especialidade' : 'Specialty'}: ${cleanSpec}`,
        badge: currentLang === 'pt' ? 'TÉCNICO' : 'TECH',
        icon: <Wrench className="w-4 h-4 text-blue-200" />
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
        specialty: null,
        subDetail: currentLang === 'pt' ? 'Corporativo & B2B' : 'Corporate & B2B',
        badge: currentLang === 'pt' ? 'EMPRESA' : 'COMPANY',
        icon: <Building2 className="w-4 h-4 text-blue-200" />
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
      subDetail: currentLang === 'pt' ? 'Utilizador Registado' : 'Registered User',
      badge: currentLang === 'pt' ? 'PARTICULAR' : 'INDIVIDUAL',
      icon: <Home className="w-4 h-4 text-emerald-400" />
    };
  };

  const roleInfo = getUserRoleAndProfileDetails();

  const handleDashboardNavigation = () => {
    if (roleInfo.roleKey === 'admin') {
      navigateAndClose('admin');
    } else if (roleInfo.roleKey === 'tecnico' || roleInfo.roleKey === 'profissional') {
      navigateAndClose('professional_profile');
    } else {
      navigateAndClose('company');
    }
  };

  return (
    <div
      id="tarira-mobile-menu-portal"
      className="fixed inset-0 z-[999999] lg:hidden flex justify-end animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999
      }}
    >
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer z-10"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
        aria-label="Fechar menu"
      />

      {/* 2. Slide-over Drawer Panel */}
      <aside
        id="tarira-mobile-drawer-panel"
        className="relative w-full max-w-sm sm:max-w-md bg-white border-l border-border shadow-2xl h-full overflow-y-auto z-20 flex flex-col justify-between animate-slide-left font-sans text-text-primary"
      >
        {/* Drawer Header (Corporate Blue) */}
        <div className="p-4 border-b border-blue-800 flex items-center justify-between sticky top-0 bg-[#172554] text-white z-30 shadow-md">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigateAndClose('landing')}
          >
            <TariraLogo lightBg={false} size="xs" align="left" />
          </div>

          <button
            id="mobile-drawer-close-btn"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-900/80 border border-blue-700/80 text-white hover:bg-blue-800 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
            title={currentLang === 'pt' ? 'Fechar Menu' : 'Close Menu'}
          >
            <X className="w-4 h-4 text-white" />
            <span className="text-[11px] uppercase tracking-wider">{currentLang === 'pt' ? 'Fechar' : 'Close'}</span>
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="p-4 space-y-4 flex-1 bg-white">
          {/* Active Logged-In User Card (Header-Blue Card) */}
          {isUserAuthenticated && (
            <div className="p-4 rounded-2xl bg-[#172554] border border-blue-800 text-white shadow-md space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="shrink-0 p-2 rounded-xl bg-blue-900/80 border border-blue-700 text-white">
                    {roleInfo.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-black uppercase tracking-wider text-blue-200">
                        {roleInfo.roleLabel}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <h4 className="text-sm font-black text-white truncate">
                      {roleInfo.displayName}
                    </h4>
                    {roleInfo.subDetail && (
                      <p className="text-[11px] text-blue-100 truncate font-medium">
                        {roleInfo.subDetail}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-[9px] bg-blue-900 text-white border border-blue-600 font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                  {roleInfo.badge}
                </span>
              </div>

              {/* Action Buttons: For Admin, Painel de Gestão + Sair button */}
              <div className="pt-1">
                {roleInfo.roleKey === 'admin' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="mobile-drawer-btn-admin-dashboard"
                      onClick={() => navigateAndClose('admin')}
                      className="w-full py-2.5 px-3 rounded-xl bg-white text-[#172554] font-black text-xs text-center cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md hover:bg-blue-50"
                      title={currentLang === 'pt' ? 'Ir para o Painel do Administrador' : 'Go to Admin Dashboard'}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#172554]" />
                      <span>{currentLang === 'pt' ? 'Painel Admin' : 'Admin Panel'}</span>
                    </button>
                    <button
                      id="mobile-drawer-btn-logout"
                      onClick={() => {
                        handleSignOut();
                        onClose();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs text-center cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                      title={currentLang === 'pt' ? 'Terminar Sessão e Voltar ao Menu Normal' : 'Sign Out'}
                    >
                      <LogOut className="w-4 h-4 text-white" />
                      <span>{currentLang === 'pt' ? 'Sair' : 'Log Out'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      id="mobile-drawer-btn-dashboard"
                      onClick={handleDashboardNavigation}
                      className="py-2 px-2 rounded-xl bg-white !text-[#172554] text-[#172554] font-black text-[11px] text-center cursor-pointer shadow-md flex items-center justify-center gap-1 hover:bg-blue-50 active:scale-95 transition-all truncate"
                      title={currentLang === 'pt' ? 'Meu Painel' : 'Dashboard'}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-[#172554]" />
                      <span className="!text-[#172554] text-[#172554]">{currentLang === 'pt' ? 'Meu Painel' : 'Dashboard'}</span>
                    </button>
                    <button
                      id="mobile-drawer-btn-home"
                      onClick={() => navigateAndClose('landing')}
                      className="py-2 px-2 rounded-xl bg-blue-900/80 border border-blue-700 text-white hover:bg-blue-900 font-bold text-[11px] text-center cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all truncate"
                      title={currentLang === 'pt' ? 'Ir ao Menu Principal / Início' : 'Go to Home / Main Menu'}
                    >
                      <Home className="w-3.5 h-3.5 text-white" />
                      <span>{currentLang === 'pt' ? 'Início' : 'Home'}</span>
                    </button>
                    <button
                      id="mobile-drawer-btn-logout"
                      onClick={() => {
                        handleSignOut();
                        onClose();
                      }}
                      className="py-2 px-2 rounded-xl bg-red-600 border border-red-500 text-white hover:bg-red-700 font-bold text-[11px] text-center cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all truncate"
                      title={currentLang === 'pt' ? 'Terminar Sessão' : 'Sign Out'}
                    >
                      <LogOut className="w-3.5 h-3.5 text-white" />
                      <span>{currentLang === 'pt' ? 'Sair' : 'Log Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Public Visitor Authentication Card */}
          {!isUserAuthenticated && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/60 border border-border text-text-primary shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-brand" />
                  {currentLang === 'pt' ? 'Portal & Ecossistema TARIRA' : 'TARIRA Portal & Ecosystem'}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  {currentLang === 'pt' ? 'Ativo' : 'Live'}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-snug">
                {currentLang === 'pt' 
                  ? 'Aceda à sua conta ou crie um novo registo para contratar serviços e talentos.'
                  : 'Sign in to your account or create a new profile to hire services and talents.'}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  id="mobile-drawer-btn-signin"
                  onClick={() => {
                    if (onOpenSignIn) onOpenSignIn();
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white border border-border text-text-primary hover:bg-background-secondary font-bold text-xs text-center cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-brand" />
                  <span>{currentLang === 'pt' ? 'Entrar' : 'Sign In'}</span>
                </button>
                <button
                  id="mobile-drawer-btn-signup"
                  onClick={() => {
                    if (onOpenSignUp) onOpenSignUp();
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#172554] text-white font-black text-xs text-center cursor-pointer shadow-md flex items-center justify-center gap-1.5 hover:bg-blue-900 active:scale-95 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>{currentLang === 'pt' ? 'Criar Conta' : 'Sign Up'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 🧭 NAVIGATION MENU SECTION */}
          <div>
            <div className="text-[11px] font-mono font-black uppercase tracking-wider text-brand pb-2 border-b border-border flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-brand" />
                {currentLang === 'pt' ? 'Menu de Navegação Principal' : 'Main Navigation Menu'}
              </span>
              <span className="text-[9px] text-text-secondary font-mono">TARIRA</span>
            </div>

            <div className="space-y-2 pt-2">
              {/* 1. Início */}
              <button
                onClick={() => navigateAndClose('landing')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer border ${
                  activeTab === 'landing'
                    ? 'bg-[#172554] text-white border-[#172554] shadow-md font-black'
                    : 'bg-white text-text-primary border-border hover:bg-background-secondary shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className={`w-4 h-4 ${activeTab === 'landing' ? 'text-white' : 'text-brand'}`} />
                  <span>{currentLang === 'pt' ? 'Início' : 'Home'}</span>
                </div>
                {activeTab === 'landing' && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">ACTIVO</span>}
              </button>

              {/* 2. Sobre */}
              <button
                onClick={() => navigateAndClose('about')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer border ${
                  activeTab === 'about'
                    ? 'bg-[#172554] text-white border-[#172554] shadow-md font-black'
                    : 'bg-white text-text-primary border-border hover:bg-background-secondary shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Compass className={`w-4 h-4 ${activeTab === 'about' ? 'text-white' : 'text-brand'}`} />
                  <span>{currentLang === 'pt' ? 'Sobre' : 'About'}</span>
                </div>
                {activeTab === 'about' && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">ACTIVO</span>}
              </button>

              {/* 3. Serviços */}
              <button
                onClick={() => navigateAndClose('services')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer border ${
                  activeTab === 'services'
                    ? 'bg-[#172554] text-white border-[#172554] shadow-md font-black'
                    : 'bg-white text-text-primary border-border hover:bg-background-secondary shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className={`w-4 h-4 ${activeTab === 'services' ? 'text-white' : 'text-brand'}`} />
                  <span>{currentLang === 'pt' ? 'Serviços' : 'Services'}</span>
                </div>
                {activeTab === 'services' && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">ACTIVO</span>}
              </button>

              {/* 4. Técnicos de Campo */}
              <button
                onClick={() => {
                  navigateAndClose('client_find', () => setClientSelectedCategory('tech_trades'));
                }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer border ${
                  activeTab === 'client_find'
                    ? 'bg-[#172554] text-white border-[#172554] shadow-md font-black'
                    : 'bg-white text-text-primary border-border hover:bg-background-secondary shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HardHat className={`w-4 h-4 ${activeTab === 'client_find' ? 'text-white' : 'text-brand'}`} />
                  <span>{currentLang === 'pt' ? 'Técnicos de Campo' : 'Field Technicians'}</span>
                </div>
                {activeTab === 'client_find' && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">ACTIVO</span>}
              </button>

              {/* 5. Talentos e Quadros */}
              <button
                onClick={() => navigateAndClose('profissionais')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer border ${
                  activeTab === 'profissionais'
                    ? 'bg-[#172554] text-white border-[#172554] shadow-md font-black'
                    : 'bg-white text-text-primary border-border hover:bg-background-secondary shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className={`w-4 h-4 ${activeTab === 'profissionais' ? 'text-white' : 'text-brand'}`} />
                  <span>{currentLang === 'pt' ? 'Talentos e Quadros' : 'Talent & Executives'}</span>
                </div>
                {activeTab === 'profissionais' && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">ACTIVO</span>}
              </button>

              {/* 6. Registo / Candidatura de Talentos */}
              <button
                onClick={() => navigateAndClose('professional_profile')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer border ${
                  activeTab === 'professional_profile'
                    ? 'bg-[#172554] text-white border-[#172554] shadow-md font-black'
                    : 'bg-white text-text-primary border-border hover:bg-background-secondary shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${activeTab === 'professional_profile' ? 'text-white' : 'text-brand'}`} />
                  <span>{currentLang === 'pt' ? 'Registo de Talentos & CV' : 'Talent Registration & CV'}</span>
                </div>
                {activeTab === 'professional_profile' && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">ACTIVO</span>}
              </button>

              {/* 7. Contactar Comercial (Featured Blue Card) */}
              <button
                onClick={() => {
                  onClose();
                  onOpenCommercialModal();
                }}
                className="w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer border bg-[#172554] text-white border-[#172554] hover:bg-blue-900 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-white" />
                  <span className="text-white">{currentLang === 'pt' ? 'Contactar Área Comercial' : 'Contact Sales'}</span>
                </div>
                <span className="text-[10px] text-white bg-white/20 px-2 py-0.5 rounded font-mono font-bold">B2B →</span>
              </button>
            </div>
          </div>

          {/* 🏢 ECOSYSTEM MODULES DIRECT ACCESS (5 Core Units) */}
          <div>
            <div className="text-[11px] font-mono font-black uppercase tracking-wider text-brand pb-2 border-b border-border flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand" />
                {currentLang === 'pt' ? 'Unidades do Ecossistema' : 'Ecosystem Units'}
              </span>
              <span className="text-[9px] text-text-secondary font-mono">5 UNIDADES</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { id: 'connect', title: 'Connect', desc: 'Técnicos & Ofícios', icon: <TariraConnectIcon size={16} className="text-[#172554]" /> },
                { id: 'recrute', title: 'Recruit', desc: 'Talentos & Vagas', icon: <TariraRecruitIcon size={16} className="text-[#172554]" /> },
                { id: 'business', title: 'Outsourcing', desc: 'Operações & BPO', icon: <TariraOutsourcingIcon size={16} className="text-[#172554]" /> },
                { id: 'consultoria', title: 'Consulting', desc: 'Estratégia & Gestão', icon: <TariraConsultingIcon size={16} className="text-[#172554]" /> },
                { id: 'studio', title: 'Studio', desc: 'Software Lab (Axofacil)', icon: <TariraStudioIcon size={16} className="text-[#172554]" />, colSpan: true },
              ].map(unit => (
                <button
                  key={unit.id}
                  onClick={() => {
                    handleNavigateToEcosystem(unit.id);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border bg-background-secondary hover:bg-blue-50/50 border-border transition-all flex items-center gap-2 cursor-pointer text-left shadow-xs ${unit.colSpan ? 'col-span-2' : ''}`}
                >
                  <span className="shrink-0">{unit.icon}</span>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold tracking-wide block text-text-primary">{unit.title}</span>
                    <span className="text-[9px] text-text-secondary font-mono block truncate">{unit.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 🛡️ ADMIN DIRECT ACCESS (Only when Admin is Logged In) */}
          {isAdminLoggedIn && (
            <div className="pt-3 border-t border-border space-y-2">
              <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider px-1">
                {currentLang === 'pt' ? 'Administração do Sistema' : 'System Administration'}
              </div>

              <button
                onClick={() => navigateAndClose('admin')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50 border border-blue-200 text-brand hover:bg-blue-100 font-bold text-xs flex items-center justify-between cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                  <span>{currentLang === 'pt' ? 'Consola de Administrador (Ativa)' : 'Admin Console (Active)'}</span>
                </div>
                <span className="text-[10px] text-brand font-mono">→</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
