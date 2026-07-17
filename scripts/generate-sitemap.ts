import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function generate() {
  console.log("Démarrage de la génération du sitemap...");
  const staticPages = [
    '',
    '/offre-demploi',
    '/bourses',
    '/concours',
    '/formation',
    '/a-propos',
    '/contact'
  ];

  let localJobs: any[] = [];
  try {
    console.log("Récupération des offres depuis la base de données...");
    const now = new Date();
    localJobs = await prisma.offre.findMany({
      where: { 
        statut: 'approuve',
        OR: [
          { dateExpiration: null },
          { dateExpiration: { gt: now } }
        ]
      },
      select: { id: true, slug: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Trouvé ${localJobs.length} offres approuvées.`);
  } catch (e) {
    console.error("Erreur de base de données (le build continuera sans les offres dans le sitemap):", e);
  } finally {
    await prisma.$disconnect();
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  staticPages.forEach(p => {
    xml += `  <url>\n    <loc>https://www.liggeybi.com${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  });

  localJobs.forEach(job => {
    if (job && (job.id || job.slug) && job.createdAt) {
      const lastMod = new Date(job.createdAt).toISOString();
      xml += `  <url>\n    <loc>https://www.liggeybi.com/offre/${job.slug || job.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }
  });
  
  xml += `</urlset>`;

  try {
    const robotsTxt = "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /candidat\nDisallow: /recruteur\nSitemap: https://www.liggeybi.com/sitemap.xml";
    await fs.mkdir(path.resolve(process.cwd(), 'vite'), { recursive: true });
    await fs.writeFile(path.resolve(process.cwd(), 'vite', 'sitemap.xml'), xml);
    await fs.writeFile(path.resolve(process.cwd(), 'public', 'sitemap.xml'), xml);
    await fs.writeFile(path.resolve(process.cwd(), 'sitemap.xml'), xml);
    await fs.writeFile(path.resolve(process.cwd(), 'vite', 'robots.txt'), robotsTxt);
    await fs.writeFile(path.resolve(process.cwd(), 'public', 'robots.txt'), robotsTxt);
    await fs.writeFile(path.resolve(process.cwd(), 'robots.txt'), robotsTxt);
    console.log("Sitemap généré avec succès dans ./dist/sitemap.xml et ./public/sitemap.xml !");
  } catch (err) {
    console.error("Erreur lors de l'écriture du sitemap:", err);
  }
}

generate();
