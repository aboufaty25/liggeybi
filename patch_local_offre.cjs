const fs = require('fs');
let content = fs.readFileSync('src/pages/LocalOffreDetail.tsx', 'utf8');

content = content.replace(
  /<a href=\{job.lienExterne\} target="_blank" rel="noopener noreferrer" className="block">\s*<Button className="w-full sm:w-auto bg-\[#006837\] hover:bg-\[#004d29\] text-white font-black text-lg h-16 px-12 rounded-2xl shadow-xl transition-all hover:-translate-y-1 uppercase tracking-tighter">\s*POSTULER SUR LE SITE <ExternalLink className="ml-3 h-5 w-5" \/>\s*<\/Button>\s*<\/a>/g,
  '<Button asChild className="w-full sm:w-auto bg-[#006837] hover:bg-[#004d29] text-white font-black text-lg h-16 px-12 rounded-2xl shadow-xl transition-all hover:-translate-y-1 uppercase tracking-tighter">\n                         <a href={job.lienExterne} target="_blank" rel="noopener noreferrer" className="block">POSTULER SUR LE SITE <ExternalLink className="ml-3 h-5 w-5" /></a>\n                       </Button>'
);

content = content.replace(
  /<Link to=\{`\/recherche\?q=\$\{job.entreprise \|\| ''\}`\}>\s*<Button className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-black text-xs h-14 rounded-2xl shadow-sm transition-all hover:border-slate-900 hover:text-slate-900 uppercase tracking-tighter group\/btn">\s*VOIR TOUTES SES OFFRES\s*<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover\/btn:translate-x-1" \/>\s*<\/Button>\s*<\/Link>/g,
  '<Button asChild className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-black text-xs h-14 rounded-2xl shadow-sm transition-all hover:border-slate-900 hover:text-slate-900 uppercase tracking-tighter group/btn">\n                      <Link to={`/recherche?q=${job.entreprise || \'\'}`}>VOIR TOUTES SES OFFRES <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" /></Link>\n                    </Button>'
);

fs.writeFileSync('src/pages/LocalOffreDetail.tsx', content);
console.log("Patched LocalOffreDetail");
