import React, { useState } from "react";
import { Users, ShieldCheck, Briefcase, Award, UserCheck, Layers, Activity, CheckCircle2, ChevronRight } from "lucide-react";
import { VerticalOrbitBadge } from "./TariraVisualEffects";

/**
 * TariraOutsourcingGrowthChart
 * ─────────────────────────────────────────────────────────────────────────
 * Arquitetura de Prontidão de Alocação ao Bloco Operacional (TARIRA RPO & Gestão):
 * 
 * 1. Fases Reais de RPO & Gestão Operacional (em vez de meses de calendário):
 *    - F1 · SLA: Diagnóstico & Fixação de SLAs Contratuais (50%)
 *    - F2 · RPO: Atração Direcionada & Vetting Técnico ATS (65%)
 *    - F3 · Alocação: Onboarding, Exames & Mobilização no Terreno (78%)
 *    - F4 · Recursos: Gestão de Pessoas, Assiduidade & Retenção (88%)
 *    - F5 · Operação: Liderança no Terreno, Escalas & Gestão Operacional (95%)
 *    - F6 · 100% SLA: Prontidão Plena, Cumprimento Total & Escala (100%)
 * 
 * 2. Animação Dinâmica em 3 Camadas Sequenciais:
 *    - 1ª Camada (Cinza / Base RPO): Possui animação ativa, partindo de uma base
 *      mínima de 22% para que o gráfico NUNCA fique vazio, crescendo para 34%.
 *    - 2ª Camada (Azul / Gestão de Recursos & Operacional): Sobe sobre o cinzento.
 *    - 3ª Camada (Branco Cristalino / Prontidão Plena 100%): Atinge o topo, coroada com
 *      o ícone de Users e exibindo o número de prontidão (%) com iluminação.
 * 
 * 3. Ciclo com Staggering Fluido e Interatividade ao passar o cursor/tocar.
 */

interface PhaseData {
  id: string;
  code: string;
  shortCode: string;
  phaseTitle: string;
  subLabel: string;
  pillar: string;
  value: number;
  detail: string;
}

const PHASES: PhaseData[] = [
  {
    id: "fase-1",
    code: "F1",
    shortCode: "F1 · SLA",
    phaseTitle: "Diagnóstico & SLA",
    subLabel: "Diagnóstico",
    pillar: "RPO Inicial",
    value: 50,
    detail: "Mapeamento das necessidades, definição de perfis técnicos e fixação de SLAs contratuais de resposta.",
  },
  {
    id: "fase-2",
    code: "F2",
    shortCode: "F2 · RPO",
    phaseTitle: "Atração & Vetting RPO",
    subLabel: "Vetting",
    pillar: "RPO Especializado",
    value: 65,
    detail: "Atração ativa de talentos, triagem ATS rigorosa, verificação de antecedentes e testes de proficiência.",
  },
  {
    id: "fase-3",
    code: "F3",
    shortCode: "F3 · Alocação",
    phaseTitle: "Alocação & Onboarding",
    subLabel: "Mobilização",
    pillar: "Mobilização",
    value: 78,
    detail: "Enquadramento legal, exames médicos, integração acelerada e mobilização imediata no terreno.",
  },
  {
    id: "fase-4",
    code: "F4",
    shortCode: "F4 · Recursos",
    phaseTitle: "Gestão de Recursos",
    subLabel: "Gestão RH",
    pillar: "Gestão de Recursos",
    value: 88,
    detail: "Administração de pessoal, processamento salarial, controlo de assiduidade e retenção de talentos.",
  },
  {
    id: "fase-5",
    code: "F5",
    shortCode: "F5 · Operação",
    phaseTitle: "Gestão Operacional",
    subLabel: "Operação",
    pillar: "Gestão Operacional",
    value: 95,
    detail: "Liderança de equipas, coordenação de escalas e turnos, supervisão contínua e resolução ágil de incidências.",
  },
  {
    id: "fase-6",
    code: "F6",
    shortCode: "F6 · 100% SLA",
    phaseTitle: "Prontidão Plena & SLA 100%",
    subLabel: "Prontidão",
    pillar: "Prontidão Total",
    value: 100,
    detail: "Operação 100% estabilizada, cumprimento integral de métricas contratuais e capacidade de expansão elástica.",
  },
];

const MAX_VALUE = 100;
const CHART_HEIGHT = 260; // px
const CYCLE_DURATION = 7.0; // segundos por ciclo

