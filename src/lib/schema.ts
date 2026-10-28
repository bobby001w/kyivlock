// Генератори JSON-LD (Schema.org). Дані NAP беруться лише з BUSINESS — однакові на всіх сторінках.
import { BUSINESS, geo, filled, TEAM } from '../data/business';
import { PRICE_GROUPS, fmt } from '../data/prices';
import { SERVICES, type QA } from '../data/services';
import { IGN_HUB, IGN_PAGES } from '../data/ignition';
import { DISTRICTS } from '../data/kyiv';
import { SUBURBS, CITIES, RAIONS } from '../data/oblast';
import { REVIEWS } from '../data/reviews';
import { strip } from './seo';
import { t, lang } from '../i18n/ctx';

const SITE = (import.meta.env.SITE as string).replace(/\/$/, '');
export const abs = (p: string) => SITE + p;
export const BIZ_ID = abs('/#business');
export const ORG_ID = abs('/#organization');

const KYIV = () => t('Київ', 'Киев');
const OBL = () => t('Київська область', 'Киевская область');
const areaServed = () => [
  { '@type': 'City', name: KYIV(), sameAs: t('https://uk.wikipedia.org/wiki/Київ', 'https://ru.wikipedia.org/wiki/Киев') },
  ...DISTRICTS.map((d) => ({ '@type': 'AdministrativeArea', name: `${d.name}, ${KYIV()}` })),
  { '@type': 'AdministrativeArea', name: OBL() },
  ...RAIONS.map((r) => ({ '@type': 'AdministrativeArea', name: `${r.name}, ${OBL()}` })),
  ...[...SUBURBS, ...CITIES].map((c) => ({ '@type': 'City', name: c.name })),
];

const address = () => ({
  '@type': 'PostalAddress', streetAddress: BUSINESS.address || undefined, addressLocality: KYIV(),
  addressRegion: KYIV(), postalCode: BUSINESS.postalCode || undefined, addressCountry: 'UA',
});

const catalog = () => ({
  '@type': 'OfferCatalog', name: t('Послуги KyivLock', 'Услуги KyivLock'),
  itemListElement: [
    ...SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: abs(s.path) } })),
    { '@type': 'OfferCatalog', name: IGN_HUB.name, itemListElement: IGN_PAGES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: abs(s.path) } })) },
  ],
});

export function localBusiness() {
  const r = BUSINESS.rating;
  return {
    '@context': 'https://schema.org',
    '@type': ['Locksmith', 'LocalBusiness'],
    '@id': BIZ_ID,
    name: BUSINESS.brand,
    legalName: filled(BUSINESS.legalName) ? BUSINESS.legalName : undefined,
    url: abs('/'),
    logo: abs('/icon-512.png'),
    image: abs('/images/og-kyivlock.jpg'),
    telephone: '+38' + BUSINESS.phone.replace(/\D/g, ''),
    email: BUSINESS.email,
    address: address(),
    geo: geo(),
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }],
    priceRange: '₴₴',
    currenciesAccepted: 'UAH',
    paymentAccepted: t('Переказ на картку, безготівковий розрахунок на рахунок ФОП', 'Перевод на карту, безналичный расчёт на счёт ФЛП'),
    areaServed: areaServed(),
    hasOfferCatalog: catalog(),
    sameAs: BUSINESS.sameAs.filter(filled),
    // Рейтинг — лише якщо заповнено реальними даними з Google.
    aggregateRating: r ? { '@type': 'AggregateRating', ratingValue: r.value, reviewCount: r.count, bestRating: 5 } : undefined,
    review: REVIEWS.slice(0, 10).map(review),
    parentOrganization: { '@id': ORG_ID },
  };
}

export function organization() {
  return {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': ORG_ID,
    name: BUSINESS.brand, url: abs('/'), logo: abs('/icon-512.png'),
    contactPoint: [{ '@type': 'ContactPoint', telephone: '+38' + BUSINESS.phone.replace(/\D/g, ''), contactType: 'customer service', areaServed: 'UA', availableLanguage: ['uk', 'ru', 'en'], hoursAvailable: 'Mo-Su 00:00-23:59' }],
    sameAs: BUSINESS.sameAs.filter(filled),
    founder: TEAM[0] && filled(TEAM[0].name) ? { '@type': 'Person', name: TEAM[0].name } : undefined,
  };
}

export const review = (r: (typeof REVIEWS)[number]) => ({
  '@type': 'Review', author: { '@type': 'Person', name: r.author }, datePublished: r.date,
  reviewBody: r.text, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
  itemReviewed: { '@id': BIZ_ID },
});

export function service(o: { name: string; type: string; path: string; description: string; area?: string; priceIds?: string[] }) {
  const rows = PRICE_GROUPS.flatMap((g) => g.rows).filter((r) => o.priceIds?.includes(r.id));
  return {
    '@context': 'https://schema.org', '@type': 'Service', name: o.name, serviceType: o.type, inLanguage: lang(),
    url: abs(o.path), description: strip(o.description), provider: { '@id': BIZ_ID },
    areaServed: o.area ? { '@type': 'Place', name: o.area } : [{ '@type': 'City', name: KYIV() }, { '@type': 'AdministrativeArea', name: OBL() }],
    offers: rows.length ? rows.filter((r) => !r.unit).map((r) => ({
      '@type': 'Offer', name: r.name, priceCurrency: 'UAH', description: fmt(r),
      priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'UAH', minPrice: r.from, maxPrice: r.to ?? undefined },
    })) : undefined,
  };
}

export const faqPage = (items: QA[]) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: strip(i.a) } })),
});

export const breadcrumbs = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.href) })),
});

export const howTo = (name: string, steps: { name: string; text: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'HowTo', name,
  step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
});

export const article = (o: { title: string; description: string; path: string; date: string; updated: string; author: string; image: string }) => ({
  '@context': 'https://schema.org', '@type': 'Article', headline: o.title, description: o.description,
  mainEntityOfPage: abs(o.path), datePublished: o.date, dateModified: o.updated, inLanguage: lang(),
  image: abs(o.image), author: { '@type': 'Person', name: o.author, url: abs('/pro-nas/') },
  publisher: { '@id': ORG_ID },
});

export const person = (t: (typeof TEAM)[number]) => ({
  '@context': 'https://schema.org', '@type': 'Person', name: t.name, jobTitle: t.role,
  description: t.about, worksFor: { '@id': BIZ_ID }, image: abs(`/images/${t.photo}-480.webp`),
});

// Прибирає undefined рекурсивно, щоб JSON-LD був чистим.
export const clean = (o: unknown) => JSON.stringify(o, (_k, v) => (v === undefined || (Array.isArray(v) && v.length === 0) ? undefined : v));
