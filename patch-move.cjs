const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf-8');

// Find the definition of handleDeleteResult
const startStr = '  const handleDeleteResult = async (studentId: string, synthetic?: boolean) => {';
const endStr = '  };\n\n  const loadResults = async () => {';

let startIndex = code.indexOf(startStr);
let endIndex = code.indexOf(endStr) + '  };\n\n'.length;

const funcBody = code.substring(startIndex, endIndex);

// Remove it from its current place
code = code.replace(funcBody, '');

// Insert it before useEffect(() => {
code = code.replace('  useEffect(() => {\n', funcBody + '  useEffect(() => {\n');

fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
