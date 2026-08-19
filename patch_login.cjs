const fs = require('fs');

function patchFile(filename) {
    let code = fs.readFileSync(filename, 'utf-8');
    code = code.replace(/navigate\('\/'\);/g, `navigate('/', { replace: true });`);
    fs.writeFileSync(filename, code);
}

patchFile('src/pages/Login.tsx');

