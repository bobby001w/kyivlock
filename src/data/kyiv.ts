import { byLang } from '../i18n/ctx';
import * as uk from './uk/kyiv';
import * as ru from './ru/kyiv';
export type { Micro, Place } from './uk/kyiv';
export const DISTRICTS = byLang(uk.DISTRICTS, ru.DISTRICTS);
export const MICROS = byLang(uk.MICROS, ru.MICROS);
