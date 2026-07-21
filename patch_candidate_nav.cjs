const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

const oldNavButton = `<button
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
            </button>`;

const newNavButton = `<button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={\`flex flex-col items-center justify-center py-2 px-1 rounded-xl gap-1 transition-all relative overflow-hidden \${
                activeTab === item.id 
                  ? (item.highlight ? "bg-amber-100 text-amber-700 shadow-inner" : "bg-emerald-50 text-emerald-700")
                  : (item.highlight ? "text-amber-600 hover:bg-amber-50" : "text-slate-500 hover:bg-slate-50")
              }\`}
            >
              {item.highlight && activeTab !== item.id && (
                <div className="absolute inset-0 bg-amber-50 opacity-50"></div>
              )}
              <item.icon className={\`w-5 h-5 relative z-10 \${
                activeTab === item.id 
                  ? (item.highlight ? "text-amber-600" : "text-emerald-600") 
                  : (item.highlight ? "text-amber-500" : "text-slate-400")
              }\`} /> 
              <span className="text-[10px] font-bold text-center leading-tight truncate w-full relative z-10">{item.label}</span>
            </button>`;

content = content.replace(oldNavButton, newNavButton);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Candidate dashboard nav patched");
