import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Exam } from '../../types';
import { CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export default function StudentResults() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'results' | 'rating'>('results');
  const [results, setResults] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        if (activeTab === 'results') {
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
              examTitle: data.examTitle || examsMap.get(data.examId)?.title || "Noma'lum imtihon",
              examSubject: data.examSubject || examsMap.get(data.examId)?.subject || '',
              examDate: data.examDate || examsMap.get(data.examId)?.date || data.submittedAt || '',
              examTestId: data.testId || examsMap.get(data.examId)?.testId || null,
              examType: examsMap.get(data.examId)?.examType,
            };
          }).filter(r => r.examType !== 'certificate');

          // group by exam and track total attempts and previous attempts scores
          const grouped = new Map();
          resData.forEach((res: any) => {
            if (!grouped.has(res.examId)) {
              grouped.set(res.examId, { ...res, allScores: [`${res.score}/${res.total}`] });
            } else {
              const currentBest = grouped.get(res.examId);
              const currentPercent = currentBest.total > 0 ? currentBest.score / currentBest.total : 0;
              const newPercent = res.total > 0 ? res.score / res.total : 0;
              
              // save previous score to list
              currentBest.allScores.push(`${res.score}/${res.total}`);
              
              if (newPercent > currentPercent || (newPercent === currentPercent && new Date(res.submittedAt).getTime() > new Date(currentBest.submittedAt).getTime())) {
                 const updated = { ...res, allScores: currentBest.allScores };
                 grouped.set(res.examId, updated);
              } else {
                 grouped.set(res.examId, currentBest);
              }
            }
          });

          const bestResults = Array.from(grouped.values());
          bestResults.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          setResults(bestResults);
        } else {
          const snap = await getDocs(collection(db, 'exam_results'));
          const bestPerStudentExam = new Map();
          
          snap.docs.forEach(d => {
            const data = d.data();
            if (!data.studentId || !data.examId) return;
            const key = `${data.studentId}_${data.examId}`;
            const currentBest = bestPerStudentExam.get(key) || { score: -1, total: 0 };
            const p1 = currentBest.total > 0 ? currentBest.score / currentBest.total : 0;
            const p2 = data.total > 0 ? data.score / data.total : 0;
            if (p2 > p1 || currentBest.score === -1) {
              bestPerStudentExam.set(key, { studentId: data.studentId, studentName: data.studentName, score: data.score, total: data.total });
            }
          });

          const finalRatings = new Map();
          bestPerStudentExam.forEach(val => {
            const student = finalRatings.get(val.studentId) || { studentId: val.studentId, studentName: val.studentName, totalScore: 0, maxScore: 0, examsCount: 0 };
            student.totalScore += val.score;
            student.maxScore += val.total;
            student.examsCount += 1;
            finalRatings.set(val.studentId, student);
          });

          const ratingsList = Array.from(finalRatings.values()).map(r => ({
            ...r,
            percent: r.maxScore > 0 ? Math.round((r.totalScore / r.maxScore) * 100) : 0
          }));

          ratingsList.sort((a, b) => {
            if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
            return b.percent - a.percent;
          });
          setRatings(ratingsList);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">
            {activeTab === 'results' ? 'Natijalar' : 'Reyting'}
          </h1>
          <p className="text-[12px] text-white/40 font-medium">
            {activeTab === 'results' ? 'Sizning ishlagan testlaringiz natijalari' : "Barcha o'quvchilarning test ishlash reytingi"}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-xl border border-white/5 self-start">
          <button 
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'results' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            Natijalar
          </button>
          <button 
            onClick={() => setActiveTab('rating')}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'rating' ? 'bg-[#FEC204] text-black' : 'text-white/40 hover:text-white/60'}`}
          >
            Reyting
          </button>
        </div>
      </div>

      {activeTab === 'results' ? (
        results.length > 0 ? (
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
                      <div className="flex items-center gap-2 text-[11px] font-bold flex-wrap">
                        <span className="text-[#FEC204]">
                          {res.examTestId 
                            ? (res.examSubject === 'Mavzulashtirilgan' ? 'Mavzulashtirilgan test' : res.examSubject)
                            : 'Imtihon'}
                        </span>
                        {!res.examTestId && res.examSubject && (
                          <>
                            <span className="text-white/40">•</span>
                            <span className="text-[#FEC204]">{res.examSubject}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[24px] font-black text-white leading-none">
                        {res.score} <span className="text-[14px] text-white/40 font-medium">/ {res.total}</span>
                      </div>
                      <div className="text-[12px] font-bold text-[#FEC204] mt-1">{percent}%</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                      <Clock size={14} className="text-white/30" />
                      <span>Topshirildi: {dateStr}</span>
                    </div>
                    {res.allScores && res.allScores.length > 1 && (
                      <div className="flex flex-col gap-1 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-white/30 w-[14px] flex justify-center text-[10px]">🔄</span>
                          <span>Eng yuqori natija ({res.attempts}-urinishda ko'rsatilgan)</span>
                        </div>
                        <div className="pl-6 text-[11px] text-white/30 flex items-center gap-1">
                          Barcha natijalar: {res.allScores.join(', ')}
                        </div>
                      </div>
                    )}
                    {(!res.allScores || res.allScores.length <= 1) && res.attempts > 0 && (
                      <div className="flex items-center gap-2 text-[12px] text-white/40 font-medium bg-white/5 p-2 rounded-lg">
                        <span className="text-white/30 w-[14px] flex justify-center text-[10px]">🔄</span>
                        <span>1 ta urinish</span>
                      </div>
                    )}
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
        )
      ) : (
        ratings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {ratings.map((r, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={r.studentId}
                className={`glass-panel p-4 flex items-center gap-4 ${user?.id === r.studentId ? '!border-l-[3px] !border-[#FEC204] bg-[#FEC204]/5' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0
                  ${i === 0 ? 'bg-yellow-500 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white/60'}`}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-white leading-tight">{r.studentName || 'Nomsiz o\'quvchi'}</h4>
                  <p className="text-[11px] font-medium text-white/40 mt-1">{r.examsCount} ta test ishlagan</p>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-black text-white leading-none">
                    {r.totalScore} <span className="text-[12px] text-white/40">/ {r.maxScore}</span>
                  </div>
                  <div className="text-[12px] font-bold text-[#FEC204] mt-1">{r.percent}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Trophy size={24} className="text-[#FEC204]" />
            </div>
            <h3 className="text-[18px] font-bold text-white mb-2">Reyting bo'sh</h3>
            <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Hali hech kim test ishlamagan ko'rinadi.</p>
          </div>
        )
      )}
    </div>
  );
}
