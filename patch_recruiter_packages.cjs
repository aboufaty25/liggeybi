const fs = require('fs');
let content = fs.readFileSync('src/pages/RecruiterDashboard.tsx', 'utf8');

// Find the grid container
const regex = /<div className="grid md:grid-cols-3 gap-6">\s*\{packages\.map\(\(pkg\) => \([\s\S]*?\{packages\.length === 0/g;
const match = regex.exec(content);
if (!match) {
    console.log("Not found in RecruiterDashboard");
    process.exit(1);
}

let newReplacement = `<div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
               {packages.map((pkg, index) => {
                  const colorClasses = index % 3 === 0 
                     ? 'from-blue-600 to-cyan-700 shadow-blue-900/20' 
                     : index % 3 === 1 
                        ? 'from-[#006837] to-emerald-700 shadow-emerald-900/20'
                        : 'from-purple-600 to-fuchsia-700 shadow-purple-900/20';
                        
                  return (
                  <div key={pkg.id} className={\`rounded-2xl md:rounded-[2rem] p-4 md:p-8 text-white bg-gradient-to-br \${colorClasses} shadow-lg flex flex-row md:flex-col items-center md:items-stretch justify-between gap-4 transition-all hover:-translate-y-1 group\`}>
                     <div className="flex flex-col text-left md:text-center flex-1">
                        <h3 className="text-base md:text-xl font-black uppercase mb-1 md:mb-2 leading-tight">{pkg.nom}</h3>
                        {pkg.description && <p className="text-[10px] md:text-xs font-medium text-white/80 mb-0 md:mb-6 line-clamp-1 md:line-clamp-none">{pkg.description}</p>}
                     </div>
                     <div className="flex flex-col md:flex-col items-end md:items-center shrink-0 md:border-t border-white/20 md:pt-6">
                        <div className="text-xl md:text-4xl font-black mb-1 md:mb-2">{pkg.prix === 0 ? "Gratuit" : \`\${pkg.prix} FCFA\`}</div>
                        <div className="bg-white/20 text-white text-[9px] md:text-sm font-black uppercase tracking-widest px-2 py-1 md:py-2 rounded-lg mb-2 md:mb-6">
                           +{pkg.credits} Crédits
                        </div>
                                          
                        <Button 
                           onClick={() => handleBuyCredits(pkg.id)}
                           disabled={isLoading}
                           className="h-8 md:h-14 px-4 md:px-0 w-auto md:w-full rounded-lg md:rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl transition-transform"
                        >
                           {isLoading ? 'En cours...' : 'Acheter'}
                        </Button>
                     </div>
                  </div>
               )})}
               {packages.length === 0`;

content = content.replace(regex, newReplacement);
fs.writeFileSync('src/pages/RecruiterDashboard.tsx', content);
console.log("Recruiter packages patched");
