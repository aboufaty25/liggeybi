import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { JobCard } from '@/components/cards/JobCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Filter, SortAsc, LayoutGrid, List as ListIcon, MapPin, Briefcase, GraduationCap, Trophy, BookOpen, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { cachedFetch } from '@/lib/fetchCache';

const categoryMeta: Record<string, { icon: any, color: string, title: string, desc: string, descHtml?: React.ReactNode }> = {
  'offre-demploi': { 
    icon: Briefcase, color: 'text-indigo-600', title: `Offres d'Emploi au Sénégal ${new Date().getFullYear()}`, 
    desc: 'Découvrez toutes les dernières offres d\'emploi dans tous les secteurs d\'activité au Sénégal : Banque, Assurance, BTP, Informatique, etc.',
    descHtml: <>Découvrez toutes les dernières offres d'emploi dans tous les secteurs d'activité au Sénégal : <h2 className="inline text-base font-medium">Banque, Assurance, BTP, Informatique, etc.</h2></>
  },
  bourses: { icon: GraduationCap, color: 'text-emerald-600', title: `Bourses d'Études ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, desc: 'Toutes les opportunités de bourses d\'études pour les étudiants sénégalais : France, Canada, Chine, Belgique, Maroc, etc.' },
  concours: { icon: Trophy, color: 'text-rose-600', title: 'Concours Nationaux Sénégal', desc: 'Retrouvez les dates et modalités des principaux concours nationaux : ENA, Police, Douanes, Gendarmerie, Santé, etc.' },
  formation: { icon: BookOpen, color: 'text-indigo-600', title: 'Formations & Coaching Sénégal', desc: 'Améliorez vos compétences avec notre sélection de formations certifiantes et d\'ateliers de coaching professionnel.' },
  'emploi-international': { icon: Briefcase, color: 'text-sky-600', title: 'Emploi à l\'International', desc: 'Trouvez des opportunités de travail à l\'étranger adaptées à votre profil.' },
  'candidature-spontanee': { icon: Briefcase, color: 'text-violet-600', title: 'Candidatures Spontanées', desc: 'Déposez votre CV et lettre de motivation directement auprès des plus grandes entreprises.' },
  'appels-doffres': { icon: Briefcase, color: 'text-amber-600', title: 'Appels d\'Offres & Consultations', desc: 'Retrouvez les appels d\'offres, avis à manifestation d\'intérêt et consultations en cours.' },
  'finance-business': { 
    icon: Briefcase, color: 'text-blue-700', title: 'Finance & Business', 
    desc: 'Opportunités dans la banque, la finance de marché, l\'audit et la stratégie business.',
    descHtml: <>Opportunités dans la <h2 className="inline text-base font-medium">Banque, la Finance de marché, l'Audit et la Stratégie business.</h2></>
  },
  'stage': { 
    icon: Briefcase, color: 'text-amber-500', title: 'Stages & Alternances', 
    desc: 'Lancez votre carrière avec nos opportunités de stages et parcours en alternance.',
    descHtml: <>Lancez votre carrière avec nos opportunités de <h2 className="inline text-base font-medium">Stages et parcours en Alternance.</h2></>
  }
};

import { SidebarWidgets } from '@/components/common/SidebarWidgets';
import { PromoBanner } from '@/components/common/PromoBanner';

export function CategoryPage() {
  const { category: paramCategory } = useParams<{ category: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [lieuQuery, setLieuQuery] = useState('');
  const [siteConfig, setSiteConfig] = useState<any>({});

  const navigate = useNavigate();
  // Get category from params OR from the last part of the pathname
  const category = paramCategory || location.pathname.split('/').filter(Boolean).pop();
  
  const meta = category ? categoryMeta[category] || categoryMeta['offre-demploi'] : categoryMeta['offre-demploi'];

  const SENEGAL_REGIONS = [
    "Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", 
    "Kolda", "Louga", "Matam", "Saint-Louis", "Sédhiou", "Tambacounda", 
    "Thiès", "Ziguinchor", "International", "Télétravail", "Toute la ligne"
  ];

  useEffect(() => {
    cachedFetch('/api/config/site')
      .then(res => res.json())
      .then(data => setSiteConfig(data))
      .catch(console.error);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  useEffect(() => {
    const loadPosts = async () => {
      if (!category) return;
      setLoading(true);
      try {
        const after = searchParams.get('after') || undefined;
        const pageStr = searchParams.get('page');
        const page = pageStr ? parseInt(pageStr, 10) : 1;
        const skip = (page - 1) * 12;

        let queryParams = `?categorie=${category}&limit=12&skip=${skip}`;
        if (searchQuery) queryParams += `&q=${encodeURIComponent(searchQuery)}`;
        if (lieuQuery) queryParams += `&lieu=${encodeURIComponent(lieuQuery)}`;

        const localRes = await cachedFetch(`/api/public/offres${queryParams}`);

        let combinedNodes: any[] = [];
        let hasMoreLocal = false;

        if (localRes && localRes.ok) {
           const localData = await localRes.json();
           const localJobs = localData.data || [];
           const total = localData.total || 0;
           
           hasMoreLocal = total > skip + 12;

           const categoryNameMapping: any = {
             'offre-demploi': "Offre d'emploi",
             'bourses': "Bourses d'études",
             'concours': "Concours",
             'formation': "Formation",
             'emploi-international': "Emploi International",
             'candidature-spontanee': "Candidature Spontanée",
             'appels-doffres': "Appels d'Offres",
             'finance-business': "Finance & Business",
             'stage': "Stage"
           };

           // API already sorts and filters by category, but just in case:
           const matchingLocalJobs = localJobs.filter((j: any) => j.categorie === category);
           
           const mappedLocalJobs = matchingLocalJobs.map((job: any) => {
              return {
                 id: job.id,
                 type: 'local',
                 slug: `offre/${job.slug || job.id}`,
                 title: job.titre,
                 date: job.createdAt,
                 isUrgent: job.isUrgent,
                 isPremium: false, // Display as classic job
                 categories: {
                   nodes: [{ name: categoryNameMapping[job.categorie] || "Liggeybi" }]
                 },
                 acfOffre: {
                   nomEntreprise: job.entreprise,
                   typeContrat: job.typeContrat,
                   lieu: job.lieu
                 },
                 imageUrl: job.imageUrl,
                 logoUrl: job.logoUrl,
                 featuredImage: { node: { sourceUrl: job.logoUrl || job.imageUrl || null } }
              };
           });
           
           combinedNodes = [...mappedLocalJobs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        setPosts(combinedNodes);
        // We set pageInfo combined to allow 'next' if either WP or local has more
        setPageInfo({
          hasNextPage: hasMoreLocal,
          hasPreviousPage: page > 1,
          endCursor: null,
          nextPageNum: page + 1,
          prevPageNum: page > 1 ? page - 1 : null
        });
      } catch (error) {
        console.error("Error loading category posts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [category, searchParams, searchQuery, lieuQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PromoBanner location="CATEGORY" className="mb-12" />
      <Helmet>
        <title>{`${meta.title} | Liggeybi`}</title>
        <meta name="description" content={meta.desc} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${meta.title} | Liggeybi`} />
        <meta property="og:description" content={meta.desc} />
        <meta property="og:image" content="https://picsum.photos/seed/liggeybi/1200/630" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={`${meta.title} | Liggeybi`} />
        <meta property="twitter:description" content={meta.desc} />
        <meta property="twitter:image" content="https://picsum.photos/seed/liggeybi/1200/630" />
      </Helmet>

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">
        <Link to="/" className="hover:text-blue-700">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900">{category?.replace('-', ' ')}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          <header className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full bg-slate-50 ${meta.color.replace(/text-\[/, 'text-slate-600').replace(/\]/, '')} ${meta.color.includes('emerald')?'text-emerald-500':meta.color.includes('amber')||meta.color.includes('F7BE16')?'text-amber-500':meta.color.includes('ED1C24')||meta.color.includes('orange')?'text-rose-500':'text-indigo-600'}`}>
                <meta.icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                  {meta.title}
                </h1>
                <div className="text-slate-500 text-sm mt-1 max-w-xl">
                  {meta.desc}
                </div>
              </div>
            </div>
          </header>

          <AdBanner slot="2905716196" />

          {/* Search Form & Filter */}
          <div className="w-full bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-slate-100">
            <form 
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col md:flex-row gap-2 md:gap-3"
            >
              <div className="flex-1 flex items-center bg-slate-50 rounded-xl h-12 px-4 border border-slate-100">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Rechercher...`} 
                  className="flex-1 min-w-0 bg-transparent border-none text-[14px] focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 w-full ml-3 h-full outline-none"
                />
              </div>
              
              <div className="flex-1 flex items-center bg-slate-50 rounded-xl h-12 px-4 border border-slate-100 relative">
                 <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                 <select 
                   value={lieuQuery}
                   onChange={(e) => setLieuQuery(e.target.value)}
                   className="flex-1 bg-transparent border-none text-[14px] font-medium focus:outline-none focus:ring-0 text-slate-800 outline-none w-full cursor-pointer h-full appearance-none ml-3"
                 >
                   <option value="">Lieu</option>
                   {SENEGAL_REGIONS.map(r => (
                     <option key={r} value={r}>{r}</option>
                   ))}
                 </select>
              </div>

              <div className="flex-1 flex items-center bg-slate-50 rounded-xl h-12 px-4 border border-slate-100 relative">
                 <SortAsc className="h-5 w-5 text-slate-400 shrink-0" />
                 <select 
                   className="flex-1 bg-transparent border-none text-[14px] font-medium focus:outline-none focus:ring-0 text-slate-800 outline-none w-full cursor-pointer h-full appearance-none ml-3"
                 >
                   <option value="recent">Plus récents</option>
                   <option value="popular">Populaires</option>
                 </select>
              </div>
            </form>
          </div>
          
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {posts.map((post, index) => (
                  <React.Fragment key={post.id}>
                    <JobCard post={post} />
                  </React.Fragment>
                ))}
              </div>

              {/* Pagination */}
              {pageInfo && (pageInfo.hasNextPage || pageInfo.hasPreviousPage) && (
                <div className="flex items-center justify-center space-x-4 pt-12">
                   {pageInfo.hasPreviousPage && (
                     <Link to={`/${category}?page=${pageInfo.prevPageNum}${searchParams.get('after') ? `&after=${searchParams.get('prevCursor') || ''}` : ''}`}>
                       <Button variant="outline" className="rounded-xl font-bold">
                         Précédent
                       </Button>
                     </Link>
                   )}
                   {pageInfo.hasNextPage && (
                     <Link to={`/${category}?page=${pageInfo.nextPageNum}${pageInfo.endCursor ? `&after=${pageInfo.endCursor}` : ''}`}>
                        <Button className="bg-blue-700 hover:bg-blue-800 rounded-xl font-black px-8">
                          Suivant &rarr;
                        </Button>
                     </Link>
                   )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-12">
           <AdBanner slot="3384697577" />
           
           <div className="sticky top-24 space-y-12">
             <SidebarWidgets hideWhatsApp={true} />
             <AdBanner slot="5682206784" />
           </div>
        </aside>
      </div>
      
      <PromoBanner location="BOTTOM_CATEGORY" className="w-full mt-12" />
    </div>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: any }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold leading-none ${className || ''} ${variant === 'secondary' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
      {children}
    </span>
  );
}
