import React, { useState, useEffect } from 'react';
import { cachedFetch } from '@/lib/fetchCache';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Menu, User, Bell, Briefcase, GraduationCap, Trophy, BookOpen, ShoppingBag, Plus, ArrowRight, ChevronRight, Crown, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

import { Separator } from '@/components/ui/separator';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [isMobileMenuEnabled, setIsMobileMenuEnabled] = useState(true);
  const [isHeaderSearchEnabled, setIsHeaderSearchEnabled] = useState(true);
  const [isBoutiquePromoEnabled, setIsBoutiquePromoEnabled] = useState(true);
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    cachedFetch('/api/config/site')
      .then(res => {
        if (!res.ok) throw new Error('Could not fetch site config');
        return res.json();
      })
      .then(data => {
        if (data.logoUrl) setSiteLogo(data.logoUrl);
        if (data.mobile_menu_enabled === 'false') setIsMobileMenuEnabled(false);
        if (data.header_search_enabled === 'false') setIsHeaderSearchEnabled(false);
        if (data.boutique_promo_enabled === 'false') setIsBoutiquePromoEnabled(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 2) {
        try {
          const localRes = await fetch(`/api/public/offres?q=${encodeURIComponent(searchQuery)}&limit=5`);
          if (localRes.ok) {
             const localData = await localRes.json();
             const localJobs = localData.data || [];
             
             const mappedJobs = localJobs.map((job: any) => ({
                id: job.id,
                slug: job.slug || job.id,
                title: job.titre,
                category: job.categorie,
                logoUrl: job.logoUrl || job.imageUrl
             }));
             setSuggestions(mappedJobs);
          } else {
             setSuggestions([]);
          }
        } catch (err) {
          console.error(err);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery)}`);
      setSuggestions([]);
    }
  };

  const navLinks = [
    { name: 'Emploi', href: '/offre-demploi', icon: Briefcase, color: 'text-slate-900' },
    { name: 'Bourses', href: '/bourses', icon: GraduationCap, color: 'text-amber-500' },
    { name: 'Concours', href: '/concours', icon: Trophy, color: 'text-rose-600' },
    { name: 'Formation', href: '/formations', icon: BookOpen, color: 'text-slate-900' },
    { name: 'Boutique', href: '/boutique', icon: ShoppingBag, color: 'text-rose-600' },
    { name: 'Candidature', href: '/candidature-spontanee', icon: Briefcase, color: 'text-indigo-600', mobileOnly: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          {siteLogo ? (
            <img src={siteLogo} alt="Liggeybi Logo" className="h-10 object-contain mr-2" />
          ) : (
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900">
              LIGGEYBI<span className="hidden md:inline text-rose-600">.COM</span>
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.filter(l => l.name !== 'Boutique' && !l.mobileOnly).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-semibold text-gray-700 hover:text-slate-900 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Search & Profile */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {isHeaderSearchEnabled && (
            <div className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 lg:w-48 h-9 rounded-full pl-9 text-xs border-gray-200 focus:ring-blue-500 transition-all focus:w-56 lg:focus:w-64"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              </form>
              {suggestions.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  {suggestions.map((post) => (
                    <Link
                      key={post.id}
                      to={`/offre/${post.slug}`}
                      className="flex items-center p-3 hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSuggestions([]);
                        setSearchQuery('');
                        setIsMobileSearchOpen(false);
                      }}
                    >
                      {post.logoUrl && (
                        <img
                          src={post.logoUrl}
                          alt={post.title}
                          className="w-10 h-10 rounded object-contain bg-gray-50 p-1 mr-3 border border-gray-100"
                        />
                      )}
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate" dangerouslySetInnerHTML={{ __html: post.title }} />
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                          {post.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Boutique Button */}
          {isBoutiquePromoEnabled && <Link to="/boutique" className="hidden md:flex ml-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
              <Button 
                size="sm" 
                className="relative bg-white hover:bg-gray-50 text-gray-900 font-black rounded-xl px-5 py-2 h-10 shadow-lg flex items-center gap-2 border border-gray-100"
              >
                <ShoppingBag className="h-5 w-5 text-[#ED1C24] group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden xl:flex items-center tracking-tighter text-sm uppercase">
                  BOUTIQUE&nbsp;&nbsp;<span className="bg-[#ED1C24] text-white px-2 py-0.5 rounded-md text-[10px] font-black shadow-md border border-red-500">PROMO</span>
                </span>
                <span className="xl:hidden flex items-center tracking-tighter text-sm uppercase">
                  SHOP&nbsp;&nbsp;<span className="bg-[#ED1C24] text-white px-1.5 py-0.5 rounded-md text-[10px] font-black shadow-md border border-red-500">PROMO</span>
                </span>
              </Button>
            </motion.div>
          </Link>}

          {isLoading ? (
             <div className="hidden md:flex w-24 h-10 animate-pulse bg-slate-100 rounded-xl"></div>
          ) : user ? (
            <div className="hidden md:flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="sm" className="hidden md:flex font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 border-gray-100 border rounded-xl px-4">
                      <User className="mr-2 h-4 w-4" />
                      Moi
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-gray-100 shadow-xl p-2 z-[60]">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest text-gray-400 p-3">Connecté : {user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-50" />
                    <DropdownMenuItem className="rounded-xl font-bold p-3 focus:bg-slate-50 focus:text-slate-900 cursor-pointer" onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : user.role === 'RECRUTEUR' ? '/recruteur' : '/candidat')}>
                       Tableau de Bord
                    </DropdownMenuItem>
                    {(user.role === 'RECRUTEUR' || user.role === 'ADMIN') && (
                      <DropdownMenuItem className="rounded-xl font-bold p-3 focus:bg-slate-50 focus:text-slate-900 cursor-pointer text-emerald-600 focus:text-emerald-700" onClick={() => navigate('/cvtheque')}>
                        CVthèque premium
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-gray-50" />
                    <DropdownMenuItem className="rounded-xl font-bold p-3 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer" onClick={logout}>
                       Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {user.role !== 'CANDIDAT' && (
                <Button nativeButton={false} render={<Link to="/recruteur" />} size="sm" className="bg-[#006837] hover:bg-[#004d29] text-white font-bold rounded-xl px-4 shadow-sm h-10">Publier une offre</Button>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Button nativeButton={false} render={<Link to="/connexion" />} variant="ghost" size="sm" className="font-bold text-gray-700 hover:text-slate-900 border border-transparent hover:bg-slate-50 rounded-xl h-10 px-4"><User className="mr-2 h-4 w-4" /> Connexion</Button>
              <Button nativeButton={false} render={<Link to="/recruteur" />} size="sm" className="bg-[#006837] hover:bg-[#004d29] text-white font-bold h-10 rounded-xl px-4 shadow-sm">Publier une offre</Button>
            </div>
          )}

          <div className="flex md:hidden items-center gap-2">
            {isHeaderSearchEnabled && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={`h-9 w-9 rounded-xl transition-colors ${isMobileSearchOpen ? 'bg-slate-100 text-slate-900' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {isBoutiquePromoEnabled && <Link to="/boutique" className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 rounded-xl blur opacity-70 transition duration-500 animate-pulse"></div>
              <Button 
                size="xs" 
                className="relative bg-white hover:bg-gray-50 text-gray-900 font-black rounded-xl px-3 h-9 shadow-md flex items-center gap-1.5 border border-gray-100 text-[11px] uppercase tracking-tighter"
              >
                <ShoppingBag className="h-4 w-4 text-[#ED1C24]" />
                BOUTIQUE&nbsp;&nbsp;<span className="bg-[#ED1C24] text-white px-1.5 py-0.5 rounded text-[8px] font-black shadow-sm">PROMO</span>
              </Button>
            </Link>}
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" className="lg:hidden p-2 text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors ml-1">
                  <Menu className="h-7 w-7" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0 flex flex-col bg-slate-50 border-r-0">
  {/* Header Section */}
  <div className="px-6 py-8 bg-blue-700 text-white rounded-br-[3rem] shadow-md relative overflow-hidden shrink-0">
     <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
     {isLoading ? (
       <div className="flex items-center gap-4 animate-pulse relative z-10">
         <div className="w-14 h-14 bg-white/20 rounded-full"></div>
         <div className="space-y-2">
           <div className="h-4 w-24 bg-white/20 rounded"></div>
           <div className="h-3 w-16 bg-white/20 rounded"></div>
         </div>
       </div>
     ) : user ? (
       <div className="flex items-center gap-4 relative z-10">
         <div className="w-14 h-14 rounded-full border-2 border-white/20 bg-blue-600 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
           {user.image ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" /> : <User className="h-6 w-6 text-white" />}
         </div>
         <div className="flex flex-col">
           <span className="font-black text-lg line-clamp-1">{user.name}</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">{user.role}</span>
         </div>
       </div>
     ) : (
       <div className="flex flex-col relative z-10">
         <h2 className="font-black text-2xl mb-1">Bienvenue !</h2>
         <p className="text-blue-100 text-xs font-medium">Connectez-vous pour profiter de toutes les fonctionnalités.</p>
         <div className="flex gap-2 mt-4">
           <Button nativeButton={false} render={<Link to="/connexion" onClick={() => setIsOpen(false)} />} className="bg-white text-blue-700 hover:bg-blue-50 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl h-10 px-2 sm:px-4 flex-1">Connexion</Button>
           <Button nativeButton={false} render={<Link to="/inscription" onClick={() => setIsOpen(false)} />} className="bg-blue-800 text-white hover:bg-blue-900 border border-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl h-10 px-2 sm:px-4 flex-1">Inscription</Button>
         </div>
       </div>
     )}
  </div>

  <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar pb-24">
     
     {user && (
       <div className="mb-6 grid grid-cols-2 gap-3">
         <Link to={user.role === 'ADMIN' ? '/admin' : user.role === 'RECRUTEUR' ? '/recruteur' : '/candidat'} onClick={() => setIsOpen(false)} className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
           <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
             <User className="w-5 h-5" />
           </div>
           <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-slate-700">Mon Espace</span>
         </Link>

         {(user.role === 'RECRUTEUR' || user.role === 'ADMIN') ? (
           <Link to="/cvtheque" onClick={() => setIsOpen(false)} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 sm:p-4 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
               <Crown className="w-5 h-5" />
             </div>
             <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-emerald-800">CVthèque</span>
           </Link>
         ) : (
           <Link to="/candidat" onClick={() => setIsOpen(false)} className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 sm:p-4 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
             <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
               <FileText className="w-5 h-5" />
             </div>
             <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-orange-800">Mon CV</span>
           </Link>
         )}
       </div>
     )}

     <div className="space-y-2 mb-6">
       <div className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</div>
       {navLinks.filter(l => l.name !== 'Boutique').map((link) => {
         const isPromo = link.name === 'Boutique';
         return (
           <Link
             key={link.name}
             to={link.href}
             className={`flex items-center space-x-3 sm:space-x-4 p-3 rounded-2xl transition-all group ${
               isPromo 
                 ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 shadow-sm' 
                 : 'bg-white border border-slate-100 shadow-sm hover:border-slate-300'
             }`}
             onClick={() => setIsOpen(false)}
           >
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                isPromo ? 'bg-red-500 text-white' 
                : link.name === 'Emploi' ? 'bg-blue-100 text-blue-600'
                : link.name === 'Bourses' ? 'bg-amber-100 text-amber-600'
                : link.name === 'Concours' ? 'bg-purple-100 text-purple-600'
                : link.name === 'Formation' ? 'bg-emerald-100 text-emerald-600'
                : link.name === 'Candidature' ? 'bg-indigo-100 text-indigo-600'
                : 'bg-slate-100 text-slate-600'
             }`}>
               <link.icon className="w-5 h-5" />
             </div>
             <span className={`text-xs sm:text-sm font-black flex-1 ${isPromo ? 'text-red-700' : 'text-slate-700'}`}>{link.name}</span>
             {isPromo ? (
               <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-md font-black shadow-sm uppercase tracking-widest animate-pulse shrink-0">Promo</span>
             ) : (
               <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
             )}
           </Link>
         );
       })}
     </div>

     <div className="mt-8 mb-4">
       <Link to="/recruteur" onClick={() => setIsOpen(false)}>
         <Button className="w-full bg-[#006837] hover:bg-[#004d29] text-white font-black text-xs sm:text-sm h-12 sm:h-14 rounded-2xl shadow-xl shadow-emerald-900/20 uppercase tracking-tight gap-2 flex items-center justify-center transition-all hover:-translate-y-1">
           Publier une offre <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
         </Button>
       </Link>
     </div>
  </div>

  {user && (
    <div className="p-4 border-t border-slate-200 bg-white absolute bottom-0 left-0 right-0 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
      <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center justify-center gap-2 p-3 text-sm font-black text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
        <LogOut className="w-4 h-4" /> Déconnexion
      </button>
    </div>
  )}
</SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="p-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  autoFocus
                  type="search"
                  placeholder="Que recherchez-vous ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 rounded-2xl pl-12 text-sm border-gray-100 bg-gray-50 focus:ring-blue-500 transition-all font-bold"
                />
                <Search className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
              </form>

              {suggestions.length > 0 && (
                <div className="mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  {suggestions.map((post) => (
                    <Link
                      key={post.id}
                      to={`/offre/${post.slug}`}
                      className="flex items-center p-4 hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        setSuggestions([]);
                        setSearchQuery('');
                        setIsMobileSearchOpen(false);
                      }}
                    >
                      {post.logoUrl && (
                        <img
                          src={post.logoUrl}
                          alt={post.title}
                          className="w-10 h-10 rounded object-contain bg-gray-50 border border-gray-100 p-1 mr-4"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate" dangerouslySetInnerHTML={{ __html: post.title }} />
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">
                          {post.category}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300 ml-2" />
                    </Link>
                  ))}
                  <button 
                    onClick={() => {
                      navigate(`/recherche?q=${encodeURIComponent(searchQuery)}`);
                      setSuggestions([]);
                      setSearchQuery('');
                      setIsMobileSearchOpen(false);
                    }}
                    className="w-full p-4 text-center text-xs font-black text-gray-400 bg-gray-50/50 hover:bg-gray-100"
                  >
                    VOIR TOUS LES RÉSULTATS
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile & Tablet Secondary Menu */}
      {isMobileMenuEnabled && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-sm">
          <div className="flex overflow-x-auto gap-3 px-4 py-3 bg-white snap-x snap-mandatory scrollbar-hide text-[10px] font-black uppercase tracking-wider text-gray-700 whitespace-nowrap items-center no-scrollbar">
            <Link to="/offre-demploi" className="snap-start shrink-0 hover:text-blue-700 hover:bg-blue-50 bg-gray-50 px-5 py-2 rounded-xl border border-transparent shadow-sm transition-all duration-300">Emploi</Link>
            <Link to="/formations" className="snap-start shrink-0 hover:text-blue-700 hover:bg-blue-50 bg-gray-50 px-5 py-2 rounded-xl border border-transparent shadow-sm transition-all duration-300">Formation</Link>
            <Link to="/bourses" className="snap-start shrink-0 hover:text-blue-700 hover:bg-blue-50 bg-gray-50 px-5 py-2 rounded-xl border border-transparent shadow-sm transition-all duration-300">Bourses</Link>
            <Link to="/concours" className="snap-start shrink-0 hover:text-blue-700 hover:bg-blue-50 bg-gray-50 px-5 py-2 rounded-xl border border-transparent shadow-sm transition-all duration-300">Concours</Link>
            <Link to="/candidature-spontanee" className="snap-start shrink-0 hover:text-purple-700 hover:bg-purple-50 bg-purple-50/50 text-purple-700 px-5 py-2 rounded-xl border border-transparent shadow-sm transition-all duration-300">Candidature Spontanée</Link>
          </div>
        </div>
      )}
    </header>
  );
}
