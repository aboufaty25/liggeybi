const fs = require('fs');
let content = fs.readFileSync('src/components/cards/JobCard.tsx', 'utf8');

content = content.replace(
  "p-3 md:p-4 w-full flex flex-row items-center gap-4 md:gap-6",
  "p-2.5 md:p-4 w-full flex flex-row items-center gap-3 md:gap-6"
);

content = content.replace(
  "h-16 w-16 md:h-20 md:w-20",
  "h-12 w-12 md:h-20 md:w-20"
);

content = content.replace(
  "h-16 w-16 md:h-20 md:w-20",
  "h-12 w-12 md:h-20 md:w-20"
);

content = content.replace(
  "mb-1 md:mb-1.5 text-[13px] md:text-base line-clamp-2",
  "mb-0.5 md:mb-1.5 text-xs md:text-base line-clamp-2"
);

content = content.replace(
  "gap-x-4 gap-y-1.5 mt-1 text-[11px]",
  "gap-x-3 gap-y-1 mt-1 text-[10px] md:text-[11px]"
);

fs.writeFileSync('src/components/cards/JobCard.tsx', content);
console.log("JobCard patched");
