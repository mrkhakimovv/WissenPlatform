import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Payment } from '../../types';

export default function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'payments'), 
      where('studentId', '==', user.id)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()} as Payment));
      // Manual sort since composite index might not exist
      data.sort((a, b) => b.month - a.month);
      setPayments(data);
    });
    return () => unsub();
  }, [user]);

  const filteredPayments = payments.filter(p => p.year === yearFilter);
  const years = Array.from(new Set(payments.map(p => p.year).concat(new Date().getFullYear()))).sort((a: any, b: any) => b - a);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">To'lovlar</h1>
        <select 
          value={yearFilter}
          onChange={e => setYearFilter(Number(e.target.value))}
          className="px-3 py-1 bg-[color:var(--surface-color)] border border-white/10 text-white/70 text-[10px] uppercase font-[900] tracking-[1px] rounded-full outline-none"
        >
          {years.map(y => <option key={y} value={y} className="bg-[#1a1a1a] text-white">{y} YIL</option>)}
        </select>
      </div>

      <div className="glass-panel p-4 !border-l-[3px] !border-l-[#FEC204] flex items-center justify-between p-5">
        <div>
          <p className="text-[9px] uppercase tracking-[2px] font-bold text-white/40 mb-1">Oylik to'lov miqdori</p>
          <p className="text-[22px] font-[900] tracking-[-1px] text-white">{(user?.monthlyFee || 0).toLocaleString('uz-UZ')} so'm</p>
        </div>
      </div>

      <div>
        <h2 className="text-[12px] text-white font-bold uppercase tracking-[1px] mb-3 px-1 mt-2">To'lov Tarixi</h2>
        
        {filteredPayments.length === 0 ? (
          <div className="glass-panel p-6 text-center text-white/50 font-bold text-sm">
            Hozircha to'lovlar yo'q
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((item, i) => (
              <div key={item.id} className="glass-panel p-4 flex items-center gap-3 active:border-[#FEC204] transition-colors">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[color:var(--surface-color)] border border-white/10 flex items-center justify-center font-[800] text-white text-[13px]">
                  {String(item.month).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <p className="text-white text-[14px] font-bold">
                    {new Date(2026, item.month - 1).toLocaleString('uz-UZ', { month: 'long' })} oyi uchun
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-white text-[15px] font-black tracking-[-0.5px]">{(item.amount || user?.monthlyFee || 0).toLocaleString('uz-UZ')} so'm</p>
                  {item.status === 'paid' ? (
                    <span className="badge-green rounded-full">To'landi</span>
                  ) : (
                    <span className="badge-red rounded-full">To'lanmagan</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
