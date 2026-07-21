const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Change grid-cols-5 to 4
content = content.replace(
  'className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-16"',
  'className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-16"'
);

// Remove the Spontanée block
const regex = /<Link to="\/candidature-spontanee" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-purple-100\/30 hover:shadow-2xl hover:shadow-purple-200\/50 border border-slate-100 hover:border-purple-200 transition-all duration-300 group flex flex-col items-center text-center col-span-2 lg:col-span-1">[\s\S]*?<\/Link>/;
content = content.replace(regex, '');

fs.writeFileSync('src/pages/Home.tsx', content);
console.log("Home fixed");
