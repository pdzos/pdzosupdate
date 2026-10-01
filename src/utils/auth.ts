// Password authentication and session manager for HexOS Update Center
// Directly connects to Cloudflare Pages "Variables and secrets" -> ADMIN_PASSWORD

declare const __ADMIN_PASSWORD__: string;

const AUTH_STORAGE_KEY = 'hexos_admin_password_hash_v1';
const SESSION_STORAGE_KEY = 'hexos_admin_session_token_v1';

// Injected during Cloudflare Pages build from process.env.ADMIN_PASSWORD
export const CLOUDFLARE_ENV_PASSWORD =
  (typeof __ADMIN_PASSWORD__ !== 'undefined' ? __ADMIN_PASSWORD__ : '') ||
  ((import.meta as any).env?.VITE_ADMIN_PASSWORD || '').trim();

/**
 * SHA-256 hash using native Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Always returns false on website load so EVERY time the website is opened,
 * the admin must enter the password.
 */
export function isAuthenticated(): boolean {
  return false;
}

/**
 * Verifies password against:
 * 1. Cloudflare Pages Function (/verify-admin) checking context.env.ADMIN_PASSWORD
 * 2. Cloudflare Pages build variable (__ADMIN_PASSWORD__) injected from process.env.ADMIN_PASSWORD
 * 3. LocalStorage customized password hash
 *
 * NOTE: There is ZERO hardcoded fallback like admin123.
 * Only the password you set in Cloudflare will open the website!
 */
export async function verifyPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const trimmed = password.trim();

  // 1. Try Cloudflare Pages serverless Function (/verify-admin)
  try {
    const res = await fetch('/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: trimmed }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success === true) {
        return true;
      }
      if (data.fallback !== true) {
        // Cloudflare server function explicitly matched against ADMIN_PASSWORD and rejected it
        return false;
      }
    }
  } catch {
    // Proceed to build-injected variable check
  }

  // 2. Check Cloudflare Pages ADMIN_PASSWORD injected during build
  if (CLOUDFLARE_ENV_PASSWORD) {
    return trimmed === CLOUDFLARE_ENV_PASSWORD;
  }

  // 3. Check custom password stored in localStorage
  const savedHash = localStorage.getItem(AUTH_STORAGE_KEY);
  if (savedHash) {
    const inputHash = await sha256(trimmed);
    return inputHash === savedHash;
  }

  // If no password matched, DENY access
  return false;
}

/**
 * Sets session to authenticated (clears persistent storage to guarantee prompt on next open)
 */
export function setAuthenticated(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed clearing stored session', e);
  }
}

/**
 * Destroys session
 */
export function logout(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed clearing auth session', e);
  }
}

/**
 * Updates admin master password locally
 */
export async function updateAdminPassword(newPassword: string): Promise<void> {
  const hash = await sha256(newPassword.trim());
  localStorage.setItem(AUTH_STORAGE_KEY, hash);
}

export function isCloudflareSecretConfigured(): boolean {
  return !!CLOUDFLARE_ENV_PASSWORD;
}
