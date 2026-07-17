import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { PromoBanner } from '@/components/common/PromoBanner';
import { AdBanner } from '@/components/ads/AdBanner';
import { renderMarkdown } from '@/lib/markdown';

export default function FormationsList() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  useEffect(() => {
    fetch('/api/formations')
      .then(r => r.json())
      .then(data => {
        setFormations(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-12 text-center text-lg">Chargement des formations...</div>;

  const categories = Array.from(new Set(formations.map((f: any) => f.categorie).filter(Boolean)));

  const filtered = formations.filter((f: any) => {
     let match = true;
     if (search) {
        const searchLower = search.toLowerCase();
        const titreMatch = f.titre.toLowerCase().includes(searchLower);
        const descMatch = f.description && f.description.toLowerCase().includes(searchLower);
        if (!titreMatch && !descMatch) match = false;
     }
     if (selectedCat && f.categorie !== selectedCat) {
        match = false;
     }
     return match;
  });

  const stripHtml = (html: string) => {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } catch (e) {
      return html.replace(/<[^>]*>?/gm, '');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Formations en Ligne</h1>
        <p className="mt-3 md:mt-4 text-lg md:text-xl text-gray-500">Développez vos compétences avec nos experts et obtenez des certifications.</p>
      </div>

      <div className="mb-8 max-w-3xl mx-auto">
         <div className="flex flex-col md:flex-row gap-3 mb-6 relative">
            <div className="flex-1 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white shadow-sm"
               />
            </div>
            {categories.length > 0 && (
               <div className="relative shrink-0 md:w-56">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                     value={selectedCat}
                     onChange={(e) => setSelectedCat(e.target.value)}
                     className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-white shadow-sm"
                  >
                     <option value="">Toutes les catégories</option>
                     {categories.map((c: any) => (
                        <option key={c} value={c}>{c}</option>
                     ))}
                  </select>
               </div>
            )}
         </div>
      </div>

      <div className="mb-12">
        <PromoBanner location="FORMATIONS" />
      </div>

      <AdBanner slot="7733655057" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 mt-8">
        {filtered.map((f: any) => (
          <Link to={`/formations/${f.slug}`} key={f.id} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
            <div className="h-28 md:h-48 relative bg-gray-200 overflow-hidden">
               {f.imageUrl ? (
                 <img src={f.imageUrl} alt={f.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs md:text-base">Aucune image</div>
               )}
               {f.categorie && (
                 <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-primary/90 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm shadow-sm z-10 hidden sm:block">
                    {f.categorie}
                 </div>
               )}
               <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-lg md:rounded-full text-[10px] md:text-sm font-bold text-gray-900 shadow-sm flex flex-col md:flex-row items-end md:items-center gap-0.5 md:gap-2">
                 {f.prixPromo ? (
                   <>
                     <span className="line-through text-gray-500 text-[8px] md:text-xs">{f.prix === 0 ? 'Gratuit' : `${f.prix} FCFA`}</span>
                     <span className="text-red-600">{f.prixPromo === 0 ? 'Gratuit' : `${f.prixPromo} FCFA`}</span>
                   </>
                 ) : (
                   <span>{f.prix === 0 ? 'Gratuit' : `${f.prix} FCFA`}</span>
                 )}
               </div>
            </div>
            <div className="p-3 md:p-6 flex flex-col flex-1">
               <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2">{f.titre}</h3>
               <div className="relative flex-1 overflow-hidden h-12 md:h-16 mb-2 md:mb-4">
                 <div className="text-[10px] md:text-sm text-gray-600 line-clamp-2 md:line-clamp-3 whitespace-pre-wrap">
                   {stripHtml(f.description)}
                 </div>
               </div>
               <div className="flex items-center justify-between border-t border-gray-100 pt-2 md:pt-4">
                 <span className="text-[10px] md:text-sm text-gray-500">{f.chapitres?.length || 0} Chap.</span>
                 <span className="text-primary font-medium text-xs md:text-base group-hover:text-green-700">Voir ➔</span>
               </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl">
            <h3 className="text-xl font-medium text-gray-900">Aucune formation trouvée</h3>
            <p className="text-gray-500 mt-2">Essayez d'autres critères de recherche.</p>
          </div>
        )}
      </div>

      <div className="mt-12">
        <AdBanner slot="3384697577" />
      </div>
    </div>
  );
}