const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

// We need to add Edit2 icon to imports if not there.
if (!code.includes('Edit2')) {
    code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, Edit2, X, Check } from 'lucide-react';");
}

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
