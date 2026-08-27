const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf8');

if (!code.includes("import * as XLSX from 'xlsx';")) {
  code = code.replace("import React,", "import React, { useState, useEffect } from 'react';\nimport * as XLSX from 'xlsx';\n//");
  // wait, let's just insert it after the other imports
  code = code.replace("import { createPortal }", "import { createPortal }\nimport * as XLSX from 'xlsx';");
}

const target = `  const exportCSV = () => {
    let csv = "O'rin,F.I.SH.,To'g'ri (55 dan),Qobiliyat (θ),Ball (T-shkala),Daraja\\n";
    results.forEach((r, i) => {
      csv += \`\${i + 1},"\${r.studentName}",\${r.correct},\${r.theta.toFixed(3)},\${r.ball},\${r.grade}\\n\`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = \`sertifikat_\${exam.title.replace(/\\s+/g, '_')}_natijalar.csv\`;
    link.click();
  };`;

const replacement = `  const exportExcel = () => {
    const data = results.map((r, i) => ({
      "O'rin": i + 1,
      "F.I.SH.": r.studentName,
      "To'g'ri": r.correct,
      "Qobiliyat (θ)": parseFloat(r.theta.toFixed(3)),
      "Ball (T-shkala)": r.ball,
      "Daraja": r.grade
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Natijalar");
    
    worksheet['!cols'] = [
      { wch: 8 }, 
      { wch: 30 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 15 }, 
    ];

    XLSX.writeFile(workbook, \`sertifikat_\${exam.title.replace(/\\s+/g, '_')}_natijalar.xlsx\`);
  };`;

code = code.replace(target, replacement);
code = code.replace("onClick={exportCSV}", "onClick={exportExcel}");

fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
console.log("Patched export to Excel");
