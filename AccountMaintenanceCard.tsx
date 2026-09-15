import React from 'react';
import { Sparkles, Check, Home } from 'lucide-react';
import {
  ACCOUNT_TRIAL_DAYS,
  ACCOUNT_BILLING_NOTE,
  ACCOUNT_TRIAL_NOTE,
  formatMzn
} from './accountPlan';

/**
 * CARTÃO DO PASSO 2 DA CRIAÇÃO DE CONTA — MANUTENÇÃO DE CONTA.
 *
 * Substitui a antiga grelha de planos nas duas unidades de negócio
 * (Recruit e Connect). Regras aplicadas:
 *   • Empresa e Condomínio pagam EXACTAMENTE o mesmo valor de manutenção.
 *   • Primeiros ACCOUNT_TRIAL_DAYS dias gratuitos — hoje o cliente paga 0 MZN.
 *   • Conta Particular / Lar é gratuita (sem inscrição e sem mensalidade).
 *   • Os serviços contratados são orçamentados e faturados sempre à parte.
 *
 * É propositadamente apresentado no SEGUNDO passo do registo, junto dos dados
 * da conta, para que o valor seja conhecido antes de concluir a inscrição.
 */
export interface AccountMaintenanceCardProps {
  role: 'empresa' | 'condominio' | 'lar' | 'prestador' | 'profissional' | 'admin' | string;
  /** Valor mensal de manutenção (Empresa/Condomínio), vindo de /api/registration-plans. */
  maintenanceFee: number;
  /** Vantagens da conta paga activa. */
  accountBenefits: string[];
  /** Vantagens da conta particular/lar gratuita. */
  homeBenefits: string[];
  paymentTiming: 'trial' | 'now';
  onChangePaymentTiming: (timing: 'trial' | 'now') => void;
}

export const AccountMaintenanceCard: React.FC<AccountMaintenanceCardProps> = ({
  role,
  maintenanceFee,
  accountBenefits,
  homeBenefits,
  paymentTiming,
  onChangePaymentTiming
}) => {
  // ── CONTA PARTICULAR / LAR — SEM CUSTO ──
  if (role === 'lar') {
    return (
      <div className="space-y-3 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-200">
            <Home className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider">
              Conta Particular / Lar
            </span>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[9px] font-mono font-bold uppercase tracking-wider">
            Sem custo
          </span>
        </div>

        <div className="flex items-baseline gap-2 p-3 rounded-xl bg-slate-950 border border-emerald-500/20">
          <span className="text-2xl font-bold text-emerald-300 font-mono">0 MZN</span>
          <span className="text-[11px] text-slate-400 font-mono">
            inscrição e manutenção gratuitas
          </span>
        </div>

        <ul className="space-y-1.5">
          {homeBenefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 leading-snug">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          Só paga os serviços e intervenções que contratar, sempre com orçamento aprovado por si
          antes da execução.
        </p>
      </div>
    );
  }

  // ── CONTA EMPRESA / CONDOMÍNIO — MESMO VALOR DE MANUTENÇÃO ──
  if (role !== 'empresa' && role !== 'condominio') return null;

  const entityLabel = role === 'condominio' ? 'Condomínio' : 'Empresa';

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-blue-950/25 border border-blue-500/40">
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-blue-500/20">
        <div>
          <div className="flex items-center gap-2 text-blue-200">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider">
              Manutenção da Conta {entityLabel}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Valor único de utilização da plataforma. Sem planos e sem escalões — Empresa e
            Condomínio pagam o mesmo.
          </p>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[9px] font-mono font-bold uppercase tracking-wider">
          {ACCOUNT_TRIAL_DAYS} dias grátis
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-blue-500/25">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
            Inscrição &amp; manutenção mensal da conta
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-white font-mono">{formatMzn(maintenanceFee)}</span>
            <span className="text-[11px] text-slate-400 font-mono">/mês</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 block">
            Hoje paga
          </span>
          <span className="text-lg font-bold text-emerald-300 font-mono">0 MZN</span>
        </div>
      </div>

      {/* Vantagens da conta activa (antes: funcionalidades do plano) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300 block">
          O que ganha com a conta activa
        </span>
        <ul className="space-y-1.5">
          {accountBenefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 leading-snug">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Momento do primeiro pagamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => onChangePaymentTiming('trial')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            paymentTiming === 'trial'
              ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400 text-emerald-200'
              : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <span className="text-[10px] font-bold block">🎁 Começar Grátis ({ACCOUNT_TRIAL_DAYS} dias)</span>
          <span className="text-[9px] text-slate-400 block mt-0.5 leading-snug">
            Cria a conta agora e só paga no fim do período gratuito.
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChangePaymentTiming('now')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            paymentTiming === 'now'
              ? 'bg-blue-500/15 border-blue-400 ring-1 ring-blue-400 text-blue-200'
              : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <span className="text-[10px] font-bold block">💳 Activar Já a Manutenção</span>
          <span className="text-[9px] text-slate-400 block mt-0.5 leading-snug">
            Abrimos o pagamento manual (M-Pesa / e-Mola / Banco) logo após o registo.
          </span>
        </button>
      </div>

      <p className="text-[10px] text-slate-400 leading-relaxed">
        {ACCOUNT_TRIAL_NOTE} {ACCOUNT_BILLING_NOTE} Para volumes elevados ou SLA dedicado, a Direção
        Comercial pode negociar um <strong className="text-slate-300">pacote especial</strong>.
      </p>
    </div>
  );
};
