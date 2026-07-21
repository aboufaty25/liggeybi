const fs = require('fs');
let content = fs.readFileSync('src/pages/RecruiterDashboard.tsx', 'utf8');

const regex = /<TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto md:h-16 gap-2 rounded-2xl bg-white shadow-sm p-1 border border-gray-100 mb-8">([\s\S]*?)<\/TabsList>/g;
const match = regex.exec(content);

if (match) {
    let newTabs = `<TabsList className="flex flex-wrap md:grid w-full md:grid-cols-5 h-auto md:h-16 gap-2 rounded-2xl bg-white shadow-sm p-1 border border-gray-100 mb-8">
          <TabsTrigger value="offres" className="flex-1 min-w-[140px] rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest h-12 md:h-auto"><ListIcon className="mr-1.5 h-3.5 w-3.5" /> Mes Annonces</TabsTrigger>
          <TabsTrigger value="candidates" className="flex-1 min-w-[140px] rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest h-12 md:h-auto"><Users className="mr-1.5 h-3.5 w-3.5" /> Reçues</TabsTrigger>
          <button onClick={() => navigate('/cvtheque')} className="flex-1 min-w-[140px] inline-flex items-center justify-center whitespace-nowrap rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest h-12 md:h-auto text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors border-none"><Send className="mr-1.5 h-3.5 w-3.5" /> Spontanées</button>
          <TabsTrigger value="profile" className="flex-1 min-w-[140px] rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest h-12 md:h-auto"><User className="mr-1.5 h-3.5 w-3.5" /> Profil</TabsTrigger>
          <TabsTrigger value="credits" className="flex-1 min-w-[140px] rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest h-12 md:h-auto text-yellow-700 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900"><Wallet className="mr-1.5 h-3.5 w-3.5" /> Crédits</TabsTrigger>
        </TabsList>`;
    content = content.replace(regex, newTabs);
    fs.writeFileSync('src/pages/RecruiterDashboard.tsx', content);
    console.log("Patched tabs list in recruiter dashboard");
} else {
    console.log("Could not find tabs list in recruiter dashboard");
}
