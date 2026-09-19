import React, { useState, useRef } from "react";
import { Download, Printer, FileText, Presentation, X, CheckCircle2, TrendingUp, ShieldCheck, DollarSign, Users, Award, Building2, ChevronRight, ChevronLeft, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import pptxgen from "pptxgenjs";

// Helper to sanitize Tailwind v4 oklch/oklab colors for html2canvas
function sanitizeCSSForHtml2Canvas(cssText: string): string {
  if (!cssText) return "";
  let result = cssText;
  let matchIndex = result.search(/oklch|oklab/i);
  while (matchIndex !== -1) {
    let startParen = result.indexOf('(', matchIndex);
    if (startParen === -1) break;
    let depth = 1;
    let endParen = startParen + 1;
    while (endParen < result.length && depth > 0) {
      if (result[endParen] === '(') depth++;
      else if (result[endParen] === ')') depth--;
      endParen++;
    }
    result = result.substring(0, matchIndex) + "#d97706" + result.substring(endParen);
    matchIndex = result.search(/oklch|oklab/i);
  }
  return result;
}

interface InvestorDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Brand Header Component displaying Official Double-Ring Seal, Name, Bilingual Taglines, Creation Date and Key Trust Statement
function TariraDocumentBrandHeader({ light = true }: { light?: boolean }) {
  const leftColor = light ? "#2563EB" : "#38BDF8";
  const rightColor = light ? "#101E34" : "#60A5FA";
  const titleColor = light ? "text-slate-950" : "text-[#172554]";
  const taglinePtColor = light ? "text-[#1E3A8A]" : "text-blue-700";
  const taglineEnColor = light ? "text-slate-500" : "text-slate-400";
  const lineBg = light ? "bg-slate-300" : "bg-slate-700/60";

  return (
    <div className="flex flex-col items-center text-center space-y-2.5 py-3 px-4 border-b border-slate-200/80 mb-6 w-full">
      {/* 1. Official Double Ring Seal (Icone da Logomarca) */}
      <div className="flex justify-center items-center">
        <svg viewBox="0 0 102 60" className="w-16 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="41" cy="30" rx="20" ry="14" stroke={leftColor} strokeWidth="6" fill="none" />
          <ellipse cx="61" cy="30" rx="20" ry="14" stroke={rightColor} strokeWidth="6" fill="none" />
          <path d="M 41 16 A 20 14 0 0 1 61 30" stroke={leftColor} strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* 2. Brand Name & Corporate Entity */}
      <div className="space-y-0.5">
        <h1 className={`font-serif font-black text-2xl sm:text-3xl tracking-[0.25em] ${titleColor}`}>
          TARIRA
        </h1>
        <p className={`font-mono text-[10px] uppercase tracking-widest font-bold ${light ? "text-slate-700" : "text-blue-700"}`}>
          TARIRA Ecosystem Services Lda.
        </p>
      </div>

      {/* 3. Hairline Separator */}
      <div className={`w-36 h-[1px] ${lineBg} my-0.5`} />

      {/* 4. Official Bilingual Taglines */}
      <div className="space-y-0.5">
        <p className={`font-serif italic font-bold text-xs sm:text-sm ${taglinePtColor}`}>
          Supervisionamos. Para que não precise.
        </p>
        <p className={`font-sans font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.22em] ${taglineEnColor}`}>
          WE OVERSEE. SO YOU DON'T HAVE TO.
        </p>
      </div>

      {/* 5. Highlighted Powerful Brand Statement (Frase de Referência) */}
      <div className="mt-1.5 px-4 py-2 bg-gradient-to-r from-blue-500/15 via-blue-500/10 to-blue-500/15 border border-blue-500/40 rounded-2xl max-w-xl shadow-sm">
        <p className="font-serif italic font-extrabold text-xs sm:text-sm text-blue-900 leading-snug">
          “A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”
        </p>
      </div>

      {/* 6. Ecosystem Subtitle */}
      <p className={`text-[10px] sm:text-[11px] font-sans font-medium ${light ? "text-slate-600" : "text-slate-500"} mt-1`}>
        Conectando Talentos e Oportunidades • Ecossistema de Serviços de Moçambique
      </p>
    </div>
  );
}

