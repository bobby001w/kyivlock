// Динамічний sitemap розділу «pages» — генерується з реєстру сторінок при кожній збірці.
import type { APIRoute } from 'astro';
import { sectionXml } from '../lib/sitemap';
export const GET: APIRoute = ({ site }) => sectionXml('pages', site!);
