const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const target = `                {!isPremiumActive ? (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                     <div className="relative z-10 md:flex items-center justify-between gap-6">
                        <div className="flex-1 mb-6 md:mb-0">
                           <div className="inline-flex items-center gap-1.5 bg-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                             <Crown className="w-3 h-3" /> CVthèque Premium
                           </div>
                           <h2 className="text-xl md:text-2xl font-black text-amber-950 leading-tight mb-2">
                             Optimisez votre visibilité auprès des recruteurs
                           </h2>
                           <p className="text-amber-800/80 font-medium text-sm md:text-base leading-relaxed">
                             Les entreprises recherchent activement des talents correspondant à votre profil. Rejoignez notre CVthèque premium afin d'accroître significativement vos opportunités professionnelles.
                           </p>
                        </div>
                        <div className="shrink-0">
                           <Button onClick={() => setActiveTab("promotion")} className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 font-black h-12 md:h-14 px-8 rounded-xl md:rounded-2xl transition-all hover:scale-105">
                             Boostez votre profil <Zap className="ml-2 w-4 h-4" />
                           </Button>
                        </div>
                     </div>
                  </div>
                ) : (`

const replacement = `                {!isPremiumActive ? (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 md:p-5 rounded-2xl shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                     <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <Crown className="w-4 h-4 text-amber-600" />
                             <h2 className="text-lg font-black text-amber-950 leading-tight">
                               Décrochez plus d'entretiens !
                             </h2>
                           </div>
                           <p className="text-amber-800/80 font-medium text-xs md:text-sm">
                             Passez Premium et laissez les recruteurs vous contacter directement.
                           </p>
                        </div>
                        <div className="shrink-0">
                           <Button onClick={() => setActiveTab("promotion")} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 font-black h-10 px-6 rounded-xl transition-all hover:scale-105 text-xs">
                             Devenir Premium <Zap className="ml-2 w-3 h-3" />
                           </Button>
                        </div>
                     </div>
                  </div>
                ) : (`

if (content.includes("Optimisez votre visibilité")) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
  console.log("Replaced using standard target");
} else {
  console.log("Could not find standard target");
}
