// Автоматична SEO-перевірка зібраного сайту (dist/). Запускається після кожної збірки.
// Помилки (exit 1): дублі title/description/H1, ≠1 H1, немає canonical, биті внутрішні посилання,
// img без alt, невалідний JSON-LD, сторінки поза sitemap. Попередження: довжина title/description,
// < 3 вхідних посилань, мало тексту на геосторінках.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); });
walk(DIST);

const toPath = (f) => '/' + f.slice(DIST.length + 1).replace(/\\/g, '/').replace(/index\.html$/, '');
const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const realLen = (s) => s.replace('{{PHONE_MAIN}}', '+380 67 000 00 00').length;
const errors = [], warns = [];
const pages = new Map();
const inbound = new Map();

for (const f of files) {
  const path = toPath(f);
  if (path.endsWith('/404.html')) continue;
  const html = readFileSync(f, 'utf8');
  const get = (re) => decode(html.match(re)?.[1] ?? '');
  const p = {
    path, html,
    title: get(/<title>([^<]*)<\/title>/),
    desc: get(/<meta name="description" content="([^"]*)"/),
    canonical: get(/<link rel="canonical" href="([^"]*)"/),
    noindex: /<meta name="robots" content="noindex/.test(html),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, '').trim())),
    lang: get(/<html lang="([^"]*)"/),
    alt: Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="https?:\/\/[^/]+(\/[^"]*)"/g)].map((m) => [m[1], m[2]])),
  };
  pages.set(path, p);
  const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? '';
  p.words = main.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter((w) => /[а-яіїєґa-z]/i.test(w)).length;
  const links = new Set([...html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]));
  p.links = links;
  for (const l of links) { if (!inbound.has(l)) inbound.set(l, new Set()); inbound.get(l).add(path); }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]+"/.test(m[0])) errors.push(`${path}: img без alt`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { errors.push(`${path}: невалідний JSON-LD`); } }
}

const exists = (l) => {
  if (l.startsWith('/api/')) return true;
  const base = join(DIST, l);
  return existsSync(base) && (statSync(base).isFile() || existsSync(join(base, 'index.html')));
};

const dup = (key, label) => {
  const m = new Map();
  for (const p of pages.values()) if (!p.noindex) { const v = key(p); if (v) m.set(v, [...(m.get(v) ?? []), p.path]); }
  for (const [v, ps] of m) if (ps.length > 1) errors.push(`Дубль ${label}: "${v}" → ${ps.join(', ')}`);
};
dup((p) => p.title, 'title'); dup((p) => p.desc, 'description'); dup((p) => p.h1[0], 'H1');

const sitemapUrls = new Set();
for (const f of readdirSync(DIST).filter((f) => /^sitemap-.*\.xml$/.test(f)))
  for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)) sitemapUrls.add(m[1]);

let geoMin = Infinity, geoMinPath = '';
for (const p of pages.values()) {
  if (p.h1.length !== 1) errors.push(`${p.path}: H1 = ${p.h1.length}`);
  if (!p.canonical.endsWith(p.path)) errors.push(`${p.path}: canonical ${p.canonical}`);
  for (const l of p.links) if (!exists(l)) errors.push(`${p.path}: бите посилання ${l}`);
  if (p.noindex) continue;
  if (!sitemapUrls.has(p.path)) errors.push(`${p.path}: немає в sitemap`);
  const tl = realLen(p.title), dl = realLen(p.desc);
  if (tl < 45 || tl > 65) warns.push(`${p.path}: title ${tl} симв.`);
  if (dl < 120 || dl > 165) warns.push(`${p.path}: description ${dl} симв.`);
  const inb = (inbound.get(p.path) ?? new Set()); inb.delete(p.path);
  if (inb.size < 3) warns.push(`${p.path}: вхідних посилань ${inb.size}`);
  // Мовні версії: lang відповідає URL, hreflang-пари взаємні й ведуть на існуючі сторінки.
  const expLang = p.path.startsWith('/ru/') ? 'ru' : 'uk';
  if (p.lang !== expLang) errors.push(`${p.path}: <html lang="${p.lang}">, очікується ${expLang}`);
  for (const l of ['uk', 'ru', 'x-default']) if (!p.alt[l]) errors.push(`${p.path}: немає hreflang ${l}`);
  if (p.alt[expLang] && p.alt[expLang] !== p.path) errors.push(`${p.path}: hreflang ${expLang} не самореферентний`);
  for (const l of ['uk', 'ru']) { const o = p.alt[l] && pages.get(p.alt[l]); if (p.alt[l] && !o) errors.push(`${p.path}: hreflang ${l} → ${p.alt[l]} не існує`); else if (o && o.alt[expLang] !== p.path) errors.push(`${p.path}: hreflang ${l} не взаємний`); }
  if (/^(\/ru)?\/(kyiv|kyivska-oblast)\/[^/]+\/$/.test(p.path)) { if (p.words < geoMin) { geoMin = p.words; geoMinPath = p.path; } if (p.words < 500) warns.push(`${p.path}: ${p.words} слів`); }
}
for (const u of sitemapUrls) if (!pages.has(u)) errors.push(`sitemap: ${u} не існує`);

const words = [...pages.values()].filter((p) => !p.noindex).map((p) => p.words);
console.log(`\nSEO-check: ${pages.size} сторінок, у sitemap ${sitemapUrls.size}. Слів на сторінці: мін ${Math.min(...words)}, медіана ${words.sort((a, b) => a - b)[words.length >> 1]}. Мін. на геосторінці: ${geoMin} (${geoMinPath}).`);
warns.sort((a, b) => Number(a.endsWith('слів')) - Number(b.endsWith('слів')));
if (warns.length) console.log(`Попередження (${warns.length}):\n  ` + warns.slice(0, process.env.ALL ? 999 : 40).join('\n  ') + (warns.length > 40 ? `\n  …ще ${warns.length - 40}` : ''));
if (errors.length) { console.log(`ПОМИЛКИ (${errors.length}):\n  ` + errors.slice(0, 60).join('\n  ')); process.exit(1); }
console.log('Помилок немає ✓');
