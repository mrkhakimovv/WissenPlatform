const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const target = `      // 4. Build data for Excel
      const excelData = students.map(student => {
        const row: any = {
          "Ism Familiya": student.fullName || 'Noma\\'lum',
          "Guruh Nomi": student.uGroups.map((gId: string) => groups.find(g => g.id === gId)?.name || gId).join(', ')
        };
        
        sortedLessons.forEach(l => {
          if (l.homeworkTestId) {
            // Find result for this lesson and student
            const result = allResults.find(r => r.studentId === student.id && r.testId === l.homeworkTestId);
            if (result) {
              row[l.title] = \`\${result.score} / \${result.total}\`;
            } else {
              row[l.title] = "Topshirmagan";
            }
          }
        });
        
        return row;
      });
      
      // 5. Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Calculate column widths
      const colWidths = [
        { wch: 30 }, // Ism Familiya
        { wch: 20 }, // Guruh nomi
        ...sortedLessons.filter(l => l.homeworkTestId).map(() => ({ wch: 15 }))
      ];`;

const replacement = `      // 4. Build data for Excel
      const excelData = students.map(student => {
        const row: any = {
          "Ism Familiya": student.fullName || 'Noma\\'lum',
          "Guruh Nomi": student.uGroups.map((gId: string) => groups.find(g => g.id === gId)?.name || gId).join(', ')
        };
        
        sortedLessons.forEach(l => {
          // Doim ustun bo'lishi uchun bo'sh joy bilan initsializatsiya qilamiz
          row[l.title] = "";
          
          if (l.homeworkTestId) {
            // Find result for this lesson and student
            const result = allResults.find(r => r.studentId === student.id && r.testId === l.homeworkTestId);
            if (result) {
              row[l.title] = \`\${result.score} / \${result.total}\`;
            }
          }
        });
        
        return row;
      });
      
      // 5. Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Calculate column widths
      const colWidths = [
        { wch: 30 }, // Ism Familiya
        { wch: 20 }, // Guruh nomi
        ...sortedLessons.map(() => ({ wch: 15 }))
      ];`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
