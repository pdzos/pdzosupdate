// Cloudflare Pages Function at /api/download
// Redirects directly to Google Drive direct binary download without viewing preview page

interface Env {
  ADMIN_PASSWORD?: string;
}

export function extractDriveId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Pattern 1: /file/d/{id} or /d/{id}
  const fileDMatch = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{25,})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id={id}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Pattern 3: naked ID
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(context.request.url);
  const idParam = url.searchParams.get('id');
  const urlParam = url.searchParams.get('url');

  const fileId = extractDriveId(idParam || urlParam || '');

  if (fileId) {
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    return Response.redirect(directUrl, 302);
  }

  if (urlParam && urlParam.startsWith('https://')) {
    return Response.redirect(urlParam, 302);
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: 'Missing or invalid Google Drive file id or url parameter.',
      usage: '/api/download?id=YOUR_DRIVE_FILE_ID or /api/download?url=YOUR_DRIVE_URL',
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
