import { BUSINESS } from '../data/business';
import { price, PRICE_FROM } from '../data/prices';
import type { Place } from '../data/kyiv';
import { fnByLang } from '../i18n/ctx';

// Підстановка токенів у шаблони мета-тегів та текстів
const TOKENS: Record<string, () => string> = {
  PHONE: () => BUSINESS.phone,
  PRICE: () => String(PRICE_FROM),
  CAR: () => String(price('car-open').from),
  SAFE: () => String(price('safe-open').from),
  CYL: () => String(price('cyl-replace').from),
  IGNR: () => String(price('ign-repair').from),
  IGNB: () => String(price('ign-broken').from),
  IGNC: () => String(price('ign-key-chip').from),
  IGNK: () => String(price('ign-contact').from),
};
export const fill = (s: string) => s.replace(/\{([A-Z]+)\}/g, (m, k) => (TOKENS[k] ? TOKENS[k]() : m));

const realLen = (s: string) => s.length;

/** Обирає перший варіант у діапазоні [min,max]; інакше — найближчий, що не перевищує max. */
export function pick(cands: string[], min: number, max: number) {
  const c = cands.map(fill);
  const ok = c.find((s) => realLen(s) >= min && realLen(s) <= max);
  if (ok) return ok;
  const under = c.filter((s) => realLen(s) <= max).sort((a, b) => realLen(b) - realLen(a));
  return under[0] ?? c.sort((a, b) => realLen(a) - realLen(b))[0];
}
export const pickTitle = (c: string[]) => pick(c, 50, 60);
export const pickDesc = (c: string[]) => pick(c, 140, 160);

// Детермінований вибір варіанта тексту за slug — щоб шаблонні блоки на різних сторінках відрізнялися.
export function hash(s: string) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
export const vary = <T,>(seed: string, arr: T[]) => arr[hash(seed) % arr.length];

const etaFrom = (eta: string) => (eta.match(/\d+/)?.[0] ?? '15');

function placeTitleUk(p: Place) {
  const n = etaFrom(p.eta);
  return pickTitle([
    `Аварійне відкриття замків ${p.loc} — від ${n} хв | KyivLock`,
    `Відкриття замків ${p.loc} — виїзд від ${n} хв | KyivLock`,
    `Відкриття замків ${p.loc} 24/7 — від ${n} хв | KyivLock`,
    `Відкрити двері ${p.loc} — 24/7, від ${n} хв | KyivLock`,
    `Відкриття замків ${p.loc} цілодобово | KyivLock`,
    `Відкриття замків ${p.loc} | KyivLock`,
    `Відкриття замків: ${p.short} | KyivLock`,
  ]);
}
function placeDescUk(p: Place) {
  const extra = p.streets[0] ? ` (${p.streets.slice(0, 2).join(', ')})` : '';
  return pickDesc([
    `Відкриємо двері, авто, сейф ${p.loc}${extra} без пошкоджень. Цілодобово, виїзд ${p.eta}, від ${PRICE_FROM} грн. Дзвоніть ${BUSINESS.phone}.`,
    `Відкриємо двері, авто, сейф ${p.loc} без пошкоджень. Цілодобово, виїзд ${p.eta}, ціна від ${PRICE_FROM} грн, гарантія. Дзвоніть ${BUSINESS.phone}.`,
    `Відкриття дверей, авто і сейфів ${p.loc} без пошкоджень, 24/7. Виїзд ${p.eta}, від ${PRICE_FROM} грн, гарантія. Тел. ${BUSINESS.phone}.`,
    `Відкриття замків ${p.loc} 24/7: двері, авто, сейфи. Виїзд ${p.eta}, від ${PRICE_FROM} грн. Тел. ${BUSINESS.phone}.`,
    `Відкриття замків ${p.loc} 24/7. Виїзд ${p.eta}. Тел. ${BUSINESS.phone}.`,
  ]);
}
function comboIgnTitleUk(p: Place) {
  return pickTitle([
    `Ремонт замка запалювання ${p.loc} — ключі | KyivLock`,
    `Замок запалювання ${p.loc}: ремонт, ключі | KyivLock`,
    `Ключі запалювання ${p.loc} | KyivLock`,
    `Ремонт замка запалювання ${p.loc} | KyivLock`,
  ]);
}
function comboIgnDescUk(p: Place) {
  return pickDesc([
    `Ремонт і заміна замка запалювання ${p.loc}, ключі з чіпом і смарт-ключі. Виїзд ${p.eta}, ремонт від ${price('ign-repair').from} грн. Тел. ${BUSINESS.phone}.`,
    `Ремонт замка запалювання ${p.loc}, ключі з чіпом, смарт-ключі. Виїзд ${p.eta}. Тел. ${BUSINESS.phone}.`,
    `Замок запалювання ${p.loc}: ремонт, ключі. Тел. ${BUSINESS.phone}.`,
  ]);
}
function comboDoorTitleUk(p: Place) {
  return pickTitle([
    `Відкрити двері ${p.loc} без пошкоджень — 24/7 | KyivLock`,
    `Відкриття дверей ${p.loc} — 24/7, без пошкоджень | KyivLock`,
    `Відкриття дверей ${p.loc} цілодобово | KyivLock`,
    `Відкриття дверей ${p.loc} | KyivLock`,
  ]);
}
function comboDoorDescUk(p: Place) {
  return pickDesc([
    `Відкриття вхідних, броньованих і тамбурних дверей ${p.loc} без пошкоджень. Виїзд ${p.eta}, від ${PRICE_FROM} грн. Тел. ${BUSINESS.phone}.`,
    `Відкриття дверей ${p.loc} без пошкоджень, 24/7. Виїзд ${p.eta}, від ${PRICE_FROM} грн. Тел. ${BUSINESS.phone}.`,
    `Відкриття дверей ${p.loc}, 24/7. Тел. ${BUSINESS.phone}.`,
  ]);
}

