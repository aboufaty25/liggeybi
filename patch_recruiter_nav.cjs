const fs = require('fs');
let content = fs.readFileSync('src/pages/RecruiterDashboard.tsx', 'utf8');

const targetButton = `            <Button 
               onClick={() => { setShowForm(true); setEditingId(null); setActiveTab('offres'); }} 
               className="w-full h-14 bg-[#006837] hover:bg-[#004d29] text-white rounded-2xl font-black uppercase tracking-widest mb-6 shadow-lg shadow-emerald-900/20"
            >
               <Plus className="mr-2 h-5 w-5" /> Publier une offre
            </Button>`;

const replacementButton = `            <Button 
               onClick={() => { setShowForm(true); setEditingId(null); setActiveTab('offres'); }} 
               className="w-full h-12 sm:h-14 bg-[#006837] hover:bg-[#004d29] text-white rounded-xl sm:rounded-2xl font-bold sm:font-black text-sm sm:uppercase sm:tracking-widest mb-4 sm:mb-6 shadow-md shadow-emerald-900/10"
            >
               <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Publier une offre
            </Button>`;

content = content.replace(targetButton, replacementButton);

const navStylesTarget = /font-bold uppercase text-xs tracking-widest/g;
content = content.replace(navStylesTarget, "font-bold text-xs sm:text-sm sm:uppercase sm:tracking-widest");

fs.writeFileSync('src/pages/RecruiterDashboard.tsx', content);
console.log("Nav patched");
