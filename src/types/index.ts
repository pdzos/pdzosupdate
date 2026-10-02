export type ChannelType = 'stable' | 'beta' | 'alpha';

export interface AppMetadata {
  name: string;
  packageName: string;
  icon: string;
  description: string;
  developer: string;
  website?: string;
  category?: string;
  tags?: string[];
  screenshots?: string[];
  featured?: boolean;
}

export interface ReleaseInfo {
  id: string;
  appPackageName: string;
  version: string;
  versionCode: number;
  apkUrl: string;
  apkSource: 'gdrive' | 'direct';
  gdriveFileId?: string;
  directDownloadUrl?: string;
  fileSize: string;
  minimumAndroid: number;
  forceUpdate: boolean;
  channel: ChannelType;
  releaseDate: string; // YYYY-MM-DD
  changelog: string[];
  status: 'published' | 'draft' | 'archived';
  isCurrentActive?: boolean;
}

export interface AppRecord {
  id: string;
  name: string;
  packageName: string;
  icon: string;
  description: string;
  developer: string;
  website: string;
  category?: string;
  tags?: string[];
  screenshots?: string[];
  featured?: boolean;
  currentVersion: string;
  currentVersionCode: number;
  minimumAndroid: number;
  defaultChannel: ChannelType;
  status: 'active' | 'deprecated' | 'development';
  createdAt: string;
  updatedAt: string;
  totalReleases: number;
  releases: ReleaseInfo[];
}

export interface HexOSUpdatePayload {
  success: boolean;
  app: AppMetadata;
  update: {
    version: string;
    versionCode: number;
    apkUrl: string;
    fileSize: string;
    minimumAndroid: number;
    forceUpdate: boolean;
    channel: ChannelType;
    releaseDate: string;
    changelog: string[];
  };
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'app_created' | 'release_published' | 'release_rollback' | 'app_updated' | 'release_draft';
  title: string;
  description: string;
  packageName: string;
  version?: string;
  versionCode?: number;
}

export interface SiteSettings {
  siteName: string;
  customDomain: string;
  apiBaseUrl: string;
  githubRepo: string;
  githubBranch: string;
  defaultChannel: ChannelType;
  defaultAndroidVersion: number;
  publicPagesEnabled: boolean;
  googleDriveFallbackAdvice: boolean;
}