export function InvestorDocumentsModal({ isOpen, onClose }: InvestorDocumentsModalProps) {
  const [activeDocument, setActiveDocument] = useState<"cost_benefit" | "business_plan" | "pitch_deck">("cost_benefit");
  const [activeCostBenefitPage, setActiveCostBenefitPage] = useState<number>(1);
  const [activeBusinessPlanPage, setActiveBusinessPlanPage] = useState<number>(1);
  const [activePitchSlide, setActivePitchSlide] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"pages" | "scroll">("pages");
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [pdfExportProgress, setPdfExportProgress] = useState<string>("");
  const [isExportingPPTX, setIsExportingPPTX] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const documentRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Enable keyboard arrow key navigation for pages and slides
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowRight" || e.key === "Space" || e.key === "PageDown") {
        if (activeDocument === "cost_benefit") {
          setActiveCostBenefitPage((prev) => Math.min(4, prev + 1));
        } else if (activeDocument === "business_plan") {
          setActiveBusinessPlanPage((prev) => Math.min(5, prev + 1));
        } else {
          setActivePitchSlide((prev) => Math.min(10, prev + 1));
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (activeDocument === "cost_benefit") {
          setActiveCostBenefitPage((prev) => Math.max(1, prev - 1));
        } else if (activeDocument === "business_plan") {
          setActiveBusinessPlanPage((prev) => Math.max(1, prev - 1));
        } else {
          setActivePitchSlide((prev) => Math.max(1, prev - 1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeDocument]);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    setPdfExportProgress("Preparando...");

    try {
      if (!exportContainerRef.current) {
        alert("Aguarde o carregamento do documento PDF.");
        setIsExportingPDF(false);
        return;
      }

      const isLandscape = activeDocument === "pitch_deck" || activeDocument === "cost_benefit";
      const blockSelector = isLandscape ? ".pdf-slide-block" : ".pdf-page-block";
      const pageBlocks = exportContainerRef.current.querySelectorAll(blockSelector);

      if (!pageBlocks || pageBlocks.length === 0) {
        alert("Aguarde o carregamento do modelo PDF e tente novamente.");
        setIsExportingPDF(false);
        return;
      }

      const orientation = isLandscape ? "l" : "p";
      const pdf = new jsPDF(orientation, "mm", "a4");
      const pdfWidth = isLandscape ? 297 : 210;
      const pdfHeight = isLandscape ? 210 : 297;

      for (let i = 0; i < pageBlocks.length; i++) {
        const label = isLandscape
          ? `Slide ${i + 1}/${pageBlocks.length}`
          : `Página ${i + 1}/${pageBlocks.length}`;
        setPdfExportProgress(label);
        const pageEl = pageBlocks[i] as HTMLElement;

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            const container = clonedDoc.getElementById("pdf-export-container");
            if (container) {
              container.style.position = "absolute";
              container.style.left = "0px";
              container.style.top = "0px";
              container.style.zIndex = "999999";
              container.style.opacity = "1";
              container.style.visibility = "visible";
            }
            const styleEls = clonedDoc.querySelectorAll("style");
            styleEls.forEach((styleEl) => {
              if (styleEl.textContent) {
                styleEl.textContent = sanitizeCSSForHtml2Canvas(styleEl.textContent);
              }
            });
            const styledEls = clonedDoc.querySelectorAll("[style*='oklch'], [style*='oklab'], [style*='OKLCH'], [style*='OKLAB']");
            styledEls.forEach((el) => {
              const styleAttr = el.getAttribute("style");
              if (styleAttr) {
                el.setAttribute("style", sanitizeCSSForHtml2Canvas(styleAttr));
              }
            });
          },
        });

        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage([pdfWidth, pdfHeight], orientation);
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      const fileName = activeDocument === "cost_benefit"
        ? "TARIRA_Resumo_Executivo_Custo_Beneficio_2026.pdf"
        : activeDocument === "pitch_deck"
        ? "TARIRA_Pitch_Deck_10_Slides_Oficial_2026.pdf"
        : "TARIRA_Plano_de_Negocios_Completo_2026.pdf";

      pdf.save(fileName);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Ocorreu um erro ao gerar o PDF. A utilizar a impressão nativa como alternativa.");
      window.print();
    } finally {
      setIsExportingPDF(false);
      setPdfExportProgress("");
    }
  };

  const handlePrintNative = () => {
    window.print();
  };

  const handleDownloadPPTX = async () => {
    setIsExportingPPTX(true);
    try {
      const pptx = new pptxgen();
      pptx.layout = "LAYOUT_16x9";
      pptx.author = "TARIRA Ecosystem Services Lda.";
      pptx.company = "TARIRA Ecosystem Services Lda.";

      // Color Palette Constants - White Executive Background & Rich Cards
      const WHITE_BG = "FFFFFF";
      const CARD_BG = "F8FAFC";
      const CARD_BORDER = "E2E8F0";
      const QUOTE_BG = "FEF3C7";
      const QUOTE_BORDER = "FDE68A";
      const DARK_CARD_BG = "0F172A";
      const DARK_CARD_BORDER = "1E293B";
      const GREEN_CARD_BG = "ECFDF5";
      const GREEN_CARD_BORDER = "A7F3D0";
      const GOLD_AMBER = "D97706";
      const LIGHT_AMBER = "B45309";
      const DARK_AMBER = "92400E";
      const GREEN_ACCENT = "059669";
      const BLUE_ACCENT = "2563EB";
      const PURPLE_ACCENT = "7C3AED";
      const PINK_ACCENT = "EC4899";
      const TEXT_MAIN = "0F172A";
      const TEXT_SUB = "334155";
      const MUTED_GRAY = "64748B";

      const LOGO_SVG_DATA_URL = "data:image/svg+xml;base64," + btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102 60" width="204" height="120">` +
        `<ellipse cx="41" cy="30" rx="20" ry="14" stroke="#2563EB" stroke-width="6" fill="none" />` +
        `<ellipse cx="61" cy="30" rx="20" ry="14" stroke="#101E34" stroke-width="6" fill="none" />` +
        `<path d="M 41 16 A 20 14 0 0 1 61 30" stroke="#2563EB" stroke-width="6" fill="none" stroke-linecap="round" />` +
        `</svg>`
      );

      if (activeDocument === "cost_benefit") {
        pptx.title = "TARIRA Ecosystem Services - Resumo Executivo Custo-Benefício 2026";

        // ════════════════════════ SLIDE 1: CAPA & MÉTRICAS CHAVE SEED ════════════════════════
        const s1 = pptx.addSlide();
        s1.background = { color: WHITE_BG };

        // Header Seal & Brand with Official Double Ring Logo & Taglines
        s1.addImage({
          data: LOGO_SVG_DATA_URL,
          x: 4.35, y: 0.15, w: 1.3, h: 0.76
        });
        s1.addText("TARIRA", {
          x: 0.6, y: 0.92, w: 8.8, h: 0.42, fontSize: 28, fontFace: "Georgia", bold: true, color: TEXT_MAIN, align: "center", charSpacing: 4
        });
        s1.addText("TARIRA Ecosystem Services Lda.", {
          x: 0.6, y: 1.32, w: 8.8, h: 0.2, fontSize: 9, fontFace: "Arial", bold: true, color: GOLD_AMBER, align: "center"
        });
        s1.addShape(pptx.ShapeType.line, {
          x: 4.2, y: 1.55, w: 1.6, h: 0, line: { color: "CBD5E1", width: 1 }
        });
        s1.addText("Supervisionamos. Para que não precise.", {
          x: 0.6, y: 1.6, w: 8.8, h: 0.25, fontSize: 10.5, fontFace: "Georgia", italic: true, bold: true, color: LIGHT_AMBER, align: "center"
        });
        s1.addText("WE OVERSEE. SO YOU DON'T HAVE TO.", {
          x: 0.6, y: 1.85, w: 8.8, h: 0.2, fontSize: 8, fontFace: "Arial", color: MUTED_GRAY, align: "center", charSpacing: 2
        });
        s1.addText("SÍNTESE EXECUTIVA CUSTO-BENEFÍCIO & RETORNO SEED (900.000 METICAIS)", {
          x: 0.6, y: 2.1, w: 8.8, h: 0.25, fontSize: 9.5, fontFace: "Arial", bold: true, color: GOLD_AMBER, align: "center"
        });

        // Quote Box Frame
        s1.addShape(pptx.ShapeType.rect, {
          x: 0.8, y: 2.35, w: 8.4, h: 0.55, fill: { color: QUOTE_BG }, line: { color: QUOTE_BORDER, width: 1 }
        });
        s1.addText("“A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”", {
          x: 0.8, y: 2.35, w: 8.4, h: 0.55, fontSize: 11.5, fontFace: "Georgia", bold: true, italic: true, color: DARK_AMBER, align: "center"
        });

        // 4 Key Metrics Pill Cards
        const metrics = [
          { title: "APORTE SEED", val: "900.000 MT", color: GOLD_AMBER },
          { title: "EQUITY CEDIDO", val: "10% CAPITAL", color: BLUE_ACCENT },
          { title: "EBITDA ANO 1", val: "6.800.000 MT", color: GREEN_ACCENT },
          { title: "PAYBACK SEED", val: "14 MESES", color: PURPLE_ACCENT }
        ];
        metrics.forEach((m, idx) => {
          const xPos = 0.8 + idx * 2.15;
          // Card Box Frame
          s1.addShape(pptx.ShapeType.rect, {
            x: xPos, y: 3.05, w: 2.0, h: 1.05, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
          });
          s1.addText(m.title, {
            x: xPos, y: 3.1, w: 2.0, h: 0.3, fontSize: 8.5, fontFace: "Arial", bold: true, color: m.color, align: "center"
          });
          s1.addText(m.val, {
            x: xPos, y: 3.4, w: 2.0, h: 0.65, fontSize: 13, fontFace: "Georgia", bold: true, color: TEXT_MAIN, align: "center"
          });
        });

        // Left Card: Destaques do Acordo & Estrutura Legal
        s1.addShape(pptx.ShapeType.rect, {
          x: 0.8, y: 4.2, w: 4.1, h: 1.15, fill: { color: CARD_BG }, line: { color: GOLD_AMBER, width: 1 }
        });
        s1.addText("📜 DESTAQUES DO ACORDO SEED (2026/2029)", {
          x: 0.9, y: 4.25, w: 3.9, h: 0.25, fontSize: 9, fontFace: "Arial", bold: true, color: GOLD_AMBER
        });
        s1.addText(
          "• Aporte Requerido: 900.000 MT por 10% de Quota Social.\n" +
          "• Capital Social: 90.000 MT afetos ao Capital Social formal.\n" +
          "• Infraestrutura Web: Apenas 15.000 MT/ano no Hostinger.com.",
          { x: 0.9, y: 4.52, w: 3.9, h: 0.78, fontSize: 8.5, fontFace: "Arial", color: TEXT_MAIN }
        );

        // Right Card: Retorno ao Investidor & Governação
        s1.addShape(pptx.ShapeType.rect, {
          x: 5.1, y: 4.2, w: 4.1, h: 1.15, fill: { color: CARD_BG }, line: { color: GREEN_ACCENT, width: 1 }
        });
        s1.addText("📈 RETORNO AO INVESTIDOR & LIDERANÇA", {
          x: 5.2, y: 4.25, w: 3.9, h: 0.25, fontSize: 9, fontFace: "Arial", bold: true, color: GREEN_ACCENT
        });
        s1.addText(
          "• Payback Rápido: Mês 14 no Ano 2 (1.423.400 MT acumulados).\n" +
          "• Retorno de Capital: 158% do aporte inicial recuperado no Ano 2.\n" +
          "• Liderança: CEO Vicente Dias com foco em ações e lucros.",
          { x: 5.2, y: 4.52, w: 3.9, h: 0.78, fontSize: 8.5, fontFace: "Arial", color: TEXT_MAIN }
        );

        s1.addText("TARIRA Ecosystem Services Lda. • Resumo Custo-Benefício 2026 • Página 1 de 6", {
          x: 0.6, y: 5.38, w: 8.8, h: 0.2, fontSize: 8, color: MUTED_GRAY, align: "center"
        });

        // ════════════════════════ SLIDE 2: CUSTOS OPERACIONAIS & EQUIPA ════════════════════════
        const s2 = pptx.addSlide();
        s2.background = { color: WHITE_BG };

        s2.addText("TARIRA Ecosystem Services Lda. • Resumo Executivo • Página 2 de 6", {
          x: 0.6, y: 0.35, w: 8.8, h: 0.25, fontSize: 9, fontFace: "Arial", color: MUTED_GRAY
        });
        s2.addText("1. Estrutura de Custos Operacionais & Investimento em Pessoal", {
          x: 0.6, y: 0.65, w: 8.8, h: 0.4, fontSize: 16, fontFace: "Georgia", bold: true, color: TEXT_MAIN
        });

        // 2x2 Grid of Clean Executive Cards
        const s2Cards = [
          {
            title: "🏢 HUB SEDE MAPUTO",
            badge: "22.500 MZN/mês (Início 2ª Fase)",
            color: BLUE_ACCENT,
            border: "BFDBFE",
            bullets: [
              "• Arrendamento comercial na Cidade de Maputo a partir da 2ª Fase.",
              "• Atendimento B2B, recepção corporativa e onboarding de prestadores.",
              "• 1ª Fase 100% Digital: Custo inicial ZERO de instalações físicas."
            ]
          },
          {
            title: "👥 EQUIPA & ESTRUTURA RECURSOS HUMANOS",
            badge: "119.000 MZN/mês (No Go Live - Fase 3)",
            color: GOLD_AMBER,
            border: "FDE68A",
            bullets: [
              "• CEO & Founder (Vicente Dias): Pró-labore inicial ➔ Participação em Lucros/Ações.",
              "• Equipa Go Live (Fase 3): 1 Assistente RH (25k) + 3 Supervisores de Campo (58k).",
              "• 2ª Fase Marketing: Angariadores Comerciais com orçamento dedicado (35k MT)."
            ]
          },
          {
            title: "💻 TECNOLOGIA & INFRAESTRUTURA WEB",
            badge: "130.000 MT (Equipamentos) + 15.000 MT/ano Web",
            color: GREEN_ACCENT,
            border: "A7F3D0",
            bullets: [
              "• Equipamentos: 3 Laptops corporativos e estações de trabalho (130.000 MT).",
              "• Plataforma Web Hostinger.com: Alojamento corporativo (1.250 MT/mês).",
              "• Domínios e Comunicações: Fibra óptica dedicada e e-mails institucionais."
            ]
          },
          {
            title: "📊 ALAVANCAGEM & DILUIÇÃO OPERACIONAL",
            badge: "~340 MZN / Técnico Supervisionado",
            color: PURPLE_ACCENT,
            border: "DDD6FE",
            bullets: [
              "• Capacidade de Gestão: Folha fixa supervisiona até 350 técnicos ativos.",
              "• Escala Eficiente: Diluição acelerada de custos fixos por serviço prestado.",
              "• Foco em Margem: Retorno escalável sem inflação proporcional de headcount."
            ]
          }
        ];

        s2Cards.forEach((c, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const xPos = 0.6 + col * 4.5;
          const yPos = 1.15 + row * 2.05;

          // Card Outer Frame
          s2.addShape(pptx.ShapeType.rect, {
            x: xPos, y: yPos, w: 4.3, h: 1.95, fill: { color: CARD_BG }, line: { color: c.border, width: 1 }
          });

          // Card Title
          s2.addText(c.title, {
            x: xPos + 0.15, y: yPos + 0.1, w: 4.0, h: 0.25, fontSize: 9.5, fontFace: "Arial", bold: true, color: c.color
          });

          // Badge Pill Box
          s2.addShape(pptx.ShapeType.rect, {
            x: xPos + 0.15, y: yPos + 0.38, w: 4.0, h: 0.28, fill: { color: WHITE_BG }, line: { color: c.border, width: 1 }
          });
          s2.addText(c.badge, {
            x: xPos + 0.2, y: yPos + 0.4, w: 3.9, h: 0.24, fontSize: 8.5, fontFace: "Arial", bold: true, color: TEXT_MAIN
          });

          // Bullets
          const formatted = c.bullets.map((b) => ({ text: b, options: { fontSize: 8.5, color: TEXT_SUB, spaceAfter: 3 } }));
          s2.addText(formatted, {
            x: xPos + 0.15, y: yPos + 0.72, w: 4.0, h: 1.15, fontFace: "Arial"
          });
        });

        s2.addText("TARIRA Ecosystem Services Lda. • Página 2 de 6", {
          x: 0.6, y: 5.35, w: 8.8, h: 0.2, fontSize: 8, color: MUTED_GRAY, align: "center"
        });

        // ════════════════════════ SLIDE 3: MATRIZ DE 5 UNIDADES & MARGENS ════════════════════════
        const s3 = pptx.addSlide();
        s3.background = { color: WHITE_BG };

        s3.addText("TARIRA Ecosystem Services Lda. • Resumo Executivo • Página 3 de 6", {
          x: 0.6, y: 0.35, w: 8.8, h: 0.25, fontSize: 9, fontFace: "Arial", color: MUTED_GRAY
        });
        s3.addText("2. Matriz de 5 Unidades de Negócio, Margens e Consolidação Financeira", {
          x: 0.6, y: 0.65, w: 8.8, h: 0.4, fontSize: 16, fontFace: "Georgia", bold: true, color: TEXT_MAIN
        });

        // Left Frame Card Container: Dark Navy Background for Doughnut Chart
        s3.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 1.1, w: 4.2, h: 2.35, fill: { color: DARK_CARD_BG }, line: { color: BLUE_ACCENT, width: 1 }
        });
        s3.addText("📊 MIX DE RECEITAS BRUTAS (5 UNIDADES)", {
          x: 0.7, y: 1.15, w: 4.0, h: 0.25, fontSize: 8.5, fontFace: "Arial", bold: true, color: "F59E0B"
        });

        // Native PPTX Doughnut Chart: Mix de Faturamento Bruto
        s3.addChart(pptx.ChartType.doughnut, [
          {
            name: "Mix de Faturamento Bruto",
            labels: ["Business (52%)", "Connect (22%)", "Recruit (14%)", "Studio (8%)", "Consulting (4%)"],
            values: [52, 22, 14, 8, 4]
          }
        ], {
          x: 0.7, y: 1.4, w: 4.0, h: 2.0,
          showLegend: true,
          legendPos: "b",
          legendFontFace: "Arial",
          legendFontSize: 8,
          legendColor: "FFFFFF",
          chartColors: ["D97706", "2563EB", "10B981", "EC4899", "8B5CF6"],
          holeSize: 50
        });

        // Right Frame Card Container: Dark Navy Background for Bar Chart
        s3.addShape(pptx.ShapeType.rect, {
          x: 5.0, y: 1.1, w: 4.4, h: 2.35, fill: { color: DARK_CARD_BG }, line: { color: GREEN_ACCENT, width: 1 }
        });
        s3.addText("📊 MARGEM BRUTA (%) POR UNIDADE", {
          x: 5.1, y: 1.15, w: 4.2, h: 0.25, fontSize: 8.5, fontFace: "Arial", bold: true, color: "34D399"
        });

        // Native PPTX Horizontal Bar Chart: Margens Brutas por Unidade
        s3.addChart(pptx.ChartType.bar, [
          {
            name: "Margem Bruta (%)",
            labels: ["Business", "Connect", "Consulting", "Recruit", "Studio"],
            values: [35, 71, 84, 87, 88]
          }
        ], {
          x: 5.1, y: 1.4, w: 4.2, h: 2.0,
          barDir: "bar",
          showLegend: false,
          chartColors: ["10B981"],
          valAxisMaxVal: 100,
          catAxisLabelColor: "FFFFFF",
          valAxisLabelColor: "FFFFFF",
          catAxisLabelFontSize: 8.5,
          valAxisLabelFontSize: 8.5,
          showValue: true,
          dataLabelColor: "FFFFFF",
          dataLabelFontSize: 8.5
        });

        // 5 Colored Unit Pill Cards
        const units = [
          { title: "⚡ CONNECT", desc: "Taxa 18-20%\nMargem 71%", color: GOLD_AMBER, border: "FDE68A" },
          { title: "🔗 RECRUIT", desc: "35% Salário\nMargem 87%", color: BLUE_ACCENT, border: "BFDBFE" },
          { title: "💼 BUSINESS", desc: "Terceirização\nMargem 35%", color: "334155", border: "CBD5E1" },
          { title: "📋 CONSULTING", desc: "Fee 15k-45k MT\nMargem 84%", color: PURPLE_ACCENT, border: "DDD6FE" },
          { title: "🚀 STUDIO", desc: "SaaS 3k-8k/mês\nMargem 88%", color: PINK_ACCENT, border: "FBCFE8" }
        ];

        units.forEach((u, idx) => {
          const xPos = 0.6 + idx * 1.76;
          s3.addShape(pptx.ShapeType.rect, {
            x: xPos, y: 3.55, w: 1.7, h: 0.8, fill: { color: CARD_BG }, line: { color: u.border, width: 1 }
          });
          s3.addText(u.title, {
            x: xPos, y: 3.58, w: 1.7, h: 0.25, fontSize: 8, fontFace: "Arial", bold: true, color: u.color, align: "center"
          });
          s3.addText(u.desc, {
            x: xPos, y: 3.83, w: 1.7, h: 0.48, fontSize: 7.5, fontFace: "Arial", color: TEXT_MAIN, align: "center"
          });
        });

        // Executive Consolidado Frame Card
        s3.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 4.45, w: 8.8, h: 0.85, fill: { color: GREEN_CARD_BG }, line: { color: GREEN_CARD_BORDER, width: 1 }
        });
        s3.addText(
          "CONSOLIDADO FINANCEIRO ANO 1:\n" +
          "• Faturamento Bruto Anual: 18.500.000 MZN (Business 52%, Connect 22%, Recruit 14%, Studio 8%, Consulting 4%)\n" +
          "• EBITDA Operacional Ajustado (36,8%): 6.800.000 MZN | Lucro Líquido Projetado: 3.734.000 MZN",
          { x: 0.7, y: 4.48, w: 8.6, h: 0.78, fontSize: 9.5, fontFace: "Arial", bold: true, color: GREEN_ACCENT }
        );

        s3.addText("TARIRA Ecosystem Services Lda. • Página 3 de 6", {
          x: 0.6, y: 5.35, w: 8.8, h: 0.2, fontSize: 8, color: MUTED_GRAY, align: "center"
        });

        // ════════════════════════ SLIDE 4: WATERFALL DE DIVIDENDOS ════════════════════════
        const s4 = pptx.addSlide();
        s4.background = { color: WHITE_BG };

        s4.addText("TARIRA Ecosystem Services Lda. • Resumo Executivo • Página 4 de 6", {
          x: 0.6, y: 0.35, w: 8.8, h: 0.25, fontSize: 9, fontFace: "Arial", color: MUTED_GRAY
        });
        s4.addText("3. Ganhos do Sócio Investidor em Médio Prazo (Waterfall de Dividendos)", {
          x: 0.6, y: 0.65, w: 8.8, h: 0.4, fontSize: 16, fontFace: "Georgia", bold: true, color: TEXT_MAIN
        });

        // Allocation Box Frame Card
        s4.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 1.1, w: 8.8, h: 0.85, fill: { color: QUOTE_BG }, line: { color: QUOTE_BORDER, width: 1 }
        });
        s4.addText(
          "💵 ALOCAÇÃO TRANSPARENTE DOS 900.000 MT SEED (10% EQUITY):\n" +
          "• Capital Social Legal: 90.000 MT (10% Legal)  • Hostinger.com: 15.000 MT/ano\n" +
          "• Marketing & Angariação B2B: 215.000 MT  • Go Live & Liquidez: 580.000 MT",
          { x: 0.7, y: 1.15, w: 8.6, h: 0.75, fontSize: 9.5, fontFace: "Arial", bold: true, color: DARK_AMBER }
        );

        // Dark Frame Card for Dividend Waterfall Chart
        s4.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 2.05, w: 8.8, h: 2.2, fill: { color: DARK_CARD_BG }, line: { color: GOLD_AMBER, width: 1 }
        });
        s4.addText("📊 GRÁFICO DE CASCATA: DIVIDENDOS DIRETOS AO INVESTIDOR (10% DOS LUCROS)", {
          x: 0.7, y: 2.1, w: 8.6, h: 0.25, fontSize: 8.5, fontFace: "Arial", bold: true, color: "F59E0B"
        });

        // Native PPTX Bar Chart: Waterfall de Dividendos
        s4.addChart(pptx.ChartType.bar, [
          {
            name: "Dividendos Diretos ao Investidor (10%)",
            labels: ["Ano 1 (2026)", "Ano 2 (2027) Payback", "Ano 3 (2028)"],
            values: [373400, 1050000, 2100000]
          }
        ], {
          x: 0.7, y: 2.35, w: 8.6, h: 1.85,
          barDir: "col",
          showLegend: false,
          chartColors: ["D97706", "10B981", "059669"],
          catAxisLabelColor: "FFFFFF",
          valAxisLabelColor: "FFFFFF",
          catAxisLabelFontSize: 8.5,
          valAxisLabelFontSize: 8.5,
          showValue: true,
          dataLabelColor: "FFFFFF",
          dataLabelFontSize: 8.5
        });

        // Payback Frame Card
        s4.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 4.35, w: 8.8, h: 0.85, fill: { color: CARD_BG }, line: { color: GOLD_AMBER, width: 1 }
        });
        s4.addText(
          "💡 MÉTRICA DE PAYBACK & BREAK-EVEN:\n" +
          "• Total Dividendos 3 Anos: 3.523.400 MZN (391% Retorno sobre Aporte)\n" +
          "• Payback no Mês 14 (Ano 2): Dividendos acumulados (1.423.400 MT) superam em 158% o valor investido.",
          { x: 0.7, y: 4.38, w: 8.6, h: 0.78, fontSize: 9.5, fontFace: "Arial", bold: true, color: LIGHT_AMBER }
        );

        s4.addText("TARIRA Ecosystem Services Lda. • Página 4 de 6", {
          x: 0.6, y: 5.35, w: 8.8, h: 0.2, fontSize: 8, color: MUTED_GRAY, align: "center"
        });

        // ════════════════════════ SLIDE 5: EQUITY VALUE & MOIC ════════════════════════
        const s5 = pptx.addSlide();
        s5.background = { color: WHITE_BG };

        s5.addText("TARIRA Ecosystem Services Lda. • Resumo Executivo • Página 5 de 6", {
          x: 0.6, y: 0.35, w: 8.8, h: 0.25, fontSize: 9, fontFace: "Arial", color: MUTED_GRAY
        });
        s5.addText("4. Longo Prazo, Equity Value & Multiplicador MOIC (Gráfico de Valorização)", {
          x: 0.6, y: 0.65, w: 8.8, h: 0.4, fontSize: 16, fontFace: "Georgia", bold: true, color: TEXT_MAIN
        });

        // Dark Frame Card for Valuation Growth Chart
        s5.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 1.1, w: 8.8, h: 2.25, fill: { color: "022C22" }, line: { color: GREEN_ACCENT, width: 1 }
        });
        s5.addText("📊 ESCALA DE VALORIZAÇÃO DE EQUITY (VALUATION POST-MONEY)", {
          x: 0.7, y: 1.15, w: 8.6, h: 0.25, fontSize: 8.5, fontFace: "Arial", bold: true, color: "34D399"
        });

        // Native PPTX Bar Chart: Valuation Post-Money Growth
        s5.addChart(pptx.ChartType.bar, [
          {
            name: "Valuation Post-Money (MZN)",
            labels: ["Seed (2026)", "Ano 1 (2026)", "Ano 2 (2027)", "Ano 3 (2028)"],
            values: [9000000, 25000000, 60000000, 110000000]
          }
        ], {
          x: 0.7, y: 1.4, w: 8.6, h: 1.9,
          barDir: "col",
          showLegend: false,
          chartColors: ["D97706", "10B981", "059669", "34D399"],
          catAxisLabelColor: "FFFFFF",
          valAxisLabelColor: "FFFFFF",
          catAxisLabelFontSize: 8.5,
          valAxisLabelFontSize: 8.5,
          showValue: true,
          dataLabelColor: "FFFFFF",
          dataLabelFontSize: 8.5
        });

        // MOIC Multiplier Frame Card
        s5.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 3.45, w: 8.8, h: 0.85, fill: { color: QUOTE_BG }, line: { color: QUOTE_BORDER, width: 1 }
        });
        s5.addText(
          "🚀 MULTIPLICADOR DE CAPITAL TOTAL (MOIC DIVIDENDOS + EQUITY VALUE):\n" +
          "• Dividendos 3 Anos: 3.523.400 MT  • Equity Value (Ano 3): 11.000.000 MT (para os 10% do investidor)\n" +
          "• RETORNO MOIC TOTAL: 15.0x a 17.2x o capital investido",
          { x: 0.7, y: 3.48, w: 8.6, h: 0.78, fontSize: 9.5, fontFace: "Arial", bold: true, color: GREEN_ACCENT }
        );

        // Governance Frame Card
        s5.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 4.4, w: 8.8, h: 0.85, fill: { color: CARD_BG }, line: { color: BLUE_ACCENT, width: 1 }
        });
        s5.addText(
          "🤝 DIRECTRIZES DE GOVERNAÇÃO & PROTEÇÃO DE CAPITAL:\n" +
          "• Assento em Conselho | Dashboard Tempo Real | Cláusula Tag-Along Garantida (100%)\n" +
          "• Acolhimento de novos sócios estratégicos (1-2 B2B) para alavancar networking corporativo",
          { x: 0.7, y: 4.43, w: 8.6, h: 0.78, fontSize: 9.5, fontFace: "Arial", color: TEXT_MAIN }
        );

        s5.addText("TARIRA Ecosystem Services Lda. • Página 5 de 6", {
          x: 0.6, y: 5.35, w: 8.8, h: 0.2, fontSize: 8, color: MUTED_GRAY, align: "center"
        });

        // ════════════════════════ SLIDE 6: RESUMO EXPLICATIVO DOS INDICADORES ════════════════════════
        const s6 = pptx.addSlide();
        s6.background = { color: WHITE_BG };

        s6.addText("TARIRA Ecosystem Services Lda. • Resumo Executivo • Página 6 de 6", {
          x: 0.6, y: 0.35, w: 8.8, h: 0.25, fontSize: 9, fontFace: "Arial", color: MUTED_GRAY
        });
        s6.addText("5. Resumo Explicativo dos Indicadores Chave de Custos, Benefícios & Retornos", {
          x: 0.6, y: 0.65, w: 8.8, h: 0.4, fontSize: 15, fontFace: "Georgia", bold: true, color: TEXT_MAIN
        });

        const cards = [
          {
            title: "1. INDICADORES CHAVE DE CUSTO",
            color: GOLD_AMBER,
            border: GOLD_AMBER,
            bullets: [
              "• Folha Go Live: 119.000 MT/mês (CEO Vicente Dias + 1 RH + 3 Supervisores)",
              "• Hub Sede Maputo: 22.500 MT/mês na 2ª Fase (Custo Zero na 1ª Fase Cloud)",
              "• Tech & Cloud: 130.000 MT Laptops + 15.000 MT/ano Hostinger.com",
              "• Diluição por Técnico: ~340 MZN/mês de custo fixo por técnico para 350 profissionais"
            ]
          },
          {
            title: "2. INDICADORES CHAVE DE BENEFÍCIO",
            color: GREEN_ACCENT,
            border: GREEN_ACCENT,
            bullets: [
              "• Faturamento Bruto (Ano 1): 18.500.000 MT combinando as 5 Unidades",
              "• EBITDA Operacional: 6.800.000 MT (36,8% de margem EBITDA)",
              "• Lucro Líquido Projetado: 3.734.000 MT no Ano 1 (escalando para 21.000.000 MT no Ano 3)",
              "• Tração B2B Recorrente: Escala de 15 a 95 empresas em 3 anos"
            ]
          },
          {
            title: "3. RETORNO DO SÓCIO INVESTIDOR",
            color: BLUE_ACCENT,
            border: BLUE_ACCENT,
            bullets: [
              "• Aporte Seed & Equity: 900.000 MT por 10% Quota (90.000 MT Capital Social Legal)",
              "• Dividendos em 3 Anos: 373.400 MT ➔ 1.050.000 MT ➔ 2.100.000 MT = 3.523.400 MT",
              "• Payback & Break-Even: Payback no Mês 14 (158% no Ano 2) | Break-Even Mês 7",
              "• Valuation de Equity: De 9M MT para 110M MT no Ano 3 (10% Quota = 11M MT)"
            ]
          },
          {
            title: "4. GOVERNAÇÃO & SALVAGUARDAS",
            color: PURPLE_ACCENT,
            border: PURPLE_ACCENT,
            bullets: [
              "• Assento em Conselho: Direito a voto nas decisões estratégicas",
              "• Auditoria Tempo Real: Acesso direto ao dashboard financeiro",
              "• Cláusula Tag-Along: Proteção de 100% das quotas em aquisições",
              "• Reserva de Liquidez: Fundo de maneio de 380.000 MT retido na 3ª Fase"
            ]
          }
        ];

        cards.forEach((c, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const xPos = 0.6 + col * 4.5;
          const yPos = 1.15 + row * 2.05;

          // Card Outer Box
          s6.addShape(pptx.ShapeType.rect, {
            x: xPos, y: yPos, w: 4.3, h: 1.95, fill: { color: CARD_BG }, line: { color: c.border, width: 1 }
          });

          // Card Header Banner
          s6.addText(c.title, {
            x: xPos + 0.1, y: yPos + 0.08, w: 4.1, h: 0.3, fontSize: 9.5, fontFace: "Arial", bold: true, color: c.color
          });

          const formatted = c.bullets.map((b) => ({ text: b, options: { fontSize: 8.5, color: TEXT_MAIN, spaceAfter: 3 } }));

          s6.addText(formatted, {
            x: xPos + 0.1, y: yPos + 0.4, w: 4.1, h: 1.48, fontFace: "Arial"
          });
        });

        s6.addText("TARIRA Ecosystem Services Lda. • Página 6 de 6", {
          x: 0.6, y: 5.35, w: 8.8, h: 0.2, fontSize: 8, color: MUTED_GRAY, align: "center"
        });

        await pptx.writeFile({ fileName: "TARIRA_Resumo_Executivo_Custo_Beneficio_2026.pptx" });

      } else if (activeDocument === "business_plan") {
        pptx.title = "TARIRA Ecosystem Services - Plano de Negócios Completo 2026";

        const bpPages = [
          {
            num: 1,
            title: "1. Definição da TARIRA Ecosystem Services Lda. & Modelo Híbrido",
            bullets: [
              "A TARIRA Ecosystem Services Lda. é uma infraestrutura tecnológica e operacional integrada em Moçambique.",
              "Execução 70%-80% na Plataforma Web: Pedidos, matching, recrutamento ATS, despacho e pagamentos digitais.",
              "Instalação do Espaço Físico / Hub Maputo a partir da 2ª Fase para cadastro presencial e acolhimento B2B.",
              "Alojamento Web Hostinger.com: Custo ajustado de 15.000 MT/ano para servidor Cloud e domínio corporativo.",
              "Liderança: Vicente Dias atua como CEO & Founder, agregando programação, design, recrutamento e angariação."
            ]
          },
          {
            num: 2,
            title: "2. Origem, Razão de Criação & Justificativa do Ecossistema",
            bullets: [
              "Desafio do Mercado: 85% a 90% das contratações de serviços em Moçambique ocorrem no setor informal sem garantias.",
              "Incerteza & Atrasos: 72% de risco de desvio de prazos por falta de verificações prévias de idoneidade.",
              "Fundamentação: Concebido por Vicente Dias com base em +10 Anos de experiência em Coordenação Operacional.",
              "Agilidade B2B: Redução do tempo de seleção de quadros de 14 dias para menos de 48 horas.",
              "Solução 5-em-1: Integração de Ofícios Técnicos, Recrutamento Elite, Terceirização B2B, Consultoria e Micro-SaaS."
            ]
          },
          {
            num: 3,
            title: "3. Estrutura Operacional dos 5 Pilares & Valuation",
            bullets: [
              "TARIRA Connect: Retenção de 18% a 20% do orçamento de serviços de reparações e manutenção.",
              "TARIRA Recruit: Cobrança de 35% do 1º salário mensal bruto do candidato recrutado.",
              "TARIRA Business: Contratos de terceirização B2B com margem de fee de 25%-30% ou taxa de infraestrutura.",
              "TARIRA Consulting & Studio: Consultoria RH + Subscrição SaaS para PMEs (3.000 a 8.000 MT/mês).",
              "Métricas de Valuation: Valuation Post-Money de 9.000.000 MT | Break-Even Mês 7 | Payback 14 Meses."
            ]
          },
          {
            num: 4,
            title: "4. Proposta de Investimento Seed & Alocação em 3 Fases",
            bullets: [
              "Aporte Requerido: 900.000 MT por 10% de Quota Social da Empresa.",
              "Capital Social Legal: 10% (90.000 MT) afeto diretamente à constituição formal do Capital Social.",
              "1ª FASE (105.000 MT): Lançamento Web Cloud Hostinger.com + Pró-labore CEO. Sem RH nem imóvel.",
              "2ª FASE (215.000 MT): Marketing B2B, Angariadores Comerciais (+35.000 MT) e Início do Hub Maputo.",
              "3ª FASE (580.000 MT): Go Live Oficial, Hub Completo (380.000 MT) e Equipa Operacional RH/Supervisores (200.000 MT)."
            ]
          },
          {
            num: 5,
            title: "5. Projeções de Crescimento, EBITDA & Lucro (3 Anos)",
            bullets: [
              "Ano 1 (2026): Faturamento Bruto 18.500.000 MT | EBITDA 6.800.000 MT (36,8%) | Lucro Líquido 3.734.000 MT",
              "Ano 2 (2027): Faturamento Bruto 46.800.000 MT | EBITDA 13.920.000 MT (29,7%) | Lucro Líquido 10.500.000 MT",
              "Ano 3 (2028): Faturamento Bruto 108.000.000 MT | EBITDA 26.560.000 MT (24,6%) | Lucro Líquido 21.000.000 MT",
              "Dividendos Acumulados ao Investidor (10%): 373.400 MT (Ano 1) ➔ 1.050.000 MT (Ano 2) ➔ 2.100.000 MT (Ano 3)",
              "Validação do Documento: Aprovado por Vicente Dias (CEO & Founder) • Maputo, Moçambique (2026)."
            ]
          }
        ];

        bpPages.forEach((p) => {
          const s = pptx.addSlide();
          s.background = { color: WHITE_BG };

          s.addText("TARIRA Ecosystem Services Lda. • Plano de Negócios Completo 2026", {
            x: 0.6, y: 0.35, w: 8.8, h: 0.25, fontSize: 9, fontFace: "Arial", color: MUTED_GRAY
          });
          s.addText(`PÁGINA ${p.num} DE 5 • PLANO ESTRATÉGICO OFICIAL`, {
            x: 0.6, y: 0.65, w: 8.8, h: 0.3, fontSize: 10, fontFace: "Arial", bold: true, color: GOLD_AMBER
          });
          s.addText(p.title, {
            x: 0.6, y: 0.95, w: 8.8, h: 0.5, fontSize: 16, fontFace: "Georgia", bold: true, color: TEXT_MAIN
          });

          // Card Container Box Frame
          s.addShape(pptx.ShapeType.rect, {
            x: 0.6, y: 1.55, w: 8.8, h: 3.6, fill: { color: CARD_BG }, line: { color: GOLD_AMBER, width: 1 }
          });

          const formatted = p.bullets.map((b) => ({
            text: b,
            options: { fontSize: 10.5, color: TEXT_MAIN, bullet: true, spaceAfter: 12 }
          }));

          s.addText(formatted, {
            x: 0.8, y: 1.7, w: 8.4, h: 3.3, fontFace: "Arial"
          });

          s.addText("TARIRA Ecosystem Services Lda. • Documento Oficial de Investimento 2026", {
            x: 0.6, y: 5.35, w: 8.8, h: 0.2, fontSize: 8, color: MUTED_GRAY, align: "center"
          });
        });

        await pptx.writeFile({ fileName: "TARIRA_Plano_de_Negocios_Completo_2026.pptx" });

      } else {
        // Pitch Deck (10 slides)
        pptx.title = "TARIRA Ecosystem Services - Pitch Deck Oficial 2026";

        const coverSlide = pptx.addSlide();
        coverSlide.background = { color: WHITE_BG };

        coverSlide.addImage({
          data: LOGO_SVG_DATA_URL,
          x: 4.35, y: 0.15, w: 1.3, h: 0.76
        });
        coverSlide.addText("TARIRA", {
          x: 0.6, y: 0.92, w: 8.8, h: 0.42, fontSize: 32, fontFace: "Georgia", bold: true, color: TEXT_MAIN, align: "center", charSpacing: 4
        });
        coverSlide.addText("TARIRA Ecosystem Services Lda. • Maputo, Moçambique (2026)", {
          x: 0.6, y: 1.35, w: 8.8, h: 0.2, fontSize: 9, fontFace: "Arial", bold: true, color: GOLD_AMBER, align: "center"
        });
        coverSlide.addShape(pptx.ShapeType.line, {
          x: 4.2, y: 1.58, w: 1.6, h: 0, line: { color: "CBD5E1", width: 1 }
        });
        coverSlide.addText("Supervisionamos. Para que não precise.", {
          x: 0.6, y: 1.64, w: 8.8, h: 0.25, fontSize: 11, fontFace: "Georgia", italic: true, bold: true, color: LIGHT_AMBER, align: "center"
        });
        coverSlide.addText("WE OVERSEE. SO YOU DON'T HAVE TO.", {
          x: 0.6, y: 1.89, w: 8.8, h: 0.2, fontSize: 8.5, fontFace: "Arial", color: MUTED_GRAY, align: "center", charSpacing: 2
        });

        // Quote Frame
        coverSlide.addShape(pptx.ShapeType.rect, {
          x: 0.8, y: 2.5, w: 8.4, h: 0.55, fill: { color: QUOTE_BG }, line: { color: QUOTE_BORDER, width: 1 }
        });
        coverSlide.addText("“A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”", {
          x: 0.8, y: 2.5, w: 8.4, h: 0.55, fontSize: 12, fontFace: "Georgia", bold: true, italic: true, color: LIGHT_AMBER, align: "center"
        });
        coverSlide.addText("Conectando Talentos e Oportunidades • Ecossistema de Serviços de Moçambique", {
          x: 0.6, y: 3.15, w: 8.8, h: 0.35, fontSize: 11, fontFace: "Arial", color: MUTED_GRAY, align: "center"
        });

        // Highlights Frame Card
        coverSlide.addShape(pptx.ShapeType.rect, {
          x: 0.8, y: 3.6, w: 8.4, h: 1.4, fill: { color: CARD_BG }, line: { color: GOLD_AMBER, width: 1 }
        });
        coverSlide.addText(
          "PITCH DECK OFICIAL DE INVESTIMENTO SEED (10 SLIDES)\n" +
          "• Aporte Requerido: 900.000 Meticais por 10% de Quota Social (10% / 90.000 MT para Capital Social Formal)\n" +
          "• Modelo de Negócio: 70%-80% Executado Intrinsecamente na Plataforma Web com Renda Comercial Enxuta\n" +
          "• CEO & Founder: Vicente Dias (Programador, Designer, Arquitecto, Recrutador e Angariador Comercial)\n" +
          "• Fases do Aporte: 1ª Fase (Plataforma Web), 2ª Fase (Marketing/Angariação B2B) e 3ª Fase (Início de Actividades & Hub Maputo)",
          { x: 0.9, y: 3.65, w: 8.2, h: 1.3, fontSize: 9.5, fontFace: "Arial", color: TEXT_MAIN, align: "left" }
        );
        coverSlide.addText("TARIRA Ecosystem Services Lda. • Documento de Investimento 2026", {
          x: 0.6, y: 5.15, w: 8.8, h: 0.25, fontSize: 8, color: MUTED_GRAY, align: "center"
        });

        pitchSlides.forEach((slide) => {
          const pptSlide = pptx.addSlide();
          pptSlide.background = { color: WHITE_BG };

          pptSlide.addText("TARIRA Ecosystem Services Lda. • Maputo, Moçambique (2026)", {
            x: 0.6, y: 0.35, w: 8.8, h: 0.3, fontSize: 11, fontFace: "Georgia", bold: true, color: GOLD_AMBER
          });
          pptSlide.addText("Supervisionamos. Para que não precise. | WE OVERSEE. SO YOU DON'T HAVE TO.", {
            x: 0.6, y: 0.68, w: 8.8, h: 0.25, fontSize: 8.5, fontFace: "Arial", italic: true, color: MUTED_GRAY
          });
          pptSlide.addText(`SLIDE ${slide.num} DE 10 • ${slide.tag}`, {
            x: 0.6, y: 1.0, w: 8.8, h: 0.3, fontSize: 10, fontFace: "Arial", bold: true, color: LIGHT_AMBER
          });
          pptSlide.addText(slide.title, {
            x: 0.6, y: 1.3, w: 8.8, h: 0.5, fontSize: 19, fontFace: "Georgia", bold: true, color: TEXT_MAIN
          });
          pptSlide.addText(slide.subtitle, {
            x: 0.6, y: 1.8, w: 8.8, h: 0.35, fontSize: 10.5, fontFace: "Arial", italic: true, color: TEXT_SUB
          });

          let bulletsY = 2.25;
          if (slide.num === 1 || slide.num === 3) {
            pptSlide.addShape(pptx.ShapeType.rect, {
              x: 0.6, y: 2.2, w: 8.8, h: 0.45, fill: { color: QUOTE_BG }, line: { color: QUOTE_BORDER, width: 1 }
            });
            pptSlide.addText("“A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”", {
              x: 0.6, y: 2.2, w: 8.8, h: 0.45, fontSize: 10, fontFace: "Georgia", bold: true, italic: true, color: LIGHT_AMBER, align: "center"
            });
            bulletsY = 2.75;
          }

          if (slide.problems) {
            slide.problems.forEach((p, idx) => {
              const col = idx % 2;
              const row = Math.floor(idx / 2);
              const xPos = 0.6 + col * 4.5;
              const yPos = 2.25 + row * 1.35;

              // Card Container
              pptSlide.addShape(pptx.ShapeType.rect, {
                x: xPos, y: yPos, w: 4.3, h: 1.25, fill: { color: CARD_BG }, line: { color: GOLD_AMBER, width: 1 }
              });

              pptSlide.addText(`${p.metric}  •  ${p.badge}\n${p.label}\n${p.desc}`, {
                x: xPos + 0.1, y: yPos + 0.05, w: 4.1, h: 1.15, fontSize: 9.5, fontFace: "Arial", color: TEXT_MAIN, align: "left"
              });
            });
          } else {
            const cardHeight = 5.0 - bulletsY;
            pptSlide.addShape(pptx.ShapeType.rect, {
              x: 0.6, y: bulletsY, w: 8.8, h: cardHeight, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
            });

            const formattedBullets = slide.bullets.map((b) => ({
              text: b,
              options: { fontSize: 10, color: TEXT_MAIN, bullet: true, spaceAfter: 6 }
            }));

            pptSlide.addText(formattedBullets, {
              x: 0.8, y: bulletsY + 0.15, w: 8.4, h: cardHeight - 0.3, fontFace: "Arial"
            });
          }

          pptSlide.addText("TARIRA Lda. • Proposta de Financiamento Seed • Maputo, Moçambique", {
            x: 0.6, y: 5.15, w: 8.8, h: 0.25, fontSize: 8, color: MUTED_GRAY, align: "right"
          });
        });

        await pptx.writeFile({ fileName: "TARIRA_Pitch_Deck_10_Slides_Oficial_2026.pptx" });
      }
    } catch (err) {
      console.error("Erro ao exportar PowerPoint:", err);
      alert("Ocorreu um erro ao gerar o PowerPoint. Pode também descarregar em PDF ou imprimir.");
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const pitchSlides = [
    {
      num: 1,
      tag: "CAPA / ELEVATOR PITCH",
      title: "TARIRA Ecosystem Services Lda.",
      subtitle: "Modelo Híbrido (70%-80% Plataforma Web / 20%-30% Renda Comercial Enxuta) de Mão-de-Obra & B2B",
      icon: "🌐",
      bullets: [
        "Proposta de Valor Chave: “A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”",
        "Execução 70%-80% na Plataforma Web: Todas as operações (pedidos, matching, recrutamento ATS, despacho e pagamentos) são geridas no ecossistema digital.",
        "Alojamento Web & Domínio Hostinger.com: Custo real ajustado de 15.000 MT/ano (~1,67% do aporte de 900.000 MT), garantindo alta velocidade, SSL e e-mail empresarial.",
        "CEO & Founder: Vicente Dias atua como CEO & Founder, assumindo a função de Angariador Comercial, Programador, Designer e Recrutador na fase de arranque.",
        "Fases do Aporte (900.000 MT): 1ª Fase (105.000 MT - Web/Cloud Hostinger + Capital Social Legal), 2ª Fase (215.000 MT - Marketing e Angariação B2B) e 3ª Fase (580.000 MT - Go Live & Hub Maputo)."
      ]
    },
    {
      num: 2,
      tag: "O CONTEXTO & O PROBLEMA DO MERCADO",
      title: "Informalidade, Incerteza e Burocracia",
      subtitle: "As falhas crónicas do mercado de serviços e recrutamento em Moçambique",
      icon: "🛑",
      problems: [
        {
          metric: "85% - 90%",
          label: "Informalidade Crónica",
          badge: "Sem Proteção Legal",
          desc: "Contratações 'boca-a-boca' sem garantias, sem histórico de fiabilidade e sem verificação de identidade legal.",
          color: "border-rose-500/40 bg-rose-500/5 text-rose-700"
        },
        {
          metric: "72%",
          label: "Incerteza de Prazos",
          badge: "Custos Ocultos",
          desc: "Frequentes atrasos, desvios de qualidade e abandono de serviços por prestadores sem reputação auditada.",
          color: "border-blue-500/40 bg-blue-500/5 text-blue-700"
        },
        {
          metric: "0%",
          label: "Canal Web Unificado",
          badge: "Vácuo Digital",
          desc: "Ausência de uma plataforma web única em Moçambique para contratar, acompanhar e pagar de forma transparente.",
          color: "border-blue-500/40 bg-blue-500/5 text-blue-700"
        },
        {
          metric: "14+ Dias",
          label: "Burocracia Corporativa",
          badge: "Lenteza B2B",
          desc: "Empresas perdem semanas e recursos em processos manuais dispersos para selecionar e alocar quadros qualificados.",
          color: "border-purple-500/40 bg-purple-500/5 text-purple-700"
        }
      ],
      bullets: [
        "Elevada Informalidade: 85% a 90% dos serviços residenciais e técnicos ocorrem no mercado informal 'boca-a-boca' sem garantias.",
        "Incerteza e Atrasos: 72% de risco de desvio de prazos por falta de verificação e avaliações auditadas.",
        "Ausência de Canal Digital Direto: Inexistência de uma plataforma web única onde contratações e pagamentos sejam geridos em tempo real.",
        "Gestão B2B Lenta: Empresas perdem 14+ dias em processos manuais para selecionar e gerir quadros terceirizados."
      ]
    },
    {
      num: 3,
      tag: "PORQUÊ A TARIRA FOI CRIADA",
      title: "Tecnologia + Agilidade no Mercado",
      subtitle: "Solução desenhada a partir de 10+ Anos de Coordenação Operacional Real",
      icon: "💡",
      bullets: [
        "Diferencial Competitivo: A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta através de auditorias e verificações prévias.",
        "Execução Intrinsecamente Digital (70%-80%): Plataforma Web automatizada eliminando intermediação manual desnecessária.",
        "Experiência do CEO & Founder: Criada por Vicente Dias, respaldado por +10 Anos de experiência como Coordenador Operacional e atuação multifacetada (CEO, angariação, programação, design e recrutamento).",
        "Eficiência de Custos: Infraestrutura digital otimizada no Hostinger.com (15.000 MT/ano) e instalações físicas em modelo de renda comercial enxuta.",
        "Visão de Ecossistema: Acolhimento de novos sócios estratégicos para alavancar networking corporativo e captação B2B."
      ]
    },
    {
      num: 4,
      tag: "OS 5 PILARES DO ECOSSISTEMA TARIRA",
      title: "Solução Completa 5-em-1 Integrada",
      subtitle: "70%-80% da operação gerida diretamente dentro da plataforma web e ecossistema digital",
      icon: "⚡",
      bullets: [
        "1. TARIRA Connect (Ofícios Técnicos): Chamada imediata e agendamento web de eletricistas, canalizadores, pintores e técnicos. Retenção de 18% a 20%.",
        "2. TARIRA Recruit (Quadros de Elite): Triagem algorítmica ATS e seleção na plataforma. Cobrança de 35% do 1º salário mensal do profissional colocado.",
        "3. TARIRA Business (Terceirização B2B & 3 Modelos): Contratos corporativos recorrentes geridos pelo portal web (Custo Salarial + Fee 25-30% ou Taxa de Infraestrutura).",
        "4. TARIRA Consulting (End-to-End Operacional): Gestão de back-office, compliance laboral e relatórios operacionais em tempo real na plataforma.",
        "5. TARIRA Studio (Micro-SaaS & Vitrine 'Axofacil'): Vitrine digital para PMEs e comerciantes, gestão de operadores multi-login, e-commerce e automação comercial (Subscrição SaaS + Taxa de Transação)."
      ]
    },
    {
      num: 5,
      tag: "MODELO DE NEGÓCIO & MARGENS",
      title: "Monetização Clara dos 5 Pilares",
      subtitle: "Fluxos de receita digitais recorrentes com margens operacionais elevadas",
      icon: "💰",
      bullets: [
        "TARIRA Connect: Retenção de 18% a 20% do orçamento via plataforma (Margem Bruta: 68% - 75%).",
        "TARIRA Recruit: Taxa de 35% do primeiro salário mensal bruto do candidato colocado (Margem Bruta: 85% - 90%).",
        "TARIRA Business: Cobrança mensal via portal — Apenas Profissionais (Salário + Fee RH 25-30%) ou Profissionais + Espaço (Salário + Taxa de Espaço).",
        "TARIRA Consulting: Projetos corporativos sob proposta personalizada com acompanhamento digital (Margem Bruta: 70% - 80%).",
        "TARIRA Studio: Mensalidade de subscrição SaaS (3.000 a 8.000 MT/mês por PME/Loja) + 2,5% a 5% de comissão sobre vendas digitais (Margem Bruta: 85% - 92%)."
      ]
    },
    {
      num: 6,
      tag: "VALUATION & MÉTRICAS FINANCEIRAS",
      title: "Avaliação da Empresa & EBITDA",
      subtitle: "Sustentado por produto funcional, operação digital escalável e baixa estrutura fixa",
      icon: "📊",
      bullets: [
        "Valuation Post-Money: 9.000.000 Meticais | Valuation Pre-Money: 8.100.000 Meticais.",
        "EBITDA Projetado (Ano 1): 4.882.000 Meticais (Margem EBITDA de 26,4% sobre o Faturamento Bruto de 18.500.000 Meticais).",
        "Ponto de Equilíbrio (Break-Even): Alcançado no Mês 7 com escala acelerada pela plataforma web.",
        "Tempo de Retorno (Payback Period): 14 Meses para amortização total do aporte do investidor."
      ]
    },
    {
      num: 7,
      tag: "PROPOSTA DE INVESTIMENTO & CAPITAL SOCIAL",
      title: "Termos do Aporte Seed (Proposta de Investimento Inicial)",
      subtitle: "Empresa: TARIRA Ecosystem Services Lda. (CEO & Founder: Vicente Dias)",
      icon: "💎",
      bullets: [
        "Aporte Requerido: 900.000 Meticais por 10% de Quota Social da Empresa (Valuation Post-Money: 9.000.000 MZN).",
        "Capital Social Legal: 10% do valor do aporte (90.000 Meticais) destina-se diretamente à constituição do Capital Social formal.",
        "Hospedagem & Domínio Real Hostinger.com: Apenas 15.000 MT (~1,67%) para o plano anual de alojamento Web Cloud + domínio .co.mz/.com.",
        "Salário do CEO & Founder (Vicente Dias): Remuneração garantida desde as fases iniciais (1ª, 2ª e 3ª Fase) pelo envolvimento ativo em todos os segmentos do projeto (Tech, Design, Ops e B2B).",
        "Evolução Operacional em 3 Fases: Sem Assistente de RH nem Supervisores nas Fases 1 e 2. Na 2ª Fase ativam-se os Angariadores Comerciais (+35.000 MT reencaminhados para marketing) e o Espaço Físico/Hub. A ativação de RH e Supervisores ocorre no 'Go Live' (Fase 3)."
      ]
    },
    {
      num: 8,
      tag: "ALOCAÇÃO DOS RECURSOS EM 3 FASES (900.000 METICAIS)",
      title: "Análise Custo-Benefício e Fases de Execução do Aporte",
      subtitle: "Uso Otimizado do Aporte: 1ª Fase (Web/Hostinger Cloud), 2ª Fase (Marketing/Angariação B2B e Hub) e 3ª Fase (Go Live)",
      icon: "🎯",
      bullets: [
        "1ª FASE - LANÇAMENTO WEB & CLOUD (11,7% / 105.000 MT): 10% (90.000 MT) Constituição Legal do Capital Social + 1,67% (15.000 MT) Hospedagem Anual & Domínio Hostinger.com + Pró-Labore CEO & Founder. Sem encargos com RH, supervisores ou imóvel.",
        "2ª FASE - MARKETING B2B, ANGARIAÇÃO & ESPAÇO FÍSICO (23,9% / 215.000 MT): Divulgação intensiva e Angariadores Comerciais (+35.000 MT reencaminhados da rubrica técnica) e instalação do Espaço Físico / Hub Maputo para reuniões B2B e cadastro de prestadores.",
        "3ª FASE - GO LIVE & OPERAÇÃO COMPLETA (64,4% / 580.000 MT): Lançamento oficial em direto, Hub Maputo (380.000 MT com +20.000 MT para fundo de liquidez), Equipa Operacional (200.000 MT com +20.000 MT para onboarding/formação) e métrica do CEO por ações e lucros anuais."
      ]
    },
    {
      num: 9,
      tag: "LIDERANÇA, EQUIPA & MÉTRICA DO CEO & FOUNDER EM 3 FASES",
      title: "CEO & Founder (Vicente Dias) & Estrutura Operacional",
      subtitle: "Envolvimento total em todas as fases com evolução de métrica no Go Live",
      icon: "👥",
      bullets: [
        "Vicente Dias (CEO & Founder): Remuneração ativa direcionada desde o 1º dia (Fases 1, 2 e 3) pelo envolvimento multifacetado em todos os segmentos da empresa.",
        "Métrica no 'Go Live' (3ª Fase): Com a entrada em funcionamento em direto, a performance do CEO & Founder é avaliada por ações operacionais executadas e pela participação no valor anual dos lucros líquidos.",
        "Supervisores de Campo & RH no 'Go Live': Assistente de RH e Supervisores de Campo NÃO são contratados nas Fases 1 e 2 (a supervisão de campo só é necessária a partir da entrada da operação ao vivo na Fase 3).",
        "Prioridade & Espaço Físico na 2ª Fase: Na Fase 2, além dos Angariadores Comerciais & Marketing, inicia-se a infraestrutura do Espaço Físico/Hub para receção, recrutamento e angariação presencial de prestadores de serviços e clientes B2B."
      ]
    },
    {
      num: 10,
      tag: "CRONOGRAMA & ANÁLISE CUSTO-BENEFÍCIO EM 3 FASES",
      title: "Cronograma de Execução & 'Go Live'",
      subtitle: "Passos imediatos para fecho do acordo Seed e escala operacional gradual",
      icon: "🚀",
      bullets: [
        "Assinatura do Acordo Seed & Depósito do Capital Social Formal (90.000 MT) + Alojamento Hostinger.com (15.000 MT).",
        "1ª Fase: Lançamento Oficial da Plataforma Web e Estrutura Hostinger Cloud (100% digital, CEO & Founder a cobrir todas as frentes).",
        "2ª Fase: Aceleração B2B com Marketing Digital, Angariadores Comerciais (215.000 MT) e abertura do Espaço Físico/Hub para angariação presencial de prestadores de serviços e clientes B2B.",
        "3ª Fase - 'Go Live': Abertura completa do Hub Sede Maputo (380.000 MT), entrada da folha de Supervisores de Campo, Assistente de RH Fixo (200.000 MT) e ativação das métricas do CEO & Founder por ações e lucros anuais."
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 flex justify-center items-start sm:items-center">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full my-auto flex flex-col max-h-[88vh] overflow-hidden animate-scale-up text-slate-900">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-white text-[#172554] flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-700 font-bold text-lg">
              📄
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#172554] leading-tight">
                Documentos de Investimento & Estratégia TARIRA
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Plano de Negócios & Pitch Deck Exportáveis em PDF e PowerPoint (.pptx)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPPTX}
              disabled={isExportingPPTX}
              className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border border-blue-500/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
              title="Descarregar apresentação em PowerPoint editável (.pptx)"
            >
              {isExportingPPTX ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                  <span>A Criar PPTX...</span>
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4 text-blue-700" />
                  <span>Baixar PowerPoint (.pptx)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-700 text-blue-700 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
              title="Ver e copiar minuta de e-mail personalizada com destaques da proposta de custos, benefícios e TARIRA Studio"
            >
              <span>✉️ Minuta de E-mail p/ Investidor</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              title="Descarregar ficheiro PDF oficial completo com todas as páginas"
            >
              {isExportingPDF ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>{pdfExportProgress || "A Gerar PDF..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descarregar PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintNative}
              className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-[#172554] hover:bg-slate-700 transition-all cursor-pointer hidden sm:flex"
              title="Imprimir Documento"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-blue-400 text-blue-700 hover:bg-blue-400 hover:text-[#172554] font-black transition-all flex items-center justify-center cursor-pointer shadow-xl active:scale-95 ml-2 shrink-0"
              title="Fechar (ESC)"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Tab & View Mode Control Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveDocument("cost_benefit");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeDocument === "cost_benefit"
                  ? "bg-blue-500 text-white shadow-md border border-blue-400"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>✨ Resumo Custo-Benefício (6 Páginas)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveDocument("business_plan");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeDocument === "business_plan"
                  ? "bg-white text-blue-700 shadow-md border border-slate-200"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Plano de Negócios (5 Páginas)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveDocument("pitch_deck");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeDocument === "pitch_deck"
                  ? "bg-white text-blue-700 shadow-md border border-slate-200"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Pitch Deck (10 Slides)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("pages")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "pages"
                  ? "bg-blue-500 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Visualização em modo reunião: veja uma página por vez sem rolagem contínua"
            >
              <span>💻 Modo Reunião (Página a Página)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("scroll")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "scroll"
                  ? "bg-white text-blue-700 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Visualização em documento contínuo"
            >
              <span>📜 Modo Leitura Contínua</span>
            </button>
          </div>
        </div>

        {/* Meeting Navigation Toolbar when in Page-by-Page Mode */}
        {viewMode === "pages" && (
          <div className="bg-white text-[#172554] px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 border border-blue-500/40 text-xs font-mono font-bold uppercase">
                {activeDocument === "cost_benefit"
                  ? `Página ${activeCostBenefitPage} de 6`
                  : activeDocument === "business_plan"
                  ? `Página ${activeBusinessPlanPage} de 5`
                  : `Slide ${activePitchSlide} de 10`}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                • Use as setas ◄ / ► do teclado para navegar
              </span>
            </div>

            {/* Quick Page Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  if (activeDocument === "cost_benefit") {
                    setActiveCostBenefitPage((prev) => Math.max(1, prev - 1));
                  } else if (activeDocument === "business_plan") {
                    setActiveBusinessPlanPage((prev) => Math.max(1, prev - 1));
                  } else {
                    setActivePitchSlide((prev) => Math.max(1, prev - 1));
                  }
                }}
                disabled={
                  activeDocument === "cost_benefit"
                    ? activeCostBenefitPage === 1
                    : activeDocument === "business_plan"
                    ? activeBusinessPlanPage === 1
                    : activePitchSlide === 1
                }
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-700 text-blue-700 disabled:opacity-30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 mr-1"
              >
                <ChevronLeft className="w-4 h-4" /> <span>Anterior</span>
              </button>

              {activeDocument === "cost_benefit"
                ? [1, 2, 3, 4, 5, 6].map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setActiveCostBenefitPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeCostBenefitPage === pageNum
                          ? "bg-blue-500 text-white font-black scale-105 shadow"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))
                : activeDocument === "business_plan"
                ? [1, 2, 3, 4, 5].map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setActiveBusinessPlanPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeBusinessPlanPage === pageNum
                          ? "bg-blue-500 text-white font-black scale-105 shadow"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))
                : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((slideNum) => (
                    <button
                      key={slideNum}
                      type="button"
                      onClick={() => setActivePitchSlide(slideNum)}
                      className={`w-7 h-7 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        activePitchSlide === slideNum
                          ? "bg-blue-500 text-white font-black scale-105 shadow"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-700"
                      }`}
                    >
                      {slideNum}
                    </button>
                  ))}

              <button
                type="button"
                onClick={() => {
                  if (activeDocument === "cost_benefit") {
                    setActiveCostBenefitPage((prev) => Math.min(6, prev + 1));
                  } else if (activeDocument === "business_plan") {
                    setActiveBusinessPlanPage((prev) => Math.min(5, prev + 1));
                  } else {
                    setActivePitchSlide((prev) => Math.min(10, prev + 1));
                  }
                }}
                disabled={
                  activeDocument === "cost_benefit"
                    ? activeCostBenefitPage === 6
                    : activeDocument === "business_plan"
                    ? activeBusinessPlanPage === 5
                    : activePitchSlide === 10
                }
                className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-1"
              >
                <span>Próximo</span> <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Document Printable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 font-sans" id="printable-investor-doc">
          <div ref={documentRef} className="max-w-4xl mx-auto space-y-6 text-slate-900">
            
            {/* ════════════════════════ DOCUMENT 0: RESUMO EXECUTIVO CUSTO-BENEFÍCIO (6 PÁGINAS) ════════════════════════ */}
            {activeDocument === "cost_benefit" && (
              <>
                {viewMode === "pages" ? (
                  /* PAGE-BY-PAGE PRESENTATION SLICES MODE FOR COST-BENEFIT */
                  <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-300 shadow-2xl space-y-8 min-h-[680px] flex flex-col justify-between transition-all animate-fade-in text-left">
                    {/* PAGE 1 OF 6: CAPA & MÉTRICAS VISUAIS DO ACORDO SEED */}
                    {activeCostBenefitPage === 1 && (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div>
                          <TariraDocumentBrandHeader light={true} />

                          <div className="border-b-4 border-blue-500 pb-5 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                                <span>⚡ RESUMO EXECUTIVO CUSTO-BENEFÍCIO • SÍNTESE GRÁFICA</span>
                              </div>
                              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-950">
                                Análise de Custos, Benefícios & Retorno do Investimento
                              </h2>
                              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                                Apresentação Executiva em 6 Páginas • Aporte Seed: 900.000 Meticais por 10% Equity
                              </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-300 text-right shrink-0">
                              <span className="text-[10px] font-mono font-bold uppercase text-blue-900 block">Proposta de Investimento</span>
                              <span className="text-sm font-bold text-slate-950 block">Investidor Proponente</span>
                              <span className="text-[10px] text-blue-700 font-bold block mt-0.5">Seed Deal 2026/2029</span>
                            </div>
                          </div>

                          {/* Trust Quote Banner */}
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/15 via-blue-500/10 to-transparent border-l-4 border-blue-500 my-5">
                            <p className="text-xs sm:text-sm font-serif font-bold italic text-blue-950">
                              “A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”
                            </p>
                          </div>

                          {/* Visual Deal Dashboard Cards Grid */}
                          <div className="p-6 rounded-3xl bg-white text-[#172554] space-y-5 shadow-2xl border border-slate-200">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                              <span className="font-serif font-bold text-lg text-blue-700 flex items-center gap-2">
                                💎 Dashboard Sintético da Oportunidade Seed
                              </span>
                              <div className="flex gap-2">
                                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-700 text-[10px] font-mono font-bold border border-blue-500/40">
                                  10% CAPITAL SOCIAL
                                </span>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 text-[10px] font-mono font-bold border border-emerald-500/40">
                                  VALUATION: 9M MZN
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
                              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                                <span className="text-[10px] text-blue-700 uppercase font-bold block">1. Aporte Requerido</span>
                                <span className="font-black text-[#172554] text-xl block">900.000 MT</span>
                                <span className="text-[9px] text-slate-400 block">10% Equity (90.000 MT Cap. Social)</span>
                              </div>

                              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                                <span className="text-[10px] text-emerald-600 uppercase font-bold block">2. Valuation Post-Money</span>
                                <span className="font-black text-[#172554] text-xl block">9.000.000 MT</span>
                                <span className="text-[9px] text-slate-400 block">Base de Subscrição Formal</span>
                              </div>

                              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                                <span className="text-[10px] text-emerald-600 uppercase font-bold block">3. EBITDA (Ano 1)</span>
                                <span className="font-black text-emerald-600 text-xl block">6.800.000 MT</span>
                                <span className="text-[9px] text-slate-400 block">Margem Operacional de 36,8%</span>
                              </div>

                              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                                <span className="text-[10px] text-blue-700 uppercase font-bold block">4. Payback & Break-Even</span>
                                <span className="font-black text-blue-700 text-xl block">14m | Mês 7</span>
                                <span className="text-[9px] text-slate-400 block">158% Retorno no Ano 2</span>
                              </div>
                            </div>

                            {/* Execution Phase Timeline Graphic */}
                            <div className="pt-2">
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
                                🚀 Roteiro de Alocação em 3 Fases
                              </span>
                              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                                <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-700 font-bold">
                                  1ª FASE: WEB & CLOUD<br />
                                  <span className="text-[#172554] text-[11px]">105.000 MT</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 font-bold">
                                  2ª FASE: MKT B2B & HUB<br />
                                  <span className="text-[#172554] text-[11px]">215.000 MT</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-700 font-bold">
                                  3ª FASE: GO LIVE & LIQUIDEZ<br />
                                  <span className="text-[#172554] text-[11px]">580.000 MT</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • SÍNTESE GRÁFICA DO ACORDO SEED</span>
                          <span>PÁGINA 1 DE 6</span>
                        </div>
                      </div>
                    )}

                    {/* PAGE 2 OF 6: CUSTOS OPERACIONAIS & DILUIÇÃO POR TÉCNICO (GRÁFICO BENTO) */}
                    {activeCostBenefitPage === 2 && (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-5">
                          <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs font-mono text-slate-500">
                            <span className="font-bold text-slate-800">TARIRA Ecosystem Services Lda.</span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-blue-700 font-bold">PÁGINA 2 DE 6</span>
                          </div>

                          <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                            1. Análise Visual de Custos Operacionais & Diluição por Técnico
                          </h2>

                          {/* Bento Grid layout for Operational Costs */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-mono">
                            {/* Card 1: Hub Physical Rent */}
                            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold text-[10px]">🏢 HUB SEDE</span>
                                <span className="text-xs font-bold text-blue-900">22.500 MT/mês</span>
                              </div>
                              <p className="text-[11px] text-blue-950 font-sans leading-relaxed">
                                Arrendamento comercial no centro comercial da Cidade de Maputo a partir da 2ª Fase para acolhimento e validação presencial de prestadores. Na 1ª Fase, custo é ZERO (100% Digital).
                              </p>
                            </div>

                            {/* Card 2: Laptops & Internet */}
                            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">💻 TECH & INFRA</span>
                                <span className="text-xs font-bold text-blue-900">130.000 MT + 7.000 MT/mês</span>
                              </div>
                              <p className="text-[11px] text-blue-950 font-sans leading-relaxed">
                                3 Laptops corporativos (130.000 MT) + Fibra óptica dedicada de alta velocidade para o Hub Maputo (7.000 MT/mês) + Alojamento Web Hostinger.com (1.250 MT/mês).
                              </p>
                            </div>

                            {/* Card 3: CEO & Team Payroll Evolution */}
                            <div className="p-4 rounded-2xl bg-white text-[#172554] border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold text-[10px]">👥 EQUIPA GO LIVE</span>
                                <span className="text-xs font-bold text-blue-700">119.000 MT/mês</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                                CEO & Founder (Vicente Dias) com pró-labore ativo desde o Dia 1. No Go Live: +1 RH Fixo (25.000 MT) + 3 Agentes e Supervisores de Campo (58.000 MT) + Angariadores Mkt (35.000 MT).
                              </p>
                            </div>
                          </div>

                          {/* Phase Progression Graphical Cards */}
                          <div className="grid grid-cols-3 gap-3 font-mono text-[10px]">
                            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                              <div className="flex items-center justify-between border-b border-blue-200 pb-1">
                                <span className="font-bold text-blue-900">1ª FASE: WEB & CLOUD</span>
                                <span className="text-blue-700 font-bold">100% ENXUTO</span>
                              </div>
                              <span className="text-slate-700 block">• CEO & Founder (Vicente Dias)</span>
                              <span className="text-slate-400 block">• ❌ Sem Assistente RH</span>
                              <span className="text-slate-400 block">• ❌ Sem Supervisores de Campo</span>
                              <span className="text-slate-400 block">• ❌ Sem Hub Físico (Cloud)</span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                              <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                                <span className="font-bold text-emerald-900">2ª FASE: MARKETING B2B</span>
                                <span className="text-emerald-700 font-bold">ANGARIAÇÃO</span>
                              </div>
                              <span className="text-slate-700 block">• CEO & Founder (Vendas B2B)</span>
                              <span className="text-emerald-800 font-bold block">• ✅ Angariadores Comerciais</span>
                              <span className="text-emerald-800 font-bold block">• ✅ Início Espaço Físico / Hub</span>
                              <span className="text-slate-400 block">• ❌ Sem RH / Supervisores</span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                              <div className="flex items-center justify-between border-b border-blue-200 pb-1">
                                <span className="font-bold text-blue-900">3ª FASE: GO LIVE</span>
                                <span className="text-blue-700 font-bold">ESTRUTURA TOTAL</span>
                              </div>
                              <span className="text-slate-700 block">• CEO (Métrica Lucro Anual)</span>
                              <span className="text-blue-800 font-bold block">• ✅ Hub Sede Maputo Completo</span>
                              <span className="text-blue-800 font-bold block">• ✅ 1 Assistente RH (25.000 MT)</span>
                              <span className="text-blue-800 font-bold block">• ✅ 3 Supervisores Terreno (58.000 MT)</span>
                            </div>
                          </div>

                          {/* Graphical Visual Diagram: Dilution Scale */}
                          <div className="p-5 rounded-3xl bg-white text-[#172554] space-y-3 border border-slate-200">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <span className="text-xs font-mono font-bold text-blue-700 uppercase">
                                📊 Alavancagem Operacional: Diagrama de Diluição de Custo Fixo por Técnico
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 text-[10px] font-mono font-bold">
                                ~340 MZN / TÉCNICO / MÊS
                              </span>
                            </div>

                            <div className="space-y-2 font-mono text-xs">
                              <div>
                                <div className="flex justify-between text-[11px] mb-1">
                                  <span className="text-slate-500">Folha Fixa Operacional (119.000 MT/mês) ÷ 350 Técnicos Ativos</span>
                                  <span className="text-emerald-600 font-bold">Margem Bruta Recorrente &gt; 78%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden flex">
                                  <div className="h-full bg-blue-500 w-[18%]" title="Custo Fixo Absorvido (18%)"></div>
                                  <div className="h-full bg-emerald-500 w-[82%]" title="Margem de Lucro Operacional (82%)"></div>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 font-sans italic pt-1">
                                💡 À medida que a base cresce de 100 para 350+ técnicos, o custo por operação supervisionada cai drasticamente, gerando expansão contínua de margem EBITDA sem necessidade de novos aportes.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • ANÁLISE VISUAL DE CUSTOS & DILUIÇÃO</span>
                          <span>PÁGINA 2 DE 6</span>
                        </div>
                      </div>
                    )}

                    {/* PAGE 3 OF 6: MATRIZ GRÁFICA DE BENEFÍCIOS, UNIDADES & MARGENS BRUTAS */}
                    {activeCostBenefitPage === 3 && (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-5">
                          <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs font-mono text-slate-500">
                            <span className="font-bold text-slate-800">TARIRA Ecosystem Services Lda.</span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-blue-700 font-bold">PÁGINA 3 DE 6</span>
                          </div>

                          <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3 flex items-center justify-between">
                            <span>2. Matriz Gráfica de Benefícios, Unidades & Margens Brutas</span>
                            <span className="text-xs font-mono bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full border border-blue-300 font-bold">5 UNIDADES DE NEGÓCIO</span>
                          </h2>

                          {/* Graphical Charts Row: Donut Chart for Revenue Mix & Bar Chart for Gross Margins */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-3xl text-[#172554] border border-slate-200 font-sans">
                            {/* Graphic 1: Modern Donut / Pie Chart (Mix de Faturamento Bruto Ano 1) */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                                <span className="text-xs font-mono font-bold text-blue-700 uppercase flex items-center gap-1">
                                  🍩 Gráfico de Pizza/Rosca: Mix de Faturamento
                                </span>
                                <span className="text-[10px] bg-blue-500/20 text-blue-700 px-2 py-0.5 rounded font-mono">18.5M MT Total</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 pt-1">
                                {/* SVG Donut Chart */}
                                <div className="relative w-28 h-28 flex-shrink-0">
                                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                    {/* Business: 38% (stroke-dasharray="38 62" stroke-dashoffset="0") */}
                                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray="90.7 148.1" strokeDashoffset="0" />
                                    {/* Connect: 26% */}
                                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray="62.1 176.7" strokeDashoffset="-90.7" />
                                    {/* Recruit: 16% */}
                                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="18" strokeDasharray="38.2 200.6" strokeDashoffset="-152.8" />
                                    {/* Consulting: 12% */}
                                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="18" strokeDasharray="28.6 210.2" strokeDashoffset="-191" />
                                    {/* Studio: 8% */}
                                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ec4899" strokeWidth="18" strokeDasharray="19.1 219.7" strokeDashoffset="-219.6" />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[9px] font-mono text-slate-400 leading-none">ANO 1</span>
                                    <span className="text-xs font-bold text-blue-700 font-mono">100%</span>
                                  </div>
                                </div>
                                {/* Legend */}
                                <div className="space-y-1 text-[10px] font-mono flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-slate-200"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Business (B2B)</span>
                                    <span className="font-bold text-blue-700">38% (7.0M)</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-slate-200"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Connect (B2C)</span>
                                    <span className="font-bold text-emerald-600">26% (4.8M)</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-slate-200"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Recruit (RH)</span>
                                    <span className="font-bold text-blue-700">16% (3.0M)</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-slate-200"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Consulting</span>
                                    <span className="font-bold text-purple-400">12% (2.2M)</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-slate-200"><span className="w-2 h-2 rounded-full bg-pink-500"></span>Studio (SaaS)</span>
                                    <span className="font-bold text-pink-400">8% (1.5M)</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Graphic 2: Modern Horizontal Bar Chart (Margens Brutas Operacionais) */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                                <span className="text-xs font-mono font-bold text-emerald-600 uppercase flex items-center gap-1">
                                  📊 Gráfico de Barras: Margens Brutas (%)
                                </span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded font-mono">Rentabilidade</span>
                              </div>
                              <div className="space-y-1.5 pt-1 text-[10px] font-mono">
                                <div>
                                  <div className="flex justify-between text-slate-500 mb-0.5">
                                    <span>TARIRA Studio & Recruit</span>
                                    <span className="text-emerald-600 font-bold">88% Margem</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 w-[88%]"></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-slate-500 mb-0.5">
                                    <span>TARIRA Consulting (Consultoria RH)</span>
                                    <span className="text-purple-400 font-bold">80% Margem</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-400 w-[80%]"></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-slate-500 mb-0.5">
                                    <span>TARIRA Connect (Marketplace B2C)</span>
                                    <span className="text-blue-700 font-bold">72% Margem</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 w-[72%]"></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-slate-500 mb-0.5">
                                    <span>TARIRA Business (Gestão B2B)</span>
                                    <span className="text-blue-700 font-bold">35% Margem</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 w-[35%]"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Graphical Card Matrix for ALL 5 BUs including TARIRA CONSULTING */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
                            {/* BU 1: Connect */}
                            <div className="p-3.5 rounded-2xl bg-white text-[#172554] space-y-1.5 border border-slate-200">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700 font-bold text-xs">⚡ TARIRA CONNECT</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold text-[9px]">18% - 20% TAXA</span>
                              </div>
                              <div className="text-[10px] text-slate-500 space-y-0.5">
                                <p>• <strong>Modelo:</strong> Intermediação de serviços técnicos B2C</p>
                                <p>• <strong>Volume Ano 1:</strong> 3.200 transações/serviços</p>
                                <p>• <strong>Margem Bruta:</strong> <span className="text-blue-700 font-bold">68% - 75%</span></p>
                              </div>
                            </div>

                            {/* BU 2: Recruit */}
                            <div className="p-3.5 rounded-2xl bg-white text-[#172554] space-y-1.5 border border-slate-200">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700 font-bold text-xs">🔗 TARIRA RECRUIT</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold text-[9px]">35% SALÁRIO</span>
                              </div>
                              <div className="text-[10px] text-slate-500 space-y-0.5">
                                <p>• <strong>Modelo:</strong> Recrutamento & Seleção Executiva</p>
                                <p>• <strong>Volume Ano 1:</strong> 120 colocações qualificadas</p>
                                <p>• <strong>Margem Bruta:</strong> <span className="text-emerald-600 font-bold">85% - 90%</span></p>
                              </div>
                            </div>

                            {/* BU 3: Business */}
                            <div className="p-3.5 rounded-2xl bg-white text-[#172554] space-y-1.5 border border-slate-200">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-xs text-blue-700">💼 TARIRA BUSINESS</span>
                                <span className="px-2 py-0.5 rounded bg-blue-400 text-white font-bold text-[9px]">GESTÃO B2B</span>
                              </div>
                              <div className="text-[10px] text-slate-200 space-y-0.5">
                                <p>• <strong>Modelo:</strong> Terceirização recorrente & alocação</p>
                                <p>• <strong>Escala:</strong> 15 (Ano 1) ➔ 42 (Ano 2) ➔ 95 Empresas</p>
                                <p>• <strong>Margem Bruta:</strong> <span className="text-blue-700 font-bold">30% - 38%</span></p>
                              </div>
                            </div>

                            {/* BU 4: Consulting (TAREFA DE CONSULTA) - EXPLICITLY FEATURED */}
                            <div className="p-3.5 rounded-2xl bg-purple-950/90 text-[#172554] space-y-1.5 border border-purple-800">
                              <div className="flex justify-between items-center">
                                <span className="text-purple-300 font-bold text-xs flex items-center gap-1">
                                  🔍 TARIRA CONSULTING
                                </span>
                                <span className="px-2 py-0.5 rounded bg-purple-500 text-[#172554] font-bold text-[9px]">35.000 - 150.000 MT / PROJ</span>
                              </div>
                              <div className="text-[10px] text-purple-100 space-y-0.5">
                                <p>• <strong>Modelo:</strong> Consultoria RH, Auditoria Laboral & Compliance</p>
                                <p>• <strong>Volume Ano 1:</strong> 15 diagnósticos corporativos B2B</p>
                                <p>• <strong>Margem Bruta:</strong> <span className="text-purple-300 font-bold">75% - 85%</span> (Sem estoque)</p>
                              </div>
                            </div>

                            {/* BU 5: Studio */}
                            <div className="p-3.5 rounded-2xl bg-white text-[#172554] space-y-1.5 border border-slate-200 sm:col-span-2 lg:col-span-2">
                              <div className="flex justify-between items-center">
                                <span className="text-pink-400 font-bold text-xs">🚀 TARIRA STUDIO (MICRO-SAAS & VITRINE 'AXOFACIL')</span>
                                <span className="px-2 py-0.5 rounded bg-pink-500 text-[#172554] font-bold text-[9px]">3.000 - 8.000 MT / MÊS</span>
                              </div>
                              <div className="text-[10px] text-slate-500 space-y-0.5">
                                <p>• <strong>Modelo:</strong> Subscrição mensal SaaS para PMEs, boutiques e vitrine digital 'Axofacil' + 2,5%-5% s/ vendas</p>
                                <p>• <strong>Base Ano 1:</strong> 25 PMEs subscritoras ativas | <strong>Margem Bruta:</strong> <span className="text-pink-400 font-bold">85% - 92%</span></p>
                              </div>
                            </div>
                          </div>

                          {/* Consolidado Financeiro Visual Card */}
                          <div className="p-4 rounded-3xl bg-emerald-50 text-white space-y-2 border border-emerald-800">
                            <div className="flex justify-between items-center border-b border-emerald-800/80 pb-1.5">
                              <span className="text-xs font-mono font-bold uppercase text-emerald-600">
                                📊 CONSOLIDADO FINANCEIRO INTEGRAÇÃO 5 UNIDADES (ANO 1)
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 text-[10px] font-mono font-bold">
                                METAS VALIDADAS
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 font-mono text-center">
                              <div className="p-2.5 rounded-2xl bg-white border border-emerald-900">
                                <span className="text-[9px] text-slate-400 block uppercase">Faturamento Bruto</span>
                                <span className="font-bold text-[#172554] text-sm sm:text-base">18.500.000 MT</span>
                              </div>
                              <div className="p-2.5 rounded-2xl bg-white border border-emerald-900">
                                <span className="text-[9px] text-emerald-600 block uppercase">EBITDA (36,8%)</span>
                                <span className="font-bold text-emerald-600 text-sm sm:text-base">6.800.000 MT</span>
                              </div>
                              <div className="p-2.5 rounded-2xl bg-white border border-emerald-900">
                                <span className="text-[9px] text-emerald-700 block uppercase">Lucro Líquido</span>
                                <span className="font-bold text-emerald-700 text-sm sm:text-base">3.734.000 MT</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • MATRIZ GRÁFICA DE UNIDADES & MARGENS</span>
                          <span>PÁGINA 3 DE 6</span>
                        </div>
                      </div>
                    )}

                    {/* PAGE 4 OF 6: CUSTO-BENEFÍCIO DO SÓCIO INVESTIDOR (WATERFALL DE DIVIDENDOS) */}
                    {activeCostBenefitPage === 4 && (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-5">
                          <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs font-mono text-slate-500">
                            <span className="font-bold text-slate-800">TARIRA Ecosystem Services Lda.</span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-blue-700 font-bold">PÁGINA 4 DE 6</span>
                          </div>

                          <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                            3. Ganhos do Sócio Investidor em Médio Prazo (Waterfall de Dividendos)
                          </h2>

                          {/* Aporte Breakdown Visual Bar Chart */}
                          <div className="p-4.5 rounded-2xl bg-blue-500/10 border border-blue-300 font-mono space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-blue-900 text-xs">💵 ALOCAÇÃO TRANSPARENTE DOS 900.000 MT (COM COTAÇÃO REAL HOSTINGER.COM)</span>
                              <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold text-[10px]">10% EQUITY</span>
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-[10px]">
                              <div className="p-2.5 rounded-xl bg-white border border-blue-300 text-center">
                                <span className="text-blue-800 block font-bold">CAPITAL SOCIAL</span>
                                <span className="text-slate-950 font-bold text-xs">90.000 MT</span>
                                <span className="text-[9px] text-slate-500 block">10% Formalização Legal</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-blue-300 text-center">
                                <span className="text-blue-800 block font-bold">HOSTINGER.COM</span>
                                <span className="text-slate-950 font-bold text-xs">15.000 MT</span>
                                <span className="text-[9px] text-slate-500 block">1.250 MT/mês Alojamento Web</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-emerald-300 text-center">
                                <span className="text-emerald-800 block font-bold">MARKETING B2B</span>
                                <span className="text-slate-950 font-bold text-xs">215.000 MT</span>
                                <span className="text-[9px] text-slate-500 block">Angariação Empresas</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-blue-300 text-center">
                                <span className="text-blue-800 block font-bold">GO LIVE & LIQUIDEZ</span>
                                <span className="text-slate-950 font-bold text-xs">580.000 MT</span>
                                <span className="text-[9px] text-slate-500 block">Hub Sede & Onboarding</span>
                              </div>
                            </div>
                          </div>

                          {/* Dividend Waterfall Graphical Card with Modern SVG Bar Chart */}
                          <div className="p-5 rounded-3xl bg-white text-[#172554] space-y-4 border border-slate-200 font-mono">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <span className="text-xs font-bold text-blue-700 uppercase">
                                📊 Gráfico de Barras: Cascata de Dividendos Diretos ao Investidor (10% dos Lucros)
                              </span>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded font-bold">
                                PAYBACK NO MÊS 14
                              </span>
                            </div>

                            {/* SVG Bar Chart for Dividends */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                              <div className="flex items-end justify-between gap-6 h-36 pt-4 pb-2 px-6 border-b border-slate-200 relative">
                                {/* Horizontal Line for 900k MT Payback */}
                                <div className="absolute left-0 right-0 top-[45%] border-b border-dashed border-blue-400/60 flex justify-end pr-2">
                                  <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold font-mono">
                                    Linha de Payback: 900.000 MT
                                  </span>
                                </div>

                                {/* Bar 1: Year 1 */}
                                <div className="flex-1 flex flex-col items-center gap-1 group">
                                  <span className="text-[10px] text-blue-700 font-bold">373.400 MT</span>
                                  <div className="w-full bg-blue-500/20 rounded-t-lg relative overflow-hidden h-14 flex items-end">
                                    <div className="w-full bg-blue-500 rounded-t-lg h-[40%] transition-all"></div>
                                  </div>
                                  <span className="text-[10px] text-slate-400 mt-1">Ano 1 (2026)</span>
                                </div>

                                {/* Bar 2: Year 2 */}
                                <div className="flex-1 flex flex-col items-center gap-1 group">
                                  <span className="text-[10px] text-emerald-600 font-bold">1.050.000 MT</span>
                                  <div className="w-full bg-emerald-500/20 rounded-t-lg relative overflow-hidden h-24 flex items-end">
                                    <div className="w-full bg-emerald-400 rounded-t-lg h-[75%] transition-all"></div>
                                  </div>
                                  <span className="text-[10px] text-emerald-700 font-bold mt-1">Ano 2 (2027) ★ Payback</span>
                                </div>

                                {/* Bar 3: Year 3 */}
                                <div className="flex-1 flex flex-col items-center gap-1 group">
                                  <span className="text-[10px] text-emerald-700 font-bold">2.100.000 MT</span>
                                  <div className="w-full bg-emerald-500/20 rounded-t-lg relative overflow-hidden h-32 flex items-end">
                                    <div className="w-full bg-emerald-300 rounded-t-lg h-[100%] transition-all"></div>
                                  </div>
                                  <span className="text-[10px] text-slate-500 mt-1">Ano 3 (2028)</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                                <span>Total Dividendos 3 Anos: <strong className="text-emerald-600 text-xs">3.523.400 MZN</strong></span>
                                <span className="bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded font-bold">Retorno 391% s/ Aporte</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] font-sans text-slate-500">
                              💡 <strong>Métrica de Payback:</strong> No Mês 14 (Ano 2), os dividendos acumulados atingem <strong>1.423.400 Meticais</strong>, superando em <strong>158% o aporte inicial de 900.000 MT</strong>.
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • CASCATA DE DIVIDENDOS AO INVESTIDOR</span>
                          <span>PÁGINA 4 DE 6</span>
                        </div>
                      </div>
                    )}

                    {/* PAGE 5 OF 6: LONGO PRAZO, EQUITY VALUE & GOVERNAÇÃO (VALUATION GAUGE) */}
                    {activeCostBenefitPage === 5 && (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-5">
                          <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs font-mono text-slate-500">
                            <span className="font-bold text-slate-800">TARIRA Ecosystem Services Lda.</span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-blue-700 font-bold">PÁGINA 5 DE 6</span>
                          </div>

                          <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                            4. Longo Prazo, Equity Value & Multiplicador MOIC (Gráfico de Valorização)
                          </h2>

                          {/* Valuation Growth Graphic Scale with SVG Bar Chart */}
                          <div className="p-5 rounded-3xl bg-emerald-50 text-white space-y-4 border border-emerald-800 font-mono">
                            <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                              <span className="text-xs font-bold text-emerald-600 uppercase">
                                📊 Gráfico de Barras: Escala de Valorização de Equity (Valuation Post-Money)
                              </span>
                              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 text-[10px] font-bold">
                                11.1x - 13.3x VALORIZAÇÃO
                              </span>
                            </div>

                            {/* SVG Bar Chart for Valuation Growth */}
                            <div className="bg-white p-4 rounded-2xl border border-emerald-900 space-y-3">
                              <div className="flex items-end justify-between gap-4 h-32 pt-3 pb-2 px-4 border-b border-slate-200">
                                <div className="flex-1 flex flex-col items-center gap-1">
                                  <span className="text-[9px] text-blue-700 font-bold">9M MT</span>
                                  <div className="w-full bg-slate-50 rounded-t h-6 flex items-end">
                                    <div className="w-full bg-blue-500 rounded-t h-[30%]"></div>
                                  </div>
                                  <span className="text-[9px] text-slate-400">Seed (2026)</span>
                                </div>

                                <div className="flex-1 flex flex-col items-center gap-1">
                                  <span className="text-[9px] text-emerald-700 font-bold">25M MT</span>
                                  <div className="w-full bg-slate-50 rounded-t h-12 flex items-end">
                                    <div className="w-full bg-emerald-500 rounded-t h-[45%]"></div>
                                  </div>
                                  <span className="text-[9px] text-slate-400">Ano 1 (2026)</span>
                                </div>

                                <div className="flex-1 flex flex-col items-center gap-1">
                                  <span className="text-[9px] text-emerald-700 font-bold">60M MT</span>
                                  <div className="w-full bg-slate-50 rounded-t h-20 flex items-end">
                                    <div className="w-full bg-emerald-400 rounded-t h-[70%]"></div>
                                  </div>
                                  <span className="text-[9px] text-slate-500">Ano 2 (2027)</span>
                                </div>

                                <div className="flex-1 flex flex-col items-center gap-1">
                                  <span className="text-[10px] text-emerald-600 font-black">110M MT</span>
                                  <div className="w-full bg-slate-50 rounded-t h-28 flex items-end">
                                    <div className="w-full bg-emerald-300 rounded-t h-[100%]"></div>
                                  </div>
                                  <span className="text-[9px] text-emerald-700 font-bold">Ano 3 (2028)</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-[10px] text-slate-500">
                                <span>10% Quota Investidor (Seed): <strong className="text-blue-700">900.000 MT</strong></span>
                                <span>10% Quota Investidor (Ano 3): <strong className="text-emerald-600 text-xs">11.000.000 MT</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* MOIC Total Return Meter */}
                          <div className="p-4.5 rounded-2xl bg-blue-500/10 border border-blue-300 font-mono space-y-2">
                            <span className="font-bold text-blue-900 text-xs block uppercase">
                              🚀 Multiplicador de Capital Total (MOIC Dividendos + Equity Value)
                            </span>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                                <span className="text-[9px] text-slate-500 block">DIVIDENDOS 3 ANOS</span>
                                <span className="font-bold text-slate-900">3.523.400 MT</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                                <span className="text-[9px] text-slate-500 block">EQUITY VALUE (ANO 3)</span>
                                <span className="font-bold text-emerald-700">10M - 12M MT</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-blue-500 text-white font-bold">
                                <span className="text-[9px] block opacity-80">RETORNO MOIC TOTAL</span>
                                <span className="font-black text-sm">15.0x a 17.2x</span>
                              </div>
                            </div>
                          </div>

                          {/* Governance Pills */}
                          <div className="p-4 rounded-2xl bg-white text-[#172554] space-y-2 border border-slate-200 font-mono text-xs">
                            <span className="text-blue-700 font-bold block uppercase text-[11px]">
                              🤝 Directrizes de Governação & Proteção de Capital
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-center">
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">• Assento em Conselho</div>
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">• Dashboard Tempo Real</div>
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">• Tag-Along Garantido</div>
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">• Novos Sócios (1-2 B2B)</div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • VALORIZAÇÃO DE EQUITY & MOIC</span>
                          <span>PÁGINA 5 DE 6</span>
                        </div>
                      </div>
                    )}

                    {/* PAGE 6 OF 6: PÁGINA FINAL - RESUMO EXPLICATIVO DOS INDICADORES CHAVE DE CUSTOS E BENEFÍCIOS */}
                    {activeCostBenefitPage === 6 && (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-5">
                          <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs font-mono text-slate-500">
                            <span className="font-bold text-slate-800">TARIRA Ecosystem Services Lda.</span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-blue-700 font-bold">PÁGINA 6 DE 6</span>
                          </div>

                          <div className="border-b-2 border-blue-500 pb-3">
                            <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase mb-2">
                              <span>📄 PÁGINA FINAL • GUIA EXPLICATIVO DE INDICADORES</span>
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-slate-950">
                              5. Resumo Explicativo dos Indicadores Chave de Custos, Benefícios & Retornos
                            </h2>
                            <p className="text-xs text-slate-600 font-semibold mt-1">
                              Síntese explicativa dos rácios operacionais, estrutura de custos, geração de receitas e salvaguardas para o sócio investidor.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-800 font-sans">
                            {/* Card 1: Indicadores de Custo */}
                            <div className="p-4 rounded-2xl bg-white text-[#172554] border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                                <span className="font-mono font-bold text-blue-700 text-xs uppercase flex items-center gap-1.5">
                                  📊 1. Indicadores Chave de Custo
                                </span>
                                <span className="text-[10px] bg-blue-500/20 text-blue-700 font-mono px-2 py-0.5 rounded">
                                  ESTRUTURA ENXUTA
                                </span>
                              </div>
                              <ul className="space-y-1.5 text-[11px] text-slate-500">
                                <li><strong>• Folha Operacional (Go Live):</strong> 119.000 MT/mês cobrindo CEO Vicente Dias (pró-labore ativo), 1 Assistente RH (25.000 MT), 3 Supervisores (58.000 MT) e Angariadores.</li>
                                <li><strong>• Hub Sede Físico Maputo:</strong> 22.500 MT/mês ativado apenas na 2ª Fase (Custo Zero na 1ª Fase 100% Cloud).</li>
                                <li><strong>• Infraestrutura Cloud Real:</strong> 130.000 MT (3 Laptops) + 15.000 MT/ano (1.250 MT/mês) Alojamento Web Hostinger.com.</li>
                                <li><strong>• Diluição de Custo Fixo:</strong> ~340 MZN/mês de custo fixo por técnico ativo para uma base de 350 profissionais.</li>
                              </ul>
                            </div>

                            {/* Card 2: Indicadores de Benefício e Faturamento */}
                            <div className="p-4 rounded-2xl bg-emerald-50 text-white border border-emerald-800 space-y-2">
                              <div className="flex items-center justify-between border-b border-emerald-800 pb-1.5">
                                <span className="font-mono font-bold text-emerald-600 text-xs uppercase flex items-center gap-1.5">
                                  💰 2. Indicadores Chave de Benefício
                                </span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-700 font-mono px-2 py-0.5 rounded">
                                  EBITDA 36,8%
                                </span>
                              </div>
                              <ul className="space-y-1.5 text-[11px] text-slate-200">
                                <li><strong>• Faturamento Bruto (Ano 1):</strong> 18.500.000 MT combinando as 5 Unidades de Negócio (Connect, Recruit, Business, Consulting e Studio).</li>
                                <li><strong>• EBITDA Operacional:</strong> 6.800.000 MT, refletindo alta retenção de caixa derivada do modelo digital híbrido.</li>
                                <li><strong>• Lucro Líquido Projetado:</strong> 3.734.000 MT livres para distribuição de dividendos e reinvestimento.</li>
                                <li><strong>• Tração B2B Recorrente:</strong> Escala de 15 empresas (Ano 1) para 42 (Ano 2) e 95 empresas clientes (Ano 3).</li>
                              </ul>
                            </div>

                            {/* Card 3: Indicadores de Retorno ao Acionista */}
                            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-300 text-white space-y-2">
                              <div className="flex items-center justify-between border-b border-blue-300 pb-1.5">
                                <span className="font-mono font-bold text-blue-950 text-xs uppercase flex items-center gap-1.5">
                                  🚀 3. Retorno do Sócio Investidor
                                </span>
                                <span className="text-[10px] bg-blue-500 text-white font-mono font-bold px-2 py-0.5 rounded">
                                  15.0x - 17.2x MOIC
                                </span>
                              </div>
                              <ul className="space-y-1.5 text-[11px] text-slate-800">
                                <li><strong>• Aporte Seed & Equity:</strong> 900.000 MT por 10% de Quota, com exatamente 90.000 MT (10%) afetos à constituição formal do Capital Social.</li>
                                <li><strong>• Dividendos em 3 Anos:</strong> 373.400 MT (Ano 1) ➔ 1.050.000 MT (Ano 2) ➔ 2.100.000 MT (Ano 3) = <strong>3.523.400 MT acumulados</strong>.</li>
                                <li><strong>• Payback & Break-Even:</strong> Payback no Mês 14 (158% de retorno no Ano 2) e Break-Even Operacional no Mês 7.</li>
                                <li><strong>• Valuation de Equity:</strong> De 9M MT para 100M-120M MT no Ano 3 (10% de Quota passa a valer 10M a 12M MT).</li>
                              </ul>
                            </div>

                            {/* Card 4: Salvaguardas & Governação */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 space-y-2">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                                <span className="font-mono font-bold text-slate-950 text-xs uppercase flex items-center gap-1.5">
                                  🛡️ 4. Governação & Salvaguardas
                                </span>
                                <span className="text-[10px] bg-white text-[#172554] font-mono font-bold px-2 py-0.5 rounded">
                                  PROTEÇÃO 100%
                                </span>
                              </div>
                              <ul className="space-y-1.5 text-[11px] text-slate-700">
                                <li><strong>• Assento em Conselho:</strong> Direito a voto nas decisões estratégicas de expansão e contratação de executivos.</li>
                                <li><strong>• Auditoria Tempo Real:</strong> Acesso direto e transparente ao dashboard financeiro da plataforma web.</li>
                                <li><strong>• Cláusula Tag-Along:</strong> Proteção de 100% das quotas em caso de aquisição ou entrada de novos sócios.</li>
                                <li><strong>• Reserva de Liquidez:</strong> Fundo de maneio de 380.000 MT retido na 3ª Fase para cobrir imprevistos operacionais.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • RESUMO EXPLICATIVO DE INDICADORES DE CUSTOS E BENEFÍCIOS</span>
                          <span>PÁGINA 6 DE 6</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* CONTINUOUS SCROLL MODE FOR COST BENEFIT (6 PAGES) */
                  <div className="space-y-12">
                    {[1, 2, 3, 4, 5, 6].map((pageNum) => (
                      <div key={pageNum} className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-300 shadow-xl space-y-8 text-left">
                        {pageNum === 1 && (
                          <div className="space-y-6">
                            <TariraDocumentBrandHeader light={true} />
                            <div className="border-b-4 border-blue-500 pb-6 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                                  <span>⚡ RESUMO EXECUTIVO CUSTO-BENEFÍCIO • SÍNTESE GRÁFICA</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-950">
                                  Análise de Custos, Benefícios & Retorno do Investimento
                                </h2>
                                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                                  Aporte Seed: 900.000 Meticais por 10% Equity (Valuation Post-Money: 9.000.000 MT)
                                </p>
                              </div>
                              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-300 text-right shrink-0">
                                <span className="text-[10px] font-mono font-bold uppercase text-blue-900 block">Proposta de Investimento</span>
                                <span className="text-xs font-bold text-slate-950 block mt-0.5">Investidor Proponente</span>
                                <span className="text-[10px] text-blue-700 font-bold block mt-1">Investimento Seed 2026/2029</span>
                              </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-slate-900">
                              <p className="text-sm font-serif font-bold italic text-blue-900">
                                “A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”
                              </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-white text-[#172554] space-y-4 shadow-xl border border-slate-200">
                              <h3 className="font-serif font-bold text-lg text-blue-700 border-b border-slate-200 pb-2">
                                Síntese da Oportunidade de Investimento (Seed Deal)
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                                  <span className="text-[10px] text-blue-700 uppercase block font-bold">Aporte Requerido</span>
                                  <span className="font-bold text-[#172554] text-base">900.000 MT</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                                  <span className="text-[10px] text-emerald-600 uppercase block font-bold">Valuation Post-Money</span>
                                  <span className="font-bold text-[#172554] text-base">9.000.000 MT</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                                  <span className="text-[10px] text-emerald-600 uppercase block font-bold">EBITDA (Ano 1)</span>
                                  <span className="font-bold text-emerald-600 text-base">6.800.000 MT</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                                  <span className="text-[10px] text-blue-700 uppercase block font-bold">Payback / Break-Even</span>
                                  <span className="font-bold text-blue-700 text-base">14 Meses | Mês 7</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {pageNum === 2 && (
                          <div className="space-y-4">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              1. Análise Visual de Custos Operacionais & Diluição por Técnico
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                                <span className="font-bold text-blue-900 block">🏢 HUB MAPUTO</span>
                                <span className="text-blue-800">22.500 MT/mês (A partir da 2ª Fase)</span>
                              </div>
                              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                                <span className="font-bold text-blue-900 block">💻 TECH & HOSTER</span>
                                <span className="text-blue-800">130.000 MT Laptops + 1.250 MT/mês Web</span>
                              </div>
                              <div className="p-4 rounded-2xl bg-white text-[#172554] border border-slate-200">
                                <span className="font-bold text-blue-700 block">👥 FOLHA GO LIVE</span>
                                <span className="text-slate-500">119.000 MT/mês (CEO + 1 RH + 3 Supervisores)</span>
                              </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-white font-mono">
                              <span className="font-bold text-blue-900 block text-xs">📊 DILUIÇÃO DE CUSTO FIXO POR TÉCNICO ALOCADO</span>
                              <p className="text-xs text-slate-800">Custo fixo interno de apenas ~340 MZN por técnico alocado/mês para até 350 técnicos ativos no terreno.</p>
                            </div>
                          </div>
                        )}

                        {pageNum === 3 && (
                          <div className="space-y-5 font-sans">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3 flex flex-wrap items-center justify-between gap-2">
                              <span>2. Matriz Gráfica de Benefícios, Unidades & Margens Brutas</span>
                              <span className="text-xs font-mono bg-blue-100 text-blue-900 px-3 py-1 rounded-full border border-blue-300 font-bold inline-flex items-center leading-tight shrink-0">
                                5 UNIDADES DE NEGÓCIO
                              </span>
                            </h2>

                            {/* Graphical Charts Row: Donut Chart & Bar Chart */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 sm:p-5 rounded-3xl text-[#172554] border border-slate-200">
                              {/* Graphic 1: Donut Chart */}
                              <div className="space-y-2">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                  <span className="text-xs font-mono font-bold text-blue-700 uppercase">
                                    🍩 Mix de Faturamento (Ano 1)
                                  </span>
                                  <span className="text-[10px] bg-blue-500/20 text-blue-700 px-2.5 py-1 rounded-md font-mono font-bold inline-flex items-center leading-tight">
                                    18.5M MT Total
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 pt-1">
                                  <div className="relative w-28 h-28 flex-shrink-0">
                                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray="90.7 148.1" strokeDashoffset="0" />
                                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray="62.1 176.7" strokeDashoffset="-90.7" />
                                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="18" strokeDasharray="38.2 200.6" strokeDashoffset="-152.8" />
                                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="18" strokeDasharray="28.6 210.2" strokeDashoffset="-191" />
                                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ec4899" strokeWidth="18" strokeDasharray="19.1 219.7" strokeDashoffset="-219.6" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                      <span className="text-[9px] font-mono text-slate-400 leading-none">ANO 1</span>
                                      <span className="text-xs font-bold text-blue-700 font-mono">100%</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1.5 text-[10.5px] font-mono flex-1">
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Business</span><span className="font-bold text-blue-700">38%</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Connect</span><span className="font-bold text-emerald-600">26%</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Recruit</span><span className="font-bold text-blue-700">16%</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Consulting</span><span className="font-bold text-purple-400">12%</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span>Studio</span><span className="font-bold text-pink-400">8%</span></div>
                                  </div>
                                </div>
                              </div>

                              {/* Graphic 2: Horizontal Bar Chart */}
                              <div className="space-y-2">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                  <span className="text-xs font-mono font-bold text-emerald-600 uppercase">
                                    📊 Margens Brutas (%) por Unidade
                                  </span>
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-700 px-2.5 py-1 rounded-md font-mono font-bold inline-flex items-center leading-tight">
                                    Rentabilidade
                                  </span>
                                </div>
                                <div className="space-y-2 pt-1 text-[10px] font-mono">
                                  <div>
                                    <div className="flex justify-between text-slate-500 mb-1"><span>Studio & Recruit</span><span className="text-emerald-600 font-bold">88%</span></div>
                                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 w-[88%] rounded-full"></div></div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-slate-500 mb-1"><span>Consulting RH</span><span className="text-purple-400 font-bold">80%</span></div>
                                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden"><div className="h-full bg-purple-400 w-[80%] rounded-full"></div></div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-slate-500 mb-1"><span>Connect B2C</span><span className="text-blue-700 font-bold">72%</span></div>
                                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-[72%] rounded-full"></div></div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-slate-500 mb-1"><span>Business B2B</span><span className="text-blue-700 font-bold">35%</span></div>
                                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-[35%] rounded-full"></div></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Grid for 5 BUs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
                              <div className="p-3.5 rounded-2xl bg-white text-[#172554] space-y-1.5 border border-slate-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-700 font-bold text-xs">⚡ TARIRA CONNECT</span>
                                  <span className="text-[9px] bg-blue-500/20 text-blue-700 px-2 py-0.5 rounded font-bold">TAXA 18%-20%</span>
                                </div>
                                <span className="text-[10px] text-slate-500 block leading-relaxed">Margem: 72% • 3.200 serviços/ano</span>
                              </div>

                              <div className="p-3.5 rounded-2xl bg-white text-[#172554] space-y-1.5 border border-slate-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-700 font-bold text-xs">🔗 TARIRA RECRUIT</span>
                                  <span className="text-[9px] bg-blue-500/20 text-blue-700 px-2 py-0.5 rounded font-bold">35% SALÁRIO</span>
                                </div>
                                <span className="text-[10px] text-slate-500 block leading-relaxed">Margem: 88% • 120 colocações/ano</span>
                              </div>

                              <div className="p-3.5 rounded-2xl bg-white text-[#172554] space-y-1.5 border border-slate-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-700 font-bold text-xs">💼 TARIRA BUSINESS</span>
                                  <span className="text-[9px] bg-blue-500/20 text-blue-700 px-2 py-0.5 rounded font-bold">MARGEM 35%</span>
                                </div>
                                <span className="text-[10px] text-slate-200 block leading-relaxed">Gestão B2B • 15 ➔ 42 ➔ 95 empresas</span>
                              </div>

                              <div className="p-3.5 rounded-2xl bg-purple-950/90 text-[#172554] space-y-1.5 border border-purple-800">
                                <div className="flex justify-between items-center">
                                  <span className="text-purple-300 font-bold text-xs">🔍 TARIRA CONSULTING</span>
                                  <span className="text-[9px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded font-bold">FEE 35.000 - 150.000 MT</span>
                                </div>
                                <span className="text-[10px] text-purple-100 block leading-relaxed">Consultoria RH & Compliance • Margem: 80%</span>
                              </div>

                              <div className="p-3.5 rounded-2xl bg-white text-[#172554] space-y-1.5 border border-slate-200 sm:col-span-2 lg:col-span-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-pink-400 font-bold text-xs">🚀 TARIRA STUDIO (MICRO-SAAS & VITRINE 'AXOFACIL')</span>
                                  <span className="text-[9px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded font-bold">3.000 - 8.000 MT/MÊS</span>
                                </div>
                                <span className="text-[10px] text-slate-500 block leading-relaxed">Subscrição SaaS + 2,5%-5% s/ vendas • Margem: 88% • 25 PMEs</span>
                              </div>
                            </div>

                            <div className="p-4 rounded-3xl bg-emerald-50 text-white space-y-2 border border-emerald-800 font-mono">
                              <span className="text-xs font-bold uppercase text-emerald-600 block">📊 CONSOLIDADO ANO 1 (5 UNIDADES INTEGRADAS)</span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-center">
                                <div className="p-2.5 rounded-xl bg-white border border-slate-200">• Faturamento: <strong>18.5M MT</strong></div>
                                <div className="p-2.5 rounded-xl bg-white border border-emerald-800 text-emerald-600">• EBITDA: <strong>6.8M MT (36,8%)</strong></div>
                                <div className="p-2.5 rounded-xl bg-white border border-emerald-700 text-emerald-700">• Lucro Líquido: <strong>3.734M MT</strong></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {pageNum === 4 && (
                          <div className="space-y-4 font-mono">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              3. Ganhos do Sócio Investidor em Médio Prazo (Waterfall de Dividendos)
                            </h2>
                            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-300 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-blue-900 block text-xs">💵 ALOCAÇÃO DOS 900.000 MT (HOSTINGER.COM REAL INCLUÍDA)</span>
                                <span className="text-[10px] bg-blue-500 text-white px-2.5 py-0.5 rounded-md font-bold">10% EQUITY</span>
                              </div>
                              <p className="text-xs text-slate-800 leading-relaxed">
                                90.000 MT Capital Social Legal + 15.000 MT Hostinger.com Anual + 215.000 MT Marketing B2B + 580.000 MT Go Live & Liquidez.
                              </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white text-[#172554] space-y-3 border border-slate-200">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <span className="font-bold text-blue-700 block text-xs uppercase">📈 CASCATA DE DIVIDENDOS (10% DOS LUCROS)</span>
                                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-md font-bold">PAYBACK NO MÊS 14</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                                  <span className="text-[10px] text-blue-700 block font-bold">ANO 1 (2026)</span>
                                  <span className="text-sm font-bold text-[#172554] block">373.400 MZN</span>
                                  <span className="text-[9px] text-slate-400 block">10% de 3.734.000 MT</span>
                                </div>
                                <div className="p-3 rounded-xl bg-white border border-emerald-800 space-y-1">
                                  <span className="text-[10px] text-emerald-600 block font-bold">ANO 2 (2027) ★ Payback</span>
                                  <span className="text-sm font-bold text-emerald-700 block">1.050.000 MZN</span>
                                  <span className="text-[9px] text-emerald-600/80 block">Recuperação do Aporte</span>
                                </div>
                                <div className="p-3 rounded-xl bg-white border border-emerald-700 space-y-1">
                                  <span className="text-[10px] text-emerald-700 block font-bold">ANO 3 (2028)</span>
                                  <span className="text-sm font-bold text-emerald-200 block">2.100.000 MZN</span>
                                  <span className="text-[9px] text-slate-400 block">391% Retorno Acumulado</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {pageNum === 5 && (
                          <div className="space-y-4 font-mono">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              4. Longo Prazo, Equity Value & Multiplicador MOIC (Gráfico de Valorização)
                            </h2>
                            <div className="p-4 rounded-2xl bg-emerald-50 text-white space-y-2 border border-emerald-800">
                              <span className="font-bold text-emerald-600 block text-xs">💎 VALORIZAÇÃO DE EQUITY (VALUATION)</span>
                              <p className="text-xs text-slate-200 leading-relaxed">
                                Valuation Inicial 2026: 9.000.000 MT ➔ Valuation Ano 3: 100M MT a 120M MT. Quota de 10% do Investidor passa a valer 10.000.000 MT a 12.000.000 MT (11.1x a 13.3x valorização).
                              </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-300 space-y-1.5">
                              <span className="font-bold text-blue-900 block text-xs">🚀 RETORNO POTENCIAL TOTAL (MOIC): 15.0x A 17.2x CAPITAL APORTADO</span>
                              <p className="text-xs text-slate-800 leading-relaxed">
                                Retorno Total Acumulado (3.523.400 MT Dividendos + 10M-12M MT Equity Value) = 13.523.400 MT a 15.523.400 MT sobre 900.000 MT investidos.
                              </p>
                            </div>
                          </div>
                        )}

                        {pageNum === 6 && (
                          <div className="space-y-4 font-sans text-xs text-slate-800">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              5. Resumo Explicativo dos Indicadores Chave de Custos, Benefícios & Retornos
                            </h2>
                            <p className="text-xs text-slate-600 font-semibold">
                              Página final explicativa dos rácios operacionais, alocação de custos, receitas e salvaguardas ao sócio investidor.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                              {/* Card 1: Indicadores de Custo */}
                              <div className="p-4 rounded-2xl bg-white text-[#172554] border border-slate-200 space-y-2.5">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                  <span className="font-mono font-bold text-blue-700 text-xs uppercase flex items-center gap-1.5">
                                    📊 1. Indicadores Chave de Custo
                                  </span>
                                  <span className="text-[10px] bg-blue-500/20 text-blue-700 font-mono px-2.5 py-1 rounded-md font-bold inline-flex items-center leading-tight">
                                    ESTRUTURA ENXUTA
                                  </span>
                                </div>
                                <ul className="space-y-1.5 text-[11px] text-slate-500 leading-relaxed">
                                  <li><strong>• Folha Operacional (Go Live):</strong> 119.000 MT/mês (CEO Vicente Dias + 1 RH + 3 Supervisores + Angariadores Mkt).</li>
                                  <li><strong>• Hub Sede Físico Maputo:</strong> 22.500 MT/mês ativado na 2ª Fase (Zero MT na 1ª Fase 100% Cloud).</li>
                                  <li><strong>• Tech & Cloud Hostinger.com:</strong> 130.000 MT Laptops + 15.000 MT/ano (1.250 MT/mês) Alojamento Web.</li>
                                  <li><strong>• Diluição por Técnico:</strong> ~340 MZN/mês de custo fixo por técnico supervisionado (350 ativos).</li>
                                </ul>
                              </div>

                              {/* Card 2: Indicadores de Benefício */}
                              <div className="p-4 rounded-2xl bg-emerald-50 text-white border border-emerald-800 space-y-2.5">
                                <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                                  <span className="font-mono font-bold text-emerald-600 text-xs uppercase flex items-center gap-1.5">
                                    💰 2. Indicadores Chave de Benefício
                                  </span>
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-700 font-mono px-2.5 py-1 rounded-md font-bold inline-flex items-center leading-tight">
                                    EBITDA 36,8%
                                  </span>
                                </div>
                                <ul className="space-y-1.5 text-[11px] text-slate-200 leading-relaxed">
                                  <li><strong>• Faturamento Bruto (Ano 1):</strong> 18.500.000 MT combinando as 5 Unidades de Negócio.</li>
                                  <li><strong>• EBITDA Operacional:</strong> 6.800.000 MT, demonstrando elevada margem de retenção de caixa.</li>
                                  <li><strong>• Lucro Líquido Projetado:</strong> 3.734.000 MT livres para dividendos e reinvestimento.</li>
                                  <li><strong>• Clientes B2B Recorrentes:</strong> 15 empresas (Ano 1) ➔ 42 (Ano 2) ➔ 95 empresas (Ano 3).</li>
                                </ul>
                              </div>

                              {/* Card 3: Retorno do Acionista */}
                              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-300 text-white space-y-2.5">
                                <div className="flex items-center justify-between border-b border-blue-300 pb-2">
                                  <span className="font-mono font-bold text-blue-950 text-xs uppercase flex items-center gap-1.5">
                                    🚀 3. Retorno do Sócio Investidor
                                  </span>
                                  <span className="text-[10px] bg-blue-500 text-white font-mono font-bold px-2.5 py-1 rounded-md inline-flex items-center leading-tight">
                                    15.0x - 17.2x MOIC
                                  </span>
                                </div>
                                <ul className="space-y-1.5 text-[11px] text-slate-800 leading-relaxed">
                                  <li><strong>• Aporte Seed:</strong> 900.000 MT por 10% Equity (90.000 MT para Capital Social Legal).</li>
                                  <li><strong>• Dividendos Acumulados (3 Anos):</strong> 373.400 MT (Ano 1) + 1.050.000 MT (Ano 2) + 2.100.000 MT (Ano 3) = <strong>3.523.400 MT</strong>.</li>
                                  <li><strong>• Payback & Break-Even:</strong> Payback no Mês 14 (158% de retorno no Ano 2) | Break-Even Mês 7.</li>
                                  <li><strong>• Equity Valuation (Ano 3):</strong> 100M-120M MT (10% de Quota do Investidor = 10M-12M MT).</li>
                                </ul>
                              </div>

                              {/* Card 4: Governação */}
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 space-y-2.5">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                  <span className="font-mono font-bold text-slate-950 text-xs uppercase flex items-center gap-1.5">
                                    🛡️ 4. Governação & Proteção de Capital
                                  </span>
                                  <span className="text-[10px] bg-white text-[#172554] font-mono font-bold px-2.5 py-1 rounded-md inline-flex items-center leading-tight">
                                    PROTEÇÃO 100%
                                  </span>
                                </div>
                                <ul className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                                  <li><strong>• Assento em Conselho:</strong> Participação ativa com direito a voto nas reuniões de diretoria.</li>
                                  <li><strong>• Dashboard Tempo Real:</strong> Controlo financeiro e relatórios de fluxo de caixa em tempo real.</li>
                                  <li><strong>• Cláusula Tag-Along:</strong> Garantia de 100% nas mesmas condições de alienação de controlo.</li>
                                  <li><strong>• Fundo de Reserva:</strong> 380.000 MT retidos na 3ª Fase para resiliência operacional.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • RESUMO EXECUTIVO CUSTO-BENEFÍCIO</span>
                          <span>PÁGINA {pageNum} DE 6</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ════════════════════════ DOCUMENT 1: PLANO DE NEGÓCIOS COMPLETO ════════════════════════ */}
            {activeDocument === "business_plan" && (
              <>
                {viewMode === "pages" ? (
                  /* PAGE-BY-PAGE PRESENTATION SLICES MODE */
                  <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-300 shadow-2xl space-y-8 min-h-[680px] flex flex-col justify-between transition-all animate-fade-in text-left">
                    
                    {/* PAGE 1 OF 5 */}
                    {activeBusinessPlanPage === 1 && (
                      <div className="space-y-8 flex-1 flex flex-col justify-between">
                        <div>
                          <TariraDocumentBrandHeader light={true} />

                          <div className="border-b-4 border-blue-500 pb-6 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                                <span>🏛️ PLANO DE NEGÓCIOS EXECUTIVO • EDIÇÃO 2026/2029</span>
                              </div>
                              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-950">
                                Plano de Negócios & Proposta de Financiamento Seed
                              </h2>
                              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                                Modelo Híbrido (70% Plataforma Digital / 30% Espaço Físico) de Gestão de Mão-de-Obra, Terceirização B2B e Recrutamento
                              </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right shrink-0">
                              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Sede & Jurisdição</span>
                              <span className="text-xs font-bold text-slate-900 block mt-0.5">Maputo • Moçambique</span>
                              <span className="text-[10px] text-emerald-600 font-bold block mt-1">Representante: Vicente Dias</span>
                            </div>
                          </div>

                          <div className="p-6 rounded-3xl bg-white text-[#172554] space-y-4 my-6 shadow-lg border border-slate-200">
                            <h3 className="font-serif font-bold text-lg text-blue-700 border-b border-slate-200 pb-2">
                              Resumo Executivo do Investimento
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                              A <strong>TARIRA Ecosystem Services Lda.</strong> é uma infraestrutura tecnológica e operacional integrada concebida para estruturar e automatizar o mercado de contratação de serviços técnicos, recrutamento de pessoal e terceirização corporativa em Moçambique.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] text-blue-700 uppercase block font-bold">Proposta Seed Requerida</span>
                                <span className="font-bold text-[#172554] text-sm">900.000 MT por 10% Equity</span>
                              </div>
                              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] text-emerald-600 uppercase block font-bold">Valuation Post-Money</span>
                                <span className="font-bold text-[#172554] text-sm">9.000.000 Meticais</span>
                              </div>
                              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] text-emerald-600 uppercase block font-bold">EBITDA (Ano 1)</span>
                                <span className="font-bold text-[#172554] text-sm">6.800.000 MT (Margem 36,8%)</span>
                              </div>
                              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] text-blue-700 uppercase block font-bold">Payback & Break-Even</span>
                                <span className="font-bold text-[#172554] text-sm">14 Meses | Break-Even Mês 7</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • PLANO DE NEGÓCIOS EXECUTIVO</span>
                          <span>PÁGINA 1 DE 5</span>
                        </div>
                      </div>
                    )}

                    {/* PAGE 2 OF 5 */}
                    {activeBusinessPlanPage === 2 && (
                      <div className="space-y-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs font-mono text-slate-500">
                            <span className="font-bold text-slate-800">TARIRA Ecosystem Services Lda.</span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-blue-700 font-bold">PÁGINA 2 DE 5</span>
                          </div>

                          <section className="space-y-4">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              1. Definicão da TARIRA Ecosystem Services Lda. & Modelo Híbrido
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                              A <strong>TARIRA Ecosystem Services Lda.</strong> é uma infraestrutura tecnológica e operacional integrada, sediada em Moçambique, concebida para transformar, organizar e modernizar o mercado de trabalho, a alocação de prestadores de ofícios técnicos, a gestão de recursos humanos terceirizados e a digitalização de PMEs. Unifica sob o mesmo ecossistema cinco unidades operacionais complementares: <strong>TARIRA Connect</strong> (ofícios e reparações), <strong>TARIRA Recruit</strong> (recrutamento ATS de quadros), <strong>TARIRA Business</strong> (terceirização B2B), <strong>TARIRA Consulting</strong> (back-office e compliance) e <strong>TARIRA Studio</strong> (Micro-SaaS, Vitrine Digital 'Axofacil' e automação para PMEs).
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
                              <div className="p-4 rounded-2xl bg-white text-[#172554] space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-mono text-[10px] font-bold">70% DIGITAL</span>
                                  <h3 className="font-bold text-xs uppercase text-blue-700 font-mono">Plataforma & Automação</h3>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  Matchmaking algorítmico, agendamentos, triagem cognoscitiva ATS, gestão salarial, extratos e relatórios de desempenho B2B/B2C acessíveis por aplicativo e portal web.
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-slate-50 text-[#172554] font-mono text-[10px] font-bold">30% PRESENCIAL</span>
                                  <h3 className="font-bold text-xs uppercase text-slate-900 font-mono">Hub Físico Operacional</h3>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  Instalações físicas para recepção e onboarding de técnicos, entrevistas de seleção, verificação de bagagem técnica/ferramental e apoio presencial de garantia de qualidade.
                                </p>
                              </div>
                            </div>
                          </section>

                          <section className="space-y-4 pt-2">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              2. Origem, Razão de Criação & Justificativa do Ecossistema
                            </h2>
                            <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
                              <p>
                                <strong>O Desafio do Mercado Regional:</strong> Vivemos num país e numa região caracterizada por um mercado de serviços predominantemente informal (onde 85% a 90% das contratações ocorrem 'de boca em boca'). Esta informalidade resulta numa profunda falta de flexibilidade e ausência de garantias.
                              </p>
                              <p>
                                <strong>A Solução TARIRA:</strong> A TARIRA foi criada para <strong>unir a tecnologia à agilidade do mercado</strong>. Permite solicitar qualquer prestador de serviço, alocação operacional ou recrutamento com máxima transparência, segurança e rapidez.
                              </p>
                              <p>
                                <strong>Liderança por Vicente Dias:</strong> A conceção baseia-se em <strong>mais de 10 anos de experiência comprovada de Vicente Dias como Coordenador Operacional</strong> na liderança de múltiplas operações complexas.
                              </p>
                            </div>
                          </section>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • DEFINIÇÃO & ORIGEM</span>
                          <span>PÁGINA 2 DE 5</span>
                        </div>
                      </div>
                    )}

                    {/* PAGE 3 OF 5 */}
                    {activeBusinessPlanPage === 3 && (
                      <div className="space-y-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs font-mono text-slate-500">
                            <span className="font-bold text-slate-800">TARIRA Ecosystem Services Lda.</span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-blue-700 font-bold">PÁGINA 3 DE 5</span>
                          </div>

                          <section className="space-y-4">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              3. Estrutura Operacional dos 5 Pilares do Ecossistema
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">⚡</span>
                                  <h3 className="font-bold text-xs uppercase text-slate-900 font-mono">1. TARIRA Connect</h3>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  Atendimento imediato e agendado para eletricistas, canalizadores, pintores e climatização. Retenção de <strong>18% a 20%</strong> sobre o orçamento.
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🔗</span>
                                  <h3 className="font-bold text-xs uppercase text-slate-900 font-mono">2. TARIRA Recruit</h3>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  Seleção e recrutamento ATS de quadros. Taxa de <strong>35% do 1º salário mensal</strong> com garantia de substituição sem custos por 90 dias.
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 sm:col-span-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">💼</span>
                                  <h3 className="font-bold text-xs uppercase text-slate-900 font-mono">3. TARIRA Business (3 Modelos B2B)</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                                    <span className="font-bold text-[11px] text-slate-900 font-mono block">Modelo 1: No Cliente</span>
                                    <p className="text-[10px] text-slate-600 leading-tight">Equipa qualificada + gestão RH completa no local do cliente (Custo Salarial + Fee 25-30%).</p>
                                  </div>
                                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                                    <span className="font-bold text-[11px] text-slate-900 font-mono block">Modelo 2: Operação 3G</span>
                                    <p className="text-[10px] text-slate-600 leading-tight">Profissionais + Espaço/Infraestrutura TARIRA de apoio (Custo Salarial + Taxa Espaço).</p>
                                  </div>
                                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                                    <span className="font-bold text-[11px] text-slate-900 font-mono block">Modelo 3: Metas do Cliente</span>
                                    <p className="text-[10px] text-slate-600 leading-tight">Alocação de pessoal com gestão direta pelo cliente (Custo Salarial + Fee Laboral).</p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">💡</span>
                                  <h3 className="font-bold text-xs uppercase text-slate-900 font-mono">4. TARIRA Consulting</h3>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  Consultoria de RH, processos operacionais, compliance laboral e automação. Fee sob proposta com margem de <strong>70% a 80%</strong>.
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🚀</span>
                                  <h3 className="font-bold text-xs uppercase text-slate-900 font-mono">5. TARIRA Studio (Micro-SaaS & Vitrine 'Axofacil')</h3>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  Desenvolvimento de Micro-SaaS sob medida, Vitrine Digital para boutiques e comerciantes, e-commerce e automação comercial para PMEs. Subscrição mensal SaaS (<strong>3.000 a 8.000 MT/mês</strong>) + <strong>2,5% a 5%</strong> sobre transações digitais.
                                </p>
                              </div>
                            </div>
                          </section>

                          <section className="space-y-4 pt-2">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              4. Valuation Atual da Empresa, EBITDA, Break-Even & Payback
                            </h2>
                            <div className="p-5 rounded-3xl bg-white text-[#172554] space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center font-mono">
                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Valuation Post-Money</span>
                                  <span className="text-base font-black text-blue-700">9.000.000 MT</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">EBITDA (Ano 1)</span>
                                  <span className="text-base font-black text-emerald-600">6.800.000 MT (36,8%)</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Break-Even</span>
                                  <span className="text-base font-black text-emerald-600">Mês 7</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Payback Period</span>
                                  <span className="text-base font-black text-blue-700">14 Meses</span>
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • PILARES OPERACIONAIS & VALUATION</span>
                          <span>PÁGINA 3 DE 5</span>
                        </div>
                      </div>
                    )}

                    {/* PAGE 4 OF 5 */}
                    {activeBusinessPlanPage === 4 && (
                      <div className="space-y-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs font-mono text-slate-500">
                            <span className="font-bold text-slate-800">TARIRA Ecosystem Services Lda.</span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-blue-700 font-bold">PÁGINA 4 DE 5</span>
                          </div>

                          <section className="space-y-4">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              5. Proposta de Investimento & Participação Societária
                            </h2>

                            <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-white space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                                <div className="p-3.5 rounded-2xl bg-white border border-blue-200">
                                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Investidor Proponente</span>
                                  <span className="font-bold text-slate-900 text-sm">Investidor Estratégico</span>
                                  <span className="text-[10px] text-slate-500 block mt-0.5">Sócio Investidor (Proposta Inicial Seed)</span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-white border border-blue-200">
                                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Empresa Destinatária</span>
                                  <span className="font-bold text-slate-900 text-sm">TARIRA Ecosystem Services Lda.</span>
                                  <span className="text-[10px] text-slate-500 block mt-0.5">Representada por Vicente Dias</span>
                                </div>
                              </div>

                              <div className="p-4 rounded-2xl bg-white border border-blue-200 space-y-2 text-xs">
                                <div className="flex justify-between items-center font-mono">
                                  <span className="font-bold text-slate-900">Aporte Financeiro Requerido:</span>
                                  <span className="text-lg font-black text-blue-700">900.000 Meticais (Fixo)</span>
                                </div>
                                <div className="flex justify-between items-center font-mono">
                                  <span className="font-bold text-slate-900">Participação Societária Cedida:</span>
                                  <span className="text-lg font-black text-blue-700">10% do Capital Social</span>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs pt-2">
                                <span className="font-bold text-slate-900 font-mono text-[11px] uppercase block">Destino do Capital Investido (900.000 Meticais) — Cotação Real Hostinger & Reinvestimento:</span>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center font-mono">
                                  <div className="p-2.5 rounded-xl bg-white border border-blue-300">
                                    <span className="text-xs font-black text-blue-800 block">10,0% (90.000 MT)</span>
                                    <span className="text-[9px] text-slate-600 block leading-tight">Capital Social Formal</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-400">
                                    <span className="text-xs font-black text-blue-900 block">1,67% (15.000 MT)</span>
                                    <span className="text-[9px] text-blue-800 font-bold block leading-tight">Hostinger.com Anual</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white border border-blue-300">
                                    <span className="text-xs font-black text-blue-800 block">23,89% (215.000 MT)</span>
                                    <span className="text-[9px] text-slate-600 block leading-tight">Marketing & Divulgação (+35.000 MT)</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white border border-blue-300">
                                    <span className="text-xs font-black text-blue-800 block">22,22% (200.000 MT)</span>
                                    <span className="text-[9px] text-slate-600 block leading-tight">Pró-Labore & Equipa (+20.000 MT)</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white border border-blue-300">
                                    <span className="text-xs font-black text-blue-800 block">42,22% (380.000 MT)</span>
                                    <span className="text-[9px] text-slate-600 block leading-tight">Hub Maputo & Liquidez (+20.000 MT)</span>
                                  </div>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-300/60 text-[10.5px] text-blue-950 font-sans leading-relaxed mt-2">
                                  <strong>💡 Ajuste de Valor Real Hostinger.com:</strong> A cotação para o alojamento web de alta performance Business Cloud + registo anual de domínio corporativo (.co.mz / .com) no Hostinger.com fixou-se em <strong>15.000 Meticais/ano (1,67% do aporte)</strong>. O valor remanescente de 75.000 MT foi deslocalizado para as áreas de maior necessidade: <strong>+35.000 MT para Marketing/Angariação B2B</strong>, <strong>+20.000 MT para o Hub Maputo/Liquidez</strong> e <strong>+20.000 MT para Onboarding/Formação</strong>.
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • PROPOSTA DE INVESTIMENTO</span>
                          <span>PÁGINA 4 DE 5</span>
                        </div>
                      </div>
                    )}

                    {/* PAGE 5 OF 5 */}
                    {activeBusinessPlanPage === 5 && (
                      <div className="space-y-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs font-mono text-slate-500">
                            <span className="font-bold text-slate-800">TARIRA Ecosystem Services Lda.</span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-blue-700 font-bold">PÁGINA 5 DE 5</span>
                          </div>

                          <section className="space-y-4">
                            <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                              6. Indicadores de Crescimento Operacional, EBITDA & Lucro (3 Anos)
                            </h2>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                                <thead className="bg-white text-[#172554] font-mono text-[10px] uppercase">
                                  <tr>
                                    <th className="p-3">Indicador / Ano</th>
                                    <th className="p-3">Ano 1 (2026)</th>
                                    <th className="p-3">Ano 2 (2027)</th>
                                    <th className="p-3">Ano 3 (2028)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 font-sans">
                                  <tr>
                                    <td className="p-3 font-bold text-slate-900">Serviços Connect</td>
                                    <td className="p-3 font-mono">3.200 serv.</td>
                                    <td className="p-3 font-mono">8.500 serv.</td>
                                    <td className="p-3 font-mono">21.000 serv.</td>
                                  </tr>
                                  <tr>
                                    <td className="p-3 font-bold text-slate-900">Colocações Recruit</td>
                                    <td className="p-3 font-mono">120 cand.</td>
                                    <td className="p-3 font-mono">320 cand.</td>
                                    <td className="p-3 font-mono">780 cand.</td>
                                  </tr>
                                  <tr>
                                    <td className="p-3 font-bold text-slate-900">Contratos B2B Ativos</td>
                                    <td className="p-3 font-mono">15 emp.</td>
                                    <td className="p-3 font-mono">42 emp.</td>
                                    <td className="p-3 font-mono">95 emp.</td>
                                  </tr>
                                  <tr className="bg-blue-50/60">
                                    <td className="p-3 font-bold text-slate-950">Faturamento Bruto Anual</td>
                                    <td className="p-3 font-mono font-bold text-blue-900">18.500.000 MT</td>
                                    <td className="p-3 font-mono font-bold text-blue-900">46.800.000 MT</td>
                                    <td className="p-3 font-mono font-bold text-blue-900">108.000.000 MT</td>
                                  </tr>
                                  <tr className="bg-slate-100/80 font-mono text-slate-700">
                                    <td className="p-3 font-bold text-slate-900">Custos Fixos Escalados (Pessoas & Hubs)</td>
                                    <td className="p-3">1.820.000 MT</td>
                                    <td className="p-3">5.880.000 MT (+12 hires)</td>
                                    <td className="p-3">19.440.000 MT (4 hubs/35 hires)</td>
                                  </tr>
                                  <tr className="bg-blue-50/60 font-bold">
                                    <td className="p-3 text-blue-950">EBITDA Operacional Ajustado</td>
                                    <td className="p-3 font-mono text-blue-900">6.800.000 MT (36,8%)</td>
                                    <td className="p-3 font-mono text-blue-900">13.920.000 MT (29,7%)</td>
                                    <td className="p-3 font-mono text-blue-900">26.560.000 MT (24,6%)</td>
                                  </tr>
                                  <tr className="bg-emerald-50/50 font-bold">
                                    <td className="p-3 text-emerald-950">Lucro Líquido Projetado</td>
                                    <td className="p-3 font-mono text-emerald-800">3.734.000 MT</td>
                                    <td className="p-3 font-mono text-emerald-800">10.500.000 MT</td>
                                    <td className="p-3 font-mono text-emerald-800">21.000.000 MT</td>
                                  </tr>
                                  <tr className="bg-blue-100/50 font-bold border-t-2 border-blue-400">
                                    <td className="p-3 text-blue-950 font-mono uppercase text-[10px]">Dividendos Sócio Investidor (10%)</td>
                                    <td className="p-3 font-mono text-blue-900">373.400 MZN</td>
                                    <td className="p-3 font-mono text-blue-900">1.050.000 MZN</td>
                                    <td className="p-3 font-mono text-blue-900">2.100.000 MZN</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-xs leading-relaxed">
                              💡 <strong>Ajuste Realista de Escala Operacional:</strong> Com o aumento da procura nos Anos 2 e 3 (de 15 para 95 empresas B2B e 21.000 serviços), aplicamos a expansão progressiva dos custos fixos internos (contratação de assistentes de RH, supervisores operacionais, angariadores comerciais B2B e expansão de hubs presenciais em Beira, Nampula e Tete). Isto assegura uma estrutura sólida, atendimento com padrão de excelência e margens EBITDA altamente sustentáveis (24,6% a 29,7%).
                            </div>
                          </section>

                          <section className="p-5 rounded-2xl bg-white text-[#172554] space-y-2 text-xs">
                            <span className="text-blue-700 font-mono font-bold text-[11px] uppercase block">Validação Oficial do Documento:</span>
                            <div className="flex justify-between items-center pt-2">
                              <div>
                                <span className="font-bold text-[#172554] block">Vicente Dias</span>
                                <span className="text-[10px] text-slate-400 font-mono block">Fundador & Coordenador Operacional</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-blue-700 block">Selo de Autenticidade 2026</span>
                                <span className="text-[10px] text-slate-400 font-mono block">Maputo, Moçambique</span>
                              </div>
                            </div>
                          </section>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>TARIRA ECOSSISTEMA LDA. • PROJEÇÕES DE CRESCIMENTO & SIGNOFF</span>
                          <span>PÁGINA 5 DE 5</span>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  /* CONTINUOUS SCROLL MODE FOR BUSINESS PLAN */
                  <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-10 text-slate-900">
                    <TariraDocumentBrandHeader light={true} />

                    <div className="border-b-4 border-blue-500 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                          <span>🏛️ PLANO DE NEGÓCIOS EXECUTIVO • EDIÇÃO 2026/2029</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-950">
                          Plano de Negócios & Proposta de Financiamento Seed
                        </h2>
                        <p className="text-sm font-semibold text-slate-600 mt-1">
                          Modelo Híbrido (70% Plataforma Digital / 30% Espaço Físico) de Gestão de Mão-de-Obra, Terceirização B2B e Recrutamento
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right shrink-0">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Sede & Jurisdição</span>
                        <span className="text-xs font-bold text-slate-900 block mt-0.5">Maputo • Moçambique</span>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-1">Representante: Vicente Dias</span>
                      </div>
                    </div>

                    <section className="space-y-4">
                      <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                        1. Definicão da TARIRA Ecosystem Services Lda. & Modelo Híbrido
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        A <strong>TARIRA Ecosystem Services Lda.</strong> é uma infraestrutura tecnológica e operacional integrada, sediada em Moçambique, concebida para transformar, organizar e modernizar o mercado de trabalho, a alocação de prestadores de ofícios técnicos e a gestão de recursos humanos terceirizados.
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                        2. Origem, Razão de Criação & Justificativa do Ecossistema
                      </h2>
                      <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
                        <p>
                          <strong>O Desafio do Mercado Regional:</strong> Vivemos num país caracterizado por um mercado de serviços predominantemente informal (onde 85% a 90% das contratações ocorrem 'de boca em boca').
                        </p>
                        <p>
                          <strong>Fundamentação pelo Fundador (Vicente Dias):</strong> A conceção do ecossistema TARIRA baseia-se em mais de 10 anos de experiência comprovada de Vicente Dias como Coordenador Operacional.
                        </p>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                        3. Estrutura Operacional dos 4 Pilares & Valuation
                      </h2>
                      <div className="p-5 rounded-3xl bg-white text-[#172554] space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center font-mono">
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Valuation Post-Money</span>
                            <span className="text-lg font-black text-blue-700">9.000.000 MT</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">EBITDA Ano 1</span>
                            <span className="text-lg font-black text-emerald-600">6.800.000 MT</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Break-Even</span>
                            <span className="text-lg font-black text-emerald-600">Mês 7</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Payback</span>
                            <span className="text-lg font-black text-blue-700">14 Meses</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h2 className="text-xl font-serif font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                        4. Proposta de Investimento Seed (Investidor Proponente & Vicente Dias)
                      </h2>
                      <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-white space-y-3 text-xs">
                        <p><strong>Aporte:</strong> 900.000 Meticais em troca de 10% do Capital Social.</p>
                        <p><strong>Destino dos Recursos:</strong> 10% Cloud/Deploy, 20% Marketing, 30% Equipa, 40% Hub Físico (30%).</p>
                      </div>
                    </section>

                    <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>TARIRA Ecosystem Services Lda. • Documento de Investimento</span>
                      <span>Aprovado por Vicente Dias • 2026</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ════════════════════════ DOCUMENT 2: PITCH DECK DE APRESENTAÇÃO (10 SLIDES) ════════════════════════ */}
            {activeDocument === "pitch_deck" && (
              <div className="space-y-6 text-left">
                {/* Display Current Active Slide Card */}
                {(() => {
                  const currSlide = pitchSlides[activePitchSlide - 1];
                  return (
                    <div className="p-8 sm:p-12 rounded-3xl bg-white text-slate-900 border-2 border-slate-200 shadow-xl space-y-6 relative overflow-hidden min-h-[480px] flex flex-col justify-between animate-fade-in">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                      <div className="space-y-4 relative z-10">
                        {/* Slide Top Branding Header */}
                        <div className="border-b border-slate-200 pb-3 mb-2 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <svg viewBox="0 0 102 60" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <ellipse cx="41" cy="30" rx="20" ry="14" stroke="#2563EB" strokeWidth="6" fill="none" />
                              <ellipse cx="61" cy="30" rx="20" ry="14" stroke="#101E34" strokeWidth="6" fill="none" />
                              <path d="M 41 16 A 20 14 0 0 1 61 30" stroke="#2563EB" strokeWidth="6" fill="none" strokeLinecap="round" />
                            </svg>
                            <span className="font-serif font-black text-sm tracking-widest text-slate-950">TARIRA</span>
                          </div>
                          <div className="text-right">
                            <span className="font-serif italic font-bold text-[10px] text-blue-900 block">Supervisionamos. Para que não precise.</span>
                            <span className="font-sans font-medium text-[8px] uppercase tracking-widest text-slate-500 block">WE OVERSEE. SO YOU DON'T HAVE TO.</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-mono text-xs font-bold uppercase tracking-widest">
                            SLIDE {currSlide.num} DE 10 • {currSlide.tag}
                          </span>
                          {currSlide.num === 1 ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
                              <svg viewBox="0 0 102 60" className="w-10 h-6 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="41" cy="30" rx="20" ry="14" stroke="#2563EB" strokeWidth="6" fill="none" />
                                <ellipse cx="61" cy="30" rx="20" ry="14" stroke="#101E34" strokeWidth="6" fill="none" />
                                <path d="M 41 16 A 20 14 0 0 1 61 30" stroke="#2563EB" strokeWidth="6" fill="none" strokeLinecap="round" />
                              </svg>
                              <span className="font-serif font-black text-xs tracking-widest text-blue-950">TARIRA ECOSYSTEM</span>
                            </div>
                          ) : (
                            <span className="text-4xl">{currSlide.icon}</span>
                          )}
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-950 leading-tight">
                          {currSlide.title}
                        </h2>
                        <p className="text-sm sm:text-base text-slate-700 font-semibold border-b border-slate-200 pb-4">
                          {currSlide.subtitle}
                        </p>

                        {currSlide.problems ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-2">
                            {currSlide.problems.map((p, idx) => (
                              <div key={idx} className={`p-4 rounded-2xl border ${p.color} flex flex-col justify-between shadow-xs space-y-2`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">{p.metric}</span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/90 border border-slate-200 shadow-2xs">
                                    {p.badge}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">{p.label}</h4>
                                  <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">{p.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3 pt-2">
                            {currSlide.bullets.map((bullet, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">{bullet}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-6 border-t border-slate-200 relative z-10">
                        <span>TARIRA ECOSSISTEMA LDA. • PITCH INVESTIDORES 2026</span>
                        <span>SLIDE {currSlide.num} / 10</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Grid Selector for All 10 Slides */}
                <div className="space-y-3 pt-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-serif font-bold text-slate-900 text-xs uppercase font-mono tracking-wider">
                    Navegação Rápida pelos 10 Slides do Pitch Deck:
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {pitchSlides.map((slide) => (
                      <button
                        key={slide.num}
                        type="button"
                        onClick={() => setActivePitchSlide(slide.num)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          activePitchSlide === slide.num
                            ? "bg-white text-blue-700 border-blue-500 font-bold shadow-md"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <span className="text-[9px] font-mono font-bold uppercase block opacity-70">
                          Slide {slide.num}
                        </span>
                        <span className="text-[10px] font-bold line-clamp-1 mt-0.5">
                          {slide.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500 font-mono shrink-0">
          Gere os documentos oficiais para apresentação a investidores de forma independente do site principal.
        </div>
      </div>

      {/* ════════════════════════ OFFSCREEN MULTI-PAGE PDF GENERATION CONTAINER ════════════════════════ */}
      <div
        ref={exportContainerRef}
        id="pdf-export-container"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: activeDocument === "pitch_deck" || activeDocument === "cost_benefit" ? "1000px" : "800px",
          zIndex: -100,
          pointerEvents: "none",
          opacity: 0.99,
        }}
      >
        {activeDocument === "cost_benefit" ? (
          <div>
            {/* SLIDE 1 OF 6: COVER & DEAL METRICS */}
            <div
              className="pdf-slide-block"
              style={{
                width: "1000px",
                height: "707px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "36px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontFamily: "sans-serif",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg viewBox="0 0 102 60" style={{ width: "40px", height: "24px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="41" cy="30" rx="20" ry="14" stroke="#2563EB" strokeWidth="6" fill="none" />
                      <ellipse cx="61" cy="30" rx="20" ry="14" stroke="#101E34" strokeWidth="6" fill="none" />
                      <path d="M 41 16 A 20 14 0 0 1 61 30" stroke="#2563EB" strokeWidth="6" fill="none" strokeLinecap="round" />
                    </svg>
                    <div>
                      <span style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "Georgia, serif", letterSpacing: "2px", color: "#1E3A8A" }}>TARIRA</span>
                      <span style={{ fontSize: "10px", color: "#475569", display: "block", fontFamily: "monospace" }}>TARIRA Ecosystem Services Lda.</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "10px", fontFamily: "monospace", color: "#1E3A8A" }}>
                    <span style={{ fontWeight: "bold", display: "block" }}>SÍNTESE EXECUTIVA CUSTO-BENEFÍCIO</span>
                    <span style={{ color: "#64748B" }}>Proposta de Investimento Inicial • Seed 2026/2029</span>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "inline-block", padding: "4px 10px", backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", fontSize: "10px", fontWeight: "bold", fontFamily: "monospace", borderRadius: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                    CUSTOS, BENEFÍCIOS & RETORNO SEED (900.000 METICAIS)
                  </div>
                  <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0F172A", fontFamily: "Georgia, serif", margin: "0 0 4px 0", lineHeight: "1.2" }}>
                    Análise de Custos, Benefícios & Retorno do Investimento
                  </h1>
                  <p style={{ fontSize: "12px", color: "#334155", margin: 0, fontWeight: "600" }}>
                    Proposta Seed para Moçambique: 900.000 MT por 10% do Capital Social (Valuation Post-Money 9.000.000 MT)
                  </p>
                </div>

                <div style={{ backgroundColor: "#FEF3C7", padding: "14px", borderRadius: "12px", borderLeft: "4px solid #D97706", marginBottom: "16px" }}>
                  <p style={{ fontSize: "13px", fontStyle: "italic", fontFamily: "Georgia, serif", color: "#92400E", margin: 0, fontWeight: "bold" }}>
                    “A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”
                  </p>
                </div>

                <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#B45309", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "10px", borderBottom: "1px solid #E2E8F0", paddingBottom: "6px" }}>
                    MÉTRICAS CHAVE DO ACORDO SEED
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", fontFamily: "monospace", fontSize: "11px" }}>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                      <span style={{ color: "#B45309", fontSize: "9px", display: "block", textTransform: "uppercase", fontWeight: "bold" }}>APORTE SEED</span>
                      <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "14px" }}>900.000 MT</span>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                      <span style={{ color: "#059669", fontSize: "9px", display: "block", textTransform: "uppercase", fontWeight: "bold" }}>EQUITY CEDIDO</span>
                      <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "14px" }}>10% CAPITAL</span>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                      <span style={{ color: "#059669", fontSize: "9px", display: "block", textTransform: "uppercase", fontWeight: "bold" }}>EBITDA ANO 1</span>
                      <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "14px" }}>6.800.000 MT</span>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                      <span style={{ color: "#2563EB", fontSize: "9px", display: "block", textTransform: "uppercase", fontWeight: "bold" }}>PAYBACK SEED</span>
                      <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "14px" }}>14 MESES</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#64748B", fontFamily: "monospace", borderTop: "1px solid #E2E8F0", paddingTop: "8px" }}>
                <span>TARIRA Ecosystem Services Lda. • Resumo Custo-Benefício 2026</span>
                <span>Página 1 de 6</span>
              </div>
            </div>

            {/* SLIDE 2 OF 6: CUSTOS OPERACIONAIS E EVOLUÇÃO DA EQUIPA */}
            <div
              className="pdf-slide-block"
              style={{
                width: "1000px",
                height: "707px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "36px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontFamily: "sans-serif",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#D97706", fontFamily: "Georgia, serif" }}>TARIRA Ecosystem Services Lda.</span>
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>Resumo Executivo • Página 2 de 6</span>
                </div>

                <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0F172A", fontFamily: "Georgia, serif", margin: "0 0 12px 0", borderLeft: "4px solid #D97706", paddingLeft: "10px" }}>
                  1. Estrutura de Custos Operacionais & Investimento em Pessoal
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#B45309", fontFamily: "monospace" }}>🏢 ESPAÇO FÍSICO / HUB SEDE (INÍCIO NA 2ª FASE PARA ANGARIAÇÃO)</span>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#0F172A", fontFamily: "monospace" }}>22.500 MZN/mês (A partir da 2ª Fase)</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#334155", margin: 0, lineHeight: "1.4" }}>
                      • Arrendamento comercial do Espaço Físico / Hub na Cidade de Maputo a partir da 2ª Fase para cadastro presencial e onboarding de prestadores de serviços e atendimento B2B. Na 1ª Fase, opera-se 100% digital.
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#B45309", fontFamily: "monospace" }}>👥 ANÁLISE CUSTO-BENEFÍCIO DA EQUIPA & SALÁRIO DO CEO & FOUNDER EM 3 FASES</span>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#0F172A", fontFamily: "monospace" }}>119.000 MZN/mês (No Go Live - Fase 3)</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#334155", margin: "0 0 6px 0", lineHeight: "1.4" }}>
                      • <strong>Salário do CEO & Founder (Vicente Dias):</strong> Atribuído desde a 1ª Fase (envolvimento em todos os segmentos). No "Go Live" (3ª Fase), a sua métrica evolui para metas por ações e participação nos lucros anuais.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", fontFamily: "monospace", fontSize: "9px" }}>
                      <div style={{ backgroundColor: "#FEF3C7", padding: "6px", borderRadius: "6px", border: "1px solid #FDE68A", color: "#78350F" }}>
                        • <strong>1ª FASE: WEB & CLOUD</strong><br />
                        - CEO & Founder (Pró-labore)<br />
                        - ❌ Sem Assistente de RH<br />
                        - ❌ Sem Supervisores de Campo<br />
                        - ❌ Sem Espaço Físico
                      </div>
                      <div style={{ backgroundColor: "#D1FAE5", padding: "6px", borderRadius: "6px", border: "1px solid #A7F3D0", color: "#065F46" }}>
                        • <strong>2ª FASE: MARKETING B2B</strong><br />
                        - CEO & Founder (Atuação B2B)<br />
                        - ✅ Angariadores Comerciais/Mkt<br />
                        - ✅ Início Espaço Físico/Hub<br />
                        - ❌ Sem RH / Supervisores
                      </div>
                      <div style={{ backgroundColor: "#DBEAFE", padding: "6px", borderRadius: "6px", border: "1px solid #BFDBFE", color: "#172554" }}>
                        • <strong>3ª FASE: GO LIVE</strong><br />
                        - CEO & Founder (Métrica Ações/Lucro)<br />
                        - ✅ Hub Sede Maputo Completo<br />
                        - ✅ 1 Assistente RH Fixo (25.000 MZN)<br />
                        - ✅ Supervisores de Campo (58.000 MZN)
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#2563EB", fontFamily: "monospace" }}>💻 TECNOLOGIA & HOSTINGER.COM</span>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#0F172A", fontFamily: "monospace" }}>130.000 MT (Laptops) + 15.000 MT/ano Web</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#334155", margin: 0, lineHeight: "1.4" }}>
                      • 3 Laptops corporativos e material de escritório (130.000 MT) + Alojamento Web Hostinger.com (1.250 MT/mês) e fibra óptica dedicada.
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#FEF3C7", padding: "12px", borderRadius: "10px", border: "1px solid #FDE68A" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#92400E", display: "block", fontFamily: "monospace", marginBottom: "2px" }}>
                      📊 DILUIÇÃO DE CUSTOS POR TÉCNICO (ALAVANCAGEM OPERACIONAL)
                    </span>
                    <p style={{ fontSize: "11px", color: "#78350F", margin: 0, lineHeight: "1.4" }}>
                      Com a folha fixa de 119.000 MT/mês, a TARIRA supervisiona até <strong>350 técnicos ativos no terreno</strong>, resultando num custo fixo de apenas <strong>~340 MZN/técnico/mês</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#64748B", fontFamily: "monospace", borderTop: "1px solid #E2E8F0", paddingTop: "8px" }}>
                <span>TARIRA Ecosystem Services Lda. • Resumo Custo-Benefício 2026</span>
                <span>Página 2 de 6</span>
              </div>
            </div>

            {/* SLIDE 3 OF 6: MATRIZ DE 5 UNIDADES DE NEGÓCIO, MARGENS & CONSOLIDAÇÃO FINANCEIRA */}
            <div
              className="pdf-slide-block"
              style={{
                width: "1000px",
                height: "707px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "32px 36px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontFamily: "sans-serif",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#D97706", fontFamily: "Georgia, serif" }}>TARIRA Ecosystem Services Lda.</span>
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>Resumo Executivo • Página 3 de 6</span>
                </div>

                <h2 style={{ fontSize: "19px", fontWeight: "bold", color: "#0F172A", fontFamily: "Georgia, serif", margin: "0 0 10px 0", borderLeft: "4px solid #D97706", paddingLeft: "10px" }}>
                  2. Matriz de 5 Unidades de Negócio, Margens e Consolidação Financeira
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#B45309", fontFamily: "monospace" }}>⚡ TARIRA CONNECT</span>
                      <span style={{ fontSize: "9px", backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", padding: "3px 10px", borderRadius: "5px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        TAXA 18% - 20%
                      </span>
                    </div>
                    <p style={{ fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: "1.35" }}>
                      • Ofícios técnicos & reparações rápidas. 3.200 serviços no Ano 1 • <strong>Margem Bruta: 68% - 75%</strong>
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#2563EB", fontFamily: "monospace" }}>🔗 TARIRA RECRUIT</span>
                      <span style={{ fontSize: "9px", backgroundColor: "#DBEAFE", color: "#172554", border: "1px solid #BFDBFE", padding: "3px 10px", borderRadius: "5px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        35% SALÁRIO
                      </span>
                    </div>
                    <p style={{ fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: "1.35" }}>
                      • Recrutamento ATS e colocação de quadros. 120 colocações no Ano 1 • <strong>Margem Bruta: 85% - 90%</strong>
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#0F172A", fontFamily: "monospace" }}>💼 TARIRA BUSINESS</span>
                      <span style={{ fontSize: "9px", backgroundColor: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: "5px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        MARGEM 30% - 38%
                      </span>
                    </div>
                    <p style={{ fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: "1.35" }}>
                      • Terceirização B2B de pessoal e gestão de equipas. 15 Empresas (Ano 1) ➔ 42 (Ano 2) ➔ 95 (Ano 3)
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#7C3AED", fontFamily: "monospace" }}>📋 TARIRA CONSULTING</span>
                      <span style={{ fontSize: "9px", backgroundColor: "#ECE9FE", color: "#5B21B6", padding: "3px 10px", borderRadius: "5px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        FEE 15k-45k MT
                      </span>
                    </div>
                    <p style={{ fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: "1.35" }}>
                      • Consultoria em RH, auditoria trabalhista e compliance legal • <strong>Margem Bruta: 80% - 88%</strong>
                    </p>
                  </div>

                  <div style={{ gridColumn: "span 2", backgroundColor: "#0F172A", padding: "10px 14px", borderRadius: "8px", color: "#FFFFFF" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#F472B6", fontFamily: "monospace" }}>🚀 TARIRA STUDIO (MICRO-SAAS & VITRINE 'AXOFACIL')</span>
                      <span style={{ fontSize: "9px", backgroundColor: "#EC4899", color: "#FFFFFF", padding: "3px 12px", borderRadius: "5px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        3.000 - 8.000 MT / MÊS
                      </span>
                    </div>
                    <p style={{ fontSize: "9.5px", color: "#CBD5E1", margin: 0, lineHeight: "1.35" }}>
                      • Subscrição mensal SaaS para PMEs com criação automática de lojas online, agendamentos e catálogos digitais + 2,5%-5% sobre vendas. Margem Bruta: <strong>85% - 92%</strong>.
                    </p>
                  </div>
                </div>

                {/* SVG DONUT & BAR CHART DUAL GRAPHICS */}
                <div style={{ backgroundColor: "#0F172A", padding: "12px 14px", borderRadius: "12px", border: "1px solid #1E293B", color: "#FFFFFF", marginBottom: "10px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "bold", color: "#F59E0B", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "8px" }}>
                    📊 GRÁFICOS VISUAIS: MIX DE RECEITAS & MARGEM BRUTA DAS 5 UNIDADES DE NEGÓCIO
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignItems: "center" }}>
                    {/* Donut Chart Visual Representation */}
                    <div style={{ backgroundColor: "#1E293B", padding: "10px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "65px", height: "65px", transform: "rotate(-90deg)", flexShrink: 0 }}>
                        <svg viewBox="0 0 100 100" width="65" height="65" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#D97706" strokeWidth="20" strokeDasharray="163 251" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#2563EB" strokeWidth="20" strokeDasharray="55 251" strokeDashoffset="-163" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="20" strokeDasharray="35 251" strokeDashoffset="-218" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#EC4899" strokeWidth="20" strokeDasharray="20 251" strokeDashoffset="-253" />
                        </svg>
                      </div>
                      <div style={{ fontSize: "8.5px", fontFamily: "monospace", lineHeight: "1.35", whiteSpace: "nowrap" }}>
                        <div style={{ color: "#F59E0B" }}>■ Business: 52%</div>
                        <div style={{ color: "#60A5FA" }}>■ Connect: 22%</div>
                        <div style={{ color: "#34D399" }}>■ Recruit: 14%</div>
                        <div style={{ color: "#F472B6" }}>■ Studio: 8%</div>
                        <div style={{ color: "#A78BFA" }}>■ Consulting: 4%</div>
                      </div>
                    </div>

                    {/* Margins Bar Comparison */}
                    <div style={{ backgroundColor: "#1E293B", padding: "10px 12px", borderRadius: "8px", fontSize: "8.5px", fontFamily: "monospace" }}>
                      <div style={{ color: "#CBD5E1", fontWeight: "bold", marginBottom: "8px" }}>MARGEM BRUTA (%) POR UNIDADE</div>
                      <div style={{ marginBottom: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#F472B6", marginBottom: "2px", fontWeight: "bold" }}><span style={{ whiteSpace: "nowrap" }}>Studio</span><span>88%</span></div>
                        <div style={{ width: "100%", height: "7px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}><div style={{ width: "88%", height: "100%", backgroundColor: "#EC4899" }}></div></div>
                      </div>
                      <div style={{ marginBottom: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#34D399", marginBottom: "2px", fontWeight: "bold" }}><span style={{ whiteSpace: "nowrap" }}>Recruit</span><span>87%</span></div>
                        <div style={{ width: "100%", height: "7px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}><div style={{ width: "87%", height: "100%", backgroundColor: "#10B981" }}></div></div>
                      </div>
                      <div style={{ marginBottom: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#A78BFA", marginBottom: "2px", fontWeight: "bold" }}><span style={{ whiteSpace: "nowrap" }}>Consulting</span><span>84%</span></div>
                        <div style={{ width: "100%", height: "7px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}><div style={{ width: "84%", height: "100%", backgroundColor: "#8B5CF6" }}></div></div>
                      </div>
                      <div style={{ marginBottom: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#60A5FA", marginBottom: "2px", fontWeight: "bold" }}><span style={{ whiteSpace: "nowrap" }}>Connect</span><span>71%</span></div>
                        <div style={{ width: "100%", height: "7px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}><div style={{ width: "71%", height: "100%", backgroundColor: "#3B82F6" }}></div></div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#F59E0B", marginBottom: "2px", fontWeight: "bold" }}><span style={{ whiteSpace: "nowrap" }}>Business</span><span>35%</span></div>
                        <div style={{ width: "100%", height: "7px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}><div style={{ width: "35%", height: "100%", backgroundColor: "#F59E0B" }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: "#ECFDF5", padding: "10px 14px", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: "#065F46", display: "block", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "4px" }}>
                    📊 CONSOLIDADO FINANCEIRO ANO 1 DA OPERAÇÃO (5 UNIDADES DE NEGÓCIO)
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", fontFamily: "monospace", fontSize: "10px", textAlign: "center" }}>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "6px", borderRadius: "6px", border: "1px solid #A7F3D0" }}>
                      <span style={{ color: "#475569", fontSize: "8px", display: "block" }}>FATURAMENTO BRUTO</span>
                      <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "12px" }}>18.500.000 MZN</span>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "6px", borderRadius: "6px", border: "1px solid #A7F3D0" }}>
                      <span style={{ color: "#047857", fontSize: "8px", display: "block" }}>EBITDA OPERACIONAL (36,8%)</span>
                      <span style={{ color: "#047857", fontWeight: "bold", fontSize: "12px" }}>6.800.000 MZN</span>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", padding: "6px", borderRadius: "6px", border: "1px solid #A7F3D0" }}>
                      <span style={{ color: "#065F46", fontSize: "8px", display: "block" }}>LUCRO LÍQUIDO</span>
                      <span style={{ color: "#065F46", fontWeight: "bold", fontSize: "12px" }}>3.734.000 MZN</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#64748B", fontFamily: "monospace", borderTop: "1px solid #E2E8F0", paddingTop: "8px" }}>
                <span>TARIRA Ecosystem Services Lda. • Resumo Custo-Benefício 2026</span>
                <span>Página 3 de 6</span>
              </div>
            </div>

            {/* SLIDE 4 OF 6: WATERFALL DE DIVIDENDOS AO INVESTIDOR */}
            <div
              className="pdf-slide-block"
              style={{
                width: "1000px",
                height: "707px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "32px 36px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontFamily: "sans-serif",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#D97706", fontFamily: "Georgia, serif" }}>TARIRA Ecosystem Services Lda.</span>
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>Resumo Executivo • Página 4 de 6</span>
                </div>

                <h2 style={{ fontSize: "19px", fontWeight: "bold", color: "#0F172A", fontFamily: "Georgia, serif", margin: "0 0 12px 0", borderLeft: "4px solid #D97706", paddingLeft: "10px" }}>
                  3. Ganhos do Sócio Investidor em Médio Prazo (Waterfall de Dividendos)
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ backgroundColor: "#FEF3C7", padding: "12px 14px", borderRadius: "10px", border: "1px solid #FDE68A" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: "bold", color: "#92400E", fontFamily: "monospace" }}>💵 ALOCAÇÃO TRANSPARENTE DOS 900.000 MT (HOSTINGER.COM REAL INCLUÍDA)</span>
                      <span style={{ fontSize: "10px", backgroundColor: "#D97706", color: "#FFFFFF", padding: "3px 12px", borderRadius: "5px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        10% EQUITY
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", fontFamily: "monospace", fontSize: "9px", textAlign: "center", marginTop: "8px" }}>
                      <div style={{ backgroundColor: "#FFFFFF", padding: "8px 6px", borderRadius: "6px", border: "1px solid #FDE68A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#B45309", fontWeight: "bold", display: "block", fontSize: "9px", whiteSpace: "nowrap" }}>CAPITAL SOCIAL</span>
                        <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "11px", display: "block", margin: "2px 0" }}>90.000 MT</span>
                        <span style={{ color: "#64748B", fontSize: "8.5px", display: "block", whiteSpace: "nowrap" }}>10% Legal</span>
                      </div>
                      <div style={{ backgroundColor: "#FFFFFF", padding: "8px 6px", borderRadius: "6px", border: "1px solid #FDE68A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#B45309", fontWeight: "bold", display: "block", fontSize: "9px", whiteSpace: "nowrap" }}>HOSTINGER.COM</span>
                        <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "11px", display: "block", margin: "2px 0" }}>15.000 MT</span>
                        <span style={{ color: "#64748B", fontSize: "8.5px", display: "block", whiteSpace: "nowrap" }}>Alojamento Web</span>
                      </div>
                      <div style={{ backgroundColor: "#FFFFFF", padding: "8px 6px", borderRadius: "6px", border: "1px solid #A7F3D0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#047857", fontWeight: "bold", display: "block", fontSize: "9px", whiteSpace: "nowrap" }}>MARKETING B2B</span>
                        <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "11px", display: "block", margin: "2px 0" }}>215.000 MT</span>
                        <span style={{ color: "#64748B", fontSize: "8.5px", display: "block", whiteSpace: "nowrap" }}>Atração Empresas</span>
                      </div>
                      <div style={{ backgroundColor: "#FFFFFF", padding: "8px 6px", borderRadius: "6px", border: "1px solid #BFDBFE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#172554", fontWeight: "bold", display: "block", fontSize: "9px", whiteSpace: "nowrap" }}>GO LIVE & LIQUIDEZ</span>
                        <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "11px", display: "block", margin: "2px 0" }}>580.000 MT</span>
                        <span style={{ color: "#64748B", fontSize: "8.5px", display: "block", whiteSpace: "nowrap" }}>Hub Sede & Onboarding</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG WATERFALL BAR CHART */}
                  <div style={{ backgroundColor: "#0F172A", padding: "14px 16px", borderRadius: "12px", border: "1px solid #1E293B", color: "#FFFFFF" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #334155", paddingBottom: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: "#F59E0B", fontFamily: "monospace", textTransform: "uppercase" }}>
                        📊 GRÁFICO DE BARRAS: CASCATA DE DIVIDENDOS DIRETOS AO INVESTIDOR (10% DOS LUCROS)
                      </span>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "9px", backgroundColor: "#D97706", color: "#FFFFFF", padding: "3px 10px", borderRadius: "4px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                          Payback: 900.000 MT
                        </span>
                        <span style={{ fontSize: "9px", backgroundColor: "#059669", color: "#FFFFFF", padding: "3px 10px", borderRadius: "4px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                          PAYBACK NO MÊS 14
                        </span>
                      </div>
                    </div>

                    <div style={{ backgroundColor: "#1E293B", padding: "14px 16px", borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "110px", paddingTop: "6px" }}>
                        <div style={{ textAlign: "center", width: "120px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "bold", color: "#F59E0B", display: "block", marginBottom: "4px", whiteSpace: "nowrap" }}>373.400 MT</span>
                          <div style={{ width: "100%", height: "35px", backgroundColor: "#D97706", borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", marginTop: "6px", fontFamily: "monospace", whiteSpace: "nowrap" }}>Ano 1 (2026)</span>
                        </div>

                        <div style={{ textAlign: "center", width: "120px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "bold", color: "#34D399", display: "block", marginBottom: "4px", whiteSpace: "nowrap" }}>1.050.000 MT</span>
                          <div style={{ width: "100%", height: "65px", backgroundColor: "#10B981", borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: "9px", color: "#34D399", fontWeight: "bold", display: "block", marginTop: "6px", fontFamily: "monospace", whiteSpace: "nowrap" }}>Ano 2 (2027) ★ Payback</span>
                        </div>

                        <div style={{ textAlign: "center", width: "120px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "bold", color: "#6EE7B7", display: "block", marginBottom: "4px", whiteSpace: "nowrap" }}>2.100.000 MT</span>
                          <div style={{ width: "100%", height: "95px", backgroundColor: "#059669", borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: "9px", color: "#CBD5E1", display: "block", marginTop: "6px", fontFamily: "monospace", whiteSpace: "nowrap" }}>Ano 3 (2028)</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "10px", fontFamily: "monospace" }}>
                      <span style={{ whiteSpace: "nowrap" }}>Total Dividendos 3 Anos: <strong style={{ color: "#34D399" }}>3.523.400 MZN</strong></span>
                      <span style={{ backgroundColor: "#065F46", color: "#A7F3D0", padding: "3px 10px", borderRadius: "4px", fontWeight: "bold", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        Retorno 391% s/ Aporte
                      </span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "10px", color: "#334155", lineHeight: "1.4" }}>
                    💡 <strong>Métrica de Payback:</strong> No Mês 14 (Ano 2), os dividendos acumulados atinge <strong>1.423.400 Meticais</strong>, superando em <strong>158% o investimento inicial de 900.000 MT</strong>.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#64748B", fontFamily: "monospace", borderTop: "1px solid #E2E8F0", paddingTop: "8px" }}>
                <span>TARIRA Ecosystem Services Lda. • Resumo Custo-Benefício 2026</span>
                <span>Página 4 de 6</span>
              </div>
            </div>

            {/* SLIDE 5 OF 6: VALUATION DE EQUITY & MULTIPLICADOR MOIC */}
            <div
              className="pdf-slide-block"
              style={{
                width: "1000px",
                height: "707px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "32px 36px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontFamily: "sans-serif",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#D97706", fontFamily: "Georgia, serif" }}>TARIRA Ecosystem Services Lda.</span>
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>Resumo Executivo • Página 5 de 6</span>
                </div>

                <h2 style={{ fontSize: "19px", fontWeight: "bold", color: "#0F172A", fontFamily: "Georgia, serif", margin: "0 0 12px 0", borderLeft: "4px solid #D97706", paddingLeft: "10px" }}>
                  4. Longo Prazo, Equity Value & Multiplicador MOIC (Gráfico de Valorização)
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* SVG VALUATION GROWTH BAR CHART */}
                  <div style={{ backgroundColor: "#064E3B", padding: "14px 16px", borderRadius: "12px", border: "1px solid #047857", color: "#FFFFFF" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #065F46", paddingBottom: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: "#A7F3D0", fontFamily: "monospace", textTransform: "uppercase" }}>
                        📊 GRÁFICO DE BARRAS: ESCALA DE VALORIZAÇÃO DE EQUITY (VALUATION POST-MONEY)
                      </span>
                      <span style={{ fontSize: "9px", backgroundColor: "#059669", color: "#FFFFFF", padding: "3px 10px", borderRadius: "4px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        11.1x - 13.3x VALORIZAÇÃO
                      </span>
                    </div>

                    <div style={{ backgroundColor: "#022C22", padding: "12px 16px", borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "100px" }}>
                        <div style={{ textAlign: "center", width: "100px" }}>
                          <span style={{ fontSize: "9px", fontWeight: "bold", color: "#F59E0B", display: "block", marginBottom: "4px", whiteSpace: "nowrap" }}>9M MT</span>
                          <div style={{ width: "100%", height: "20px", backgroundColor: "#D97706", borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: "8.5px", color: "#94A3B8", display: "block", marginTop: "6px", fontFamily: "monospace", whiteSpace: "nowrap" }}>Seed (2026)</span>
                        </div>

                        <div style={{ textAlign: "center", width: "100px" }}>
                          <span style={{ fontSize: "9px", fontWeight: "bold", color: "#6EE7B7", display: "block", marginBottom: "4px", whiteSpace: "nowrap" }}>25M MT</span>
                          <div style={{ width: "100%", height: "40px", backgroundColor: "#10B981", borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: "8.5px", color: "#94A3B8", display: "block", marginTop: "6px", fontFamily: "monospace", whiteSpace: "nowrap" }}>Ano 1 (2026)</span>
                        </div>

                        <div style={{ textAlign: "center", width: "100px" }}>
                          <span style={{ fontSize: "9px", fontWeight: "bold", color: "#A7F3D0", display: "block", marginBottom: "4px", whiteSpace: "nowrap" }}>60M MT</span>
                          <div style={{ width: "100%", height: "65px", backgroundColor: "#059669", borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: "8.5px", color: "#CBD5E1", display: "block", marginTop: "6px", fontFamily: "monospace", whiteSpace: "nowrap" }}>Ano 2 (2027)</span>
                        </div>

                        <div style={{ textAlign: "center", width: "100px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "black", color: "#34D399", display: "block", marginBottom: "4px", whiteSpace: "nowrap" }}>110M MT</span>
                          <div style={{ width: "100%", height: "90px", backgroundColor: "#34D399", borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: "8.5px", color: "#34D399", fontWeight: "bold", display: "block", marginTop: "6px", fontFamily: "monospace", whiteSpace: "nowrap" }}>Ano 3 (2028)</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "9.5px", fontFamily: "monospace" }}>
                      <span style={{ whiteSpace: "nowrap" }}>10% Quota Investidor (Seed): <strong style={{ color: "#F59E0B" }}>900.000 MT</strong></span>
                      <span style={{ whiteSpace: "nowrap" }}>10% Quota Investidor (Ano 3): <strong style={{ color: "#34D399" }}>11.000.000 MT</strong></span>
                    </div>
                  </div>

                  {/* MOIC METER */}
                  <div style={{ backgroundColor: "#FEF3C7", padding: "12px 14px", borderRadius: "10px", border: "1px solid #FDE68A", fontFamily: "monospace" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#92400E", display: "block", textTransform: "uppercase", marginBottom: "6px" }}>
                      🚀 MULTIPLICADOR DE CAPITAL TOTAL (MOIC DIVIDENDOS + EQUITY VALUE)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", textAlign: "center", fontSize: "11px" }}>
                      <div style={{ backgroundColor: "#FFFFFF", padding: "8px 10px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                        <span style={{ fontSize: "8px", color: "#64748B", display: "block", whiteSpace: "nowrap" }}>DIVIDENDOS 3 ANOS</span>
                        <span style={{ fontWeight: "bold", color: "#0F172A", whiteSpace: "nowrap" }}>3.523.400 MT</span>
                      </div>
                      <div style={{ backgroundColor: "#FFFFFF", padding: "8px 10px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                        <span style={{ fontSize: "8px", color: "#64748B", display: "block", whiteSpace: "nowrap" }}>EQUITY VALUE (ANO 3)</span>
                        <span style={{ fontWeight: "bold", color: "#047857", whiteSpace: "nowrap" }}>10M - 12M MT</span>
                      </div>
                      <div style={{ backgroundColor: "#D97706", color: "#FFFFFF", padding: "8px 10px", borderRadius: "6px", fontWeight: "bold", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "8px", display: "block", opacity: 0.95, lineHeight: "1.2", whiteSpace: "nowrap" }}>RETORNO MOIC TOTAL</span>
                        <span style={{ fontSize: "13px", fontWeight: "900", lineHeight: "1.2", whiteSpace: "nowrap" }}>15.0x a 17.2x</span>
                      </div>
                    </div>
                  </div>

                  {/* GOVERNANCE */}
                  <div style={{ backgroundColor: "#0F172A", color: "#FFFFFF", padding: "12px 14px", borderRadius: "10px", fontSize: "10px", fontFamily: "monospace" }}>
                    <span style={{ color: "#F59E0B", fontWeight: "bold", display: "block", textTransform: "uppercase", marginBottom: "6px" }}>
                      🤝 DIRECTRIZES DE GOVERNAÇÃO & PROTEÇÃO DE CAPITAL
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", textAlign: "center", fontSize: "9.5px" }}>
                      <div style={{ backgroundColor: "#1E293B", padding: "6px 8px", borderRadius: "6px", border: "1px solid #334155", whiteSpace: "nowrap" }}>• Assento em Conselho</div>
                      <div style={{ backgroundColor: "#1E293B", padding: "6px 8px", borderRadius: "6px", border: "1px solid #334155", whiteSpace: "nowrap" }}>• Dashboard Tempo Real</div>
                      <div style={{ backgroundColor: "#1E293B", padding: "6px 8px", borderRadius: "6px", border: "1px solid #334155", whiteSpace: "nowrap" }}>• Tag-Along Garantido</div>
                      <div style={{ backgroundColor: "#1E293B", padding: "6px 8px", borderRadius: "6px", border: "1px solid #334155", whiteSpace: "nowrap" }}>• Novos Sócios (1-2 B2B)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#64748B", fontFamily: "monospace", borderTop: "1px solid #E2E8F0", paddingTop: "8px" }}>
                <span>TARIRA Ecosystem Services Lda. • Resumo Custo-Benefício 2026</span>
                <span>Página 5 de 6</span>
              </div>
            </div>

            {/* SLIDE 6 OF 6: RESUMO EXPLICATIVO DOS INDICADORES CHAVE & ASSINATURA */}
            <div
              className="pdf-slide-block"
              style={{
                width: "1000px",
                height: "707px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "32px 36px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontFamily: "sans-serif",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#D97706", fontFamily: "Georgia, serif" }}>TARIRA Ecosystem Services Lda.</span>
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>Resumo Executivo • Página 6 de 6</span>
                </div>

                <div style={{ borderBottom: "2px solid #D97706", paddingBottom: "6px", marginBottom: "10px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: "#0F172A", color: "#F59E0B", padding: "4px 12px", borderRadius: "10px", fontSize: "9px", fontFamily: "monospace", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px", lineHeight: "1.2", whiteSpace: "nowrap" }}>
                    📄 PÁGINA FINAL • GUIA EXPLICATIVO DE INDICADORES
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", margin: 0 }}>
                    5. Resumo Explicativo dos Indicadores Chave de Custos, Benefícios & Retornos
                  </h2>
                  <p style={{ fontSize: "10px", color: "#475569", fontWeight: "600", margin: "2px 0 0 0" }}>
                    Síntese explicativa dos rácios operacionais, estrutura de custos, geração de receitas e salvaguardas para o sócio investidor.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "10px" }}>
                  {/* Card 1: Indicadores de Custo */}
                  <div style={{ backgroundColor: "#0F172A", color: "#FFFFFF", padding: "12px 14px", borderRadius: "10px", border: "1px solid #1E293B" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1E293B", paddingBottom: "6px", marginBottom: "8px" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#F59E0B", fontSize: "10px", textTransform: "uppercase" }}>
                        📊 1. Indicadores Chave de Custo
                      </span>
                      <span style={{ fontSize: "8px", backgroundColor: "#D97706", color: "#FFFFFF", padding: "3px 10px", borderRadius: "4px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        ESTRUTURA ENXUTA
                      </span>
                    </div>
                    <ul style={{ paddingLeft: "12px", margin: 0, lineHeight: "1.45", fontSize: "9.5px", color: "#CBD5E1" }}>
                      <li><strong>• Folha Go Live:</strong> 119.000 MT/mês cobrindo CEO Vicente Dias, 1 RH (25.000 MT), 3 Supervisores (58.000 MT) e Angariadores.</li>
                      <li><strong>• Hub Sede Maputo:</strong> 22.500 MT/mês ativado na 2ª Fase (Custo Zero na 1ª Fase 100% Cloud).</li>
                      <li><strong>• Infraestrutura Tech:</strong> 130.000 MT Laptops + 15.000 MT/ano Hostinger.com (1.250 MT/mês).</li>
                      <li><strong>• Diluição por Técnico:</strong> ~340 MZN/mês de custo fixo por técnico ativo para 350 profissionais.</li>
                    </ul>
                  </div>

                  {/* Card 2: Indicadores de Benefício e Faturamento */}
                  <div style={{ backgroundColor: "#064E3B", color: "#FFFFFF", padding: "12px 14px", borderRadius: "10px", border: "1px solid #047857" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #065F46", paddingBottom: "6px", marginBottom: "8px" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#34D399", fontSize: "10px", textTransform: "uppercase" }}>
                        💰 2. Indicadores Chave de Benefício
                      </span>
                      <span style={{ fontSize: "8px", backgroundColor: "#059669", color: "#FFFFFF", padding: "3px 10px", borderRadius: "4px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        EBITDA 36,8%
                      </span>
                    </div>
                    <ul style={{ paddingLeft: "12px", margin: 0, lineHeight: "1.45", fontSize: "9.5px", color: "#E2E8F0" }}>
                      <li><strong>• Faturamento Bruto (Ano 1):</strong> 18.500.000 MT combinando as 5 Unidades (Connect, Recruit, Business, Consulting e Studio).</li>
                      <li><strong>• EBITDA Operacional:</strong> 6.800.000 MT com alta retenção de caixa derivada do modelo digital híbrido.</li>
                      <li><strong>• Lucro Líquido Projetado:</strong> 3.734.000 MT livres para distribuição de dividendos.</li>
                      <li><strong>• Tração B2B Recorrente:</strong> Escala de 15 empresas (Ano 1) ➔ 42 (Ano 2) ➔ 95 empresas (Ano 3).</li>
                    </ul>
                  </div>

                  {/* Card 3: Indicadores de Retorno ao Acionista */}
                  <div style={{ backgroundColor: "#FEF3C7", color: "#0F172A", padding: "12px 14px", borderRadius: "10px", border: "1px solid #FDE68A" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #FDE68A", paddingBottom: "6px", marginBottom: "8px" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#78350F", fontSize: "10px", textTransform: "uppercase" }}>
                        🚀 3. Retorno do Sócio Investidor
                      </span>
                      <span style={{ fontSize: "8px", backgroundColor: "#D97706", color: "#FFFFFF", padding: "3px 10px", borderRadius: "4px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        15.0x - 17.2x MOIC
                      </span>
                    </div>
                    <ul style={{ paddingLeft: "12px", margin: 0, lineHeight: "1.45", fontSize: "9.5px", color: "#451A03" }}>
                      <li><strong>• Aporte Seed & Equity:</strong> 900.000 MT por 10% Quota (90.000 MT afetos ao Capital Social Legal).</li>
                      <li><strong>• Dividendos em 3 Anos:</strong> 373.400 MT (Ano 1) ➔ 1.050.000 MT (Ano 2) ➔ 2.100.000 MT (Ano 3) = <strong>3.523.400 MT</strong>.</li>
                      <li><strong>• Payback & Break-Even:</strong> Payback no Mês 14 (158% de retorno no Ano 2) | Break-Even Mês 7.</li>
                      <li><strong>• Valuation de Equity:</strong> De 9M MT para 100M-120M MT no Ano 3 (10% de Quota passa a valer 10M a 12M MT).</li>
                    </ul>
                  </div>

                  {/* Card 4: Salvaguardas & Governação */}
                  <div style={{ backgroundColor: "#F8FAFC", color: "#0F172A", padding: "12px 14px", borderRadius: "10px", border: "1px solid #CBD5E1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "6px", marginBottom: "8px" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#0F172A", fontSize: "10px", textTransform: "uppercase" }}>
                        🛡️ 4. Governação & Salvaguardas
                      </span>
                      <span style={{ fontSize: "8px", backgroundColor: "#0F172A", color: "#FFFFFF", padding: "3px 10px", borderRadius: "4px", fontWeight: "bold", fontFamily: "monospace", lineHeight: "1.2", whiteSpace: "nowrap", display: "inline-block" }}>
                        PROTEÇÃO 100%
                      </span>
                    </div>
                    <ul style={{ paddingLeft: "12px", margin: 0, lineHeight: "1.45", fontSize: "9.5px", color: "#334155" }}>
                      <li><strong>• Assento em Conselho:</strong> Direito a voto nas decisões estratégicas e expansão.</li>
                      <li><strong>• Auditoria Tempo Real:</strong> Acesso direto e transparente ao dashboard financeiro.</li>
                      <li><strong>• Cláusula Tag-Along:</strong> Proteção de 100% das quotas em caso de aquisição ou entrada de novos sócios.</li>
                      <li><strong>• Reserva de Liquidez:</strong> Fundo de maneio de 380.000 MT retido na 3ª Fase para imprevistos.</li>
                    </ul>
                  </div>
                </div>

                {/* SIGNATURE BLOCK FOR FORMAL AGREEMENT */}
                <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: "bold", color: "#B45309", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "4px" }}>
                    ✍️ TERMOS DE ALINHAMENTO E CONCORDÂNCIA DAS PARTES PROPONENTES
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "9px" }}>
                    <div>
                      <span style={{ color: "#64748B", display: "block" }}>Pela TARIRA Ecosystem Services Lda.:</span>
                      <div style={{ borderBottom: "1px solid #94A3B8", height: "18px", marginBottom: "4px" }}></div>
                      <strong style={{ color: "#0F172A", display: "block" }}>Vicente Dias</strong>
                      <span style={{ color: "#64748B" }}>CEO & Founder • TARIRA Ecosystem Services Lda.</span>
                    </div>
                    <div>
                      <span style={{ color: "#64748B", display: "block" }}>Pelo Investidor Proponente:</span>
                      <div style={{ borderBottom: "1px solid #94A3B8", height: "18px", marginBottom: "4px" }}></div>
                      <strong style={{ color: "#0F172A", display: "block" }}>Investidor Proponente (Sócio Estratégico)</strong>
                      <span style={{ color: "#64748B" }}>Subscrição Seed de 10% do Capital Social (900.000 MZN)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#64748B", fontFamily: "monospace", borderTop: "1px solid #E2E8F0", paddingTop: "8px" }}>
                <span>TARIRA Ecosystem Services Lda. • Resumo Custo-Benefício 2026</span>
                <span>Página 6 de 6</span>
              </div>
            </div>
          </div>
        ) : activeDocument === "pitch_deck" ? (
          <div>
            {/* PAGE 1: COVER SLIDE */}
            <div
              className="pdf-slide-block"
              style={{
                width: "1000px",
                height: "707px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "36px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontFamily: "sans-serif",
              }}
            >
              <div>
                {/* Seal & Logo Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg viewBox="0 0 102 60" style={{ width: "40px", height: "24px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="41" cy="30" rx="20" ry="14" stroke="#2563EB" strokeWidth="6" fill="none" />
                      <ellipse cx="61" cy="30" rx="20" ry="14" stroke="#101E34" strokeWidth="6" fill="none" />
                      <path d="M 41 16 A 20 14 0 0 1 61 30" stroke="#2563EB" strokeWidth="6" fill="none" strokeLinecap="round" />
                    </svg>
                    <div>
                      <span style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "Georgia, serif", letterSpacing: "2px", color: "#1E3A8A" }}>TARIRA</span>
                      <span style={{ fontSize: "10px", color: "#64748B", display: "block", fontFamily: "monospace" }}>TARIRA Ecosystem Services Lda.</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: "bold", color: "#1E3A8A" }}>Supervisionamos. Para que não precise.</span>
                    <span style={{ fontSize: "8px", color: "#64748B", display: "block", letterSpacing: "1px", textTransform: "uppercase" }}>WE OVERSEE. SO YOU DON'T HAVE TO.</span>
                  </div>
                </div>

                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <h1 style={{ fontSize: "36px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", margin: "0 0 6px 0" }}>
                    TARIRA
                  </h1>
                  <p style={{ fontSize: "11px", fontWeight: "bold", color: "#1E3A8A", fontFamily: "monospace", margin: "0 0 10px 0" }}>
                    Plano de Negócios Executivo & Pitch Deck Oficial 2026/2029
                  </p>
                  <div style={{ padding: "10px 16px", backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "12px", margin: "12px auto", maxWidth: "800px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "bold", fontStyle: "italic", fontFamily: "Georgia, serif", color: "#92400E", margin: 0 }}>
                      “A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”
                    </p>
                  </div>
                  <p style={{ fontSize: "11px", color: "#334155", margin: "8px 0" }}>
                    Conectando Talentos e Oportunidades • Ecossistema de Serviços de Moçambique
                  </p>
                </div>

                {/* Deal Metrics Card */}
                <div style={{ backgroundColor: "#F8FAFC", padding: "16px 20px", borderRadius: "12px", border: "1px solid #E2E8F0", marginTop: "16px", fontSize: "11px", lineHeight: "1.6", color: "#1E293B" }}>
                  <strong style={{ color: "#B45309", display: "block", marginBottom: "4px", textTransform: "uppercase", fontFamily: "monospace" }}>
                    PLANO DE NEGÓCIOS EXECUTIVO & PITCH DECK DE INVESTIMENTO SEED
                  </strong>
                  • Aporte Requerido: 900.000 Meticais em troca de 10% do Capital Social<br />
                  • Valuation Post-Money: 9.000.000 Meticais | Pre-Money: 8.100.000 Meticais<br />
                  • EBITDA Projetado (Ano 1): 6.800.000 Meticais (Margem EBITDA de 36,8%) | Payback: 14 Meses<br />
                  • CEO & Founder (Angariador Comercial): Vicente Dias (+10 Anos de Experiência)
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "9px", fontFamily: "monospace", color: "#64748B", borderTop: "1px solid #E2E8F0", paddingTop: "8px" }}>
                <span>TARIRA ECOSSISTEMA LDA. • MAPUTO, MOÇAMBIQUE</span>
                <span>CAPA DO DOCUMENTO DE INVESTIMENTO</span>
              </div>
            </div>

            {/* SLIDES 1 THROUGH 10 */}
            {pitchSlides.map((slide) => (
              <div
                key={slide.num}
                className="pdf-slide-block"
                style={{
                  width: "1000px",
                  height: "707px",
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  padding: "32px 36px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  fontFamily: "sans-serif",
                }}
              >
                <div>
                  {/* Header Seal */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg viewBox="0 0 102 60" style={{ width: "32px", height: "18px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="41" cy="30" rx="20" ry="14" stroke="#2563EB" strokeWidth="6" fill="none" />
                        <ellipse cx="61" cy="30" rx="20" ry="14" stroke="#101E34" strokeWidth="6" fill="none" />
                        <path d="M 41 16 A 20 14 0 0 1 61 30" stroke="#2563EB" strokeWidth="6" fill="none" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: "12px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#1E3A8A" }}>
                        TARIRA Ecosystem Services Lda. • Maputo, Moçambique (2026)
                      </span>
                    </div>
                    <span style={{ fontSize: "9px", fontFamily: "Georgia, serif", fontStyle: "italic", color: "#64748B" }}>
                      Supervisionamos. Para que não precise.
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ padding: "4px 10px", backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", borderRadius: "20px", fontSize: "10px", fontWeight: "bold", fontFamily: "monospace", textTransform: "uppercase" }}>
                      SLIDE {slide.num} DE 10 • {slide.tag}
                    </span>
                    {slide.num === 1 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", backgroundColor: "#FEF3C7", borderRadius: "8px", border: "1px solid #FDE68A" }}>
                        <svg viewBox="0 0 102 60" style={{ width: "28px", height: "16px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                          <ellipse cx="41" cy="30" rx="20" ry="14" stroke="#2563EB" strokeWidth="6" fill="none" />
                          <ellipse cx="61" cy="30" rx="20" ry="14" stroke="#101E34" strokeWidth="6" fill="none" />
                          <path d="M 41 16 A 20 14 0 0 1 61 30" stroke="#2563EB" strokeWidth="6" fill="none" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontSize: "10px", fontWeight: "bold", color: "#1E3A8A", fontFamily: "Georgia, serif", letterSpacing: "1px" }}>TARIRA LOGO</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: "24px" }}>{slide.icon}</span>
                    )}
                  </div>

                  <h2 style={{ fontSize: "22px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", margin: "0 0 4px 0" }}>
                    {slide.title}
                  </h2>
                  <p style={{ fontSize: "11px", color: "#334155", fontWeight: "600", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", margin: "0 0 12px 0" }}>
                    {slide.subtitle}
                  </p>

                  {(slide.num === 1 || slide.num === 3) && (
                    <div style={{ padding: "8px 12px", backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "10px", marginBottom: "10px", textAlign: "center" }}>
                      <p style={{ fontSize: "11px", fontWeight: "bold", fontStyle: "italic", fontFamily: "Georgia, serif", color: "#92400E", margin: 0 }}>
                        “A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”
                      </p>
                    </div>
                  )}

                  {slide.problems ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
                      {slide.problems.map((p, idx) => (
                        <div key={idx} style={{ padding: "10px 12px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <span style={{ fontSize: "18px", fontWeight: "bold", fontFamily: "monospace", color: "#92400E" }}>{p.metric}</span>
                            <span style={{ fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", textTransform: "uppercase", padding: "2px 6px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "12px", color: "#475569" }}>
                              {p.badge}
                            </span>
                          </div>
                          <div>
                            <strong style={{ fontSize: "11px", color: "#0F172A", display: "block" }}>{p.label}</strong>
                            <p style={{ fontSize: "9.5px", color: "#475569", margin: "2px 0 0 0", lineHeight: "1.3" }}>{p.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {slide.bullets.map((b, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", backgroundColor: "#F8FAFC", padding: "8px 12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D97706", marginTop: "6px", flexShrink: 0 }} />
                          <p style={{ fontSize: "11px", color: "#1E293B", margin: 0, lineHeight: "1.4" }}>{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "9px", fontFamily: "monospace", color: "#64748B", borderTop: "1px solid #E2E8F0", paddingTop: "8px" }}>
                  <span>TARIRA ECOSSISTEMA LDA. • PROPOSTA SEED MAPUTO</span>
                  <span>SLIDE {slide.num} DE 10</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* BUSINESS PLAN MULTI-PAGE PDF */
          <div>
            {/* PAGE 1: COVER HEADER & SUMMARY */}
            <div
              className="pdf-page-block"
              style={{
                width: "800px",
                minHeight: "1130px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "40px",
                boxSizing: "border-box",
                fontFamily: "sans-serif",
              }}
            >
              {/* Inline Brand Header for PDF rendering */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px", paddingBottom: "16px", borderBottom: "1px solid #E2E8F0", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <svg viewBox="0 0 102 60" style={{ width: "64px", height: "40px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="41" cy="30" rx="20" ry="14" stroke="#2563EB" strokeWidth="6" fill="none" />
                    <ellipse cx="61" cy="30" rx="20" ry="14" stroke="#101E34" strokeWidth="6" fill="none" />
                    <path d="M 41 16 A 20 14 0 0 1 61 30" stroke="#2563EB" strokeWidth="6" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h1 style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "28px", letterSpacing: "4px", color: "#0F172A", margin: "0 0 2px 0" }}>
                    TARIRA
                  </h1>
                  <p style={{ fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "bold", color: "#334155", margin: 0 }}>
                    TARIRA Ecosystem Services Lda.
                  </p>
                </div>
                <div style={{ width: "144px", height: "1px", backgroundColor: "#CBD5E1", margin: "4px 0" }} />
                <div>
                  <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: "bold", fontSize: "13px", color: "#1E3A8A", margin: "0 0 2px 0" }}>
                    Supervisionamos. Para que não precise.
                  </p>
                  <p style={{ fontFamily: "sans-serif", fontWeight: "600", fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "#64748B", margin: 0 }}>
                    WE OVERSEE. SO YOU DON'T HAVE TO.
                  </p>
                </div>
                <div style={{ marginTop: "6px", padding: "8px 16px", backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "12px", maxWidth: "560px" }}>
                  <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: "800", fontSize: "12px", color: "#78350F", margin: 0 }}>
                    “A confiança que normalmente demora semanas a construir — a TARIRA já tem pronta.”
                  </p>
                </div>
                <p style={{ fontSize: "11px", fontWeight: "500", color: "#475569", margin: "4px 0 0 0" }}>
                  Conectando Talentos e Oportunidades • Ecossistema de Serviços de Moçambique
                </p>
              </div>

              <div style={{ borderBottom: "4px solid #D97706", paddingBottom: "16px", marginTop: "20px" }}>
                <span style={{ backgroundColor: "#0F172A", color: "#F59E0B", padding: "4px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold", fontFamily: "monospace" }}>
                  🏛️ PLANO DE NEGÓCIOS EXECUTIVO • EDIÇÃO 2026/2029
                </span>
                <h1 style={{ fontSize: "24px", fontWeight: "900", fontFamily: "Georgia, serif", color: "#0F172A", margin: "10px 0 6px 0" }}>
                  Plano de Negócios & Proposta de Financiamento Seed
                </h1>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#475569", margin: 0 }}>
                  Modelo Híbrido (70% Plataforma Digital / 30% Espaço Físico) de Gestão de Mão-de-Obra, Terceirização B2B e Recrutamento
                </p>
              </div>

              <div style={{ marginTop: "24px", padding: "20px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", margin: "0 0 10px 0" }}>
                  Resumo Executivo do Investimento
                </h3>
                <p style={{ fontSize: "11px", lineHeight: "1.6", color: "#334155" }}>
                  A <strong>TARIRA Ecosystem Services Lda.</strong> é uma empresa moçambicana criada para estruturar e automatizar o mercado de contratação de serviços técnicos, recrutamento de pessoal e terceirização de mão-de-obra corporativa em Moçambique.
                </p>
                <ul style={{ fontSize: "11px", lineHeight: "1.6", color: "#334155", paddingLeft: "20px", margin: "10px 0 0 0" }}>
                  <li><strong>Proposta Seed:</strong> Requerimento de 900.000 Meticais em troca de 10% do Capital Social.</li>
                  <li><strong>Valuation Post-Money:</strong> 9.000.000 Meticais (Pre-Money: 8.100.000 Meticais).</li>
                  <li><strong>EBITDA Projetado (Ano 1):</strong> 6.800.000 Meticais com Margem EBITDA de 36,8%.</li>
                  <li><strong>Liderança & Fundador:</strong> Vicente Dias, Coordenador Operacional com +10 Anos de experiência.</li>
                </ul>
              </div>
            </div>

            {/* PAGE 2: SECTIONS 1 & 2 */}
            <div
              className="pdf-page-block"
              style={{
                width: "800px",
                minHeight: "1130px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "40px",
                boxSizing: "border-box",
                fontFamily: "sans-serif",
              }}
            >
              <div style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>
                <span>TARIRA ECOSSISTEMA LDA. • PLANO DE NEGÓCIOS</span>
                <span>PÁGINA 2 DE 5</span>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", borderLeft: "4px solid #D97706", paddingLeft: "10px", margin: "0 0 10px 0" }}>
                  1. Definicão da TARIRA Ecosystem Services Lda. & Modelo Híbrido
                </h2>
                <p style={{ fontSize: "11px", lineHeight: "1.6", color: "#334155" }}>
                  A TARIRA é uma plataforma unificada que conecta prestadores de serviços, candidatos e empresas através de 5 pilares operacionais: TARIRA Connect (ofícios técnicos), TARIRA Recruit (recrutamento ATS), TARIRA Business (terceirização B2B), TARIRA Consulting (back-office) e TARIRA Studio (Micro-SaaS & Vitrine 'Axofacil').
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                  <div style={{ padding: "12px", backgroundColor: "#0F172A", color: "#FFFFFF", borderRadius: "12px" }}>
                    <strong style={{ color: "#F59E0B", fontSize: "11px" }}>70% DIGITAL:</strong>
                    <p style={{ fontSize: "10px", color: "#CBD5E1", margin: "4px 0 0 0", lineHeight: "1.4" }}>
                      Matchmaking algorítmico, agendamentos, triagem cognoscitiva ATS, gestão salarial e relatórios B2B por aplicativo/web.
                    </p>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: "12px" }}>
                    <strong style={{ color: "#0F172A", fontSize: "11px" }}>30% PRESENCIAL:</strong>
                    <p style={{ fontSize: "10px", color: "#475569", margin: "4px 0 0 0", lineHeight: "1.4" }}>
                      Hub Físico para recepção, entrevistas, verificação de bagagem técnica/ferramental e testes práticos.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", borderLeft: "4px solid #D97706", paddingLeft: "10px", margin: "0 0 10px 0" }}>
                  2. Origem, Razão de Criação & Justificativa do Ecossistema
                </h2>
                <div style={{ padding: "16px", backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "12px", fontSize: "11px", lineHeight: "1.6", color: "#78350F" }}>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>Análise da Informalidade:</strong> Cerca de 85% a 90% dos serviços em Moçambique ocorrem de forma informal ("boca-a-boca"), gerando atrasos, incerteza e ausência de garantias.
                  </p>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>Solução Tecnológica Agilizada:</strong> A TARIRA une tecnologia com agilidade para permitir que condomínios, residências e empresas contratem prestadores e profissionais qualificados com rastreabilidade total.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Visão do Fundador (Vicente Dias):</strong> Criada por Vicente Dias com base em mais de 10 anos de experiência real como Coordenador Operacional na gestão de modelos terceirizados complexos.
                  </p>
                </div>
              </div>
            </div>

            {/* PAGE 3: SECTIONS 3 & 4 */}
            <div
              className="pdf-page-block"
              style={{
                width: "800px",
                minHeight: "1130px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "40px",
                boxSizing: "border-box",
                fontFamily: "sans-serif",
              }}
            >
              <div style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>
                <span>TARIRA ECOSSISTEMA LDA. • PLANO DE NEGÓCIOS</span>
                <span>PÁGINA 3 DE 5</span>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", borderLeft: "4px solid #D97706", paddingLeft: "10px", margin: "0 0 12px 0" }}>
                  3. Estrutura Operacional dos 5 Pilares & Modelos B2B
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ padding: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                    <strong style={{ fontSize: "11px", color: "#0F172A", textTransform: "uppercase" }}>1. TARIRA Connect</strong>
                    <p style={{ fontSize: "10px", color: "#475569", margin: "4px 0" }}>Ofícios técnicos e reparações rápidas. Retenção de 18% a 20% do orçamento.</p>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                    <strong style={{ fontSize: "11px", color: "#0F172A", textTransform: "uppercase" }}>2. TARIRA Recruit</strong>
                    <p style={{ fontSize: "10px", color: "#475569", margin: "4px 0" }}>Seleção e colocação ATS de quadros. Taxa de 35% do 1º salário mensal.</p>
                  </div>
                </div>

                <div style={{ padding: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", marginTop: "12px" }}>
                  <strong style={{ fontSize: "11px", color: "#0F172A", textTransform: "uppercase" }}>3. TARIRA Business (3 Modelos B2B)</strong>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "8px" }}>
                    <div style={{ fontSize: "9px", color: "#334155", padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                      <strong>M1: No Cliente</strong><br />Apenas pessoal qualificado + gestão RH.
                    </div>
                    <div style={{ fontSize: "9px", color: "#334155", padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                      <strong>M2: Operação 3G</strong><br />Pessoal + Espaço físico/infra TARIRA.
                    </div>
                    <div style={{ fontSize: "9px", color: "#334155", padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                      <strong>M3: Metas do Cliente</strong><br />Alocação com gestão direta pelo cliente.
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                  <div style={{ padding: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                    <strong style={{ fontSize: "11px", color: "#0F172A", textTransform: "uppercase" }}>4. TARIRA Consulting</strong>
                    <p style={{ fontSize: "10px", color: "#475569", margin: "4px 0" }}>Consultoria em RH, automação e compliance. Fee sob proposta (70%-80% margem).</p>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                    <strong style={{ fontSize: "11px", color: "#0F172A", textTransform: "uppercase" }}>5. TARIRA Studio (Micro-SaaS)</strong>
                    <p style={{ fontSize: "10px", color: "#475569", margin: "4px 0" }}>Vitrine digital 'Axofacil' e automação para PMEs. Subscrição 3.000-8.000 MT/mês + 2,5%-5% taxas.</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", borderLeft: "4px solid #D97706", paddingLeft: "10px", margin: "0 0 12px 0" }}>
                  4. Valuation, Break-Even, Payback & EBITDA
                </h2>
                <div style={{ padding: "16px", backgroundColor: "#0F172A", color: "#FFFFFF", borderRadius: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center", fontFamily: "monospace" }}>
                    <div style={{ padding: "10px", backgroundColor: "#1E293B", borderRadius: "10px" }}>
                      <span style={{ fontSize: "9px", color: "#94A3B8" }}>VALUATION POST-MONEY</span>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#F59E0B" }}>9.000.000 MT</div>
                    </div>
                    <div style={{ padding: "10px", backgroundColor: "#1E293B", borderRadius: "10px" }}>
                      <span style={{ fontSize: "9px", color: "#94A3B8" }}>EBITDA (ANO 1)</span>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#10B981" }}>6.800.000 MT</div>
                    </div>
                    <div style={{ padding: "10px", backgroundColor: "#1E293B", borderRadius: "10px" }}>
                      <span style={{ fontSize: "9px", color: "#94A3B8" }}>BREAK-EVEN</span>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#10B981" }}>Mês 7</div>
                    </div>
                    <div style={{ padding: "10px", backgroundColor: "#1E293B", borderRadius: "10px" }}>
                      <span style={{ fontSize: "9px", color: "#94A3B8" }}>PAYBACK</span>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#60A5FA" }}>14 Meses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PAGE 4: PROPOSTA SEED & DESTINO DOS RECURSOS */}
            <div
              className="pdf-page-block"
              style={{
                width: "800px",
                minHeight: "1130px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "40px",
                boxSizing: "border-box",
                fontFamily: "sans-serif",
              }}
            >
              <div style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>
                <span>TARIRA ECOSSISTEMA LDA. • PLANO DE NEGÓCIOS</span>
                <span>PÁGINA 4 DE 5</span>
              </div>

              <h2 style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", borderLeft: "4px solid #D97706", paddingLeft: "10px", margin: "0 0 16px 0" }}>
                5. Proposta de Investimento Seed (Investidor Proponente & Vicente Dias)
              </h2>

              <div style={{ padding: "20px", backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "11px", marginBottom: "16px" }}>
                  <div><strong>Investidor Proponente:</strong> Investidor Estratégico (Proposta Inicial Seed)</div>
                  <div><strong>Empresa:</strong> TARIRA Ecosystem Services Lda. (CEO & Founder: Vicente Dias)</div>
                </div>
                <div style={{ backgroundColor: "#FFFFFF", padding: "12px", borderRadius: "12px", border: "1px solid #F59E0B", fontSize: "11px", fontFamily: "monospace", color: "#78350F" }}>
                  <strong style={{ color: "#B45309", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    • Aporte Financeiro: 900.000 Meticais por 10% de Quota Social (Valuation Post-Money: 9.000.000 MZN)
                  </strong>
                  • <strong>Salário do CEO & Founder (Vicente Dias):</strong> Vencimento ativo garantido desde o 1º dia (Fases 1, 2 e 3) pelo envolvimento integral em todos os segmentos.<br />
                  • <strong>Métrica do CEO & Founder no "Go Live":</strong> Ao passar para o "Go Live" (3ª Fase), a avaliação transita para metas por ações operacionais e participação no valor anual dos lucros líquidos.<br />
                  • <strong>Evolução de Pessoal & Espaço Físico:</strong> Sem Assistente de RH nem Supervisores de Campo nas Fases 1 e 2. Na 2ª Fase inicia-se o Espaço Físico / Hub para angariação presencial de prestadores de serviços e clientes. No "Go Live" (3ª Fase), ativam-se os Supervisores de Campo, RH Fixo e a operação completa do Hub.
                </div>

                <h3 style={{ fontSize: "12px", fontWeight: "bold", marginTop: "16px", marginBottom: "8px", color: "#78350F" }}>
                  Análise Custo-Benefício e Destino do Aporte em 3 Fases (900.000 MT):
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "left", fontSize: "9.5px", fontFamily: "monospace" }}>
                  <div style={{ padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #F59E0B" }}>
                    <strong style={{ color: "#B45309" }}>1ª FASE: WEB (105.000 MT)</strong><br />
                    • 90.000 MT Capital Social<br />
                    • 15.000 MT Hostinger.com<br />
                    • Pró-Labore CEO & Founder<br />
                    • ❌ Sem RH / Supervisores / Espaço
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #F59E0B" }}>
                    <strong style={{ color: "#B45309" }}>2ª FASE: MKT B2B (215.000 MT)</strong><br />
                    • 215.000 MT Divulgação B2B (+35.000 MT)<br />
                    • Pró-Labore CEO & Founder<br />
                    • ✅ Angariadores Comerciais & Mkt<br />
                    • ✅ Início Espaço Físico / Hub<br />
                    • ❌ Sem RH / Supervisores
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #F59E0B" }}>
                    <strong style={{ color: "#B45309" }}>3ª FASE: GO LIVE (580.000 MT)</strong><br />
                    • 380.000 MT Hub Maputo (+20.000 MT)<br />
                    • 200.000 MT Equipa & Onboarding (+20.000 MT)<br />
                    • ✅ 1 Assistente RH Fixo<br />
                    • ✅ Supervisores no Terreno
                  </div>
                </div>
              </div>
            </div>

            {/* PAGE 5: TABELA DE CRESCIMENTO 3 ANOS & SIGNOFF */}
            <div
              className="pdf-page-block"
              style={{
                width: "800px",
                minHeight: "1130px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "40px",
                boxSizing: "border-box",
                fontFamily: "sans-serif",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>
                  <span>TARIRA ECOSSISTEMA LDA. • PLANO DE NEGÓCIOS</span>
                  <span>PÁGINA 5 DE 5</span>
                </div>

                <h2 style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "Georgia, serif", color: "#0F172A", borderLeft: "4px solid #D97706", paddingLeft: "10px", margin: "0 0 16px 0" }}>
                  6. Indicadores de Crescimento Operacional, EBITDA & Lucro Líquido (3 Anos)
                </h2>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left", marginBottom: "20px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0F172A", color: "#FFFFFF", fontFamily: "monospace", fontSize: "10px" }}>
                      <th style={{ padding: "8px" }}>Indicador / Ano</th>
                      <th style={{ padding: "8px" }}>Ano 1 (2026)</th>
                      <th style={{ padding: "8px" }}>Ano 2 (2027)</th>
                      <th style={{ padding: "8px" }}>Ano 3 (2028)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "8px", fontWeight: "bold" }}>Serviços Connect</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>3.200 serv.</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>8.500 serv.</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>21.000 serv.</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "8px", fontWeight: "bold" }}>Colocações Recruit</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>120 cand.</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>320 cand.</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>780 cand.</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "8px", fontWeight: "bold" }}>Contratos B2B</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>15 emp.</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>42 emp.</td>
                      <td style={{ padding: "8px", fontFamily: "monospace" }}>95 emp.</td>
                    </tr>
                    <tr style={{ backgroundColor: "#FEF3C7", borderBottom: "1px solid #FCD34D" }}>
                      <td style={{ padding: "8px", fontWeight: "bold", color: "#78350F" }}>Faturamento Bruto</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#78350F" }}>18.500.000 MT</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#78350F" }}>46.800.000 MT</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#78350F" }}>108.000.000 MT</td>
                    </tr>
                    <tr style={{ backgroundColor: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "8px", fontWeight: "bold", color: "#334155" }}>Custos Fixos Escalados</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", color: "#334155" }}>1.820.000 MT</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", color: "#334155" }}>5.880.000 MT (+12 hires)</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", color: "#334155" }}>19.440.000 MT (4 hubs/35 hires)</td>
                    </tr>
                    <tr style={{ backgroundColor: "#EFF6FF", borderBottom: "1px solid #BFDBFE" }}>
                      <td style={{ padding: "8px", fontWeight: "bold", color: "#172554" }}>EBITDA Operacional Ajustado</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#172554" }}>6.800.000 MT (36,8%)</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#172554" }}>13.920.000 MT (29,7%)</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#172554" }}>26.560.000 MT (24,6%)</td>
                    </tr>
                    <tr style={{ backgroundColor: "#ECFDF5", borderBottom: "1px solid #A7F3D0" }}>
                      <td style={{ padding: "8px", fontWeight: "bold", color: "#065F46" }}>Lucro Líquido Projetado</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#065F46" }}>3.734.000 MT</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#065F46" }}>10.500.000 MT</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#065F46" }}>21.000.000 MT</td>
                    </tr>
                    <tr style={{ backgroundColor: "#FEF3C7" }}>
                      <td style={{ padding: "8px", fontWeight: "bold", color: "#92400E" }}>Dividendos Sócio Investidor (10%)</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#92400E" }}>373.400 MZN</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#92400E" }}>1.050.000 MZN</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: "bold", color: "#92400E" }}>2.100.000 MZN</td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ fontSize: "10px", color: "#475569", lineHeight: "1.4", fontStyle: "italic", margin: "10px 0 0 0" }}>
                  💡 <strong>Nota de Escala Operacional:</strong> Os custos fixos expandem-se proporcionalmente com o crescimento do volume de empresas B2B e colocações de técnicos (Ano 2 e 3), incluindo salários de equipas internas de suporte, supervisores de campo, especialistas de recrutamento e despesas de hubs regionais, mantendo margens EBITDA robustas (24,6% a 29,7%).
                </p>
              </div>

              <div style={{ borderTop: "2px solid #0F172A", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", fontFamily: "monospace", color: "#475569" }}>
                <span>TARIRA Ecosystem Services Lda. • Documento de Investimento 2026</span>
                <span>Aprovado por Vicente Dias • Maputo, Moçambique</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal / Minuta de E-mail Personalizada para Paulo / Investidores */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-blue-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-100 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowEmailModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-[#172554] hover:bg-slate-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-700 flex items-center justify-center text-xl font-bold border border-blue-500/40">
                ✉️
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#172554]">Minuta de E-mail — Acompanhamento do Aporte & Plataforma Web</h3>
                <p className="text-xs text-blue-700 font-mono">Envio da Nova Síntese Executiva Custo-Benefício + Solicitação de Feedback até Final de Agosto</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono space-y-1">
                <p className="text-slate-400"><strong className="text-blue-700">Para:</strong> Paulo (e Equipa de Investidores / Acionistas)</p>
                <p className="text-slate-400"><strong className="text-blue-700">Assunto:</strong> Atualização: Síntese Executiva de Custos e Benefícios — TARIRA Ecosystem Services Lda.</p>
                <p className="text-slate-400"><strong className="text-blue-700">Anexo:</strong> TARIRA_Resumo_Executivo_Custo_Beneficio_2026.pdf</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-slate-500 font-sans leading-relaxed space-y-3 overflow-y-auto max-h-[320px]">
                <p>Prezado Paulo,</p>

                <p>
                  Espero que este e-mail o encontre bem.
                </p>

                <p>
                  Submetemos em anexo a nova <strong>Síntese Executiva de Custos e Benefícios</strong> do Ecossistema TARIRA, solicitando a gentileza de <strong>considerar este documento atualizado e desconsiderar a versão enviada anteriormente</strong>.
                </p>

                <p>
                  Aproveitamos esta oportunidade para solicitar que, após a leitura e avaliação por parte da sua equipa, nos possa transmitir o vosso parecer e indicar se existe a necessidade de algum alinhamento adicional ou esclarecimento complementar sobre os números e a estrutura apresentada.
                </p>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-1 text-slate-200">
                  <p className="font-bold text-blue-700 text-[11px] uppercase">
                    📅 Meta de Alinhamento e Fecho com Acionistas (Até Final de Agosto)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tendo em conta o nosso objetivo de concretizar o fecho das parcerias com potenciais investidores e acionistas estratégicos, gostaríamos de reunir todos os feedbacks até ao <strong>final do mês de Agosto</strong>. Estamos totalmente disponíveis para agendar uma reunião presencial ou virtual para prestar quaisquer esclarecimentos necessários.
                  </p>
                </div>

                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1 text-slate-200">
                  <p className="font-bold text-purple-400 text-[11px] uppercase">
                    🚀 Destaque da Unidade Negócio: TARIRA Studio (Micro-SaaS & Vitrine Digital)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Lembramos também que o <strong>TARIRA Studio</strong> (incubadora e geradora de Micro-SaaS e da Vitrine Digital 'Axofacil') constitui uma das nossas 5 Unidades de Negócio ativas e integradas no ecossistema, gerando receitas recorrentes e comissões diretas sobre transações de PMEs. Caso surja qualquer dúvida relativa a esta ou às demais unidades, teremos todo o gosto em detalhar no nosso encontro.
                  </p>
                </div>

                <p>
                  Agradecemos desde já pela atenção e colaboração, ficando a aguardar as suas breves considerações.
                </p>

                <p className="pt-2 border-t border-slate-200">
                  Com os melhores cumprimentos,<br /><br />
                  <strong className="text-[#172554]">Vicente Dias</strong><br />
                  <span className="text-slate-400 text-[11px]">CEO & Founder</span><br />
                  <span className="text-blue-700 font-mono text-[11px]">TARIRA Ecosystem Services Lda. • Maputo, Moçambique</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                {emailCopied ? "✅ Texto copiado para a área de transferência!" : "💡 Clique abaixo para copiar a mensagem"}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const textToCopy = `Assunto: Atualização: Síntese Executiva de Custos e Benefícios — TARIRA Ecosystem Services Lda.

Prezado Paulo,

Espero que este e-mail o encontre bem.

Submetemos em anexo a nova Síntese Executiva de Custos e Benefícios do Ecossistema TARIRA, solicitando a gentileza de considerar este documento atualizado e desconsiderar a versão enviada anteriormente.

Aproveitamos esta oportunidade para solicitar que, após a leitura e avaliação por parte da sua equipa, nos possa transmitir o vosso parecer e indicar se existe a necessidade de algum alinhamento adicional ou esclarecimento complementar sobre os números e a estrutura apresentada.

Tendo em conta o nosso objetivo de concretizar o fecho das parcerias com potenciais investidores e acionistas estratégicos, gostaríamos de reunir todos os feedbacks até ao final do mês de Agosto. Estamos totalmente disponíveis para agendar uma reunião presencial ou virtual para prestar quaisquer esclarecimentos necessários.

Lembramos também que o TARIRA Studio (incubadora e geradora de Micro-SaaS e da Vitrine Digital 'Axofacil') constitui uma das nossas 5 Unidades de Negócio ativas e integradas no ecossistema, gerando receitas recorrentes de subscrição e comissões sobre transações de PMEs. Caso surja qualquer dúvida relativa a esta ou às demais unidades de negócio, teremos todo o gosto em detalhar.

Agradecemos desde já pela atenção e colaboração, ficando a aguardar as suas breves considerações.

Com os melhores cumprimentos,

Vicente Dias
CEO & Founder
TARIRA Ecosystem Services Lda.
Maputo, Moçambique`;
                    navigator.clipboard.writeText(textToCopy);
                    setEmailCopied(true);
                    setTimeout(() => setEmailCopied(false), 3000);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <span>{emailCopied ? "✅ Copiado!" : "📋 Copiar Mensagem Completa"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
