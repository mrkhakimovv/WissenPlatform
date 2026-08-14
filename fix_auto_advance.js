import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

const oldCode = `onClick={() => {
                    setAnswers(prev => ({ ...prev, [currentQuestion]: oIdx }));
                    if (currentQuestion < testData.questions.length - 1) {
                      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
                    }
                  }}`;

const newCode = `onClick={() => {
                    setAnswers(prev => ({ ...prev, [currentQuestion]: oIdx }));
                  }}`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
  console.log("Success");
} else {
  console.log("Not found");
}
