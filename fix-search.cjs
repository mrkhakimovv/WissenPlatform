const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const targetHeader = `        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-white text-xl font-black tracking-tight">To'lovlar statistikasi</h2>
            <p className="text-white/40 text-[13px] font-medium mt-1">Oylik to'lovlar va qarzdorliklar</p>
          </div>
          <div className="flex gap-2">
            <select value={filterMonth} onChange={e=>setFilterMonth(Number(e.target.value))} className="glass-panel p-2 outline-none text-sm text-[color:var(--theme-text-primary)] rounded-[10px]" style={{ colorScheme: "dark" }}>
              {months.map((m, i) => <option key={m} value={i+1} className="bg-[#1a1a1a]">{m}</option>)}
            </select>
            <select value={filterYear} onChange={e=>setFilterYear(Number(e.target.value))} className="glass-panel p-2 outline-none text-sm text-[color:var(--theme-text-primary)] rounded-[10px]" style={{ colorScheme: "dark" }}>
              {years.map(y => <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>)}
            </select>
          </div>
        </div>`;

const replacementHeader = `        <div className="flex flex-col gap-4">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <h2 className="text-white text-xl font-black tracking-tight">To'lovlar statistikasi</h2>
               <p className="text-white/40 text-[13px] font-medium mt-1">Oylik to'lovlar va qarzdorliklar</p>
             </div>
             
             <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-64">
                  <input 
                    type="text"
                    placeholder="O'quvchi izlash..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FEC204] transition-colors"
                  />
                </div>
                <select value={filterMonth} onChange={e=>setFilterMonth(Number(e.target.value))} className="glass-panel py-2 px-3 outline-none text-sm text-[color:var(--theme-text-primary)] rounded-xl border border-white/10" style={{ colorScheme: "dark" }}>
                  {months.map((m, i) => <option key={m} value={i+1} className="bg-[#1a1a1a]">{m}</option>)}
                </select>
                <select value={filterYear} onChange={e=>setFilterYear(Number(e.target.value))} className="glass-panel py-2 px-3 outline-none text-sm text-[color:var(--theme-text-primary)] rounded-xl border border-white/10" style={{ colorScheme: "dark" }}>
                  {years.map(y => <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>)}
                </select>
             </div>
           </div>
        </div>`;
code = code.replace(targetHeader, replacementHeader);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
