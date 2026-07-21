const fs = require('fs');

function patchFile(file, regex, replaceFn) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    // apply regex
    if (typeof regex === 'function') {
      newContent = regex(content);
    }
    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log("Patched", file);
    }
}

// 1. SpontaneousApplicationWidget.tsx
patchFile('src/components/common/SpontaneousApplicationWidget.tsx', c => {
  return c.replace(
    '<Link to="/candidature-spontanee" className="w-full md:w-auto shrink-0">\n          <button className="w-full md:w-auto bg-[#006837] hover:bg-[#004d29] text-white px-6 py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">\n            Voir les offres <ArrowRight className="h-4 w-4" />\n          </button>\n        </Link>',
    '<Link to="/candidature-spontanee" className="w-full md:w-auto shrink-0 bg-[#006837] hover:bg-[#004d29] text-white px-6 py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">\n            Voir les offres <ArrowRight className="h-4 w-4" />\n        </Link>'
  );
});

// 2. Header.tsx
patchFile('src/components/layout/Header.tsx', c => {
  return c.replace(
    /<Link to="\/recruteur">\s*<Button size="sm" className="bg-\[#006837\] hover:bg-\[#004d29\] text-white font-bold rounded-xl px-4 shadow-sm h-10">\s*Publier une offre\s*<\/Button>\s*<\/Link>/g,
    '<Button asChild size="sm" className="bg-[#006837] hover:bg-[#004d29] text-white font-bold rounded-xl px-4 shadow-sm h-10">\n                  <Link to="/recruteur">Publier une offre</Link>\n                </Button>'
  ).replace(
    /<Link to="\/connexion">\s*<Button \s*variant="ghost"\s*size="sm"\s*className="font-bold text-gray-700 hover:text-slate-900 border border-transparent hover:bg-slate-50 rounded-xl h-10 px-4"\s*>\s*<User className="mr-2 h-4 w-4" \/>\s*Connexion\s*<\/Button>\s*<\/Link>/g,
    '<Button asChild variant="ghost" size="sm" className="font-bold text-gray-700 hover:text-slate-900 border border-transparent hover:bg-slate-50 rounded-xl h-10 px-4">\n                  <Link to="/connexion"><User className="mr-2 h-4 w-4" /> Connexion</Link>\n                </Button>'
  ).replace(
    /<Link to="\/recruteur">\s*<Button size="sm" className="bg-\[#006837\] hover:bg-\[#004d29\] text-white font-bold h-10 rounded-xl px-4 shadow-sm">\s*Publier une offre\s*<\/Button>\s*<\/Link>/g,
    '<Button asChild size="sm" className="bg-[#006837] hover:bg-[#004d29] text-white font-bold h-10 rounded-xl px-4 shadow-sm">\n                  <Link to="/recruteur">Publier une offre</Link>\n                </Button>'
  ).replace(
    /<Link to="\/recruteur" className="mt-4 px-2" onClick=\{([^}]+)\}>\s*<Button className="w-full bg-\[#006837\] hover:bg-\[#004d29\] text-white font-bold h-12 rounded-xl shadow-md">\s*Publier une offre\s*<\/Button>\s*<\/Link>/g,
    '<Button asChild className="w-full mt-4 bg-[#006837] hover:bg-[#004d29] text-white font-bold h-12 rounded-xl shadow-md">\n                  <Link to="/recruteur" onClick={$1}>Publier une offre</Link>\n                </Button>'
  );
});

