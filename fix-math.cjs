const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

// 1. Fix Total Stats block
const targetTotalExpected = `  const collectedAmount = currentMonthPayments.filter(p => p.status !== 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const forgivenAmount = currentMonthPayments.filter(p => p.status === 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpected = activeStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
  const totalDebt = Math.max(0, totalExpected - collectedAmount - forgivenAmount);`;

const replacementTotalExpected = `  const collectedAmount = currentMonthPayments.filter(p => p.status !== 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const forgivenAmount = currentMonthPayments.filter(p => p.status === 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpectedRaw = activeStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
  const totalExpected = Math.max(0, totalExpectedRaw - forgivenAmount);
  const totalDebt = Math.max(0, totalExpected - collectedAmount);`;
code = code.replace(targetTotalExpected, replacementTotalExpected);


const targetGrid = `<div className="text-lg md:text-xl font-black text-white">{totalExpected.toLocaleString()} <span className="text-sm font-medium text-white/40">so'm</span></div>
            <div className="text-[11px] font-bold text-white/30 mt-2">Jami o'quvchilar: {activeStudents.length} ta</div>
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
              <div className="text-[11px] font-bold text-red-500/40 mt-2">To'lamaganlar: {activeStudents.length - paidStudentsCount - forgivenStudentsCount} ta</div>
            </div>`;

const replacementGrid = `<div className="text-lg md:text-xl font-black text-white">{totalExpected.toLocaleString()} <span className="text-sm font-medium text-white/40">so'm</span></div>
            <div className="text-[11px] font-bold text-white/30 mt-2">Jami o'quvchilar: {activeStudents.length - forgivenStudentsCount} ta</div>
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
              <div className="text-[11px] font-bold text-red-500/40 mt-2">To'lamaganlar: {activeStudents.length - forgivenStudentsCount - paidStudentsCount} ta</div>
            </div>`;
code = code.replace(targetGrid, replacementGrid);

// 2. Fix Bajarildi percentage block
const targetBajarildi = `<div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Bajarildi</div>
             <div className="text-lg md:text-xl font-black text-[#FEC204]">{activeStudents.length > 0 ? Math.round(((paidStudentsCount + forgivenStudentsCount) / activeStudents.length) * 100) : 0}%</div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#FEC204] rounded-full" style={{ width: \`\${activeStudents.length > 0 ? Math.round(((paidStudentsCount + forgivenStudentsCount) / activeStudents.length) * 100) : 0}%\` }}></div>
             </div>`;

const replacementBajarildi = `<div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Bajarildi</div>
             <div className="text-lg md:text-xl font-black text-[#FEC204]">{activeStudents.length - forgivenStudentsCount > 0 ? Math.round((paidStudentsCount / (activeStudents.length - forgivenStudentsCount)) * 100) : 0}%</div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#FEC204] rounded-full" style={{ width: \`\${activeStudents.length - forgivenStudentsCount > 0 ? Math.round((paidStudentsCount / (activeStudents.length - forgivenStudentsCount)) * 100) : 0}%\` }}></div>
             </div>`;
code = code.replace(targetBajarildi, replacementBajarildi);

// 3. Fix Group Stats
const targetGroupStats = `                  const expected = groupStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
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

const replacementGroupStats = `                  const rawExpected = groupStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
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
                  
                  const expected = Math.max(0, rawExpected - forgivenCol);
                  const debt = Math.max(0, expected - collected);
                  const validStudentsCount = groupStudents.length - forgivenGroupStudents.length;
                  const percentage = validStudentsCount > 0 ? Math.round((paidStudents.length / validStudentsCount) * 100) : 0;`;
code = code.replace(targetGroupStats, replacementGroupStats);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
