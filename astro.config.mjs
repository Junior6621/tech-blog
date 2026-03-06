// @ts-check
import { defineConfig } from 'astro:config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap'; // New integration

export default defineConfig({
  site: 'https://www.jeff-patton.com',
  integrations: [
    mdx(),
    sitemap(), // This generates the sitemap-index.xml on build
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
