const fs = require('fs');
let content = fs.readFileSync('src/pages/CandidateDashboard.tsx', 'utf8');

// Change the filter in the grid
content = content.replace(
  /{cvPackages\.filter\(pkg => !\(pkg\.type === 'DEPOT' && canUpload\)\)\.map/g,
  "{cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').sort((a, b) => b.prix - a.prix).map"
);

fs.writeFileSync('src/pages/CandidateDashboard.tsx', content);
console.log("Grid filter patched");
