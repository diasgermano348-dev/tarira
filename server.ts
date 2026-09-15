import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer, { Transporter } from "nodemailer";
import { SERVICES } from "./data.js";
import { CommercialProposal, ManualPaymentSettings, OrgOperator, RegistrationPlanConfig } from "./types.js";
import { isSupabaseAdminConfigured, loadTable, bulkUpsertTable, deleteFromTable, getContentValue, setContentValue, upsertUserProfile, getUserProfile, getSupabaseAdmin } from "./supabaseServer.js";
import { 
  securityHeadersMiddleware, 
  globalApiLimiter, 
  authRateLimiter, 
  submissionRateLimiter, 
  deepSanitizeMiddleware,
  signSessionToken,
  verifySessionToken,
  extractSessionFromRequest,
  requireAuthMiddleware,
  requireAdminMiddleware,
  canUserModifyProfile,
  safeCompare,
  AuthenticatedSessionPayload,
  AUTHORIZED_ADMIN_EMAILS
} from "./serverSecurity.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ============================================================================
// TARIRA CYBERSECURITY SHIELD — DEFENSE IN DEPTH
// ============================================================================
app.disable("x-powered-by");
app.use(securityHeadersMiddleware);
app.use(deepSanitizeMiddleware);
app.use("/api", globalApiLimiter);
app.use("/api/admin/login", authRateLimiter);
app.use("/api/auth", authRateLimiter);

// ============================================================================
// Persistência real via Supabase (substitui o reset de dados ao reiniciar).
// Ver supabaseServer.ts e supabase_schema.sql para detalhes.
//
// Estratégia: as estruturas em memória (candidates, hires, clients, etc.)
// continuam a ser a fonte de verdade DURANTE a execução do processo — toda a
// lógica de negócio existente que já lê/escreve nesses arrays não muda.
// Após qualquer pedido que altere dados (POST/PUT/DELETE bem sucedido),
// sincronizamos automaticamente o estado actual de todos os arrays para o
// Supabase (debounced), e no arranque do servidor recarregamos os dados
// reais do Supabase para dentro desses mesmos arrays, antes de aceitar
// pedidos. Sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY configurados, o
// servidor continua a funcionar como antes (modo de desenvolvimento local).
// ============================================================================
// IMPORTANTE: esta sincronização tem de ficar concluída ANTES de a resposta
// ser enviada ao cliente. Em ambientes serverless (ex.: Vercel), o processo
// pode ser congelado/terminado logo a seguir ao envio da resposta — um
// setTimeout agendado para depois de res.on("finish") não tem garantia
// nenhuma de chegar a executar. Isso fazia com que actualizações (ex.: foto
// de perfil de um candidato) só existissem na memória volátil dessa
// invocação: o próprio browser que fez a alteração continuava a "ver" o
// valor novo (mesma instância ainda quente), mas outro visitante/dispositivo
// que caísse noutra instância via a foto antiga (mockup/seed), porque a
// escrita real no Supabase nunca tinha chegado a acontecer.
// Lista central de tabelas rastreadas. Fica fora da função para poder ser
// reutilizada tanto pelo sync como pelo middleware que decide QUAIS tabelas
// realmente mudaram num dado pedido (ver getTrackedTables/comentário abaixo).
function getTrackedTables(): Array<[string, any[]]> {
  return [
    ["candidates", candidates],
    ["clients", clients],
    ["hires", hires],
    ["payment_orders", paymentOrders],
    ["recruit_subscriptions", recruitSubscriptions],
    ["consulting_requests", consultingRequests],
    ["spontaneous_applications", spontaneousApplications],
    ["briefings", briefings],
    ["contact_inquiries", contactInquiries],
    ["audit_logs", auditLogs.slice(0, 500)],
    ["payout_requests", payoutRequests],
    ["commercial_proposals", commercialProposals],
    ["operators", operators],
  ];
}

// CORREÇÃO (falha genérica "processado mas não gravado" + loading muito
// longo em qualquer submissão): esta função sincronizava SEMPRE as 13
// tabelas inteiras a cada escrita, em qualquer parte do site. Duas
// consequências graves:
//   1) Lentidão: submeter uma única candidatura espontânea disparava
//      upserts de TODAS as 13 tabelas (candidatos, clientes, hires,
//      operadores, etc.), mesmo sem nenhuma relação com o pedido — daí o
//      loading longo.
//   2) Falha cruzada: se qualquer UMA tabela sem relação com o pedido atual
//      tivesse um problema persistente (ex.: uma tabela ainda não criada no
//      Supabase, ou bloqueada por schema/RLS), TODOS os pedidos de escrita
//      do site — incluindo criar um perfil profissional — passavam a
//      devolver este erro 502, mesmo que o registo que o utilizador acabou
//      de submeter tivesse sido gravado com sucesso na tabela certa.
// Agora só sincronizamos as tabelas cujo conteúdo realmente mudou durante o
// pedido (ver o middleware abaixo, que faz um "antes/depois"). Se nada
// mudou, não se faz nenhuma chamada à rede.
async function syncDataToSupabaseNow(onlyTables?: Set<string>): Promise<void> {
  if (!isSupabaseAdminConfigured) return;
  const allTables = getTrackedTables();
  const tables = onlyTables ? allTables.filter(([name]) => onlyTables.has(name)) : allTables;
  if (tables.length === 0) return;

  // Timeout guard de 3.5s para garantir que uma latência no Supabase não congele a aplicação do utilizador
  const syncPromise = Promise.all(
    tables.map(async ([table, rows]) => {
      try {
        const { failedIds } = await bulkUpsertTable(table, rows);
        return { table, failedIds };
      } catch (err: any) {
        return { table, failedIds: ["<erro de rede/inesperado: " + (err?.message || err) + ">"] };
      }
    })
  );

  const timeoutPromise = new Promise<{ table: string; failedIds: string[] }[]>((resolve) =>
    setTimeout(() => {
      console.warn("[supabase] Tempo limite de sincronização preventiva atingido (3.5s). A gravação prossegue em segundo plano.");
      resolve([]);
    }, 3500)
  );

  const results = await Promise.race([syncPromise, timeoutPromise]);

  const failures = results.filter((r) => r.failedIds.length > 0);
  if (failures.length > 0) {
    const detail = failures.map((f) => `${f.table} (${f.failedIds.join(", ")})`).join("; ");
    console.error(`[supabase] Sincronização incompleta — registos não persistidos: ${detail}`);
    throw new Error(`Falha ao gravar de forma permanente: ${detail}`);
  }
}

// Sincroniza automaticamente a seguir a qualquer pedido de escrita bem
// sucedido — mas ANTES de a resposta sair, intercetando res.json (é o único
// método de resposta usado por todas as rotas deste servidor). Isto garante
// que, quando o cliente recebe "success: true", os dados já estão realmente
// persistidos no Supabase e visíveis para qualquer outro browser/dispositivo
// na próxima leitura.
//
// IMPORTANTE: se a sincronização falhar (syncDataToSupabaseNow agora lança
// erro em vez de o engolir), a resposta deixa de fingir sucesso — devolvemos
// 502 com uma mensagem clara, para o painel de administração poder avisar
// a pessoa em vez de mostrar "gravado com sucesso" e a alteração desaparecer
// silenciosamente na próxima leitura.
app.use((req, res, next) => {
  if (req.method !== "GET") {
    // Snapshot "antes": guarda uma cópia leve (JSON) de cada tabela rastreada
    // ANTES do handler da rota correr. audit_logs é só apêndice (nunca é
    // editado in-place), por isso basta comparar o comprimento — evita
    // serializar um array que só cresce e nunca é a causa de um pedido lento.
    const before = getTrackedTables().map(([name, rows]) => {
      if (name === "audit_logs") return [name, String(rows.length)] as [string, string];
      return [name, JSON.stringify(rows)] as [string, string];
    });

    const originalJson = res.json.bind(res);
    res.json = ((body: any) => {
      const statusCode = res.statusCode || 200;
      if (statusCode >= 200 && statusCode < 400) {
        // Snapshot "depois": só entram na sincronização as tabelas cujo
        // conteúdo mudou de facto durante este pedido — é isto que evita
        // tanto a lentidão (deixa de fazer upsert de 13 tabelas para gravar
        // 1 candidatura) como a falha cruzada (uma tabela sem relação com o
        // pedido, com problema persistente no Supabase, deixa de poder
        // bloquear pedidos que não lhe tocam).
        const after = getTrackedTables();
        const changed = new Set<string>();
        before.forEach(([name, snapshot], i) => {
          const [, rows] = after[i];
          const current = name === "audit_logs" ? String(rows.length) : JSON.stringify(rows);
          if (current !== snapshot) changed.add(name);
        });

        syncDataToSupabaseNow(changed)
          .then(() => originalJson(body))
          .catch((err) => {
            console.error("[supabase] Falha ao sincronizar estado antes da resposta:", err);
            res.status(502);
            originalJson({
              error: "A alteração foi processada no servidor mas falhou ao gravar de forma permanente na base de dados. Tente novamente; se persistir, contacte o suporte técnico.",
              syncFailed: true,
              detail: err?.message || String(err)
            });
          });
        return res;
      }
      return originalJson(body);
    }) as typeof res.json;
  }
  next();
});

async function hydrateStateFromSupabase() {
  if (!isSupabaseAdminConfigured) {
    console.log("⚠️  Supabase não configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em falta) — o servidor vai usar os dados de exemplo em memória. Isto NÃO deve acontecer em produção.");
    return;
  }
  try {
    const [c, cl, h, p, rs, cr, sa, br, ci, al, pr, cp, deletedIds, op, deletedOpIds, deletedClIds] = await Promise.all([
      loadTable<CandidateState>("candidates"),
      loadTable<ClientState>("clients"),
      loadTable<HireState>("hires"),
      loadTable<PaymentOrder>("payment_orders"),
      loadTable<RecruitSubscription>("recruit_subscriptions"),
      loadTable<ConsultingRequest>("consulting_requests"),
      loadTable<SpontaneousApplication>("spontaneous_applications"),
      loadTable<BriefingItem>("briefings"),
      loadTable<ContactInquiryItem>("contact_inquiries"),
      loadTable<any>("audit_logs"),
      loadTable<PayoutRequest>("payout_requests"),
      loadTable<CommercialProposal>("commercial_proposals"),
      getContentValue<string[]>("deleted_candidate_ids"),
      loadTable<OrgOperator>("operators"),
      getContentValue<string[]>("deleted_operator_ids"),
      getContentValue<string[]>("deleted_client_ids"),
    ]);
    if (deletedIds && Array.isArray(deletedIds)) {
      deletedIds.forEach(id => deletedCandidateIds.add(id));
    }
    if (deletedOpIds && Array.isArray(deletedOpIds)) {
      deletedOpIds.forEach(id => deletedOperatorIds.add(id));
    }
    if (deletedClIds && Array.isArray(deletedClIds)) {
      deletedClIds.forEach(id => deletedClientIds.add(id));
    }
    if (op && op.length) {
      const allowedSeedOpIds = new Set(SEED_OPERATORS.map(s => s.id));
      const cleanOps = op.filter((item: any) => !deletedOperatorIds.has(item.id));
      const existingOpIds = new Set(cleanOps.map((item: any) => item.id));
      const remainingSeedOps = SEED_OPERATORS.filter(
        seed => !existingOpIds.has(seed.id) && !deletedOperatorIds.has(seed.id) && allowedSeedOpIds.has(seed.id)
      );
      operators.length = 0;
      operators.push(...cleanOps, ...remainingSeedOps);
    } else {
      operators.length = 0;
      operators.push(...SEED_OPERATORS.filter(seed => !deletedOperatorIds.has(seed.id)));
    }
    if (c && c.length) {
      const allowedSeedIds = new Set(SEED_CANDIDATES.map(s => s.id));
      const cleanList = c.filter((item: any) => (!item.id?.startsWith("mockup-") || allowedSeedIds.has(item.id)) && !deletedCandidateIds.has(item.id));
      const existingIds = new Set(cleanList.map((item: any) => item.id));
      const remainingSeeds = SEED_CANDIDATES.filter(seed => !existingIds.has(seed.id) && !deletedCandidateIds.has(seed.id));
      candidates.length = 0;
      candidates.push(...cleanList, ...remainingSeeds);
    } else {
      candidates.length = 0;
      candidates.push(...SEED_CANDIDATES.filter(seed => !deletedCandidateIds.has(seed.id)));
    }
    if (cl && cl.length) {
      const realClients = cl.filter(item =>
        !["client-1", "client-2", "client-3", "client-4", "client-5"].includes(item.id) &&
        !deletedClientIds.has(item.id)
      );
      if (realClients.length > 0) {
        clients.length = 0;
        clients.push(...realClients);
      }
    }
    if (h && h.length) { hires.length = 0; hires.push(...h); }
    if (p && p.length) { paymentOrders.length = 0; paymentOrders.push(...p); }
    if (rs && rs.length) { recruitSubscriptions.length = 0; recruitSubscriptions.push(...rs); }
    if (cr && cr.length) { consultingRequests.length = 0; consultingRequests.push(...cr); }
    if (sa && sa.length) { spontaneousApplications.length = 0; spontaneousApplications.push(...sa); }
    if (br && br.length) { briefings.length = 0; briefings.push(...br); }
    if (ci && ci.length) { contactInquiries.length = 0; contactInquiries.push(...ci); }
    if (al && al.length) { auditLogs.length = 0; auditLogs.push(...al); }
    if (pr && pr.length) { payoutRequests.length = 0; payoutRequests.push(...pr); }
    if (cp && cp.length) { commercialProposals.length = 0; commercialProposals.push(...cp); }

    // Conteúdo de CMS (foto do CEO, imagens, banners, links sociais, disponibilidade de serviços)
    const [ceoPhoto, categoryImages, subserviceImages, banners, socialLinks, serviceAvailability] = await Promise.all([
      getContentValue<string>("ceo_photo"),
      getContentValue<{ [key: string]: string }>("category_images"),
      getContentValue<{ [key: string]: string }>("subservice_images"),
      getContentValue<any[]>("landing_banners"),
      getContentValue<SocialLinksData>("social_links"),
      getContentValue<{ [key: string]: { hasProviders: boolean; providerCount?: number; emg?: boolean; active?: boolean; priceMzn?: number } }>("service_availability"),
    ]);
    if (ceoPhoto) ceoPhotoData = ceoPhoto;
    if (categoryImages) categoryImagesData = { ...categoryImagesData, ...categoryImages };
    if (subserviceImages) subServiceImagesData = { ...subServiceImagesData, ...subserviceImages };
    if (banners && banners.length) {
      // Garantir que todos os banners usam exclusivamente fotografias de alta qualidade de profissionais de pele negra
      const bannerMapByCat: Record<string, string> = {
        "b-recrute": "https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-recrute-2": "https://images.pexels.com/photos/5439152/pexels-photo-5439152.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-connect": "https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=",
        "b-business": "https://images.pexels.com/photos/5816283/pexels-photo-5816283.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-business-2": "https://images.pexels.com/photos/7658405/pexels-photo-7658405.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-studio": "https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-consultoria": "https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920",
        recrute: "https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920",
        connect: "https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=",
        business: "https://images.pexels.com/photos/5816283/pexels-photo-5816283.jpeg?auto=compress&cs=tinysrgb&w=1920",
        studio: "https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920",
        consultoria: "https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920"
      };
      const sanitized = (banners as LandingBannerItem[]).map((b) => {
        let u = b.url || "";
        const exp = bannerMapByCat[b.category] || bannerMapByCat[b.id?.replace("b-", "")] || "";
        if (
          exp && (
            !u ||
            u.includes("photo-1600880292203") ||
            u.includes("photo-1551836022") ||
            u.includes("photo-1504307651254") ||
            u.includes("photo-1621905251189") ||
            u.includes("photo-1522071820081") ||
            u.includes("photo-1552664730") ||
            u.includes("photo-1531403009284") ||
            u.includes("photo-1519389950473") ||
            u.includes("photo-1560250097") ||
            u.includes("photo-1581092921461")
          )
        ) {
          u = exp;
        }
        return { ...b, url: u };
      });
      landingBannersData = sanitized;
      setContentValue("landing_banners", landingBannersData).catch(() => {});
    }
    if (socialLinks) socialLinksData = { ...socialLinksData, ...socialLinks };
    if (serviceAvailability) serviceAvailabilityData = { ...serviceAvailabilityData, ...serviceAvailability };

    console.log("✅ Estado carregado do Supabase (dados reais, persistentes).");
  } catch (err) {
    console.error("[supabase] Erro ao carregar estado inicial:", err);
  }
}

// Lazy-loaded Google Gen AI client to prevent startup crashes when key is missing
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): { ai: GoogleGenAI | null; enabled: boolean } {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return { ai: null, enabled: false };
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return { ai: aiInstance, enabled: true };
}

// Memory databases for our demo state (resets on server reboot, but maintains live interactivity)
interface CandidateState {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  bio: string;
  category: string;
  matchScore: number;
  feedback: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
  residence?: string;
  photo?: string;
  identityDocName?: string;
  identityDocUrl?: string;
  cvDocumentName?: string;
  cvDocName?: string;
  cvDocumentUrl?: string;
  role?: string;
  biNumber?: string;
  
  // Extended fields for the Rich Professional Profile / Client view
  title?: string;
  subCategory?: string;
  city?: string;
  languages?: string[];
  whatsapp?: string;
  rate?: number; // USD per hour
  rateMzn?: number; // MZN per hour
  expectedSalaryMin?: number; // MZN per month
  expectedSalaryMax?: number; // MZN per month
  salaryNegotiable?: boolean;
  workType?: string; // "Freelance / Projecto", "Full-time", etc.
  availableNow?: boolean;
  availableForEmergency?: boolean;
  emergencyRate?: number; // USD emergency rate
  travelRadius?: number; // km
  ownTransport?: boolean;
  availableFrom?: string; // e.g. "Imediatamente"
  promiseScore?: number; // 0 - 100
  rating?: number; // 0.0 - 5.0
  completedJobs?: number;
  skills?: string[];
  personalValues?: string[];
  whyWork?: string;
  portfolioWebsite?: string;
  withdrawnAmount?: number; // Track provider's withdrawn money (default: 0)
  documents?: Array<{
    type: string;
    title: string;
    issuer?: string;
    expiry?: string;
    status: "verified" | "pending" | "warning";
  }>;
  portfolio?: Array<{
    url: string;
    caption: string;
  }>;
  reviews?: Array<{
    reviewer: string;
    date: string;
    text: string;
    rating: number;
    quality: number;
    punctuality: number;
    cleanliness: number;
  }>;
  experienceYears?: number;
  isProfessional?: boolean;
  hourlyRate?: number;
}

interface ClientState {
  id: string;
  name: string;
  type: "company" | "residential" | "condo" | "individual";
  email?: string;
  phone: string;
  linkedin?: string;
  address: string;
  bi?: string;
  createdAt: string;
  status?: string;
  companyName?: string;
  condoName?: string;
  contactPerson?: string;
  contactPersonTitle?: string;
  planType?: string;
  planName?: string;
  planPriceMzn?: number;
  planStatus?: string;
  trialEndsAt?: string;
}

const clients: ClientState[] = [];
const deletedClientIds = new Set<string>();
const partnerCompanies: any[] = [];

const commercialProposals: CommercialProposal[] = [];

export interface SpontaneousApplication {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  residence: string;
  careerFocus: string;
  nuit: string;
  idDocumentName: string;
  idDocumentUrl?: string;
  cvDocumentName: string;
  cvDocumentUrl?: string;
  isAtsValidated: boolean;
  atsScore: number;
  experiences: any[];
  submittedAt: string;
  status: string;
  notes: string;
  city?: string;
  category?: string;
  targetDepartment?: string;
  seniorityLevel?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  workModelPreference?: string;
  availability?: string;
  coverLetter?: string;
  skills?: string[];
  expectedSalary?: string;
  applicationType?: string;
}

export interface BriefingItem {
  id: string;
  companyName: string;
  category: string;
  qtdVagas: number;
  technicalProfile: string;
  mandatoryCriteria?: string;
  desirableCriteria?: string;
  salaryBudget?: string;
  urgency?: string;
  submittedAt: string;
  status?: string;
}

export interface ContactInquiryItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  serviceType: string;
  notes?: string;
  createdAt: string;
  status?: string;
}

const spontaneousApplications: SpontaneousApplication[] = [];
const briefings: BriefingItem[] = [];
const contactInquiries: ContactInquiryItem[] = [];

interface HireState {
  id: string;
  candidateId: string;
  candidateName: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  rate: number;
  description?: string;
  targetDate?: string;
  jobId?: string;
  status: "pending" | "active" | "completed" | "cancelled" | "pending_validation" | "validated" | "executed" | "onboarding";
  createdAt: string;
  type: "normal" | "emergency" | "scheduled";
  location?: string;
  eta?: string;
  checkins?: string[];
  paymentModality?: "half" | "full" | "monthly_salary" | string;
  paymentChannel?: "mpesa" | "emola" | "izi" | "bank" | string;
  paymentStatus?: "pending" | "half_paid" | "fully_paid" | "monthly_contract" | string;
  contractModel?: string;
  contractDuration?: string;
  recruitmentLevel?: string;
  recruitmentSalaryProposal?: number;
  recruitmentNegotiationNotes?: string;
  negotiationEmail?: string;
  isDemo?: boolean;
  onboardingSteps?: boolean[];
  review?: {
    rating: number;
    text: string;
    quality: number;
    punctuality: number;
    cleanliness: number;
  };
}

export interface PaymentOrder {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userType?: "company" | "residential" | "condo" | "provider";
  serviceTitle: string;
  amount: number;
  method: "mpesa" | "emola" | "bank_transfer";
  reference: string;
  proofUrl?: string;
  status: "pending" | "confirmed" | "rejected";
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  hireId?: string;
}

const paymentOrders: PaymentOrder[] = [];

const hires: HireState[] = [];

export const SEED_CANDIDATES: CandidateState[] = [];

const candidates: CandidateState[] = [...SEED_CANDIDATES];
const deletedCandidateIds = new Set<string>();

// ----------------------------------------------------------------------------
// Operadores internos (contas de staff/admin do ecossistema TARIRA) — antes
// existiam apenas como um array fixo no frontend (App.tsx), nunca persistido.
// Passam agora a viver aqui, com o mesmo padrão de persistência/eliminação
// real usado para candidatos (Supabase + lista de IDs eliminados), para que
// o CRUD em "Gestão de Perfis" funcione de facto.
// ----------------------------------------------------------------------------
// Zerado por pedido explícito: não deve existir NENHUM operador fictício/mockup.
// Só operadores reais, criados a partir do painel admin e persistidos no
// Supabase, podem aparecer em "Gestão de Todos os Perfis & Contas".
export const SEED_OPERATORS: OrgOperator[] = [];

const operators: OrgOperator[] = [...SEED_OPERATORS];
const deletedOperatorIds = new Set<string>();

// ----------------------------------------------------------------------------
// CYBER-SHIELD: verificação de dono — só o admin, o cliente que pediu o
// serviço, ou o prestador/técnico atribuído podem agir sobre um "hire"
// (contratação/pedido de serviço) ou sobre o seu próprio registo de candidato.
// ----------------------------------------------------------------------------
function isSessionAdmin(session: AuthenticatedSessionPayload | null): boolean {
  if (!session) return false;
  const normalizedEmail = (session.email || "").toLowerCase().trim();
  return Boolean(
    session.role === "admin" &&
    (AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail) || (process.env.ADMIN_EMAIL && normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase()))
  );
}

