import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Building, 
  Briefcase, 
  Home, 
  Wrench, 
  Award, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  X, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Sparkles,
  Key,
  Layers,
  MoreVertical,
  Edit3,
  Check,
  AlertCircle,
  Copy,
  Send,
  MessageSquare,
  FileText,
  MapPin,
  Clock,
  Shield,
  UserCheck,
  UserX,
  ExternalLink
} from 'lucide-react';
import { OrgOperator, Client, Candidate } from './types';
import { uploadImageToImgBB } from './imgbbUpload';

export type UserRoleType = 
  | 'admin'
  | 'central_operator'
  | 'commercial_manager'
  | 'recruiter'
  | 'residential_client'
  | 'condo_manager'
  | 'corporate_company'
  | 'provider'
  | 'professional';

export interface UnifiedProfileRecord {
  id: string;
  name: string;
  surname?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  role: UserRoleType;
  roleLabel: string;
  roleBadge: string;
  organization?: string;
  status: 'Ativo' | 'Pendente' | 'Suspenso';
  createdAt: string;
  city?: string;
  nuitOrBi?: string;
  permissions?: string[];
  notes?: string;
  avatar?: string;
  category?: string;
  hourlyRate?: number;
  // Campos específicos de Prestadores/Profissionais (candidates) — em falta
  // antes, o que impedia o admin de editar cargo, biografia, competências
  // e faixa salarial a partir deste painel unificado.
  title?: string;
  bio?: string;
  skills?: string[] | string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
}

interface TariraProfilesManagerProps {
  operators: OrgOperator[];
  clients: Client[];
  candidates: Candidate[];
  activeOperator?: OrgOperator;
  onAddOperator?: (operator: OrgOperator) => void;
  onUpdateOperator?: (operator: OrgOperator) => void;
  onDeleteOperator?: (operatorId: string) => void;
  onAddClient?: (client: Client) => void;
  onUpdateClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onAddCandidate?: (candidate: Partial<Candidate>) => void;
  onUpdateCandidate?: (candidate: Candidate) => void;
  onDeleteCandidate?: (candidateId: string, auditData?: any) => void;
  onTriggerAuditLog?: (action: string, details: string) => void;
}

