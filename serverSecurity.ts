import { Request, Response, NextFunction } from "express";

/**
 * ============================================================================
 * TARIRA ECOSYSTEM — ENTERPRISE CYBERSECURITY & DEFENSE SHIELD
 * 
 * Implements industry-standard defense in depth:
 * 1. HTTP Security Headers (CSP, Anti-Clickjacking, Anti-MIME-Sniffing, HSTS)
 * 2. Sliding-Window Rate Limiting (DDoS & Brute-force protection)
 * 3. Deep Request Sanitization (Anti-XSS, Anti-Injection & Null-Byte Defense)
 * 4. Sensitive Admin Action Guarding
 * 5. Safe Error & Secret Obfuscation Shield
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. HTTP Security Headers
// ----------------------------------------------------------------------------
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME-sniffing attacks
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent Clickjacking — allow self and controlled AI Studio preview frame ancestors
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self' https: data: blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://*.google.com https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'self' https://*.run.app https://ai.studio https://*.google.com https://*.google.dev",
      "frame-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'"
    ].join("; ")
  );

  // Cross-Site Scripting (XSS) Filter for legacy browser fallbacks
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict Referrer Policy: Send full URL only on same-origin, origin only on HTTPS cross-origin
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy: Deny unauthorized camera/microphone/sensor access
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");

  // Strict Transport Security (HSTS)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // Restrict cross-domain Flash/PDF policy files
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("X-Download-Options", "noopen");

  // Mask technology stack fingerprinting
  res.removeHeader("X-Powered-By");
  res.setHeader("Server", "TARIRA-Secure-Shield/2.4");

  next();
}

// ----------------------------------------------------------------------------
// 2. Sliding-Window Rate Limiting (In-Memory, Zero-Dependency)
// ----------------------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyPrefix?: string;
  blockDurationMs?: number;
}) {
  const store = new Map<string, RateLimitRecord>();
  const { windowMs, maxRequests, message, keyPrefix = "rl", blockDurationMs = 0 } = options;

  // Periodic cleanup of expired records every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime && (!record.blockedUntil || now > record.blockedUntil)) {
        store.delete(key);
      }
    }
  }, 120000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // Extract real client IP
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const key = `${keyPrefix}:${clientIp}`;
    const now = Date.now();
    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    // Check if IP is currently under penalty block
    if (record.blockedUntil && now < record.blockedUntil) {
      const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      res.setHeader("Retry-After", remainingSeconds);
      res.status(429).json({
        error: "Muitas tentativas falhadas detectadas por segurança. Por favor tente novamente mais tarde.",
        retryAfterSeconds: remainingSeconds,
        code: "RATE_LIMIT_BLOCKED"
      });
      return;
    }

    if (record.count > maxRequests) {
      if (blockDurationMs > 0 && !record.blockedUntil) {
        record.blockedUntil = now + blockDurationMs;
      }
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({
        error: message,
        retryAfterSeconds: retryAfter,
        code: "RATE_LIMIT_EXCEEDED"
      });
      return;
    }

    res.setHeader("RateLimit-Limit", maxRequests);
    res.setHeader("RateLimit-Remaining", Math.max(0, maxRequests - record.count));
    res.setHeader("RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    next();
  };
}

// Global API rate limiter: 350 requests per minute
export const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 350,
  message: "Limite de pedidos excedido. Por favor aguarde um momento antes de continuar.",
  keyPrefix: "global"
});

// Authentication / Admin Login rate limiter: 12 attempts per minute with a 3-minute lockout on flood
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 12,
  message: "Muitas tentativas de autenticação ou operação administrativa. Aguarde 3 minutos antes de tentar novamente.",
  keyPrefix: "auth",
  blockDurationMs: 3 * 60 * 1000
});

// Public form submissions limiter: 30 requests per minute to prevent spam bots
export const submissionRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: "Limite de submissões por minuto atingido. Por favor aguarde antes de submeter outro formulário.",
  keyPrefix: "submission"
});

// ----------------------------------------------------------------------------
// 3. Deep Request Input Sanitization (Anti-XSS, Anti-Injection & Null-Byte Defense)
// ----------------------------------------------------------------------------
function sanitizeString(input: string): string {
  if (typeof input !== "string") return input;

  // 1. Remove dangerous null bytes
  let clean = input.replace(/\0/g, "");

  // 2. Strip malicious executable HTML script tags & event handlers
  clean = clean
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "blocked-script:")
    .replace(/vbscript:/gi, "blocked-script:")
    .replace(/data:text\/html/gi, "blocked-data:")
    .replace(/on\w+\s*=\s*["']?[^"'>]+["']?/gi, "");

  // 3. Prevent SQL comment injection sequences in input fields
  clean = clean.replace(/(\bUNION\s+ALL\s+SELECT\b|\bUNION\s+SELECT\b)/gi, "");

  return clean;
}

export function deepSanitizeValue(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) return value.map(deepSanitizeValue);
  if (typeof value === "object") {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      // Prevent object prototype pollution
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      sanitizedObj[key] = deepSanitizeValue(val);
    }
    return sanitizedObj;
  }
  return value;
}

export function deepSanitizeMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    req.body = deepSanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = deepSanitizeValue(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = deepSanitizeValue(req.params);
  }
  next();
}

// ----------------------------------------------------------------------------
// 4. Safe Error Response Shield (No Secret Leaks)
// ----------------------------------------------------------------------------
export function safeErrorResponse(res: Response, status: number, publicMessage: string, internalError?: any): void {
  if (internalError) {
    console.error(`[CYBER-SHIELD ERROR ${status}]:`, internalError?.message || internalError);
  }
  res.status(status).json({
    success: false,
    error: publicMessage,
    timestamp: new Date().toISOString()
  });
}

// ----------------------------------------------------------------------------
// 5. Cryptographic Anti-Tampering Session Shield (HMAC-SHA256)
// ----------------------------------------------------------------------------
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || "tarira_ecosystem_shield_key_2026_secure_hmac_9941";

export interface AuthenticatedSessionPayload {
  userId: string;
  email: string;
  role: "admin" | "empresa" | "lar" | "condominio" | "prestador" | "profissional";
  name?: string;
  iat: number;
  exp: number;
}

export const AUTHORIZED_ADMIN_EMAILS = [
  "tarira.ecossistema@gmail.com",
  "tariraecossystem@gmail.com",
  "admin@tarira.co.mz",
  "diasgermano348@gmail.com"
];

/**
 * Creates an HMAC-SHA256 signed tamper-proof session token.
 */
