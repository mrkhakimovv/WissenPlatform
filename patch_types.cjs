const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(
  "  maxAttempts?: number;",
  "  maxAttempts?: number;\n  status?: 'active' | 'ended';"
);
fs.writeFileSync('src/types.ts', code);
