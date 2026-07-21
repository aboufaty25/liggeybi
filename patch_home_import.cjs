const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace("import { Send, Link", "import { Link");
if (!content.includes("Send } from 'lucide-react'")) {
    content = content.replace("import { Search,", "import { Search, Send,");
}

fs.writeFileSync('src/pages/Home.tsx', content);
