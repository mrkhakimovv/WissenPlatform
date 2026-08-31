const fs = require('fs');

function patch() {
  let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');
  
  code = code.replace(
    /onClick=\{\(\) => setCurrentQuestion\(idx\)\}/g,
    "onClick={() => document.getElementById(`question-${idx}`)?.scrollIntoView({ behavior: 'smooth' })}"
  );
  
  fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
}
patch();
