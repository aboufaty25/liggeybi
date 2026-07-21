const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

content = content.replace(
  '<Button nativeButton={false} render={<Link to="/inscription" onClick={() => setIsOpen(false)} />} variant="outline" className="border-white/30 text-white hover:bg-white/10 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl h-10 px-2 sm:px-4 flex-1">Inscription</Button>',
  '<Button nativeButton={false} render={<Link to="/inscription" onClick={() => setIsOpen(false)} />} className="bg-transparent border border-white/30 text-white hover:bg-white/10 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl h-10 px-2 sm:px-4 flex-1">Inscription</Button>'
);

content = content.replace(
  "{navLinks.filter(l => l.name !== 'Boutique' || isBoutiquePromoEnabled).map((link) => {",
  "{navLinks.filter(l => l.name !== 'Boutique').map((link) => {"
);

fs.writeFileSync('src/components/layout/Header.tsx', content);
