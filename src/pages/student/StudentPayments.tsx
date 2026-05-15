import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if(!user?.id) return;
    const q = query(collection(db, 'payments'), where('studentId', '==', user.id));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return unsub;
  }, [user]);

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 text-center shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-[#FEC204]/20 rounded-full blur-[40px]"></div>
        <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest relative z-10">Oylik to'lov miqdori</p>
        <div className="mt-2 text-4xl font-black text-white relative z-10">
          {user?.monthlyFee?.toLocaleString() || 0} <span className="text-[#FEC204] text-lg font-bold">so'm</span>
        </div>
      </div>

      <div>
        <h2 className="text-white font-semibold mb-3">To'lov Tarixi</h2>
        <div className="space-y-3">
          {payments.length === 0 ? (
            <p className="text-center text-white/40 py-8 text-sm">Hozircha to'lovlar mavjud emas</p>
          ) : (
            payments.map((p, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={p.id} 
                className="glass-panel-list p-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {p.status === 'paid' ? <CheckCircle2 className="text-green-400" size={18} /> : <Clock className="text-yellow-400" size={18} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{p.month}-oy, {p.year}</h3>
                    <p className="text-[10px] text-white/40 mt-0.5">{new Date(p.paidAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-sm">{p.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-green-400 font-medium">To'landi</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
