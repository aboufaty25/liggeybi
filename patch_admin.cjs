const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(
  '<JobPackagesManager />',
  '{/* <JobPackagesManager /> */}'
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
console.log("AdminDashboard patched");
