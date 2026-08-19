const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

// The string we want to replace
const badStr = `if (v !== undefined) cleanAnswers[String(k)] = v;`;
let index = code.indexOf(badStr);
let count = 0;

while (index !== -1) {
  // Is this the correct one inside Object.entries?
  // Let's check 50 chars before.
  const before = code.substring(index - 50, index);
  if (!before.includes('Object.entries(answers).forEach')) {
    // Replace this one with '}'
    code = code.substring(0, index) + '}' + code.substring(index + badStr.length);
  }
  
  // Find next
  index = code.indexOf(badStr, index + 1);
}

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
