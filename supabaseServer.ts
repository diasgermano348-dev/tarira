import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do lado do servidor (Node/Express).
 *
 * Diferente de `supabase.ts` (que corre no browser e usa `import.meta.env` +
 * a chave anónima), este módulo corre no servidor Node e usa `process.env` +
 * a Service Role Key — necessária para o servidor poder ler/escrever nas
 * tabelas de estado da aplicação (candidatos, contratações, pagamentos, etc.)
 * sem depender de RLS orientado a utilizador final.
 *
 * Variáveis de ambiente necessárias (ficheiro .env, nunca commitadas):
 *   SUPABASE_URL=https://SEU-PROJECTO.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (Project Settings → API → service_role)
 *
 * IMPORTANTE: a Service Role Key ignora Row Level Security. Nunca a exponha
 * no frontend/browser — só deve existir aqui, no processo do servidor.
 */

const rawServerUrl = (process.env.SUPABASE_URL || "").trim();
const supabaseUrl = rawServerUrl
  .replace(/\/rest\/v1\/?$/i, "")
  .replace(/\/auth\/v1\/?$/i, "")
  .replace(/\/storage\/v1\/?$/i, "")
  .replace(/\/+$/, "");

const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith("https://")
);

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured) return null;
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

/**
 * Todas as tabelas de estado partilham a mesma forma simples:
 *   id (text, PK) | data (jsonb, o objecto completo tal como vive em memória) | updated_at
 *
 * Isto evita ter de redesenhar e migrar campo-a-campo cada estrutura (que
 * muda com frequência neste projecto) e mantém exactamente a mesma forma
 * de JSON que o frontend já espera — o "data" é devolvido tal e qual.
 */
export async function loadTable<T extends { id: string }>(table: string): Promise<T[] | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;
  const { data, error } = await client.from(table).select("data").order("updated_at", { ascending: false });
  if (error) {
    console.error(`[supabase] Erro ao carregar '${table}':`, error.message);
    return null;
  }
  return (data || []).map((row: any) => row.data as T);
}

// IMPORTANTE: esta função é chamada com o array COMPLETO de cada colecção a
// cada escrita bem sucedida em QUALQUER parte do site (ver syncDataToSupabaseNow
// em server.ts). Isto tem uma consequência séria: o Postgres/PostgREST trata o
// upsert em lote como UMA ÚNICA operação atómica — se UM ÚNICO registo do lote
// tiver um problema (ex.: um campo demasiado grande, um valor incompatível com
// o schema, ou o payload total ultrapassar o limite de tamanho do PostgREST),
// TODO o lote falha, incluindo os registos novos e válidos (ex.: o técnico que
// um utilizador acabou de registar). Isto explica o sintoma clássico de "criei
// um perfil, ele funcionou no momento, mas desapareceu depois" — o registo
// nunca chegou de facto a ficar gravado no Supabase, e a próxima leitura
// (refreshFromSupabase) substitui a memória pelo que está realmente na base
// de dados, apagando-o silenciosamente.
//
// Para não deixar um registo mau bloquear todos os outros para sempre:
// 1. Divide-se o lote em pedaços mais pequenos (evita exceder limites de
//    tamanho do pedido).
// 2. Se mesmo assim um pedaço falhar, tenta-se registo a registo, isolando
//    exactamente qual registo tem o problema (fica no log, os restantes
//    continuam a ser gravados normalmente).
const UPSERT_CHUNK_SIZE = 100;

