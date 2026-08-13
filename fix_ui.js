import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/AdminAttendance.tsx', 'utf-8');

// Replace table layout with new table design based on screenshot
code = code.replace(/<div className="glass-panel overflow-hidden">[\s\S]*?<\/div>\n           <\/div>/, `<div className="glass-panel overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a]">
               <div className="w-full overflow-x-auto">
                   <table className="w-full text-left border-collapse whitespace-nowrap">
                       <thead>
                           <tr className="bg-[#2a2a2a] border-b border-white/5">
                               <th className="sticky left-0 z-20 bg-[#2a2a2a] p-4 text-[11px] font-bold text-white/50 uppercase tracking-widest min-w-[250px] border-r border-white/5 shadow-[4px_0_12px_rgba(0,0,0,0.1)]">
                                   ISM FAMILIYA
                               </th>
                               {validDates.map(d => (
                                   <th key={d} className="p-4 text-center text-[12px] font-bold text-white w-[50px] min-w-[50px]">
                                       {d}
                                   </th>
                               ))}
                           </tr>
                       </thead>
                       <tbody className="bg-[#1e1e1e]">
                           {groupStudents.map(student => {
                               const debt = getStudentDebt(student.id);
                               return (
                                   <tr key={student.id} className="border-b border-white/5 last:border-0 hover:bg-[#252525] transition-colors group">
                                       <td className="sticky left-0 z-10 bg-[#1e1e1e] group-hover:bg-[#252525] transition-colors p-4 border-r border-white/5 shadow-[4px_0_12px_rgba(0,0,0,0.1)]">
                                           <div className="flex justify-between items-center pr-2">
                                              <div>
                                                  <h4 className="text-[14px] font-bold text-white mb-0.5">{student.fullName}</h4>
                                                  {debt > 0 ? (
                                                      <p className="text-[11px] font-medium text-[#f87171]">{debt.toLocaleString()} so'm qarz</p>
                                                  ) : (
                                                      <p className="text-[11px] font-medium text-[#4ade80]">To'langan</p>
                                                  )}
                                              </div>
                                              <div className="w-6 h-6 rounded flex items-center justify-center text-white/20">
                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
                                              </div>
                                           </div>
                                       </td>
                                       {validDates.map(d => {
                                           const status = getStatus(student.id, d);
                                           let cellStyle = "bg-white/5 text-transparent border border-white/5";
                                           let label = "";
                                           if (status === 'present') {
                                               cellStyle = "bg-[#065f46]/40 text-[#4ade80] border-[#065f46]/60";
                                               label = "+";
                                           } else if (status === 'absent') {
                                               cellStyle = "bg-[#7f1d1d]/40 text-[#f87171] border-[#7f1d1d]/60";
                                               label = "-";
                                           }
                                           return (
                                               <td key={d} className="p-2 text-center">
                                                   <button 
                                                       onClick={() => toggleAttendance(student.id, d)}
                                                       className={\`w-[34px] h-[28px] rounded-[6px] mx-auto flex items-center justify-center text-[15px] font-black transition-all hover:scale-[1.05] \${cellStyle}\`}
                                                   >
                                                       {label}
                                                   </button>
                                               </td>
                                           );
                                       })}
                                   </tr>
                               );
                           })}
                           {groupStudents.length === 0 && (
                               <tr>
                                   <td colSpan={validDates.length + 1} className="p-8 text-center text-white/40 text-sm font-medium">
                                       O'quvchilar yo'q
                                   </td>
                               </tr>
                           )}
                       </tbody>
                   </table>
               </div>
           </div>`);
           
fs.writeFileSync('src/pages/admin/AdminAttendance.tsx', code);
