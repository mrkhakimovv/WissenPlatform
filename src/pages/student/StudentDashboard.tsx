import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, onSnapshot, query, where } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { CheckCircle2, BookOpen } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const qAtt = query(collection(db, 'attendance'), where('studentId', '==', user.id));
    const unsubAtt = onSnapshot(qAtt, (snap) => setAttendance(snap.docs.map(d => d.data())));

    const qPay = query(collection(db, 'payments'), where('studentId', '==', user.id));
    const unsubPay = onSnapshot(qPay, (snap) => {
      setPayments(snap.docs.map(d => d.data()));
    });

    return () => { unsubAtt(); unsubPay(); }
  }, [user]);

  // Mini calendar logic
  const todayDate = new Date();
  const days = Array.from({length: 7}, (_, i) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - 3 + i);
    return d;
  });

  const presentCount = attendance.filter(a => a.status === 'present' || a.present).length;
  const totalCount = attendance.length || 1;
  const attendanceRate = Math.round((presentCount / totalCount) * 100);

  const hasPaid = payments.some(p => p.status === 'paid' && p.amount > 0);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-[20px] font-black text-white">Xush kelibsiz, {user?.fullName}! 👋</h1>
        <p className="text-[12px] text-white/40 font-bold mt-1">Bugungi kun uchun rejalaringiz bilan tanishing.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {/* Attendance Card */}
        <div className="glass-panel p-4 md:p-5 !border-l-[3px] !border-l-[#FEC204] hover:scale-[1.02] transition-transform">
          <p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">Davomat %</p>
          <p className="text-[26px] md:text-[32px] font-[900] tracking-[-1px] text-white">{attendance.length === 0 ? 0 : attendanceRate}%</p>
          <div className="w-full h-1.5 bg-[#f0f0f0]/20 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#FEC204] h-full" style={{ width: `${attendance.length === 0 ? 0 : attendanceRate}%` }}></div>
          </div>
        </div>

        {/* Payment Card */}
        <div className="glass-panel p-4 md:p-5 !border-l-[3px] !border-l-[#22c55e] flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">To'lov holati</p>
          <div className="flex items-center gap-2 mt-1">
            {hasPaid ? (
              <>
                <CheckCircle2 size={24} className="text-[#22c55e]" />
                <p className="text-[18px] md:text-[22px] font-black text-white">To'langan</p>
              </>
            ) : (
                <p className="text-[18px] md:text-[22px] font-black text-red-500">To'lanmagan</p>
            )}
          </div>
          <p className="text-[10px] md:text-[12px] font-bold text-white/40 mt-2">Iyun oyi uchun</p>
        </div>
      </div>

      <div>
        <h2 className="text-[13px] text-white font-bold mb-3 px-1 uppercase tracking-[1px]">Bugungi Darslar</h2>
        <div className="glass-panel p-4 border-none bg-white shadow-sm p-4 ring-1 ring-[color:white/10]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-[#FEC204] flex items-center justify-center">
              <BookOpen size={20} color="#000" />
            </div>
            <div>
              <p className="text-[15px] font-black text-white">{user?.subject || 'Matematika'}</p>
              <p className="text-[11px] font-bold text-white/40">Guruh: {user?.groupId || 'G-24'}</p>
            </div>
          </div>
          <div className="bg-[color:var(--surface-color)] p-3 rounded-xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FEC204]"></div>
              <span className="text-[12px] font-bold text-white">Xona #12</span>
            </div>
            <span className="badge-gold">14:00 - 16:00</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[13px] text-white font-bold mb-3 px-1 uppercase tracking-[1px]">Davomat</h2>
        <div className="glass-panel p-4">
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => {
              const dateStr = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
              const isToday = i === 3;
              
              const attRecord = attendance.find(a => a.date === dateStr);
              let status = 'empty';
              if (attRecord) {
                 status = attRecord.status === 'present' || attRecord.present ? 'present' : (attRecord.status || 'absent');
              }
              
              let style = "bg-white/5 border-white/10 text-white/40";
              if (status === 'present') style = "bg-[rgba(254,194,4,0.12)] border-[rgba(254,194,4,0.3)] text-[#FEC204]";
              if (status === 'absent') style = "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-red-500";
              if (status === 'excused') style = "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";

              return (
                <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-[10px] border font-bold text-[13px] ${style} ${isToday ? 'ring-2 ring-offset-[1px] ring-offset-[#0d0d0d] ring-[#FEC204]' : ''}`}>
                  <span>{d.getDate()}</span>
                  <span className="text-[8px] opacity-70 mt-0.5">{d.toLocaleDateString('uz', {weekday:'short'})}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
