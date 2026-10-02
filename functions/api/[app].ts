// Cloudflare Pages Function at /api/[app]
// Serves permanent update JSON endpoints: e.g. /api/com.company.app.json or /api/com.company.app

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet(context: { request: Request; params: { app: string } }): Promise<Response> {
  const appParam = context.params.app;
  if (!appParam) {
    return new Response(JSON.stringify({ success: false, error: 'App identifier missing' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Strip .json suffix if present: e.g. "com.company.app.json" -> "com.company.app"
  const cleanPackageName = appParam.replace(/\.json$/i, '').trim();

  // Attempt to fetch from GitHub repository raw metadata
  const githubRawUrl = `https://raw.githubusercontent.com/pdzos/pdzosupdate/main/apps/${cleanPackageName}.json`;

  try {
    const ghRes = await fetch(githubRawUrl, {
      headers: {
        'User-Agent': 'Cloudflare-Pages-UpdateCenter',
      },
    });

    if (ghRes.ok) {
      const payloadText = await ghRes.text();
      return new Response(payloadText, {
        status: 200,
        headers: corsHeaders,
      });
    }
  } catch (err) {
    // Continue to fallback
  }

  // If not found in repo, return clean JSON
  return new Response(
    JSON.stringify({
      success: false,
      packageName: cleanPackageName,
      error: `Metadata for '${cleanPackageName}' not found in GitHub repository apps/${cleanPackageName}.json.`,
      instruction: 'Use the Update Center dashboard to export and commit apps/' + cleanPackageName + '.json to GitHub repository.',
    }),
    {
      status: 404,
      headers: corsHeaders,
    }
  );
}
