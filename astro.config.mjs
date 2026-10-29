import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import llmsTxt from './src/integrations/llms-txt';

export default defineConfig({
  site: 'https://brooklyntherapyservices.com',
  integrations: [
    sitemap({
      // Keep conversion/utility pages out of the sitemap; they are also noindex.
      filter: (page) => !page.includes('/thank-you'),
    }),
    mdx(),
    llmsTxt(),
  ],
  output: 'static',
});
