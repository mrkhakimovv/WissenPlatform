const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const activeStudentsRegex = /const activeStudents = students\.filter\(s => \{[\s\S]*?return jy < filterYear \|\| \(jy === filterYear && jm <= filterMonth\);\s*\}\);/;

const activeStudentsReplacement = `const activeStudents = students.filter(s => {
    let jd;
    if (s.joinedDate) {
       jd = new Date(s.joinedDate);
    } else if (s.createdAt) {
       jd = new Date(s.createdAt);
    } else {
       jd = new Date("2026-09-01");
    }
    const jy = jd.getFullYear();
    const jm = jd.getMonth() + 1;
    return jy < filterYear || (jy === filterYear && jm <= filterMonth);
  });`;


const debtInfoRegex = /let joinedYear = filterYear;\s*let joinedMonth = filterMonth;\s*if \(student\.joinedDate\) \{\s*const jd = new Date\(student\.joinedDate\);\s*joinedYear = jd\.getFullYear\(\);\s*joinedMonth = jd\.getMonth\(\) \+ 1;\s*\}/;

const debtInfoReplacement = `let joinedYear = filterYear;
    let joinedMonth = filterMonth;
    
    let jd;
    if (student.joinedDate) {
       jd = new Date(student.joinedDate);
    } else if (student.createdAt) {
       jd = new Date(student.createdAt);
    } else {
       jd = new Date("2026-09-01");
    }
    joinedYear = jd.getFullYear();
    joinedMonth = jd.getMonth() + 1;`;

if (activeStudentsRegex.test(code)) {
    code = code.replace(activeStudentsRegex, activeStudentsReplacement);
    console.log("Patched activeStudents");
} else {
    console.log("activeStudentsRegex failed");
}

if (debtInfoRegex.test(code)) {
    code = code.replace(debtInfoRegex, debtInfoReplacement);
    console.log("Patched debtInfo");
} else {
    console.log("debtInfoRegex failed");
}

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
