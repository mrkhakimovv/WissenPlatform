import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, getDocs, where } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Exam, Group } from '../../types';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import StudentTestTake from './StudentTestTake';

export default function StudentExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [takingExam, setTakingExam] = useState<Exam | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Load all groups to show names
    const getGroups = async () => {
      const snap = await getDocs(query(collection(db, 'groups')));
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
    };
    getGroups();

    const unsubExams = onSnapshot(query(collection(db, 'exams')), snap => {
      const allExams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      
      const userGroups = user?.groups?.length ? user.groups : (user?.groupId ? [user.groupId] : []);
      
      // Filter exams: either no group (all) or matches one of student's groups
      const myExams = allExams.filter(e => e.examType !== 'sat' && (!e.groupId || userGroups.includes(e.groupId)));
      
      // Sort by date (closest upcoming first, past ones later or grouped differently)
      // Actually let's just sort descending or ascending by date
      myExams.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setExams(myExams);
    });

    const unsubResults = onSnapshot(query(collection(db, 'exam_results'), where('studentId', '==', user.id)), snap => {
      setResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubExams();
      unsubResults();
    };
  }, [user]);

  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'Barcha guruhlar uchun';
    const g = groups.find(x => x.id === groupId);
    return g ? g.name : 'Noma\'lum guruh';
  };

  const now = new Date();
  // We can separate upcoming vs past exams
  const upcomingExams = exams.filter(e => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const pastExams = exams.filter(e => new Date(e.date) < new Date(now.getFullYear(), now.getMonth(), now.getDate())).reverse();

  const renderExamCard = (exam: Exam, isPast: boolean) => {
    const hasAttempted = results.some(r => r.examId === exam.id);
    const isOnlineTest = exam.isOnline || (exam.testSources && exam.testSources.length > 0) || exam.testId;
    const showRedDot = !isPast && isOnlineTest && !hasAttempted;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={exam.id} 
        className={`glass-panel p-5 relative ${isPast ? 'opacity-60' : ''}`}
      >
        {showRedDot && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#1a1a1a] shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">
            Yangi
          </div>
        )}
        <div className="mb-3 pr-4">
          <h3 className="text-[16px] font-bold text-white mb-1">{exam.title}</h3>
          <div className="flex gap-2 text-[11px] font-bold">
            <span className="text-[#FEC204]">{exam.subject}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/60">{getGroupName(exam.groupId)}</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Calendar size={14} className="text-white/40" />
            <span>{new Date(exam.date).toLocaleDateString('uz-UZ')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Clock size={14} className="text-white/40" />
            <span>{exam.startTime} (Davomiyligi: {exam.duration} daqiqa)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <MapPin size={14} className="text-white/40" />
            <span>{exam.location}</span>
          </div>
        </div>
        
        {exam.description && (
          <p className="text-[12px] text-white/50 bg-white/5 p-3 rounded-lg mb-4">{exam.description}</p>
        )}
        
        {(isOnlineTest && !isPast) && (
          <button 
            onClick={() => setTakingExam(exam)} 
            className={`w-full mt-2 py-3 rounded-[12px] font-bold flex items-center justify-center gap-2 transition-colors border ${hasAttempted ? 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10' : 'bg-[rgba(254,194,4,0.15)] text-[#FEC204] border-[#FEC204]/20 hover:bg-[rgba(254,194,4,0.25)]'}`}
          >
            <MapPin size={16} className="hidden" /> {/* just to align imports */}
            {hasAttempted ? (
              <>Qayta ishlash</>
            ) : (
              <><span className="text-[18px] mb-1 leading-none">▶</span> Testni boshlash</>
            )}
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 pb-6">
      {takingExam && (
        <StudentTestTake exam={takingExam} onClose={() => setTakingExam(null)} />
      )}
      <div>
        <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">Imtihonlar</h1>
        <p className="text-[12px] text-white/40 font-medium">Sizning kelgusi imtihon va olimpiadalaringiz</p>
      </div>

      {upcomingExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">Kelgusi Imtihonlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map(exam => renderExamCard(exam, false))}
          </div>
        </div>
      )}

      {pastExams.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">O'tgan Imtihonlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastExams.map(exam => renderExamCard(exam, true))}
          </div>
        </div>
      )}

      {exams.length === 0 && (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📝</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali imtihonlar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Sizning guruhlaringiz uchun hali imtihonlar belgilanmagan.</p>
        </div>
      )}
    </div>
  );
}
