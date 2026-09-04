const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf-8');

if (!code.includes("import AdminAddStudentModal")) {
    code = code.replace(
        "import { Group } from '../types';",
        "import { Group } from '../types';\nimport AdminAddStudentModal from './AdminAddStudentModal';"
    );
}
fs.writeFileSync('src/components/AdminLayout.tsx', code);
