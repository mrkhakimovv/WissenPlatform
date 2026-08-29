function run() {
  const M = 55;
  const items = Array(M).fill(0).map((_, i) => i % 2 === 0 ? 1 : 0);
  const matrix = [{ studentId: 'real', studentName: 'real', items }];

  function itemDifficultiesFromMatrix(mat) {
    const N = mat.length;
    const b = [];
    for (let j = 0; j < M; j++) {
      let c = 0;
      for (let i = 0; i < N; i++) c += mat[i].items[j] ? 1 : 0;
      let p = c / N;
      if (p <= 0 || p >= 1) p = (c + 0.5) / (N + 1);
      b.push(-Math.log(p / (1 - p)));
    }
    return b;
  }

  const b = itemDifficultiesFromMatrix(matrix);

  function generateSynthetic(bArray, count) {
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

    const rng = mulberry32(123);
    const synth = [];
    for (let i = 0; i < count; i++) {
      const theta = skewNormalStd(rng, 2) * 1.4;
      const sItems = [];
      for (let j = 0; j < M; j++) {
        const p = 1 / (1 + Math.exp(-(theta - bArray[j])));
        sItems.push(rng() < p ? 1 : 0);
      }
      synth.push({ studentId: `s_${i}`, items: sItems });
    }
    return synth;
  }

  const synth = generateSynthetic(b, 100);
  const combined = [...matrix, ...synth];
  
  const N_comb = combined.length;
  const itemDifficultyPct = [];
  for (let j = 0; j < M; j++) {
    let c = 0;
    for (let i = 0; i < N_comb; i++) c += combined[i].items[j] ? 1 : 0;
    itemDifficultyPct.push(((N_comb - c) / N_comb) * 100);
  }

  console.log("Real item 0:", matrix[0].items[0], "Pct 0:", itemDifficultyPct[0]);
  console.log("Real item 1:", matrix[0].items[1], "Pct 1:", itemDifficultyPct[1]);
}
run();
