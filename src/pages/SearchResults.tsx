import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { JobCard } from '@/components/cards/JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, ChevronRight, Briefcase, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/ads/AdBanner';
import { cachedFetch } from '@/lib/fetchCache';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sousCategorie = searchParams.get('sousCategorie') || '';
  const [lieu, setLieu] = useState(searchParams.get('lieu') || '');
  const [results, setResults] = useState<any[]>([]);
  const [fallbackResults, setFallbackResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    cachedFetch('/api/config/site').then(res => res.json()).then(data => setSiteConfig(data)).catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q');
    const categoryVal = formData.get('category');
    const lieuVal = formData.get('lieu');
    
    let searchUrl = '/recherche?';
    if (q) searchUrl += `q=${encodeURIComponent(q as string)}&`;
    if (categoryVal) searchUrl += `category=${encodeURIComponent(categoryVal as string)}&`;
    if (lieuVal) searchUrl += `lieu=${encodeURIComponent(lieuVal as string)}`;
    
    navigate(searchUrl);
  };

  const categoryNameMapping: any = {
    'offre-demploi': "Offre d'emploi",
    'bourses': "Bourses d'études",
    'concours': "Concours",
    'formation': "Formation",
    'stage': "Stage",
    'europe': "Europe",
    'canada': "Canada"
  };

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setFallbackResults([]);
      
      const lieuParam = searchParams.get('lieu') || '';
      setLieu(lieuParam);

      try {
        let apiUrl = `/api/public/offres?limit=50`;
        if (query) apiUrl += `&q=${encodeURIComponent(query)}`;
        if (category) apiUrl += `&categorie=${encodeURIComponent(category)}`;
        if (sousCategorie) apiUrl += `&sousCategorie=${encodeURIComponent(sousCategorie)}`;
        if (lieuParam) apiUrl += `&lieu=${encodeURIComponent(lieuParam)}`;

        const localRes = await cachedFetch(apiUrl);

        let combinedResults: any[] = [];

        if (localRes.ok) {
           const localData = await localRes.json();
           const matchingLocalJobs = localData.data || [];

           const mappedLocalJobs = matchingLocalJobs.map((job: any) => {
              return {
                 id: job.id,
                 type: 'local',
                 slug: `offre/${job.slug || job.id}`,
                 title: job.titre,
                 date: job.createdAt,
                 isUrgent: job.isUrgent,
                 isPremium: false,
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
           
           combinedResults = [...mappedLocalJobs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        setResults(combinedResults);

        // If no results and location is set, fetch fallback without location
        if (combinedResults.length === 0 && lieuParam) {
           let fallbackUrl = `/api/public/offres?limit=20`;
           if (query) fallbackUrl += `&q=${encodeURIComponent(query)}`;
           if (category) fallbackUrl += `&categorie=${encodeURIComponent(category)}`;
           if (sousCategorie) fallbackUrl += `&sousCategorie=${encodeURIComponent(sousCategorie)}`;
           
           const fbRes = await cachedFetch(fallbackUrl);
           if (fbRes.ok) {
             const fbData = await fbRes.json();
             const mappedFbJobs = (fbData.data || []).map((job: any) => {
                return {
                   id: job.id,
                   type: 'local',
                   slug: `offre/${job.slug || job.id}`,
                   title: job.titre,
                   date: job.createdAt,
                   isUrgent: job.isUrgent,
                   isPremium: false,
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
             setFallbackResults(mappedFbJobs);
           }
        }

      } catch (error) {
        console.error("Error searching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, category, sousCategorie, searchParams]);

  const pageTitle = [query, sousCategorie ? sousCategorie : (category ? categoryNameMapping[category] : ''), lieu].filter(Boolean).join(' - ');

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Helmet>
        <title>{`Résultats pour "${pageTitle || 'Recherche'}" | Liggeybi`}</title>
      </Helmet>

      {/* Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 pt-8 pb-8">
        <div className="container mx-auto px-4 mb-4">
           <AdBanner slot="2905716196" />
        </div>
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            <Link to="/" className="hover:text-white hover:underline transition-colors">Accueil</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Recherche</span>
          </nav>

          <header className="space-y-3 max-w-4xl">
             <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
               Recherche d'opportunités
             </h1>
             
             {query || category ? (
               <div className="flex flex-wrap items-center gap-3 mt-4">
                 {query && (
                   <span className="inline-flex items-center px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm font-bold text-emerald-100">
                     <SearchIcon className="w-4 h-4 mr-2 text-emerald-300" />
                     {query}
                   </span>
                 )}
                 {category && (
                   <span className="inline-flex items-center px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm font-bold text-emerald-100">
                     <Briefcase className="w-4 h-4 mr-2 text-emerald-300" />
                     {categoryNameMapping[category] || category}
                   </span>
                 )}
               </div>
             ) : null}

             <p className="text-slate-400 font-medium text-base md:text-lg mt-4 mb-4">
               {loading ? (
                 <span className="animate-pulse">Recherche en cours...</span>
               ) : (
                 `${results.length} opportunité${results.length !== 1 ? 's' : ''} trouvée${results.length !== 1 ? 's' : ''}`
               )}
             </p>
          </header>

           {/* Search Form inside a neat card */}
           <div className="max-w-4xl w-full mt-6 sm:px-6 md:px-0">
             <div className="relative group">
               <div className="absolute -inset-1 md:-inset-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 rounded-full blur-md opacity-40 md:opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-gradient-slow bg-[length:200%_200%]"></div>
               
               <div className="relative bg-white/95 backdrop-blur-md p-1 md:p-1.5 rounded-full shadow-2xl border border-white/50">
                 <form 
                   onSubmit={handleSearch}
                   className="flex flex-row items-center divide-x divide-slate-100"
                 >
               <div className="flex-[1.5] w-full flex items-center h-10 md:h-14 px-3 md:px-5 group/input hover:bg-slate-50/50 transition-colors rounded-l-full focus-within:bg-slate-50 min-w-0">
                 <SearchIcon className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 shrink-0 group-focus-within/input:scale-110 transition-transform duration-300" />
                 <input 
                   type="text" 
                   name="q"
                   defaultValue={query}
                   placeholder="Métier, mot-clé..." 
                   className="flex-1 bg-transparent border-none text-[13px] md:text-[15px] focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 w-full ml-2 md:ml-3 h-full min-w-0"
                 />
               </div>
               
               <div className="flex-1 w-full flex items-center h-10 md:h-14 px-2 md:px-5 group/input hover:bg-slate-50/50 transition-colors focus-within:bg-slate-50 min-w-0 hidden md:flex">
                 <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 shrink-0 group-focus-within/input:scale-110 transition-transform duration-300 hidden sm:block" />
                 <select name="category" defaultValue={category} className="flex-1 bg-transparent border-none text-[13px] md:text-[15px] font-medium focus:outline-none focus:ring-0 text-slate-800 outline-none w-full cursor-pointer h-full appearance-none sm:ml-2 md:ml-3 pl-1 pr-3 md:px-1 truncate min-w-0">
                   <option value="">Catégories</option>
                   <option value="offre-demploi">Offres d'emploi</option>
                   <option value="stage">Stages</option>
                   <option value="bourses">Bourses d'études</option>
                   <option value="concours">Concours</option>
                   <option value="europe">Europe</option>
                   <option value="canada">Canada</option>
                 </select>
               </div>
               
               <div className="flex-1 w-full flex items-center h-10 md:h-14 px-2 md:px-5 group/input hover:bg-slate-50/50 transition-colors focus-within:bg-slate-50 min-w-0 border-l border-slate-100">
                 <MapPin className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 shrink-0 group-focus-within/input:scale-110 transition-transform duration-300 hidden sm:block" />
                 <select name="lieu" defaultValue={lieu} className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 font-medium text-[13px] md:text-[15px] outline-none sm:ml-2 md:ml-3 h-full w-full appearance-none cursor-pointer min-w-0 pl-1 pr-3 md:px-1 truncate">
                   <option value="">Toutes les régions</option>
                   <option value="Dakar">Dakar</option>
                   <option value="Diourbel">Diourbel</option>
                   <option value="Fatick">Fatick</option>
                   <option value="Kaffrine">Kaffrine</option>
                   <option value="Kaolack">Kaolack</option>
                   <option value="Kédougou">Kédougou</option>
                   <option value="Kolda">Kolda</option>
                   <option value="Louga">Louga</option>
                   <option value="Matam">Matam</option>
                   <option value="Saint-Louis">Saint-Louis</option>
                   <option value="Sédhiou">Sédhiou</option>
                   <option value="Tambacounda">Tambacounda</option>
                   <option value="Thiès">Thiès</option>
                   <option value="Ziguinchor">Ziguinchor</option>
                 </select>
               </div>
               
               <div className="h-10 md:h-14 shrink-0 flex items-center pr-1 md:pr-0 pl-1 md:pl-2">
                 <Button type="submit" className="h-8 md:h-14 w-8 md:w-auto md:px-8 rounded-full bg-gradient-to-r from-emerald-600 to-[#006837] hover:from-emerald-500 hover:to-emerald-700 text-white font-black text-[13px] md:text-base shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all relative overflow-hidden group/btn flex items-center justify-center !p-0 md:!px-8">
                   <span className="relative z-10 hidden md:flex items-center justify-center gap-2">
                     Rechercher
                   </span>
                   <SearchIcon className="h-3.5 w-3.5 relative z-10 md:hidden" />
                 </Button>
               </div>
             </form>
            </div>
           </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl bg-white shadow-sm" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-4">
              {results.map((post) => (
                <JobCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-3xl mx-auto w-full">
                 <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                      <SearchIcon className="h-8 w-8 text-gray-300" />
                    </div>
                 </div>
                 <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Aucun résultat dans cette région</h3>
                 <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto px-4">
                   Nous n'avons pas trouvé d'opportunités correspondant à votre recherche pour <span className="font-bold text-gray-900">{lieu || "cette recherche"}</span>. 
                   {lieu ? " Voici d'autres d'opportunités dans d'autres régions." : " Essayez de modifier vos critères ou de retirer certains filtres."}
                 </p>
                 {!lieu && (
                   <div className="mt-8">
                     <Link to="/" className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">
                       Retour à l'accueil
                     </Link>
                   </div>
                 )}
              </div>
              
              {lieu && fallbackResults.length > 0 && (
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="text-emerald-500 h-5 w-5" /> 
                    Autres opportunités (Toutes régions)
                  </h3>
                  <div className="flex flex-col gap-4">
                    {fallbackResults.map((post) => (
                      <JobCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
