import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { AlertCircle } from 'lucide-react';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if(!user?.id) return;
    const q = query(collection(db, 'attendance'), where('studentId', '==', user.id));
    const unsub = onSnapshot(q, (snap) => {
      setAttendance(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return unsub;
  }, [user]);

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const total = presentCount + absentCount;
  const rate = total === 0 ? 100 : Math.round((presentCount / total) * 100);

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayStatus = (day: Date) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    const record = attendance.find(a => a.date === formattedDate);
    return record?.status;
  };

  return (
    <div className="space-y-6 pb-4">
      
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${rate < 80 ? 'from-red-500/10' : 'from-[#FEC204]/10'} to-transparent z-0`}></div>
        <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest relative z-10 mb-2">Davomat Ko'rsatkichi</p>
        <div className="flex items-end gap-3 relative z-10">
          <p className="text-4xl font-black text-white">{rate}%</p>
          <p className={`${rate < 80 ? 'text-red-400' : 'text-[#FEC204]'} text-sm font-medium mb-1`}>
            {rate < 80 ? 'Xavfli holat' : 'Yaxshi'}
          </p>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden relative z-10">
          <div className={`${rate < 80 ? 'bg-red-400' : 'bg-[#FEC204]'} h-full transition-all duration-500`} style={{ width: `${rate}%` }}></div>
        </div>
        
        {rate < 80 && (
          <div className="mt-4 flex gap-2 items-start text-red-200 text-xs leading-tight relative z-10">
            <AlertCircle className="text-red-400 shrink-0" size={14} />
            <p>Sizning davomatingiz 80% dan past. Dars qoldirmaslikka harakat qiling.</p>
          </div>
        )}
      </div>

      <div className="glass-panel p-4">
        <h3 className="text-center font-bold text-lg mb-4 capitalize text-white">{format(currentDate, "MMMM yyyy")}</h3>
        
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((d, i) => (
            <div key={i} className="text-[10px] font-bold text-white/40 uppercase">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const status = getDayStatus(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            
            let statusClasses = '';
            if (status === 'present') statusClasses = 'bg-green-500/20 text-green-400 border-green-500/30 border font-bold';
            else if (status === 'absent') statusClasses = 'bg-red-500/20 text-red-400 border-red-500/30 border font-bold';
            else if (status === 'excused') statusClasses = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border font-bold';
            else statusClasses = 'bg-white/5 text-white/80';

            return (
              <div 
                key={i} 
                className={`relative flex items-center justify-center p-2 h-10 rounded-xl text-xs transition-all ${!isCurrentMonth ? 'opacity-30' : ''} ${statusClasses} ${isToday && !status ? 'ring-2 ring-[#FEC204]/50' : ''}`}
              >
                {format(day, dateFormat)}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 text-[10px] font-medium text-white/50">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30"></div> Kelgan</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30"></div> Kelmagan</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30"></div> Sababli</div>
      </div>

    </div>
  );
}
