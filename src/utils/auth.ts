// Password authentication and session manager for HexOS Update Center
// Supports Cloudflare Pages "Variables and secrets" (ADMIN_PASSWORD or VITE_ADMIN_PASSWORD)

const AUTH_STORAGE_KEY = 'hexos_admin_password_hash_v1';
const SESSION_STORAGE_KEY = 'hexos_admin_session_token_v1';

// Default initial fallback password ONLY if no Cloudflare secret or custom password is set
const DEFAULT_PASSWORD = 'admin123';

// Vite environment variable injected during Cloudflare Pages build (VITE_ADMIN_PASSWORD)
const CLOUDFLARE_VITE_PASSWORD = ((import.meta as any).env?.VITE_ADMIN_PASSWORD || '').trim();

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
 * Checks if Cloudflare Pages server has ADMIN_PASSWORD configured
 */
export async function checkServerSecretStatus(): Promise<{ isConfigured: boolean }> {
  try {
    const res = await fetch('/verify-admin', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { isConfigured: !!data.configured };
    }
  } catch {}

  try {
    const res2 = await fetch('/api/verify-password', { method: 'GET' });
    if (res2.ok) {
      const data2 = await res2.json();
      return { isConfigured: !!data2.configured };
    }
  } catch {}

  return { isConfigured: !!CLOUDFLARE_VITE_PASSWORD };
}

/**
 * Verifies password against:
 * 1. Cloudflare Pages Function (/verify-admin or /api/verify-password) with ADMIN_PASSWORD
 * 2. Cloudflare Pages build variable (VITE_ADMIN_PASSWORD)
 * 3. LocalStorage customized password hash
 * 4. Fallback to admin123 ONLY if no Cloudflare secret is configured
 */
export async function verifyPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const trimmed = password.trim();

  // 1. Try Cloudflare Pages Function at /verify-admin
  try {
    const res = await fetch('/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: trimmed }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success === true) {
        return true;
      }
      if (data.fallback !== true) {
        // Cloudflare function explicitly verified the secret password and rejected it
        return false;
      }
    }
  } catch {}

  // 1b. Try secondary Cloudflare Function at /api/verify-password
  try {
    const res = await fetch('/api/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: trimmed }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success === true) {
        return true;
      }
      if (data.fallback !== true) {
        return false;
      }
    }
  } catch {}

  // 2. Check Cloudflare Pages VITE_ADMIN_PASSWORD variable
  if (CLOUDFLARE_VITE_PASSWORD) {
    return trimmed === CLOUDFLARE_VITE_PASSWORD;
  }

  // 3. Check custom password stored in localStorage
  const savedHash = localStorage.getItem(AUTH_STORAGE_KEY);
  if (savedHash) {
    const inputHash = await sha256(trimmed);
    return inputHash === savedHash;
  }

  // 4. Default fallback ONLY if zero Cloudflare secrets exist
  return trimmed === DEFAULT_PASSWORD;
}

/**
 * Sets session to authenticated
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

export function hasCustomPassword(): boolean {
  return !!CLOUDFLARE_VITE_PASSWORD || !!localStorage.getItem(AUTH_STORAGE_KEY);
}

export function isCloudflareSecretConfigured(): boolean {
  return !!CLOUDFLARE_VITE_PASSWORD;
}

export { DEFAULT_PASSWORD, CLOUDFLARE_VITE_PASSWORD };
