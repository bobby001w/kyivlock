// Після збірки: російська 404 має лежати у dist/ru/404.html (Cloudflare Pages шукає найближчий 404.html).
import { renameSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import config from '../astro.config.mjs';
if (existsSync('dist/ru/404/index.html')) {
  renameSync('dist/ru/404/index.html', 'dist/ru/404.html');
  rmSync('dist/ru/404', { recursive: true });
}

// Статичний manifest не проходить через middleware — додаємо base публікації до його шляхів.
const BASE = (config.base ?? '/').replace(/\/$/, '');
const MF = 'dist/manifest.webmanifest';
if (BASE && existsSync(MF)) writeFileSync(MF, readFileSync(MF, 'utf8').replace(/"(start_url|src)": "\/(?!\/)/g, `"$1": "${BASE}/`));
