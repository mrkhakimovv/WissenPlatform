const fs = require('fs');
let code = fs.readFileSync('src/components/ExamStatsModal.tsx', 'utf-8');

const targetUI = `                              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(r.submittedAt).toLocaleString('uz-UZ')}</span>
                              <span>Vaqt: {formatTime(r.timeSpent)}</span>
                              <span>Eng yuqori natija ({r.attempts || 1} ta urinishdan)</span>
                            </div>`;

const newUI = `                              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(r.submittedAt).toLocaleString('uz-UZ')}</span>
                              <span>Vaqt: {formatTime(r.timeSpent)}</span>
                              {r.attempts > 1 ? (
                                <span>Eng yuqori natija ({r.attempts} ta urinishdan)</span>
                              ) : (
                                <span>1 ta urinish</span>
                              )}
                            </div>`;

code = code.replace(targetUI, newUI);
fs.writeFileSync('src/components/ExamStatsModal.tsx', code);
