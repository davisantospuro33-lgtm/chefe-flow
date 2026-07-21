import { createHmac, timingSafeEqual } from "node:crypto";
import { getCookie, setCookie, deleteCookie, getRequestIP } from "@tanstack/react-start/server";

// Server-only module: never import this from a *.functions.ts or route file at
// top level (it would ship into the client bundle). Always `await import(...)`
// it inside a createServerFn handler, mirroring the supabaseAdmin pattern.

const COOKIE_NAME = "chefe_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const CHEFE_PIN = "3337";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET missing");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function createToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${exp}`;
  return `${payload}.${sign(payload)}`;
}

function isTokenValid(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sign(payload), sig)) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return true;
}

export function establishChefeSession(): void {
  setCookie(COOKIE_NAME, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearChefeSession(): void {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export function hasValidChefeSession(): boolean {
  return isTokenValid(getCookie(COOKIE_NAME));
}

/** Throws if there is no valid signed session cookie. Call at the top of every
 * privileged createServerFn handler (admin panel / DB-writing / SQL tools). */
export function requireChefeSession(): void {
  if (!hasValidChefeSession()) {
    throw new Error("UNAUTHORIZED: sessão do painel inválida ou expirada");
  }
}

// --- very small brute-force throttle for the PIN, in-memory (per-process) ---
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function clientKey(): string {
  return getRequestIP() || "unknown";
}

export function checkPinRateLimit(): void {
  const key = clientKey();
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return;
  }
  if (entry.count >= MAX_ATTEMPTS) {
    throw new Error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
  }
}

export function registerPinFailure(): void {
  const key = clientKey();
  const entry = attempts.get(key);
  if (entry) entry.count += 1;
}

export function verifyPin(pin: string): boolean {
  return pin.length === 4 && safeEqual(pin, CHEFE_PIN);
}
