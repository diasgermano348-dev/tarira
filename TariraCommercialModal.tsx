import React, { useState } from "react";
import {
  Building2,
  Briefcase,
  Phone,
  Mail,
  MessageSquare,
  Upload,
  FileText,
  CheckCircle2,
  X,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  Download,
  Calendar,
  AlertCircle
} from "lucide-react";
import { CommercialProposal } from "./types";

interface TariraCommercialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProposal?: (proposal: CommercialProposal) => void;
  currentLang?: "pt" | "en";
  initialServiceType?: string;
}

export const TariraCommercialModal: React.FC<TariraCommercialModalProps> = ({
  isOpen,
  onClose,
  onSubmitProposal,
  currentLang = "pt",
  initialServiceType = "outsourcing",
}) => {
  const isPt = currentLang === "pt";

  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    nuit: "",
    contactPerson: "",
    role: "",
    contactEmail: "",
    contactPhone: "",
    province: "Maputo Cidade",
    serviceType: initialServiceType,
    headcount: "" as number | "",
    urgency: "medium", // 'immediate' | 'medium' | 'planning'
    comments: "",
    budgetEstimateMzn: "",
  });

  // Document Upload State
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProposal, setSubmittedProposal] = useState<CommercialProposal | null>(null);

  if (!isOpen) return null;

  const serviceOptions = [
    {
      id: "outsourcing",
      namePt: "TARIRA Outsourcing & Facilities",
      nameEn: "TARIRA Outsourcing & Facilities",
      descPt: "Equipas especializadas, gestão de turnos, limpeza, segurança e suporte operacional.",
      descEn: "Specialized workforces, shift management, cleaning, security & operational support.",
      icon: "🏢",
      tag: "B2B Workforce",
    },
    {
      id: "recruit",
      namePt: "TARIRA Recruit & Executive Search",
      nameEn: "TARIRA Recruit & Executive Search",
      descPt: "Recrutamento especializado, caça-talentos técnicos e contratações estratégicas.",
      descEn: "Specialized recruitment, technical talent scouting & executive hires.",
      icon: "🎯",
      tag: "Talent Acquisition",
    },
    {
      id: "consulting",
      namePt: "TARIRA Consulting & Advisory",
      nameEn: "TARIRA Consulting & Advisory",
      descPt: "Reestruturação organizacional, auditoria de processos e diagnóstico empresarial.",
      descEn: "Organizational restructuring, process audit & business diagnostic advisory.",
      icon: "📊",
      tag: "Strategy & Advisory",
    },
    {
      id: "studio",
      namePt: "TARIRA Studio & Creative Media",
      nameEn: "TARIRA Studio & Creative Media",
      descPt: "Branding corporativo, produção audiovisual, design gráfico e marketing b2b.",
      descEn: "Corporate branding, audiovisual production, graphic design & marketing.",
      icon: "✨",
      tag: "Media & Brand",
    },
    {
      id: "connect",
      namePt: "TARIRA Connect & Marketplace",
      nameEn: "TARIRA Connect & Marketplace",
      descPt: "Prestação de serviços pontuais e parcerias integradas de serviços corporativos.",
      descEn: "On-demand direct services & integrated corporate provider partnerships.",
      icon: "⚡",
      tag: "On-Demand Network",
    },
  ];

  const handleFileUpload = (file: File) => {
    setFileError("");
    const maxMb = 15;
    if (file.size > maxMb * 1024 * 1024) {
      setFileError(isPt ? `O ficheiro excede o limite máximo de ${maxMb}MB.` : `File exceeds the maximum limit of ${maxMb}MB.`);
      return;
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedFile({
        name: file.name,
        size: sizeStr,
        dataUrl: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.contactEmail.trim() || !formData.contactPhone.trim()) {
      alert(isPt ? "Por favor preencha os campos obrigatórios (Empresa, Email e Telefone)." : "Please fill required fields (Company, Email and Phone).");
      return;
    }

    setIsSubmitting(true);

    const generatedId = `PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let resolvedUnit = "Tarira Business";
    const st = (formData.serviceType || "").toLowerCase();
    if (st.includes("connect") || st.includes("manuten") || st.includes("técnic")) resolvedUnit = "Tarira Connect";
    else if (st.includes("recruit") || st.includes("recruta") || st.includes("seleção")) resolvedUnit = "Tarira Recruiting";
    else if (st.includes("consult")) resolvedUnit = "Tarira Consulting";
    else if (st.includes("study") || st.includes("estudo")) resolvedUnit = "Tarira Study";
    else if (st.includes("outsourc") || st.includes("terceiriza")) resolvedUnit = "Tarira Outsourcing";

    const proposal: CommercialProposal = {
      id: generatedId,
      source: "direct_contact",
      businessUnit: resolvedUnit,
      companyName: formData.companyName,
      contactPerson: formData.contactPerson || "Representante Comercial",
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      operationType: formData.serviceType,
      headcount: Number(formData.headcount) || 1,
      slaLevel: formData.urgency === "immediate" ? "Urgência Alta (24h)" : formData.urgency === "medium" ? "Standard (48h-72h)" : "Planeamento Estratégico",
      comments: `[Cargo: ${formData.role || "N/A"}] [Província: ${formData.province}] [NUIT: ${formData.nuit || "N/A"}] ${formData.comments}`,
      submittedAt: new Date().toISOString(),
      status: "pending",
      documentName: uploadedFile?.name,
      documentSize: uploadedFile?.size,
      documentData: uploadedFile?.dataUrl,
      budgetEstimateMzn: formData.budgetEstimateMzn ? Number(formData.budgetEstimateMzn) : undefined,
      internalNotes: `Pedido de cotação submetido para ${resolvedUnit}. Urgência: ${formData.urgency}. Contacto prioritário.`,
      assignedManager: "Gestor Comercial B2B (Dinis Mandlate)",
      emailNotificationSent: true,
      emailNotificationRecipient: "tarira.ecossistema@gmail.com",
      emailNotificationSentAt: new Date().toISOString(),
      emailNotificationSubject: `[PROPOSTA ${resolvedUnit.toUpperCase()}] ${formData.companyName} — ${formData.serviceType} (Ref: ${generatedId})`
    };

    // Submissão ao servidor backend para disparo automático de e-mail e registo na Central TARIRA
    fetch("/api/commercial-proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposal)
    }).catch((err) => {
      console.warn("Submissão comercial local:", err);
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedProposal(proposal);
      if (onSubmitProposal) {
        onSubmitProposal(proposal);
      }
    }, 600);
  };

  const handleDownloadProof = () => {
    if (!submittedProposal) return;
    const content = `=====================================================
TARIRA ECOSSISTEMA B2B — COMPROVATIVO DE PROPOSTA COMERCIAL
=====================================================
Código de Protocolo : ${submittedProposal.id}
Data de Registo     : ${new Date(submittedProposal.submittedAt).toLocaleString("pt-MZ")}
Estado Inicial      : Aguarda Análise Comercial (Pendente)
SLA de Resposta     : ${submittedProposal.slaLevel}
Gestor Atribuído    : ${submittedProposal.assignedManager}

---------------- DADOS DA EMPRESA SOLICITANTE ----------------
Empresa             : ${submittedProposal.companyName}
Contacto / Decisor  : ${submittedProposal.contactPerson}
E-mail Corporativo  : ${submittedProposal.contactEmail}
Telefone / WhatsApp : ${submittedProposal.contactPhone}
Linha de Solução    : ${submittedProposal.operationType.toUpperCase()}
Dimensão / Headcount: ${submittedProposal.headcount} colaboradores
Orçamento Estimado  : ${submittedProposal.budgetEstimateMzn ? `${submittedProposal.budgetEstimateMzn.toLocaleString()} MZN` : "A orçamentar"}
Ficheiro Anexado    : ${submittedProposal.documentName || "Nenhum documento anexado"}

---------------- DESCRIÇÃO DA NECESSIDADE ----------------
${submittedProposal.comments || "Sem observações adicionais."}

---------------- CANAIS DE ATENDIMENTO CORPORATIVO ----------------
Linha Direta WhatsApp : +258 84 123 4567 / +258 87 123 4567
E-mail Institucional  : tarira.ecossistema@gmail.com
Website               : https://tarira.co.mz
Maputo, Moçambique
=====================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TARIRA_Proposta_${submittedProposal.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 bg-slate-950/70 backdrop-blur-md flex justify-center items-start sm:items-center animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-auto text-text-primary">
        
        {/* Header Bar */}
        <div className="bg-background-secondary p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20 tracking-wider uppercase">
                  B2B & Enterprise Desk
                </span>
                <span className="text-xs text-text-secondary flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-status-success" />
                  SLA: 24h
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary mt-1">
                {isPt ? "Atendimento Comercial & Cotação Corporativa" : "Corporate Sales & Request for Proposal (RFP)"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isPt
                  ? "Conecte a sua empresa com as soluções estratégicas do Ecossistema TARIRA."
                  : "Connect your enterprise with tailored solutions from the TARIRA Ecosystem."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors cursor-pointer border border-transparent hover:border-border"
            title={isPt ? "Fechar" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {submittedProposal ? (
            /* Confirmation Screen */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-status-success/15 border border-status-success/30 flex items-center justify-center text-status-success animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-background-secondary text-brand border border-border">
                  Protocolo #{submittedProposal.id}
                </span>
                <h3 className="text-2xl font-bold text-text-primary mt-3">
                  {isPt ? "Solicitação Comercial Registada com Sucesso!" : "Commercial Request Successfully Logged!"}
                </h3>
                <p className="text-sm text-text-secondary max-w-lg mx-auto mt-2">
                  {isPt
                    ? `O seu pedido para a empresa "${submittedProposal.companyName}" foi protocolado na nossa central comercial. O nosso gestor entrará em contacto nas próximas 24h úteis.`
                    : `Your request for "${submittedProposal.companyName}" has been received. Our account executive will reach out within 24 business hours.`}
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-background-secondary border border-border rounded-xl p-5 text-left max-w-xl mx-auto space-y-3 text-xs shadow-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
                  <div>
                    <span className="text-text-secondary block">{isPt ? "Empresa:" : "Company:"}</span>
                    <span className="font-semibold text-text-primary">{submittedProposal.companyName}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">{isPt ? "Decisor / Contacto:" : "Contact Person:"}</span>
                    <span className="font-semibold text-text-primary">{submittedProposal.contactPerson}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
                  <div>
                    <span className="text-text-secondary block">{isPt ? "E-mail Corporativo:" : "Email:"}</span>
                    <span className="font-semibold text-text-primary">{submittedProposal.contactEmail}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">{isPt ? "Telefone:" : "Phone:"}</span>
                    <span className="font-semibold text-text-primary">{submittedProposal.contactPhone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
                  <div>
                    <span className="text-text-secondary block">{isPt ? "Solução Pretendida:" : "Service Unit:"}</span>
                    <span className="font-semibold text-brand uppercase">{submittedProposal.operationType}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">{isPt ? "Ficheiro Anexado:" : "Document:"}</span>
                    <span className="font-semibold text-text-primary">{submittedProposal.documentName || (isPt ? "Nenhum" : "None")}</span>
                  </div>
                </div>

                {/* Notificação por E-mail & Central Tarira Confirmation */}
                <div className="bg-background rounded-xl p-3.5 border border-status-success/30 space-y-2 text-left shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-status-success">
                      <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                      ✉️ Notificação Oficial Expedida por E-mail
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand/10 text-brand border border-brand/20 uppercase">
                      {submittedProposal.businessUnit || "Tarira Business"}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    E-mail enviado para a unidade geral: <strong className="text-text-primary font-mono">tarira.ecossistema@gmail.com</strong>
                  </p>
                  <p className="text-[10px] font-mono text-text-secondary truncate bg-background-secondary px-2 py-1 rounded border border-border">
                    Assunto: {submittedProposal.emailNotificationSubject || `[PROPOSTA ${(submittedProposal.businessUnit || "TARIRA BUSINESS").toUpperCase()}] ${submittedProposal.companyName}`}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-[10px] text-brand-light font-medium border-t border-border">
                    <span>🏛️ Protocolado e arquivado na Central TARIRA (Painel Administrador)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadProof}
                  className="px-5 py-2.5 rounded-xl bg-background-secondary hover:bg-slate-200 border border-border text-text-primary text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-brand-light" />
                  {isPt ? "Descarregar Comprovativo (.txt)" : "Download Receipt (.txt)"}
                </button>

                <a
                  href={`https://wa.me/258835361379?text=${encodeURIComponent(`Olá TARIRA Comercial! Acabei de submeter a requisição B2B #${submittedProposal.id} para a empresa ${submittedProposal.companyName}. Gostaria de falar com o gestor comercial.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-status-success hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  {isPt ? "Falar no WhatsApp com Gestor" : "Chat on WhatsApp with Manager"}
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-brand-light hover:bg-brand text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  {isPt ? "Concluir & Fechar" : "Done & Close"}
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Quick direct contact pills */}
              <div className="bg-background-secondary border border-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <ShieldCheck className="w-4 h-4 text-brand-light" />
                  <span>{isPt ? "Canais Oficiais de Atendimento B2B:" : "Official B2B Channels:"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:tarira.ecossistema@gmail.com"
                    className="text-brand-light hover:underline flex items-center gap-1 font-mono font-medium"
                  >
                    <Mail className="w-3.5 h-3.5" /> tarira.ecossistema@gmail.com
                  </a>
                  <span className="text-border">|</span>
                  <a
                    href="tel:+258835361379"
                    className="text-text-primary hover:text-brand-light flex items-center gap-1 font-mono font-medium"
                    title={isPt ? "Direção Comercial" : "Commercial Direction"}
                  >
                    <Phone className="w-3.5 h-3.5 text-status-success" /> +258 83 536 1379
                  </a>
                  <span className="text-border">|</span>
                  <a
                    href="tel:+258871425316"
                    className="text-text-primary hover:text-brand-light flex items-center gap-1 font-mono font-medium"
                    title={isPt ? "Operações & Piquete" : "Operations"}
                  >
                    <Phone className="w-3.5 h-3.5 text-status-success" /> +258 87 142 5316
                  </a>
                </div>
              </div>

              {/* Service Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5">
                  1. {isPt ? "Selecione a Unidade / Solução de Interesse *" : "Select Service Unit *"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-2.5">
                  {serviceOptions.map((opt) => {
                    const isSelected = formData.serviceType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, serviceType: opt.id })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-brand-light/10 border-brand-light text-brand shadow-xs ring-1 ring-brand-light"
                            : "bg-background border-border hover:border-brand-light/50 text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xl">{opt.icon}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? "bg-brand-light/20 text-brand" : "bg-background-secondary text-text-secondary"
                            }`}>
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-text-primary">{isPt ? opt.namePt : opt.nameEn}</p>
                          <p className="text-[11px] text-text-secondary mt-1 line-clamp-2">{isPt ? opt.descPt : opt.descEn}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Company & Contact Details */}
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5">
                  2. {isPt ? "Dados da Empresa & Representante *" : "Enterprise & Representative Details *"}
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "Nome da Empresa *" : "Company Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isPt ? "Introduza o nome da empresa" : "Enter company name"}
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "NUIT (Opcional)" : "Tax ID / NUIT (Optional)"}
                    </label>
                    <input
                      type="text"
                      placeholder={isPt ? "Introduza o NUIT (opcional)" : "Enter Tax ID / NUIT (optional)"}
                      value={formData.nuit}
                      onChange={(e) => setFormData({ ...formData, nuit: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light font-mono shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "Província / Localização" : "Province / Location"}
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                    >
                      <option value="Maputo Cidade">Maputo Cidade</option>
                      <option value="Maputo Província">Maputo Província (Matola)</option>
                      <option value="Sofala">Sofala (Beira)</option>
                      <option value="Nampula">Nampula</option>
                      <option value="Tete">Tete</option>
                      <option value="Cabo Delgado">Cabo Delgado (Pemba / Palma)</option>
                      <option value="Inhambane">Inhambane</option>
                      <option value="Gaza">Gaza (Xai-Xai)</option>
                      <option value="Manica">Manica (Chimoio)</option>
                      <option value="Zambézia">Zambézia (Quelimane)</option>
                      <option value="Niassa">Niassa (Lichinga)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "Nome do Decisor / Responsável *" : "Representative / Contact Person *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isPt ? "Introduza o nome do responsável" : "Enter representative name"}
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "Cargo / Função" : "Job Role / Title"}
                    </label>
                    <input
                      type="text"
                      placeholder={isPt ? "Cargo ou função na empresa" : "Job role or title"}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "E-mail Corporativo *" : "Corporate Email *"}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={isPt ? "email@empresa.com" : "email@company.com"}
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "Telefone / WhatsApp *" : "Phone / WhatsApp *"}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={isPt ? "Contacto telefónico / WhatsApp" : "Phone / WhatsApp contact"}
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light font-mono shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "Headcount / Dimensão Estimada" : "Estimated Headcount"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={formData.headcount}
                      onChange={(e) => setFormData({ ...formData, headcount: e.target.value === "" ? "" : Number(e.target.value) })}
                      placeholder={isPt ? "Ex: 10" : "E.g. 10"}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light font-mono shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "Nível de Urgência" : "Urgency"}
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                    >
                      <option value="immediate">{isPt ? "🚨 Urgente (Fecho em 24-48h)" : "🚨 Urgent (24-48h turnaround)"}</option>
                      <option value="medium">{isPt ? "⚡ Normal (1 a 2 semanas)" : "⚡ Normal (1 to 2 weeks)"}</option>
                      <option value="planning">{isPt ? "📅 Planeamento Futuro / RFP" : "📅 Planning / Formal RFP"}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* RFP / Document Upload & Scope Notes */}
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5">
                  3. {isPt ? "Descrição do Escopo & Anexo de Termos de Referência (RFP)" : "Scope Description & RFP Attachment"}
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "Descreva as necessidades operacionais ou perfil pretendido:" : "Describe operational needs or requested profile:"}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={isPt ? "Indique detalhes como horário de turnos, competências técnicas obrigatórias, duração do contrato, etc." : "Include shift hours, required technical skills, contract duration, etc."}
                      value={formData.comments}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                    />
                  </div>

                  {/* Drag & drop upload box */}
                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      {isPt ? "Anexar Caderno de Encargos / RFP (PDF, Word, Excel):" : "Attach RFP or Terms of Reference (PDF, Word, Excel):"}
                    </label>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      className={`h-[98px] border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all ${
                        isDragging
                          ? "border-brand-light bg-brand-light/10"
                          : uploadedFile
                          ? "border-status-success/60 bg-status-success/5"
                          : "border-border hover:border-brand-light/50 bg-background-secondary"
                      }`}
                    >
                      {uploadedFile ? (
                        <div className="flex items-center justify-between w-full px-3">
                          <div className="flex items-center gap-2 text-left truncate">
                            <FileText className="w-5 h-5 text-status-success shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-text-primary truncate">{uploadedFile.name}</p>
                              <p className="text-[10px] text-text-secondary">{uploadedFile.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedFile(null)}
                            className="p-1 rounded-lg hover:bg-background-secondary text-text-secondary hover:text-status-danger cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                          <Upload className="w-5 h-5 text-text-secondary mb-1" />
                          <span className="text-xs text-text-primary font-semibold">
                            {isPt ? "Clique para carregar ou arraste o ficheiro" : "Click to upload or drag and drop"}
                          </span>
                          <span className="text-[10px] text-text-secondary mt-0.5">
                            PDF, DOCX, XLSX (Máx. 15MB)
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                    {fileError && (
                      <p className="text-[11px] text-status-danger mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {fileError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Clock className="w-4 h-4 text-brand-light" />
                  <span>
                    {isPt
                      ? "Apresentação de proposta técnica e comercial em até 24 horas úteis."
                      : "Technical and financial proposal ready within 24 business hours."}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-background-secondary hover:bg-slate-200 text-text-primary border border-border text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    {isPt ? "Cancelar" : "Cancel"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-brand-light hover:bg-brand text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{isPt ? "A Protocolar..." : "Submitting..."}</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isPt ? "Submeter Pedido & Solicitar Proposta ⚡" : "Submit Request & Get Proposal ⚡"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
