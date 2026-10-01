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
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Pattern 1: /file/d/{id}/view, /file/d/{id}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id={id} in query params
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Pattern 3: naked ID if user pasted just the ID
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
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

  // Validate HTTPS protocol
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
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

  const isGDrive = trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');

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

    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const usercontentUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;

    return {
      isValid: true,
      isGoogleDrive: true,
      fileId,
      directDownloadUrl,
      usercontentUrl,
      warning: 'Important: Make sure file sharing is set to "Anyone with the link can view". Files >100MB may show a virus-scan confirmation screen on download.',
      tips: [
        'Right click file in Google Drive -> Share -> General access: "Anyone with the link".',
        'Direct download format generated automatically.',
        'Google Drive has daily download quota limits if downloaded thousands of times simultaneously.',
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
    warning: isApkExt ? null : 'Link does not end with .apk. Ensure the server sets application/vnd.android.package-archive header.',
    tips: ['Direct HTTPS link detected. Android DownloadManager will attempt direct download.'],
  };
}
