import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Download,
  Filter,
  Sparkles,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { OperatorAuditAction, OrgOperator } from './types';

interface TariraAuditLogsManagerProps {
  auditLogs?: OperatorAuditAction[];
  activeOperator?: OrgOperator;
  onAddAuditLog?: (log: Partial<OperatorAuditAction>) => void;
}

export const TariraAuditLogsManager: React.FC<TariraAuditLogsManagerProps> = ({
  auditLogs = [],
  activeOperator,
  onAddAuditLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Modal create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formAction, setFormAction] = useState('NOTA_ADMINISTRATIVA');
  const [formDetails, setFormDetails] = useState('');
  const [formTarget, setFormTarget] = useState('Geral');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matches =
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.operatorName.toLowerCase().includes(term) ||
      (log.targetEntity && log.targetEntity.toLowerCase().includes(term));

    if (!matches) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDetails.trim()) {
      showToast('Preencha a descrição da nota de auditoria.');
      return;
    }

    if (onAddAuditLog) {
      onAddAuditLog({
        action: formAction,
        details: formDetails,
        targetEntity: formTarget,
        operatorName: activeOperator?.name || 'Administrador Central',
        operatorId: activeOperator?.id || 'op-001',
        timestamp: new Date().toISOString()
      });
    }

    showToast('Nota de auditoria imutável registrada com sucesso!');
    setIsCreateModalOpen(false);
    setFormDetails('');
  };

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `auditoria_tarira_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Relatório de auditoria exportado em JSON.');
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
              🛡️
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#172554]">
                Histórico & Auditoria Imutável
              </h2>
              <p className="text-xs text-slate-400">
                Registo criptografado de todas as operações sensíveis: alterações de perfis, aprovação de ordens e exclusões.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportLogs}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 hover:text-[#172554] border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:brightness-110 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registar Nota Manual</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por ação, operador ou detalhe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-blue-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
          >
            <option value="all">Todas as Operações ({auditLogs.length})</option>
            <option value="CRIAR_PERFIL">Criação de Perfis</option>
            <option value="EDITAR_PERFIL">Edição de Perfis</option>
            <option value="ELIMINAR_PERFIL">Eliminação de Perfis</option>
            <option value="ATUALIZAR_ESTADO_PEDIDO">Atualizações de Pedidos</option>
            <option value="NOTA_ADMINISTRATIVA">Notas Administrativas</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="glass-panel rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className="p-4 bg-white border-b border-slate-200 text-xs font-mono font-bold text-slate-400 flex items-center justify-between">
          <span>EVENTOS DE SEGURANÇA & AUDITORIA</span>
          <span>TOTAL: {filteredLogs.length}</span>
        </div>

        <div className="divide-y divide-slate-200/80">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Nenhum registo de auditoria encontrado.
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={log.id || idx} className="p-4 hover:bg-white transition-all flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 border border-blue-500/30 text-[10px] font-mono font-bold">
                      {log.action}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Operador: <strong className="text-[#172554]">{log.operatorName}</strong>
                    </span>
                    {log.targetEntity && (
                      <span className="px-2 py-0.5 rounded-md bg-white text-slate-400 border border-slate-200 text-[10px]">
                        Alvo: {log.targetEntity}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200">{log.details}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('pt-MZ') : 'Agora'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ════════ MODAL CRIAR NOTA MANUAL ════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-blue-400/40 bg-white shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-4">
              Registar Nota de Auditoria
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Tipo de Ação / Classificação
                </label>
                <select
                  value={formAction}
                  onChange={(e) => setFormAction(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-mono font-bold"
                >
                  <option value="NOTA_ADMINISTRATIVA">NOTA_ADMINISTRATIVA</option>
                  <option value="AUDITORIA_CONTRATUAL">AUDITORIA_CONTRATUAL</option>
                  <option value="VERIFICACAO_DOCUMENTOS">VERIFICACAO_DOCUMENTOS</option>
                  <option value="RECONCILIACAO_FINANCEIRA">RECONCILIACAO_FINANCEIRA</option>
                  <option value="INCIDENTE_SEGURANCA">INCIDENTE_SEGURANCA</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Entidade / Perfil Alvo
                </label>
                <input
                  type="text"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  placeholder="Ex: Prestador Mateus Nhaca / Cliente BCI"
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Descrição Detalhada do Evento *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Insira os pormenores da ocorrência para histórico permanente..."
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
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
                  Registar no Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
