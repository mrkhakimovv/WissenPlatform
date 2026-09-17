import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, onSnapshot, query, where, orderBy, getDocs } from '../../lib/firebase';
import { db, doc, getDoc } from '../../lib/firebase';
import { CheckCircle2, BookOpen, ChevronLeft, ChevronRight, SearchX, Calendar, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsItem, ScheduleItem, Group, Exam } from '../../types';
import { requestNotificationPermission } from '../../lib/messaging';
import { Bell, X } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<ScheduleItem[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [group, setGroup] = useState<Group | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const [notifStatus, setNotifStatus] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotifStatus(Notification.permission);
      if (Notification.permission !== 'granted') {
        const timer = setTimeout(() => setShowNotifPrompt(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnableNotif = async () => {
    if (Notification.permission === 'denied') {
      alert("Bildirishnomalar bloklangan. Iltimos, brauzer sozlamalariga kirib (tepadagi qulfchani bosib) ruxsat bering va sahifani yangilang.");
      return;
    }
    const token = await requestNotificationPermission();
    setNotifStatus(Notification.permission);
    if (Notification.permission === 'granted') {
      setShowNotifPrompt(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const qAtt = query(collection(db, 'attendance'), where('studentId', '==', user.id));
    const unsubAtt = onSnapshot(qAtt, (snap) => setAttendance(snap.docs.map(d => d.data())));

    const qPay = query(collection(db, 'payments'), where('studentId', '==', user.id));
    const unsubPay = onSnapshot(qPay, (snap) => {
      setPayments(snap.docs.map(d => d.data()));
    });

    const qNews = query(collection(db, 'news'), where('active', '==', true));
    const unsubNews = onSnapshot(qNews, (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()} as NewsItem));
      // order by date manually if no index
      data.sort((a,b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setNews(data);
    });

    return () => { unsubAtt(); unsubPay(); unsubNews(); }
  }, [user]);

  useEffect(() => {
    async function fetchGroupAndSchedules() {
      const userGroups = user?.groups?.length ? user.groups : (user?.groupId ? [user.groupId] : []);
      if (userGroups.length === 0) return;
      
      const groupDocs = await Promise.all(userGroups.map(id => getDoc(doc(db, 'groups', id))));
      const fetchedGroups = groupDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() } as Group));
      setGroups(fetchedGroups);
      if (fetchedGroups.length > 0) {
         setGroup(fetchedGroups[0]); // Set primary for any legacy usage
      }



      const unsubExams = onSnapshot(query(collection(db, 'exams')), snap => {
        const allExams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
        const myExams = allExams.filter(e => {
          if (e.examType === 'sat' || e.examType === 'certificate') return false;
          const hasGroup = (e.groupIds && e.groupIds.length > 0) || e.groupId;
          if (!hasGroup) return true;
          if (e.groupIds && e.groupIds.length > 0) {
            return e.groupIds.some(id => userGroups.includes(id));
          }
          return e.groupId && userGroups.includes(e.groupId);
        });
        // Only show upcoming exams or today's
        const now = new Date();
        const upcoming = myExams.filter(e => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));
        upcoming.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setExams(upcoming);
      });
      
      return () => {
        unsubExams();
      };
    }
    const cleanup = fetchGroupAndSchedules();
    // Return cleanup conditionally
    return () => {
       cleanup.then(unsub => {
         if (typeof unsub === 'function') unsub();
       });
    };
  }, [user]);

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (news.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [news.length, isPaused]);

  const handleManualNav = (index: number) => {
    setCurrentNewsIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const nextNews = () => handleManualNav((currentNewsIndex + 1) % news.length);
  const prevNews = () => handleManualNav((currentNewsIndex - 1 + news.length) % news.length);

  const todayDate = new Date();

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const totalCount = attendance.length || 1;
  const attendanceRate = Math.round((presentCount / totalCount) * 100);

  const currentMonth = todayDate.getMonth() + 1;
  const currentYear = todayDate.getFullYear();
  const hasPaid = payments.some(p => p.status === 'paid' && p.month === currentMonth && p.year === currentYear);

  const currentNews = news.length > 0 ? news[currentNewsIndex] : null;

  return (
    <div className="space-y-6 pb-6 overflow-x-hidden">
      <div>
        <h1 className="text-[20px] font-black text-white">Xush kelibsiz, {user?.fullName}! 👋</h1>
        <p className="text-[12px] text-white/40 font-bold mt-1">Bugungi kun uchun rejalaringiz bilan tanishing.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5 w-full md:max-w-xl">
        {/* Attendance Card */}
        <Link to="attendance" className="glass-panel p-4 md:p-5 !border-l-[3px] !border-l-[#FEC204] hover:scale-[1.02] transition-transform flex flex-col justify-between cursor-pointer min-h-[120px]">
          <div> 
             <p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">Davomat %</p>
             <p className="text-[26px] md:text-[32px] font-[900] tracking-[-1px] text-white leading-none">{attendance.length === 0 ? 0 : attendanceRate}%</p>
          </div>
          <div className="w-full h-1.5 bg-[#f0f0f0]/20 rounded-full mt-3 overflow-hidden">
            <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: `${attendance.length === 0 ? 0 : attendanceRate}%` }} 
               className="bg-[#22c55e] h-full" 
             />
          </div>
        </Link>

        {/* Payment Card */}
        <Link to="payments" className="glass-panel p-4 md:p-5 !border-l-[3px] !border-l-[#22c55e] flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer min-h-[120px]">
          <p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">To'lov holati</p>
          <div className="flex items-center gap-2 mt-2 mb-1">
            {hasPaid ? (
              <>
                <CheckCircle2 size={24} className="text-[#22c55e]" />
                <p className="text-[17px] md:text-[20px] font-black text-white leading-none">To'langan</p>
              </>
            ) : (
                <p className="text-[17px] md:text-[20px] font-black text-red-500 leading-none">To'lanmagan</p>
            )}
          </div>
          <p className="text-[10px] md:text-[12px] font-bold text-white/40 mt-auto">{['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'][new Date().getMonth()]} oyi uchun</p>
        </Link>
      </div>

      {/* News Carousel */}
      {news.length > 0 && currentNews && (
        <div className="glass-panel p-0 overflow-hidden relative flex flex-col group mt-4">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentNewsIndex}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="p-5 md:p-6 pb-12 md:pb-12 flex flex-col"
             >
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentNews.color || '#FEC204' }}></span>
                      <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-white/60">{currentNews.tag || "Yangilik"}</span>
                   </div>
                   <span className="text-[10px] font-bold text-white/40">{new Date(currentNews.publishedAt).toLocaleDateString('uz-UZ')}</span>
                </div>
                <h3 className="text-[16px] md:text-[20px] font-black text-white leading-snug">{currentNews.title}</h3>
                <p className="text-[13px] md:text-[14px] text-white/60 font-medium mt-2 leading-relaxed pr-2 md:pr-16">
                  {currentNews.description}
                </p>
             </motion.div>
           </AnimatePresence>

           {/* Controls */}
           <div className="absolute right-4 bottom-4 flex gap-1.5 bg-[#1a1a1a]/80 backdrop-blur-sm p-1 rounded-full border border-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={prevNews} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                 <ChevronLeft size={16} className="text-white" />
              </button>
              <button onClick={nextNews} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                 <ChevronRight size={16} className="text-white" />
              </button>
           </div>
           
           {/* Dots */}
           <div className="absolute left-5 md:left-6 bottom-5 flex gap-1.5 z-10 items-center">
             {news.map((_, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleManualNav(idx)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${idx === currentNewsIndex ? 'bg-white w-5' : 'bg-white/20 w-1.5 hover:bg-white/40'}`} 
                />
             ))}
           </div>
        </div>
      )}





      {exams.length > 0 && (
        <div>
          <h2 className="text-[13px] text-white font-bold mb-3 px-1 uppercase tracking-[1px]">Kelgusi Imtihonlar</h2>
          <div className="space-y-3">
            {exams.map(exam => (
              <div key={exam.id} className="glass-panel p-4 shadow-sm border-l-4 border-l-[#FEC204]">
                <h3 className="text-[15px] font-bold text-white mb-2">{exam.title}</h3>
                <div className="grid grid-cols-2 gap-y-2 text-[12px] font-medium text-white/60">
                  <div className="flex items-center gap-1.5"><Calendar size={14} className="text-[#FEC204]" /> <span>{new Date(exam.date).toLocaleDateString('uz-UZ')}</span></div>
                  <div className="flex items-center gap-1.5"><Clock size={14} className="text-[#FEC204]" /> <span>{exam.startTime} ({exam.duration} daq)</span></div>
                  <div className="flex items-center gap-1.5"><BookOpen size={14} className="text-[#FEC204]" /> <span>{exam.subject}</span></div>
                  <div className="flex items-center gap-1.5"><MapPin size={14} className="text-[#FEC204]" /> <span>{exam.location}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
