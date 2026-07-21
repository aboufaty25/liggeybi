const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

if (!content.includes('const [isBoutiquePromoEnabled, setIsBoutiquePromoEnabled]')) {
    content = content.replace("const [isHeaderSearchEnabled, setIsHeaderSearchEnabled] = useState(true);", 
    "const [isHeaderSearchEnabled, setIsHeaderSearchEnabled] = useState(true);\n  const [isBoutiquePromoEnabled, setIsBoutiquePromoEnabled] = useState(true);");
    
    content = content.replace("if (data.header_search_enabled === 'false') setIsHeaderSearchEnabled(false);",
    "if (data.header_search_enabled === 'false') setIsHeaderSearchEnabled(false);\n        if (data.boutique_promo_enabled === 'false') setIsBoutiquePromoEnabled(false);");
    
    // In Header.tsx we have navLinks array. We need to filter it.
    // Replace `{navLinks.map((link) => {` with `{navLinks.filter(l => l.name !== 'Boutique' || isBoutiquePromoEnabled).map((link) => {`
    content = content.replace("{navLinks.map((link) => {", "{navLinks.filter(l => l.name !== 'Boutique' || isBoutiquePromoEnabled).map((link) => {");
    
    // We also have another navLinks.map in the standard desktop header:
    // `{navLinks.map((link) => (` inside the <nav> (actually wait, earlier we did `navLinks.filter(l => l.name !== 'Boutique' && !l.mobileOnly).map((link) => (` )
    // Let's check how the Desktop boutique button is rendered
}

fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log("Header boutique patched");
