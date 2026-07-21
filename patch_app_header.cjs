const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("{!isAppLayout && <Header />}", "<Header />");
content = content.replace("{!isAppLayout && <Footer />}", "<Footer />");
// We can also remove the isAppLayout stuff
content = content.replace("const isAppLayout = location.pathname === '/candidat';", "");

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx patched");
