const fs = require('fs');
let code = fs.readFileSync('src/lib/rasch.ts', 'utf8');

const targetStats = `  // Savol qiyinligi (%) — REAL o'quvchilar bo'yicha (admin uchun ma'noli)
  const N = real.length;
  const numItems = N > 0 ? real[0].items.length : 0;
  const itemDifficultyPct: number[] = [];
  for (let j = 0; j < numItems; j++) {
    let c = 0;
    for (let i = 0; i < N; i++) c += real[i].items[j] ? 1 : 0;
    itemDifficultyPct.push(N > 0 ? ((N - c) / N) * 100 : 0);
  }

  const thetasR = realResults.map(r => r.theta);
  const ballsR = realResults.map(r => r.ball);
  const correctsR = realResults.map(r => r.correct);`;

const replacementStats = `  // Savol qiyinligi (%) — KOMBINATSIYALANGAN (real + sintetik) o'quvchilar bo'yicha
  const cohortForStats = combined;
  const N = cohortForStats.length;
  const numItems = N > 0 ? cohortForStats[0].items.length : 0;
  const itemDifficultyPct: number[] = [];
  for (let j = 0; j < numItems; j++) {
    let c = 0;
    for (let i = 0; i < N; i++) c += cohortForStats[i].items[j] ? 1 : 0;
    itemDifficultyPct.push(N > 0 ? ((N - c) / N) * 100 : 0);
  }

  // Statistikani ham butun guruh (real + sintetik) bo'yicha hisoblaymiz
  const thetasR = allResults.map(r => r.theta);
  const ballsR = allResults.map(r => r.ball);
  const correctsR = allResults.map(r => r.correct);`;

if(code.includes(targetStats)) {
    code = code.replace(targetStats, replacementStats);
    fs.writeFileSync('src/lib/rasch.ts', code);
    console.log("Updated rasch.ts");
} else {
    console.log("Could not find targetStats");
}
