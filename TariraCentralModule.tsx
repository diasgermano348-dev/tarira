import React, { useState, useMemo } from 'react';
import {
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Plus,
  Edit3,
  Trash2,
  User,
  Building,
  MapPin,
  DollarSign,
  ShieldCheck,
  FileText,
  Send,
  ExternalLink,
  Filter,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Eye,
  Check,
  XCircle,
  Briefcase,
  Layers,
  Calendar,
  Zap,
  Star,
  Users,
  Image as ImageIcon,
  HelpCircle,
  CreditCard,
  GraduationCap,
  Linkedin,
  Share2
} from 'lucide-react';
import { Candidate, Client, Hire, OrgOperator, OperatorAuditAction } from './types';
import { TariraProviderCrudModal } from './TariraProviderCrudModal';
import { TariraDeleteConfirmModal } from './TariraDeleteConfirmModal';
import { TariraProfilesManager } from './TariraProfilesManagerModal';
import { TariraCategoryPhotosManager } from './TariraCategoryPhotosManager';
import { TariraContactMessagesManager } from './TariraContactMessagesManager';
import { TariraOrdersCrudManager } from './TariraOrdersCrudManager';
import { TariraCompaniesCrudManager } from './TariraCompaniesCrudManager';
import { TariraProposalsCrudManager } from './TariraProposalsCrudManager';
import { TariraFinanceCrudManager } from './TariraFinanceCrudManager';
import { TariraAtsPipelineCrudManager, AtsCandidateApplication } from './TariraAtsPipelineCrudManager';
import { TariraBannersCrudManager } from './TariraBannersCrudManager';
import { TariraReviewsCrudManager } from './TariraReviewsCrudManager';
import { TariraAuditLogsManager } from './TariraAuditLogsManager';
import { TariraBriefingModal } from './TariraBriefingModal';
import { TariraJobBroadcastModal, JobBroadcastPayload } from './TariraJobBroadcastModal';
import { TariraContactSettingsManager, TariraSocialLinksData } from './TariraContactSettingsManager';
import { TariraContactSettingsModal } from './TariraContactSettingsModal';

export type CentralSubTabType =
  | 'orders'
  | 'all_profiles'
  | 'categories_and_photos'
  | 'providers'
  | 'professionals'
  | 'contact_messages'
  | 'companies'
  | 'commercial_proposals'
  | 'finance_payments'
  | 'recruit_pipeline'
  | 'banners'
  | 'reviews_feedback'
  | 'contact_settings'
  | 'logs';

interface TariraCentralModuleProps {
  candidates: Candidate[];
  hires: Hire[];
  clients: Client[];
  activeOperator?: OrgOperator;
  isAdminLoggedIn?: boolean;
  onUpdateCandidate?: (candidate: Candidate) => void;
  onDeleteCandidate?: (candidateId: string, auditData: any) => Promise<void> | void;
  onCreateCandidate?: (candidate: Partial<Candidate>) => Promise<void> | void;
  onAddHire?: (hire: Hire) => void;
  onUpdateHire?: (hire: Hire) => void;
  onDeleteHire?: (hireId: string, reason?: string) => void;
  onUpdateHireStatus?: (hireId: string, newStatus: string, notes?: string) => Promise<void> | void;
  onSelectCandidateProfile?: (candidate: Candidate) => void;
  auditLogs?: OperatorAuditAction[];
  onAddAuditLog?: (log: Partial<OperatorAuditAction>) => void;
  // Extended ecosystem props
  operators?: OrgOperator[];
  onAddOperator?: (operator: OrgOperator) => void;
  onUpdateOperator?: (operator: OrgOperator) => void;
  onDeleteOperator?: (operatorId: string) => void;
  onAddClient?: (client: Client) => void;
  onUpdateClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  categoryImages?: { [key: string]: string };
  onUpdateCategoryImages?: (images: { [key: string]: string }) => void;
  subServiceImages?: { [key: string]: string };
  onUpdateSubServiceImages?: (images: { [key: string]: string }) => void;
  landingBanners?: any[];
  onUpdateLandingBanners?: (banners: any[]) => void;
  partnerCompanies?: any[];
  onUpdatePartnerCompanies?: (companies: any[]) => void;
  paymentOrders?: any[];
  onUpdatePaymentOrders?: (payments: any[]) => void;
  spontaneousApplications?: any[];
  onUpdateSpontaneousApplications?: (applications: any[]) => void;
  proposals?: any[];
  onUpdateProposals?: (proposals: any[]) => void;
  reviews?: any[];
  onUpdateReviews?: (reviews: any[]) => void;
  socialLinks?: TariraSocialLinksData;
  onUpdateSocialLinks?: (updated: TariraSocialLinksData) => void | Promise<void>;
  payoutRequests?: any[];
  onApprovePayout?: (id: string) => Promise<void> | void;
  onRejectPayout?: (id: string, notes?: string) => Promise<void> | void;
}

