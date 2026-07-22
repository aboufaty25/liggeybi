const fs = require('fs');
let content = fs.readFileSync('src/pages/RecruiterDashboard.tsx', 'utf8');

const customHeader = `      {/* Custom Recruiter Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link to="/" className="flex items-center gap-2 group">
               <div className="bg-[#006837] text-white p-1.5 sm:p-2 rounded-lg group-hover:bg-[#004d29] transition-colors">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
               </div>
               <span className="font-black text-lg sm:text-xl tracking-tighter hidden sm:block">Retour au site</span>
             </Link>
             <div className="h-6 w-px bg-slate-700 hidden sm:block mx-2"></div>
             <div className="flex items-center gap-2 text-emerald-400">
               <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />
               <span className="font-black text-lg sm:text-xl tracking-tighter uppercase">Recruteur</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
             <div className="hidden md:flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                 {user?.image ? <img src={user.image} alt={user.name} className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-slate-400" />}
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-sm leading-tight truncate max-w-[150px]">{user?.name}</span>
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{profile.entreprise || 'Entreprise'}</span>
               </div>
             </div>
             <Button onClick={logout} variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-3 h-10">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline font-bold uppercase text-xs tracking-widest">Déconnexion</span>
             </Button>
          </div>
        </div>
      </header>`;

content = content.replace(customHeader, "");
fs.writeFileSync('src/pages/RecruiterDashboard.tsx', content);
console.log("Custom header removed");
