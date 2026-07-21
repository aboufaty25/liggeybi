const fs = require('fs');
let content = fs.readFileSync('src/components/common/PremiumCvSlider.tsx', 'utf8');

content = content.replace(
  /<Link to="\/candidat">\s*<Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 px-8 rounded-xl">\s*Promouvoir mon CV maintenant\s*<\/Button>\s*<\/Link>/g,
  '<Button asChild className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 px-8 rounded-xl">\n              <Link to="/candidat">Promouvoir mon CV maintenant</Link>\n            </Button>'
);

fs.writeFileSync('src/components/common/PremiumCvSlider.tsx', content);
console.log("Patched PremiumCvSlider");
