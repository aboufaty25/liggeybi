import React, { useState, useEffect } from 'react';
import { Package, Search, ShoppingBag, ArrowRight, Star, Zap, Clock, ShieldCheck, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PromoBanner } from '@/components/common/PromoBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BuyModal } from '@/components/boutique/BuyModal';

interface Product {
  id: string;
  titre: string;
  slug: string;
  description: string;
  prix: number;
  prixPromo: number | null;
  type: string;
  fileUrl: string | null;
  imageUrl: string | null;
  stock: number;
  category?: { nom: string };
}

export function Boutique() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Buy state
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const url = selectedCategory ? `/api/public/products?categoryId=${selectedCategory}` : '/api/public/products';
      const [prodRes, catRes] = await Promise.all([
        fetch(url),
        fetch('/api/public/product-categories')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setLoading(false);
    } catch(err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-12 space-y-12 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-[#006837] border-t-transparent rounded-full animate-spin" />
        <p className="font-black uppercase tracking-widest text-[#006837]">Préparation de votre boutique...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Hero Section - Slimmer Version */}
        <section className="mb-10 relative">
          <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-gray-100 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#006837]/5 rounded-full -mr-32 -mt-32 blur-2xl" />
             
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left space-y-4">
                   <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">Marketplace</Badge>
                   <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tighter uppercase">
                     Boutique <span className="text-[#006837]">Premium</span>
                   </h1>
                   <p className="text-gray-500 text-sm md:text-base font-medium max-w-xl">
                      Boostez votre carrière avec nos ressources exclusives : CV, formations et produits officiels.
                   </p>
                </div>
                <div className="relative hidden md:block">
                   <div className="h-40 w-40 bg-gradient-to-br from-[#006837] to-gray-900 rounded-3xl rotate-3 shadow-lg flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-white" />
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Promo Banner Placement */}
        <PromoBanner location="HOME" className="mb-12" />

        {/* Search and Categories Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
          <div className="relative w-full md:w-96 shrink-0">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
             <input 
               type="text" 
               placeholder="Rechercher un produit..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full h-12 bg-white rounded-2xl pl-12 pr-4 border border-gray-100 shadow-sm focus:border-[#006837] focus:ring-1 focus:ring-[#006837] outline-none font-medium text-sm transition-all"
             />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full scrollbar-hide">
             <button 
               onClick={() => setSelectedCategory(null)}
               className={`px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap shadow-sm border ${!selectedCategory ? 'bg-gray-900 text-white border-transparent' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
             >
               Tout voir
             </button>
             {categories.map(cat => (
               <button 
                 key={cat.id}
                 onClick={() => setSelectedCategory(cat.id)}
                 className={`px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap shadow-sm border ${selectedCategory === cat.id ? 'bg-gray-900 text-white border-transparent' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
               >
                 {cat.nom}
               </button>
             ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <AnimatePresence mode="popLayout">
            {products.filter(p => p.titre.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category?.nom || '').toLowerCase().includes(searchQuery.toLowerCase())).map((product, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                key={product.id} 
                onClick={() => {
                  if (!(product.type === 'PHYSICAL' && product.stock <= 0)) {
                    setBuyingProduct(product);
                  }
                }}
                className={`group bg-white rounded-2xl md:rounded-[2rem] border overflow-hidden flex flex-col transition-all duration-500 cursor-pointer relative ${
                  product.prixPromo 
                    ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                    : 'border-gray-100 shadow-xl hover:border-[#006837] hover:shadow-[0_0_30px_rgba(0,104,55,0.3)]'
                }`}
              >
                {/* Luminous Glow Effect on Hover */}
                <div className="absolute inset-0 bg-[#006837]/0 group-hover:bg-[#006837]/5 transition-colors duration-500 pointer-events-none z-10" />
                
                <div className="relative h-40 md:h-56 overflow-hidden bg-gray-50">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.titre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-white/90 backdrop-blur px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-sm text-[#006837]">
                      {product.type === 'DIGITAL' ? 'Digital' : 'Physique'}
                    </span>
                    {product.prixPromo && (
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-red-500 px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-sm text-white animate-pulse">
                        Solderie
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-3 md:p-6 flex-1 flex flex-col">
                  <p className="text-[8px] md:text-[10px] font-black uppercase text-[#006837] tracking-widest mb-1 truncate">{product.category?.nom || 'Général'}</p>
                  <h3 className="font-bold text-gray-900 text-sm md:text-lg mb-3 flex-1 line-clamp-2 leading-tight group-hover:text-[#006837] transition-colors">{product.titre}</h3>
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-3 gap-1 md:gap-0 mt-auto">
                    <div className="space-y-0.5 md:space-y-1">
                       {product.prixPromo ? (
                         <>
                           <p className="text-gray-400 text-[10px] md:text-xs line-through font-bold">{product.prix.toLocaleString()} CFA</p>
                           <p className="text-base md:text-2xl font-black text-gray-900 leading-none">{product.prixPromo.toLocaleString()} CFA</p>
                         </>
                       ) : (
                         <p className="text-base md:text-2xl font-black text-gray-900 leading-none">{product.prix.toLocaleString()} CFA</p>
                       )}
                    </div>
                    {product.type === 'PHYSICAL' && (
                      <span className={`text-[9px] md:text-[10px] font-bold ${product.stock > 10 ? 'text-green-500' : 'text-orange-500'}`}>
                         Stock: {product.stock}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBuyingProduct(product);
                    }}
                    disabled={product.type === 'PHYSICAL' && product.stock <= 0}
                    className="w-full relative z-20 h-9 md:h-12 bg-[#006837] hover:bg-[#004d29] text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-1.5 md:gap-2 group/btn"
                  >
                    {product.type === 'PHYSICAL' && product.stock <= 0 ? 'Rupture' : (
                      <><span className="hidden md:inline">{product.type === 'DIGITAL' ? 'ACHETER MAINTENANT' : 'COMMANDER'}</span><span className="md:hidden">ACHETER</span> <ArrowRight className="h-3 md:h-3.5 w-3 md:w-3.5 transition-transform group-hover/btn:translate-x-1" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {products.filter(p => p.titre.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category?.nom || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
           <div className="text-center py-32 space-y-6">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Search className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black uppercase text-gray-900">Aucun produit trouvé</h2>
                 <p className="text-gray-400 font-medium">Revenez plus tard ou changez de recherche.</p>
              </div>
              <Button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} className="rounded-xl font-black uppercase">Réinitialiser</Button>
           </div>
        )}

        {/* Trust Badges */}
        <section className="mt-24 grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'Livraison Rapide', desc: 'Produits digitaux envoyés instantanément par email après validation.' },
            { icon: ShieldCheck, title: '100% Sécurisé', desc: 'Paiement sécurisé via PayDunya (Wave, Orange Money, Free Money).' },
            { icon: Clock, title: 'Support Client', desc: 'Notre équipe est disponible pour répondre à toutes vos questions.' }
          ].map((trust, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center space-y-4">
              <div className="h-14 w-14 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center text-gray-900">
                 <trust.icon className="h-7 w-7" />
              </div>
              <h4 className="font-black uppercase text-sm tracking-tight">{trust.title}</h4>
              <p className="text-gray-400 text-xs font-medium leading-relaxed">{trust.desc}</p>
            </div>
          ))}
        </section>

        {/* Buy Modal */}
        <BuyModal product={buyingProduct} onClose={() => setBuyingProduct(null)} />
      </div>
    </div>
  );
}
