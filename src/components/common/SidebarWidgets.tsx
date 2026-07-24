import React from 'react';
import { cachedFetch } from '@/lib/fetchCache';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UploadCloud, Briefcase, ExternalLink, Sparkles } from 'lucide-react';

export function SidebarWidgets({ hideWhatsApp }: { hideWhatsApp?: boolean } = {}) {
  const [siteConfig, setSiteConfig] = React.useState<any>({});

  React.useEffect(() => {
    cachedFetch('/api/config/site')
      .then(res => res.json())
      .then(data => setSiteConfig(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload CV box */}
      <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 group">
         <div className="h-16 w-16 bg-amber-100/50 rounded-2xl flex items-center justify-center border border-amber-200 mb-4 shrink-0 group-hover:scale-105 transition-transform duration-300">
           <UploadCloud className="h-8 w-8 text-amber-500" />
         </div>
         <h3 className="text-xl font-black text-slate-900 mb-2">Promouvoir mon CV</h3>
         <p className="text-slate-500 text-sm mb-6 font-medium leading-tight">Augmentez votre visibilité et soyez contacté directement par notre réseau de recruteurs.</p>
         <Button nativeButton={false} render={<Link to="/candidat" className="w-full" />} variant="outline" className="w-full border-2 border-amber-200 text-amber-900 hover:border-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-300 font-black rounded-xl">Importer mon CV</Button>
      </div>

      {/* Promotion SunuCV */}
      <div className="bg-gradient-to-br from-emerald-600 to-[#006837] rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-900/20 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-500 relative overflow-hidden group" onClick={() => window.open('https://sunucv.com', '_blank')}>
         <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:bg-white/20"></div>
         
         <div className="w-24 h-32 bg-white rounded-lg shadow-xl relative z-10 rotate-3 group-hover:rotate-6 transition-transform duration-300 border-[3px] border-emerald-100 shrink-0 overflow-hidden flex flex-col mb-4">
           <div className="w-full h-8 bg-slate-800 flex items-center px-2 relative shadow-inner">
              <div className="absolute -bottom-3 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center p-[1px] shadow border border-slate-200">
                 <img src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=200&auto=format&fit=crop" alt="Avatar" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="ml-7 text-white flex flex-col pt-0.5 w-full">
                <span className="text-[6px] font-black leading-none truncate w-[90%]">Khadija Fall</span>
                <span className="text-[4px] font-medium leading-none text-emerald-300 mt-0.5 truncate">Ingénieure Cloud</span>
              </div>
           </div>

           <div className="flex-1 mt-4 px-2 pb-2 flex gap-1.5">
              <div className="flex-[1.8] flex flex-col gap-1 border-r border-slate-100 pr-1">
                <div>
                  <div className="h-[3px] w-8 bg-emerald-500 rounded-full mb-1 flex items-center">
                     <div className="w-2 h-full bg-emerald-700 rounded-full"></div>
                  </div>
                  
                  <div className="flex gap-1 items-start mt-1">
                     <div className="w-[3px] h-[3px] bg-slate-300 rounded-full shrink-0 mt-[1px]"></div>
                     <div className="flex flex-col gap-[1px] w-full">
                       <div className="h-[2px] bg-slate-700 rounded-full w-full"></div>
                       <div className="h-[2px] bg-slate-300 rounded-full w-5/6"></div>
                       <div className="h-[2px] bg-slate-200 rounded-full w-full"></div>
                     </div>
                   </div>
                   
                  <div className="flex gap-1 items-start mt-1.5">
                     <div className="w-[3px] h-[3px] bg-slate-300 rounded-full shrink-0 mt-[1px]"></div>
                     <div className="flex flex-col gap-[1px] w-full">
                       <div className="h-[2px] bg-slate-700 rounded-full w-4/5"></div>
                       <div className="h-[2px] bg-slate-300 rounded-full w-full"></div>
                     </div>
                   </div>
                </div>
              </div>

              <div className="flex-[1] flex flex-col gap-1.5 pl-0.5">
                 <div className="h-[3px] w-full bg-slate-800 rounded-full mb-0.5"></div>
                 <div className="space-y-[2px] w-full pr-1">
                   <div className="h-[2px] bg-slate-200 rounded-full w-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: '90%'}}></div></div>
                   <div className="h-[2px] bg-slate-200 rounded-full w-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: '75%'}}></div></div>
                   <div className="h-[2px] bg-slate-200 rounded-full w-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: '60%'}}></div></div>
                 </div>
                 
                 <div className="mt-1">
                   <div className="h-[3px] w-full bg-slate-800 rounded-full mb-1"></div>
                   <div className="flex flex-wrap gap-[1px] pr-1">
                      <div className="w-2 h-2 border border-emerald-500 bg-emerald-50 rounded-[2px]"></div>
                      <div className="w-2 h-2 bg-slate-200 rounded-[2px]"></div>
                      <div className="w-2 h-2 bg-slate-200 rounded-[2px]"></div>
                      <div className="w-2 h-2 bg-slate-200 rounded-[2px]"></div>
                   </div>
                 </div>
              </div>
           </div>
         </div>
         
         <div className="relative z-10 flex flex-col w-full text-center">
           <div className="inline-flex items-center justify-center mb-1 gap-1.5 opacity-90 mx-auto">
             <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[#a7f3d0]">100% en ligne</span>
           </div>
           <h3 className="text-xl font-black text-white mb-2 leading-tight">Un CV<br/>Professionnel</h3>
           <p className="text-emerald-50 text-xs mb-4 font-medium leading-relaxed">Générez un CV moderne en 5 min avec &lt;SunuCV.com&gt;</p>
           <Button className="w-full bg-white text-[#006837] hover:bg-emerald-50 font-black rounded-xl shadow-lg transition-transform group-hover:scale-[1.02] flex items-center justify-center gap-1.5">
             Créer mon CV <ExternalLink className="h-4 w-4" />
           </Button>
         </div>
      </div>

      {/* Recruiter space */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 group">
         <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent"></div>
         <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-4 relative z-10 shrink-0 group-hover:scale-105 transition-transform duration-300">
           <Briefcase className="h-8 w-8 text-emerald-400" />
         </div>
         <div className="relative z-10 flex-col w-full">
           <h3 className="text-xl font-black text-white mb-2">Vous recrutez ?</h3>
           <p className="text-slate-400 text-sm mb-6 font-medium">Trouvez les meilleurs talents et accédez à notre CVthèque.</p>
           <Button nativeButton={false} render={<Link to="/recruteur" className="w-full" />} className="w-full bg-[#006837] hover:bg-[#004d29] text-white font-black rounded-xl transition-colors">Publier une offre</Button>
         </div>
      </div>

      {!hideWhatsApp && (
      <div className="bg-gradient-to-b from-[#128C7E] to-[#25D366] rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden flex flex-col items-center text-center">
         <div className="absolute -left-8 -bottom-8 text-white/5 pointer-events-none">
           <svg viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
         </div>
         
         <div className="relative z-10 flex flex-col items-center">
           <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner mb-4">
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
           </div>
           <h3 className="text-xl font-black mb-2 text-white">Alertes WhatsApp</h3>
           <p className="text-emerald-50 text-xs mb-6 max-w-2xl font-medium">Recevez directement sur WhatsApp les dernières offres.</p>
           
           <Button nativeButton={false} render={<a href={siteConfig.whatsapp_channel_url || "https://whatsapp.com/channel/0029Vb5e4tw4inotGoAu0A0r"} target="_blank" rel="noopener noreferrer" className="w-full" />} className="w-full bg-white hover:bg-slate-50 text-[#075E54] font-black rounded-xl shadow-xl transition-transform hover:scale-105">S'abonner</Button>
         </div>
      </div>
      )}
    </div>
  );
}
