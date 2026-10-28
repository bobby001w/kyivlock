// Мовний перемикач: віддає дані з uk/ або ru/ залежно від мови сторінки (див. src/i18n/ctx.ts).
import { byLang, fnByLang } from '../i18n/ctx';
import * as uk from './uk/services';
import * as ru from './ru/services';
export type { QA, Section, Service } from './uk/services';
export const IGN = uk.IGN;
export const SERVICES = byLang(uk.SERVICES, ru.SERVICES);
export const serviceByPath = fnByLang(uk.serviceByPath, ru.serviceByPath);
