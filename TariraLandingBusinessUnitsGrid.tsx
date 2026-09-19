import React, { useState, useEffect } from "react";
import {
  TariraConnectIcon,
  TariraRecruitIcon,
  TariraOutsourcingIcon,
  TariraConsultingIcon,
  TariraStudioIcon
} from "./TariraUnitIcons";

export interface TariraLandingBusinessUnitsGridProps {
  onNavigate: (id: "connect" | "recrute" | "business" | "consultoria" | "studio" | string) => void;
}

interface UnitItem {
  id: "connect" | "recrute" | "business" | "consultoria" | "studio";
  name: string;
  badge: string;
  badgeSub?: string;
  description: string;
  highlights: string[];
  icon: (active: boolean) => React.ReactNode;
}

const UNITS_LIST: UnitItem[] = [
  {
    id: "connect",
    name: "Tarira Connect",
    badge: "Técnicos & Ofícios",
    icon: (active) => (
      <TariraConnectIcon
        size={24}
        className={`transition-colors duration-300 ${active ? "text-white" : "text-[#172554]"}`}
      />
    ),
    description: "Eletricistas, canalizadores, AVAC e técnicos certificados com garantia de execução e prontidão em horário de atividade.",
    highlights: ["Credenciados", "Pronto Atendimento", "Garantia 30 Dias"]
  },
  {
    id: "recrute",
    name: "Tarira Recruit",
    badge: "Recrutamento & RH",
    icon: (active) => (
      <TariraRecruitIcon
        size={24}
        className={`transition-colors duration-300 ${active ? "text-white" : "text-[#172554]"}`}
      />
    ),
    description: "Recrutamento executivo com modelos flexíveis, com triagem rigorosa e garantia de substituição imediata.",
    highlights: ["Filtro ATS", "Validação 6 Etapas", "Substituição Grátis"]
  },
  {
    id: "business",
    name: "Tarira Outsourcing",
    badge: "Terceirização B2B",
    badgeSub: "RPO",
    icon: (active) => (
      <TariraOutsourcingIcon
        size={24}
        className={`transition-colors duration-300 ${active ? "text-white" : "text-[#172554]"}`}
      />
    ),
    description: "Gestão de todo o fluxo de RH e outsourcing de equipas com supervisão ativa.",
    highlights: ["Gestão Integral de RH", "Supervisão Ativa", "SLA 99.2%"]
  },
  {
    id: "consultoria",
    name: "Tarira Consulting",
    badge: "Consultoria & Auditoria",
    icon: (active) => (
      <TariraConsultingIcon
        size={24}
        className={`transition-colors duration-300 ${active ? "text-white" : "text-[#172554]"}`}
      />
    ),
    description: "Diagnóstico empresarial, auditoria operacional, arquitetura de equipas e planos de estruturação.",
    highlights: ["Auditoria Operacional", "Mapeamento RH", "Simulação de Custos"]
  },
  {
    id: "studio",
    name: "Tarira Studio",
    badge: "SaaS & Automações",
    icon: (active) => (
      <TariraStudioIcon
        size={24}
        className={`transition-colors duration-300 ${active ? "text-white" : "text-[#172554]"}`}
      />
    ),
    description: "Engenharia ágil de microserviços, integrações M-Pesa/e-Mola e criação de MVPs escaláveis em 1 a 4 semanas.",
    highlights: ["Entrega Rápida", "Integrações M-Pesa", "100% Código Seu"]
  }
];

export const TariraLandingBusinessUnitsGrid: React.FC<TariraLandingBusinessUnitsGridProps> = ({ onNavigate }) => {
  const [cycleIndex, setCycleIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Auto-cycle intermittently every 3.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % UNITS_LIST.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 w-full">
      {UNITS_LIST.map((unit, idx) => {
        // Active if mouse is hovering this card, or if it's the currently cycled card (when not hovering another)
        const isHovered = hoveredIndex === idx;
        const isActive = hoveredIndex !== null ? isHovered : cycleIndex === idx;

        return (
          <div
            key={unit.id}
            id={`card-ecosystem-${unit.id}`}
            onClick={() => onNavigate(unit.id)}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`group relative p-6 rounded-3xl text-left transition-all duration-500 cursor-pointer flex flex-col justify-between min-h-[320px] w-full overflow-hidden ${
              isActive
                ? "bg-[#172554] text-white border-2 border-[#172554] shadow-xl -translate-y-2"
                : "bg-white text-[#172554] border border-border shadow-sm hover:border-[#172554]"
            }`}
          >
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 shrink-0 ${
                    isActive
                      ? "bg-white/15 text-white border-white/30"
                      : "bg-blue-50 text-[#172554] border-blue-200"
                  }`}
                >
                  {unit.icon(isActive)}
                </div>
                <div className="flex flex-col items-end text-right">
                  <span
                    className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border text-right transition-colors duration-300 ${
                      isActive
                        ? "bg-white/20 border-white/40 text-white"
                        : "bg-blue-50 border-blue-200 text-[#172554]"
                    }`}
                  >
                    {unit.badge}
                  </span>
                  {unit.badgeSub && (
                    <span
                      className={`text-[9px] font-mono font-black uppercase tracking-widest mt-1 pr-1 transition-colors duration-300 ${
                        isActive ? "text-blue-200" : "text-blue-600"
                      }`}
                    >
                      {unit.badgeSub}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <h3
                  className={`text-xl font-serif font-bold transition-colors duration-300 ${
                    isActive ? "text-white" : "text-[#172554]"
                  }`}
                >
                  {unit.name}
                </h3>
                <p
                  className={`text-xs leading-relaxed font-sans font-normal transition-colors duration-300 ${
                    isActive ? "text-white" : "text-[#3B5998]"
                  }`}
                >
                  {unit.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {unit.highlights.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-colors duration-300 ${
                      isActive
                        ? "text-white bg-white/15 border-white/20"
                        : "text-[#3B5998] bg-[#F8FAFC] border-border"
                    }`}
                  >
                    • {tag}
                  </span>
                ))}
              </div>
            </div>

            <div
              className={`pt-4 border-t flex items-center justify-between text-xs font-bold transition-colors duration-300 mt-5 relative z-10 ${
                isActive ? "border-white/20 text-white" : "border-border text-[#172554]"
              }`}
            >
              <span>Aceder à Unidade</span>
              <span className="transition-transform group-hover:translate-x-1 font-bold">→</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TariraLandingBusinessUnitsGrid;
