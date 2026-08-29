import { generateSyntheticMatrix, itemDifficultiesFromMatrix } from './src/lib/synthetic';
import { computeRaschWithReference } from './src/lib/rasch';

const matrix = [
  { studentId: 'real_1', studentName: 'Real 1', items: Array(55).fill(1).map((_, i) => i % 2 === 0 ? 1 : 0) }
];

const difficulties = itemDifficultiesFromMatrix(matrix);
const synthetic = generateSyntheticMatrix(difficulties, { count: 10, seed: 123 });
const report = computeRaschWithReference(matrix, synthetic, true);

console.log("Difficulties:", difficulties.slice(0, 5));
console.log("Synthetic items[0]:", synthetic[0].items.slice(0, 5));
console.log("Item Diff Pct:", report.stats.itemDifficultyPct.slice(0, 5));

