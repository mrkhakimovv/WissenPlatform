const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const regex = /onClick=\{\(\) => \{\s*if \(Object\.keys\(answers\)\.length < testData\.questions\.length\) \{\s*setShowSubmitConfirm\(true\);\s*if \(v !== undefined\) cleanAnswers\[String\(k\)\] = v; else \{\s*handleSubmit\(\);\s*if \(v !== undefined\) cleanAnswers\[String\(k\)\] = v;\s*if \(v !== undefined\) cleanAnswers\[String\(k\)\] = v;\}/g;

code = code.replace(regex, `onClick={() => {
                  if (Object.keys(answers).length < testData.questions.length) {
                    setShowSubmitConfirm(true);
                  } else {
                    handleSubmit();
                  }
                }`);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
