const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace("  viewedBy?: string[];", "  viewedBy?: string[];\n  mediaUrl?: string;\n  mediaType?: 'image' | 'video';");
fs.writeFileSync('src/types.ts', code);
