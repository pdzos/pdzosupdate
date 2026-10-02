// Cloudflare Pages Function at /download/[pkg]
// Allows permanent direct download endpoint: https://<domain>/download/com.company.app

export async function onRequest(context: { request: Request; params: { pkg: string } }): Promise<Response> {
  const pkg = context.params.pkg;
  if (!pkg) {
    return new Response('Package name required', { status: 400 });
  }

  const cleanPkg = pkg.replace(/\.apk$/i, '');
  const githubRawUrl = `https://raw.githubusercontent.com/pdzos/pdzosupdate/main/apps/${cleanPkg}.json`;

  try {
    const res = await fetch(githubRawUrl, {
      headers: {
        'User-Agent': 'Cloudflare-Pages-UpdateCenter',
      },
    });

    if (res.ok) {
      const data = await res.json() as any;
      const apkUrl = data?.update?.apkUrl;
      if (apkUrl) {
        return Response.redirect(apkUrl, 302);
      }
    }
  } catch (err) {
    // Fallback error
  }

  return new Response(`Application ${cleanPkg} not found or no active APK release.`, {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}
