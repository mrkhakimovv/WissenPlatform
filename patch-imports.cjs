const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

if (!code.includes('import { auth }')) {
  code = code.replace("import { db } from '../../lib/firebase';", "import { db, auth } from '../../lib/firebase';");
  fs.writeFileSync('src/pages/admin/AdminStudents.tsx', code);
}
