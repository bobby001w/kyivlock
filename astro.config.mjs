import { defineConfig } from 'astro/config';

// Адреса публікації: GitHub Pages з власним доменом https://kyivlock.kyiv.ua/ (сайт у корені, base = /).
// Для публікації без домену (https://bobby001w.github.io/kyivlock/) задайте SITE_URL=https://bobby001w.github.io і BASE_PATH=/kyivlock
// (у коді шляхи пишемо без base — префікс додають middleware, abs() і sitemap).
export default defineConfig({
  site: process.env.SITE_URL || 'https://kyivlock.kyiv.ua',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Весь CSS сайту невеликий (~15 КБ) — інлайнимо його повністю: нуль render-blocking запитів.
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});
