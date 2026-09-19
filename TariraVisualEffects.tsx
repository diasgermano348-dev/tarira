import React, { useEffect, useState } from "react";

/**
 * VerticalOrbitBadge
 * ─────────────────────────────────────────────────────────────────────────────
 * Exibe um texto na vertical em destaque com uma linha brilhante colorida
 * a circular e girar continuamente por todo o contorno do elemento.
 * Cores estritamente alinhadas com a identidade TARIRA (Azul, Slate e Branco).
 */
interface VerticalOrbitBadgeProps {
  text: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light" | "glass";
  className?: string;
}

export const VerticalOrbitBadge: React.FC<VerticalOrbitBadgeProps> = ({
  text,
  subtext,
  size = "md",
  variant = "dark",
  className = "",
}) => {
  const sizeClasses = {
    sm: {
      padding: "py-3 px-2",
      text: "text-[9px] font-mono tracking-[0.25em]",
      minHeight: "min-h-[85px]",
    },
    md: {
      padding: "py-4 px-2.5",
      text: "text-[11px] sm:text-xs font-mono tracking-[0.32em]",
      minHeight: "min-h-[110px]",
    },
    lg: {
      padding: "py-5 px-3.5",
      text: "text-xs sm:text-sm font-mono tracking-[0.38em]",
      minHeight: "min-h-[140px]",
    },
  }[size];

  const variantClasses = {
    dark: "bg-[#172554] text-white border border-blue-400/30",
    light: "bg-white text-[#172554] border border-blue-200 shadow-sm",
    glass: "bg-[#0b1736]/90 text-blue-100 border border-white/20 backdrop-blur-md shadow-lg",
  }[variant];

  return (
    <div
      className={`relative inline-flex items-center justify-center p-[2px] rounded-2xl overflow-hidden group select-none shadow-md ${className}`}
    >
      {/* 🌟 Linha colorida a circular e girar continuamente pelo contorno todo */}
      <div
        className="absolute inset-[-150%] animate-spin-slow pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, #3b82f6 45deg, #93c5fd 90deg, #2563eb 135deg, transparent 180deg, #60a5fa 225deg, #1d4ed8 270deg, #bfdbfe 315deg, transparent 360deg)",
          animationDuration: "5.5s",
        }}
      />

      {/* Segundo feixe suave em sentido reverso para tridimensionalidade óptica */}
      <div
        className="absolute inset-[-150%] animate-spin-slow-reverse opacity-40 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 180deg, transparent 0deg, #60a5fa 60deg, transparent 120deg, #3b82f6 240deg, transparent 360deg)",
          animationDuration: "8s",
        }}
      />

      {/* Content Container */}
      <div
        className={`relative z-10 flex flex-col items-center justify-between rounded-[14px] ${variantClasses} ${sizeClasses.padding} ${sizeClasses.minHeight}`}
      >
        {/* Ponto de status sutil */}
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa] animate-pulse" />

        {/* Texto em disposição vertical (de cima para baixo ou rotate-180) */}
        <span
          className={`font-black uppercase [writing-mode:vertical-lr] rotate-180 py-1.5 leading-none ${sizeClasses.text}`}
        >
          {text}
        </span>

        {/* Subtexto ou marcador inferior */}
        {subtext ? (
          <span className="text-[8px] font-mono text-blue-300/90 font-bold uppercase mt-1">
            {subtext}
          </span>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-300/50" />
        )}
      </div>
    </div>
  );
};

/**
 * TypewriterPromise
 * ─────────────────────────────────────────────────────────────────────────────
 * Animação de máquina de escrever contínua para a promessa de entrega.
 * Escreve caractere a caractere: "2", "4", " ", "-", " ", "4", "8", " ", "h", "o", "r", "a", "s".
 * Pausa com cursor piscante, apaga suavemente e recomeça em ciclo infinito.
 */
interface TypewriterPromiseProps {
  phrases?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDelay?: number;
  className?: string;
  cursorClassName?: string;
  showCursor?: boolean;
  prefix?: string;
  suffix?: string;
}

export const TypewriterPromise: React.FC<TypewriterPromiseProps> = ({
  phrases = ["24 a 48 horas", "24 - 48 Horas", "24h - 48h"],
  typingSpeed = 85,
  deletingSpeed = 45,
  pauseDelay = 3500,
  className = "",
  cursorClassName = "",
  showCursor = false,
  prefix = "",
  suffix = "",
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullPhrase = phrases[phraseIndex % phrases.length];

    if (!isDeleting) {
      // Escrevendo suavemente caractere por caractere
      if (currentText.length < fullPhrase.length) {
        const timeout = setTimeout(() => {
          setCurrentText(fullPhrase.slice(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Pausa generosa e relaxada para leitura antes de apagar
        const pauseTimeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDelay);
        return () => clearTimeout(pauseTimeout);
      }
    } else {
      // Apagando suavemente
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(fullPhrase.slice(0, currentText.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Transição limpa para a próxima frase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
  }, [currentText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDelay]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      {prefix && <span className="mr-1">{prefix}</span>}
      <span className="font-bold tracking-tight select-none">{currentText}</span>
      {showCursor && (
        <span
          className={`inline-block w-[3px] sm:w-[4px] h-[1em] bg-blue-400 ml-1 rounded-sm align-middle animate-cursor-blink shadow-[0_0_8px_#60a5fa] ${cursorClassName}`}
        />
      )}
      {suffix && <span className="ml-1">{suffix}</span>}
    </span>
  );
};
