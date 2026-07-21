const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

// Replace flex h-screen
content = content.replace(
  '<div className="flex h-screen bg-slate-50 overflow-hidden font-sans">',
  '<div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-slate-50 font-sans">'
);

// Replace the Mobile Top Navigation
const oldMobileNavStart = `{/* Mobile Top Navigation */}`;
const oldMobileNavEnd = `{/* Desktop Sidebar */}`;

const oldMobileNavBlock = content.substring(content.indexOf(oldMobileNavStart), content.indexOf(oldMobileNavEnd));

const newMobileNavBlock = `{/* Mobile Navigation Tabs */}
      <div className="md:hidden bg-white border-b border-slate-100 z-40 sticky top-16">
        <div className="grid grid-cols-4 gap-1 p-2">
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
              <item.icon className={\`w-5 h-5 \${activeTab === item.id ? (item.highlight ? "text-amber-500" : "text-emerald-600") : "text-slate-400"}\`} /> 
              <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}`;

content = content.replace(oldMobileNavBlock, newMobileNavBlock);

// Replace main content classes
content = content.replace(
  '<main className="flex-1 h-full overflow-y-auto pt-28 md:pt-0 pb-6 md:pb-0 relative z-10 scroll-smooth">',
  '<main className="flex-1 w-full max-w-full overflow-hidden pb-6 md:pb-0 relative z-10">'
);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("CandidateDashboard layout patched");
