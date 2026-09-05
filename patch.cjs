const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

// Add state
const targetState = `  const [historyModalYear, setHistoryModalYear] = useState<number>(new Date().getFullYear());`;
const replacementState = `  const [historyModalYear, setHistoryModalYear] = useState<number>(new Date().getFullYear());
  const [payingStudent, setPayingStudent] = useState<{ id: string, debt: number, name: string } | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');`;
code = code.replace(targetState, replacementState);

// Replace handlePay
const targetHandlePay = `  const handlePay = async (studentId: string, _amount: number) => {
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

const replacementHandlePay = `  const handleConfirmPay = async () => {
    if (!payingStudent) return;
    const amountToPay = Number(payAmount);
    if (amountToPay <= 0 || isNaN(amountToPay)) {
      toast.error("Iltimos, to'g'ri summa kiriting");
      return;
    }
    
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'payments'), {
        studentId: payingStudent.id,
        amount: amountToPay,
        month: filterMonth,
        year: filterYear,
        status: 'paid',
        paidAt: now
      });
      toast.success("To'lov qabul qilindi");
      setPayingStudent(null);
      setPayAmount('');
    } catch (err: any) {
      console.error('Kontekst:', err);
      toast.error(err instanceof Error ? err.message : "Noma'lum xatolik");
    }
  };`;
code = code.replace(targetHandlePay, replacementHandlePay);

// Update button onClick
const targetButton = `onClick={() => handlePay(student.id, debtInfo.totalDebt)}`;
const replacementButton = `onClick={() => { setPayingStudent({ id: student.id, debt: debtInfo.totalDebt, name: student.fullName }); setPayAmount(String(debtInfo.totalDebt)); }}`;
code = code.replace(targetButton, replacementButton);

// Insert Modal
const modalCode = `      {payingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPayingStudent(null)}></div>
           <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">To'lov kiritish</h3>
                <p className="text-white/40 text-sm">{payingStudent.name}</p>
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">To'lanayotgan summa</label>
                <input 
                  type="number"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FEC204] transition-colors"
                  placeholder="Summani kiriting"
                  autoFocus
                />
                <p className="text-white/30 text-xs mt-2">Jami qarzdorlik: {payingStudent.debt.toLocaleString()} UZS</p>
              </div>
              <div className="flex gap-2 mt-2">
                 <button 
                   onClick={() => setPayingStudent(null)}
                   className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors"
                 >
                   Bekor qilish
                 </button>
                 <button 
                   onClick={handleConfirmPay}
                   className="flex-1 bg-gradient-to-r from-[#FEC204] to-[#f97316] hover:from-[#f5b800] hover:to-[#ea580c] text-black py-3 rounded-xl font-bold transition-colors"
                 >
                   Tasdiqlash
                 </button>
              </div>
           </div>
        </div>
      )}
`;

const historyModalTarget = `      {historyModalStudent && (`;
code = code.replace(historyModalTarget, modalCode + historyModalTarget);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
