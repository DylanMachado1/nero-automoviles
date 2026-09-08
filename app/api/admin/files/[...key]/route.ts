import { getBindings } from '@/db';
import { requireAdmin } from '@/services/admin-auth';

export const runtime = 'edge';

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  try {
    await requireAdmin('/admin');
    const { key } = await params;
    const object = await getBindings().files.get(key.join('/'));
    if (!object) return new Response('No encontrado', { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('cache-control', 'private, max-age=300');
    headers.set('x-content-type-options', 'nosniff');
    return new Response(object.body, { headers });
  } catch {
    return new Response('No autorizado', { status: 401 });
  }
}
