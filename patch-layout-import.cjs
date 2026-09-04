const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf-8');

// The initial replacement missed UserPlus from lucide-react if the line was slightly different. Let's make sure it's there.
if (!code.includes("UserPlus")) {
    code = code.replace(
        "import { LogOut, X, QrCode } from 'lucide-react';",
        "import { LogOut, X, QrCode, UserPlus } from 'lucide-react';"
    );
}

// In case the above didn't match, let's just add it to the imports if it's missing but lucide-react is there.
if (code.includes('lucide-react') && !code.includes('UserPlus')) {
    code = code.replace(
        /import\s+\{[^}]+\}\s+from\s+['"]lucide-react['"];/,
        (match) => match.replace('}', ', UserPlus }')
    );
}

fs.writeFileSync('src/components/AdminLayout.tsx', code);
