// Мова сторінки визначається за URL (/ru/... — російська) і діє на весь рендер (див. src/i18n/ctx.ts).
// Для російських сторінок внутрішні посилання автоматично отримують префікс /ru/ — тексти й дані
// можна писати з «українськими» шляхами (/tsiny/), а перелінковка залишається в межах мови.
// Посилання з атрибутом data-keep (перемикач мови) не змінюються.
import { defineMiddleware } from 'astro:middleware';
import { langOf, runIn } from './i18n/ctx';

const SITE = (import.meta.env.SITE as string).replace(/\/$/, '');
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Що не локалізуємо: уже /ru/, статика, службові файли.
const SKIP = '#|ru\\/|ru"|images\\/|fonts\\/|js\\/|_astro\\/|favicon|apple-touch|manifest|icon-|sitemap|robots';
const HREF = new RegExp(`(?<!data-keep )href="\\/(?!${SKIP})`, 'g');
const ABS = new RegExp(`${esc(SITE)}\\/(?!${SKIP})`, 'g');

export const localizeHtml = (html: string) =>
  html
    .replace(HREF, 'href="/ru/')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, (ld) => ld.replace(ABS, `${SITE}/ru/`));

export const onRequest = defineMiddleware(async (ctx, next) => {
  const l = langOf(ctx.url.pathname);
  if (l === 'uk') return runIn('uk', next);
  return runIn('ru', async () => {
    const res = await next();
    if (!(res.headers.get('content-type') ?? '').includes('text/html')) return res;
    const html = localizeHtml(await res.text());
    const headers = new Headers(res.headers);
    headers.delete('content-length');
    return new Response(html, { status: res.status, headers });
  });
});
