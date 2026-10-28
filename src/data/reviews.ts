import { byLang } from '../i18n/ctx';
import * as uk from './uk/reviews';
import * as ru from './ru/reviews';
export type { Review } from './uk/reviews';
export const REVIEWS = byLang(uk.REVIEWS, ru.REVIEWS);