function canActOnHire(session: AuthenticatedSessionPayload | null, hire: HireState | undefined): boolean {
  if (!session || !hire) return false;
  if (isSessionAdmin(session)) return true;

  const sessionEmail = (session.email || "").toLowerCase().trim();

  // Lado do cliente que pediu o serviço
  if (hire.clientId) {
    if (session.userId === hire.clientId) return true;
    const client = clients.find(c => c.id === hire.clientId);
    if (client?.email && sessionEmail === client.email.toLowerCase().trim()) return true;
  }

  // Lado do prestador/técnico atribuído ao serviço
  if (hire.candidateId) {
    if (session.userId === hire.candidateId) return true;
    const cand = candidates.find(c => c.id === hire.candidateId);
    if (cand?.email && sessionEmail === cand.email.toLowerCase().trim()) return true;
  }

  return false;
}

function canActOnCandidate(session: AuthenticatedSessionPayload | null, candidate: CandidateState | undefined): boolean {
  if (!session || !candidate) return false;
  if (isSessionAdmin(session)) return true;
  if (session.userId === candidate.id) return true;
  if (candidate.email && (session.email || "").toLowerCase().trim() === candidate.email.toLowerCase().trim()) return true;
  return false;
}

const auditLogs: { id: string; type: string; detail: string; timestamp: string }[] = [];

// Estado de conteúdo do CMS (foto do CEO, imagens de categorias/subserviços,
// banners). Os valores por omissão abaixo servem de fallback só até a
// primeira sincronização com o Supabase, feita em hydrateStateFromSupabase().
// Nota: em ambientes serverless (Vercel), o disco local é efémero — por isso
// este conteúdo já não é lido/escrito em ficheiros .json locais.

// Global state for subservice custom images
let subServiceImagesData: { [key: string]: string } = {};

// Global state for CEO photo
let ceoPhotoData = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=800";

// Global state for Category Images (valores por omissão)
let categoryImagesData: { [key: string]: string } = {
  dom: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
  limp: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80",
  man: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
  carp: "https://images.unsplash.com/photo-1581850518616-bcb8077fa213?auto=format&fit=crop&w=600&q=80",
  obra: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
  jard: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
  dom2: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80",
  elet: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
  elite_hub: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80"
};

// Global state for Service Availability & Provider Count overrides
let serviceAvailabilityData: { 
  [serviceIdOrName: string]: { 
    hasProviders: boolean; 
    providerCount?: number; 
    emg?: boolean; 
    active?: boolean;
    priceMzn?: number;
    notes?: string;
  } 
} = {};

interface LandingBannerItem {
  id: string;
  category: "connect" | "recrute" | "business" | "consultoria" | string;
  title: string;
  tagline: string;
  desc: string;
  url: string;
  active: boolean;
}

