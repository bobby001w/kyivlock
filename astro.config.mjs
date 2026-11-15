import { defineConfig } from 'astro/config';

// Адреса публікації: зараз GitHub Pages — https://bobby001w.github.io/kyivlock/.
// Для власного домену задайте при збірці SITE_URL=https://kyivlock.com.ua і BASE_PATH=/
// (у коді шляхи пишемо без base — префікс додають middleware, abs() і sitemap).
export default defineConfig({
  site: process.env.SITE_URL || 'https://bobby001w.github.io',
  base: process.env.BASE_PATH || '/kyivlock',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Весь CSS сайту невеликий (~15 КБ) — інлайнимо його повністю: нуль render-blocking запитів.
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});
