const fs = require('fs');
let content = fs.readFileSync('src/components/article/SunucvBanner.tsx', 'utf8');

content = content.replace(
  /<a href="https:\/\/sunucv.com" target="_blank" rel="noopener noreferrer" className="block">\s*<Button className="w-full sm:w-auto bg-\[#006837\] hover:bg-\[#004d29\] text-white font-black px-6 sm:px-8 py-3 sm:py-6 rounded-xl sm:rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm sm:text-base flex items-center justify-center gap-2 group">\s*Créer mon CV maintenant <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" \/>\s*<\/Button>\s*<\/a>/g,
  '<Button asChild className="w-full sm:w-auto bg-[#006837] hover:bg-[#004d29] text-white font-black px-6 sm:px-8 py-3 sm:py-6 rounded-xl sm:rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm sm:text-base flex items-center justify-center gap-2 group">\n          <a href="https://sunucv.com" target="_blank" rel="noopener noreferrer" className="block">Créer mon CV maintenant <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" /></a>\n          </Button>'
);

fs.writeFileSync('src/components/article/SunucvBanner.tsx', content);
console.log("Patched SunucvBanner");
