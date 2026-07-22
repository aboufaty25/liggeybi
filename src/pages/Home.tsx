import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Search, Send, MapPin, Briefcase, GraduationCap, Trophy, UploadCloud, BellRing, BookOpen, ExternalLink, Sparkles, User } from 'lucide-react';
import { PromoBanner } from '@/components/common/PromoBanner';
import { AdBanner } from '@/components/ads/AdBanner';
import { PremiumCvSlider } from '@/components/common/PremiumCvSlider';
import { DestinationSections } from '@/components/common/DestinationSections';
import { SpontaneousApplicationWidget } from '@/components/common/SpontaneousApplicationWidget';
import { cachedFetch } from '@/lib/fetchCache';

export function Home() {
  const [isHomeSearchEnabled, setIsHomeSearchEnabled] = useState(true);
  const [isHomeCvSliderEnabled, setIsHomeCvSliderEnabled] = useState(true);
  const [siteConfig, setSiteConfig] = useState<any>({});

  const navigate = useNavigate();

  useEffect(() => {
    cachedFetch('/api/config/site')
      .then(res => {
        if (!res.ok) throw new Error('Could not fetch site config');
        return res.json();
      })
      .then(data => {
        setSiteConfig(data);
        if (data.home_search_enabled === 'false') setIsHomeSearchEnabled(false);
        if (data.home_cv_slider_enabled === 'false') setIsHomeCvSliderEnabled(false);
      })
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q');
    const lieu = formData.get('lieu');
    const searchParams = new URLSearchParams();
    if (q) searchParams.set('q', q.toString());
    if (lieu) searchParams.set('lieu', lieu.toString());
    navigate(`/recherche?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Helmet>
        <title>Liggeybi — Votre Carrière Commence Ici</title>
        <meta name="description" content="Trouvez les meilleures opportunités de carrière, emplois, stages, formations et bourses au Sénégal." />
      </Helmet>

      {/* Top AdSense Banner (Fluid and beautifully integrated) */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-4 py-2 flex justify-center">
           <div className="w-full max-w-6xl flex items-center justify-center relative min-h-[90px]">
             <AdBanner slot="7733655057" format="auto" />
             <div className="absolute inset-0 pointer-events-none border border-dashed border-slate-700/50 rounded-lg m-1 -z-10 flex items-center justify-center">
               <span className="text-slate-600 font-medium text-[10px] md:text-xs tracking-widest uppercase">Publicité</span>
             </div>
           </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-slate-900 pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Trouvez l'emploi qui <br className="hidden md:block"/> vous correspond au <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500">Sénégal</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Des milliers d'offres d'emploi, de formations et de bourses vous attendent. Propulsez votre carrière dès aujourd'hui.
            </p>

            {isHomeSearchEnabled && (
              <div className="mt-8 max-w-3xl w-full px-4 sm:px-6 md:px-0 mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 md:-inset-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 rounded-full blur-md opacity-40 md:opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-gradient-slow bg-[length:200%_200%]"></div>
                  
                  <div className="relative bg-white/95 backdrop-blur-md p-1 md:p-1.5 rounded-full shadow-2xl border border-white/50">
                  <form onSubmit={handleSearch} className="flex flex-row items-center divide-x divide-slate-100">
                    <div className="flex-[1.5] w-full flex items-center h-10 md:h-14 px-3 md:px-5 group/input hover:bg-slate-50/50 transition-colors rounded-l-full focus-within:bg-slate-50 min-w-0">
                      <Search className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 shrink-0 group-focus-within/input:scale-110 transition-transform duration-300" />
                      <input 
                        type="text" 
                        name="q"
                        placeholder="Emploi, mot-clé..." 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium text-[13px] md:text-[15px] outline-none ml-2 md:ml-3 h-full w-full min-w-0"
                      />
                    </div>
                    <div className="flex-1 w-full flex items-center h-10 md:h-14 px-2 md:px-5 group/input hover:bg-slate-50/50 transition-colors focus-within:bg-slate-50 min-w-0">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 shrink-0 group-focus-within/input:scale-110 transition-transform duration-300 hidden sm:block" />
                      <select name="lieu" className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 font-medium text-[13px] md:text-[15px] outline-none sm:ml-2 md:ml-3 h-full w-full appearance-none cursor-pointer min-w-0 pl-1 pr-3 md:px-1 truncate">
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
                        <Search className="h-3.5 w-3.5 relative z-10 md:hidden" />
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-12 group-hover/btn:animate-[shine_1.5s_ease-in-out_infinite]"></div>
                      </Button>
                    </div>
                  </form>
                </div>
               </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Areas */}
      <div className="container mx-auto px-4 -mt-6 md:-mt-8 relative z-20 max-w-6xl">

        {/* Categories row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-16">
           <Link to="/offre-demploi" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-indigo-100/30 hover:shadow-2xl hover:shadow-indigo-200/50 border border-slate-100 hover:border-indigo-200 transition-all duration-300 group flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="relative font-black text-sm sm:text-lg md:text-xl xl:text-2xl text-slate-900 group-hover:text-indigo-700 transition-colors">Emplois</h3>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 mt-1 sm:mt-2">Secteur privé & public</p>
           </Link>
           <Link to="/bourses" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-emerald-100/30 hover:shadow-2xl hover:shadow-emerald-200/50 border border-slate-100 hover:border-emerald-200 transition-all duration-300 group flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="relative font-black text-sm sm:text-lg md:text-xl xl:text-2xl text-slate-900 group-hover:text-emerald-700 transition-colors">Bourses</h3>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 mt-1 sm:mt-2">Études supérieures</p>
           </Link>
           <Link to="/formations" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-amber-100/30 hover:shadow-2xl hover:shadow-amber-200/50 border border-slate-100 hover:border-amber-200 transition-all duration-300 group flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="relative font-black text-sm sm:text-lg md:text-xl xl:text-2xl text-slate-900 group-hover:text-amber-600 transition-colors">Se former</h3>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 mt-1 sm:mt-2">Formations & Coaching</p>
           </Link>
           <Link to="/concours" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-rose-100/30 hover:shadow-2xl hover:shadow-rose-200/50 border border-slate-100 hover:border-rose-200 transition-all duration-300 group flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="relative font-black text-sm sm:text-lg md:text-xl xl:text-2xl text-slate-900 group-hover:text-rose-700 transition-colors">Concours</h3>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 mt-1 sm:mt-2">Fonction publique</p>
           </Link>
           
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-16">
           {/* Upload CV box */}
           <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm flex flex-row md:flex-col items-center md:items-center md:text-center gap-4 md:gap-0 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 group">
              <div className="h-16 w-16 md:h-20 md:w-20 bg-amber-100/50 rounded-xl md:rounded-2xl flex items-center justify-center border border-amber-200 md:mb-5 shrink-0 group-hover:scale-105 transition-transform duration-300">
                <UploadCloud className="h-8 w-8 md:h-10 md:w-10 text-amber-500" />
              </div>
              <div className="flex-1 flex flex-col w-full text-left md:text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mb-1 md:mb-3">Promouvoir mon CV</h3>
                <p className="text-slate-500 text-xs md:text-base mb-2 md:mb-8 flex-1 font-medium leading-tight md:leading-normal">Augmentez votre visibilité auprès des milliers de recruteurs de notre réseau. Soyez contacté directement.</p>
                <Button nativeButton={false} render={<Link to="/candidat?action=importer_cv" className="w-full sm:w-auto md:w-full mt-1 md:mt-0" />} variant="outline" className="w-full border-2 border-amber-200 text-amber-900 hover:border-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-300 font-black h-10 md:h-14 rounded-lg md:rounded-xl text-xs sm:text-sm md:text-base bg-white">Importer</Button>
              </div>
           </div>

           {/* Promotion SunuCV */}
           <div className="bg-gradient-to-br from-emerald-600 to-[#006837] rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-xl shadow-emerald-900/20 flex flex-row md:flex-col items-center md:items-center md:text-center gap-4 md:gap-0 group cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-500 relative overflow-hidden" onClick={() => window.open('https://sunucv.com', '_blank')}>
              <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
              <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 md:-mr-24 md:-mt-24 pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:bg-white/20"></div>
              
              <div className="w-20 h-28 md:w-32 md:h-44 bg-white rounded-lg shadow-xl relative z-10 rotate-3 group-hover:rotate-6 transition-transform duration-300 border-[3px] border-emerald-100 shrink-0 overflow-hidden flex flex-col">
                <div className="w-full h-8 md:h-12 bg-slate-800 flex items-center px-2 md:px-3 relative shadow-inner">
                   <div className="absolute -bottom-3 md:-bottom-4 left-2 md:left-3 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center p-[1px] md:p-0.5 shadow border border-slate-200">
                      <img src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=200&auto=format&fit=crop" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                   </div>
                   <div className="ml-7 md:ml-10 text-white flex flex-col pt-0.5 w-full">
                     <span className="text-[5px] md:text-[7px] font-black leading-none truncate w-[90%]">Khadija Fall</span>
                     <span className="text-[3px] md:text-[4.5px] font-medium leading-none text-emerald-300 mt-1 truncate">Ingénieure Cloud</span>
                   </div>
                </div>

                <div className="flex-1 mt-4 md:mt-6 px-1.5 md:px-2.5 pb-2 flex gap-1.5 md:gap-2">
                   <div className="flex-[1.8] flex flex-col gap-1 md:gap-1.5 border-r border-slate-100 pr-1 md:pr-1.5">
                     <div>
                       <div className="h-[3px] md:h-[4px] w-8 md:w-12 bg-emerald-500 rounded-full mb-1 h-1.5 flex items-center">
                          <div className="w-2 h-full bg-emerald-700 rounded-full"></div>
                       </div>
                       
                       <div className="flex gap-1 md:gap-1.5 items-start mt-1.5">
                          <div className="w-[3px] h-[3px] md:w-1 md:h-1 bg-slate-300 rounded-full shrink-0 mt-[1px]"></div>
                          <div className="flex flex-col gap-[1px] md:gap-0.5 w-full">
                            <div className="h-[2.5px] md:h-[3px] bg-slate-700 rounded-full w-full"></div>
                            <div className="h-[2px] md:h-[2px] bg-slate-300 rounded-full w-5/6"></div>
                            <div className="h-[2px] md:h-[2px] bg-slate-200 rounded-full w-full"></div>
                            <div className="h-[2px] md:h-[2px] bg-slate-200 rounded-full w-2/3"></div>
                          </div>
                        </div>
                        
                       <div className="flex gap-1 md:gap-1.5 items-start mt-1.5 md:mt-2">
                          <div className="w-[3px] h-[3px] md:w-1 md:h-1 bg-slate-300 rounded-full shrink-0 mt-[1px]"></div>
                          <div className="flex flex-col gap-[1px] md:gap-0.5 w-full">
                            <div className="h-[2.5px] md:h-[3px] bg-slate-700 rounded-full w-4/5"></div>
                            <div className="h-[2px] md:h-[2px] bg-slate-300 rounded-full w-full"></div>
                            <div className="h-[2px] md:h-[2px] bg-slate-200 rounded-full w-5/6"></div>
                          </div>
                        </div>
                     </div>
                   </div>

                   <div className="flex-[1] flex flex-col gap-1.5 md:gap-2 pl-0.5">
                      <div className="h-[3px] md:h-[4px] w-full bg-slate-800 rounded-full mb-0.5 md:mb-1"></div>
                      <div className="space-y-[2px] md:space-y-[3px] w-full pr-1">
                        <div className="h-[2px] md:h-[3px] bg-slate-200 rounded-full w-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: '90%'}}></div></div>
                        <div className="h-[2px] md:h-[3px] bg-slate-200 rounded-full w-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: '75%'}}></div></div>
                        <div className="h-[2px] md:h-[3px] bg-slate-200 rounded-full w-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: '60%'}}></div></div>
                        <div className="h-[2px] md:h-[3px] bg-slate-200 rounded-full w-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: '85%'}}></div></div>
                      </div>
                      
                      <div className="mt-1 md:mt-2">
                        <div className="h-[3px] md:h-[4px] w-full bg-slate-800 rounded-full mb-1 md:mb-1.5"></div>
                        <div className="flex flex-wrap gap-[1px] md:gap-[2px] pr-1">
                           <div className="w-2 h-2 md:w-3 md:h-3 border border-emerald-500 bg-emerald-50 rounded-[2px]"></div>
                           <div className="w-2 h-2 md:w-3 md:h-3 bg-slate-200 rounded-[2px]"></div>
                           <div className="w-2 h-2 md:w-3 md:h-3 bg-slate-200 rounded-[2px]"></div>
                           <div className="w-2 h-2 md:w-3 md:h-3 border border-emerald-500 bg-emerald-50 rounded-[2px]"></div>
                           <div className="w-2 h-2 md:w-3 md:h-3 bg-slate-200 rounded-[2px]"></div>
                           <div className="w-2 h-2 md:w-3 md:h-3 bg-slate-200 rounded-[2px]"></div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="relative z-10 flex flex-col flex-1 w-full text-left md:text-center">
                <div className="hidden md:inline-flex items-center justify-center mb-2 gap-1.5 opacity-90 mx-auto">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#a7f3d0]">100% en ligne</span>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-1 md:mb-3 leading-tight">Un CV<span className="md:hidden"> pro ?</span><span className="hidden md:inline"><br/>Professionnel</span></h3>
                <p className="hidden md:block text-emerald-50 text-sm md:text-base mb-8 flex-1 font-medium leading-relaxed">Générez un CV moderne et attractif en 5 min avec &lt;SunuCV.com&gt;</p>
                <div className="w-full sm:w-auto md:w-full mt-1 md:mt-0">
                   <Button className="w-full bg-white text-[#006837] hover:bg-emerald-50 font-black h-10 md:h-14 rounded-lg md:rounded-xl shadow-lg transition-transform group-hover:scale-[1.02] flex items-center justify-center gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base">
                     Créer mon CV <ExternalLink className="h-3 w-3 md:h-5 md:w-5" />
                   </Button>
                </div>
              </div>
           </div>

           {/* Recruiter space */}
           <div className="bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-row md:flex-col items-center md:items-center md:text-center hover:shadow-xl transition-all duration-300 group md:col-span-2 lg:col-span-1 gap-4 md:gap-0">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent"></div>
              <div className="h-16 w-16 md:h-20 w-20 bg-emerald-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-emerald-500/20 md:mb-5 relative z-10 shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="h-8 w-8 md:h-10 md:w-10 text-emerald-400" />
              </div>
              <div className="relative z-10 flex-1 flex flex-col w-full text-left md:text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-1 md:mb-3">Vous recrutez ?</h3>
                <p className="hidden md:block text-slate-400 text-sm md:text-base mb-8 flex-1 font-medium">Diffusez vos offres rapidement, trouvez les meilleurs talents et accédez à notre CVthèque premium.</p>
                <Button nativeButton={false} render={<Link to="/recruteur" className="w-full sm:w-auto md:w-full mt-1 md:mt-0" />} className="w-full bg-[#006837] hover:bg-[#004d29] text-white font-black h-10 md:h-14 rounded-lg md:rounded-xl transition-colors text-xs sm:text-sm md:text-base">Publier une offre</Button>
              </div>
           </div>
        </div>

        {/* Spontaneous Application Inline Widget */}
        <SpontaneousApplicationWidget />

        {/* Premium CV Slider */}
        {isHomeCvSliderEnabled && <PremiumCvSlider />}

        {/* Destination Sections for Europe and Canada */}
        <DestinationSections />
      </div>
    </div>
  );
}
