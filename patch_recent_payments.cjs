const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const target = `      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 pb-20">`;
const repl = `      {/* So'nggi to'lovlar bloki (xatoliklarni o'chirish uchun) */}
      <div className="glass-panel p-4 md:p-5 mb-6">
         <h3 className="text-white text-base font-bold mb-4 flex items-center gap-2">
           <svg className="w-5 h-5 text-[#FEC204]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           So'nggi qabul qilingan to'lovlar
         </h3>
         <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {payments.filter(p => p.month === filterMonth && p.year === filterYear).sort((a,b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime()).slice(0, 20).map(p => {
               const st = students.find(s => s.id === p.studentId);
               return (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                     <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{st ? st.fullName : "Noma'lum o'quvchi"}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[#FEC204] font-bold text-xs">{(Number(p.amount) || 0).toLocaleString()} UZS</span>
                           <span className="text-white/30 text-[10px]">
                              {p.paidAt ? new Date(p.paidAt).toLocaleString('uz-UZ') : ''}
                           </span>
                           {p.status === 'forgiven' && <span className="bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Kechilgan</span>}
                        </div>
                     </div>
                     <button 
                        onClick={() => handleDelete(p.id)} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                        title="To'lovni bekor qilish"
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
               );
            })}
            {payments.filter(p => p.month === filterMonth && p.year === filterYear).length === 0 && (
               <div className="text-center text-white/40 text-sm py-4">Bu oy uchun to'lovlar yo'q</div>
            )}
         </div>
      </div>

      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 pb-20">`;

code = code.replace(target, repl);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
