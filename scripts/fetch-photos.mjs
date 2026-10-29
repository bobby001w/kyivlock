// Завантажує тематичні фото з Unsplash (список — scripts/photos.json) у images-src/.
// Далі `npm run images` стискає їх в AVIF/WebP 480/800/1200 px. Наявні файли не перезавантажуються.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const list = JSON.parse(readFileSync('scripts/photos.json', 'utf8'));
mkdirSync('images-src', { recursive: true });
for (const [name, id] of Object.entries(list)) {
  if (name.startsWith('_')) continue;
  const file = `images-src/${name}.jpg`;
  if (existsSync(file)) continue;
  const r = await fetch(`https://images.unsplash.com/photo-${id}?w=1600&q=82&fm=jpg`);
  if (!r.ok) { console.log(`✗ ${name}: HTTP ${r.status}`); continue; }
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  console.log(`✓ ${name}`);
}
