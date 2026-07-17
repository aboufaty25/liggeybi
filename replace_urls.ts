import fs from 'fs';

const files = [
  'server.ts',
  'src/lib/google-indexing.ts',
  'src/pages/LocalOffreDetail.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace environment variable patterns with 'https://www.liggeybi.com'
  content = content.replace(/process\.env\.VITE_APP_URL\s*\|\|\s*process\.env\.APP_URL\s*\|\|\s*['"]https:\/\/liggeybi\.com['"]/g, "'https://www.liggeybi.com'");
  content = content.replace(/process\.env\.VITE_APP_URL\s*\|\|\s*process\.env\.APP_URL\s*\|\|\s*['"]https:\/\/www\.liggeybi\.com['"]/g, "'https://www.liggeybi.com'");
  content = content.replace(/process\.env\.VITE_APP_URL\s*\|\|\s*['"]https:\/\/liggeybi\.com['"]/g, "'https://www.liggeybi.com'");
  content = content.replace(/process\.env\.APP_URL\s*\|\|\s*['"]https:\/\/liggeybi\.com['"]/g, "'https://www.liggeybi.com'");
  content = content.replace(/process\.env\.APP_URL\s*\|\|\s*['"]https:\/\/www\.liggeybi\.com['"]/g, "'https://www.liggeybi.com'");

  // Replace plain https://liggeybi.com with https://www.liggeybi.com
  content = content.replace(/https:\/\/liggeybi\.com/g, "https://www.liggeybi.com");
  
  // Clean up any potential double www's (just in case)
  content = content.replace(/https:\/\/www\.www\.liggeybi\.com/g, "https://www.liggeybi.com");

  // For the src/lib/google-indexing.ts specific code
  content = content.replace(/const appUrlInput = 'https:\/\/www.liggeybi.com';\n\s*let appUrl = appUrlInput\.endsWith\('\/'\) \? appUrlInput\.slice\(0, -1\) : appUrlInput;/g, "let appUrl = 'https://www.liggeybi.com';");

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
