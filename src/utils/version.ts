export type UpdateStatus = 'UPDATE_AVAILABLE' | 'UP_TO_DATE' | 'NEWER_VERSION_INSTALLED' | 'INVALID';

export interface VersionComparisonResult {
  status: UpdateStatus;
  statusText: string;
  hasUpdate: boolean;
  installedCode: number;
  serverCode: number;
  badgeColor: string;
  message: string;
}

/**
 * Android compares updates strictly by versionCode (an integer).
 * Never by semantic version string alone.
 */
export function compareVersionCode(installedCode: number, serverCode: number): VersionComparisonResult {
  if (isNaN(installedCode) || isNaN(serverCode) || installedCode < 0 || serverCode <= 0) {
    return {
      status: 'INVALID',
      statusText: 'INVALID VERSION CODE',
      hasUpdate: false,
      installedCode,
      serverCode,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      message: 'Version code must be a positive integer.'
    };
  }

  if (installedCode < serverCode) {
    return {
      status: 'UPDATE_AVAILABLE',
      statusText: 'UPDATE AVAILABLE',
      hasUpdate: true,
      installedCode,
      serverCode,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      message: `A new build (versionCode ${serverCode}) is available. Current installed build is ${installedCode}.`
    };
  }

  if (installedCode === serverCode) {
    return {
      status: 'UP_TO_DATE',
      statusText: 'UP TO DATE',
      hasUpdate: false,
      installedCode,
      serverCode,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      message: `Installed build (versionCode ${installedCode}) matches the current server release.`
    };
  }

  return {
    status: 'NEWER_VERSION_INSTALLED',
    statusText: 'NEWER VERSION ALREADY INSTALLED',
    hasUpdate: false,
    installedCode,
    serverCode,
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    message: `Installed build (versionCode ${installedCode}) is newer than the server release (${serverCode}), likely a developer/pre-release build.`
  };
}

/**
 * Validates Android package name format:
 * e.g., com.hexos.zyra, com.hexoswin.art, com.company.app
 */
export function validatePackageName(packageName: string): { isValid: boolean; error?: string } {
  if (!packageName || !packageName.trim()) {
    return { isValid: false, error: 'Package name cannot be empty.' };
  }

  const trimmed = packageName.trim();
  const pattern = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i;

  if (!pattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid package name. Must contain at least two segments (e.g. "com.hexos.zyra") starting with letters.'
    };
  }

  return { isValid: true };
}

/**
 * Validates version string (e.g. 1.0.0, 1.2.3-beta)
 */
export function validateVersionString(version: string): { isValid: boolean; error?: string } {
  if (!version || !version.trim()) {
    return { isValid: false, error: 'Version string cannot be empty.' };
  }
  const trimmed = version.trim();
  if (!/^\d+(\.\d+)*(-[a-zA-Z0-9.]+)?$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Version must follow format like 1.0.0 or 1.0.0-beta.'
    };
  }
  return { isValid: true };
}
