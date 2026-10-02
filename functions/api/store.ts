// Cloudflare Pages Function at /api/store
// Serves the unified PDzOS Store marketplace catalog with live CORS headers

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

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  // Fetch from GitHub repository raw apps.json
  const githubRawUrl = `https://raw.githubusercontent.com/pdzos/pdzosupdate/main/apps.json`;

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

  // Fallback response if apps.json not committed yet to repo
  return new Response(
    JSON.stringify({
      store: {
        name: "PDzOS Store",
        version: "1.0.0",
        syncedFrom: "PdzOS App Update Center"
      },
      apps: []
    }),
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}
