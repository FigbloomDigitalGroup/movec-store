// Runs before `vite build` (see package.json). Vite copies everything in
// `public/` into the build output, so writing here is enough to publish it —
// no server needed, which matters since this is a static SPA on Vercel.
import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://movecstore.movecconnect.com').replace(/\/$/, '');
const API_URL = (process.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

const STATIC_PATHS = [
  { path: '', priority: '1.0' },
  { path: 'shop', priority: '0.8' },
  { path: 'products', priority: '0.8' },
  { path: 'categories', priority: '0.7' },
  { path: 'installation', priority: '0.6' },
  { path: 'support/faqs', priority: '0.5' },
  { path: 'contact', priority: '0.5' },
  { path: 'privacy', priority: '0.3' },
  { path: 'terms', priority: '0.3' },
  { path: 'refund', priority: '0.3' },
  { path: 'cookies', priority: '0.3' },
];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function getModuleSlugs() {
  try {
    const modules = await fetchJson(`${API_URL}/modules`);
    return modules.map((m) => m.slug);
  } catch (err) {
    console.warn('[sitemap] Could not fetch modules, skipping:', err.message);
    return [];
  }
}

async function getProductSlugs() {
  const slugs = [];
  const limit = 100;
  let page = 1;
  try {
    // Hard cap far above any realistic catalog size — a safety backstop
    // against an infinite loop if pagination metadata ever misbehaves.
    while (page <= 200) {
      const res = await fetchJson(`${API_URL}/products?limit=${limit}&page=${page}`);
      const items = res.data ?? [];
      slugs.push(...items.map((p) => p.slug));
      const total = res.meta?.total ?? items.length;
      if (items.length === 0 || page * limit >= total) break;
      page++;
    }
  } catch (err) {
    console.warn('[sitemap] Could not fetch products, skipping:', err.message);
  }
  return slugs;
}

function urlEntry(loc, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  const [moduleSlugs, productSlugs] = await Promise.all([getModuleSlugs(), getProductSlugs()]);

  const entries = [
    ...STATIC_PATHS.map(({ path: p, priority }) => urlEntry(`${SITE_URL}/${p}`, priority)),
    ...moduleSlugs.map((slug) => urlEntry(`${SITE_URL}/${slug}`, '0.8')),
    ...productSlugs.map((slug) => urlEntry(`${SITE_URL}/products/${slug}`, '0.7')),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  const outPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml);
  console.log(`[sitemap] wrote ${entries.length} URLs (${moduleSlugs.length} modules, ${productSlugs.length} products) to ${outPath}`);
}

main();
