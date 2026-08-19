const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

// There might be a case where `options` does not exist or has `undefined` elements.
// Ensure q.options doesn't contain undefined. But let's check cleanAnswers as well.
const targetCleanAnswers = `      const cleanAnswers: Record<string, any> = {};
      Object.entries(answers).forEach(([k, v]) => {
        if (v !== undefined) cleanAnswers[String(k)] = v;
      });`;

const newCleanAnswers = `      const cleanAnswers: Record<string, any> = {};
      Object.entries(answers).forEach(([k, v]) => {
        if (v !== undefined) cleanAnswers[String(k)] = v;
        else cleanAnswers[String(k)] = null;
      });`;
code = code.replace(targetCleanAnswers, newCleanAnswers);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
