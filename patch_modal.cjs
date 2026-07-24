const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const targetStr = `{cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').sort((a, b) => b.prix - a.prix).map((pkg) => {
                 const isRecommended = pkg.prix >= 900;
                 return (
                 <div key={pkg.id} className={\`bg-white border rounded-2xl p-4 md:p-5 flex flex-col gap-3 transition-all cursor-pointer group relative overflow-hidden \${isRecommended ? 'border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02] bg-amber-50/10' : 'border-slate-200 hover:border-amber-300 hover:shadow-md'}\`} onClick={() => handleCheckoutPackage(pkg.id)}>
                    {isRecommended && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" /> 🔥 Choix N°1 (70% des candidats)
                      </div>
                    )}
                    <div className="flex justify-between items-center relative z-10">
                       <div className="flex-1 pr-4">
                         <h4 className={\`font-black uppercase tracking-tight transition-colors \${isRecommended ? 'text-amber-700 text-lg' : 'text-slate-900 text-base group-hover:text-amber-600'}\`}>{pkg.nom}</h4>
                         <div className="text-lg font-black text-slate-800 mt-0.5 flex items-baseline gap-1">
                            {pkg.prix === 0 ? "Gratuit" : \`\${pkg.prix} FCFA\`}
                            {pkg.dureeJours >= 99999 && pkg.nom.toLowerCase().includes('starter') ? null : <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {pkg.dureeJours >= 99999 ? 'À vie' : \`\${pkg.dureeJours} Jours\`}</span>}
                         </div>
                         {isRecommended && (
                           <div className="text-xs font-medium text-amber-800/80 mt-2">
                             <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-black uppercase mr-1">Avantage</span>
                             <div className="mt-1 flex flex-col gap-1">
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span>Candidatures <b>en tête de liste</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span>Badge <b>Profil Vérifié</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span><b>Visibilité Premium</b> dans la CVthèque</span></div>
                             </div>
                           </div>
                         )}
                         {!isRecommended && (
                           <div className="text-[10px] font-medium text-slate-400 mt-2">
                             Import simple, visibilité standard.
                           </div>
                         )}
                       </div>
                       <Button size="sm" className={\`shrink-0 text-white rounded-xl px-5 h-10 text-[10px] font-black uppercase tracking-widest \${isRecommended ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20' : 'bg-slate-800 hover:bg-slate-900 shadow-md'}\`}>{pkg.prix === 0 ? 'Activer' : (isRecommended ? 'Choisir ce pack' : 'Acheter')}</Button>
                    </div>
                 </div>
                 );
               })}`;

const replacementStr = `{cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').sort((a, b) => b.prix - a.prix).map((pkg) => {
                 const isVIP = pkg.prix >= 1400;
                 const isRecommended = pkg.prix >= 900 && pkg.prix < 1400;
                 const isBasic = pkg.prix < 900;
                 
                 return (
                 <div key={pkg.id} className={\`bg-white border rounded-2xl p-4 md:p-5 flex flex-col gap-3 transition-all cursor-pointer group relative overflow-hidden \${isVIP ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02] bg-indigo-50/30' : isRecommended ? 'border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02] bg-amber-50/10' : 'border-slate-200 hover:border-amber-300 hover:shadow-md'}\`} onClick={() => handleCheckoutPackage(pkg.id)}>
                    {isRecommended && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" /> 🔥 Choix N°1 (70% des candidats)
                      </div>
                    )}
                    {isVIP && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 fill-white" /> 🚀 Ultra Rapide
                      </div>
                    )}
                    <div className="flex justify-between items-center relative z-10">
                       <div className="flex-1 pr-4">
                         <h4 className={\`font-black uppercase tracking-tight transition-colors \${isVIP ? 'text-indigo-800 text-lg' : isRecommended ? 'text-amber-700 text-lg' : 'text-slate-900 text-base group-hover:text-amber-600'}\`}>{pkg.nom}</h4>
                         <div className="text-lg font-black text-slate-800 mt-0.5 flex items-baseline gap-1">
                            {pkg.prix === 0 ? "Gratuit" : \`\${pkg.prix} FCFA\`}
                            {pkg.dureeJours >= 99999 && pkg.nom.toLowerCase().includes('starter') ? null : <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {pkg.dureeJours >= 99999 ? 'À vie' : \`\${pkg.dureeJours} Jours\`}</span>}
                         </div>
                         
                         {isVIP && (
                           <div className="text-xs font-medium text-indigo-900/80 mt-2">
                             <div className="mt-1 flex flex-col gap-1">
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" /> <span><b>Recommandation directe</b> par notre IA aux recruteurs</span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" /> <span>Badge exclusif <b>Top Candidat</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" /> <span>Tout le contenu du pack Premium</span></div>
                             </div>
                           </div>
                         )}
                         
                         {isRecommended && (
                           <div className="text-xs font-medium text-amber-800/80 mt-2">
                             <div className="mt-1 flex flex-col gap-1">
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span>Candidatures <b>en tête de liste</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span>Badge <b>Profil Vérifié</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span><b>Visibilité Premium</b> dans la CVthèque</span></div>
                             </div>
                           </div>
                         )}
                         
                         {isBasic && (
                           <div className="text-[10px] font-medium text-slate-400 mt-2">
                             Import simple, visibilité standard.
                           </div>
                         )}
                       </div>
                       <Button size="sm" className={\`shrink-0 text-white rounded-xl px-5 h-10 text-[10px] font-black uppercase tracking-widest \${isVIP ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20' : isRecommended ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20' : 'bg-slate-800 hover:bg-slate-900 shadow-md'}\`}>{pkg.prix === 0 ? 'Activer' : (isVIP ? 'Prendre ce pack' : isRecommended ? 'Choisir ce pack' : 'Acheter')}</Button>
                    </div>
                 </div>
                 );
               })}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Modal patched");
