const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentResults.tsx', 'utf-8');

const targetGrouped = `        // sort by submittedAt descending
        const grouped = new Map();
        resData.forEach((res: any) => {
          if (!grouped.has(res.examId)) {
            grouped.set(res.examId, res);
          } else {
            const currentBest = grouped.get(res.examId);
            const currentPercent = currentBest.total > 0 ? currentBest.score / currentBest.total : 0;
            const newPercent = res.total > 0 ? res.score / res.total : 0;
            if (newPercent > currentPercent || (newPercent === currentPercent && new Date(res.submittedAt).getTime() > new Date(currentBest.submittedAt).getTime())) {
               grouped.set(res.examId, res);
            }
          }
        });
        const bestResults = Array.from(grouped.values());`;

const newGrouped = `        // group by exam and track total attempts and previous attempts scores
        const grouped = new Map();
        resData.forEach((res: any) => {
          if (!grouped.has(res.examId)) {
            grouped.set(res.examId, { ...res, allScores: [\`\${res.score}/\${res.total}\`] });
          } else {
            const currentBest = grouped.get(res.examId);
            const currentPercent = currentBest.total > 0 ? currentBest.score / currentBest.total : 0;
            const newPercent = res.total > 0 ? res.score / res.total : 0;
            
            // save previous score to list
            currentBest.allScores.push(\`\${res.score}/\${res.total}\`);
            
            if (newPercent > currentPercent || (newPercent === currentPercent && new Date(res.submittedAt).getTime() > new Date(currentBest.submittedAt).getTime())) {
               const updated = { ...res, allScores: currentBest.allScores };
               grouped.set(res.examId, updated);
            } else {
               grouped.set(res.examId, currentBest);
            }
          }
        });
        const bestResults = Array.from(grouped.values());`;

code = code.replace(targetGrouped, newGrouped);

const targetUI = `                  {res.attempts > 0 && (
                    <div className="flex items-center gap-2 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                      <span className="text-white/30 w-[14px] flex justify-center text-[10px]">🔄</span>
                      <span>Eng yuqori natija ({res.attempts}-urinishda ko'rsatilgan)</span>
                    </div>
                  )}`;

const newUI = `                  {res.allScores && res.allScores.length > 1 && (
                    <div className="flex flex-col gap-1 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-white/30 w-[14px] flex justify-center text-[10px]">🔄</span>
                        <span>Eng yuqori natija ({res.attempts}-urinishda ko'rsatilgan)</span>
                      </div>
                      <div className="pl-6 text-[11px] text-white/30 flex items-center gap-1">
                        Barcha natijalar: {res.allScores.join(', ')}
                      </div>
                    </div>
                  )}
                  {(!res.allScores || res.allScores.length <= 1) && res.attempts > 0 && (
                    <div className="flex items-center gap-2 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                      <span className="text-white/30 w-[14px] flex justify-center text-[10px]">🔄</span>
                      <span>1 ta urinish</span>
                    </div>
                  )}`;

code = code.replace(targetUI, newUI);

fs.writeFileSync('src/pages/student/StudentResults.tsx', code);
