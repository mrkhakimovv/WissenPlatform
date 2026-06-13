import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, CalendarClock, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const [attendance, setAttendance] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'checking'>('checking');
  
  useEffect(() => {
    if(!user?.id) return;
    
    // Check attendance
    const qAtt = query(collection(db, 'attendance'), where('studentId', '==', user.id));
    const unsubAtt = onSnapshot(qAtt, (snap) => setAttendance(snap.docs.map(d => d.data())));

    // Check payment for this month
    const m = new Date().getMonth() + 1 + '';
    const y = new Date().getFullYear() + '';
    const qPay = query(collection(db, 'payments'), where('studentId', '==', user.id), where('month', '==', m), where('year', '==', y));
    const unsubPay = onSnapshot(qPay, (snap) => {
      setPaymentStatus(snap.empty ? 'unpaid' : snap.docs[0].data().status);
    });

    return () => { unsubAtt(); unsubPay(); }
  }, [user]);

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const totalAtt = presentCount + absentCount;
  const attRate = totalAtt === 0 ? 100 : Math.round((presentCount / totalAtt) * 100);

  // Determine today's class status
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const todayName = days[new Date().getDay()];

  return (
    <div className="space-y-6">
      
      {/* Main Greeting */}
      <div className="mb-4">
        <h2 className="text-[color:var(--theme-text-primary)] text-2xl font-bold">Xush kelibsiz! 👋</h2>
        <p className="text-[color:var(--theme-text-primary)]/50 text-sm mt-1">Bugungi holatingiz xulosasi</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Attendance Summary */}
        <Link to="attendance" className="block">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`glass-panel p-4 h-full relative overflow-hidden ${attRate < 80 ? 'border-red-500/30' : 'border-[#FEC204]/30'}`}
          >
            <p className="text-[color:var(--theme-text-primary)]/40 text-[10px] uppercase font-bold mb-1">Davomat O'rtacha</p>
            <div className="flex items-end gap-2 text-[color:var(--theme-text-primary)]">
              <span className="text-3xl font-black leading-none">{attRate}%</span>
            </div>
            
            <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
              <div className={`h-full ${attRate < 80 ? 'bg-red-400' : 'bg-[#FEC204]'}`} style={{ width: `${attRate}%` }}></div>
            </div>
          </motion.div>
        </Link>
        
        {/* Payment Summary */}
        <Link to="payments" className="block">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className={`glass-panel p-4 h-full relative overflow-hidden ${paymentStatus === 'paid' ? 'border-green-500/30' : 'border-red-500/30'}`}
          >
            <p className="text-[color:var(--theme-text-primary)]/40 text-[10px] uppercase font-bold mb-1">Joriy oy to'lovi</p>
            
            <div className="mt-2 text-[color:var(--theme-text-primary)] flex items-center gap-2">
              {paymentStatus === 'paid' ? (
                <>
                  <CheckCircle2 className="text-green-400 shrink-0" size={24} />
                  <span className="font-bold text-sm">To'langan</span>
                </>
              ) : paymentStatus === 'unpaid' ? (
                <>
                  <AlertCircle className="text-red-400 shrink-0" size={24} />
                  <span className="font-bold text-sm leading-tight text-red-50">To'lanmagan</span>
                </>
              ) : (
                <Clock className="text-[color:var(--theme-text-primary)]/40 shrink-0 animate-spin" size={24} />
              )}
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Today's Schedule Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-panel p-5 relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEC204] to-[#f59e0b] flex items-center justify-center text-[#0d0d0d]">
            <CalendarClock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-[color:var(--theme-text-primary)] leading-tight">Bugungi Darsingiz</h3>
            <p className="text-[#FEC204] text-[10px] font-bold uppercase">{todayName}</p>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-[color:var(--theme-text-primary)] text-lg">{user?.subject || "Fan biriktirilmagan"}</p>
              <p className="text-[color:var(--theme-text-primary)]/50 text-xs">O'qituvchi: {user?.teacherId || "Noma'lum"}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-lg text-xs font-medium text-[color:var(--theme-text-primary)]/80">Rejalashtirilgan</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Warning Message if attendance is low */}
      {attRate < 80 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-200 text-sm item-start leading-tight"
        >
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <p>
            <strong className="text-red-400">Diqqat!</strong> Davomatingiz 80% dan tushib ketgan. Iltimos, darslarni qoldirmaslikka harakat qiling.
          </p>
        </motion.div>
      )}

    </div>
  );
}
