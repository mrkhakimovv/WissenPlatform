import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

// 1. Add createPortal import
if (!code.includes("createPortal")) {
  code = code.replace(
    "import { motion } from 'motion/react';",
    "import { motion } from 'motion/react';\nimport { createPortal } from 'react-dom';"
  );
}

// 2. Wrap the return in createPortal
// There are multiple returns in StudentTestTake:
// return ( <div ... animate-spin
// return null;
// return ( <div ... Imtihonga tayyormisiz
// return ( <div ... Imtihon yakunlandi
// return ( <div ... The actual test

function wrapPortal(codeStr, searchStr) {
  const replacement = 'return createPortal(\n    ' + searchStr.substring(7) + ',\n    document.body\n  );';
  return codeStr.replace(searchStr, replacement);
}

// Let's do it with a regex that replaces all `return (` at the top level of the component with `return createPortal(`
// Actually, it's safer to just replace them manually.

code = code.replace(
  'return (\n      <div className="fixed inset-0 bg-[#0d0d0d] z-[200] flex items-center justify-center">\n        <div className="w-10 h-10 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>\n      </div>\n    );',
  'return createPortal(\n      <div className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex items-center justify-center">\n        <div className="w-10 h-10 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>\n      </div>,\n      document.body\n    );'
);

code = code.replace(
  'return (\n      <div className="fixed inset-0 bg-[#0d0d0d] z-[200] flex items-center justify-center p-4">\n        <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-lg p-8 flex flex-col items-center text-center border border-white/10">\n          <h2 className="text-[24px] font-black text-white mb-4">Imtihonga tayyormisiz?</h2>',
  'return createPortal(\n      <div className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex items-center justify-center p-4">\n        <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-lg p-8 flex flex-col items-center text-center border border-white/10">\n          <h2 className="text-[24px] font-black text-white mb-4">Imtihonga tayyormisiz?</h2>'
);
// Fix the closing tag of the second one
code = code.replace(
  '      </div>\n    );\n  }\n\n  const m',
  '      </div>,\n      document.body\n    );\n  }\n\n  const m'
);

code = code.replace(
  'return (\n      <div className="fixed inset-0 bg-[#0d0d0d] z-[200] flex items-center justify-center p-4 overflow-y-auto">\n        <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-lg p-8 flex flex-col items-center text-center border border-white/10">',
  'return createPortal(\n      <div className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex items-center justify-center p-4 overflow-y-auto">\n        <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-lg p-8 flex flex-col items-center text-center border border-white/10">'
);
// Fix the closing tag of the third one
code = code.replace(
  '      </div>\n    );\n  }\n\n  const q',
  '      </div>,\n      document.body\n    );\n  }\n\n  const q'
);

code = code.replace(
  '  return (\n    <div ref={containerRef} className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex flex-col select-none">',
  '  return createPortal(\n    <div ref={containerRef} className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex flex-col select-none">'
);
// Fix the closing tag of the fourth one
code = code.replace(
  '      </div>\n    </div>\n  );\n}',
  '      </div>\n    </div>,\n    document.body\n  );\n}'
);


fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
