const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const regex = /{activeTab === 'exams' \? \([\s\S]*?\)\s*:\s*\([\s\S]*?\)}/g;
let match;
while ((match = regex.exec(code)) !== null) {
  console.log("Matched block length:", match[0].length);
  const start = match.index;
  const end = match.index + match[0].length;
  console.log(code.substring(end - 50, end + 50));
}
