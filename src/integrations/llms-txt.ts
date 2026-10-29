import type { AstroIntegration } from 'astro';
import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Writes dist/llms.txt after every build (see the astro-ai-search skill).
// Built only from what the finished pages already publish — homepage
// business schema + meta description, and each indexable page's <title> and
// meta description — so it never states anything the site doesn't, and new
// pages show up automatically. Skips noindex pages and pages canonicalized
// elsewhere. A hand-written public/llms.txt takes precedence.

const meta = (html: string, name: string) =>
  html.match(new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`, 'i'))?.[1] ??
  html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+name="${name}"`, 'i'))?.[1];

const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .trim();

const SKIP_TYPES = new Set(['WebSite', 'WebPage', 'BreadcrumbList', 'FAQPage', 'Service', 'Person']);

function business(html: string) {
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]);
      const nodes = [data, ...(Array.isArray(data['@graph']) ? data['@graph'] : [])].flat();
      const biz = nodes.find((n) => n?.name && n['@type'] && ![n['@type']].flat().every((t: string) => SKIP_TYPES.has(t)));
      if (biz) return biz as { name: string; telephone?: string; email?: string };
    } catch {}
  }
}

async function htmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const heading = (seg: string) => seg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function llmsTxt(): AstroIntegration {
  let site = '';
  return {
    name: 'llms-txt',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = config.site ?? '';
      },
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const target = path.join(root, 'llms.txt');
        if (await access(target).then(() => true, () => false)) return logger.info('public/llms.txt found, leaving it as is');
        if (!site) return logger.warn('no `site` in astro.config — skipping llms.txt');

        const homeHtml = await readFile(path.join(root, 'index.html'), 'utf8');
        const biz = business(homeHtml);
        const groups = new Map<string, string[]>([['Main pages', []]]);
        for (const file of (await htmlFiles(root)).sort()) {
          const rel = path.relative(root, file).split(path.sep).join('/');
          if (/^404(\/|\.html)|^500/.test(rel)) continue;
          const html = await readFile(file, 'utf8');
          if (/noindex/i.test(meta(html, 'robots') ?? '')) continue;
          const urlPath = '/' + rel.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
          const url = new URL(urlPath, site).toString();
          const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1];
          if (canonical && canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) continue;
          const title = decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? urlPath);
          const desc = meta(html, 'description');
          const segs = urlPath.split('/').filter(Boolean);
          const group = segs.length <= 1 ? 'Main pages' : heading(segs[0]);
          if (!groups.has(group)) groups.set(group, []);
          groups.get(group)![urlPath === '/' ? 'unshift' : 'push'](`- [${title}](${url})${desc ? `: ${decode(desc)}` : ''}`);
        }

        const name = biz?.name ?? decode(homeHtml.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '');
        const summary = meta(homeHtml, 'description');
        const contact = [biz?.telephone && `Phone: ${biz.telephone}`, biz?.email && `Email: ${biz.email}`].filter(Boolean);
        const body = [
          `# ${decode(name)}`,
          ...(summary ? [`> ${decode(summary)}`] : []),
          ...(contact.length ? [contact.join('\n')] : []),
          ...[...groups].filter(([, lines]) => lines.length).map(([h, lines]) => `## ${h}\n${lines.join('\n')}`),
        ].join('\n\n');
        await writeFile(target, body + '\n');
        logger.info(`llms.txt written (${[...groups.values()].flat().length} pages)`);
      },
    },
  };
}
