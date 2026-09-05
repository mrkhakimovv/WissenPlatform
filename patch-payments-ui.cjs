const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const targetStatsGrid = `<div className="glass-panel p-4 md:p-5">
             <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Bajarildi</div>
             <div className="text-lg md:text-xl font-black text-[#FEC204]">{students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%</div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#FEC204] rounded-full" style={{ width: \`\${students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%\` }}></div>
             </div>
          </div>
        </div>`;

const newGroupStats = `<div className="glass-panel p-4 md:p-5">
             <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Bajarildi</div>
             <div className="text-lg md:text-xl font-black text-[#FEC204]">{students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%</div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#FEC204] rounded-full" style={{ width: \`\${students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%\` }}></div>
             </div>
          </div>
        </div>

        {/* Group Stats */}
        {groups.length > 0 && (
          <div className="mt-2 flex flex-col gap-3">
            <h3 className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-1 ml-1">Guruhlar bo'yicha statistika</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {groups.map(g => {
                  const groupStudents = students.filter(s => s.groups?.includes(g.id) || s.groupId === g.id);
                  if (groupStudents.length === 0) return null;
                  const expected = groupStudents.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0);
                  const paidStudents = groupStudents.filter(s => getPaymentRecord(s.id));
                  const collected = paidStudents.reduce((acc, s) => acc + (getPaymentRecord(s.id)?.amount || 0), 0);
                  const debt = Math.max(0, expected - collected);
                  const percentage = groupStudents.length > 0 ? Math.round((paidStudents.length / groupStudents.length) * 100) : 0;
                  
                  return (
                     <div key={g.id} className="glass-panel p-4 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors border border-white/5">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#FEC204]"></div>
                             <h4 className="text-white font-bold text-[13px] truncate">{g.name}</h4>
                           </div>
                           <span className="text-[10px] bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded-full font-medium">{groupStudents.length} o'quvchi</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                           <div>
                              <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Yig'ildi</span>
                              <p className="text-green-400 font-black text-[13px]">{collected.toLocaleString()} <span className="text-[10px] text-green-500/40 font-medium font-sans">UZS</span></p>
                           </div>
                           <div>
                              <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Qarzdorlik</span>
                              <p className="text-red-400 font-black text-[13px]">{debt.toLocaleString()} <span className="text-[10px] text-red-500/40 font-medium font-sans">UZS</span></p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1">
                           <div className="flex-1 bg-[#1a1a1a] border border-white/5 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FEC204] rounded-full relative" style={{ width: \`\${percentage}%\` }}>
                                 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                              </div>
                           </div>
                           <span className="text-[11px] font-black text-[#FEC204] w-8 text-right">{percentage}%</span>
                        </div>
                     </div>
                  );
               })}
            </div>
          </div>
        )}`;

code = code.replace(targetStatsGrid, newGroupStats);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
