import { defineConfig } from 'astro/config';

// Канонічний домен (без www, лише https). Змініть через змінну SITE_URL при деплої.
const SITE = process.env.SITE_URL || 'https://kyivlock.com.ua';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Весь CSS сайту невеликий (~15 КБ) — інлайнимо його повністю: нуль render-blocking запитів.
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});
