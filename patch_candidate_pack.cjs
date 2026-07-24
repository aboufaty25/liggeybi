const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

content = content.replace(
  'const isRecommended = pkg.prix === 900 || index === 1;',
  'const isRecommended = pkg.prix >= 900 || index === 1;'
);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Main packs patched for upselling 990 pack");
