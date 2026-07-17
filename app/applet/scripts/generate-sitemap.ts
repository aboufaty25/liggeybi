import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function generateSitemap() {
  const prisma = new PrismaClient();
  const baseUrl = 'https://www.liggeybi.com';
  
  const staticPages = [
    '',
    '/offre-demploi',
    '/bourses',
    '/concours',
    '/formation',
    '/a-propos',
    '/contact'
  ];

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Add static pages
  staticPages.forEach(p => {
    sitemapXml += `  <url>\n    <loc>${baseUrl}${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  });

  try {
    const jobs = await prisma.offre.findMany({
      where: { statut: 'approuve' },
      select: { id: true, slug: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    jobs.forEach(job => {
      const lastMod = new Date(job.createdAt).toISOString().split('T')[0];
      sitemapXml += `  <url>\n    <loc>${baseUrl}/offre/${job.slug || job.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });
	console.log(`Included ${jobs.length} dynamic job URLs.`);
  } catch (e: any) {
    console.error("Warning: Could not fetch jobs from database for sitemap generation. Make sure DATABASE_URL is set or database is accessible. Generating only static pages.");
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }

  sitemapXml += `</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /candidat
Disallow: /recruteur
Sitemap: ${baseUrl}/sitemap.xml`;

  // Write to Vite output directory (vite/ in this case)
  const outDir = path.resolve(process.cwd(), 'vite');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml);
  fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsTxt);
  
  // Also write to public folder for dev mode just in case
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);

  console.log(`\u2705 Sitemap & robots.txt generated successfully in Vite outDir.`);
}

generateSitemap().catch(e => {
  console.error("Error generating sitemap:", e);
  process.exit(0); // Don't fail the build
});
