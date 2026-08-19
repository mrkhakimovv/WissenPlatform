const fs = require('fs');
let code = fs.readFileSync('src/components/ExamStatsModal.tsx', 'utf-8');

const targetGrouping = `        // Group by studentId and keep the best score (or latest if score is same)
        const groupedResults = new Map();
        rData.forEach(r => {
          if (!groupedResults.has(r.studentId)) {
            groupedResults.set(r.studentId, r);
          } else {
            const existing = groupedResults.get(r.studentId);
            const currentPercent = existing.total > 0 ? existing.score / existing.total : 0;
            const newPercent = r.total > 0 ? r.score / r.total : 0;
            if (newPercent > currentPercent || (newPercent === currentPercent && new Date(r.submittedAt).getTime() > new Date(existing.submittedAt).getTime())) {
              r.attempts = Math.max(r.attempts || 1, existing.attempts || 1); // Keep max attempts count
              groupedResults.set(r.studentId, r);
            } else {
              existing.attempts = Math.max(r.attempts || 1, existing.attempts || 1);
            }
          }
        });
        
        setResults(Array.from(groupedResults.values()).sort((a, b) => b.score - a.score));`;

const newGrouping = `        // Group by studentId and keep the best score, but also save all attempts info
        const groupedResults = new Map();
        rData.forEach(r => {
          if (!groupedResults.has(r.studentId)) {
            groupedResults.set(r.studentId, { ...r, allAttemptsDetails: [r] });
          } else {
            const existing = groupedResults.get(r.studentId);
            const currentPercent = existing.total > 0 ? existing.score / existing.total : 0;
            const newPercent = r.total > 0 ? r.score / r.total : 0;
            
            existing.allAttemptsDetails.push(r);
            
            if (newPercent > currentPercent || (newPercent === currentPercent && new Date(r.submittedAt).getTime() > new Date(existing.submittedAt).getTime())) {
              r.attempts = Math.max(r.attempts || 1, existing.attempts || 1);
              r.allAttemptsDetails = existing.allAttemptsDetails;
              groupedResults.set(r.studentId, r);
            } else {
              existing.attempts = Math.max(r.attempts || 1, existing.attempts || 1);
            }
          }
        });
        
        setResults(Array.from(groupedResults.values()).sort((a, b) => b.score - a.score));`;

code = code.replace(targetGrouping, newGrouping);

const targetUI = `                            <div className="text-xs text-white/40 mt-1 flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(r.submittedAt).toLocaleString('uz-UZ')}</span>
                              <span>Vaqt: {formatTime(r.timeSpent)}</span>
                              {r.attempts > 1 ? (
                                <span>Eng yuqori natija ({r.attempts} ta urinishdan)</span>
                              ) : (
                                <span>1 ta urinish</span>
                              )}
                            </div>
                          </div>`;

const newUI = `                            <div className="text-xs text-white/40 mt-1 flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(r.submittedAt).toLocaleString('uz-UZ')}</span>
                              <span>Vaqt: {formatTime(r.timeSpent)}</span>
                              {r.attempts > 1 ? (
                                <span>Eng yuqori natija ({r.attempts} ta urinishdan)</span>
                              ) : (
                                <span>1 ta urinish</span>
                              )}
                            </div>
                            
                            {r.allAttemptsDetails && r.allAttemptsDetails.length > 1 && (
                               <div className="mt-2 flex flex-col gap-1">
                                 <div className="text-[10px] uppercase font-bold text-white/30">Barcha urinishlar tarixi:</div>
                                 <div className="flex flex-col gap-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                                   {r.allAttemptsDetails
                                     .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                                     .map((att: any, idx: number) => (
                                     <div key={idx} className="flex items-center gap-3 text-[11px] text-white/40 bg-[#0d0d0d] p-1.5 rounded">
                                       <span className="font-bold text-white/60">{att.score}/{att.total}</span>
                                       <span className="flex items-center gap-1"><Clock size={10}/> {new Date(att.submittedAt).toLocaleString('uz-UZ')}</span>
                                       <span>Vaqt: {formatTime(att.timeSpent)}</span>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                            )}
                          </div>`;

code = code.replace(targetUI, newUI);

fs.writeFileSync('src/components/ExamStatsModal.tsx', code);
