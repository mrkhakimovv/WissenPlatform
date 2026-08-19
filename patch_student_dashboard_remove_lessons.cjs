const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentDashboard.tsx', 'utf-8');

const targetLogic = `      <div>
        <h2 className="text-[13px] text-white font-bold mb-3 px-1 uppercase tracking-[1px]">Bugungi Darslar</h2>
        
        {todaySchedules.length > 0 ? (
          <div className="space-y-3">
            {todaySchedules.map(sched => (
              <div key={sched.id} className="glass-panel p-4 border-none shadow-sm ring-1 ring-[color:white/10]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-[#FEC204] flex items-center justify-center">
                    <BookOpen size={20} color="#000" />
                  </div>
                  <div>
                    <p className="text-[15px] font-black text-white">{sched.subject}</p>
                    <p className="text-[11px] font-bold text-white/40">Guruh: {groups.find(g => g.id === sched.groupId)?.name || 'Biriktirilmagan'}</p>
                  </div>
                </div>
                <div className="bg-[color:var(--surface-color)] p-3 rounded-xl flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FEC204]"></div>
                    <span className="text-[12px] font-bold text-white">{sched.location}</span>
                  </div>
                  <span className="badge-gold">{sched.startTime} - {sched.endTime}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-6 text-center flex flex-col items-center justify-center gap-2">
            <SearchX size={24} className="text-white/20" />
            <p className="text-white/40 font-bold text-sm">Bugun darslar yo'q</p>
          </div>
        )}
      </div>`;

code = code.replace(targetLogic, '');
fs.writeFileSync('src/pages/student/StudentDashboard.tsx', code);
