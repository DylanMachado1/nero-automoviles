import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    sitemap: 'https://nero-automoviles.dylanvpi1899.chatgpt.site/sitemap.xml',
  };
}