export const TariraCentralModule: React.FC<TariraCentralModuleProps> = ({
  candidates,
  hires,
  clients,
  activeOperator = {
    id: 'op-central-1',
    name: 'Dra. Isolda Tembe',
    role: 'Central de Atendimento & Despacho',
    email: 'isolda.tembe@tarira.co.mz',
    orgId: 'admin-org',
    orgName: 'Central TARIRA Admin',
    permissions: ['Validar Pedidos', 'Despachar Prestadores', 'Contactar WhatsApp', 'Gerir Categorias', 'Criar Perfis'],
    status: 'Ativo',
    lastActive: 'Agora',
    avatar: '🎯'
  },
  isAdminLoggedIn = false,
  onUpdateCandidate,
  onDeleteCandidate,
  onCreateCandidate,
  onAddHire,
  onUpdateHire,
  onDeleteHire,
  onUpdateHireStatus,
  onSelectCandidateProfile,
  auditLogs = [],
  onAddAuditLog,
  operators = [],
  onAddOperator,
  onUpdateOperator,
  onDeleteOperator,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  categoryImages = {},
  onUpdateCategoryImages = () => {},
  subServiceImages = {},
  onUpdateSubServiceImages = () => {},
  landingBanners = [],
  onUpdateLandingBanners = () => {},
  partnerCompanies = [],
  onUpdatePartnerCompanies = () => {},
  paymentOrders = [],
  onUpdatePaymentOrders = () => {},
  spontaneousApplications = [],
  onUpdateSpontaneousApplications,
  proposals = [],
  onUpdateProposals,
  reviews = [],
  onUpdateReviews,
  socialLinks = {
    email: 'tarira.ecossistema@gmail.com',
    linkedin: 'https://www.linkedin.com/in/tarira-ecossistema',
    whatsapp: 'https://wa.me/258871425316',
    instagram: 'https://www.instagram.com/tarira.weoversee',
    phone1: '+258 87 142 5316',
    phone2: '+258 83 536 1379'
  },
  onUpdateSocialLinks,
  payoutRequests = [],
  onApprovePayout,
  onRejectPayout
}) => {
  const [activeSubTab, setActiveSubTab] = useState<CentralSubTabType>('orders');
  const [operatorStatusFilter, setOperatorStatusFilter] = useState<'all' | 'online' | 'busy'>('all');
  const [isContactSettingsModalOpen, setIsContactSettingsModalOpen] = useState(false);

  // Candidate/Professional modals (subtabs 4 & 5)
  const [crudModalConfig, setCrudModalConfig] = useState<{
    isOpen: boolean;
    type: 'provider' | 'professional';
    mode: 'create' | 'edit';
    candidate?: Candidate | null;
  }>({
    isOpen: false,
    type: 'provider',
    mode: 'create',
    candidate: null
  });

  const [deleteCandidateModal, setDeleteCandidateModal] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
  }>({
    isOpen: false,
    candidate: null
  });

  // Admin Briefing / Nova Vaga Modal state
  const [adminBriefingModal, setAdminBriefingModal] = useState<{ isOpen: boolean; companyName: string }>({
    isOpen: false,
    companyName: ''
  });

  const [broadcastModal, setBroadcastModal] = useState<{ isOpen: boolean; jobData: JobBroadcastPayload | null }>({
    isOpen: false,
    jobData: null
  });

  // Providers & Professionals Filters
  const [providerSearch, setProviderSearch] = useState('');
  const [providerCategoryFilter, setProviderCategoryFilter] = useState('all');
  const [professionalSearch, setProfessionalSearch] = useState('');
  const [professionalCategoryFilter, setProfessionalCategoryFilter] = useState('all');

  // Helper trigger audit log
  const triggerAuditLog = (action: string, details: string) => {
    if (onAddAuditLog) {
      onAddAuditLog({
        action,
        details,
        operatorName: activeOperator.name,
        operatorId: activeOperator.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Helper para garantir que apenas contas reais e candidaturas autênticas aparecem no painel ATS
  const isRealAccount = (item: any): boolean => {
    if (!item) return false;
    const id = String(item.id || '').toLowerCase();
    const name = String(item.fullName || `${item.name || ''} ${item.surname || ''}`).toLowerCase();
    const email = String(item.email || '').toLowerCase();
    if (['sp-101', 'sp-102', 'sp-103', 'app-001', 'app-002', 'app-003', 'app-004'].includes(id)) return false;
    if (id.startsWith('mockup-') || id.startsWith('fake-') || id.startsWith('demo-')) return false;
    if (name.includes('anabela chilenge') || name.includes('inácio langa') || name.includes('inacio langa') ||
        name.includes('sérgio macamo') || name.includes('sergio macamo') ||
        name.includes('amílcar sitoe') || name.includes('amilcar sitoe') ||
        name.includes('fátima tembe') || name.includes('fatima tembe')) {
      return false;
    }
    if (email.includes('anabela.chilenge') || email.includes('inacio.langa') || email.includes('sergio.macamo') || email.includes('amilcar.sitoe') || email.includes('fatima.tembe')) {
      return false;
    }
    return true;
  };

  // Merge spontaneousApplications with registered candidate profiles so uploaded documents (CV & BI) are always available in ATS Triagem
  const mergedAtsApplications = useMemo(() => {
    const rawList = Array.isArray(spontaneousApplications) ? spontaneousApplications.filter(isRealAccount) : [];
    const list: AtsCandidateApplication[] = [...rawList];
    const existingEmails = new Set(list.map(a => String(a.email || '').toLowerCase().trim()).filter(Boolean));
    const existingIds = new Set(list.map(a => String(a.id || '').toLowerCase().trim()).filter(Boolean));

    (candidates || []).forEach(c => {
      if (!c || !isRealAccount(c)) return;
      const cEmail = String(c.email || '').toLowerCase().trim();
      const cId = `app-${c.id}`;
      
      const docList = Array.isArray(c.documents) ? c.documents : [];
      const cvDoc = docList.find((d: any) => d.type === 'cv' || String(d.title || '').toLowerCase().includes('cv'));
      const idDoc = docList.find((d: any) => d.type === 'bi' || d.type === 'id' || String(d.title || '').toLowerCase().includes('bi'));

      if ((cEmail && existingEmails.has(cEmail)) || existingIds.has(cId.toLowerCase())) {
        const idx = list.findIndex(a => (cEmail && String(a.email || '').toLowerCase().trim() === cEmail) || String(a.id || '').toLowerCase() === cId.toLowerCase());
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            cvDocumentName: list[idx].cvDocumentName || c.cvDocumentName || c.cvDocName || cvDoc?.title || `CV_${c.name}_ATS.pdf`,
            cvDocumentUrl: list[idx].cvDocumentUrl || c.cvDocumentUrl || cvDoc?.url,
            idDocumentName: list[idx].idDocumentName || c.identityDocName || idDoc?.title || `BI_${c.name}_Oficial.pdf`,
            idDocumentUrl: list[idx].idDocumentUrl || c.identityDocUrl || idDoc?.url,
            documents: list[idx].documents && list[idx].documents.length > 0 ? list[idx].documents : c.documents
          };
        }
        return;
      }

      const isQuadro = Boolean(c.isProfessional);
      list.push({
        id: cId,
        fullName: `${c.name || ''} ${c.surname || ''}`.trim() || 'Candidato Registado',
        email: c.email || '',
        phone: c.phone || c.whatsapp || '+258 84 000 0000',
        residence: c.residence || c.city || 'Maputo',
        city: c.city || 'Maputo',
        category: c.title || c.subCategory || (isQuadro ? 'Talentos & Quadros' : 'Prestador de Campo'),
        careerFocus: isQuadro ? 'recruitment_corporate' : 'field_technician',
        nuit: (c as any).biNumber || (c as any).nuit || '',
        idDocumentName: c.identityDocName || idDoc?.title || `BI_${c.name || 'Identidade'}_Oficial.pdf`,
        idDocumentUrl: c.identityDocUrl || idDoc?.url,
        cvDocumentName: c.cvDocumentName || c.cvDocName || cvDoc?.title || `CV_${c.name || 'Candidato'}_ATS.pdf`,
        cvDocumentUrl: c.cvDocumentUrl || cvDoc?.url,
        isAtsValidated: true,
        atsScore: c.matchScore || 90,
        experienceYears: c.experienceYears || 3,
        appliedDate: c.timestamp || new Date().toISOString(),
        skillsSummary: Array.isArray(c.skills) ? c.skills.join(', ') : (c.title || 'Serviços especializados'),
        experiences: [],
        submittedAt: c.timestamp || new Date().toISOString(),
        status: (c.status === 'approved' || c.status === 'active' || c.status === 'Ativo') ? 'approved' : 'screening',
        notes: `Candidato de conta registada (${isQuadro ? 'Quadro Corporativo' : 'Prestador Connect'}).`,
        targetDepartment: c.title || c.subCategory,
        skills: Array.isArray(c.skills) ? c.skills : [c.title || 'Serviços'],
        documents: c.documents
      } as unknown as AtsCandidateApplication);
    });

    return list;
  }, [spontaneousApplications, candidates]);

  // Nav tabs with real live counts
  const navTabs: { id: CentralSubTabType; label: string; icon: string; badge?: number; highlight?: boolean }[] = [
    { id: 'orders', label: 'Central de Pedidos & Despacho', icon: '📋', badge: hires.length, highlight: true },
    { id: 'all_profiles', label: 'Gestão de Todos os Perfis & Contas', icon: '👥', badge: candidates.length + clients.length + operators.length, highlight: true },
    { id: 'categories_and_photos', label: 'Categorias & Fotos de Serviços', icon: '🖼️', highlight: true },
    { id: 'providers', label: 'Prestadores de Ofício (Connect)', icon: '🔧', badge: candidates.filter(c => !c.isProfessional).length },
    { id: 'professionals', label: 'Profissionais Especialistas (Recruit)', icon: '💼', badge: candidates.filter(c => c.isProfessional).length },
    { id: 'contact_messages', label: 'Mensagens & Contactos do Portal', icon: '💬' },
    { id: 'companies', label: 'Empresas & Condomínios Registados', icon: '🏢', badge: clients.filter(c => c.type === 'company' || c.type === 'condo').length },
    { id: 'commercial_proposals', label: 'Gestão Comercial & Propostas B2B', icon: '📑', badge: proposals?.length || 2 },
    { id: 'finance_payments', label: 'Central Financeira & Pagamentos', icon: '💳', badge: paymentOrders?.length || 2 },
    { id: 'recruit_pipeline', label: 'Candidaturas & Triagem ATS', icon: '🎓', badge: mergedAtsApplications.length },
    { id: 'banners', label: 'Banners & Destaques da Landing', icon: '🖼️', badge: landingBanners?.length || 2 },
    { id: 'reviews_feedback', label: 'Avaliações & Controlo de Qualidade', icon: '⭐', badge: reviews?.length || 2 },
    { id: 'contact_settings', label: 'Contactos & Redes Sociais (Site)', icon: '📇' },
    { id: 'logs', label: 'Histórico & Auditoria Imutável', icon: '🛡️', badge: auditLogs?.length || 0 }
  ];

  // Filtered lists for Providers (subtab 4) and Professionals (subtab 5)
  const filteredProvidersList = candidates
    .filter(c => !c.isProfessional)
    .filter(c => {
      const term = providerSearch.toLowerCase();
      const match = c.name.toLowerCase().includes(term) || (c.surname && c.surname.toLowerCase().includes(term)) || (c.city && c.city.toLowerCase().includes(term)) || (c.category && c.category.toLowerCase().includes(term));
      if (!match) return false;
      if (providerCategoryFilter !== 'all' && c.category !== providerCategoryFilter) return false;
      return true;
    });

  const filteredProfessionalsList = candidates
    .filter(c => c.isProfessional)
    .filter(c => {
      const term = professionalSearch.toLowerCase();
      const match = c.name.toLowerCase().includes(term) || (c.surname && c.surname.toLowerCase().includes(term)) || (c.city && c.city.toLowerCase().includes(term)) || (c.category && c.category.toLowerCase().includes(term)) || (c.title && c.title.toLowerCase().includes(term));
      if (!match) return false;
      if (professionalCategoryFilter !== 'all' && c.category !== professionalCategoryFilter) return false;
      return true;
    });

  return (
    <div className="space-y-6">
      {/* ════════ TOP HERO / OPERATOR STATUS BAR ════════ */}
      <div className="bg-white p-6 rounded-3xl border border-border shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#172554] flex items-center justify-center text-3xl shadow-xs shrink-0">
              {activeOperator.avatar || '🎯'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  OPERADOR ONLINE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#172554] border border-blue-200 text-[10px] font-mono font-semibold">
                  {activeOperator.orgName || 'Central Operacional TARIRA'}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#172554] mt-1">
                {activeOperator.name}
              </h1>
              <p className="text-xs text-slate-600">
                {activeOperator.role} · Permissões Globais de Despacho & Administração CRUD
              </p>
            </div>
          </div>

          {/* Action shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setBroadcastModal({
                  isOpen: true,
                  jobData: {
                    companyName: 'Central TARIRA Moçambique',
                    jobTitle: 'Profissional Especialista Técnico',
                    category: 'Tecnologia & Operações',
                    location: 'Maputo, Moçambique',
                    contactEmail: 'tarira.ecossistema@gmail.com',
                    contactPhone: '+258 84 000 0000',
                    applicationUrl: 'https://tarira.co.mz/vagas'
                  }
                });
              }}
              className="px-4 py-2.5 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Disparar vaga para o LinkedIn e redes sociais com flyer oficial"
            >
              <Linkedin className="w-4 h-4 text-[#172554]" />
              <span>Disparo LinkedIn (Flyer)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('all_profiles')}
              className="px-4 py-2.5 rounded-2xl bg-[#172554] text-white hover:brightness-110 font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Gerir Todos os Perfis</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('categories_and_photos')}
              className="px-4 py-2.5 rounded-2xl bg-white text-slate-700 hover:bg-slate-50 border border-border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <span>Fotos & Categorias</span>
            </button>
            <button
              type="button"
              onClick={() => setIsContactSettingsModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white text-slate-700 hover:bg-slate-50 border border-border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Actualizar rapidamente e-mail, WhatsApp, telefones, LinkedIn e Instagram do site"
            >
              <Phone className="w-4 h-4 text-slate-500" />
              <span>Editar Contactos</span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════ SUBTABS NAVIGATION BAR (ALL 13 MENUS) ════════ */}
      <div className="bg-white p-2 rounded-2xl border border-border shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {navTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#172554] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════ SUBTAB 1: ORDERS & DISPATCH ════════════════ */}
      {activeSubTab === 'orders' && (
        <TariraOrdersCrudManager
          hires={hires}
          candidates={candidates}
          clients={clients}
          activeOperator={activeOperator}
          onAddHire={onAddHire}
          onUpdateHire={onUpdateHire}
          onDeleteHire={onDeleteHire}
          onUpdateHireStatus={onUpdateHireStatus}
          onTriggerAuditLog={triggerAuditLog}
        />
      )}

      {/* ════════════════ SUBTAB 2: GESTÃO DE TODOS OS PERFIS & CONTAS ════════════════ */}
      {activeSubTab === 'all_profiles' && (
        <TariraProfilesManager
          operators={operators}
          clients={clients}
          candidates={candidates}
          activeOperator={activeOperator}
          onAddOperator={onAddOperator}
          onAddClient={onAddClient}
          onAddCandidate={onCreateCandidate}
          onUpdateCandidate={onUpdateCandidate}
          onDeleteCandidate={onDeleteCandidate}
          onDeleteOperator={onDeleteOperator}
          onDeleteClient={onDeleteClient}
          onTriggerAuditLog={triggerAuditLog}
        />
      )}

      {/* ════════════════ SUBTAB 3: CATEGORIAS & FOTOS ════════════════ */}
      {activeSubTab === 'categories_and_photos' && (
        <TariraCategoryPhotosManager
          categoryImages={categoryImages}
          onUpdateCategoryImages={onUpdateCategoryImages}
          subServiceImages={subServiceImages}
          onUpdateSubServiceImages={onUpdateSubServiceImages}
          onTriggerAuditLog={triggerAuditLog}
        />
      )}

      {/* ════════════════ SUBTAB 4: PRESTADORES DE OFÍCIO (CONNECT) ════════════════ */}
      {activeSubTab === 'providers' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-[#172554] text-xl border border-blue-200">
                  🔧
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#172554]">
                    Prestadores de Ofício (Tarira Connect)
                  </h2>
                  <p className="text-xs text-slate-600">
                    Eletricistas, canalizadores, técnicos de frio, marceneiros e técnicos de emergência em horário de atividade.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setCrudModalConfig({
                  isOpen: true,
                  type: 'provider',
                  mode: 'create',
                  candidate: null
                })
              }
              className="px-5 py-3 rounded-2xl bg-[#172554] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Prestador de Ofício</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar por nome, especialidade, cidade..."
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>

            <div>
              <select
                value={providerCategoryFilter}
                onChange={(e) => setProviderCategoryFilter(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-2xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all cursor-pointer font-medium"
              >
                <option value="all">Todas as Categorias de Ofício ({filteredProvidersList.length})</option>
                <option value="tech">🔌 Eletricidade & AVAC</option>
                <option value="mechanic">🚗 Mecânica & Geradores</option>
                <option value="construction">🧱 Construção & Canalização</option>
                <option value="cleaning">🧹 Limpeza & Tratamento</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProvidersList.map((cand) => (
              <div
                key={cand.id}
                className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-3 flex flex-col justify-between hover:border-blue-200 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#172554] flex items-center justify-center text-xl shrink-0 overflow-hidden">
                        {cand.photo ? (
                          <img src={cand.photo} alt={cand.name} className="w-full h-full object-cover" />
                        ) : (
                          cand.avatar || '🔧'
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#172554]">
                          {cand.name} {cand.surname}
                        </h3>
                        <span className="text-xs text-slate-600 font-medium block">
                          {cand.title || cand.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectCandidateProfile && onSelectCandidateProfile(cand)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#172554] hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Ver Perfil Completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCrudModalConfig({
                            isOpen: true,
                            type: 'provider',
                            mode: 'edit',
                            candidate: cand
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#172554] hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Editar Prestador"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteCandidateModal({
                            isOpen: true,
                            candidate: cand
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Eliminar Prestador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-border text-xs flex items-center justify-between">
                    <span className="text-slate-600 font-medium">{cand.city || 'Maputo'} · {cand.experienceYears || 3} anos exp.</span>
                    <span className="font-mono text-[#172554] font-bold">{cand.hourlyRate || 500} MZN/h</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-slate-500">
                  <span>{cand.phone || '+258 84 000 0000'}</span>
                  {cand.phone && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = cand.phone?.replace(/\D/g, '') || '';
                        window.open(`https://wa.me/258${target.slice(-9)}`, '_blank');
                      }}
                      className="text-emerald-600 hover:underline font-bold"
                    >
                      💬 WhatsApp
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════ SUBTAB 5: PROFISSIONAIS ESPECIALISTAS (RECRUIT) ════════════════ */}
      {activeSubTab === 'professionals' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-[#172554] text-xl border border-blue-200">
                  💼
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#172554]">
                    Profissionais Especialistas (Tarira Recruit)
                  </h2>
                  <p className="text-xs text-slate-600">
                    Engenheiros, auditores, consultores de gestão, especialistas em TI e quadros técnicos corporativos.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setCrudModalConfig({
                  isOpen: true,
                  type: 'professional',
                  mode: 'create',
                  candidate: null
                })
              }
              className="px-5 py-3 rounded-2xl bg-[#172554] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Profissional Especialista</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar especialista, título corporativo, cidade..."
                value={professionalSearch}
                onChange={(e) => setProfessionalSearch(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>

            <div>
              <select
                value={professionalCategoryFilter}
                onChange={(e) => setProfessionalCategoryFilter(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-2xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all cursor-pointer font-medium"
              >
                <option value="all">Todas as Áreas Corporativas ({filteredProfessionalsList.length})</option>
                <option value="engineering">📐 Engenharia & Manutenção</option>
                <option value="tech">💻 TI, Redes & Software</option>
                <option value="management">📊 Gestão & Auditoria</option>
                <option value="consulting">📋 Consultoria de Processos</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfessionalsList.map((cand) => (
              <div
                key={cand.id}
                className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-3 flex flex-col justify-between hover:border-blue-200 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#172554] flex items-center justify-center text-xl shrink-0 overflow-hidden">
                        {cand.photo ? (
                          <img src={cand.photo} alt={cand.name} className="w-full h-full object-cover" />
                        ) : (
                          cand.avatar || '💼'
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#172554]">
                          {cand.name} {cand.surname}
                        </h3>
                        <span className="text-xs text-slate-600 font-medium block">
                          {cand.title || 'Especialista Corporativo'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectCandidateProfile && onSelectCandidateProfile(cand)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#172554] hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Ver Perfil Completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCrudModalConfig({
                            isOpen: true,
                            type: 'professional',
                            mode: 'edit',
                            candidate: cand
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#172554] hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Editar Especialista"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteCandidateModal({
                            isOpen: true,
                            candidate: cand
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Eliminar Especialista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-border text-xs flex items-center justify-between">
                    <span className="text-slate-600 font-medium">{cand.city || 'Maputo'} · {cand.experienceYears || 5} anos exp.</span>
                    <span className="font-mono text-[#172554] font-bold">{cand.rateMzn || cand.hourlyRate ? `${(cand.rateMzn || cand.hourlyRate! * 8).toLocaleString()} MZN` : 'A Negociar'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-slate-500">
                  <span>{cand.email || 'especialista@tarira.co.mz'}</span>
                  {cand.phone && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = cand.phone?.replace(/\D/g, '') || '';
                        window.open(`https://wa.me/258${target.slice(-9)}`, '_blank');
                      }}
                      className="text-emerald-600 hover:underline font-bold"
                    >
                      💬 WhatsApp
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════ SUBTAB 6: CONTACT MESSAGES ════════════════ */}
      {activeSubTab === 'contact_messages' && (
        <TariraContactMessagesManager onTriggerAuditLog={triggerAuditLog} />
      )}

      {/* ════════════════ SUBTAB 7: EMPRESAS & CONDOMÍNIOS ════════════════ */}
      {activeSubTab === 'companies' && (
        <TariraCompaniesCrudManager
          clients={clients}
          partnerCompanies={partnerCompanies}
          onAddClient={onAddClient}
          onUpdateClient={onUpdateClient}
          onDeleteClient={onDeleteClient}
          onUpdatePartnerCompanies={onUpdatePartnerCompanies}
          onTriggerAuditLog={triggerAuditLog}
          onOpenBriefing={(compName) => setAdminBriefingModal({ isOpen: true, companyName: compName || '' })}
        />
      )}

      {/* ════════════════ SUBTAB 8: PROPOSTAS COMERCIAIS ════════════════ */}
      {activeSubTab === 'commercial_proposals' && (
        <TariraProposalsCrudManager
          proposals={proposals}
          onUpdateProposals={onUpdateProposals}
          onTriggerAuditLog={triggerAuditLog}
        />
      )}

      {/* ════════════════ SUBTAB 9: CENTRAL FINANCEIRA ════════════════ */}
      {activeSubTab === 'finance_payments' && (
        <TariraFinanceCrudManager
          paymentOrders={paymentOrders}
          onUpdatePaymentOrders={onUpdatePaymentOrders}
          onTriggerAuditLog={triggerAuditLog}
          payoutRequests={payoutRequests}
          onApprovePayout={onApprovePayout}
          onRejectPayout={onRejectPayout}
        />
      )}

      {/* ════════════════ SUBTAB 10: ATS PIPELINE ════════════════ */}
      {activeSubTab === 'recruit_pipeline' && (
        <TariraAtsPipelineCrudManager
          applications={mergedAtsApplications}
          onUpdateApplications={onUpdateSpontaneousApplications}
          onTriggerAuditLog={triggerAuditLog}
        />
      )}

      {/* ════════════════ SUBTAB 11: BANNERS ════════════════ */}
      {activeSubTab === 'banners' && (
        <TariraBannersCrudManager
          banners={landingBanners}
          onUpdateBanners={onUpdateLandingBanners}
          onTriggerAuditLog={triggerAuditLog}
        />
      )}

      {/* ════════════════ SUBTAB 12: AVALIAÇÕES ════════════════ */}
      {activeSubTab === 'reviews_feedback' && (
        <TariraReviewsCrudManager
          reviews={reviews}
          onUpdateReviews={onUpdateReviews}
          onTriggerAuditLog={triggerAuditLog}
        />
      )}

      {/* ════════════════ SUBTAB 13: CONTACTOS & REDES SOCIAIS DO SITE ════════════════ */}
      {activeSubTab === 'contact_settings' && (
        <TariraContactSettingsManager
          socialLinks={socialLinks}
          onUpdateSocialLinks={onUpdateSocialLinks}
          onTriggerAuditLog={triggerAuditLog}
        />
      )}

      {/* ════════════════ SUBTAB 14: LOGS & AUDITORIA ════════════════ */}
      {activeSubTab === 'logs' && (
        <TariraAuditLogsManager
          auditLogs={auditLogs}
          activeOperator={activeOperator}
          onAddAuditLog={onAddAuditLog}
        />
      )}

      {/* ════════ QUICK-ACCESS MODAL: CONTACTOS & REDES SOCIAIS DO SITE ════════ */}
      <TariraContactSettingsModal
        isOpen={isContactSettingsModalOpen}
        socialLinks={socialLinks}
        onClose={() => setIsContactSettingsModalOpen(false)}
        onUpdateSocialLinks={onUpdateSocialLinks}
        onTriggerAuditLog={triggerAuditLog}
      />

      {/* ════════ REUSABLE MODALS: PROVIDER/PROFESSIONAL CRUD & DELETE ════════ */}
      {crudModalConfig.isOpen && (
        <TariraProviderCrudModal
          isOpen={crudModalConfig.isOpen}
          type={crudModalConfig.type}
          mode={crudModalConfig.mode}
          candidate={crudModalConfig.candidate}
          onClose={() => setCrudModalConfig({ isOpen: false, type: 'provider', mode: 'create', candidate: null })}
          onSubmit={async (data) => {
            if (crudModalConfig.mode === 'create') {
              if (onCreateCandidate) await onCreateCandidate(data);
              triggerAuditLog('CRIAR_PRESTADOR', `Novo perfil (${crudModalConfig.type}): ${data.name}`);
            } else if (crudModalConfig.mode === 'edit' && crudModalConfig.candidate) {
              if (onUpdateCandidate) onUpdateCandidate({ ...crudModalConfig.candidate, ...data } as Candidate);
              triggerAuditLog('EDITAR_PRESTADOR', `Perfil atualizado: ${data.name}`);
            }
            setCrudModalConfig({ isOpen: false, type: 'provider', mode: 'create', candidate: null });
          }}
        />
      )}

      {deleteCandidateModal.isOpen && deleteCandidateModal.candidate && (
        <TariraDeleteConfirmModal
          isOpen={deleteCandidateModal.isOpen}
          title={`Eliminar ${deleteCandidateModal.candidate.isProfessional ? 'Profissional' : 'Prestador'}`}
          description={`Tem a certeza de que deseja remover permanentemente o perfil de ${deleteCandidateModal.candidate.name}?`}
          onClose={() => setDeleteCandidateModal({ isOpen: false, candidate: null })}
          onConfirm={async (reason) => {
            if (onDeleteCandidate && deleteCandidateModal.candidate) {
              await onDeleteCandidate(deleteCandidateModal.candidate.id, { reason });
            }
            setDeleteCandidateModal({ isOpen: false, candidate: null });
          }}
        />
      )}

      {/* ════════ BRIEFING & DISPARO DE VAGA CENTRAL / ADMIN ════════ */}
      {adminBriefingModal.isOpen && (
        <TariraBriefingModal
          isOpen={adminBriefingModal.isOpen}
          initialCompanyName={adminBriefingModal.companyName}
          isAdminMode={true}
          onClose={() => setAdminBriefingModal({ isOpen: false, companyName: '' })}
          onSuccess={(newReq) => {
            triggerAuditLog('DISPARO_VAGA_ADMIN', `Vaga/Briefing disparada pelo Administrador para ${newReq?.companyName || 'Empresa'}: ${newReq?.technicalProfile || 'Vaga'}`);
            setAdminBriefingModal({ isOpen: false, companyName: '' });
          }}
        />
      )}
      {/* Tarira Job Broadcast Modal */}
      {broadcastModal.isOpen && broadcastModal.jobData && (
        <TariraJobBroadcastModal
          isOpen={broadcastModal.isOpen}
          onClose={() => setBroadcastModal({ isOpen: false, jobData: null })}
          jobData={broadcastModal.jobData}
          onLogAudit={triggerAuditLog}
        />
      )}
    </div>
  );
};
