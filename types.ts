export interface Candidate {
  id: string;
  name: string;
  surname?: string;
  email?: string;
  phone?: string;
  bio?: string;
  category?: string;
  matchScore?: number;
  feedback?: string;
  status?: "pending" | "approved" | "rejected" | "hired" | "archived" | string;
  timestamp?: string;
  residence?: string;
  photo?: string;
  identityDocName?: string;
  title?: string;
  subCategory?: string;
  city?: string;
  languages?: string[];
  whatsapp?: string;
  rate?: number;
  rateMzn?: number;
  hourlyRate?: number;
  isProfessional?: boolean;
  completedServicesCount?: number;
  pendingEarnings?: number;
  reviewsCount?: number;
  experienceYears?: number;
  addressZone?: string;
  latitude?: number;
  longitude?: number;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  salaryNegotiable?: boolean;
  workType?: string;
  availableNow?: boolean;
  availableForEmergency?: boolean;
  emergencyRate?: number;
  travelRadius?: number;
  ownTransport?: boolean;
  availableFrom?: string;
  promiseScore?: number;
  rating?: number;
  completedJobs?: number;
  skills?: string[];
  personalValues?: string[];
  whyWork?: string;
  portfolioWebsite?: string;
  withdrawnAmount?: number;
  documents?: Array<{
    type: string;
    title: string;
    issuer?: string;
    expiry?: string;
    status: "verified" | "pending" | "warning";
  }>;
  portfolio?: Array<{
    url: string;
    caption?: string;
  }>;
  reviews?: Array<{
    reviewer: string;
    date: string;
    text: string;
    rating: number;
    quality?: number;
    punctuality?: number;
    cleanliness?: number;
  }>;
  deletedBy?: string;
  deletedAt?: string;
  deletedRole?: string;
}

export interface OrgOperator {
  id: string;
  name: string;
  role: string;
  email: string;
  orgId: string;
  orgName: string;
  permissions: string[];
  status: "Ativo" | "Ausente" | "Suspenso" | string;
  lastActive: string;
  avatar?: string;
}

export interface OperatorAuditAction {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorRole: string;
  orgName: string;
  actionType: string;
  details: string;
  targetEntity: string;
  ipAddress?: string;
}

export type UserAccountRole = "empresa" | "condominio" | "lar" | "prestador" | "admin" | "guest";

export interface Client {
  id: string;
  name: string;
  type: "company" | "residential" | "condo" | "individual" | string;
  email?: string;
  phone?: string;
  linkedin?: string;
  address?: string;
  city?: string;
  bi?: string;
  nuit?: string;
  createdAt?: string;
  notes?: string;
  contactPerson?: string;
  contactPersonTitle?: string;
  /**
   * Modelo actual: "conta_activa" (Empresa/Condomínio, valor único de
   * manutenção) ou "conta_lar" (Particular, gratuita). Os valores antigos
   * ("pro", "condo_base", …) permanecem na união apenas para contas legadas.
   */
  planType?: "conta_activa" | "conta_lar" | "free" | "starter" | "pro" | "enterprise" | "condo_base" | "condo_premium" | string;
  planName?: string;
  planPriceMzn?: number;
  planStatus?: "active" | "trial" | "pending" | "expired" | string;
  // Data (ISO) em que o período de acesso gratuito de 30 dias termina.
  // Só é definido quando planStatus === "trial". Passado este prazo, a
  // conta deve ser convertida para "pending" até o pagamento manual do
  // plano escolhido ser validado pelo financeiro TARIRA.
  trialEndsAt?: string;
  subscribedUnits?: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
  category?: string;
  ip?: string;
  status?: "success" | "warning" | "error" | string;
}

export interface ServiceItem {
  id: string;
  name: string;
  n?: string;
  category: string;
  description?: string;
  d?: string;
  price?: number;
  priceMzn?: number;
  unit?: string;
  icon?: string;
  popular?: boolean;
  active?: boolean;
  hasProviders?: boolean;
  providerCount?: number;
  emg?: boolean;
  cat?: string;
  g?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  cat?: string;
  g?: string;
  label?: string;
  items?: ServiceItem[];
}

export interface LandingBannerItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  targetTab?: string;
  active?: boolean;
  category?: string;
  tagline?: string;
  desc?: string;
  url?: string;
  priority?: number;
}

export interface SpontaneousExperience {
  company: string;
  role: string;
  period: string;
  description?: string;
  duration?: string;
  responsibilities?: string;
}

export interface SpontaneousApplication {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  category?: string;
  subCategory?: string;
  city?: string;
  expectedSalary?: string;
  experiences?: SpontaneousExperience[];
  skills?: string[];
  cvUrl?: string;
  timestamp?: string;
  residence?: string;
  careerFocus?: string;
  nuit?: string;
  idDocumentName?: string;
  idDocumentUrl?: string;
  cvDocumentName?: string;
  cvDocumentUrl?: string;
  isAtsValidated?: boolean;
  atsScore?: number;
  submittedAt?: string;
  status?: string;
  notes?: string;
  // Extended internal team fields
  targetDepartment?: string;
  seniorityLevel?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  workModelPreference?: string;
  availability?: string;
  coverLetter?: string;
  applicationType?: string;
}

