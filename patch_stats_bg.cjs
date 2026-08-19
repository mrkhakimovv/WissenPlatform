const fs = require('fs');
let code = fs.readFileSync('src/components/ExamStatsModal.tsx', 'utf-8');

const targetStr = `<div key={r.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 md:items-center">`;
const newStr = `<div key={r.id} className={\`p-4 rounded-xl border flex flex-col md:flex-row gap-4 md:items-center \${wrongAnswers.length > 0 ? 'bg-red-500/5 border-red-500/10' : 'bg-white/5 border-white/5'}\`}>`;

code = code.replaceAll(targetStr, newStr);

fs.writeFileSync('src/components/ExamStatsModal.tsx', code);
