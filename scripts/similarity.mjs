// Контроль «дорвеїв»: схожість тексту між геосторінками (Jaccard по 5-словних шинглах, без форм).
// Ціль: медіана < 0.3, максимум ≤ 0.45 (зараз ~0.40 — тримайте запас). Запуск: npm run check:similarity (після build).
// Мовні версії порівнюються окремо: українські між собою, російські (/ru/) між собою.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

for (const [label, base] of [['uk', 'dist'], ['ru', 'dist/ru']]) {
const pages = [];
for (const dir of [`${base}/kyiv`, `${base}/kyivska-oblast`])
  for (const d of readdirSync(dir)) {
    const f = join(dir, d, 'index.html');
    if (!existsSync(f)) continue;
    const main = (readFileSync(f, 'utf8').match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? '').replace(/<form[\s\S]*?<\/form>/g, '');
    const w = main.replace(/<[^>]+>/g, ' ').toLowerCase().match(/[\p{L}\d]+/gu) ?? [];
    const sh = new Set(); for (let i = 0; i + 5 <= w.length; i++) sh.add(w.slice(i, i + 5).join(' '));
    pages.push({ path: `${dir.slice(4)}/${d}/`, sh });
  }
const res = [];
for (let i = 0; i < pages.length; i++)
  for (let j = i + 1; j < pages.length; j++) {
    const a = pages[i].sh, b = pages[j].sh; let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    res.push([inter / (a.size + b.size - inter), pages[i].path, pages[j].path]);
  }
res.sort((x, y) => y[0] - x[0]);
const med = [...res].sort((x, y) => x[0] - y[0])[res.length >> 1][0];
console.log(`[${label}] Геосторінок: ${pages.length}, пар: ${res.length}, медіана схожості: ${med.toFixed(2)}, максимум: ${res[0][0].toFixed(2)}`);
res.slice(0, +(process.env.TOP || 5)).forEach(([j, a, b]) => console.log(`  ${j.toFixed(2)}  ${a}  ↔  ${b}`));
if (res[0][0] > 0.45) { console.log(`[${label}] Є пари зі схожістю > 0.45 — допишіть унікальний текст у src/data/{uk,ru}/local.ts або tips.ts`); process.exitCode = 1; }
}
