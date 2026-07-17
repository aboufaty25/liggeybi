import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AdBanner } from '@/components/ads/AdBanner';
import { ArrowRight, Calendar, MapPin, Share2 } from 'lucide-react';
import { JobCard } from '@/components/cards/JobCard';
import { SidebarWidgets } from '@/components/common/SidebarWidgets';

export function DestinationArticleDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id') || idOrSlug;

  const [job, setJob] = useState<any>(null);
  const [similarJobs, setSimilarJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const articleWrapperRef = useRef<HTMLDivElement>(null);
  const [adContainers, setAdContainers] = useState<HTMLElement[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadJob = async () => {
      try {
        const res = await fetch(`/api/public/offres/${id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);

          if (data.categorie) {
            const similarRes = await fetch(`/api/public/offres?categorie=${data.categorie}&limit=5`);
            if (similarRes.ok) {
               const similarData = await similarRes.json();
               const filteredSimilar = (similarData.data || []).filter((j: any) => j.id !== data.id).slice(0, 4);
               setSimilarJobs(filteredSimilar);
            }
          }
        } else {
            navigate('/');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id, navigate]);

  useEffect(() => {
    if (!job || !articleWrapperRef.current) return;

    const wrapper = articleWrapperRef.current;
    
    // Clear previous ad containers
    setAdContainers(prev => {
        prev.forEach(el => el.remove());
        return [];
    });

    const paragraphs = Array.from(wrapper.querySelectorAll('.article-content-body > p, .article-content-body > h3, .article-content-body > h2, .article-content-body > div'));
    if (paragraphs.length >= 6) {
       // TRES ESPACER: on divise par 5 
       const interval = Math.floor(paragraphs.length / 5) || 3;
       const newContainers: HTMLElement[] = [];
       
       paragraphs.forEach((p, index) => {
          if (index > 0 && index % interval === 0 && index < paragraphs.length - 2) {
             const div = document.createElement('div');
             div.className = "my-12 w-full flex justify-center bg-gray-50/50 rounded-2xl overflow-hidden py-4 border border-gray-100 px-2 not-prose";
             p.insertAdjacentElement('afterend', div);
             newContainers.push(div);
          }
       });
       setAdContainers(newContainers);
    }
    
    return () => {
       setAdContainers(prev => {
           prev.forEach(el => el.remove());
           return [];
       });
    };
  }, [job?.description]);

  const shareOffer = () => {
    if (navigator.share) {
      navigator.share({
        title: job.titre,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!job) return null;

  const isCanada = job.categorie === 'canada';
  const seoImage = job.imageUrl || 'https://www.liggeybi.com/social-share.jpg';
  
  let cleanDesc = job.seoDescription || '';
  if (!cleanDesc && job.description) {
    let cleanHtml = job.description.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleanHtml = cleanHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanDesc = cleanHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
  }

  // Specific class for Jodit Editor generated content to retain native HTML styles and formats
  // We use `jodit-wysiwyg` as well as standard unreset classes to allow raw HTML CSS to work properly.
  const contentClassName = "prose sm:prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-xl article-content-body jodit-wysiwyg";

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      <Helmet>
        <title>{`${job.titre} | Liggeybi`}</title>
        <meta name="description" content={cleanDesc} />
        <link rel="canonical" href={`https://www.liggeybi.com/destination-article/${job.slug || job.id}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.liggeybi.com/destination-article/${job.slug || job.id}`} />
        <meta property="og:title" content={job.titre} />
        <meta property="og:description" content={cleanDesc} />
        <meta property="og:image" content={seoImage} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={"https://www.liggeybi.com/destination-article/" + (job.slug || job.id)} />
        <meta property="twitter:title" content={job.titre} />
        <meta property="twitter:description" content={cleanDesc} />
        <meta property="twitter:image" content={seoImage} />
        
        {/* Basic CSS to enforce some editor styling that Tailwind resets might break */}
        <style>{`
          .jodit-wysiwyg * {
            max-width: 100%;
          }
          .jodit-wysiwyg p {
            margin-bottom: 1em;
          }
          .jodit-wysiwyg blockquote {
            border-left: 4px solid #ccc;
            padding-left: 1em;
            margin-left: 0;
            color: #666;
          }
        `}</style>
      </Helmet>

      {/* AD TOP: en haut avant tout contenu, juste apres le header global */}
      <div className="w-full flex justify-center bg-transparent mt-4 mb-4 px-4 max-w-7xl mx-auto">
          <AdBanner slot="4411002421" format="auto" />
      </div>

      {/* Hero Header Area */}
      <div className={`w-full py-12 md:py-20 relative overflow-hidden ${isCanada ? 'bg-gradient-to-br from-red-600 to-red-900' : 'bg-gradient-to-br from-indigo-800 to-indigo-950'}`}>
         <div className="absolute inset-0 bg-black/10"></div>
         <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${isCanada ? 'bg-red-500/20 text-white border border-red-400/30' : 'bg-indigo-500/20 text-white border border-indigo-400/30'}`}>
               <MapPin className="w-3 h-3" />
               {job.lieu || (isCanada ? 'Canada' : 'Europe')}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white max-w-4xl mx-auto leading-tight md:leading-tight tracking-tight">
               {job.titre}
            </h1>
            <div className="flex items-center justify-center gap-6 mt-6">
               <div className="flex items-center text-white/80 font-medium text-sm">
                  <Calendar className="w-4 h-4 mr-2 opacity-70" />
                  {new Date(job.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
               </div>
               <button onClick={shareOffer} className="flex flex-col items-center justify-center p-3 sm:px-6 sm:py-3 sm:flex-row gap-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors backdrop-blur-sm shadow-sm font-semibold border border-white/10">
                 <Share2 className="w-4 h-4" />
                 <span className="text-sm">Partager</span>
               </button>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20 max-w-7xl">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8 space-y-8">
               
               {/* Main Image */}
               {job.imageUrl && (
                 <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl relative group bg-white max-h-[500px]">
                   <img 
                     src={job.imageUrl}
                     alt={job.titre} 
                     className="w-full h-full object-cover sm:object-contain object-center bg-gray-900"
                     referrerPolicy="no-referrer"
                   />
                 </div>
               )}

               {/* Content Card */}
               <div className="bg-white rounded-[2rem] p-6 sm:p-10 border shadow-lg shadow-gray-200/50 border-gray-100 overflow-hidden" ref={articleWrapperRef}>
                   <div 
                     className={contentClassName}
                     dangerouslySetInnerHTML={{ __html: job.description }} 
                   />
                   
                   {/* Dynamically injected internal ad banners */}
                   {adContainers.map((container, index) => 
                     createPortal(<AdBanner key={`portal-${index}`} slot="7733655057" format="fluid" />, container)
                   )}
               </div>

               <div className="w-full flex justify-center mt-8">
                  <AdBanner slot="3384697577" format="horizontal" />
               </div>

               {/* Similar Articles */}
               {similarJobs.length > 0 && (
                  <section className="mt-16 space-y-6">
                    <div className="flex items-center justify-between">
                       <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Plus d'articles similaires</h2>
                       <Link to={`/destinations/${job.categorie}`} className="hidden sm:flex text-sm font-bold text-blue-600 hover:text-blue-700 items-center">
                          Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                       </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {similarJobs.map(sj => (
                          <JobCard key={sj.id} post={sj} />
                       ))}
                    </div>
                    <div className="sm:hidden mt-4">
                       <Link to={`/destinations/${job.categorie}`} className="flex w-full justify-center bg-white border border-gray-200 py-3 rounded-xl text-sm font-bold text-gray-700">
                          Voir tous les articles
                       </Link>
                    </div>
                  </section>
               )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8 lg:mt-0 mt-8">
               {/* AD TOP INSIDE SIDEBAR */}
               <div className="w-full flex justify-center sticky top-24">
                  <div className="w-full space-y-6">
                     <AdBanner slot="2905716196" format="rectangle" />
                     
                     {/* Widgets: SunuCV, Import CV, Booster */}
                     <SidebarWidgets />

                     {/* AD BOTTOM INSIDE SIDEBAR */}
                     <AdBanner slot="7547413607" format="vertical" />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

