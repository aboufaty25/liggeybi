const fs = require('fs');
let content = fs.readFileSync('src/pages/RecruiterDashboard.tsx', 'utf8');

content = content.replace(
  'className="flex-1 container mx-auto px-4 py-8 max-w-7xl"',
  'className="flex-1 container mx-auto px-4 py-4 md:py-8 max-w-7xl"'
);

fs.writeFileSync('src/pages/RecruiterDashboard.tsx', content);
console.log("Main padding patched");
