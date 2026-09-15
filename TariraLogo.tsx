import React from 'react';

// High-fidelity Tarira Logo matching the Version C Refined branding guidelines (Selo de Elo Duplo + Nome + Tagline Bilingue)
export function TariraLogo({ 
  className = "", 
  sizeClass = "", 
  withRecruit = false, 
  withSlogan = true,
  size,
  align = "center",
  lightBg = false
}: { 
  className?: string; 
  sizeClass?: string;
  withRecruit?: boolean; 
  withSlogan?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "left" | "center";
  lightBg?: boolean;
}) {
  // Map sizeClass or determine the best size to guarantee perfect ergonomics
  let finalSize: "xs" | "sm" | "md" | "lg" | "xl" = size || "md";
  if (!size && sizeClass) {
    if (sizeClass.includes("text-lg") || sizeClass.includes("text-xl") || sizeClass.includes("text-2xl")) {
      finalSize = "xs";
    } else if (sizeClass.includes("text-3xl") || sizeClass.includes("text-4xl")) {
      finalSize = "sm";
    } else if (sizeClass.includes("text-5xl")) {
      finalSize = "lg";
    } else if (sizeClass.includes("text-7xl") || sizeClass.includes("text-8xl") || sizeClass.includes("text-9xl") || sizeClass.includes("text-[5.5rem]")) {
      finalSize = "xl";
    }
  }

  // Visual variables for the 5 size levels to guarantee perfect ergonomics (with highly visible taglines)
  const configs = {
    xs: {
      iconWidth: "w-[48px] xs:w-[52px] sm:w-[58px]",
      iconHeight: "h-[28px] xs:h-[30px] sm:h-[34px]",
      wordmarkClass: "text-[12.5px] xs:text-[13.5px] sm:text-[15px]",
      letterSpacing: "3px",
      spacing1: "mt-1", // Spacing between icon and wordmark
      spacing2: "mt-1", // Spacing between wordmark and hairline
      spacing3: "mt-0.5", // Spacing between hairline and tagline
      hairlineWidth: "w-14 sm:w-20",
      taglinePT: "text-[7.5px] xs:text-[8.5px] sm:text-[9.5px]",
      taglineEN: "text-[6px] xs:text-[6.5px] sm:text-[7.5px] tracking-[0.12em] xs:tracking-[0.14em] sm:tracking-[0.16em] mt-0.5"
    },
    sm: {
      iconWidth: "w-[64px]",
      iconHeight: "h-[38px]",
      wordmarkClass: "text-[17px]",
      letterSpacing: "4px",
      spacing1: "mt-2",
      spacing2: "mt-2",
      spacing3: "mt-0.5",
      hairlineWidth: "w-18",
      taglinePT: "text-[9.5px]",
      taglineEN: "text-[7.5px] tracking-[0.16em] mt-0.5"
    },
    md: {
      iconWidth: "w-[84px]",
      iconHeight: "h-[49px]",
      wordmarkClass: "text-[21px]",
      letterSpacing: "5px",
      spacing1: "mt-2.5",
      spacing2: "mt-2",
      spacing3: "mt-1",
      hairlineWidth: "w-24",
      taglinePT: "text-[11px]",
      taglineEN: "text-[8.5px] tracking-[0.18em] mt-0.5"
    },
    lg: {
      iconWidth: "w-[120px]",
      iconHeight: "h-[70px]",
      wordmarkClass: "text-[32px]",
      letterSpacing: "5.5px",
      spacing1: "mt-3",
      spacing2: "mt-2.5",
      spacing3: "mt-1",
      hairlineWidth: "w-32",
      taglinePT: "text-[12.5px]",
      taglineEN: "text-[9.5px] tracking-[0.2em] mt-0.5"
    },
    xl: {
      iconWidth: "w-[180px] sm:w-[200px]",
      iconHeight: "h-[105px] sm:h-[117px]",
      wordmarkClass: "text-[52px] sm:text-[60px] md:text-[68px]",
      letterSpacing: "8.5px",
      spacing1: "mt-4 sm:mt-5",
      spacing2: "mt-3 sm:mt-4",
      spacing3: "mt-1.5 sm:mt-2",
      hairlineWidth: "w-36 sm:w-44",
      taglinePT: "text-[13px] sm:text-[15px] md:text-[16px]",
      taglineEN: "text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.22em] mt-1"
    }
  };

  const c = configs[finalSize];
  const isLeft = align === "left";

  const leftColor = lightBg ? "#2563EB" : "#38BDF8";
  const rightColor = lightBg ? "#101E34" : "#60A5FA";
  const wordmarkTextColor = lightBg ? "text-[#101E34]" : "text-white font-bold";
  const ptSloganColor = lightBg ? "text-[#1E3A8A] font-bold" : "text-blue-200 font-bold";
  const enSloganColor = lightBg ? "text-slate-600 font-semibold" : "text-slate-300 font-medium tracking-[0.18em]";
  const hairlineBg = lightBg ? "bg-slate-300" : "bg-blue-400/40";

  return (
    <div className={`flex flex-col ${isLeft ? "items-start text-left" : "items-center text-center justify-center"} shrink-0 ${className}`}>
      {/* 1. Elo Duplo (Double linked ovals/ellipses) Seal - Perfeitamente alinhado na horizontal sem rotação */}
      <div className={`relative flex ${isLeft ? "justify-start" : "justify-center"} items-center transition-transform duration-300 hover:scale-105 shrink-0`}>
        <svg 
          viewBox="0 0 102 60" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`${c.iconWidth} ${c.iconHeight} drop-shadow-md shrink-0 block`}
          aria-label="Tarira Seal Icon"
        >
          {/* Elo Esquerdo: Âmbar / Terracota Corporativo */}
          <ellipse 
            cx="40" 
            cy="30" 
            rx="21" 
            ry="14" 
            stroke={leftColor} 
            strokeWidth="6.5" 
            fill="none"
            className="transition-all duration-300"
          />
          {/* Elo Direito: Azul Corporativo / Índigo Tech */}
          <ellipse 
            cx="62" 
            cy="30" 
            rx="21" 
            ry="14" 
            stroke={rightColor} 
            strokeWidth="6.5" 
            fill="none"
            className="transition-all duration-300"
          />
          {/* Arco de Entrelaçamento / Interlock Weave: Quarto superior-direito do elo esquerdo cruzando por cima do direito */}
          <path 
            d="M 40 16 A 21 14 0 0 1 61 30" 
            stroke={leftColor} 
            strokeWidth="6.5" 
            fill="none" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      {/* 2. Wordmark (TARIRA) com tracking expandido clássico */}
      <div className={`${c.spacing1} flex items-center shrink-0`}>
        <span 
          className={`font-serif uppercase ${c.wordmarkClass} ${wordmarkTextColor} tracking-widest leading-none shrink-0`}
          style={{ letterSpacing: c.letterSpacing }}
        >
          TARIRA
        </span>
        {withRecruit && (
          <span className="ml-1.5 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-mono font-black uppercase rounded tracking-wider shrink-0">
            Recruit
          </span>
        )}
      </div>

      {/* 3. Hairline Divider + Dual Tagline (Português & Inglês) */}
      {withSlogan && (
        <div className={`flex flex-col ${isLeft ? "items-start text-left" : "items-center text-center"} shrink-0 w-full`}>
          <div className={`${c.spacing2} ${c.hairlineWidth} h-[1px] ${hairlineBg}`} />
          
          <div className={`${c.spacing3} flex flex-col leading-tight shrink-0`}>
            <span className={`font-serif italic ${c.taglinePT} ${ptSloganColor} whitespace-nowrap block`}>
              Supervisionamos para que não precise.
            </span>
            <span className={`font-sans uppercase ${c.taglineEN} ${enSloganColor} whitespace-nowrap block`}>
              We oversee so you don't have to.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
