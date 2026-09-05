const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

// 1. Add History Modal States
const targetState = `  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [newFee, setNewFee] = useState<string>('');`;
const replacementState = `  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [newFee, setNewFee] = useState<string>('');
  const [historyModalStudent, setHistoryModalStudent] = useState<any>(null);
  const [historyModalYear, setHistoryModalYear] = useState<number>(new Date().getFullYear());`;
code = code.replace(targetState, replacementState);


// 2. Make the debt area clickable
const targetUI = `              {/* Debt Info */}
              <div className="grid grid-cols-2 gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-white/5">
                 <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1 block">Ushbu oy</span>
                    <p className={\`text-[13px] font-black \${debtInfo.currentMonthDebt > 0 ? 'text-[#FEC204]' : 'text-green-400'}\`}>
                       {debtInfo.currentMonthDebt > 0 ? \`-\${debtInfo.currentMonthDebt.toLocaleString()}\` : 'To\\'langan'}
                    </p>
                 </div>
                 <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1 block">Boshqa oylar</span>
                    <p className={\`text-[13px] font-black \${debtInfo.otherMonthsDebt > 0 ? 'text-red-400' : 'text-green-400'}\`}>
                       {debtInfo.otherMonthsDebt > 0 ? \`-\${debtInfo.otherMonthsDebt.toLocaleString()}\` : 'Yo\\'q'}
                    </p>
                 </div>
              </div>`;
const replacementUI = `              {/* Debt Info */}
              <div 
                 onClick={() => {
                    setHistoryModalStudent(student);
                    setHistoryModalYear(filterYear);
                 }}
                 className="grid grid-cols-2 gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group/history relative"
              >
                 <div className="absolute inset-0 border border-white/0 group-hover/history:border-white/10 rounded-xl transition-colors pointer-events-none"></div>
                 <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1 block">Ushbu oy</span>
                    <p className={\`text-[13px] font-black \${debtInfo.currentMonthDebt > 0 ? 'text-[#FEC204]' : 'text-green-400'}\`}>
                       {debtInfo.currentMonthDebt > 0 ? \`-\${debtInfo.currentMonthDebt.toLocaleString()}\` : 'To\\'langan'}
                    </p>
                 </div>
                 <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1 block flex items-center justify-between">
                      Boshqa oylar
                    </span>
                    <p className={\`text-[13px] font-black \${debtInfo.otherMonthsDebt > 0 ? 'text-red-400' : 'text-green-400'}\`}>
                       {debtInfo.otherMonthsDebt > 0 ? \`-\${debtInfo.otherMonthsDebt.toLocaleString()}\` : 'Yo\\'q'}
                    </p>
                 </div>
              </div>`;
code = code.replace(targetUI, replacementUI);


// 3. Add Modal at the end of return
const targetEnd = `    </div>
  );
}`;
const replacementEnd = `
      {historyModalStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setHistoryModalStudent(null)}></div>
           <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-3xl relative z-10 flex flex-col gap-6 shadow-2xl">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-white text-xl font-black">{historyModalStudent.fullName}</h3>
                    <p className="text-white/40 text-sm mt-1">To'lovlar tarixi va qarzdorlik</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <select 
                       value={historyModalYear} 
                       onChange={(e) => setHistoryModalYear(Number(e.target.value))}
                       className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 outline-none focus:border-[#FEC204]/50"
                    >
                       {years.map(y => <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>)}
                    </select>
                    <button onClick={() => setHistoryModalStudent(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                       <X size={18} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                 {months.map((m, i) => {
                    const monthNumber = i + 1;
                    const jd = historyModalStudent.joinedDate ? new Date(historyModalStudent.joinedDate) : new Date();
                    const joinedYear = jd.getFullYear();
                    const joinedMonth = jd.getMonth() + 1;
                    
                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();
                    const currentMonth = currentDate.getMonth() + 1;

                    const isBeforeJoined = historyModalYear < joinedYear || (historyModalYear === joinedYear && monthNumber < joinedMonth);
                    const isJoinedMonth = historyModalYear === joinedYear && monthNumber === joinedMonth;
                    const isFuture = historyModalYear > currentYear || (historyModalYear === currentYear && monthNumber > currentMonth);
                    const paymentRecord = payments.find(p => p.studentId === historyModalStudent.id && p.month === monthNumber && p.year === historyModalYear);

                    let cellClass = "bg-white/5 border border-white/5 text-white/20"; // disabled
                    let label = "";

                    if (isBeforeJoined) {
                       label = "Ro'yxatda yo'q";
                    } else if (isFuture) {
                       cellClass = "bg-white/[0.02] border border-dashed border-white/20 text-white/40";
                       label = "Kutilmoqda";
                    } else if (paymentRecord) {
                       cellClass = "bg-green-500/10 border border-green-500/20 text-green-400";
                       if (paymentRecord.status === 'forgiven') {
                          label = "Kechilgan";
                       } else {
                          label = "To'langan";
                       }
                    } else {
                       cellClass = "bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
                       label = "Qarzdorlik";
                    }

                    return (
                       <div key={m} className={\`relative p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all \${cellClass}\`}>
                          {isJoinedMonth && (
                             <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#FEC204] rounded-full shadow-[0_0_8px_rgba(254,194,4,0.6)]" title="Kelgan oyi"></div>
                          )}
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80">{m}</span>
                          <span className="text-[10px] font-medium opacity-60">{label}</span>
                          {paymentRecord?.paidAt && (
                             <span className="text-[9px] opacity-40 mt-1">{new Date(paymentRecord.paidAt).toLocaleDateString('uz-UZ')}</span>
                          )}
                       </div>
                    );
                 })}
              </div>
              
              <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FEC204] shadow-[0_0_8px_rgba(254,194,4,0.6)]"></div>
                    <span className="text-xs text-white/50">Kelgan oyi</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500/50"></div>
                    <span className="text-xs text-white/50">Qarzdorlik</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500/50"></div>
                    <span className="text-xs text-white/50">To'langan</span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(targetEnd, replacementEnd);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
