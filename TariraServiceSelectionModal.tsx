import React from "react";
import { 
  X, 
  Wrench, 
  Users, 
  Building2, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  PhoneCall, 
  Clock, 
  Mail,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Client } from "./types";

interface TariraServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSelectOption: (option: {
    unit: "connect" | "recruit" | "outsourcing" | "consulting" | "studio";
    action: "catalog" | "proposal";
    serviceTitle?: string;
  }) => void;
  currentLang?: "pt" | "en";
}

export const TariraServiceSelectionModal: React.FC<TariraServiceSelectionModalProps> = ({
  isOpen,
  onClose,
  client,
  onSelectOption,
  currentLang = "pt"
}) => {
  if (!isOpen) return null;

  const isPt = currentLang === "pt";
  const isLarParticular = client.type === "residential" || client.type === "individual";

  const allServiceUnits = [
    {
      id: "connect",
      title: "Tarira Connect",
      unitBadge: "Manutenção & Piquete",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      icon: <Wrench className="w-5 h-5 text-blue-400" />,
      tagline: "Assistência Técnica, Eletricidade & Infraestrutura Predial",
      description: "Piquete em horário de atividade, quadros elétricos, redes hídricas, climatização AVAC e conservação predial preventiva com técnicos certificados.",
      catalogBtnText: "Explorar Técnicos Credenciados",
      proposalBtnText: "Solicitar Orçamento de Obra / Piquete",
      catalogTarget: "connect" as const
    },
    {
      id: "recruit",
      title: "Tarira Recruit",
      unitBadge: "Recrutamento Executivo",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      icon: <Users className="w-5 h-5 text-blue-400" />,
      tagline: "Recrutamento Executivo com Modelos Flexíveis",
      description: "Quadros de topo em Finanças, IA & Dados, Cibersegurança e Gestão. Triagem rigorosa de 6 etapas e garantia de substituição imediata.",
      catalogBtnText: "Ver Galeria de Talentos",
      proposalBtnText: "Solicitar Cotação de Vaga",
      catalogTarget: "recruit" as const
    },
    {
      id: "outsourcing",
      title: "Tarira Outsourcing / RPO",
      unitBadge: "Terceirização B2B",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      icon: <Building2 className="w-5 h-5 text-emerald-400" />,
      tagline: "Gestão Integral de Força de Trabalho & Processos de RH",
      description: "Alocação contínua de equipas de receção, contact center, piquete técnico ou operações com supervisão ativa e sem encargos de gestão direta.",
      catalogBtnText: "Ver Modelo de Outsourcing",
      proposalBtnText: "Solicitar Proposta de Outsourcing / RPO",
      catalogTarget: "outsourcing" as const
    },
    {
      id: "consulting",
      title: "Tarira Consulting",
      unitBadge: "Consultoria & Compliance",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
      tagline: "Auditoria Trabalhista, Jurídica & Reestruturação Organizacional",
      description: "Assessoria estratégica para adequação à Lei do Trabalho moçambicana, otimização de matriz salarial e compliance empresarial.",
      catalogBtnText: "Ver Soluções de Consultoria",
      proposalBtnText: "Solicitar Diagnóstico Organizacional",
      catalogTarget: "consulting" as const
    }
  ];

  // Contas Particular/Lar só interagem diretamente com a Tarira Connect —
  // as restantes unidades são B2B e não fazem sentido para este tipo de conta.
  const serviceUnits = isLarParticular
    ? allServiceUnits.filter(u => u.id === "connect")
    : allServiceUnits;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 bg-slate-950/90 backdrop-blur-md flex justify-center items-start sm:items-center animate-fade-in">
      {/* Click outside to close */}
      <div className="fixed inset-0 bg-black/60 z-0" onClick={onClose} />

      <div 
        className="relative z-10 w-full max-w-4xl rounded-3xl bg-slate-900 border border-blue-500/30 shadow-2xl shadow-black/90 overflow-hidden my-2 sm:my-auto max-h-[95vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decorative gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-7 bg-gradient-to-r from-white via-blue-50 to-blue-50 border-b border-slate-200 flex items-start justify-between relative shrink-0">
          <div className="space-y-1.5 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-[#172554] border border-blue-300 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> Solicitação de Serviço B2B
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-emerald-600" /> SLA Resposta: 24h
              </span>
              <span className="text-xs text-[#172554] font-semibold">
                • {client.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#172554] tracking-tight">
              {isPt ? "Solicitar Novo Serviço no Ecossistema TARIRA" : "Request New Service in TARIRA Ecosystem"}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {isPt
                ? "Escolha a unidade de atuação pretendida para a sua organização. Pode explorar o catálogo de prestadores homologados ou solicitar uma proposta/cotação comercial formal."
                : "Choose the desired business unit for your organization. Browse vetted profiles or request a formal commercial proposal."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Fechar Janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Units Grid (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceUnits.map((unit) => (
              <div 
                key={unit.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                        {unit.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                          {unit.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${unit.badgeColor}`}>
                          {unit.unitBadge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-blue-200/90 mb-1.5">
                    {unit.tagline}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {unit.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      onSelectOption({
                        unit: unit.catalogTarget,
                        action: "proposal",
                        serviceTitle: `${unit.title} — ${unit.unitBadge}`
                      });
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] cursor-pointer"
                  >
                    <span>{unit.proposalBtnText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectOption({
                        unit: unit.catalogTarget,
                        action: "catalog"
                      });
                      onClose();
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{unit.catalogBtnText}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick contact / direct assistance banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-blue-50 border border-blue-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-[#172554] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#172554]">
                  Precisa de uma Solução Sob Medida ou Piquete de Emergência?
                </h4>
                <p className="text-[11px] text-slate-600">
                  Os nossos gestores de conta corporativa realizam o enquadramento imediato das necessidades da sua organização.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://wa.me/258843921084?text=Ol%C3%A1%20Central%20TARIRA,%20gostaria%20de%20solicitar%20um%20atendimento%20corporativo."
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <PhoneCall className="w-3.5 h-3.5" /> WhatsApp Direto
              </a>
              <button
                onClick={() => {
                  onSelectOption({
                    unit: "consulting",
                    action: "proposal",
                    serviceTitle: "Cotação Personalizada B2B"
                  });
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#172554] hover:brightness-110 text-white font-bold text-xs border border-[#172554] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" /> Cotação Personalizada
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="font-mono">
            Ecossistema TARIRA • Maputo & Províncias
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
