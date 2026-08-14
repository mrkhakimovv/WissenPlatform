import fs from 'fs';
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(/-e\s*\/\* Force KaTeX to allow wrapping for long text blocks \*\//g, '/* Force KaTeX to allow wrapping for long text blocks */');

fs.writeFileSync('src/index.css', code);
