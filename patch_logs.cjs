const fs = require('fs');

// Patch AdminDashboard
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');
code = code.replace(
  `console.error("Error fetching user", e);`,
  `console.error("AdminDashboard user fetch error:", e);`
);
fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);

// Patch AuthContext
let code2 = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');
code2 = code2.replace(
  `console.error('Error fetching user:', err);`,
  `console.error('AuthContext user fetch error:', err);`
);
fs.writeFileSync('src/contexts/AuthContext.tsx', code2);
