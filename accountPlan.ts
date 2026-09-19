// ============================================================================
// MODELO DE NEGÓCIO TARIRA — MANUTENÇÃO DE CONTA (substitui os antigos planos)
// ----------------------------------------------------------------------------
// Regra única do ecossistema:
//
//   1. A TARIRA cobra UM valor fixo pelo USO DA PLATAFORMA e pelas vantagens
//      de ter uma conta activa. Não existem escalões, tiers nem planos.
//   2. Empresa e Condomínio pagam EXACTAMENTE o mesmo valor de manutenção
//      de conta (ACCOUNT_MAINTENANCE_FEE_MZN), com os primeiros
//      ACCOUNT_TRIAL_DAYS dias gratuitos.
//   3. Conta Particular / Lar não tem qualquer custo de manutenção.
//   4. Os SERVIÇOS e INTERVENÇÕES contratados são orçamentados e pagos à
//      parte por quem os contrata (empresa, condomínio ou particular).
//   5. Pacotes especiais (volume, SLA dedicado, contratos anuais) são
//      negociados caso a caso pela Direção Comercial — nunca como "planos".
//
// Este ficheiro é a ÚNICA fonte de verdade no frontend. O servidor expõe os
// mesmos valores em /api/registration-plans (ver server.ts) para que o
// administrador os possa alterar sem redeploy; estes valores servem de
// fallback enquanto a API não responde.
// ============================================================================

export const ACCOUNT_PLAN_ID = 'conta_activa';
export const ACCOUNT_PLAN_NAME = 'Manutenção de Conta TARIRA';
export const ACCOUNT_PLAN_PERIOD = '/mês';

/** Valor mensal de manutenção da conta Empresa e Condomínio (igual para ambas). */
export const ACCOUNT_MAINTENANCE_FEE_MZN = 5000;

/** Período inicial gratuito a contar da criação da conta. */
export const ACCOUNT_TRIAL_DAYS = 30;

export const HOME_PLAN_ID = 'conta_lar';
export const HOME_PLAN_NAME = 'Conta Particular / Lar';

/** Vantagens de ter uma conta Empresa ou Condomínio activa. */
export const ACCOUNT_BENEFITS: string[] = [
  'Acesso ilimitado ao catálogo verificado de técnicos de ofício (Connect) e de quadros profissionais (Recruit)',
  'Abertura ilimitada de pedidos de intervenção e de processos de recrutamento',
  'Painel único de gestão: histórico de intervenções, contratos, equipas e faturas',
  'Identidade, NUIT e registo criminal de todos os profissionais verificados pela TARIRA',
  'Pagamento protegido em escrow — o profissional só recebe depois da sua aprovação',
  'Garantia de re-execução em 30 dias e reposição do profissional em 48-72h',
  'Faturação fiscal centralizada com NUIT e relatório mensal de intervenções',
  'Gestor de conta TARIRA e canal de atendimento prioritário',
  'Vários utilizadores/departamentos na mesma conta, com registo de auditoria',
  'Elegibilidade para pacotes especiais negociados por volume de serviços'
];

/** Vantagens da conta Particular / Lar (sem custo de manutenção). */
export const HOME_ACCOUNT_BENEFITS: string[] = [
  'Criação e manutenção da conta sem qualquer custo',
  'Pedidos de intervenção ilimitados a técnicos verificados pela TARIRA',
  'Identidade, NUIT e registo criminal dos profissionais validados',
  'Pagamento protegido em escrow e garantia de re-execução em 30 dias',
  'Histórico de serviços, orçamentos e avaliações na sua área pessoal',
  'Paga apenas o serviço contratado — nada pelo uso da plataforma'
];

/**
 * Nota legal/comercial que acompanha sempre o valor de manutenção, para que
 * nunca se confunda mensalidade de conta com preço de serviço.
 */
export const ACCOUNT_BILLING_NOTE =
  'A manutenção da conta cobre exclusivamente o uso da plataforma e as vantagens acima. ' +
  'Cada serviço, intervenção ou colocação contratada é orçamentada e faturada à parte, ' +
  'e paga pela empresa, condomínio ou particular que a contrata.';

export const ACCOUNT_TRIAL_NOTE =
  `Os primeiros ${ACCOUNT_TRIAL_DAYS} dias são gratuitos. A conta fica activa de imediato e a ` +
  `primeira mensalidade de manutenção só é cobrada no fim desse período.`;

