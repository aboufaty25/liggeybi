const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// For desktop:
content = content.replace(
  '            </motion.div>\n          </Link>\n\n          {isLoading ? (',
  '            </motion.div>\n          </Link>}\n\n          {isLoading ? ('
);

// For mobile:
content = content.replace(
  '                BOUTIQUE&nbsp;&nbsp;<span className="bg-[#ED1C24] text-white px-1.5 py-0.5 rounded text-[8px] font-black shadow-sm">PROMO</span>\n              </Button>\n            </Link>\n          </div>\n        </div>',
  '                BOUTIQUE&nbsp;&nbsp;<span className="bg-[#ED1C24] text-white px-1.5 py-0.5 rounded text-[8px] font-black shadow-sm">PROMO</span>\n              </Button>\n            </Link>}\n          </div>\n        </div>'
);

fs.writeFileSync('src/components/layout/Header.tsx', content);
