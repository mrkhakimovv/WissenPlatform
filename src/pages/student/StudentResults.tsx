import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Exam } from '../../types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user?.id) return;
      try {
        const q = query(
          collection(db, 'exam_results'),
          where('studentId', '==', user.id)
        );
        const snap = await getDocs(q);
        
        const examsSnap = await getDocs(collection(db, 'exams'));
        const examsMap = new Map<string, Exam>();
        examsSnap.docs.forEach(d => examsMap.set(d.id, { id: d.id, ...d.data() } as Exam));

        const resData = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            examTitle: examsMap.get(data.examId)?.title || "Noma'lum imtihon",
            examSubject: examsMap.get(data.examId)?.subject || '',
            examDate: examsMap.get(data.examId)?.date || '',
          };
        });

        // sort by submittedAt descending
        const grouped = new Map();
        resData.forEach(res => {
          if (!grouped.has(res.examId)) {
            grouped.set(res.examId, res);
          } else {
            const currentBest = grouped.get(res.examId);
            const currentPercent = currentBest.total > 0 ? currentBest.score / currentBest.total : 0;
            const newPercent = res.total > 0 ? res.score / res.total : 0;
            if (newPercent > currentPercent || (newPercent === currentPercent && new Date(res.submittedAt).getTime() > new Date(currentBest.submittedAt).getTime())) {
               grouped.set(res.examId, res);
            }
          }
        });
        const bestResults = Array.from(grouped.values());
        bestResults.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setResults(bestResults);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">Natijalar</h1>
        <p className="text-[12px] text-white/40 font-medium">Sizning ishlagan testlaringiz natijalari</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((res) => {
            const dateStr = new Date(res.submittedAt).toLocaleDateString('uz-UZ', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            });
            const percent = res.total > 0 ? Math.round((res.score / res.total) * 100) : 0;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={res.id}
                className="glass-panel p-5 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FEC204]"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-white mb-1">{res.examTitle}</h3>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="text-[#FEC204]">{res.examSubject}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[24px] font-black text-white leading-none">
                      {res.score} <span className="text-[14px] text-white/40 font-medium">/ {res.total}</span>
                    </div>
                    <div className="text-[12px] font-bold text-[#FEC204] mt-1">{percent}%</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                  <Clock size={14} className="text-white/30" />
                  <span>Topshirildi: {dateStr}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">🏆</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Natijalar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Siz hali hech qanday onlayn imtihon topshirmagansiz.</p>
        </div>
      )}
    </div>
  );
}
