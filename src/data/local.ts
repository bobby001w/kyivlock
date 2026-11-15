import { byLang } from '../i18n/ctx';
import * as uk from './uk/local';
import * as ru from './ru/local';
import * as ukTips from './uk/tips';
import * as ruTips from './ru/tips';
export const LOCAL = byLang(uk.LOCAL, ru.LOCAL);
export const TIPS = byLang(ukTips.TIPS, ruTips.TIPS);
