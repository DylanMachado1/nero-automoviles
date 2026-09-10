import {
  adminSessionCookie,
  createAdminSessionToken,
  isSameOriginRequest,
  safeAdminReturnTo,
  verifyAdminCredentials,
} from '@/services/admin-auth';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';
const GENERIC_ERROR = 'Correo o contraseña incorrectos.';

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ ok: false, error: GENERIC_ERROR }, { status: 403 });
  }

  try {
    await enforceRateLimit(request, 'admin-login', 5, 15);
  } catch (error) {
    await wait(350);
    const rateLimited =
      error instanceof Error && error.message.startsWith('Recibimos varios intentos.');
    return Response.json(
      {
        ok: false,
        error: rateLimited
          ? 'Recibimos varios intentos. Esperá unos minutos y probá de nuevo.'
          : 'No se pudo validar el acceso. Probá de nuevo.',
      },
      { status: rateLimited ? 429 : 503 },
    );
  }

  try {
    const form = await request.formData();
    const emailValue = form.get('email');
    const passwordValue = form.get('password');
    const returnToValue = form.get('returnTo');
    const email = typeof emailValue === 'string' ? emailValue : '';
    const password = typeof passwordValue === 'string' ? passwordValue : '';
    const returnTo = safeAdminReturnTo(
      typeof returnToValue === 'string' ? returnToValue : '/admin',
    );

    if (!(await verifyAdminCredentials(email, password))) {
      await wait(350);
      return Response.json({ ok: false, error: GENERIC_ERROR }, { status: 401 });
    }

    const token = await createAdminSessionToken();
    const response = Response.json({ ok: true, redirectTo: returnTo });
    response.headers.set('set-cookie', adminSessionCookie(token, new URL(request.url).protocol === 'https:'));
    response.headers.set('cache-control', 'no-store');
    return response;
  } catch (error) {
    const misconfigured = error instanceof Error && error.message.includes('no está configurado');
    return Response.json(
      {
        ok: false,
        error: misconfigured ? 'El acceso administrativo todavía no está configurado.' : GENERIC_ERROR,
      },
      { status: misconfigured ? 503 : 401 },
    );
  }
}
