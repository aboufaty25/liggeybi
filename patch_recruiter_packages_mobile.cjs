const fs = require('fs');
let content = fs.readFileSync('src/pages/RecruiterDashboard.tsx', 'utf8');

const regex = /<div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">([\s\S]*?)\{packages\.length === 0/g;
const match = regex.exec(content);
if (match) {
    let newReplacement = `<div className="grid grid-cols-3 gap-2 md:gap-6">
               {packages.map((pkg, index) => {
                  const colorClasses = index % 3 === 0 
                     ? 'from-blue-600 to-cyan-700 shadow-blue-900/20' 
                     : index % 3 === 1 
                        ? 'from-[#006837] to-emerald-700 shadow-emerald-900/20'
                        : 'from-purple-600 to-fuchsia-700 shadow-purple-900/20';
                        
                  return (
                  <div key={pkg.id} className={\`rounded-2xl md:rounded-[2rem] p-2 md:p-8 text-white bg-gradient-to-br \${colorClasses} shadow-lg flex flex-col items-center md:items-stretch justify-between gap-2 md:gap-4 transition-all hover:-translate-y-1 group\`}>
                     <div className="flex flex-col text-center flex-1 w-full">
                        <h3 className="text-[11px] md:text-xl font-black uppercase mb-1 md:mb-2 leading-tight line-clamp-1">{pkg.nom}</h3>
                        {pkg.description && <p className="text-[8px] md:text-xs font-medium text-white/80 mb-0 md:mb-6 line-clamp-2 md:line-clamp-none">{pkg.description}</p>}
                     </div>
                     <div className="flex flex-col items-center shrink-0 md:border-t border-white/20 md:pt-6 w-full">
                        <div className="text-base md:text-4xl font-black mb-1 md:mb-2 leading-tight">{pkg.prix === 0 ? "Gratuit" : <>{pkg.prix} <span className="text-[8px] md:text-lg">FCFA</span></>}</div>
                        <div className="bg-white/20 text-white text-[7px] md:text-sm font-black uppercase tracking-widest px-1 py-0.5 md:px-2 md:py-2 rounded md:rounded-lg mb-2 md:mb-6 whitespace-nowrap">
                           +{pkg.credits} <span className="hidden sm:inline">Crédits</span><span className="sm:hidden">Cr</span>
                        </div>
                                          
                        <Button 
                           onClick={() => handleBuyCredits(pkg.id)}
                           disabled={isLoading}
                           className="h-7 md:h-14 px-2 md:px-0 w-full rounded-md md:rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-black text-[9px] md:text-xs uppercase tracking-widest shadow-xl transition-transform"
                        >
                           {isLoading ? '...' : 'Acheter'}
                        </Button>
                     </div>
                  </div>
               )})}
               {packages.length === 0`;
    content = content.replace(regex, newReplacement);
    fs.writeFileSync('src/pages/RecruiterDashboard.tsx', content);
    console.log("Recruiter mobile packages patched");
} else {
    console.log("Regex not matched in RecruiterDashboard");
}