export type AccountRole = 'empresa' | 'condominio' | 'lar' | 'prestador' | 'profissional' | 'admin';

/** Contas de particular/lar (e perfis de profissionais) não pagam manutenção. */
export const isPaidAccountRole = (role: string): boolean =>
  role === 'empresa' || role === 'condominio';

export const formatMzn = (value: number): string =>
  `${Number(value || 0).toLocaleString('pt-PT')} MZN`;

/** Rótulo curto usado nos cartões e resumos de registo. */
export const accountFeeLabel = (feeMzn: number = ACCOUNT_MAINTENANCE_FEE_MZN): string =>
  `${formatMzn(feeMzn)}${ACCOUNT_PLAN_PERIOD}`;

export interface AccountPlanConfig {
  id: string;
  type: 'company' | 'condo' | 'residential';
  name: string;
  priceMzn: number;
  period: string;
  badge: string;
  description: string;
  features: string[];
  trialDays?: number;
}

/** Fallback local, espelho exacto do DEFAULT_REGISTRATION_PLANS do servidor. */
export const DEFAULT_ACCOUNT_PLANS: AccountPlanConfig[] = [
  {
    id: ACCOUNT_PLAN_ID,
    type: 'company',
    name: ACCOUNT_PLAN_NAME,
    priceMzn: ACCOUNT_MAINTENANCE_FEE_MZN,
    period: ACCOUNT_PLAN_PERIOD,
    badge: 'Conta Empresa',
    description:
      'Valor único de manutenção da conta corporativa. Dá acesso integral à plataforma TARIRA e a todas as vantagens de uma conta activa.',
    features: ACCOUNT_BENEFITS,
    trialDays: ACCOUNT_TRIAL_DAYS
  },
  {
    id: ACCOUNT_PLAN_ID,
    type: 'condo',
    name: ACCOUNT_PLAN_NAME,
    priceMzn: ACCOUNT_MAINTENANCE_FEE_MZN,
    period: ACCOUNT_PLAN_PERIOD,
    badge: 'Conta Condomínio',
    description:
      'O mesmo valor único de manutenção aplicado à administração de condomínios, com acesso integral à plataforma TARIRA.',
    features: ACCOUNT_BENEFITS,
    trialDays: ACCOUNT_TRIAL_DAYS
  },
  {
    id: HOME_PLAN_ID,
    type: 'residential',
    name: HOME_PLAN_NAME,
    priceMzn: 0,
    period: 'Sem custo',
    badge: 'Gratuita',
    description:
      'Conta para lares e clientes particulares. Sem valor de inscrição e sem mensalidade — paga apenas os serviços que contratar.',
    features: HOME_ACCOUNT_BENEFITS
  }
];

/**
 * Lê o valor de manutenção actualmente definido pelo administrador a partir da
 * resposta de /api/registration-plans, com fallback para o valor local.
 */
export const resolveMaintenanceFee = (plans?: any[] | null): number => {
  if (!Array.isArray(plans)) return ACCOUNT_MAINTENANCE_FEE_MZN;
  const found = plans.find(
    (p) => p && (p.id === ACCOUNT_PLAN_ID || p.type === 'company') && Number(p.priceMzn) > 0
  );
  return found ? Number(found.priceMzn) : ACCOUNT_MAINTENANCE_FEE_MZN;
};

/** Lê a lista de vantagens definida pelo administrador, com fallback local. */
export const resolveAccountBenefits = (plans?: any[] | null): string[] => {
  if (!Array.isArray(plans)) return ACCOUNT_BENEFITS;
  const found = plans.find((p) => p && (p.id === ACCOUNT_PLAN_ID || p.type === 'company'));
  return Array.isArray(found?.features) && found.features.length > 0 ? found.features : ACCOUNT_BENEFITS;
};

export const resolveHomeBenefits = (plans?: any[] | null): string[] => {
  if (!Array.isArray(plans)) return HOME_ACCOUNT_BENEFITS;
  const found = plans.find((p) => p && (p.id === HOME_PLAN_ID || p.type === 'residential'));
  return Array.isArray(found?.features) && found.features.length > 0 ? found.features : HOME_ACCOUNT_BENEFITS;
};
