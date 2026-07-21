const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Add state
content = content.replace(
  'const [headerSearchEnabled, setHeaderSearchEnabled] = useState(true);',
  'const [headerSearchEnabled, setHeaderSearchEnabled] = useState(true);\n  const [boutiquePromoEnabled, setBoutiquePromoEnabled] = useState(true);'
);

// Fetch state
content = content.replace(
  "if (configMap.header_search_enabled === 'false') setHeaderSearchEnabled(false);",
  "if (configMap.header_search_enabled === 'false') setHeaderSearchEnabled(false);\n        if (configMap.boutique_promo_enabled === 'false') setBoutiquePromoEnabled(false);"
);

// Add UI toggle
// Let's find where headerSearchEnabled UI is
const uiBlock = `                          <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                             <div>
                                <h4 className="font-bold text-gray-900">Boutique Promo</h4>
                                <p className="text-[10px] text-gray-500">Afficher le bouton Boutique dans l'entête</p>
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
                          </div>`;

content = content.replace(
  '<h4 className="font-bold text-gray-900">Recherche dans l\'entête</h4>',
  uiBlock + '\n                          <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">\n                             <div>\n                                <h4 className="font-bold text-gray-900">Recherche dans l\'entête</h4>'
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
console.log("Patched admin boutique toggle");
