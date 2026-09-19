import React, { useEffect, useState } from "react";
import { X, CreditCard, Save, Building2, Home, Sparkles, Info } from "lucide-react";
import { RegistrationPlanConfig } from "./types";
import {
  ACCOUNT_MAINTENANCE_FEE_MZN,
  ACCOUNT_TRIAL_DAYS,
  ACCOUNT_BILLING_NOTE,
  formatMzn
} from "./accountPlan";

/**
 * PAINEL ADMINISTRATIVO — MANUTENÇÃO DE CONTA.
 *
 * Substitui o antigo "Editar Planos de Registo". O ecossistema deixou de ter
 * planos e escalões: existe UM valor de manutenção de conta, igual para
 * Empresa e Condomínio, e a conta Particular/Lar é sempre gratuita. O
 * administrador só controla:
 *   • o VALOR mensal de manutenção;
 *   • as VANTAGENS (features) mostradas nos cartões e no passo 2 do registo.
 *
 * Os serviços contratados continuam a ser orçamentados e faturados à parte —
 * nada disso se configura aqui.
 */
interface TariraRegistrationPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAuditLog?: (action: string, details: string) => void;
}

export const TariraRegistrationPlansModal: React.FC<TariraRegistrationPlansModalProps> = ({
  isOpen,
  onClose,
  onTriggerAuditLog
}) => {
  const [plans, setPlans] = useState<RegistrationPlanConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/registration-plans");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.plans)) setPlans(data.plans);
      }
    } catch (err) {
      console.warn("[TariraRegistrationPlansModal] Falha ao carregar configuração de conta:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchPlans();
  }, [isOpen]);

  if (!isOpen) return null;

  const companyPlan = plans.find((p) => p.type === "company");
  const homePlan = plans.find((p) => p.type === "residential");
  const currentFee = companyPlan?.priceMzn ?? ACCOUNT_MAINTENANCE_FEE_MZN;

  /** O valor é sempre aplicado às DUAS contas pagas (Empresa e Condomínio). */
  const updateFee = (value: number) => {
    setPlans((prev) => prev.map((p) => (p.type === "residential" ? p : { ...p, priceMzn: value })));
  };

  const updateField = (
    type: RegistrationPlanConfig["type"],
    field: keyof RegistrationPlanConfig,
    value: any
  ) => {
    setPlans((prev) => prev.map((p) => (p.type === type ? { ...p, [field]: value } : p)));
  };

  /** As vantagens da conta paga são partilhadas por Empresa e Condomínio. */
  const updatePaidBenefits = (rawText: string) => {
    const list = rawText.split("\n");
    setPlans((prev) => prev.map((p) => (p.type === "residential" ? p : { ...p, features: list })));
  };

  const updateHomeBenefits = (rawText: string) => {
    const list = rawText.split("\n");
    setPlans((prev) => prev.map((p) => (p.type === "residential" ? { ...p, features: list } : p)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("tarira_session_token") || "";
      const res = await fetch("/api/registration-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ plans })
      });

      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result.plans)) setPlans(result.plans);
        showToast("✓ Valor de manutenção e vantagens actualizados para todos!");
        onTriggerAuditLog?.(
          "MANUTENCAO_CONTA_ATUALIZADA",
          `Administrador definiu a manutenção de conta em ${formatMzn(currentFee)}/mês para Empresa e Condomínio. Conta Particular/Lar permanece gratuita.`
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Erro ao salvar: ${errData.error || "Acesso não autorizado."}`);
      }
    } catch (err) {
      console.error("[TariraRegistrationPlansModal] Erro ao salvar:", err);
      showToast("Erro ao comunicar com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  const benefitsEditor = (label: string, value: string[], onChange: (raw: string) => void) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-slate-400 uppercase font-mono block">{label}</label>
        <span className="text-[10px] text-slate-400 font-mono">
          {(value || []).filter(Boolean).length} vantagens
        </span>
      </div>
      <textarea
        rows={9}
        value={(value || []).join("\n")}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Uma vantagem por linha"
        className="w-full bg-white border border-slate-200 text-slate-600 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-400 leading-relaxed"
      />
      <p className="text-[10px] text-slate-400">
        Uma vantagem por linha. Aparecem nos cartões públicos e no passo 2 da criação de conta.
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[110] p-4 rounded-2xl bg-[#172554] text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-blue-300">
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 rounded-3xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-5 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-700 border border-blue-500/30">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#172554]">
                Manutenção de Conta — Valor Único &amp; Vantagens
              </h2>
              <p className="text-xs text-slate-400">
                Um só valor para Empresa e Condomínio. Conta Particular/Lar sempre gratuita. As
                alterações ficam visíveis de imediato em todo o site.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {isLoading && (
            <div className="text-center py-10 text-xs text-slate-400">
              A carregar configuração actual do servidor...
            </div>
          )}

          {!isLoading && (
            <>
              {/* Nota do modelo de negócio */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#172554] block">Modelo de negócio</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{ACCOUNT_BILLING_NOTE}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Os primeiros {ACCOUNT_TRIAL_DAYS} dias são gratuitos. Pacotes especiais (volume,
                    SLA dedicado) são negociados caso a caso pela Direção Comercial e não se
                    configuram aqui.
                  </p>
                </div>
              </div>

              {/* 1. VALOR ÚNICO DE MANUTENÇÃO */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#172554] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>Valor Mensal de Manutenção (Empresa &amp; Condomínio)</span>
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block">
                    Valor em MZN — aplicado igualmente às duas contas
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={currentFee}
                      onChange={(e) => updateFee(Number(e.target.value))}
                      className="w-48 bg-white border border-slate-200 text-blue-700 font-mono font-bold text-2xl rounded-xl px-3 py-2.5 outline-none focus:border-blue-400"
                    />
                    <span className="text-sm font-mono text-slate-500">MZN /mês</span>
                    <span className="sm:ml-auto px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-bold">
                      {ACCOUNT_TRIAL_DAYS} dias grátis no arranque
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Não existem escalões: alterar este valor altera-o para Empresa e Condomínio ao
                    mesmo tempo. Actualmente: <strong>{formatMzn(currentFee)}/mês</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono block">
                      Nome apresentado ao cliente
                    </label>
                    <input
                      type="text"
                      value={companyPlan?.name || ""}
                      onChange={(e) => {
                        updateField("company", "name", e.target.value);
                        updateField("condo", "name", e.target.value);
                      }}
                      className="w-full bg-white border border-slate-200 text-[#172554] text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono block">
                      Descrição curta
                    </label>
                    <input
                      type="text"
                      value={companyPlan?.description || ""}
                      onChange={(e) => {
                        updateField("company", "description", e.target.value);
                        updateField("condo", "description", e.target.value);
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-500 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {benefitsEditor(
                  "Vantagens da Conta Empresa/Condomínio Activa",
                  companyPlan?.features || [],
                  updatePaidBenefits
                )}
              </div>

              {/* 2. CONTA PARTICULAR / LAR */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-[#172554] flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600" />
                    <span>Conta Particular / Lar</span>
                  </h3>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-bold">
                    Gratuita — 0 MZN
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  A conta de particular não tem valor de inscrição nem mensalidade, e esse valor não é
                  editável. O particular paga apenas os serviços que contratar.
                </p>

                {benefitsEditor(
                  "Vantagens da Conta Particular",
                  homePlan?.features || [],
                  updateHomeBenefits
                )}
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between gap-4 rounded-b-3xl">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Empresa e Condomínio: {formatMzn(currentFee)}/mês · Particular: gratuita
          </span>
          <button
            type="button"
            disabled={isSaving || isLoading}
            onClick={handleSave}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "A Gravar..." : "Gravar Manutenção de Conta"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
