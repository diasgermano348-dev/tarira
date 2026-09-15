import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: 'empresa' | 'lar' | 'condominio' | 'prestador' | 'admin' | string;
  phone?: string;
  city?: string;
  nuit?: string;
  category?: string;
  candidate_id?: string | null;
  client_id?: string | null;
  created_at?: string;
  company_name?: string;
  company_sector?: string;
  company_employees?: string;
  condo_name?: string;
  condo_type?: string;
  condo_units?: number;
  residential_type?: string;
  contact_person?: string;
  contact_person_title?: string;
}

export interface OrgOperator {
  id: string;
  name: string;
  role: string;
  email: string;
  orgId: string;
  orgName: string;
  permissions: string[];
  status: "Ativo" | "Ausente";
  lastActive: string;
  avatar: string;
}

export interface OperatorAuditAction {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorRole: string;
  orgName: string;
  actionType: "VALIDAÇÃO" | "AGENDAMENTO" | "APROVAÇÃO" | "SESSÃO" | "NOVO_OPERADOR";
  details: string;
  targetEntity: string;
  ipAddress: string;
}

const rawSupabaseUrl = ((import.meta.env.VITE_SUPABASE_URL || '') as string).trim();
// Normaliza o URL do Supabase caso o utilizador tenha colado o endpoint REST (/rest/v1), /auth/v1 ou barras no fim
export const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/auth\/v1\/?$/i, '')
  .replace(/\/storage\/v1\/?$/i, '')
  .replace(/\/+$/, '');

const supabaseAnonKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY || '') as string).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));

// Limite padrão de tamanho de ficheiro para o Supabase Storage (50 MB)
export const MAX_SUPABASE_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB (52428800 bytes)

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

/**
 * Uploads a document (PDF, Word, TXT, etc.) to Supabase Storage with automatic fallback and 50MB limit check
 */
export async function uploadDocumentToSupabase(
  file: File, 
  bucketName: string = "tarira-documents"
): Promise<{ url?: string; path?: string; error?: any }> {
  // Verificação de limite de tamanho de 50 MB
  if (file && file.size > MAX_SUPABASE_FILE_SIZE_BYTES) {
    const errorMsg = "O ficheiro excede o tamanho máximo permitido de 50 MB.";
    console.warn(`[Supabase Storage] ${errorMsg} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    return { error: errorMsg };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    // Fallback: Create Object URL or Data URI
    try {
      const fallbackUrl = URL.createObjectURL(file);
      return { url: fallbackUrl, path: `local/${file.name}` };
    } catch {
      return { error: "Supabase não está configurado. Usando armazenamento local temporário." };
    }
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `docs/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn(`Aviso no upload Supabase Storage (${bucketName}):`, error.message);
      // Try fallback to proposals_documents if tarira-documents fails
      if (bucketName === "tarira-documents") {
        const retry = await supabase.storage.from("proposals_documents").upload(filePath, file, { cacheControl: '3600', upsert: true });
        if (!retry.error && retry.data) {
          const { data: pUrl } = supabase.storage.from("proposals_documents").getPublicUrl(retry.data.path);
          return { url: pUrl.publicUrl, path: retry.data.path };
        }
      }
      const fallbackUrl = URL.createObjectURL(file);
      return { url: fallbackUrl, path: filePath, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, path: data.path };
  } catch (err: any) {
    console.warn("Erro ao fazer upload de documento no Supabase Storage:", err);
    try {
      return { url: URL.createObjectURL(file), path: `local/${file.name}`, error: err.message };
    } catch {
      return { error: err.message || "Erro no upload do Supabase" };
    }
  }
}

/**
 * Uploads an image (PNG, JPG, WEBP, etc.) to Supabase Storage with 50MB limit check
 */
export async function uploadImageToSupabase(
  file: File, 
  bucketName: string = "tarira-photos"
): Promise<{ url?: string; path?: string; error?: any }> {
  // Verificação de limite de tamanho de 50 MB
  if (file && file.size > MAX_SUPABASE_FILE_SIZE_BYTES) {
    const errorMsg = "O ficheiro de imagem excede o tamanho máximo permitido de 50 MB.";
    console.warn(`[Supabase Storage] ${errorMsg} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    return { error: errorMsg };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    try {
      return { url: URL.createObjectURL(file), path: `local/${file.name}` };
    } catch {
      return { error: "Supabase não conectado." };
    }
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `photos/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.warn(`Aviso no upload de imagem Supabase (${bucketName}):`, error.message);
      return { url: URL.createObjectURL(file), path: filePath, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, path: data.path };
  } catch (err: any) {
    console.warn("Erro ao fazer upload de imagem no Supabase Storage:", err);
    try {
      return { url: URL.createObjectURL(file), path: `local/${file.name}`, error: err.message };
    } catch {
      return { error: err.message };
    }
  }
}

/**
 * Persists a consulting request directly into Supabase 'consulting_requests' table
 */
export async function saveConsultingRequestToSupabase(request: any): Promise<{ data?: any; error?: any }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase não conectado" };
  }

  try {
    const { data, error } = await supabase
      .from('consulting_requests')
      .insert([
        {
          client_name: request.clientName,
          client_email: request.clientEmail,
          client_phone: request.clientPhone || null,
          service_type: request.serviceType,
          request_type: request.requestType || 'external_consulting',
          details: request.details,
          budget: request.budget,
          document_name: request.documentName || null,
          document_size: request.documentSize || null,
          document_url: request.documentUrl || null,
          status: request.status || 'pending',
          created_at: request.createdAt || new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn("Aviso ao guardar pedido de consultoria no Supabase (tabela 'consulting_requests'):", error.message);
      return { error: error.message };
    }

    return { data };
  } catch (err: any) {
    console.warn("Exceção ao persistir no Supabase:", err);
    return { error: err.message };
  }
}

/**
 * Persists a commercial proposal directly into Supabase 'commercial_proposals' table
 */
export async function saveCommercialProposalToSupabase(proposal: any): Promise<{ data?: any; error?: any }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase não conectado" };
  }

  try {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .insert([
        {
          proposal_id: proposal.id,
          source: proposal.source,
          company_name: proposal.companyName,
          contact_person: proposal.contactPerson,
          contact_email: proposal.contactEmail,
          contact_phone: proposal.contactPhone,
          operation_type: proposal.operationType,
          headcount: proposal.headcount,
          sla_level: proposal.slaLevel,
          comments: proposal.comments,
          document_name: proposal.documentName || null,
          document_size: proposal.documentSize || null,
          document_url: proposal.documentUrl || null,
          status: proposal.status,
          internal_notes: proposal.internalNotes,
          created_at: proposal.submittedAt || new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn("Aviso ao guardar proposta comercial no Supabase:", error.message);
      return { error: error.message };
    }

    return { data };
  } catch (err: any) {
    console.warn("Exceção ao persistir proposta no Supabase:", err);
    return { error: err.message };
  }
}

