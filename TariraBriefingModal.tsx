import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Layers,
  Clock,
  Coins,
  ShieldCheck,
  Upload,
  ChevronRight,
  Download,
  MessageCircle,
  HelpCircle,
  AlertCircle,
  Check,
  Linkedin,
  Share2
} from "lucide-react";
import { TariraJobBroadcastModal } from "./TariraJobBroadcastModal";

export interface BriefingData {
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  category: string;
  technicalProfile: string;
  qtdVagas: number;
  seniority: string;
  workModel: string;
  mandatoryCriteria: string;
  desirableCriteria: string;
  minExperience: string;
  salaryBudget: string;
  urgency: string;
  selectionMechanism: "curadoria_tarira" | "acesso_direto_empresa";
  validationChannel: "virtual" | "presencial" | "email_interno";
  documentName?: string;
  documentSize?: string;
  documentData?: string;
}

export interface PhaseExplainer {
  phase: number;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  gradientClass?: string;
  borderClass?: string;
  textAccentClass?: string;
  cardBg?: string;
  textAccent?: string;
  keyPoints: string[];
  advantage: string;
  explanation: string;
}

interface TariraBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newReq: any) => void;
  currentLang?: "pt" | "en";
  initialCompanyName?: string;
  isAdminMode?: boolean;
}

