import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, MapPin, Search, ArrowRight, BookOpen, Briefcase, Globe2, Landmark, Filter, Plane, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { AdBanner } from '@/components/ads/AdBanner';
import { SidebarWidgets } from '@/components/common/SidebarWidgets';

interface TopicSEO {
  title: string;
  metaDesc: string;
  h1: string;
  contentTitle: string;
  categoryValue: string;
  sousCategorieValue: string;
}

const TOPICS_SEO: Record<string, TopicSEO> = {
  // EUROPE
  'europe/etudier-en-europe': {
    title: 'Étudier en Europe - Guide Complet, Universités et Admissions | Liggeybi',
    metaDesc: "Étudier en Europe : démarches, universités et critères d'admission. Guide complet pour les étudiants internationaux.",
    h1: 'Comment Étudier en Europe : Le Guide Pour Étudiants Internationaux',
    contentTitle: 'Pourquoi choisir l\'Europe pour vos études supérieures ?',
    categoryValue: 'europe',
    sousCategorieValue: 'Étudier en Europe',
  },
  'europe/bourses-europeennes': {
    title: 'Bourses d\'Études en Europe 2024-2025 - Financement et Aides | Liggeybi',
    metaDesc: "Des milliers de bourses européennes disponibles pour les étudiants étrangers: Erasmus+, bourses gouvernementales, financement d'études.",
    h1: 'Bourses Européennes : Comment Financer vos Études à l\'Étranger',
    contentTitle: 'Obtenir une Bourse pour Étudier en Europe',
    categoryValue: 'europe',
    sousCategorieValue: 'Bourses européennes',
  },
  'europe/visa-etudiant': {
    title: 'Visa Étudiant Europe - Démarches, Documents et Rendez-vous | Liggeybi',
    metaDesc: "Tout ce qu'il faut savoir sur le visa étudiant pour l'Europe (Espace Schengen) : documents requis, entretien consulaire, et démarches.",
    h1: 'Obtenir Votre Visa Étudiant Pour l\'Europe',
    contentTitle: 'Démarches Campus France et Visa Long Séjour',
    categoryValue: 'europe',
    sousCategorieValue: 'Visa étudiant',
  },
  'europe/universites-europeennes': {
    title: 'Universités Européennes - Recherche et Inscriptions | Liggeybi',
    metaDesc: "Liste des universités européennes, classements des meilleures écoles et démarches d'inscription pour poursuivre ses études en Europe.",
    h1: 'Universités Européennes : Choisir le Meilleur Établissement',
    contentTitle: 'Les Meilleures Universités d\'Europe (France, Allemagne, Belgique...)',
    categoryValue: 'europe',
    sousCategorieValue: 'Universités européennes',
  },

  // CANADA
  'canada/entree-express': {
    title: 'Système Entrée Express Canada 2024-2025 (Express Entry) | Liggeybi',
    metaDesc: "Comprendre et optimiser votre profil Entrée Express pour le Canada. Augmentez votre score SCG (Système de classement global) pour l'Invitation à présenter une demande (IPD).",
    h1: 'Système Entrée Express Canada : Mode d\'Emploi',
    contentTitle: 'Comment fonctionne le profil Entrée Express (Express Entry)',
    categoryValue: 'canada',
    sousCategorieValue: 'Entrée Express',
  },
  'canada/permis-detudes': {
    title: 'Permis d\'études Canada - Étudier au Canada | Liggeybi',
    metaDesc: "Obtenir votre Permis d'études pour le Canada. Découvrez comment étudier dans les meilleures universités et collèges canadiens.",
    h1: 'Demander Un Permis d\'Études Pour Le Canada',
    contentTitle: 'Obtenir son Permis d\'Études',
    categoryValue: 'canada',
    sousCategorieValue: 'Permis d\'études',
  },
  'canada/permis-de-travail': {
    title: 'Permis de Travail Canada - Ouvert et Fermé, EIMT | Liggeybi',
    metaDesc: "Obtenir votre Permis de travail pour le Canada. Comprendre les différences entre les permis de travail ouverts, permis liés à un employeur donné (EIMT) et exemptions.",
    h1: 'Demander Un Permis de Travail Pour Le Canada',
    contentTitle: 'Permis de Travail (EIMT) vs Permis Ouvert',
    categoryValue: 'canada',
    sousCategorieValue: 'Permis de travail',
  },
  'canada/pnp-canada': {
    title: 'Programme des Candidats des Provinces (PNP) Canada | Liggeybi',
    metaDesc: "Découvrez le Programme des Candidats des Provinces (PCP/PNP) et comment obtenir la résidence permanente au Canada via les provinces.",
    h1: 'Immigration Canada : PNP (Programme des Candidats des Provinces)',
    contentTitle: 'Programmes Provinciaux d\'Immigration',
    categoryValue: 'canada',
    sousCategorieValue: 'PNP Canada',
  }
};

