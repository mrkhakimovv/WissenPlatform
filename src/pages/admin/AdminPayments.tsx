import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snap) => {
      setStudents(snap.docs.map(d => ({id: d.id, ...d.data()})).filter(s => s.role !== 'admin'));
    });
    const unsubPayments = onSnapshot(query(collection(db, 'payments')), (snap) => {
      setPayments(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubStudents(); unsubPayments(); }
  }, []);

  const handlePay = async (studentId: string, amount: number) => {
    try {
      if(confirm("To'lov qabul qilinganini tasdiqlaysizmi?")) {
        await addDoc(collection(db, 'payments'), {
          studentId,
          amount,
          month: new Date().getMonth() + 1 + '',
          year: new Date().getFullYear() + '',
          status: 'paid',
          paidAt: new Date().toISOString()
        });
        toast.success("To'lov qabul qilindi");
      }
    } catch(err) {
      toast.error("Xatolik");
    }
  };

  const getStatus = (studentId: string) => {
    const m = new Date().getMonth() + 1 + '';
    const y = new Date().getFullYear() + '';
    const p = payments.find(p => p.studentId === studentId && p.month === m && p.year === y);
    return p ? p.status : 'unpaid';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-white font-semibold">Oylik To'lovlar</h2>
        <span className="text-[#FEC204] text-xs font-medium bg-[#FEC204]/10 px-3 py-1 rounded-full border border-[#FEC204]/20">{new Date().toLocaleString('uz-UZ', {month: 'long'})}</span>
      </div>
      
      <div className="space-y-3">
        {students.map(student => {
          const status = getStatus(student.id);
          const initials = student.fullName?.substring(0,2).toUpperCase() || 'ST';
          return (
            <div key={student.id} className="glass-panel-list p-3 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-white border border-white/5">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{student.fullName}</p>
                  <p className="text-white/40 text-[10px] truncate">{student.monthlyFee?.toLocaleString()} so'm</p>
                </div>
                <div className="text-right shrink-0">
                  {status === 'paid' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20 leading-none inline-block mt-0.5">To'landi</span>}
                  {status === 'unpaid' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 leading-none inline-block mt-0.5">To'lanmagan</span>}
                </div>
              </div>
              {status !== 'paid' && (
                <button 
                  onClick={() => handlePay(student.id, student.monthlyFee)}
                  className="w-full py-2 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 border border-white/5 text-white/90 font-medium rounded-xl text-xs transition-colors"
                >
                  To'lovni kiritish
                </button>
              )}
            </div>
          )
        })}
        {students.length === 0 && <p className="text-center text-white/40 py-6 text-sm">O'quvchilar yo'q</p>}
      </div>
    </div>
  );
}
