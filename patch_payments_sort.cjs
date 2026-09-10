const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const target = `{activeStudents.filter(s => searchTerm === '' || s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())).map(student => {
          const debtInfo = getDebtInfo(student);`;

const replacement = `{activeStudents
        .filter(s => searchTerm === '' || s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
           const debtA = getDebtInfo(a).totalDebt;
           const debtB = getDebtInfo(b).totalDebt;
           if ((debtA > 0 && debtB > 0) || (debtA === 0 && debtB === 0)) {
              return (a.fullName || '').localeCompare(b.fullName || '');
           }
           return debtA > 0 ? -1 : 1;
        })
        .map(student => {
          const debtInfo = getDebtInfo(student);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
