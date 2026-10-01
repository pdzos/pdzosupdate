// Cloudflare Pages Function: /api/verify-password
// Runs on Cloudflare's global edge network (Free tier)

interface Env {
  ADMIN_PASSWORD?: string;
  VITE_ADMIN_PASSWORD?: string;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  try {
    const { request, env } = context;
    const body = await request.json() as { password?: string };
    const inputPassword = body.password?.trim();

    // Master secret password configured in Cloudflare Pages "Variables and secrets"
    const secretPassword = env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD;

    if (!inputPassword) {
      return new Response(JSON.stringify({ success: false, error: 'Password is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!secretPassword) {
      // Secret not yet configured in Cloudflare Dashboard, tell client to fallback to client-side auth
      return new Response(JSON.stringify({ success: false, fallback: true, message: 'No server secret set' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (inputPassword === secretPassword.trim()) {
      return new Response(JSON.stringify({ success: true, message: 'Authenticated successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Incorrect password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
