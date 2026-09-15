import React, { useState, useMemo } from "react";
import { 
  Building2, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Plus, 
  Trash2, 
  Eye, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Upload, 
  X,
  ExternalLink,
  ChevronDown,
  Briefcase
} from "lucide-react";
import { CommercialProposal } from "./types";

interface TariraCommercialAdminModuleProps {
  currentLang: "pt" | "en";
  proposals: CommercialProposal[];
  setProposals: React.Dispatch<React.SetStateAction<CommercialProposal[]>>;
  onAddProposal: (proposal: CommercialProposal) => void;
}

export const TariraCommercialAdminModule: React.FC<TariraCommercialAdminModuleProps> = ({
  currentLang,
  proposals = [],
  setProposals,
  onAddProposal
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);
  const [selectedProposalForDetail, setSelectedProposalForDetail] = useState<CommercialProposal | null>(null);

  // New Proposal Form State
  const [newForm, setNewForm] = useState<{
    companyName: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    operationType: string;
    headcount: number;
    slaLevel: string;
    source: string;
    comments: string;
    budgetEstimateMzn: number;
    assignedManager: string;
    documentName?: string;
    documentSize?: string;
    documentData?: string;
  }>({
    companyName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    operationType: "Atendimento ao Cliente, Helpdesk & Call Center",
    headcount: 10,
    slaLevel: "Ouro (99% de Disponibilidade)",
    source: "tender",
    comments: "",
    budgetEstimateMzn: 0,
    assignedManager: "Gestor Comercial"
  });

  const [isDraggingNewDoc, setIsDraggingNewDoc] = useState(false);

  const handleStatusChange = (id: string, newStatus: CommercialProposal["status"]) => {
    setProposals(prev =>
      prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const handleNotesChange = (id: string, notes: string) => {
    setProposals(prev =>
      prev.map(p => (p.id === id ? { ...p, internalNotes: notes } : p))
    );
  };

  const handleManagerChange = (id: string, manager: string) => {
    setProposals(prev =>
      prev.map(p => (p.id === id ? { ...p, assignedManager: manager } : p))
    );
  };

  const handleDeleteProposal = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
    if (selectedProposalForDetail?.id === id) {
      setSelectedProposalForDetail(null);
    }
  };

  const handleDownloadDoc = (proposal: CommercialProposal) => {
    if (!proposal.documentData) {
      // If no raw base64 data, generate a demo text representation
      const dummyContent = `TARIRA PROPOSTA COMERCIAL & CADERNO DE ENCARGOS\nID: ${proposal.id}\nEmpresa: ${proposal.companyName}\nOperação: ${proposal.operationType}\nHeadcount: ${proposal.headcount}\nSLA: ${proposal.slaLevel}\nData: ${proposal.submittedAt}\nContacto: ${proposal.contactEmail} | ${proposal.contactPhone}\nNotas: ${proposal.comments || "Sem observações adicionais"}`;
      const blob = new Blob([dummyContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = proposal.documentName || `Proposta_${proposal.companyName.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const link = document.createElement("a");
    link.href = proposal.documentData;
    link.download = proposal.documentName || `Documento_${proposal.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (file: File) => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      alert("Por favor selecione um documento exclusivamente em formato PDF (.pdf).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert(`O ficheiro PDF excede o tamanho máximo permitido de 2MB (2 Megabytes). O ficheiro selecionado possui ${(file.size / (1024 * 1024)).toFixed(2)} MB. Por favor carregue um documento com até 2MB.`);
      return;
    }

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNewForm(prev => ({
        ...prev,
        documentName: file.name,
        documentSize: formattedSize,
        documentData: result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.companyName || !newForm.contactEmail) {
      alert("Por favor preencha o Nome da Empresa e o Email.");
      return;
    }

    const newProposal: CommercialProposal = {
      id: `PROP-${Date.now().toString().slice(-6)}`,
      source: newForm.source,
      companyName: newForm.companyName,
      contactPerson: newForm.contactPerson || newForm.companyName,
      contactEmail: newForm.contactEmail,
      contactPhone: newForm.contactPhone || "+258 84 000 0000",
      operationType: newForm.operationType,
      headcount: newForm.headcount,
      slaLevel: newForm.slaLevel,
      comments: newForm.comments,
      budgetEstimateMzn: newForm.budgetEstimateMzn,
      assignedManager: newForm.assignedManager,
      documentName: newForm.documentName,
      documentSize: newForm.documentSize,
      documentData: newForm.documentData,
      submittedAt: new Date().toISOString(),
      status: "pending",
      internalNotes: `Criado manualmente pelo painel comercial. Gestor: ${newForm.assignedManager}`
    };

    onAddProposal(newProposal);
    setIsNewProposalModalOpen(false);
    setNewForm({
      companyName: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      operationType: "Atendimento ao Cliente, Helpdesk & Call Center",
      headcount: 10,
      slaLevel: "Ouro (99% de Disponibilidade)",
      source: "tender",
      comments: "",
      budgetEstimateMzn: 0,
      assignedManager: "Gestor Comercial",
      documentName: undefined,
      documentSize: undefined,
      documentData: undefined
    });
  };

  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const matchesSearch = 
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.contactPerson && p.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contactPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.operationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.documentName && p.documentName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesOperation = operationFilter === "all" || p.operationType === operationFilter;

      return matchesSearch && matchesStatus && matchesOperation;
    });
  }, [proposals, searchTerm, statusFilter, operationFilter]);

  const stats = useMemo(() => {
    const total = proposals.length;
    const pending = proposals.filter(p => p.status === "pending").length;
    const underReview = proposals.filter(p => p.status === "under_review").length;
    const sent = proposals.filter(p => p.status === "proposal_sent").length;
    const approved = proposals.filter(p => p.status === "approved").length;
    const withDocs = proposals.filter(p => !!p.documentName).length;
    const totalHeadcount = proposals.reduce((acc, p) => acc + (p.headcount || 0), 0);

    return { total, pending, underReview, sent, approved, withDocs, totalHeadcount };
  }, [proposals]);

  const getStatusBadge = (status: CommercialProposal["status"]) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-status-warning/15 text-status-warning border border-status-warning/30 flex items-center gap-1">🟡 Pendente / Novo</span>;
      case "under_review":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-light/15 text-brand-light border border-brand-light/30 flex items-center gap-1">🔍 Em Análise Comercial</span>;
      case "proposal_sent":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand/15 text-brand border border-brand/30 flex items-center gap-1">📤 Proposta Enviada</span>;
      case "approved":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-status-success/15 text-status-success border border-status-success/30 flex items-center gap-1">🟢 Aprovado / Contrato</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-status-danger/15 text-status-danger border border-status-danger/30 flex items-center gap-1">🔴 Recusado</span>;
      case "archived":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-background-secondary text-text-secondary border border-border flex items-center gap-1">📁 Arquivado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-background-secondary text-text-secondary border border-border">{status}</span>;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "outsourcing":
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-status-warning/10 text-status-warning border border-status-warning/30">Outsourcing Web</span>;
      case "tender":
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">Concurso / RFP</span>;
      case "direct_contact":
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-status-success/10 text-status-success border border-status-success/30">Contacto Direto</span>;
      case "b2b_recruitment":
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50 text-brand border border-blue-200">Recrutamento B2B</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-background-secondary text-text-secondary border border-border">{source}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background-secondary p-6 rounded-3xl border border-border shadow-sm">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-mono font-bold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>MÓDULO DE GESTÃO COMERCIAL B2B & CONCURSOS</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary">
            {currentLang === "pt" ? "Menu da Comercial — Pedidos de Propostas & Concursos" : "Commercial Desk — Proposals & Tender Submissions"}
          </h2>
          <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
            Central de receção e análise de propostas de outsourcing, cadernos de encargos em Word/PDF, concursos públicos e solicitações de gestão operacional de empresas em Moçambique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewProposalModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-[#172554] text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Nova Proposta / Concurso</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-background border border-border text-left space-y-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-text-secondary font-bold block">Total Propostas</span>
          <span className="text-2xl font-black text-text-primary">{stats.total}</span>
          <span className="text-[10px] text-text-secondary block font-mono">Recebidas no sistema</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-status-warning/30 text-left space-y-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-status-warning font-bold block">Pendentes / Novas</span>
          <span className="text-2xl font-black text-status-warning">{stats.pending}</span>
          <span className="text-[10px] text-text-secondary block font-mono">Aguardam triagem</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-brand-light/30 text-left space-y-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-brand-light font-bold block">Em Análise</span>
          <span className="text-2xl font-black text-brand-light">{stats.underReview}</span>
          <span className="text-[10px] text-text-secondary block font-mono">Com gestor comercial</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-left space-y-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-indigo-700 font-bold block">Propostas Enviadas</span>
          <span className="text-2xl font-black text-indigo-700">{stats.sent}</span>
          <span className="text-[10px] text-text-secondary block font-mono">Em negociação</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-status-success/30 text-left space-y-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-status-success font-bold block">Aprovadas / Contratos</span>
          <span className="text-2xl font-black text-status-success">{stats.approved}</span>
          <span className="text-[10px] text-text-secondary block font-mono">Operações ativas</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-left space-y-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block">Docs Anexados</span>
          <span className="text-2xl font-black text-purple-700">{stats.withDocs}</span>
          <span className="text-[10px] text-text-secondary block font-mono">Word / PDF prontos</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-background border border-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por empresa, telefone, email ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary outline-none focus:border-brand"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-background-secondary px-3 py-1.5 rounded-xl border border-border text-xs">
            <Filter className="w-3.5 h-3.5 text-brand" />
            <span className="text-text-secondary text-[11px] font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-text-primary text-xs outline-none cursor-pointer"
            >
              <option value="all">Todos os Estados</option>
              <option value="pending">Pendentes</option>
              <option value="under_review">Em Análise</option>
              <option value="proposal_sent">Proposta Enviada</option>
              <option value="approved">Aprovadas / Contrato</option>
              <option value="rejected">Recusadas</option>
              <option value="archived">Arquivadas</option>
            </select>
          </div>

          {/* Operation Filter */}
          <div className="flex items-center gap-1.5 bg-background-secondary px-3 py-1.5 rounded-xl border border-border text-xs">
            <span className="text-text-secondary text-[11px] font-medium">Operação:</span>
            <select
              value={operationFilter}
              onChange={(e) => setOperationFilter(e.target.value)}
              className="bg-transparent text-text-primary text-xs outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">Todas as Operações</option>
              <option value="Atendimento ao Cliente, Helpdesk & Call Center">Call Center & Helpdesk</option>
              <option value="Operações de Supermercados, Retalho & Caixas / Reposição">Supermercados & Retalho</option>
              <option value="Logística, Distribuição & Gestão de Armazéns">Logística & Armazéns</option>
              <option value="Telecomunicações & Redes / TI de Campo">Telecomunicações & TI</option>
              <option value="Serviços Financeiros, Banca & Backoffice GESC">Banca & Finanças GESC</option>
              <option value="Limpeza Industrial, Hospitalar & Facility Services">Facility & Limpeza Industrial</option>
              <option value="Construção Civil, Manutenção Predial & Técnica">Construção & Manutenção</option>
              <option value="Mineração, Petróleo & Gás (Oil & Gas)">Mineração & Oil & Gas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals List Table / Cards */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-background border border-border text-center space-y-3 shadow-sm">
          <Briefcase className="w-12 h-12 text-text-secondary mx-auto" />
          <h3 className="text-base font-bold text-text-primary">Nenhum pedido de proposta comercial encontrado</h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            {searchTerm || statusFilter !== "all" || operationFilter !== "all"
              ? "Tente ajustar os filtros de pesquisa para visualizar outros registos."
              : "As solicitações de terceirização e documentos de concurso submetidos pelos clientes aparecerão aqui automaticamente."}
          </p>
          <button
            onClick={() => setIsNewProposalModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand text-[#172554] font-bold text-xs hover:bg-brand-light transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Nova Proposta Manual</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`p-5 rounded-2xl border transition-all text-left space-y-4 bg-background shadow-sm ${
                proposal.status === "pending"
                  ? "border-status-warning/40"
                  : proposal.status === "approved"
                  ? "border-status-success/40"
                  : "border-border hover:border-text-secondary/40"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                    {proposal.id}
                  </span>
                  {getSourceBadge(proposal.source)}
                  <h3 className="text-base font-bold text-text-primary">{proposal.companyName}</h3>
                  {proposal.contactPerson && proposal.contactPerson !== proposal.companyName && (
                    <span className="text-xs text-text-secondary font-medium">
                      ({proposal.contactPerson})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
                    <Clock className="w-3.5 h-3.5 text-text-secondary" />
                    <span>{new Date(proposal.submittedAt).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {getStatusBadge(proposal.status)}
                </div>
              </div>

              {/* Card Body - Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                {/* Operation Specs */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-text-secondary font-bold block">Área & Escala:</span>
                  <div className="font-bold text-text-primary text-xs">{proposal.operationType}</div>
                  <div className="flex items-center gap-2 text-text-secondary font-mono text-[11px]">
                    <span className="bg-background-secondary border border-border px-2 py-0.5 rounded text-text-primary">👥 {proposal.headcount} Colaboradores</span>
                    <span className="bg-blue-50 text-status-warning border border-status-warning/30 px-2 py-0.5 rounded">SLA: {proposal.slaLevel.split(" ")[0]}</span>
                  </div>
                </div>

                {/* Direct Contacts */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-text-secondary font-bold block">Contactos Comerciais:</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <Mail className="w-3.5 h-3.5 text-brand shrink-0" />
                    <a href={`mailto:${proposal.contactEmail}`} className="hover:underline text-brand truncate">
                      {proposal.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-primary font-mono">
                    <Phone className="w-3.5 h-3.5 text-status-success shrink-0" />
                    <a href={`tel:${proposal.contactPhone}`} className="hover:underline">
                      {proposal.contactPhone}
                    </a>
                  </div>
                </div>

                {/* Attached Document (Word / PDF) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-text-secondary font-bold block">Documento Anexado (Word/PDF):</span>
                  {proposal.documentName ? (
                    <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-purple-700 shrink-0" />
                        <div className="truncate text-left">
                          <span className="text-xs font-bold text-purple-900 block truncate" title={proposal.documentName}>
                            {proposal.documentName}
                          </span>
                          <span className="text-[10px] text-purple-700 font-mono block">
                            {proposal.documentSize || "Documento anexado"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadDoc(proposal)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-[#172554] text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 shadow-sm cursor-pointer"
                        title="Descarregar ficheiro para análise"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descarregar</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-text-secondary italic text-[11px] block py-1">
                      Nenhum ficheiro anexado (proposta via formulário)
                    </span>
                  )}
                </div>

                {/* Assigned Manager & Status Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-text-secondary font-bold block">Gestão & Status:</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={proposal.status}
                      onChange={(e) => handleStatusChange(proposal.id, e.target.value as CommercialProposal["status"])}
                      className="bg-background border border-border text-text-primary rounded-lg px-2.5 py-1 text-xs outline-none focus:border-brand w-full cursor-pointer font-medium"
                    >
                      <option value="pending">🟡 Pendente</option>
                      <option value="under_review">🔍 Em Análise Comercial</option>
                      <option value="proposal_sent">📤 Proposta Enviada</option>
                      <option value="approved">🟢 Aprovado / Contrato</option>
                      <option value="rejected">🔴 Recusado</option>
                      <option value="archived">📁 Arquivado</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Gestor Responsável..."
                    value={proposal.assignedManager || ""}
                    onChange={(e) => handleManagerChange(proposal.id, e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-[11px] text-text-primary placeholder:text-text-secondary outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Special Details / Specifications */}
              {proposal.comments && (
                <div className="p-3 rounded-xl bg-background-secondary border border-border text-xs text-text-primary">
                  <span className="font-bold text-text-secondary block mb-0.5">Detalhes / Especificações do Cliente:</span>
                  <p className="italic text-text-primary whitespace-pre-wrap">{proposal.comments}</p>
                </div>
              )}

              {/* Internal Commercial Notes / CRM */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2 border-t border-border">
                <span className="text-[10px] font-mono uppercase text-brand font-bold shrink-0">Notas Internas CRM:</span>
                <input
                  type="text"
                  placeholder="Adicionar notas internas (ex: agendada reunião para 24/08, proposta orçada em 450.000 MT/mês)..."
                  value={proposal.internalNotes || ""}
                  onChange={(e) => handleNotesChange(proposal.id, e.target.value)}
                  className="flex-1 bg-background border border-border text-text-primary rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand w-full"
                />

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  {/* WhatsApp Quick Action */}
                  <a
                    href={`https://wa.me/${proposal.contactPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Olá ${proposal.contactPerson || proposal.companyName}, recebemos o vosso pedido de proposta para a área de ${proposal.operationType} (${proposal.headcount} colaboradores) na TARIRA Outsourcing. Estamos a analisar o vosso caderno de encargos para envio da proposta técnica.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-status-success/15 text-status-success hover:bg-status-success hover:text-[#172554] transition-all text-xs font-bold flex items-center gap-1 cursor-pointer border border-status-success/30"
                    title="Enviar mensagem WhatsApp comercial pré-formatada"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Email Quick Action */}
                  <a
                    href={`mailto:${proposal.contactEmail}?subject=${encodeURIComponent(
                      `TARIRA Outsourcing — Proposta de Gestão Operacional (${proposal.operationType})`
                    )}`}
                    className="p-1.5 rounded-lg bg-brand-light/15 text-brand-light hover:bg-brand-light hover:text-[#172554] transition-all text-xs font-bold flex items-center gap-1 cursor-pointer border border-brand-light/30"
                    title="Enviar e-mail comercial"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>E-mail</span>
                  </a>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteProposal(proposal.id)}
                    className="p-1.5 rounded-lg bg-status-danger/10 text-status-danger hover:bg-status-danger hover:text-[#172554] transition-all text-xs cursor-pointer border border-status-danger/20"
                    title="Eliminar este pedido"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Registar Nova Proposta / Concurso Manual */}
      {isNewProposalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex justify-center items-center">
          <div className="bg-background border border-border p-6 sm:p-8 rounded-3xl max-w-2xl w-full text-left space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsNewProposalModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background-secondary text-text-secondary hover:text-text-primary flex items-center justify-center font-bold border border-border cursor-pointer"
            >
              ✕
            </button>

            <div className="border-b border-border pb-3">
              <span className="text-[10px] font-mono font-bold text-brand uppercase tracking-widest block mb-1">REGISTO COMERCIAL MANUAL</span>
              <h3 className="text-xl font-bold text-text-primary">Adicionar Pedido de Proposta ou Concurso B2B</h3>
              <p className="text-xs text-text-secondary mt-1">
                Registe manualmente um concurso recebido por e-mail, telefone ou concurso público no jornal/portal.
              </p>
            </div>

            <form onSubmit={handleCreateProposalSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-text-primary font-bold block">Nome da Empresa / Entidade *</label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={newForm.companyName}
                  onChange={(e) => setNewForm({ ...newForm, companyName: e.target.value })}
                  className="w-full bg-background border border-border text-text-primary rounded-xl p-3 outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-primary font-bold block">Pessoa de Contacto / Cargo</label>
                <input
                  type="text"
                  placeholder=""
                  value={newForm.contactPerson}
                  onChange={(e) => setNewForm({ ...newForm, contactPerson: e.target.value })}
                  className="w-full bg-background border border-border text-text-primary rounded-xl p-3 outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-primary font-bold block">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  placeholder=""
                  value={newForm.contactEmail}
                  onChange={(e) => setNewForm({ ...newForm, contactEmail: e.target.value })}
                  className="w-full bg-background border border-border text-text-primary rounded-xl p-3 outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-primary font-bold block">Telefone de Contacto (Moçambique)</label>
                <input
                  type="text"
                  placeholder=""
                  value={newForm.contactPhone}
                  onChange={(e) => setNewForm({ ...newForm, contactPhone: e.target.value })}
                  className="w-full bg-background border border-border text-text-primary rounded-xl p-3 outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-primary font-bold block">Tipo de Operação Requerida</label>
                <select
                  value={newForm.operationType}
                  onChange={(e) => setNewForm({ ...newForm, operationType: e.target.value })}
                  className="w-full bg-background border border-border text-text-primary rounded-xl p-3 outline-none focus:border-brand"
                >
                  <option value="Atendimento ao Cliente, Helpdesk & Call Center">🎧 Atendimento ao Cliente, Helpdesk & Call Center</option>
                  <option value="Operações de Supermercados, Retalho & Caixas / Reposição">🛒 Operações de Supermercados, Retalho & Caixas / Reposição</option>
                  <option value="Logística, Distribuição & Gestão de Armazéns">📦 Logística, Distribuição & Gestão de Armazéns</option>
                  <option value="Telecomunicações & Redes / TI de Campo">📡 Telecomunicações & Redes / TI de Campo</option>
                  <option value="Serviços Financeiros, Banca & Backoffice GESC">🏦 Serviços Financeiros, Banca & Backoffice GESC</option>
                  <option value="Limpeza Industrial, Hospitalar & Facility Services">🧹 Limpeza Industrial, Hospitalar & Facility Services</option>
                  <option value="Construção Civil, Manutenção Predial & Técnica">🏗️ Construção Civil, Manutenção Predial & Técnica</option>
                  <option value="Gestão Condominial & Manutenção de Infraestruturas">🏢 Gestão Condominial & Manutenção de Infraestruturas</option>
                  <option value="Hotelaria, Restauração & Catering Corporativo">🍽️ Hotelaria, Restauração & Catering Corporativo</option>
                  <option value="Segurança Privada, Portaria & Controlo de Acessos">🛡️ Segurança Privada, Portaria & Controlo de Acessos</option>
                  <option value="Mineração, Petróleo & Gás (Oil & Gas)">⛏️ Mineração, Petróleo & Gás (Oil & Gas)</option>
                  <option value="Agronegócio & Agro-Processamento">🌱 Agronegócio & Agro-Processamento</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-text-primary font-bold block">Origem do Pedido</label>
                <select
                  value={newForm.source}
                  onChange={(e) => setNewForm({ ...newForm, source: e.target.value })}
                  className="w-full bg-background border border-border text-text-primary rounded-xl p-3 outline-none focus:border-brand"
                >
                  <option value="tender">📜 Concurso Público / RFP</option>
                  <option value="outsourcing">🏢 Proposta Outsourcing</option>
                  <option value="direct_contact">📞 Contacto Telefónico / WhatsApp</option>
                  <option value="b2b_recruitment">🎯 Recrutamento e Seleção B2B</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-text-primary font-bold block">Headcount: {newForm.headcount} Colaboradores</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={newForm.headcount}
                  onChange={(e) => setNewForm({ ...newForm, headcount: Number(e.target.value) })}
                  className="w-full bg-background border border-border text-text-primary rounded-xl p-3 outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-primary font-bold block">Nível de SLA</label>
                <select
                  value={newForm.slaLevel}
                  onChange={(e) => setNewForm({ ...newForm, slaLevel: e.target.value })}
                  className="w-full bg-background border border-border text-text-primary rounded-xl p-3 outline-none focus:border-brand"
                >
                  <option value="Bronze (90% de Disponibilidade)">Bronze (90%)</option>
                  <option value="Prata (95% de Disponibilidade)">Prata (95%)</option>
                  <option value="Ouro (99% de Disponibilidade)">Ouro (99% - Recomendado)</option>
                  <option value="Personalizado (Concurso / RFP)">Personalizado Concurso</option>
                </select>
              </div>

              {/* Upload PDF */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-text-primary font-bold block">Anexar Documento / Caderno de Encargos em PDF (Máx. 2MB)</label>
                {!newForm.documentName ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingNewDoc(true); }}
                    onDragLeave={() => setIsDraggingNewDoc(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingNewDoc(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                      isDraggingNewDoc ? "border-brand bg-brand/10" : "border-border bg-background-secondary hover:border-brand/50"
                    }`}
                    onClick={() => {
                      const input = document.getElementById("admin-new-doc-upload") as HTMLInputElement;
                      if (input) input.click();
                    }}
                  >
                    <input
                      id="admin-new-doc-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="flex flex-col items-center gap-1 text-text-secondary">
                      <Upload className="w-5 h-5 text-brand" />
                      <p className="font-semibold text-text-primary">Clique para anexar ou arraste o ficheiro PDF</p>
                      <p className="text-[10px] text-text-secondary">Cadernos de encargos, propostas técnicas ou termos de referência (Formato PDF • Máx: 2MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-700" />
                      <span className="font-bold text-purple-900">{newForm.documentName}</span>
                      <span className="text-[10px] text-purple-700 font-mono">({newForm.documentSize})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewForm(prev => ({ ...prev, documentName: undefined, documentSize: undefined, documentData: undefined }))}
                      className="text-status-danger hover:text-red-700 p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-text-primary font-bold block">Observações e Detalhes da Proposta</label>
                <textarea
                  rows={2}
                  placeholder="Insira detalhes sobre requisitos técnicos, turnos, perfil dos colaboradores..."
                  value={newForm.comments}
                  onChange={(e) => setNewForm({ ...newForm, comments: e.target.value })}
                  className="w-full bg-background border border-border text-text-primary rounded-xl p-3 outline-none focus:border-brand"
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewProposalModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-background-secondary text-text-secondary text-xs font-bold hover:bg-border border border-border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-[#172554] text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Salvar no Menu Comercial →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
