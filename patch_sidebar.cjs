const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

// Fix Desktop Sidebar to be sticky
content = content.replace(
  '<aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-full relative z-20 shrink-0">',
  '<aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-[calc(100vh-64px)] sticky top-16 z-20 shrink-0">'
);

// Fix main content overflow
content = content.replace(
  '<main className="flex-1 w-full max-w-full overflow-hidden pb-6 md:pb-0 relative z-10">',
  '<main className="flex-1 w-full max-w-full pb-12 relative z-10">'
);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Sidebar patched");
