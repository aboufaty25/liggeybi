const fs = require('fs');
const path = 'src/pages/Home.tsx';
let content = fs.readFileSync(path, 'utf8');

// First remove the old placement
content = content.replace("      </div>\n      <SpontaneousApplicationWidget />\n    </div>\n  );\n}", "      </div>\n    </div>\n  );\n}");

// Then insert it in the new placement
const target = "        {/* Premium CV Slider */}";
const replacement = "        {/* Spontaneous Application Inline Widget */}\n        <SpontaneousApplicationWidget />\n\n        {/* Premium CV Slider */}";

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Patched successfully");
} else {
  console.log("Target not found");
}
