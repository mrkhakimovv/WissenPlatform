import React, { useState, useEffect } from 'react';
import { Exam } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { calculateRasch, RaschResult, RaschStats } from '../../lib/rasch';
import { X, Download, Users, TrendingUp, Award } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Props {
  exam: Exam;
  onClose: () => void;
}

export default function AdminCertificateResults({ exam, onClose }: Props) {
  const [results, setResults] = useState<RaschResult[]>([]);
  const [stats, setStats] = useState<RaschStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', exam.id)));
        const all = snap.docs.map(d => d.data());
        
        const matrix = all
          .filter(r => r.raschItems && r.raschItems.length === 55)
          .map(r => ({
            studentId: r.studentId,
            studentName: r.studentName,
            items: r.raschItems
          }));
          
        if (matrix.length > 0) {
          const rasch = calculateRasch(matrix);
          setResults(rasch.results);
          setStats(rasch.stats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadResults();
  }, [exam]);

  const exportCSV = () => {
    let csv = "O'rin,F.I.SH.,To'g'ri (55 dan),Qobiliyat (θ),Ball (T-shkala),Daraja\n";
    results.forEach((r, i) => {
      csv += `${i + 1},"${r.studentName}",${r.correct},${r.theta.toFixed(3)},${r.ball},${r.grade}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sertifikat_${exam.title.replace(/\s+/g, '_')}_natijalar.csv`;
    link.click();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/10 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">{exam.title} - Rasch Natijalari</h2>
            <p className="text-white/50 text-sm mt-1">{exam.subject} • {exam.date}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportCSV} disabled={results.length === 0} className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
              <Download size={16} /> Excel Export
            </button>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-[#FEC204] font-bold">Yuklanmoqda...</div>
          ) : results.length === 0 ? (
            <div className="text-center text-white/50 py-10 bg-white/5 rounded-xl border border-white/10">
              Hech qanday natija topilmadi (Topshirganlar yo'q yoki 55-birlik formatiga to'g'ri kelmaydi).
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm font-bold">Qatnashdi</p>
                    <p className="text-2xl font-black text-white">{stats?.n}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm font-bold">O'rtacha Qobiliyat (μ)</p>
                    <p className="text-2xl font-black text-white">{stats?.mu.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm font-bold">O'rtacha Ball</p>
                    <p className="text-2xl font-black text-white">50.0</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="bg-[#1a1a1a] text-white/50 border-b border-white/10">
                    <tr>
                      <th className="p-4 font-bold">O'rin</th>
                      <th className="p-4 font-bold">F.I.SH.</th>
                      <th className="p-4 font-bold">To'g'ri (55)</th>
                      <th className="p-4 font-bold">Qobiliyat (θ)</th>
                      <th className="p-4 font-bold">Ball (T-shkala)</th>
                      <th className="p-4 font-bold text-center">Daraja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((r, i) => (
                      <tr key={r.studentId} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white/50">{i + 1}</td>
                        <td className="p-4 font-bold text-white">{r.studentName}</td>
                        <td className="p-4">{r.correct} / 55</td>
                        <td className="p-4 font-mono text-[#FEC204]">{r.theta.toFixed(3)}</td>
                        <td className="p-4 font-black text-white text-lg">{r.ball.toFixed(1)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            ['A+', 'A', 'B+'].includes(r.grade) ? 'bg-green-500/20 text-green-400' :
                            r.grade === 'NC' ? 'bg-red-500/20 text-red-400' : 'bg-[#FEC204]/20 text-[#FEC204]'
                          }`}>
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
