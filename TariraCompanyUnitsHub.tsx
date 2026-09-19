import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  Wrench, 
  Headphones, 
  TrendingUp, 
  Mail, 
  PhoneCall, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Upload, 
  Send, 
  X, 
  ChevronRight, 
  CreditCard,
  Building,
  Check,
  AlertCircle
} from "lucide-react";
import {
  TariraConnectIcon,
  TariraRecruitIcon,
  TariraOutsourcingIcon,
  TariraConsultingIcon,
  TariraStudioIcon
} from "./TariraUnitIcons";
import {
  ACCOUNT_PLAN_ID,
  ACCOUNT_PLAN_NAME,
  HOME_PLAN_ID,
  HOME_PLAN_NAME,
  ACCOUNT_MAINTENANCE_FEE_MZN,
  ACCOUNT_TRIAL_DAYS,
  ACCOUNT_BILLING_NOTE,
  ACCOUNT_BENEFITS,
  HOME_ACCOUNT_BENEFITS,
  formatMzn,
  resolveMaintenanceFee,
  resolveAccountBenefits,
  resolveHomeBenefits
} from "./accountPlan";
import { Client, CommercialProposal } from "./types";

interface TariraCompanyUnitsHubProps {
  client: Client;
  onUpdateClient?: (updated: Client) => void;
  onNavigate?: (tab: string) => void;
  onAddCommercialProposal?: (proposal: CommercialProposal) => void;
  currentLang?: "pt" | "en";
}

// Os antigos planos B2B/Condomínio foram eliminados. Existe apenas a
// MANUTENÇÃO DE CONTA — valor único, igual para Empresa e Condomínio, com a
// conta Particular/Lar gratuita. Ver accountPlan.ts.

