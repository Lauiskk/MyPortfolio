// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vercel exposes the production domain at build time. Falls back to the
 * default project URL so `astro build` works locally without any env setup.
 */
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://luisfelipe-dev.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  adapter: vercel({ imageService: true }),
  integrations: [react(), sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en-US', pt: 'pt-BR' } } })],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
