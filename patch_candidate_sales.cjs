const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

// Update Premium Packs design (Promotion Tab)
// I will locate the map loop inside promotion tab and replace the card
const oldPackLoopStart = `{cvPackages.filter(pkg => !(pkg.type === 'DEPOT' && canUpload)).map((pkg) => {`;
const oldPackLoopEnd = `                  {cvPackages.length === 0 && (`;

// We'll replace the content inside the loop
const newPackLoop = `{cvPackages.filter(pkg => !(pkg.type === 'DEPOT' && canUpload)).map((pkg) => {
                    const isDepot = pkg.type === 'DEPOT';
                    const isRecommended = pkg.prix === 900;
                    return (
                    <div key={pkg.id} className={\`relative overflow-hidden rounded-[2rem] p-6 md:p-8 flex flex-col justify-between transition-all group hover:-translate-y-1 hover:shadow-2xl border \${
                        isRecommended ? 'ring-4 ring-emerald-400 border-transparent shadow-emerald-900/30 z-10 scale-100 lg:scale-105' : 'border-slate-200'
                      } \${
                        isDepot 
                          ? 'bg-gradient-to-b from-white to-amber-50 shadow-amber-900/5 hover:border-amber-300' 
                          : 'bg-gradient-to-b from-[#006837] to-emerald-900 shadow-emerald-900/20 text-white'
                      }\`}>
                      
                      {isRecommended && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-400 text-[#006837] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-b-xl z-20 shadow-sm flex items-center gap-1.5">
                          <Star className="w-3 h-3 fill-[#006837]" /> Recommandé
                        </div>
                      )}

                      <div className={\`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-40 pointer-events-none transition-transform group-hover:scale-150 \${isDepot ? 'bg-amber-300' : 'bg-emerald-400'}\`}></div>

                      <div className="relative z-10 mb-8 mt-4">
                        <div className="flex justify-between items-start mb-6">
                           <h3 className={\`text-2xl font-black leading-tight \${isDepot ? 'text-amber-950' : 'text-white'}\`}>{pkg.nom}</h3>
                           {isDepot ? (
                             <span className="bg-amber-200 text-amber-900 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0">Dépôt</span>
                           ) : (
                             <span className="bg-emerald-400/20 text-emerald-100 border border-emerald-400/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0"><Zap className="w-3 h-3"/> Boost</span>
                           )}
                        </div>
                        
                        <div className={\`text-sm font-medium mb-8 p-4 rounded-2xl backdrop-blur-sm \${isDepot ? 'bg-white/60 text-slate-600 border border-amber-100' : 'bg-white/10 text-emerald-50 border border-white/10'}\`}>
                          {pkg.description}
                        </div>

                        <ul className="space-y-4">
                          {(pkg.options || "").split(",").map((opt, idx) => (
                            <li key={idx} className="flex items-start">
                              <Check className={\`w-5 h-5 shrink-0 mr-3 \${isDepot ? 'text-amber-500' : 'text-emerald-400'}\`} />
                              <span className={\`text-sm font-bold pt-0.5 \${isDepot ? 'text-slate-700' : 'text-emerald-50'}\`}>{opt.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={\`relative z-10 pt-6 border-t \${isDepot ? 'border-amber-200/50' : 'border-white/10'}\`}>
                        <div className="mb-6">
                           <div className="text-4xl font-black flex items-baseline gap-1">
                             {pkg.prix === 0 ? "Gratuit" : pkg.prix} 
                             {pkg.prix !== 0 && <span className="text-lg font-bold">FCFA</span>}
                           </div>
                           <div className={\`text-[10px] font-bold uppercase tracking-widest mt-1 \${isDepot ? 'text-slate-400' : 'text-emerald-300'}\`}>
                             {pkg.dureeJours >= 99999 ? 'Accès à vie' : \`Valable \${pkg.dureeJours} jours\`}
                           </div>
                        </div>
                        <Button 
                          onClick={() => handleCheckoutPackage(pkg.id)}
                          className={\`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all \${
                            isDepot 
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' 
                              : (isRecommended ? 'bg-emerald-400 text-[#006837] hover:bg-emerald-300 shadow-emerald-400/20' : 'bg-white text-[#006837] hover:bg-emerald-50 shadow-black/10')
                          }\`}
                        >
                          {pkg.prix === 0 ? "Activer maintenant" : "Sélectionner ce pack"}
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                  {cvPackages.length === 0 && (`;

content = content.replace(content.substring(content.indexOf(oldPackLoopStart), content.indexOf(oldPackLoopEnd) + 47), newPackLoop);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Patched CandidateDashboard.tsx sales");
