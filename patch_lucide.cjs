const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf8');

const regex = /import {([^}]+)} from 'lucide-react';/;
const match = code.match(regex);
if (match) {
    if (!match[1].includes('CheckCircle2')) {
        const replacement = `import {${match[1]}, CheckCircle2} from 'lucide-react';`;
        code = code.replace(regex, replacement);
        fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
        console.log("Patched lucide import");
    } else {
        console.log("CheckCircle2 already in import");
    }
}
