const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const targetHeader = `<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-[color:var(--theme-text-primary)] text-xl font-bold">Oylik To'lovlar</h2>
          <p className="text-[12px] font-bold text-[color:var(--theme-text-primary)]/40 mt-1">
            Jami yig'ilgan summa: <span className="text-[#FEC204]">{totalAmount.toLocaleString()} so'm</span>
          </p>
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

const newHeader = `<div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 md:p-5">
            <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Kutilayotgan</div>
            <div className="text-lg md:text-xl font-black text-white">{(students.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0)).toLocaleString()} <span className="text-sm font-medium text-white/40">so'm</span></div>
            <div className="text-[11px] font-bold text-white/30 mt-2">Jami o'quvchilar: {students.length} ta</div>
          </div>
          <div className="glass-panel p-4 md:p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5"></div>
            <div className="relative">
              <div className="text-[11px] font-bold text-green-500/60 uppercase tracking-widest mb-1">Yig'ildi</div>
              <div className="text-lg md:text-xl font-black text-green-400">{totalAmount.toLocaleString()} <span className="text-sm font-medium text-green-500/40">so'm</span></div>
              <div className="text-[11px] font-bold text-green-500/40 mt-2">To'laganlar: {students.filter(s => getPaymentRecord(s.id)).length} ta</div>
            </div>
          </div>
          <div className="glass-panel p-4 md:p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5"></div>
            <div className="relative">
              <div className="text-[11px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Qarzdorlik</div>
              <div className="text-lg md:text-xl font-black text-red-400">{Math.max(0, students.reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0) - totalAmount).toLocaleString()} <span className="text-sm font-medium text-red-500/40">so'm</span></div>
              <div className="text-[11px] font-bold text-red-500/40 mt-2">To'lamaganlar: {students.length - students.filter(s => getPaymentRecord(s.id)).length} ta</div>
            </div>
          </div>
          <div className="glass-panel p-4 md:p-5">
             <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Bajarildi</div>
             <div className="text-lg md:text-xl font-black text-[#FEC204]">{students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%</div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#FEC204] rounded-full" style={{ width: \`\${students.length > 0 ? Math.round((students.filter(s => getPaymentRecord(s.id)).length / students.length) * 100) : 0}%\` }}></div>
             </div>
          </div>
        </div>
      </div>`;

code = code.replace(targetHeader, newHeader);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
