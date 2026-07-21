const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const uiBlock = `                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Boutique Promo</p>
                             <p className="text-[10px] text-gray-400 font-bold">Afficher le bouton Boutique Promo dans le header</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !boutiquePromoEnabled;
                               setBoutiquePromoEnabled(newState);
                               handleUpdateConfig('boutique_promo_enabled', newState);
                             }}
                             className={\`h-10 px-6 rounded-xl font-black uppercase text-[10px] \${boutiquePromoEnabled ? 'bg-green-600' : 'bg-red-600'}\`}
                          >
                             {boutiquePromoEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>\n`;

content = content.replace(
  '<div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">\n                          <div>\n                             <p className="font-black uppercase text-xs">Barre de recherche du Header</p>',
  uiBlock + '                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">\n                          <div>\n                             <p className="font-black uppercase text-xs">Barre de recherche du Header</p>'
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
console.log("Patched admin boutique toggle 2");
