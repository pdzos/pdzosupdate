export interface GDriveAnalysis {
  isValid: boolean;
  isGoogleDrive: boolean;
  fileId: string | null;
  directDownloadUrl: string | null;
  usercontentUrl: string | null;
  warning: string | null;
  tips: string[];
}

/**
 * Extracts a Google Drive file ID from arbitrary Google Drive share URLs.
 * Handles:
 * - https://drive.google.com/file/d/{id}/view?usp=sharing
 * - https://drive.google.com/file/d/{id}
 * - https://drive.google.com/open?id={id}
 * - https://drive.google.com/uc?id={id}&export=download
 * - https://drive.google.com/uc?export=download&id={id}
 * - https://drive.usercontent.google.com/download?id={id}
 * - https://docs.google.com/file/d/{id}
 * - Naked file IDs
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Pattern 1: /file/d/{id} or /d/{id}
  const fileDMatch = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{25,})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id={id} in query params
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Pattern 3: naked ID if user pasted just the Google Drive ID
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Universal transformer: converts ANY Google Drive sharing or preview link
 * into a DIRECT download URL that immediately initiates file download
 * without opening the Google Drive web preview page.
 */
export function toDirectDownloadUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    // &confirm=t bypasses virus scan confirmation warning on Google Drive
    return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
  }

  return trimmed;
}

/**
 * Analyzes and validates an APK URL (Google Drive or direct HTTPS).
 */
export function analyzeApkUrl(url: string): GDriveAnalysis {
  if (!url || !url.trim()) {
    return {
      isValid: false,
      isGoogleDrive: false,
      fileId: null,
      directDownloadUrl: null,
      usercontentUrl: null,
      warning: 'Please provide a valid download URL.',
      tips: ['Paste a Google Drive sharing link or direct HTTPS APK link.'],
    };
  }

  const trimmed = url.trim();

  // Check if naked Google Drive ID was pasted
  const nakedId = /^[a-zA-Z0-9_-]{25,45}$/.test(trimmed);

  // Validate HTTPS protocol if not a naked ID
  if (!nakedId && !trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    return {
      isValid: false,
      isGoogleDrive: false,
      fileId: null,
      directDownloadUrl: null,
      usercontentUrl: null,
      warning: 'URL must start with https:// for secure Android downloads.',
      tips: ['Ensure the URL begins with https://'],
    };
  }

  const isGDrive = nakedId || trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');

  if (isGDrive) {
    const fileId = extractGoogleDriveId(trimmed);

    if (!fileId) {
      return {
        isValid: false,
        isGoogleDrive: true,
        fileId: null,
        directDownloadUrl: null,
        usercontentUrl: null,
        warning: 'Could not extract Google Drive File ID. Please check the URL format.',
        tips: [
          'Accepted format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing',
          'Or format: https://drive.google.com/open?id=FILE_ID',
        ],
      };
    }

    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    const usercontentUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

    return {
      isValid: true,
      isGoogleDrive: true,
      fileId,
      directDownloadUrl,
      usercontentUrl,
      warning: null,
      tips: [
        'Direct download link active. Users will NOT be redirected to Google Drive web preview.',
        'Make sure file sharing in Google Drive is set to "Anyone with the link can view".',
        'Automatic virus scan confirmation bypass (&confirm=t) included.',
      ],
    };
  }

  // Non-Google Drive direct URL
  const isApkExt = trimmed.toLowerCase().endsWith('.apk');
  return {
    isValid: true,
    isGoogleDrive: false,
    fileId: null,
    directDownloadUrl: trimmed,
    usercontentUrl: null,
    warning: isApkExt ? null : 'Link does not end with .apk. Ensure the host provides a direct binary stream.',
    tips: ['Direct HTTPS link detected. Android DownloadManager will download directly.'],
  };
}