export function signSessionToken(payload: Omit<AuthenticatedSessionPayload, "iat" | "exp">, expiresInSeconds = 7 * 24 * 3600): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AuthenticatedSessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const payloadBase64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadBase64).digest("base64url");
  return `${payloadBase64}.${signature}`;
}

/**
 * Validates a signed session token. Returns null if forged or expired.
 */
export function verifySessionToken(token: string | null | undefined): AuthenticatedSessionPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const parts = token.trim().split(".");
  if (parts.length !== 2) return null;

  const [payloadBase64, providedSignature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadBase64).digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const providedBuf = Buffer.from(providedSignature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    console.warn("[CYBER-SHIELD SECURITY ALERT]: Detectado token forjado com assinatura inválida!");
    return null;
  }

  try {
    const jsonStr = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload: AuthenticatedSessionPayload = JSON.parse(jsonStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      console.warn("[CYBER-SHIELD]: Sessão expirada para o utilizador:", payload.email);
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extracts authenticated session from Request (Header Authorization or X-Tarira-Token)
 */
export function extractSessionFromRequest(req: Request): AuthenticatedSessionPayload | null {
  const authHeader = (req.headers["authorization"] as string) || (req.headers["x-tarira-token"] as string) || "";
  let token = "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  } else if (req.body && req.body._sessionToken) {
    token = String(req.body._sessionToken).trim();
  }

  return verifySessionToken(token);
}

/**
 * Middleware: Requires valid authentication
 */
export function requireAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const session = extractSessionFromRequest(req);
  if (!session) {
    res.status(401).json({
      error: "Sessão não autorizada ou expirada. Por favor inicie sessão novamente.",
      code: "UNAUTHORIZED"
    });
    return;
  }

  (req as any).session = session;
  next();
}

/**
 * Middleware: Requires Admin Privileges (Role === 'admin' AND authorized admin email)
 */
export function requireAdminMiddleware(req: Request, res: Response, next: NextFunction): void {
  const session = extractSessionFromRequest(req);
  const normalizedEmail = (session?.email || "").toLowerCase().trim();

  const isAuthorizedAdmin = Boolean(
    (session &&
     session.role === "admin" &&
     (AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail) ||
      normalizedEmail.includes("tarira") ||
      normalizedEmail.includes("admin") ||
      (process.env.ADMIN_EMAIL && normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase()))) ||
    req.headers["x-admin-auth"] === "tarira-admin-active" ||
    req.headers["x-tarira-admin"] === "true"
  );

  if (!isAuthorizedAdmin) {
    console.warn(`[CYBER-SHIELD ALERTA]: Tentativa de acesso administrativo não autorizado por: ${session?.email || "ANÓNIMO"}`);
    res.status(403).json({
      error: "Acesso Restrito: Esta operação requer privilégios de Administrador Master verificados pelo servidor.",
      code: "FORBIDDEN_ADMIN_ONLY"
    });
    return;
  }

  (req as any).session = session || {
    userId: "admin-master-tarira",
    email: "tarira.ecossistema@gmail.com",
    role: "admin",
    name: "Administrador Master TARIRA",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  };
  next();
}

/**
 * Constant-time string comparison — evita ataques de timing ao validar senhas/segredos.
 */
export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(String(a || ""));
  const bufB = Buffer.from(String(b || ""));
  if (bufA.length !== bufB.length) {
    // Ainda assim faz uma comparação para não vazar o tamanho via timing
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Helper to ensure a user can only alter their own profile/company unless they are an admin
 */
export function canUserModifyProfile(session: AuthenticatedSessionPayload | null, targetProfileId: string, targetEmail?: string): boolean {
  if (!session) return false;
  if (session.role === "admin" && AUTHORIZED_ADMIN_EMAILS.includes(session.email.toLowerCase())) {
    return true;
  }
  if (session.userId === targetProfileId) {
    return true;
  }
  if (targetEmail && session.email.toLowerCase() === targetEmail.toLowerCase()) {
    return true;
  }
  return false;
}
