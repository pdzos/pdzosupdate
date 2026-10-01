// Cloudflare Pages Function at /verify-admin
// Compatible with Cloudflare Pages Functions (Free tier)

interface Env {
  ADMIN_PASSWORD?: string;
  VITE_ADMIN_PASSWORD?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const secretPassword = (context.env.ADMIN_PASSWORD || context.env.VITE_ADMIN_PASSWORD || '').trim();
  return new Response(
    JSON.stringify({
      configured: !!secretPassword,
      message: secretPassword ? 'Cloudflare secret active' : 'No Cloudflare secret configured in environment',
    }),
    { headers: corsHeaders }
  );
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  try {
    const { request, env } = context;
    let inputPassword = '';

    try {
      const body = (await request.json()) as { password?: string };
      inputPassword = (body.password || '').trim();
    } catch {
      inputPassword = '';
    }

    const secretPassword = (env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD || '').trim();

    if (!inputPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!secretPassword) {
      return new Response(
        JSON.stringify({ success: false, fallback: true, error: 'No Cloudflare secret set' }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (inputPassword === secretPassword) {
      return new Response(
        JSON.stringify({ success: true, message: 'Authenticated successfully' }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Incorrect password' }),
      { status: 401, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