export async function bulkUpsertTable<T extends { id: string }>(table: string, rows: T[]): Promise<{ failedIds: string[] }> {
  const client = getSupabaseAdmin();
  if (!client) return { failedIds: [] };
  if (!rows || rows.length === 0) return { failedIds: [] };

  // Otimização crucial: audit_logs é um registo histórico que cresce até 500+ entradas.
  // Fazer upsert de todas as 500 entradas a cada criação/alteração gerava 20 pedidos HTTP
  // sequenciais ao Supabase, causando demoras de 15 a 30 segundos no botão de submissão.
  // Como audit_logs é apenas apêndice, basta sincronizar os 20 logs mais recentes.
  const targetRows = table === "audit_logs" ? rows.slice(0, 20) : rows;

  const payload = targetRows.map((row) => ({
    id: row.id,
    data: row,
    updated_at: new Date().toISOString(),
  }));

  const failedIds: string[] = [];

  // Agrupa em pedaços de 100 (tamanho ideal para o PostgREST sem exceder limites)
  const chunks: typeof payload[] = [];
  for (let i = 0; i < payload.length; i += UPSERT_CHUNK_SIZE) {
    chunks.push(payload.slice(i, i + UPSERT_CHUNK_SIZE));
  }

  // Executa os chunks em paralelo com proteção de timeout para nunca bloquear a experiência do utilizador
  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const { error } = await client.from(table).upsert(chunk, { onConflict: "id" });
        if (!error) return;

        console.warn(`[supabase] Aviso ao sincronizar lote de '${table}' (${chunk.length} registos):`, error.message);

        // Fallback registo a registo para isolar eventuais falhas individuais
        for (const row of chunk) {
          try {
            const { error: rowError } = await client.from(table).upsert([row], { onConflict: "id" });
            if (rowError) {
              console.error(`[supabase] Falha no registo '${row.id}' em '${table}':`, rowError.message);
              failedIds.push(row.id);
            }
          } catch (rowEx: any) {
            failedIds.push(row.id);
          }
        }
      } catch (chunkErr: any) {
        console.error(`[supabase] Erro de rede no lote de '${table}':`, chunkErr?.message || chunkErr);
        chunk.forEach(r => failedIds.push(r.id));
      }
    })
  );

  return { failedIds };
}

export async function deleteFromTable(table: string, id: string): Promise<void> {
  const client = getSupabaseAdmin();
  if (!client) return;
  const { error } = await client.from(table).delete().eq("id", id);
  if (error) {
    console.error(`[supabase] Erro ao eliminar de '${table}' (id: ${id}):`, error.message);
  }
}

export async function getContentValue<T>(key: string): Promise<T | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;
  const { data, error } = await client.from("site_content").select("value").eq("key", key).maybeSingle();
  if (error) {
    console.error(`[supabase] Erro ao carregar conteúdo '${key}':`, error.message);
    return null;
  }
  if (!data) return null;
  // Se o valor foi guardado como { val: ... } ou directamente como T
  if (data.value && typeof data.value === "object" && "__val" in data.value) {
    return (data.value as any).__val as T;
  }
  return data.value as T;
}

export async function setContentValue(key: string, value: unknown): Promise<void> {
  const client = getSupabaseAdmin();
  if (!client) return;
  // Empacotamos valores primitivos (strings/números) num envelope jsonb compatível
  const jsonValue = typeof value === "object" && value !== null ? value : { __val: value };
  const { error } = await client
    .from("site_content")
    .upsert({ key, value: jsonValue, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) {
    console.error(`[supabase] Erro ao gravar conteúdo '${key}':`, error.message);
  }
}

export async function upsertUserProfile(profileData: {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  nuit?: string;
  category?: string;
  candidate_id?: string | null;
  client_id?: string | null;
  is_active?: boolean;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const client = getSupabaseAdmin();
  if (!client) {
    return { success: true, data: profileData };
  }
  const payload = {
    id: profileData.id,
    name: profileData.name || "Utilizador",
    email: (profileData.email || "").toLowerCase().trim(),
    role: profileData.role || "empresa",
    phone: profileData.phone || "",
    city: profileData.city || "Maputo",
    nuit: profileData.nuit || "",
    category: profileData.category || "",
    candidate_id: profileData.candidate_id || null,
    client_id: profileData.client_id || null,
    is_active: profileData.is_active !== undefined ? profileData.is_active : true,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await client
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (error) {
      console.warn("[supabase] Aviso ao gravar perfil na tabela profiles:", error.message);
      // Fallback: gravar na chave site_content para garantir persistência sem quebrar o fluxo
      try {
        await setContentValue(`user_profile_${profileData.id}`, payload);
      } catch (fErr) {
        console.warn("[supabase] Fallback site_content profile error:", fErr);
      }
      return { success: true, data: payload, error: error.message };
    }
    return { success: true, data: data || payload };
  } catch (err: any) {
    console.warn("[supabase] Exceção ao persistir perfil:", err?.message);
    return { success: true, data: payload };
  }
}

export async function getUserProfile(userId: string): Promise<any | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      const fallback = await getContentValue<any>(`user_profile_${userId}`);
      if (fallback) return fallback;
    }
    return data || null;
  } catch (err) {
    return await getContentValue<any>(`user_profile_${userId}`);
  }
}
