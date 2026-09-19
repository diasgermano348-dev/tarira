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
  // ── CONTA PARTICULAR / LAR — SEM CUSTO (FUNDO BRANCO & TEXTO AZUL) ──
  if (role === 'lar') {
    return (
      <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-white border-2 border-blue-200 shadow-sm text-[#172554]">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-blue-100">
          <div className="flex items-center gap-2 text-blue-700">
            <Home className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#172554]">
              Conta Particular / Lar
            </span>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-blue-900 text-[10px] font-mono font-bold uppercase tracking-wider">
            Sem custo
          </span>
        </div>

        <div className="flex items-baseline gap-2 p-3.5 rounded-xl bg-slate-50 border border-blue-100">
          <span className="text-3xl font-bold text-[#172554] font-mono">0 MZN</span>
          <span className="text-xs text-slate-600 font-mono">
            inscrição e manutenção gratuitas
          </span>
        </div>

        <ul className="space-y-2">
          {homeBenefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-[#172554] font-medium leading-relaxed">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
          Só paga os serviços e intervenções que contratar, sempre com orçamento aprovado por si
          antes da execução.
        </p>
      </div>
    );
  }

  // ── CONTA EMPRESA / CONDOMÍNIO — MESMO VALOR DE MANUTENÇÃO (FUNDO BRANCO & TEXTO AZUL) ──
  if (role !== 'empresa' && role !== 'condominio') return null;

  const entityLabel = role === 'condominio' ? 'Condomínio' : 'Empresa';

  return (
    <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-white border-2 border-blue-200 shadow-sm text-[#172554]">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-blue-100">
        <div>
          <div className="flex items-center gap-2 text-blue-700">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#172554]">
              Manutenção da Conta {entityLabel}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Valor único de utilização da plataforma. Sem planos e sem escalões — Empresa e
            Condomínio pagam o mesmo.
          </p>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-mono font-bold uppercase tracking-wider">
          {ACCOUNT_TRIAL_DAYS} dias grátis
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-blue-200">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold block">
            Inscrição &amp; manutenção mensal da conta
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-3xl font-bold text-[#172554] font-mono">{formatMzn(maintenanceFee)}</span>
            <span className="text-xs text-slate-500 font-mono">/mês</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-800 font-bold block">
            Hoje paga
          </span>
          <span className="text-xl font-bold text-[#172554] font-mono">0 MZN</span>
        </div>
      </div>

      {/* Vantagens da conta activa */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#172554] block">
          O que ganha com a conta activa
        </span>
        <ul className="space-y-2">
          {accountBenefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-[#172554] font-medium leading-relaxed">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Momento do primeiro pagamento — Botão Começar Grátis (Cinza) e Activar Já Manutenção (Azul) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => onChangePaymentTiming('trial')}
          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
            paymentTiming === 'trial'
              ? 'bg-slate-200 border-slate-500 ring-2 ring-slate-400 text-slate-900 shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200/70 border-slate-300 text-slate-800'
          }`}
        >
          <span className="text-xs font-bold block text-slate-900">
            🎁 Começar Grátis ({ACCOUNT_TRIAL_DAYS} dias)
          </span>
          <span className="text-[11px] block mt-0.5 leading-snug text-slate-600">
            Cria a conta agora e só paga no fim do período gratuito.
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChangePaymentTiming('now')}
          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
            paymentTiming === 'now'
              ? 'bg-[#172554] border-blue-950 ring-2 ring-blue-400 text-white shadow-md'
              : 'bg-blue-800 hover:bg-[#172554] border-blue-900 text-white'
          }`}
        >
          <span className="text-xs font-bold block text-white">
            💳 Activar Já a Manutenção
          </span>
          <span className="text-[11px] block mt-0.5 leading-snug text-blue-100">
            Abrimos o pagamento manual (M-Pesa / e-Mola / Banco) logo após o registo.
          </span>
        </button>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
        {ACCOUNT_TRIAL_NOTE} {ACCOUNT_BILLING_NOTE} Para volumes elevados ou SLA dedicado, a Direção
        Comercial pode negociar um <strong className="text-[#172554] font-bold">pacote especial</strong>.
      </div>
    </div>
  );
};
