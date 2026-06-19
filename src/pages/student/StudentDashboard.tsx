import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, onSnapshot, query, where } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { CheckCircle2, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NEWS_ITEMS = [
  {
    id: 1,
    title: "Yangi o'quv yili uchun qabul boshlandi!",
    description: "Markazimizda barcha fanlardan intensiv kurslariga qabul ochildi. Imkoniyatni boy bermang.",
    date: "19-Iyun, 2026",
    tag: "Yangilik",
    color: "#FEC204"
  },
  {
    id: 2,
    title: "O'quv markazida Ichki Olimpiada",
    description: "Barcha guruhlar o'rtasida katta olimpiada o'tkaziladi. G'oliblarga maxsus sovg'alar va chegirmalar tayyorlangan.",
    date: "15-Iyun, 2026",
    tag: "Musobaqa",
    color: "#22c55e"
  },
  {
    id: 3,
    title: "Do'stingizni taklif qiling",
    description: "Har bir yangi kelgan do'stingiz uchun keyingi oylik to'lovingizga 15% chegirma ega bo'ling.",
    date: "05-Iyun, 2026",
    tag: "Chegirma",
    color: "#3b82f6"
  }
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    const qAtt = query(collection(db, 'attendance'), where('studentId', '==', user.id));
    const unsubAtt = onSnapshot(qAtt, (snap) => setAttendance(snap.docs.map(d => d.data())));

    const qPay = query(collection(db, 'payments'), where('studentId', '==', user.id));
    const unsubPay = onSnapshot(qPay, (snap) => {
      setPayments(snap.docs.map(d => d.data()));
    });

    return () => { unsubAtt(); unsubPay(); }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextNews = () => setCurrentNewsIndex((prev) => (prev + 1) % NEWS_ITEMS.length);
  const prevNews = () => setCurrentNewsIndex((prev) => (prev - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length);

  // Mini calendar logic
  const todayDate = new Date();
  const days = Array.from({length: 7}, (_, i) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - 3 + i);
    return d;
  });

  const presentCount = attendance.filter(a => a.status === 'present' || a.present).length;
  const totalCount = attendance.length || 1;
  const attendanceRate = Math.round((presentCount / totalCount) * 100);

  const hasPaid = payments.some(p => p.status === 'paid' && p.amount > 0);

  const currentNews = NEWS_ITEMS[currentNewsIndex];

  return (
    <div className="space-y-6 pb-6 overflow-x-hidden">
      <div>
        <h1 className="text-[20px] font-black text-white">Xush kelibsiz, {user?.fullName}! 👋</h1>
        <p className="text-[12px] text-white/40 font-bold mt-1">Bugungi kun uchun rejalaringiz bilan tanishing.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Attendance Card */}
        <div className="glass-panel p-4 md:p-5 !border-l-[3px] !border-l-[#FEC204] hover:scale-[1.02] transition-transform flex flex-col justify-between">
          <div>
             <p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">Davomat %</p>
             <p className="text-[26px] md:text-[32px] font-[900] tracking-[-1px] text-white leading-none">{attendance.length === 0 ? 0 : attendanceRate}%</p>
          </div>
          <div className="w-full h-1.5 bg-[#f0f0f0]/20 rounded-full mt-3 overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${attendance.length === 0 ? 0 : attendanceRate}%` }}
               className="bg-[#FEC204] h-full" 
            />
          </div>
        </div>

        {/* Payment Card */}
        <div className="glass-panel p-4 md:p-5 !border-l-[3px] !border-l-[#22c55e] flex flex-col justify-between hover:scale-[1.02] transition-transform">
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
          <p className="text-[10px] md:text-[12px] font-bold text-white/40 mt-auto">Iyun oyi uchun</p>
        </div>

        {/* News Carousel */}
        <div className="col-span-2 glass-panel p-0 overflow-hidden relative flex flex-col group min-h-[140px]">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentNewsIndex}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="p-4 md:p-5 flex flex-col h-full absolute inset-0"
             >
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentNews.color }}></span>
                      <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-white/60">{currentNews.tag}</span>
                   </div>
                   <span className="text-[10px] font-bold text-white/40">{currentNews.date}</span>
                </div>
                <h3 className="text-[15px] md:text-[17px] font-black text-white leading-snug line-clamp-1">{currentNews.title}</h3>
                <p className="text-[12px] text-white/60 font-medium mt-1.5 leading-relaxed line-clamp-2 md:line-clamp-none pr-8">
                  {currentNews.description}
                </p>
             </motion.div>
           </AnimatePresence>

           {/* Controls */}
           <div className="absolute right-3 bottom-4 flex gap-1 bg-[#1a1a1a]/80 backdrop-blur-sm p-1 rounded-full border border-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={prevNews} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                 <ChevronLeft size={14} className="text-white" />
              </button>
              <button onClick={nextNews} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                 <ChevronRight size={14} className="text-white" />
              </button>
           </div>
           
           {/* Dots */}
           <div className="absolute left-4 md:left-5 bottom-4 flex gap-1.5 z-10">
             {NEWS_ITEMS.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentNewsIndex ? 'bg-white w-4' : 'bg-white/20'}`} />
             ))}
           </div>
        </div>
      </div>

      <div>
        <h2 className="text-[13px] text-white font-bold mb-3 px-1 uppercase tracking-[1px]">Bugungi Darslar</h2>
        <div className="glass-panel p-4 border-none bg-white shadow-sm p-4 ring-1 ring-[color:white/10]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-[#FEC204] flex items-center justify-center">
              <BookOpen size={20} color="#000" />
            </div>
            <div>
              <p className="text-[15px] font-black text-white">{user?.subject || 'Matematika'}</p>
              <p className="text-[11px] font-bold text-white/40">Guruh: {user?.groupId || 'G-24'}</p>
            </div>
          </div>
          <div className="bg-[color:var(--surface-color)] p-3 rounded-xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FEC204]"></div>
              <span className="text-[12px] font-bold text-white">Xona #12</span>
            </div>
            <span className="badge-gold">14:00 - 16:00</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[13px] text-white font-bold mb-3 px-1 uppercase tracking-[1px]">Davomat</h2>
        <div className="glass-panel p-4">
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => {
              const dateStr = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
              const isToday = i === 3;
              
              const attRecord = attendance.find(a => a.date === dateStr);
              let status = 'empty';
              if (attRecord) {
                 status = attRecord.status === 'present' || attRecord.present ? 'present' : (attRecord.status || 'absent');
              }
              
              let style = "bg-white/5 border-white/10 text-white/40";
              if (status === 'present') style = "bg-[rgba(254,194,4,0.12)] border-[rgba(254,194,4,0.3)] text-[#FEC204]";
              if (status === 'absent') style = "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-red-500";
              if (status === 'excused') style = "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";

              return (
                <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-[10px] border font-bold text-[13px] ${style} ${isToday ? 'ring-2 ring-offset-[1px] ring-offset-[#0d0d0d] ring-[#FEC204]' : ''}`}>
                  <span>{d.getDate()}</span>
                  <span className="text-[8px] opacity-70 mt-0.5">{d.toLocaleDateString('uz', {weekday:'short'})}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
