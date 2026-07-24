const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

content = content.replace(
  '<div className="grid grid-cols-3 gap-2 md:gap-6">',
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">'
);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Grid patched");
