const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

// 1. Add updateDoc to firebase imports
if (!code.includes('updateDoc')) {
    code = code.replace(/import \{ collection, onSnapshot, query, addDoc, deleteDoc, doc \}/, "import { collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc }");
}

// 2. Insert new states and functions right after searchTerm state
const targetState = `  const [searchTerm, setSearchTerm] = useState('');`;
const replacementState = `  const [searchTerm, setSearchTerm] = useState('');
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [newFee, setNewFee] = useState<string>('');

  const getDebtInfo = (student: any) => {
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
    
    const totalDebt = Math.max(0, totalExpected - totalPaid);
    
    let currentMonthDebt = 0;
    let otherMonthsDebt = 0;
    
    if (totalDebt > expectedThisMonth) {
      currentMonthDebt = expectedThisMonth;
      otherMonthsDebt = totalDebt - expectedThisMonth;
    } else {
      currentMonthDebt = totalDebt;
      otherMonthsDebt = 0;
    }
    
    return {
      expectedThisMonth,
      currentMonthDebt,
      otherMonthsDebt,
      totalDebt
    };
  };

  const handleUpdateFee = async (studentId: string) => {
    try {
      await updateDoc(doc(db, 'users', studentId), { monthlyFee: Number(newFee) });
      setEditingFeeId(null);
      toast.success("Oylik to'lov yangilandi");
    } catch (err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleForgiveDebt = async (studentId: string, debtAmount: number) => {
    if (await confirm({ title: 'Diqqat', message: "Haqiqatan ham qarzdorlikni bekor qilmoqchimisiz?" })) {
      try {
        const now = new Date();
        await addDoc(collection(db, 'payments'), {
          studentId,
          amount: debtAmount,
          month: filterMonth,
          year: filterYear,
          status: 'forgiven',
          paidAt: now.toISOString()
        });
        toast.success("Qarzdorlik bekor qilindi");
      } catch (err) {
        toast.error("Xatolik");
      }
    }
  };`;
code = code.replace(targetState, replacementState);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
