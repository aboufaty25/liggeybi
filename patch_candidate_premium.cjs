const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

let newContent = content;

newContent = newContent.replace(
  'rounded-[2rem] p-6 md:p-8 flex flex-col justify-between transition-all',
  'rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 flex flex-col justify-between transition-all'
);

newContent = newContent.replace(
  '<div className="relative z-10 mb-8 mt-4">',
  '<div className="relative z-10 mb-5 md:mb-8 mt-2 md:mt-4">'
);

newContent = newContent.replace(
  '<div className="flex justify-between items-start mb-6">',
  '<div className="flex justify-between items-start mb-4 md:mb-6">'
);

newContent = newContent.replace(
  '<h3 className={`text-2xl font-black leading-tight',
  '<h3 className={`text-xl md:text-2xl font-black leading-tight'
);

newContent = newContent.replace(
  '<div className={`text-sm font-medium mb-8 p-4 rounded-2xl backdrop-blur-sm',
  '<div className={`text-xs md:text-sm font-medium mb-4 md:mb-8 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-sm'
);

newContent = newContent.replace(
  '<ul className="space-y-4">',
  '<ul className="space-y-2 md:space-y-4">'
);

newContent = newContent.replace(
  '<div className={`relative z-10 pt-6 border-t',
  '<div className={`relative z-10 pt-4 md:pt-6 border-t'
);

newContent = newContent.replace(
  '<div className="mb-6">',
  '<div className="mb-4 md:mb-6">'
);

newContent = newContent.replace(
  '<div className="text-4xl font-black flex items-baseline gap-1">',
  '<div className="text-3xl md:text-4xl font-black flex items-baseline gap-1">'
);

newContent = newContent.replace(
  'className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all',
  'className={`w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl transition-all'
);

// We need to apply it for all instances if needed, or globally for this block.
// Let's just do a simple string replace for each block. Since these strings are mostly unique in that section, it should work.

fs.writeFileSync('src/pages/CandidateDashboard.tsx', newContent);
console.log("Candidate dashboard premium packs patched");
