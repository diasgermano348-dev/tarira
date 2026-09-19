import React, { useState, useMemo } from 'react';
import { Wallet, ArrowDownToLine, Landmark, Clock, CheckCircle2, XCircle, MessageCircle, Zap, CalendarClock, Info } from 'lucide-react';
import { Candidate, Hire } from './types';

interface TariraProviderWalletPanelProps {
  candidate: Candidate;
  hires: Hire[];
  payoutRequests: Array<{
    id: string;
    candidateId: string;
    amount: number;
    status: 'pending' | 'paid' | 'rejected';
    adminNotes?: string;
    createdAt: string;
  }>;
  onRequestWithdraw: (amount: number) => Promise<{ success: boolean; error?: string }>;
  onRequestHirePayout: (hireId: string) => Promise<{ success: boolean; error?: string }>;
  onContactCentral: () => void;
}

// Aproxima o valor "diário" de um pedido a partir da tarifa/hora (mesma fórmula usada no servidor)
const estimateHireValueMzn = (h: Hire): number => {
  if (h.totalAmount) return h.totalAmount;
  if (h.price) return h.price;
  if (h.rate) return h.rate * 950;
  return 0;
};

// Um pedido é considerado "de longa duração" (pago só no fim do mês) quando tem um
// contrato com duração em meses/indeterminado, ou um período de faturação não-diário.
const isLongTermHire = (h: Hire): boolean => {
  if (h.contractType === 'indeterminado') return true;
  if ((h.contractDurationMonths || 0) >= 1) return true;
  if (h.billingPeriod && h.billingPeriod !== 'daily') return true;
  return false;
};

