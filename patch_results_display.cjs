const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

// Ensure that we compare using `testId: exam.testId || exam.id`. 
// For homework, we pass testId: lesson.homeworkTestId. So result.testId should equal lesson.homeworkTestId.
// We also need to make sure the student result matching checks `total` and `score` correctly.

const regexMatch = /const result = results\.find\(r => r\.testId === lesson\.homeworkTestId\);/;
// Actually, earlier we wrote logic:
// const result = results.find(r => r.testId === lesson.homeworkTestId);
// <span className="text-2xl font-black">{result.score}</span>
// <span className="text-sm font-bold opacity-70 mb-1">/{result.totalQuestions}</span>

// Let's fix totalQuestions to total based on the fields from exam_results
code = code.replace(/result\.totalQuestions/g, "result.total");
fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
