// Реєстр усіх сторінок сайту: URL-и геосторінок, комбінацій, послуг. Використовується
// сторінками, меню/футером, перелінковкою та sitemap — тож нова локація з'являється всюди автоматично.
// Списки рахуються для обох мов і віддаються мовою поточної сторінки (byLang).
import * as kyivUk from '../data/uk/kyiv';
import * as kyivRu from '../data/ru/kyiv';
import * as oblUk from '../data/uk/oblast';
import * as oblRu from '../data/ru/oblast';
import type { Place } from '../data/kyiv';
import { SERVICES, IGN } from '../data/services';
import { IGN_PAGES } from '../data/ignition';
import { BRANDS } from '../data/brands';
import { byLang, fnByLang } from '../i18n/ctx';

export const SITE_UPDATED = '2026-10-27';

const build = (k: typeof kyivUk, o: typeof oblUk) => {
  const KYIV_PLACES = [...k.DISTRICTS, ...k.MICROS];
  const OBLAST_PLACES = [...o.SUBURBS, ...o.GROUPS, ...o.RAIONS, ...o.CITIES];
  const ALL_PLACES = [...KYIV_PLACES, ...OBLAST_PLACES];
  const bySlug = new Map(ALL_PLACES.map((p) => [p.slug, p]));
  const place = (slug: string) => bySlug.get(slug);
  // Топ-міста області для меню й футера
  const TOP_CITIES = ['brovary', 'boryspil', 'irpin', 'bucha', 'vyshneve', 'boiarka', 'vyshhorod', 'hostomel', 'sofiivska-borshchahivka', 'vasylkiv', 'obukhiv', 'bila-tserkva'].map((s) => place(s)!);
  return {
    KYIV_PLACES, OBLAST_PLACES, ALL_PLACES, place, TOP_CITIES,
    ignitionCombos: ALL_PLACES.filter((p) => p.ignition),
    doorCombos: k.DISTRICTS.filter((p) => p.doors),
  };
};
const UK = build(kyivUk, oblUk);
const RU = build(kyivRu, oblRu);

export const KYIV_PLACES = byLang(UK.KYIV_PLACES, RU.KYIV_PLACES);
export const OBLAST_PLACES = byLang(UK.OBLAST_PLACES, RU.OBLAST_PLACES);
export const ALL_PLACES = byLang(UK.ALL_PLACES, RU.ALL_PLACES);
export const place = fnByLang(UK.place, RU.place);
export const TOP_CITIES = byLang(UK.TOP_CITIES, RU.TOP_CITIES);
export const ignitionCombos = byLang(UK.ignitionCombos, RU.ignitionCombos);
export const doorCombos = byLang(UK.doorCombos, RU.doorCombos);

export const placeUrl = (p: Place) =>
  p.kind === 'district' || p.kind === 'micro' ? `/kyiv/${p.slug}/` : `/kyivska-oblast/${p.slug}/`;

// Комбіновані сторінки «послуга + локація» (розділ 2.2 і 5А.4)
export const IGN_COMBO = 'kliuchi-zapaliuvannia';
export const DOOR_COMBO = 'vidkryttia-dverey';
export const comboUrl = (p: Place, kind: string) => `${placeUrl(p)}${kind}/`;

export const children = (p: Place) => ALL_PLACES.filter((x) => x.parent === p.slug);
export const neighbors = (p: Place) => p.neighbors.map(place).filter(Boolean) as Place[];

export const brandUrl = (slug: string) => `${IGN}marky/${slug}/`;

export interface PageEntry { path: string; section: 'pages' | 'services' | 'kyiv' | 'oblast' | 'blog'; lastmod: string; priority?: number }

export function staticEntries(): PageEntry[] {
  const L = SITE_UPDATED;
  const pages: PageEntry[] = [
    { path: '/', section: 'pages', lastmod: L, priority: 1 },
    ...['/tsiny/', '/pro-nas/', '/vidhuky/', '/faq/', '/kontakty/', '/blog/', '/oplata-i-vyizd/', '/harantiia/', '/polityka-konfidentsiinosti/', '/umovy-vykorystannia/', '/publichna-oferta/']
      .map((path) => ({ path, section: 'pages' as const, lastmod: L })),
    { path: '/poslugy/', section: 'services', lastmod: L, priority: 0.9 },
    ...SERVICES.map((s) => ({ path: s.path, section: 'services' as const, lastmod: L, priority: 0.9 })),
    { path: IGN, section: 'services', lastmod: L, priority: 0.9 },
    ...IGN_PAGES.map((s) => ({ path: s.path, section: 'services' as const, lastmod: L, priority: 0.8 })),
    { path: IGN + 'marky/', section: 'services', lastmod: L },
    ...BRANDS.map((b) => ({ path: brandUrl(b.slug), section: 'services' as const, lastmod: L, priority: 0.6 })),
    { path: '/kyiv/', section: 'kyiv', lastmod: L, priority: 0.9 },
    ...KYIV_PLACES.map((p) => ({ path: placeUrl(p), section: 'kyiv' as const, lastmod: L, priority: p.kind === 'district' ? 0.8 : 0.6 })),
    ...doorCombos.map((p) => ({ path: comboUrl(p, DOOR_COMBO), section: 'kyiv' as const, lastmod: L, priority: 0.7 })),
    { path: '/kyivska-oblast/', section: 'oblast', lastmod: L, priority: 0.8 },
    ...OBLAST_PLACES.map((p) => ({ path: placeUrl(p), section: 'oblast' as const, lastmod: L, priority: 0.6 })),
  ];
  for (const p of ignitionCombos)
    pages.push({ path: comboUrl(p, IGN_COMBO), section: p.kind === 'district' ? 'kyiv' : 'oblast', lastmod: L, priority: 0.7 });
  return pages;
}
