import type { APIRoute } from 'astro';

// Dynamic so the Sitemap line always matches whatever domain is set as
// `site` in astro.config.mjs — never hand-edit a static robots.txt per
// project, since it's easy to forget and ship it still pointing at
// example.com or a staging domain.
//
// AI crawlers are named explicitly (see the astro-ai-search skill). A bot
// that matches a named group ignores the `*` group, so DISALLOW is repeated
// into every group — edit the array, never hand-write groups. Don't
// disallow noindex pages (thank-you etc.): crawlers must fetch them to see
// the noindex.

// Search/answer bots: never block these, or the site can't be cited.
const SEARCH_BOTS = [
  'OAI-SearchBot', 'ChatGPT-User',
  'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Applebot', 'Bingbot', 'DuckAssistBot',
];
// Model-training bots: ScaleKit default is allow. Move a name to
// BLOCKED_BOTS only if the client asks to opt out of training.
const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];
const BLOCKED_BOTS: string[] = [];

const DISALLOW: string[] = [];

// Set to false on a staging deploy to block every crawler until launch.
const LAUNCHED = true;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site).toString();
  const rules = ['Allow: /', ...DISALLOW.map((p) => `Disallow: ${p}`)].join('\n');
  const agents = (list: string[]) => list.map((a) => `User-agent: ${a}`).join('\n');

  const body = LAUNCHED
    ? [
        `${agents([...SEARCH_BOTS, ...TRAINING_BOTS])}\n${rules}\n`,
        ...(BLOCKED_BOTS.length ? [`${agents(BLOCKED_BOTS)}\nDisallow: /\n`] : []),
        `User-agent: *\n${rules}\n`,
        `Sitemap: ${sitemapURL}\n`,
      ].join('\n')
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
