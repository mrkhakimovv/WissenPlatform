export interface RaschResult {
  studentId: string;
  studentName: string;
  correct: number;
  theta: number;
  ball: number;
  grade: string;
}

export interface RaschStats {
  n: number;
  mu: number;
  sigma: number;
  itemDifficulties: number[];
}

/** To'liq statistik hisobot (admin yakunlaganda muzlatiladi). */
export interface RaschFullStats {
  n: number;                 // ishtirokchilar
  numItems: number;          // savol/birliklar (55)
  mu: number;                // o'rtacha qobiliyat (θ)
  sigma: number;             // qobiliyat sigmasi
  minTheta: number;          // minimal qobiliyat
  maxTheta: number;          // maksimal qobiliyat
  meanBall: number;          // o'rtacha ball (norma-referensda ~50)
  meanCorrect: number;       // o'rtacha to'g'ri javob soni
  testDifficulty: number;    // testning qiyinchiligi (% — o'rtacha xato ulushi)
  minItemDifficulty: number; // eng oson savol qiyinchiligi (%)
  maxItemDifficulty: number; // eng qiyin savol qiyinchiligi (%)
  meanLogit: number;         // o'rtacha logit qiyinchilik (b_j)
  sigmaLogit: number;        // logit qiyinchilik sigmasi
  itemDifficultyPct: number[]; // har savol qiyinchiligi (% xato)
  itemLogit: number[];         // har savol logit qiyinligi (b_j)
}

export interface RaschReport {
  results: RaschResult[];
  stats: RaschFullStats;
}

const _mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const _sd = (a: number[]) => {
  if (a.length < 2) return 0;
  const m = _mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / (a.length - 1));
};

/**
 * To'liq Rasch hisoboti: har o'quvchi natijasi + guruh statistikasi.
 * Savol qiyinchiligi (%) = shu savolga XATO javob berganlar ulushi.
 * Bu obyekt admin imtihonni yakunlaganda Firestore'ga saqlanadi (muzlatiladi),
 * shunda har bir o'quvchi keyin barqaror natijani ko'radi.
 */
export function computeRaschReport(
  matrix: { studentId: string; studentName: string; items: number[] }[]
): RaschReport {
  const { results, stats } = calculateRasch(matrix);
  const N = matrix.length;
  const numItems = N > 0 ? matrix[0].items.length : 0;

  // Har savol uchun xato javob ulushi (%)
  const itemDifficultyPct: number[] = [];
  for (let j = 0; j < numItems; j++) {
    let correct = 0;
    for (let i = 0; i < N; i++) correct += matrix[i].items[j] ? 1 : 0;
    itemDifficultyPct.push(N > 0 ? ((N - correct) / N) * 100 : 0);
  }

  const thetas = results.map(r => r.theta);
  const balls = results.map(r => r.ball);
  const corrects = results.map(r => r.correct);
  const itemLogit = stats.itemDifficulties;

  const full: RaschFullStats = {
    n: N,
    numItems,
    mu: stats.mu,
    sigma: stats.sigma,
    minTheta: thetas.length ? Math.min(...thetas) : 0,
    maxTheta: thetas.length ? Math.max(...thetas) : 0,
    meanBall: _mean(balls),
    meanCorrect: _mean(corrects),
    testDifficulty: _mean(itemDifficultyPct),
    minItemDifficulty: itemDifficultyPct.length ? Math.min(...itemDifficultyPct) : 0,
    maxItemDifficulty: itemDifficultyPct.length ? Math.max(...itemDifficultyPct) : 0,
    meanLogit: _mean(itemLogit),
    sigmaLogit: _sd(itemLogit),
    itemDifficultyPct,
    itemLogit,
  };

  return { results, stats: full };
}

/**
 * `exam_results` hujjatlaridan har o'quvchining ENG YAXSHI urinishini tanlaydi.
 * Ko'p urinish bo'lsa: yuqori ball, teng bo'lsa oxirgi topshirilgan olinadi.
 */
