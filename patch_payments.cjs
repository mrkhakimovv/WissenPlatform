const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const oldGetDebtInfo = `  const getDebtInfo = (student: any) => {
    const fee = Number(student.monthlyFee) || 0;
    if (fee === 0) {
      return { expectedThisMonth: 0, currentMonthDebt: 0, otherMonthsDebt: 0, totalDebt: 0 };
    }
    
    let monthsToPay = 1;
    if (student.joinedDate) {
      const jd = new Date(student.joinedDate);
      const y = jd.getFullYear();
      const m = jd.getMonth() + 1;
      monthsToPay = (filterYear - y) * 12 + (filterMonth - m) + 1;
      if (monthsToPay < 0) monthsToPay = 0;
    }
    const expectedThisMonth = monthsToPay > 0 ? fee : 0;
    const totalExpected = monthsToPay * fee;
    
    const allPayments = payments.filter(p => p.studentId === student.id);
    const totalPaid = allPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    
    let totalDebt = totalExpected - totalPaid;
    if (totalDebt < 0) totalDebt = 0;
    
    // Joriy oy (filter) uchun to'langan va kechilgan summalar
    const currentPayments = allPayments.filter(p => p.month === filterMonth && p.year === filterYear);
    const paidThisMonth = currentPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    
    // Joriy oy uchun kutilayotgan qarzdorlik
    let currentMonthDebt = expectedThisMonth - paidThisMonth;
    if (currentMonthDebt < 0) currentMonthDebt = 0;
    // Agar umumiy qarz joriy oy qarzidan kam bo'lsa, joriy oy qarzi umumiy qarzga teng bo'ladi
    if (currentMonthDebt > totalDebt) currentMonthDebt = totalDebt;
    
    const otherMonthsDebt = totalDebt - currentMonthDebt;
    
    return {
      expectedThisMonth,
      currentMonthDebt,
      otherMonthsDebt,
      totalDebt
    };
  };`;

const newGetDebtInfo = `  const getDebtInfo = (student: any) => {
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
    // Demak bu oyda hech qanday qarz va kutilayotgan pul bo'lmaydi
    const isBeforeJoined = filterYear < joinedYear || (filterYear === joinedYear && filterMonth < joinedMonth);
    if (isBeforeJoined) {
       return { expectedThisMonth: 0, currentMonthDebt: 0, otherMonthsDebt: 0, totalDebt: 0 };
    }

    // 2. Tanlangan oyni (filter) kutilayotgan pul (bu doim oylik to'lov)
    const expectedThisMonth = fee;

    // 3. Tanlangan oyni (filter) hisob kitobi
    const allPayments = payments.filter(p => p.studentId === student.id);
    const currentPayments = allPayments.filter(p => p.month === filterMonth && p.year === filterYear);
    const paidThisMonth = currentPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    
    let currentMonthDebt = expectedThisMonth - paidThisMonth;
    if (currentMonthDebt < 0) currentMonthDebt = 0;

    // 4. Boshqa oylar qarzini hisoblash (O'quvchi kelganidan to hozirgi filter oyigacha)
    let otherMonthsDebt = 0;
    
    // Yillarni aylanib chiqamiz (kelgan yildan boshlab joriy filter yilgacha)
    for (let y = joinedYear; y <= filterYear; y++) {
       const startM = (y === joinedYear) ? joinedMonth : 1;
       const endM = (y === filterYear) ? (filterMonth - 1) : 12; // Boshqa oylar filterdan oldingilar

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

code = code.replace(oldGetDebtInfo, newGetDebtInfo);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
