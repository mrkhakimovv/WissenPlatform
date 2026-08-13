import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const { confirm } = useConfirm();
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snap) => {
      setStudents(snap.docs.map(d => ({id: d.id, ...(d.data() as any)})).filter(s => s.role === 'student'));
    });
    const unsubPayments = onSnapshot(query(collection(db, 'payments')), (snap) => {
      setPayments(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubStudents(); unsubPayments(); }
  }, []);

  const handlePay = async (studentId: string, amount: number) => {
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
  };

  const getPaymentRecord = (studentId: string) => {
    return payments.find(p => p.studentId === studentId && p.month === filterMonth && p.year === filterYear);
  };

  const handleDelete = async (paymentId: string) => {
    if (await confirm({ title: 'Diqqat', message: "Bu to'lovni bekor qilmoqchimisiz?" })) {
      try {
        await deleteDoc(doc(db, 'payments', paymentId));
        toast.success("To'lov bekor qilindi");
      } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
    }
  };

  const currentMonthPayments = payments.filter(p => p.month === filterMonth && p.year === filterYear);
  const totalAmount = currentMonthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const years = Array.from(new Set(payments.map(p => p.year).concat(new Date().getFullYear()))).sort((a: any, b: any) => b - a);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-[color:var(--theme-text-primary)] text-xl font-bold">Oylik To'lovlar</h2>
          <p className="text-[12px] font-bold text-[color:var(--theme-text-primary)]/40 mt-1">
            Jami yig'ilgan summa: <span className="text-[#FEC204]">{totalAmount.toLocaleString()} so'm</span>
          </p>
        </div>
        <div className="flex gap-2">
          <select value={filterMonth} onChange={e=>setFilterMonth(Number(e.target.value))} className="glass-panel p-2 outline-none text-sm text-[color:var(--theme-text-primary)] rounded-[10px]" style={{ colorScheme: "dark" }}>
            {months.map((m, i) => <option key={m} value={i+1} className="bg-[#1a1a1a]">{m}</option>)}
          </select>
          <select value={filterYear} onChange={e=>setFilterYear(Number(e.target.value))} className="glass-panel p-2 outline-none text-sm text-[color:var(--theme-text-primary)] rounded-[10px]" style={{ colorScheme: "dark" }}>
            {years.map(y => <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>)}
          </select>
        </div>
      </div>
      
      <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 pb-20">
        {students.map(student => {
          const paymentRecord = getPaymentRecord(student.id);
          const initials = student.fullName?.substring(0,2).toUpperCase() || 'ST';
          return (
            <div key={student.id} className="glass-panel-list p-3 flex flex-col gap-3 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-[color:var(--theme-text-primary)] border border-white/5">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[color:var(--theme-text-primary)] text-sm font-semibold truncate">{student.fullName}</p>
                  <p className="text-[color:var(--theme-text-primary)]/40 text-[10px] truncate">{student.monthlyFee?.toLocaleString()} so'm</p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  {paymentRecord ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20 leading-none mt-0.5">To'landi</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 leading-none mt-0.5">To'lanmagan</span>
                  )}
                </div>
              </div>

              {paymentRecord ? (
                <div className="w-full flex items-center justify-between py-2 px-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                  <span className="text-[11px] text-green-400 font-bold">{new Date(paymentRecord.paidAt).toLocaleDateString('uz-UZ')}</span>
                  <button onClick={() => handleDelete(paymentRecord.id)} className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handlePay(student.id, student.monthlyFee)}
                  className="w-full py-2 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 border border-white/5 text-[color:var(--theme-text-primary)]/90 font-medium rounded-xl text-xs transition-colors"
                >
                  To'lovni kiritish
                </button>
              )}
            </div>
          )
        })}
        {students.length === 0 && <p className="text-center text-[color:var(--theme-text-primary)]/40 py-6 text-sm col-span-full">O'quvchilar yo'q</p>}
      </div>
    </div>
  );
}
