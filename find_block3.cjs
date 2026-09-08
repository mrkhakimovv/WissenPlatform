const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const parts = code.split(`{activeTab === 'exams' ? (`);
if(parts.length > 1) {
  const rest = parts[1];
  const examResult = rest.indexOf(`Barcha yaratilgan testlar to'plami`);
  console.log("Exam Result Index:", examResult);
  if (examResult > -1) {
    const after = rest.substring(examResult, examResult + 6000);
    const endStr = `</>\n        )}`;
    const endIdx = after.indexOf(endStr);
    console.log("End idx:", endIdx);
    console.log("Content around end:", after.substring(endIdx - 100, endIdx + 100));
  }
}
