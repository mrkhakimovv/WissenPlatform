import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf-8');

// For the main text
code = code.replace(
  /<div className="mb-4 prose max-w-none whitespace-pre-wrap \[word-break:normal\] overflow-x-auto custom-scrollbar">/g,
  '<div className="mb-4 prose max-w-none whitespace-pre-wrap overflow-x-auto custom-scrollbar" style={{ wordBreak: "normal", overflowWrap: "break-word" }}>'
);

// For the options
code = code.replace(
  /<div className="flex-1 whitespace-pre-wrap \[word-break:normal\] overflow-x-auto custom-scrollbar">/g,
  '<div className="flex-1 whitespace-pre-wrap overflow-x-auto custom-scrollbar" style={{ wordBreak: "normal", overflowWrap: "break-word" }}>'
);

fs.writeFileSync('src/pages/admin/AdminTestBuilder.tsx', code);
