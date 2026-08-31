const fs = require('fs');
let code = fs.readFileSync('src/components/ExamStatsModal.tsx', 'utf-8');

code = code.replace("stData.push({ id: d.id, ...d.data() } as User)", "stData.push({ id: d.id, ...(d.data() as any) } as User)");

fs.writeFileSync('src/components/ExamStatsModal.tsx', code);
