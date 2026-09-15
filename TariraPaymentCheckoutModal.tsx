import React, { useState, useEffect } from "react";
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Check, 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Building,
  Smartphone,
  FileText,
  Loader2,
  Gift,
  ArrowRight
} from "lucide-react";
import { Client, PaymentOrder, ManualPaymentSettings } from "./types";
import { uploadImageToImgBB } from "./imgbbUpload";
import { ACCOUNT_MAINTENANCE_FEE_MZN, ACCOUNT_TRIAL_DAYS, formatMzn } from "./accountPlan";

// Valores por omissão — usados apenas enquanto o GET a /api/payment-settings
// não responde. A fonte da verdade é sempre o servidor: qualquer número de
// M-Pesa/e-Mola ou dados bancários editados pelo Administrador no painel
// financeiro (TariraFinanceCrudManager) passam a refletir-se aqui automaticamente.
const FALLBACK_PAYMENT_SETTINGS: ManualPaymentSettings = {
  mpesa: { number: "+258 84 392 1084", holderName: "TARIRA ECOSSISTEMA LDA", instructions: "", active: true },
  emola: { number: "+258 86 551 2290", holderName: "TARIRA ECOSSISTEMA LDA", instructions: "", active: true },
  bankAccounts: [
    { id: "bank-bim", bankName: "Millennium BIM", accountNumber: "23456789", nib: "0001 0000 0023 4567 8901 2", holderName: "TARIRA ECOSSISTEMA LDA", active: true }
  ]
};

interface TariraPaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onPaymentSuccess: (newPayment: PaymentOrder) => void;
  currentLang?: "pt" | "en";
  // Permite pré-preencher o serviço/valor quando o modal é aberto
  // automaticamente logo após o registo (cliente escolheu "Pagar Já").
  initialServiceTitle?: string;
  initialAmount?: number;
  // Quando true, a conta está no período de teste grátis de 30 dias: o
  // modal aparece como próximo passo do registo, mas o pagamento NÃO é
  // obrigatório nesta fase — mostra-se um aviso e um botão para avançar
  // sem pagar. O cliente pode, ainda assim, optar por pagar já.
  isTrial?: boolean;
  onSkipTrial?: () => void;
}

