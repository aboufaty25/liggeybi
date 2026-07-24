const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

// The line in the grid:
// {pkg.dureeJours >= 99999 ? 'À vie' : `${pkg.dureeJours} jours`}
content = content.replace(
  /{pkg\.dureeJours >= 99999 \? 'À vie' : `\${pkg\.dureeJours} jours`}/g,
  "{pkg.dureeJours >= 99999 ? (pkg.nom.toLowerCase().includes('starter') ? '' : 'À vie') : `${pkg.dureeJours} jours`}"
);

// The line in the dialog:
// <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {pkg.dureeJours >= 99999 ? 'À vie' : `${pkg.dureeJours} Jours`}</span>
content = content.replace(
  /<span className="text-\[10px\] font-bold text-slate-400 uppercase tracking-widest">\/ {pkg\.dureeJours >= 99999 \? 'À vie' : `\${pkg\.dureeJours} Jours`}<\/span>/g,
  `{pkg.dureeJours >= 99999 && pkg.nom.toLowerCase().includes('starter') ? null : <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {pkg.dureeJours >= 99999 ? 'À vie' : \`\${pkg.dureeJours} Jours\`}</span>}`
);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Patched a vie");
