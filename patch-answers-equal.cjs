const fs = require('fs');
let code = fs.readFileSync('src/components/MathAnswerField.tsx', 'utf-8');

code = code.replace(
  /export async function answersEqual\(a: string, b: string\): Promise<boolean> \{[\s\S]*?const strB = String\(b\)\.replace\(\/\\s\/g, ''\)\.toLowerCase\(\);\n  if \(strA === strB\) return true;/m,
  `export async function answersEqual(a: string, b: string): Promise<boolean> {
  if (!a || !b) return false;
  
  const strA = String(a).replace(/\\s/g, '').toLowerCase();
  const strB = String(b).replace(/\\s/g, '').toLowerCase();
  if (strA === strB) return true;
  
  // Bypassing ComputeEngine temporarily to prevent thread blocking
  return false;
  /*`
);

code = code.replace(
  /return false;\n\}/g,
  `return false;\n}\n*/\n}`
);

fs.writeFileSync('src/components/MathAnswerField.tsx', code);
