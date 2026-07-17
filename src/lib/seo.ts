export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
}

export const getBaseMetadata = (siteName: string): SEOProps => ({
  title: siteName,
  description: "Plateforme d'offres d'emploi et bourses",
  ogTitle: siteName,
  ogDescription: "Plateforme d'offres d'emploi et bourses",
});
