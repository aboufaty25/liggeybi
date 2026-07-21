const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const oldStats = `<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="text-3xl font-black text-slate-900">{candidatures.length}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Candidatures</div>
                   </div>
                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm" onClick={() => setActiveTab("profil")}>
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-3xl font-black text-slate-900 flex items-center gap-2">
                        {profile.cvUrl ? "1" : "0"}
                        {profile.cvUrl && <Check className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">CV en ligne</div>
                   </div>
                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-black text-slate-900 truncate mt-2">{profile.ville || "Non défini"}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Localisation</div>
                   </div>
                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm" onClick={() => setActiveTab("promotion")}>
                      <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                        <Star className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-2">{isPremiumActive ? "Actif" : "Inactif"}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Statut Visibilité</div>
                   </div>
                </div>`;

const newStats = `<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
                   <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 text-blue-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3">
                        <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">{candidatures.length}</div>
                      <div className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Candidatures</div>
                   </div>
                   <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm" onClick={() => setActiveTab("profil")}>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3">
                        <FileText className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none flex items-center gap-1.5 md:gap-2">
                        {profile.cvUrl ? "1" : "0"}
                        {profile.cvUrl && <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />}
                      </div>
                      <div className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">CV en ligne</div>
                   </div>
                   <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="text-xs md:text-sm font-black text-slate-900 truncate mt-1 md:mt-2 leading-none">{profile.ville || "Non défini"}</div>
                      <div className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Localisation</div>
                   </div>
                   <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm" onClick={() => setActiveTab("promotion")}>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 text-amber-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3">
                        <Star className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="text-xs md:text-sm font-black text-slate-900 mt-1 md:mt-2 leading-none">{isPremiumActive ? "Actif" : "Inactif"}</div>
                      <div className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Statut Visibilité</div>
                   </div>
                </div>`;

content = content.replace(oldStats, newStats);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Stats patched");
