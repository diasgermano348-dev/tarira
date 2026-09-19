import React from "react";
import { CheckCircle2, Printer, Download, Star, ShieldCheck, ArrowRight, Share2, FileText } from "lucide-react";

export interface TariraReceiptData {
  receiptId: string;
  authCode: string;
  timestamp: string;
  clientName: string;
  clientNuit?: string;
  clientContact?: string;
  candidateName: string;
  candidateCategory: string;
  serviceTitle: string;
  targetDate: string;
  location: string;
  billingPeriod: string;
  hours: number;
  ratePerHour: number;
  totalAmount: number;
  paidAmount: number;
  paymentModality: string;
  paymentChannel: string;
  cardLast4?: string;
  hireId: string;
}

interface TariraServiceReceiptModalProps {
  receipt: TariraReceiptData;
  onClose: () => void;
  onOpenEvaluation: (hireId: string) => void;
}

export function TariraServiceReceiptModal({
  receipt,
  onClose,
  onOpenEvaluation
}: TariraServiceReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const getChannelLabel = (ch: string) => {
    switch (ch) {
      case "card":
        return `Cartão de Débito Bancário 🇲🇿 ${receipt.cardLast4 ? `(Final •••• ${receipt.cardLast4})` : ""}`;
      case "mpesa":
        return "Vodacom M-Pesa 🇲🇿";
      case "emola":
        return "Movitel e-Mola 🇲🇿";
      case "izi":
        return "IZI / M-Kesh 🇲🇿";
      case "bank":
        return "Transferência Bancária (Standard / BIM) 🇲🇿";
      default:
        return ch.toUpperCase();
    }
  };

  return (
    <div id="receipt-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start sm:items-center">
      <div 
        className="fixed inset-0 bg-black/40 z-0 cursor-pointer"
        onClick={onClose}
      ></div>

      <div className="relative z-10 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-border bg-white shadow-2xl my-auto text-slate-900 space-y-5 animate-fade-up">
        
        {/* SUCCESS BADGE & TITLE */}
        <div className="text-center space-y-2 border-b border-border pb-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] tracking-widest text-emerald-700 font-bold uppercase block">
            PAGAMENTO CONFIRMADO & DESPACHO REGISTADO
          </span>
          <h3 className="font-serif text-2xl text-slate-900 font-bold">
            Recibo Oficial de Serviço TARIRA
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            Nº de Documento: <strong className="text-[#172554] font-bold">{receipt.receiptId}</strong> • Cód. Autenticação: {receipt.authCode}
          </p>
        </div>

        {/* PRINTABLE RECEIPT CARD */}
        <div id="printable-receipt-card" className="bg-[#F8FAFC] p-5 rounded-2xl border border-border space-y-4 text-xs font-sans">
          
          {/* HEADER ROW */}
          <div className="flex justify-between items-start border-b border-border pb-3">
            <div>
              <h4 className="font-serif font-black text-base text-[#172554]">TARIRA SERVIÇOS & TECNOLOGIA, LDA</h4>
              <p className="text-[10px] text-slate-500">NUIT: 401.992.834 • Maputo, Moçambique</p>
              <p className="text-[10px] text-slate-500">Central: (+258) 84 000 0000 • tarira.ecossistema@gmail.com</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                ✓ LIQUIDADO COM SUCESSO
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">{receipt.timestamp}</p>
            </div>
          </div>

          {/* CLIENT & PROVIDER INFO */}
          <div className="grid grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border border-border">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Cliente / Requisitante</span>
              <p className="font-bold text-slate-900 text-xs">{receipt.clientName}</p>
              {receipt.clientContact && <p className="text-[10px] text-slate-500 font-mono">{receipt.clientContact}</p>}
              <p className="text-[10px] text-slate-500 mt-1 truncate">📍 {receipt.location}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Prestador Atribuído</span>
              <p className="font-bold text-[#172554] text-xs">{receipt.candidateName}</p>
              <p className="text-[10px] text-slate-600">{receipt.serviceTitle}</p>
              <p className="text-[10px] text-emerald-700 mt-1 font-mono">📅 Agendado para: {receipt.targetDate}</p>
            </div>
          </div>

          {/* FINANCIAL BREAKDOWN TABLE */}
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Serviço / Atendimento ({receipt.hours}h de trabalho):</span>
              <span className="font-mono text-slate-900 font-medium">{receipt.totalAmount.toLocaleString()} MZN</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Modalidade ({receipt.paymentModality === "half" ? "50% Adiantamento Inicial" : "100% Pagamento Pleno"}):</span>
              <span className="font-mono font-bold text-[#172554]">{receipt.paidAmount.toLocaleString()} MZN</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Forma de Pagamento:</span>
              <span className="font-medium text-slate-800">{getChannelLabel(receipt.paymentChannel)}</span>
            </div>
            
            <div className="flex justify-between items-center border-t border-border pt-2 text-sm font-bold text-slate-900">
              <span className="text-[#172554]">Total Liquidado Agora:</span>
              <span className="font-mono text-base text-emerald-600 font-black">{receipt.paidAmount.toLocaleString()} MZN</span>
            </div>
          </div>

          {/* ESCROW & SECURITY BADGE */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-[10px] text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Garantia de Satisfação TARIRA:</strong> O valor fica protegido sob custódia e o prestador só recebe a totalidade após a sua validação e avaliação de qualidade.
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-border text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#172554]" />
              <span>Imprimir Recibo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenEvaluation(receipt.hireId);
              }}
              className="py-2.5 px-4 rounded-xl bg-[#172554] hover:bg-[#172554] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <Star className="w-4 h-4 fill-white text-white" />
              <span>Avaliar Serviço</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-border text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer"
          >
            Fechar & Aceder ao Painel do Cliente
          </button>
        </div>

      </div>
    </div>
  );
}
