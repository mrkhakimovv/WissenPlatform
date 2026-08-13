import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/AdminAttendance.tsx', 'utf-8');

code = code.replace(/<div className="glass-panel overflow-hidden rounded-xl border border-white\/5 bg-\[#1a1a1a\]">/, 
`{validDates.length === 0 ? (
             <div className="glass-panel p-8 text-center">
                 <p className="text-white/40 text-sm font-medium">Ushbu guruh uchun dars jadvali (kunlari) belgilanmagan.</p>
             </div>
           ) : (
             <div className="glass-panel overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a]">`);

code = code.replace(/<\/table>\n               <\/div>\n           <\/div>/, 
`</table>
               </div>
           </div>
           )}`);
           
fs.writeFileSync('src/pages/admin/AdminAttendance.tsx', code);
