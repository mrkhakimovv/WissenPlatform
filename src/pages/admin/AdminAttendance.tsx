import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ChevronLeft, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminAttendance() {
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snap) => {
      setStudents(snap.docs.map(d => ({id: d.id, ...d.data()})).filter(s => s.role !== 'admin' && s.role !== 'teacher'));
    });
    const unsubAtt = onSnapshot(query(collection(db, 'attendance')), (snap) => {
      setAttendance(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubGroups = onSnapshot(query(collection(db, 'groups')), (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubStudents(); unsubAtt(); unsubGroups(); }
  }, []);

  const markAttendance = async (studentId: string, status: string) => {
    try {
      await addDoc(collection(db, 'attendance'), {
        studentId,
        date: today,
        status,
        groupId: selectedGroupId
      });
      toast.success("Belgilandi");
    } catch(err) {
      toast.error("Xatolik");
    }
  };

  const getStatus = (studentId: string) => {
    const a = attendance.find(a => a.studentId === studentId && a.date === today);
    return a ? a.status : null;
  };

  const groupStudents = students.filter(s => s.groupId === selectedGroupId);
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-3">
          {selectedGroupId && (
            <button onClick={() => setSelectedGroupId(null)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[color:var(--theme-text-primary)]">
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-[color:var(--theme-text-primary)] font-semibold">Kunlik Davomat {selectedGroup && `- ${selectedGroup.name}`}</h2>
          </div>
        </div>
        <span className="text-[color:var(--theme-text-primary)]/60 text-xs font-medium border border-[color:var(--glass-border)] px-3 py-1 rounded-full shrink-0">{today}</span>
      </div>
      
      {!selectedGroupId ? (
        <div className="space-y-3">
          {groups.map(group => {
            const groupStudentCount = students.filter(s => s.groupId === group.id).length;
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
      ) : (
        <div className="space-y-3">
          {groupStudents.map(student => {
            const status = getStatus(student.id);
            const initials = student.fullName?.substring(0,2).toUpperCase() || 'ST';
            return (
              <div key={student.id} className="glass-panel-list p-3 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#FEC204] to-[#f59e0b] flex items-center justify-center font-bold text-[#0d0d0d]">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[color:var(--theme-text-primary)] text-sm font-semibold truncate">{student.fullName}</p>
                  </div>
                </div>

                {status ? (
                  <div className="flex justify-center py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                    {status === 'present' ? <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Kelgan</span> : status === 'absent' ? <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Kelmagan</span> : <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Sababli</span>}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={()=>markAttendance(student.id, 'present')} className="py-2.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl text-xs font-bold border border-green-500/20 transition-colors">Keldi</button>
                    <button onClick={()=>markAttendance(student.id, 'absent')} className="py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold border border-red-500/20 transition-colors">Yo'q</button>
                    <button onClick={()=>markAttendance(student.id, 'excused')} className="py-2.5 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-xl text-xs font-bold border border-yellow-500/20 transition-colors">Sababli</button>
                  </div>
                )}
              </div>
            )
          })}
          {groupStudents.length === 0 && <p className="text-center text-[color:var(--theme-text-primary)]/40 py-6 text-sm">Bu guruhda o'quvchilar yo'q</p>}
        </div>
      )}
    </div>
  );
}
