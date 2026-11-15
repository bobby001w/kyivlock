// Русские названия позиций прайса. Цифры (from/to) берутся из ../uk/prices.ts —
// цены меняются только там, здесь лишь переводы названий, примечаний и меток.
import * as uk from '../uk/prices';
import type { PriceRow, PriceGroup } from '../uk/prices';

export const PRICES_UPDATED = uk.PRICES_UPDATED;
export const PRICES_UPDATED_HUMAN = '29 октября 2026';

const GROUP_TITLES: Record<string, string> = {
  common: 'Выезд и общие условия',
  doors: 'Вскрытие дверей и замков',
  auto: 'Вскрытие автомобилей',
  safes: 'Сейфы',
  locks: 'Замена, ремонт и установка замков',
  ignition: 'Ключи зажигания и замок зажигания',
};

const ROWS: Record<string, Pick<PriceRow, 'name'> & Partial<Pick<PriceRow, 'note' | 'label'>>> = {
  'call-kyiv': { name: 'Вызов мастера по Киеву', label: '1000 грн' },
  'call-oblast': { name: 'Вызов мастера по Киевской области', label: '1500 грн', note: 'пригород, города и сёла области' },
  night: { name: 'Работа ночью, в выходные и праздники', label: 'без доплат', note: 'цена одинаковая круглосуточно' },

  'door-simple': { name: 'Вскрытие двери без повреждений (захлопнулась, простой цилиндр)' },
  'door-complex': { name: 'Вскрытие сувальдного замка или цилиндра повышенной секретности' },
  'door-armored': { name: 'Вскрытие бронированной двери (Mul-T-Lock, Cisa, Abloy, Securemme)' },
  'door-destructive': { name: 'Вскрытие с высверливанием (когда неразрушающее невозможно) + новая личинка', note: 'стоимость новой личинки — отдельно' },
  'door-tambour': { name: 'Вскрытие тамбурной двери / двери на этаже' },
  garage: { name: 'Вскрытие гаража, калитки, навесного замка' },
  'door-child': { name: 'Ребёнок / пожилой человек закрылся — приоритетный выезд', note: 'выезд вне очереди' },
  office: { name: 'Вскрытие офиса, магазина, роллет, стеклянных дверей' },

  'car-open': { name: 'Вскрытие легкового авто без повреждений' },
  'car-premium': { name: 'Вскрытие авто премиум-класса / со smart-доступом' },
  'car-trunk': { name: 'Вскрытие багажника' },
  'car-truck': { name: 'Вскрытие грузового авто, микроавтобуса' },

  'safe-open': { name: 'Вскрытие бытового сейфа (ключевой / кодовый)' },
  'safe-electronic': { name: 'Вскрытие сейфа с электронным замком' },
  'safe-repair': { name: 'Ремонт / замена замка сейфа, перекодировка' },

  'cyl-replace': { name: 'Замена сердцевины (личинки) замка', note: 'вместе с базовой личинкой; личинки повышенного класса — дороже' },
  'lock-replace': { name: 'Замена врезного замка (тот же типоразмер)' },
  'lock-repair': { name: 'Ремонт замка (заклинил, западает ригель)' },
  'lock-install': { name: 'Врезка / установка нового замка' },
  'lock-recode': { name: 'Перекодировка сувальдного замка' },
  'lock-smart': { name: 'Установка электронного / смарт-замка' },

  'ign-diag': { name: 'Диагностика замка зажигания / иммобилайзера', note: 'бесплатно при заказе ремонта' },
  'ign-repair': { name: 'Ремонт личинки замка зажигания' },
  'ign-cyl': { name: 'Замена личинки зажигания с кодировкой под ваш ключ' },
  'ign-lock': { name: 'Замена замка зажигания в сборе', note: 'зависит от стоимости детали' },
  'ign-contact': { name: 'Ремонт / замена контактной группы' },
  'ign-broken': { name: 'Извлечение сломанного ключа из замка зажигания' },
  'ign-key-mech': { name: 'Изготовление механического ключа зажигания (по образцу)' },
  'ign-key-by-lock': { name: 'Изготовление ключа по замку зажигания (без оригинала)' },
  'ign-key-chip': { name: 'Ключ с чипом (транспондер): изготовление + прописка' },
  'ign-key-flip': { name: 'Выкидной ключ: замена корпуса / изготовление' },
  'ign-key-repair': { name: 'Ремонт ключа: кнопки, плата, батарейка, лезвие' },
  'ign-immo': { name: 'Прописка ключа в иммобилайзер / удаление утерянного ключа' },
  'ign-key-smart': { name: 'Смарт-ключ (Keyless, Start/Stop): изготовление + программирование' },
  'ign-all-lost': { name: 'Утеряны все ключи (All keys lost)', note: 'нужна диагностика; для части авто — программирование блоков' },
  'ign-steering': { name: 'Ремонт / разблокировка замка руля (ELV/ESCL)' },
  'car-lock-repair': { name: 'Ремонт личинки двери или багажника авто' },
  'car-lock-recode': { name: 'Замена секретности: все замки авто под один ключ', note: 'зажигание + двери + багажник' },
};

export const PRICE_GROUPS: PriceGroup[] = uk.PRICE_GROUPS.map((g) => ({
  ...g,
  title: GROUP_TITLES[g.id] ?? g.title,
  rows: g.rows.map((r) => {
    const tr = ROWS[r.id];
    if (!tr) throw new Error(`Немає російського перекладу для позиції прайсу «${r.id}» (src/data/ru/prices.ts)`);
    return { ...r, name: tr.name, note: r.note ? tr.note : undefined, label: r.label ? tr.label : undefined };
  }),
}));

export const ALL_ROWS = PRICE_GROUPS.flatMap((g) => g.rows);
export const price = (id: string) => ALL_ROWS.find((r) => r.id === id)!;
export const PRICE_FROM = uk.PRICE_FROM;
export const fmt = (r: PriceRow) =>
  r.label ? r.label :
  r.from === 0 && !r.to ? 'бесплатно' :
  r.unit ? `от ${r.from} ${r.unit}` :
  `от ${r.from} грн`; // лише нижня межа: «от 600 грн»
