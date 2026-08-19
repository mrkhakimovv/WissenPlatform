const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

// Fix 1: First onClick block
code = code.replace(/onClick=\{\(\) => \{\s*if \(Object\.keys\(answers\)\.length < testData\.questions\.length\) \{\s*setShowSubmitConfirm\(true\);\s*\}\} else \{\s*handleSubmit\(\);\s*\}\s*\}\}/g, `onClick={() => {
                  if (Object.keys(answers).length < testData.questions.length) {
                    setShowSubmitConfirm(true);
                  } else {
                    handleSubmit();
                  }
                }}`);

// Fix 2: Second onClick block
code = code.replace(/onClick=\{\(\) => \{\s*if \(Object\.keys\(answers\)\.length < testData\.questions\.length\) \{\s*setShowSubmitConfirm\(true\);\s*\}\} else \{\s*handleSubmit\(\);\s*\}\}\s*\}\}/g, `onClick={() => {
                if (Object.keys(answers).length < testData.questions.length) {
                  setShowSubmitConfirm(true);
                } else {
                  handleSubmit();
                }
              }}`);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
