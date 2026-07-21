const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const regex = /<div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">([\s\S]*?)\{cvPackages\.length === 0/g;
const match = regex.exec(content);
if (match) {
    let newReplacement = `<div className="grid grid-cols-3 gap-2 md:gap-6">
                  {cvPackages.filter(pkg => !(pkg.type === 'DEPOT' && canUpload)).map((pkg, index) => {
                    const isRecommended = pkg.prix === 900 || index === 1;
                    
                    const colorClasses = index % 3 === 0 
                      ? 'from-blue-600 to-cyan-700 shadow-blue-900/20 ring-blue-400' 
                      : index % 3 === 1 
                        ? 'from-[#006837] to-emerald-700 shadow-emerald-900/20 ring-emerald-400'
                        : 'from-purple-600 to-fuchsia-700 shadow-purple-900/20 ring-fuchsia-400';

                    return (
                    <div key={pkg.id} className={\`relative overflow-hidden rounded-2xl md:rounded-[2rem] p-2 md:p-8 flex flex-col justify-between items-center md:items-stretch transition-all group hover:-translate-y-1 hover:shadow-2xl text-white bg-gradient-to-br \${colorClasses} \${isRecommended ? 'ring-2 md:ring-4 md:scale-105 z-10' : ''}\`}>
                      
                      {isRecommended && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-4 md:py-1.5 rounded-b-lg md:rounded-b-xl z-20 shadow-sm flex items-center gap-1 w-max">
                          <Star className="w-2 h-2 md:w-3 md:h-3 fill-yellow-400 text-yellow-400" /> <span className="hidden sm:inline">Recommandé</span><span className="sm:hidden">Top</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col flex-1 text-center md:text-left w-full mt-3 md:mt-0">
                        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 mb-1 md:mb-6">
                           <h3 className="text-[11px] md:text-2xl font-black leading-tight uppercase line-clamp-1">{pkg.nom}</h3>
                        </div>
                        
                        {pkg.description && (
                          <div className="text-[8px] md:text-sm font-medium mb-2 md:mb-6 md:p-4 md:rounded-2xl md:bg-white/10 md:border md:border-white/10 opacity-90 md:opacity-100 line-clamp-2 md:line-clamp-none text-center md:text-left">
                            {pkg.description}
                          </div>
                        )}

                        <ul className="hidden md:block space-y-4 mb-8">
                          {(pkg.options || "").split(",").map((opt, idx) => (
                            <li key={idx} className="flex items-start">
                              <Check className="w-5 h-5 shrink-0 mr-3 text-white/80" />
                              <span className="text-sm font-bold pt-0.5 text-white/95">{opt.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex flex-col items-center md:items-stretch shrink-0 md:border-t border-white/20 md:pt-6 w-full mt-auto">
                        <div className="text-center md:text-left mb-2 md:mb-6">
                           <div className="text-base md:text-4xl font-black flex items-baseline gap-1 justify-center md:justify-start">
                             {pkg.prix === 0 ? "Gratuit" : pkg.prix}
                              {pkg.prix !== 0 && <span className="text-[8px] md:text-lg font-bold opacity-80">FCFA</span>}
                           </div>
                           <div className="text-[7px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 md:mt-1 opacity-70 line-clamp-1">
                             {pkg.dureeJours >= 99999 ? 'À vie' : \`\${pkg.dureeJours} jours\`}
                           </div>
                        </div>
                        
                        <Button 
                           onClick={() => handleCheckoutPackage(pkg.id)}
                          className="h-7 md:h-14 px-2 md:px-0 w-full rounded-md md:rounded-2xl font-black text-[9px] md:text-xs uppercase tracking-widest shadow-xl transition-all bg-white text-gray-900 hover:bg-gray-100"
                        >
                          {pkg.prix === 0 ? "Activer" : "Choisir"}
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                  {cvPackages.length === 0`;
    content = content.replace(regex, newReplacement);
    fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
    console.log("Candidate mobile packages patched");
}
