import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Exam } from '../../types';
import { Award, Clock, Calendar, X, BarChart3 } from 'lucide-react';
import StudentCertificateTake from './StudentCertificateTake';
import { RaschReport, RaschResult } from '../../lib/rasch';
import RaschStatsPanel from '../../components/RaschStatsPanel';
import { createPortal } from 'react-dom';

export default function StudentMilliySertifikat() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [myResults, setMyResults] = useState<any[]>([]);
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [viewingStats, setViewingStats] = useState<Exam | null>(null);

  useEffect(() => {
    if (!user?.groupId && (!user?.groups || user.groups.length === 0)) return;
    const userGroups = user.groups?.length ? user.groups : [user.groupId];
    // Faol va yakunlangan sertifikat imtihonlari
    const q = query(collection(db, 'exams'), where('examType', '==', 'certificate'));
    const unsub = onSnapshot(q, (snap) => {
      const allExams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
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

  // Yakunlangan imtihonning muzlatilgan hisobotidan shu o'quvchi natijasini oladi
  const getMyResult = (exam: Exam): RaschResult | undefined => {
    const rep = exam.raschReport as RaschReport | undefined;
    if (exam.status !== 'ended' || !rep?.results) return undefined;
    return rep.results.find(r => r.studentId === user?.id);
  };

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
            const ended = exam.status === 'ended';
            const isAllowedRetake = exam.allowedRetakes?.includes(user?.id || "");
            const myR = getMyResult(exam);

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
                  {!result && (!ended || isAllowedRetake) && (
                    <button onClick={() => setTakingExam(exam)} className="w-full py-3 bg-[#FEC204] text-black font-bold rounded-xl hover:opacity-90 transition-opacity">
                      Imtihonni Boshlash
                    </button>
                  )}
                  {!result && ended && !isAllowedRetake && (
                    <div className="p-4 bg-white/5 text-white/50 rounded-xl text-center text-sm">
                      Imtihon yakunlangan. Siz bu imtihonni topshirmagansiz.
                    </div>
                  )}
                  {result && !ended && (
                    <div className="p-4 bg-[#FEC204]/10 border border-[#FEC204]/20 text-[#FEC204] rounded-xl text-center text-sm">
                      Topshirildi. Natijangiz imtihon <b>yakunlangandan keyin</b> chiqadi.
                    </div>
                  )}
                  {result && ended && myR && (
                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wider font-bold mb-1">Ball (T-shkala)</p>
                          <p className="text-3xl font-black text-white">{myR.ball.toFixed(1)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/50 text-xs uppercase tracking-wider font-bold mb-1">Daraja</p>
                          <div className={`text-2xl font-black ${['A+', 'A', 'B+'].includes(myR.grade) ? 'text-green-400' : myR.grade === 'NC' ? 'text-red-400' : 'text-[#FEC204]'}`}>
                            {myR.grade}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-white/50">To'g'ri javoblar:</span>
                          <p className="font-bold text-white">{myR.correct} / {exam.raschReport?.stats?.numItems ?? 55}</p>
                        </div>
                        <div>
                          <span className="text-white/50">Qobiliyat (θ):</span>
                          <p className="font-bold text-white">{myR.theta.toFixed(2)}</p>
                        </div>
                      </div>
                      <button onClick={() => setViewingStats(exam)} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                        <BarChart3 size={16} /> Batafsil statistika
                      </button>
                    </div>
                  )}
                  {result && ended && !myR && !isAllowedRetake && (
                    <div className="p-4 bg-white/5 text-white/50 rounded-xl text-center text-sm">Natijangiz topilmadi.</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {viewingStats && viewingStats.raschReport && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setViewingStats(null)}>
          <div className="bg-[#0d0d0d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white">{viewingStats.title} — statistika</h2>
                <p className="text-white/50 text-sm">{viewingStats.subject} • {viewingStats.date}</p>
              </div>
              <button onClick={() => setViewingStats(null)} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
              <RaschStatsPanel report={viewingStats.raschReport as RaschReport} highlightStudentId={user?.id} examTitle={viewingStats.title} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}