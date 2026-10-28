import { byLang } from '../i18n/ctx';
import * as uk from './uk/brands';
import * as ru from './ru/brands';
export type { Brand } from './uk/brands';
export const BRANDS = byLang(uk.BRANDS, ru.BRANDS);
