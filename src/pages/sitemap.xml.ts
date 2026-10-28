// Індекс sitemap (/sitemap.xml) — посилається на файли за розділами.
import type { APIRoute } from 'astro';
import { SECTIONS, entries } from '../lib/sitemap';

export const GET: APIRoute = async ({ site }) => {
  const base = site!.href.replace(/\/$/, '');
  const all = await entries();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SECTIONS.map((s) => {
  const last = all.filter((e) => e.section === s).map((e) => e.lastmod).sort().pop();
  return `  <sitemap><loc>${base}/sitemap-${s}.xml</loc>${last ? `<lastmod>${last}</lastmod>` : ''}</sitemap>`;
}).join('\n')}
</sitemapindex>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
