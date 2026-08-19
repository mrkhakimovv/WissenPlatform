const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

const targetStr = `<div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Daqiqa</label>
                  <input required type="number" placeholder="90" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Urinishlar</label>
                  <input required type="number" min="1" max="100" value={formData.maxAttempts || 1} onChange={e=>setFormData({...formData, maxAttempts: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Manzil</label>
                  <input required placeholder="1-xona" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
              </div>`;

const replaceStr = `<div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Daqiqa</label>
                  <input required type="number" placeholder="90" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Urinishlar</label>
                  <input required type="number" min="1" max="100" value={formData.maxAttempts || 1} onChange={e=>setFormData({...formData, maxAttempts: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                </div>
              </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
