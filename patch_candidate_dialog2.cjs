const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const oldAdvantage = `                             Vos candidatures sont placées <b>en tête de liste</b> chez les recruteurs, avec un label <b>Profil Vérifié</b>.`;
const newAdvantage = `                             <div className="mt-1 flex flex-col gap-1">
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span>Candidatures <b>en tête de liste</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span>Badge <b>Profil Vérifié</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span><b>Visibilité Premium</b> dans la CVthèque</span></div>
                             </div>`;

content = content.replace(oldAdvantage, newAdvantage);

const oldRecommended = `<Star className="w-2.5 h-2.5 fill-white" /> Recommandé`;
const newRecommended = `<Star className="w-2.5 h-2.5 fill-white" /> 🔥 Choix N°1 (70% des candidats)`;
content = content.replace(oldRecommended, newRecommended);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Dialog patched again");
