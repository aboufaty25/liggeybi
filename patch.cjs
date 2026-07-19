const fs = require('fs');
const path = 'src/pages/CVtheque.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                <div className="h-48 relative overflow-hidden bg-gray-100 border-b border-gray-100">
                    {/* PDF Background icon rendering */}
                    {profile.cvUrl && (
                       <div className="absolute inset-0 flex items-center justify-center opacity-20 transform scale-150 mix-blend-multiply pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-gray-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                       </div>
                    )}
                    <div className={\`absolute inset-0 opacity-20 \${isPremium ? 'bg-gradient-to-b from-amber-400 to-transparent' : 'bg-gradient-to-b from-[#006837] to-transparent'}\`} />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 z-10">`;

const replacement = `                <div className="h-48 relative overflow-hidden bg-gray-100 border-b border-gray-100 group/pdf cursor-pointer" onClick={() => setSelectedCv(profile.cvUrl)}>
                    {/* PDF Background preview rendering */}
                    {profile.cvUrl ? (
                      <iframe 
                        src={\`\${profile.cvUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH\`}
                        className="absolute top-0 left-0 w-[200%] h-[200%] border-0 scale-50 origin-top-left pointer-events-none opacity-90 transition-opacity duration-300 group-hover/pdf:opacity-100"
                        title="PDF Preview"
                      />
                    ) : (
                       <div className="absolute inset-0 flex items-center justify-center opacity-20 transform scale-150 mix-blend-multiply pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-gray-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                       </div>
                    )}
                    <div className={\`absolute inset-0 opacity-20 pointer-events-none \${isPremium ? 'bg-gradient-to-b from-amber-400 to-transparent' : 'bg-gradient-to-b from-[#006837] to-transparent'}\`} />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 z-10 pointer-events-none">`;

if (content.includes(target)) {
  fs.writeFileSync(path, content.replace(target, replacement));
  console.log("Patched successfully");
} else {
  console.log("Target string not found!");
}
