const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const oldNav = `<div className="flex items-center overflow-x-auto hide-scrollbar px-4 pb-3 gap-2">
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
        </div>`;

const newNav = `<div className="grid grid-cols-4 gap-1 px-2 pb-2">
          {[
            { id: "accueil", label: "Tableau", icon: Home },
            { id: "candidatures", label: "Emplois", icon: Briefcase },
            { id: "profil", label: "Profil", icon: User },
            { id: "promotion", label: "Premium", icon: Crown, highlight: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={\`flex flex-col items-center justify-center py-2 px-1 rounded-xl gap-1 transition-all \${
                activeTab === item.id 
                  ? (item.highlight ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-700")
                  : "text-slate-500 hover:bg-slate-50"
              }\`}
            >
              <item.icon className={\`w-4 h-4 \${activeTab === item.id ? (item.highlight ? "text-amber-500" : "text-emerald-600") : "text-slate-400"}\`} /> 
              <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{item.label}</span>
            </button>
          ))}
        </div>`;

content = content.replace(oldNav, newNav);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Patched CandidateDashboard top nav");
