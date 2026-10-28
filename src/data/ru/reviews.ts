// ЛИШЕ РЕАЛЬНІ відгуки клієнтів (з Google Business Profile, форм, месенджерів — за згодою автора).
// Вигадані відгуки заборонені правилами Google і законом про захист прав споживачів.
// place — slug району/міста (для блоку «Відгуки з цього району»), service — шлях послуги.
export interface Review { author: string; place?: string; service?: string; date: string; rating: number; text: string; source: 'google' | 'site' }

export const REVIEWS: Review[] = [
  // { author: 'Ім\'я П.', place: 'obolonskyi-rayon', service: '/poslugy/vidkryttia-dverey/', date: '2026-10-01', rating: 5, text: '...', source: 'google' },
];
