import fs from 'fs';
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(/createdAt: string;\n}/, 'createdAt: string;\n  days?: string[];\n  startTime?: string;\n  endTime?: string;\n}');
fs.writeFileSync('src/types.ts', code);
