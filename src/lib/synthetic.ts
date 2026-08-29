/**
 * Sintetik (tayanch) o'quvchilar generatori — Milliy Sertifikat imtihoni uchun.
 *
 * Maqsad: kam sonli real o'quvchi (masalan 50 ta) bo'lsa ham, imtihonni katta,
 * haqiqiy imtihonga o'xshash guruh ichida baholash. Buning uchun Rasch modeli
 * yordamida N ta sintetik o'quvchi generatsiya qilinadi va real o'quvchilar
 * bilan birga BITTA Rasch hisobiga qo'shiladi.
 *
 * MUHIM: sintetik javoblar TASODIFIY 0/1 emas — ular Rasch modeliga mos:
 *   P(to'g'ri) = 1 / (1 + e^-(θ − b_j))
 * bu yerda θ — o'quvchi qobiliyati (tayanch taqsimotdan), b_j — savol qiyinligi.
 *
 * Qobiliyat taqsimoti 9 ta real mock imtihon (~11 000 natija) asosida
 * kalibrlangan: o'rtacha ball ~50, σ ~10, o'ngga cho'zilgan (skew ~+0.8;
 * skewAlpha=2 → tekshirilgan skew 0.80).
 * (O'rtacha/σ standartlash orqali avtomatik chiqadi; skew — taqsimot shakli.)
 *
 * Seed (qat'iy tasodif) ishlatiladi: bir xil imtihon uchun har qayta hisoblaganda
 * AYNAN bir xil sintetik guruh hosil bo'ladi — natija barqaror qoladi.
 */

/** mulberry32 — kichik, tez, seed'li PRNG (0..1). */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Matn (masalan exam.id) dan barqaror butun seed. */
export function seedFromString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Standart normal (Box–Muller) berilgan rng'dan. */
function randn(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Skew-normal namuna (o'rtacha 0, σ 1 ga standartlangan), shape = alpha.
 * alpha > 0 → o'ngga cho'zilgan (haqiqiy imtihondagidek).
 */
function skewNormalStd(rng: () => number, alpha: number): number {
  const u0 = randn(rng);
  const u1 = randn(rng);
  const delta = alpha / Math.sqrt(1 + alpha * alpha);
  const z = delta * Math.abs(u0) + Math.sqrt(1 - delta * delta) * u1;
  const mean = delta * Math.sqrt(2 / Math.PI);
  const sd = Math.sqrt(1 - (2 * delta * delta) / Math.PI);
  return (z - mean) / sd;
}

export interface SyntheticOptions {
  count: number;
  seed?: number;          // barqarorlik uchun (default — sobit)
  abilitySpread?: number; // qobiliyat (logit) tarqoqligi, default 1.4
  skewAlpha?: number;     // skew-normal shape, default 4 (≈ +0.8 skew)
}

export interface MatrixRow {
  studentId: string;
  studentName: string;
  items: number[];
  synthetic?: boolean;
}

/** 0/1 matritsadan har savol qiyinligini (logit b_j) hisoblaydi (calculateRasch bilan bir xil). */
export function itemDifficultiesFromMatrix(matrix: { items: number[] }[]): number[] {
  const N = matrix.length;
  if (N === 0) return [];
  const M = matrix[0].items.length;
  const b: number[] = [];
  for (let j = 0; j < M; j++) {
    let c = 0;
    for (let i = 0; i < N; i++) c += matrix[i].items[j] ? 1 : 0;
    let p = c / N;
    if (p <= 0 || p >= 1) p = (c + 0.5) / (N + 1); // continuity correction
    b.push(-Math.log(p / (1 - p)));
  }
  return b;
}

/**
 * Rasch modeliga mos sintetik o'quvchilar matritsasini yaratadi.
 * @param itemDifficulties  real o'quvchilardan olingan savol qiyinliklari (logit)
 */
export function generateSyntheticMatrix(
  itemDifficulties: number[],
  opts: SyntheticOptions
): MatrixRow[] {
  const count = Math.max(0, Math.floor(opts.count || 0));
  const seed = opts.seed ?? 987654321;
  const spread = opts.abilitySpread ?? 1.4;
  const alpha = opts.skewAlpha ?? 2; // ~ +0.80 skew (real imtihonlarga mos, kalibrlangan)
  const rng = mulberry32(seed);
  const M = itemDifficulties.length;
  const out: MatrixRow[] = [];

  for (let i = 0; i < count; i++) {
    const theta = skewNormalStd(rng, alpha) * spread; // mean 0, sd=spread, o'ngga cho'zilgan
    const items: number[] = new Array(M);
    for (let j = 0; j < M; j++) {
      const p = 1 / (1 + Math.exp(-(theta - itemDifficulties[j])));
      items[j] = rng() < p ? 1 : 0;
    }
    out.push({ studentId: `synthetic_${i}`, studentName: `Sintetik #${i + 1}`, items, synthetic: true });
  }
  return out;
}
