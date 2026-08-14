import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentResults.tsx', 'utf8');

const regex = /resData\.sort\(\(a, b\) => new Date\(b\.submittedAt\)\.getTime\(\) - new Date\(a\.submittedAt\)\.getTime\(\)\);\s*setResults\(resData\);/;

const replacement = `
        const grouped = new Map();
        resData.forEach(res => {
          if (!grouped.has(res.examId)) {
            grouped.set(res.examId, res);
          } else {
            const currentBest = grouped.get(res.examId);
            const currentPercent = currentBest.total > 0 ? currentBest.score / currentBest.total : 0;
            const newPercent = res.total > 0 ? res.score / res.total : 0;
            if (newPercent > currentPercent || (newPercent === currentPercent && new Date(res.submittedAt).getTime() > new Date(currentBest.submittedAt).getTime())) {
               grouped.set(res.examId, res);
            }
          }
        });
        const bestResults = Array.from(grouped.values());
        bestResults.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setResults(bestResults);
`;

code = code.replace(regex, replacement.trim());

fs.writeFileSync('src/pages/student/StudentResults.tsx', code);