export const TariraProviderWalletPanel: React.FC<TariraProviderWalletPanelProps> = ({
  candidate,
  hires,
  payoutRequests,
  onRequestWithdraw,
  onRequestHirePayout,
  onContactCentral
}) => {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [payoutBusyId, setPayoutBusyId] = useState<string | null>(null);

  const myHires = useMemo(() => hires.filter(h => h.candidateId === candidate.id), [hires, candidate.id]);
  const completedHires = useMemo(() => myHires.filter(h => h.status === 'completed'), [myHires]);
  const activeHires = useMemo(() => myHires.filter(h => h.status && !['completed', 'cancelled', 'rejected'].includes(h.status)), [myHires]);

  const dailyEarnings = useMemo(
    () => completedHires.filter(h => !isLongTermHire(h)).reduce((acc, h) => acc + estimateHireValueMzn(h), 0),
    [completedHires]
  );
  const longTermEarnings = useMemo(
    () => completedHires.filter(h => isLongTermHire(h)).reduce((acc, h) => acc + estimateHireValueMzn(h), 0),
    [completedHires]
  );

  const withdrawnAmount = candidate.withdrawnAmount || 0;
  const myPendingRequests = useMemo(
    () => payoutRequests.filter(p => p.candidateId === candidate.id && p.status === 'pending').reduce((acc, p) => acc + p.amount, 0),
    [payoutRequests, candidate.id]
  );
  const myPayoutHistory = useMemo(
    () => payoutRequests.filter(p => p.candidateId === candidate.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [payoutRequests, candidate.id]
  );

  const totalAvailable = Math.max(0, dailyEarnings + longTermEarnings - withdrawnAmount - myPendingRequests);
  const today = new Date();
  const isMonthEnd = today.getDate() >= 25;
  // Valor que pode ser pedido AGORA: diárias sempre disponíveis assim que o cliente paga;
  // serviços de longa duração só entram no valor pedível na última semana do mês.
  const requestableNow = Math.max(0, Math.min(totalAvailable, dailyEarnings - withdrawnAmount - myPendingRequests) + (isMonthEnd ? longTermEarnings : 0));
  const requestableNowClamped = Math.max(0, Math.min(totalAvailable, requestableNow));

  const handleSubmitWithdraw = async () => {
    setFeedback(null);
    if (!withdrawAmount || withdrawAmount <= 0) {
      setFeedback({ type: 'error', text: 'Introduza um valor válido para o saque.' });
      return;
    }
    if (withdrawAmount > requestableNowClamped) {
      setFeedback({ type: 'error', text: `Só pode solicitar até ${requestableNowClamped.toLocaleString()} MZN neste momento.` });
      return;
    }
    setSubmitting(true);
    const result = await onRequestWithdraw(withdrawAmount);
    setSubmitting(false);
    if (result.success) {
      setFeedback({ type: 'success', text: 'Pedido de saque enviado! A Central irá confirmar a transferência em breve.' });
      setShowWithdrawForm(false);
      setWithdrawAmount(0);
    } else {
      setFeedback({ type: 'error', text: result.error || 'Não foi possível enviar o pedido.' });
    }
  };

  const handleHirePayout = async (hireId: string) => {
    setPayoutBusyId(hireId);
    await onRequestHirePayout(hireId);
    setPayoutBusyId(null);
  };

  // ══════════════════════════════════════════════════════════════
  // PROFISSIONAIS (TALENTOS E QUADROS) — modelo salarial mensal,
  // sem opção de saque: o pagamento é feito diretamente na conta
  // bancária no final do mês.
  // ══════════════════════════════════════════════════════════════
  if (candidate.isProfessional) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 mb-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-50 text-[#172554] border border-blue-200">
            <Landmark className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Remuneração</h3>
            <p className="text-sm font-serif font-bold text-[#172554]">Modelo Salarial Mensal</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Como Profissional/Quadro contratado via TARIRA Recruit, o seu salário é processado mensalmente e pago
          diretamente na sua conta bancária no final de cada mês — não é necessário solicitar saques através da plataforma.
        </p>
        {candidate.expectedSalaryMin && (
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Faixa Salarial Acordada</span>
            <span className="font-mono text-[#172554] font-bold text-sm">
              {candidate.expectedSalaryMin.toLocaleString()} – {(candidate.expectedSalaryMax || candidate.expectedSalaryMin).toLocaleString()} MZN
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onContactCentral}
          className="w-full py-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Falar com a Central</span>
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // PRESTADORES DE OFÍCIO (TARIRA CONNECT) — carteira com saque
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 mb-6 space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-50 text-[#172554] border border-blue-200">
            <Wallet className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Carteira TARIRA</h3>
            <p className="text-sm font-serif font-bold text-[#172554]">Os Meus Ganhos & Saques</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onContactCentral}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-[#172554] hover:bg-slate-50 text-[11px] font-bold cursor-pointer flex items-center gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Falar com a Central</span>
        </button>
      </div>

      {/* Resumo do saldo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-center">
          <span className="text-lg font-serif font-bold text-emerald-700 block">{requestableNowClamped.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 uppercase font-mono">MZN Disponível Agora</span>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-center">
          <span className="text-lg font-serif font-bold text-amber-700 block">{Math.max(0, totalAvailable - requestableNowClamped).toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 uppercase font-mono">A Aguardar Fim do Mês</span>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-center col-span-2 sm:col-span-1">
          <span className="text-lg font-serif font-bold text-[#172554] block">{withdrawnAmount.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 uppercase font-mono">Já Levantado</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2 text-[11px] text-[#172554] leading-relaxed">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Serviços diários ficam disponíveis para saque assim que o cliente confirma o pagamento. Serviços de longa
          duração (contratos por meses) só liberam o saque na última semana do mês{isMonthEnd ? " — já disponível esta semana!" : "."}
        </span>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {!showWithdrawForm ? (
        <button
          type="button"
          disabled={requestableNowClamped <= 0}
          onClick={() => { setShowWithdrawForm(true); setWithdrawAmount(requestableNowClamped); setFeedback(null); }}
          className="w-full py-3 rounded-xl bg-[#172554] hover:bg-[#1A3478] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Solicitar Saque</span>
        </button>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="text-[10px] uppercase font-bold text-[#172554] font-mono block">Valor a Levantar (MZN)</label>
          <input
            type="number"
            min={1}
            max={requestableNowClamped}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-[#172554] font-mono font-bold outline-none focus:border-[#172554]"
          />
          <p className="text-[10px] text-slate-400">Máximo disponível agora: {requestableNowClamped.toLocaleString()} MZN</p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowWithdrawForm(false)}
              className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitWithdraw}
              className="flex-1 py-2.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] disabled:opacity-60 text-white text-xs font-bold cursor-pointer transition-all"
            >
              {submitting ? 'A enviar...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      )}

      {/* Serviços em curso — adiantamento por serviço individual */}
      {activeHires.length > 0 && (
        <div className="pt-4 border-t border-slate-200 space-y-2.5">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Serviços em Curso — Interação com a Central
          </h4>
          {activeHires.map((h) => (
            <div key={h.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs font-semibold text-[#172554]">{h.serviceName}</p>
                <p className="text-[10px] text-slate-500">{h.clientName} · {h.status || 'registado'}</p>
              </div>
              {!h.payoutRequested && !isLongTermHire(h) && (
                <button
                  type="button"
                  disabled={payoutBusyId === h.id}
                  onClick={() => handleHirePayout(h.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#172554] text-[10px] font-bold cursor-pointer disabled:opacity-50"
                >
                  {payoutBusyId === h.id ? 'A enviar...' : '⚡ Pedir Adiantamento'}
                </button>
              )}
              {h.payoutRequested && (
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Adiantamento Solicitado
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Histórico de pedidos de saque */}
      {myPayoutHistory.length > 0 && (
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5" /> Histórico de Pedidos de Saque
          </h4>
          {myPayoutHistory.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
              <span className="text-slate-500 font-mono">{new Date(p.createdAt).toLocaleDateString('pt-PT')}</span>
              <span className="font-mono font-bold text-[#172554]">{p.amount.toLocaleString()} MZN</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                p.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                p.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {p.status === 'paid' ? 'Pago' : p.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
