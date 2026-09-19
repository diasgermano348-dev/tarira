import React, { useState, useEffect, useMemo } from "react";
import { 
  Star, 
  Check, 
  RotateCcw, 
  Sparkles, 
  UserCheck, 
  AlertCircle, 
  Trash2, 
  Save, 
  Users, 
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import { Candidate } from "./types";
import { isCorporateCandidate } from "./TariraRecruitModule";

interface TariraFeaturedRecruitManagerProps {
  candidates: Candidate[];
  featuredRecruitTalentIds?: string[];
  onUpdateFeaturedRecruitTalents?: (ids: string[]) => Promise<void> | void;
  onTriggerAuditLog?: (action: string, detail: string) => void;
}

export const TariraFeaturedRecruitManager: React.FC<TariraFeaturedRecruitManagerProps> = ({
  candidates = [],
  featuredRecruitTalentIds = [],
  onUpdateFeaturedRecruitTalents,
  onTriggerAuditLog
}) => {
  // Pool de candidatos elegíveis de "Talentos e Quadros" ordenados pelos primeiros inscritos
  const eligibleCandidates = useMemo(() => {
    return (candidates || [])
      .filter((c) => {
        if (!c || !c.name) return false;
        const idStr = String(c.id || "");
        if (idStr.startsWith("mockup-")) return false;
        if (!isCorporateCandidate(c)) return false;
        if (c.status === "rejected" || c.status === "archived") return false;
        return true;
      })
      .sort((a, b) => {
        const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        if (tA && tB && tA !== tB) return tA - tB;
        return String(a.id || "").localeCompare(String(b.id || ""));
      });
  }, [candidates]);

  // Os primeiros três inscritos (padrão do sistema)
  const defaultFirstThree = useMemo(() => {
    return eligibleCandidates.slice(0, 3);
  }, [eligibleCandidates]);

  // Estado dos 3 slots: ID manual configurado para cada posição ou null se automático
  const [slot1, setSlot1] = useState<string | null>(null);
  const [slot2, setSlot2] = useState<string | null>(null);
  const [slot3, setSlot3] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sincronizar com os IDs recebidos do servidor ou localStorage
  useEffect(() => {
    const list = Array.isArray(featuredRecruitTalentIds) ? featuredRecruitTalentIds : [];
    setSlot1(list[0] || null);
    setSlot2(list[1] || null);
    setSlot3(list[2] || null);
  }, [featuredRecruitTalentIds]);

  // Determina o candidato efetivo em cada slot
  const resolvedCandidate1 = useMemo(() => {
    if (slot1) {
      const found = eligibleCandidates.find((c) => String(c.id) === String(slot1));
      if (found) return { candidate: found, isManual: true };
    }
    return { candidate: defaultFirstThree[0] || null, isManual: false };
  }, [slot1, eligibleCandidates, defaultFirstThree]);

  const resolvedCandidate2 = useMemo(() => {
    if (slot2) {
      const found = eligibleCandidates.find((c) => String(c.id) === String(slot2));
      if (found) return { candidate: found, isManual: true };
    }
    // Não repetir o candidato do slot 1 se for automático
    const usedId = resolvedCandidate1.candidate?.id;
    const fallback = eligibleCandidates.find((c) => c.id !== usedId);
    return { candidate: defaultFirstThree[1] || fallback || null, isManual: false };
  }, [slot2, eligibleCandidates, defaultFirstThree, resolvedCandidate1]);

  const resolvedCandidate3 = useMemo(() => {
    if (slot3) {
      const found = eligibleCandidates.find((c) => String(c.id) === String(slot3));
      if (found) return { candidate: found, isManual: true };
    }
    const usedIds = new Set([
      resolvedCandidate1.candidate?.id,
      resolvedCandidate2.candidate?.id
    ].filter(Boolean));
    const fallback = eligibleCandidates.find((c) => !usedIds.has(c.id));
    return { candidate: defaultFirstThree[2] || fallback || null, isManual: false };
  }, [slot3, eligibleCandidates, defaultFirstThree, resolvedCandidate1, resolvedCandidate2]);

  // Alterar candidato de um slot
  const handleSelectSlot = (slotIndex: 0 | 1 | 2, newId: string) => {
    setSaveSuccess(false);
    if (!newId || newId === "auto") {
      if (slotIndex === 0) setSlot1(null);
      if (slotIndex === 1) setSlot2(null);
      if (slotIndex === 2) setSlot3(null);
      return;
    }

    // Se o candidato já estiver em outro slot, limpa o outro para evitar repetição
    if (slotIndex === 0) {
      setSlot1(newId);
      if (slot2 === newId) setSlot2(null);
      if (slot3 === newId) setSlot3(null);
    } else if (slotIndex === 1) {
      setSlot2(newId);
      if (slot1 === newId) setSlot1(null);
      if (slot3 === newId) setSlot3(null);
    } else {
      setSlot3(newId);
      if (slot1 === newId) setSlot1(null);
      if (slot2 === newId) setSlot2(null);
    }
  };

  // Restaurar padrão (os primeiros 3 inscritos)
  const handleResetToDefault = () => {
    setSlot1(null);
    setSlot2(null);
    setSlot3(null);
    setSaveSuccess(false);
  };

  // Guardar configuração
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Se o administrador personalizou, gravamos os IDs explícitos
    // Se deixou em automático, podemos salvar o array correspondente
    const finalIds: string[] = [];
    if (slot1) finalIds.push(slot1);
    else if (resolvedCandidate1.candidate?.id) finalIds.push(resolvedCandidate1.candidate.id);

    if (slot2) finalIds.push(slot2);
    else if (resolvedCandidate2.candidate?.id) finalIds.push(resolvedCandidate2.candidate.id);

    if (slot3) finalIds.push(slot3);
    else if (resolvedCandidate3.candidate?.id) finalIds.push(resolvedCandidate3.candidate.id);

    const cleanIds = finalIds.slice(0, 3);

    try {
      if (onUpdateFeaturedRecruitTalents) {
        await onUpdateFeaturedRecruitTalents(cleanIds);
      } else {
        localStorage.setItem("tarira_featured_recruit_talents", JSON.stringify(cleanIds));
        await fetch("/api/featured-recruit-talents", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-auth": "tarira-admin-active" },
          body: JSON.stringify({ featuredIds: cleanIds })
        });
      }

      if (onTriggerAuditLog) {
        onTriggerAuditLog(
          "CONFIGURAR_DESTAQUES_RECRUTA",
          `Atualizada amostra de 3 talentos na aba Recruta: [${cleanIds.join(", ")}]`
        );
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Erro ao guardar talentos em destaque:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const slotsConfig = [
    {
      index: 0 as const,
      label: "Slot 1 • Destaque Principal",
      resolved: resolvedCandidate1,
      currentValue: slot1,
      onChange: (val: string) => handleSelectSlot(0, val)
    },
    {
      index: 1 as const,
      label: "Slot 2 • Segundo Destaque",
      resolved: resolvedCandidate2,
      currentValue: slot2,
      onChange: (val: string) => handleSelectSlot(1, val)
    },
    {
      index: 2 as const,
      label: "Slot 3 • Terceiro Destaque",
      resolved: resolvedCandidate3,
      currentValue: slot3,
      onChange: (val: string) => handleSelectSlot(2, val)
    }
  ];

  const hasManualOverride = Boolean(slot1 || slot2 || slot3);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Amostra da Aba Recruta</span>
            </span>
            <span className="text-[11px] font-mono text-slate-700 font-semibold">
              Exatamente 3 Perfis
            </span>
          </div>
          <h3 className="text-xl font-bold font-serif text-[#172554]">
            Perfis em Destaque na Amostra de Talentos
          </h3>
          <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
            Estes 3 perfis aparecem na secção <span className="font-bold text-slate-900">&ldquo;Amostra de Talentos&rdquo;</span> da aba pública <span className="font-bold text-[#172554]">TARIRA Recruit</span>. Por regra do sistema, são automaticamente os <span className="font-bold text-slate-900">primeiros 3 inscritos</span> em Talentos e Quadros. Pode selecionar perfis específicos em cada slot ou repor o modo padrão a qualquer momento.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasManualOverride && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Voltar a usar os primeiros 3 inscritos na plataforma"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Primeiros 3 Inscritos</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-xs active:scale-95 ${
              saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-[#172554] hover:bg-[#1e3a8a] text-white"
            }`}
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>A Guardar...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Guardado na Aba Recruta!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar 3 Destaques</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid com os 3 Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {slotsConfig.map((slot) => {
          const cand = slot.resolved.candidate;
          const isManual = slot.resolved.isManual;
          const fullName = cand ? `${cand.name}${cand.surname ? " " + cand.surname : ""}`.trim() : "";
          const photo = (cand && typeof cand.photo === "string" && cand.photo.trim().length > 0)
            ? cand.photo
            : fullName
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=172554&color=fff&size=200`
            : null;

          return (
            <div
              key={slot.index}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
                isManual
                  ? "bg-amber-50/40 border-amber-300 shadow-xs"
                  : "bg-slate-50/70 border-slate-200"
              }`}
            >
              {/* Topo do Card do Slot */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#172554] text-white text-xs font-bold font-mono flex items-center justify-center">
                      {slot.index + 1}
                    </span>
                    <span className="text-xs font-bold text-[#172554]">
                      {slot.label}
                    </span>
                  </div>

                  {isManual ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold">
                      Personalizado
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-[10px] font-mono font-bold">
                      Automático (Inscrito #{slot.index + 1})
                    </span>
                  )}
                </div>

                {/* Perfil atual do Slot */}
                {cand ? (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-3 shadow-2xs">
                    <div className="relative shrink-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt={fullName}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554]">
                          <UserCheck className="w-6 h-6" />
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Perfil ativo">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="text-sm font-bold text-[#172554] truncate">
                        {fullName}
                      </h4>
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {cand.title || cand.subCategory || "Profissional Especialista"}
                      </p>
                      <p className="text-[11px] font-mono text-slate-600 truncate">
                        {cand.category || "Quadros"} • {cand.city || "Moçambique"}
                        {cand.experienceYears ? ` • ${cand.experienceYears}a exp.` : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-1">
                    <Users className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Nenhum profissional inscrito no slot
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Será preenchido assim que o próximo profissional se inscrever na plataforma.
                    </p>
                  </div>
                )}
              </div>

              {/* Seletor Dropdown para alterar este slot */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Escolher Perfil para o Slot {slot.index + 1}:
                </label>
                <div className="relative">
                  <select
                    value={slot.currentValue || "auto"}
                    onChange={(e) => slot.onChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all cursor-pointer pr-8"
                  >
                    <option value="auto">
                      ⚙️ Automático (Usar {slot.index + 1}º Inscrito)
                    </option>
                    <optgroup label="Profissionais & Quadros Disponíveis:">
                      {eligibleCandidates.map((c, i) => {
                        const cName = `${c.name}${c.surname ? " " + c.surname : ""}`.trim();
                        const cTitle = c.title || c.subCategory || c.category || "Especialista";
                        return (
                          <option key={c.id} value={c.id}>
                            #{i + 1} {cName} — {cTitle}
                          </option>
                        );
                      })}
                    </optgroup>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {isManual && (
                  <button
                    type="button"
                    onClick={() => slot.onChange("auto")}
                    className="text-[10px] text-slate-600 hover:text-red-700 font-bold transition-colors inline-flex items-center gap-1 cursor-pointer pt-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpar personalização (voltar para automático)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Nota de rodapé explicativa */}
      <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-700">
        <Sparkles className="w-4 h-4 text-[#172554] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#172554]">Regra de visualização pública:</strong> Na página principal da aba TARIRA Recruit, a amostra exibe estritamente estes 3 talentos reais (com nome, especialidade, anos de experiência e ligação direta ao catálogo). Quando novos talentos se inscrevem na plataforma, eles tornam-se imediatamente elegíveis para serem destacados aqui.
        </p>
      </div>
    </div>
  );
};
