const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

content = content.replace(
  /import \{ (.*?) \} from 'lucide-react';/,
  "import { $1, ChevronRight, Crown, FileText, LogOut } from 'lucide-react';"
);

fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log("Imports updated");
