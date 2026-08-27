import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { Exam } from '../../types';
import { Award, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import StudentCertificateTake from './StudentCertificateTake';
import { calculateRasch, RaschResult, RaschStats } from '../../lib/rasch';

export default function StudentMilliySertifikat() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [myResults, setMyResults] = useState<any[]>([]); // User's raw results
  
  // Cache for rasch calculations: examId -> { result: RaschResult, stats: RaschStats }
  const [raschData, setRaschData] = useState<Record<string, { result: RaschResult, stats: RaschStats }>>({});
  
  const [takingExam, setTakingExam] = useState<Exam | null>(null);

  useEffect(() => {
    if (!user?.groupId && (!user?.groups || user.groups.length === 0)) return;
    const userGroups = user.groups?.length ? user.groups : [user.groupId];

    // Fetch certificate exams
    const q = query(collection(db, 'exams'), where('examType', '==', 'certificate'), where('status', '==', 'active'));
    const unsub = onSnapshot(q, (snap) => {
      const allExams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      // filter by groups
      const myExams = allExams.filter(e => e.groupIds?.some(g => userGroups.includes(g)));
      setExams(myExams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(collection(db, 'exam_results'), where('studentId', '==', user.id)), (snap) => {
      setMyResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);
  
  // Calculate Rasch for exams the user has taken
  useEffect(() => {
    const loadRasch = async () => {
      const takenExamIds = myResults.map(r => r.examId);
      if (takenExamIds.length === 0) return;
      
      const newRaschData: Record<string, { result: RaschResult, stats: RaschStats }> = {};
      
      for (const eId of takenExamIds) {
        // Fetch ALL results for this exam to calculate cohort Rasch
        const snap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', eId)));
        if (snap.empty) continue;
        
        const allResults = snap.docs.map(d => d.data());
        // build matrix
        const matrix = allResults
          .filter(r => r.raschItems && r.raschItems.length === 55)
          .map(r => ({
            studentId: r.studentId,
            studentName: r.studentName,
            items: r.raschItems
          }));
          
        if (matrix.length > 0) {
          const { results, stats } = calculateRasch(matrix);
          const myRaschResult = results.find(r => r.studentId === user?.id);
          if (myRaschResult) {
            const rank = results.findIndex(r => r.studentId === user?.id);
            const percentile = Math.round(((stats.n - (rank + 1)) / stats.n) * 100);
            newRaschData[eId] = { result: myRaschResult, stats, percentile } as any;
          }
        }
      }
      setRaschData(newRaschData);
    };
    
    loadRasch();
  }, [myResults]);

  if (takingExam) {
    return <StudentCertificateTake exam={takingExam} onClose={() => setTakingExam(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Award className="text-[#FEC204]" size={32} /> Milliy Sertifikat
        </h1>
        <p className="text-white/60">Rasch modeli asosida baholanuvchi maxsus imtihonlar va natijalar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exams.length === 0 ? (
          <div className="col-span-full glass-panel p-8 text-center text-white/50 rounded-2xl">
            Hozircha faol sertifikat imtihonlari yo'q.
          </div>
        ) : (
          exams.map(exam => {
            const result = myResults.find(r => r.examId === exam.id);
            const rasch = raschData[exam.id];
            
            return (
              <div key={exam.id} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col relative overflow-hidden">
                {result && <div className="absolute top-0 right-0 bg-green-500 text-black px-4 py-1 text-xs font-bold rounded-bl-xl">Topshirilgan</div>}
                
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{exam.title}</h3>
                  <p className="text-[#FEC204] font-bold">{exam.subject}</p>
                </div>
                
                <div className="space-y-2 text-white/70 text-sm mb-6">
                  <div className="flex items-center gap-2"><Calendar size={16} /> {exam.date}</div>
                  <div className="flex items-center gap-2"><Clock size={16} /> {exam.startTime} (Davomiyligi: {exam.duration} daqiqa)</div>
                </div>
                
                <div className="mt-auto">
                  {!result ? (
                    <button onClick={() => setTakingExam(exam)} className="w-full py-3 bg-[#FEC204] text-black font-bold rounded-xl hover:opacity-90 transition-opacity">
                      Imtihonni Boshlash
                    </button>
                  ) : (
                    rasch ? (
                      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                          <div>
                            <p className="text-white/50 text-xs uppercase tracking-wider font-bold mb-1">To'plangan Ball (T-shkala)</p>
                            <p className="text-3xl font-black text-white">{rasch.result.ball.toFixed(1)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/50 text-xs uppercase tracking-wider font-bold mb-1">Daraja</p>
                            <div className={`text-2xl font-black ${['A+', 'A', 'B+'].includes(rasch.result.grade) ? 'text-green-400' : rasch.result.grade === 'NC' ? 'text-red-400' : 'text-[#FEC204]'}`}>
                              {rasch.result.grade}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/50">To'g'ri javoblar:</span>
                            <p className="font-bold text-white">{rasch.result.correct} / 55</p>
                          </div>
                          <div>
                            <span className="text-white/50">Qobiliyat (θ):</span>
                            <p className="font-bold text-white">{rasch.result.theta.toFixed(2)}</p>
                          </div>
                          <div className="col-span-2 text-xs text-white/40 mt-2">
                            Guruh o`rtacha balli: 50.0 (N={rasch.stats.n}) | Siz {(rasch as any).percentile}% ishtirokchidan yuqori natija ko`rsatdingiz
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white/5 text-white/60 rounded-xl text-center text-sm flex items-center justify-center gap-2">
                        <AlertCircle size={16} /> Natijalar hisoblanmoqda...
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
