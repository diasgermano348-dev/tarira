import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  MessageSquare,
  Building,
  User,
  MapPin,
  Sparkles,
  DollarSign,
  Send,
  Calendar,
  X,
  FileText,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { Candidate, Client, Hire, OrgOperator } from './types';

interface TariraOrdersCrudManagerProps {
  hires: Hire[];
  candidates: Candidate[];
  clients: Client[];
  activeOperator: OrgOperator;
  onAddHire?: (hire: Hire) => void;
  onUpdateHire?: (hire: Hire) => void;
  onDeleteHire?: (hireId: string, reason?: string) => void;
  onUpdateHireStatus?: (hireId: string, newStatus: string, notes?: string) => Promise<void> | void;
  onTriggerAuditLog?: (action: string, details: string) => void;
}

export const TariraOrdersCrudManager: React.FC<TariraOrdersCrudManagerProps> = ({
  hires,
  candidates,
  clients,
  activeOperator,
  onAddHire,
  onUpdateHire,
  onDeleteHire,
  onUpdateHireStatus,
  onTriggerAuditLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emergencyFilter, setEmergencyFilter] = useState<'all' | 'emergency'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingHire, setViewingHire] = useState<Hire | null>(null);
  const [editingHire, setEditingHire] = useState<Hire | null>(null);
  const [deletingHire, setDeletingHire] = useState<Hire | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Create Form state
  const [formClientName, setFormClientName] = useState('');
  const [formCandidateId, setFormCandidateId] = useState('');
  const [formServiceName, setFormServiceName] = useState('Manutenção Elétrica & Quadro');
  const [formCategory, setFormCategory] = useState('tech');
  const [formPrice, setFormPrice] = useState(2500);
  const [formLocation, setFormLocation] = useState('Polana Cimento, Maputo');
  const [formScheduledDate, setFormScheduledDate] = useState('2026-03-01 10:00');
  const [formIsEmergency, setFormIsEmergency] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  // Toast state
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Filter hires
  const filteredHires = hires.filter((h) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      h.serviceName.toLowerCase().includes(term) ||
      h.clientName.toLowerCase().includes(term) ||
      h.candidateName.toLowerCase().includes(term) ||
      (h.location && h.location.toLowerCase().includes(term)) ||
      (h.id && h.id.toLowerCase().includes(term));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (emergencyFilter === 'emergency' && !h.isEmergency) return false;
    return true;
  });

  // Handle Quick Status Change
  const handleQuickStatusChange = async (hire: Hire, newStatus: string) => {
    if (onUpdateHireStatus) {
      await onUpdateHireStatus(hire.id, newStatus, `Estado atualizado para ${newStatus} por ${activeOperator.name}`);
    } else if (onUpdateHire) {
      onUpdateHire({ ...hire, status: newStatus as any });
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'ATUALIZAR_ESTADO_PEDIDO',
        `Pedido #${hire.id.slice(-6)} (${hire.serviceName}) alterado para ${newStatus}. Operador: ${activeOperator.name}`
      );
    }
    showToast(`Pedido #${hire.id.slice(-6)} atualizado para: ${newStatus.toUpperCase()}`);
  };

  // Handle Create Order Submit
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim() || !formServiceName.trim()) {
      showToast('Por favor, preencha o nome do cliente e o serviço.');
      return;
    }

    const selectedCand = candidates.find((c) => c.id === formCandidateId) || candidates[0];
    const selectedClient = clients.find((cl) => cl.name === formClientName);
    const newHire: Hire = {
      id: `hire-${Date.now()}`,
      clientId: selectedClient?.id || `client-${Date.now()}`,
      clientName: formClientName,
      candidateId: selectedCand?.id || 'cand-001',
      candidateName: selectedCand?.name || 'Técnico Especialista Tarira',
      serviceName: formServiceName,
      category: formCategory,
      price: Number(formPrice) || 2000,
      totalAmount: Number(formPrice) || 2000,
      timestamp: new Date().toISOString(),
      status: 'pending',
      location: formLocation,
      scheduledDate: formScheduledDate,
      isEmergency: formIsEmergency,
      notes: formNotes || 'Despacho manual criado pela Central Administrativa.'
    };

    if (onAddHire) {
      onAddHire(newHire);
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'CRIAR_PEDIDO_MANUAL',
        `Novo pedido criado: ${newHire.serviceName} para cliente ${newHire.clientName}. Atribuído a: ${newHire.candidateName}`
      );
    }

    showToast(`Pedido para ${newHire.clientName} criado com sucesso!`);
    setIsCreateModalOpen(false);

    // Reset
    setFormClientName('');
    setFormNotes('');
  };

  // Handle Edit Order Save
  const handleEditOrderSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHire) return;

    if (onUpdateHire) {
      onUpdateHire(editingHire);
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'EDITAR_PEDIDO',
        `Pedido #${editingHire.id} atualizado por ${activeOperator.name}. Novo estado: ${editingHire.status}`
      );
    }

    showToast(`Pedido #${editingHire.id.slice(-6)} atualizado com sucesso!`);
    setEditingHire(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingHire) return;
    if (!deleteReason.trim()) {
      showToast('Por favor, indique o motivo de cancelamento / exclusão.');
      return;
    }

    if (onDeleteHire) {
      onDeleteHire(deletingHire.id, deleteReason);
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'ELIMINAR_PEDIDO',
        `Pedido #${deletingHire.id} (${deletingHire.serviceName}) cancelado/eliminado. Motivo: ${deleteReason}`
      );
    }

    showToast(`Pedido #${deletingHire.id.slice(-6)} cancelado com sucesso.`);
    setDeletingHire(null);
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

      {/* Top Header */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-700 text-xl border border-blue-500/30">
              📋
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#172554]">
                Central de Pedidos & Despacho Operacional
              </h2>
              <p className="text-xs text-slate-400">
                Acompanhamento, criação manual de ordens de serviço, atribuição de técnicos e despacho para WhatsApp.
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
          <span>+ Novo Pedido / Despacho Manual</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por serviço, cliente, prestador, local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-blue-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
          >
            <option value="all">Todos os Estados ({hires.length})</option>
            <option value="pending">⏳ Pendente de Validação</option>
            <option value="approved">✅ Aprovado & Despachado</option>
            <option value="in_progress">⚡ Em Andamento / No Local</option>
            <option value="completed">🎉 Concluído com Sucesso</option>
            <option value="cancelled">🚫 Cancelado</option>
          </select>
        </div>

        <div>
          <select
            value={emergencyFilter}
            onChange={(e) => setEmergencyFilter(e.target.value as any)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="emergency">🚨 Apenas Emergências (24/7)</option>
          </select>
        </div>
      </div>

      {/* Grid of Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredHires.length === 0 ? (
          <div className="col-span-2 glass-panel rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
            Nenhum pedido de serviço encontrado com os filtros actuais.
          </div>
        ) : (
          filteredHires.map((hire) => {
            const assignedCand = candidates.find(
              (c) => c.id === hire.candidateId || c.name === hire.candidateName
            );
            const isPending = hire.status === 'pending' || !hire.status;

            return (
              <div
                key={hire.id}
                className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between"
              >
                {/* Header of Order Card */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-blue-700 font-bold">
                          #{hire.id.slice(-6).toUpperCase()}
                        </span>
                        {hire.isEmergency && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-700 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            🚨 EMERGÊNCIA
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            hire.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                              : hire.status === 'completed'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : hire.status === 'cancelled'
                              ? 'bg-rose-500/20 text-rose-700 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
                          }`}
                        >
                          {hire.status === 'approved'
                            ? '✅ Aprovado'
                            : hire.status === 'completed'
                            ? '🎉 Concluído'
                            : hire.status === 'cancelled'
                            ? '🚫 Cancelado'
                            : '⏳ Pendente'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#172554]">
                        {hire.serviceName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* View Button */}
                      <button
                        type="button"
                        onClick={() => setViewingHire(hire)}
                        className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-[#172554] border border-slate-200 cursor-pointer"
                        title="Ver Detalhes do Pedido"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingHire({ ...hire })}
                        className="p-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-500/40 cursor-pointer"
                        title="Editar Pedido"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingHire(hire);
                          setDeleteReason('');
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-500/40 cursor-pointer"
                        title="Cancelar / Eliminar Pedido"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Client & Assigned Provider Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Client */}
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                        👤 Cliente Solicitante
                      </span>
                      <span className="text-[#172554] font-bold block">{hire.clientName}</span>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400">
                          {hire.location || 'Maputo'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const msg = `Olá *${hire.clientName}*, confirmamos o recebimento do seu pedido de *${hire.serviceName}* na TARIRA.`;
                            window.open(`https://wa.me/258840000000?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="text-emerald-600 hover:underline font-bold flex items-center gap-0.5"
                        >
                          💬 WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Assigned Candidate */}
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                        🔧 Prestador Atribuído
                      </span>
                      <span className="text-[#172554] font-bold block">
                        {assignedCand?.name || hire.candidateName || 'Aguardando Atribuição'}
                      </span>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-mono text-blue-700 font-bold">
                          {hire.price || hire.totalAmount || 2500} MZN
                        </span>
                        {assignedCand?.phone && (
                          <button
                            type="button"
                            onClick={() => {
                              const targetPhone = assignedCand.phone.replace(/\D/g, '');
                              const msg = `Olá *${assignedCand.name}*, tens um novo serviço atribuído pela Central TARIRA: *${hire.serviceName}* para o cliente *${hire.clientName}*.`;
                              window.open(`https://wa.me/258${targetPhone.slice(-9)}?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="text-emerald-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            💬 Despachar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {hire.notes && (
                    <p className="text-[11px] text-slate-400 bg-white p-2.5 rounded-xl border border-slate-200/80 italic">
                      "{hire.notes}"
                    </p>
                  )}
                </div>

                {/* Quick Status Action Controls */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Data: {hire.scheduledDate || hire.timestamp?.split('T')[0] || 'Hoje'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(hire, 'approved')}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Check className="w-3 h-3" />
                        <span>Aprovar & Despachar</span>
                      </button>
                    )}

                    {hire.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(hire, 'completed')}
                        className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-[#172554] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <span>Concluir Serviço</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ════════ MODAL 1: NOVO PEDIDO MANUAL (CREATE) ════════ */}
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
                📋
              </span>
              <div>
                <h3 className="font-serif text-2xl text-[#172554] font-bold">
                  Novo Pedido de Serviço (Despacho Manual)
                </h3>
                <p className="text-xs text-slate-400">
                  Registe uma ordem de serviço solicitada por telefone, WhatsApp ou balcão.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Teresa Manhiça"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Atribuir Prestador / Técnico *
                  </label>
                  <select
                    value={formCandidateId}
                    onChange={(e) => setFormCandidateId(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                  >
                    <option value="">Selecione um técnico qualificado...</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.category || 'Ofício'} ({c.hourlyRate || 500} MZN/h)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Descrição do Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    value={formServiceName}
                    onChange={(e) => setFormServiceName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Valor Estimado (MZN) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Endereço / Local da Execução *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Data & Hora Agendada
                  </label>
                  <input
                    type="text"
                    value={formScheduledDate}
                    onChange={(e) => setFormScheduledDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <input
                  type="checkbox"
                  id="isEmergencyOrder"
                  checked={formIsEmergency}
                  onChange={(e) => setFormIsEmergency(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                />
                <label htmlFor="isEmergencyOrder" className="text-xs text-rose-700 font-bold cursor-pointer">
                  🚨 Marcar como Emergência / Despacho Imediato (24/7)
                </label>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Notas de Despacho / Instruções Especiais
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Informações adicionais para o prestador de serviço..."
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
                  Criar & Atribuir Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 2: VER DOSSIÊ DO PEDIDO (READ) ════════ */}
      {viewingHire && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setViewingHire(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
              <span className="p-3 rounded-2xl bg-blue-500/20 text-blue-700 text-2xl border border-blue-500/30 shrink-0">
                📋
              </span>
              <div>
                <span className="text-[10px] font-mono text-blue-700 uppercase font-bold">
                  Dossiê de Ordem de Serviço #{viewingHire.id}
                </span>
                <h3 className="font-serif text-2xl text-[#172554] font-bold">
                  {viewingHire.serviceName}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-5 border-b border-slate-200 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Cliente Solicitante
                </span>
                <span className="text-[#172554] font-bold block">{viewingHire.clientName}</span>
                <span className="text-slate-400 text-[11px] block">{viewingHire.location}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Técnico / Prestador Atribuído
                </span>
                <span className="text-[#172554] font-bold block">{viewingHire.candidateName}</span>
                <span className="text-blue-700 font-mono font-bold block">
                  Valor: {viewingHire.price || viewingHire.totalAmount || 2500} MZN
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Estado Atual
                </span>
                <span className="text-[#172554] font-bold block uppercase">{viewingHire.status || 'Pendente'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Data de Agendamento
                </span>
                <span className="text-slate-500 font-mono block">{viewingHire.scheduledDate || viewingHire.timestamp}</span>
              </div>
            </div>

            {viewingHire.notes && (
              <div className="py-4 border-b border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Notas Internas do Despacho
                </span>
                <p className="text-xs text-slate-500 p-3 rounded-2xl bg-white border border-slate-200">
                  {viewingHire.notes}
                </p>
              </div>
            )}

            <div className="pt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const h = viewingHire;
                  setViewingHire(null);
                  setEditingHire({ ...h });
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                Editar Pedido
              </button>
              <button
                type="button"
                onClick={() => setViewingHire(null)}
                className="px-4 py-2.5 rounded-2xl bg-white text-slate-500 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 3: EDITAR PEDIDO (UPDATE) ════════ */}
      {editingHire && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setEditingHire(null)}
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
                  Editar Pedido #{editingHire.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400">
                  Altere o prestador atribuído, valor, estado ou dados de agendamento.
                </p>
              </div>
            </div>

            <form onSubmit={handleEditOrderSave} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Cliente Solicitante *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingHire.clientName}
                    onChange={(e) => setEditingHire({ ...editingHire, clientName: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Prestador Atribuído *
                  </label>
                  <select
                    value={editingHire.candidateId}
                    onChange={(e) => {
                      const cand = candidates.find((c) => c.id === e.target.value);
                      setEditingHire({
                        ...editingHire,
                        candidateId: e.target.value,
                        candidateName: cand?.name || editingHire.candidateName
                      });
                    }}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                  >
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Estado do Pedido
                  </label>
                  <select
                    value={editingHire.status || 'pending'}
                    onChange={(e) => setEditingHire({ ...editingHire, status: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-bold"
                  >
                    <option value="pending">⏳ Pendente</option>
                    <option value="approved">✅ Aprovado & Despachado</option>
                    <option value="in_progress">⚡ Em Andamento</option>
                    <option value="completed">🎉 Concluído</option>
                    <option value="cancelled">🚫 Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Valor (MZN)
                  </label>
                  <input
                    type="number"
                    value={editingHire.price || editingHire.totalAmount || 0}
                    onChange={(e) =>
                      setEditingHire({
                        ...editingHire,
                        price: Number(e.target.value),
                        totalAmount: Number(e.target.value)
                      })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Data Agendada
                  </label>
                  <input
                    type="text"
                    value={editingHire.scheduledDate || ''}
                    onChange={(e) => setEditingHire({ ...editingHire, scheduledDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Localização / Endereço
                </label>
                <input
                  type="text"
                  value={editingHire.location || ''}
                  onChange={(e) => setEditingHire({ ...editingHire, location: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Notas de Despacho
                </label>
                <textarea
                  rows={2}
                  value={editingHire.notes || ''}
                  onChange={(e) => setEditingHire({ ...editingHire, notes: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingHire(null)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 4: ELIMINAR / CANCELAR PEDIDO (DELETE) ════════ */}
      {deletingHire && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-rose-500/40 bg-white shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-3 rounded-2xl bg-rose-500/20 text-rose-600 text-2xl border border-rose-500/30 shrink-0">
                ⚠️
              </span>
              <div>
                <h3 className="font-serif text-xl text-[#172554] font-bold">
                  Cancelar / Eliminar Pedido
                </h3>
                <p className="text-xs text-rose-700">
                  Esta ação cancelará o despacho e será registrada na auditoria imutável.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 mb-4 text-xs space-y-1">
              <span className="text-[#172554] font-bold block text-sm">
                {deletingHire.serviceName}
              </span>
              <span className="text-slate-400 block font-mono">
                Cliente: {deletingHire.clientName} · Técnico: {deletingHire.candidateName}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                ID: #{deletingHire.id}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-[10px] uppercase font-bold text-rose-600 font-mono block">
                Justificativa Obrigatória de Cancelamento *
              </label>

              {/* Motivos rápidos — clique para preencher, sem ter de escrever ou colar */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Cliente desistiu do serviço',
                  'Pagamento não confirmado',
                  'Pedido duplicado',
                  'Erro no registo do pedido',
                  'Técnico/profissional indisponível',
                  'Suspeita de fraude'
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
                onClick={() => setDeletingHire(null)}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
