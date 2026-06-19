import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'payments'), where('studentId', '==', user.id));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => unsub();
  }, [user]);

  // Provide initial mock
  const list = payments.length ? payments : [
    { id: 1, month: 'Iyun', amount: 450000, status: 'paid', monthNum: '06' },
    { id: 2, month: 'May', amount: 450000, status: 'paid', monthNum: '05' },
    { id: 3, month: 'Aprel', amount: 450000, status: 'unpaid', monthNum: '04' },
  ];

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">To'lovlar</h1>
        <span className="px-3 py-1 bg-[color:var(--surface-color)] border border-white/10 text-white/70 text-[10px] uppercase font-[900] tracking-[1px] rounded-full">2026 YIL</span>
      </div>

      <div className="glass-panel p-4 !border-l-[3px] !border-l-[#FEC204] flex items-center justify-between p-5">
        <div>
          <p className="text-[9px] uppercase tracking-[2px] font-bold text-white/40 mb-1">Oylik to'lov miqdori</p>
          <p className="text-[22px] font-[900] tracking-[-1px] text-white">450,000 UZS</p>
        </div>
      </div>

      <div>
        <h2 className="text-[12px] text-white font-bold uppercase tracking-[1px] mb-3 px-1 mt-2">To'lov Tarixi</h2>
        
        <div className="space-y-3">
          {list.map((item, i) => (
            <div key={item.id} className="glass-panel p-4 flex items-center gap-3 active:border-[#FEC204] transition-colors">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[color:var(--surface-color)] border border-white/10 flex items-center justify-center font-[800] text-white text-[13px]">{item.monthNum || `0${i+1}`}</div>
              <div className="flex-1">
                <p className="text-white text-[14px] font-bold">{item.month} oyi uchun</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-white text-[15px] font-black tracking-[-0.5px]">{item.amount?.toLocaleString()} UZS</p>
                {item.status === 'paid' ? (
                  <span className="badge-green rounded-full">To'landi</span>
                ) : (
                  <span className="badge-red rounded-full">Kutilmoqda</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
