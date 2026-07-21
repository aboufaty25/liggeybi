const fs = require('fs');
let content = fs.readFileSync('src/pages/CVtheque.tsx', 'utf8');

let newContent = content;

// 1. Grid gaps and columns (use grid-cols-2 on mobile instead of 1 so cards are smaller? Or keep 1 but much smaller padding?)
// If grid-cols-1, the card stretches. Let's make it grid-cols-2 on mobile! It will make them very compact.
newContent = newContent.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">',
  '<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">'
);

newContent = newContent.replace(
  '<div className={`h-20 w-20 bg-white rounded-full p-1.5 shadow-xl border-4',
  '<div className={`h-14 w-14 md:h-20 md:w-20 bg-white rounded-full p-1 md:p-1.5 shadow-xl border-2 md:border-4'
);

newContent = newContent.replace(
  '<div className="pt-6 pb-8 px-6 text-center relative z-10 bg-white rounded-t-3xl -mt-6">',
  '<div className="pt-4 md:pt-6 pb-4 md:pb-8 px-3 md:px-6 text-center relative z-10 bg-white rounded-t-[1.5rem] md:rounded-t-3xl -mt-4 md:-mt-6">'
);

newContent = newContent.replace(
  '<h3 className="text-xl font-black text-gray-900 leading-tight mb-1 truncate px-2">',
  '<h3 className="text-sm md:text-xl font-black text-gray-900 leading-tight mb-1 truncate px-1 md:px-2">'
);

newContent = newContent.replace(
  '<div className="flex items-center justify-center gap-1.5 text-[#006837] mb-4 bg-[#006837]/5 py-1.5 px-3 rounded-full inline-flex mx-auto max-w-full">',
  '<div className="flex items-center justify-center gap-1 text-[#006837] mb-2 md:mb-4 bg-[#006837]/5 py-1 md:py-1.5 px-2 md:px-3 rounded-full inline-flex mx-auto max-w-full">'
);

newContent = newContent.replace(
  '<span className="text-xs font-black uppercase tracking-wider truncate">{profile.titre}</span>',
  '<span className="text-[9px] md:text-xs font-black uppercase tracking-wider truncate">{profile.titre}</span>'
);

newContent = newContent.replace(
  '<div className="flex flex-col gap-2 text-[11px] text-gray-500 font-bold mb-6">',
  '<div className="flex flex-col gap-1.5 md:gap-2 text-[9px] md:text-[11px] text-gray-500 font-bold mb-4 md:mb-6">'
);

newContent = newContent.replace(
  'className="flex-1 bg-white border-2 border-gray-100 text-gray-700 hover:border-gray-900 hover:bg-gray-900 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all rounded-xl h-11"',
  'className="flex-1 bg-white border-2 border-gray-100 text-gray-700 hover:border-gray-900 hover:bg-gray-900 hover:text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all rounded-lg md:rounded-xl h-8 md:h-11 px-2 md:px-4"'
);

newContent = newContent.replace(
  'className="w-11 h-11 flex items-center justify-center bg-white border-2 border-gray-100 text-gray-600 hover:border-blue-600 hover:bg-blue-600 hover:text-white font-bold transition-all rounded-xl p-0 shrink-0"',
  'className="w-8 h-8 md:w-11 md:h-11 flex items-center justify-center bg-white border-2 border-gray-100 text-gray-600 hover:border-blue-600 hover:bg-blue-600 hover:text-white font-bold transition-all rounded-lg md:rounded-xl p-0 shrink-0"'
);

newContent = newContent.replace(
  '<div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-[10px] uppercase font-black tracking-widest py-1.5 px-4 rounded-bl-2xl rounded-tr-[2rem] shadow-lg flex items-center gap-1.5">',
  '<div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-[8px] md:text-[10px] uppercase font-black tracking-widest py-1 md:py-1.5 px-2 md:px-4 rounded-bl-xl md:rounded-bl-2xl rounded-tr-xl md:rounded-tr-[2rem] shadow-lg flex items-center gap-1 md:gap-1.5">'
);

fs.writeFileSync('src/pages/CVtheque.tsx', newContent);
console.log("CVtheque cards patched for mobile");
