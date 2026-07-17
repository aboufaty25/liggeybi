import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { BuyModal } from '@/components/boutique/BuyModal';

interface Product {
  id: string;
  titre: string;
  prix: number;
  prixPromo: number | null;
  type: string;
  imageUrl: string | null;
  description: string;
  stock: number;
  slug?: string; // For formations
}

interface Banner {
  id: string;
  titre: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  location: string;
  type: 'AD' | 'PRODUCT' | 'PRODUCT_GRID' | 'FORMATION' | 'FORMATION_GRID';
  products?: Product[];
}

interface PromoBannerProps {
  location: string;
  className?: string;
}

export function PromoBanner({ location, className = "" }: PromoBannerProps) {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`/api/public/promos?location=${location}`)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        setBanners(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location]);

  if (loading || banners.length === 0) return null;

  const banner = banners[0];

  const handleProductClick = (p: Product) => {
    if (p.type === 'formation' && p.slug) {
      navigate(`/formations/${p.slug}`);
    } else {
      setBuyingProduct(p);
    }
  };

  return (
    <>
      <BuyModal product={buyingProduct} onClose={() => setBuyingProduct(null)} />
      
      {(banner.type === 'PRODUCT' || banner.type === 'FORMATION') && banner.products?.[0] ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => handleProductClick(banner.products![0])}
          className={`bg-white rounded-[1.5rem] md:rounded-[2rem] border border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] overflow-hidden flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 cursor-pointer group hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transition-all duration-500 relative ${className}`}
        >
          {/* Luminous Glow */}
          <div className="absolute inset-0 bg-[#006837]/0 group-hover:bg-[#006837]/5 transition-colors duration-500 pointer-events-none z-10" />
          
          <div className="w-full md:w-24 h-24 shrink-0 overflow-hidden rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform duration-300">
            <img src={banner.products[0].imageUrl || undefined} alt={banner.products[0].titre} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 text-center md:text-left">
            <span className="text-[8px] font-black uppercase tracking-widest text-[#006837] mb-0.5 block opacity-60">
              {banner.type === 'FORMATION' ? 'Formation en Vedette' : 'Offre Flash'}
            </span>
            <h3 className="font-black text-gray-900 text-sm md:text-base truncate tracking-tighter uppercase leading-tight">{banner.products[0].titre}</h3>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1.5 w-full md:w-auto">
            <div className="text-lg md:text-xl font-black text-gray-900 flex-1 md:flex-none text-right tracking-tight">
              {(banner.products[0].prixPromo ?? banner.products[0].prix) === 0 ? "Gratuit" : `${(banner.products[0].prixPromo ?? banner.products[0].prix).toLocaleString()} CFA`}
            </div>
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(banner.products![0]);
              }}
              className="bg-[#F7BE16] hover:bg-[#eab308] relative z-20 text-white font-black rounded-xl px-5 h-10 md:h-9 flex items-center gap-2 transform active:scale-95 transition-transform text-[10px] uppercase tracking-wider"
            >
              {banner.type === 'FORMATION' ? 'DÉCOUVRIR' : 'ACHETER'} <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ) : (banner.type === 'PRODUCT_GRID' || banner.type === 'FORMATION_GRID') && banner.products?.length ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br from-gray-50/50 to-gray-100/30 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 border border-gray-100 shadow-xl relative overflow-hidden ${className}`}
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#006837]/5 to-[#F7BE16]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#006837] text-white shadow-lg shadow-[#006837]/20">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <h3 className="font-black uppercase tracking-tighter text-base md:text-xl text-gray-900 leading-none">{banner.titre}</h3>
            </div>
            <Link to={banner.type === 'FORMATION_GRID' ? "/formations" : "/boutique"} className="hidden sm:flex text-[10px] md:text-xs font-black text-[#006837] items-center gap-1.5 hover:gap-2 transition-all tracking-widest bg-[#006837]/5 px-4 py-2 rounded-full">
              VOIR TOUT <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className={`grid ${banner.type === 'FORMATION_GRID' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'} gap-3 md:gap-5 relative z-10`}>
            {banner.products.slice(0, banner.type === 'FORMATION_GRID' ? 3 : 4).map((p, idx) => (
              <div 
                key={p.id} 
                className={`bg-white p-3 md:p-4 rounded-[1.5rem] shadow-sm border transition-all duration-500 group flex flex-col cursor-pointer relative overflow-hidden ${
                  banner.type === 'FORMATION_GRID' 
                    ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]' 
                    : p.prixPromo 
                    ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)]' 
                    : 'border-gray-100 hover:border-[#006837] hover:shadow-[0_0_25px_rgba(0,104,55,0.4)]'
                } ${banner.type === 'FORMATION_GRID' ? (idx === 2 ? 'hidden md:flex' : 'flex') : (idx >= 2 ? 'hidden md:flex' : 'flex')}`}
                onClick={() => handleProductClick(p)}
              >
                {/* Luminous Glow Effect on Hover */}
                <div className="absolute inset-0 bg-[#006837]/0 group-hover:bg-[#006837]/5 transition-colors duration-500 pointer-events-none z-10" />
                
                <div className="h-28 md:h-32 mb-3 overflow-hidden rounded-[1rem] bg-gray-50 flex items-center justify-center relative">
                   <img src={p.imageUrl || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                   {p.prixPromo && (
                     <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg shadow-sm">Promo</div>
                   )}
                </div>
                <h4 className="font-bold text-[11px] md:text-xs text-gray-900 line-clamp-2 md:truncate mb-1.5 group-hover:text-[#006837] transition-colors">{p.titre}</h4>
                <div className="flex flex-wrap items-baseline gap-1.5 mb-3">
                  <p className="text-sm border-b-2 border-[#F7BE16] pb-0.5 md:text-base font-black text-gray-900 leading-none">
                    {(p.prixPromo ?? p.prix) === 0 ? "Gratuit" : `${(p.prixPromo ?? p.prix).toLocaleString()} CFA`}
                  </p>
                  {p.prixPromo !== null && p.prixPromo !== undefined && (
                    <p className="text-[10px] font-bold text-gray-400 line-through">{p.prix === 0 ? "Gratuit" : `${p.prix.toLocaleString()} CFA`}</p>
                  )}
                </div>
                <div className="mt-auto">
                   <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(p);
                    }}
                    className="w-full relative z-20 rounded-xl text-[10px] font-black bg-[#006837] hover:bg-[#004d29] text-white h-9 shadow-md shadow-[#006837]/20 transform active:scale-95 transition-all group-hover:bg-[#004d29]"
                   >
                     {banner.type === 'FORMATION_GRID' ? 'DÉCOUVRIR' : 'ACHETER'}
                   </Button>
                </div>
              </div>
            ))}
          </div>
          <Link to={banner.type === 'FORMATION_GRID' ? "/formations" : "/boutique"} className="sm:hidden mt-4 flex justify-center text-[10px] font-black text-[#006837] items-center gap-1.5 tracking-widest bg-[#006837]/5 px-4 py-3 rounded-xl uppercase">
            VOIR PLUS <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => {
            if (banner.linkUrl) {
              window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
            } else {
              navigate('/boutique');
            }
          }}
          className={`relative overflow-hidden cursor-pointer rounded-[1.5rem] md:rounded-[2rem] shadow-lg group border border-gray-100 hover:border-[#F7BE16] hover:shadow-[0_0_30px_rgba(247,190,22,0.4)] transition-all duration-500 ${className}`}
        >
          <img 
            src={banner.imageUrl || undefined} 
            alt={banner.titre} 
            className="w-full h-full object-cover min-h-[140px] md:min-h-[160px] max-h-[220px] transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 md:p-5 text-left pointer-events-none">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1 flex flex-col items-start">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                  Annonce
                </span>
              </div>
              
              {banner.linkUrl ? (
                <a 
                  href={banner.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-white/20 backdrop-blur-md border border-white/50 text-white flex items-center justify-center shrink-0 hover:bg-white hover:text-black transition-all hover:scale-110 shadow-lg pointer-events-auto"
                >
                  <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              ) : (
                <Link 
                  to="/boutique"
                  className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-[#F7BE16] text-white flex items-center justify-center shrink-0 shadow-lg hover:scale-110 transition-transform active:scale-95 group/bag pointer-events-auto"
                >
                  <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
