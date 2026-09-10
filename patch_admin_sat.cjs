const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// Ensure xlsx import
if (!code.includes("import * as XLSX")) {
    code = code.replace(/import \{ db \} from '\.\.\/\.\.\/lib\/firebase';/, 
    "import { db } from '../../lib/firebase';\nimport * as XLSX from 'xlsx';");
}

// Ensure where is imported from firestore
if (!code.includes("where,")) {
    code = code.replace(/getDocs \} from 'firebase\/firestore';/, 
    "getDocs, where } from 'firebase/firestore';");
}

// Add the download function inside the component
const funcInjectionPoint = "  // SAT Lessons states";
const downloadFunc = `  const handleDownloadResults = async (lesson: any) => {
    if (!lesson.assignedGroups || lesson.assignedGroups.length === 0) {
      toast.error("Ushbu darsga hech qanday guruh biriktirilmagan!");
      return;
    }
    
    const loadingToast = toast.loading("Natijalar yuklanmoqda...");
    try {
      // 1. Get all students in these groups
      const usersSnap = await getDocs(query(collection(db, 'users')));
      const students: any[] = [];
      usersSnap.docs.forEach(d => {
        const u = d.data();
        const uGroups = u.groups || (u.groupId ? [u.groupId] : []);
        if (lesson.assignedGroups.some((g: string) => uGroups.includes(g))) {
          students.push({ id: d.id, ...u, uGroups });
        }
      });
      
      if (students.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("Guruhlarda o'quvchilar topilmadi.");
        return;
      }
      
      // 2. Get all results for these students
      const resultsSnap = await getDocs(collection(db, 'exam_results'));
      const allResults = resultsSnap.docs.map(d => d.data());
      
      // 3. Prepare columns from all SAT lessons
      // Sort lessons by createdAt or just use the current order in state (which is usually chronological or by order)
      const sortedLessons = [...lessons].sort((a,b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });
      
      // 4. Build data for Excel
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
      ];
      worksheet['!cols'] = colWidths;
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Natijalar");
      XLSX.writeFile(workbook, \`SAT_Natijalar_\${new Date().toLocaleDateString('uz-UZ')}.xlsx\`);
      
      toast.dismiss(loadingToast);
      toast.success("Yuklab olindi!");
    } catch (err) {
      console.error("Export error:", err);
      toast.dismiss(loadingToast);
      toast.error("Xatolik yuz berdi");
    }
  };

`;

code = code.replace(funcInjectionPoint, downloadFunc + funcInjectionPoint);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
