import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf8');

code = code.replace(
  '<div className="flex flex-1 overflow-x-auto custom-scrollbar min-w-0">',
  '<div className="flex flex-1 overflow-hidden min-w-0">'
);
code = code.replace(
  '<div className="flex-1 min-w-0 flex flex-col lg:flex-row overflow-x-auto custom-scrollbar bg-[#0d0d0d]">',
  '<div className="flex-1 min-w-0 flex flex-col lg:flex-row overflow-hidden bg-[#0d0d0d]">'
);
code = code.replace(
  '<div className="bg-white text-black p-6 rounded-xl shadow-lg min-h-[300px] w-full overflow-x-auto custom-scrollbar">',
  '<div className="bg-white text-black p-6 rounded-xl shadow-lg min-h-[300px] w-full overflow-hidden">'
);

fs.writeFileSync('src/pages/admin/AdminTestBuilder.tsx', code);
