// Мова поточної сторінки. Middleware запускає рендер кожної сторінки всередині runIn(lang),
// тож будь-який модуль може дізнатися мову через lang() — без прокидання пропсів.
// Українська — у корені сайту, російська — під /ru/ з тими самими слагами.
import { AsyncLocalStorage } from 'node:async_hooks';

export type Lang = 'uk' | 'ru';
export const LANGS: Lang[] = ['uk', 'ru'];

const als = new AsyncLocalStorage<Lang>();
export const runIn = <T>(l: Lang, fn: () => T) => als.run(l, fn);
export const lang = (): Lang => als.getStore() ?? 'uk';
export const isRu = () => lang() === 'ru';

// Префікс публікації (base з astro.config, напр. /kyivlock). У коді всі шляхи — без нього;
// тут він відкидається з URL запиту, а в готовий HTML його додає middleware.
const DEPLOY = ((import.meta.env.BASE_URL as string | undefined) ?? '/').replace(/\/$/, '');
const unbase = (p: string) => (DEPLOY && (p === DEPLOY || p.startsWith(DEPLOY + '/')) ? p.slice(DEPLOY.length) || '/' : p);

export const langOf = (path: string): Lang => (/^\/ru(\/|$)/.test(unbase(path)) ? 'ru' : 'uk');
/** Шлях без мовного префікса (і без base): /ru/tsiny/ → /tsiny/ */
export const basePath = (path: string) => unbase(path).replace(/^\/ru(?=\/|$)/, '') || '/';
/** Шлях для мови: /tsiny/ → /ru/tsiny/ */
export const localePath = (path: string, l: Lang = lang()) => (l === 'ru' ? '/ru' + basePath(path) : basePath(path));

/** Значення залежно від мови: t('Ціни', 'Цены') */
export const t = <T>(uk: T, ru: T): T => (lang() === 'ru' ? ru : uk);

/** Об'єкт або масив, що віддає українську чи російську версію залежно від мови сторінки. */
export function byLang<T extends object>(uk: T, ru: T): T {
  const cur = () => (lang() === 'ru' ? ru : uk);
  return new Proxy(uk, {
    get: (_t, k) => Reflect.get(cur(), k),
    has: (_t, k) => Reflect.has(cur(), k),
    ownKeys: () => Reflect.ownKeys(cur()),
    getOwnPropertyDescriptor: (_t, k) => Reflect.getOwnPropertyDescriptor(cur(), k),
  });
}

/** Функція, що викликає українську чи російську реалізацію. */
export const fnByLang = <F extends (...a: any[]) => any>(uk: F, ru: F) =>
  ((...a: Parameters<F>) => (lang() === 'ru' ? ru : uk)(...a)) as F;

/** Колекція статей блогу поточної мови. */
export const blogCollection = () => (lang() === 'ru' ? 'blogRu' : 'blog') as 'blog' | 'blogRu';
