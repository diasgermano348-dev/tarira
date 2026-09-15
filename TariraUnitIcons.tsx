import React from "react";

export interface UnitIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Ícone Oficial TARIRA Outsourcing (Unidade de Negócio 1)
 * Dois utilizadores/membros com contorno moderno arredondado
 */
export const TariraOutsourcingIcon: React.FC<UnitIconProps> = ({
  size = 24,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="TARIRA Outsourcing"
      {...props}
    >
      {/* Utilizador Principal */}
      <circle
        cx="9"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Utilizador Secundário / Equipa de Apoio */}
      <path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 20a7 7 0 0 0-5-6.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Ícone Oficial TARIRA Recruit (Unidade de Negócio 2)
 * Maleta executiva moderna com fecho central e cantos arredondados
 */
export const TariraRecruitIcon: React.FC<UnitIconProps> = ({
  size = 24,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="TARIRA Recruit"
      {...props}
    >
      {/* Alça superior da maleta */}
      <path
        d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Corpo retangular da maleta */}
      <rect
        x="2.5"
        y="7"
        width="19"
        height="13.5"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Divisória central horizontal */}
      <line
        x1="2.5"
        y1="13.5"
        x2="21.5"
        y2="13.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Fecho central da maleta */}
      <rect
        x="10.25"
        y="12"
        width="3.5"
        height="3"
        rx="0.75"
        fill="currentColor"
      />
    </svg>
  );
};

/**
 * Ícone Oficial TARIRA Connect (Unidade de Negócio 3)
 * Rede triangular de 3 nós interligados (Connect / Técnicos / Infraestrutura)
 */
export const TariraConnectIcon: React.FC<UnitIconProps> = ({
  size = 24,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="TARIRA Connect"
      {...props}
    >
      {/* Linhas de Conexão */}
      <line
        x1="8"
        y1="6"
        x2="16"
        y2="6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="6.8"
        y1="8.5"
        x2="10.2"
        y2="15.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="17.2"
        y1="8.5"
        x2="13.8"
        y2="15.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Nós Circulares nos Vértices */}
      <circle
        cx="5.5"
        cy="6"
        r="3"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
      <circle
        cx="18.5"
        cy="6"
        r="3"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
      <circle
        cx="12"
        cy="18.5"
        r="3"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
    </svg>
  );
};

/**
 * Ícone Oficial TARIRA Consulting (Unidade de Negócio 4)
 * Lâmpada moderna com traços de filamento/base arredondados (Estratégia & Diagnóstico)
 */
export const TariraConsultingIcon: React.FC<UnitIconProps> = ({
  size = 24,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="TARIRA Consulting"
      {...props}
    >
      {/* Bulbo da lâmpada */}
      <path
        d="M9 16c-.7-1.1-1.2-2.1-1.5-3.2A6.5 6.5 0 1 1 16.5 12.8c-.3 1.1-.8 2.1-1.5 3.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base / Rosca da lâmpada */}
      <line
        x1="9"
        y1="18.5"
        x2="15"
        y2="18.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="10.5"
        y1="21.5"
        x2="13.5"
        y2="21.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Ícone Oficial TARIRA Studio (Unidade de Negócio 5)
 * Estrelas de 4 pontas / Brilho (Inovação, Software & Design)
 */
export const TariraStudioIcon: React.FC<UnitIconProps> = ({
  size = 24,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="TARIRA Studio"
      {...props}
    >
      {/* Estrela Principal (Maior, no topo/esquerda) */}
      <path
        d="M8.5 2C8.5 5.5 6 8 2.5 8C6 8 8.5 10.5 8.5 14C8.5 10.5 11 8 14.5 8C11 8 8.5 5.5 8.5 2Z"
        fill="currentColor"
      />
      {/* Estrela Secundária (Menor, embaixo/direita) */}
      <path
        d="M18 13.5C18 15.5 16.5 17 14.5 17C16.5 17 18 18.5 18 20.5C18 18.5 19.5 17 21.5 17C19.5 17 18 15.5 18 13.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export type TariraUnitKey =
  | "outsourcing"
  | "business"
  | "recruitment"
  | "recruit"
  | "recrute"
  | "connect"
  | "consulting"
  | "consultoria"
  | "studio";

interface TariraBusinessUnitIconProps extends UnitIconProps {
  unit: TariraUnitKey | string;
}

/**
 * Componente unificador para renderizar o ícone oficial de qualquer unidade
 */
export const TariraBusinessUnitIcon: React.FC<TariraBusinessUnitIconProps> = ({
  unit,
  size = 24,
  className = "",
  ...props
}) => {
  const normalized = (unit || "").toString().toLowerCase().trim();

  switch (normalized) {
    case "outsourcing":
    case "business":
      return <TariraOutsourcingIcon size={size} className={className} {...props} />;
    case "recruitment":
    case "recruit":
    case "recrute":
      return <TariraRecruitIcon size={size} className={className} {...props} />;
    case "connect":
      return <TariraConnectIcon size={size} className={className} {...props} />;
    case "consulting":
    case "consultoria":
      return <TariraConsultingIcon size={size} className={className} {...props} />;
    case "studio":
      return <TariraStudioIcon size={size} className={className} {...props} />;
    default:
      return <TariraConnectIcon size={size} className={className} {...props} />;
  }
};
