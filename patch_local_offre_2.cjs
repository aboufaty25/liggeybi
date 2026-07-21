const fs = require('fs');
let content = fs.readFileSync('src/pages/LocalOffreDetail.tsx', 'utf8');

content = content.replace(
  /<Button asChild className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-black text-xs h-14 rounded-2xl shadow-sm transition-all hover:border-slate-900 hover:text-slate-900 uppercase tracking-tighter group\/btn">\n                      <Link to=\{`\/recherche\?q=\$\{job.entreprise \|\| ''\}`\}>VOIR TOUTES SES OFFRES <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover\/btn:translate-x-1" \/><\/Link>\n                    <\/Button>/g,
  '<Button render={<Link to={`/recherche?q=${job.entreprise || \'\'}`} />} className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-black text-xs h-14 rounded-2xl shadow-sm transition-all hover:border-slate-900 hover:text-slate-900 uppercase tracking-tighter group/btn">VOIR TOUTES SES OFFRES <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" /></Button>'
);

fs.writeFileSync('src/pages/LocalOffreDetail.tsx', content);
console.log("Patched LocalOffreDetail 2");
