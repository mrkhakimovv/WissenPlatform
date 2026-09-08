const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const parts = code.split(`{activeTab === 'exams' ? (`);
if(parts.length > 1) {
  const rest = parts[1].substring(0, 4000);
  console.log(rest.substring(rest.lastIndexOf('</>'), rest.lastIndexOf('</>') + 200));
}
