const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

content = content.replace(/\}\)\}\n\s*\{\s*&& \(/g, '})}\n                  {cvPackages.length === 0 && (');

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Fixed CandidateDashboard syntax error");
