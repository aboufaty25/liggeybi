import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Building2, Clock, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

interface JobCardProps {
  post: any;
  variant?: 'large' | 'small';
  isPremiumGrid?: boolean;
}

export function JobCard({ post, variant = 'small', isPremiumGrid = false }: JobCardProps) {
  const siteConfig = useSiteConfig();
  const category = post.categories?.nodes?.[0] || { slug: post.categorie, name: post.categorie };
  const acf = post.acfOffre || { 
    typeContrat: post.typeContrat,
    nomEntreprise: post.entreprise,
    lieu: post.lieu,
  };
  
  const title = post.title || post.titre;
  const originalImageUrl = post.logoUrl || post.featuredImage?.node?.sourceUrl || post.imageUrl;
  
  // Resolve the image url: original -> category default -> global default
  const catDefaultImg = category?.slug ? siteConfig[`default_job_image_${category.slug}`] : null;
  const imageUrl = originalImageUrl || catDefaultImg || siteConfig.default_job_image;
  
  const date = post.date || post.createdAt || new Date().toISOString();

  // We determine the link. If it's a DB post (has .titre or lacks WP fields), we route to /offre/:id unless it has a slug. 
  // Actually, wait, DB posts use /offre/:id but WP posts use /:slug. 
  // Let's use post.slug if available. For local offers, we can use `/offre/${post.slug || post.id}`.
  // We can tell it's a local offer if it has post.titre instead of post.title or if it doesn't have post.categories.
  const isLocalOffer = !!post.titre || !post.categories;
  const linkUrl = isLocalOffer ? `/offre/${post.slug || post.id}` : `/${post.slug}`;

  const showPremium = isPremiumGrid || post.isPremium;
  const showUrgent = post.isUrgent && !showPremium;
  const isGlowingRed = showPremium || showUrgent;

  return (
    <motion.div
      whileHover={{ x: 4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Link to={linkUrl} state={{ post }} className="block w-full">
        <Card className={`relative overflow-hidden p-2.5 md:p-4 w-full flex flex-row items-center gap-3 md:gap-6 transition-all duration-300 rounded-2xl ${isGlowingRed ? 'border-2 border-rose-500 bg-rose-50/10' : 'border border-slate-200 bg-white hover:border-slate-800 shadow-none hover:shadow-lg hover:shadow-slate-200'}`}>
          {showPremium ? (
             <div className="absolute top-0 right-0 z-20">
               <div className="bg-slate-900 text-amber-400 text-[9px] uppercase font-black px-3 py-1 rounded-bl-xl flex items-center">
                 <Crown className="w-3 h-3 mr-1" /> Premium
               </div>
             </div>
          ) : showUrgent ? (
             <div className="absolute top-0 right-0 z-20">
               <div className="bg-rose-600 text-white text-[9px] uppercase font-black px-3 py-1 rounded-bl-xl flex items-center">
                 <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1.5" /> Urgent
               </div>
             </div>
          ) : null}

          {imageUrl ? (
            <div className="relative h-12 w-12 md:h-20 md:w-20 shrink-0 bg-slate-50 border border-slate-100 p-1 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="relative h-12 w-12 md:h-20 md:w-20 shrink-0 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 text-slate-400">
               <Building2 className="h-8 w-8 opacity-50" />
            </div>
          )}
          
          <CardContent className="p-0 flex flex-col flex-1 relative justify-center min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {!showPremium && category?.name && (
                <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-extrabold bg-slate-100 text-slate-600 border-none px-2 rounded-md shrink-0">
                  {category.name}
                </Badge>
              )}
              {acf?.typeContrat && (
                <span className="text-[10px] text-slate-500 font-bold bg-white border border-slate-200 px-2 rounded-md shrink-0">
                  {acf.typeContrat}
                </span>
              )}
            </div>
            
            <h3 
              className="font-black text-slate-900 leading-snug mb-0.5 md:mb-1.5 text-xs md:text-base line-clamp-2 truncate whitespace-normal"
              dangerouslySetInnerHTML={{ __html: title || '' }}
            />

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] md:text-[11px] font-bold text-slate-500">
              {acf?.nomEntreprise && (
                <div className="flex items-center text-slate-700">
                  <Building2 className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  <span className="truncate max-w-[120px] md:max-w-[200px]">{acf.nomEntreprise}</span>
                </div>
              )}
              {acf?.lieu && (
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span className="truncate max-w-[100px]">{acf.lieu}</span>
                </div>
              )}
              {date && (
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
