const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

// Replace totalAmount
const targetTotal = `  const currentMonthPayments = payments.filter(p => p.month === filterMonth && p.year === filterYear);
  const totalAmount = currentMonthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);`;
const replacementTotal = `  const currentMonthPayments = payments.filter(p => p.month === filterMonth && p.year === filterYear);
  const collectedAmount = currentMonthPayments.filter(p => p.status !== 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const forgivenAmount = currentMonthPayments.filter(p => p.status === 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpected = students.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
  const totalDebt = Math.max(0, totalExpected - collectedAmount - forgivenAmount);
  
  const paidStudentsCount = students.filter(s => {
    const rec = getPaymentRecord(s.id);
    return rec && rec.status !== 'forgiven';
  }).length;
  const forgivenStudentsCount = students.filter(s => {
    const rec = getPaymentRecord(s.id);
    return rec && rec.status === 'forgiven';
  }).length;`;
code = code.replace(targetTotal, replacementTotal);


// Replace the Stats Grid values
const targetGrid = `<div className="text-lg md:text-xl font-black text-white">{(students.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0)).toLocaleString()} <span className="text-sm font-medium text-white/40">so'm</span></div>
            <div className="text-[11px] font-bold text-white/30 mt-2">Jami o'quvchilar: {students.length} ta</div>
          </div>
          <div className="glass-panel p-4 md:p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5"></div>
            <div className="relative">
              <div className="text-[11px] font-bold text-green-500/60 uppercase tracking-widest mb-1">Yig'ildi</div>
              <div className="text-lg md:text-xl font-black text-green-400">{totalAmount.toLocaleString()} <span className="text-sm font-medium text-green-500/40">so'm</span></div>
              <div className="text-[11px] font-bold text-green-500/40 mt-2">To'laganlar: {students.filter(s => getPaymentRecord(s.id)).length} ta</div>
            </div>
          </div>
          <div className="glass-panel p-4 md:p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5"></div>
            <div className="relative">
              <div className="text-[11px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Qarzdorlik</div>
              <div className="text-lg md:text-xl font-black text-red-400">{Math.max(0, students.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0) - totalAmount).toLocaleString()} <span className="text-sm font-medium text-red-500/40">so'm</span></div>
              <div className="text-[11px] font-bold text-red-500/40 mt-2">To'lamaganlar: {students.length - students.filter(s => getPaymentRecord(s.id)).length} ta</div>
            </div>`;

const replacementGrid = `<div className="text-lg md:text-xl font-black text-white">{totalExpected.toLocaleString()} <span className="text-sm font-medium text-white/40">so'm</span></div>
            <div className="text-[11px] font-bold text-white/30 mt-2">Jami o'quvchilar: {students.length} ta</div>
          </div>
          <div className="glass-panel p-4 md:p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5"></div>
            <div className="relative">
              <div className="text-[11px] font-bold text-green-500/60 uppercase tracking-widest mb-1">Yig'ildi</div>
              <div className="text-lg md:text-xl font-black text-green-400">{collectedAmount.toLocaleString()} <span className="text-sm font-medium text-green-500/40">so'm</span></div>
              <div className="text-[11px] font-bold text-green-500/40 mt-2">To'laganlar: {paidStudentsCount} ta</div>
            </div>
          </div>
          <div className="glass-panel p-4 md:p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5"></div>
            <div className="relative">
              <div className="text-[11px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Qarzdorlik</div>
              <div className="text-lg md:text-xl font-black text-red-400">{totalDebt.toLocaleString()} <span className="text-sm font-medium text-red-500/40">so'm</span></div>
              <div className="text-[11px] font-bold text-red-500/40 mt-2">To'lamaganlar: {students.length - paidStudentsCount - forgivenStudentsCount} ta</div>
            </div>`;
code = code.replace(targetGrid, replacementGrid);

// Group stats part
const targetGroupStats = `                  const expected = groupStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
                  const paidStudents = groupStudents.filter(s => getPaymentRecord(s.id));
                  const collected = paidStudents.reduce((acc, s) => acc + (getPaymentRecord(s.id)?.amount || 0), 0);
                  const debt = Math.max(0, expected - collected);
                  const percentage = groupStudents.length > 0 ? Math.round((paidStudents.length / groupStudents.length) * 100) : 0;`;

const replacementGroupStats = `                  const expected = groupStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
                  const paidStudents = groupStudents.filter(s => {
                    const rec = getPaymentRecord(s.id);
                    return rec && rec.status !== 'forgiven';
                  });
                  const forgivenGroupStudents = groupStudents.filter(s => {
                    const rec = getPaymentRecord(s.id);
                    return rec && rec.status === 'forgiven';
                  });
                  const collected = paidStudents.reduce((acc, s) => acc + (getPaymentRecord(s.id)?.amount || 0), 0);
                  const forgivenCol = forgivenGroupStudents.reduce((acc, s) => acc + (getPaymentRecord(s.id)?.amount || 0), 0);
                  const debt = Math.max(0, expected - collected - forgivenCol);
                  const percentage = groupStudents.length > 0 ? Math.round(((paidStudents.length + forgivenGroupStudents.length) / groupStudents.length) * 100) : 0;`;
code = code.replace(targetGroupStats, replacementGroupStats);


// Also replace the percentage calculation in overall stats
const targetPercent = `const percentage = students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0;`;
const replacementPercent = `const percentage = students.length > 0 ? Math.round(((paidStudentsCount + forgivenStudentsCount) / students.length) * 100) : 0;`;
code = code.replace(targetPercent, replacementPercent);


fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
