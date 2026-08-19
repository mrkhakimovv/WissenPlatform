const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentResults.tsx', 'utf-8');

const targetStr = `                <div className="flex items-center gap-2 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                  <Clock size={14} className="text-white/30" />
                  <span>Topshirildi: {dateStr}</span>
                </div>`;

const replaceStr = `                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                    <Clock size={14} className="text-white/30" />
                    <span>Topshirildi: {dateStr}</span>
                  </div>
                  {res.attempts > 0 && (
                    <div className="flex items-center gap-2 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                      <span className="text-white/30 w-[14px] flex justify-center text-[10px]">🔄</span>
                      <span>Eng yuqori natija ({res.attempts}-urinishda ko'rsatilgan)</span>
                    </div>
                  )}
                </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/student/StudentResults.tsx', code);
