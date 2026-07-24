const fs = require('fs');
let content = fs.readFileSync('src/components/common/SidebarWidgets.tsx', 'utf8');

content = content.replace(
  '{!hideWhatsApp && (\n      {/* WhatsApp alert box */}\n      <div className="bg-gradient-to-b',
  '{!hideWhatsApp && (\n      <div className="bg-gradient-to-b'
);

fs.writeFileSync('src/components/common/SidebarWidgets.tsx', content);
console.log("Syntax fixed");