export function dedupeBestAttempts(results: any[]): any[] {
  const best = new Map<string, any>();
  for (const r of results) {
    const sid = r.studentId;
    if (!sid) continue;
    const prev = best.get(sid);
    if (!prev) { best.set(sid, r); continue; }
    const rScore = typeof r.score === 'number' ? r.score : -1;
    const pScore = typeof prev.score === 'number' ? prev.score : -1;
    const rTime = new Date(r.submittedAt || 0).getTime();
    const pTime = new Date(prev.submittedAt || 0).getTime();
    if (rScore > pScore || (rScore === pScore && rTime > pTime)) {
      best.set(sid, r);
    }
  }
  return Array.from(best.values());
}

export function calculateRasch(matrix: { studentId: string, studentName: string, items: number[] }[]): { results: RaschResult[], stats: RaschStats } {
  if (matrix.length === 0) return { results: [], stats: { n: 0, mu: 0, sigma: 0, itemDifficulties: [] } };

  const N = matrix.length;
  const numItems = matrix[0].items.length; // expects 55

  // 1. Calculate p_j and item difficulty b_j
  const p = new Array(numItems).fill(0);
  for (let j = 0; j < numItems; j++) {
    let correctCount = 0;
    for (let i = 0; i < N; i++) {
      correctCount += matrix[i].items[j];
    }
    let p_j = correctCount / N;
    // Continuity correction
    if (p_j === 0 || p_j === 1) {
      p_j = (correctCount + 0.5) / (N + 1);
    }
    p[j] = p_j;
  }

  const b = p.map(pj => -Math.log(pj / (1 - pj)));
  const min_b = Math.min(...b);

  // 3. Positive weight w_j
  const w = b.map(bj => bj - min_b + 1);
  const W = w.reduce((sum, val) => sum + val, 0);

  // 4 & 5. Weighted score and ability theta
  const thetas = matrix.map(student => {
    let C_i = 0;
    let correctCount = 0;
    for (let j = 0; j < numItems; j++) {
      C_i += student.items[j] * w[j];
      correctCount += student.items[j];
    }
    // Clamp if C_i is 0 or W to avoid infinity
    if (C_i <= 0) C_i = 0.5;
    if (C_i >= W) C_i = W - 0.5;

    let theta_i = Math.log(C_i / (W - C_i));
    return { ...student, correct: correctCount, theta: theta_i };
  });

  // 6. Standardize
  let sumTheta = 0;
  for (let s of thetas) sumTheta += s.theta;
  const mu = sumTheta / N;

  let sumSq = 0;
  for (let s of thetas) sumSq += Math.pow(s.theta - mu, 2);
  const sigma = N > 1 ? Math.sqrt(sumSq / (N - 1)) : 1;

  // 7 & 8. Ball and Grade — daraja YAXLITLANMAGAN balldan hisoblanadi
  const results = thetas.map(s => {
    const Z_i = sigma === 0 ? 0 : (s.theta - mu) / sigma;
    const rawBall = 50 + 10 * Z_i;

    let grade = 'NC';
    if (rawBall >= 70) grade = 'A+';
    else if (rawBall >= 65) grade = 'A';
    else if (rawBall >= 60) grade = 'B+';
    else if (rawBall >= 55) grade = 'B';
    else if (rawBall >= 50) grade = 'C+';
    else if (rawBall >= 46) grade = 'C';

    const ball = Math.round(rawBall * 10) / 10; // ko'rsatish uchun 1 xona

    return {
      studentId: s.studentId,
      studentName: s.studentName,
      correct: s.correct,
      theta: s.theta,
      ball,
      grade
    };
  });

  return {
    results: results.sort((a, b) => b.ball - a.ball),
    stats: { n: N, mu, sigma, itemDifficulties: b }
  };
}