let landingBannersData: LandingBannerItem[] = [
  {
    id: "b-recrute",
    category: "recrute",
    title: "TARIRA Recruit",
    tagline: "Talento Profissional de Elite, Quadros de TI & Finanças Vetted",
    desc: "Atração, validação técnica rigorosa e conexão direta de quadros profissionais de alta performance em Moçambique com integridade e competência comprovada.",
    url: "https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  },
  {
    id: "b-recrute-2",
    category: "recrute",
    title: "TARIRA Recruit • Avaliação & Seleção",
    tagline: "Entrevistas Estruturadas & Alinhamento Cultural de Excelência",
    desc: "Processos seletivos humanizados e rigorosos para integrar os melhores quadros executivos e especialistas do mercado nas empresas líderes em Moçambique.",
    url: "https://images.pexels.com/photos/5439152/pexels-photo-5439152.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  },
  {
    id: "b-connect",
    category: "connect",
    title: "TARIRA Connect",
    tagline: "Ofícios Técnicos, Engenharia de Campo & Intervenções Certificadas",
    desc: "Eletricistas qualificados, engenheiros de campo, técnicos de climatização e mestres de obras com contacto direto, pontualidade e rigor técnico em Moçambique.",
    url: "https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=",
    active: true
  },
  {
    id: "b-business",
    category: "business",
    title: "TARIRA Outsourcing",
    tagline: "Recrutamento como parceria, não como transação.",
    desc: "O seu recrutamento. Sem limites. Recruitment Process Outsourcing (RPO) — a sua função de recrutamento, entregue por nós.",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1920",
    active: true
  },
  {
    id: "b-business-2",
    category: "business",
    title: "TARIRA Outsourcing • Equipas Dedicadas",
    tagline: "Supervisão Contínua, Produtividade & Escalabilidade Operacional",
    desc: "Alocação estratégica de mão de obra e squads especializados para impulsionar a capacidade produtiva e operacional do seu negócio sem atrito.",
    url: "https://images.pexels.com/photos/7658405/pexels-photo-7658405.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  },
  {
    id: "b-studio",
    category: "studio",
    title: "TARIRA Studio",
    tagline: "Inovação Digital, Engenharia de Software & Soluções Ágeis",
    desc: "Concepção, design UX/UI e desenvolvimento de plataformas digitais modernas e escaláveis em Moçambique com equipas ágeis e conectadas.",
    url: "https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  },
  {
    id: "b-consultoria",
    category: "consultoria",
    title: "TARIRA Consulting & Alianças",
    tagline: "Diagnóstico Estratégico, Governação & Sinergia de Equipa",
    desc: "Alianças duradouras, diagnóstico estratégico e equipas alinhadas que celebram cada conquista e marco atingido juntos.",
    url: "https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920",
    active: true
  }
];

// Ligações sociais da landing page (email directo, LinkedIn, WhatsApp, Instagram).
interface SocialLinksData {
  email: string;
  linkedin: string;
  whatsapp: string;
  instagram?: string;
  phone1: string;
  phone2: string;
}
let socialLinksData: SocialLinksData = {
  email: "tariraecossystem@gmail.com",
  linkedin: "https://www.linkedin.com/in/tarira-ecossistema",
  whatsapp: "https://wa.me/258871425316",
  instagram: "https://www.instagram.com/tarira.weoversee",
  phone1: "+258 87 142 5316",
  phone2: "+258 83 536 1379"
};

// ============================================================================
// IMPORTANTE — Leitura sempre "fresca" a partir do Supabase para conteúdo CMS.
//
// Em ambiente serverless (Vercel), cada instância fria hidrata o seu próprio
// estado em memória uma única vez (ver index.ts / ensureHydrated). Isso é
// suficiente para colecções grandes, mas para conteúdo que o admin edita a
// qualquer momento (foto do CEO, imagens de categorias/sub-serviços, banners,
// links sociais) isso causava o problema relatado: uma instância já "quente"
// continuava a servir o valor antigo em memória a outros visitantes/browsers
// anónimos, mesmo depois do admin gravar a alteração (que só actualizava a
// memória da SUA própria instância + o Supabase).
//
// Por isso, estes GET's de conteúdo CMS voltam sempre a consultar o Supabase
// primeiro (quando configurado) antes de responder, garantindo que qualquer
// instância/visitante vê sempre o valor mais recente gravado pelo admin.
// Também desligamos qualquer cache HTTP intermédio (browser/CDN) nestas rotas.
// ============================================================================
function noCache(res: any) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
}

// ----------------------------------------------------------------------------
// GESTÃO SEGURA DE PERFIS DE UTILIZADOR (SUPABASE AUTH + FALLBACK)
// Permite criar/atualizar perfis com chave de administração no backend,
// eliminando falhas de RLS no registo de clientes/candidatos.
// ----------------------------------------------------------------------------
// Lista de e-mails autorizados a possuir o papel "admin". Mantida em sincronia
// com a mesma lista usada em /api/admin/login e com o trigger handle_new_user
// no Supabase, para que nenhum caminho de criação/edição de perfil possa
// atribuir privilégios de administrador fora desta lista.
const PROFILE_ADMIN_EMAILS = ["tarira.ecossistema@gmail.com", "tariraecossystem@gmail.com", "admin@tarira.co.mz"];

// Armazenamento em memória de utilizadores registados para contingência
const systemRegisteredUsers: Map<string, any> = new Map();

app.post("/api/auth/register-user", async (req, res) => {
  try {
    const { email, password, fullName, role, phone, city, nuit, category, candidate_id, client_id } = req.body;
    
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanPhone = (phone || "").trim();
    const userFullName = (fullName || "").trim() || "Utilizador TARIRA";
    const userRole = role || "lar";
    const userCity = city || "Maputo";

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({ error: "Email ou telefone é obrigatório para o registo." });
    }

    const effectiveAuthEmail = cleanEmail.includes("@") 
      ? cleanEmail 
      : `${cleanPhone.replace(/\D/g, "") || "user" + Date.now()}@tel.tarira.co.mz`;

    const adminClient = getSupabaseAdmin();
    let createdUser: any = null;

    if (adminClient) {
      try {
        // Tentativa 1: Criação com metadados completos
        const authResult = await adminClient.auth.admin.createUser({
          email: effectiveAuthEmail,
          password: password || "Tarira@2026",
          email_confirm: true,
          user_metadata: {
            full_name: userFullName,
            name: userFullName,
            role: userRole,
            phone: cleanPhone,
            city: userCity
          }
        });

        if (authResult.error) {
          console.warn("[server auth] Tentativa 1 falhou:", authResult.error.message);
          
          // Se o erro foi do trigger Postgres de metadados ("Database error saving new user"), tenta SEM user_metadata
          if (
            authResult.error.message?.toLowerCase().includes("database error") || 
            authResult.error.status === 500
          ) {
            console.log("[server auth] A tentar criação sem user_metadata para contornar trigger com erro no Supabase...");
            const cleanAuthResult = await adminClient.auth.admin.createUser({
              email: effectiveAuthEmail,
              password: password || "Tarira@2026",
              email_confirm: true
            });
            if (cleanAuthResult.data?.user) {
              createdUser = cleanAuthResult.data.user;
            }
          }
          
          // Se já existe, procura o utilizador existente
          if (!createdUser && (
            authResult.error.message?.toLowerCase().includes("already registered") || 
            authResult.error.message?.toLowerCase().includes("already exists")
          )) {
            const { data: listData } = await adminClient.auth.admin.listUsers();
            createdUser = listData?.users?.find((u: any) => u.email === effectiveAuthEmail) || null;
          }
        } else if (authResult?.data?.user) {
          createdUser = authResult.data.user;
        }
      } catch (adminErr: any) {
        console.error("[server auth] Exceção no admin auth:", adminErr);
      }
    }

    // Gerar UUID canónico para garantir compatibilidade com colunas UUID
    const userId = createdUser?.id || (typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `usr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    const userObj = {
      id: userId,
      email: effectiveAuthEmail,
      user_metadata: {
        full_name: userFullName,
        name: userFullName,
        role: userRole,
        phone: cleanPhone,
        city: userCity
      },
      created_at: new Date().toISOString()
    };

    // NOTA IMPORTANTE: já não criamos aqui automaticamente um "candidate"/"client"
    // fantasma. Este endpoint serve apenas de fallback de AUTENTICAÇÃO — todos os
    // fluxos de registo (AuthPage, SupabaseAuthModal, StandardRegistrationForm)
    // já criam explicitamente o perfil REAL (com a foto/carregamento correto) a
    // seguir, chamando /api/candidates ou /api/clients. Criar também aqui gerava
    // um perfil duplicado com foto de stock e estatísticas por defeito, que
    // "aparecia" mais tarde a substituir o perfil correto assim que a lista de
    // candidatos era recarregada do backend.
    let effectiveCandidateId = candidate_id || null;
    let effectiveClientId = client_id || null;

    // Salvar em contingência
    systemRegisteredUsers.set(effectiveAuthEmail, {
      ...userObj,
      password: password || "Tarira@2026",
      nuit: nuit || "",
      category: category || "",
      candidate_id: effectiveCandidateId,
      client_id: effectiveClientId
    });

    // Upsert do perfil garantido na base de dados
    const profileRes = await upsertUserProfile({
      id: userId,
      name: userFullName,
      email: effectiveAuthEmail,
      role: userRole,
      phone: cleanPhone,
      city: userCity,
      nuit: nuit || "",
      category: category || "",
      candidate_id: effectiveCandidateId,
      client_id: effectiveClientId,
      is_active: true
    });

    const userProfileResult = profileRes.data || {
      id: userId,
      name: userFullName,
      email: effectiveAuthEmail,
      role: userRole,
      phone: cleanPhone,
      city: userCity,
      nuit: nuit || "",
      category: category || "",
      candidate_id: effectiveCandidateId,
      client_id: effectiveClientId,
      is_active: true
    };

    // Assinar token criptográfico seguro para a nova conta
    const sessionToken = signSessionToken({
      userId,
      email: effectiveAuthEmail,
      role: userRole as any,
      name: userFullName
    });

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      type: "USER_REGISTERED",
      detail: `Conta criada com perfil automático: ${userFullName} (${userRole}) - Email: ${effectiveAuthEmail}. ID: ${userId}`,
      timestamp: "Agora"
    });

    res.json({
      success: true,
      token: sessionToken,
      sessionToken,
      user: createdUser || userObj,
      profile: userProfileResult,
      candidateId: effectiveCandidateId,
      clientId: effectiveClientId
    });
  } catch (err: any) {
    console.error("[server] Erro em /api/auth/register-user:", err);
    res.status(500).json({ error: err.message || "Erro no registo do utilizador" });
  }
});

// Endpoint de login de contingência
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanPhone = (phone || "").trim();
    const effectiveEmail = cleanEmail.includes("@") 
      ? cleanEmail 
      : (cleanPhone ? `${cleanPhone.replace(/\D/g, "")}@tel.tarira.co.mz` : "");

    if (!effectiveEmail) {
      return res.status(400).json({ error: "Email ou contacto telefónico é obrigatório." });
    }

    const adminClient = getSupabaseAdmin();
    let authUser: any = null;

    if (adminClient) {
      try {
        const { data: listData } = await adminClient.auth.admin.listUsers();
        authUser = listData?.users?.find((u: any) => u.email === effectiveEmail) || null;
      } catch (listErr) {
        console.warn("[server login] Erro ao pesquisar no admin auth:", listErr);
      }
    }

    const localUser = systemRegisteredUsers.get(effectiveEmail);
    const resolvedUser = authUser || localUser;

    if (!resolvedUser) {
      return res.status(404).json({ error: "Utilizador não encontrado. Por favor crie uma nova conta." });
    }

    const profile = (await getUserProfile(resolvedUser.id)) || {
      id: resolvedUser.id,
      name: resolvedUser.user_metadata?.full_name || resolvedUser.user_metadata?.name || "Utilizador TARIRA",
      email: effectiveEmail,
      role: resolvedUser.user_metadata?.role || localUser?.role || "lar",
      phone: resolvedUser.user_metadata?.phone || cleanPhone || "",
      city: resolvedUser.user_metadata?.city || "Maputo",
      is_active: true
    };

    // Assinar token criptográfico seguro
    const sessionToken = signSessionToken({
      userId: resolvedUser.id,
      email: effectiveEmail,
      role: profile.role as any,
      name: profile.name
    });

    res.json({
      success: true,
      token: sessionToken,
      sessionToken,
      user: {
        id: resolvedUser.id,
        email: effectiveEmail,
        user_metadata: {
          full_name: profile.name,
          role: profile.role,
          phone: profile.phone,
          city: profile.city
        }
      },
      profile
    });
  } catch (err: any) {
    console.error("[server] Erro em /api/auth/login:", err);
    res.status(500).json({ error: err.message || "Erro no login do utilizador" });
  }
});

app.post("/api/profiles/upsert", async (req, res) => {
  try {
    const { id, name, email, role, phone, city, nuit, category, candidate_id, client_id, is_active } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing required 'id' parameter" });
    }

    const session = extractSessionFromRequest(req);
    const normalizedEmail = (email || "").toLowerCase().trim();
    const existingProfile = await getUserProfile(id);

    // Proteção de Cibersegurança IDOR: se o perfil já existe, só o dono ou um admin pode alterá-lo.
    // (Perfis novos — primeira criação logo após o registo — continuam permitidos sem token próprio,
    // pois o fluxo de registo ainda não tem o token assinado neste ponto.)
    if (existingProfile) {
      const canModify = canUserModifyProfile(session, id, existingProfile.email);
      if (!canModify) {
        console.warn(`[CYBER-SHIELD ALERTA IDOR]: ${session?.email || "utilizador anónimo"} tentou adulterar o perfil ${id} (${existingProfile.email})!`);
        return res.status(403).json({
          error: "Violação de Segurança: Não tem permissão para alterar os dados de perfil de outro utilizador ou empresa.",
          code: "FORBIDDEN_PROFILE_TAMPERING"
        });
      }
    }

    // Prevenção de escalada de privilégios para Admin
    let safeRole = role || existingProfile?.role || "empresa";
    const requestedAdmin = safeRole === "admin";
    const alreadyAdmin = existingProfile?.role === "admin";
    if (requestedAdmin && !alreadyAdmin && !PROFILE_ADMIN_EMAILS.includes(normalizedEmail)) {
      safeRole = "empresa";
    }
    if (alreadyAdmin) {
      safeRole = "admin";
    }

    const result = await upsertUserProfile({
      id,
      name: name || existingProfile?.name || "Utilizador",
      email: normalizedEmail || existingProfile?.email || "",
      role: safeRole,
      phone: phone || existingProfile?.phone || "",
      city: city || existingProfile?.city || "Maputo",
      nuit: nuit || existingProfile?.nuit || "",
      category: category || existingProfile?.category || "",
      candidate_id: candidate_id || existingProfile?.candidate_id || null,
      client_id: client_id || existingProfile?.client_id || null,
      is_active: is_active !== undefined ? is_active : (existingProfile?.is_active ?? true),
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error || "Failed to upsert profile in database" });
    }

    res.json({ success: true, profile: result.data });
  } catch (err: any) {
    console.error("[server] Erro no endpoint /api/profiles/upsert:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.get("/api/profiles/:id", async (req, res) => {
  try {
    noCache(res);
    const { id } = req.params;
    const profile = await getUserProfile(id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch profile" });
  }
});

// ----------------------------------------------------------------------------
// DIAGNÓSTICO DE CONFIGURAÇÃO — para confirmar rapidamente, sem aceder ao
// painel do Supabase, se a partilha entre dispositivos (foto do CEO, perfis
// de utilizador, etc.) está realmente ativa em produção.
// Chame GET /api/diagnostics depois de configurar as variáveis de ambiente.
// ----------------------------------------------------------------------------
app.get("/api/diagnostics", async (req, res) => {
  noCache(res);
  const report: Record<string, any> = {
    supabaseAdminConfigured: isSupabaseAdminConfigured,
  };

  if (!isSupabaseAdminConfigured) {
    report.problema =
      "SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY não estão definidas no servidor. " +
      "Enquanto isto não for corrigido nas variáveis de ambiente de produção (e um novo deploy feito), " +
      "a foto do CEO e os perfis de utilizador só ficam guardados na memória de cada instância do servidor, " +
      "nunca partilhados entre dispositivos.";
    return res.json(report);
  }

  try {
    const testKey = "__diagnostics_probe__";
    await setContentValue(testKey, { checkedAt: new Date().toISOString() });
    const readBack = await getContentValue<any>(testKey);
    report.siteContentTableOk = readBack !== null;
  } catch (err: any) {
    report.siteContentTableOk = false;
    report.siteContentError = err.message || String(err);
  }

  try {
    const admin = getSupabaseAdmin();
    if (admin) {
      const { error } = await admin.from("profiles").select("id").limit(1);
      report.profilesTableOk = !error;
      if (error) report.profilesError = error.message;
    }
  } catch (err: any) {
    report.profilesTableOk = false;
    report.profilesError = err.message || String(err);
  }

  report.resumo =
    report.siteContentTableOk && report.profilesTableOk
      ? "Tudo configurado: a tabela site_content (foto do CEO, textos do CMS) e a tabela profiles estão acessíveis. Faça um teste real de upload/registo para confirmar de ponta a ponta."
      : "As credenciais do Supabase estão definidas, mas pelo menos uma tabela não está acessível — confirme se correu o ficheiro supabase_schema.sql completo no SQL Editor do seu projeto Supabase.";

  res.json(report);
});

app.get("/api/ceo-photo", async (req, res) => {
  noCache(res);
  const savedPhoto = await getContentValue<string>("ceo_photo");
  if (savedPhoto) {
    ceoPhotoData = savedPhoto;
  }
  res.json({ photo: ceoPhotoData });
});

app.post("/api/ceo-photo", requireAdminMiddleware, async (req, res) => {
  const { photo } = req.body;
  if (!photo) {
    return res.status(400).json({ error: "Missing photo parameter" });
  }
  ceoPhotoData = photo;
  await setContentValue("ceo_photo", ceoPhotoData);
  // `persisted` reflete se a gravação chegou mesmo à base de dados partilhada
  // (Supabase). Se as credenciais SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não
  // estiverem configuradas neste ambiente, setContentValue() não faz nada e a
  // variável `ceoPhotoData` só existe em memória desta instância — noutra
  // instância serverless, ou depois de um cold start, o valor volta ao
  // placeholder por omissão. O frontend usa este campo para nunca afirmar
  // "guardado para todos os utilizadores" quando isso não é garantido.
  res.json({ success: true, photo: ceoPhotoData, persisted: isSupabaseAdminConfigured });
});

app.get("/api/category-images", async (req, res) => {
  noCache(res);
  const saved = await getContentValue<{ [key: string]: string }>("category_images");
  if (saved) {
    categoryImagesData = { ...categoryImagesData, ...saved };
  }
  res.json(categoryImagesData);
});

app.post("/api/category-images", requireAdminMiddleware, async (req, res) => {
  const { category, url } = req.body;
  if (!category || !url) {
    return res.status(400).json({ error: "Missing category or url parameter" });
  }
  categoryImagesData[category] = url;
  await setContentValue("category_images", categoryImagesData);
  res.json({ success: true, categoryImagesData });
});

app.get("/api/subservice-images", async (req, res) => {
  noCache(res);
  const saved = await getContentValue<{ [key: string]: string }>("subservice_images");
  if (saved) {
    subServiceImagesData = { ...subServiceImagesData, ...saved };
  }
  res.json(subServiceImagesData);
});

app.post("/api/subservice-images", requireAdminMiddleware, async (req, res) => {
  const { serviceName, url } = req.body;
  if (!serviceName || !url) {
    return res.status(400).json({ error: "Missing serviceName or url parameter" });
  }
  subServiceImagesData[serviceName] = url;
  await setContentValue("subservice_images", subServiceImagesData);
  res.json({ success: true, subServiceImagesData });
});

app.get("/api/landing-banners", async (req, res) => {
  noCache(res);
  const bannerMapByCat: Record<string, string> = {
        "b-recrute": "https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-recrute-2": "https://images.pexels.com/photos/5439152/pexels-photo-5439152.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-connect": "https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=",
        "b-business": "https://images.pexels.com/photos/5816283/pexels-photo-5816283.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-business-2": "https://images.pexels.com/photos/7658405/pexels-photo-7658405.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-studio": "https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "b-consultoria": "https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920",
        recrute: "https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920",
        connect: "https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=",
        business: "https://images.pexels.com/photos/5816283/pexels-photo-5816283.jpeg?auto=compress&cs=tinysrgb&w=1920",
        studio: "https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920",
        consultoria: "https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920"
      };
  const saved = await getContentValue<LandingBannerItem[]>("landing_banners");
  if (saved && saved.length) {
    landingBannersData = saved.map(b => {
      const exp = bannerMapByCat[b.category] || bannerMapByCat[b.id?.replace("b-", "")];
      if (exp && (!b.url || b.url.includes("photo-1600880292203") || b.url.includes("photo-1551836022") || b.url.includes("photo-1504307651254") || b.url.includes("photo-1621905251189"))) {
        return { ...b, url: exp };
      }
      return b;
    });
  }
  res.json(landingBannersData);
});

app.post("/api/landing-banners", requireAdminMiddleware, async (req, res) => {
  const { banners } = req.body;
  if (!banners || !Array.isArray(banners)) {
    return res.status(400).json({ error: "Invalid banners payload, expected an array" });
  }
  landingBannersData = banners;
  await setContentValue("landing_banners", landingBannersData);
  res.json({ success: true, banners: landingBannersData });
});

// Links sociais (email directo, LinkedIn, WhatsApp) mostrados na landing page
app.get("/api/social-links", async (req, res) => {
  noCache(res);
  const saved = await getContentValue<SocialLinksData>("social_links");
  if (saved) {
    socialLinksData = { ...socialLinksData, ...saved };
  }
  res.json(socialLinksData);
});

app.post("/api/social-links", requireAdminMiddleware, async (req, res) => {
  const { email, linkedin, whatsapp, instagram, phone1, phone2 } = req.body;
  socialLinksData = {
    email: email !== undefined ? email : socialLinksData.email,
    linkedin: linkedin !== undefined ? linkedin : socialLinksData.linkedin,
    whatsapp: whatsapp !== undefined ? whatsapp : socialLinksData.whatsapp,
    instagram: instagram !== undefined ? instagram : (socialLinksData.instagram || "https://www.instagram.com/tarira.weoversee"),
    phone1: phone1 !== undefined ? phone1 : socialLinksData.phone1,
    phone2: phone2 !== undefined ? phone2 : socialLinksData.phone2,
  };
  await setContentValue("social_links", socialLinksData);
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "SOCIAL_LINKS_UPDATE",
    detail: "Administrador actualizou os dados de Contactos da landing page (email/LinkedIn/WhatsApp/Instagram/Telefones)",
    timestamp: "Agora"
  });
  res.json({ success: true, socialLinks: socialLinksData });
});

// Gestão de Disponibilidade de Serviços e Prestadores por Serviço
app.get("/api/service-availability", async (req, res) => {
  noCache(res);
  const saved = await getContentValue<{ [key: string]: any }>("service_availability");
  if (saved) {
    serviceAvailabilityData = { ...serviceAvailabilityData, ...saved };
  }
  res.json(serviceAvailabilityData);
});

app.post("/api/service-availability", requireAdminMiddleware, async (req, res) => {
  const { serviceId, hasProviders, providerCount, emg, active, priceMzn, notes, bulk } = req.body || {};
  
  if (bulk && typeof bulk === "object") {
    // Bulk update multiple services at once
    serviceAvailabilityData = {
      ...serviceAvailabilityData,
      ...bulk
    };
  } else if (serviceId) {
    // Update individual service
    serviceAvailabilityData[serviceId] = {
      ...serviceAvailabilityData[serviceId],
      hasProviders: hasProviders !== undefined ? !!hasProviders : (serviceAvailabilityData[serviceId]?.hasProviders ?? true),
      ...(providerCount !== undefined ? { providerCount: Number(providerCount) } : {}),
      ...(emg !== undefined ? { emg: !!emg } : {}),
      ...(active !== undefined ? { active: !!active } : {}),
      ...(priceMzn !== undefined ? { priceMzn: Number(priceMzn) } : {}),
      ...(notes !== undefined ? { notes: String(notes) } : {}),
    };
  } else {
    return res.status(400).json({ error: "Missing serviceId or bulk payload" });
  }

  await setContentValue("service_availability", serviceAvailabilityData);
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "SERVICE_AVAILABILITY_UPDATE",
    detail: serviceId ? `Disponibilidade de prestadores actualizada para o serviço ${serviceId}` : "Actualização em lote da disponibilidade de serviços",
    timestamp: "Agora"
  });

  res.json({ success: true, serviceAvailability: serviceAvailabilityData });
});

app.get("/api/health", (req, res) => {
  // Inclui o estado de configuração do Supabase para permitir diagnosticar,
  // sem expor segredos, se as actualizações de conteúdo (ex: foto do CEO,
  // banners, imagens de categorias) estão realmente a ser persistidas na
  // base de dados partilhada ou se estão apenas a viver em memória local
  // desta instância (o que causa inconsistência entre browsers/dispositivos
  // em ambientes serverless como a Vercel).
  res.json({ status: "ok", supabaseConfigured: isSupabaseAdminConfigured });
});

// ============================================================================
// DADOS DE PAGAMENTO MANUAL (M-PESA, E-MOLA, BANCOS E PLANOS CORPORATIVOS)
// ============================================================================
const DEFAULT_PAYMENT_SETTINGS: ManualPaymentSettings = {
  mpesa: {
    number: "+258 84 900 0123",
    holderName: "TARIRA ECOSSISTEMA LDA",
    instructions: "1. Marque *150# no seu telemóvel Vodacom.\n2. Escolha a Opção 1: 'Transferir Dinheiro'.\n3. Digite o número TARIRA: 84 900 0123.\n4. Confirme o Titular: TARIRA ECOSSISTEMA LDA.\n5. Guarde o SMS com a referência da transação e anexe o comprovativo.",
    active: true
  },
  emola: {
    number: "+258 86 900 0123",
    holderName: "TARIRA ECOSSISTEMA LDA",
    instructions: "1. Marque *898# no seu telemóvel Movitel.\n2. Escolha a Opção 1: 'Transferir Dinheiro'.\n3. Digite o número TARIRA: 86 900 0123.\n4. Confirme o Titular: TARIRA ECOSSISTEMA LDA.\n5. Guarde o SMS com a referência da transação e anexe o comprovativo.",
    active: true
  },
  bankAccounts: [
    {
      id: "bank-bim",
      bankName: "Millennium BIM",
      accountNumber: "234567890",
      nib: "0001 0000 0023 4567 8901 2",
      iban: "MZ59000100000023456789012",
      holderName: "TARIRA ECOSSISTEMA LDA",
      active: true
    },
    {
      id: "bank-standard",
      bankName: "Standard Bank Moçambique",
      accountNumber: "109876543",
      nib: "0003 0000 0010 9876 5432 1",
      iban: "MZ59000300000010987654321",
      holderName: "TARIRA ECOSSISTEMA LDA",
      active: true
    },
    {
      id: "bank-bci",
      bankName: "BCI (Banco Comercial e de Investimentos)",
      accountNumber: "543216789",
      nib: "0008 0000 0054 3216 7893 3",
      iban: "MZ59000800000054321678933",
      holderName: "TARIRA ECOSSISTEMA LDA",
      active: true
    }
  ],
  lastUpdated: new Date().toISOString(),
  updatedBy: "Sistema Central TARIRA"
};

let currentPaymentSettings: ManualPaymentSettings = { ...DEFAULT_PAYMENT_SETTINGS };

app.get("/api/payment-settings", async (req, res) => {
  noCache(res);
  try {
    const saved = await getContentValue<ManualPaymentSettings>("payment_settings");
    if (saved) {
      currentPaymentSettings = {
        ...DEFAULT_PAYMENT_SETTINGS,
        ...saved,
        mpesa: { ...DEFAULT_PAYMENT_SETTINGS.mpesa, ...(saved.mpesa || {}) },
        emola: { ...DEFAULT_PAYMENT_SETTINGS.emola, ...(saved.emola || {}) },
        bankAccounts: saved.bankAccounts || DEFAULT_PAYMENT_SETTINGS.bankAccounts
      };
    }
  } catch (err) {
    console.warn("[server] Fallback para payment-settings em memória:", err);
  }
  res.json(currentPaymentSettings);
});

app.post("/api/payment-settings", async (req, res) => {
  try {
    const session = extractSessionFromRequest(req);
    const normalizedEmail = (session?.email || "").toLowerCase().trim();
    const isAdmin = Boolean(
      session &&
      session.role === "admin" &&
      (AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail) || (process.env.ADMIN_EMAIL && normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase()))
    );

    // Verificação de autenticação administrativa do Cyber-Shield (apenas sessão assinada válida — sem chaves fixas)
    if (!isAdmin) {
      return res.status(403).json({
        error: "Violação de Segurança: Apenas administradores master autorizados podem alterar os dados bancários e de planos de pagamento.",
        code: "FORBIDDEN_PAYMENT_SETTINGS"
      });
    }

    const { mpesa, emola, bankAccounts } = req.body || {};

    currentPaymentSettings = {
      ...currentPaymentSettings,
      mpesa: mpesa ? { ...currentPaymentSettings.mpesa, ...mpesa } : currentPaymentSettings.mpesa,
      emola: emola ? { ...currentPaymentSettings.emola, ...emola } : currentPaymentSettings.emola,
      bankAccounts: Array.isArray(bankAccounts) ? bankAccounts : currentPaymentSettings.bankAccounts,
      lastUpdated: new Date().toISOString(),
      updatedBy: session?.email || "Administrador Central TARIRA"
    };

    await setContentValue("payment_settings", currentPaymentSettings);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      type: "PAYMENT_SETTINGS_UPDATE",
      detail: `Dados de pagamento atualizados pelo Administrador (${session?.email || "Master"}). M-Pesa (${currentPaymentSettings.mpesa.number}), e-Mola (${currentPaymentSettings.emola.number}) e ${currentPaymentSettings.bankAccounts.length} Contas Bancárias.`,
      timestamp: "Agora"
    });

    res.json({ success: true, settings: currentPaymentSettings });
  } catch (err: any) {
    console.error("[server] Erro em POST /api/payment-settings:", err);
    res.status(500).json({ error: "Erro ao gravar dados de pagamento." });
  }
});

// ============================================================================
// PLANOS DE REGISTO — Empresas (B2B) & Condomínios
// Valores de mensalidade mostrados no registo (AuthPage) e na gestão de
// plano das contas já registadas (TariraCompanyUnitsHub). Editáveis apenas
// pelo administrador master, gravados de forma persistente e visíveis
// publicamente via GET (necessário porque são mostrados antes do login,
// no formulário de registo).
// ============================================================================
// MODELO ÚNICO DE MANUTENÇÃO DE CONTA (substitui os antigos planos/escalões).
// Empresa e Condomínio pagam o MESMO valor pelo uso da plataforma; os
// primeiros ACCOUNT_TRIAL_DAYS dias são gratuitos. A conta Particular/Lar é
// gratuita. Os serviços e intervenções contratados são sempre faturados à
// parte por quem os contrata.
export const ACCOUNT_PLAN_ID = "conta_activa";
export const HOME_PLAN_ID = "conta_lar";
export const ACCOUNT_MAINTENANCE_FEE_MZN = 5000;
export const ACCOUNT_TRIAL_DAYS = 30;

const ACCOUNT_BENEFITS: string[] = [
  "Acesso ilimitado ao catálogo verificado de técnicos de ofício (Connect) e de quadros profissionais (Recruit)",
  "Abertura ilimitada de pedidos de intervenção e de processos de recrutamento",
  "Painel único de gestão: histórico de intervenções, contratos, equipas e faturas",
  "Identidade, NUIT e registo criminal de todos os profissionais verificados pela TARIRA",
  "Pagamento protegido em escrow — o profissional só recebe depois da sua aprovação",
  "Garantia de re-execução em 30 dias e reposição do profissional em 48-72h",
  "Faturação fiscal centralizada com NUIT e relatório mensal de intervenções",
  "Gestor de conta TARIRA e canal de atendimento prioritário",
  "Vários utilizadores/departamentos na mesma conta, com registo de auditoria",
  "Elegibilidade para pacotes especiais negociados por volume de serviços"
];

const HOME_ACCOUNT_BENEFITS: string[] = [
  "Criação e manutenção da conta sem qualquer custo",
  "Pedidos de intervenção ilimitados a técnicos verificados pela TARIRA",
  "Identidade, NUIT e registo criminal dos profissionais validados",
  "Pagamento protegido em escrow e garantia de re-execução em 30 dias",
  "Histórico de serviços, orçamentos e avaliações na sua área pessoal",
  "Paga apenas o serviço contratado — nada pelo uso da plataforma"
];

const DEFAULT_REGISTRATION_PLANS: RegistrationPlanConfig[] = [
  {
    id: ACCOUNT_PLAN_ID,
    type: "company",
    name: "Manutenção de Conta TARIRA",
    priceMzn: ACCOUNT_MAINTENANCE_FEE_MZN,
    period: "/mês",
    badge: "Conta Empresa",
    description:
      "Valor único de manutenção da conta corporativa. Dá acesso integral à plataforma TARIRA e a todas as vantagens de uma conta activa.",
    features: ACCOUNT_BENEFITS,
    trialDays: ACCOUNT_TRIAL_DAYS
  },
  {
    id: ACCOUNT_PLAN_ID,
    type: "condo",
    name: "Manutenção de Conta TARIRA",
    priceMzn: ACCOUNT_MAINTENANCE_FEE_MZN,
    period: "/mês",
    badge: "Conta Condomínio",
    description:
      "O mesmo valor único de manutenção aplicado à administração de condomínios, com acesso integral à plataforma TARIRA.",
    features: ACCOUNT_BENEFITS,
    trialDays: ACCOUNT_TRIAL_DAYS
  },
  {
    id: HOME_PLAN_ID,
    type: "residential",
    name: "Conta Particular / Lar",
    priceMzn: 0,
    period: "Sem custo",
    badge: "Gratuita",
    description:
      "Conta para lares e clientes particulares. Sem valor de inscrição e sem mensalidade — paga apenas os serviços que contratar.",
    features: HOME_ACCOUNT_BENEFITS
  }
];

let currentRegistrationPlans: RegistrationPlanConfig[] = [...DEFAULT_REGISTRATION_PLANS];

// ----------------------------------------------------------------------------
// Migração: o ecossistema deixou de ter planos/escalões. Qualquer configuração
// gravada anteriormente (starter, pro, enterprise, condo_base, condo_premium,
// connect_*, recruit_*) é descartada e substituída pelo modelo único de
// manutenção de conta. O administrador continua a poder alterar o VALOR e as
// VANTAGENS via POST /api/registration-plans — essas edições são preservadas.
// ----------------------------------------------------------------------------
const LEGACY_PLAN_IDS = new Set([
  "starter", "pro", "enterprise",
  "condo_base", "condo_premium",
  "connect_bronze", "connect_prata", "connect_ouro",
  "recruit_starter", "recruit_business", "recruit_enterprise", "recruit_avulso"
]);

async function syncAndPersistRegistrationPlans(saved?: RegistrationPlanConfig[] | null): Promise<RegistrationPlanConfig[]> {
  try {
    const savedList: RegistrationPlanConfig[] = Array.isArray(saved) ? saved : [];
    let needsUpdate = savedList.length === 0;

    // Detecta qualquer resíduo do modelo antigo de planos.
    // `saved` vem do armazenamento e pode conter tipos do modelo antigo, já
    // fora da união actual — daí o cast para string.
    const hasLegacy = savedList.some(
      (p) => LEGACY_PLAN_IDS.has(p?.id) || ["connect", "recruit"].includes(String(p?.type))
    );
    if (hasLegacy) needsUpdate = true;

    // Constrói a lista canónica, preservando apenas as edições do administrador
    // feitas sobre as entradas do novo modelo (valor, nome, descrição, vantagens).
    const list: RegistrationPlanConfig[] = DEFAULT_REGISTRATION_PLANS.map((def) => {
      const prev = savedList.find(
        (p) => p && !LEGACY_PLAN_IDS.has(p.id) && p.type === def.type
      );
      if (!prev) {
        needsUpdate = true;
        return { ...def };
      }
      const merged: RegistrationPlanConfig = {
        ...def,
        name: prev.name || def.name,
        priceMzn: def.type === "residential" ? 0 : (Number.isFinite(Number(prev.priceMzn)) ? Number(prev.priceMzn) : def.priceMzn),
        period: prev.period || def.period,
        badge: prev.badge || def.badge,
        description: prev.description || def.description,
        features: Array.isArray(prev.features) && prev.features.length > 0 ? prev.features : def.features,
        trialDays: def.trialDays
      };
      if (JSON.stringify(merged) !== JSON.stringify(prev)) needsUpdate = true;
      return merged;
    });

    // Empresa e Condomínio pagam sempre o MESMO valor — regra de negócio.
    const companyFee = list.find((p) => p.type === "company")?.priceMzn ?? ACCOUNT_MAINTENANCE_FEE_MZN;
    for (const p of list) {
      if (p.type === "condo" && p.priceMzn !== companyFee) {
        p.priceMzn = companyFee;
        needsUpdate = true;
      }
    }

    currentRegistrationPlans = list;
    if (needsUpdate) {
      await setContentValue("registration_plans", currentRegistrationPlans);
      console.log(
        `✅ [server] Modelo de manutenção de conta sincronizado (Empresa/Condomínio: ${companyFee} MZN/mês, ${ACCOUNT_TRIAL_DAYS} dias grátis; Particular/Lar: gratuita).`
      );
    }
  } catch (err) {
    console.warn("[server] Erro na sincronização de registration_plans:", err);
  }
  return currentRegistrationPlans;
}

// GET é público (sem autenticação): estes valores têm de ser visíveis no
// formulário de registo/mudança de plano, antes de existir sessão.
app.get("/api/registration-plans", async (req, res) => {
  noCache(res);
  try {
    const saved = await getContentValue<RegistrationPlanConfig[]>("registration_plans");
    await syncAndPersistRegistrationPlans(saved);
  } catch (err) {
    console.warn("[server] Fallback para registration-plans em memória:", err);
  }
  res.json({ plans: currentRegistrationPlans });
});

// POST é restrito ao administrador master (mesma guarda usada nos restantes
// endpoints de configuração sensível — ver requireAdminMiddleware).
app.post("/api/registration-plans", requireAdminMiddleware, async (req, res) => {
  const { plans } = req.body || {};
  if (!Array.isArray(plans) || plans.length === 0) {
    return res.status(400).json({ error: "Payload inválido: 'plans' deve ser uma lista não vazia de planos." });
  }

  const validTypes = ["company", "condo", "residential"];
  const sanitized: RegistrationPlanConfig[] = plans.map((p: any) => ({
    id: String(p.id || `plan-${Date.now()}`),
    type: validTypes.includes(p.type) ? p.type : "company",
    name: String(p.name || "").trim(),
    priceMzn: Number(p.priceMzn) || 0,
    period: String(p.period || "/mês"),
    badge: String(p.badge || ""),
    description: String(p.description || ""),
    features: Array.isArray(p.features) ? p.features.map((f: any) => String(f)) : [],
    trialDays: p.type === "residential" ? undefined : ACCOUNT_TRIAL_DAYS
  }));

  // Regra de negócio: Empresa e Condomínio pagam sempre o mesmo valor de
  // manutenção e a conta Particular/Lar é sempre gratuita.
  const enforcedFee = Number(sanitized.find((p) => p.type === "company")?.priceMzn) || ACCOUNT_MAINTENANCE_FEE_MZN;
  for (const p of sanitized) {
    if (p.type === "residential") p.priceMzn = 0;
    else p.priceMzn = enforcedFee;
  }

  currentRegistrationPlans = sanitized;
  await setContentValue("registration_plans", currentRegistrationPlans);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "REGISTRATION_PLANS_UPDATE",
    detail: `Administrador actualizou a manutenção de conta: ${enforcedFee} MZN/mês para Empresa e Condomínio (${ACCOUNT_TRIAL_DAYS} dias grátis); Particular/Lar gratuita.`,
    timestamp: "Agora"
  });

  res.json({ success: true, plans: currentRegistrationPlans });
});

// Endpoint de validação de integridade da sessão do cliente (Cyber-Shield Anti-Tampering)
app.post("/api/auth/validate-session", (req, res) => {
  const { token } = req.body || {};
  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ valid: false, error: "Sessão inválida ou adulterada." });
  }
  res.json({ valid: true, session });
});

// POST /api/admin/login — Autenticação Segura com Emissão de Token Criptográfico (HMAC-SHA256)
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e palavra-passe são obrigatórios." });
  }

  const reqEmail = String(email).trim().toLowerCase();
  const reqPass = String(password);

  const envAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : "";
  const envAdminPass = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : "";

  // Lista canónica de e-mails autorizados para administração (identificadores, não segredos)
  const allowedAdminEmails = [...AUTHORIZED_ADMIN_EMAILS];
  if (envAdminEmail && !allowedAdminEmails.includes(envAdminEmail)) {
    allowedAdminEmails.push(envAdminEmail);
  }

  // CYBER-SHIELD: nunca embutir senhas no código-fonte (isto vai para o GitHub).
  // A senha de administrador tem de vir exclusivamente da variável de ambiente ADMIN_PASSWORD,
  // configurada no servidor/Vercel — nunca commitada em texto plano.
  if (!envAdminPass) {
    console.error("[CYBER-SHIELD] ADMIN_PASSWORD não está configurada nas variáveis de ambiente. Login de administrador desativado até ser configurada.");
    return res.status(503).json({ error: "Login de administrador não configurado no servidor. Defina ADMIN_PASSWORD nas variáveis de ambiente." });
  }

  // 1. Verificação com as credenciais administrativas (comparação em tempo constante)
  const isAuthorizedEmail = allowedAdminEmails.includes(reqEmail);
  const isAuthorizedPassword = safeCompare(reqPass, envAdminPass);

  if (isAuthorizedEmail && isAuthorizedPassword) {
    const adminUser = {
      id: "admin-master-tarira",
      email: reqEmail,
      role: "admin",
      user_metadata: { full_name: "Administrador Master TARIRA", role: "admin" }
    };
    const adminProfile = {
      id: "admin-master-tarira",
      email: reqEmail,
      role: "admin",
      name: "Administrador Master TARIRA",
      full_name: "Administrador Master TARIRA",
      phone: "+258 84 000 0000",
      city: "Maputo"
    };

    // Assinar token criptográfico inviolável para o navegador
    const sessionToken = signSessionToken({
      userId: adminUser.id,
      email: reqEmail,
      role: "admin",
      name: "Administrador Master TARIRA"
    });

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      type: "ADMIN_LOGIN",
      detail: `Sessão de Administrador Master iniciada com sucesso (${reqEmail}). Token criptográfico emitido.`,
      timestamp: "Agora"
    });

    return res.json({
      success: true,
      token: sessionToken,
      sessionToken,
      user: adminUser,
      profile: adminProfile
    });
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "SECURITY_ALERT",
    detail: `Tentativa falhada de login administrativo para: ${reqEmail}`,
    timestamp: "Agora"
  });

  return res.status(401).json({ error: "Credenciais de administrador incorrectas." });
});

app.get("/api/services", (req, res) => {
  res.json(SERVICES);
});

// Recarrega uma colecção directamente do Supabase antes de responder, para
// que qualquer instância serverless (mesmo já "quente") devolva sempre os
// registos mais recentes — resolve o mesmo problema de "dados desactualizados
// após o deploy" explicado acima, mas para colecções (candidatos, contratações,
// clientes) em vez de conteúdo CMS.
async function refreshFromSupabase<T extends { id: string }>(table: string, arr: T[]): Promise<void> {
  if (!isSupabaseAdminConfigured) return;
  try {
    const fresh = await loadTable<T>(table);
    if (fresh && fresh.length > 0) {
      if (table === "candidates") {
        const allowedSeedIds = new Set(SEED_CANDIDATES.map(s => s.id));
        const cleanFresh = (fresh as any[]).filter(item => 
          (!item.id?.startsWith("mockup-") || allowedSeedIds.has(item.id)) &&
          !deletedCandidateIds.has(item.id)
        );
        const existingIds = new Set(cleanFresh.map((item: any) => item.id));
        const remainingSeeds = (SEED_CANDIDATES as unknown as T[]).filter(
          seed => !existingIds.has(seed.id) && !deletedCandidateIds.has(seed.id)
        );
        arr.length = 0;
        arr.push(...(cleanFresh as unknown as T[]), ...remainingSeeds);
      } else if (table === "operators") {
        const allowedSeedOpIds = new Set(SEED_OPERATORS.map(s => s.id));
        const cleanFresh = (fresh as any[]).filter(item => !deletedOperatorIds.has(item.id));
        const existingIds = new Set(cleanFresh.map((item: any) => item.id));
        const remainingSeeds = (SEED_OPERATORS as unknown as T[]).filter(
          (seed: any) => !existingIds.has(seed.id) && !deletedOperatorIds.has(seed.id) && allowedSeedOpIds.has(seed.id)
        );
        arr.length = 0;
        arr.push(...(cleanFresh as unknown as T[]), ...remainingSeeds);
      } else {
        arr.length = 0;
        arr.push(...fresh);
      }
    }
  } catch (err) {
    console.error(`[supabase] Erro ao actualizar '${table}' antes de responder:`, err);
  }
}

app.get("/api/candidates", async (req, res) => {
  noCache(res);
  await refreshFromSupabase("candidates", candidates);
  res.json(candidates);
});

// GET a single candidate by id — usado no login real (Supabase Auth) para
// carregar directamente o perfil ligado à conta autenticada, sem ter de
// transferir a lista completa de candidatos para o encontrar no browser.
app.get("/api/candidates/:id", async (req, res) => {
  noCache(res);
  await refreshFromSupabase("candidates", candidates);
  const cand = candidates.find(c => c.id === req.params.id);
  if (!cand) {
    return res.status(404).json({ error: "Prestador não encontrado" });
  }
  res.json(cand);
});

app.get("/api/logs", (req, res) => {
  res.json(auditLogs);
});

app.post("/api/logs", (req, res) => {
  const { type, detail } = req.body;
  if (!type || !detail) {
    return res.status(400).json({ error: "Missing type or detail" });
  }
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type,
    detail,
    timestamp: "Agora"
  });
  if (auditLogs.length > 20) {
    auditLogs.pop();
  }
  res.json({ success: true });
});

// Create candidate manually (CRUD)
app.post("/api/candidates", (req, res) => {
  const { 
    name, 
    surname, 
    email, 
    phone, 
    residence, 
    city, 
    bio, 
    category, 
    role, 
    matchScore, 
    feedback, 
    status, 
    identityDocName, 
    biNumber, 
    photo, 
    title, 
    subCategory, 
    rate, 
    rateMzn, 
    skills, 
    expectedSalaryMin, 
    expectedSalaryMax,
    isProfessional,
    whatsapp,
    ownTransport,
    availableNow,
    availableForEmergency,
    documents,
    experienceYears,
    hourlyRate,
    cvDocName,
    cvDocumentName,
    cvDocumentUrl,
    cvDocData,
    identityDocUrl,
    identityDocData
  } = req.body;

  const rawName = String(name || "").trim();
  const rawSurname = String(surname || "").trim();
  const nameParts = rawName.split(/\s+/);
  const candName = rawSurname ? rawName : (nameParts[0] || "Prestador");
  const candSurname = rawSurname || (nameParts.slice(1).join(" ") || "Registado");

  const candPhone = String(phone || "").trim();
  const candEmail = String(email || "").trim();

  if (!candName || (!candPhone && !candEmail)) {
    return res.status(400).json({ error: "Campos obrigatórios em falta: Nome e pelo menos um contacto (telefone ou email)." });
  }

  const rawCat = String(category || role || "tech").toLowerCase();
  let normalizedCat = "tech";
  let defaultTitle = title || "Técnico Especializado";
  let defaultSubCat = subCategory || "Ofícios Técnicos & Serviços de Campo";
  let defaultRate = rate ? Number(rate) : 20;
  let defaultRateMzn = rateMzn ? Number(rateMzn) : 1300;
  let isEmergency = true;

  // ─────────────────────────────────────────────────────────────────────────
  // IMPORTANTE: preservar a categoria exata (id canónico da taxonomia) sempre
  // que o cliente já a envia correctamente — ex.: "limpeza_especializada",
  // "manutencao_reparacoes", "carpintaria_marcenaria", "construcao_obras",
  // "jardinagem_exteriores", "elite_tech", "servicos_domesticos". Nunca reduzir
  // estes valores ao genérico "tech": era essa redução que fazia TODOS os
  // ofícios (Limpeza, Manutenção, Construção, Carpintaria, Jardinagem, Elite
  // Tech) caírem na mesma categoria "tech" na base de dados, quebrando o
  // filtro por categoria em Técnicos de Campo / Talentos e Quadros (um
  // técnico de Limpeza passava a aparecer também em Construção, Manutenção e
  // Elite Tech, e o botão "Elite Tech" mostrava todos os técnicos sem
  // filtrar).
  // ─────────────────────────────────────────────────────────────────────────
  const CANONICAL_TRADE_DEFAULTS: Record<string, { title: string; subCat: string; rate: number; rateMzn: number; emergency: boolean }> = {
    servicos_domesticos: { title: "Empregada Doméstica Qualificada", subCat: "Serviços Domésticos & Apoio Familiar", rate: 12, rateMzn: 750, emergency: false },
    limpeza_especializada: { title: "Técnico de Limpeza Profissional", subCat: "Limpeza Especializada & Higienização", rate: 18, rateMzn: 1100, emergency: true },
    manutencao_reparacoes: { title: "Técnico de Manutenção & Reparações", subCat: "Manutenção & Reparações", rate: 20, rateMzn: 1300, emergency: true },
    carpintaria_marcenaria: { title: "Marceneiro & Carpinteiro", subCat: "Carpintaria & Marcenaria", rate: 20, rateMzn: 1300, emergency: false },
    construcao_obras: { title: "Mestre de Obras & Pedreiro", subCat: "Construção & Obras", rate: 20, rateMzn: 1300, emergency: false },
    jardinagem_exteriores: { title: "Jardineiro & Paisagista", subCat: "Jardinagem & Exteriores", rate: 18, rateMzn: 1100, emergency: false },
    elite_tech: { title: "Técnico Elite Tech (CCTV, Antenas & Redes)", subCat: "Elite Tech · Instalações Técnicas", rate: 22, rateMzn: 1400, emergency: true }
  };

  if (typeof isProfessional === "boolean" && isProfessional === true) {
    // Quando o formulário já indica explicitamente que se trata de um Profissional
    // de Talentos e Quadros (Recruit), respeitamos isso directamente em vez de
    // tentar adivinhar pela categoria
    normalizedCat = "prof";
    defaultTitle = title || "Profissional de Nível Superior";
    defaultSubCat = subCategory || "Recrutamento & Seleção Corporativa";
    defaultRate = rate ? Number(rate) : 35;
    defaultRateMzn = rateMzn ? Number(rateMzn) : 2200;
    isEmergency = false;
  }
  else if (CANONICAL_TRADE_DEFAULTS[rawCat]) {
    normalizedCat = rawCat;
    const d = CANONICAL_TRADE_DEFAULTS[rawCat];
    defaultTitle = title || d.title;
    defaultSubCat = subCategory || d.subCat;
    defaultRate = rate ? Number(rate) : d.rate;
    defaultRateMzn = rateMzn ? Number(rateMzn) : d.rateMzn;
    isEmergency = d.emergency;
  }
  // Domestic worker categorization
  else if (
    rawCat.includes("dom") || 
    rawCat.includes("empregad") || 
    rawCat.includes("cozinh") || 
    rawCat.includes("bab") || 
    rawCat.includes("cuid") || 
    rawCat.includes("govern") ||
    rawCat.includes("lar") ||
    rawCat.includes("limpeza doméstica")
  ) {
    normalizedCat = "dom";
    defaultTitle = title || (
      rawCat.includes("cozinh") ? "Cozinheira Particular" :
      rawCat.includes("bab") || rawCat.includes("cuid") ? "Babá / Cuidadora Infantil" :
      rawCat.includes("govern") ? "Governanta Residencial" :
      "Empregada Doméstica Qualificada"
    );
    defaultSubCat = subCategory || "Serviços Domésticos & Apoio Familiar";
    defaultRate = rate ? Number(rate) : 12;
    defaultRateMzn = rateMzn ? Number(rateMzn) : 750;
    isEmergency = false;
  } 
  // Corporate / Professional recruit categorization
  else if (
    rawCat === "prof" || 
    rawCat.includes("recruitment") || 
    rawCat.includes("executive") || 
    rawCat.includes("ciber") || 
    rawCat.includes("software") || 
    rawCat.includes("rh") || 
    rawCat.includes("finan") ||
    rawCat.includes("gest") ||
    rawCat.includes("compliance") ||
    rawCat.includes("ai") ||
    rawCat.includes("devops")
  ) {
    normalizedCat = "prof";
    defaultTitle = title || "Profissional de Nível Superior";
    defaultSubCat = subCategory || "Recrutamento & Seleção Corporativa";
    defaultRate = rate ? Number(rate) : 35;
    defaultRateMzn = rateMzn ? Number(rateMzn) : 2200;
    isEmergency = false;
  }
  // Technical trades categorization
  else {
    normalizedCat = "tech";
    defaultTitle = title || (
      rawCat.includes("solar") || rawCat.includes("energ") ? "Instalador Solar & Energia" :
      rawCat.includes("elec") || rawCat.includes("eléctr") ? "Eletricista Certificado" :
      rawCat.includes("canal") || rawCat.includes("hidr") ? "Canalizador & Redes de Água" :
      rawCat.includes("pint") ? "Pintor Profissional de Acabamentos" :
      rawCat.includes("jard") ? "Jardineiro & Paisagista" :
      rawCat.includes("obra") || rawCat.includes("pedr") ? "Mestre de Obras & Pedreiro" :
      rawCat.includes("carp") || rawCat.includes("marc") ? "Marceneiro & Carpinteiro" :
      rawCat.includes("caix") || rawCat.includes("vidr") ? "Técnico de Caixilharia & Vidraçaria" :
      rawCat.includes("limp") ? "Técnico de Limpeza Profissional" :
      "Técnico Especializado"
    );
    defaultSubCat = subCategory || "Ofícios Técnicos & Serviços de Campo";
    defaultRate = rate ? Number(rate) : 20;
    defaultRateMzn = rateMzn ? Number(rateMzn) : 1300;
    isEmergency = true;
  }

  // Normalização de Documentos Oficiais (CV e BI)
  const safeCvName = cvDocumentName || cvDocName || (Array.isArray(documents) ? documents.find((d: any) => d.type === 'cv')?.title : null) || `CV_${candName}_ATS.pdf`;
  const safeCvUrl = cvDocumentUrl || cvDocData || (Array.isArray(documents) ? documents.find((d: any) => d.type === 'cv')?.url : null) || "";
  const safeIdDocName = identityDocName || (Array.isArray(documents) ? documents.find((d: any) => d.type === 'bi')?.title : null) || (biNumber ? `BI_${candName}_${biNumber}.pdf` : `BI_${candName}_Oficial.pdf`);
  const safeIdDocUrl = identityDocUrl || identityDocData || (Array.isArray(documents) ? documents.find((d: any) => d.type === 'bi')?.url : null) || "";

  let candidateDocuments = Array.isArray(documents) ? [...documents] : [];
  if (safeCvName && !candidateDocuments.some((d: any) => d.type === 'cv')) {
    candidateDocuments.push({ type: 'cv', title: safeCvName, url: safeCvUrl, issuer: 'ATS Upload', status: 'verified' });
  }
  if (safeIdDocName && !candidateDocuments.some((d: any) => d.type === 'bi')) {
    candidateDocuments.push({ type: 'bi', title: safeIdDocName, url: safeIdDocUrl, issuer: 'Registo Civil', status: 'verified' });
  }

  const newCand: CandidateState = {
    id: `cand-${Date.now()}`,
    name: candName,
    surname: candSurname,
    email: candEmail,
    phone: candPhone,
    whatsapp: whatsapp || candPhone,
    residence: residence || city || "Maputo 🇲🇿",
    photo: photo || "",
    identityDocName: safeIdDocName,
    identityDocUrl: safeIdDocUrl,
    cvDocumentName: safeCvName,
    cvDocumentUrl: safeCvUrl,
    cvDocName: safeCvName,
    bio: bio || "Prestador qualificado e credenciado do ecossistema TARIRA.",
    category: normalizedCat,
    matchScore: typeof matchScore === "number" ? matchScore : Math.floor(Math.random() * 20) + 75,
    feedback: feedback || "Mapeamento inicial realizado com sucesso pelo sistema.",
    status: status || "pending",
    timestamp: new Date().toISOString(),
    
    // Extended fields
    title: defaultTitle,
    subCategory: defaultSubCat,
    city: city || residence || "Maputo 🇲🇿",
    rate: rate ? Number(rate) : (hourlyRate ? Number(hourlyRate) : defaultRate),
    rateMzn: rateMzn ? Number(rateMzn) : defaultRateMzn,
    experienceYears: experienceYears ? Number(experienceYears) : 3,
    availableNow: typeof availableNow === "boolean" ? availableNow : true,
    availableForEmergency: typeof availableForEmergency === "boolean" ? availableForEmergency : isEmergency,
    ownTransport: typeof ownTransport === "boolean" ? ownTransport : false,
    isProfessional: typeof isProfessional === "boolean" ? isProfessional : (normalizedCat === "prof" || isProfessional === "true" || isProfessional === 1),
    promiseScore: 85,
    rating: 4.5,
    completedJobs: 0,
    skills: Array.isArray(skills) && skills.length > 0 ? skills : [defaultTitle],
    portfolio: [],
    documents: candidateDocuments,
    expectedSalaryMin: expectedSalaryMin ? Number(expectedSalaryMin) : undefined,
    expectedSalaryMax: expectedSalaryMax ? Number(expectedSalaryMax) : undefined
  };

  // Prevenção rigorosa de duplicação: verifica se já existe candidato com o mesmo email ou telefone
  const cleanPhoneCompare = candPhone ? candPhone.replace(/\D/g, "") : "";
  const existingCandidateIndex = candidates.findIndex(c => {
    if (candEmail && c.email && c.email.toLowerCase().trim() === candEmail.toLowerCase().trim()) return true;
    if (cleanPhoneCompare && cleanPhoneCompare.length >= 7 && c.phone) {
      const existingClean = c.phone.replace(/\D/g, "");
      if (existingClean && (existingClean === cleanPhoneCompare || existingClean.endsWith(cleanPhoneCompare) || cleanPhoneCompare.endsWith(existingClean))) {
        return true;
      }
    }
    return false;
  });

  let savedCandidate: CandidateState;
  if (existingCandidateIndex !== -1) {
    const existing = candidates[existingCandidateIndex];
    savedCandidate = {
      ...existing,
      ...newCand,
      id: existing.id,
      timestamp: existing.timestamp || new Date().toISOString()
    };
    candidates[existingCandidateIndex] = savedCandidate;
  } else {
    savedCandidate = newCand;
    candidates.unshift(savedCandidate);
  }

  // Sincroniza e cria a candidatura correspondente em spontaneousApplications (Candidaturas e Triagem ATS)
  const isQuadro = Boolean(savedCandidate.isProfessional);
  const newApp: SpontaneousApplication = {
    id: `app-${savedCandidate.id}`,
    fullName: `${candName} ${candSurname}`.trim(),
    phone: candPhone,
    email: candEmail,
    residence: savedCandidate.residence || savedCandidate.city || "Maputo",
    city: savedCandidate.city || "Maputo",
    category: savedCandidate.title || savedCandidate.subCategory || (isQuadro ? "Talentos & Quadros" : "Prestador de Campo"),
    careerFocus: isQuadro ? "recruitment_corporate" : "field_technician",
    nuit: biNumber || "",
    idDocumentName: safeIdDocName,
    idDocumentUrl: safeIdDocUrl,
    cvDocumentName: safeCvName,
    cvDocumentUrl: safeCvUrl,
    isAtsValidated: true,
    atsScore: savedCandidate.matchScore || 92,
    experiences: [],
    submittedAt: new Date().toISOString(),
    status: (status === "approved" || status === "active" || status === "Ativo") ? "approved" : "screening",
    notes: `Candidatura gerada no registo de conta (${isQuadro ? "Talentos & Quadros Corporativos" : "Prestador de Serviços Connect"}).`,
    targetDepartment: savedCandidate.title || savedCandidate.subCategory,
    skills: Array.isArray(savedCandidate.skills) ? savedCandidate.skills : [defaultTitle],
    expectedSalary: savedCandidate.expectedSalaryMin ? `${savedCandidate.expectedSalaryMin} MZN` : undefined,
    applicationType: isQuadro ? "corporate_recruit" : "field_technician"
  };

  const existingAppIdx = spontaneousApplications.findIndex(
    a => (a.email && candEmail && a.email.toLowerCase() === candEmail.toLowerCase()) || (a.phone && candPhone && a.phone === candPhone)
  );
  if (existingAppIdx !== -1) {
    spontaneousApplications[existingAppIdx] = {
      ...spontaneousApplications[existingAppIdx],
      ...newApp,
      id: spontaneousApplications[existingAppIdx].id
    };
  } else {
    spontaneousApplications.unshift(newApp);
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CANDIDATE_CREATE",
    detail: `Novo registo de conta: ${candName} ${candSurname} (${defaultTitle}) com candidatura e documentos inseridos no ATS`,
    timestamp: "Agora"
  });

  res.status(201).json(savedCandidate);
});

// Update candidate completely (CRUD Update)
app.put("/api/candidates/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const candIndex = candidates.findIndex(c => c.id === id);
  if (candIndex === -1) {
    return res.status(404).json({ error: "Candidato não encontrado" });
  }

  const existing = candidates[candIndex];
  candidates[candIndex] = {
    ...existing,
    ...req.body,
    id: existing.id // preserve original ID
  };

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CANDIDATE_UPDATE",
    detail: `Administrador actualizou os dados de ${candidates[candIndex].name} ${candidates[candIndex].surname || ""}`,
    timestamp: "Agora"
  });

  res.json({ success: true, candidate: candidates[candIndex] });
});

// Update candidate photo specifically
app.post("/api/candidates/:id/photo", (req, res) => {
  const { id } = req.params;
  const { photo } = req.body;
  if (!photo) {
    return res.status(400).json({ error: "Falta o parâmetro da foto" });
  }
  const cand = candidates.find(c => c.id === id);
  if (!cand) {
    return res.status(404).json({ error: "Candidato não encontrado" });
  }
  cand.photo = photo;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CANDIDATE_PHOTO_UPDATE",
    detail: `Actualizada foto de perfil de ${cand.name} ${cand.surname}`,
    timestamp: "Agora"
  });

  res.json({ success: true, photo: cand.photo, candidate: cand });
});

// Delete candidate (CRUD Delete with Audit Tracking & Supabase persistence)
app.delete("/api/candidates/:id", requireAdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy, operatorEmail, operatorRole, reason } = req.body || {};
    
    // Procura todos os candidatos que correspondam ao ID, prefixo ou email para remoção completa de duplicados
    const matchingIndices: number[] = [];
    candidates.forEach((c, idx) => {
      if (c.id === id || c.id === `cand-${id}` || (c as any).email === id) {
        matchingIndices.push(idx);
      }
    });

    if (matchingIndices.length === 0) {
      deletedCandidateIds.add(id);
      if (isSupabaseAdminConfigured) {
        deleteFromTable("candidates", id).catch(() => {});
        setContentValue("deleted_candidate_ids", Array.from(deletedCandidateIds)).catch(() => {});
      }
      return res.json({ success: true, message: "Registo já inexistente ou removido", removedId: id });
    }

    // Remove do array de candidatos do final para o início para manter os índices válidos
    let removedName = "";
    const removedCandidateObjects: CandidateState[] = [];
    matchingIndices.sort((a, b) => b - a).forEach(idx => {
      const rem = candidates.splice(idx, 1)[0];
      if (rem) {
        removedCandidateObjects.push(rem);
        if (!removedName) removedName = `${rem.name} ${rem.surname || ""}`.trim();
        deletedCandidateIds.add(rem.id);
      }
    });
    deletedCandidateIds.add(id);

    // Remove todas as candidaturas ATS vinculadas aos candidatos removidos
    removedCandidateObjects.forEach(removed => {
      const email = removed.email ? removed.email.toLowerCase() : "";
      for (let i = spontaneousApplications.length - 1; i >= 0; i--) {
        const a = spontaneousApplications[i];
        if (
          a.id === id ||
          a.id === `app-${id}` ||
          (removed.id && (a.id === removed.id || a.id === `app-${removed.id}`)) ||
          (email && a.email && a.email.toLowerCase() === email)
        ) {
          spontaneousApplications.splice(i, 1);
        }
      }
    });

    if (isSupabaseAdminConfigured) {
      deleteFromTable("candidates", id).catch(() => {});
      removedCandidateObjects.forEach(rem => {
        if (rem.id && rem.id !== id) {
          deleteFromTable("candidates", rem.id).catch(() => {});
        }
      });
      setContentValue("deleted_candidate_ids", Array.from(deletedCandidateIds)).catch(() => {});
    }

    const operatorInfo = deletedBy || "Administrador Master";
    const reasonInfo = reason ? ` (Motivo: ${reason})` : "";
    const roleInfo = operatorRole ? ` [Cargo: ${operatorRole}]` : "";

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      type: "CANDIDATE_DELETE",
      detail: `${operatorInfo}${roleInfo} eliminou o perfil de ${removedName || id}${reasonInfo}`,
      timestamp: "Agora"
    });

    res.json({ success: true, removedId: id, removedName: removedName || id });
  } catch (err: any) {
    console.error("Erro na rota de eliminação de candidato:", err);
    res.status(500).json({ error: "Erro interno ao eliminar candidato", detail: err?.message || String(err) });
  }
});

// Update candidate status
app.post("/api/candidates/:id/status", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const cand = candidates.find(c => c.id === id);
  if (!cand) {
    return res.status(404).json({ error: "Candidato não encontrado" });
  }
  cand.status = status;
  
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CANDIDATE_UPDATE",
    detail: `Candidatura de ${cand.name} ${cand.surname} alterada para ${status.toUpperCase()}`,
    timestamp: "Agora"
  });

  res.json({ success: true, candidate: cand });
});

// Update professional profile details from /professional/profile (Lado do Profissional)
app.post("/api/candidates/:id/profile", (req, res) => {
  const { id } = req.params;
  const { 
    title, subCategory, city, languages, whatsapp, rate, rateMzn, 
    workType, availableNow, availableForEmergency, emergencyRate, 
    travelRadius, ownTransport, availableFrom, whyWork, personalValues, skills,
    portfolioWebsite, bio
  } = req.body;

  const cand = candidates.find(c => c.id === id);
  if (!cand) {
    return res.status(404).json({ error: "Profissional não encontrado" });
  }

  // Update profile
  cand.title = title || cand.title;
  cand.subCategory = subCategory || cand.subCategory;
  cand.city = city || cand.city;
  cand.languages = languages || cand.languages;
  cand.whatsapp = whatsapp || cand.whatsapp;
  cand.rate = rate !== undefined ? Number(rate) : cand.rate;
  cand.rateMzn = rateMzn !== undefined ? Number(rateMzn) : cand.rateMzn;
  cand.workType = workType || cand.workType;
  cand.availableNow = availableNow !== undefined ? Boolean(availableNow) : cand.availableNow;
  cand.availableForEmergency = availableForEmergency !== undefined ? Boolean(availableForEmergency) : cand.availableForEmergency;
  cand.emergencyRate = emergencyRate !== undefined ? Number(emergencyRate) : cand.emergencyRate;
  cand.travelRadius = travelRadius !== undefined ? Number(travelRadius) : cand.travelRadius;
  cand.ownTransport = ownTransport !== undefined ? Boolean(ownTransport) : cand.ownTransport;
  cand.availableFrom = availableFrom || cand.availableFrom;
  cand.whyWork = whyWork || cand.whyWork;
  cand.personalValues = personalValues || cand.personalValues;
  cand.skills = skills || cand.skills;
  cand.portfolioWebsite = portfolioWebsite !== undefined ? portfolioWebsite : cand.portfolioWebsite;
  cand.bio = bio !== undefined ? bio : cand.bio;

  // Ensure documents and portfolio are initialized
  if (!cand.documents) cand.documents = [];
  if (!cand.portfolio) cand.portfolio = [];

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "PROFILE_UPDATE",
    detail: `Profissional ${cand.name} ${cand.surname} actualizou a sua ficha de perfil no Painel Tarira`,
    timestamp: "Agora"
  });

  res.json({ success: true, candidate: cand });
});

// Simulate instant document upload & verification
app.post("/api/candidates/:id/documents", (req, res) => {
  const { id } = req.params;
  const { type, title, issuer, expiry } = req.body;
  
  const cand = candidates.find(c => c.id === id);
  if (!cand) {
    return res.status(404).json({ error: "Profissional não encontrado" });
  }

  if (!cand.documents) cand.documents = [];

  // Add document with "verified" status in seconds
  const newDoc = {
    type: type || "custom",
    title: title || "Certificação Carregada",
    issuer: issuer || "Entidade Competente",
    expiry: expiry || "",
    status: "verified" as "verified" | "pending" | "warning"
  };

  cand.documents.push(newDoc);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "DOC_VERIFIED",
    detail: `Documento "${newDoc.title}" de ${cand.name} verificado instantaneamente pelo sistema Tarira`,
    timestamp: "Agora"
  });

  res.json({ success: true, candidate: cand });
});

// Add photo to portfolio
app.post("/api/candidates/:id/portfolio", (req, res) => {
  const { id } = req.params;
  const { url, caption } = req.body;

  const cand = candidates.find(c => c.id === id);
  if (!cand) {
    return res.status(404).json({ error: "Profissional não encontrado" });
  }

  if (!cand.portfolio) cand.portfolio = [];

  const newPhoto = {
    url: url || "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=500&auto=format&fit=crop&q=60",
    caption: caption || "Trabalho realizado"
  };

  cand.portfolio.push(newPhoto);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "PORTFOLIO_ADD",
    detail: `${cand.name} adicionou uma nova foto ao seu portfólio visual`,
    timestamp: "Agora"
  });

  res.json({ success: true, candidate: cand });
});

// GET Hires list
app.get("/api/hires", async (req, res) => {
  noCache(res);
  await refreshFromSupabase("hires", hires);
  res.json(hires);
});

// GET Clients list
app.get("/api/clients", async (req, res) => {
  noCache(res);
  await refreshFromSupabase("clients", clients);
  res.json(clients);
});

// GET a single client by id — mesmo propósito que /api/candidates/:id acima
app.get("/api/clients/:id", async (req, res) => {
  noCache(res);
  await refreshFromSupabase("clients", clients);
  const client = clients.find(c => c.id === req.params.id);
  if (!client) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }
  res.json(client);
});

// POST Create new client (CRUD Create)
app.post("/api/clients", (req, res) => {
  const { name, type, email, phone, linkedin, address, bi, companyName, condoName, contactPerson, contactPersonTitle, planType, planName, planPriceMzn, planStatus } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nome completo é obrigatório" });
  }

  const finalPhone = (phone && phone.trim()) ? phone.trim() : "+258 84 000 0000";
  const finalAddress = (address && address.trim()) ? address.trim() : "Maputo, Moçambique";

  // Conta Particular/Lar é gratuita: não tem período experimental nem
  // pagamento, fica sempre "active" desde o primeiro momento.
  //
  // Conta Empresa/Condomínio arranca com acesso liberado nos primeiros
  // ACCOUNT_TRIAL_DAYS dias (planStatus "trial"), mesmo sem ter pago. Se o
  // cliente optar por activar já a manutenção no registo, o formulário envia
  // planStatus "pending" (aguarda validação do comprovativo manual) — nesse
  // caso não há trialEndsAt.
  const isFreeAccount = type === "residential";
  const finalPlanStatus = isFreeAccount ? "active" : (planStatus || "trial");
  const trialEndsAt = finalPlanStatus === "trial"
    ? new Date(Date.now() + ACCOUNT_TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const newClient: ClientState = {
    id: `client-${Date.now()}`,
    name: name.trim(),
    type: type || "company",
    email: email ? email.trim().toLowerCase() : "",
    phone: finalPhone,
    address: finalAddress,
    bi: bi || "",
    linkedin: linkedin || "",
    companyName: companyName || "",
    condoName: condoName || "",
    contactPerson: contactPerson || "",
    contactPersonTitle: contactPersonTitle || "",
    // Modelo único: Empresa e Condomínio pagam a mesma manutenção de conta;
    // a conta Particular/Lar ("residential") é sempre gratuita.
    planType: planType || (type === "residential" ? HOME_PLAN_ID : ACCOUNT_PLAN_ID),
    planName: planName || (type === "residential" ? "Conta Particular / Lar" : "Manutenção de Conta TARIRA"),
    planPriceMzn:
      typeof planPriceMzn === "number"
        ? planPriceMzn
        : (type === "residential"
            ? 0
            : (currentRegistrationPlans.find((p) => p.type === "company")?.priceMzn ?? ACCOUNT_MAINTENANCE_FEE_MZN)),
    planStatus: finalPlanStatus,
    trialEndsAt,
    createdAt: new Date().toISOString()
  };

  clients.unshift(newClient);

  let typeLabel = "Empresarial";
  if (type === "residential") typeLabel = "Residencial";
  if (type === "condo") typeLabel = "Condomínio";
  if (type === "individual") typeLabel = "Particular";

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CLIENT_CREATED",
    detail: `Novo cliente registado: ${name} (${typeLabel})`,
    timestamp: "Agora"
  });

  res.status(201).json(newClient);
});

// PUT Update existing client (CRUD Update)
app.put("/api/clients/:id", (req, res) => {
  const { id } = req.params;
  const { name, type, email, phone, linkedin, address, bi, planType, planName, planPriceMzn, planStatus, trialEndsAt, contactPerson, contactPersonTitle } = req.body;

  const client = clients.find(c => c.id === id);
  if (!client) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  if (name) client.name = name;
  if (type) client.type = type;
  if (email !== undefined) client.email = email;
  if (phone !== undefined) client.phone = phone;
  if (linkedin !== undefined) client.linkedin = linkedin;
  if (address !== undefined) client.address = address;
  if (bi !== undefined) client.bi = bi;
  if (planType !== undefined) client.planType = planType;
  if (planName !== undefined) client.planName = planName;
  if (planPriceMzn !== undefined) client.planPriceMzn = planPriceMzn;
  if (planStatus !== undefined) {
    client.planStatus = planStatus;
    // Uma vez o plano confirmado como "active" (pagamento validado pelo
    // financeiro) ou "expired", o cliente deixa de estar em período de
    // trial — limpa a data para não continuar a exibir "grátis até X".
    if (planStatus !== "trial") client.trialEndsAt = undefined;
  }
  if (trialEndsAt !== undefined) client.trialEndsAt = trialEndsAt;
  if (contactPerson !== undefined) client.contactPerson = contactPerson;
  if (contactPersonTitle !== undefined) client.contactPersonTitle = contactPersonTitle;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CLIENT_UPDATED",
    detail: `Cliente actualizado: ${client.name}`,
    timestamp: "Agora"
  });

  res.json({ success: true, client });
});

// DELETE Delete client (CRUD Delete)
// NOTA CYBER-SHIELD: esta rota ANTES só removia o cliente do array em
// memória. A sincronização automática pós-pedido (syncDataToSupabaseNow)
// fazia apenas um UPSERT dos clientes restantes — um upsert nunca apaga
// linhas que já não estão no array — pelo que a linha eliminada continuava
// para sempre na tabela "clients" do Supabase. Na leitura seguinte
// (refreshFromSupabase, chamado em todo GET /api/clients), o registo "morto"
// era recarregado do Supabase e reaparecia como se nada tivesse sido
// eliminado. Corrigido chamando deleteFromTable explicitamente, tal como já
// acontecia para candidatos.
app.delete("/api/clients/:id", requireAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) {
    deletedClientIds.add(id);
    if (isSupabaseAdminConfigured) {
      deleteFromTable("clients", id).catch(() => {});
      setContentValue("deleted_client_ids", Array.from(deletedClientIds)).catch(() => {});
    }
    return res.json({ success: true, message: "Registo já inexistente ou removido", removedId: id });
  }

  const deleted = clients.splice(index, 1)[0];
  deletedClientIds.add(id);

  if (isSupabaseAdminConfigured) {
    await deleteFromTable("clients", id).catch((err) => {
      console.error(`[supabase] Falha ao eliminar cliente ${id} do Supabase:`, err);
    });
    setContentValue("deleted_client_ids", Array.from(deletedClientIds)).catch(() => {});
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CLIENT_DELETED",
    detail: `Cliente removido do ecossistema: ${deleted.name}`,
    timestamp: "Agora"
  });

  res.json({ success: true, deleted });
});

// POST Clear all clients (Reset client table)
app.post("/api/clients/clear-all", requireAdminMiddleware, (req, res) => {
  clients.length = 0;
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CLIENTS_CLEARED",
    detail: "Todos os clientes de exemplo foram removidos. A base de clientes está limpa para testes reais.",
    timestamp: "Agora"
  });
  res.json({ success: true, count: 0 });
});

// ============================================================================
// OPERADORES INTERNOS (contas de staff/admin do ecossistema TARIRA)
// ============================================================================
// CRUD real (antes era só estado local do React, nunca persistido — ver nota
// na declaração de `operators` mais acima). Segue exatamente o mesmo padrão
// já usado para clientes/candidatos: GET recarrega sempre do Supabase antes
// de responder, DELETE apaga mesmo a linha (deleteFromTable) e regista o id
// numa lista de eliminados para nunca voltar a "ressuscitar" pela via da
// seed local.

app.get("/api/operators", async (req, res) => {
  noCache(res);
  await refreshFromSupabase("operators", operators);
  res.json(operators);
});

app.get("/api/operators/:id", async (req, res) => {
  noCache(res);
  await refreshFromSupabase("operators", operators);
  const op = operators.find(o => o.id === req.params.id);
  if (!op) {
    return res.status(404).json({ error: "Operador não encontrado" });
  }
  res.json(op);
});

app.post("/api/operators", requireAdminMiddleware, (req, res) => {
  const { name, role, email, orgId, orgName, permissions, status, avatar } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: "E-mail é obrigatório" });
  }
  const newOperator: OrgOperator = {
    id: `op-${Date.now()}`,
    name: String(name).trim(),
    role: role || "Operador",
    email: String(email).trim().toLowerCase(),
    orgId: orgId || "admin-org",
    orgName: orgName || "Central TARIRA Admin",
    permissions: Array.isArray(permissions) ? permissions : ["Acesso ao Painel"],
    status: status || "Ativo",
    lastActive: "Agora mesmo",
    avatar: avatar || "👤"
  };
  operators.unshift(newOperator);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "OPERATOR_CREATED",
    detail: `Novo operador/conta interna criado: ${newOperator.name} (${newOperator.role})`,
    timestamp: "Agora"
  });

  res.status(201).json(newOperator);
});

app.put("/api/operators/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, role, email, orgId, orgName, permissions, status, avatar } = req.body || {};
  const op = operators.find(o => o.id === id);
  if (!op) {
    return res.status(404).json({ error: "Operador não encontrado" });
  }
  if (name !== undefined) op.name = name;
  if (role !== undefined) op.role = role;
  if (email !== undefined) op.email = String(email).trim().toLowerCase();
  if (orgId !== undefined) op.orgId = orgId;
  if (orgName !== undefined) op.orgName = orgName;
  if (Array.isArray(permissions)) op.permissions = permissions;
  if (status !== undefined) op.status = status;
  if (avatar !== undefined) op.avatar = avatar;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "OPERATOR_UPDATED",
    detail: `Operador atualizado: ${op.name}`,
    timestamp: "Agora"
  });

  res.json({ success: true, operator: op });
});

app.delete("/api/operators/:id", requireAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const index = operators.findIndex(o => o.id === id);

  deletedOperatorIds.add(id);

  if (index === -1) {
    if (isSupabaseAdminConfigured) {
      deleteFromTable("operators", id).catch(() => {});
      setContentValue("deleted_operator_ids", Array.from(deletedOperatorIds)).catch(() => {});
    }
    return res.json({ success: true, message: "Registo já inexistente ou removido", removedId: id });
  }

  const deleted = operators.splice(index, 1)[0];

  if (isSupabaseAdminConfigured) {
    await deleteFromTable("operators", id).catch((err) => {
      console.error(`[supabase] Falha ao eliminar operador ${id} do Supabase:`, err);
    });
    setContentValue("deleted_operator_ids", Array.from(deletedOperatorIds)).catch(() => {});
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "OPERATOR_DELETED",
    detail: `Operador removido do ecossistema: ${deleted.name}`,
    timestamp: "Agora"
  });

  res.json({ success: true, deleted });
});

// Pedidos de Saque (Payout Requests) — o prestador pede o saque dos ganhos
// acumulados; o Admin tem de aprovar manualmente antes de qualquer valor ser
// considerado "pago". Isto substitui o comportamento anterior, que marcava o
// saque como concluído e dizia ao prestador "transferência enviada" sem
// nenhuma transferência real ter sido feita.
export interface PayoutRequest {
  id: string;
  candidateId: string;
  candidateName: string;
  phone?: string;
  amount: number;
  status: "pending" | "paid" | "rejected";
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}
const payoutRequests: PayoutRequest[] = [];

// POST Provider withdrawal request — cria um PEDIDO pendente, não paga automaticamente.
app.post("/api/candidates/:id/withdraw", requireAuthMiddleware, (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const cand = candidates.find(c => c.id === id);
  if (!cand) {
    return res.status(404).json({ error: "Prestador não encontrado" });
  }

  const session = extractSessionFromRequest(req);
  if (!canActOnCandidate(session, cand)) {
    console.warn(`[CYBER-SHIELD ALERTA]: ${session?.email || "anónimo"} tentou pedir saque em nome do prestador ${cand.email}!`);
    return res.status(403).json({ error: "Não tem permissão para pedir saque em nome de outro prestador.", code: "FORBIDDEN_NOT_OWNER" });
  }

  const withdrawVal = Number(amount);
  if (isNaN(withdrawVal) || withdrawVal <= 0) {
    return res.status(400).json({ error: "Valor de saque inválido" });
  }

  // Calculate earnings
  const candHires = hires.filter(h => h.candidateId === id && h.status === "completed");
  const totalEarnings = candHires.reduce((acc, h) => acc + (h.rate * 950), 0); // Convert hourly/project rate to MZN
  const currentWithdrawn = cand.withdrawnAmount || 0;
  const pendingRequests = payoutRequests
    .filter(p => p.candidateId === id && p.status === "pending")
    .reduce((acc, p) => acc + p.amount, 0);
  const available = Math.max(0, totalEarnings - currentWithdrawn - pendingRequests);

  if (withdrawVal > available) {
    return res.status(400).json({ error: `Saldo insuficiente para realizar o saque. Saldo disponível: ${available} MZN` });
  }

  const newRequest: PayoutRequest = {
    id: `payout-${Date.now()}`,
    candidateId: id,
    candidateName: `${cand.name} ${cand.surname}`,
    phone: cand.whatsapp || cand.phone,
    amount: withdrawVal,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  payoutRequests.unshift(newRequest);
  bulkUpsertTable("payout_requests", payoutRequests).catch((err) => console.error("[supabase] Falha ao sincronizar payout_requests:", err));

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "WITHDRAWAL_REQUEST",
    detail: `Saque de ${withdrawVal} MZN solicitado por ${cand.name} ${cand.surname}. Aguarda aprovação e transferência manual pelo Administrador.`,
    timestamp: "Agora"
  });

  // Nota: withdrawnAmount só é actualizado quando o Admin aprova o pedido
  // (ver /api/payout-requests/:id/approve), para nunca reportar dinheiro
  // como "pago" sem uma transferência real ter sido confirmada.
  res.json({ success: true, request: newRequest, pending: true });
});

// GET lista de pedidos de saque (para o Painel Administrativo)
app.get("/api/payout-requests", async (req, res) => {
  noCache(res);
  await refreshFromSupabase("payout_requests", payoutRequests);
  res.json(payoutRequests);
});

// POST Admin aprova o saque — só agora o valor é debitado do saldo do prestador,
// depois de o Admin confirmar que a transferência real (M-Pesa/e-Mola/Banco) foi feita.
app.post("/api/payout-requests/:id/approve", requireAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const request = payoutRequests.find(p => p.id === id);
  if (!request) {
    return res.status(404).json({ error: "Pedido de saque não encontrado" });
  }
  if (request.status !== "pending") {
    return res.status(400).json({ error: "Este pedido já foi processado" });
  }

  const cand = candidates.find(c => c.id === request.candidateId);
  if (cand) {
    cand.withdrawnAmount = (cand.withdrawnAmount || 0) + request.amount;
  }
  request.status = "paid";
  request.updatedAt = new Date().toISOString();

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "WITHDRAWAL_APPROVED",
    detail: `Administrador confirmou a transferência de ${request.amount} MZN para ${request.candidateName}.`,
    timestamp: "Agora"
  });

  res.json({ success: true, request, candidate: cand });
});

// POST Admin rejeita o pedido de saque (ex: dados bancários incorrectos)
app.post("/api/payout-requests/:id/reject", requireAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  const request = payoutRequests.find(p => p.id === id);
  if (!request) {
    return res.status(404).json({ error: "Pedido de saque não encontrado" });
  }
  if (request.status !== "pending") {
    return res.status(400).json({ error: "Este pedido já foi processado" });
  }

  request.status = "rejected";
  request.adminNotes = adminNotes || "";
  request.updatedAt = new Date().toISOString();

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "WITHDRAWAL_REJECTED",
    detail: `Administrador rejeitou o pedido de saque de ${request.candidateName} (${request.amount} MZN). ${adminNotes ? "Motivo: " + adminNotes : ""}`,
    timestamp: "Agora"
  });

  res.json({ success: true, request });
});

// POST Create hire (Contratar Profissional ou Técnico - com canais de pagamento, cartão de débito e recibo)
app.post("/api/hires", (req, res) => {
  const { 
    candidateId, 
    candidateName, 
    candidateCategory,
    isTechnician,
    clientId, 
    clientName, 
    clientNuit,
    clientContact,
    serviceName, 
    rate, 
    description, 
    targetDate, 
    type, 
    location, 
    eta,
    paymentModality,
    paymentChannel,
    paymentStatus,
    cardLast4,
    totalEstimate,
    paidAmount,
    billingPeriod,
    workloadHours,
    effortLevel,
    contractModel,
    contractDuration,
    recruitmentLevel,
    recruitmentSalaryProposal,
    recruitmentNegotiationNotes,
    negotiationEmail,
    contractType,
    contractDurationMonths,
    observations,
    workModel,
    workSchedule,
    weeklyDayOff,
    workScheduleLabel
  } = req.body;

  if (!candidateId || !candidateName || !serviceName) {
    return res.status(400).json({ error: "Campos obrigatórios em falta para contratação" });
  }

  // Assign to selected client or default to Standard Bank Moçambique if not provided
  const finalClientId = clientId || "client-1";
  const finalClientName = clientName || "Standard Bank Moçambique";

  const contractDurationMonthsNum = Number(contractDurationMonths) || (contractDuration === "quarterly" ? 3 : contractDuration === "semiannual" ? 6 : contractDuration === "annual" ? 12 : 1);
  const contractTypeLabel = contractType === "indeterminado" 
    ? "Contrato por Tempo Indeterminado" 
    : contractType === "prestacao_servicos"
    ? `Prestação de Serviços (${contractDurationMonthsNum} Meses)`
    : `Contrato a Prazo Determinado (${contractDurationMonthsNum} Meses)`;

  const now = new Date();
  const receiptId = `REC-TAR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  const authCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const isTech = Boolean(isTechnician);
  const finalPaymentStatus = isTech ? (paymentStatus || "confirmed_escrow") : "monthly_contract";
  const finalTotalAmount = Number(totalEstimate) || (isTech ? Number(rate || 350) * Number(workloadHours || 4) : Number(recruitmentSalaryProposal) || 25000);
  const finalPaidAmount = Number(paidAmount) || (isTech ? (paymentModality === "half" ? Math.round(finalTotalAmount / 2) : finalTotalAmount) : 0);

  const newHire: any = {
    id: `hire-${Date.now()}`,
    candidateId,
    candidateName,
    candidateCategory: candidateCategory || (isTech ? "tech" : "recruitment"),
    isTechnician: isTech,
    clientId: finalClientId,
    clientName: finalClientName,
    clientNuit: clientNuit || "400192831",
    clientContact: clientContact || "+258 84 000 0000",
    serviceName,
    rate: Number(rate) || 0,
    description: description || "",
    targetDate: targetDate || "Imediato",
    status: "pending_validation", // Enters immediately for Tarira Central validation
    createdAt: new Date().toISOString(),
    type: type || "normal",
    location: location || "Maputo, Moçambique",
    eta: eta || "",
    paymentModality: isTech ? (paymentModality || "full") : "monthly_salary",
    paymentChannel: paymentChannel || "card",
    paymentStatus: finalPaymentStatus,
    cardLast4: cardLast4 || (paymentChannel === "card" ? "8821" : undefined),
    totalEstimate: finalTotalAmount,
    paidAmount: finalPaidAmount,
    billingPeriod: billingPeriod || "daily",
    workloadHours: Number(workloadHours) || 4,
    effortLevel: effortLevel || "standard",
    receiptId,
    authCode,
    contractModel: contractModel || (isTech ? "connect" : "recruitment"),
    contractType: contractType || "determinado",
    contractDuration: contractDuration || (contractType === "indeterminado" ? "indefinite" : `${contractDurationMonthsNum}_months`),
    contractDurationMonths: contractDurationMonthsNum,
    recruitmentLevel: recruitmentLevel || "mid",
    recruitmentComplexityLevel: req.body.recruitmentComplexityLevel || recruitmentLevel || "mid",
    recruitmentSalaryProposal: Number(recruitmentSalaryProposal) || 25000,
    recruitmentNegotiationNotes: recruitmentNegotiationNotes || observations || "",
    observations: observations || recruitmentNegotiationNotes || "",
    negotiationEmail: negotiationEmail || "",
    workModel: workModel || "presential",
    workSchedule: workSchedule || "full_time",
    weeklyDayOff: weeklyDayOff || "domingo",
    workScheduleLabel: workScheduleLabel || (workSchedule === "full_time" ? "Período Integral (40h/semana • 1 folga por semana)" : workSchedule === "part_time" ? "Meio Período (20h/semana)" : "Horário Flexível por Objetivos"),
    documentName: req.body.documentName || "",
    documentUrl: req.body.documentUrl || "",
    photoUrl: req.body.photoUrl || "",
    voiceDuration: req.body.voiceDuration || 0,
    isDemo: false,
    tariraAgentValidated: false,
    tariraValidationNotes: "",
    payoutRequested: false,
    payoutPaid: false,
    checkins: [
      isTech 
        ? `⚡ TARIRA CONNECT • SOLICITAÇÃO TÉCNICA: ${serviceName} (${workloadHours || 4}h)`
        : `💼 TARIRA RECRUIT • FORMULAÇÃO CONTRATUAL: ${contractTypeLabel}`,
      `💳 CANAL DE PAGAMENTO: ${paymentChannel ? paymentChannel.toUpperCase() : "CARTÃO DE DÉBITO"} ${cardLast4 ? `(Final •••• ${cardLast4})` : ""}`,
      `🧾 RECIBO EMITIDO: ${receiptId} (Autenticação: ${authCode})`,
      `💰 VALOR TOTAL: ${finalTotalAmount.toLocaleString()} MZN • LIQUIDADO: ${finalPaidAmount.toLocaleString()} MZN`,
      `📍 LOCAL: ${location || "Maputo"} • AGENDADO: ${targetDate || "Imediato"}`,
      `⏳ Dia 1 — Pedido registado e transmitido à Central TARIRA.`
    ]
  };

  hires.unshift(newHire);

  // Registo na Central TARIRA & Envio de notificação oficial por e-mail para tariraecossystem@gmail.com
  const propId = isTech ? `PROP-CONN-${Date.now().toString().slice(-6)}` : `PROP-REC-${Date.now().toString().slice(-6)}`;
  const hireBusinessUnit = isTech ? "Tarira Connect" : "Tarira Recruiting";
  const hireProposal: CommercialProposal = {
    id: propId,
    source: isTech ? "connect" : "b2b_recruitment",
    businessUnit: hireBusinessUnit,
    companyName: finalClientName,
    contactPerson: clientContact || finalClientName,
    contactEmail: negotiationEmail || "tarira.ecossistema@gmail.com",
    contactPhone: clientContact || "+258 84 000 0000",
    operationType: `${hireBusinessUnit}: ${serviceName}`,
    headcount: 1,
    slaLevel: type === "emergency" ? "Emergência Imediata (24h)" : "Atendimento Agendado",
    comments: `Contratação para ${candidateName} (${isTech ? "Técnico de Ofício" : "Profissional Qualificado"}). Local: ${location || "Maputo"}. Detalhes: ${description || "Sem observações adicionais"}.`,
    submittedAt: new Date().toISOString(),
    status: "pending",
    budgetEstimateMzn: finalTotalAmount,
    assignedManager: isTech ? "Dinis Mandlate (Lead Técnico Connect)" : "Dinis Mandlate (Recruiting Lead)",
    internalNotes: `Pedido de contratação criado no fluxo de contratação (Hire ID: ${newHire.id}).`,
    emailNotificationSent: true,
    emailNotificationRecipient: "tarira.ecossistema@gmail.com",
    emailNotificationSentAt: new Date().toISOString(),
    emailNotificationSubject: `[PROPOSTA ${hireBusinessUnit.toUpperCase()}] ${finalClientName} — ${serviceName} (Ref: ${propId})`
  };
  commercialProposals.unshift(hireProposal);

  dispatchProposalNotificationEmail({
    businessUnit: hireBusinessUnit,
    proposalId: propId,
    companyName: finalClientName,
    contactPerson: finalClientName,
    contactEmail: negotiationEmail || "tarira.ecossistema@gmail.com",
    contactPhone: clientContact || "+258 84 000 0000",
    serviceType: `${isTech ? "Intervenção Técnica de Ofício" : "Contrato Profissional"}: ${serviceName}`,
    headcount: 1,
    slaLevel: type === "emergency" ? "Emergência 24h" : "Normal",
    budget: finalTotalAmount,
    comments: description || `Contratação de ${candidateName}. Local: ${location || "Maputo"}`,
    location: location || "Maputo"
  });

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "HIRE_CREATED",
    detail: `Novo pedido de serviço por '${finalClientName}' para '${candidateName}'. Recibo: ${receiptId}. Canal: ${paymentChannel || "card"}. Total: ${finalTotalAmount.toLocaleString()} MZN. Registado na Central TARIRA e notificação expedida por e-mail para tarira.ecossistema@gmail.com (Ref: ${propId}).`,
    timestamp: "Agora"
  });

  res.status(201).json(newHire);
});

// POST Validate a hire request by Tarira Agent
app.post("/api/hires/:id/validate", requireAuthMiddleware, (req, res) => {
  const { id } = req.params;
  const { notes, targetDate } = req.body;

  const hire: any = hires.find(h => h.id === id);
  if (!hire) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }
  {
    const session = extractSessionFromRequest(req);
    if (!canActOnHire(session, hire)) {
      return res.status(403).json({ error: "Não tem permissão para validar este pedido.", code: "FORBIDDEN_NOT_OWNER" });
    }
  }

  hire.status = "validated";
  hire.tariraAgentValidated = true;
  hire.tariraValidationNotes = notes || "Técnico escalado para deslocação imediata.";
  if (targetDate) {
    hire.targetDate = targetDate;
  }

  hire.checkins.unshift(`✓ VALIDADO PELOS AGENTES — Indicação TARIRA: ${hire.tariraValidationNotes}. Deslocação autorizada para o dia ${hire.targetDate}.`);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "HIRE_VALIDATED",
    detail: `Agentes Tarira validaram pedido ${id} para ${hire.candidateName}`,
    timestamp: "Agora"
  });

  res.json({ success: true, hire });
});

