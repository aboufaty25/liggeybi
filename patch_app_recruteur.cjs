const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// We need to conditionally render Header and Footer.
// Let's replace `<Header />` with `{!location.pathname.startsWith('/recruteur') && <Header />}`
// Let's replace `<Footer />` with `{!location.pathname.startsWith('/recruteur') && <Footer />}`
content = content.replace(
  '<Header />',
  '{!location.pathname.startsWith(\'/recruteur\') && <Header />}'
);
content = content.replace(
  '<Footer />',
  '{!location.pathname.startsWith(\'/recruteur\') && <Footer />}'
);

fs.writeFileSync('src/App.tsx', content);
console.log("App patched for recruteur header");
