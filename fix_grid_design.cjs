const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const oldGridStart = `                  {cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').sort((a, b) => b.prix - a.prix).map((pkg, index) => {
                    const isRecommended = pkg.prix >= 900 || index === 1;
                    
                    const colorClasses = index % 3 === 0 
                      ? 'from-blue-600 to-cyan-700 shadow-blue-900/20 ring-blue-400' 
                      : index % 3 === 1 
                        ? 'from-[#006837] to-emerald-700 shadow-emerald-900/20 ring-emerald-400'
                        : 'from-purple-600 to-fuchsia-700 shadow-purple-900/20 ring-fuchsia-400';`;

const newGridStart = `                  {cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').sort((a, b) => b.prix - a.prix).map((pkg) => {
                    const isVIP = pkg.prix >= 1400;
                    const isRecommended = pkg.prix >= 900 && pkg.prix < 1400;
                    const isBasic = pkg.prix < 900;
                    
                    const colorClasses = isVIP 
                      ? 'from-indigo-700 to-purple-800 shadow-indigo-900/20 ring-indigo-500' 
                      : isRecommended 
                        ? 'from-amber-500 to-orange-600 shadow-amber-900/20 ring-amber-400'
                        : 'from-slate-700 to-slate-800 shadow-slate-900/20 ring-slate-500';`;

content = content.replace(oldGridStart, newGridStart);

const oldLabel = `                      {isRecommended && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-4 md:py-1.5 rounded-b-lg md:rounded-b-xl z-20 shadow-sm flex items-center gap-1 w-max">
                          <Star className="w-2 h-2 md:w-3 md:h-3 fill-yellow-400 text-yellow-400" /> <span className="hidden sm:inline">Recommandé</span><span className="sm:hidden">Top</span>
                        </div>
                      )}`;

const newLabel = `                      {isRecommended && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white text-amber-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-4 md:py-1.5 rounded-b-lg md:rounded-b-xl z-20 shadow-sm flex items-center gap-1 w-max">
                          <Star className="w-2 h-2 md:w-3 md:h-3 fill-amber-500 text-amber-500" /> <span className="hidden sm:inline">Choix N°1</span><span className="sm:hidden">Top</span>
                        </div>
                      )}
                      {isVIP && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white text-indigo-700 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-4 md:py-1.5 rounded-b-lg md:rounded-b-xl z-20 shadow-sm flex items-center gap-1 w-max">
                          <Crown className="w-2 h-2 md:w-3 md:h-3 fill-indigo-600 text-indigo-600" /> <span className="hidden sm:inline">Ultra Rapide</span><span className="sm:hidden">VIP</span>
                        </div>
                      )}`;

content = content.replace(oldLabel, newLabel);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Grid layout styling patched");
