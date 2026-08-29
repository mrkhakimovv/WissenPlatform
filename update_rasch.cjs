const fs = require('fs');
let code = fs.readFileSync('src/lib/rasch.ts', 'utf8');

const target = `export function computeRaschWithReference(
  real: { studentId: string; studentName: string; items: number[] }[],
  synthetic: { studentId: string; studentName: string; items: number[] }[]
): RaschReport {
  const combined = [...real, ...synthetic];
  const { results: allResults, stats: base } = calculateRasch(combined); // ball bo'yicha kamayish tartibida
  const total = allResults.length;

  const rankById = new Map<string, number>();
  allResults.forEach((r, i) => rankById.set(r.studentId, i + 1));
  const byId = new Map(allResults.map(r => [r.studentId, r]));

  // Faqat real o'quvchilar natijasi (butun guruhga nisbatan ball/daraja/o'rin)
  const realResults: RaschResult[] = real
    .map(r => {
      const cr = byId.get(r.studentId)!;
      const rank = rankById.get(r.studentId) ?? total;
      const percentile = total > 0 ? Math.round(((total - rank) / total) * 100) : 0;
      return {
        studentId: cr.studentId,
        studentName: cr.studentName,
        correct: cr.correct,
        theta: cr.theta,
        ball: cr.ball,
        grade: cr.grade,
        rank,
        percentile,
      } as RaschResult;
    })
    .sort((a, b) => b.ball - a.ball);`;

const replacement = `export function computeRaschWithReference(
  real: { studentId: string; studentName: string; items: number[] }[],
  synthetic: { studentId: string; studentName: string; items: number[] }[],
  returnSynthetic: boolean = false
): RaschReport {
  const combined = [...real, ...synthetic];
  const { results: allResults, stats: base } = calculateRasch(combined); // ball bo'yicha kamayish tartibida
  const total = allResults.length;

  const rankById = new Map<string, number>();
  allResults.forEach((r, i) => rankById.set(r.studentId, i + 1));
  const byId = new Map(allResults.map(r => [r.studentId, r]));

  // Faqat real o'quvchilar natijasi (butun guruhga nisbatan ball/daraja/o'rin)
  const realResults: RaschResult[] = real
    .map(r => {
      const cr = byId.get(r.studentId)!;
      const rank = rankById.get(r.studentId) ?? total;
      const percentile = total > 0 ? Math.round(((total - rank) / total) * 100) : 0;
      return {
        studentId: cr.studentId,
        studentName: cr.studentName,
        correct: cr.correct,
        theta: cr.theta,
        ball: cr.ball,
        grade: cr.grade,
        rank,
        percentile,
      } as RaschResult;
    });
    
  let finalResults = realResults;
  
  if (returnSynthetic) {
    const syntheticResults: RaschResult[] = synthetic.map(r => {
      const cr = byId.get(r.studentId)!;
      const rank = rankById.get(r.studentId) ?? total;
      const percentile = total > 0 ? Math.round(((total - rank) / total) * 100) : 0;
      return {
        studentId: cr.studentId,
        studentName: cr.studentName,
        correct: cr.correct,
        theta: cr.theta,
        ball: cr.ball,
        grade: cr.grade,
        rank,
        percentile,
        synthetic: true
      } as RaschResult;
    });
    finalResults = [...realResults, ...syntheticResults];
  }
  
  finalResults.sort((a, b) => b.ball - a.ball);`;

code = code.replace(target, replacement);

const targetReturn = `return { results: realResults, stats };`;
code = code.replace(targetReturn, `return { results: finalResults, stats };`);

fs.writeFileSync('src/lib/rasch.ts', code);
console.log("Updated rasch.ts");
