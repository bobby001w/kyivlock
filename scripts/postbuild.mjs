// Після збірки: російська 404 має лежати у dist/ru/404.html (Cloudflare Pages шукає найближчий 404.html).
import { renameSync, rmSync, existsSync } from 'node:fs';
if (existsSync('dist/ru/404/index.html')) {
  renameSync('dist/ru/404/index.html', 'dist/ru/404.html');
  rmSync('dist/ru/404', { recursive: true });
}
