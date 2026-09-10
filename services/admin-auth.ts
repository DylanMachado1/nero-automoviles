import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'nero_admin_session';
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const HASH_PREFIX = 'pbkdf2-sha256';
const encoder = new TextEncoder();

export type AdminSession = {
  userId: 'env-admin';
  displayName: 'Administrador NERO';
  email: string;
};

type SessionPayload = {
  version: 1;
  email: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

export class AdminAuthError extends Error {
  constructor() {
    super('Sesión administrativa no válida.');
    this.name = 'AdminAuthError';
  }
}

function getAdminConfig() {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = env.ADMIN_PASSWORD_HASH?.trim();
  const sessionSecret = env.ADMIN_SESSION_SECRET?.trim();

  if (!email || !passwordHash || !sessionSecret) {
    throw new Error('El acceso administrativo no está configurado.');
  }
  if (sessionSecret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET debe tener al menos 32 caracteres.');
  }

  return { email, passwordHash, sessionSecret };
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function constantTimeTextEqual(left: string, right: string): Promise<boolean> {
  const [leftDigest, rightDigest] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right)),
  ]);
  const a = new Uint8Array(leftDigest);
  const b = new Uint8Array(rightDigest);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return difference === 0;
}

async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const [prefix, iterationsText, saltText, expectedText, extra] = encodedHash.split('$');
  const iterations = Number(iterationsText);
  if (
    prefix !== HASH_PREFIX ||
    extra !== undefined ||
    !Number.isSafeInteger(iterations) ||
    iterations < 210_000 ||
    iterations > 1_000_000 ||
    !saltText ||
    !expectedText ||
    encoder.encode(password).length > 1024
  ) {
    return false;
  }

  try {
    const salt = base64UrlToBytes(saltText);
    const expected = base64UrlToBytes(expectedText);
    if (salt.length < 16 || expected.length !== 32) return false;
    const material = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const actual = new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
        material,
        expected.length * 8,
      ),
    );
    let difference = actual.length ^ expected.length;
    for (let index = 0; index < Math.max(actual.length, expected.length); index += 1) {
      difference |= (actual[index] ?? 0) ^ (expected[index] ?? 0);
    }
    return difference === 0;
  } catch {
    return false;
  }
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const config = getAdminConfig();
  const [emailMatches, passwordMatches] = await Promise.all([
    constantTimeTextEqual(email.trim().toLowerCase(), config.email),
    verifyPassword(password, config.passwordHash),
  ]);
  return emailMatches && passwordMatches;
}

export async function createAdminSessionToken(): Promise<string> {
  const config = getAdminConfig();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    version: 1,
    email: config.email,
    issuedAt: now,
    expiresAt: now + SESSION_SECONDS,
    nonce: crypto.randomUUID(),
  };
  const encodedPayload = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = new Uint8Array(
    await crypto.subtle.sign('HMAC', await hmacKey(config.sessionSecret), encoder.encode(encodedPayload)),
  );
  return `${encodedPayload}.${bytesToBase64Url(signature)}`;
}

async function verifyAdminSessionToken(token: string): Promise<AdminSession | null> {
  const config = getAdminConfig();
  const [encodedPayload, encodedSignature, extra] = token.split('.');
  if (!encodedPayload || !encodedSignature || extra !== undefined) return null;

  try {
    const validSignature = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(config.sessionSecret),
      base64UrlToBytes(encodedSignature),
      encoder.encode(encodedPayload),
    );
    if (!validSignature) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(encodedPayload)),
    ) as Partial<SessionPayload>;
    const now = Math.floor(Date.now() / 1000);
    if (
      payload.version !== 1 ||
      typeof payload.email !== 'string' ||
      typeof payload.issuedAt !== 'number' ||
      typeof payload.expiresAt !== 'number' ||
      typeof payload.nonce !== 'string' ||
      payload.issuedAt > now + 60 ||
      payload.expiresAt <= now ||
      payload.expiresAt - payload.issuedAt > SESSION_SECONDS ||
      !(await constantTimeTextEqual(payload.email.toLowerCase(), config.email))
    ) {
      return null;
    }

    return {
      userId: 'env-admin',
      displayName: 'Administrador NERO',
      email: config.email,
    };
  } catch {
    return null;
  }
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

export async function isAdmin(): Promise<AdminSession | null> {
  try {
    const requestHeaders = await headers();
    const token = readCookie(requestHeaders.get('cookie'), COOKIE_NAME);
    return token ? await verifyAdminSessionToken(token) : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(_returnTo = '/admin'): Promise<AdminSession> {
  const admin = await isAdmin();
  if (!admin) throw new AdminAuthError();
  return admin;
}

export async function requireAdminPage(returnTo = '/admin'): Promise<AdminSession> {
  const admin = await isAdmin();
  if (admin) return admin;
  redirect(`/admin/login?returnTo=${encodeURIComponent(safeAdminReturnTo(returnTo))}`);
}

export function safeAdminReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith('/admin') || value.startsWith('//')) return '/admin';
  try {
    const parsed = new URL(value, 'https://nero.local');
    if (
      parsed.origin !== 'https://nero.local' ||
      (parsed.pathname !== '/admin' && !parsed.pathname.startsWith('/admin/')) ||
      parsed.pathname === '/admin/login'
    ) {
      return '/admin';
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/admin';
  }
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function adminSessionCookie(token: string, secure: boolean): string {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`;
}

export function clearAdminSessionCookie(secure: boolean): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

export function isAdminAuthError(error: unknown): error is AdminAuthError {
  return error instanceof AdminAuthError;
}

export function adminApiError(error: unknown, fallback: string, status = 400): Response {
  if (isAdminAuthError(error)) {
    return Response.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }
  return Response.json(
    { ok: false, error: error instanceof Error ? error.message : fallback },
    { status },
  );
}
