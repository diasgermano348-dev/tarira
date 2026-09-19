import React, { useState } from 'react';
import {
  Star,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  User,
  Check
} from 'lucide-react';

export interface ServiceReviewItem {
  id: string;
  clientName: string;
  providerName: string;
  serviceName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'hidden';
  adminResponse?: string;
}

interface TariraReviewsCrudManagerProps {
  reviews?: any[];
  onUpdateReviews?: (reviews: any[]) => void;
  onTriggerAuditLog?: (action: string, details: string) => void;
}

export const TariraReviewsCrudManager: React.FC<TariraReviewsCrudManagerProps> = ({
  reviews = [],
  onUpdateReviews,
  onTriggerAuditLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const defaultReviews: ServiceReviewItem[] = [
    {
      id: 'rev-001',
      clientName: 'Dra. Luísa Cossa',
      providerName: 'Mateus Nhaca',
      serviceName: 'Manutenção de Ar Condicionado',
      rating: 5,
      comment: 'Serviço pontual, técnico muito educado e o ar condicionado ficou a gelar perfeitamente. Recomendo vivamente!',
      date: '2026-02-24',
      status: 'approved',
      adminResponse: 'Agradecemos o feedback, Dra. Luísa! A qualidade é o nosso compromisso.'
    },
    {
      id: 'rev-002',
      clientName: 'Dr. Arnaldo Mabunda',
      providerName: 'Eng. Amílcar Sitoe',
      serviceName: 'Inspeção Elétrica Condominial',
      rating: 5,
      comment: 'Relatório técnico muito detalhado e resolução imediata dos disjuntores que estavam em sobrecarga.',
      date: '2026-02-21',
      status: 'approved'
    }
  ];

  const [localReviews, setLocalReviews] = useState<ServiceReviewItem[]>(
    reviews && reviews.length > 0 ? reviews : defaultReviews
  );

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingReview, setViewingReview] = useState<ServiceReviewItem | null>(null);
  const [editingReview, setEditingReview] = useState<ServiceReviewItem | null>(null);
  const [deletingReview, setDeletingReview] = useState<ServiceReviewItem | null>(null);

  // Form State
  const [formClient, setFormClient] = useState('');
  const [formProvider, setFormProvider] = useState('Mateus Nhaca');
  const [formService, setFormService] = useState('Canalização & Desentupimento');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formStatus, setFormStatus] = useState<ServiceReviewItem['status']>('approved');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const syncReviews = (updated: ServiceReviewItem[]) => {
    setLocalReviews(updated);
    if (onUpdateReviews) onUpdateReviews(updated);
  };

  const filteredReviews = localReviews.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matches =
      r.clientName.toLowerCase().includes(term) ||
      r.providerName.toLowerCase().includes(term) ||
      r.serviceName.toLowerCase().includes(term) ||
      r.comment.toLowerCase().includes(term);

    if (!matches) return false;
    if (ratingFilter !== 'all' && r.rating !== Number(ratingFilter)) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClient.trim() || !formComment.trim()) {
      showToast('Preencha o cliente e o depoimento.');
      return;
    }

    const newRev: ServiceReviewItem = {
      id: `rev-${Date.now()}`,
      clientName: formClient,
      providerName: formProvider,
      serviceName: formService,
      rating: Number(formRating) || 5,
      comment: formComment,
      date: new Date().toISOString().split('T')[0],
      status: formStatus
    };

    const updated = [newRev, ...localReviews];
    syncReviews(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('CRIAR_AVALIACAO', `Avaliação de ${newRev.rating} estrelas registada para ${newRev.serviceName}.`);
    }

    showToast('Avaliação registada com sucesso!');
    setIsCreateModalOpen(false);
    setFormClient('');
    setFormComment('');
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    const updated = localReviews.map((r) => (r.id === editingReview.id ? editingReview : r));
    syncReviews(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('MODERAR_AVALIACAO', `Avaliação #${editingReview.id} moderada. Novo estado: ${editingReview.status}.`);
    }

    showToast('Avaliação atualizada!');
    setEditingReview(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingReview) return;
    const updated = localReviews.filter((r) => r.id !== deletingReview.id);
    syncReviews(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('ELIMINAR_AVALIACAO', `Avaliação #${deletingReview.id} removida.`);
    }

    showToast('Avaliação removida.');
    setDeletingReview(null);
  };

  return (
    <div className="space-y-6">
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
              ⭐
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#172554]">
                Avaliações & Controlo de Qualidade
              </h2>
              <p className="text-xs text-slate-400">
                Moderação de depoimentos de clientes, índice de satisfação (CSAT) e resposta oficial da equipa Tarira.
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
          <span>+ Registar Nova Avaliação</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por cliente, prestador, serviço ou comentário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-blue-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
          >
            <option value="all">Todas as Classificações ({localReviews.length})</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Estrelas (Excelente)</option>
            <option value="4">⭐⭐⭐⭐ 4 Estrelas (Muito Bom)</option>
            <option value="3">⭐⭐⭐ 3 Estrelas (Regular)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-3 flex flex-col justify-between hover:border-blue-500/30 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1 text-blue-700 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rev.rating ? 'fill-blue-400 text-blue-700' : 'text-slate-700'}`}
                      />
                    ))}
                    <span className="text-xs text-slate-400 font-mono ml-1 font-bold">
                      ({rev.rating}.0)
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#172554]">
                    {rev.serviceName}
                  </h3>
                  <span className="text-xs text-blue-700 font-medium block">
                    Por: {rev.clientName} · Prestador: {rev.providerName}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingReview(rev)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#172554] hover:bg-white cursor-pointer"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingReview({ ...rev })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-white cursor-pointer"
                    title="Moderar Avaliação"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingReview(rev)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/30 cursor-pointer"
                    title="Eliminar Avaliação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic bg-white p-3 rounded-2xl border border-slate-200">
                "{rev.comment}"
              </p>

              {rev.adminResponse && (
                <div className="text-[11px] text-blue-700/90 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                  <span className="font-bold block">Resposta Oficial Tarira:</span>
                  <span>{rev.adminResponse}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>{rev.date}</span>
              <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                rev.status === 'approved' ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' : 'bg-slate-50 text-slate-400'
              }`}>
                {rev.status === 'approved' ? 'Aprovado' : 'Oculto'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ════════ MODAL 1: CRIAR AVALIAÇÃO ════════ */}
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

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-4">
              Registar Avaliação de Cliente
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Teresa Manhiça"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Prestador Avaliado
                  </label>
                  <input
                    type="text"
                    required
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Serviço Prestado
                  </label>
                  <input
                    type="text"
                    required
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Classificação (Estrelas 1 a 5)
                  </label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Estrelas</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Estrelas</option>
                    <option value={3}>⭐⭐⭐ 3 Estrelas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Comentário / Depoimento *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Relato da experiência do cliente..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
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
                  Registar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 2: VER AVALIAÇÃO ════════ */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setViewingReview(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-1">
              Avaliação de {viewingReview.clientName}
            </h3>
            <span className="text-xs text-blue-700 block mb-4">
              {viewingReview.serviceName} · {viewingReview.rating} Estrelas
            </span>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs mb-4">
              <p className="text-slate-200 italic">"{viewingReview.comment}"</p>
            </div>

            <div className="pt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingReview(null)}
                className="px-5 py-2.5 rounded-2xl bg-white text-slate-500 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 3: EDITAR / MODERAR ════════ */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-4">
              Moderar Avaliação #{editingReview.id}
            </h3>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Estado de Publicação
                </label>
                <select
                  value={editingReview.status}
                  onChange={(e) => setEditingReview({ ...editingReview, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-bold"
                >
                  <option value="approved">✅ Aprovado (Exibir na Plataforma)</option>
                  <option value="hidden">🚫 Oculto</option>
                  <option value="pending">⏳ Em Moderação</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Resposta Oficial da Administração
                </label>
                <textarea
                  rows={3}
                  placeholder="Resposta pública da equipa Tarira..."
                  value={editingReview.adminResponse || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, adminResponse: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 4: ELIMINAR ════════ */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-rose-500/40 bg-white shadow-2xl relative">
            <h3 className="font-serif text-xl text-[#172554] font-bold mb-2">
              Eliminar Avaliação
            </h3>
            <p className="text-xs text-rose-700 mb-4">
              Deseja remover o depoimento de "{deletingReview.clientName}"?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
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
    </div>
  );
};
