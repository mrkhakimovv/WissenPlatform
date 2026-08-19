const fs = require('fs');
let code = fs.readFileSync('src/components/ExamStatsModal.tsx', 'utf-8');

const targetStr = `  const getWrongAnswers = (result: any) => {
    if (!testData || !result.answers) return [];
    const wrong: number[] = [];
    testData.questions.forEach((q, idx) => {
      const ans = result.answers[idx];
      if (q.isOpenEnded) {
        // A bit tricky without answersEqual, just string matching for basic UI
        if (String(ans).trim() !== String(q.correctAnswerText).trim()) {
          wrong.push(idx + 1);
        }
      } else {
        if (ans !== q.correctOptionIndex) {
          wrong.push(idx + 1);
        }
      }
    });
    return wrong;
  };`;

const newStr = `  const getWrongAnswers = (result: any) => {
    // Agar resultda to'g'ridan-to'g'ri wrongAnswers saqlangan bo'lsa (yangi versiya)
    if (result.wrongAnswers && Array.isArray(result.wrongAnswers)) {
      return result.wrongAnswers.map((w: any) => w.questionIndex);
    }
    // Eski versiya
    if (!testData || !result.answers) return [];
    const wrong: number[] = [];
    testData.questions.forEach((q: any, idx: number) => {
      const ans = result.answers[idx];
      if (q.isOpenEnded) {
        if (String(ans).trim() !== String(q.correctAnswerText).trim()) {
          wrong.push(idx + 1);
        }
      } else {
        if (ans !== q.correctOptionIndex) {
          wrong.push(idx + 1);
        }
      }
    });
    return wrong;
  };`;

code = code.replace(targetStr, newStr);

// Let's rearrange the flex layout so the score is on the right, but wrong answers is in the middle
const flexTarget = `                        <div key={r.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 justify-between">
                          <div>
                            <div className="font-bold text-white text-[15px]">{r.studentName}</div>
                            <div className="text-xs text-white/40 mt-1 flex items-center gap-3">
                              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(r.submittedAt).toLocaleString('uz-UZ')}</span>
                              <span>Vaqt: {formatTime(r.timeSpent)}</span>
                              <span>Urinishlar: {r.attempts || 1} marta</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-[20px] font-black text-[#FEC204]">{r.score}/{r.total}</div>
                              <div className="text-[10px] text-white/40 uppercase tracking-wider">To'g'ri javoblar</div>
                            </div>
                          </div>
                          {wrongAnswers.length > 0 && (
                            <div className="w-full md:w-auto flex-shrink-0 md:max-w-[200px]">
                              <div className="text-[10px] text-red-400 mb-1 font-bold">Xato qilingan savollar:</div>
                              <div className="flex flex-wrap gap-1">
                                {wrongAnswers.map(w => (
                                  <span key={w} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded">{w}-savol</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>`;

const flexNew = `                        <div key={r.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 md:items-center">
                          <div className="flex-1">
                            <div className="font-bold text-white text-[15px]">{r.studentName}</div>
                            <div className="text-xs text-white/40 mt-1 flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(r.submittedAt).toLocaleString('uz-UZ')}</span>
                              <span>Vaqt: {formatTime(r.timeSpent)}</span>
                              <span>Urinishlar: {r.attempts || 1} marta</span>
                            </div>
                          </div>
                          
                          {wrongAnswers.length > 0 ? (
                            <div className="w-full md:w-auto flex-1 md:max-w-[250px]">
                              <div className="text-[10px] text-red-400 mb-1 font-bold">Xato qilingan savollar:</div>
                              <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto custom-scrollbar">
                                {wrongAnswers.map((w: any) => (
                                  <span key={w} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded border border-red-500/20">{w}</span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="w-full md:w-auto flex-1 md:max-w-[250px]"></div>
                          )}

                          <div className="text-right flex-shrink-0">
                            <div className="text-[20px] font-black text-[#FEC204]">{r.score}/{r.total}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-wider">To'g'ri javoblar</div>
                          </div>
                        </div>`;
                        
code = code.replace(flexTarget, flexNew);
fs.writeFileSync('src/components/ExamStatsModal.tsx', code);