export const TariraProfilesManager: React.FC<TariraProfilesManagerProps> = ({
  operators,
  clients,
  candidates,
  onAddOperator,
  onUpdateOperator,
  onDeleteOperator,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onAddCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
  onTriggerAuditLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<UnifiedProfileRecord | null>(null);
  const [editingProfile, setEditingProfile] = useState<UnifiedProfileRecord | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<UnifiedProfileRecord | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [passwordModalProfile, setPasswordModalProfile] = useState<UnifiedProfileRecord | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('Tarira@2026!');
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Active Dropdown state (stores id of profile whose 3-dots menu is currently open)
  const [activeMenuProfileId, setActiveMenuProfileId] = useState<string | null>(null);

  // New Profile Form State
  const [formRole, setFormRole] = useState<UserRoleType>('provider');
  const [formName, setFormName] = useState('');
  const [formSurname, setFormSurname] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+258 ');
  const [formCity, setFormCity] = useState('Maputo');
  const [formNuitBi, setFormNuitBi] = useState('');
  const [formOrg, setFormOrg] = useState('TARIRA');
  const [formCategory, setFormCategory] = useState('Eletricidade & Climatização');
  const [formHourlyRate, setFormHourlyRate] = useState(600);
  const [formPassword, setFormPassword] = useState('Tarira@2026');
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Pendente' | 'Suspenso'>('Ativo');
  const [formPermissions, setFormPermissions] = useState<string[]>([
    'Acesso ao Painel',
    'Receber Notificações'
  ]);
  const [formNotes, setFormNotes] = useState('');

  // Toast Notification State
  const [toast, setToast] = useState<{ text: string; type?: 'success' | 'info' | 'error' } | null>(null);

  // Estado de upload da foto no modal de edição de perfil
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Close dropdown on click outside or escape
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-action-menu-container')) {
        setActiveMenuProfileId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Build unified list of all profiles currently in the ecosystem
  const unifiedProfiles: UnifiedProfileRecord[] = [
    // 1. Operators & Admins
    ...(operators || []).filter(Boolean).map((op) => {
      const opRole = String(op.role || 'Operador Central');
      const roleLower = opRole.toLowerCase();
      const isAdmin = roleLower.includes('ceo') || roleLower.includes('admin');
      return {
        id: String(op.id || `op-${Math.random()}`),
        name: String(op.name || 'Operador'),
        email: String(op.email || 'operador@tarira.co.mz'),
        phone: String(op.phone || '+258 84 100 0000'),
        role: (isAdmin ? 'admin' : 'central_operator') as UserRoleType,
        roleLabel: opRole,
        roleBadge: isAdmin ? 'ADMIN GERAL' : 'OPERADOR CENTRAL',
        organization: String(op.orgName || 'TARIRA Central'),
        status: (op.status as any) || 'Ativo',
        createdAt: '2026-01-10',
        permissions: op.permissions || ['Acesso ao Painel', 'Validar Pedidos', 'Gestão Integral'],
        notes: 'Operador com credenciais administrativas autorizadas.'
      };
    }),
    // 2. Clients (Residential, Condo, Corporate)
    ...(clients || []).filter(Boolean).map((cl) => {
      const isCondo = cl.type === 'condo';
      const isCorp = cl.type === 'company';
      const role: UserRoleType = isCondo ? 'condo_manager' : isCorp ? 'corporate_company' : 'residential_client';
      return {
        id: String(cl.id || `cl-${Math.random()}`),
        name: String(cl.name || 'Cliente'),
        email: String(cl.email || 'cliente@tarira.co.mz'),
        phone: String(cl.phone || '+258 84 000 0000'),
        role,
        roleLabel: isCondo ? 'Gestor de Condomínio' : isCorp ? 'Empresa Corporativa' : 'Cliente Residencial',
        roleBadge: isCondo ? 'CONDOMÍNIO' : isCorp ? 'EMPRESA B2B' : 'RESIDENCIAL',
        organization: String(cl.name || 'Cliente'),
        status: 'Ativo' as const,
        createdAt: cl.createdAt || '2026-02-01',
        city: cl.city || 'Maputo',
        nuitOrBi: cl.nuit || cl.bi,
        permissions: ['Solicitar Serviços', 'Histórico de Faturação', 'Avaliar Técnicos'],
        notes: cl.notes || 'Conta de cliente verificada na plataforma.'
      };
    }),
    // 3. Providers & Specialists
    ...(candidates || []).filter(Boolean).map((cand) => ({
      id: String(cand.id || `cand-${Math.random()}`),
      name: String(cand.name || 'Prestador'),
      surname: cand.surname ? String(cand.surname) : undefined,
      email: String(cand.email || 'profissional@tarira.co.mz'),
      phone: String(cand.phone || '+258 84 000 0000'),
      whatsapp: cand.whatsapp ? String(cand.whatsapp) : undefined,
      role: (cand.isProfessional ? 'professional' : 'provider') as UserRoleType,
      roleLabel: cand.isProfessional ? `Especialista (${cand.category || 'Recruit'})` : `Técnico (${cand.category || 'Ofício'})`,
      roleBadge: cand.isProfessional ? 'PROFISSIONAL RECRUIT' : 'PRESTADOR CONNECT',
      organization: 'Prestador Credenciado TARIRA',
      status: (cand.availableNow !== false ? 'Ativo' : 'Pendente') as any,
      createdAt: '2026-02-15',
      city: cand.city || 'Maputo',
      permissions: ['Receber Despachos', 'Aceitar Ordens de Serviço', 'Acesso à Carteira'],
      notes: `${cand.title || 'Técnico'} com ${cand.experienceYears || 3} anos de experiência.`,
      avatar: cand.photo,
      category: cand.category,
      hourlyRate: cand.hourlyRate,
      title: cand.title,
      bio: cand.bio,
      skills: cand.skills,
      expectedSalaryMin: cand.expectedSalaryMin,
      expectedSalaryMax: cand.expectedSalaryMax
    }))
  ];

  // Filtering
  const filteredList = unifiedProfiles.filter((p) => {
    const term = String(searchTerm || '').toLowerCase();
    const pName = String(p.name || '').toLowerCase();
    const pSurname = String(p.surname || '').toLowerCase();
    const pEmail = String(p.email || '').toLowerCase();
    const pPhone = String(p.phone || '').toLowerCase();
    const pRoleLabel = String(p.roleLabel || '').toLowerCase();
    const pOrg = String(p.organization || '').toLowerCase();
    const pCity = String(p.city || '').toLowerCase();

    const matchesSearch = 
      pName.includes(term) ||
      pSurname.includes(term) ||
      pEmail.includes(term) ||
      pPhone.includes(term) ||
      pRoleLabel.includes(term) ||
      pOrg.includes(term) ||
      pCity.includes(term);

    if (!matchesSearch) return false;

    if (roleFilter !== 'all') {
      if (roleFilter === 'admin' && p.role !== 'admin' && p.role !== 'central_operator') return false;
      if (roleFilter === 'clients' && p.role !== 'residential_client' && p.role !== 'condo_manager' && p.role !== 'corporate_company') return false;
      if (roleFilter === 'providers' && p.role !== 'provider') return false;
      if (roleFilter === 'professionals' && p.role !== 'professional') return false;
    }

    if (statusFilter !== 'all' && p.status !== statusFilter) return false;

    return true;
  });

  // Handle Quick Toggle Status
  const handleToggleStatus = (prof: UnifiedProfileRecord) => {
    const nextStatus = prof.status === 'Ativo' ? 'Suspenso' : 'Ativo';
    
    // Check if operator
    const isOp = operators.some(o => o.id === prof.id);
    if (isOp && onUpdateOperator) {
      const target = operators.find(o => o.id === prof.id);
      if (target) {
        onUpdateOperator({ ...target, status: nextStatus });
      }
    }

    // Check if candidate
    const isCand = candidates.some(c => c.id === prof.id);
    if (isCand && onUpdateCandidate) {
      const target = candidates.find(c => c.id === prof.id);
      if (target) {
        onUpdateCandidate({ ...target, availableNow: nextStatus === 'Ativo' });
      }
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'ALTERAR_ESTADO_PERFIL',
        `Estado do perfil ${prof.name} (#${prof.id}) alterado de ${prof.status} para ${nextStatus}.`
      );
    }

    showToast(`Estado de ${prof.name} atualizado para ${nextStatus}!`);
    setActiveMenuProfileId(null);
  };

  // Handle Create Profile
  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Por favor, preencha o Nome e o E-mail.', 'error');
      return;
    }

    const newId = `usr-${Date.now()}`;

    if (formRole === 'admin' || formRole === 'central_operator' || formRole === 'commercial_manager' || formRole === 'recruiter') {
      const newOp: OrgOperator = {
        id: newId,
        name: `${formName} ${formSurname}`.trim(),
        role: formRole === 'admin' ? 'Administrador Geral' : formRole === 'central_operator' ? 'Operador de Despacho' : formRole === 'commercial_manager' ? 'Gestor Comercial' : 'Recrutador ATS',
        email: formEmail,
        orgId: 'tarira-org',
        orgName: formOrg || 'TARIRA Central',
        permissions: formPermissions,
        status: formStatus,
        lastActive: 'Criado agora',
        avatar: formRole === 'admin' ? '🛡️' : '🎯'
      };
      if (onAddOperator) onAddOperator(newOp);
    } else if (formRole === 'residential_client' || formRole === 'condo_manager' || formRole === 'corporate_company') {
      const newCl: Client = {
        id: newId,
        name: `${formName} ${formSurname}`.trim(),
        type: formRole === 'condo_manager' ? 'condo' : formRole === 'corporate_company' ? 'company' : 'residential',
        phone: formPhone,
        email: formEmail,
        city: formCity,
        nuit: formNuitBi,
        createdAt: new Date().toISOString().split('T')[0],
        notes: formNotes
      };
      if (onAddClient) onAddClient(newCl);
    } else {
      const isProf = formRole === 'professional';
      const newCand: Partial<Candidate> = {
        id: newId,
        name: formName,
        surname: formSurname,
        email: formEmail,
        phone: formPhone,
        city: formCity,
        category: formCategory as any,
        title: isProf ? `Consultor / Especialista (${formCategory})` : `Técnico Especialista (${formCategory})`,
        hourlyRate: Number(formHourlyRate) || 500,
        rateMzn: (Number(formHourlyRate) || 500) * 8,
        experienceYears: 4,
        rating: 5.0,
        reviewsCount: 0,
        availableNow: formStatus === 'Ativo',
        availableForEmergency: !isProf,
        isProfessional: isProf
      };
      if (onAddCandidate) onAddCandidate(newCand);
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog('CRIAÇÃO_PERFIL', `Novo perfil (${formRole}) criado: ${formName} ${formSurname} (${formEmail})`);
    }

    showToast(`Perfil de ${formName} criado com sucesso no ecossistema!`);
    setIsCreateModalOpen(false);

    // Reset Form
    setFormName('');
    setFormSurname('');
    setFormEmail('');
    setFormPhone('+258 ');
    setFormNuitBi('');
    setFormNotes('');
  };

  // Handle Edit Photo Upload — envia a nova foto para o ImgBB (com reservas
  // automáticas para Supabase Storage / Base64) e guarda o URL resultante
  // diretamente no perfil em edição, para ser gravado ao submeter o formulário.
  const handleEditPhotoUpload = (file: File) => {
    if (!editingProfile) return;
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecione um ficheiro de imagem válido.', 'error');
      return;
    }
    setIsUploadingEditPhoto(true);
    uploadImageToImgBB(file)
      .then((url) => {
        setEditingProfile((prev) => (prev ? { ...prev, avatar: url } : prev));
        showToast('Foto carregada. Clique em "Salvar Alterações" para confirmar.', 'info');
      })
      .catch(() => {
        showToast('Erro ao carregar a foto. Tente novamente.', 'error');
      })
      .finally(() => setIsUploadingEditPhoto(false));
  };

  // Handle Edit Profile Save
  const handleEditProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    // 1. Update in operators
    const isOp = operators.some(o => o.id === editingProfile.id);
    if (isOp && onUpdateOperator) {
      const current = operators.find(o => o.id === editingProfile.id);
      if (current) {
        onUpdateOperator({
          ...current,
          name: `${editingProfile.name} ${editingProfile.surname || ''}`.trim(),
          email: editingProfile.email,
          orgName: editingProfile.organization || current.orgName,
          status: editingProfile.status,
          permissions: editingProfile.permissions || current.permissions
        });
      }
    }

    // 2. Update in clients
    const isCl = clients.some(c => c.id === editingProfile.id);
    if (isCl && onUpdateClient) {
      const current = clients.find(c => c.id === editingProfile.id);
      if (current) {
        onUpdateClient({
          ...current,
          name: `${editingProfile.name} ${editingProfile.surname || ''}`.trim(),
          email: editingProfile.email,
          phone: editingProfile.phone,
          city: editingProfile.city || current.city,
          nuit: editingProfile.nuitOrBi || current.nuit,
          notes: editingProfile.notes
        });
      }
    }

    // 3. Update in candidates
    const isCand = candidates.some(c => c.id === editingProfile.id);
    if (isCand && onUpdateCandidate) {
      const current = candidates.find(c => c.id === editingProfile.id);
      if (current) {
        // Título/cargo: limitado a 70 caracteres para nunca mais crescer
        // ao ponto de tapar a foto no cartão do candidato (ver correção do
        // overlay em TariraProfessionalsGallery). Especializações longas
        // devem continuar no Resumo Profissional, não no Cargo.
        const trimmedTitle = String(editingProfile.title ?? current.title ?? '').trim().slice(0, 70);

        const parsedSkills = Array.isArray(editingProfile.skills)
          ? editingProfile.skills
          : typeof editingProfile.skills === 'string'
            ? editingProfile.skills.split(',').map((s) => s.trim()).filter(Boolean)
            : current.skills;

        onUpdateCandidate({
          ...current,
          name: editingProfile.name,
          surname: editingProfile.surname,
          email: editingProfile.email,
          phone: editingProfile.phone,
          city: editingProfile.city || current.city,
          availableNow: editingProfile.status === 'Ativo',
          title: trimmedTitle || current.title,
          bio: editingProfile.bio !== undefined ? editingProfile.bio : current.bio,
          skills: parsedSkills,
          expectedSalaryMin: editingProfile.expectedSalaryMin !== undefined && editingProfile.expectedSalaryMin !== null
            ? Number(editingProfile.expectedSalaryMin)
            : current.expectedSalaryMin,
          expectedSalaryMax: editingProfile.expectedSalaryMax !== undefined && editingProfile.expectedSalaryMax !== null
            ? Number(editingProfile.expectedSalaryMax)
            : current.expectedSalaryMax,
          photo: editingProfile.avatar || current.photo
        });
      }
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog('EDIÇÃO_PERFIL', `Perfil ${editingProfile.name} (#${editingProfile.id}) atualizado na Central.`);
    }

    showToast(`Perfil de ${editingProfile.name} atualizado com sucesso!`);
    setEditingProfile(null);
  };

  // Handle Delete Profile Confirm
  const handleConfirmDelete = () => {
    if (!deletingProfile) return;
    if (!deleteReason.trim()) {
      showToast('Por favor, informe a justificativa de auditoria para exclusão.', 'error');
      return;
    }

    // Check operator
    if (operators.some(o => o.id === deletingProfile.id) && onDeleteOperator) {
      onDeleteOperator(deletingProfile.id);
    }
    // Check client
    if (clients.some(c => c.id === deletingProfile.id) && onDeleteClient) {
      onDeleteClient(deletingProfile.id);
    }
    // Check candidate
    if (candidates.some(c => c.id === deletingProfile.id) && onDeleteCandidate) {
      onDeleteCandidate(deletingProfile.id, { reason: deleteReason });
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'ELIMINAÇÃO_PERFIL',
        `Perfil ${deletingProfile.name} (#${deletingProfile.id}) eliminado. Motivo: ${deleteReason}`
      );
    }

    showToast(`Perfil de ${deletingProfile.name} eliminado com sucesso.`);
    setDeletingProfile(null);
    setDeleteReason('');
    setActiveMenuProfileId(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 border animate-bounce ${
          toast.type === 'error' ? 'bg-rose-600 text-white border-rose-400' : 'bg-[#172554] text-white border-blue-300'
        }`}>
          <Sparkles className="w-4 h-4" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-700 text-xl border border-blue-500/30">
              👥
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#172554]">
                Gestão de Todos os Perfis & Contas
              </h2>
              <p className="text-xs text-slate-400">
                Administradores, Gestores, Clientes Residenciais, Condomínios, Empresas B2B, Prestadores e Especialistas.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:brightness-110 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Criar Novo Perfil</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por nome, email, telefone, ID ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-blue-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
          >
            <option value="all">Todos os Papéis ({unifiedProfiles.length})</option>
            <option value="admin">🛡️ Administradores & Operadores Central</option>
            <option value="clients">👤 Clientes (Residenciais, Condos & Empresas)</option>
            <option value="providers">🔧 Prestadores de Ofício (Connect)</option>
            <option value="professionals">🎓 Profissionais Especialistas (Recruit)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
          >
            <option value="all">Todos os Estados</option>
            <option value="Ativo">🟢 Ativo / Verificado</option>
            <option value="Pendente">🟡 Pendente / Em Validação</option>
            <option value="Suspenso">🚫 Suspenso / Bloqueado</option>
          </select>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 bg-white overflow-visible shadow-2xl">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[10px] uppercase font-mono tracking-wider text-slate-400">
                <th className="p-4">Perfil / Nome</th>
                <th className="p-4">Papel & Categoria</th>
                <th className="p-4">Contactos</th>
                <th className="p-4">Organização / Cidade</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    Nenhum perfil encontrado com os filtros actuais.
                  </td>
                </tr>
              ) : (
                filteredList.map((prof) => (
                  <tr key={prof.id} className="hover:bg-white transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-base font-bold text-blue-700 shrink-0">
                          {prof.role === 'admin' ? '🛡️' : prof.role === 'condo_manager' ? '🏘️' : prof.role === 'corporate_company' ? '🏢' : prof.role === 'provider' ? '🔧' : prof.role === 'professional' ? '🎓' : '👤'}
                        </div>
                        <div>
                          <span className="font-bold text-[#172554] block">
                            {prof.name} {prof.surname || ''}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: #{String(prof.id || '').slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase inline-block ${
                        prof.role === 'admin' ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30' :
                        prof.role === 'condo_manager' || prof.role === 'corporate_company' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                        prof.role === 'provider' ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {prof.roleBadge}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        {prof.roleLabel}
                      </span>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {prof.email}
                      </span>
                      <span className="font-mono text-emerald-600 flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        {prof.phone}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-[#172554] font-medium block">
                        {prof.organization || 'Espaço Particular'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {prof.city || 'Maputo / Moçambique'}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        prof.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-500/30' :
                        prof.status === 'Pendente' ? 'bg-blue-50 text-blue-700 border border-blue-500/30' :
                        'bg-rose-50 text-rose-700 border border-rose-500/30'
                      }`}>
                        {prof.status}
                      </span>
                    </td>

                    {/* ACTIONS WITH THE 3 DOTS MENU FIXED */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 relative profile-action-menu-container">
                        {/* Direct WhatsApp Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetPhone = String(prof.whatsapp || prof.phone || '').replace(/\D/g, '');
                            const msg = `Olá *${prof.name}*, contactamos a partir do Painel Administrativo TARIRA sobre a sua conta (${prof.roleLabel}).`;
                            window.open(`https://wa.me/258${targetPhone.slice(-9)}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 hover:border-emerald-500/40 transition-all cursor-pointer"
                          title="Contactar via WhatsApp"
                        >
                          💬
                        </button>

                        {/* Direct Edit Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProfile({ ...prof });
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-500/40 transition-all cursor-pointer"
                          title="Editar Perfil"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* 3 DOTS BUTTON */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuProfileId(activeMenuProfileId === prof.id ? null : prof.id);
                            }}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              activeMenuProfileId === prof.id 
                                ? 'bg-[#172554] text-white border-[#172554] shadow-lg' 
                                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200 hover:text-[#172554]'
                            }`}
                            title="Mais Opções / Ações de Perfil"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* 3 DOTS POPUP DROPDOWN MENU */}
                          {activeMenuProfileId === prof.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-blue-500/40 shadow-2xl py-2 z-50 text-left divide-y divide-slate-200/80 backdrop-blur-xl animate-fade-in"
                            >
                              <div className="px-3 py-1.5 bg-white">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                                  Ações de Conta #{String(prof.id || '').slice(-5).toUpperCase()}
                                </span>
                              </div>

                              <div className="py-1">
                                {/* 1. Ver Detalhes */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingProfile(prof);
                                    setActiveMenuProfileId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-left text-slate-200 hover:text-blue-700 hover:bg-white flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-700" />
                                  <span>Ver Dossiê / Detalhes</span>
                                </button>

                                {/* 2. Editar Perfil */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProfile({ ...prof });
                                    setActiveMenuProfileId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-left text-slate-200 hover:text-blue-700 hover:bg-white flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                                  <span>Editar Dados do Perfil</span>
                                </button>

                                {/* 3. Toggle Status */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(prof)}
                                  className="w-full px-3 py-2 text-xs text-left text-slate-200 hover:text-blue-700 hover:bg-white flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  {prof.status === 'Ativo' ? (
                                    <>
                                      <UserX className="w-3.5 h-3.5 text-blue-700" />
                                      <span>Suspender Conta</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Ativar Conta</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="py-1">
                                {/* 4. Reset Password / Credentials */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPasswordModalProfile(prof);
                                    setGeneratedPassword(`Tarira#${Math.floor(1000 + Math.random() * 9000)}!`);
                                    setCopiedPassword(false);
                                    setActiveMenuProfileId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-left text-slate-200 hover:text-blue-700 hover:bg-white flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Key className="w-3.5 h-3.5 text-purple-400" />
                                  <span>Redefinir Senha / Acesso</span>
                                </button>

                                {/* 5. WhatsApp Direct */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetPhone = String(prof.whatsapp || prof.phone || '').replace(/\D/g, '');
                                    const msg = `Olá *${prof.name}*, contactamos a partir da Central TARIRA (${prof.roleLabel}).`;
                                    window.open(`https://wa.me/258${targetPhone.slice(-9)}?text=${encodeURIComponent(msg)}`, '_blank');
                                    setActiveMenuProfileId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-left text-slate-700 hover:text-emerald-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mensagem WhatsApp</span>
                                </button>
                              </div>

                              {/* 6. Delete Action */}
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingProfile(prof);
                                    setDeleteReason('');
                                    setActiveMenuProfileId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-left text-rose-600 hover:text-rose-700 hover:bg-rose-50/40 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Eliminar Perfil</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════ MODAL 1: CRIAR QUALQUER PERFIL NO ECOSSISTEMA ════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-700 text-lg border border-blue-500/30">
                ✨
              </span>
              <div>
                <h3 className="font-serif text-2xl text-[#172554] font-bold">
                  Criar Novo Perfil no Ecossistema
                </h3>
                <p className="text-xs text-slate-400">
                  Defina o tipo de conta, credenciais, papel e permissões de acesso.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateProfileSubmit} className="space-y-4 mt-6">
              <div>
                <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block mb-1.5">
                  TIPO DE CONTA / PAPEL A CRIAR *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRoleType)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-3 text-xs outline-none focus:border-blue-400 font-medium"
                >
                  <optgroup label="🛡️ Gestão & Administração Central">
                    <option value="admin">Administrador Geral / Super Admin</option>
                    <option value="central_operator">Operador de Despacho & Atendimento</option>
                    <option value="commercial_manager">Gestor Comercial & Contratos B2B</option>
                    <option value="recruiter">Recrutador & Triagem ATS</option>
                  </optgroup>
                  <optgroup label="👤 Clientes do Ecossistema">
                    <option value="residential_client">Cliente Residencial Particular</option>
                    <option value="condo_manager">Gestor / Administração de Condomínio</option>
                    <option value="corporate_company">Empresa Corporativa / Parceiro B2B</option>
                  </optgroup>
                  <optgroup label="🔧 Força de Trabalho & Especialistas">
                    <option value="provider">Prestador de Serviços de Ofício (Connect)</option>
                    <option value="professional">Profissional Especialista / Corporativo (Recruit)</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Nome Principal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alberto"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Apelido / Sobrenome
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Macamo"
                    value={formSurname}
                    onChange={(e) => setFormSurname(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Email de Acesso *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@tarira.co.mz"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Telefone / WhatsApp (+258) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+258 84 000 0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Cidade / Província
                  </label>
                  <input
                    type="text"
                    placeholder="Maputo"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    NUIT ou BI
                  </label>
                  <input
                    type="text"
                    placeholder="400123456"
                    value={formNuitBi}
                    onChange={(e) => setFormNuitBi(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              {/* Specific for Providers & Specialists */}
              {(formRole === 'provider' || formRole === 'professional') && (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-3">
                  <span className="text-[11px] font-bold text-blue-700 block">
                    🔧 Configurações do Especialista
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                        Categoria Principal
                      </label>
                      <input
                        type="text"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                        Tarifa Base por Hora (MZN)
                      </label>
                      <input
                        type="number"
                        value={formHourlyRate}
                        onChange={(e) => setFormHourlyRate(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Observações / Notas Internas
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas internas sobre o perfil ou permissões especiais..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Criar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 2: VER DETALHES / DOSSIÊ DO PERFIL ════════ */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setViewingProfile(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-3xl shrink-0">
                {viewingProfile.role === 'admin' ? '🛡️' : viewingProfile.role === 'condo_manager' ? '🏘️' : viewingProfile.role === 'corporate_company' ? '🏢' : viewingProfile.role === 'provider' ? '🔧' : viewingProfile.role === 'professional' ? '🎓' : '👤'}
              </div>
              <div>
                <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                  viewingProfile.role === 'admin' ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30' :
                  viewingProfile.role === 'condo_manager' || viewingProfile.role === 'corporate_company' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                  viewingProfile.role === 'provider' ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' :
                  'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {viewingProfile.roleBadge}
                </span>
                <h3 className="font-serif text-2xl text-[#172554] font-bold mt-1">
                  {viewingProfile.name} {viewingProfile.surname || ''}
                </h3>
                <span className="text-xs text-slate-400 block">
                  {viewingProfile.roleLabel} · ID: #{viewingProfile.id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  E-mail Oficial
                </span>
                <span className="text-[#172554] font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-700" />
                  {viewingProfile.email}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Telefone / WhatsApp
                </span>
                <span className="text-emerald-600 font-mono font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  {viewingProfile.phone}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Organização / Entidade
                </span>
                <span className="text-[#172554] font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-sky-400" />
                  {viewingProfile.organization || 'Conta Particular'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Localização / Cidade
                </span>
                <span className="text-[#172554] font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  {viewingProfile.city || 'Maputo'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Estado da Conta
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                  viewingProfile.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-500/30' :
                  viewingProfile.status === 'Pendente' ? 'bg-blue-50 text-blue-700 border border-blue-500/30' :
                  'bg-rose-50 text-rose-700 border border-rose-500/30'
                }`}>
                  {viewingProfile.status}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Data de Registo
                </span>
                <span className="text-slate-500 font-mono">
                  {viewingProfile.createdAt}
                </span>
              </div>
            </div>

            {/* Permissions list */}
            {viewingProfile.permissions && viewingProfile.permissions.length > 0 && (
              <div className="py-4 border-b border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-2">
                  Permissões de Acesso do Perfil
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProfile.permissions.map((perm, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-white text-slate-500 border border-slate-200 text-[11px] flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {viewingProfile.notes && (
              <div className="py-4 text-xs text-slate-500">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block mb-1">
                  Notas de Registo
                </span>
                <p className="p-3 rounded-2xl bg-white border border-slate-200">
                  {viewingProfile.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const targetPhone = String(viewingProfile.whatsapp || viewingProfile.phone || '').replace(/\D/g, '');
                  const msg = `Olá *${viewingProfile.name}*, contactamos a partir do Painel Administrativo TARIRA sobre a sua conta (${viewingProfile.roleLabel}).`;
                  window.open(`https://wa.me/258${targetPhone.slice(-9)}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                💬 WhatsApp Oficial
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prof = viewingProfile;
                    setViewingProfile(null);
                    setEditingProfile({ ...prof });
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:brightness-110"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Perfil</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingProfile(null)}
                  className="px-4 py-2.5 rounded-2xl bg-white text-slate-500 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 3: EDITAR PERFIL ════════ */}
      {editingProfile && (() => {
        const isCandEditing = candidates.some((c) => c.id === editingProfile.id);
        return (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setEditingProfile(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-700 text-lg border border-blue-500/30">
                ✏️
              </span>
              <div>
                <h3 className="font-serif text-2xl text-[#172554] font-bold">
                  Editar Perfil: {editingProfile.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Atualize os dados de identificação, contactos, estado e parâmetros do utilizador.
                </p>
              </div>
            </div>

            <form onSubmit={handleEditProfileSave} className="space-y-4 mt-6">
              {/* Foto de Perfil — apenas para Prestadores/Profissionais (candidates),
                  que são os perfis exibidos com foto nas galerias públicas. */}
              {isCandEditing && (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center">
                    {editingProfile.avatar ? (
                      <img src={editingProfile.avatar} alt={editingProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-slate-300 text-2xl font-bold">{(editingProfile.name || 'P')[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                      Foto de Perfil
                    </label>
                    <label className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      isUploadingEditPhoto
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-wait'
                        : 'bg-white border-slate-200 text-[#172554] hover:border-blue-400'
                    }`}>
                      {isUploadingEditPhoto ? 'A carregar…' : '📷 Carregar Nova Foto'}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingEditPhoto}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleEditPhotoUpload(file);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">JPG ou PNG. A foto substitui a atual assim que carregada; clique em "Salvar Alterações" para confirmar.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Nome Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Apelido / Sobrenome
                  </label>
                  <input
                    type="text"
                    value={editingProfile.surname || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, surname: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    E-mail Oficial *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingProfile.email}
                    onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProfile.phone}
                    onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Estado da Conta
                  </label>
                  <select
                    value={editingProfile.status}
                    onChange={(e) => setEditingProfile({ ...editingProfile, status: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-bold"
                  >
                    <option value="Ativo">🟢 Ativo / Verificado</option>
                    <option value="Pendente">🟡 Pendente</option>
                    <option value="Suspenso">🚫 Suspenso</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={editingProfile.city || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, city: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    NUIT ou BI
                  </label>
                  <input
                    type="text"
                    value={editingProfile.nuitOrBi || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, nuitOrBi: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Organização / Empresa
                </label>
                <input
                  type="text"
                  value={editingProfile.organization || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, organization: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                />
              </div>

              {/* Campos de Perfil Profissional — apenas para Prestadores/Profissionais
                  (candidates). O Cargo tem limite de caracteres para nunca mais crescer
                  ao ponto de tapar a foto no cartão do candidato; especializações longas
                  devem ir para o Resumo Profissional, não para o Cargo. */}
              {isCandEditing && (
                <>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                      Cargo / Título Profissional
                    </label>
                    <input
                      type="text"
                      maxLength={70}
                      value={editingProfile.title || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, title: e.target.value })}
                      placeholder="Ex: Contabilista Sénior"
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Curto e direto (máx. 70 caracteres) — aparece sobre a foto do candidato. Para listar especializações, use o Resumo Profissional abaixo.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                      Resumo / Biografia Profissional
                    </label>
                    <textarea
                      rows={3}
                      maxLength={600}
                      value={editingProfile.bio || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                      placeholder="Ex: KYC/AML/CFT, abertura e manutenção de contas, gestão de tesouraria..."
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl p-3 text-xs outline-none focus:border-blue-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {(editingProfile.bio || '').length}/600 caracteres — este texto aparece abaixo da foto, nunca sobreposto a ela.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                      Principais Competências
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(editingProfile.skills) ? editingProfile.skills.join(', ') : (editingProfile.skills || '')}
                      onChange={(e) => setEditingProfile({ ...editingProfile, skills: e.target.value })}
                      placeholder="Separadas por vírgula: Auditoria Financeira, Controlo Interno, Due Diligence"
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                        Salário Pretendido — Mínimo (MZN)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editingProfile.expectedSalaryMin ?? ''}
                        onChange={(e) => setEditingProfile({ ...editingProfile, expectedSalaryMin: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                        Salário Pretendido — Máximo (MZN)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editingProfile.expectedSalaryMax ?? ''}
                        onChange={(e) => setEditingProfile({ ...editingProfile, expectedSalaryMax: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Observações / Notas Internas
                </label>
                <textarea
                  rows={2}
                  value={editingProfile.notes || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, notes: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
        );
      })()}

      {/* ════════ MODAL 4: ELIMINAR PERFIL (COM JUSTIFICATIVA) ════════ */}
      {deletingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-rose-500/40 bg-white shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-3 rounded-2xl bg-rose-500/20 text-rose-600 text-2xl border border-rose-500/30 shrink-0">
                ⚠️
              </span>
              <div>
                <h3 className="font-serif text-xl text-[#172554] font-bold">
                  Eliminar Perfil do Ecossistema
                </h3>
                <p className="text-xs text-rose-700">
                  Esta ação é destrutiva e será registrada na auditoria central.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 mb-4 text-xs space-y-1">
              <span className="text-[#172554] font-bold block text-sm">
                {deletingProfile.name} {deletingProfile.surname || ''}
              </span>
              <span className="text-slate-400 block font-mono">
                {deletingProfile.email} · {deletingProfile.roleLabel}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                ID: #{deletingProfile.id}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-[10px] uppercase font-bold text-rose-600 font-mono block">
                Justificativa Obrigatória para Auditoria *
              </label>

              {/* Motivos rápidos — clique para preencher, sem ter de escrever ou colar */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Perfil duplicado no sistema',
                  'Solicitação do próprio utilizador',
                  'Dados desatualizados / inativo',
                  'Documentação inválida ou fraudulenta',
                  'Violação das políticas da plataforma',
                  'Registo de teste / spam'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDeleteReason(preset)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                      deleteReason === preset
                        ? "bg-rose-600 border-rose-600 text-white"
                        : "bg-white border-rose-500/20 text-slate-500 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                required
                placeholder="Escolha um motivo acima ou descreva aqui..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full bg-white border border-rose-500/30 text-[#172554] rounded-2xl p-3 text-xs outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProfile(null)}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 5: REDEFINIR SENHA / CREDENCIAIS ════════ */}
      {passwordModalProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-purple-500/40 bg-white shadow-2xl relative">
            <button
              type="button"
              onClick={() => setPasswordModalProfile(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 text-2xl border border-purple-500/30 shrink-0">
                🔑
              </span>
              <div>
                <h3 className="font-serif text-xl text-[#172554] font-bold">
                  Redefinir Credenciais de Acesso
                </h3>
                <p className="text-xs text-slate-400">
                  Gere uma nova chave temporária e envie diretamente ao utilizador.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 mb-4 text-xs space-y-2">
              <span className="text-[#172554] font-bold block">
                {passwordModalProfile.name} ({passwordModalProfile.email})
              </span>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-mono text-blue-700 font-bold text-sm">
                  {generatedPassword}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    setCopiedPassword(true);
                    setTimeout(() => setCopiedPassword(false), 3000);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPassword ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const targetPhone = String(passwordModalProfile.whatsapp || passwordModalProfile.phone || '').replace(/\D/g, '');
                  const msg = `Olá *${passwordModalProfile.name}*, as suas novas credenciais de acesso ao Portal TARIRA foram geradas com sucesso:\n\n🔑 *Email:* ${passwordModalProfile.email}\n🔐 *Senha Provisória:* ${generatedPassword}\n\nRecomendamos alterar a sua senha no primeiro login em https://tarira.co.mz`;
                  window.open(`https://wa.me/258${targetPhone.slice(-9)}?text=${encodeURIComponent(msg)}`, '_blank');
                  showToast('Credenciais enviadas via WhatsApp!');
                  setPasswordModalProfile(null);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Novas Credenciais por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('Instruções de redefinição enviadas para o email.');
                  setPasswordModalProfile(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
