import { getCollection } from 'astro:content';
import { staticEntries, type PageEntry } from './site';
import { localePath, type Lang } from '../i18n/ctx';

export const SECTIONS = ['pages', 'services', 'kyiv', 'oblast', 'blog'] as const;

// Кожен запис — пара мовних версій однієї сторінки (path без префікса /ru/).
interface Entry extends PageEntry { langs: Lang[] }

export async function entries(): Promise<Entry[]> {
  const uk = await getCollection('blog');
  const ru = new Set((await getCollection('blogRu')).map((p) => p.id));
  return [
    ...staticEntries().map((e) => ({ ...e, langs: ['uk', 'ru'] as Lang[] })),
    ...uk.map((p) => ({ path: `/blog/${p.id}/`, section: 'blog' as const, lastmod: p.data.updated, priority: 0.5, langs: (ru.has(p.id) ? ['uk', 'ru'] : ['uk']) as Lang[] })),
  ];
}

// Кожна мовна версія — окремий <url> з повним набором hreflang-альтернатив (вимога Google для sitemap).
export async function sectionXml(section: string, site: URL) {
  const base = site.href.replace(/\/$/, '') + import.meta.env.BASE_URL.replace(/\/$/, '');
  const list = (await entries()).filter((e) => e.section === section);
  const urls = list.flatMap((e) => e.langs.map((l) => {
    const alts = e.langs.length > 1
      ? e.langs.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${base}${localePath(e.path, x)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${base}${e.path}"/>`
      : '';
    return `  <url><loc>${base}${localePath(e.path, l)}</loc><lastmod>${e.lastmod}</lastmod>${e.priority ? `<priority>${e.priority}</priority>` : ''}${alts}</url>`;
  }));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
