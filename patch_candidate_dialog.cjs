const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const targetDialogList = `{cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').map((pkg) => (
                 <div key={pkg.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => handleCheckoutPackage(pkg.id)}>
                    <div className="flex justify-between items-center">
                       <div>
                         <h4 className="font-black text-slate-900 text-base uppercase tracking-tight group-hover:text-amber-600 transition-colors">{pkg.nom}</h4>
                         <div className="text-lg font-black text-slate-800 mt-1 flex items-baseline gap-1">
                            {pkg.prix === 0 ? "Gratuit" : \`\${pkg.prix} FCFA\`}
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {pkg.dureeJours >= 99999 ? 'À vie' : \`\${pkg.dureeJours} Jours\`}</span>
                         </div>
                       </div>
                       <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5 h-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">{pkg.prix === 0 ? 'Activer' : 'Acheter'}</Button>
                    </div>
                 </div>
               ))}`;

const replacementDialogList = `{cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').sort((a, b) => b.prix - a.prix).map((pkg) => {
                 const isRecommended = pkg.prix >= 900;
                 return (
                 <div key={pkg.id} className={\`bg-white border rounded-2xl p-4 md:p-5 flex flex-col gap-3 transition-all cursor-pointer group relative overflow-hidden \${isRecommended ? 'border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02] bg-amber-50/10' : 'border-slate-200 hover:border-amber-300 hover:shadow-md'}\`} onClick={() => handleCheckoutPackage(pkg.id)}>
                    {isRecommended && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" /> Recommandé
                      </div>
                    )}
                    <div className="flex justify-between items-center relative z-10">
                       <div className="flex-1 pr-4">
                         <h4 className={\`font-black uppercase tracking-tight transition-colors \${isRecommended ? 'text-amber-700 text-lg' : 'text-slate-900 text-base group-hover:text-amber-600'}\`}>{pkg.nom}</h4>
                         <div className="text-lg font-black text-slate-800 mt-0.5 flex items-baseline gap-1">
                            {pkg.prix === 0 ? "Gratuit" : \`\${pkg.prix} FCFA\`}
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {pkg.dureeJours >= 99999 ? 'À vie' : \`\${pkg.dureeJours} Jours\`}</span>
                         </div>
                         {isRecommended && (
                           <div className="text-xs font-medium text-amber-800/80 mt-2">
                             <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-black uppercase mr-1">Avantage</span>
                             Vos candidatures sont placées <b>en tête de liste</b> chez les recruteurs, avec un label <b>Profil Vérifié</b>.
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

content = content.replace(targetDialogList, replacementDialogList);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Dialog patched for upselling 990 pack");
