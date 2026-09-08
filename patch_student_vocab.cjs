const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

const oldVocabLogic = `            const hasVocab = !!lesson.vocabulary;`;
const newVocabLogic = `            const hasVocab = !!(lesson.vocabularyEng || lesson.vocabularyUz);`;
code = code.replace(oldVocabLogic, newVocabLogic);

const oldStudentVocabDisplay = `                  {hasVocab && (
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 mt-2">
                      <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Lug'atlar</p>
                      <p className="text-white/80 text-sm whitespace-pre-wrap">{lesson.vocabulary}</p>
                    </div>
                  )}`;

const newStudentVocabDisplay = `                  {hasVocab && (
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 mt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] uppercase text-[#FEC204] font-bold mb-2">Inglizcha</p>
                          <p className="text-white/80 text-sm whitespace-pre-wrap font-medium">{lesson.vocabularyEng}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-white/40 font-bold mb-2">O'zbekcha</p>
                          <p className="text-white/80 text-sm whitespace-pre-wrap">{lesson.vocabularyUz}</p>
                        </div>
                      </div>
                    </div>
                  )}`;

code = code.replace(oldStudentVocabDisplay, newStudentVocabDisplay);
fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
