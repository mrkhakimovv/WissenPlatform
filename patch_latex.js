import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

if (!code.includes("import Latex")) {
  code = code.replace(
    "import { motion } from 'motion/react';",
    "import { motion } from 'motion/react';\nimport Latex from 'react-latex-next';\nimport 'katex/dist/katex.min.css';"
  );
}

code = code.replace(
  "{q.text}",
  "<Latex>{q.text}</Latex>"
);

code = code.replace(
  "<span className=\"text-[15px]\">{opt}</span>",
  "<span className=\"text-[15px]\"><Latex>{opt}</Latex></span>"
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
