const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "{!location.pathname.startsWith('/recruteur') && <Header />}",
  "<Header />"
);

fs.writeFileSync('src/App.tsx', content);
console.log("App patched for restoring header");
