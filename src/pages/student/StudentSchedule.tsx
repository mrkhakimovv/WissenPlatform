import React, { useState, useEffect } from 'react';
import { MapPin, SearchX, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { ScheduleItem, Group } from '../../types';

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
  const [schedules, setSchedules] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const userGroups = user?.groups?.length ? user.groups : (user?.groupId ? [user.groupId] : []);
    if (userGroups.length === 0) return;
    
    const fetchGroups = async () => {
      try {
        const groupDocs = await Promise.all(userGroups.map(id => getDoc(doc(db, 'groups', id))));
        const fetchedGroups = groupDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() } as Group));
        setGroups(fetchedGroups);
        const mappedSchedules: any[] = [];
        fetchedGroups.forEach(g => {
            if (g.days && g.days.length > 0) {
                g.days.forEach(dayStr => {
                    const sched = g.schedule?.[dayStr] || { startTime: g.startTime || '', endTime: g.endTime || '' };
                    mappedSchedules.push({
                        id: Math.random().toString(),
                        groupId: g.id,
                        subject: g.subject || '',
                        teacherName: g.teacherName || '',
                        dayOfWeek: Number(dayStr),
                        startTime: sched.startTime || '',
                        endTime: sched.endTime || '',
                        location: 'Asosiy xona'
                    });
                });
            }
        });
        setSchedules(mappedSchedules);
      } catch (err) {
        console.error("Error fetching groups", err);
      }
    };
    fetchGroups();

    // Build schedules from groups data
    return () => {};
  }, [user]);

  const getGroupName = (groupId: string) => {
    const g = groups.find(x => x.id === groupId);
    return g ? g.name : '';
  };

  const today = new Date();
  const currentDayOfWeek = today.getDay() || 7;
  const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  
  const scheduleData = DAYS.map(dayInfo => {
    const diff = dayInfo.id - currentDayOfWeek;
    const dateForDay = new Date(today);
    dateForDay.setDate(today.getDate() + diff);
    const dateStr = `${dateForDay.getDate()}-${MONTHS[dateForDay.getMonth()]}, ${dateForDay.getFullYear()}`;
    const isToday = diff === 0;

    const daySchedules = schedules
      .filter(s => Number(s.dayOfWeek) === dayInfo.id)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      
    return {
      day: dayInfo.name,
      short: dayInfo.short,
      date: dateStr,
      isToday,
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
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/10 -translate-x-1/2 hidden md:block"></div>
        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-white/10 md:hidden"></div>

        <div className="space-y-6">
          {scheduleData.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div key={item.day} className={`relative flex items-center md:justify-between flex-col md:flex-row ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                <div className="absolute left-[14px] top-4 w-5 h-5 rounded-full bg-[#0d0d0d] border-4 border-[#FEC204] z-10 md:left-1/2 md:-translate-x-1/2 shadow flex items-center justify-center">
                </div>
                <div className="hidden md:block w-[45%]"></div>
                <div className={`w-full md:w-[45%] pl-12 md:pl-0`}> 
                  <div className={`glass-panel p-4 flex flex-col relative transition-all hover:scale-[1.02] ${item.lessons.length > 0 ? 'border-t-2 border-t-[#FEC204] shadow-md' : 'opacity-60 border-t-2 border-t-white/10'} ${item.isToday ? 'ring-2 ring-[#FEC204] shadow-[0_0_20px_rgba(254,194,4,0.1)] !opacity-100' : ''}`}>
                     <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <h3 className={`text-[16px] font-black ${item.lessons.length > 0 ? 'text-white' : 'text-white/40'}`}>{item.day}</h3>
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.isToday ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/60'}`}>{item.date}</span>
                        </div>
                        {item.lessons.length > 0 && <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{item.lessons.length} dars</span>}
                     </div>
                     
                     {item.lessons.length > 0 ? (
                       <div className="space-y-3">
                         {item.lessons.map((lesson, i) => (
                            <div key={i} className="bg-white/5 rounded-[10px] p-3 border border-white/5">
                               <div className="flex justify-between items-start mb-2">
                                 <div>
                                   <h4 className="text-[15px] font-[900] text-white uppercase tracking-wider">{getGroupName(lesson.groupId)}</h4>
                                   <p className="text-[11px] font-bold text-white/40 mt-0.5">{lesson.teacherName ? `O'qituvchi: ${lesson.teacherName}` : ''}</p>
                                   <div className="flex items-center gap-1.5 mt-1.5">
                                      <span className="text-[11px] font-bold text-[#FEC204] lowercase">{lesson.subject}</span>
                                   </div>
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
