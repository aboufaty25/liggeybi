const fs = require('fs');
let content = fs.readFileSync('src/pages/CategoryPage.tsx', 'utf8');

content = content.replace(
  /<Button asChild variant="outline" className="rounded-xl font-bold">\n                       <Link to=\{([^}]+)\}>Précédent<\/Link>\n                     <\/Button>/g,
  '<Button render={<Link to={$1} />} variant="outline" className="rounded-xl font-bold">Précédent</Button>'
);

content = content.replace(
  /<Button asChild className="bg-blue-700 hover:bg-blue-800 rounded-xl font-black px-8">\n                        <Link to=\{([^}]+)\}>Suivant &rarr;<\/Link>\n                     <\/Button>/g,
  '<Button render={<Link to={$1} />} className="bg-blue-700 hover:bg-blue-800 rounded-xl font-black px-8">Suivant &rarr;</Button>'
);

fs.writeFileSync('src/pages/CategoryPage.tsx', content);
console.log("Patched CategoryPage 2");
