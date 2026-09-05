const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const targetUI = `<div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 pb-20">
        {students.map(student => {
          const paymentRecord = getPaymentRecord(student.id);
          const initials = student.fullName?.substring(0,2).toUpperCase() || 'ST';
          return (
            <div key={student.id} className="glass-panel-list p-3 flex flex-col gap-3 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-[color:var(--theme-text-primary)] border border-white/5">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[color:var(--theme-text-primary)] text-sm font-semibold truncate">{student.fullName}</p>
                  <p className="text-[color:var(--theme-text-primary)]/40 text-[10px] truncate">{student.monthlyFee?.toLocaleString()} so'm</p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  {paymentRecord ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20 leading-none mt-0.5">To'landi</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 leading-none mt-0.5">To'lanmagan</span>
                  )}
                </div>
              </div>

              {paymentRecord ? (
                <div className="w-full flex items-center justify-between py-2 px-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                  <span className="text-[11px] text-green-400 font-bold">{new Date(paymentRecord.paidAt).toLocaleDateString('uz-UZ')}</span>
                  <button onClick={() => handleDelete(paymentRecord.id)} className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handlePay(student.id, student.monthlyFee)}
                  className="w-full py-2 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 border border-white/5 text-[color:var(--theme-text-primary)]/90 font-medium rounded-xl text-xs transition-colors"
                >
                  To'lovni kiritish
                </button>
              )}
            </div>
          )
        })}
        {students.length === 0 && <p className="text-center text-[color:var(--theme-text-primary)]/40 py-6 text-sm col-span-full">O'quvchilar yo'q</p>}
      </div>`;

const replacementUI = `<div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 pb-20">
        {students.map(student => {
          const debtInfo = getDebtInfo(student);
          const isFullyPaid = debtInfo.totalDebt === 0;
          const initials = student.fullName?.substring(0,2).toUpperCase() || 'ST';
          
          return (
            <div key={student.id} className="glass-panel p-4 flex flex-col gap-4 relative overflow-hidden group">
              {/* Initials & Name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-black text-lg text-white border border-white/5">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{student.fullName}</p>
                  
                  {/* Monthly Fee Edit */}
                  {editingFeeId === student.id ? (
                     <div className="flex items-center gap-2 mt-1">
                        <input 
                           type="number" 
                           value={newFee}
                           onChange={(e) => setNewFee(e.target.value)}
                           className="bg-[#1a1a1a] border border-white/10 text-white text-[11px] px-2 py-1 rounded w-24 outline-none focus:border-[#FEC204]/50"
                        />
                        <button onClick={() => handleUpdateFee(student.id)} className="w-6 h-6 bg-green-500/20 text-green-400 rounded flex items-center justify-center hover:bg-green-500/30 transition-colors">
                           <Check size={12} />
                        </button>
                        <button onClick={() => setEditingFeeId(null)} className="w-6 h-6 bg-white/10 text-white/50 rounded flex items-center justify-center hover:bg-white/20 transition-colors">
                           <X size={12} />
                        </button>
                     </div>
                  ) : (
                     <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-white/40 text-[11px] font-medium truncate">Oylik to'lov: {(Number(student.monthlyFee)||0).toLocaleString()} so'm</p>
                        <button onClick={() => { setEditingFeeId(student.id); setNewFee(student.monthlyFee?.toString() || ''); }} className="text-white/20 hover:text-[#FEC204] transition-colors">
                           <Edit2 size={12} />
                        </button>
                     </div>
                  )}
                </div>
              </div>

              {/* Debt Info */}
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
              </div>

              {/* Actions & Total Debt */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                 <div>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider block mb-0.5">Jami qarzdorlik</span>
                    <p className={\`text-lg font-black \${isFullyPaid ? 'text-green-400' : 'text-red-500'}\`}>
                       {debtInfo.totalDebt.toLocaleString()} <span className="text-[10px] font-medium opacity-50 font-sans">UZS</span>
                    </p>
                 </div>
                 
                 {!isFullyPaid && (
                   <div className="flex gap-2">
                     {debtInfo.totalDebt > 0 && (
                        <button 
                           onClick={() => handleForgiveDebt(student.id, debtInfo.totalDebt)}
                           title="Qarzdorlikni kechish"
                           className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 text-white/40 hover:text-white transition-all active:scale-95"
                        >
                           <X size={16} />
                        </button>
                     )}
                     <button 
                        onClick={() => handlePay(student.id, debtInfo.totalDebt)}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#FEC204] to-[#f97316] hover:from-[#f5b800] hover:to-[#ea580c] text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(254,194,4,0.3)] active:scale-95"
                     >
                        To'lash
                     </button>
                   </div>
                 )}
              </div>
              
              {isFullyPaid && (
                <div className="absolute top-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-lg">
                   To'liq to'langan
                </div>
              )}
            </div>
          )
        })}
        {students.length === 0 && <p className="text-center text-white/40 py-6 text-sm col-span-full font-medium">O'quvchilar yo'q</p>}
      </div>`;

code = code.replace(targetUI, replacementUI);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