export const TariraOutsourcingGrowthChart: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [hoveredPhase, setHoveredPhase] = useState<PhaseData | null>(null);

  return (
    <div
      className={`relative rounded-3xl border border-border bg-white shadow-sm overflow-hidden transition-all text-left ${
        compact ? "p-5 sm:p-7" : "p-6 sm:p-9 lg:p-10"
      }`}
    >
      {/* ─── Layout Dividido: Esquerda (RPO & Gestão Operacional) + Direita (Gráficos) ─── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 lg:gap-10 xl:gap-12">
        
        {/* ════════════════════════════════════════════════════════════════════
            LADO ESQUERDO: RPO & GESTÃO OPERACIONAL DE RECURSOS
            Destaque vertical e apresentação clara dos pilares
           ════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 w-full flex flex-col justify-between space-y-5">
          
          <div className="flex items-start gap-3.5 sm:gap-4.5">
            {/* Destaque Chamativo com Letra Vertical R • P • O */}
            <div className="shrink-0">
              <VerticalOrbitBadge text="R•P•O" subtext="OP-SCALE" size="md" variant="light" />
            </div>

            {/* Cabeçalho de Destaque */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-brand text-[10px] font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                <span>Recruitment Process & Outsourcing</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand tracking-tight leading-tight">
                RPO & Gestão <span className="text-blue-700">Operacional</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                A TARIRA assegura o ciclo completo desde a atração e triagem criteriosa até à gestão de recursos humanos e coordenação operacional contínua no terreno — libertando a sua empresa para focar exclusivamente no core business.
              </p>
            </div>
          </div>

          {/* Pilares Estratégicos Estilizados em Botões Compactos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
            
            {/* 1. Recrutadores Capacitados & ATS */}
            <div className="group px-3 py-2 rounded-xl bg-background-secondary border border-border hover:border-brand-light/40 hover:bg-blue-50 transition-all flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 group-hover:scale-105 transition-transform">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-text-primary group-hover:text-brand transition-colors block leading-tight">
                  Recrutadores Capacitados
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Sourcing ATS & Vetting Rigoroso</span>
              </div>
            </div>

            {/* 2. Gestão de Recursos Humanos */}
            <div className="group px-3 py-2 rounded-xl bg-background-secondary border border-border hover:border-brand-light/40 hover:bg-blue-50 transition-all flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-text-primary group-hover:text-brand transition-colors block leading-tight">
                  Gestão de Recursos & Pessoas
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Contratos, Salários & Retenção</span>
              </div>
            </div>

            {/* 3. Gestão Operacional no Terreno */}
            <div className="group px-3 py-2 rounded-xl bg-background-secondary border border-border hover:border-brand-light/40 hover:bg-blue-50 transition-all flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 group-hover:scale-105 transition-transform">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-text-primary group-hover:text-brand transition-colors block leading-tight">
                  Gestão Operacional no Terreno
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Supervisão, Escalas & Turnos</span>
              </div>
            </div>

            {/* 4. Métricas e SLAs Rigorosos */}
            <div className="group px-3 py-2 rounded-xl bg-background-secondary border border-border hover:border-brand-light/40 hover:bg-blue-50 transition-all flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-text-primary group-hover:text-brand transition-colors block leading-tight">
                  Métricas & SLAs Rigorosos
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Garantia Contratual de 100%</span>
              </div>
            </div>

          </div>

          {/* Legenda do Ciclo em 3 Fases Sucessivas */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs pt-2 border-t border-border">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Ciclo RPO & Gestão:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 border border-slate-400" />
              <span className="text-[11px] font-mono text-slate-700 font-semibold">1ª RPO & Mobilização (Cinza)</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">→</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 border border-blue-400" />
              <span className="text-[11px] font-mono text-blue-700 font-semibold">2ª Gestão Operacional (Azul)</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">→</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300 shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
              <span className="text-[11px] font-mono text-[#172554] font-bold">3ª Prontidão & SLA (Branco 100%)</span>
            </div>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════════════════
            LADO DIREITO: GRÁFICO DE PRONTIDÃO DE ALOCAÇÃO OPERACIONAL
            Fases Reais: RPO -> Mobilização -> Gestão de Recursos -> Gestão Op. -> SLA
            Animação com base cinzenta viva que nunca deixa o gráfico vazio
           ════════════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-auto lg:shrink-0 flex flex-col items-center justify-center">
          
          <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#1e3256] via-[#162744] to-[#111e35] border border-blue-400/35 shadow-[0_12px_40px_rgba(30,58,138,0.25)] flex flex-col items-center text-center overflow-hidden w-full sm:min-w-[380px] sm:max-w-[410px]">
            
            {/* Brilho interno sutil em azul céu */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-36 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 right-1/2 translate-x-1/2 w-48 h-28 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />

            {/* Título Oficial: Prontidão de Alocação ao Bloco Operacional */}
            <div className="relative z-10 flex items-center gap-2 mb-1 min-w-0">
              <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
                <Layers className="w-3.5 h-3.5 text-blue-300" />
              </span>
              <span className="text-xs sm:text-sm font-serif font-bold text-blue-100 tracking-tight leading-snug break-words min-w-0">
                Prontidão de Alocação ao Bloco Operacional
              </span>
            </div>

            {/* Subtítulo de RPO e Gestão Operacional */}
            <span className="relative z-10 text-[10px] font-mono text-blue-200 font-medium mb-3 tracking-wide">
              Evolução: Sourcing RPO → Gestão de Recursos → Operação
            </span>

            {/* Container das Barras por Fases Operacionais */}
            <div
              className="relative z-10 flex items-end justify-center gap-1.5 sm:gap-2.5 md:gap-3 pt-6 pb-2 w-full px-1 min-w-0"
              style={{ height: CHART_HEIGHT }}
            >
              {PHASES.map((item, idx) => {
                const barHeight = (item.value / MAX_VALUE) * (CHART_HEIGHT - 68);
                const staggerDelay = `${idx * 0.38}s`;
                const isHovered = hoveredPhase?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredPhase(item)}
                    onMouseLeave={() => setHoveredPhase(null)}
                    onClick={() => setHoveredPhase(hoveredPhase?.id === item.id ? null : item)}
                    className="group flex flex-col items-center select-none cursor-pointer flex-1 min-w-0 transition-transform"
                    title={`${item.code}: ${item.phaseTitle} (${item.value}% Prontidão Operacional)`}
                  >
                    {/* 
                      ═══ NÚMERO DINÂMICO (%) ═══
                      Aparece com brilho translúcido no pico do ciclo e ao passar o cursor
                    */}
                    <div
                      className={`flex flex-col items-center mb-1.5 transition-all duration-300 ${
                        isHovered ? "opacity-100 scale-110" : "phase-number-glow"
                      }`}
                      style={{ animationDelay: staggerDelay }}
                    >
                      <span className="text-[10px] sm:text-[11px] font-mono font-black text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.7)]">
                        {item.value}%
                      </span>
                    </div>

                    {/* 
                      ═══ COLUNA DA BARRA COM AS 3 CAMADAS (BRANCO, AZUL, CINZA ANIMADA) ═══
                      A base cinzenta nunca desce de 22%, assegurando que o gráfico nunca fica vazio!
                    */}
                    <div
                      className={`relative w-full max-w-[34px] sm:max-w-[40px] flex flex-col justify-end shadow-xl transition-all rounded-t-md overflow-hidden ${
                        isHovered ? "ring-2 ring-blue-300/80 scale-105" : ""
                      }`}
                      style={{ height: barHeight }}
                    >
                      {/* 
                        ═══ 3ª CAMADA: TOPO (BRANCO CRISTALINO COM ÍCONE DE USERS) ═══
                        Cresce até ao topo representando Prontidão Plena & Cumprimento 100% SLA
                      */}
                      <div
                        className="relative w-full rounded-t-md overflow-hidden bg-gradient-to-b from-white via-blue-50 to-blue-200 shadow-sm border-t border-x border-white/90 flex items-start justify-center pt-1 phase-grow-top"
                        style={{ animationDelay: staggerDelay }}
                      >
                        <Users className="w-3.5 h-3.5 text-[#172554] shrink-0" strokeWidth={2.5} />
                      </div>

                      {/* 
                        ═══ 2ª CAMADA: MEIO (AZUL CORPORATIVO - GESTÃO OPERACIONAL) ═══
                        Cresce sobre a base cinzenta com a coordenação de recursos e escalas
                      */}
                      <div
                        className="w-full rounded-t-sm overflow-hidden bg-gradient-to-b from-blue-400 via-blue-600 to-blue-700 border-x border-blue-300/50 phase-grow-middle"
                        style={{ animationDelay: staggerDelay }}
                      />

                      {/* 
                        ═══ 1ª CAMADA: BASE (CINZA RPO COM ANIMAÇÃO DINÂMICA) ═══
                        ANIMADA! Começa sempre em 22% (gráfico nunca vazio) e sobe até 34%
                      */}
                      <div
                        className="w-full rounded-t-sm rounded-b-sm bg-gradient-to-b from-slate-500 via-slate-600 to-slate-700 border-t border-x border-b border-slate-400/50 shadow-inner phase-grow-base"
                        style={{ animationDelay: staggerDelay }}
                      />
                    </div>

                    {/* Rótulos das Fases Reais (Código e Sub-rótulo) */}
                    <div className="flex flex-col items-center mt-2">
                      <span className={`text-[10px] sm:text-[11px] font-mono font-black tracking-wider transition-colors ${
                        isHovered ? "text-blue-300" : "text-white"
                      }`}>
                        {item.code}
                      </span>
                      <span className="text-[8px] sm:text-[9.5px] font-mono font-medium text-blue-200/80 text-center leading-tight break-words mt-0.5">
                        {item.subLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Linha base limpa em tom azul suave */}
            <div className="relative z-10 w-full max-w-[320px] sm:max-w-xs h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent mt-1" />

            {/* Rodapé Informativo Interativo de RPO & Gestão Operacional */}
            <div className="relative z-10 w-full mt-3 pt-2.5 border-t border-blue-400/20 text-left">
              {hoveredPhase ? (
                <div className="flex flex-col gap-1 text-[10px] font-mono bg-blue-900/50 px-2.5 py-1.5 rounded-lg border border-blue-400/35 transition-all">
                  <div className="flex items-center justify-between text-blue-100">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                      {hoveredPhase.code}: {hoveredPhase.phaseTitle}
                    </span>
                    <span className="font-bold text-blue-200 bg-blue-800/60 px-1.5 py-0.5 rounded border border-blue-400/30">
                      {hoveredPhase.value}% Prontidão
                    </span>
                  </div>
                  <p className="text-[9px] text-blue-200/90 leading-tight">
                    {hoveredPhase.detail}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-blue-200/80 px-1">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <span>Ciclo Contínuo RPO & Gestão</span>
                  </span>
                  <span className="text-blue-200 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>SLA Contratual 100%</span>
                  </span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ─── Ciclo Sequencial em 3 Camadas Sucessivas com a Barra Cinzenta Animada ─── */}
      <style>{`
        /*
          Ciclo de ${CYCLE_DURATION}s em 3 Camadas Sucessivas:
          - 1ª Camada Cinzenta (Base RPO):
            NUNCA desaparece (base mínima de 22% garante que o gráfico nunca fica vazio).
            Entre 0% e 22% cresce ativamente de 22% para 34%, mantendo a fundação enquanto
            as camadas de gestão e prontidão crescem por cima.
          - 2ª Camada Azul (Gestão Operacional):
            Sobe entre 18% e 38% até 33% de altura e recolhe entre 66% e 82%.
          - 3ª Camada Branca (Prontidão Plena 100%):
            Sobe ao pico entre 34% e 50% até 33% de altura com o ícone Users.
            Exibe o número de prontidão (%) com brilho intenso entre 44% e 62%.
        */

        @keyframes phaseGrowBase {
          0% {
            height: 22%;
            opacity: 0.88;
          }
          20%, 68% {
            height: 34%;
            opacity: 1;
          }
          84%, 100% {
            height: 22%;
            opacity: 0.88;
          }
        }

        @keyframes phaseGrowMiddle {
          0%, 16% {
            height: 0%;
            opacity: 0;
          }
          32%, 68% {
            height: 33%;
            opacity: 1;
          }
          84%, 100% {
            height: 0%;
            opacity: 0;
          }
        }

        @keyframes phaseGrowTop {
          0%, 32% {
            height: 0%;
            opacity: 0;
          }
          46%, 62% {
            height: 33%;
            opacity: 1;
          }
          74%, 100% {
            height: 0%;
            opacity: 0;
          }
        }

        @keyframes phaseNumberGlow {
          0%, 34% {
            opacity: 0.35;
            transform: translateY(3px) scale(0.9);
            filter: drop-shadow(0 0 0px transparent);
          }
          46%, 62% {
            opacity: 1;
            transform: translateY(0px) scale(1.05);
            filter: drop-shadow(0 2px 10px rgba(255, 255, 255, 0.85));
          }
          72%, 100% {
            opacity: 0.35;
            transform: translateY(3px) scale(0.9);
            filter: drop-shadow(0 0 0px transparent);
          }
        }

        .phase-grow-base {
          animation: phaseGrowBase ${CYCLE_DURATION}s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .phase-grow-middle {
          animation: phaseGrowMiddle ${CYCLE_DURATION}s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .phase-grow-top {
          animation: phaseGrowTop ${CYCLE_DURATION}s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .phase-number-glow {
          animation: phaseNumberGlow ${CYCLE_DURATION}s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default TariraOutsourcingGrowthChart;
