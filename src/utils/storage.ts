import { AppRecord, SiteSettings, ActivityEvent, HexOSUpdatePayload, ReleaseInfo } from '../types';
import { INITIAL_APPS, INITIAL_SETTINGS, INITIAL_ACTIVITY } from '../data/initialData';

const STORAGE_KEYS = {
  APPS: 'hexos_apps_data_v1',
  SETTINGS: 'hexos_site_settings_v1',
  ACTIVITY: 'hexos_activity_log_v1',
};

export function getStoredApps(): AppRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(INITIAL_APPS));
      return INITIAL_APPS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading apps from storage', err);
    return INITIAL_APPS;
  }
}

export function saveApps(apps: AppRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
  } catch (err) {
    console.error('Failed saving apps to storage', err);
  }
}

export function getStoredSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed reading settings from storage', err);
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed saving settings to storage', err);
  }
}

export function getStoredActivity(): ActivityEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY));
      return INITIAL_ACTIVITY;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading activity from storage', err);
    return INITIAL_ACTIVITY;
  }
}

export function logActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): void {
  try {
    const list = getStoredActivity();
    const newEvent: ActivityEvent = {
      ...event,
      id: 'act-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    const updated = [newEvent, ...list.slice(0, 99)]; // keep latest 100
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed writing activity event', err);
  }
}

export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(INITIAL_APPS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY));
}

/**
 * Generates the standardized Section 9 JSON response payload
 * for an app's permanent endpoint.
 */
export function generatePermanentJsonPayload(app: AppRecord, channel?: string): HexOSUpdatePayload {
  // Find current active release or channel matching release
  const releases = app.releases || [];
  let targetRelease: ReleaseInfo | undefined;

  if (channel && channel !== 'all') {
    targetRelease = releases.find(r => r.channel === channel && r.status === 'published');
  }

  if (!targetRelease) {
    targetRelease = releases.find(r => r.isCurrentActive) || releases[0];
  }

  return {
    success: true,
    app: {
      name: app.name,
      packageName: app.packageName,
      icon: app.icon,
      description: app.description,
      developer: app.developer,
      website: app.website,
    },
    update: {
      version: targetRelease ? targetRelease.version : app.currentVersion,
      versionCode: targetRelease ? targetRelease.versionCode : app.currentVersionCode,
      apkUrl: targetRelease ? (targetRelease.directDownloadUrl || targetRelease.apkUrl) : '',
      fileSize: targetRelease ? targetRelease.fileSize : '0 MB',
      minimumAndroid: targetRelease ? targetRelease.minimumAndroid : app.minimumAndroid,
      forceUpdate: targetRelease ? targetRelease.forceUpdate : false,
      channel: targetRelease ? targetRelease.channel : app.defaultChannel,
      releaseDate: targetRelease ? targetRelease.releaseDate : app.updatedAt,
      changelog: targetRelease ? targetRelease.changelog : ['Initial release'],
    }
  };
}

/**
 * Performs release rollback:
 * Re-points the app's current release to an older version
 * without deleting newer versions from history!
 */
export function rollbackAppRelease(packageName: string, targetReleaseId: string): { success: boolean; message: string } {
  const apps = getStoredApps();
  const appIndex = apps.findIndex(a => a.packageName === packageName);
  if (appIndex === -1) {
    return { success: false, message: 'Application not found.' };
  }

  const app = apps[appIndex];
  const targetRelease = app.releases.find(r => r.id === targetReleaseId);
  if (!targetRelease) {
    return { success: false, message: 'Target release not found.' };
  }

  // Update releases: mark only target as isCurrentActive
  const updatedReleases = app.releases.map(r => ({
    ...r,
    isCurrentActive: r.id === targetReleaseId
  }));

  const updatedApp: AppRecord = {
    ...app,
    currentVersion: targetRelease.version,
    currentVersionCode: targetRelease.versionCode,
    updatedAt: new Date().toISOString().split('T')[0],
    releases: updatedReleases,
  };

  apps[appIndex] = updatedApp;
  saveApps(apps);

  logActivity({
    type: 'release_rollback',
    title: `Rollback: ${app.name} -> v${targetRelease.version}`,
    description: `Active release reverted to v${targetRelease.version} (build ${targetRelease.versionCode}). Permanent URL updated immediately.`,
    packageName: app.packageName,
    version: targetRelease.version,
    versionCode: targetRelease.versionCode,
  });

  return { success: true, message: `Successfully rolled back to v${targetRelease.version}` };
}
