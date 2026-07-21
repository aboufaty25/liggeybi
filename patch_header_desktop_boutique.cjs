const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// Replace `<Link to="/boutique" className="hidden md:flex ml-2">`
content = content.replace(
  '{/* Boutique Button */}\n          <Link to="/boutique" className="hidden md:flex ml-2">',
  '{/* Boutique Button */}\n          {isBoutiquePromoEnabled && <Link to="/boutique" className="hidden md:flex ml-2">'
);
content = content.replace(
  '              </Button>\n            </Link>\n\n          {user ? (',
  '              </Button>\n            </Link>}\n\n          {user ? ('
);

// Mobile icon boutique button (next to Search)
content = content.replace(
  '            <Link to="/boutique" className="relative group">',
  '            {isBoutiquePromoEnabled && <Link to="/boutique" className="relative group">'
);
content = content.replace(
  '              </Button>\n            </Link>\n          </div>\n        </div>',
  '              </Button>\n            </Link>}\n          </div>\n        </div>'
);

fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log("Patched header desktop boutique");
