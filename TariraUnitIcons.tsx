import React from "react";
import { 
  Wrench, 
  Users, 
  Layers, 
  Compass, 
  Code2, 
  LucideProps 
} from "lucide-react";

export interface TariraIconProps extends LucideProps {
  size?: number | string;
  className?: string;
}

/**
 * Tarira Connect: Técnicos de campo, eletricistas, ofícios e prontidão técnica
 */
export const TariraConnectIcon: React.FC<TariraIconProps> = ({ size = 20, className = "", ...props }) => {
  return <Wrench size={size} className={className} {...props} />;
};

/**
 * Tarira Recruit: Talentos corporativos, executivos, vagas e recrutamento especializado
 */
export const TariraRecruitIcon: React.FC<TariraIconProps> = ({ size = 20, className = "", ...props }) => {
  return <Users size={size} className={className} {...props} />;
};

/**
 * Tarira Outsourcing: Terceirização de processos (RPO), squads dedicados e operações B2B
 */
export const TariraOutsourcingIcon: React.FC<TariraIconProps> = ({ size = 20, className = "", ...props }) => {
  return <Layers size={size} className={className} {...props} />;
};

/**
 * Tarira Consulting: Diagnóstico estratégico, governança, auditoria e assessoria empresarial
 */
export const TariraConsultingIcon: React.FC<TariraIconProps> = ({ size = 20, className = "", ...props }) => {
  return <Compass size={size} className={className} {...props} />;
};

/**
 * Tarira Studio: Engenharia de software, Micro-SaaS, automação e laboratório digital
 */
export const TariraStudioIcon: React.FC<TariraIconProps> = ({ size = 20, className = "", ...props }) => {
  return <Code2 size={size} className={className} {...props} />;
};

/**
 * Tarira Business Unit Icon: Componente dinâmico para renderizar o ícone de qualquer unidade
 */
export const TariraBusinessUnitIcon: React.FC<TariraIconProps & { unitId?: string }> = ({ 
  unitId, 
  size = 20, 
  className = "", 
  ...props 
}) => {
  switch (unitId) {
    case "connect":
      return <TariraConnectIcon size={size} className={className} {...props} />;
    case "recrute":
    case "recruit":
      return <TariraRecruitIcon size={size} className={className} {...props} />;
    case "business":
    case "outsourcing":
      return <TariraOutsourcingIcon size={size} className={className} {...props} />;
    case "consultoria":
    case "consulting":
      return <TariraConsultingIcon size={size} className={className} {...props} />;
    case "studio":
      return <TariraStudioIcon size={size} className={className} {...props} />;
    default:
      return <Layers size={size} className={className} {...props} />;
  }
};