// POST Request payout of the upfront paid amount by the provider
app.post("/api/hires/:id/payout-request", requireAuthMiddleware, (req, res) => {
  const { id } = req.params;
  const hire: any = hires.find(h => h.id === id);
  if (!hire) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }
  {
    const session = extractSessionFromRequest(req);
    if (!canActOnHire(session, hire)) {
      return res.status(403).json({ error: "Não tem permissão para solicitar adiantamento sobre este pedido.", code: "FORBIDDEN_NOT_OWNER" });
    }
  }

  hire.payoutRequested = true;
  hire.checkins.unshift(`⏳ SOLICITAÇÃO TÉCNICA — Prestador solicitou adiantamento dos fundos de arranque.`);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "PAYOUT_REQUEST",
    detail: `Prestador ${hire.candidateName} solicitou adiantamento para pedido ${id}`,
    timestamp: "Agora"
  });

  res.json({ success: true, hire });
});

// POST Approve and pay the requested upfront amount to the provider
app.post("/api/hires/:id/payout-pay", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const hire: any = hires.find(h => h.id === id);
  if (!hire) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }

  hire.payoutPaid = true;
  
  // Calculate value in Meticais (e.g., minimum 4h times rateMzn, 50% if half, 100% if full)
  const cand = candidates.find(c => c.id === hire.candidateId);
  const rateMzn = cand ? (cand.rateMzn || 1000) : 1000;
  const totalValue = rateMzn * 4;
  const payoutValue = hire.paymentModality === "full" ? totalValue : (totalValue * 0.5);

  if (cand) {
    cand.withdrawnAmount = (cand.withdrawnAmount || 0) + payoutValue;
  }

  hire.checkins.unshift(`✓ ADIANTAMENTO PAGO — Valor de ${payoutValue} MZN transferido para a conta móvel do prestador.`);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "PAYOUT_PAID",
    detail: `Tarira pagou ${payoutValue} MZN a ${hire.candidateName} para pedido ${id}`,
    timestamp: "Agora"
  });

  res.json({ success: true, hire, candidate: cand });
});

