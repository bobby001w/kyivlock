// Копіює self-hosted шрифт Golos Text у public/fonts (кирилиця + латиниця):
// 400 — текст, 600 — підзаголовки й кнопки, 700 — заголовки.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
mkdirSync('public/fonts', { recursive: true });
for (const f of readdirSync('public/fonts')) rmSync(`public/fonts/${f}`); // прибираємо старі накреслення
for (const subset of ['cyrillic', 'latin'])
  for (const w of ['400', '600', '700'])
    copyFileSync(`node_modules/@fontsource/golos-text/files/golos-text-${subset}-${w}-normal.woff2`, `public/fonts/golos-${subset}-${w}.woff2`);
console.log('fonts copied');
