const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(
  /<Link to="\/candidat\?action=importer_cv" className="w-full sm:w-auto md:w-full mt-1 md:mt-0">\s*<Button variant="outline" className="w-full border-2 border-amber-200 text-amber-900 hover:border-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-300 font-black h-10 md:h-14 rounded-lg md:rounded-xl text-xs sm:text-sm md:text-base bg-white">\s*Importer\s*<\/Button>\s*<\/Link>/g,
  '<Button asChild variant="outline" className="w-full border-2 border-amber-200 text-amber-900 hover:border-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-300 font-black h-10 md:h-14 rounded-lg md:rounded-xl text-xs sm:text-sm md:text-base bg-white">\n                  <Link to="/candidat?action=importer_cv" className="w-full sm:w-auto md:w-full mt-1 md:mt-0">Importer</Link>\n                </Button>'
);

content = content.replace(
  /<Link to="\/recruteur" className="w-full sm:w-auto md:w-full mt-1 md:mt-0">\s*<Button className="w-full bg-\[#006837\] hover:bg-\[#004d29\] text-white font-black h-10 md:h-14 rounded-lg md:rounded-xl transition-colors text-xs sm:text-sm md:text-base">\s*Publier une offre\s*<\/Button>\s*<\/Link>/g,
  '<Button asChild className="w-full bg-[#006837] hover:bg-[#004d29] text-white font-black h-10 md:h-14 rounded-lg md:rounded-xl transition-colors text-xs sm:text-sm md:text-base">\n                  <Link to="/recruteur" className="w-full sm:w-auto md:w-full mt-1 md:mt-0">Publier une offre</Link>\n                </Button>'
);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log("Patched Home");
