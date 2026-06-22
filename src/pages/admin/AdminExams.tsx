import React from 'react';

export default function AdminExams() {
  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">Imtihonlar</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz ichki olimpiadalari va testlari</p>
        </div>
        <button className="glass-panel px-6 py-3 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black transition-colors rounded-[12px]">
          Imtihon qo'shish
        </button>
      </div>

      <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-[24px]">📝</span>
        </div>
        <h3 className="text-[18px] font-bold text-white mb-2">Hali imtihonlar yo'q</h3>
        <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Rejalashtirilgan imtihonlar va test sinovlari haqida malumotlar shu yerda qo'shib boriladi.</p>
      </div>
    </div>
  );
}