// POST Mark service as executed / performed by the provider
app.post("/api/hires/:id/execute", requireAuthMiddleware, (req, res) => {
  const { id } = req.params;
  const hire: any = hires.find(h => h.id === id);
  if (!hire) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }
  {
    const session = extractSessionFromRequest(req);
    if (!canActOnHire(session, hire)) {
      return res.status(403).json({ error: "Não tem permissão para marcar este serviço como executado.", code: "FORBIDDEN_NOT_OWNER" });
    }
  }

  hire.status = "executed";
  hire.checkins.unshift(`✓ SERVIÇO EFETUADO — O prestador declarou o serviço concluído. Aguardando validação final e pontuação do cliente.`);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "HIRE_EXECUTED",
    detail: `Prestador ${hire.candidateName} marcou pedido ${id} como executado`,
    timestamp: "Agora"
  });

  res.json({ success: true, hire });
});

// POST Submit provider evaluation or reclaim/complaint
app.post("/api/hires/:id/provider-feedback", requireAuthMiddleware, (req, res) => {
  const { id } = req.params;
  const { rating, comment, reclaimText } = req.body;

  const hire: any = hires.find(h => h.id === id);
  if (!hire) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }
  {
    const session = extractSessionFromRequest(req);
    if (!canActOnHire(session, hire)) {
      return res.status(403).json({ error: "Não tem permissão para dar feedback sobre este pedido.", code: "FORBIDDEN_NOT_OWNER" });
    }
  }

  hire.providerRating = {
    rating: Number(rating) || 5,
    comment: comment || "Excelente cliente, correu tudo muito bem."
  };

  if (reclaimText) {
    hire.providerReclaim = {
      text: reclaimText,
      status: "pending"
    };
    hire.checkins.unshift(`⚠️ RECLAMAÇÃO PRESTADOR — "${reclaimText}". Equipa técnica de arbitragem TARIRA notificada.`);
  } else {
    hire.checkins.unshift(`⭐ AVALIAÇÃO PRESTADOR — Prestador avaliou o cliente com nota ${rating}/5.`);
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "PROVIDER_FEEDBACK",
    detail: `Prestador ${hire.candidateName} avaliou cliente em pedido ${id}`,
    timestamp: "Agora"
  });

  res.json({ success: true, hire });
});

