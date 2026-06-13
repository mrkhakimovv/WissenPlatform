import React from 'react';
import { motion } from 'motion/react';
import { CalendarClock } from 'lucide-react';

export default function StudentSchedule() {
  const days = [
    { name: 'Dushanba', details: '14:00 - 15:30', today: false },
    { name: 'Seshanba', details: '-', today: false },
    { name: 'Chorshanba', details: '14:00 - 15:30', today: true },
    { name: 'Payshanba', details: '-', today: false },
    { name: 'Juma', details: '14:00 - 15:30', today: false },
    { name: 'Shanba', details: '-', today: false },
    { name: 'Yakshanba', details: '-', today: false },
  ];

  const currentDayIndex = new Date().getDay(); // 0 is Sunday
  const JS_DOW_TO_MY_DOW = [6, 0, 1, 2, 3, 4, 5]; // maps JS 0 (Sun) -> 6 (Yakshanba in my array)
  days.forEach(d => d.today = false);
  days[JS_DOW_TO_MY_DOW[currentDayIndex]].today = true;

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-5 relative overflow-hidden bg-gradient-to-br from-[#FEC204]/10 to-transparent border-[#FEC204]/20">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FEC204] to-[#f59e0b] shadow-lg shadow-[#FEC204]/20 flex items-center justify-center shrink-0">
            <CalendarClock className="text-[#0d0d0d]" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[color:var(--theme-text-primary)] leading-tight">Dars Jadvali</h2>
            <p className="text-[#FEC204] text-[10px] font-bold uppercase tracking-widest mt-1">Haftalik Reja</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {days.map((day, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            key={day.name} 
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Timeline Dot */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#1a1a1a] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${day.today ? 'bg-[#FEC204]' : 'bg-white/10'}`}>
              <div className={`w-2 h-2 rounded-full ${day.today ? 'bg-black' : 'bg-white/40'}`}></div>
            </div>
            
            {/* Card */}
            <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] glass-panel-list p-4 ${day.today ? 'border-[#FEC204]/50 shadow-lg shadow-[#FEC204]/10 bg-white/10' : ''}`}>
              <div className="flex justify-between items-center mb-1">
                <h3 className={`font-bold ${day.today ? 'text-[#FEC204]' : 'text-[color:var(--theme-text-primary)]'}`}>{day.name}</h3>
                {day.today && <span className="text-[9px] bg-[#FEC204] text-[#0d0d0d] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Bugun</span>}
              </div>
              <p className={`text-sm ${day.details === '-' ? 'text-[color:var(--theme-text-primary)]/30 italic font-light' : 'text-[color:var(--theme-text-primary)]/80 font-medium'}`}>
                {day.details}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
