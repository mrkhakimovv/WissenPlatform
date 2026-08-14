import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf-8');

// For the main text
code = code.replace(
  /<div className="mb-4 prose max-w-none">/,
  '<div className="mb-4 prose max-w-none break-words whitespace-pre-wrap overflow-x-auto custom-scrollbar">'
);

// For the options
code = code.replace(
  /<div className="flex-1">/,
  '<div className="flex-1 break-words whitespace-pre-wrap overflow-x-auto custom-scrollbar">'
);

// Optional: add a global style or class to ensure KaTeX math can wrap if it's text
// Not strictly needed if we have overflow-x-auto, but the text part will wrap with break-words.

fs.writeFileSync('src/pages/admin/AdminTestBuilder.tsx', code);
