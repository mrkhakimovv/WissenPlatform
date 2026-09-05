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
  const [groups, setGroups] = useState<any[]>([]);
  
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snap) => {
      setStudents(snap.docs.map(d => ({id: d.id, ...(d.data() as any)})).filter(s => s.role === 'student' && s.status !== 'archived'));
    });
    const unsubPayments = onSnapshot(query(collection(db, 'payments')), (snap) => {
      setPayments(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubGroups = onSnapshot(query(collection(db, 'groups')), (snap) => {
      setGroups(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubStudents(); unsubPayments(); unsubGroups(); }
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
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-white text-xl font-black tracking-tight">To'lovlar statistikasi</h2>
            <p className="text-white/40 text-[13px] font-medium mt-1">Oylik to'lovlar va qarzdorliklar</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 md:p-5">
            <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Kutilayotgan</div>
            <div className="text-lg md:text-xl font-black text-white">{(students.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0)).toLocaleString()} <span className="text-sm font-medium text-white/40">so'm</span></div>
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
            </div>
          </div>
          <div className="glass-panel p-4 md:p-5">
             <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Bajarildi</div>
             <div className="text-lg md:text-xl font-black text-[#FEC204]">{students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%</div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#FEC204] rounded-full" style={{ width: `${students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%` }}></div>
             </div>
          </div>
        </div>

        {/* Group Stats */}
        {groups.length > 0 && (
          <div className="mt-2 flex flex-col gap-3">
            <h3 className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-1 ml-1">Guruhlar bo'yicha statistika</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {groups.map(g => {
                  const groupStudents = students.filter(s => s.groups?.includes(g.id) || s.groupId === g.id);
                  if (groupStudents.length === 0) return null;
                  const expected = groupStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
                  const paidStudents = groupStudents.filter(s => getPaymentRecord(s.id));
                  const collected = paidStudents.reduce((acc, s) => acc + (getPaymentRecord(s.id)?.amount || 0), 0);
                  const debt = Math.max(0, expected - collected);
                  const percentage = groupStudents.length > 0 ? Math.round((paidStudents.length / groupStudents.length) * 100) : 0;
                  
                  return (
                     <div key={g.id} className="glass-panel p-4 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors border border-white/5">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#FEC204]"></div>
                             <h4 className="text-white font-bold text-[13px] truncate">{g.name}</h4>
                           </div>
                           <span className="text-[10px] bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded-full font-medium">{groupStudents.length} o'quvchi</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                           <div>
                              <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Yig'ildi</span>
                              <p className="text-green-400 font-black text-[13px]">{collected.toLocaleString()} <span className="text-[10px] text-green-500/40 font-medium font-sans">UZS</span></p>
                           </div>
                           <div>
                              <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Qarzdorlik</span>
                              <p className="text-red-400 font-black text-[13px]">{debt.toLocaleString()} <span className="text-[10px] text-red-500/40 font-medium font-sans">UZS</span></p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1">
                           <div className="flex-1 bg-[#1a1a1a] border border-white/5 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FEC204] rounded-full relative" style={{ width: `${percentage}%` }}>
                                 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                              </div>
                           </div>
                           <span className="text-[11px] font-black text-[#FEC204] w-8 text-right">{percentage}%</span>
                        </div>
                     </div>
                  );
               })}
            </div>
          </div>
        )}
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