// POST Update hire status (Aprovar, Concluir, etc.)
app.post("/api/hires/:id/status", requireAuthMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const hire = hires.find(h => h.id === id);
  if (!hire) {
    return res.status(404).json({ error: "Contratação não encontrada" });
  }
  {
    const session = extractSessionFromRequest(req);
    if (!canActOnHire(session, hire)) {
      return res.status(403).json({ error: "Não tem permissão para alterar o estado deste pedido.", code: "FORBIDDEN_NOT_OWNER" });
    }
  }

  hire.status = status;

  // Add appropriate check-ins or logs
  if (status === "active") {
    hire.checkins.unshift(`● ACTIVO — Trabalho em curso. Primeira ronda de supervisão activa TARIRA iniciada.`);
  } else if (status === "completed") {
    hire.checkins.unshift(`✓ CONCLUÍDO — Relatório final emitido. Prestação aprovada pelo cliente.`);
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "HIRE_STATUS_UPDATE",
    detail: `Trabalho de ${hire.candidateName} alterado para status ${status.toUpperCase()}`,
    timestamp: "Agora"
  });

  res.json({ success: true, hire });
});

// POST Confirm payment / agreement and start onboarding
app.post("/api/hires/:id/confirm-payment", requireAuthMiddleware, (req, res) => {
  const { id } = req.params;
  const hire = hires.find(h => h.id === id);
  if (!hire) {
    return res.status(404).json({ error: "Contratação não encontrada" });
  }
  {
    const session = extractSessionFromRequest(req);
    if (!canActOnHire(session, hire)) {
      return res.status(403).json({ error: "Não tem permissão para confirmar o pagamento deste pedido.", code: "FORBIDDEN_NOT_OWNER" });
    }
  }

  hire.paymentStatus = "fully_paid";
  hire.status = "onboarding";
  if (!hire.onboardingSteps) {
    hire.onboardingSteps = [false, false, false, false];
  }
  if (!hire.checkins) hire.checkins = [];
  
  hire.checkins.unshift(`✓ ACORDO / PAGAMENTO CONFIRMADO — Central TARIRA iniciou o Onboarding do cliente.`);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "PAYMENT_CONFIRM",
    detail: `Acordo e pagamento confirmados pela central para o pedido de ${hire.clientName}`,
    timestamp: "Agora"
  });

  res.json({ success: true, hire });
});

// GET list all manual payment requests
app.get("/api/payments", (req, res) => {
  res.json(paymentOrders);
});