// As unidades de negócio com dados de contato direto e ícones oficiais
const BUSINESS_UNITS = [
  {
    id: "recruit",
    name: "TARIRA Recruit",
    tagline: "Recrutamento & Hunting de Quadros Especializados",
    sla: "48 a 72 Horas",
    department: "Departamento de Recrutamento & Seleção Executiva",
    email: "tarira.ecossistema@gmail.com",
    phone: "+258 84 330 0001",
    description: "Hunting de talentos executivos, auditagem de credenciais, entrevistas técnicas de competências e apresentação célere de profissionais qualificados.",
    icon: TariraRecruitIcon,
    accentColor: "text-blue-700",
    borderColor: "border-blue-500/30",
    bgGradient: "from-blue-500/10 to-transparent",
    catalogTab: "profissionais",
    catalogLabel: "Catálogo de Talentos e Quadros",
    subjects: [
      "Requisição de Vaga Executiva / Hunting",
      "Contratação de Quadro Permanente",
      "Contratação Temporária por Projeto",
      "Auditoria de Competências / Avaliação de Equipa",
      "Outro Assunto de Recrutamento"
    ]
  },
  {
    id: "connect",
    name: "TARIRA Connect",
    tagline: "Ofícios Técnicos, Engenharia & Manutenção Predial",
    sla: "2 a 24 Horas",
    department: "Gabinete de Operações Técnicas & Piquete de Campo",
    email: "tarira.ecossistema@gmail.com",
    phone: "+258 84 330 0002",
    description: "Eletricistas qualificados, técnicos de AVAC/climatização, canalizadores industriais e engenheiros de campo para intervenções pontuais ou contratos contínuos.",
    icon: TariraConnectIcon,
    accentColor: "text-sky-400",
    borderColor: "border-sky-500/30",
    bgGradient: "from-sky-500/10 to-transparent",
    catalogTab: "connect_sub",
    catalogLabel: "Ver Técnicos & Piquete Connect",
    subjects: [
      "Intervenção Técnica de Manutenção Predial",
      "Piquete de Eletricidade / Climatização",
      "Contrato Mensal de Manutenção Preventiva",
      "Engenharia de Campo / Fiscalização de Obras",
      "Outra Intervenção Técnica"
    ]
  },
  {
    id: "outsourcing",
    name: "TARIRA Outsourcing (Business)",
    tagline: "Atendimento B2B, Helpdesk & Contact Center",
    sla: "Dimensionamento em 24h",
    department: "Direção de Operações & BPO Corporativo",
    email: "tarira.ecossistema@gmail.com",
    phone: "+258 84 330 0003",
    description: "Alocação e gestão de equipas dedicadas de SAC, operadores de call center, suporte técnico nível 1 e 2, e back-office operacional para a sua empresa.",
    icon: TariraOutsourcingIcon,
    accentColor: "text-emerald-600",
    borderColor: "border-emerald-500/30",
    bgGradient: "from-emerald-500/10 to-transparent",
    catalogTab: "business_sub",
    catalogLabel: "Conhecer Soluções Outsourcing",
    subjects: [
      "Equipa Dedicada de Atendimento ao Cliente",
      "Outsourcing de Helpdesk / Suporte Técnico",
      "Operação de Contact Center Multicanal",
      "Back-office Operacional & Processamento",
      "Outro Serviço de Outsourcing"
    ]
  },
  {
    id: "consulting",
    name: "TARIRA Consulting",
    tagline: "Consultoria Operacional & Diagnóstico de Eficiência",
    sla: "Diagnóstico Inicial em 5 Dias",
    department: "Gabinete de Estratégia & Eficiência Operacional",
    email: "tarira.ecossistema@gmail.com",
    phone: "+258 84 330 0004",
    description: "Mapeamento de processos, eliminação de desperdícios operacionais, automação de fluxos de trabalho e dimensionamento eficiente de quadros.",
    icon: TariraConsultingIcon,
    accentColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    bgGradient: "from-purple-500/10 to-transparent",
    catalogTab: "consulting_sub",
    catalogLabel: "Portfólio Consulting",
    subjects: [
      "Diagnóstico de Eficiência Operacional",
      "Mapeamento & Otimização de Processos",
      "Desenho de Estrutura Organizacional & Cargos",
      "Automação de Fluxos de Trabalho",
      "Outra Assessoria Estratégica"
    ]
  },
  {
    id: "studio",
    name: "TARIRA Studio",
    tagline: "SaaS & Automações Digitais sob Medida",
    sla: "Protótipo em 7 a 14 Dias",
    department: "Laboratório de Software & Inovação Tecnológica",
    email: "tarira.ecossistema@gmail.com",
    phone: "+258 84 330 0005",
    description: "Engenharia ágil de microserviços, automações de processos, integrações M-Pesa/e-Mola e criação de MVPs escaláveis para médias e grandes empresas.",
    icon: TariraStudioIcon,
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgGradient: "from-amber-500/10 to-transparent",
    catalogTab: "studio_sub",
    catalogLabel: "Explorar Soluções Studio",
    subjects: [
      "Desenvolvimento de MVP / Software Lab",
      "Integração de Pagamentos M-Pesa / Bancários",
      "Automação de Processos Internos",
      "Plataforma Digital Dedicada",
      "Outro Projeto de Tecnologia"
    ]
  }
];

