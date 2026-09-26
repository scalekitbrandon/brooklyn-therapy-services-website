import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// astro-deploy sets `site` to the real production domain and adds
// an adapter (@astrojs/vercel, @astrojs/netlify, @astrojs/cloudflare)
// when the hosting target is chosen. Defaults to static output.
export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap(), mdx()],
  output: 'static',
});