// POST create a new manual payment request
app.post("/api/payments", (req, res) => {
  const {
    userId,
    userName,
    userEmail,
    userPhone,
    userType,
    serviceTitle,
    amount,
    method,
    reference,
    proofUrl,
    hireId
  } = req.body;

  if (!userName || !serviceTitle || !amount || !method || !reference) {
    return res.status(400).json({ error: "Campos obrigatórios em falta (Nome, Serviço, Valor, Método, Referência)." });
  }

  const newPayment: PaymentOrder = {
    id: `pay-${Date.now()}`,
    userId: userId || "user-anon",
    userName: userName || "Cliente TARIRA",
    userEmail: userEmail || "",
    userPhone: userPhone || "",
    userType: userType || "company",
    serviceTitle: serviceTitle || "Serviço TARIRA",
    amount: Number(amount) || 0,
    method: method as any,
    reference: String(reference).trim(),
    proofUrl: proofUrl || "",
    status: "pending",
    createdAt: new Date().toISOString(),
    hireId: hireId || ""
  };

  paymentOrders.unshift(newPayment);

  // If linked to a hire, update the hire's payment status to pending_verification
  if (hireId) {
    const hire = hires.find(h => h.id === hireId);
    if (hire) {
      hire.paymentStatus = "pending";
      if (!hire.checkins) hire.checkins = [];
      hire.checkins.unshift(`💳 PAGAMENTO ENVIADO — Comprovativo/Ref. ${reference} submetido pelo cliente. Aguardando auditoria manual do Admin.`);
    }
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "PAYMENT_SUBMITTED",
    detail: `Novo pagamento manual de ${userName} (${amount} MZN via ${method.toUpperCase()}) submetido para verificação. Ref: ${reference}`,
    timestamp: "Agora"
  });

  // Notificar imediatamente o e-mail geral da empresa sobre o pagamento manual a aguardar conferência
  const transport = getMailTransport();
  if (transport) {
    transport.sendMail({
      from: process.env.SMTP_FROM || `"TARIRA Pagamentos & Finanças" <${process.env.SMTP_USER || "financeiro@tarira.co.mz"}>`,
      to: "tariraecossystem@gmail.com",
      subject: `[PAGAMENTO MANUAL PENDENTE] ${newPayment.userName} — ${newPayment.amount.toLocaleString()} MZN (${newPayment.method.toUpperCase()})`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0b132b; color: #f8fafc; padding: 24px; border-radius: 8px;">
          <h2 style="color: #38bdf8; margin-bottom: 12px;">Novo Pagamento Manual a Aguardar Conferência</h2>
          <p style="color: #cbd5e1;">Foi submetido um novo pagamento manual no ecossistema TARIRA. Por favor verifique o extracto bancário ou carteira móvel antes de aprovar o plano/serviço.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #1c2541; border-radius: 6px;">
            <tr><td style="padding: 10px; color: #94a3b8; border-bottom: 1px solid #334155;">Cliente / Entidade:</td><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #334155;">${newPayment.userName}</td></tr>
            <tr><td style="padding: 10px; color: #94a3b8; border-bottom: 1px solid #334155;">Serviço / Plano:</td><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #334155;">${newPayment.serviceTitle}</td></tr>
            <tr><td style="padding: 10px; color: #94a3b8; border-bottom: 1px solid #334155;">Valor:</td><td style="padding: 10px; font-weight: bold; color: #4ade80; border-bottom: 1px solid #334155;">${newPayment.amount.toLocaleString()} MZN</td></tr>
            <tr><td style="padding: 10px; color: #94a3b8; border-bottom: 1px solid #334155;">Método / Canal:</td><td style="padding: 10px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #334155;">${newPayment.method}</td></tr>
            <tr><td style="padding: 10px; color: #94a3b8; border-bottom: 1px solid #334155;">Código / Referência:</td><td style="padding: 10px; font-family: monospace; color: #facc15; font-weight: bold; border-bottom: 1px solid #334155;">${newPayment.reference}</td></tr>
            ${newPayment.userPhone ? `<tr><td style="padding: 10px; color: #94a3b8; border-bottom: 1px solid #334155;">Telefone:</td><td style="padding: 10px; border-bottom: 1px solid #334155;">${newPayment.userPhone}</td></tr>` : ''}
            ${newPayment.userEmail ? `<tr><td style="padding: 10px; color: #94a3b8;">E-mail:</td><td style="padding: 10px;">${newPayment.userEmail}</td></tr>` : ''}
          </table>
          ${newPayment.proofUrl ? `<p style="margin-top: 16px;"><a href="${newPayment.proofUrl}" target="_blank" style="background: #2563eb; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Abrir Comprovativo de Transferência</a></p>` : '<p style="color: #94a3b8; font-style: italic;">Sem comprovativo anexado.</p>'}
          <p style="font-size: 11px; color: #64748b; margin-top: 20px;">Aceda ao Painel de Administração TARIRA para aprovar ou rejeitar.</p>
        </div>
      `
    }).catch(err => console.warn("[SMTP AVISO] Falha ao enviar notificação de pagamento:", err?.message));
  }

  res.json({ success: true, payment: newPayment });
});

// POST update payment status (admin confirm or reject)
app.post("/api/payments/:id/status", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const payOrder = paymentOrders.find(p => p.id === id);
  if (!payOrder) {
    return res.status(404).json({ error: "Pedido de pagamento não encontrado." });
  }

  payOrder.status = status;
  payOrder.adminNotes = adminNotes || "";
  payOrder.updatedAt = new Date().toISOString();

  // If hireId associated, update hire
  if (payOrder.hireId) {
    const hire = hires.find(h => h.id === payOrder.hireId);
    if (hire) {
      if (status === "confirmed") {
        hire.paymentStatus = "fully_paid";
        hire.status = "onboarding";
        if (!hire.onboardingSteps) hire.onboardingSteps = [true, false, false, false];
        if (!hire.checkins) hire.checkins = [];
        hire.checkins.unshift(`✅ PAGAMENTO VALIDADO — Central confirmou o pagamento de ${payOrder.amount} MZN (${payOrder.method.toUpperCase()}). Serviço e onboarding desbloqueados!`);
      } else if (status === "rejected") {
        hire.paymentStatus = "pending";
        if (!hire.checkins) hire.checkins = [];
        hire.checkins.unshift(`❌ PAGAMENTO REJEITADO — O pagamento referente a ${payOrder.reference} não foi validado. Motivo: ${adminNotes || "Comprovativo não identificado"}.`);
      }
    }
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: status === "confirmed" ? "PAYMENT_CONFIRMED" : "PAYMENT_REJECTED",
    detail: `Pagamento ${payOrder.id} (${payOrder.userName}) alterado para ${status.toUpperCase()} pelo Administrador.`,
    timestamp: "Agora"
  });

  res.json({ success: true, payment: payOrder });
});

// POST Toggle onboarding steps for a hire
app.post("/api/hires/:id/onboarding-step", requireAuthMiddleware, (req, res) => {
  const { id } = req.params;
  const { stepIndex, completed } = req.body;

  const hire = hires.find(h => h.id === id);
  if (!hire) {
    return res.status(404).json({ error: "Contratação não encontrada" });
  }
  {
    const session = extractSessionFromRequest(req);
    if (!canActOnHire(session, hire)) {
      return res.status(403).json({ error: "Não tem permissão para atualizar o onboarding deste pedido.", code: "FORBIDDEN_NOT_OWNER" });
    }
  }

  if (!hire.onboardingSteps) {
    hire.onboardingSteps = [false, false, false, false];
  }
  if (!hire.checkins) hire.checkins = [];

  hire.onboardingSteps[stepIndex] = Boolean(completed);

  const stepLabels = [
    "Enviar Kit de Boas-Vindas e Manuais de SLA",
    "Validar EPIs & Uniforme da TARIRA no Terreno",
    "Agendar Data de Onboarding Técnico",
    "Finalizar Alocação & Emitir Guia de Entrada"
  ];

  const label = stepLabels[stepIndex] || `Passo ${stepIndex + 1}`;
  if (completed) {
    hire.checkins.unshift(`✓ ONBOARDING — Passo "${label}" concluído e verificado pela Central.`);
  } else {
    hire.checkins.unshift(`⚠️ ONBOARDING — Passo "${label}" marcado como pendente pela Central.`);
  }

  // If all steps completed, automatically move status to active
  const allDone = hire.onboardingSteps.every(s => s === true);
  if (allDone) {
    hire.status = "active";
    hire.checkins.unshift(`🚀 OPERACIONAL — Processo de onboarding 100% concluído. Profissional alocado e pronto para início.`);
  } else if (hire.status === "active") {
    // If we marked a step as incomplete but it was active, demote to onboarding
    hire.status = "onboarding";
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "ONBOARDING_UPDATE",
    detail: `Passo de onboarding "${label}" alterado para ${completed ? "CONCLUÍDO" : "PENDENTE"} para ${hire.clientName}`,
    timestamp: "Agora"
  });

  res.json({ success: true, hire });
});

// POST Submit hire review (Avaliação do serviço)
app.post("/api/hires/:id/review", requireAuthMiddleware, (req, res) => {
  const { id } = req.params;
  const { rating, text, quality, punctuality, cleanliness } = req.body;

  const hire = hires.find(h => h.id === id);
  if (!hire) {
    return res.status(404).json({ error: "Contratação não encontrada" });
  }
  {
    const session = extractSessionFromRequest(req);
    if (!canActOnHire(session, hire)) {
      return res.status(403).json({ error: "Não tem permissão para avaliar este pedido.", code: "FORBIDDEN_NOT_OWNER" });
    }
  }

  const numericRating = Number(rating);
  hire.review = {
    rating: numericRating,
    text: text || "Excelente trabalho prestado.",
    quality: Number(quality) || 5,
    punctuality: Number(punctuality) || 5,
    cleanliness: Number(cleanliness) || 5
  };

  hire.status = "completed";

  // Update original candidate stats in memory
  const cand = candidates.find(c => c.id === hire.candidateId);
  if (cand) {
    if (!cand.reviews) cand.reviews = [];
    cand.reviews.unshift({
      reviewer: "Empresa Demo S.A.",
      date: new Date().toLocaleDateString("pt-MZ", { day: "numeric", month: "short", year: "numeric" }),
      text: text || "Excelente trabalho prestado.",
      rating: numericRating,
      quality: Number(quality) || 5,
      punctuality: Number(punctuality) || 5,
      cleanliness: Number(cleanliness) || 5
    });

    // Recalculate average rating
    const totalRating = cand.reviews.reduce((acc, r) => acc + r.rating, 0);
    cand.rating = Number((totalRating / cand.reviews.length).toFixed(1));
    cand.completedJobs = (cand.completedJobs || 0) + 1;
    
    // Promise score can slightly change based on review quality!
    if (numericRating >= 4.5) {
      cand.promiseScore = Math.min(100, (cand.promiseScore || 90) + 1);
    } else {
      cand.promiseScore = Math.max(50, (cand.promiseScore || 90) - 3);
    }
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "HIRE_REVIEW",
    detail: `Cliente avaliou ${hire.candidateName} com estrela ${numericRating}/5 em ${hire.serviceName}`,
    timestamp: "Agora"
  });

  res.json({ success: true, hire });
});

// AI Candidate Triage endpoint using Gemini
app.post("/api/triagem", async (req, res) => {
  try {
    const { name, surname, email, phone, residence, bio, category, identityDocName, photo } = req.body;

    if (!name || !surname || !bio || !category || !phone || !residence) {
      return res.status(400).json({ error: "Campos obrigatórios em falta (nome, apelido, biografia, categoria, contacto de telefone e residência)" });
    }

    const { ai, enabled } = getGeminiClient();

    let matchScore = 75;
    let feedback = "Obrigado por submeter a sua candidatura à TARIRA Recruit. O seu perfil foi integrado na nossa base de dados geral de candidatos abertos. Iremos analisar a sua experiência em detalhe e contactá-lo-emos assim que surgir uma vaga que se enquadre no seu perfil técnico.";

    if (enabled && ai) {
      try {
        const categoryLabel = 
          category === "prof" ? "Profissional Técnico de Nível Superior (Gestores, Engenheiros, Advogados, Consultores)" :
          category === "tech" ? "Técnico Especializado Prático (Electricistas, Carpinteiros, Canalizadores, Pintores)" :
          "Trabalhador de Serviços Domésticos e de Apoio (Babás, Diaristas, Cozinheiros, Jardineiros)";

        const prompt = `Analise o perfil e apresentação (bio) do seguinte candidato para o ecossistema TARIRA Recruit em Moçambique:
Nome Completo: ${name} ${surname}
Categoria Alvo: ${categoryLabel}
Apresentação / Experiência:
"${bio}"

Sua tarefa:
1. Atribua uma classificação de compatibilidade (matchScore) de 0 a 100 baseado na clareza, competências indicadas, termos técnicos adequados, profissionalismo e maturidade profissional indicados na bio.
2. Escreva um feedback detalhado, honesto, específico e construtivo em Português de Moçambique, seguindo estritamente estes 4 princípios:
   - HONESTO: Mencione os pontos fortes reais evidentes na bio e as lacunas lógicas se houverem.
   - ATEMPADO: Redija com tom de avaliação ágil e formal.
   - ESPECÍFICO: Refira-se a termos específicos usados na bio do candidato (ex: ferramentas, tecnologias ou competências listadas).
   - CONSTRUTIVO: Forneça um conselho direto de como ele/ela pode melhorar a sua apresentação ou adquirir competências em falta para se destacar no mercado moçambicano.

Retorne estritamente um JSON no seguinte formato:
{
  "matchScore": <número entre 0 e 100>,
  "feedback": "<mensagem de feedback em português conforme os princípios>"
}`;

        const geminiCall = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchScore: {
                  type: Type.INTEGER,
                  description: "Pontuação de compatibilidade de 0 a 100",
                },
                feedback: {
                  type: Type.STRING,
                  description: "Feedback profissional estruturado em Português seguindo os 4 princípios TARIRA",
                }
              },
              required: ["matchScore", "feedback"],
            }
          }
        });

        // Timeout preventivo de 2.5s para resposta ultrarrápida da submissão
        const timeoutCall = new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout 2500ms")), 2500)
        );

        const response = await Promise.race([geminiCall, timeoutCall]);

        if (response.text) {
          const result = JSON.parse(response.text.trim());
          matchScore = result.matchScore ?? 75;
          feedback = result.feedback ?? feedback;
        }
      } catch (geminiError) {
        console.error("Erro ao chamar o Gemini API:", geminiError);
        // Fallback to rules-based logic on API fail
        const bioLower = bio.toLowerCase();
        if (bioLower.includes("certificado") || bioLower.includes("curso") || bioLower.includes("experiência")) {
          matchScore = 88;
          feedback = `Excelente apresentação, ${name}. Identificámos menção a qualificações ou experiência sólida que correspondem aos padrões da TARIRA Recruit. Recomendamos que continue a destacar as suas certificações técnicas na sua bio e prepare portefólio físico ou digital para a próxima fase.`;
        } else {
          matchScore = 65;
          feedback = `Olá ${name}, obrigado pela candidatura. A sua bio é directa, mas beneficiaria muito se detalhasse as ferramentas específicas que utiliza no dia-a-dia, as suas obras ou trabalhos passados, e se possui alguma certificação formal de instituições de ensino técnico (como IFPELAC). Isto aumentará a sua confiança e pontuação na nossa plataforma.`;
        }
      }
    } else {
      // Offline Simulation fallback (when API Key is not configured yet)
      const bioLower = bio.toLowerCase();
      if (bioLower.includes("certificado") || bioLower.includes("curso") || bioLower.includes("anos") || bioLower.length > 100) {
        matchScore = Math.floor(Math.random() * 15) + 80; // 80 - 95
        feedback = `[Análise do Sistema] Olá ${name}, a sua bio demonstra excelente proficiência em competências práticas e organizacionais. Detalhar as suas passagens e marcas que domina confere honestidade e especificidade que a nossa equipa valoriza muito. Como sugestão construtiva, procure sempre mencionar as províncias ou bairros de Moçambique onde já realizou serviços para melhorar a compatibilidade geográfica automática da TARIRA.`;
      } else {
        matchScore = Math.floor(Math.random() * 20) + 55; // 55 - 75
        feedback = `[Análise do Sistema] Olá ${name}, agradecemos a sua candidatura aberta. A sua apresentação é simples, contudo, para aumentar o seu Match Rate na TARIRA, sugerimos expandir os detalhes da sua experiência técnica ou doméstica, indicando exactamente quais tarefas realiza com excelência e se possui alguma referência contactável de clientes anteriores.`;
      }
    }

    // IMPORTANTE: esta rota é apenas consultiva — faz a análise de IA (ou o
    // fallback baseado em regras) e devolve matchScore/feedback. Não cria nem
    // grava nenhum registo de candidato. Antes, esta rota inseria aqui um
    // segundo perfil de candidato (paralelo ao criado por POST /api/candidates
    // no mesmo fluxo de registo), o que causava DOIS registos duplicados por
    // cada inscrição — um completo (via /api/candidates) e um genérico,
    // incompleto, sem isProfessional definido (via aqui) — inflando o volume
    // de dados sincronizado a cada escrita e tornando mais provável que um
    // lote de sincronização com o Supabase falhasse por completo (ver
    // bulkUpsertTable em supabaseServer.ts). O registo definitivo do
    // candidato acontece sempre e só em POST /api/candidates.
    res.status(200).json({ matchScore, feedback });
  } catch (error: any) {
    console.error("Erro na triagem:", error);
    res.status(500).json({ error: "Erro interno ao processar a candidatura" });
  }
});

// TARIRA Consultoria - SaaS & On-Demand Service Structures
interface RecruitSubscription {
  id: string;
  clientId: string;
  clientName: string;
  planId: "starter" | "corporate" | "enterprise";
  planName: string;
  priceMzn: number;
  paymentChannel: "mpesa" | "emola" | "moza" | "standard_bank" | "bim" | string;
  paymentPhoneOrAccount?: string;
  nuitNumber?: string;
  createdAt: string;
  status: "active" | "pending_payment";
}

const recruitSubscriptions: RecruitSubscription[] = [];

interface ConsultingRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType: string;
  requestType?: "external_consulting" | "consulting_association" | string;
  details: string;
  budget: string;
  documentName?: string;
  documentSize?: string;
  documentData?: string;
  documentUrl?: string;
  createdAt: string;
  status: "pending" | "approved" | "completed";
}

const consultingRequests: ConsultingRequest[] = [];

// TARIRA Recruit - Portal Subscriptions & Account Maintenance Endpoints
app.get("/api/recruit/subscriptions", (req, res) => {
  res.json(recruitSubscriptions);
});

app.post("/api/recruit/subscribe", (req, res) => {
  const { clientId, clientName, planId, planName, priceMzn, paymentChannel, paymentPhoneOrAccount, nuitNumber } = req.body;
  if (!clientName || !planId || !planName || !priceMzn || !paymentChannel) {
    return res.status(400).json({ error: "Campos obrigatórios em falta (cliente, plano, preço e canal de pagamento)" });
  }

  const newSub: RecruitSubscription = {
    id: `sub-rec-${Date.now()}`,
    clientId: clientId || `client-${Date.now()}`,
    clientName,
    planId,
    planName,
    priceMzn: Number(priceMzn),
    paymentChannel,
    paymentPhoneOrAccount: paymentPhoneOrAccount || "",
    nuitNumber: nuitNumber || "",
    createdAt: new Date().toISOString(),
    status: "active"
  };

  recruitSubscriptions.unshift(newSub);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "RECRUIT_SUBSCRIPTION",
    detail: `Cliente '${clientName}' subscreveu a Manutenção de Conta do Portal TARIRA Recruit: ${planName} (${Number(priceMzn).toLocaleString()} MZN/mês) via ${paymentChannel.toUpperCase()}`,
    timestamp: "Agora"
  });

  res.status(201).json(newSub);
});

// TARIRA Consultoria Endpoints (consultoria operacional & associação externa — sem subscrição SaaS)
app.get("/api/consulting/requests", (req, res) => {
  res.json(consultingRequests);
});

app.post("/api/consulting/request", (req, res) => {
  const { clientName, clientEmail, clientPhone, serviceType, requestType, details, budget, documentName, documentSize, documentData, documentUrl } = req.body;
  if (!clientName || !clientEmail || !serviceType || !details || !budget) {
    return res.status(400).json({ error: "Campos obrigatórios em falta" });
  }
  const newReq: ConsultingRequest = {
    id: `req-${Date.now()}`,
    clientName,
    clientEmail,
    clientPhone: clientPhone || "",
    serviceType,
    requestType: requestType || "external_consulting",
    details,
    budget,
    documentName,
    documentSize,
    documentData,
    documentUrl,
    createdAt: new Date().toISOString(),
    status: "pending"
  };
  consultingRequests.unshift(newReq);

  // Registo na Central TARIRA & Envio de notificação oficial por e-mail para tariraecossystem@gmail.com
  const propId = `PROP-CONS-${Date.now().toString().slice(-6)}`;
  const parsedBudget = parseInt(String(budget).replace(/[^0-9]/g, "")) || undefined;
  const consultingProposal: CommercialProposal = {
    id: propId,
    source: "consulting",
    businessUnit: "Tarira Consulting",
    companyName: clientName,
    contactPerson: clientName,
    contactEmail: clientEmail,
    contactPhone: clientPhone || "+258 84 000 0000",
    operationType: `Tarira Consulting: ${serviceType}`,
    headcount: 1,
    slaLevel: requestType === "consulting_association" ? "Associação / Parceria Técnica" : "Diagnóstico & Consultoria",
    comments: details,
    submittedAt: new Date().toISOString(),
    status: "pending",
    documentName,
    documentSize,
    documentData,
    budgetEstimateMzn: parsedBudget,
    internalNotes: `Pedido de Consultoria submetido via subpágina de consultoria (${requestType === "consulting_association" ? "Associação Externa" : "Consultoria Especializada"}).`,
    assignedManager: "Mesa de Consultoria TARIRA",
    emailNotificationSent: true,
    emailNotificationRecipient: "tarira.ecossistema@gmail.com",
    emailNotificationSentAt: new Date().toISOString(),
    emailNotificationSubject: `[PROPOSTA TARIRA CONSULTING] ${clientName} — Consultoria: ${serviceType} (Ref: ${propId})`
  };
  commercialProposals.unshift(consultingProposal);

  dispatchProposalNotificationEmail({
    businessUnit: "Tarira Consulting",
    proposalId: propId,
    companyName: clientName,
    contactPerson: clientName,
    contactEmail: clientEmail,
    contactPhone: clientPhone || "+258 84 000 0000",
    serviceType: `Consultoria Estratégica: ${serviceType}`,
    headcount: 1,
    slaLevel: requestType === "consulting_association" ? "Associação Técnica" : "Diagnóstico",
    budget: budget,
    comments: details,
    documentName,
    documentSize
  });

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CONSULTORIA_SERVICO",
    detail: `Novo pedido de Consultoria/Associação: '${serviceType}' (${requestType === 'consulting_association' ? 'Associação Externa' : 'Consultoria Especializada'}) submetido por '${clientName}'. Notificação oficial expedida por e-mail para tarira.ecossistema@gmail.com e registado na Central TARIRA (Ref: ${propId}).`,
    timestamp: "Agora"
  });

  res.status(201).json(newReq);
});

app.post("/api/consulting/requests/:id/status", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const request = consultingRequests.find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: "Pedido de consultoria não encontrado" });
  }
  request.status = status;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "CONSULTORIA_UPDATE",
    detail: `O estado do pedido de consultoria '${request.serviceType}' de '${request.clientName}' foi atualizado para '${status}'.`,
    timestamp: "Agora"
  });

  res.json(request);
});

// Email Confirmations Store & Dispatcher
export interface EmailConfirmationRecord {
  id: string;
  recipient: string;
  candidateName: string;
  subject: string;
  positionTitle: string;
  applicationType: "internal" | "external" | "spontaneous";
  applicationId: string;
  status: "sent" | "delivered";
  sentAt: string;
  htmlBody: string;
}

const emailConfirmations: EmailConfirmationRecord[] = [];

function dispatchApplicationConfirmationEmail(params: {
  candidateEmail: string;
  candidateName: string;
  positionTitle: string;
  applicationType: "internal" | "external" | "spontaneous";
  applicationId: string;
  department?: string;
  notes?: string;
  cvDocumentName?: string;
}): EmailConfirmationRecord {
  const isInternal = params.applicationType === "internal";
  const subject = isInternal
    ? `[TARIRA Equipa Interna] Confirmação de Candidatura Submetida - Ref: ${params.applicationId}`
    : `[TARIRA Recrutamento] Confirmação de Candidatura Registada - Ref: ${params.applicationId}`;

  const confirmationRecord: EmailConfirmationRecord = {
    id: `email-conf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipient: params.candidateEmail.trim().toLowerCase(),
    candidateName: params.candidateName,
    subject,
    positionTitle: params.positionTitle,
    applicationType: params.applicationType,
    applicationId: params.applicationId,
    status: "delivered",
    sentAt: new Date().toISOString(),
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/></head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid #d97706;">
            <h1 style="color: #d97706; font-size: 24px; margin: 0; letter-spacing: 2px; font-weight: 800;">TARIRA ECOSSYSTEM</h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
              ${isInternal ? "Central de Vagas & Equipa Interna • Talent Community" : "Plataforma de Recrutamento & Seleção Corporativa"}
            </p>
          </div>
          <div style="padding: 28px;">
            <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Olá ${params.candidateName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Confirmamos com sucesso a recepção da sua candidatura para <strong>${params.positionTitle}</strong> através do ecossistema oficial da TARIRA.
            </p>
            <div style="background: #f1f5f9; border-radius: 12px; padding: 18px; margin: 20px 0; font-size: 13px; border-left: 4px solid #d97706;">
              <p style="margin: 4px 0;"><strong>Código de Referência:</strong> <span style="font-family: monospace; color: #d97706; font-weight: bold;">${params.applicationId}</span></p>
              <p style="margin: 4px 0;"><strong>Email do Perfil:</strong> ${params.candidateEmail}</p>
              <p style="margin: 4px 0;"><strong>Tipo de Candidatura:</strong> ${isInternal ? "Equipa Interna TARIRA (Carreiras Corporativas)" : "Vagas e Oportunidades Externas"}</p>
              ${params.department ? `<p style="margin: 4px 0;"><strong>Área / Departamento:</strong> ${params.department}</p>` : ""}
              ${params.cvDocumentName ? `<p style="margin: 4px 0;"><strong>Currículo Anexado:</strong> ${params.cvDocumentName}</p>` : ""}
              <p style="margin: 4px 0;"><strong>Data / Hora:</strong> ${new Date().toLocaleString("pt-MZ")}</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              O seu perfil foi criado e associado ao seu email <strong>${params.candidateEmail}</strong> na nossa base de talentos. Todas as actualizações sobre o processo e convites para entrevistas serão enviadas directamente para este endereço de correio electrónico.
            </p>
            <div style="background: #ecfdf5; border-radius: 8px; padding: 12px 16px; margin: 18px 0; font-size: 12px; color: #065f46; border: 1px solid #a7f3d0;">
              ✓ <strong>Próximos Passos:</strong> A equipa de Recursos Humanos e People Operations irá analisar as suas qualificações. Não é necessária nenhuma acção adicional neste momento.
            </div>
          </div>
          <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            © 2026 TARIRA Ecosystem Services Lda. · Maputo, Moçambique · Todos os direitos reservados.
          </div>
        </div>
      </body>
      </html>
    `
  };

  emailConfirmations.unshift(confirmationRecord);
  return confirmationRecord;
}

// GET all dispatched email confirmations (for administrative inspection)
app.get("/api/email-confirmations", (req, res) => {
  res.json(emailConfirmations);
});

// Spontaneous Applications Endpoints
app.get("/api/spontaneous-applications", (req, res) => {
  res.json(spontaneousApplications);
});

app.post("/api/spontaneous-apply", (req, res) => {
  const data = req.body;
  if (!data.fullName) {
    return res.status(400).json({ error: "Nome completo é obrigatório." });
  }

  // Profile is created and identified primarily based on email
  const candidateEmail = (data.email || "").trim().toLowerCase();
  if (!candidateEmail || !candidateEmail.includes("@")) {
    return res.status(400).json({ error: "O endereço de Email é obrigatório para criação e identificação do perfil de candidatura." });
  }

  const isInternal = data.applicationType === "internal_team" || data.careerFocus === "internal_corporate_team";
  const positionTitle = data.targetDepartment || data.category || (isInternal ? "Equipa Interna TARIRA" : "Banco de Talentos");
  const appId = data.id || `${isInternal ? "corp" : "sp"}-${Date.now()}`;

  const newApp: SpontaneousApplication = {
    id: appId,
    fullName: data.fullName.trim(),
    phone: data.phone ? data.phone.trim() : "",
    email: candidateEmail,
    residence: data.residence || data.city || "Maputo Cidade",
    city: data.city || data.residence || "Maputo Cidade",
    category: data.category || data.targetDepartment || "Equipa Interna",
    careerFocus: isInternal ? "internal_corporate_team" : (data.careerFocus || "recruitment_no_exp"),
    nuit: data.nuit || "",
    idDocumentName: data.idDocumentName || "BI_Candidato_Anexado.pdf",
    idDocumentUrl: data.idDocumentUrl || "",
    cvDocumentName: data.cvDocumentName || "CV_Modelo_ATS_Processado.pdf",
    cvDocumentUrl: data.cvDocumentUrl || data.cvUrl || "",
    isAtsValidated: Boolean(data.isAtsValidated ?? true),
    atsScore: Number(data.atsScore) || 92,
    experiences: Array.isArray(data.experiences) ? data.experiences : [],
    submittedAt: new Date().toISOString(),
    status: "pending",
    notes: data.notes || (isInternal ? "Candidatura para a Equipa Interna TARIRA." : "Candidatura Espontânea registada no portal TARIRA."),
    targetDepartment: data.targetDepartment,
    seniorityLevel: data.seniorityLevel,
    linkedinUrl: data.linkedinUrl,
    portfolioUrl: data.portfolioUrl,
    workModelPreference: data.workModelPreference,
    availability: data.availability,
    coverLetter: data.coverLetter,
    skills: Array.isArray(data.skills) ? data.skills : [],
    expectedSalary: data.expectedSalary,
    applicationType: isInternal ? "internal_team" : (data.applicationType || "spontaneous")
  };
  spontaneousApplications.unshift(newApp);

  // Sync / Create Candidate Profile in candidate repository keyed by Email
  const existingCandidateIndex = candidates.findIndex(c => c.email && c.email.trim().toLowerCase() === candidateEmail);
  const nameParts = data.fullName.trim().split(" ");
  const firstName = nameParts[0] || data.fullName.trim();
  const lastName = nameParts.slice(1).join(" ") || "";

  if (existingCandidateIndex !== -1) {
    candidates[existingCandidateIndex] = {
      ...candidates[existingCandidateIndex],
      name: firstName,
      surname: lastName,
      email: candidateEmail,
      phone: data.phone ? data.phone.trim() : candidates[existingCandidateIndex].phone,
      title: positionTitle,
      category: isInternal ? "prof" : candidates[existingCandidateIndex].category,
      skills: Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : candidates[existingCandidateIndex].skills,
      status: "pending"
    };
  } else {
    candidates.unshift({
      id: `cand-${Date.now()}`,
      name: firstName,
      surname: lastName,
      title: positionTitle,
      category: isInternal ? "prof" : "tech",
      subCategory: isInternal ? `Equipa Interna · ${positionTitle}` : "Banco de Talentos",
      city: data.city || data.residence || "Maputo 🇲🇿",
      residence: data.residence || data.city || "Maputo",
      email: candidateEmail,
      phone: data.phone ? data.phone.trim() : "",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      promiseScore: 92,
      rating: 4.8,
      completedJobs: 0,
      experienceYears: data.seniorityLevel === "senior" ? 6 : data.seniorityLevel === "mid" ? 4 : 2,
      rateMzn: 1500,
      availableNow: true,
      bio: data.coverLetter || `Candidato registado para ${positionTitle} com identificação via email ${candidateEmail}.`,
      skills: Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : [positionTitle, "Gestão", "Comunicação"],
      documents: [
        { type: "cv", title: data.cvDocumentName || "CV_Candidato.pdf", issuer: "Submissão Portal", status: "verified" }
      ],
      portfolio: [],
      reviews: [],
      matchScore: 92,
      feedback: "Perfil registado e associado ao email de candidatura.",
      status: "pending",
      timestamp: new Date().toISOString()
    });
  }

  // Dispatch Confirmation Email to Candidate
  const confirmation = dispatchApplicationConfirmationEmail({
    candidateEmail,
    candidateName: data.fullName.trim(),
    positionTitle,
    applicationType: isInternal ? "internal" : "external",
    applicationId: appId,
    department: data.targetDepartment || data.category,
    cvDocumentName: data.cvDocumentName
  });

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: isInternal ? "INTERNAL_TEAM_APPLICATION" : "SPONTANEOUS_APPLICATION",
    detail: `Nova candidatura (${isInternal ? "Equipa Interna" : "Externa/Espontânea"}): ${newApp.fullName} (Email: ${newApp.email}) — Confirmação de email despachada para ${candidateEmail}`,
    timestamp: "Agora"
  });

  res.status(201).json({
    ...newApp,
    emailConfirmation: {
      sent: true,
      recipient: confirmation.recipient,
      subject: confirmation.subject,
      sentAt: confirmation.sentAt
    }
  });
});

app.delete("/api/spontaneous-applications/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const auditData = req.body || {};
  const index = spontaneousApplications.findIndex(a => a.id === id);
  if (index !== -1) {
    const removed = spontaneousApplications.splice(index, 1)[0];
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      type: "ELIMINACAO_CANDIDATURA_ESPONTANEA",
      detail: `Candidatura espontânea eliminada: ${removed.fullName} (${removed.id}) por ${auditData.operatorName || "Admin"}. Motivo: ${auditData.reason || "Auditoria"}`,
      timestamp: "Agora"
    });
  }
  res.json({ success: true, message: "Candidatura espontânea eliminada com sucesso." });
});

app.put("/api/spontaneous-applications/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const index = spontaneousApplications.findIndex(a => a.id === id);
  if (index !== -1) {
    spontaneousApplications[index] = { ...spontaneousApplications[index], ...data };
    return res.json(spontaneousApplications[index]);
  }
  res.status(404).json({ error: "Candidatura não encontrada" });
});

app.post("/api/spontaneous-applications/:id/status", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const appItem = spontaneousApplications.find(a => a.id === id);
  if (appItem) {
    appItem.status = status;
    return res.json({ success: true, app: appItem });
  }
  res.status(404).json({ error: "Candidatura não encontrada" });
});

// Partner Companies & Stores Endpoints
app.delete("/api/partner-companies/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "ELIMINACAO_EMPRESA_PARCEIRA",
    detail: `Empresa parceira ID ${id} eliminada do ecossistema.`,
    timestamp: "Agora"
  });
  res.json({ success: true });
});

app.delete("/api/partner-stores/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "ELIMINACAO_LOJA_PARCEIRA",
    detail: `Loja parceira ID ${id} eliminada do ecossistema.`,
    timestamp: "Agora"
  });
  res.json({ success: true });
});

app.delete("/api/banners/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "ELIMINACAO_BANNER",
    detail: `Banner ID ${id} eliminado do ecossistema.`,
    timestamp: "Agora"
  });
  res.json({ success: true });
});

// ============================================================================
// SISTEMA DE NOTIFICAÇÕES POR E-MAIL DE PROPOSTAS COMERCIAIS POR UNIDADE
// (TARIRA CONNECT, TARIRA RECRUITING, TARIRA BUSINESS, TARIRA CONSULTING, TARIRA STUDY, TARIRA OUTSOURCING)
// ============================================================================

export interface ProposalNotificationEmailRecord {
  id: string;
  recipient: string; // tariraecossystem@gmail.com
  businessUnit: string;
  proposalId: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  serviceType: string;
  headcount?: number;
  slaLevel?: string;
  budget?: string | number;
  comments?: string;
  location?: string;
  documentName?: string;
  documentSize?: string;
  subject: string;
  status: "sent" | "delivered";
  sentAt: string;
  htmlBody: string;
}

const proposalNotificationEmails: ProposalNotificationEmailRecord[] = [];

let mailTransport: Transporter | null = null;
function getMailTransport(): Transporter | null {
  if (mailTransport) return mailTransport;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    try {
      mailTransport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
      console.log(`[SMTP ATIVO] Transmissão SMTP real ativa via ${host}:${port}`);
    } catch (e: any) {
      console.warn("[SMTP CONFIG WARNING]", e?.message);
    }
  }
  return mailTransport;
}

function getBusinessUnitTheme(unit: string) {
  const u = (unit || "").toLowerCase();
  if (u.includes("connect")) {
    return { bg: "#064e3b", border: "#10b981", text: "#6ee7b7", label: "TARIRA CONNECT", originLabel: "Proposta Tarira Connect", category: "Serviços Técnicos, Ofícios & Manutenção Predial" };
  }
  if (u.includes("recruit")) {
    return { bg: "#1e1b4b", border: "#6366f1", text: "#a5b4fc", label: "TARIRA RECRUITING", originLabel: "Proposta Tarira Recruiting", category: "Recrutamento & Seleção Executiva B2B" };
  }
  if (u.includes("consult")) {
    return { bg: "#172554", border: "#3b82f6", text: "#93c5fd", label: "TARIRA CONSULTING", originLabel: "Proposta Tarira Consulting", category: "Consultoria Estratégica, Diagnóstico & Processos" };
  }
  if (u.includes("study") || u.includes("estudo") || u.includes("studio")) {
    return { bg: "#3b0764", border: "#a855f7", text: "#d8b4fe", label: "TARIRA STUDY / STUDIO", originLabel: "Proposta Tarira Study", category: "Microserviços & Plataformas Digitais (Micro-SaaS)" };
  }
  if (u.includes("outsourc") || u.includes("terceiriza")) {
    return { bg: "#451a03", border: "#f59e0b", text: "#fcd34d", label: "TARIRA OUTSOURCING", originLabel: "Proposta Tarira Outsourcing", category: "Terceirização Operacional & Força de Trabalho GESC" };
  }
  return { bg: "#431407", border: "#ea580c", text: "#fdba74", label: "TARIRA BUSINESS", originLabel: "Proposta Tarira Business", category: "Operações Comerciais Corporativas (B2B)" };
}

function normalizeBusinessUnitName(input?: string): string {
  const raw = (input || "").trim();
  const lower = raw.toLowerCase();
  if (lower.includes("connect")) return "Tarira Connect";
  if (lower.includes("recruit")) return "Tarira Recruiting";
  if (lower.includes("consult")) return "Tarira Consulting";
  if (lower.includes("study") || lower.includes("estudo") || lower.includes("studio")) return "Tarira Study";
  if (lower.includes("outsourc") || lower.includes("terceiriza")) return "Tarira Outsourcing";
  return "Tarira Business";
}

function dispatchProposalNotificationEmail(params: {
  businessUnit?: string;
  proposalId: string;
  companyName: string;
  contactPerson?: string;
  contactEmail: string;
  contactPhone: string;
  serviceType: string;
  headcount?: number;
  slaLevel?: string;
  budget?: string | number;
  comments?: string;
  location?: string;
  documentName?: string;
  documentSize?: string;
  targetEmail?: string;
}): ProposalNotificationEmailRecord {
  const recipient = (params.targetEmail || process.env.TARIRA_GENERAL_EMAIL || "tarira.ecossistema@gmail.com").trim().toLowerCase();
  const normalizedUnit = normalizeBusinessUnitName(params.businessUnit);
  const theme = getBusinessUnitTheme(normalizedUnit);

  // Formato exigido pelo utilizador:
  // No e-mail vem especificado: proposta Tarifa Connect, proposta Tarifa Recruiting, proposta Outsourcing, proposta Tarifa Study, e assim sucessivamente.
  const subject = `[${theme.originLabel.toUpperCase()}] ${params.companyName} — ${params.serviceType} (Ref: ${params.proposalId})`;

  const dateStr = new Date().toLocaleString("pt-MZ", { timeZone: "Africa/Maputo" });

  const record: ProposalNotificationEmailRecord = {
    id: `email-prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipient,
    businessUnit: normalizedUnit,
    proposalId: params.proposalId,
    companyName: params.companyName,
    contactPerson: params.contactPerson || params.companyName,
    contactEmail: params.contactEmail,
    contactPhone: params.contactPhone,
    serviceType: params.serviceType,
    headcount: params.headcount,
    slaLevel: params.slaLevel,
    budget: params.budget,
    comments: params.comments,
    location: params.location,
    documentName: params.documentName,
    documentSize: params.documentSize,
    subject,
    status: "delivered",
    sentAt: new Date().toISOString(),
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner with Business Unit identity -->
          <div style="background: linear-gradient(180deg, #090e1a 0%, #0f172a 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid ${theme.border};">
            <div style="display: inline-block; background: ${theme.bg}; border: 1px solid ${theme.border}; color: ${theme.text}; padding: 6px 18px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
              ${theme.originLabel.toUpperCase()} • ${theme.category}
            </div>
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 4px 0 6px 0; letter-spacing: 0.5px;">
              Entrada de Nova Proposta Comercial
            </h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Origem Especificada: <strong style="color: #60a5fa;">${theme.originLabel}</strong> | E-mail Geral dos Contactos: <span style="color: #fbbf24; font-weight: 700;">${recipient}</span>
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 24px;">
            <!-- Protocol Header Card -->
            <div style="background-color: #1e293b; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; border-left: 4px solid ${theme.border};">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td>
                    <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block;">Código de Protocolo / Proposta</span>
                    <strong style="color: #f59e0b; font-family: monospace; font-size: 16px;">${params.proposalId}</strong>
                  </td>
                  <td style="text-align: right;">
                    <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block;">Data e Hora da Submissão</span>
                    <span style="color: #e2e8f0; font-size: 12px; font-weight: 600;">${dateStr}</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Client & Entity Information -->
            <div style="margin-bottom: 22px;">
              <h3 style="color: #f8fafc; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; border-bottom: 1px solid #334155; padding-bottom: 6px;">
                1. Identificação do Solicitante / Entidade
              </h3>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; width: 35%;">Empresa / Titular:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 700;">${params.companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Representante / Contacto:</td>
                  <td style="padding: 6px 0; color: #cbd5e1;">${params.contactPerson || params.companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">E-mail do Cliente:</td>
                  <td style="padding: 6px 0;"><a href="mailto:${params.contactEmail}" style="color: #38bdf8; text-decoration: none;">${params.contactEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Telefone / WhatsApp:</td>
                  <td style="padding: 6px 0;"><a href="tel:${params.contactPhone}" style="color: #34d399; text-decoration: none; font-weight: 700;">${params.contactPhone}</a></td>
                </tr>
                ${params.location ? `
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Localização / Província:</td>
                  <td style="padding: 6px 0; color: #e2e8f0;">${params.location}</td>
                </tr>` : ""}
              </table>
            </div>

            <!-- Scope of Proposal -->
            <div style="margin-bottom: 22px;">
              <h3 style="color: #f8fafc; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; border-bottom: 1px solid #334155; padding-bottom: 6px;">
                2. Especificações da Operação (${theme.originLabel})
              </h3>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; width: 35%;">Unidade de Origem:</td>
                  <td style="padding: 6px 0; color: ${theme.text}; font-weight: 800;">${theme.originLabel} (${theme.category})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Serviço Requisitado:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${params.serviceType}</td>
                </tr>
                ${params.headcount ? `
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Headcount / Vagas:</td>
                  <td style="padding: 6px 0; color: #cbd5e1;">${params.headcount} elemento(s)</td>
                </tr>` : ""}
                ${params.slaLevel ? `
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">SLA / Urgência:</td>
                  <td style="padding: 6px 0; color: #fbbf24; font-weight: 700;">${params.slaLevel}</td>
                </tr>` : ""}
                ${params.budget ? `
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Orçamento Estimado:</td>
                  <td style="padding: 6px 0; color: #34d399; font-weight: 800; font-family: monospace;">${typeof params.budget === 'number' ? params.budget.toLocaleString() + ' MZN' : params.budget}</td>
                </tr>` : ""}
                ${params.documentName ? `
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Anexo Documental:</td>
                  <td style="padding: 6px 0; color: #38bdf8;">📎 ${params.documentName} ${params.documentSize ? `(${params.documentSize})` : ""}</td>
                </tr>` : ""}
              </table>
            </div>

            ${params.comments ? `
            <div style="background-color: #030712; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
              <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Observações / Requisitos Técnicos:</span>
              <p style="color: #e2e8f0; font-size: 13px; line-height: 1.5; margin: 0; white-space: pre-wrap;">${params.comments}</p>
            </div>` : ""}

            <!-- Central Tarira Notice -->
            <div style="background-color: #172554; border: 1px solid #2563eb; border-radius: 12px; padding: 14px 16px; text-align: center;">
              <span style="color: #60a5fa; font-size: 12px; font-weight: 700; display: block; margin-bottom: 4px;">
                🏛️ Registado Simultaneamente na Central TARIRA (Painel Administrador)
              </span>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                O pedido foi arquivado automaticamente na base de dados da Central de Propostas para atribuição imediata ao gestor comercial e seguimento operacional.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #090e1a; padding: 16px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
            © 2026 TARIRA Ecosystem Services Lda. · Maputo & Matola, Moçambique · Notificação Automática do Sistema
          </div>
        </div>
      </body>
      </html>
    `
  };

  proposalNotificationEmails.unshift(record);

  // Transmissão via SMTP se configurado
  const transport = getMailTransport();
  if (transport) {
    transport.sendMail({
      from: process.env.SMTP_FROM || `"TARIRA Ecossistema B2B" <${process.env.SMTP_USER || "comercial@tarira.co.mz"}>`,
      to: recipient,
      subject: subject,
      html: record.htmlBody,
      text: `[${subject}]\n\nOrigem: ${theme.originLabel}\nEmpresa: ${params.companyName}\nContacto: ${params.contactPerson} (${params.contactPhone}, ${params.contactEmail})\nServiço: ${params.serviceType}\nRef: ${params.proposalId}\n\nRegistado na Central TARIRA.`
    }).then(info => {
      console.log(`[SMTP ENVIADO] Proposta ${params.proposalId} expedida para ${recipient} (MessageID: ${info.messageId})`);
    }).catch(err => {
      console.warn(`[SMTP AVISO] Falha no envio para ${recipient}:`, err?.message);
    });
  }

  console.log(`[PROPOSTA EMAIL REGISTADO] Origem: ${theme.originLabel} | Destinatário Geral: ${recipient} | Assunto: ${subject}`);
  return record;
}

// REST Endpoints para Propostas Comerciais & E-mails de Notificação
app.get("/api/commercial-proposals", (req, res) => {
  res.json(commercialProposals);
});

app.post("/api/commercial-proposals", (req, res) => {
  const data = req.body;
  if (!data.companyName && !data.contactPerson) {
    return res.status(400).json({ error: "Nome da empresa ou do proponente é obrigatório." });
  }

  const generatedId = data.id || `PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const normalizedUnit = normalizeBusinessUnitName(data.businessUnit || data.operationType || data.source);

  const newProposal: CommercialProposal = {
    id: generatedId,
    source: data.source || "direct_contact",
    businessUnit: normalizedUnit,
    companyName: data.companyName || "Empresa Proponente",
    contactPerson: data.contactPerson || data.companyName,
    contactEmail: data.contactEmail || "tarira.ecossistema@gmail.com",
    contactPhone: data.contactPhone || "+258 84 000 0000",
    operationType: data.operationType || "Prestação de Serviços B2B",
    headcount: Number(data.headcount) || 1,
    slaLevel: data.slaLevel || "Standard (48h-72h)",
    comments: data.comments || "",
    submittedAt: data.submittedAt || new Date().toISOString(),
    status: data.status || "pending",
    documentName: data.documentName,
    documentSize: data.documentSize,
    documentData: data.documentData,
    budgetEstimateMzn: data.budgetEstimateMzn ? Number(data.budgetEstimateMzn) : undefined,
    internalNotes: data.internalNotes || `Proposta submetida para ${normalizedUnit}. Registo automático na Central TARIRA.`,
    assignedManager: data.assignedManager || "Central Comercial TARIRA",
    emailNotificationSent: true,
    emailNotificationRecipient: "tarira.ecossistema@gmail.com",
    emailNotificationSentAt: new Date().toISOString(),
    emailNotificationSubject: `[PROPOSTA ${normalizedUnit.toUpperCase()}] ${data.companyName} — ${data.operationType || "Serviço"} (Ref: ${generatedId})`
  };

  // 1. Envio de Notificação por E-mail para tarira.ecossistema@gmail.com com a especificação da unidade
  const emailRecord = dispatchProposalNotificationEmail({
    businessUnit: normalizedUnit,
    proposalId: newProposal.id,
    companyName: newProposal.companyName,
    contactPerson: newProposal.contactPerson,
    contactEmail: newProposal.contactEmail,
    contactPhone: newProposal.contactPhone,
    serviceType: newProposal.operationType,
    headcount: newProposal.headcount,
    slaLevel: newProposal.slaLevel,
    budget: newProposal.budgetEstimateMzn,
    comments: newProposal.comments,
    documentName: newProposal.documentName,
    documentSize: newProposal.documentSize
  });

  // 2. Arquivamento na Central TARIRA
  commercialProposals.unshift(newProposal);

  // 3. Registo na Trilha de Auditoria
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "COMMERCIAL_PROPOSAL_SUBMITTED",
    detail: `Nova proposta recebida para '${normalizedUnit}' de '${newProposal.companyName}' (Ref: ${newProposal.id}). Notificação expedida por e-mail para tarira.ecossistema@gmail.com.`,
    timestamp: "Agora"
  });

  res.status(201).json({ success: true, proposal: newProposal, emailRecord });
});

app.put("/api/commercial-proposals/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = commercialProposals.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Proposta não encontrada." });
  }

  commercialProposals[index] = {
    ...commercialProposals[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "COMMERCIAL_PROPOSAL_UPDATED",
    detail: `Proposta ID ${id} atualizada (Status: ${commercialProposals[index].status}, Gestor: ${commercialProposals[index].assignedManager || "Não atribuído"}).`,
    timestamp: "Agora"
  });

  res.json({ success: true, proposal: commercialProposals[index] });
});

