import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Attendance } from '../../types';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'attendance'), where('studentId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Attendance[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as Attendance);
      });
      setAttendance(data);
    });
    return () => unsubscribe();
  }, [user]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('uz-UZ', { month: 'long' });
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay(); // 0 is Sunday, 1 is Monday...

  // Adjust for Monday start (0=Monday, 6=Sunday)
  let startOffset = firstDayOfMonth - 1;
  if (startOffset < 0) startOffset = 6;

  const currentMonthAttendance = attendance.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  const presentCount = currentMonthAttendance.filter(a => a.status === 'present').length;
  const absentCount = currentMonthAttendance.filter(a => a.status === 'absent').length;
  const totalCount = presentCount + absentCount || 1;
  const attendanceRate = Math.round((presentCount / totalCount) * 100);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">Davomat</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"><ChevronLeft size={16} className="text-white" /></button>
          <span className="badge-gold w-24 text-center capitalize">{monthName}, {year}</span>
          <button onClick={nextMonth} className="p-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"><ChevronRight size={16} className="text-white" /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="glass-panel p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:scale-[1.02] transition-transform">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[10px] md:rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] font-black text-[16px] md:text-[20px]">{presentCount}</div>
          <div>
            <p className="text-[10px] md:text-[11px] uppercase font-bold text-white/40 tracking-[1px]">Keldi</p>
            <p className="text-[15px] md:text-[18px] font-black text-white tracking-[-0.5px]">Kunlar</p>
          </div>
        </div>
        
        <div className="glass-panel p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:scale-[1.02] transition-transform">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[10px] md:rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center text-red-500 font-black text-[16px] md:text-[20px]">{absentCount}</div>
          <div>
            <p className="text-[10px] md:text-[11px] uppercase font-bold text-white/40 tracking-[1px]">Kelmadi</p>
            <p className="text-[15px] md:text-[18px] font-black text-white tracking-[-0.5px]">Kunlar</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 md:p-6 border-l-4 border-[#FEC204] hover:scale-[1.01] transition-transform">
        <div className="flex justify-between items-end mb-2 md:mb-3">
          <p className="text-[11px] md:text-[13px] uppercase tracking-[2px] font-bold text-white/40">O'rtacha ko'rsatkich</p>
          <p className="text-[28px] md:text-[36px] font-[900] tracking-[-1px] text-white leading-none">{presentCount + absentCount === 0 ? 0 : attendanceRate}%</p>
        </div>
        <div className="w-full h-[6px] md:h-[8px] bg-white/10 rounded-full overflow-hidden mt-3 md:mt-4">
          <div className="bg-[#22c55e] h-full" style={{ width: `${presentCount + absentCount === 0 ? 0 : attendanceRate}%` }}></div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 px-1 mt-2">
          <h2 className="text-[12px] text-white font-bold uppercase tracking-[1px]">Oylik hisobot</h2>
          <CalendarIcon size={16} className="text-white/40" />
        </div>
        
        <div className="glass-panel p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-white/40 mb-1">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-[6px]">
            {/* Empty starts */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            {days.map(day => {
              const dayStr = String(day).padStart(2, '0');
              const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
              const dateString = `${year}-${monthStr}-${dayStr}`;
              
              const dayAttendance = currentMonthAttendance.find(a => a.date === dateString);
              let status = 'empty';
              if (dayAttendance) {
                status = dayAttendance.status;
              }
              
              let style = "bg-white/5 border-white/5 text-white/40"; // default styling for empty days
              if (status === 'present') style = "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]";
              else if (status === 'absent') style = "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-red-500";
              else if (status === 'excused') style = "bg-[rgba(234,179,8,0.1)] border-[rgba(234,179,8,0.2)] text-yellow-500";

              return (
                <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-[8px] border font-bold text-[13px] ${style}`}>
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 py-2">
        <div className="flex items-center gap-1.5 border border-white/10 bg-[color:var(--bg-color)] px-3 py-1.5 rounded-full shadow-sm">
          <div className="w-3 h-3 rounded-md bg-[rgba(254,194,4,0.2)] border border-[rgba(254,194,4,0.4)]"></div>
          <span className="text-[10px] font-bold text-white/70">Keldi</span>
        </div>
        <div className="flex items-center gap-1.5 border border-white/10 bg-[color:var(--bg-color)] px-3 py-1.5 rounded-full shadow-sm">
          <div className="w-3 h-3 rounded-md bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)]"></div>
          <span className="text-[10px] font-bold text-white/70">Kelmadi</span>
        </div>
        <div className="flex items-center gap-1.5 border border-white/10 bg-[color:var(--bg-color)] px-3 py-1.5 rounded-full shadow-sm">
          <div className="w-3 h-3 rounded-md bg-[rgba(234,179,8,0.15)] border border-[rgba(234,179,8,0.3)]"></div>
          <span className="text-[10px] font-bold text-white/70">Sababli</span>
        </div>
      </div>

    </div>
  );
}
