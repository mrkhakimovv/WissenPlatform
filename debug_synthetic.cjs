function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randn(rng) {
  let u = 0; let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function skewNormalStd(rng, alpha) {
  const u0 = randn(rng);
  const u1 = randn(rng);
  const delta = alpha / Math.sqrt(1 + alpha * alpha);
  const z = delta * Math.abs(u0) + Math.sqrt(1 - delta * delta) * u1;
  const mean = delta * Math.sqrt(2 / Math.PI);
  const sd = Math.sqrt(1 - (2 * delta * delta) / Math.PI);
  return (z - mean) / sd;
}

const N = 1;
const M = 55;
const items = Array(M).fill(1).map((_, i) => i % 2 === 0 ? 0 : 1);
const b = [];
for (let j = 0; j < M; j++) {
    let c = items[j];
    let p = c / N;
    if (p <= 0 || p >= 1) p = (c + 0.5) / (N + 1); // continuity correction
    b.push(-Math.log(p / (1 - p)));
}

const count = 10000;
const rng = mulberry32(123);
const synthetic = [];
for (let i = 0; i < count; i++) {
    const theta = skewNormalStd(rng, 2) * 1.4;
    const sItems = [];
    for (let j = 0; j < M; j++) {
      const p = 1 / (1 + Math.exp(-(theta - b[j])));
      sItems.push(rng() < p ? 1 : 0);
    }
    synthetic.push(sItems);
}

const itemDifficultyPct = [];
for (let j = 0; j < M; j++) {
    let c = items[j];
    for (let i = 0; i < count; i++) c += synthetic[i][j];
    itemDifficultyPct.push(((count + 1 - c) / (count + 1)) * 100);
}

console.log("Difficulties:", b.slice(0, 5));
console.log("Synthetic Item Diff Pct:", itemDifficultyPct.slice(0, 5));
