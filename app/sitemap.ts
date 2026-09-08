import type { MetadataRoute } from 'next';
import { getBindings } from '@/db';

export const dynamic = 'force-dynamic';

const origin = 'https://nero-automoviles.dylanvpi1899.chatgpt.site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ['', '/vehiculos', '/vende-tu-auto', '/buscamos-tu-auto', '/contacto'].map((path) => ({
    url: `${origin}${path}`,
    lastModified: now,
    changeFrequency: path === '/vehiculos' ? 'daily' as const : 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
  try {
    const rows = await getBindings().db.prepare("SELECT slug,updated_at FROM vehicles WHERE status IN ('PUBLICADO','RESERVADO')").all<{ slug: string; updated_at: string }>();
    return [...staticPages, ...rows.results.map((row) => ({
      url: `${origin}/vehiculos/${row.slug}`,
      lastModified: new Date(row.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))];
  } catch {
    return staticPages;
  }
}
