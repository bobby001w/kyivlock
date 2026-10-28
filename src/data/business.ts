// ЄДИНЕ місце, де зберігаються дані бізнесу (NAP). Порожні поля ('') на сайті не виводяться —
// заповніть їх, і вони автоматично з'являться в шапці, футері, контактах, юридичних сторінках та JSON-LD.

export const BUSINESS = {
  brand: 'KyivLock',
  legalName: '', // напр. «ФОП Іваненко Іван Іванович»
  edrpou: '', // ЄДРПОУ або РНОКПП ФОП
  phone: '099 375 63 21',
  phone2: '',
  telegram: '', // username без @
  viber: '', // номер у форматі 380670000000
  whatsapp: '', // номер у форматі 380670000000
  email: 'kyivlock2026@gmail.com',
  address: '', // фізична адреса офісу/бази
  workshopAddress: '', // адреса майстерні (ключі запалювання)
  postalCode: '',
  latLng: '', // напр. «50.4501,30.5234»
  workingHours: 'Цілодобово, 24/7', // {{WORKING_HOURS}} — за замовчуванням 24/7
  openingHoursSpec: 'Mo-Su 00:00-23:59',
  googleBusinessUrl: '',
  googleReviewUrl: '', // посилання «Залишити відгук» з Google Business Profile
  gscVerification: '',
  bingVerification: '',
  ga4: '', // G-XXXXXXXXXX
  foundedYear: '',
  yearsExperience: '',
  jobsDone: '', // кількість виконаних виїздів (лише реальна цифра)
  avgArrival: '', // середній час приїзду по Києву, хв (з вашої статистики)
  sameAs: [] as string[], // посилання на Google Business, Facebook, Instagram
  // Рейтинг показуємо і розмічаємо ЛИШЕ з реальних відгуків Google. Поки null — не виводиться ніде.
  rating: null as null | { value: number; count: number },
};

// Якщо плейсхолдер ще не замінено — посилання все одно валідне синтаксично, а сторінка не ламається.
const isSet = (v: string) => !!v && !v.includes('{{');
export const filled = isSet;
// Хто надає послуги — для юридичних сторінок: реквізити ФОП, якщо заповнені, інакше бренд.
export const OWNER = isSet(BUSINESS.legalName) ? BUSINESS.legalName + (isSet(BUSINESS.edrpou) ? ` (код ${BUSINESS.edrpou})` : '') : BUSINESS.brand;

export const tel = (p: string) => (isSet(p) ? 'tel:+38' + p.replace(/[^\d]/g, '').replace(/^38/, '') : 'tel:' + p);
export const links = {
  phone: tel(BUSINESS.phone),
  phone2: tel(BUSINESS.phone2),
  telegram: `https://t.me/${BUSINESS.telegram}`,
  viber: `viber://chat?number=%2B${BUSINESS.viber}`,
  whatsapp: `https://wa.me/${BUSINESS.whatsapp}`,
  email: `mailto:${BUSINESS.email}`,
  map: isSet(BUSINESS.latLng)
    ? `https://www.google.com/maps?q=${BUSINESS.latLng}&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent('Київ')}&z=11&output=embed`,
};

export const geo = () => {
  if (!isSet(BUSINESS.latLng)) return undefined;
  const [latitude, longitude] = BUSINESS.latLng.split(',').map(Number);
  return { '@type': 'GeoCoordinates', latitude, longitude };
};


// Команда (розмітка Person). Заповніть реальними іменами/фото або видаліть зайві записи.
export const TEAM = [
  { name: '', role: 'Майстер з аварійного відкриття замків, засновник', exp: '', photo: 'mayster-kyivlock-1', about: 'Спеціалізація: броньовані двері, циліндрові та сувальдні механізми, сейфи.' },
  { name: '', role: 'Автомайстер: ключі запалювання та імобілайзери', exp: '', photo: 'mayster-kyivlock-2', about: 'Спеціалізація: ремонт і заміна замків запалювання, ключі з чіпом, смарт-ключі.' },
  { name: '', role: 'Майстер виїзної служби, Лівий берег та область', exp: '', photo: 'mayster-kyivlock-3', about: 'Спеціалізація: відкриття авто, заміна личинок, встановлення замків.' },
];
