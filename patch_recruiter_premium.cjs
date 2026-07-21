const fs = require('fs');
let content = fs.readFileSync('src/pages/RecruiterDashboard.tsx', 'utf8');

let newContent = content;

newContent = newContent.replace(
  'className="bg-white border text-center border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 relative overflow-hidden group"',
  'className="bg-white border text-center border-gray-100 rounded-xl md:rounded-[2rem] p-5 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 relative overflow-hidden group"'
);

newContent = newContent.replace(
  '<div className="text-4xl font-black text-blue-700 mb-2">',
  '<div className="text-3xl md:text-4xl font-black text-blue-700 mb-2">'
);

newContent = newContent.replace(
  'className="bg-yellow-100/50 text-yellow-800 text-sm font-black uppercase tracking-widest py-2 rounded-xl mb-6"',
  'className="bg-yellow-100/50 text-yellow-800 text-xs md:text-sm font-black uppercase tracking-widest py-2 rounded-xl mb-4 md:mb-6"'
);

fs.writeFileSync('src/pages/RecruiterDashboard.tsx', newContent);
console.log("Recruiter dashboard premium packs patched");
