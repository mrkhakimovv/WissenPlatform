import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ChevronLeft, Users, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminAttendance() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snap) => {
      setStudents(snap.docs.map(d => ({id: d.id, ...(d.data() as any)})).filter(s => s.role !== 'admin' && s.role !== 'teacher' && s.status !== 'archived'));
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
    return () => { unsubStudents(); unsubAtt(); unsubGroups(); unsubPay(); }
  }, []);

  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const groupStudents = selectedGroupId === 'unassigned' 
    ? students.filter(s => !s.groups?.length && !s.groupId).sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''))
    : students.filter(s => s.groups?.includes(selectedGroupId) || s.groupId === selectedGroupId).sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const allowedDaysOfWeek = (selectedGroup?.days || []).map(Number); // e.g. [1, 3, 5]

  const validDates: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeek = dateObj.getDay() || 7;
      if (allowedDaysOfWeek.includes(dayOfWeek)) {
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
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const a = attendance.find(a => a.studentId === studentId && a.date === dateStr);
    return a ? a.status : null;
  };

  const handleArchive = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if(await confirm({ title: 'Diqqat', message: `${name} ni arxivlamoqchimisiz?` })) {
      try {
        await updateDoc(doc(db, 'users', id), { status: 'archived' });
        toast.success("Arxivlandi");
      } catch (err: any) {
        toast.error("Xatolik yuz berdi");
      }
    }
  };

  const toggleAttendance = async (studentId: string, day: number) => {
     const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
              {groups.filter(g => user?.role !== 'teacher' || g.teacherName === user?.fullName).map(group => {
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
                        {selectedGroupId === 'unassigned' ? "Guruhsiz o'quvchilar" : selectedGroup?.name} 
                        {selectedGroup?.startTime && <span className="text-white/40 text-[16px] font-medium">{selectedGroup.startTime}{selectedGroup.endTime ? ` - ${selectedGroup.endTime}` : ''}</span>}
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

           {validDates.length === 0 ? (
             <div className="glass-panel p-8 text-center">
                 <p className="text-white/40 text-sm font-medium">Ushbu guruh uchun dars jadvali (kunlari) belgilanmagan.</p>
             </div>
           ) : (
             <div className="glass-panel overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a]">
               <div className="w-full overflow-x-auto">
                   <table className="w-full text-left border-collapse whitespace-nowrap">
                       <thead>
                           <tr className="bg-[#2a2a2a] border-b border-white/5">
                               <th className="sticky left-0 z-20 bg-[#2a2a2a] p-4 text-[11px] font-bold text-white/50 uppercase tracking-widest min-w-[250px] border-r border-white/5 shadow-[4px_0_12px_rgba(0,0,0,0.1)]">
                                   ISM FAMILIYA
                               </th>
                               {validDates.map(d => (
                                   <th key={d} className="p-4 text-center text-[12px] font-bold text-white w-[50px] min-w-[50px]">
                                       {d}
                                   </th>
                               ))}
                           </tr>
                       </thead>
                       <tbody className="bg-[#1e1e1e]">
                           {groupStudents.map(student => {
                               const debt = getStudentDebt(student.id);
                               return (
                                   <tr key={student.id} className="border-b border-white/5 last:border-0 hover:bg-[#252525] transition-colors group">
                                       <td className="sticky left-0 z-10 bg-[#1e1e1e] group-hover:bg-[#252525] transition-colors p-4 border-r border-white/5 shadow-[4px_0_12px_rgba(0,0,0,0.1)]">
                                           <div className="flex justify-between items-center pr-2">
                                              <div>
                                                  <h4 className="text-[14px] font-bold text-white mb-0.5">{student.fullName}</h4>
                                                  {debt > 0 ? (
                                                      <p className="text-[11px] font-medium text-[#f87171]">{debt.toLocaleString()} so'm qarz</p>
                                                  ) : (
                                                      <p className="text-[11px] font-medium text-[#4ade80]">To'langan</p>
                                                  )}
                                              </div>
                                              <button 
                                                onClick={(e) => handleArchive(e, student.id, student.fullName)}
                                                className="w-6 h-6 rounded flex items-center justify-center text-white/20 hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
                                                title="Arxivlash"
                                              >
                                                 <Archive size={14} />
                                              </button>
                                           </div>
                                       </td>
                                       {validDates.map(d => {
                                           const status = getStatus(student.id, d);
                                           let cellStyle = "bg-white/5 text-transparent border border-white/5";
                                           let label = "";
                                           if (status === 'present') {
                                               cellStyle = "bg-[#065f46]/40 text-[#4ade80] border-[#065f46]/60";
                                               label = "+";
                                           } else if (status === 'absent') {
                                               cellStyle = "bg-[#7f1d1d]/40 text-[#f87171] border-[#7f1d1d]/60";
                                               label = "-";
                                           }
                                           return (
                                               <td key={d} className="p-2 text-center">
                                                   <button 
                                                       onClick={() => toggleAttendance(student.id, d)}
                                                       className={`w-[34px] h-[28px] rounded-[6px] mx-auto flex items-center justify-center text-[15px] font-black transition-all hover:scale-[1.05] ${cellStyle}`}
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
           )}
        </div>
      )}
    </div>
  );
}
