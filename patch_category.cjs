const fs = require('fs');
let content = fs.readFileSync('src/pages/CategoryPage.tsx', 'utf8');

content = content.replace(
  /<Link to=\{([^}]+)\}>\s*<Button variant="outline" className="rounded-xl font-bold">\s*Précédent\s*<\/Button>\s*<\/Link>/g,
  '<Button asChild variant="outline" className="rounded-xl font-bold">\n                       <Link to={$1}>Précédent</Link>\n                     </Button>'
);

content = content.replace(
  /<Link to=\{([^}]+)\}>\s*<Button className="bg-blue-700 hover:bg-blue-800 rounded-xl font-black px-8">\s*Suivant &rarr;\s*<\/Button>\s*<\/Link>/g,
  '<Button asChild className="bg-blue-700 hover:bg-blue-800 rounded-xl font-black px-8">\n                        <Link to={$1}>Suivant &rarr;</Link>\n                     </Button>'
);

fs.writeFileSync('src/pages/CategoryPage.tsx', content);
console.log("Patched CategoryPage");
