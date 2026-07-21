const fs = require('fs');
let content = fs.readFileSync('tsconfig.json', 'utf8');
content = content.replace('"types": ["vite/client"]', '"types": ["vite/client"]\n  },\n  "include": ["src", "server.ts", "scripts"]');
fs.writeFileSync('tsconfig.json', content);
console.log("tsconfig patched");
