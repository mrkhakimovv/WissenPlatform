const fs = require('fs');

// Update vite-env.d.ts
let envCode = fs.readFileSync('src/vite-env.d.ts', 'utf-8');
envCode = envCode.replace(
  "readonly?: boolean;",
  "readonly?: boolean;\n      virtualKeyboardMode?: string;\n      'math-virtual-keyboard-policy'?: string;"
);
fs.writeFileSync('src/vite-env.d.ts', envCode);

// Remove from MathAnswerField.tsx
let ansCode = fs.readFileSync('src/components/MathAnswerField.tsx', 'utf-8');
ansCode = ansCode.replace(/declare global \{\s*namespace JSX \{\s*interface IntrinsicElements \{\s*'math-field'[\s\S]*?\}\s*\}\s*\}/, "");
fs.writeFileSync('src/components/MathAnswerField.tsx', ansCode);

