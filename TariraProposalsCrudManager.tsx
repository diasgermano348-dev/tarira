import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Sparkles,
  Send,
  DollarSign,
  Calendar,
  X,
  Check,
  Download,
  Phone,
  Mail,
  Users,
  Briefcase,
  ExternalLink,
  Filter,
  Upload,
  ShieldCheck,
  Printer,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { CommercialProposal } from './types';

interface TariraProposalsCrudManagerProps {
  proposals?: any[];
  onUpdateProposals?: (proposals: CommercialProposal[]) => void;
  onTriggerAuditLog?: (action: string, details: string) => void;
}

export const TariraProposalsCrudManager: React.FC<TariraProposalsCrudManagerProps> = ({
  proposals = [],
  onUpdateProposals,
  onTriggerAuditLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [operationFilter, setOperationFilter] = useState<string>('all');
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>('all');

  // Default corporate proposals for Mozambique
  // Zerado por pedido explícito: nenhuma proposta comercial fictícia/de teste —
  // só devem aparecer propostas reais submetidas pelos clientes.
  const defaultCommercialProposals: CommercialProposal[] = [];

  // Helper detect business unit
  const getProposalBusinessUnit = (p: CommercialProposal | any): string => {
    if (p.businessUnit && p.businessUnit.trim()) return p.businessUnit;
    const combined = `${p.source || ''} ${p.operationType || ''} ${p.comments || ''} ${p.internalNotes || ''}`.toLowerCase();
    if (combined.includes('connect')) return 'Tarira Connect';
    if (combined.includes('recruit') || combined.includes('vaga') || combined.includes('briefing')) return 'Tarira Recruiting';
    if (combined.includes('consult')) return 'Tarira Consulting';
    if (combined.includes('study') || combined.includes('estudo') || combined.includes('studio')) return 'Tarira Study';
    if (combined.includes('outsourc') || combined.includes('terceiriza')) return 'Tarira Outsourcing';
    return 'Tarira Business';
  };

  // Helper normalizer
  const normalizeProposal = (raw: any): CommercialProposal => {
    const inferredUnit = getProposalBusinessUnit(raw);
    return {
      id: raw.id || `PROP-${Math.floor(100000 + Math.random() * 900000)}`,
      source: raw.source || 'outsourcing',
      businessUnit: inferredUnit,
      companyName: raw.companyName || raw.clientName || 'Empresa Cliente',
      contactPerson: raw.contactPerson || raw.clientName || 'Responsável Comercial',
      contactEmail: raw.contactEmail || 'comercial@empresa.co.mz',
      contactPhone: raw.contactPhone || '+258 84 000 0000',
      operationType: raw.operationType || raw.projectTitle || 'Atendimento ao Cliente, Helpdesk & Call Center',
      headcount: Number(raw.headcount) || 10,
      slaLevel: raw.slaLevel || 'Ouro (99% de Disponibilidade)',
      comments: raw.comments || raw.scope || 'Serviços de terceirização e alocação de pessoal técnico qualificado.',
      submittedAt: raw.submittedAt || raw.createdAt || raw.validityDate || new Date().toISOString(),
      status: (['pending', 'under_review', 'proposal_sent', 'approved', 'rejected', 'archived'].includes(raw.status)
        ? raw.status
        : (raw.status === 'sent' ? 'proposal_sent' : raw.status === 'draft' ? 'pending' : raw.status === 'negotiating' ? 'under_review' : 'pending')) as any,
      documentName: raw.documentName,
      documentSize: raw.documentSize,
      documentData: raw.documentData,
      budgetEstimateMzn: Number(raw.budgetEstimateMzn || raw.totalMzn) || 0,
      internalNotes: raw.internalNotes || raw.notes || '',
      assignedManager: raw.assignedManager || 'Gestor Comercial TARIRA',
      emailNotificationSent: raw.emailNotificationSent ?? true,
      emailNotificationRecipient: raw.emailNotificationRecipient || 'tariraecossystem@gmail.com',
      emailNotificationSentAt: raw.emailNotificationSentAt,
      emailNotificationSubject: raw.emailNotificationSubject
    };
  };

  const [localProposals, setLocalProposals] = useState<CommercialProposal[]>(() => {
    try {
      const saved = localStorage.getItem('tarira_commercial_proposals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProposal);
        }
      }
    } catch (e) {}

    if (Array.isArray(proposals) && proposals.length > 0) {
      return proposals.map(normalizeProposal);
    }
    return defaultCommercialProposals;
  });

  // Sync prop changes
  useEffect(() => {
    if (Array.isArray(proposals) && proposals.length > 0) {
      setLocalProposals(proposals.map(normalizeProposal));
    }
  }, [proposals]);

  // Sync to parent and storage
  const syncProposals = (updated: CommercialProposal[]) => {
    setLocalProposals(updated);
    try {
      localStorage.setItem('tarira_commercial_proposals', JSON.stringify(updated));
    } catch (e) {}
    if (onUpdateProposals) {
      onUpdateProposals(updated);
    }
  };

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingProposal, setViewingProposal] = useState<CommercialProposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<CommercialProposal | null>(null);
  const [deletingProposal, setDeletingProposal] = useState<CommercialProposal | null>(null);

  // Form State for Creation
  const [formCompany, setFormCompany] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formOperation, setFormOperation] = useState('Atendimento ao Cliente, Helpdesk & Call Center');
  const [formHeadcount, setFormHeadcount] = useState(15);
  const [formSla, setFormSla] = useState('Ouro (99% de Disponibilidade)');
  const [formSource, setFormSource] = useState('outsourcing');
  const [formBudget, setFormBudget] = useState(350000);
  const [formComments, setFormComments] = useState('');
  const [formManager, setFormManager] = useState('Gestor Comercial Carlos');
  const [formStatus, setFormStatus] = useState<CommercialProposal['status']>('under_review');
  const [formDocName, setFormDocName] = useState<string | undefined>(undefined);
  const [formDocSize, setFormDocSize] = useState<string | undefined>(undefined);
  const [formDocData, setFormDocData] = useState<string | undefined>(undefined);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // KPIs
  const stats = useMemo(() => {
    const total = localProposals.length;
    const pending = localProposals.filter((p) => p.status === 'pending').length;
    const underReview = localProposals.filter((p) => p.status === 'under_review').length;
    const sent = localProposals.filter((p) => p.status === 'proposal_sent').length;
    const approved = localProposals.filter((p) => p.status === 'approved').length;
    const totalHeadcount = localProposals.reduce((acc, p) => acc + (p.headcount || 0), 0);
    const totalPipelineMzn = localProposals.reduce((acc, p) => acc + (p.budgetEstimateMzn || 0), 0);

    return { total, pending, underReview, sent, approved, totalHeadcount, totalPipelineMzn };
  }, [localProposals]);

  // Filtered List
  const filteredProposals = useMemo(() => {
    return localProposals.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.companyName.toLowerCase().includes(term) ||
        (p.contactPerson && p.contactPerson.toLowerCase().includes(term)) ||
        p.contactEmail.toLowerCase().includes(term) ||
        p.contactPhone.toLowerCase().includes(term) ||
        p.operationType.toLowerCase().includes(term) ||
        (p.comments && p.comments.toLowerCase().includes(term)) ||
        (p.documentName && p.documentName.toLowerCase().includes(term)) ||
        p.id.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesOperation = operationFilter === 'all' || p.operationType === operationFilter;
      const propUnit = getProposalBusinessUnit(p).toLowerCase();
      const matchesUnit =
        businessUnitFilter === 'all' ||
        propUnit.includes(businessUnitFilter.toLowerCase()) ||
        (p.businessUnit && p.businessUnit.toLowerCase().includes(businessUnitFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesOperation && matchesUnit;
    });
  }, [localProposals, searchTerm, statusFilter, operationFilter, businessUnitFilter]);

  // Document Upload
  const handleFileUpload = (file: File, isEditing = false) => {
    const isAllowed = file.name.toLowerCase().endsWith('.pdf') || 
                      file.name.toLowerCase().endsWith('.doc') || 
                      file.name.toLowerCase().endsWith('.docx');
    if (!isAllowed) {
      alert('Por favor selecione um documento em formato PDF ou Word (.pdf, .docx, .doc).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('O ficheiro excede o tamanho máximo permitido de 5MB.');
      return;
    }

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (isEditing && editingProposal) {
        setEditingProposal({
          ...editingProposal,
          documentName: file.name,
          documentSize: formattedSize,
          documentData: result
        });
      } else {
        setFormDocName(file.name);
        setFormDocSize(formattedSize);
        setFormDocData(result);
      }
      showToast(`Documento "${file.name}" anexado com sucesso!`);
    };
    reader.readAsDataURL(file);
  };

  // Download / Export Doc
  const handleDownloadDoc = (prop: CommercialProposal) => {
    if (prop.documentData) {
      const link = document.createElement('a');
      link.href = prop.documentData;
      link.download = prop.documentName || `Documento_${prop.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Generate formatted proposal document text
    const textContent = `=====================================================
TARIRA RECRUIT & OUTSOURCING — PROPOSTA COMERCIAL B2B
=====================================================
Código da Proposta : ${prop.id}
Empresa / Cliente   : ${prop.companyName}
Contacto / Decisor  : ${prop.contactPerson || 'Direção Comercial'}
Email               : ${prop.contactEmail}
Telefone            : ${prop.contactPhone}
Data de Registo     : ${new Date(prop.submittedAt).toLocaleDateString('pt-MZ')}
Estado Atual        : ${prop.status.toUpperCase()}
Gestor Alocado      : ${prop.assignedManager || 'Gabinete Comercial Central'}

-----------------------------------------------------
ESCOPO DA OPERAÇÃO TÉCNICA
-----------------------------------------------------
Tipo de Operação    : ${prop.operationType}
Volume de Headcount : ${prop.headcount} Colaboradores
Nível de SLA        : ${prop.slaLevel}
Orçamento Estimado  : ${prop.budgetEstimateMzn ? prop.budgetEstimateMzn.toLocaleString() + ' MZN / mês' : 'Sob Cotação'}

Descrição Detalhada:
${prop.comments || 'Nenhuma observação adicional fornecida.'}

Notas Internas:
${prop.internalNotes || 'Processo comercial gerido pelo portal TARIRA.'}

=====================================================
TARIRA Moçambique • Av. 24 de Julho, Maputo
Garantia de Qualidade, Supervisão e Compliance Laboral
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = prop.documentName || `Proposta_${prop.companyName.replace(/\s+/g, '_')}_${prop.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fast Status Change
  const handleQuickStatusChange = (id: string, newStatus: CommercialProposal['status']) => {
    const updated = localProposals.map((p) =>
      p.id === id ? { ...p, status: newStatus } : p
    );
    syncProposals(updated);
    const target = localProposals.find((p) => p.id === id);
    if (onTriggerAuditLog && target) {
      onTriggerAuditLog(
        'STATUS_PROPOSTA_B2B',
        `Estado da proposta ${target.id} (${target.companyName}) alterado para: ${newStatus}`
      );
    }
    showToast(`Estado da proposta #${id} atualizado.`);
  };

  // Submit Create Form
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formEmail.trim()) {
      showToast('Preencha pelo menos o Nome da Empresa e o Email.');
      return;
    }

    const newProp: CommercialProposal = {
      id: `PROP-${Math.floor(100000 + Math.random() * 900000)}`,
      source: formSource,
      companyName: formCompany.trim(),
      contactPerson: formContactPerson.trim() || formCompany.trim(),
      contactEmail: formEmail.trim(),
      contactPhone: formPhone.trim() || '+258 84 000 0000',
      operationType: formOperation,
      headcount: Number(formHeadcount) || 1,
      slaLevel: formSla,
      comments: formComments.trim() || 'Serviços de outsourcing e fornecimento de quadros especializados.',
      budgetEstimateMzn: Number(formBudget) || 0,
      submittedAt: new Date().toISOString(),
      status: formStatus,
      assignedManager: formManager,
      documentName: formDocName,
      documentSize: formDocSize,
      documentData: formDocData,
      internalNotes: `Criada pelo painel administrativo. Gestor: ${formManager}`
    };

    const updated = [newProp, ...localProposals];
    syncProposals(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'CRIAR_PROPOSTA_B2B',
        `Nova proposta ${newProp.id} criada para ${newProp.companyName} (${newProp.operationType}) no valor de ${newProp.budgetEstimateMzn?.toLocaleString()} MZN.`
      );
    }

    showToast(`Proposta ${newProp.id} registada com sucesso!`);
    setIsCreateModalOpen(false);

    // Reset Form
    setFormCompany('');
    setFormContactPerson('');
    setFormEmail('');
    setFormPhone('');
    setFormComments('');
    setFormDocName(undefined);
    setFormDocSize(undefined);
    setFormDocData(undefined);
  };

  // Save Edit Form
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal) return;

    const updated = localProposals.map((p) =>
      p.id === editingProposal.id ? editingProposal : p
    );
    syncProposals(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'EDITAR_PROPOSTA_B2B',
        `Proposta ${editingProposal.id} (${editingProposal.companyName}) atualizada.`
      );
    }

    showToast(`Proposta ${editingProposal.id} atualizada com sucesso!`);
    setEditingProposal(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingProposal) return;
    const updated = localProposals.filter((p) => p.id !== deletingProposal.id);
    syncProposals(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'ELIMINAR_PROPOSTA_B2B',
        `Proposta #${deletingProposal.id} (${deletingProposal.companyName}) eliminada.`
      );
    }

    showToast(`Proposta #${deletingProposal.id} eliminada.`);
    setDeletingProposal(null);
  };

  // Helper Badges
  const getStatusBadge = (status: CommercialProposal['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-700 border border-blue-500/30 flex items-center gap-1">
            🟡 Pendente / Nova
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
            🔍 Em Análise Comercial
          </span>
        );
      case 'proposal_sent':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            📤 Proposta Enviada
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
            🟢 Aprovada / Contrato
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-700 border border-rose-500/30 flex items-center gap-1">
            🔴 Não Adjudicada
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 flex items-center gap-1">
            📁 Arquivada
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500">
            {status}
          </span>
        );
    }
  };

  const getBusinessUnitBadge = (prop: CommercialProposal) => {
    const unit = getProposalBusinessUnit(prop);
    switch (unit) {
      case 'Tarira Connect':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 inline-flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Proposta Tarira Connect
          </span>
        );
      case 'Tarira Recruiting':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 inline-flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            Proposta Tarira Recruiting
          </span>
        );
      case 'Tarira Consulting':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40 inline-flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            Proposta Tarira Consulting
          </span>
        );
      case 'Tarira Study':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Proposta Tarira Study
          </span>
        );
      case 'Tarira Outsourcing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-700 border border-blue-500/40 inline-flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Proposta Tarira Outsourcing
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-700 border border-blue-500/40 inline-flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Proposta Tarira Business
          </span>
        );
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'outsourcing':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50/80 text-blue-700 border border-blue-700/50">
            Outsourcing Web
          </span>
        );
      case 'tender':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-700/50">
            Concurso / RFP
          </span>
        );
      case 'direct_contact':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50/80 text-emerald-700 border border-emerald-700/50">
            Contacto Direto
          </span>
        );
      case 'b2b_recruitment':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50/80 text-blue-700 border border-blue-700/50">
            Recrutamento B2B
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-50 text-slate-500">
            {source}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#172554] text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-blue-300 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-blue-500/30 shadow-2xl backdrop-blur-md">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 text-xs font-mono font-bold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>MÓDULO DE GESTÃO COMERCIAL B2B, OUTSOURCING & CONCURSOS</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#172554]">
            Gestão Comercial & Propostas B2B
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Central de orçamentos institucionais, gestão de cadernos de encargos (Word/PDF), acompanhamento de negociações corporativas e alocação de quadros terceirizados em Moçambique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:brightness-110 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Proposta Comercial</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Total Propostas
          </span>
          <span className="text-2xl font-black text-[#172554]">{stats.total}</span>
          <span className="text-[10px] text-slate-500 block font-mono">Em carteira</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-500/30 space-y-1">
          <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
            Pendentes / Novas
          </span>
          <span className="text-2xl font-black text-blue-700">{stats.pending}</span>
          <span className="text-[10px] text-blue-700/70 block font-mono">Triagem inicial</span>
        </div>

        <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 space-y-1">
          <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block">
            Em Análise
          </span>
          <span className="text-2xl font-black text-sky-400">{stats.underReview}</span>
          <span className="text-[10px] text-sky-300/70 block font-mono">Com gestor</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
          <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
            Propostas Enviadas
          </span>
          <span className="text-2xl font-black text-indigo-400">{stats.sent}</span>
          <span className="text-[10px] text-indigo-300/70 block font-mono">Em negociação</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold block">
            Aprovadas / Fechadas
          </span>
          <span className="text-2xl font-black text-emerald-600">{stats.approved}</span>
          <span className="text-[10px] text-emerald-700/70 block font-mono">Contratos ativos</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
          <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
            Volume Headcount
          </span>
          <span className="text-2xl font-black text-purple-300">{stats.totalHeadcount}</span>
          <span className="text-[10px] text-purple-300/70 block font-mono">Postos de trabalho</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar por empresa, responsável, telefone ou escopo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#172554] placeholder:text-slate-500 outline-none focus:border-[#172554]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#172554] text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Business Unit Filter */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-blue-500/40 text-xs">
            <span className="text-blue-700 text-[11px] font-bold">Unidade:</span>
            <select
              value={businessUnitFilter}
              onChange={(e) => setBusinessUnitFilter(e.target.value)}
              className="bg-transparent text-[#172554] text-xs outline-none cursor-pointer font-medium"
            >
              <option value="all" className="bg-white text-[#172554]">
                Todas as Unidades (Geral)
              </option>
              <option value="Tarira Connect" className="bg-white text-[#172554]">
                🌐 Tarira Connect
              </option>
              <option value="Tarira Recruiting" className="bg-white text-[#172554]">
                👥 Tarira Recruiting
              </option>
              <option value="Tarira Consulting" className="bg-white text-[#172554]">
                📊 Tarira Consulting
              </option>
              <option value="Tarira Outsourcing" className="bg-white text-[#172554]">
                🏢 Tarira Outsourcing
              </option>
              <option value="Tarira Study" className="bg-white text-[#172554]">
                🎓 Tarira Study / Studio
              </option>
              <option value="Tarira Business" className="bg-white text-[#172554]">
                💼 Tarira Business
              </option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-slate-400 text-[11px] font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#172554] text-xs outline-none cursor-pointer"
            >
              <option value="all" className="bg-white text-[#172554]">
                Todos os Estados ({localProposals.length})
              </option>
              <option value="pending" className="bg-white text-[#172554]">
                🟡 Pendentes / Novas ({stats.pending})
              </option>
              <option value="under_review" className="bg-white text-[#172554]">
                🔍 Em Análise Comercial ({stats.underReview})
              </option>
              <option value="proposal_sent" className="bg-white text-[#172554]">
                📤 Propostas Enviadas ({stats.sent})
              </option>
              <option value="approved" className="bg-white text-[#172554]">
                🟢 Aprovadas / Contrato ({stats.approved})
              </option>
              <option value="rejected" className="bg-white text-[#172554]">
                🔴 Não Adjudicadas
              </option>
              <option value="archived" className="bg-white text-[#172554]">
                📁 Arquivadas
              </option>
            </select>
          </div>

          {/* Operation Filter */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Operação:</span>
            <select
              value={operationFilter}
              onChange={(e) => setOperationFilter(e.target.value)}
              className="bg-transparent text-[#172554] text-xs outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="all" className="bg-white text-[#172554]">
                Todas as Operações
              </option>
              <option value="Atendimento ao Cliente, Helpdesk & Call Center" className="bg-white text-[#172554]">
                Call Center & Helpdesk
              </option>
              <option value="Operações de Supermercados, Retalho & Caixas / Reposição" className="bg-white text-[#172554]">
                Supermercados & Retalho
              </option>
              <option value="Logística, Distribuição & Gestão de Armazéns" className="bg-white text-[#172554]">
                Logística & Armazéns
              </option>
              <option value="Telecomunicações & Redes / TI de Campo" className="bg-white text-[#172554]">
                Telecomunicações & TI
              </option>
              <option value="Serviços Financeiros, Banca & Backoffice GESC" className="bg-white text-[#172554]">
                Banca & Finanças GESC
              </option>
              <option value="Limpeza Industrial, Hospitalar & Facility Services" className="bg-white text-[#172554]">
                Facility & Limpeza Industrial
              </option>
              <option value="Construção Civil, Manutenção Predial & Técnica" className="bg-white text-[#172554]">
                Construção & Manutenção
              </option>
              <option value="Mineração, Petróleo & Gás (Oil & Gas)" className="bg-white text-[#172554]">
                Mineração & Oil & Gas
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals Grid / Cards */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-[#172554]">
            Nenhum registo de proposta comercial encontrado
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all' || operationFilter !== 'all'
              ? 'Tente ajustar os filtros de pesquisa para visualizar outras propostas.'
              : 'As solicitações e orçamentos corporativos criados ou submetidos pelos clientes aparecerão aqui.'}
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#172554] text-white font-bold text-xs hover:bg-blue-400 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Proposta Manual</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProposals.map((prop) => (
            <div
              key={prop.id}
              className={`glass-panel p-5 rounded-3xl border transition-all text-left flex flex-col justify-between space-y-4 shadow-xl ${
                prop.status === 'pending'
                  ? 'bg-white border-blue-500/40 hover:border-blue-400 shadow-blue-500/5'
                  : prop.status === 'approved'
                  ? 'bg-white border-emerald-500/40 hover:border-emerald-400 shadow-emerald-500/5'
                  : 'bg-white border-slate-200 hover:border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {prop.id}
                      </span>
                      {getBusinessUnitBadge(prop)}
                      {getSourceBadge(prop.source)}
                      {getStatusBadge(prop.status)}
                      <span className="text-[9px] font-mono text-blue-700/90 bg-white px-2 py-0.5 rounded border border-blue-500/20 inline-flex items-center gap-1" title="Notificação enviada ao e-mail institucional tarira.ecossistema@gmail.com">
                        <Mail className="w-3 h-3 text-blue-700" />
                        <span>Notificado: tarira.ecossistema@gmail.com</span>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#172554] leading-snug">
                      {prop.companyName}
                    </h3>
                    {prop.contactPerson && prop.contactPerson !== prop.companyName && (
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        👤 {prop.contactPerson}
                      </span>
                    )}
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingProposal(prop)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#172554] hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Ver Detalhes da Proposta"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProposal({ ...prop })}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Editar Proposta"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProposal(prop)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/30 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
                      title="Eliminar Proposta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body Specs */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Operação & Âmbito:
                    </span>
                    <p className="font-bold text-[#172554] text-xs mt-0.5">
                      {prop.operationType}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {prop.comments}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 text-[11px] font-mono flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      <strong>{prop.headcount}</strong> Colaboradores
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 text-[11px] font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      SLA: {prop.slaLevel.split(' ')[0]}
                    </span>
                  </div>

                  {/* Document Attachment */}
                  {prop.documentName && (
                    <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                        <div className="truncate text-left">
                          <span className="text-xs font-bold text-purple-200 block truncate" title={prop.documentName}>
                            {prop.documentName}
                          </span>
                          <span className="text-[10px] text-purple-300/70 font-mono block">
                            {prop.documentSize || 'Anexo comercial'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(prop)}
                        className="px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 text-[10px] font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descarregar</span>
                      </button>
                    </div>
                  )}

                  {/* Financial Value */}
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        Orçamento / Valor Proposto:
                      </span>
                      <span className="font-mono text-blue-700 font-bold text-sm">
                        {prop.budgetEstimateMzn
                          ? `${prop.budgetEstimateMzn.toLocaleString()} MZN / mês`
                          : 'Sob Cotação Técnica'}
                      </span>
                    </div>

                    {/* Inline Status Changer */}
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">
                        Mudar Estado:
                      </span>
                      <select
                        value={prop.status}
                        onChange={(e) =>
                          handleQuickStatusChange(prop.id, e.target.value as CommercialProposal['status'])
                        }
                        className="bg-white border border-slate-200 text-slate-200 text-[10px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-blue-400"
                      >
                        <option value="pending">🟡 Pendente</option>
                        <option value="under_review">🔍 Em Análise</option>
                        <option value="proposal_sent">📤 Enviada</option>
                        <option value="approved">🟢 Aprovada</option>
                        <option value="rejected">🔴 Recusada</option>
                        <option value="archived">📁 Arquivada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Contacts & Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>📅 {new Date(prop.submittedAt).toLocaleDateString('pt-MZ')}</span>
                  {prop.assignedManager && (
                    <span className="hidden sm:inline text-slate-400">
                      👔 {prop.assignedManager}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${prop.contactEmail}?subject=Proposta%20Comercial%20TARIRA%20-%20${encodeURIComponent(prop.companyName)}`}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-500 hover:text-[#172554] border border-slate-200 transition-all"
                    title="Enviar Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const cleanPhone = prop.contactPhone.replace(/[^0-9]/g, '');
                      const targetPhone = cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`;
                      const msg = `Olá *${prop.contactPerson || prop.companyName}*, partilhamos o acompanhamento da proposta comercial TARIRA para *${prop.operationType}* (${prop.headcount} colaboradores). Orçamento estimado: *${prop.budgetEstimateMzn?.toLocaleString() || 'Consulte-nos'} MZN*. Estamos à disposição para agendar alinhamento técnico.`;
                      window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-700 hover:text-slate-950 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp B2B</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════ MODAL 1: CRIAR NOVA PROPOSTA B2B ════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8 text-left">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-3 mb-4">
              <span className="text-[10px] font-mono text-blue-700 uppercase font-bold tracking-widest">
                GABINETE COMERCIAL & PROPOSTAS B2B
              </span>
              <h3 className="font-serif text-2xl text-[#172554] font-bold mt-1">
                Registar Nova Proposta Comercial ou Concurso
              </h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Row 1: Company & Contact Person */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Nome da Empresa / Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: HCB - Hidroeléctrica de Cahora Bassa"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Pessoa de Contacto / Decisor
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dra. Fátima Nhantumbo"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="compras.concursos@empresa.co.mz"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Telefone de Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="+258 84 123 4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 3: Operation Type */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Tipo de Operação / Setor de Atuação *
                </label>
                <select
                  value={formOperation}
                  onChange={(e) => setFormOperation(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400"
                >
                  <option value="Atendimento ao Cliente, Helpdesk & Call Center">
                    📞 Atendimento ao Cliente, Helpdesk & Call Center
                  </option>
                  <option value="Operações de Supermercados, Retalho & Caixas / Reposição">
                    🛒 Operações de Supermercados, Retalho & Caixas / Reposição
                  </option>
                  <option value="Logística, Distribuição & Gestão de Armazéns">
                    📦 Logística, Distribuição & Gestão de Armazéns
                  </option>
                  <option value="Telecomunicações & Redes / TI de Campo">
                    📡 Telecomunicações & Redes / TI de Campo
                  </option>
                  <option value="Serviços Financeiros, Banca & Backoffice GESC">
                    🏦 Serviços Financeiros, Banca & Backoffice GESC
                  </option>
                  <option value="Limpeza Industrial, Hospitalar & Facility Services">
                    🧹 Limpeza Industrial, Hospitalar & Facility Services
                  </option>
                  <option value="Construção Civil, Manutenção Predial & Técnica">
                    🏗️ Construção Civil, Manutenção Predial & Técnica
                  </option>
                  <option value="Mineração, Petróleo & Gás (Oil & Gas)">
                    ⚡ Mineração, Petróleo & Gás (Oil & Gas)
                  </option>
                  <option value="Segurança Patrimonial, Portaria & Controlo de Acessos">
                    🛡️ Segurança Patrimonial, Portaria & Controlo de Acessos
                  </option>
                </select>
              </div>

              {/* Row 4: Headcount, SLA, Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Nº de Colaboradores
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formHeadcount}
                    onChange={(e) => setFormHeadcount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Nível de SLA
                  </label>
                  <select
                    value={formSla}
                    onChange={(e) => setFormSla(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400"
                  >
                    <option value="Ouro (99% de Disponibilidade)">🥇 Ouro (99%)</option>
                    <option value="Prata (95% de Disponibilidade)">🥈 Prata (95%)</option>
                    <option value="Bronze (90% de Disponibilidade)">🥉 Bronze (90%)</option>
                    <option value="Platina (24/7 Crítico)">💎 Platina (24/7 Crítico)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Orçamento Mensal (MZN)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formBudget}
                    onChange={(e) => setFormBudget(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Comments / Scope */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Descrição do Escopo e Requisitos Técnicos
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhe o perfil dos técnicos, local de prestação de serviços, horários e requisitos especiais..."
                  value={formComments}
                  onChange={(e) => setFormComments(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              {/* Row 6: Manager and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Gestor Comercial Atribuído
                  </label>
                  <input
                    type="text"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Estado Inicial da Proposta
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400"
                  >
                    <option value="pending">🟡 Pendente / Nova</option>
                    <option value="under_review">🔍 Em Análise Comercial</option>
                    <option value="proposal_sent">📤 Proposta Enviada</option>
                    <option value="approved">🟢 Aprovada / Contrato</option>
                  </select>
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-2 p-4 rounded-2xl bg-white border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                  📁 Anexar Caderno de Encargos / RFP (Word ou PDF)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="new-prop-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = document.getElementById('new-prop-file') as HTMLInputElement;
                      if (inp) inp.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-700 text-[#172554] text-xs font-bold flex items-center gap-2 border border-slate-600 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-blue-700" />
                    <span>Selecionar Ficheiro (.pdf / .docx)</span>
                  </button>

                  {formDocName && (
                    <span className="text-xs text-purple-300 font-mono flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {formDocName} ({formDocSize})
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
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
                  className="px-7 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Registar Proposta B2B
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 2: VER DETALHES DA PROPOSTA ════════ */}
      {viewingProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8 text-left space-y-4">
            <button
              type="button"
              onClick={() => setViewingProposal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-3">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                  {viewingProposal.id}
                </span>
                {getBusinessUnitBadge(viewingProposal)}
                {getSourceBadge(viewingProposal.source)}
                {getStatusBadge(viewingProposal.status)}
              </div>
              <div className="p-3 mb-2 rounded-2xl bg-blue-50/30 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-blue-700">
                  <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="font-bold block text-[#172554]">E-mail Geral Notificado</span>
                    <span className="text-[11px] font-mono text-blue-200/90">
                      {viewingProposal.emailNotificationRecipient || 'tarira.ecossistema@gmail.com'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/40">
                  ✓ Despachado
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#172554] font-bold">
                {viewingProposal.companyName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registado em {new Date(viewingProposal.submittedAt).toLocaleDateString('pt-MZ')} • Gestor: {viewingProposal.assignedManager || 'Gabinete Comercial'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Responsável / Contacto:
                </span>
                <span className="font-bold text-[#172554] block">
                  {viewingProposal.contactPerson || 'N/A'}
                </span>
                <span className="text-slate-500 block">{viewingProposal.contactEmail}</span>
                <span className="text-slate-500 font-mono block">{viewingProposal.contactPhone}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Orçamento & Headcount:
                </span>
                <span className="font-mono text-blue-700 font-bold text-base block">
                  {viewingProposal.budgetEstimateMzn
                    ? `${viewingProposal.budgetEstimateMzn.toLocaleString()} MZN / mês`
                    : 'A Cotar'}
                </span>
                <span className="text-slate-500 block">
                  👥 {viewingProposal.headcount} Postos de Trabalho
                </span>
                <span className="text-slate-500 block">
                  🛡️ SLA: {viewingProposal.slaLevel}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] uppercase font-mono text-blue-700 font-bold block">
                Âmbito e Especificações do Projeto:
              </span>
              <p className="font-bold text-[#172554]">{viewingProposal.operationType}</p>
              <p className="text-slate-500 leading-relaxed mt-1">
                {viewingProposal.comments || 'Nenhuma descrição adicional.'}
              </p>
            </div>

            {viewingProposal.internalNotes && (
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Notas Internas de Acompanhamento:
                </span>
                <p className="text-slate-500 mt-1">{viewingProposal.internalNotes}</p>
              </div>
            )}

            {/* Document Download Section */}
            {viewingProposal.documentName && (
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-5 h-5 text-purple-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-purple-200 block truncate">
                      {viewingProposal.documentName}
                    </span>
                    <span className="text-[10px] text-purple-300/70 font-mono">
                      {viewingProposal.documentSize || 'Documento Anexo'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(viewingProposal)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descarregar</span>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  handleDownloadDoc(viewingProposal);
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Exportar Minuta</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const cleanPhone = viewingProposal.contactPhone.replace(/[^0-9]/g, '');
                    const targetPhone = cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`;
                    const msg = `Olá *${viewingProposal.contactPerson || viewingProposal.companyName}*, partilhamos o acompanhamento da proposta comercial TARIRA para *${viewingProposal.operationType}* (${viewingProposal.headcount} colaboradores). Orçamento: *${viewingProposal.budgetEstimateMzn?.toLocaleString() || 'Consulte-nos'} MZN*.`;
                    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer hover:brightness-110"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Conversar no WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingProposal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-[#172554] text-xs font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 3: EDITAR PROPOSTA ════════ */}
      {editingProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8 text-left">
            <button
              type="button"
              onClick={() => setEditingProposal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-3 mb-4">
              <span className="text-[10px] font-mono text-blue-700 uppercase font-bold tracking-widest">
                EDIÇÃO DE PROPOSTA B2B
              </span>
              <h3 className="font-serif text-2xl text-[#172554] font-bold mt-1">
                Editar Proposta #{editingProposal.id}
              </h3>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProposal.companyName}
                    onChange={(e) =>
                      setEditingProposal({ ...editingProposal, companyName: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Contacto / Decisor
                  </label>
                  <input
                    type="text"
                    value={editingProposal.contactPerson || ''}
                    onChange={(e) =>
                      setEditingProposal({ ...editingProposal, contactPerson: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Email Corporativo
                  </label>
                  <input
                    type="email"
                    value={editingProposal.contactEmail}
                    onChange={(e) =>
                      setEditingProposal({ ...editingProposal, contactEmail: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={editingProposal.contactPhone}
                    onChange={(e) =>
                      setEditingProposal({ ...editingProposal, contactPhone: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Operação
                </label>
                <input
                  type="text"
                  value={editingProposal.operationType}
                  onChange={(e) =>
                    setEditingProposal({ ...editingProposal, operationType: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Headcount
                  </label>
                  <input
                    type="number"
                    value={editingProposal.headcount}
                    onChange={(e) =>
                      setEditingProposal({ ...editingProposal, headcount: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Orçamento Mensal (MZN)
                  </label>
                  <input
                    type="number"
                    value={editingProposal.budgetEstimateMzn || 0}
                    onChange={(e) =>
                      setEditingProposal({
                        ...editingProposal,
                        budgetEstimateMzn: Number(e.target.value)
                      })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Estado da Proposta
                  </label>
                  <select
                    value={editingProposal.status}
                    onChange={(e) =>
                      setEditingProposal({
                        ...editingProposal,
                        status: e.target.value as any
                      })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400"
                  >
                    <option value="pending">🟡 Pendente / Nova</option>
                    <option value="under_review">🔍 Em Análise Comercial</option>
                    <option value="proposal_sent">📤 Proposta Enviada</option>
                    <option value="approved">🟢 Aprovada / Contrato</option>
                    <option value="rejected">🔴 Não Adjudicada</option>
                    <option value="archived">📁 Arquivada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Descrição e Escopo
                </label>
                <textarea
                  rows={2}
                  value={editingProposal.comments || ''}
                  onChange={(e) =>
                    setEditingProposal({ ...editingProposal, comments: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Gestor Alocado
                  </label>
                  <input
                    type="text"
                    value={editingProposal.assignedManager || ''}
                    onChange={(e) =>
                      setEditingProposal({
                        ...editingProposal,
                        assignedManager: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Notas Internas
                  </label>
                  <input
                    type="text"
                    value={editingProposal.internalNotes || ''}
                    onChange={(e) =>
                      setEditingProposal({
                        ...editingProposal,
                        internalNotes: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Edit Doc Upload */}
              <div className="space-y-2 p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Documento Anexo:
                </span>
                <div className="flex items-center gap-3">
                  <input
                    id="edit-prop-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = document.getElementById('edit-prop-file') as HTMLInputElement;
                      if (inp) inp.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-700 text-[#172554] text-xs font-bold flex items-center gap-1.5 border border-slate-600 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-700" />
                    <span>Substituir Documento</span>
                  </button>

                  {editingProposal.documentName && (
                    <span className="text-xs text-purple-300 font-mono truncate">
                      {editingProposal.documentName} ({editingProposal.documentSize})
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProposal(null)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 4: ELIMINAR PROPOSTA ════════ */}
      {deletingProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-rose-500/40 bg-white shadow-2xl relative text-left space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center text-xl border border-rose-500/30">
              ⚠️
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#172554]">
                Eliminar Proposta Comercial?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tem a certeza que deseja eliminar a proposta #{deletingProposal.id} de{' '}
                <strong className="text-[#172554]">{deletingProposal.companyName}</strong>? Esta ação é irreversível.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeletingProposal(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-rose-500/20"
              >
                Sim, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