export const TariraPaymentCheckoutModal: React.FC<TariraPaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  client,
  onPaymentSuccess,
  currentLang = "pt",
  initialServiceTitle,
  initialAmount,
  isTrial = false,
  onSkipTrial
}) => {
  // Modelo único de conta: já não há mensalidades por plano. Sobra a
  // manutenção de conta (valor igual para Empresa e Condomínio) e os serviços
  // contratados, que são sempre faturados à parte.
  const KNOWN_SERVICE_TITLES = [
    "Manutenção de Conta TARIRA — Empresa",
    "Manutenção de Conta TARIRA — Condomínio",
    "Taxa de Recrutamento / Colocação (Tarira Recruit)",
    "Intervenção Técnica / Manutenção Predial",
    "Adiantamento de Fatura Corporativa"
  ];
  const initialIsKnown = !!initialServiceTitle && KNOWN_SERVICE_TITLES.includes(initialServiceTitle);

  const [method, setMethod] = useState<"mpesa" | "emola" | "bank">("mpesa");
  const [serviceTitle, setServiceTitle] = useState<string>(
    initialServiceTitle ? (initialIsKnown ? initialServiceTitle : "outro") : "Manutenção de Conta TARIRA — Empresa"
  );
  const [customService, setCustomService] = useState<string>(initialServiceTitle && !initialIsKnown ? initialServiceTitle : "");
  const [amount, setAmount] = useState<number>(
    typeof initialAmount === "number" ? initialAmount : ACCOUNT_MAINTENANCE_FEE_MZN
  );
  const [reference, setReference] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [proofFileName, setProofFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Dados oficiais de pagamento (M-Pesa/e-Mola/Banco) — carregados do
  // servidor para refletirem sempre a última atualização feita pelo
  // Administrador no painel financeiro, em vez de valores fixos no código.
  const [paymentSettings, setPaymentSettings] = useState<ManualPaymentSettings>(FALLBACK_PAYMENT_SETTINGS);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/payment-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && data.mpesa && data.emola) {
          setPaymentSettings(data as ManualPaymentSettings);
        }
      })
      .catch((err) => console.warn("[TariraPaymentCheckoutModal] Falha ao carregar dados de pagamento:", err));
    return () => { isMounted = false; };
  }, []);

  const activeBankAccount = paymentSettings.bankAccounts.find((b) => b.active) || paymentSettings.bankAccounts[0];

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Comprovativos em imagem (JPG/PNG/etc.) são enviados para o ImgBB; apenas
  // PDFs (não são imagens) continuam a ser lidos como Base64 local.
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFileName(file.name);

    if (file.type.startsWith("image/")) {
      setIsUploadingProof(true);
      uploadImageToImgBB(file)
        .then((url) => setProofUrl(url))
        .catch(() => setErrorMsg("Não foi possível carregar o comprovativo. Por favor tente novamente."))
        .finally(() => setIsUploadingProof(false));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const finalTitle = serviceTitle === "outro" ? customService.trim() : serviceTitle;

    if (!finalTitle) {
      setErrorMsg("Por favor, especifique o serviço ou fatura de destino.");
      return;
    }
    if (!amount || amount <= 0) {
      setErrorMsg("O valor a pagar deve ser superior a zero.");
      return;
    }
    if (!reference.trim()) {
      setErrorMsg("Insira o código de referência da transação (ex: ID M-Pesa ou Talão Bancário).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: client.id,
        userName: client.name,
        userEmail: client.email || "",
        userPhone: client.phone || "",
        userType: client.type || "company",
        serviceTitle: finalTitle,
        amount: Number(amount),
        method,
        reference: reference.trim(),
        proofUrl: proofUrl || ""
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro ao registar pagamento" }));
        throw new Error(err.error || "Erro ao registar pagamento.");
      }

      // Success
      const newOrder: PaymentOrder = {
        id: `pay-${Date.now()}`,
        userId: client.id,
        userName: client.name,
        userEmail: client.email || "",
        userPhone: client.phone || "",
        userType: (client.type as any) || "company",
        serviceTitle: finalTitle,
        amount: Number(amount),
        method,
        reference: reference.trim(),
        proofUrl: proofUrl || "",
        status: "pending",
        createdAt: new Date().toISOString()
      };

      onPaymentSuccess(newOrder);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro ao submeter o pagamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 bg-slate-950/60 backdrop-blur-sm flex justify-center items-start sm:items-center animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-0" onClick={onClose} />

      <div 
        className="relative z-10 w-full max-w-2xl rounded-3xl bg-white border border-border shadow-2xl overflow-hidden my-2 sm:my-auto max-h-[96vh] flex flex-col text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative bar */}
        <div className="h-1.5 w-full bg-[#172554] shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-border flex items-start justify-between relative shrink-0">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider flex items-center gap-1 ${
                isTrial
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-blue-50 text-[#172554] border-blue-200"
              }`}>
                {isTrial ? <Gift className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                {isTrial ? "Assinatura Confirmada" : "Faturação Assistida"}
              </span>
              <span className="text-xs text-[#172554] font-semibold font-mono">
                • {client.name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
              {isTrial ? "A Sua Conta Está Pronta" : "Efetuar Novo Pagamento Manual"}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isTrial
                ? `Registo concluído! Reveja abaixo a manutenção da sua conta — os primeiros ${ACCOUNT_TRIAL_DAYS} dias são totalmente grátis, não é necessário pagar agora.`
                : "Registe o pagamento manual efetuado via M-Pesa, e-Mola ou Transferência Bancária para reconciliação e validação do financeiro TARIRA."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-border flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {isTrial && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-emerald-800">
                    🎁 Primeiros {ACCOUNT_TRIAL_DAYS} dias grátis — {initialServiceTitle || "a sua conta TARIRA"}
                  </p>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    A sua conta já está activa e pode começar a usar imediatamente. Durante este período não
                    é cobrado qualquer valor. Quando estiver pronto, pode confirmar o pagamento da manutenção da conta
                    ({typeof initialAmount === "number" ? formatMzn(initialAmount) : "valor de manutenção"})
                    abaixo, ou avançar agora sem pagar e tratar disso mais tarde no seu Painel. Os serviços que
                    contratar são sempre orçamentados e faturados à parte.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => (onSkipTrial ? onSkipTrial() : onClose())}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-md"
              >
                <span>Continuar Sem Pagar Agora (Grátis {ACCOUNT_TRIAL_DAYS} Dias)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[10px] text-emerald-600 text-center">
                Ou, se preferir activar já a manutenção da conta, preencha o formulário de pagamento abaixo.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Selecione o Canal de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod("mpesa")}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  method === "mpesa"
                    ? "bg-red-50 border-red-500 text-slate-900 shadow-sm ring-1 ring-red-500/30"
                    : "bg-[#F8FAFC] border-border text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  M
                </div>
                <span className="text-xs font-bold">M-Pesa</span>
                <span className="text-[10px] text-slate-500 font-mono">Vodacom</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("emola")}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  method === "emola"
                    ? "bg-blue-50 border-[#172554] text-[#172554] shadow-sm ring-1 ring-[#172554]/30"
                    : "bg-[#F8FAFC] border-border text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  e
                </div>
                <span className="text-xs font-bold">e-Mola</span>
                <span className="text-[10px] text-slate-500 font-mono">Movitel</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("bank")}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  method === "bank"
                    ? "bg-blue-50 border-[#172554] text-[#172554] shadow-sm ring-1 ring-[#172554]/30"
                    : "bg-[#F8FAFC] border-border text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Building className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Banco BIM</span>
                <span className="text-[10px] text-slate-500 font-mono">Transferência</span>
              </button>
            </div>
          </div>

          {/* Account Details Box for Selected Method */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-border space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-border pb-2">
              <span className="text-slate-600 font-medium">Dados Oficiais para Depósito / Envio:</span>
              <span className="text-[#172554] font-mono font-bold text-[10px] uppercase">
                Titular: {(method === "mpesa" ? paymentSettings.mpesa.holderName : method === "emola" ? paymentSettings.emola.holderName : activeBankAccount?.holderName) || "TARIRA ECOSSISTEMA LDA"}
              </span>
            </div>

            {method === "mpesa" && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-border">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-mono">NÚMERO M-PESA VODACOM:</span>
                    <span className="text-sm font-mono font-bold text-slate-900">{paymentSettings.mpesa.number}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentSettings.mpesa.number.replace(/\s+/g, ""), "mpesa")}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172554] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedField === "mpesa" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "mpesa" ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {paymentSettings.mpesa.instructions || "Envie o valor exato via menu M-Pesa (*150#) ou App M-Pesa. Copie a mensagem de confirmação ou o código de transação recebido por SMS."}
                </p>
              </div>
            )}

            {method === "emola" && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-border">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-mono">NÚMERO E-MOLA MOVITEL:</span>
                    <span className="text-sm font-mono font-bold text-slate-900">{paymentSettings.emola.number}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentSettings.emola.number.replace(/\s+/g, ""), "emola")}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172554] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedField === "emola" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "emola" ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {paymentSettings.emola.instructions || "Envie o valor exato via menu e-Mola (*898#) ou App e-Mola. Guarde o ID de transação para preencher abaixo."}
                </p>
              </div>
            )}

            {method === "bank" && activeBankAccount && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-border">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-mono">BANCO {activeBankAccount.bankName.toUpperCase()} (NIB):</span>
                    <span className="text-sm font-mono font-bold text-slate-900">{activeBankAccount.nib}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeBankAccount.nib.replace(/\s+/g, ""), "nib")}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172554] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedField === "nib" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "nib" ? "Copiado!" : "Copiar NIB"}</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center justify-between font-mono">
                  <span>Conta Corrente {activeBankAccount.bankName}: {activeBankAccount.accountNumber}</span>
                  <span>Moeda: Metical (MZN)</span>
                </div>
              </div>
            )}
          </div>

          {/* Service Title / Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Finalidade / Serviço do Pagamento
            </label>
            <select
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-border rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#172554] focus:outline-none cursor-pointer"
            >
              <option value="Manutenção de Conta TARIRA — Empresa">
                Manutenção de Conta TARIRA — Empresa ({formatMzn(ACCOUNT_MAINTENANCE_FEE_MZN)}/mês)
              </option>
              <option value="Manutenção de Conta TARIRA — Condomínio">
                Manutenção de Conta TARIRA — Condomínio ({formatMzn(ACCOUNT_MAINTENANCE_FEE_MZN)}/mês)
              </option>
              <option value="Taxa de Recrutamento / Colocação (Tarira Recruit)">Taxa de Recrutamento / Colocação (Tarira Recruit)</option>
              <option value="Intervenção Técnica / Manutenção Predial">Intervenção Técnica / Manutenção Predial (Tarira Connect)</option>
              <option value="Adiantamento de Fatura Corporativa">Adiantamento de Fatura Corporativa</option>
              <option value="outro">Outro Serviço (especificar)...</option>
            </select>

            {serviceTitle === "outro" && (
              <input
                type="text"
                placeholder="Descreva o serviço ou número da fatura..."
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                className="w-full mt-2 bg-[#F8FAFC] border border-border rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#172554] focus:outline-none"
              />
            )}
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Valor Pago (Meticais - MZN)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[4500, 6500, 8500, 9500, 13500, 19500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    amount === preset
                      ? "bg-[#172554] text-white border-[#172554] shadow-xs"
                      : "bg-[#F8FAFC] text-slate-700 border-border hover:border-slate-300"
                  }`}
                >
                  {preset.toLocaleString()} MT
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                min={1}
                step={100}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Introduza o valor em Meticais..."
                required
                className="w-full bg-[#F8FAFC] border border-border rounded-xl pl-4 pr-16 py-2.5 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-[#172554] focus:outline-none"
              />
              <span className="absolute right-4 top-2.5 text-xs font-mono font-bold text-slate-500">
                MZN
              </span>
            </div>
          </div>

          {/* Transaction Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Código de Referência / ID da Transação <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: MP260809.1420.A09871 ou Ref. Talão BIM 902148"
              className="w-full bg-[#F8FAFC] border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#172554] focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Insira o código exato recebido por SMS ou impresso no talão de depósito para verificação imediata.
            </span>
          </div>

          {/* Upload receipt / proof */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              5. Comprovativo de Pagamento (Opcional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-[#172554] rounded-xl p-3 text-center cursor-pointer transition-all bg-[#F8FAFC]">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-700">
                  {isUploadingProof ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#172554] animate-spin" />
                      <span>A carregar comprovativo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#172554]" />
                      <span>{proofFileName ? proofFileName : "Carregar Talão / Screenshot (PDF ou Foto)"}</span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Security Guarantee Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Após o envio, a nossa equipa financeira valida o crédito no prazo de <strong>1 a 4 horas úteis</strong> e a fatura correspondente é homologada com recibo oficial com quitação no seu painel.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingProof}
              className="px-6 py-2.5 rounded-xl bg-[#172554] hover:bg-[#172554] disabled:bg-slate-300 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A Processar...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Submeter Pagamento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