export const TariraBriefingModal: React.FC<TariraBriefingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentLang = "pt",
  initialCompanyName = "",
  isAdminMode = false
}) => {
  const [formData, setFormData] = useState<BriefingData>({
    companyName: initialCompanyName || "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    location: "Maputo / Matola",
    category: "tech",
    technicalProfile: "",
    qtdVagas: 1,
    seniority: "Pleno / Mid-Level",
    workModel: "Presencial",
    mandatoryCriteria: "",
    desirableCriteria: "",
    minExperience: "2 a 4 anos",
    salaryBudget: "50.000 MZN - 80.000 MZN/mês",
    urgency: "Normal (3-5 dias)",
    selectionMechanism: "curadoria_tarira",
    validationChannel: "email_interno"
  });

  useEffect(() => {
    if (initialCompanyName) {
      setFormData((prev) => ({
        ...prev,
        companyName: initialCompanyName
      }));
    }
  }, [initialCompanyName, isOpen]);

  const [activeTab, setActiveTab] = useState<"empresa" | "perfil" | "criterios" | "condicoes">("empresa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReq, setSubmittedReq] = useState<any | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setFileError("");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDoc = file.name.toLowerCase().endsWith(".doc") || file.name.toLowerCase().endsWith(".docx");

    if (!isPdf && !isDoc) {
      setFileError("Por favor, anexe exclusivamente um ficheiro em formato PDF (.pdf) ou Word (.docx).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("O ficheiro excede o tamanho máximo permitido de 5MB.");
      return;
    }

    const sizeFormatted =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        documentName: file.name,
        documentSize: sizeFormatted,
        documentData: (e.target?.result as string) || ""
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      alert("Por favor, informe o Nome da Empresa.");
      setActiveTab("empresa");
      return;
    }
    if (!formData.technicalProfile.trim()) {
      alert("Por favor, indique o Perfil Técnico / Título da Vaga.");
      setActiveTab("perfil");
      return;
    }
    if (!formData.contactEmail.trim() && !formData.contactPhone.trim()) {
      alert("Por favor, forneça pelo menos um e-mail ou número de telefone para contacto.");
      setActiveTab("empresa");
      return;
    }

    setIsSubmitting(true);

    const newReqId = `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newReq = {
      id: newReqId,
      title: `${formData.technicalProfile} (${formData.qtdVagas} vaga${formData.qtdVagas > 1 ? "s" : ""})`,
      clientName: formData.companyName,
      clientType: "company" as const,
      module: "recruit" as const,
      stage: "briefing" as const,
      assignedAgentId: "ag-1",
      assignedAgentName: "Dinis Mandlate (Recruitment Lead)",
      candidatesCount: Math.min(formData.qtdVagas * 3, 12),
      salaryProposal: formData.salaryBudget,
      createdAt: new Date().toLocaleDateString("pt-MZ"),
      priority: formData.urgency.includes("24-48h") || formData.urgency.includes("Urgente") ? "high" : "medium",
      briefingData: {
        ...formData,
        submittedAt: new Date().toISOString(),
        fichaStatus: "Validada e Processada - Fase 1"
      },
      feedbacks: [
        {
          id: `fb-${Date.now()}`,
          author: "Sistema TARIRA Recruit",
          role: "Plataforma de R&S",
          stage: "Fase 1 — Briefing Registado",
          text: `Ficha de Requisição de Vaga submetida via Metodologia TARIRA Recruit. Validação via ${
            formData.validationChannel === "virtual"
              ? "Reunião Virtual (Vídeo)"
              : formData.validationChannel === "presencial"
              ? "Reunião Presencial"
              : "E-mail Interno Formal"
          }. Mecanismo de Seleção: ${
            formData.selectionMechanism === "curadoria_tarira"
              ? "Curadoria TARIRA com Vetting Completo (Mecanismo A)"
              : "Acesso Direto à Base (Mecanismo B)"
          }.`,
          timestamp: `${new Date().toLocaleDateString("pt-MZ")} ${new Date().toLocaleTimeString("pt-MZ", {
            hour: "2-digit",
            minute: "2-digit"
          })}`
        }
      ]
    };

    try {
      await fetch("/api/briefings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newReqId,
          companyName: formData.companyName,
          category: formData.category,
          qtdVagas: formData.qtdVagas,
          technicalProfile: formData.technicalProfile,
          mandatoryCriteria: formData.mandatoryCriteria,
          desirableCriteria: formData.desirableCriteria,
          salaryBudget: formData.salaryBudget,
          urgency: formData.urgency,
          contactPerson: formData.contactPerson,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          location: formData.location
        })
      });
    } catch (err) {
      console.warn("Aviso ao submeter briefing para a API (fallback local ativo):", err);
    }

    try {
      const stored = localStorage.getItem("tarira_central_pipeline");
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem("tarira_central_pipeline", JSON.stringify([newReq, ...list]));

      // Also persist to commercial proposals for Central Admin Panel
      const storedProposals = localStorage.getItem("tarira_commercial_proposals");
      const proposalsList = storedProposals ? JSON.parse(storedProposals) : [];
      const newCommercialProp = {
        id: newReqId,
        source: "b2b_recruitment",
        businessUnit: "Tarira Recruiting",
        companyName: formData.companyName,
        contactPerson: formData.contactPerson || formData.companyName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        operationType: `Tarira Recruiting: ${formData.technicalProfile} (${formData.qtdVagas} Vagas)`,
        headcount: formData.qtdVagas,
        slaLevel: formData.urgency || "Normal (3-5 dias)",
        comments: `Critérios Obrigatórios: ${formData.mandatoryCriteria || "Nenhum"}. Critérios Desejáveis: ${formData.desirableCriteria || "Nenhum"}. Orçamento Salarial: ${formData.salaryBudget || "A negociar"}.`,
        submittedAt: new Date().toISOString(),
        status: "pending",
        budgetEstimateMzn: parseInt(String(formData.salaryBudget).replace(/[^0-9]/g, "")) || undefined,
        assignedManager: "Dinis Mandlate (Recruiting Lead)",
        internalNotes: "Briefing de recrutamento formal submetido via Metodologia TARIRA Recruit.",
        documentName: formData.documentName,
        documentSize: formData.documentSize,
        documentData: formData.documentData,
        emailNotificationSent: true,
        emailNotificationRecipient: "tarira.ecossistema@gmail.com",
        emailNotificationSentAt: new Date().toISOString(),
        emailNotificationSubject: `[PROPOSTA TARIRA RECRUITING] ${formData.companyName} — ${formData.technicalProfile} (Ref: ${newReqId})`
      };
      localStorage.setItem("tarira_commercial_proposals", JSON.stringify([newCommercialProp, ...proposalsList]));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("tarira_proposal_created", { detail: newCommercialProp }));
    } catch (e) {}

    setIsSubmitting(false);
    setSubmittedReq(newReq);
    if (onSuccess) {
      onSuccess(newReq);
    }
  };

  const handleDownloadVoucher = () => {
    if (!submittedReq) return;
    const content = `=====================================================
TARIRA RECRUIT — COMPROVATIVO DE BRIEFING FORMAL
=====================================================
Código da Requisição: ${submittedReq.id}
Data de Submissão: ${submittedReq.createdAt}
Empresa Contratante: ${formData.companyName}
Responsável Comercial / RH: ${formData.contactPerson || "Não informado"}
Email: ${formData.contactEmail}
Telefone: ${formData.contactPhone}
Localização: ${formData.location}

DETALHES DA VAGA
-----------------------------------------------------
Título da Vaga: ${formData.technicalProfile}
Categoria: ${formData.category}
Quantidade de Vagas: ${formData.qtdVagas}
Nível de Senioridade: ${formData.seniority}
Regime de Trabalho: ${formData.workModel}
Experiência Mínima: ${formData.minExperience}
Orçamento Salarial Proposto: ${formData.salaryBudget}
Urgência de Contratação: ${formData.urgency}

CRITÉRIOS TÉCNICOS
-----------------------------------------------------
Critérios Obrigatórios:
${formData.mandatoryCriteria || "Nenhum informado especificamente"}

Critérios Desejáveis:
${formData.desirableCriteria || "Nenhum informado especificamente"}

MECANISMO DE SELEÇÃO & SLA
-----------------------------------------------------
Mecanismo: ${formData.selectionMechanism === "curadoria_tarira" ? "Curadoria TARIRA (Vetting Rigoroso)" : "Acesso Direto à Base"}
Canal de Alinhamento: ${formData.validationChannel}
Lead Recruiter Atribuído: ${submittedReq.assignedAgentName}
SLA de Apresentação de Candidatos: 24h a 48h

=====================================================
TARIRA ECOSSISTEMA • Maputo, Moçambique
Contacto: tarira.ecossistema@gmail.com | WhatsApp: +258 84 000 0000
=====================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TARIRA_Briefing_${submittedReq.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 bg-slate-950/70 backdrop-blur-md flex justify-center items-start sm:items-center animate-in fade-in duration-200">
      <div className="bg-background border border-border w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-2 sm:my-auto max-h-[94vh] text-text-primary">
        {/* Header */}
        <div className="bg-background-secondary text-text-primary p-4 sm:p-7 border-b border-border flex items-start justify-between relative shrink-0">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand font-mono text-[10px] font-bold uppercase tracking-wider">
                FASE 1 • BRIEFING FORMAL
              </span>
              <span className="px-2 py-0.5 rounded-md bg-background border border-border text-text-secondary font-mono text-[10px] font-semibold shadow-xs">
                SLA: 24h - 48h
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
              <span>📝 Ficha de Briefing & Requisição de Vaga</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Levantamento estruturado de requisitos técnicos e alinhamento do perfil com a equipa de curadoria da TARIRA.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-background hover:bg-slate-200 text-text-secondary hover:text-text-primary flex items-center justify-center transition-all cursor-pointer shrink-0 border border-border shadow-xs"
            title="Fechar Modal"
            aria-label="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Delegation Mode Banner */}
        {(isAdminMode || initialCompanyName) && (
          <div className="bg-brand-light/10 border-b border-border px-6 py-2.5 flex items-center justify-between text-xs text-brand shrink-0">
            <span className="font-bold flex items-center gap-1.5">
              👑 Modo de Gestão Central & Administrador • Disparo Delegado
              {formData.companyName && ` para: ${formData.companyName}`}
            </span>
            <span className="text-[11px] font-mono font-semibold text-brand-light hidden sm:inline">
              ✓ Processamento Imediato no ATS & Propostas
            </span>
          </div>
        )}

        {/* Content Body */}
        {submittedReq ? (
          /* Confirmation / Success Screen */
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-text-primary">
            <div className="text-center space-y-3 py-4">
              <div className="w-16 h-16 rounded-full bg-status-success/15 text-status-success border-2 border-status-success/40 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary">
                Briefing Registado com Sucesso!
              </h3>
              <p className="text-sm text-text-secondary max-w-lg mx-auto">
                A requisição foi protocolada na esteira de recrutamento corporativo da TARIRA Recruit e a triagem inicial já foi iniciada.
              </p>
            </div>

            {/* Protocol Voucher Card */}
            <div className="bg-background-secondary border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-text-secondary">Código da Requisição</span>
                  <div className="text-lg font-mono font-black text-brand">{submittedReq.id}</div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-mono uppercase font-bold text-text-secondary">Estado Atual</span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold font-mono border border-brand/20">
                    <span className="w-2 h-2 rounded-full bg-brand-light animate-pulse"></span>
                    Fase 1: Triagem & Matching
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-secondary font-semibold block">Empresa Contratante:</span>
                  <span className="text-text-primary font-bold text-sm">{formData.companyName}</span>
                </div>
                <div>
                  <span className="text-text-secondary font-semibold block">Perfil & Headcount:</span>
                  <span className="text-text-primary font-bold text-sm">
                    {formData.technicalProfile} ({formData.qtdVagas} vaga{formData.qtdVagas > 1 ? "s" : ""})
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary font-semibold block">Lead Recruiter Responsável:</span>
                  <span className="text-text-primary font-bold">{submittedReq.assignedAgentName}</span>
                </div>
                <div>
                  <span className="text-text-secondary font-semibold block">SLA de Apresentação de Perfis:</span>
                  <span className="text-status-success font-bold font-mono">24h a 48h Úteis</span>
                </div>
              </div>
            </div>

            {/* Next Steps Box */}
            <div className="p-4 rounded-xl bg-background-secondary border border-border text-xs text-text-primary space-y-2">
              <div className="font-bold flex items-center gap-2 text-brand">
                <Clock className="w-4 h-4 text-brand-light" /> Próximos Passos Automáticos:
              </div>
              <ul className="list-disc pl-5 space-y-1 text-text-secondary">
                <li>O nosso algoritmo já está a cruzar o perfil com a nossa base pré-qualificada de talentos.</li>
                <li>O Lead Recruiter entrará em contacto através do canal selecionado (<strong>{formData.validationChannel}</strong>) para validação rápida de requisitos.</li>
                <li>Você receberá a short-list com os primeiros candidatos avaliados e pontuados.</li>
              </ul>
            </div>

            {/* ═══════════ DISPARO DE VAGAS PARA LINKEDIN & FLYER ═══════════ */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-white via-blue-50 to-blue-50 border-2 border-blue-500/50 text-[#172554] flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl animate-fade-up">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xl shadow-blue-500/20">
                  <Linkedin className="w-7 h-7 text-slate-950" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-black text-lg text-[#172554]">Disparo para o LinkedIn & Redes</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-[#172554] font-mono text-[9px] font-bold uppercase">
                      Flyer 1:1 & 1.91:1 Oficial
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Gere o flyer visual oficial da vaga, descarregue em PNG de alta resolução e faça o disparo direto com texto estruturado para o feed do LinkedIn, WhatsApp e grupos de emprego em Moçambique.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(true)}
                className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer shrink-0"
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>Disparar Vaga & Gerar Flyer 🚀</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadVoucher}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-text-primary text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-border shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Descarregar Comprovativo (.txt)</span>
              </button>
              <a
                href={`https://wa.me/258840000000?text=${encodeURIComponent(
                  `Olá TARIRA Recruit, acabamos de submeter o Briefing Formal (${submittedReq.id}) para a vaga de "${formData.technicalProfile}". Empresa: ${formData.companyName}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-status-success hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar com Lead Recruiter no WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Concluir & Fechar
              </button>
            </div>
          </div>
        ) : (
          /* Main Interactive Form */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs Navigation */}
            <div className="bg-background-secondary px-6 pt-3 border-b border-border flex items-center gap-2 overflow-x-auto shrink-0">
              {[
                { id: "empresa", label: "1. Empresa & Contacto", icon: Building2 },
                { id: "perfil", label: "2. Vaga & Perfil", icon: Briefcase },
                { id: "criterios", label: "3. Requisitos & Vetting", icon: ShieldCheck },
                { id: "condicoes", label: "4. Orçamento & SLA", icon: Coins }
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-t-2 transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? "bg-background text-brand border-brand-light shadow-xs"
                        : "bg-transparent text-text-secondary border-transparent hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-text-primary">
              {/* TAB 1: EMPRESA */}
              {activeTab === "empresa" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nome da Empresa Contratante *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Ex: Vodacom Moçambique, Banco Comercial, Startup Lda..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Pessoa de Contacto / Gestor(a) Solicitante</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Ex: Dra. Teresa Mucavele (Diretora de RH)"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>E-mail Corporativo *</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="Ex: recrutamento@empresa.co.mz"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Contacto Telefónico / WhatsApp *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="Ex: +258 84 123 4567"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Localização / Província de Atuação</span>
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="Maputo / Matola">Maputo Cidade / Província de Maputo (Matola)</option>
                      <option value="Beira / Sofala">Beira / Província de Sofala</option>
                      <option value="Nampula / Nacala">Nampula Cidade / Porto de Nacala</option>
                      <option value="Tete">Tete (Zona Mineira / Vale do Zambeze)</option>
                      <option value="Cabo Delgado (Pemba / Palma)">Cabo Delgado (Pemba / Projetos de GNL Palma)</option>
                      <option value="Inhambane / Gaza">Inhambane / Gaza</option>
                      <option value="Zambézia / Niassa">Zambézia (Quelimane) / Niassa</option>
                      <option value="Nacional / Multilocais">Nacional (Múltiplas Províncias)</option>
                      <option value="Remoto (Todo o País / Internacional)">100% Remoto (Moçambique ou Internacional)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 2: PERFIL */}
              {activeTab === "perfil" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>Título da Vaga / Perfil Técnico Exigido *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.technicalProfile}
                        onChange={(e) => setFormData({ ...formData, technicalProfile: e.target.value })}
                        placeholder="Ex: Engenheiro de Software Fullstack, Contabilista Sénior, Gestor de Logística..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>Quantidade de Vagas</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={formData.qtdVagas}
                        onChange={(e) => setFormData({ ...formData, qtdVagas: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Categoria de Especialidade
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <option value="tech">Tecnologia, Dados & Software</option>
                        <option value="finance">Finanças, Contabilidade & Auditoria</option>
                        <option value="operations">Operações, Logística & Supply Chain</option>
                        <option value="engineering">Engenharia, Minas & Indústria</option>
                        <option value="commercial">Comercial, Vendas & Marketing</option>
                        <option value="hr_legal">Recursos Humanos & Jurídico</option>
                        <option value="executive">C-Level & Direção Executiva</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nível de Senioridade
                      </label>
                      <select
                        value={formData.seniority}
                        onChange={(e) => setFormData({ ...formData, seniority: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <option value="Estágio / Trainee">Estágio / Trainee Pré-Qualificado</option>
                        <option value="Júnior (1-2 anos)">Júnior (1 a 2 anos)</option>
                        <option value="Pleno / Mid-Level">Pleno / Mid-Level (3 a 5 anos)</option>
                        <option value="Sénior (5+ anos)">Sénior / Especialista (5+ anos)</option>
                        <option value="Lead / Coordenação">Tech Lead / Coordenação de Equipa</option>
                        <option value="Direção / C-Level">Direção / Gestão Executiva</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Regime de Trabalho
                      </label>
                      <select
                        value={formData.workModel}
                        onChange={(e) => setFormData({ ...formData, workModel: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <option value="Presencial">Presencial (Escritório / Instalações)</option>
                        <option value="Híbrido">Híbrido (Ex: 3 dias escritório / 2 remoto)</option>
                        <option value="Remoto">100% Remoto (Qualquer local)</option>
                        <option value="Turnos / Rotação (Minas/Offshore)">Regime de Rotação / Campo (Ex: 28x28)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CRITERIOS */}
              {activeTab === "criterios" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                        <span>Critérios Obrigatórios (Eliminatórios / Hard Skills) *</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Essenciais para triagem</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.mandatoryCriteria}
                      onChange={(e) => setFormData({ ...formData, mandatoryCriteria: e.target.value })}
                      placeholder="Ex: Licenciatura em Informática ou equivalente; Domínio em React/Node.js; 3+ anos de experiência comprovada; Inglês fluente para reporte internacional..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Critérios Desejáveis (Diferenciais / Soft Skills)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Pontuação extra no matching</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.desirableCriteria}
                      onChange={(e) => setFormData({ ...formData, desirableCriteria: e.target.value })}
                      placeholder="Ex: Conhecimento de metodologias ágeis (Scrum), experiência no setor bancário/telecomunicações, residência próxima à Matola..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all leading-relaxed"
                    />
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Anexo de Termos de Referência / Job Description (Opcional - PDF ou Word)</span>
                    </label>

                    {formData.documentName ? (
                      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-300 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-5 h-5 text-blue-700 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{formData.documentName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{formData.documentSize} • Pronto para envio</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, documentName: "", documentSize: "", documentData: "" })}
                          className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleFileUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`p-5 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                          dragActive
                            ? "bg-blue-50 border-blue-500"
                            : "bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-slate-100/70"
                        }`}
                        onClick={() => document.getElementById("briefing-file-input")?.click()}
                      >
                        <input
                          id="briefing-file-input"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-700">
                          Arraste o ficheiro de perfil de cargo ou clique para selecionar
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Formatos aceites: PDF, DOC, DOCX (Máx. 5MB)
                        </p>
                      </div>
                    )}
                    {fileError && <p className="text-xs text-rose-600 font-semibold mt-1">{fileError}</p>}
                  </div>
                </div>
              )}

              {/* TAB 4: CONDICOES */}
              {activeTab === "condicoes" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-blue-600" />
                        <span>Orçamento Salarial Proposto (MZN / mês)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.salaryBudget}
                        onChange={(e) => setFormData({ ...formData, salaryBudget: e.target.value })}
                        placeholder="Ex: 60.000 MZN - 90.000 MZN/mês ou Negociável"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Urgência de Fecho / SLA</span>
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                      >
                        <option value="Urgente (24-48h)">⚡ Urgente (Shorlist em 24h a 48h)</option>
                        <option value="Normal (3-5 dias)">Normal (Shortlist em 3 a 5 dias úteis)</option>
                        <option value="Planeamento Estratégico (10-15 dias)">Planeamento Estratégico (10 a 15 dias)</option>
                      </select>
                    </div>
                  </div>

                  {/* Selection Mechanism */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Mecanismo de Recrutamento & Seleção Preferido
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setFormData({ ...formData, selectionMechanism: "curadoria_tarira" })}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          formData.selectionMechanism === "curadoria_tarira"
                            ? "bg-blue-50/70 border-blue-500 shadow-sm"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>✨ Mecanismo A: Curadoria TARIRA</span>
                          </span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 font-bold uppercase">
                            Recomendado
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          A equipa TARIRA realiza todo o sourcing, vetting técnico, verificação de antecedentes e entrevistas preliminares, entregando apenas o top 3 de candidatos prontos com garantia de reposição.
                        </p>
                      </div>

                      <div
                        onClick={() => setFormData({ ...formData, selectionMechanism: "acesso_direto_empresa" })}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          formData.selectionMechanism === "acesso_direto_empresa"
                            ? "bg-blue-50/70 border-blue-500 shadow-sm"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>⚡ Mecanismo B: Acesso Direto à Base</span>
                          </span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold uppercase">
                            Ágil
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Acesso instantâneo a perfis pré-validados na base TARIRA para a sua equipa interna conduzir as entrevistas técnicas e contratação diretamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Validation Channel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Canal Preferencial para Validação e Alinhamento do Briefing
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "email_interno", label: "E-mail Formal", icon: Mail },
                        { id: "virtual", label: "Vídeo / Teams", icon: Phone },
                        { id: "presencial", label: "Presencial (Maputo)", icon: Building2 }
                      ].map((item) => {
                        const active = formData.validationChannel === item.id;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, validationChannel: item.id as any })}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              active
                                ? "bg-blue-500 text-white border-blue-600 font-bold shadow-sm"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[11px]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-background-secondary px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-text-secondary text-xs">
                <ShieldCheck className="w-4 h-4 text-brand-light shrink-0" />
                <span>Protocolo de confidencialidade garantido pela TARIRA Recruit.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {activeTab !== "empresa" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === "condicoes") setActiveTab("criterios");
                      else if (activeTab === "criterios") setActiveTab("perfil");
                      else if (activeTab === "perfil") setActiveTab("empresa");
                    }}
                    className="px-4 py-2 rounded-xl bg-background hover:bg-slate-200 text-text-primary text-xs font-bold transition-all cursor-pointer border border-border shadow-xs"
                  >
                    Voltar
                  </button>
                )}

                {activeTab !== "condicoes" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === "empresa") {
                        if (!formData.companyName.trim()) {
                          alert("Por favor, preencha o Nome da Empresa.");
                          return;
                        }
                        setActiveTab("perfil");
                      } else if (activeTab === "perfil") {
                        if (!formData.technicalProfile.trim()) {
                          alert("Por favor, preencha o Título da Vaga.");
                          return;
                        }
                        setActiveTab("criterios");
                      } else if (activeTab === "criterios") {
                        setActiveTab("condicoes");
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <span>Seguinte</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>A Submeter Briefing...</span>
                    ) : (
                      <>
                        <span>Submeter Ficha de Briefing 🚀</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Tarira Multichannel Job Broadcast & LinkedIn Flyer Modal */}
      {isBroadcastModalOpen && (
        <TariraJobBroadcastModal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          jobData={{
            id: submittedReq?.id || `VAGA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            companyName: formData.companyName,
            jobTitle: formData.technicalProfile,
            category: formData.category,
            location: formData.location,
            workModel: formData.workModel,
            seniority: formData.seniority,
            headcount: formData.qtdVagas,
            salaryBudget: formData.salaryBudget,
            urgency: formData.urgency,
            mandatoryCriteria: formData.mandatoryCriteria,
            desirableCriteria: formData.desirableCriteria,
            contactEmail: formData.contactEmail,
            contactPhone: formData.contactPhone,
            applicationUrl: `https://tarira.co.mz/vagas/candidatura?ref=${submittedReq?.id || 'VAGA-MZ'}`
          }}
        />
      )}
    </div>
  );
};

interface TariraPhaseExplainerModalProps {
  phaseData: PhaseExplainer | null;
  onClose: () => void;
  onOpenBriefing: () => void;
  currentLang?: "pt" | "en";
}

export const TariraPhaseExplainerModal: React.FC<TariraPhaseExplainerModalProps> = ({
  phaseData,
  onClose,
  onOpenBriefing,
  currentLang = "pt"
}) => {
  if (!phaseData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 bg-slate-950/70 backdrop-blur-md flex justify-center items-start sm:items-center animate-in fade-in duration-200">
      <div className="bg-background border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-2 sm:my-auto max-h-[94vh] text-text-primary">
        {/* Header */}
        <div className="bg-background-secondary text-text-primary p-4 sm:p-7 border-b border-border flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2 rounded-2xl bg-background border border-border shadow-xs">{phaseData.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand font-mono text-[10px] font-bold uppercase">
                  FASE {phaseData.phase} DE 6
                </span>
                <span className="px-2 py-0.5 rounded-md bg-background border border-border text-text-secondary font-mono text-[10px] shadow-xs">
                  {phaseData.badge}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                {phaseData.title}
              </h2>
              <p className="text-xs text-brand-light font-medium mt-0.5 font-mono">
                {phaseData.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-background hover:bg-slate-200 text-text-secondary hover:text-text-primary flex items-center justify-center transition-all cursor-pointer shrink-0 border border-border shadow-xs"
            title="Fechar Modal"
            aria-label="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 text-text-primary overflow-y-auto max-h-[70vh]">
          {/* Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase font-bold text-text-secondary tracking-wider">
              Descrição Metodológica Detalhada
            </h4>
            <p className="text-sm text-text-primary leading-relaxed font-medium bg-background-secondary p-4 rounded-2xl border border-border shadow-xs">
              {phaseData.explanation}
            </p>
          </div>

          {/* Key Checkpoints */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase font-bold text-text-secondary tracking-wider">
              Checkpoints & Procedimentos Operacionais
            </h4>
            <div className="space-y-2">
              {phaseData.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-background-secondary border border-border text-xs font-semibold text-text-primary shadow-xs">
                  <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advantage Banner */}
          <div className="p-4 rounded-2xl bg-status-success/10 border border-status-success/20 space-y-1">
            <div className="text-xs font-bold text-status-success flex items-center gap-1.5 uppercase font-mono">
              <span>⚡ Vantagem Competitiva Exclusiva TARIRA:</span>
            </div>
            <p className="text-xs text-text-primary leading-relaxed font-medium">
              {phaseData.advantage}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-background-secondary px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-background hover:bg-slate-200 text-text-primary text-xs font-bold transition-all cursor-pointer border border-border shadow-xs"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBriefing();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>📝 Preencher Ficha de Briefing (Fase 1)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
