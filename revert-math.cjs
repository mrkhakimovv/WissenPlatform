const fs = require('fs');

let code1 = fs.readFileSync('src/components/MathAnswerField.tsx', 'utf-8');
code1 = code1.replace(/\{\/\* @ts-ignore \*\/\}\n<math-field/g, "<math-field");
fs.writeFileSync('src/components/MathAnswerField.tsx', code1);

let code2 = fs.readFileSync('src/components/MathEditor.tsx', 'utf-8');
code2 = code2.replace(/\{\/\* @ts-ignore \*\/\}\n<math-field/g, "<math-field");
fs.writeFileSync('src/components/MathEditor.tsx', code2);

