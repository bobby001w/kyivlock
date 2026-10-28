// Генерує адаптивні зображення (AVIF + WebP, 480/800/1200 px) і іконки.
// 1) Якщо в images-src/ є реальне фото з таким самим ім'ям (jpg/png/webp) — воно стискається й нарізається.
// 2) Якщо фото немає — створюється брендований плейсхолдер (замініть реальними фото: це важливо для E-E-A-T).
// Імена файлів збираються автоматично з src/data/*.ts і frontmatter статей блогу.
import sharp from 'sharp';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'public/images';
const SRC = 'images-src';
mkdirSync(OUT, { recursive: true });

const names = new Set(['og-kyivlock']);
// Дані лежать у src/data/{uk,ru}/ — обходимо рекурсивно, лише файли.
for (const f of readdirSync('src/data', { recursive: true }).filter((f) => f.endsWith('.ts'))) {
  const t = readFileSync(join('src/data', f), 'utf8');
  for (const m of t.matchAll(/(?:file|photo): '([a-z0-9-]+)'/g)) names.add(m[1]);
}
for (const f of readdirSync('src/content/blog')) {
  const m = readFileSync(join('src/content/blog', f), 'utf8').match(/^image:\s*([a-z0-9-]+)/m);
  if (m) names.add(m[1]);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const placeholder = (name, w, h) => {
  const label = name.replace(/-/g, ' ');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#111318"/><stop offset="1" stop-color="#262626"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g transform="translate(${w / 2 - 60} ${h / 2 - 110})"><rect x="0" y="70" width="120" height="96" rx="16" fill="#ffffff"/><path d="M28 70V48a32 32 0 0 1 64 0v22" stroke="#ffffff" stroke-width="16" fill="none"/><circle cx="60" cy="110" r="12" fill="#c8642c"/><rect x="54" y="112" width="12" height="28" fill="#c8642c"/></g>
  <text x="50%" y="${h / 2 + 100}" fill="#ffffff" font-family="Arial, sans-serif" font-size="${Math.round(w / 34)}" text-anchor="middle">KyivLock · ${esc(label)}</text>
</svg>`);
};

let made = 0;
for (const name of names) {
  const real = ['jpg', 'jpeg', 'png', 'webp'].map((e) => join(SRC, `${name}.${e}`)).find(existsSync);
  if (name === 'og-kyivlock') {
    await sharp(real ?? placeholder(name, 1200, 630)).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile(join(OUT, 'og-kyivlock.jpg'));
    continue;
  }
  for (const w of [480, 800, 1200]) {
    const h = Math.round((w * 750) / 1200);
    const input = real ? sharp(real) : sharp(placeholder(name, 1200, 750));
    const img = input.resize(w, h, { fit: 'cover' });
    await img.clone().webp({ quality: 74 }).toFile(join(OUT, `${name}-${w}.webp`));
    await img.clone().avif({ quality: 52 }).toFile(join(OUT, `${name}-${w}.avif`));
    made++;
  }
}

// Іконки та favicon
const icon = readFileSync('public/favicon.svg');
for (const [file, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]])
  await sharp(icon, { density: 400 }).resize(size, size).png().toFile(join('public', file));

console.log(`images: ${names.size} names, ${made * 2} files; icons done`);
