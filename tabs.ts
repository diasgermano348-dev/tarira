export type Tab = 
  | "landing"
  | "services"
  | "client_find"
  | "profissionais"
  | "ecosystem"
  | "connect_sub"
  | "recruitment"
  | "recruit_sub"
  | "business"
  | "business_sub"
  | "consulting"
  | "consulting_sub"
  | "studio_sub"
  | "axofacil"
  | "apply"
  | "spontaneous_apply"
  | "company"
  | "registered_companies"
  | "professional_profile"
  | "about"
  | "admin"
  | "central"
  | "organization_audit"
  | "audit_logs"
  | string;

export interface TabItem {
  id: Tab;
  label: string;
  icon?: string;
  badge?: string;
  category?: string;
}

export const TABS: TabItem[] = [
  { id: "landing", label: "Página Principal", icon: "🏠" },
  { id: "services", label: "Ofícios & Serviços", icon: "🔧" },
  { id: "client_find", label: "Técnicos de Ofício", icon: "🛠️" },
  { id: "profissionais", label: "Profissionais & Especialistas", icon: "💼" },
  { id: "about", label: "Sobre Nós", icon: "ℹ️" },
  { id: "ecosystem", label: "Ecossistema Tarira", icon: "🌐" },
  { id: "connect_sub", label: "Tarira Connect", icon: "⚡" },
  { id: "recruit_sub", label: "Tarira Recruit", icon: "🔗" },
  { id: "business_sub", label: "Tarira Outsourcing", icon: "💼" },
  { id: "consulting_sub", label: "Tarira Consulting", icon: "💡" },
  { id: "studio_sub", label: "Tarira Studio", icon: "🚀" },
  { id: "apply", label: "Registo de Técnico / Ofícios", icon: "📝" },
  { id: "spontaneous_apply", label: "Registo de Profissional", icon: "🎓" },
  { id: "registered_companies", label: "Portal de Empresas Registadas", icon: "🏢" },
  { id: "central", label: "Central de Controlo Admin", icon: "🛡️" },
  { id: "organization_audit", label: "Auditoria & Multi-Logins", icon: "🔒" },
];
