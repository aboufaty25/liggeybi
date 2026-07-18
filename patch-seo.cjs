const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    const formationMatch = !offreMatch && req.path.match(/^\\/formations\\/([^\\/]+)/);

    // Handle Local Jobs
    if ((offreMatch || formationMatch) && !req.path.includes(".")) {
      const isFormation = !!formationMatch;
      const slug = String(req.query.id || (offreMatch ? offreMatch[1] : formationMatch[1]));

      try {
        let item = null;
        if (isFormation) {
            item = await prisma.formation.findFirst({ where: { OR: [{ id: slug }, { slug: slug }] } });
        } else {
            item = await prisma.offre.findFirst({ where: { OR: [{ id: slug }, { slug: slug }] } });
        }

        if (item) {
          const desc = item.description
            ? item.description
                .replace(/<[^>]*>/g, "")
                .substring(0, 200)
                .replace(/\\n/g, " ")
            : "Trouvez les meilleures opportunités sur Liggeybi.";

          const rawImg =
            item.imageUrl ||
            item.logoUrl ||
            "https://www.liggeybi.com/social-default.jpg";

          const img = rawImg.startsWith("http")
            ? rawImg
            : "https://www.liggeybi.com" +
              (rawImg.startsWith("/") ? rawImg : "/" + rawImg);

          const title = item.titre + " | Liggeybi";
          const url = "https://www.liggeybi.com" + req.originalUrl;
          const encodedImg = encodeURI(img);

          // Job-specific
          const numericSalary =
            !isFormation && item.salaire && typeof item.salaire === "string"
              ? parseFloat(item.salaire.replace(/[^0-9.]/g, ""))
              : null;

          const htmlDescription = item.description
            ? item.description.includes("<")
              ? item.description
              : \`<p>\${item.description.replace(/\\n/g, "<br/>")}</p>\`
            : \`<p>\${desc}</p>\`;

          const countryCode = "SN";
          let schemaTags = "";
          
          if (!isFormation) {
            const jobPostingSchema = {
              "@context": "https://schema.org/",
              "@type": "JobPosting",
              title: item.titre || "Offre d'emploi",
              image: encodedImg,
              description: htmlDescription,
              identifier: {
                "@type": "PropertyValue",
                name: item.entreprise || "Liggeybi",
                value: String(item.id),
              },
              datePosted: item.createdAt.toISOString(),
              validThrough:
                item.dateExpiration &&
                !isNaN(new Date(item.dateExpiration).getTime())
                  ? new Date(item.dateExpiration).toISOString()
                  : new Date(
                      new Date(item.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000,
                    ).toISOString(),
              employmentType:
                item.typeContrat === "CDI"
                  ? "FULL_TIME"
                  : item.typeContrat === "CDD"
                    ? "CONTRACTOR"
                    : item.typeContrat === "Freelance"
                      ? "CONTRACTOR"
                      : item.typeContrat === "Stage"
                        ? "INTERN"
                        : item.typeContrat === "Temps partiel"
                          ? "PART_TIME"
                          : "OTHER",
              industry: item.categorie || "General",
              ...(item.lienExterne || item.emailContact
                ? {
                    directApply: true,
                  }
                : {}),
              hiringOrganization: {
                "@type": "Organization",
                name: item.entreprise || "Liggeybi",
                sameAs: "https://www.liggeybi.com",
                logo: item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : \`https://www.liggeybi.com\${item.imageUrl}\`
                  : item.logoUrl
                    ? item.logoUrl.startsWith("http")
                      ? item.logoUrl
                      : \`https://www.liggeybi.com\${item.logoUrl}\`
                    : "https://www.liggeybi.com/social-default.jpg",
              },
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: item.lieu || "Sénégal",
                  addressRegion: item.lieu || "Dakar",
                  addressCountry: countryCode,
                },
              },
              ...(numericSalary && numericSalary > 0
                ? {
                    baseSalary: {
                      "@type": "MonetaryAmount",
                      currency: "XOF",
                      value: {
                        "@type": "QuantitativeValue",
                        value: numericSalary,
                        unitText: "MONTH",
                      },
                    },
                  }
                : {}),
              ...(item.modeTravail === "À distance"
                ? {
                    jobLocationType: "TELECOMMUTE",
                    applicantLocationRequirements: {
                      "@type": "Country",
                      name: "SN",
                    },
                  }
                : {}),
            };
            
            schemaTags = \`<script id="google-jobs-schema" type="application/ld+json">\${JSON.stringify(jobPostingSchema).replace(/</g, "\\\\u003c")}</script>\`;
          }

          const seoHtml = \`
                  <title>\${title}</title>
                  <meta name="description" content="\${desc}" />
                  <meta property="og:title" content="\${title}" />
                  <meta property="og:description" content="\${desc}" />
                  <meta property="og:image" content="\${encodedImg}" />
                  <meta property="og:image:secure_url" content="\${encodedImg}" />
                  <meta property="og:image:width" content="1200" />
                  <meta property="og:image:height" content="630" />
                  <meta property="og:url" content="\${url}" />
                  <meta property="og:type" content="article" />
                  <meta name="twitter:card" content="summary_large_image" />
                  <meta name="twitter:title" content="\${title}" />
                  <meta name="twitter:description" content="\${desc}" />
                  <meta name="twitter:image" content="\${encodedImg}" />
                  \${schemaTags}
                \`;

          const isProd =
            process.env.NODE_ENV === "production" ||
            process.env.VITE_PROD === "true";

          let templateContent = "";
          if (isProd) {
            const distPath = path.resolve(__dirname, "vite");
            templateContent = fs.readFileSync(
              path.resolve(distPath, "index.html"),
              "utf-8",
            );
          } else {
            templateContent = fs.readFileSync(
              path.resolve(__dirname, "index.html"),
              "utf-8",
            );
          }

          // Remove ALL existing OG and Twitter tags to prevent duplicates
          templateContent = templateContent.replace(
            /<meta (property|name)="og:[^>]+>/g,
            "",
          );
          templateContent = templateContent.replace(
            /<meta (property|name)="twitter:[^>]+>/g,
            "",
          );
          templateContent = templateContent.replace(
            /<meta name="description"[^>]+>/g,
            "",
          );
          templateContent = templateContent.replace(
            /<title>[^<]*<\\/title>/g,
            "",
          );

          templateContent = templateContent.replace(
            "</head>",
            () => seoHtml + "\\n</head>",
          );

          return res.send(templateContent);
        }
      } catch (e) {
        console.error("Bot JobPosting injection error", e);
      }
    }
`;

// Replace from 'if (offreMatch' until the end of the if block
const regex = /\/\/ Handle Local Jobs\s+if \(offreMatch.*?(?=if \(\s*isBot &&\s*articleMatch)/s;

server = server.replace(regex, replacement);
fs.writeFileSync('server.ts', server);

