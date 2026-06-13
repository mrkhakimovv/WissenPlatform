import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({ fullName: '', username: '', password: '', groupId: '', monthlyFee: '', joinedDate: today });

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubStudents = onSnapshot(q, (snap) => {
      const studs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.role !== 'admin');
      setStudents(studs);
    });
    
    const unsubGroups = onSnapshot(query(collection(db, 'groups')), (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => { unsubStudents(); unsubGroups(); };
  }, []);

  const getProratedInfo = () => {
    if (!formData.joinedDate || !formData.monthlyFee) return null;
    const d = new Date(formData.joinedDate);
    if (isNaN(d.getTime())) return null;
    
    const totalDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const remaining = Math.max(0, totalDays - d.getDate() + 1);
    const percent = remaining / totalDays;
    const amount = Math.round(Number(formData.monthlyFee) * percent);
    
    return {
       percent: Math.round(percent * 100),
       amount,
       remaining,
       totalDays
    };
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'users'), {
        ...formData,
        role: 'student',
        monthlyFee: Number(formData.monthlyFee),
        createdAt: new Date().toISOString()
      });
      toast.success("O'quvchi qo'shildi!");
      setIsModalOpen(false);
      setFormData({ fullName: '', username: '', password: '', groupId: '', monthlyFee: '', joinedDate: today });
    } catch(err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if(confirm(`${name} ni haqiqatan ham o'chirmoqchimisiz?`)) {
      await deleteDoc(doc(db, 'users', id));
      toast.success("O'chirildi");
    }
  };

  const filtered = students.filter(s => s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.username?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full">
      <div className="relative shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--theme-text-primary)]/40" size={18} />
        <input 
          type="text" 
          placeholder="O'quvchilarni qidirish..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full glass-panel py-3 pl-11 pr-4 focus:outline-none focus:border-[#FEC204]/50 text-[color:var(--theme-text-primary)] placeholder-white/30 text-sm"
        />
      </div>

      <div className="space-y-3 pb-8">
        {filtered.map((student, i) => {
          const initials = student.fullName?.substring(0,2).toUpperCase() || 'ST';
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i*0.05 }}
              key={student.id} 
              className="glass-panel-list p-3 flex items-center gap-4"
            >
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-[color:var(--theme-text-primary)] border border-white/5">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[color:var(--theme-text-primary)] text-sm font-semibold truncate flex items-center gap-2">
                  {student.fullName}
                  {student.role === 'teacher' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#FEC204]/40 text-[#FEC204] bg-[#FEC204]/10 uppercase tracking-wider font-bold">O'qituvchi</span>
                  )}
                  {student.role === 'student' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-blue-400/40 text-blue-400 bg-blue-400/10 uppercase tracking-wider font-bold">O'quvchi</span>
                  )}
                </p>
                <p className="text-[color:var(--theme-text-primary)]/40 text-[10px] truncate">@{student.username} {student.groupId && `• ${groups.find(g => g.id === student.groupId)?.name || 'Noma\'lum guruh'}`}</p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <p className="text-[color:var(--theme-text-primary)] text-xs font-bold mr-2">{student.monthlyFee ? `${(student.monthlyFee/1000).toFixed()}k` : '0'}</p>
                <button onClick={() => handleDelete(student.id, student.fullName)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          )
        })}
        {filtered.length === 0 && <p className="text-center text-[color:var(--theme-text-primary)]/40 py-6 text-sm">Topilmadi</p>}
      </div>

      <div className="fixed bottom-[100px] left-0 w-full max-w-[430px] px-6 mx-auto right-0 sm:absolute z-20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FEC204] to-[#f59e0b] text-[#0d0d0d] font-bold shadow-lg shadow-[#FEC204]/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span className="text-xl leading-none">+</span> O'quvchi Qo'shish
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
          <div className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/80">
            <h2 className="text-lg font-bold mb-4 text-[color:var(--theme-text-primary)]">Yangi o'quvchi</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required placeholder="F.I.SH." value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <input required placeholder="Login" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <input required placeholder="Parol" type="text" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <select required value={formData.groupId} onChange={e=>setFormData({...formData, groupId: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm bg-transparent appearance-none">
                <option value="" disabled className="text-[#0d0d0d]">Guruhni tanlang...</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id} className="text-[#0d0d0d]">{g.name}</option>
                ))}
              </select>
              <input required placeholder="Oylik to'lov (so'm)" type="number" value={formData.monthlyFee} onChange={e=>setFormData({...formData, monthlyFee: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              
              <div className="space-y-1">
                <label className="text-[11px] text-[color:var(--theme-text-primary)]/50 px-1 uppercase tracking-wider font-bold">Kelgan sanasi:</label>
                <input required type="date" value={formData.joinedDate} onChange={e=>setFormData({...formData, joinedDate: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)]/90" style={{ colorScheme: "dark" }} />
              </div>

              {formData.monthlyFee && formData.joinedDate && (
                <div className="bg-white/5 border border-[color:var(--glass-border)] rounded-xl p-3 text-[11px] text-[color:var(--theme-text-primary)]/70 space-y-1.5 mt-2">
                  {(() => {
                    const info = getProratedInfo();
                    if(!info) return null;
                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span>Shu oy qolgan kunlar:</span>
                          <span className="font-bold text-[color:var(--theme-text-primary)] bg-white/10 px-2 py-0.5 rounded-full">{info.remaining} / {info.totalDays} ({info.percent}%)</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#FEC204]/10 -mx-3 -mb-3 p-3 rounded-b-xl border-t border-[#FEC204]/20 mt-2">
                          <span className="font-medium text-[#FEC204]">Ushbu oy uchun to'lov:</span>
                          <span className="font-bold text-[#FEC204] text-sm">{info.amount.toLocaleString()} so'm</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
              
              <div className="flex gap-3 pt-2 mt-4">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-[color:var(--glass-border)] text-sm font-medium hover:bg-white/5">Bekor qilish</button>
                <button type="submit" className="flex-1 glass-button py-3 text-sm">Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
