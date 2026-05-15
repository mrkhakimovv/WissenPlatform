import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminAttendance() {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snap) => {
      setStudents(snap.docs.map(d => ({id: d.id, ...d.data()})).filter(s => s.role !== 'admin'));
    });
    const unsubAtt = onSnapshot(query(collection(db, 'attendance')), (snap) => {
      setAttendance(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubStudents(); unsubAtt(); }
  }, []);

  const markAttendance = async (studentId: string, status: string) => {
    try {
      await addDoc(collection(db, 'attendance'), {
        studentId,
        date: today,
        status
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-white font-semibold">Kunlik Davomat</h2>
        <span className="text-white/60 text-xs font-medium border border-white/10 px-3 py-1 rounded-full">{today}</span>
      </div>
      
      <div className="space-y-3">
        {students.map(student => {
          const status = getStatus(student.id);
          const initials = student.fullName?.substring(0,2).toUpperCase() || 'ST';
          return (
            <div key={student.id} className="glass-panel-list p-3 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#FEC204] to-[#f59e0b] flex items-center justify-center font-bold text-black">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{student.fullName}</p>
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
        {students.length === 0 && <p className="text-center text-white/40 py-6 text-sm">O'quvchilar yo'q</p>}
      </div>
    </div>
  );
}
