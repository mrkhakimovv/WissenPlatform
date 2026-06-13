import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Users, Plus, X, Search, Clock, CalendarDays, BookOpen, GraduationCap } from 'lucide-react';

const WEEK_DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Yak'];

export default function AdminGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Group Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    const unsubGroups = onSnapshot(
      query(collection(db, 'groups'), orderBy('createdAt', 'desc')),
      (snap) => {
        setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubTeachers = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'teacher')), 
      (snap) => {
        setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );
    return () => { unsubGroups(); unsubSubjects(); unsubTeachers(); };
  }, []);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      toast.error('Kamida bitta kun tanlanishi kerak');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'groups'), {
        name,
        subject,
        teacherName,
        time: `${startTime} - ${endTime}`,
        days: selectedDays.join(', '),
        createdAt: new Date().toISOString()
      });
      toast.success("Guruh qo'shildi!");
      setIsGroupModalOpen(false);
      setName('');
      setSubject('');
      setTeacherName('');
      setStartTime('');
      setEndTime('');
      setSelectedDays([]);
    } catch(err) {
      toast.error("Xatolik yuz berdi");
    }
    setLoading(false);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const filtered = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()) || g.teacherName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[color:var(--theme-text-primary)] font-bold text-lg">Guruhlar</h2>
        <button 
          onClick={() => setIsGroupModalOpen(true)}
          className="bg-[#FEC204] text-[#0d0d0d] w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#FEC204]/20"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="relative shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--theme-text-primary)]/30" size={16} />
        <input 
          type="text" 
          placeholder="Guruh nomi yoki o'qituvchi orqali qidirish..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full glass-panel py-3 pl-11 pr-4 focus:outline-none focus:border-[#FEC204]/40 text-[color:var(--theme-text-primary)] placeholder-white/25 text-sm"
        />
      </div>

      <div className="overflow-y-auto space-y-3 flex-1 pb-4">
        {filtered.length === 0 && (
          <p className="text-center text-[color:var(--theme-text-primary)]/30 py-10 text-sm">Guruhlar topilmadi</p>
        )}
        
        {filtered.map((g, i) => (
          <motion.div 
            key={g.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel-list p-4 flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-[color:var(--theme-text-primary)] text-base leading-tight mb-1">{g.name}</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-[#FEC204] font-medium bg-[#FEC204]/10 w-fit px-2 py-0.5 rounded-full border border-[#FEC204]/20">
                  <BookOpen size={12} />
                  <span>{g.subject}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-white/5">
               <div className="flex items-center gap-2 text-[color:var(--theme-text-primary)]/60">
                 <GraduationCap size={14} className="text-[#FEC204]" />
                 <span className="text-[11px] font-semibold">{g.teacherName}</span>
               </div>
               <div className="flex items-center gap-2 text-[color:var(--theme-text-primary)]/60">
                 <CalendarDays size={14} className="text-blue-400" />
                 <span className="text-[11px] font-semibold">{g.days}</span>
               </div>
               <div className="flex items-center gap-2 text-[color:var(--theme-text-primary)]/60">
                 <Clock size={14} className="text-green-400" />
                 <span className="text-[11px] font-semibold">{g.time}</span>
               </div>
               <div className="flex items-center gap-2 text-[color:var(--theme-text-primary)]/60">
                 <Users size={14} className="text-purple-400" />
                 <span className="text-[11px] font-semibold">O'quvchilar</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Group Modal */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/95 border-[color:var(--glass-border)]"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[color:var(--theme-text-primary)] flex items-center gap-2">
                  <Users size={18} className="text-blue-400" /> Guruh qo'shish
                </h2>
                <button onClick={() => setIsGroupModalOpen(false)} className="text-[color:var(--theme-text-primary)]/40 hover:text-[color:var(--theme-text-primary)] transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddGroup} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-[color:var(--theme-text-primary)]/50 px-1 uppercase tracking-wider font-bold">Guruh nomi</label>
                  <input required placeholder="Masalan: IELTS 7.0 (A guruh)" value={name} onChange={e=>setName(e.target.value)} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[color:var(--theme-text-primary)]/50 px-1 uppercase tracking-wider font-bold">Fan nomi</label>
                  <select required value={subject} onChange={e=>setSubject(e.target.value)} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm bg-transparent appearance-none">
                    <option value="" disabled className="text-[#0d0d0d]">Fanni tanlang...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.name} className="text-[#0d0d0d]">{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[color:var(--theme-text-primary)]/50 px-1 uppercase tracking-wider font-bold">O'qituvchi ism familiyasi</label>
                  <select required value={teacherName} onChange={e=>setTeacherName(e.target.value)} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm bg-transparent appearance-none">
                    <option value="" disabled className="text-[#0d0d0d]">O'qituvchini tanlang...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.fullName} className="text-[#0d0d0d]">{t.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[11px] text-[color:var(--theme-text-primary)]/50 px-1 uppercase tracking-wider font-bold">Dars soati</label>
                    <div className="flex gap-2">
                      <input required type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)]/90" style={{ colorScheme: "dark" }} />
                      <input required type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)]/90" style={{ colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[11px] text-[color:var(--theme-text-primary)]/50 px-1 uppercase tracking-wider font-bold mb-1 block">Kunlar</label>
                    <div className="flex flex-wrap gap-2">
                      {WEEK_DAYS.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            selectedDays.includes(d) 
                              ? 'bg-[#FEC204]/20 border-[#FEC204]/40 text-[#FEC204]' 
                              : 'bg-white/5 border-[color:var(--glass-border)] text-[color:var(--theme-text-primary)]/40 hover:bg-white/10'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2 mt-4">
                  <button type="button" disabled={loading} onClick={()=>setIsGroupModalOpen(false)} className="flex-1 py-3 rounded-xl border border-[color:var(--glass-border)] text-sm font-medium hover:bg-white/5 transition-colors text-[color:var(--theme-text-primary)]/70">Bekor qilish</button>
                  <button type="submit" disabled={loading} className="flex-1 glass-button py-3 text-sm disabled:opacity-50">Qo'shish</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
