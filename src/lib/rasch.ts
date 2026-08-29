export interface RaschResult {
  studentId: string;
  studentName: string;
  correct: number;
  theta: number;
  ball: number;
  grade: string;
  synthetic?: boolean;   // sintetik (tayanch) o'quvchimi
  rank?: number;         // butun (real+sintetik) guruh ichidagi o'rin
  percentile?: number;   // butun guruh bo'yicha foizli o'rni
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
  referenceN?: number;         // qo'shilgan sintetik (tayanch) o'quvchilar soni
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
 * Real + sintetik o'quvchilarni BITTA Rasch hisobiga qo'shadi.
 *
 * Real o'quvchilar katta, barqaror guruh (real + sintetik) ichida baholanadi —
 * shunda natija topshirgan real o'quvchilar soniga (masalan 50) emas, haqiqiy
 * imtihon xarakteriga bog'liq bo'ladi. Ball/daraja butun guruhga nisbatan
 * hisoblanadi, lekin QAYTARILADIGAN natijalar faqat REAL o'quvchilar (sintetik
 * 10 000 tasi bazaga saqlanmaydi). Savol qiyinligi (%) real o'quvchilar bo'yicha.
 */
export function computeRaschWithReference(
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
  
  finalResults.sort((a, b) => b.ball - a.ball);

  // Savol qiyinligi (%) — KOMBINATSIYALANGAN (real + sintetik) o'quvchilar bo'yicha
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
  const correctsR = allResults.map(r => r.correct);

  const stats: RaschFullStats = {
    n: real.length,
    referenceN: synthetic.length,
    numItems,
    mu: base.mu,
    sigma: base.sigma,
    minTheta: thetasR.length ? Math.min(...thetasR) : 0,
    maxTheta: thetasR.length ? Math.max(...thetasR) : 0,
    meanBall: _mean(ballsR),
    meanCorrect: _mean(correctsR),
    testDifficulty: _mean(itemDifficultyPct),
    minItemDifficulty: itemDifficultyPct.length ? Math.min(...itemDifficultyPct) : 0,
    maxItemDifficulty: itemDifficultyPct.length ? Math.max(...itemDifficultyPct) : 0,
    meanLogit: _mean(base.itemDifficulties),
    sigmaLogit: _sd(base.itemDifficulties),
    itemDifficultyPct,
    itemLogit: base.itemDifficulties,
  };

  return { results: finalResults, stats };
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

  // 7 & 8. Ball and Grade — daraja YAXLITLANMAGAN (qirqib olingan) balldan hisoblanadi
  const results = thetas.map(s => {
    const Z_i = sigma === 0 ? 0 : (s.theta - mu) / sigma;
    const rawBall = 50 + 10 * Z_i;

    const ball = Math.floor(rawBall * 10) / 10; // ballar yaxlitlanmasligi uchun floor (masalan 45.96 => 45.9)

    let grade = 'NC';
    if (ball >= 70) grade = 'A+';
    else if (ball >= 65) grade = 'A';
    else if (ball >= 60) grade = 'B+';
    else if (ball >= 55) grade = 'B';
    else if (ball >= 50) grade = 'C+';
    else if (ball >= 46) grade = 'C';

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