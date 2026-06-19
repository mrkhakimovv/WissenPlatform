import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function StudentAttendance() {
  const days = Array.from({length: 31}, (_, i) => i + 1);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">Davomat</h1>
        <span className="badge-gold">Iyun, 2026</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="glass-panel p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:scale-[1.02] transition-transform">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[10px] md:rounded-xl bg-[rgba(254,194,4,0.12)] border border-[rgba(254,194,4,0.3)] flex items-center justify-center text-[#FEC204] font-black text-[16px] md:text-[20px]">18</div>
          <div>
            <p className="text-[10px] md:text-[11px] uppercase font-bold text-white/40 tracking-[1px]">Keldi</p>
            <p className="text-[15px] md:text-[18px] font-black text-white tracking-[-0.5px]">Kunlar</p>
          </div>
        </div>
        
        <div className="glass-panel p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:scale-[1.02] transition-transform">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[10px] md:rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center text-red-500 font-black text-[16px] md:text-[20px]">4</div>
          <div>
            <p className="text-[10px] md:text-[11px] uppercase font-bold text-white/40 tracking-[1px]">Kelmadi</p>
            <p className="text-[15px] md:text-[18px] font-black text-white tracking-[-0.5px]">Kunlar</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 md:p-6 border-l-4 border-[#FEC204] hover:scale-[1.01] transition-transform">
        <div className="flex justify-between items-end mb-2 md:mb-3">
          <p className="text-[11px] md:text-[13px] uppercase tracking-[2px] font-bold text-white/40">O'rtacha ko'rsatkich</p>
          <p className="text-[28px] md:text-[36px] font-[900] tracking-[-1px] text-white leading-none">82%</p>
        </div>
        <div className="w-full h-[6px] md:h-[8px] bg-white/10 rounded-full overflow-hidden mt-3 md:mt-4">
          <div className="bg-[#FEC204] h-full" style={{ width: '82%' }}></div>
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
            <div className="aspect-square"></div>
            {days.map(day => {
              let status = 'empty';
              // Randomly distribute some presences and absences for the mockup
              if (day < 20) {
                if (day % 4 === 0) status = 'absent';
                else if (day % 7 !== 0) status = 'present';
              }
              
              let style = "bg-[#f5f5f5] border-white/10 text-white/40";
              if (status === 'present') style = "bg-[rgba(254,194,4,0.12)] border-[rgba(254,194,4,0.3)] text-[#a07800]";
              if (status === 'absent') style = "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-[color:var(--danger-color)]";

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
      </div>

    </div>
  );
}
