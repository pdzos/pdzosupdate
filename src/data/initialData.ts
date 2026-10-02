import { AppRecord, SiteSettings, ActivityEvent } from '../types';

const defaultHost = typeof window !== 'undefined' && window.location?.host ? window.location.host : 'pdzosupdate.pages.dev';
const defaultOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://pdzosupdate.pages.dev';

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'HexOS Update Center',
  customDomain: defaultHost,
  apiBaseUrl: `${defaultOrigin}/api`,
  githubRepo: 'https://github.com/pdzos/pdzosupdate',
  githubBranch: 'main',
  defaultChannel: 'stable',
  defaultAndroidVersion: 26,
  publicPagesEnabled: true,
  googleDriveFallbackAdvice: true,
};

// CLEAN SLATE: NO FIXED DEMO DATA BY DEFAULT
export const INITIAL_APPS: AppRecord[] = [];

export const INITIAL_ACTIVITY: ActivityEvent[] = [];

// Optional sample data available only if explicitly requested in Settings
export const SAMPLE_DEMO_APPS: AppRecord[] = [
  {
    id: 'zyra-app',
    name: 'ZYRA',
    packageName: 'com.hexos.zyra',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
    description: 'Personal AI Assistant designed for deep Android automation and real-time voice interaction.',
    developer: 'HexOS Systems',
    website: 'https://hexos.in/zyra',
    currentVersion: '1.6.0',
    currentVersionCode: 16,
    minimumAndroid: 26,
    defaultChannel: 'stable',
    status: 'active',
    createdAt: '2026-08-10',
    updatedAt: '2026-10-01',
    totalReleases: 2,
    releases: [
      {
        id: 'rel-zyra-160',
        appPackageName: 'com.hexos.zyra',
        version: '1.6.0',
        versionCode: 16,
        apkUrl: 'https://drive.google.com/file/d/1ZyRa_ExAmPLe_FiLeId_160_GoogleDrive/view?usp=sharing',
        apkSource: 'gdrive',
        gdriveFileId: '1ZyRa_ExAmPLe_FiLeId_160_GoogleDrive',
        directDownloadUrl: 'https://drive.google.com/uc?export=download&id=1ZyRa_ExAmPLe_FiLeId_160_GoogleDrive',
        fileSize: '52 MB',
        minimumAndroid: 26,
        forceUpdate: false,
        channel: 'stable',
        releaseDate: '2026-10-01',
        changelog: [
          'Faster AI responses and contextual reasoning',
          'New voice recognition engine with low-latency offline mode',
          'Bug fixes and stability updates'
        ],
        status: 'published',
        isCurrentActive: true,
      },
      {
        id: 'rel-zyra-150',
        appPackageName: 'com.hexos.zyra',
        version: '1.5.0',
        versionCode: 15,
        apkUrl: 'https://drive.google.com/file/d/1ZyRa_ExAmPLe_FiLeId_150_GoogleDrive/view?usp=sharing',
        apkSource: 'gdrive',
        gdriveFileId: '1ZyRa_ExAmPLe_FiLeId_150_GoogleDrive',
        directDownloadUrl: 'https://drive.google.com/uc?export=download&id=1ZyRa_ExAmPLe_FiLeId_150_GoogleDrive',
        fileSize: '49 MB',
        minimumAndroid: 26,
        forceUpdate: false,
        channel: 'stable',
        releaseDate: '2026-09-12',
        changelog: ['Initial voice wake word support'],
        status: 'published',
        isCurrentActive: false,
      }
    ]
  },
  {
    id: 'winart-app',
    name: 'WinArt',
    packageName: 'com.hexoswin.art',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
    description: 'Windows 11 inspired Fluent UI launcher and personalization suite for modern Android devices.',
    developer: 'HexOS Systems',
    website: 'https://hexos.in/winart',
    currentVersion: '1.2.0',
    currentVersionCode: 12,
    minimumAndroid: 26,
    defaultChannel: 'stable',
    status: 'active',
    createdAt: '2026-07-15',
    updatedAt: '2026-09-28',
    totalReleases: 1,
    releases: [
      {
        id: 'rel-winart-120',
        appPackageName: 'com.hexoswin.art',
        version: '1.2.0',
        versionCode: 12,
        apkUrl: 'https://drive.google.com/file/d/1WinArt_FileId_120_GoogleDrive/view?usp=sharing',
        apkSource: 'gdrive',
        gdriveFileId: '1WinArt_FileId_120_GoogleDrive',
        directDownloadUrl: 'https://drive.google.com/uc?export=download&id=1WinArt_FileId_120_GoogleDrive',
        fileSize: '38 MB',
        minimumAndroid: 26,
        forceUpdate: false,
        channel: 'stable',
        releaseDate: '2026-09-28',
        changelog: ['Fluent glass acrylic blur animations', 'Start menu redesign'],
        status: 'published',
        isCurrentActive: true,
      }
    ]
  }
];
