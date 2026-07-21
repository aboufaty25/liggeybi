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

patchFile('src/components/common/SidebarWidgets.tsx', c => {
  return c.replace(
    /<Link to="\/candidat" className="w-full">\s*<Button variant="outline" className="w-full border-2 border-amber-200 text-amber-900 hover:border-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-300 font-black rounded-xl">\s*Importer mon CV\s*<\/Button>\s*<\/Link>/g,
    '<Button asChild variant="outline" className="w-full border-2 border-amber-200 text-amber-900 hover:border-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-300 font-black rounded-xl">\n           <Link to="/candidat" className="w-full">Importer mon CV</Link>\n         </Button>'
  ).replace(
    /<Link to="\/recruteur" className="w-full">\s*<Button className="w-full bg-\[#006837\] hover:bg-\[#004d29\] text-white font-black rounded-xl transition-colors">\s*Publier une offre\s*<\/Button>\s*<\/Link>/g,
    '<Button asChild className="w-full bg-[#006837] hover:bg-[#004d29] text-white font-black rounded-xl transition-colors">\n             <Link to="/recruteur" className="w-full">Publier une offre</Link>\n           </Button>'
  ).replace(
    /<a href=\{([^}]+)\} target="_blank" rel="noopener noreferrer" className="w-full">\s*<Button className="w-full bg-white hover:bg-slate-50 text-\[#075E54\] font-black rounded-xl shadow-xl transition-transform hover:scale-105">\s*S'abonner\s*<\/Button>\s*<\/a>/g,
    '<Button asChild className="w-full bg-white hover:bg-slate-50 text-[#075E54] font-black rounded-xl shadow-xl transition-transform hover:scale-105">\n             <a href={$1} target="_blank" rel="noopener noreferrer" className="w-full">S\'abonner</a>\n           </Button>'
  );
});

