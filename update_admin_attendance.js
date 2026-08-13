import fs from 'fs';

const code = `import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ChevronLeft, Users, ArchiveBox } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminAttendance() {
  const { confirm } = useConfirm();
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snap) => {
      setStudents(snap.docs.map(d => ({id: d.id, ...(d.data() as any)})).filter(s => s.role !== 'admin' && s.role !== 'teacher'));
    });
    const unsubAtt = onSnapshot(query(collection(db, 'attendance')), (snap) => {
      setAttendance(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubGroups = onSnapshot(query(collection(db, 'groups')), (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubPay = onSnapshot(query(collection(db, 'payments')), (snap) => {
      setPayments(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubSched = onSnapshot(query(collection(db, 'schedules')), (snap) => {
      setSchedules(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubStudents(); unsubAtt(); unsubGroups(); unsubPay(); unsubSched(); }
  }, []);

  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const groupStudents = students.filter(s => s.groups?.includes(selectedGroupId) || s.groupId === selectedGroupId);
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const groupSchedules = schedules.filter(s => s.groupId === selectedGroupId);
  const allowedDaysOfWeek = groupSchedules.map(s => Number(s.dayOfWeek)); // 1 to 7

  const validDates: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeek = dateObj.getDay() || 7;
      if (allowedDaysOfWeek.length === 0 || allowedDaysOfWeek.includes(dayOfWeek)) {
          validDates.push(d);
      }
  }

  const getStudentDebt = (studentId: string) => {
     const student = students.find(s => s.id === studentId);
     const fee = student?.monthlyFee || 0;
     if (fee === 0) return 0;
     
     const currentMonthPayments = payments.filter(p => p.studentId === studentId && p.year === year && p.month === month);
     const totalPaid = currentMonthPayments.reduce((acc, p) => acc + p.amount, 0);
     return Math.max(0, fee - totalPaid);
  };

  const getStatus = (studentId: string, day: number) => {
    const dateStr = \`\${year}-\${String(month).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    const a = attendance.find(a => a.studentId === studentId && a.date === dateStr);
    return a ? a.status : null;
  };

  const toggleAttendance = async (studentId: string, day: number) => {
     const dateStr = \`\${year}-\${String(month).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
     const existing = attendance.find(a => a.studentId === studentId && a.date === dateStr);
     
     let newStatus = 'present';
     if (existing) {
        if (existing.status === 'present') newStatus = 'absent';
        else newStatus = 'delete';
     }
     
     try {
         if (newStatus === 'delete') {
            if (existing) await deleteDoc(doc(db, 'attendance', existing.id));
         } else if (existing) {
            await updateDoc(doc(db, 'attendance', existing.id), { status: newStatus });
         } else {
            await addDoc(collection(db, 'attendance'), {
               studentId,
               date: dateStr,
               status: newStatus,
               groupId: selectedGroupId
            });
         }
     } catch (err) {
         toast.error("Xatolik yuz berdi");
     }
  };

  // Stats calculation
  const qarzdorlarCount = groupStudents.filter(s => getStudentDebt(s.id) > 0).length;
  
  let totalPresents = 0;
  let totalRecords = 0;
  groupStudents.forEach(s => {
      validDates.forEach(d => {
          const st = getStatus(s.id, d);
          if (st) totalRecords++;
          if (st === 'present') totalPresents++;
      });
  });
  const davomatPercent = totalRecords > 0 ? Math.round((totalPresents / totalRecords) * 100) : 0;
  const darslarSoni = validDates.length;

  return (
    <div className="space-y-6">
      {!selectedGroupId ? (
        <>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-[20px] font-black text-white tracking-[-0.5px]">Davomat</h2>
              <input 
                type="month" 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-white/5 text-[color:var(--theme-text-primary)] text-xs font-medium border border-[color:var(--glass-border)] px-2 py-1.5 rounded-lg shrink-0 outline-none focus:border-[#FEC204]/50"
              />
            </div>
            
            <div className="space-y-3">
              {groups.map(group => {
                const groupStudentCount = students.filter(s => s.groups?.includes(group.id) || s.groupId === group.id).length;
                return (
                  <motion.div 
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedGroupId(group.id)}
                    className="glass-panel-list p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <h3 className="text-[color:var(--theme-text-primary)] font-bold mb-1">{group.name}</h3>
                      <p className="text-[color:var(--theme-text-primary)]/40 text-xs">{group.subject} • {group.teacherName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[color:var(--theme-text-primary)]/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-xs font-medium">
                      <Users size={14} /> {groupStudentCount} 
                    </div>
                  </motion.div>
                )
              })}
              {groups.length === 0 && <p className="text-center text-[color:var(--theme-text-primary)]/40 py-6 text-sm">Guruhlar yo'q</p>}
            </div>
        </>
      ) : (
        <div className="space-y-6">
           <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={() => setSelectedGroupId(null)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[color:var(--theme-text-primary)]">
                    <ChevronLeft size={20} />
                 </button>
                 <div>
                    <h2 className="text-[20px] font-black text-white flex items-center gap-3">
                        {selectedGroup?.name} 
                        {groupSchedules.length > 0 && <span className="text-white/40 text-[16px] font-medium">{groupSchedules[0].startTime}</span>}
                    </h2>
                    <p className="text-[12px] font-bold text-white/40 mt-1">{darslarSoni} ta dars • {groupStudents.length} ta o'quvchi</p>
                 </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                 <div>
                     <p className="text-green-400 text-[18px] font-black leading-none">{davomatPercent}%</p>
                     <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Davomat</p>
                 </div>
                 <div>
                     <p className="text-red-500 text-[18px] font-black leading-none">{qarzdorlarCount}</p>
                     <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Qarzdor</p>
                 </div>
              </div>
           </div>

           <div className="glass-panel overflow-hidden">
               <div className="w-full overflow-x-auto">
                   <table className="w-full text-left border-collapse whitespace-nowrap">
                       <thead>
                           <tr>
                               <th className="sticky left-0 z-10 bg-[#121212]/95 backdrop-blur border-b border-white/10 p-4 text-[10px] font-bold text-white/40 uppercase tracking-widest min-w-[250px]">
                                   Ism Familiya
                               </th>
                               {validDates.map(d => (
                                   <th key={d} className="border-b border-white/10 p-4 text-center text-[12px] font-bold text-white w-12 min-w-[48px]">
                                       {d}
                                   </th>
                               ))}
                           </tr>
                       </thead>
                       <tbody>
                           {groupStudents.map(student => {
                               const debt = getStudentDebt(student.id);
                               return (
                                   <tr key={student.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                       <td className="sticky left-0 z-10 bg-[#151515] p-4 border-r border-white/5">
                                           <div className="flex justify-between items-center pr-2">
                                              <div>
                                                  <h4 className="text-[14px] font-bold text-white mb-1">{student.fullName}</h4>
                                                  {debt > 0 ? (
                                                      <p className="text-[11px] font-bold text-red-500">{debt.toLocaleString()} so'm qarz</p>
                                                  ) : (
                                                      <p className="text-[11px] font-bold text-green-400">To'langan</p>
                                                  )}
                                              </div>
                                              {/* Just a placeholder icon like in the screenshot */}
                                              <div className="w-6 h-6 rounded border border-white/10 flex items-center justify-center text-white/20">
                                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
                                              </div>
                                           </div>
                                       </td>
                                       {validDates.map(d => {
                                           const status = getStatus(student.id, d);
                                           let cellStyle = "bg-white/5 text-transparent border border-white/5";
                                           let label = "";
                                           if (status === 'present') {
                                               cellStyle = "bg-green-500/20 text-green-400 border-green-500/20";
                                               label = "+";
                                           } else if (status === 'absent') {
                                               cellStyle = "bg-red-500/20 text-red-500 border-red-500/20";
                                               label = "-";
                                           }
                                           return (
                                               <td key={d} className="p-2 text-center">
                                                   <button 
                                                       onClick={() => toggleAttendance(student.id, d)}
                                                       className={\`w-8 h-8 rounded-[6px] mx-auto flex items-center justify-center text-[16px] font-black transition-colors \${cellStyle}\`}
                                                   >
                                                       {label}
                                                   </button>
                                               </td>
                                           );
                                       })}
                                   </tr>
                               );
                           })}
                           {groupStudents.length === 0 && (
                               <tr>
                                   <td colSpan={validDates.length + 1} className="p-8 text-center text-white/40 text-sm font-medium">
                                       O'quvchilar yo'q
                                   </td>
                               </tr>
                           )}
                       </tbody>
                   </table>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/AdminAttendance.tsx', code);
