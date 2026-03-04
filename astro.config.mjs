// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // This is required for RSS feed generation to create full URLs
  site: 'https://www.jeff-patton.com',
  
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx()]
});
