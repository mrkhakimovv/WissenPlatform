const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const regex = /const getDebtInfo = \(student: any\) => \{[\s\S]*?return \{\s*expectedThisMonth,\s*currentMonthDebt,\s*otherMonthsDebt,\s*totalDebt\s*\};\s*\};/;

const newGetDebtInfo = `const getDebtInfo = (student: any) => {
    const fee = Number(student.monthlyFee) || 0;
    if (fee === 0) {
      return { expectedThisMonth: 0, currentMonthDebt: 0, otherMonthsDebt: 0, totalDebt: 0 };
    }
    
    // O'quvchining ro'yxatdan o'tgan sanasi
    let joinedYear = filterYear;
    let joinedMonth = filterMonth;
    if (student.joinedDate) {
      const jd = new Date(student.joinedDate);
      joinedYear = jd.getFullYear();
      joinedMonth = jd.getMonth() + 1;
    }

    // 1. Agar tanlangan oyni (filter) o'quvchi hali kelmagan oy bo'lsa
    const isBeforeJoined = filterYear < joinedYear || (filterYear === joinedYear && filterMonth < joinedMonth);
    if (isBeforeJoined) {
       return { expectedThisMonth: 0, currentMonthDebt: 0, otherMonthsDebt: 0, totalDebt: 0 };
    }

    // 2. Kutilayotgan pul doim 1 oylik fee bo'ladi
    const expectedThisMonth = fee;

    // 3. O'quvchining barcha to'lovlari
    const allPayments = payments.filter(p => p.studentId === student.id);
    
    // Joriy oy (filter) bo'yicha to'langan summalar
    const currentPayments = allPayments.filter(p => p.month === filterMonth && p.year === filterYear);
    const paidThisMonth = currentPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    
    let currentMonthDebt = expectedThisMonth - paidThisMonth;
    if (currentMonthDebt < 0) currentMonthDebt = 0;

    // 4. Boshqa oylar qarzini hisoblash
    let otherMonthsDebt = 0;
    
    // Kelgan yilidan tortib toki hozirgi (filter) yilgacha tekshiramiz
    for (let y = joinedYear; y <= filterYear; y++) {
       const startM = (y === joinedYear) ? joinedMonth : 1;
       const endM = (y === filterYear) ? (filterMonth - 1) : 12;

       for (let m = startM; m <= endM; m++) {
          const monthPayments = allPayments.filter(p => p.month === m && p.year === y);
          const monthPaid = monthPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
          
          const mDebt = fee - monthPaid;
          if (mDebt > 0) {
             otherMonthsDebt += mDebt;
          }
       }
    }

    const totalDebt = currentMonthDebt + otherMonthsDebt;
    
    return {
      expectedThisMonth,
      currentMonthDebt,
      otherMonthsDebt,
      totalDebt
    };
  };`;

if (regex.test(code)) {
    code = code.replace(regex, newGetDebtInfo);
    fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
    console.log("Successfully patched getDebtInfo");
} else {
    console.log("Failed to find getDebtInfo using regex");
}
