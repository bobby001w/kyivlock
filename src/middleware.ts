// Мова сторінки визначається за URL (/ru/... — російська) і діє на весь рендер (див. src/i18n/ctx.ts).
// Для російських сторінок внутрішні посилання автоматично отримують префікс /ru/ — тексти й дані
// можна писати з «українськими» шляхами (/tsiny/), а перелінковка залишається в межах мови.
// Посилання з атрибутом data-keep (перемикач мови) не змінюються.
// Далі до всіх кореневих шляхів (href/src/srcset/url()) додається base публікації, напр. /kyivlock.
import { defineMiddleware } from 'astro:middleware';
import { langOf, runIn } from './i18n/ctx';

const BASE = (import.meta.env.BASE_URL as string).replace(/\/$/, '');
const SITE = (import.meta.env.SITE as string).replace(/\/$/, '') + BASE;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Що не локалізуємо: уже /ru/, статика, службові файли.
const SKIP = '#|ru\\/|ru"|images\\/|fonts\\/|js\\/|_astro\\/|favicon|apple-touch|manifest|icon-|sitemap|robots';
const HREF = new RegExp(`(?<!data-keep )href="\\/(?!${SKIP})`, 'g');
const ABS = new RegExp(`${esc(SITE)}\\/(?!${SKIP})`, 'g');

export const localizeHtml = (html: string) =>
  html
    .replace(HREF, 'href="/ru/')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, (ld) => ld.replace(ABS, `${SITE}/ru/`));

// Кореневий шлях, який ще не має base і не є протокол-відносним (//cdn…)
const ROOT = BASE ? `\\/(?!\\/|${esc(BASE.slice(1))}\\/)` : '';
export const withBase = (html: string) =>
  !BASE ? html : html
    .replace(new RegExp(`\\b(href|src|action)="${ROOT}`, 'g'), `$1="${BASE}/`)
    .replace(/\bsrcset="([^"]*)"/g, (_, v: string) => `srcset="${v.replace(new RegExp(`(^|,\\s*)${ROOT}`, 'g'), `$1${BASE}/`)}"`)
    .replace(new RegExp(`url\\((['"]?)${ROOT}`, 'g'), `url($1${BASE}/`);

export const onRequest = defineMiddleware(async (ctx, next) => {
  const l = langOf(ctx.url.pathname);
  if (l === 'uk' && !BASE) return runIn('uk', next);
  return runIn(l, async () => {
    const res = await next();
    if (!(res.headers.get('content-type') ?? '').includes('text/html')) return res;
    const raw = await res.text();
    const html = withBase(l === 'ru' ? localizeHtml(raw) : raw);
    const headers = new Headers(res.headers);
    headers.delete('content-length');
    return new Response(html, { status: res.status, headers });
  });
});
