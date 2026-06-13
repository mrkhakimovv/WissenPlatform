import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    paidThisMonth: 0,
    unpaidThisMonth: 0,
    attendanceRate: 0,
    subjects: 0
  });

  useEffect(() => {
    const qStudents = query(collection(db, 'users'));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      const students = snap.docs.filter(d => d.data().role !== 'admin').length;
      setStats(s => ({ ...s, students }));
    });

    const qSubjects = query(collection(db, 'subjects'));
    const unsubSubjects = onSnapshot(qSubjects, (snap) => {
      setStats(s => ({ ...s, subjects: snap.size }));
    });

    const qPayments = query(collection(db, 'payments'));
    const unsubPayments = onSnapshot(qPayments, (snap) => {
      let paid = 0;
      let unpaid = 0;
      snap.docs.forEach(doc => {
        if(doc.data().status === 'paid') paid++;
        else if (doc.data().status === 'unpaid') unpaid++;
      });
      setStats(s => ({ ...s, paidThisMonth: paid, unpaidThisMonth: unpaid }));
    });

    return () => {
      unsubStudents();
      unsubSubjects();
      unsubPayments();
    };
  }, []);

  const statCards = [
    { title: "O'quvchilar", value: stats.students, subtitle: "+ Yangilandi" },
    { title: "Davomat", value: "94%", subtitle: "Zo'r natija" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel p-4"
        >
          <p className="text-[color:var(--theme-text-primary)]/40 text-[10px] uppercase font-bold mb-1">O'quvchilar</p>
          <p className="text-2xl font-bold text-[color:var(--theme-text-primary)]">{stats.students}</p>
          <p className="text-[#FEC204] text-[10px] font-medium mt-1">+ Barcha guruhlar</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-panel p-4"
        >
          <p className="text-[color:var(--theme-text-primary)]/40 text-[10px] uppercase font-bold mb-1">Davomat O'rtacha</p>
          <p className="text-2xl font-bold text-[color:var(--theme-text-primary)]">92%</p>
          <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#FEC204] h-full w-[92%]"></div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-panel p-4"
        >
          <p className="text-[color:var(--theme-text-primary)]/40 text-[10px] uppercase font-bold mb-1">Fanlar</p>
          <p className="text-2xl font-bold text-[color:var(--theme-text-primary)]">{stats.subjects}</p>
          <p className="text-[#FEC204] text-[10px] font-medium mt-1">Aktiv kurslar</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="glass-panel p-4"
        >
          <p className="text-[color:var(--theme-text-primary)]/40 text-[10px] uppercase font-bold mb-1">To'lovlar</p>
          <p className="text-2xl font-bold text-[color:var(--theme-text-primary)]">{stats.paidThisMonth}</p>
          <p className="text-[#FEC204] text-[10px] font-medium mt-1">Bu oy to'laganlar</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex flex-col min-h-0"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[color:var(--theme-text-primary)] font-semibold">So'nggi to'lovlar</h2>
          <button className="text-[#FEC204] text-xs font-medium">Barchasi</button>
        </div>
        
        <div className="space-y-3">
          <div className="group glass-panel-list p-3 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEC204] to-[#f59e0b] flex items-center justify-center font-bold text-[#0d0d0d] border border-[color:var(--glass-border)]">AR</div>
            <div className="flex-1">
              <p className="text-[color:var(--theme-text-primary)] text-sm font-semibold">Asadbek Rustamov</p>
              <p className="text-[color:var(--theme-text-primary)]/40 text-[10px]">Matematika • G-24</p>
            </div>
            <div className="text-right">
              <p className="text-[color:var(--theme-text-primary)] text-sm font-bold">450,000</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">To'landi</span>
            </div>
          </div>
          
          <div className="glass-panel-list p-3 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEC204] to-[#f59e0b] flex items-center justify-center font-bold text-[#0d0d0d] border border-[color:var(--glass-border)]">ZM</div>
            <div className="flex-1">
              <p className="text-[color:var(--theme-text-primary)] text-sm font-semibold">Zilola Mansurova</p>
              <p className="text-[color:var(--theme-text-primary)]/40 text-[10px]">English • IELTS 7.0</p>
            </div>
            <div className="text-right">
              <p className="text-[color:var(--theme-text-primary)] text-sm font-bold">500,000</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">Kutilmoqda</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
