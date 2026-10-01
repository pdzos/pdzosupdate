// Password authentication and session manager for HexOS Update Center

const AUTH_STORAGE_KEY = 'hexos_admin_password_hash_v1';
const SESSION_STORAGE_KEY = 'hexos_admin_session_token_v1';

// Default initial master password is 'admin123'
const DEFAULT_PASSWORD = 'admin123';

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
 * Verifies password against saved hash (or default password)
 */
export async function verifyPassword(password: string): Promise<boolean> {
  if (!password) return false;

  const savedHash = localStorage.getItem(AUTH_STORAGE_KEY);
  const inputHash = await sha256(password.trim());

  if (!savedHash) {
    // First time setup - check default password
    const defaultHash = await sha256(DEFAULT_PASSWORD);
    return inputHash === defaultHash;
  }

  return inputHash === savedHash;
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
 * Updates admin master password
 */
export async function updateAdminPassword(newPassword: string): Promise<void> {
  const hash = await sha256(newPassword.trim());
  localStorage.setItem(AUTH_STORAGE_KEY, hash);
}

/**
 * Check if custom password has been configured
 */
export function hasCustomPassword(): boolean {
  return !!localStorage.getItem(AUTH_STORAGE_KEY);
}

export { DEFAULT_PASSWORD };
