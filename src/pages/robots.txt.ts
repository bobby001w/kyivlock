import type { APIRoute } from 'astro';

// Правила з урахуванням base публікації. Увага: пошуковики читають robots.txt лише з кореня домену,
// тож на GitHub Pages (/kyivlock/robots.txt) файл діє тільки після переходу на власний домен.
export const GET: APIRoute = ({ site }) => {
  const P = import.meta.env.BASE_URL.replace(/\/$/, '');
  const base = site!.href.replace(/\/$/, '') + P;
  const body = `User-agent: *
Allow: ${P}/
Disallow: ${P}/admin/
Disallow: ${P}/search/
Disallow: ${P}/api/
Disallow: ${P}/*?*utm_
Disallow: ${P}/*?*gclid=
Disallow: ${P}/*?*fbclid=
Disallow: ${P}/*?*sort=
Disallow: ${P}/*?*filter=

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
