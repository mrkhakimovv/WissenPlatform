const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

// add allResultsList state
code = code.replace(
  "const [wrongAnswersList, setWrongAnswersList] = useState<any[]>([]);",
  "const [wrongAnswersList, setWrongAnswersList] = useState<any[]>([]);\n  const [allResultsList, setAllResultsList] = useState<any[]>([]);"
);

// update handleSubmit
const targetLoop = `    const wrongAnswersData = [];
    for (let idx = 0; idx < testData.questions.length; idx++) {
      const q = testData.questions[idx];
      const ans = answers[idx];
      let isCorrect = false;
      if (q.isOpenEnded) {
        if (ans && q.correctAnswerText && await answersEqual(String(ans), String(q.correctAnswerText))) {
          isCorrect = true;
        }
      } else {
        if (ans === q.correctOptionIndex) {
          isCorrect = true;
        }
      }
      
      if (isCorrect) {
        s += 1;
      } else {
        wrongAnswersData.push({
          questionIndex: idx + 1,
          studentAnswer: ans,
          correctAnswer: q.isOpenEnded ? q.correctAnswerText : q.correctOptionIndex,
          isOpenEnded: q.isOpenEnded,
          options: q.options || []
        });
      }
    }
    setScore(s);
    setWrongAnswersList(wrongAnswersData);`;

const newLoop = `    const wrongAnswersData = [];
    const allAnswersData = [];
    for (let idx = 0; idx < testData.questions.length; idx++) {
      const q = testData.questions[idx];
      const ans = answers[idx];
      let isCorrect = false;
      if (q.isOpenEnded) {
        if (ans && q.correctAnswerText && await answersEqual(String(ans), String(q.correctAnswerText))) {
          isCorrect = true;
        }
      } else {
        if (ans === q.correctOptionIndex) {
          isCorrect = true;
        }
      }
      
      allAnswersData.push({
        questionIndex: idx + 1,
        isCorrect,
        studentAnswer: ans,
        correctAnswer: q.isOpenEnded ? q.correctAnswerText : q.correctOptionIndex,
        isOpenEnded: q.isOpenEnded,
        options: q.options || []
      });
      
      if (isCorrect) {
        s += 1;
      } else {
        wrongAnswersData.push({
          questionIndex: idx + 1,
          studentAnswer: ans,
          correctAnswer: q.isOpenEnded ? q.correctAnswerText : q.correctOptionIndex,
          isOpenEnded: q.isOpenEnded,
          options: q.options || []
        });
      }
    }
    setScore(s);
    setWrongAnswersList(wrongAnswersData);
    setAllResultsList(allAnswersData);`;

code = code.replace(targetLoop, newLoop);

// UI Update
const targetUI = `{wrongAnswersList.length > 0 && (
            <div className="w-full text-left bg-[#1a1a1a] rounded-[16px] mb-6 overflow-hidden">
              <h3 className="px-4 py-3 border-b border-white/10 text-sm font-bold text-white">Xato qilingan savollar</h3>
              <div className="max-h-[30vh] overflow-y-auto custom-scrollbar p-2">
                {wrongAnswersList.map((w, i) => (
                  <div key={i} className="mb-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <div className="font-bold text-white mb-2 text-sm">{w.questionIndex}-savol</div>
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      <div className="p-2 bg-[#1a1a1a] rounded-lg">
                        <div className="text-white/40 mb-1">Sizning javobingiz:</div>
                        <div className="text-red-400 font-medium break-all">
                          {w.studentAnswer === undefined ? 'Belgilanmagan' : (w.isOpenEnded ? w.studentAnswer : (w.options[w.studentAnswer] || ['A','B','C','D'][w.studentAnswer]))}
                        </div>
                      </div>
                      <div className="p-2 bg-[#1a1a1a] rounded-lg">
                        <div className="text-white/40 mb-1">To'g'ri javob:</div>
                        <div className="text-green-400 font-medium break-all">
                          {w.isOpenEnded ? w.correctAnswer : (w.options[w.correctAnswer] || ['A','B','C','D'][w.correctAnswer])}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}`;

const newUI = `          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {allResultsList.map((r, i) => (
              <div key={i} title={\`\${r.questionIndex}-savol\`} className={\`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold \${r.isCorrect ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}\`}>
                {r.questionIndex}
              </div>
            ))}
          </div>

          <div className="w-full text-left bg-[#1a1a1a] rounded-[16px] mb-6 overflow-hidden">
            <h3 className="px-4 py-3 border-b border-white/10 text-sm font-bold text-white">To'g'ri javoblar kaliti va tahlil</h3>
            <div className="max-h-[35vh] overflow-y-auto custom-scrollbar p-2">
              {allResultsList.map((w, i) => (
                <div key={i} className={\`mb-2 p-3 border rounded-xl \${w.isCorrect ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}\`}>
                  <div className="font-bold text-white mb-2 text-sm flex items-center gap-2">
                    {w.questionIndex}-savol 
                    {w.isCorrect ? <span className="text-green-500 text-xs">(To'g'ri)</span> : <span className="text-red-500 text-xs">(Xato)</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="p-2 bg-[#0d0d0d] rounded-lg">
                      <div className="text-white/40 mb-1">Sizning javobingiz:</div>
                      <div className={\`font-medium break-all \${w.isCorrect ? 'text-green-400' : 'text-red-400'}\`}>
                        {w.studentAnswer === undefined ? 'Belgilanmagan' : (w.isOpenEnded ? w.studentAnswer : (w.options[w.studentAnswer] || ['A','B','C','D'][w.studentAnswer]))}
                      </div>
                    </div>
                    <div className="p-2 bg-[#0d0d0d] rounded-lg">
                      <div className="text-white/40 mb-1">To'g'ri javob kaliti:</div>
                      <div className="text-green-400 font-medium break-all">
                        {w.isOpenEnded ? w.correctAnswer : (w.options[w.correctAnswer] || ['A','B','C','D'][w.correctAnswer])}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>`;

code = code.replace(targetUI, newUI);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