const EUROPE_LOCATIONS = [
  "France", "Allemagne", "Belgique", "Suisse", "Espagne", "Italie", "Luxembourg",
  "Royaume-Uni", "Pays-Bas", "Irlande", "Suède", "Norvège", "Finlande", "Pologne"
];

const CANADA_LOCATIONS = [
  "Québec", "Ontario", "Colombie-Britannique", "Alberta", "Manitoba",
  "Nouvelle-Écosse", "Nouveau-Brunswick", "Saskatchewan", 
  "Île-du-Prince-Édouard", "Terre-Neuve-et-Labrador"
];

export function DestinationTopic() {
  const { region, topicSlug } = useParams<{ region: string, topicSlug: string }>();
  const navigate = useNavigate();
  // Validate path parameter
  const sectionKey = `${region}/${topicSlug}`;
  const seoData = TOPICS_SEO[sectionKey];
  
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    const fetchArticles = async () => {
      if (!seoData) return;
      setLoading(true);
      try {
        let url = `/api/public/offres?limit=20&categorie=${encodeURIComponent(seoData.categoryValue)}&sousCategorie=${encodeURIComponent(seoData.sousCategorieValue)}`;
        if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
        if (location) url += `&lieu=${encodeURIComponent(location)}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.data || data.offres || []);
        }
      } catch (err) {
        console.error("Failed to load articles for topic", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [seoData, region, topicSlug, searchQuery, location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-trigger fetch or navigate to a dedicated search page
    // By changing state, the useEffect will trigger.
  };

  if (!seoData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="text-center">
          <h1 className="text-5xl border-b-4 border-indigo-600 inline-block font-black text-gray-900 mb-4">404</h1>
          <p className="text-gray-500 font-medium font-mono">Cette destination ou sous-catégorie n'existe pas.</p>
          <Link to="/" className="inline-flex items-center text-indigo-600 border border-indigo-200 mt-8 px-6 py-3 rounded-full hover:bg-indigo-50 font-bold transition-all"><ArrowRight className="w-5 h-5 mr-2 rotate-180" /> Retourner à l'accueil</Link>
        </div>
      </div>
    );
  }

  const isCanada = region === 'canada';
  const themeAccent = isCanada ? 'red' : 'indigo';
  const locationsList = isCanada ? CANADA_LOCATIONS : EUROPE_LOCATIONS;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.metaDesc} />
        {/* Adds highly searchable keywords for AdSense Targeting */}
        <meta name="keywords" content={`emploi, recrutement, immobilier, visa, etudiant, canada, europe, bourse, migration, expatriation, RP, express entry, ${seoData.sousCategorieValue}`} />
        <link rel="canonical" href={`https://www.liggeybi.com/destination/${region}/${topicSlug}`} />
        
        {/* OpenGraph & Social SEO Metadata */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.metaDesc} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.metaDesc} />
      </Helmet>

      {/* Hero Section */}
      <div className={`bg-gradient-to-br ${isCanada ? 'from-red-950 via-zinc-900 to-red-900 text-white' : 'from-indigo-900 via-blue-900 to-indigo-800 text-white'} pt-24 pb-20 px-4 relative overflow-hidden`}>
         {/* Decorative Element */}
         <div aria-hidden="true" className={`absolute -right-20 -bottom-20 w-80 h-80 ${isCanada ? 'bg-red-500/20' : 'bg-blue-400/20'} blur-3xl rounded-full pointer-events-none`} />
         <div className="max-w-4xl mx-auto relative z-10 text-center">
            <span className={`inline-flex items-center tracking-widest text-xs font-black uppercase mb-4 px-4 py-2 rounded-full ${isCanada ? 'bg-red-500/30 border border-red-500/30' : 'bg-indigo-500/30 border border-indigo-400/30'}`}>
              <Globe2 className="w-4 h-4 mr-2" /> Destination {isCanada ? 'Canada' : 'Europe'}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
              {seoData.h1}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-medium mb-8">
              {seoData.metaDesc}
            </p>
         </div>
      </div>

      {/* Search Filter Banner */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 sm:p-4 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 md:py-2 border border-transparent focus-within:border-gray-200 transition-colors">
            <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Rechercher dans ${seoData.sousCategorieValue}...`}
              className="bg-transparent border-none outline-none w-full text-gray-800 placeholder-gray-500 text-sm"
            />
          </div>
          
          <div className="md:w-64 flex items-center bg-gray-50 rounded-xl px-4 py-3 md:py-2 border border-transparent focus-within:border-gray-200 transition-colors">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-gray-800 text-sm cursor-pointer appearance-none"
            >
              <option value="">Toutes les destinations</option>
              {locationsList.map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
          </div>

          <button 
            type="submit"
            className={`w-full md:w-auto px-8 py-3 md:py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md focus:ring-2 focus:ring-offset-2 ${
              isCanada 
                ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-900/20 focus:ring-red-500' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-900/20 focus:ring-indigo-500'
            }`}
          >
            Rechercher
          </button>
        </form>
      </div>

      <div className="w-full flex justify-center my-8 px-4 max-w-7xl mx-auto">
        <AdBanner slot="4411002421" format="auto" />
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 mt-12 grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Articles List Column */}
        <div className="lg:col-span-8 space-y-6">
           <h2 className="text-2xl font-black text-gray-900 mb-6 border-b pb-4">{seoData.contentTitle}</h2>
           
           {loading ? (
             <div className="space-y-4">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse"></div>)}
             </div>
           ) : articles.length === 0 ? (
             <div className="bg-white p-10 rounded-3xl text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  {isCanada ? <Plane className="w-10 h-10 text-gray-400" /> : <Globe2 className="w-10 h-10 text-gray-400" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun article disponible</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Il n'y a pas encore d'articles publiés pour la rubrique <strong>{seoData.sousCategorieValue}</strong>.
                </p>
             </div>
           ) : (
             <>
               <div className="space-y-5">
                {articles.map((article, index) => {
                  let rawDesc = article.seoDescription || article.description || 'Découvrez les détails de cette opportunité exceptionnelle et comment y postuler.';
                  
                  // Cleanly strip style tags, script tags, and all other HTML tags
                  let cleanHtml = rawDesc.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
                  cleanHtml = cleanHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
                  let plainDesc = cleanHtml.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
                  
                  if (plainDesc.length > 200) plainDesc = plainDesc.substring(0, 197) + '...';

                  return (
                  <React.Fragment key={article.id}>
                  <Link 
                    to={`/destination-article/${article.slug || article.id}`}
                    className="group block bg-white hover:bg-gray-50 p-5 rounded-3xl transition-all border border-gray-100 hover:border-gray-300 shadow-sm hover:shadow"
                  >
                     <div className="flex flex-col sm:flex-row gap-5 items-start">
                       {article.imageUrl ? (
                         <div className="relative block w-full sm:w-56 h-48 sm:h-36 shrink-0 rounded-2xl overflow-hidden shadow-sm bg-gray-100">
                           <img src={article.imageUrl} alt={article.titre} className="absolute inset-0 w-full h-full object-cover object-center" />
                         </div>
                       ) : (
                         <div className={`hidden sm:flex w-20 h-20 rounded-2xl shrink-0 items-center justify-center text-white shadow-inner ${isCanada ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                           {article.categorie === 'emploi' ? <Briefcase className="w-10 h-10" /> : <BookOpen className="w-10 h-10" />}
                         </div>
                       )}
                       <div className="flex-1 space-y-2 w-full overflow-hidden">
                          <h3 className={`font-black text-lg md:text-xl text-gray-900 leading-tight group-hover:${isCanada ? 'text-red-600' : 'text-indigo-600'} transition-colors line-clamp-2`}>
                            {article.titre}
                          </h3>
                          <p className="text-gray-500 text-sm line-clamp-2 md:line-clamp-3 mb-2 leading-relaxed break-words whitespace-normal overflow-hidden max-w-full">
                            {plainDesc}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500 mt-3 pt-3 border-t border-gray-100">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                              {article.lieu || (isCanada ? 'Canada' : 'Europe')}
                            </span>
                            <span className="ml-auto text-gray-400 font-medium">
                              {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                       </div>
                     </div>
                  </Link>
                  {(index === 1 || index === 5) && (
                    <div className="w-full flex justify-center my-6 rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100">
                      <AdBanner slot="7733655057" format="fluid" />
                    </div>
                  )}
                  </React.Fragment>
                 )})}
               </div>
               
               {/* Pagination mockup or real if needed */}
               {articles.length >= 20 && (
                 <div className="pt-8 text-center">
                    <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                      Charger plus d'articles
                    </button>
                 </div>
               )}

               <div className="w-full flex justify-center mt-10 mb-8">
                 <AdBanner slot="3384697577" format="auto" />
               </div>
             </>
           )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           {/* Sidebar Widgets (SunuCV, Import CV, Booster, etc.) */}
           <SidebarWidgets />

           {/* Ad Block */}
           <div className="w-full h-[600px] border border-gray-100 rounded-3xl bg-white overflow-hidden p-0 flex items-center justify-center sticky top-24">
             <AdBanner slot="7547413607" format="vertical" />
           </div>
        </div>

      </div>
    </div>
  );
}
