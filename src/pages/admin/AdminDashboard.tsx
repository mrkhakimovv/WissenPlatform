import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    paidThisMonth: 0,
    unpaidThisMonth: 0,
    attendanceRate: 0,
    subjects: 0
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'teacher') {
      navigate('/admin/students', { replace: true });
      return;
    }
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];

    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStats(s => ({ ...s, students: snap.docs.length }));
    });

    const qSubjects = query(collection(db, 'subjects'));
    const unsubSubjects = onSnapshot(qSubjects, (snap) => {
      setStats(s => ({ ...s, subjects: snap.docs.length }));
    });

    const qPayments = query(collection(db, 'payments'), where('month', '==', currentMonth), where('year', '==', currentYear));
    const unsubPayments = onSnapshot(qPayments, (snap) => {
      let paid = 0;
      let unpaid = 0;
      snap.docs.forEach(doc => {
        if(doc.data().status === 'paid') paid++;
        else if (doc.data().status === 'unpaid') unpaid++;
      });
      setStats(s => ({ ...s, paidThisMonth: paid, unpaidThisMonth: unpaid }));
    });

    // Only fetch payments that are actually paid, ordered by paidAt
    const qRecentPayments = query(collection(db, 'payments'), where('status', '==', 'paid'), orderBy('paidAt', 'desc'), limit(5));
    const unsubRecentPayments = onSnapshot(qRecentPayments, async (snap) => {
      const data = await Promise.all(snap.docs.map(async (d) => {
        const p = d.data();
        let studentName = 'Noma\'lum o\'quvchi';
        if (p.studentId) {
           try {
             const userDoc = await getDoc(doc(db, 'users', p.studentId));
             if (userDoc.exists()) {
               studentName = userDoc.data().fullName || 'Noma\'lum';
             }
           } catch (e) {
             console.error("Error fetching user", e);
           }
        }
        return { id: d.id, studentName, ...p };
      }));
      setRecentPayments(data);
    });

    // Attendance rate for current month
    const qAttendance = query(collection(db, 'attendance'), where('date', '>=', startOfMonth));
    const unsubAttendance = onSnapshot(qAttendance, (snap) => {
      let present = 0;
      snap.docs.forEach(doc => {
        if(doc.data().status === 'present' || doc.data().present) present++;
      });
      const total = snap.docs.length || 1;
      setStats(s => ({ ...s, attendanceRate: snap.docs.length === 0 ? 0 : Math.round((present / total) * 100) }));
    });

    return () => { 
       unsubStudents(); 
       unsubSubjects(); 
       unsubPayments(); 
       unsubRecentPayments(); 
       unsubAttendance();
    };
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
        <div onClick={() => navigate('/admin/students', { replace: true })} className="glass-panel p-4 md:p-6 border-l-4 border-[#FEC204] hover:scale-[1.02] transition-transform cursor-pointer">
          <p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">O'quvchilar</p>
          <p className="text-[26px] md:text-[32px] font-[900] tracking-[-1px] text-white">{stats.students}</p>
          <p className="text-xs font-bold text-white/40 mt-1.5">+ Barcha</p>
        </div>
        
        <div onClick={() => navigate('/admin/attendance', { replace: true })} className="glass-panel p-4 md:p-6 border-l-4 border-[#FEC204] hover:scale-[1.02] transition-transform cursor-pointer">
          <p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">Davomat %</p>
          <p className="text-[26px] md:text-[32px] font-[900] tracking-[-1px] text-white">{stats.attendanceRate}%</p>
          <div className="w-full h-1.5 bg-[#f0f0f0]/20 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#FEC204] h-full" style={{ width: `${stats.attendanceRate}%` }}></div>
          </div>
        </div>

        <div onClick={() => navigate('/admin/more', { replace: true })} className="glass-panel p-4 md:p-6 border-l-4 border-[#FEC204] hover:scale-[1.02] transition-transform cursor-pointer">
          <p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">Fanlar</p>
          <p className="text-[26px] md:text-[32px] font-[900] tracking-[-1px] text-white">{stats.subjects}</p>
          <p className="text-xs font-bold text-white/40 mt-1.5">Aktiv kurslar</p>
        </div>

        <div onClick={() => navigate('/admin/payments', { replace: true })} className="glass-panel p-4 md:p-6 border-l-4 border-[#FEC204] hover:scale-[1.02] transition-transform cursor-pointer">
          <p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">To'lovlar</p>
          <p className="text-[26px] md:text-[32px] font-[900] tracking-[-1px] text-white">{stats.paidThisMonth}</p>
          <p className="text-xs font-bold text-white/40 mt-1.5">Shu oyda to'laganlar</p>
        </div>
      </div>

      <div className="h-[1px] bg-white/10 w-full mb-6"></div>

      <div className="flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
          <h2 className="text-[13px] md:text-[16px] text-white font-bold tracking-wide">So'nggi to'lovlar</h2>
          <button onClick={() => navigate('/admin/payments', { replace: true })} className="text-[#FEC204] text-[13px] md:text-[14px] font-bold hover:underline transition-all">Barchasi &rarr;</button>
        </div>
        
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-5">
          {recentPayments.length === 0 && <p className="text-white/40 col-span-2 text-sm italic">Hozircha to'lovlar yo'q</p>}
          {recentPayments.map((p) => {
            const initials = p.studentName ? p.studentName.split(' ').map((n: string) => n[0]).join('') : 'U';
            return (
              <div key={p.id} onClick={() => navigate('/admin/students', { replace: true })} className="glass-panel p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:border-[#FEC204]/50 cursor-pointer group transition-all">
                <div className="w-[38px] h-[38px] md:w-[48px] md:h-[48px] rounded-[10px] md:rounded-[14px] bg-gradient-to-br from-[#FEC204] to-amber-500 shadow-md flex items-center justify-center font-[800] text-[#000] text-[13px] md:text-[16px] group-hover:scale-105 transition-transform uppercase">{initials.substring(0, 2)}</div>
                <div className="flex-1">
                  <p className="text-white text-[13px] md:text-[15px] font-bold tracking-wide">{p.studentName}</p>
                  <p className="text-white/40 text-[10px] md:text-[12px] uppercase font-bold tracking-wider mt-0.5">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'Yaqinda'}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-[18px] md:text-[22px] font-black tracking-[-0.5px]">{Number(p.amount).toLocaleString()}</p>
                  <span className={`rounded-full mt-1 inline-block shadow-sm ${p.status === 'paid' ? 'badge-green' : 'badge-red'}`}>{p.status === 'paid' ? "To'landi" : "To'lanmagan"}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
