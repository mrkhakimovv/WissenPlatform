const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

// Add import for formatDateTimeUz
if (!code.includes('formatDateTimeUz')) {
  // Let's replace "import { formatCurrency" or similar, or just add it at the top.
  code = code.replace("import { db, auth } from '../../lib/firebase';", "import { db, auth } from '../../lib/firebase';\\nimport { formatDateTimeUz } from '../../lib/utils';");
}

const oldStr = "{selectedStudent.lastActive \\n                        ? new Date(selectedStudent.lastActive).toLocaleString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) \\n                        : \\\"Tizimga kirmagan\\\"}";
const newStr = "{selectedStudent.lastActive \\n                        ? formatDateTimeUz(selectedStudent.lastActive)\\n                        : \\\"Tizimga kirmagan\\\"}";

// Simple replacement for the string that is actually there
// The original was:
//                       {selectedStudent.lastActive 
//                        ? new Date(selectedStudent.lastActive).toLocaleString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
//                        : "Tizimga kirmagan"}

// Since formatting with spaces is tricky, I'll use regex.
code = code.replace(/\{selectedStudent\.lastActive\s*\?\s*new\s+Date\(selectedStudent\.lastActive\)\.toLocaleString\([^)]+\)\s*:\s*"Tizimga kirmagan"\}/g, '{selectedStudent.lastActive ? formatDateTimeUz(selectedStudent.lastActive) : "Tizimga kirmagan"}');

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', code);
