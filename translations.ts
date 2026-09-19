export type Lang = "pt" | "en";

export interface LanguageItem {
  code: Lang;
  label: string;
  flag: string;
  region?: string;
  name?: string;
  nativeName?: string;
}

export const LANGUAGES: LanguageItem[] = [
  { code: "pt", label: "Português", flag: "🇲🇿" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export const translations: Record<Lang, Record<string, string>> = {
  pt: {
    welcome: "Bem-vindo ao Portal TARIRA",
    subtitle: "Soluções Integradas de Outsourcing, Recrutamento e Tecnologia",
    select_language: "Selecionar Idioma",
  },
  en: {
    welcome: "Welcome to TARIRA Portal",
    subtitle: "Integrated Outsourcing, Recruitment and Technology Solutions",
    select_language: "Select Language",
  },
};
