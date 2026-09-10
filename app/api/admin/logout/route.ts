import {
  clearAdminSessionCookie,
  isSameOriginRequest,
  requireAdmin,
} from '@/services/admin-auth';

export const runtime = 'edge';

export async function POST(request: Request) {
  const secure = new URL(request.url).protocol === 'https:';
  if (!isSameOriginRequest(request)) {
    return Response.json({ ok: false, error: 'Solicitud no válida.' }, { status: 403 });
  }

  try {
    await requireAdmin();
  } catch {
    const response = Response.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
    response.headers.set('set-cookie', clearAdminSessionCookie(secure));
    return response;
  }

  return new Response(null, {
    status: 303,
    headers: {
      location: new URL('/admin/login', request.url).toString(),
      'set-cookie': clearAdminSessionCookie(secure),
      'cache-control': 'no-store',
    },
  });
}
