const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const targetCard = `              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                 <div>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider block mb-0.5">Jami qarzdorlik</span>
                    <p className={\`text-lg font-black \${isFullyPaid ? 'text-green-400' : 'text-red-500'}\`}>
                       {debtInfo.totalDebt.toLocaleString()} <span className="text-[10px] font-medium opacity-50 font-sans">UZS</span>
                    </p>
                 </div>`;

const replacementCard = `              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                 <div>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider block mb-0.5">Ushbu oy uchun</span>
                    <p className={\`text-lg font-black \${debtInfo.currentMonthDebt === 0 ? 'text-green-400' : 'text-red-500'}\`}>
                       {debtInfo.currentMonthDebt.toLocaleString()} <span className="text-[10px] font-medium opacity-50 font-sans">UZS</span>
                    </p>
                 </div>`;
                 
code = code.replace(targetCard, replacementCard);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
