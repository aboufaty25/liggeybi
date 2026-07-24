const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

content = content.replace(
  '<Button onClick={() => setActiveTab("promotion")} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 font-black h-10 px-6 rounded-xl transition-all hover:scale-105 text-xs">',
  '<Button onClick={() => setShowPackModal(true)} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 font-black h-10 px-6 rounded-xl transition-all hover:scale-105 text-xs">'
);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Button patched");
