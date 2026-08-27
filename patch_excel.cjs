const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf8');

code = code.replace("import * as XLSX from 'xlsx';", "import * as XLSX from 'xlsx-js-style';");

const target = `  const exportExcel = () => {
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

const replacement = `  const exportExcel = () => {
    const numItems = report?.stats?.numItems || 45; // Default to 45 if not found
    
    const data = results.map((r, i) => {
      const xato = numItems - r.correct;
      const foiz = ((r.correct / numItems) * 100).toFixed(1);
      
      return {
        "O'rin": i + 1,
        "F.I.SH.": r.studentName,
        "Umumiy savollar": numItems,
        "To'g'ri": r.correct,
        "Noto'g'ri": xato,
        "Foiz (%)": parseFloat(foiz),
        "Qobiliyat (θ)": parseFloat(r.theta.toFixed(3)),
        "Ball (T-shkala)": r.ball,
        "Daraja": r.grade
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Apply styles to all cells
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:I1");
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
        
        const isHeader = R === 0;
        
        worksheet[cellAddress].s = {
          font: { 
            name: "Times New Roman", 
            sz: 12,
            bold: isHeader
          },
          alignment: { 
            vertical: "center", 
            horizontal: isHeader ? "center" : (C === 1 ? "left" : "center")
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
        
        if (isHeader) {
           worksheet[cellAddress].s.fill = {
             fgColor: { rgb: "EAEAEA" }
           };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Natijalar");
    
    worksheet['!cols'] = [
      { wch: 8 },  // O'rin
      { wch: 35 }, // F.I.SH.
      { wch: 18 }, // Umumiy
      { wch: 12 }, // To'g'ri
      { wch: 12 }, // Noto'g'ri
      { wch: 12 }, // Foiz
      { wch: 15 }, // Qobiliyat
      { wch: 18 }, // Ball
      { wch: 12 }, // Daraja
    ];

    XLSX.writeFile(workbook, \`sertifikat_\${exam.title.replace(/\\s+/g, '_')}_natijalar.xlsx\`);
  };`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
  console.log("Patched export excel successfully");
} else {
  console.log("Could not find target block");
}
