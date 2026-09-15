// Ponto de entrada para a função serverless da Vercel.
//
// O server.ts (na raiz do projeto) já contém toda a lógica da API (Express).
// Este ficheiro apenas importa essa app e expõe um handler no formato que a
// Vercel espera para funções Node (@vercel/node). Sem este ficheiro, o
// rewrite "/api/(.*) -> /api" definido em vercel.json não tinha nenhuma
// função para invocar, e a Vercel acabava por devolver o index.html estático
// para os pedidos POST -- daí o erro 405 Method Not Allowed (um ficheiro
// estático só aceita GET/HEAD).
import { app, hydrateStateFromSupabase } from "../server.js";
import type { IncomingMessage, ServerResponse } from "http";

// Garante que o estado (candidatos, contratações, etc.) é carregado do
// Supabase antes do primeiro pedido ser processado por esta instância da
// função. Em ambiente serverless, a mesma instância pode ser reutilizada
// entre pedidos (warm start), por isso só hidratamos uma vez por instância.
let hydrated: Promise<void> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!hydrated) {
    hydrated = hydrateStateFromSupabase().catch((err) => {
      console.error("[api/index] Falha ao hidratar estado a partir do Supabase:", err);
      // Não bloqueia pedidos futuros por causa de uma falha pontual --
      // permite nova tentativa no próximo pedido.
      hydrated = null;
    });
  }
  await hydrated;
  return (app as any)(req, res);
}
