const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminGroups.tsx', 'utf-8');

const targetUI = `              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold mb-1 block">Boshlanishi</label>
                  <input type="time" value={formData.startTime} onChange={e=>setFormData({...formData, startTime: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold mb-1 block">Tugashi</label>
                  <input type="time" value={formData.endTime} onChange={e=>setFormData({...formData, endTime: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" style={{ colorScheme: "dark" }} />
                </div>
              </div>`;

const newUI = `              {formData.days.length > 0 && (
                <div className="space-y-3 mt-4">
                  <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold block mb-2">Dars vaqtlari</label>
                  {WEEKDAYS.filter(w => formData.days.includes(w.id)).map(day => {
                    const sched = formData.schedule[day.id] || { startTime: formData.startTime || '', endTime: formData.endTime || '' };
                    return (
                      <div key={day.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                        <span className="text-[12px] font-bold text-[#FEC204] w-8 text-center">{day.label}</span>
                        <div className="flex-1">
                          <input 
                            type="time" 
                            value={sched.startTime} 
                            onChange={e => setFormData({
                              ...formData, 
                              schedule: { ...formData.schedule, [day.id]: { ...sched, startTime: e.target.value } }
                            })} 
                            className="w-full bg-black/20 rounded-lg p-2 outline-none focus:border-[#FEC204]/50 border border-transparent text-sm text-white" 
                            style={{ colorScheme: "dark" }} 
                          />
                        </div>
                        <span className="text-white/40">-</span>
                        <div className="flex-1">
                          <input 
                            type="time" 
                            value={sched.endTime} 
                            onChange={e => setFormData({
                              ...formData, 
                              schedule: { ...formData.schedule, [day.id]: { ...sched, endTime: e.target.value } }
                            })} 
                            className="w-full bg-black/20 rounded-lg p-2 outline-none focus:border-[#FEC204]/50 border border-transparent text-sm text-white" 
                            style={{ colorScheme: "dark" }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}`;

code = code.replace(targetUI, newUI);
fs.writeFileSync('src/pages/admin/AdminGroups.tsx', code);
