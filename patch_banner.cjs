const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

content = content.replace(
  'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden group',
  'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm relative overflow-hidden group'
);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Candidate dashboard banner patched");