export const TariraCompanyUnitsHub: React.FC<TariraCompanyUnitsHubProps> = ({
  client,
  onUpdateClient,
  onNavigate,
  onAddCommercialProposal,
  currentLang = "pt"
}) => {
  // Estado para o modal de contacto direto
  const [selectedUnitForContact, setSelectedUnitForContact] = useState<typeof BUSINESS_UNITS[0] | null>(null);
  
  // Estado do formulário de contacto da unidade
  const [contactForm, setContactForm] = useState({
    subject: "",
    urgency: "normal", // normal, alta, critica
    headcount: "1",
    description: "",
    contactName: client.contactPerson || client.name,
    contactRole: client.contactPersonTitle || "Responsável Operacional",
    contactEmail: client.email || "",
    contactPhone: client.phone || "",
    documentName: "",
    documentSize: "",
    documentData: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{ protocol: string; unitName: string } | null>(null);

  // Estado do modal de detalhes da conta
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planSuccessMsg, setPlanSuccessMsg] = useState<string | null>(null);

  // Valor de manutenção e vantagens carregados do servidor (alteráveis pelo
  // administrador em "Manutenção de Conta"). Começam com os valores por
  // omissão e são substituídos assim que o GET responder, para que qualquer
  // alteração apareça aqui sem necessidade de nova versão do código.
  const [maintenanceFee, setMaintenanceFee] = useState<number>(ACCOUNT_MAINTENANCE_FEE_MZN);
  const [accountBenefits, setAccountBenefits] = useState<string[]>(ACCOUNT_BENEFITS);
  const [homeBenefits, setHomeBenefits] = useState<string[]>(HOME_ACCOUNT_BENEFITS);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/registration-plans")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && Array.isArray(data.plans) && data.plans.length > 0) {
          setMaintenanceFee(resolveMaintenanceFee(data.plans));
          setAccountBenefits(resolveAccountBenefits(data.plans));
          setHomeBenefits(resolveHomeBenefits(data.plans));
        }
      })
      .catch((err) => console.warn("[TariraCompanyUnitsHub] Falha ao carregar valor de manutenção:", err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Determina o tipo de conta do cliente
  const isCondo = client.type === "condo";
  const isLarParticular = client.type === "residential" || client.type === "individual";
  // Contas Empresa e Condomínio pagam a mesma manutenção; Particular/Lar é gratuita.
  const isPaidAccount = !isLarParticular;
  const accountFee = isPaidAccount ? maintenanceFee : 0;
  const accountLabel = isPaidAccount ? ACCOUNT_PLAN_NAME : HOME_PLAN_NAME;
  const activeBenefits = isPaidAccount ? accountBenefits : homeBenefits;
  const accountStatus = client.planStatus || "active";

  // Contas Particular/Lar só interagem diretamente com a Tarira Connect —
  // as outras unidades (Recruit, Outsourcing, Consulting, Studio) são B2B
  // e não devem aparecer aqui para este tipo de conta.
  const visibleBusinessUnits = isLarParticular
    ? BUSINESS_UNITS.filter(u => u.id === "connect")
    : BUSINESS_UNITS;

  // Handler de abertura do modal de contacto para unidade específica
  const handleOpenContactModal = (unit: typeof BUSINESS_UNITS[0]) => {
    setSelectedUnitForContact(unit);
    setContactForm(prev => ({
      ...prev,
      subject: unit.subjects[0],
      contactName: client.contactPerson || client.name,
      contactEmail: client.email || prev.contactEmail,
      contactPhone: client.phone || prev.contactPhone
    }));
    setSubmissionSuccess(null);
  };

  // Upload de ficheiro anexo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("O ficheiro deve ter no máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setContactForm(prev => ({
        ...prev,
        documentName: file.name,
        documentSize: `${(file.size / 1024).toFixed(1)} KB`,
        documentData: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submissão do contacto direto com a unidade
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitForContact) return;

    setIsSubmitting(true);
    const protocolNumber = `INT-${selectedUnitForContact.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Criar proposta / registo de interação para a central de administração
    const newProposal: CommercialProposal = {
      id: protocolNumber,
      source: "company_profile_hub",
      companyName: client.name,
      contactPerson: contactForm.contactName,
      contactEmail: contactForm.contactEmail || client.email || "comercial@empresa.co.mz",
      contactPhone: contactForm.contactPhone || client.phone,
      operationType: `${selectedUnitForContact.name} - ${contactForm.subject}`,
      headcount: parseInt(contactForm.headcount, 10) || 1,
      slaLevel: contactForm.urgency === "critica" ? "Crítico (Intervenção Imediata)" : contactForm.urgency === "alta" ? "Alta Prioridade (24h)" : `Normal (${selectedUnitForContact.sla})`,
      comments: contactForm.description,
      documentName: contactForm.documentName || undefined,
      documentSize: contactForm.documentSize || undefined,
      documentData: contactForm.documentData || undefined,
      submittedAt: new Date().toISOString(),
      status: "pending",
      internalNotes: `Contacto direto iniciado a partir do Painel do Cliente (${client.name} - ID ${client.id}) para a unidade ${selectedUnitForContact.name}. Departamento responsável: ${selectedUnitForContact.department}. Protocolo: ${protocolNumber}.`
    };

    try {
      // 1. Enviar para a API de propostas comerciais
      await fetch("/api/commercial-proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProposal)
      });
    } catch (err) {
      console.warn("Aviso ao guardar proposta via API (continua com estado local):", err);
    }

    try {
      // 2. Registar mensagem de contacto para monitoramento do admin
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.contactName,
          company: client.name,
          email: contactForm.contactEmail,
          phone: contactForm.contactPhone,
          serviceType: selectedUnitForContact.id,
          notes: `[Protocolo ${protocolNumber}] Pedido para ${selectedUnitForContact.name} (${contactForm.subject}). Urgência: ${contactForm.urgency}. ${contactForm.description}`
        })
      });
    } catch (contactErr) {
      console.warn("Aviso ao registar mensagem:", contactErr);
    }

    // 3. Notificar estado local do App
    if (onAddCommercialProposal) {
      onAddCommercialProposal(newProposal);
    }

    setIsSubmitting(false);
    setSubmissionSuccess({
      protocol: protocolNumber,
      unitName: selectedUnitForContact.name
    });

    // Reset formulário parcial
    setContactForm(prev => ({
      ...prev,
      description: "",
      documentName: "",
      documentSize: "",
      documentData: ""
    }));
  };

  // Já não há planos para trocar: a conta tem um valor único de manutenção.
  // Este handler apenas normaliza o registo da conta para o modelo actual.
  const handleConfirmAccountPlan = () => {
    if (onUpdateClient) {
      const updatedClient: Client = {
        ...client,
        planType: isPaidAccount ? ACCOUNT_PLAN_ID : HOME_PLAN_ID,
        planName: accountLabel,
        planPriceMzn: accountFee,
        planStatus: "active"
      };
      onUpdateClient(updatedClient);
      setPlanSuccessMsg("Conta confirmada e activa!");
      setTimeout(() => {
        setPlanSuccessMsg(null);
        setIsPlanModalOpen(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up text-left font-sans">
      
      {/* ════════════════════════ CABEÇALHO DO HUB CORPORATIVO ════════════════════════ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 text-[10px] font-mono font-bold uppercase border border-blue-500/40">
              Canal Executivo B2B & Condomínios
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Conta: {client.name} (ID: {client.id})
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#172554] tracking-tight">
            Interação Direta com Unidades de Negócio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light">
            A partir deste painel, a sua organização mantém contacto prioritário e direto com qualquer uma das 4 unidades operacionais TARIRA. Cada solicitação é direcionada imediatamente à equipa responsável e monitorada pelo painel administrativo.
          </p>
        </div>

        {/* Cartão Resumo da Conta */}
        <div className="p-4 rounded-2xl bg-white border border-blue-500/30 w-full md:w-72 shrink-0 space-y-3 relative z-10 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              Manutenção da Conta
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono flex items-center gap-1 ${
              accountStatus === "trial"
                ? "bg-blue-500/20 text-blue-700"
                : accountStatus === "pending"
                ? "bg-amber-500/20 text-amber-700"
                : "bg-emerald-500/20 text-emerald-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                accountStatus === "trial" ? "bg-blue-400" : accountStatus === "pending" ? "bg-amber-400" : "bg-emerald-400"
              }`} />
              {accountStatus === "trial"
                ? `Grátis (${ACCOUNT_TRIAL_DAYS} dias)`
                : accountStatus === "pending"
                ? "Pagamento pendente"
                : "Ativa"}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#172554]">{accountLabel}</h4>
            <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">
              {isPaidAccount ? `${formatMzn(accountFee)}/mês` : "0 MZN — conta gratuita"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPlanModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-blue-700 border border-blue-500/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-700" />
            <span>Ver Detalhes da Conta</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════ AS 4 UNIDADES OPERACIONAIS DE NEGÓCIO ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleBusinessUnits.map((unit) => {
          const IconComp = unit.icon;

          return (
            <div
              key={unit.id}
              className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-blue-50 to-white border ${unit.borderColor} shadow-xl flex flex-col justify-between space-y-6 hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] transition-all relative group`}
            >
              <div className="space-y-4">
                
                {/* Topo da Unidade: Ícone + SLA Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                      <IconComp className={`w-6 h-6 ${unit.accentColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#172554] flex items-center gap-2">
                        <span>{unit.name}</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {unit.tagline}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-mono text-slate-500 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-700" />
                    <span>SLA: {unit.sla}</span>
                  </span>
                </div>

                {/* Descrição Funcional */}
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {unit.description}
                </p>

                {/* Equipa & Canal Direto */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">Equipa de Gestão:</span>
                    <span className="text-[#172554] font-medium">{unit.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">Linha Oficial:</span>
                    <a href={`mailto:${unit.email}`} className="text-blue-700 hover:underline font-mono">
                      {unit.email}
                    </a>
                  </div>
                </div>

              </div>

              {/* Ações da Unidade: Falar com a Equipa + Explorar Catálogo */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenContactModal(unit)}
                  className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Falar com a Equipa {unit.name.split(" ")[1] || "TARIRA"}</span>
                </button>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate(unit.catalogTab)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-[#172554] border border-slate-200/80 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{unit.catalogLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ════════════════════════ 3. MODAL DE CONTACTO DIRETO COM A UNIDADE ════════════════════════ */}
      {selectedUnitForContact && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">
            
            {/* Header do Modal */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-700">
                  <selectedUnitForContact.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-wider block">
                    Contacto Direto Corporativo
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#172554]">
                    {selectedUnitForContact.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUnitForContact(null)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-700 text-slate-400 hover:text-[#172554] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sucesso de Submissão */}
            {submissionSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-[#172554]">Solicitação Registada com Sucesso!</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    A sua solicitação foi encaminhada diretamente à equipa de <strong>{submissionSuccess.unitName}</strong> e registada no Painel do Administrador.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-blue-500/30 inline-block font-mono text-xs text-blue-700 font-bold mt-2">
                    Protocolo: {submissionSuccess.protocol}
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setSelectedUnitForContact(null)}
                    className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Fechar Janela
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário de Envio */
              <form onSubmit={handleSubmitContact} className="space-y-4 text-xs">
                
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                  Esta mensagem será encaminhada com prioridade B2B para o <strong>{selectedUnitForContact.department}</strong> da TARIRA, associada à conta da empresa <strong>{client.name}</strong>.
                </div>

                {/* Tipo de Assunto / Necessidade */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-semibold block">
                    Tipo de Necessidade / Serviço Pretendido:
                  </label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-[#172554] focus:outline-none focus:border-blue-400 font-sans cursor-pointer"
                  >
                    {selectedUnitForContact.subjects.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                {/* Urgência & Headcount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-semibold block">
                      Nível de Urgência:
                    </label>
                    <select
                      value={contactForm.urgency}
                      onChange={(e) => setContactForm({ ...contactForm, urgency: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-[#172554] focus:outline-none focus:border-blue-400 font-sans cursor-pointer"
                    >
                      <option value="normal">Normal (SLA {selectedUnitForContact.sla})</option>
                      <option value="alta">Alta Prioridade (Até 24 Horas)</option>
                      <option value="critica">Crítica / Piquete Imediato</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-semibold block">
                      Nº de Pessoas / Posições (Aprox.):
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={contactForm.headcount}
                      onChange={(e) => setContactForm({ ...contactForm, headcount: e.target.value })}
                      className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-[#172554] focus:outline-none focus:border-blue-400 font-sans"
                      placeholder="Ex: 1, 3, 10..."
                    />
                  </div>
                </div>

                {/* Descrição da Necessidade */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-semibold block">
                    Detalhes do Pedido / Especificações:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.description}
                    onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                    placeholder={`Descreva aqui o que a sua empresa necessita (ex: requisitos da vaga, tipo de intervenção, localidade, datas pretendidas)...`}
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-[#172554] focus:outline-none focus:border-blue-400 font-sans placeholder:text-slate-500 resize-none"
                  />
                </div>

                {/* Responsável e Contactos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Nome do Responsável:</label>
                    <input
                      type="text"
                      value={contactForm.contactName}
                      onChange={(e) => setContactForm({ ...contactForm, contactName: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-[#172554] text-xs focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Telefone de Contacto:</label>
                    <input
                      type="text"
                      value={contactForm.contactPhone}
                      onChange={(e) => setContactForm({ ...contactForm, contactPhone: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-[#172554] text-xs focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Upload de Anexo (Termos de Referência) */}
                <div className="pt-2">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Anexar Termos de Referência / Ficheiro (Opcional, máx 5MB):
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-500 hover:text-[#172554] cursor-pointer transition-all flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-blue-700" />
                      <span>{contactForm.documentName ? "Trocar Ficheiro" : "Selecionar Ficheiro"}</span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                      />
                    </label>
                    {contactForm.documentName && (
                      <span className="text-[11px] text-blue-700 font-mono flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        {contactForm.documentName} ({contactForm.documentSize})
                      </span>
                    )}
                  </div>
                </div>

                {/* Botões do Formulário */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUnitForContact(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-700 text-slate-500 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>A enviar solicitação...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Enviar para {selectedUnitForContact.name}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ════════════════════════ 4. MODAL DE DETALHES DA CONTA ════════════════════════ */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">

            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-wider block">
                  Conta TARIRA
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#172554]">
                  {isPaidAccount ? `Manutenção da Conta ${isCondo ? "Condomínio" : "Empresa"}` : "Conta Particular / Lar"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-200 text-slate-400 hover:text-[#172554] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {planSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 text-xs font-bold text-center">
                {planSuccessMsg}
              </div>
            )}

            {/* Valor único — não há escalões a escolher */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Valor de manutenção da conta
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-mono font-bold text-[#172554]">
                    {isPaidAccount ? formatMzn(accountFee) : "0 MZN"}
                  </span>
                  {isPaidAccount && <span className="text-xs text-slate-400 font-mono">/mês</span>}
                </div>
              </div>
              {isPaidAccount && (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-bold shrink-0">
                  {ACCOUNT_TRIAL_DAYS} dias grátis no arranque
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {isPaidAccount
                ? "Não existem planos nem escalões: empresas e condomínios pagam exactamente o mesmo valor pelo uso da plataforma."
                : "A sua conta de particular não tem valor de inscrição nem mensalidade. Paga apenas os serviços que contratar."}
            </p>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-2.5">
              <span className="text-blue-700 font-bold text-xs mt-0.5">ℹ️</span>
              <p className="text-[11px] text-[#172554] leading-relaxed">
                <strong>Modelo de Cobrança TARIRA:</strong> {ACCOUNT_BILLING_NOTE}
              </p>
            </div>

            {/* Vantagens da conta activa */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 block">
                O que a sua conta activa inclui
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
                {activeBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                    <Check className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {accountStatus !== "active" && onUpdateClient && (
              <button
                type="button"
                onClick={handleConfirmAccountPlan}
                className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-[0.98]"
              >
                Confirmar e Activar Conta
              </button>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Volumes elevados, SLA dedicado ou cobertura contínua? A Direção Comercial pode negociar
              um <strong className="text-[#172554]">pacote especial</strong> à medida da sua operação.
            </p>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-50 hover:bg-slate-700 text-slate-500 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
