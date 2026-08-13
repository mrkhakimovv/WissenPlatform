import React, { useState, useEffect } from 'react';
import { MapPin, SearchX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { ScheduleItem } from '../../types';

const DAYS = [
  { id: 1, name: 'Dushanba', short: 'Du' },
  { id: 2, name: 'Seshanba', short: 'Se' },
  { id: 3, name: 'Chorshanba', short: 'Ch' },
  { id: 4, name: 'Payshanba', short: 'Pa' },
  { id: 5, name: 'Juma', short: 'Ju' },
  { id: 6, name: 'Shanba', short: 'Sha' },
  { id: 7, name: 'Yakshanba', short: 'Ya' },
];

export default function StudentSchedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    if (!user?.groupId) return;
    const q = query(collection(db, 'schedules'), where('groupId', '==', user.groupId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ScheduleItem[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as ScheduleItem);
      });
      setSchedules(data);
    });
    return () => unsubscribe();
  }, [user]);

  const scheduleData = DAYS.map(dayInfo => {
    const daySchedules = schedules
      .filter(s => s.dayOfWeek === dayInfo.id)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return {
      day: dayInfo.name,
      short: dayInfo.short,
      lessons: daySchedules
    };
  });

  return (
    <div className="space-y-6 pb-6">
      <div className="px-1">
        <h1 className="text-[20px] font-black text-white tracking-[-0.5px] leading-tight">Dars Jadvali</h1>
        <p className="text-[10px] uppercase font-bold tracking-[2px] text-white/40 mt-1">Haftalik timeline jadval</p>
      </div>

      <div className="relative mt-8 px-2 md:px-4">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/10 -translate-x-1/2 hidden md:block"></div>
        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-white/10 md:hidden"></div>

        <div className="space-y-6">
          {scheduleData.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div key={item.day} className={`relative flex items-center md:justify-between flex-col md:flex-row ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Mobile line logic */}
                <div className="absolute left-[14px] top-4 w-5 h-5 rounded-full bg-[#0d0d0d] border-4 border-[#FEC204] z-10 md:left-1/2 md:-translate-x-1/2 shadow flex items-center justify-center">
                </div>

                {/* Empty side for desktop balancing */}
                <div className="hidden md:block w-[45%]"></div>

                {/* Content Card */}
                <div className={`w-full md:w-[45%] pl-12 md:pl-0`}>
                   <div className={`glass-panel p-4 flex flex-col relative transition-all hover:scale-[1.02] ${item.lessons.length > 0 ? 'border-t-2 border-t-[#FEC204] shadow-md' : 'opacity-60 border-t-2 border-t-white/10'}`}>
                      <div className="mb-3 flex items-center justify-between">
                         <h3 className={`text-[16px] font-black ${item.lessons.length > 0 ? 'text-white' : 'text-white/40'}`}>{item.day}</h3>
                         {item.lessons.length > 0 && <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{item.lessons.length} dars</span>}
                      </div>
                      
                      {item.lessons.length > 0 ? (
                        <div className="space-y-3">
                          {item.lessons.map((lesson, i) => (
                             <div key={i} className="bg-white/5 rounded-[10px] p-3 border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="text-[14px] font-[800] text-white">{lesson.subject}</h4>
                                    <p className="text-[11px] font-bold text-white/40">{lesson.teacherName ? `O'qituvchi: ${lesson.teacherName}` : ''}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[13px] font-[800] text-[#FEC204] font-mono tracking-tighter">{lesson.startTime} - {lesson.endTime}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                  <MapPin size={12} className="text-[#FEC204]" />
                                  <span className="text-[11px] font-bold text-white/50">{lesson.location}</span>
                                </div>
                             </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-2 flex items-center gap-2">
                          <SearchX size={16} className="text-white/20" />
                          <p className="text-[12px] font-bold text-white/30">Darslar yo'q</p>
                        </div>
                      )}
                   </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
