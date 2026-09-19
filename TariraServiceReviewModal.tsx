import React, { useState } from "react";
import { Star, ShieldCheck, CheckCircle2, MessageSquare, ThumbsUp, Sparkles, X } from "lucide-react";
import { getAuthHeaders } from "./authClient";

interface TariraServiceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hireId: string;
  candidateName: string;
  serviceTitle: string;
  onSuccess?: () => void;
}

export function TariraServiceReviewModal({
  isOpen,
  onClose,
  hireId,
  candidateName,
  serviceTitle,
  onSuccess
}: TariraServiceReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [quality, setQuality] = useState<number>(5);
  const [punctuality, setPunctuality] = useState<number>(5);
  const [cleanliness, setCleanliness] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/hires/${hireId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          rating,
          quality,
          punctuality,
          cleanliness,
          text: comment || "Serviço executado com excelência e profissionalismo."
        })
      });

      if (res.ok) {
        setIsDone(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setIsDone(false);
          onClose();
        }, 2000);
      } else {
        alert("Não foi possível registar a avaliação no servidor.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao submeter avaliação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="service-review-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start sm:items-center">
      <div className="fixed inset-0 bg-black/40 z-0 cursor-pointer" onClick={onClose}></div>

      <div className="relative z-10 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-border bg-white shadow-2xl my-auto text-slate-900 space-y-5 animate-fade-up">
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-border pb-3">
          <div>
            <span className="text-[9px] tracking-widest text-[#172554] font-bold uppercase block mb-0.5">
              EXPERIÊNCIA & CONTROLO DE QUALIDADE TARIRA
            </span>
            <h3 className="font-serif text-2xl text-slate-900 font-bold">
              Avaliar Prestador de Serviço
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              <span className="text-[#172554] font-bold">{candidateName}</span> • {serviceTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-up">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-serif text-xl font-bold text-slate-900">Avaliação Registada com Sucesso!</h4>
            <p className="text-xs text-slate-600">
              A pontuação foi atribuída ao perfil de {candidateName} e o serviço foi marcado como concluído.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OVERALL STAR RATING */}
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-border text-center space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                Classificação Geral do Serviço
              </label>
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? "text-[#172554] fill-[#172554] drop-shadow-xs"
                          : "text-slate-300 fill-slate-100 hover:text-slate-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-[#172554] block font-serif">
                {rating === 5 ? "★★★★★ Excelente (5/5)" :
                 rating === 4 ? "★★★★☆ Muito Bom (4/5)" :
                 rating === 3 ? "★★★☆☆ Satisfatório (3/5)" :
                 rating === 2 ? "★★☆☆☆ Insatisfatório (2/5)" :
                 "★☆☆☆☆ Fraco (1/5)"}
              </span>
            </div>

            {/* DETAILED CRITERIA */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {/* Qualidade */}
              <div className="bg-white p-3 rounded-xl border border-border space-y-1 text-center shadow-xs">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Qualidade Técnica</span>
                <select
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-border text-[#172554] font-bold text-xs rounded-lg p-1.5 outline-none cursor-pointer text-center"
                >
                  <option value={5}>★ 5 - Top</option>
                  <option value={4}>★ 4 - Bom</option>
                  <option value={3}>★ 3 - Médio</option>
                  <option value={2}>★ 2 - Baixo</option>
                  <option value={1}>★ 1 - Mau</option>
                </select>
              </div>

              {/* Pontualidade */}
              <div className="bg-white p-3 rounded-xl border border-border space-y-1 text-center shadow-xs">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Pontualidade</span>
                <select
                  value={punctuality}
                  onChange={(e) => setPunctuality(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-border text-[#172554] font-bold text-xs rounded-lg p-1.5 outline-none cursor-pointer text-center"
                >
                  <option value={5}>★ 5 - Pontual</option>
                  <option value={4}>★ 4 - Regular</option>
                  <option value={3}>★ 3 - Atraso</option>
                  <option value={2}>★ 2 - Muito Atrasado</option>
                  <option value={1}>★ 1 - Falhou</option>
                </select>
              </div>

              {/* Postura */}
              <div className="bg-white p-3 rounded-xl border border-border space-y-1 text-center shadow-xs">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Postura / Higiene</span>
                <select
                  value={cleanliness}
                  onChange={(e) => setCleanliness(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-border text-[#172554] font-bold text-xs rounded-lg p-1.5 outline-none cursor-pointer text-center"
                >
                  <option value={5}>★ 5 - Exemplar</option>
                  <option value={4}>★ 4 - Limpo</option>
                  <option value={3}>★ 3 - Normal</option>
                  <option value={2}>★ 2 - Regular</option>
                  <option value={1}>★ 1 - Descuido</option>
                </select>
              </div>
            </div>

            {/* COMMENT */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#172554]" />
                <span>Testemunho e Feedback sobre o Serviço Realizado</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Descreva a qualidade do atendimento, competência do técnico e se recomendaria este profissional..."
                className="w-full bg-[#F8FAFC] border border-border focus:bg-white focus:border-[#172554] text-slate-900 rounded-xl p-3 text-xs outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white border border-border text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#172554] hover:bg-[#172554] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? "A gravar..." : "Gravar Avaliação & Pontuar Prestador"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
