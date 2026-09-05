import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import {  Trash2 , Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const { confirm } = useConfirm();
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [newFee, setNewFee] = useState<string>('');
  const [historyModalStudent, setHistoryModalStudent] = useState<any>(null);
  const [historyModalYear, setHistoryModalYear] = useState<number>(new Date().getFullYear());

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
  };

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

  const handlePay = async (studentId: string, _amount: number) => {
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
  
  const activeStudents = students.filter(s => {
    if (!s.joinedDate) return true;
    const jd = new Date(s.joinedDate);
    const jy = jd.getFullYear();
    const jm = jd.getMonth() + 1;
    return jy < filterYear || (jy === filterYear && jm <= filterMonth);
  });

  const collectedAmount = currentMonthPayments.filter(p => p.status !== 'forgiven').reduce((acc, p) => acc + (p.amount || 0), 0);
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
  }).length;

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
            <div className="text-lg md:text-xl font-black text-white">{totalExpected.toLocaleString()} <span className="text-sm font-medium text-white/40">so'm</span></div>
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
            </div>
          </div>
          <div className="glass-panel p-4 md:p-5">
             <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Bajarildi</div>
             <div className="text-lg md:text-xl font-black text-[#FEC204]">{activeStudents.length - forgivenStudentsCount > 0 ? Math.round((paidStudentsCount / (activeStudents.length - forgivenStudentsCount)) * 100) : 0}%</div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#FEC204] rounded-full" style={{ width: `${activeStudents.length - forgivenStudentsCount > 0 ? Math.round((paidStudentsCount / (activeStudents.length - forgivenStudentsCount)) * 100) : 0}%` }}></div>
             </div>
          </div>
        </div>

      </div>
      
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 pb-20">
        {students.map(student => {
          const debtInfo = getDebtInfo(student);
          const isFullyPaid = debtInfo.totalDebt === 0;
          const initials = student.fullName?.substring(0,2).toUpperCase() || 'ST';
          
          return (
            <div key={student.id} className="glass-panel p-4 flex flex-col gap-4 relative overflow-hidden group">
              {/* Initials & Name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-black text-lg text-white border border-white/5">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{student.fullName}</p>
                  
                  {/* Monthly Fee Edit */}
                  {editingFeeId === student.id ? (
                     <div className="flex items-center gap-2 mt-1">
                        <input 
                           type="number" 
                           value={newFee}
                           onChange={(e) => setNewFee(e.target.value)}
                           className="bg-[#1a1a1a] border border-white/10 text-white text-[11px] px-2 py-1 rounded w-24 outline-none focus:border-[#FEC204]/50"
                        />
                        <button onClick={() => handleUpdateFee(student.id)} className="w-6 h-6 bg-green-500/20 text-green-400 rounded flex items-center justify-center hover:bg-green-500/30 transition-colors">
                           <Check size={12} />
                        </button>
                        <button onClick={() => setEditingFeeId(null)} className="w-6 h-6 bg-white/10 text-white/50 rounded flex items-center justify-center hover:bg-white/20 transition-colors">
                           <X size={12} />
                        </button>
                     </div>
                  ) : (
                     <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-white/40 text-[11px] font-medium truncate">Oylik to'lov: {(Number(student.monthlyFee)||0).toLocaleString()} so'm</p>
                        <button onClick={() => { setEditingFeeId(student.id); setNewFee(student.monthlyFee?.toString() || ''); }} className="text-white/20 hover:text-[#FEC204] transition-colors">
                           <Edit2 size={12} />
                        </button>
                     </div>
                  )}
                </div>
              </div>

              {/* Debt Info */}
              <div 
                 onClick={() => {
                    setHistoryModalStudent(student);
                    setHistoryModalYear(filterYear);
                 }}
                 className="grid grid-cols-2 gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group/history relative"
              >
                 <div className="absolute inset-0 border border-white/0 group-hover/history:border-white/10 rounded-xl transition-colors pointer-events-none"></div>
                 <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1 block">Ushbu oy</span>
                    <p className={`text-[13px] font-black ${debtInfo.currentMonthDebt > 0 ? 'text-[#FEC204]' : 'text-green-400'}`}>
                       {debtInfo.currentMonthDebt > 0 ? `-${debtInfo.currentMonthDebt.toLocaleString()}` : 'To\'langan'}
                    </p>
                 </div>
                 <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1 block flex items-center justify-between">
                      Boshqa oylar
                    </span>
                    <p className={`text-[13px] font-black ${debtInfo.otherMonthsDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                       {debtInfo.otherMonthsDebt > 0 ? `-${debtInfo.otherMonthsDebt.toLocaleString()}` : 'Yo\'q'}
                    </p>
                 </div>
              </div>

              {/* Actions & Total Debt */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                 <div>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider block mb-0.5">Jami qarzdorlik</span>
                    <p className={`text-lg font-black ${isFullyPaid ? 'text-green-400' : 'text-red-500'}`}>
                       {debtInfo.totalDebt.toLocaleString()} <span className="text-[10px] font-medium opacity-50 font-sans">UZS</span>
                    </p>
                 </div>
                 
                 {!isFullyPaid && (
                   <div className="flex gap-2">
                     {debtInfo.totalDebt > 0 && (
                        <button 
                           onClick={() => handleForgiveDebt(student.id, debtInfo.totalDebt)}
                           title="Qarzdorlikni kechish"
                           className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 text-white/40 hover:text-white transition-all active:scale-95"
                        >
                           <X size={16} />
                        </button>
                     )}
                     <button 
                        onClick={() => handlePay(student.id, debtInfo.totalDebt)}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#FEC204] to-[#f97316] hover:from-[#f5b800] hover:to-[#ea580c] text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(254,194,4,0.3)] active:scale-95"
                     >
                        To'lash
                     </button>
                   </div>
                 )}
              </div>
              
              {isFullyPaid && (
                <div className="absolute top-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-lg">
                   To'liq to'langan
                </div>
              )}
            </div>
          )
        })}
        {students.length === 0 && <p className="text-center text-white/40 py-6 text-sm col-span-full font-medium">O'quvchilar yo'q</p>}
      </div>

      {historyModalStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setHistoryModalStudent(null)}></div>
           <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-3xl relative z-10 flex flex-col gap-6 shadow-2xl">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-white text-xl font-black">{historyModalStudent.fullName}</h3>
                    <p className="text-white/40 text-sm mt-1">To'lovlar tarixi va qarzdorlik</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <select 
                       value={historyModalYear} 
                       onChange={(e) => setHistoryModalYear(Number(e.target.value))}
                       className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 outline-none focus:border-[#FEC204]/50"
                    >
                       {years.map(y => <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>)}
                    </select>
                    <button onClick={() => setHistoryModalStudent(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                       <X size={18} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                 {months.map((m, i) => {
                    const monthNumber = i + 1;
                    const jd = historyModalStudent.joinedDate ? new Date(historyModalStudent.joinedDate) : new Date();
                    const joinedYear = jd.getFullYear();
                    const joinedMonth = jd.getMonth() + 1;
                    
                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();
                    const currentMonth = currentDate.getMonth() + 1;

                    const isBeforeJoined = historyModalYear < joinedYear || (historyModalYear === joinedYear && monthNumber < joinedMonth);
                    const isJoinedMonth = historyModalYear === joinedYear && monthNumber === joinedMonth;
                    const isFuture = historyModalYear > currentYear || (historyModalYear === currentYear && monthNumber > currentMonth);
                    const paymentRecord = payments.find(p => p.studentId === historyModalStudent.id && p.month === monthNumber && p.year === historyModalYear);

                    let cellClass = "bg-white/5 border border-white/5 text-white/20"; // disabled
                    let label = "";

                    if (isBeforeJoined) {
                       label = "Ro'yxatda yo'q";
                    } else if (isFuture) {
                       cellClass = "bg-white/[0.02] border border-dashed border-white/20 text-white/40";
                       label = "Kutilmoqda";
                    } else if (paymentRecord) {
                       cellClass = "bg-green-500/10 border border-green-500/20 text-green-400";
                       if (paymentRecord.status === 'forgiven') {
                          label = "Kechilgan";
                       } else {
                          label = "To'langan";
                       }
                    } else {
                       cellClass = "bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
                       label = "Qarzdorlik";
                    }

                    return (
                       <div key={m} className={`relative p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all ${cellClass}`}>
                          {isJoinedMonth && (
                             <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#FEC204] rounded-full shadow-[0_0_8px_rgba(254,194,4,0.6)]" title="Kelgan oyi"></div>
                          )}
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80">{m}</span>
                          <span className="text-[10px] font-medium opacity-60">{label}</span>
                          {paymentRecord?.paidAt && (
                             <span className="text-[9px] opacity-40 mt-1">{new Date(paymentRecord.paidAt).toLocaleDateString('uz-UZ')}</span>
                          )}
                       </div>
                    );
                 })}
              </div>
              
              <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FEC204] shadow-[0_0_8px_rgba(254,194,4,0.6)]"></div>
                    <span className="text-xs text-white/50">Kelgan oyi</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500/50"></div>
                    <span className="text-xs text-white/50">Qarzdorlik</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500/50"></div>
                    <span className="text-xs text-white/50">To'langan</span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