export interface PartnerCompanyItem {
  id: string;
  name: string;
  logo?: string;
  category?: string;
  location?: string;
  verified?: boolean;
  description?: string;
  website?: string;
}

export interface PartnerStoreItem {
  id: string;
  name: string;
  category?: string;
  address?: string;
  contact?: string;
  productsCount?: number;
  rating?: number;
  imageUrl?: string;
  promoOffer?: string;
}

export interface PaymentOrder {
  id: string;
  clientName?: string;
  amount: number;
  currency?: string;
  status: "pending" | "paid" | "confirmed" | "rejected" | "cancelled" | string;
  date?: string;
  method?: string;
  reference?: string;
  items?: string[];
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userType?: string;
  serviceTitle?: string;
  hireId?: string;
  proofUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  adminNotes?: string;
}

export interface LanguageItem {
  code: string;
  name: string;
  nativeName?: string;
  region?: string;
  flag?: string;
}

export interface CommercialProposal {
  id: string;
  source: "outsourcing" | "tender" | "direct_contact" | "b2b_recruitment" | "consulting" | "connect" | "study" | string;
  businessUnit?: "Tarira Connect" | "Tarira Recruiting" | "Tarira Business" | "Tarira Consulting" | "Tarira Study" | "Tarira Outsourcing" | string;
  companyName: string;
  contactPerson?: string;
  contactEmail: string;
  contactPhone: string;
  operationType: string;
  headcount: number;
  slaLevel: string;
  comments?: string;
  submittedAt: string;
  status: "pending" | "under_review" | "proposal_sent" | "approved" | "rejected" | "archived";
  documentName?: string;
  documentSize?: string;
  documentData?: string;
  budgetEstimateMzn?: number;
  internalNotes?: string;
  assignedManager?: string;
  emailNotificationSent?: boolean;
  emailNotificationRecipient?: string;
  emailNotificationSentAt?: string;
  emailNotificationSubject?: string;
}

export interface ConsultingRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType: string;
  requestType?: "external_consulting" | "consulting_association";
  details: string;
  budget: string;
  documentName?: string;
  documentSize?: string;
  documentData?: string;
  documentUrl?: string;
  createdAt: string;
  status: "pending" | "approved" | "completed";
}

export interface Hire {
  id: string;
  candidateId: string;
  candidateName: string;
  clientId?: string;
  clientName: string;
  serviceName: string;
  category?: string;
  price?: number;
  totalAmount?: number;
  timestamp?: string;
  rate?: number;
  description?: string;
  targetDate?: string;
  scheduledDate?: string;
  preferredTime?: string;
  status?: string;
  createdAt?: string;
  type?: string;
  location?: string;
  eta?: string;
  isEmergency?: boolean;
  notes?: string;
  paymentModality?: string;
  paymentChannel?: string;
  paymentStatus?: string;
  contractModel?: string;
  contractType?: string;
  contractDuration?: string;
  contractDurationMonths?: number;
  contractDurationLabel?: string;
  isRenewable?: boolean;
  recruitmentLevel?: string;
  recruitmentComplexityLevel?: string;
  recruitmentLevelLabel?: string;
  recruitmentSalaryProposal?: number;
  recruitmentNegotiationNotes?: string;
  observations?: string;
  negotiationEmail?: string;
  workModel?: "presential" | "remote" | "hybrid" | string;
  workSchedule?: "full_time" | "part_time" | "flexible" | "shifts" | string;
  documentName?: string;
  documentUrl?: string;
  photoName?: string;
  photoUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  workloadHours?: number;
  effortLevel?: string;
  billingPeriod?: string;
  totalEstimate?: number;
  isDemo?: boolean;
  tariraAgentValidated?: boolean;
  tariraValidationNotes?: string;
  payoutRequested?: boolean;
  payoutPaid?: boolean;
  checkins?: string[];
  clientPhone?: string;
  clientEmail?: string;
  centralNotes?: string;
  whatsappClientContacted?: boolean;
  whatsappProviderContacted?: boolean;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
}

export interface PaymentBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  nib: string;
  iban?: string;
  holderName: string;
  active: boolean;
}

/**
 * Configuração da MANUTENÇÃO DE CONTA (modelo único — já não existem planos
 * nem escalões). Empresa e Condomínio partilham o mesmo `priceMzn`; a conta
 * `residential` (Particular/Lar) é sempre gratuita. Ver accountPlan.ts.
 */
export interface RegistrationPlanConfig {
  id: string;
  type: 'company' | 'condo' | 'residential';
  name: string;
  priceMzn: number;
  period: string;
  badge: string;
  description: string;
  /** Vantagens de ter a conta activa (antes: funcionalidades do plano). */
  features: string[];
  /** Dias de utilização gratuita a contar da criação da conta. */
  trialDays?: number;
  /** @deprecated resíduo do modelo de planos; mantido só para compatibilidade. */
  popular?: boolean;
}

export interface ManualPaymentSettings {
  mpesa: {
    number: string;
    holderName: string;
    instructions: string;
    active: boolean;
  };
  emola: {
    number: string;
    holderName: string;
    instructions: string;
    active: boolean;
  };
  bankAccounts: PaymentBankAccount[];
  lastUpdated?: string;
  updatedBy?: string;
}


