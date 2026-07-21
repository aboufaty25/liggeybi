const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("const isAppLayout = location.pathname.startsWith('/candidat');", "const isAppLayout = location.pathname === '/candidat';");

fs.writeFileSync('src/App.tsx', content);
console.log("App patched.");
