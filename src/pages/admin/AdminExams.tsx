import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Plus, X, Edit2, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { Exam, Group } from '../../types';

export default function AdminExams() {
  const { confirm } = useConfirm();
  const [exams, setExams] = useState<Exam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    groupId: '',
    date: '',
    startTime: '',
    duration: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    const unsubExams = onSnapshot(query(collection(db, 'exams'), orderBy('createdAt', 'desc')), snap => {
      setExams(snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam)));
    });
    const unsubGroups = onSnapshot(collection(db, 'groups'), snap => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
    });
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), snap => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubExams(); unsubGroups(); unsubSubjects(); };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ title: '', subject: '', groupId: '', date: '', startTime: '', duration: '', location: '', description: '' });
    setIsModalOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setFormData({
      title: exam.title,
      subject: exam.subject,
      groupId: exam.groupId || '',
      date: exam.date,
      startTime: exam.startTime,
      duration: exam.duration.toString(),
      location: exam.location,
      description: exam.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ title: 'Diqqat', message: "Imtihonni o'chirishni tasdiqlaysizmi?" })) {
      try {
        await deleteDoc(doc(db, 'exams', id));
        toast.success("O'chirildi");
      } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        duration: Number(formData.duration),
      };
      
      if (editingId) {
        await updateDoc(doc(db, 'exams', editingId), dataToSave);
        toast.success("Yangilandi");
      } else {
        await addDoc(collection(db, 'exams'), {
          ...dataToSave,
          createdAt: new Date().toISOString()
        });
        toast.success("Qo'shildi");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const getGroupName = (id?: string) => {
    if (!id) return 'Barcha uchun';
    return groups.find(g => g.id === id)?.name || 'Noma\'lum guruh';
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">Imtihonlar</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz ichki olimpiadalari va testlari</p>
        </div>
        <button onClick={openAdd} className="glass-panel px-6 py-3 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black transition-colors rounded-[12px]">
          Imtihon qo'shish
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📝</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali imtihonlar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Rejalashtirilgan imtihonlar va test sinovlari haqida malumotlar shu yerda qo'shib boriladi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map(exam => (
            <div key={exam.id} className="glass-panel p-5 relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(exam)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(exam.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="mb-3 pr-20">
                <h3 className="text-[16px] font-bold text-white mb-1">{exam.title}</h3>
                <div className="flex gap-2 text-[11px] font-bold">
                  <span className="text-[#FEC204]">{exam.subject}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{getGroupName(exam.groupId)}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Calendar size={14} className="text-white/40" />
                  <span>{new Date(exam.date).toLocaleDateString('uz-UZ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Clock size={14} className="text-white/40" />
                  <span>{exam.startTime} (Davomiyligi: {exam.duration} daqiqa)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin size={14} className="text-white/40" />
                  <span>{exam.location}</span>
                </div>
              </div>
              
              {exam.description && (
                <p className="text-[12px] text-white/50 bg-white/5 p-3 rounded-lg">{exam.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-end md:justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[500px] bg-[#0d0d0d] border border-white/10 rounded-t-[20px] md:rounded-[20px] p-5 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[18px] font-black tracking-tight text-white">{editingId ? 'Imtihonni tahrirlash' : 'Yangi imtihon'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="Imtihon nomi (Masalan: Oylik test)" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              
              <div className="grid grid-cols-2 gap-3">
                <select required value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="" disabled>Fanni tanlang</option>
                  {subjects.map(s => <option key={s.id} value={s.name} className="bg-[#1a1a1a]">{s.name}</option>)}
                </select>

                <select value={formData.groupId} onChange={e=>setFormData({...formData, groupId: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="">Barcha uchun</option>
                  {groups.map(g => <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Sana</label>
                  <input required type="date" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Boshlanish vaqti</label>
                  <input required type="time" value={formData.startTime} onChange={e=>setFormData({...formData, startTime: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" style={{ colorScheme: "dark" }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Davomiyligi (daqiqa)</label>
                  <input required type="number" placeholder="90" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Manzil</label>
                  <input required placeholder="1-xona" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
              </div>

              <textarea placeholder="Qo'shimcha ma'lumot (ixtiyoriy)" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 min-h-[80px] custom-scrollbar" />
              
              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-[#FEC204] text-black font-bold rounded-[12px] text-sm active:scale-[0.98] transition-transform">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
