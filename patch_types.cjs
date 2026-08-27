const fs = require('fs');

let typesCode = fs.readFileSync('src/types.ts', 'utf8');
typesCode = typesCode.replace(
  "comments?: { id: string, userId: string, userName: string, text: string, createdAt: string }[];",
  "comments?: { id: string, userId: string, userName: string, text: string, createdAt: string, reactions?: Record<string, string[]> }[];"
);
fs.writeFileSync('src/types.ts', typesCode);

let studentCode = fs.readFileSync('src/pages/student/StudentNews.tsx', 'utf8');
studentCode = studentCode.replace(
  "  createdAt: string;\n}",
  "  createdAt: string;\n  reactions?: Record<string, string[]>;\n}"
);
fs.writeFileSync('src/pages/student/StudentNews.tsx', studentCode);

console.log("Patched types");
