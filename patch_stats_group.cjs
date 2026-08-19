const fs = require('fs');
let code = fs.readFileSync('src/components/ExamStatsModal.tsx', 'utf-8');

const targetStr = `        // Fetch results
        const resultsQ = query(collection(db, 'exam_results'), where('examId', '==', exam.id));
        const resDocs = await getDocs(resultsQ);
        const rData: any[] = [];
        resDocs.forEach(d => rData.push({ id: d.id, ...d.data() }));
        setResults(rData);`;

const newStr = `        // Fetch results
        const resultsQ = query(collection(db, 'exam_results'), where('examId', '==', exam.id));
        const resDocs = await getDocs(resultsQ);
        const rData: any[] = [];
        resDocs.forEach(d => rData.push({ id: d.id, ...d.data() }));
        
        // Group by studentId and keep the best score (or latest if score is same)
        const groupedResults = new Map();
        rData.forEach(r => {
          if (!groupedResults.has(r.studentId)) {
            groupedResults.set(r.studentId, r);
          } else {
            const existing = groupedResults.get(r.studentId);
            const currentPercent = existing.total > 0 ? existing.score / existing.total : 0;
            const newPercent = r.total > 0 ? r.score / r.total : 0;
            if (newPercent > currentPercent || (newPercent === currentPercent && new Date(r.submittedAt).getTime() > new Date(existing.submittedAt).getTime())) {
              r.attempts = Math.max(r.attempts || 1, existing.attempts || 1); // Keep max attempts count
              groupedResults.set(r.studentId, r);
            } else {
              existing.attempts = Math.max(r.attempts || 1, existing.attempts || 1);
            }
          }
        });
        
        setResults(Array.from(groupedResults.values()).sort((a, b) => b.score - a.score));`;

code = code.replace(targetStr, newStr);

// Now fix the UI to show max attempts correctly.
const uiTarget = `                              <span>Urinishlar: {r.attempts || 1} marta</span>`;
const uiNew = `                              <span>Eng yuqori natija ({r.attempts || 1} ta urinishdan)</span>`;
code = code.replaceAll(uiTarget, uiNew);

fs.writeFileSync('src/components/ExamStatsModal.tsx', code);
