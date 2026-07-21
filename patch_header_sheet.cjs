const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

const regex = /<SheetContent side="left" className="w-\[300px\] sm:w-\[400px\]">([\s\S]*?)<\/SheetContent>/g;
const match = regex.exec(content);
if (!match) {
    console.log("Not found SheetContent");
    process.exit(1);
}

let newReplacement = `<SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0 flex flex-col bg-slate-50 border-r-0">
  {/* Header Section */}
  <div className="px-6 py-8 bg-blue-700 text-white rounded-br-[3rem] shadow-md relative overflow-hidden shrink-0">
     <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
     {isLoading ? (
       <div className="flex items-center gap-4 animate-pulse relative z-10">
         <div className="w-14 h-14 bg-white/20 rounded-full"></div>
         <div className="space-y-2">
           <div className="h-4 w-24 bg-white/20 rounded"></div>
           <div className="h-3 w-16 bg-white/20 rounded"></div>
         </div>
       </div>
     ) : user ? (
       <div className="flex items-center gap-4 relative z-10">
         <div className="w-14 h-14 rounded-full border-2 border-white/20 bg-blue-600 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
           {user.image ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" /> : <User className="h-6 w-6 text-white" />}
         </div>
         <div className="flex flex-col">
           <span className="font-black text-lg line-clamp-1">{user.name}</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">{user.role}</span>
         </div>
       </div>
     ) : (
       <div className="flex flex-col relative z-10">
         <h2 className="font-black text-2xl mb-1">Bienvenue !</h2>
         <p className="text-blue-100 text-xs font-medium">Connectez-vous pour profiter de toutes les fonctionnalités.</p>
         <div className="flex gap-2 mt-4">
           <Button render={<Link to="/connexion" onClick={() => setIsOpen(false)} />} className="bg-white text-blue-700 hover:bg-blue-50 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl h-10 px-2 sm:px-4 flex-1">Connexion</Button>
           <Button render={<Link to="/inscription" onClick={() => setIsOpen(false)} />} variant="outline" className="border-white/30 text-white hover:bg-white/10 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl h-10 px-2 sm:px-4 flex-1">Inscription</Button>
         </div>
       </div>
     )}
  </div>

  <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar pb-24">
     
     {user && (
       <div className="mb-6 grid grid-cols-2 gap-3">
         <Link to={user.role === 'ADMIN' ? '/admin' : user.role === 'RECRUTEUR' ? '/recruteur' : '/candidat'} onClick={() => setIsOpen(false)} className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
           <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
             <User className="w-5 h-5" />
           </div>
           <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-slate-700">Mon Espace</span>
         </Link>

         {(user.role === 'RECRUTEUR' || user.role === 'ADMIN') ? (
           <Link to="/cvtheque" onClick={() => setIsOpen(false)} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 sm:p-4 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
               <Crown className="w-5 h-5" />
             </div>
             <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-emerald-800">CVthèque</span>
           </Link>
         ) : (
           <Link to="/candidat" onClick={() => setIsOpen(false)} className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 sm:p-4 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
             <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
               <FileText className="w-5 h-5" />
             </div>
             <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-orange-800">Mon CV</span>
           </Link>
         )}
       </div>
     )}

     <div className="space-y-2 mb-6">
       <div className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</div>
       {navLinks.map((link) => {
         const isPromo = link.name === 'Boutique';
         return (
           <Link
             key={link.name}
             to={link.href}
             className={\`flex items-center space-x-3 sm:space-x-4 p-3 rounded-2xl transition-all group \${
               isPromo 
                 ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 shadow-sm' 
                 : 'bg-white border border-slate-100 shadow-sm hover:border-slate-300'
             }\`}
             onClick={() => setIsOpen(false)}
           >
             <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 \${
                isPromo ? 'bg-red-500 text-white' 
                : link.name === 'Emploi' ? 'bg-blue-100 text-blue-600'
                : link.name === 'Bourses' ? 'bg-amber-100 text-amber-600'
                : link.name === 'Concours' ? 'bg-purple-100 text-purple-600'
                : link.name === 'Formation' ? 'bg-emerald-100 text-emerald-600'
                : link.name === 'Candidature' ? 'bg-indigo-100 text-indigo-600'
                : 'bg-slate-100 text-slate-600'
             }\`}>
               <link.icon className="w-5 h-5" />
             </div>
             <span className={\`text-xs sm:text-sm font-black flex-1 \${isPromo ? 'text-red-700' : 'text-slate-700'}\`}>{link.name}</span>
             {isPromo ? (
               <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-md font-black shadow-sm uppercase tracking-widest animate-pulse shrink-0">Promo</span>
             ) : (
               <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
             )}
           </Link>
         );
       })}
     </div>

     <div className="mt-8 mb-4">
       <Link to="/recruteur" onClick={() => setIsOpen(false)}>
         <Button className="w-full bg-[#006837] hover:bg-[#004d29] text-white font-black text-xs sm:text-sm h-12 sm:h-14 rounded-2xl shadow-xl shadow-emerald-900/20 uppercase tracking-tight gap-2 flex items-center justify-center transition-all hover:-translate-y-1">
           Publier une offre <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
         </Button>
       </Link>
     </div>
  </div>

  {user && (
    <div className="p-4 border-t border-slate-200 bg-white absolute bottom-0 left-0 right-0 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
      <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center justify-center gap-2 p-3 text-sm font-black text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
        <LogOut className="w-4 h-4" /> Déconnexion
      </button>
    </div>
  )}
</SheetContent>`;

content = content.replace(regex, newReplacement);
fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log("Header SheetContent patched");
