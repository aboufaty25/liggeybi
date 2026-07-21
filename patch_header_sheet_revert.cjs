const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

const oldTrigger = `<SheetTrigger asChild>
              <Button variant="ghost" className="lg:hidden p-2 text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors ml-1">
                <Menu className="h-7 w-7" />
              </Button>
            </SheetTrigger>`;

const newTrigger = `<SheetTrigger
              render={
                <Button variant="ghost" className="lg:hidden p-2 text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors ml-1">
                  <Menu className="h-7 w-7" />
                </Button>
              }
            />`;

content = content.replace(oldTrigger, newTrigger);

fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log("Header SheetTrigger reverted");
