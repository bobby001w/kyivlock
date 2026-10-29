// Орієнтовні ціни, грн. ЗАМІНІТЬ на ваші актуальні тарифи та оновіть дату.
// Таблиці на /tsiny/, сторінках послуг і JSON-LD (offers) беруть дані звідси.
// Рівень цін вирівняно за київськими конкурентами (keysos, openme, key.kiev.ua, smartkey) — жовтень 2026.

export const PRICES_UPDATED = '2026-10-27';
export const PRICES_UPDATED_HUMAN = '27 жовтня 2026';

export interface PriceRow { id: string; name: string; from: number; to?: number; unit?: string; note?: string; label?: string }
export interface PriceGroup { id: string; title: string; service?: string; rows: PriceRow[] }

export const PRICE_GROUPS: PriceGroup[] = [
  {
    id: 'common', title: 'Виїзд і загальні умови',
    rows: [
      { id: 'call-kyiv', name: 'Виклик майстра по Києву', from: 1000, label: '1000 грн' },
      { id: 'call-oblast', name: 'Виклик майстра по Київській області', from: 1500, label: '1500 грн', note: 'передмістя, міста й села області' },
      { id: 'night', name: 'Робота вночі, у вихідні та свята', from: 0, label: 'без доплат', note: 'ціна однакова цілодобово' },
    ],
  },
  {
    id: 'doors', title: 'Відкриття дверей і замків', service: 'vidkryttia-dverey',
    rows: [
      { id: 'door-simple', name: 'Відкриття дверей без пошкоджень (захлопнулися, простий циліндр)', from: 500, to: 900 },
      { id: 'door-complex', name: 'Відкриття сувальдного або циліндра підвищеної секретності', from: 800, to: 1800 },
      { id: 'door-armored', name: 'Відкриття броньованих дверей (Mul-T-Lock, Cisa, Abloy, Securemme)', from: 1200, to: 2500 },
      { id: 'door-destructive', name: 'Відкриття з висвердлюванням (коли неруйнівне неможливе) + нова личинка', from: 800, to: 1600, note: 'вартість нової личинки — окремо' },
      { id: 'door-tambour', name: 'Відкриття тамбурних дверей / дверей на поверсі', from: 400, to: 800 },
      { id: 'garage', name: 'Відкриття гаража, хвіртки, навісного замка', from: 600, to: 1200 },
      { id: 'door-child', name: 'Дитина / літня людина зачинилась — пріоритетний виїзд', from: 500, note: 'виїзд позачергово' },
      { id: 'office', name: 'Відкриття офісу, магазину, ролет, скляних дверей', from: 900, to: 2500 },
    ],
  },
  {
    id: 'auto', title: 'Відкриття автомобілів', service: 'vidkryttia-avto',
    rows: [
      { id: 'car-open', name: 'Відкриття легкового авто без пошкоджень', from: 600, to: 1200 },
      { id: 'car-premium', name: 'Відкриття авто преміум-класу / з smart-доступом', from: 1200, to: 2000 },
      { id: 'car-trunk', name: 'Відкриття багажника', from: 600, to: 1200 },
      { id: 'car-truck', name: 'Відкриття вантажного авто, мікроавтобуса', from: 1000, to: 1800 },
    ],
  },
  {
    id: 'safes', title: 'Сейфи', service: 'vidkryttia-seyfiv',
    rows: [
      { id: 'safe-open', name: 'Відкриття побутового сейфа (ключовий / кодовий)', from: 1000, to: 3500 },
      { id: 'safe-electronic', name: 'Відкриття сейфа з електронним замком', from: 1500, to: 4000 },
      { id: 'safe-repair', name: 'Ремонт / заміна замка сейфа, перекодування', from: 1000, to: 3000 },
    ],
  },
  {
    id: 'locks', title: 'Заміна, ремонт і встановлення замків', service: 'zamina-zamkiv',
    rows: [
      { id: 'cyl-replace', name: 'Заміна серцевини (личинки) замка', from: 900, to: 1500, note: 'разом з базовою личинкою; личинки підвищеного класу — дорожче' },
      { id: 'lock-replace', name: 'Заміна врізного замка (той самий типорозмір)', from: 800, to: 1500 },
      { id: 'lock-repair', name: 'Ремонт замка (заклинив, западає ригель)', from: 400, to: 1000 },
      { id: 'lock-install', name: 'Врізання / встановлення нового замка', from: 900, to: 2000 },
      { id: 'lock-recode', name: 'Перекодування сувальдного замка', from: 600, to: 1000 },
      { id: 'lock-smart', name: 'Встановлення електронного / смарт-замка', from: 1200, to: 2500 },
      { id: 'key-copy', name: 'Виготовлення копії ключа (квартирний)', from: 100, to: 450 },
    ],
  },
  {
    id: 'ignition', title: 'Ключі запалювання та замок запалювання', service: 'kliuchi-zapaliuvannia',
    rows: [
      { id: 'ign-diag', name: 'Діагностика замка запалювання / імобілайзера', from: 300, note: 'безкоштовно при замовленні ремонту' },
      { id: 'ign-repair', name: 'Ремонт личинки замка запалювання', from: 2000, to: 3500 },
      { id: 'ign-cyl', name: 'Заміна личинки запалювання з кодуванням під ваш ключ', from: 2000, to: 4000 },
      { id: 'ign-lock', name: 'Заміна замка запалювання в зборі', from: 2500, to: 5000, note: 'залежить від вартості деталі' },
      { id: 'ign-contact', name: 'Ремонт / заміна контактної групи', from: 700, to: 1500 },
      { id: 'ign-broken', name: 'Витяг зламаного ключа з замка запалювання', from: 600, to: 1200 },
      { id: 'ign-key-mech', name: 'Виготовлення механічного ключа запалювання (за зразком)', from: 500, to: 900 },
      { id: 'ign-key-by-lock', name: 'Виготовлення ключа по замку запалювання (без оригіналу)', from: 1500, to: 3000 },
      { id: 'ign-key-chip', name: 'Ключ з чіпом (транспондер): виготовлення + прописування', from: 1200, to: 3500 },
      { id: 'ign-key-flip', name: 'Викидний ключ: заміна корпусу / виготовлення', from: 800, to: 2800 },
      { id: 'ign-key-repair', name: 'Ремонт ключа: кнопки, плата, батарейка, лезо', from: 400, to: 1200 },
      { id: 'ign-immo', name: 'Прописування ключа в імобілайзер / видалення втраченого ключа', from: 1200, to: 3500 },
      { id: 'ign-key-smart', name: 'Смарт-ключ (Keyless, Start/Stop): виготовлення + програмування', from: 3500, to: 12000 },
      { id: 'ign-all-lost', name: 'Втрачені всі ключі (All keys lost)', from: 3000, to: 15000, note: 'потрібна діагностика; для частини авто — програмування блоків' },
      { id: 'ign-steering', name: 'Ремонт / розблокування замка керма (ELV/ESCL)', from: 1200, to: 4500 },
      { id: 'car-lock-repair', name: 'Ремонт личинки дверей або багажника авто', from: 800, to: 2000 },
      { id: 'car-lock-recode', name: 'Заміна секретності: усі замки авто під один ключ', from: 2000, to: 4500, note: 'запалювання + двері + багажник' },
    ],
  },
];

export const ALL_ROWS = PRICE_GROUPS.flatMap((g) => g.rows);
export const price = (id: string) => ALL_ROWS.find((r) => r.id === id)!;
export const PRICE_FROM = price('door-simple').from; // «від ... грн» у мета-описах
export const fmt = (r: PriceRow) =>
  r.label ? r.label :
  r.from === 0 && !r.to ? 'безкоштовно' :
  r.unit ? `від ${r.from} ${r.unit}` :
  `від ${r.from} грн`; // лише нижня межа: «від 600 грн»
