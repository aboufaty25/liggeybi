const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

// Replace Mobile Top Header and Desktop Sidebar
content = content.replace(
  `      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-50">
        <Link to="/" className="text-xl font-black text-[#006837] tracking-tight">SunuCV</Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
             <User className="h-4 w-4 text-slate-600" />
          </div>
        </div>
      </div>`,
  `      {/* Mobile Top Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-100 z-50 flex flex-col">
        <div className="h-16 flex items-center justify-between px-4">
          <Link to="/" className="text-xl font-black text-[#006837] tracking-tight">SunuCV</Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-bold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200">
               <ChevronRight className="w-3 h-3 rotate-180" /> Retour
            </Link>
          </div>
        </div>
        <div className="flex items-center overflow-x-auto hide-scrollbar px-4 pb-3 gap-2">
          {[
            { id: "accueil", label: "Mon espace", icon: Home },
            { id: "candidatures", label: "Emplois", icon: Briefcase },
            { id: "profil", label: "Profil", icon: User },
            { id: "promotion", label: "Premium", icon: Crown, highlight: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={\`flex items-center whitespace-nowrap gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors \${
                activeTab === item.id 
                  ? (item.highlight ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-800")
                  : "bg-slate-50 text-slate-600 border border-slate-100"
              }\`}
            >
              <item.icon className="w-3.5 h-3.5" /> {item.label}
            </button>
          ))}
        </div>
      </div>`
);

// Replace Desktop Sidebar Mon Espace
content = content.replace(
  `{ id: "accueil", label: "Tableau de bord", icon: Home },`,
  `{ id: "accueil", label: "Mon espace", icon: Home },`
);

// Replace Desktop Sidebar Logout section to add Retour
content = content.replace(
  `        <div className="p-4 border-t border-slate-100">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
            <LogOut className="h-5 w-5 text-slate-400" />
            Déconnexion
          </button>
        </div>`,
  `        <div className="p-4 border-t border-slate-100">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-2">
            <ChevronRight className="h-5 w-5 text-slate-400 rotate-180" />
            Retour au site
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
            <LogOut className="h-5 w-5 text-slate-400" />
            Déconnexion
          </button>
        </div>`
);

// Replace padding in Main Content Area
content = content.replace(
  `      <main className="flex-1 h-full overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0 relative z-10 scroll-smooth">`,
  `      <main className="flex-1 h-full overflow-y-auto pt-28 md:pt-0 pb-6 md:pb-0 relative z-10 scroll-smooth">`
);

// Remove Mobile Bottom Navigation
content = content.replace(
  `      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-50 flex items-center justify-around px-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] h-[72px]">
        {[
          { id: "accueil", label: "Accueil", icon: Home },
          { id: "candidatures", label: "Emplois", icon: Briefcase },
          { id: "profil", label: "Profil", icon: User },
          { id: "promotion", label: "Premium", icon: Crown, highlight: true },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={\`flex flex-col items-center justify-center w-full h-full space-y-1 relative \${
              activeTab === item.id ? (item.highlight ? "text-amber-500" : "text-[#006837]") : "text-slate-400"
            }\`}
          >
            {item.highlight && activeTab !== item.id && (
               <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
            <item.icon className={\`h-6 w-6 transition-transform \${activeTab === item.id ? "scale-110" : ""}\`} />
            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>`,
  ``
);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Patched CandidateDashboard.tsx");