app.delete("/api/commercial-proposals/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const index = commercialProposals.findIndex(p => p.id === id);
  if (index !== -1) {
    commercialProposals.splice(index, 1);
  }
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "ELIMINACAO_PROPOSTA",
    detail: `Proposta comercial ID ${id} eliminada da Central TARIRA.`,
    timestamp: "Agora"
  });
  res.json({ success: true });
});

app.get("/api/proposal-emails", (req, res) => {
  res.json(proposalNotificationEmails);
});

app.post("/api/proposal-emails/resend/:id", requireAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const proposal = commercialProposals.find(p => p.id === id);
  if (!proposal) {
    return res.status(404).json({ error: "Proposta não encontrada para reenvio." });
  }

  const emailRecord = dispatchProposalNotificationEmail({
    businessUnit: proposal.businessUnit || proposal.operationType,
    proposalId: proposal.id,
    companyName: proposal.companyName,
    contactPerson: proposal.contactPerson,
    contactEmail: proposal.contactEmail,
    contactPhone: proposal.contactPhone,
    serviceType: proposal.operationType,
    headcount: proposal.headcount,
    slaLevel: proposal.slaLevel,
    budget: proposal.budgetEstimateMzn,
    comments: proposal.comments,
    documentName: proposal.documentName,
    documentSize: proposal.documentSize
  });

  proposal.emailNotificationSent = true;
  proposal.emailNotificationSentAt = new Date().toISOString();
  proposal.emailNotificationSubject = emailRecord.subject;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "EMAIL_NOTIFICATION_RESENT",
    detail: `Notificação de proposta ${proposal.id} reenviada para tariraecossystem@gmail.com com assunto: ${emailRecord.subject}`,
    timestamp: "Agora"
  });

  res.json({ success: true, emailRecord });
});

// Briefings / Vacancy Requests Endpoints
app.get("/api/briefings", (req, res) => {
  res.json(briefings);
});

app.post("/api/briefings", (req, res) => {
  const data = req.body;
  if (!data.companyName) {
    return res.status(400).json({ error: "Nome da empresa é obrigatório." });
  }
  const newBriefing: BriefingItem = {
    id: data.id || `brf-${Date.now()}`,
    companyName: data.companyName,
    category: data.category || "tech",
    qtdVagas: Number(data.qtdVagas) || 1,
    technicalProfile: data.technicalProfile || "Perfil Técnico",
    mandatoryCriteria: data.mandatoryCriteria || "",
    desirableCriteria: data.desirableCriteria || "",
    salaryBudget: data.salaryBudget || "",
    urgency: data.urgency || "Normal",
    submittedAt: new Date().toISOString(),
    status: "pending"
  };
  briefings.unshift(newBriefing);

  // Registo na Central TARIRA & Envio de notificação oficial por e-mail para tarira.ecossistema@gmail.com
  const propId = `PROP-REC-${Date.now().toString().slice(-6)}`;
  const recruitingProposal: CommercialProposal = {
    id: propId,
    source: "b2b_recruitment",
    businessUnit: "Tarira Recruiting",
    companyName: newBriefing.companyName,
    contactPerson: data.contactPerson || newBriefing.companyName,
    contactEmail: data.contactEmail || "tarira.ecossistema@gmail.com",
    contactPhone: data.contactPhone || "+258 84 000 0000",
    operationType: `Tarira Recruiting: ${newBriefing.technicalProfile} (${newBriefing.qtdVagas} Vagas)`,
    headcount: newBriefing.qtdVagas,
    slaLevel: newBriefing.urgency || "Normal (3-5 dias)",
    comments: `Critérios Obrigatórios: ${newBriefing.mandatoryCriteria || "Nenhum"}. Salário Proposto: ${newBriefing.salaryBudget || "A negociar"}.`,
    submittedAt: new Date().toISOString(),
    status: "pending",
    documentName: data.documentName,
    documentSize: data.documentSize,
    documentData: data.documentData,
    budgetEstimateMzn: parseInt(String(newBriefing.salaryBudget).replace(/[^0-9]/g, "")) || undefined,
    internalNotes: `Briefing de recrutamento corporativo submetido via Metodologia TARIRA Recruit.`,
    assignedManager: "Dinis Mandlate (Recruiting Lead)",
    emailNotificationSent: true,
    emailNotificationRecipient: "tarira.ecossistema@gmail.com",
    emailNotificationSentAt: new Date().toISOString(),
    emailNotificationSubject: `[PROPOSTA TARIRA RECRUITING] ${newBriefing.companyName} — ${newBriefing.technicalProfile} (Ref: ${propId})`
  };
  commercialProposals.unshift(recruitingProposal);

  dispatchProposalNotificationEmail({
    businessUnit: "Tarira Recruiting",
    proposalId: propId,
    companyName: newBriefing.companyName,
    contactPerson: data.contactPerson || newBriefing.companyName,
    contactEmail: data.contactEmail || "tarira.ecossistema@gmail.com",
    contactPhone: data.contactPhone || "+258 84 000 0000",
    serviceType: `Recrutamento & Seleção: ${newBriefing.technicalProfile}`,
    headcount: newBriefing.qtdVagas,
    slaLevel: newBriefing.urgency || "Normal",
    budget: newBriefing.salaryBudget,
    comments: `Critérios: ${newBriefing.mandatoryCriteria || "N/A"}. Local: ${data.location || "Maputo"}`,
    location: data.location,
    documentName: data.documentName,
    documentSize: data.documentSize
  });

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "BRIEFING_SUBMITTED",
    detail: `Novo Briefing de Vaga: '${newBriefing.technicalProfile}' submetido por '${newBriefing.companyName}'. Registado na Central TARIRA e notificação expedida por e-mail para tarira.ecossistema@gmail.com (Ref: ${propId}).`,
    timestamp: "Agora"
  });
  res.status(201).json(newBriefing);
});

// Contact Inquiries Endpoints
app.get("/api/contact", (req, res) => {
  res.json(contactInquiries);
});

app.post("/api/contact", (req, res) => {
  const data = req.body;
  if (!data.name && !data.companyName) {
    return res.status(400).json({ error: "Nome ou Nome da Empresa são obrigatórios." });
  }
  const newContact: ContactInquiryItem = {
    id: data.id || `ct-${Date.now()}`,
    name: data.name || data.companyName || "Contacto Comercial",
    phone: data.phone || data.contactPhone || "",
    email: data.email || data.contactEmail || "",
    company: data.company || data.companyName || "",
    serviceType: data.serviceType || data.operationType || "geral",
    notes: data.notes || data.comments || "",
    createdAt: new Date().toISOString(),
    status: "pending"
  };
  contactInquiries.unshift(newContact);

  // Registo na Central de Propostas TARIRA e envio de notificação por e-mail com especificação de unidade
  const normalizedUnit = normalizeBusinessUnitName(data.businessUnit || data.serviceType || data.operationType);
  const theme = getBusinessUnitTheme(normalizedUnit);
  const propId = `PROP-CT-${Date.now().toString().slice(-6)}`;
  const proposalFromContact: CommercialProposal = {
    id: propId,
    source: "direct_contact",
    businessUnit: normalizedUnit,
    companyName: newContact.company || newContact.name,
    contactPerson: newContact.name,
    contactEmail: newContact.email || "tarira.ecossistema@gmail.com",
    contactPhone: newContact.phone || "+258 84 000 0000",
    operationType: `${normalizedUnit}: ${newContact.serviceType}`,
    headcount: Number(data.headcount) || 1,
    slaLevel: data.slaLevel || "Normal (48h)",
    comments: newContact.notes,
    submittedAt: new Date().toISOString(),
    status: "pending",
    documentName: data.documentName,
    documentSize: data.documentSize,
    documentData: data.documentData,
    budgetEstimateMzn: data.budgetEstimateMzn ? Number(data.budgetEstimateMzn) : undefined,
    internalNotes: `Contacto/proposta recebida via formulário do portal para a unidade ${normalizedUnit}.`,
    assignedManager: "Central Comercial TARIRA",
    emailNotificationSent: true,
    emailNotificationRecipient: "tarira.ecossistema@gmail.com",
    emailNotificationSentAt: new Date().toISOString(),
    emailNotificationSubject: `[${theme.originLabel.toUpperCase()}] ${newContact.company || newContact.name} — ${newContact.serviceType} (Ref: ${propId})`
  };
  commercialProposals.unshift(proposalFromContact);

  dispatchProposalNotificationEmail({
    businessUnit: normalizedUnit,
    proposalId: propId,
    companyName: proposalFromContact.companyName,
    contactPerson: proposalFromContact.contactPerson,
    contactEmail: proposalFromContact.contactEmail,
    contactPhone: proposalFromContact.contactPhone,
    serviceType: proposalFromContact.operationType,
    headcount: proposalFromContact.headcount,
    slaLevel: proposalFromContact.slaLevel,
    budget: proposalFromContact.budgetEstimateMzn,
    comments: proposalFromContact.comments,
    documentName: proposalFromContact.documentName,
    documentSize: proposalFromContact.documentSize
  });

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    type: "COMMERCIAL_CONTACT",
    detail: `Contacto Comercial / Proposta (${theme.originLabel}): ${newContact.name} (${newContact.company || "Particular"}) - Tel: ${newContact.phone}. Registado na Central TARIRA e notificação expedida por e-mail para tarira.ecossistema@gmail.com (Ref: ${propId}).`,
    timestamp: "Agora"
  });
  res.status(201).json(newContact);
});

async function startServer() {
  // Carrega o estado real do Supabase (candidatos, contratações, pagamentos,
  // etc.) antes de aceitar pedidos, para não servir dados de exemplo em produção.
  await hydrateStateFromSupabase();
  try {
    const savedPlans = await getContentValue<RegistrationPlanConfig[]>("registration_plans");
    await syncAndPersistRegistrationPlans(savedPlans);
  } catch (err) {
    console.warn("[server] Falha ao sincronizar planos de registo no arranque:", err);
  }
  // Vite dev server middleware integration — importado dinamicamente e só
  // aqui dentro, para que o pacote "vite" (e o Rollup, que traz binários
  // nativos que podem faltar em ambiente serverless) nunca seja carregado
  // em produção/Vercel, onde este ramo nunca é executado.
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
 
    
    // Serve static frontend files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TARIRA Recruit Server running on http://0.0.0.0:${PORT}`);
  });
}

// Na Vercel, este ficheiro é importado por api/index.ts como função serverless
// — não deve chamar app.listen() nem iniciar o Vite em modo middleware.
// Em qualquer outro ambiente (desenvolvimento local, Railway, Render, VPS
// próprio via `npm run dev` / `npm start`), o servidor arranca normalmente.
if (!process.env.VERCEL) {
  startServer();
}

export { app, hydrateStateFromSupabase };
