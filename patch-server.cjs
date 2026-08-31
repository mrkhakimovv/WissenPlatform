const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace("const updateAuthPayload = {};", "const updateAuthPayload: Record<string, any> = {};");
code = code.replace("const updateDbPayload = {};", "const updateDbPayload: Record<string, any> = {};");

fs.writeFileSync('server.ts', code);
