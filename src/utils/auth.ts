// Password authentication and session manager for HexOS Update Center
// Supports Cloudflare Pages "Variables and secrets" (ADMIN_PASSWORD or VITE_ADMIN_PASSWORD)

const AUTH_STORAGE_KEY = 'hexos_admin_password_hash_v1';
const SESSION_STORAGE_KEY = 'hexos_admin_session_token_v1';

// Default initial fallback password if no Cloudflare secret or custom password is set
const DEFAULT_PASSWORD = 'admin123';

// Vite environment variable injected during Cloudflare Pages build
const CLOUDFLARE_VITE_PASSWORD = (import.meta as any).env?.VITE_ADMIN_PASSWORD || '';

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
 * Returns true if admin is currently authenticated in this session
 */
export function isAuthenticated(): boolean {
  try {
    const session = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
    return session === 'authenticated_active_session';
  } catch {
    return false;
  }
}

/**
 * Verifies password against:
 * 1. Cloudflare Pages Functions serverless endpoint (/api/verify-password) using ADMIN_PASSWORD secret
 * 2. Cloudflare Pages build variable (VITE_ADMIN_PASSWORD)
 * 3. LocalStorage customized password hash
 * 4. Default fallback: admin123
 */
export async function verifyPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const trimmed = password.trim();

  // 1. Try Cloudflare Pages Function at /api/verify-password
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
      if (data.fallback !== true && data.success === false) {
        // Cloudflare server explicitly rejected the password
        return false;
      }
    }
  } catch {
    // If running in environment without Cloudflare Functions, proceed to client checks
  }

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

  // 4. Default fallback
  return trimmed === DEFAULT_PASSWORD;
}

/**
 * Sets session to authenticated
 */
export function setAuthenticated(rememberMe = false): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'authenticated_active_session');
    if (rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, 'authenticated_active_session');
    }
  } catch (e) {
    console.error('Failed setting auth session', e);
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

/**
 * Check if custom password has been configured or if Cloudflare secret is present
 */
export function hasCustomPassword(): boolean {
  return !!CLOUDFLARE_VITE_PASSWORD || !!localStorage.getItem(AUTH_STORAGE_KEY);
}

export function isCloudflareSecretConfigured(): boolean {
  return !!CLOUDFLARE_VITE_PASSWORD;
}

export { DEFAULT_PASSWORD, CLOUDFLARE_VITE_PASSWORD };
