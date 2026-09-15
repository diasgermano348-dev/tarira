import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  FileText,
  Check,
  X,
  Layers,
  Award,
  Briefcase,
  Share2,
  Linkedin
} from 'lucide-react';
import { Client } from './types';
import { TariraJobBroadcastModal, JobBroadcastPayload } from './TariraJobBroadcastModal';
import { TariraRegistrationPlansModal } from './TariraRegistrationPlansModal';

export interface CompanyRecord {
  id: string;
  name: string;
  type: 'company' | 'condo' | 'partner';
  typeLabel: string;
  nuit?: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  slaPlan: 'Standard' | 'Gold' | 'Platinum';
  monthlyContractMzn?: number;
  status: 'Ativo' | 'Pendente' | 'Suspenso';
  createdAt: string;
  notes?: string;
}

interface TariraCompaniesCrudManagerProps {
  clients: Client[];
  partnerCompanies?: any[];
  onAddClient?: (client: Client) => void;
  onUpdateClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onUpdatePartnerCompanies?: (companies: any[]) => void;
  onTriggerAuditLog?: (action: string, details: string) => void;
  onOpenBriefing?: (companyName?: string) => void;
}

export const TariraCompaniesCrudManager: React.FC<TariraCompaniesCrudManagerProps> = ({
  clients,
  partnerCompanies = [],
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onUpdatePartnerCompanies,
  onTriggerAuditLog,
  onOpenBriefing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'company' | 'condo' | 'partner'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<CompanyRecord | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyRecord | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<CompanyRecord | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [broadcastJobModal, setBroadcastJobModal] = useState<{ isOpen: boolean; jobData: JobBroadcastPayload | null }>({ isOpen: false, jobData: null });
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'company' | 'condo' | 'partner'>('company');
  const [formNuit, setFormNuit] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+258 84 ');
  const [formCity, setFormCity] = useState('Maputo');
  const [formAddress, setFormAddress] = useState('Av. 24 de Julho, Maputo');
  const [formSlaPlan, setFormSlaPlan] = useState<'Standard' | 'Gold' | 'Platinum'>('Gold');
  const [formMonthlyContract, setFormMonthlyContract] = useState(45000);
  const [formNotes, setFormNotes] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Build unified list from clients of type company/condo + partnerCompanies
  const baseCompanies: CompanyRecord[] = [
    ...clients
      .filter((c) => c.type === 'company' || c.type === 'condo')
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: (c.type === 'condo' ? 'condo' : 'company') as 'company' | 'condo',
        typeLabel: c.type === 'condo' ? 'Condomínio Residencial' : 'Empresa Corporativa',
        nuit: c.nuit || '400192837',
        contactPerson: c.name.includes(' ') ? c.name : 'Diretoria de Operações',
        email: c.email || 'empresa@cliente.co.mz',
        phone: c.phone || '+258 84 123 4567',
        city: c.city || 'Maputo',
        address: 'Bairro Polana / Cidade de Maputo',
        slaPlan: 'Platinum' as const,
        monthlyContractMzn: 19500,
        status: 'Ativo' as const,
        createdAt: c.createdAt || '2026-01-15',
        notes: c.notes || 'Contrato corporativo de outsourcing e manutenção preventiva.'
      })),
    ...partnerCompanies.map((p, idx) => ({
      id: p.id || `partner-${idx}`,
      name: p.name || 'Parceiro Corporativo',
      type: 'partner' as const,
      typeLabel: 'Parceiro Estratégico',
      nuit: p.nuit || '400998877',
      contactPerson: p.contact || 'Gestor de Contas',
      email: p.email || 'parceria@tarira.co.mz',
      phone: p.phone || '+258 84 999 8888',
      city: p.city || 'Maputo',
      address: p.address || 'Maputo Cidade',
      slaPlan: (p.plan || 'Gold') as any,
      monthlyContractMzn: p.value || 35000,
      status: (p.status || 'Ativo') as any,
      createdAt: '2026-02-01',
      notes: p.notes || 'Parceria oficial com cobertura de serviços em Moçambique.'
    }))
  ];

  // Antes, quando não havia (ainda) clientes reais carregados — seja por a
  // lista estar mesmo vazia, seja só porque o fetch inicial ainda estava a
  // decorrer — este painel preenchia a lista com duas entidades fictícias
  // ("Condomínio Torres da Polana", "Moçambique Minerais Logística Lda").
  // Isso reproduzia exatamente o problema de "cards de clientes a aparecer
  // vazios/errados por instantes": o admin via por breves segundos empresas
  // que não existem, substituídas pelos dados reais assim que chegavam (ou,
  // pior, via-as permanentemente numa instalação nova sem clientes ainda).
  // A plataforma deve mostrar sempre e só clientes reais.
  const companiesList: CompanyRecord[] = baseCompanies;

  const filteredCompanies = companiesList.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(term) ||
      c.contactPerson.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term) ||
      (c.nuit && c.nuit.includes(term));

    if (!matchesSearch) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return true;
  });

  // Handle Create Company Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Por favor, indique a razão social da empresa/condomínio.');
      return;
    }

    const newCompany: CompanyRecord = {
      id: `corp-${Date.now()}`,
      name: formName,
      type: formType,
      typeLabel: formType === 'condo' ? 'Condomínio Residencial' : formType === 'partner' ? 'Parceiro Estratégico' : 'Empresa Corporativa',
      nuit: formNuit,
      contactPerson: formContactPerson || 'Gestão Geral',
      email: formEmail,
      phone: formPhone,
      city: formCity,
      address: formAddress,
      slaPlan: formSlaPlan,
      monthlyContractMzn: Number(formMonthlyContract) || 0,
      status: 'Ativo',
      createdAt: new Date().toISOString().split('T')[0],
      notes: formNotes
    };

    if (onAddClient) {
      onAddClient({
        id: newCompany.id,
        name: newCompany.name,
        type: newCompany.type === 'condo' ? 'condo' : 'company',
        email: newCompany.email,
        phone: newCompany.phone,
        city: newCompany.city,
        nuit: newCompany.nuit,
        notes: newCompany.notes,
        createdAt: newCompany.createdAt
      });
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog('CRIAR_EMPRESA', `Nova entidade registada: ${newCompany.name} (${newCompany.typeLabel}) - SLA: ${newCompany.slaPlan}`);
    }

    showToast(`Entidade ${newCompany.name} registada com sucesso!`);
    setIsCreateModalOpen(false);

    // Reset
    setFormName('');
    setFormNuit('');
    setFormEmail('');
    setFormNotes('');
  };

  // Handle Edit Company Save
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    if (onUpdateClient) {
      onUpdateClient({
        id: editingCompany.id,
        name: editingCompany.name,
        type: editingCompany.type === 'condo' ? 'condo' : 'company',
        email: editingCompany.email,
        phone: editingCompany.phone,
        city: editingCompany.city,
        nuit: editingCompany.nuit,
        notes: editingCompany.notes
      });
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog('EDITAR_EMPRESA', `Entidade ${editingCompany.name} (#${editingCompany.id}) atualizada na Central.`);
    }

    showToast(`Dados de ${editingCompany.name} atualizados com sucesso!`);
    setEditingCompany(null);
  };

  // Handle Delete Confirm
  const handleConfirmDelete = () => {
    if (!deletingCompany) return;
    if (!deleteReason.trim()) {
      showToast('Por favor, informe a justificativa de exclusão.');
      return;
    }

    if (onDeleteClient) {
      onDeleteClient(deletingCompany.id);
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog('ELIMINAR_EMPRESA', `Entidade ${deletingCompany.name} (#${deletingCompany.id}) eliminada. Motivo: ${deleteReason}`);
    }

    showToast(`Entidade ${deletingCompany.name} removida.`);
    setDeletingCompany(null);
    setDeleteReason('');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#172554] text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-blue-300 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-700 text-xl border border-blue-500/30">
              🏢
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#172554]">
                Empresas Registadas & Parceiros B2B
              </h2>
              <p className="text-xs text-slate-400">
                Gestão de contratos corporativos, condomínios residenciais, acordos de nível de serviço (SLA) e parceiros.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => {
              setBroadcastJobModal({
                isOpen: true,
                jobData: {
                  companyName: 'Empresa Corporativa',
                  jobTitle: 'Quadro Técnico & Especialista',
                  category: 'Tecnologia & Operações',
                  location: 'Maputo, Moçambique',
                  contactEmail: 'tarira.ecossistema@gmail.com',
                  contactPhone: '+258 84 000 0000',
                  applicationUrl: 'https://tarira.co.mz/vagas'
                }
              });
            }}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-blue-900/60 border border-blue-500/50 hover:bg-blue-800/80 text-blue-200 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition-all"
            title="Disparar vaga para o LinkedIn e redes sociais (Gerador de Flyers)"
          >
            <Linkedin className="w-4 h-4 text-blue-700" />
            <span>Disparo LinkedIn (Flyer)</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenBriefing && onOpenBriefing()}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-white border border-blue-400/50 hover:bg-slate-50 text-blue-700 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition-all"
            title="Disparar requisição formal de vaga (Briefing Recrutamento)"
          >
            <Briefcase className="w-4 h-4 text-blue-700" />
            <span>+ Abrir Vaga (Briefing)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlansModalOpen(true)}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-white border border-emerald-400/50 hover:bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition-all"
            title="Definir o valor de manutenção de conta (MZN/mês) e as vantagens mostradas no registo"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Manutenção de Conta</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Empresa / Condomínio</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por nome da empresa, NUIT, contacto ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-blue-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
          >
            <option value="all">Todos os Tipos de Entidades ({companiesList.length})</option>
            <option value="company">🏢 Empresas Corporativas B2B</option>
            <option value="condo">🏘️ Condomínios Residenciais</option>
            <option value="partner">🤝 Parceiros Estratégicos Oficiais</option>
          </select>
        </div>
      </div>

      {/* Grid of Companies */}
      {filteredCompanies.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
          {companiesList.length === 0
            ? "🏢 Ainda não há nenhuma Empresa, Condomínio ou Parceiro registado na plataforma."
            : "Nenhuma entidade corresponde à pesquisa/filtro atual."}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompanies.map((comp) => (
          <div
            key={comp.id}
            className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-xl shrink-0 text-sky-400">
                    {comp.type === 'condo' ? '🏘️' : comp.type === 'partner' ? '🤝' : '🏢'}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#172554]">
                      {comp.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-sky-400 font-bold">
                        {comp.typeLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 border border-blue-500/30 text-[10px] font-bold">
                        SLA {comp.slaPlan}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingCompany(comp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#172554] hover:bg-white cursor-pointer"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCompany({ ...comp })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-white cursor-pointer"
                    title="Editar Empresa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingCompany(comp);
                      setDeleteReason('');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/30 cursor-pointer"
                    title="Eliminar Empresa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-slate-400">Responsável / Contacto:</span>
                  <span className="font-medium text-[#172554]">{comp.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-slate-400">Telefone:</span>
                  <span className="font-mono text-emerald-600 font-bold">{comp.phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-slate-400">E-mail:</span>
                  <span className="text-slate-200">{comp.email}</span>
                </div>
                {comp.monthlyContractMzn && (
                  <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span className="text-slate-400">Valor Mensal Contratado:</span>
                    <span className="font-mono text-blue-700 font-bold">{comp.monthlyContractMzn.toLocaleString()} MZN / mês</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] text-slate-400 font-mono">
                {comp.city} · NUIT: {comp.nuit || 'Isento'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastJobModal({
                      isOpen: true,
                      jobData: {
                        companyName: comp.name,
                        jobTitle: `Especialista Técnico / Profissional — ${comp.name}`,
                        category: comp.type === 'condo' ? 'Manutenção Predial & Facilities' : 'Tecnologia & Operações',
                        location: `${comp.city}, Moçambique`,
                        contactEmail: comp.email,
                        contactPhone: comp.phone,
                        applicationUrl: `https://tarira.co.mz/vagas/candidatura?empresa=${encodeURIComponent(comp.name)}`
                      }
                    });
                  }}
                  className="px-2.5 py-1 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 text-blue-700 border border-blue-500/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Disparar vaga no LinkedIn com flyer oficial"
                >
                  <Share2 className="w-3 h-3 text-blue-700" />
                  <span>Disparo LinkedIn</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenBriefing && onOpenBriefing(comp.name)}
                  className="px-2.5 py-1 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 border border-blue-500/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title={`Abrir requisição de vaga para ${comp.name}`}
                >
                  <Briefcase className="w-3 h-3 text-blue-700" />
                  <span>Nova Vaga</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const targetPhone = comp.phone.replace(/\D/g, '');
                    const msg = `Olá *${comp.contactPerson}* (*${comp.name}*), contactamos a partir da Central Administrativa TARIRA sobre a gestão da vossa conta corporativa.`;
                    window.open(`https://wa.me/258${targetPhone.slice(-9)}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="text-xs text-emerald-600 hover:underline font-bold flex items-center gap-1"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ════════ MODAL 1: CRIAR EMPRESA (CREATE) ════════ */}
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
                🏢
              </span>
              <div>
                <h3 className="font-serif text-2xl text-[#172554] font-bold">
                  Registar Nova Entidade / Condomínio B2B
                </h3>
                <p className="text-xs text-slate-400">
                  Preencha os dados institucionais, plano de SLA e contactos operacionais.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Nome / Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Condomínio Mar Azul"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Tipo de Entidade
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                  >
                    <option value="company">🏢 Empresa Corporativa B2B</option>
                    <option value="condo">🏘️ Condomínio Residencial</option>
                    <option value="partner">🤝 Parceiro Estratégico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    NUIT
                  </label>
                  <input
                    type="text"
                    placeholder="400123456"
                    value={formNuit}
                    onChange={(e) => setFormNuit(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Pessoa de Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do Síndico / Gestor"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Plano SLA
                  </label>
                  <select
                    value={formSlaPlan}
                    onChange={(e) => setFormSlaPlan(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-bold"
                  >
                    <option value="Standard">Standard (Resposta em 24h)</option>
                    <option value="Gold">Gold (Resposta em 4h)</option>
                    <option value="Platinum">Platinum 24/7 (Resposta em 1h)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Email Corporativo
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.co.mz"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Telefone (+258)
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Valor Mensal Contrato (MZN)
                  </label>
                  <input
                    type="number"
                    value={formMonthlyContract}
                    onChange={(e) => setFormMonthlyContract(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Notas de Contrato & Observações
                </label>
                <textarea
                  rows={2}
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
                  Registar Entidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 2: VER DOSSIÊ (READ) ════════ */}
      {viewingCompany && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setViewingCompany(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-3xl shrink-0">
                {viewingCompany.type === 'condo' ? '🏘️' : '🏢'}
              </div>
              <div>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">
                  {viewingCompany.typeLabel}
                </span>
                <h3 className="font-serif text-2xl text-[#172554] font-bold">
                  {viewingCompany.name}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-5 border-b border-slate-200 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Representante
                </span>
                <span className="text-[#172554] font-bold block">{viewingCompany.contactPerson}</span>
                <span className="text-slate-400 font-mono">{viewingCompany.phone}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Plano de Cobertura SLA
                </span>
                <span className="text-blue-700 font-bold block">SLA {viewingCompany.slaPlan}</span>
                <span className="text-slate-400 font-mono">{viewingCompany.monthlyContractMzn?.toLocaleString()} MZN / mês</span>
              </div>
            </div>

            <div className="pt-5 flex items-center justify-end gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const comp = viewingCompany;
                  setBroadcastJobModal({
                    isOpen: true,
                    jobData: {
                      companyName: comp.name,
                      jobTitle: `Especialista Técnico / Profissional — ${comp.name}`,
                      category: comp.type === 'condo' ? 'Manutenção Predial & Facilities' : 'Tecnologia & Operações',
                      location: `${comp.city}, Moçambique`,
                      contactEmail: comp.email,
                      contactPhone: comp.phone,
                      applicationUrl: `https://tarira.co.mz/vagas/candidatura?empresa=${encodeURIComponent(comp.name)}`
                    }
                  });
                }}
                className="px-4 py-2.5 rounded-2xl bg-blue-900/60 border border-blue-500/50 hover:bg-blue-800/80 text-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                <span>Disparar LinkedIn (Flyer)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const compName = viewingCompany.name;
                  setViewingCompany(null);
                  if (onOpenBriefing) onOpenBriefing(compName);
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 text-xs font-black uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Briefcase className="w-4 h-4 text-slate-950" />
                <span>Abrir Vaga (Briefing)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const c = viewingCompany;
                  setViewingCompany(null);
                  setEditingCompany({ ...c });
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-blue-700 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Editar Empresa
              </button>
              <button
                type="button"
                onClick={() => setViewingCompany(null)}
                className="px-4 py-2.5 rounded-2xl bg-white text-slate-500 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 3: EDITAR EMPRESA (UPDATE) ════════ */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setEditingCompany(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-4">
              Editar: {editingCompany.name}
            </h3>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  required
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={editingCompany.contactPerson}
                    onChange={(e) => setEditingCompany({ ...editingCompany, contactPerson: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={editingCompany.phone}
                    onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
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
      )}

      {/* ════════ MODAL 4: ELIMINAR EMPRESA (DELETE) ════════ */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-rose-500/40 bg-white shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-3 rounded-2xl bg-rose-500/20 text-rose-600 text-2xl border border-rose-500/30 shrink-0">
                ⚠️
              </span>
              <div>
                <h3 className="font-serif text-xl text-[#172554] font-bold">
                  Eliminar Registo de Empresa
                </h3>
                <p className="text-xs text-rose-700">
                  Esta ação removerá os dados contratuais do sistema administrativo.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 mb-4 text-xs space-y-1">
              <span className="text-[#172554] font-bold block text-sm">
                {deletingCompany.name}
              </span>
              <span className="text-slate-400 font-mono block">
                {deletingCompany.typeLabel} · {deletingCompany.city}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-[10px] uppercase font-bold text-rose-600 font-mono block">
                Justificativa Obrigatória de Eliminação *
              </label>

              {/* Motivos rápidos — clique para preencher, sem ter de escrever ou colar */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Empresa/cliente inativo há mais de 6 meses',
                  'Registo duplicado',
                  'Solicitação do próprio cliente',
                  'Dados incorretos ou fraudulentos',
                  'Encerramento de atividade',
                  'Violação dos termos de uso'
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
                onClick={() => setDeletingCompany(null)}
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
      {/* Editor do valor de manutenção de conta e das vantagens (Empresa, Condomínio e Particular) */}
      <TariraRegistrationPlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        onTriggerAuditLog={onTriggerAuditLog}
      />

      {/* Tarira Multichannel Job Broadcast & LinkedIn Flyer Modal */}
      {broadcastJobModal.isOpen && broadcastJobModal.jobData && (
        <TariraJobBroadcastModal
          isOpen={broadcastJobModal.isOpen}
          onClose={() => setBroadcastJobModal({ isOpen: false, jobData: null })}
          jobData={broadcastJobModal.jobData}
          onLogAudit={onTriggerAuditLog}
        />
      )}
    </div>
  );
};
