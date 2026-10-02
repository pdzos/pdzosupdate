import { AppRecord, SiteSettings, ActivityEvent, HexOSUpdatePayload, ReleaseInfo } from '../types';
import { INITIAL_APPS, INITIAL_SETTINGS, INITIAL_ACTIVITY, SAMPLE_DEMO_APPS } from '../data/initialData';
import { toDirectDownloadUrl } from './googleDrive';

const STORAGE_KEYS = {
  APPS: 'hexos_apps_data_v2', // v2 for clean empty slate
  SETTINGS: 'hexos_site_settings_v2',
  ACTIVITY: 'hexos_activity_log_v2',
};

export function getStoredApps(): AppRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(INITIAL_APPS));
      return INITIAL_APPS;
    }
    const apps: AppRecord[] = JSON.parse(raw);
    // Sanitize any Google Drive links to direct download links automatically
    let hasChanges = false;
    const sanitized = apps.map(app => ({
      ...app,
      releases: (app.releases || []).map(rel => {
        const direct = toDirectDownloadUrl(rel.directDownloadUrl || rel.apkUrl);
        if (direct && direct !== rel.directDownloadUrl) {
          hasChanges = true;
          return {
            ...rel,
            directDownloadUrl: direct,
            apkUrl: direct,
          };
        }
        return rel;
      })
    }));

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(sanitized));
    }
    return sanitized;
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

export function getCurrentDomainInfo(): { origin: string; host: string; apiBaseUrl: string } {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    const host = window.location.host;
    return {
      origin,
      host,
      apiBaseUrl: `${origin}/api`,
    };
  }
  return {
    origin: 'https://pdzosupdate.pages.dev',
    host: 'pdzosupdate.pages.dev',
    apiBaseUrl: 'https://pdzosupdate.pages.dev/api',
  };
}

export function getStoredSettings(): SiteSettings {
  const current = getCurrentDomainInfo();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      const dynamicInitial: SiteSettings = {
        ...INITIAL_SETTINGS,
        customDomain: current.host,
        apiBaseUrl: current.apiBaseUrl,
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(dynamicInitial));
      return dynamicInitial;
    }
    const parsed = JSON.parse(raw);
    // Auto-detect and sync current running domain
    const isLiveBrowser = typeof window !== 'undefined' && !!window.location?.host;
    if (isLiveBrowser) {
      const isDummyOrOld = !parsed.customDomain ||
        parsed.customDomain.includes('hexos.in') ||
        parsed.customDomain.includes('localhost') ||
        parsed.apiBaseUrl?.includes('hexos.in') ||
        parsed.apiBaseUrl?.includes('localhost');

      // If user is accessing via a live domain (e.g. pdzosupdate.pages.dev or custom domain)
      // and not explicitly manually overridden, automatically sync:
      if (isDummyOrOld || (parsed.customDomain !== current.host && !parsed.isManualDomainOverride)) {
        parsed.customDomain = current.host;
        parsed.apiBaseUrl = current.apiBaseUrl;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
    }
    return { ...INITIAL_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Failed reading settings from storage', err);
    return {
      ...INITIAL_SETTINGS,
      customDomain: current.host,
      apiBaseUrl: current.apiBaseUrl,
    };
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

/**
 * Resets storage to completely clean slate (0 apps)
 */
export function resetToCleanSlate(): void {
  localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify([]));
}

/**
 * Loads sample apps only if requested by user
 */
export function loadSampleDemoApps(): AppRecord[] {
  localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(SAMPLE_DEMO_APPS));
  return SAMPLE_DEMO_APPS;
}

export function resetToDemoData(): void {
  resetToCleanSlate();
}

/**
 * Generates the standardized Section 9 JSON response payload
 * for an app's permanent endpoint.
 */
export function generatePermanentJsonPayload(app: AppRecord, channel?: string): HexOSUpdatePayload {
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
      category: app.category || 'Tools',
      tags: app.tags || ['Android', 'App'],
      screenshots: app.screenshots || [],
      featured: Boolean(app.featured),
    },
    update: {
      version: targetRelease ? targetRelease.version : app.currentVersion,
      versionCode: targetRelease ? targetRelease.versionCode : app.currentVersionCode,
      apkUrl: targetRelease ? toDirectDownloadUrl(targetRelease.directDownloadUrl || targetRelease.apkUrl) : '',
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
 * Generates the unified apps.json catalog formatted for PDzOS Store
 */
export function generateStoreAppsJson(apps: AppRecord[]) {
  return {
    store: {
      name: "PDzOS Store",
      tagline: "Your Apps. One Store.",
      subtitle: "Discover powerful Android apps built by PDzOS.",
      developer: "PDzOS",
      version: "1.0.0",
      badgeThresholds: {
        newDays: 45,
        updatedDays: 30
      }
    },
    apps: apps.map(app => {
      const activeRelease = (app.releases || []).find(r => r.isCurrentActive) || (app.releases || [])[0];
      const olderReleases = (app.releases || []).filter(r => r.id !== activeRelease?.id);
      const cleanId = app.packageName.split('.').pop() || app.id.replace(/^app-/, '');

      return {
        id: cleanId.toLowerCase(),
        packageName: app.packageName,
        name: app.name,
        developer: app.developer || "PDzOS",
        version: activeRelease ? activeRelease.version : app.currentVersion,
        versionCode: activeRelease ? activeRelease.versionCode : app.currentVersionCode,
        category: app.category || "Tools",
        description: app.description,
        longDescription: app.description,
        icon: app.icon,
        screenshots: app.screenshots && app.screenshots.length > 0 ? app.screenshots : [],
        size: activeRelease ? activeRelease.fileSize : "N/A",
        android: activeRelease?.minimumAndroid 
          ? `Android ${activeRelease.minimumAndroid >= 26 ? (activeRelease.minimumAndroid === 26 ? '8.0+' : activeRelease.minimumAndroid === 27 ? '8.1+' : activeRelease.minimumAndroid === 28 ? '9.0+' : '10.0+') : '7.0+'}`
          : "Android 8.0+",
        updated: activeRelease ? activeRelease.releaseDate : app.updatedAt,
        downloads: 0,
        featured: Boolean(app.featured),
        status: app.status === 'active' ? 'stable' : app.status,
        downloadUrl: activeRelease ? toDirectDownloadUrl(activeRelease.directDownloadUrl || activeRelease.apkUrl) : '',
        tags: app.tags && app.tags.length > 0 ? app.tags : [app.category || "Tools", "Android"],
        features: activeRelease?.changelog && activeRelease.changelog.length > 0 ? activeRelease.changelog : ['High performance build', 'OLED dark-mode optimized'],
        whatsNew: activeRelease?.changelog && activeRelease.changelog.length > 0 ? activeRelease.changelog : ["Initial release"],
        previousVersions: olderReleases.map(rel => ({
          version: rel.version,
          date: rel.releaseDate,
          size: rel.fileSize,
          downloadUrl: toDirectDownloadUrl(rel.directDownloadUrl || rel.apkUrl)
        }))
      };
    })
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
