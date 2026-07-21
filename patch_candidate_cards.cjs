const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const oldCard = `<div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                            <Link to={\`/offre/\${c.offreId}\`} className="text-lg font-black text-slate-900 hover:text-[#006837] transition-colors line-clamp-1">
                              {c.offre?.titre || "Offre indisponible"}
                            </Link>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                               <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{c.offre?.entreprise || "Entreprise"}</span>
                               <span className="text-xs text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                         </div>
                         <div className="flex items-center">
                            <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Envoyée</span>
                         </div>
                      </div>`;

const newCard = `<div key={c.id} className="bg-white border border-slate-100 rounded-xl md:rounded-2xl p-3.5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                         <div>
                            <Link to={\`/offre/\${c.offreId}\`} className="text-sm md:text-lg font-black text-slate-900 hover:text-[#006837] transition-colors line-clamp-1">
                              {c.offre?.titre || "Offre indisponible"}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                               <span className="text-[10px] md:text-xs font-bold text-slate-500 bg-slate-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full">{c.offre?.entreprise || "Entreprise"}</span>
                               <span className="text-[10px] md:text-xs text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                         </div>
                         <div className="flex items-center self-start md:self-auto">
                            <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Envoyée</span>
                         </div>
                      </div>`;

content = content.replace(oldCard, newCard);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Candidature cards patched");