// Російські шаблони: формулювання під російськомовні запити («вскрытие замков», «открыть дверь»).
function placeTitleRu(p: Place) {
  const n = etaFrom(p.eta);
  return pickTitle([
    `Вскрытие замков ${p.loc} — выезд от ${n} мин | KyivLock`,
    `Аварийное вскрытие замков ${p.loc} — 24/7 | KyivLock`,
    `Вскрытие замков ${p.loc} 24/7 — от ${n} мин | KyivLock`,
    `Открыть дверь ${p.loc} — 24/7, от ${n} мин | KyivLock`,
    `Вскрытие замков ${p.loc} круглосуточно | KyivLock`,
    `Вскрытие замков ${p.loc} | KyivLock`,
    `Вскрытие замков: ${p.short} | KyivLock`,
  ]);
}
function placeDescRu(p: Place) {
  const extra = p.streets[0] ? ` (${p.streets.slice(0, 2).join(', ')})` : '';
  return pickDesc([
    `Откроем дверь, авто, сейф ${p.loc}${extra} без повреждений. Круглосуточно, выезд ${p.eta}, от ${PRICE_FROM} грн. Звоните ${BUSINESS.phone}.`,
    `Откроем дверь, авто, сейф ${p.loc} без повреждений. Круглосуточно, выезд ${p.eta}, цена от ${PRICE_FROM} грн, гарантия. Звоните ${BUSINESS.phone}.`,
    `Вскрытие дверей, авто и сейфов ${p.loc} без повреждений, 24/7. Выезд ${p.eta}, от ${PRICE_FROM} грн, гарантия. Тел. ${BUSINESS.phone}.`,
    `Вскрытие замков ${p.loc} 24/7: двери, авто, сейфы. Выезд ${p.eta}, от ${PRICE_FROM} грн. Тел. ${BUSINESS.phone}.`,
    `Вскрытие замков ${p.loc} 24/7. Выезд ${p.eta}. Тел. ${BUSINESS.phone}.`,
  ]);
}
function comboIgnTitleRu(p: Place) {
  return pickTitle([
    `Ремонт замка зажигания ${p.loc} — ключи | KyivLock`,
    `Замок зажигания ${p.loc}: ремонт, ключи | KyivLock`,
    `Ключи зажигания ${p.loc} | KyivLock`,
    `Ремонт замка зажигания ${p.loc} | KyivLock`,
  ]);
}
function comboIgnDescRu(p: Place) {
  return pickDesc([
    `Ремонт и замена замка зажигания ${p.loc}, ключи с чипом и смарт-ключи. Выезд ${p.eta}, ремонт от ${price('ign-repair').from} грн. Тел. ${BUSINESS.phone}.`,
    `Ремонт замка зажигания ${p.loc}, ключи с чипом, смарт-ключи. Выезд ${p.eta}. Тел. ${BUSINESS.phone}.`,
    `Замок зажигания ${p.loc}: ремонт, ключи. Тел. ${BUSINESS.phone}.`,
  ]);
}
function comboDoorTitleRu(p: Place) {
  return pickTitle([
    `Открыть дверь ${p.loc} без повреждений — 24/7 | KyivLock`,
    `Вскрытие дверей ${p.loc} — 24/7, без повреждений | KyivLock`,
    `Вскрытие дверей ${p.loc} круглосуточно | KyivLock`,
    `Вскрытие дверей ${p.loc} | KyivLock`,
  ]);
}
function comboDoorDescRu(p: Place) {
  return pickDesc([
    `Вскрытие входных, бронированных и тамбурных дверей ${p.loc} без повреждений. Выезд ${p.eta}, от ${PRICE_FROM} грн. Тел. ${BUSINESS.phone}.`,
    `Вскрытие дверей ${p.loc} без повреждений, 24/7. Выезд ${p.eta}, от ${PRICE_FROM} грн. Тел. ${BUSINESS.phone}.`,
    `Вскрытие дверей ${p.loc}, 24/7. Тел. ${BUSINESS.phone}.`,
  ]);
}

export const placeTitle = fnByLang(placeTitleUk, placeTitleRu);
export const placeDesc = fnByLang(placeDescUk, placeDescRu);
export const comboIgnTitle = fnByLang(comboIgnTitleUk, comboIgnTitleRu);
export const comboIgnDesc = fnByLang(comboIgnDescUk, comboIgnDescRu);
export const comboDoorTitle = fnByLang(comboDoorTitleUk, comboDoorTitleRu);
export const comboDoorDesc = fnByLang(comboDoorDescUk, comboDoorDescRu);

/** Прибирає HTML-теги — для JSON-LD і підрахунку слів. */
export const strip = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
