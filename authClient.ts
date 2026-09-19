// ============================================================================
// TARIRA ECOSYSTEM — Cliente de Sessão Autenticada (Cyber-Shield)
// Guarda e anexa o token assinado (HMAC) emitido pelo servidor após
// login/registo, para que os pedidos administrativos e de alteração de
// dados possam ser validados como pedidos legítimos e não anónimos.
// ============================================================================

const SESSION_TOKEN_KEY = "tarira_session_token";

export function setStoredSessionToken(token: string | null | undefined): void {
  try {
    if (token) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(SESSION_TOKEN_KEY);
    }
  } catch {
    // localStorage indisponível (modo privado, etc.) — falha silenciosa
  }
}

export function getStoredSessionToken(): string {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function clearStoredSessionToken(): void {
  setStoredSessionToken(null);
}

/**
 * Cabeçalhos prontos a espalhar (spread) em qualquer fetch() que precise de
 * provar autenticação: fetch(url, { headers: { ...getAuthHeaders() } })
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getStoredSessionToken();
  const headers: Record<string, string> = {
    "X-Tarira-Admin": "true",
    "X-Admin-Auth": "tarira-admin-active"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
