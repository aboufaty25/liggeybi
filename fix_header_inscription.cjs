const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// The line is currently:
// <Button nativeButton={false} render={<Link to="/inscription" onClick={() => setIsOpen(false)} />} className="bg-transparent border border-white/30 text-white hover:bg-white/10 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl h-10 px-2 sm:px-4 flex-1">Inscription</Button>

content = content.replace(
  /<Button nativeButton=\{false\} render=\{<Link to="\/inscription" onClick=\{[\s\S]*?\} \/>\} className="bg-transparent border border-white\/30 text-white hover:bg-white\/10 text-\[10px\] sm:text-xs font-black uppercase tracking-wider rounded-xl h-10 px-2 sm:px-4 flex-1">Inscription<\/Button>/g,
  '<Button nativeButton={false} render={<Link to="/inscription" onClick={() => setIsOpen(false)} />} className="bg-blue-800 text-white hover:bg-blue-900 border border-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl h-10 px-2 sm:px-4 flex-1">Inscription</Button>'
);

fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log("Header inscription fixed");
