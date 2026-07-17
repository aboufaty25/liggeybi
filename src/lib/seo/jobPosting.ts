export function injectJobPostingSchema(job: any) {
  if (!job || typeof window === "undefined") return;

  // Remove existing schema to avoid duplicates
  const existingScript = document.getElementById("google-jobs-schema");
  if (existingScript) existingScript.remove();

  const safeDatePosted =
    (job.updatedAt || job.createdAt) &&
    !isNaN(new Date(job.updatedAt || job.createdAt).getTime())
      ? new Date(job.updatedAt || job.createdAt).toISOString()
      : new Date().toISOString();

  const numericSalary =
    job.salaire && typeof job.salaire === "string"
      ? parseFloat(job.salaire.replace(/[^0-9.]/g, ""))
      : null;

  const descRaw =
    job.description || job.seoDescription || "Détails de l'offre d'emploi";
  const htmlDescription = descRaw.includes("<")
    ? descRaw
    : `<p>${descRaw.replace(/\n/g, "<br/>")}</p>`;

  const baseUrl = window.location.origin;

  // All jobs are from Senegal
  const countryCode = "SN";

  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.titre || "Offre d'emploi",
    image: job.imageUrl
        ? job.imageUrl.startsWith("http")
          ? job.imageUrl
          : `${baseUrl}${job.imageUrl}`
        : job.logoUrl
          ? job.logoUrl.startsWith("http")
            ? job.logoUrl
            : `${baseUrl}${job.logoUrl}`
          : `${baseUrl}/logo.png`,
    description: htmlDescription,
    identifier: {
      "@type": "PropertyValue",
      name: job.entreprise || "Liggeybi",
      value: String(job.id),
    },
    datePosted: safeDatePosted,
    validThrough:
      job.dateExpiration && !isNaN(new Date(job.dateExpiration).getTime())
        ? new Date(job.dateExpiration).toISOString()
        : new Date(
            new Date(safeDatePosted).getTime() + 90 * 24 * 60 * 60 * 1000,
          ).toISOString(),
    employmentType:
      job.typeContrat === "CDI"
        ? "FULL_TIME"
        : job.typeContrat === "CDD"
          ? "CONTRACTOR"
          : job.typeContrat === "Freelance"
            ? "CONTRACTOR"
            : job.typeContrat === "Stage"
              ? "INTERN"
              : job.typeContrat === "Temps partiel"
                ? "PART_TIME"
                : "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      name: job.entreprise || "Liggeybi",
      sameAs: job.lienExterne || baseUrl,
      logo: job.imageUrl
        ? job.imageUrl.startsWith("http")
          ? job.imageUrl
          : `${baseUrl}${job.imageUrl}`
        : job.logoUrl
          ? job.logoUrl.startsWith("http")
            ? job.logoUrl
            : `${baseUrl}${job.logoUrl}`
          : `${baseUrl}/logo.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: job.lieu || "Sénégal",
        addressLocality: job.lieu || "Dakar",
        addressRegion: job.lieu || "Dakar",
        postalCode: "00000",
        addressCountry: countryCode,
      },
    },
    industry: job.categorie || "General",
    ...(job.lienExterne || job.emailContact
      ? {
          directApply: true,
        }
      : {}),
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
    ...(job.modeTravail === "À distance"
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: {
            "@type": "Country",
            name: "SN",
          },
        }
      : {}),
  };

  const script = document.createElement("script");
  script.id = "google-jobs-schema";
  script.type = "application/ld+json";
  script.text = JSON.stringify(schema).replace(/</g, "\\u003c");

  document.head.appendChild(script);
}

export function removeJobPostingSchema() {
  if (typeof window === "undefined") return;
  const existingScript = document.getElementById("google-jobs-schema");
  if (existingScript) existingScript.remove();
}
