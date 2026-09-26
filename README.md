# Astro Starter Kit

Shared base for every site built by the `astro-*` skill department. `astro-build` scaffolds new client projects by copying this directory — never build a client site by hand-writing an Astro project from scratch.

## What's in here

- `astro.config.mjs` — sitemap + MDX integrations, static output by default (`astro-deploy` adds an adapter and sets `site` per project)
- `@astrojs/sitemap` is pinned to `3.2.1`, not `^3.0.0` — versions 3.7.x+ call an `astro:routes:resolved` integration hook that doesn't exist in Astro 4.x, and `npm run build` fails with `Cannot read properties of undefined (reading 'reduce')`. Don't bump this past 3.2.1 without also upgrading Astro to a version that supports that hook.
- `src/styles/tokens.css` — token **names** are the contract; `astro-brand` overwrites the values per client, components should never hardcode raw colors/spacing
- `src/content/config.ts` — skeleton collections (`blog`, `testimonials`, `caseStudies`); `astro-content` finalizes the real shape per project and deletes what's unused
- `src/layouts/BaseLayout.astro` — head/meta defaults + global reset
- `src/components/` — `Header`, `Footer`, `Button`, `Card`, `Badge` — the starting component inventory `astro-clone` checks new sites against before assuming a component needs to be built fresh
- `src/pages/index.astro` — placeholder homepage demonstrating how the pieces fit together; replaced per project by `astro-build`

## Growing this kit

When `astro-build` creates a genuinely reusable component or layout for a client project (not client-specific copy/colors — just structure), backport it here so the next build benefits. Don't let client-specific content leak into this kit.

## First-time setup for a new client project

```bash
cp -r ~/Astro-Sites/_starter-kit ~/Astro-Sites/<client-slug>
cd ~/Astro-Sites/<client-slug>
git init
npm install
npm run dev
```
