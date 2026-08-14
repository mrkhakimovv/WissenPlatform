import fs from 'fs';
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('testSources?: {')) {
  code = code.replace('testId?: string;', 'testId?: string;\n  testSources?: { testId: string; name: string; count: number }[];');
  fs.writeFileSync('src/types.ts', code);
}
