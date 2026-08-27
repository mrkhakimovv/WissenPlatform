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
    
    // Clamp if C_i is 0 or W (or extremely close) to avoid infinity
    if (C_i <= 0) C_i = 0.5; // small positive
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
  const sigma = N > 1 ? Math.sqrt(sumSq / (N - 1)) : 1; // avoid division by zero
  
  // 7 & 8. Ball and Grade
  const results = thetas.map(s => {
    const Z_i = sigma === 0 ? 0 : (s.theta - mu) / sigma;
    let ball = 50 + 10 * Z_i;
    // Round to 1 decimal place
    ball = Math.round(ball * 10) / 10;
    
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
    results: results.sort((a,b) => b.ball - a.ball),
    stats: {
      n: N,
      mu,
      sigma,
      itemDifficulties: b
    }
  };
}
