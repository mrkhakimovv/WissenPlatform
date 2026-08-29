import React from 'react';
import { RaschReport, RaschResult } from '../lib/rasch';
import { Users, HelpCircle, TrendingUp, Target, BarChart3, Award } from 'lucide-react';

interface Props {
  report: RaschReport;
  /** Shu o'quvchi natijasini alohida ajratib ko'rsatadi (o'quvchi paneli uchun) */
  highlightStudentId?: string;
  examTitle?: string;
}

const gradeColor = (g: string) =>
  ['A+', 'A', 'B+'].includes(g) ? 'text-green-400' : g === 'NC' ? 'text-red-400' : 'text-[#FEC204]';

// Qiyinchilik foiziga qarab rang (yashil=oson, qizil=qiyin)
const diffColor = (pct: number) => {
  if (pct <= 33) return 'text-green-400 bg-green-500/10 border-green-500/20';
  if (pct <= 66) return 'text-[#FEC204] bg-[#FEC204]/10 border-[#FEC204]/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
};

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-bold uppercase tracking-wide mb-1">
        {icon} {label}
      </div>
      <div className="text-white font-black text-lg">{value}</div>
    </div>
  );
}

export default function RaschStatsPanel({ report, highlightStudentId }: Props) {
  const { stats, results } = report;
  const me: RaschResult | undefined = highlightStudentId
    ? results.find(r => r.studentId === highlightStudentId)
    : undefined;
  // Sintetik guruh bo'lsa — saqlangan o'rin/foizni ishlatamiz (butun guruhga nisbatan)
  const totalCohort = stats.n + (stats.referenceN || 0);
  const myRank = me ? (me.rank ?? results.findIndex(r => r.studentId === me.studentId) + 1) : 0;
  const percentile = me
    ? (me.percentile ?? (stats.n > 0 ? Math.round(((stats.n - myRank) / stats.n) * 100) : 0))
    : 0;

  return (
    <div className="space-y-6">
      {me && (
        <div className="bg-gradient-to-br from-[#FEC204]/15 to-transparent border border-[#FEC204]/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[#FEC204] font-bold mb-3">
            <Award size={18} /> Sizning natijangiz
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-white/50 text-[11px] uppercase font-bold">Ball</p>
              <p className="text-3xl font-black text-white">{me.ball.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-white/50 text-[11px] uppercase font-bold">Daraja</p>
              <p className={`text-3xl font-black ${gradeColor(me.grade)}`}>{me.grade}</p>
            </div>
            <div>
              <p className="text-white/50 text-[11px] uppercase font-bold">To'g'ri</p>
              <p className="text-2xl font-black text-white">{me.correct} / {stats.numItems}</p>
            </div>
            <div>
              <p className="text-white/50 text-[11px] uppercase font-bold">Qobiliyat (θ)</p>
              <p className="text-2xl font-black text-white">{me.theta.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-white/50 text-xs mt-3">
            {totalCohort.toLocaleString()} ta ishtirokchidan {percentile}% dan yuqori natija. O'rin: {myRank}/{totalCohort.toLocaleString()}.
            {stats.referenceN ? ` (${stats.n} real + ${stats.referenceN.toLocaleString()} tayanch)` : ''}
          </p>
        </div>
      )}

      <div>
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <BarChart3 size={18} className="text-[#FEC204]" /> Umumiy statistika
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Stat icon={<Users size={12} />} label="Real o'quvchilar" value={`${stats.n} ta`} />
          {stats.referenceN ? (
            <Stat icon={<Users size={12} />} label="Tayanch (sintetik)" value={`${stats.referenceN.toLocaleString()} ta`} />
          ) : (
            <Stat icon={<HelpCircle size={12} />} label="Birliklar" value={`${stats.numItems} ta`} />
          )}
          <Stat icon={<TrendingUp size={12} />} label="O'rtacha qobiliyat μ" value={stats.mu.toFixed(2)} />
          <Stat icon={<TrendingUp size={12} />} label="Sigma σ" value={stats.sigma.toFixed(2)} />
          <Stat icon={<TrendingUp size={12} />} label="Min qobiliyat" value={stats.minTheta.toFixed(2)} />
          <Stat icon={<TrendingUp size={12} />} label="Max qobiliyat" value={stats.maxTheta.toFixed(2)} />
          <Stat icon={<Target size={12} />} label="O'rtacha ball" value={stats.meanBall.toFixed(1)} />
          <Stat icon={<Target size={12} />} label="O'rtacha to'g'ri" value={`${stats.meanCorrect.toFixed(1)} ta`} />
          <Stat icon={<Target size={12} />} label="Test qiyinchiligi" value={`${stats.testDifficulty.toFixed(1)}%`} />
          <Stat icon={<Target size={12} />} label="Eng oson savol" value={`${stats.minItemDifficulty.toFixed(1)}%`} />
          <Stat icon={<Target size={12} />} label="Eng qiyin savol" value={`${stats.maxItemDifficulty.toFixed(1)}%`} />
          <Stat icon={<Target size={12} />} label="O'rtacha logit" value={`${stats.meanLogit.toFixed(2)} ± ${stats.sigmaLogit.toFixed(2)}`} />
        </div>
      </div>

      <div>
        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
          <Target size={18} className="text-[#FEC204]" /> Savollar qiyinchiligi
        </h3>
        <p className="text-white/40 text-xs mb-3">Foiz = shu savolga xato javob berganlar ulushi (katta % = qiyinroq).</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {stats.itemDifficultyPct.map((pct, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${diffColor(pct)}`}>
              <span className="font-bold text-white/70">{i + 1}-savol</span>
              <span className="font-black">{pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}