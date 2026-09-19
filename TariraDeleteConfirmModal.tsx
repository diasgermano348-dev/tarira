import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert, CheckCircle2, User, Clock } from 'lucide-react';

export interface TariraDeleteConfirmModalProps {
  isOpen: boolean;
  entityType?: 'prestador' | 'profissional' | 'candidatura_espontanea' | 'categoria' | 'pedido' | 'empresa_parceira' | 'loja_parceira' | 'banner' | 'cliente' | 'operador' | 'proposta' | string;
  entityId?: string;
  entityName?: string;
  title?: string;
  description?: string;
  operatorName?: string;
  operatorEmail?: string;
  operatorRole?: string;
  onClose: () => void;
  onConfirm: (data: {
    entityId: string;
    entityName: string;
    entityType: string;
    reason: string;
    operatorName: string;
    operatorEmail: string;
    operatorRole: string;
  }) => Promise<void> | void;
}

export const TariraDeleteConfirmModal: React.FC<TariraDeleteConfirmModalProps> = ({
  isOpen,
  entityType = 'prestador',
  entityId = '',
  entityName = '',
  title,
  description,
  operatorName = 'Administrador Geral',
  operatorEmail = 'tarira.ecossistema@gmail.com',
  operatorRole = 'admin',
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const getEntityTypeLabel = () => {
    switch (entityType) {
      case 'prestador': return 'Prestador de Ofício';
      case 'profissional': return 'Profissional Especialista';
      case 'candidatura_espontanea': return 'Candidatura Espontânea';
      case 'categoria': return 'Categoria de Serviço';
      case 'pedido': return 'Pedido de Cliente / Ordem';
      case 'empresa_parceira': return 'Empresa Parceira / Rede';
      case 'loja_parceira': return 'Loja Parceira Connect';
      case 'banner': return 'Banner / Anúncio';
      case 'cliente': return 'Cliente Registado';
      case 'operador': return 'Operador do Sistema';
      case 'proposta': return 'Proposta Comercial / Concurso';
      default: return 'Registo do Ecossistema';
    }
  };

  const entityTypeLabel = getEntityTypeLabel();

  // Motivos pré-definidos, adaptados ao tipo de registo — evita ter de escrever/colar sempre o mesmo texto
  const getPresetReasons = (): string[] => {
    switch (entityType) {
      case 'prestador':
        return [
          'Perfil duplicado no sistema',
          'Documentação inválida ou expirada',
          'Solicitação do próprio prestador',
          'Inatividade prolongada (+6 meses)',
          'Violação das políticas da plataforma',
          'Registo de teste / dados incorretos'
        ];
      case 'profissional':
        return [
          'Perfil duplicado no sistema',
          'Candidato solicitou remoção',
          'Dados desatualizados / candidato inativo',
          'Documentação inválida ou fraudulenta',
          'Violação das políticas da plataforma',
          'Registo de teste / spam'
        ];
      case 'candidatura_espontanea':
        return [
          'Candidatura duplicada',
          'Candidato já contratado noutro processo',
          'Solicitação do próprio candidato',
          'Dados incompletos ou inválidos',
          'Candidatura de teste / spam'
        ];
      case 'pedido':
        return [
          'Cliente desistiu do serviço',
          'Pagamento não confirmado',
          'Pedido duplicado',
          'Erro no registo do pedido',
          'Profissional/técnico indisponível',
          'Suspeita de fraude'
        ];
      case 'empresa_parceira':
      case 'cliente':
        return [
          'Empresa/cliente inativo há mais de 6 meses',
          'Registo duplicado',
          'Solicitação do próprio cliente',
          'Dados incorretos ou fraudulentos',
          'Encerramento de atividade',
          'Violação dos termos de uso'
        ];
      case 'loja_parceira':
        return [
          'Loja inativa / encerrada',
          'Registo duplicado',
          'Solicitação do parceiro',
          'Violação dos termos de parceria'
        ];
      case 'banner':
        return [
          'Campanha terminada',
          'Conteúdo desatualizado',
          'Substituído por novo banner',
          'Erro de configuração'
        ];
      case 'operador':
        return [
          'Fim de vínculo com a TARIRA',
          'Solicitação do próprio operador',
          'Violação das políticas internas',
          'Conta duplicada / criada por engano'
        ];
      case 'proposta':
        return [
          'Proposta recusada pelo cliente',
          'Prazo de validade expirado',
          'Substituída por nova proposta',
          'Erro de registo'
        ];
      case 'categoria':
        return [
          'Categoria duplicada',
          'Categoria descontinuada',
          'Substituída por nova categoria',
          'Erro de configuração'
        ];
      default:
        return [
          'Registo duplicado',
          'Solicitação do utilizador',
          'Dados incorretos',
          'Item de teste',
          'Já não é necessário'
        ];
    }
  };

  const presetReasons = getPresetReasons();

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    setDeleting(true);
    try {
      await onConfirm({
        entityId,
        entityName,
        entityType,
        reason: reason.trim(),
        operatorName,
        operatorEmail,
        operatorRole
      });
      onClose();
    } catch (err: any) {
      console.error('Erro ao eliminar:', err);
      setErrorMsg(err.message || 'Erro ao eliminar registo.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 py-4 sm:py-8 flex justify-center items-start sm:items-center animate-fade-in">
      <div className="rounded-3xl p-5 sm:p-8 max-w-lg w-full border border-border bg-white shadow-2xl relative my-2 sm:my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 border border-border text-slate-500 hover:text-slate-900 font-black transition-all flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>

        {/* Header with warning icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 text-xl">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest text-rose-600 font-mono font-bold uppercase block">
              REGISTO DE AUDITORIA & SEGURANÇA
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-slate-900 font-bold">
              Eliminar {entityTypeLabel}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Tem a certeza que deseja eliminar o registo de <strong className="text-rose-600">{entityName}</strong> {entityId ? <span>(ID: <code className="text-[#172554] font-mono font-bold">{entityId}</code>)</span> : null}?
        </p>

        {/* Audit notice banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-border space-y-2 mb-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Responsável pela Eliminação:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#172554]" />
              {operatorName} ({operatorRole})
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border">
            <span className="text-slate-500 font-medium">Registo no Log de Auditoria:</span>
            <span className="font-mono text-emerald-600 font-bold">✓ Audit Trail Activo</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleConfirmDelete} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-wider text-slate-700 uppercase block font-bold mb-1">
              Motivo da Eliminação *
            </label>

            {/* Motivos rápidos — clique para preencher o campo, sem ter de escrever ou colar */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presetReasons.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                    reason === preset
                      ? "bg-rose-600 border-rose-600 text-white"
                      : "bg-slate-50 border-border text-slate-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-border text-slate-900 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-rose-500 transition-all"
              placeholder="Escolha um motivo acima ou descreva aqui..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white border border-border text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={deleting}
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <span>A eliminar...</span>
              ) : (
                <span>🗑️ Confirmar Eliminação</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
