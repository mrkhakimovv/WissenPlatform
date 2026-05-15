import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', username: '', password: '', subject: '', monthlyFee: '' });

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      const studs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.role !== 'admin');
      setStudents(studs);
    });
    return unsub;
  }, []);

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
      setFormData({ fullName: '', username: '', password: '', subject: '', monthlyFee: '' });
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input 
          type="text" 
          placeholder="O'quvchilarni qidirish..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full glass-panel py-3 pl-11 pr-4 focus:outline-none focus:border-[#FEC204]/50 text-white placeholder-white/30 text-sm"
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
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-white border border-white/5">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{student.fullName}</p>
                <p className="text-white/40 text-[10px] truncate">@{student.username} • {student.subject || 'Fan yuq'}</p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <p className="text-white text-xs font-bold mr-2">{student.monthlyFee ? `${(student.monthlyFee/1000).toFixed()}k` : '0'}</p>
                <button onClick={() => handleDelete(student.id, student.fullName)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          )
        })}
        {filtered.length === 0 && <p className="text-center text-white/40 py-6 text-sm">Topilmadi</p>}
      </div>

      <div className="fixed bottom-[100px] left-0 w-full max-w-[430px] px-6 mx-auto right-0 sm:absolute z-20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FEC204] to-[#f59e0b] text-black font-bold shadow-lg shadow-[#FEC204]/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span className="text-xl leading-none">+</span> O'quvchi Qo'shish
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
          <div className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/80">
            <h2 className="text-lg font-bold mb-4 text-white">Yangi o'quvchi</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required placeholder="F.I.SH." value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <input required placeholder="Login" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <input required placeholder="Parol" type="text" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <input placeholder="Fan" value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <input required placeholder="Oylik to'lov (so'm)" type="number" value={formData.monthlyFee} onChange={e=>setFormData({...formData, monthlyFee: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              
              <div className="flex gap-3 pt-2 mt-6">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5">Bekor qilish</button>
                <button type="submit" className="flex-1 glass-button py-3 text-sm">Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
