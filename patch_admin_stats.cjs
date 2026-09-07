const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const target = `  const collectedAmount = currentMonthPayments.filter(p => p.status !== 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const forgivenAmount = currentMonthPayments.filter(p => p.status === 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpectedRaw = activeStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
  const totalExpected = Math.max(0, totalExpectedRaw - forgivenAmount);
  const totalDebt = Math.max(0, totalExpected - collectedAmount);
  
  const paidStudentsCount = activeStudents.filter(s => {
    const rec = getPaymentRecord(s.id);
    return rec && rec.status !== 'forgiven';
  }).length;
  const forgivenStudentsCount = activeStudents.filter(s => {
    const rec = getPaymentRecord(s.id);
    return rec && rec.status === 'forgiven';
  }).length;`;

const repl = `  const activeStudentIds = new Set(activeStudents.map(s => s.id));
  const activeCurrentMonthPayments = currentMonthPayments.filter(p => activeStudentIds.has(p.studentId));

  const collectedAmount = activeCurrentMonthPayments.filter(p => p.status !== 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const forgivenAmount = activeCurrentMonthPayments.filter(p => p.status === 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpectedRaw = activeStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
  const totalExpected = Math.max(0, totalExpectedRaw - forgivenAmount);
  
  // Haqiqiy qarzni hisoblash uchun faqat active o'quvchilarning joriy qarzini qo'shamiz
  const totalDebt = activeStudents.reduce((acc, s) => acc + getDebtInfo(s).currentMonthDebt, 0);
  
  const paidStudentsCount = activeStudents.filter(s => {
    return activeCurrentMonthPayments.some(p => p.studentId === s.id && p.status !== 'forgiven');
  }).length;
  const forgivenStudentsCount = activeStudents.filter(s => {
    return activeCurrentMonthPayments.some(p => p.studentId === s.id && p.status === 'forgiven');
  }).length;`;

code = code.replace(target, repl);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
