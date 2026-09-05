const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const targetStats = `  const currentMonthPayments = payments.filter(p => p.month === filterMonth && p.year === filterYear);
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

const replacementStats = `  const currentMonthPayments = payments.filter(p => p.month === filterMonth && p.year === filterYear);
  
  const activeStudents = students.filter(s => {
    if (!s.joinedDate) return true;
    const jd = new Date(s.joinedDate);
    const jy = jd.getFullYear();
    const jm = jd.getMonth() + 1;
    return jy < filterYear || (jy === filterYear && jm <= filterMonth);
  });

  const collectedAmount = currentMonthPayments.filter(p => p.status !== 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const forgivenAmount = currentMonthPayments.filter(p => p.status === 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpected = activeStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
  const totalDebt = Math.max(0, totalExpected - collectedAmount - forgivenAmount);
  
  const paidStudentsCount = activeStudents.filter(s => {
    const rec = getPaymentRecord(s.id);
    return rec && rec.status !== 'forgiven';
  }).length;
  const forgivenStudentsCount = activeStudents.filter(s => {
    const rec = getPaymentRecord(s.id);
    return rec && rec.status === 'forgiven';
  }).length;`;
code = code.replace(targetStats, replacementStats);

const targetGrid = `<div className="text-lg md:text-xl font-black text-white">{totalExpected.toLocaleString()} <span className="text-sm font-medium text-white/40">so'm</span></div>
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

const replacementGrid = `<div className="text-lg md:text-xl font-black text-white">{totalExpected.toLocaleString()} <span className="text-sm font-medium text-white/40">so'm</span></div>
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
code = code.replace(targetGrid, replacementGrid);

const targetBajarildi = `<div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Bajarildi</div>
             <div className="text-lg md:text-xl font-black text-[#FEC204]">{students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%</div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#FEC204] rounded-full" style={{ width: \`\${students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%\` }}></div>
             </div>`;

const replacementBajarildi = `<div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Bajarildi</div>
             <div className="text-lg md:text-xl font-black text-[#FEC204]">{activeStudents.length > 0 ? Math.round(((paidStudentsCount + forgivenStudentsCount) / activeStudents.length) * 100) : 0}%</div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#FEC204] rounded-full" style={{ width: \`\${activeStudents.length > 0 ? Math.round(((paidStudentsCount + forgivenStudentsCount) / activeStudents.length) * 100) : 0}%\` }}></div>
             </div>`;
code = code.replace(targetBajarildi, replacementBajarildi);

const targetGroupStats = `                  const groupStudents = students
                  .filter(s => s.groups?.includes(g.id) || s.groupId === g.id)
                  .filter(s => searchTerm === '' || s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));`;
const replacementGroupStats = `                  const groupStudents = activeStudents
                  .filter(s => s.groups?.includes(g.id) || s.groupId === g.id)
                  .filter(s => searchTerm === '' || s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));`;
code = code.replace(targetGroupStats, replacementGroupStats);

const targetPay = `  const handlePay = async (studentId: string, amount: number) => {
    try {
      const now = new Date();
      const finalAmount = amount || 0;
      
      const existing = payments.find(p => 
        p.studentId === studentId && 
        p.month === filterMonth && 
        p.year === filterYear
      );

      if (existing) {
        toast.error("Tanlangan oy uchun to'lov allaqachon kiritilgan");
        return;
      }

      if(await confirm({ title: 'Diqqat', message: "To'lov qabul qilinganini tasdiqlaysizmi?" })) {
        await addDoc(collection(db, 'payments'), {
          studentId,
          amount: finalAmount,
          month: filterMonth,
          year: filterYear,
          status: 'paid',
          paidAt: now.toISOString()
        });
        toast.success("To'lov qabul qilindi");
      }
    } catch (err: any) {
      console.error('Kontekst:', err);
      toast.error(err instanceof Error ? err.message : "Noma'lum xatolik");
    }
  };`;

const replacementPay = `  const handlePay = async (studentId: string, _amount: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    if(await confirm({ title: 'Diqqat', message: "To'lov qabul qilinganini tasdiqlaysizmi?" })) {
      try {
        const unpaidMonths = getUnpaidMonths(student);
        const now = new Date().toISOString();
        
        for (const up of unpaidMonths) {
          await addDoc(collection(db, 'payments'), {
            studentId,
            amount: Number(student.monthlyFee) || 0,
            month: up.month,
            year: up.year,
            status: 'paid',
            paidAt: now
          });
        }
        toast.success("To'lov qabul qilindi");
      } catch (err: any) {
        console.error('Kontekst:', err);
        toast.error(err instanceof Error ? err.message : "Noma'lum xatolik");
      }
    }
  };`;
code = code.replace(targetPay, replacementPay);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
