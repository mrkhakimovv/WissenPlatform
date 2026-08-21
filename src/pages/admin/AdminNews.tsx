import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Plus, X, Edit2, Trash2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { NewsItem } from '../../types';
import { sendAutoNotification } from '../../lib/notificationSender';

export default function AdminNews() {
  const { confirm } = useConfirm();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag: '',
    color: '#FEC204',
    active: true
  });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'news'), orderBy('publishedAt', 'desc')), snap => {
      setNews(snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem)));
    });
    return () => unsub();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', tag: 'Yangilik', color: '#FEC204', active: true });
    setIsModalOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      tag: item.tag,
      color: item.color,
      active: item.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ title: 'Diqqat', message: "Yangilikni o'chirishni tasdiqlaysizmi?" })) {
      try {
        await deleteDoc(doc(db, 'news', id));
        toast.success("O'chirildi");
      } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'news', id), { active: !currentActive });
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'news', editingId), formData);
        toast.success("Yangilandi");
      } else {
        await addDoc(collection(db, 'news'), {
          ...formData,
          publishedAt: new Date().toISOString()
        });
        toast.success("Qo'shildi");
        
        // Auto push notification for new news
        const notifRes = await sendAutoNotification({
          title: "Yangi e'lon: " + formData.title,
          body: formData.description.substring(0, 100) + (formData.description.length > 100 ? '...' : ''),
          link: '/student/news',
          target: 'all'
        });
        
        if (notifRes?.success && notifRes.data?.sent !== undefined) {
          toast.success(`Xabarnoma ${notifRes.data.sent} ta kishiga yuborildi. (${notifRes.data.failed} ta xato)`);
        } else {
          toast.error("Xabarnoma yuborilmadi: " + (notifRes?.error || "Xatolik"));
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const presetColors = ['#FEC204', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">Yangiliklar</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">O'quvchilarga e'lon va yangiliklar</p>
        </div>
        <button onClick={openAdd} className="glass-panel px-6 py-3 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black transition-colors rounded-[12px]">
          Yangilik yozish
        </button>
      </div>

      {news.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📢</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali yangiliklar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Barcha o'quvchilarga ko'rinadigan xabarlar va e'lonlar markazini ishlating.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map(item => (
            <div key={item.id} className={`glass-panel p-5 relative transition-opacity ${item.active ? '' : 'opacity-60'}`}>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => toggleActive(item.id, item.active)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.active ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/40'}`}>
                  {item.active ? 'Faol' : 'Nofaol'}
                </button>
                <button onClick={() => openEdit(item)} className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="w-7 h-7 rounded bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
              
              <div className="mb-2 pr-24">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-white/60">{item.tag}</span>
                  <span className="text-[10px] text-white/30 ml-2">{new Date(item.publishedAt).toLocaleDateString('uz-UZ')}</span>
                </div>
                <h3 className="text-[16px] font-bold text-white leading-snug">{item.title}</h3>
              </div>
              
              <p className="text-[13px] text-white/60 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-end md:justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[500px] bg-[#0d0d0d] border border-white/10 rounded-t-[20px] md:rounded-[20px] p-5 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[18px] font-black tracking-tight text-white">{editingId ? 'Yangilikni tahrirlash' : 'Yangi e\'lon'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="Sarlavha" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 font-bold" />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Teg</label>
                  <input required placeholder="Masalan: Yangilik" value={formData.tag} onChange={e=>setFormData({...formData, tag: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Rangi</label>
                  <div className="flex gap-2 p-1 pt-2">
                    {presetColors.map(c => (
                      <button key={c} type="button" onClick={() => setFormData({...formData, color: c})} className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Batafsil matn</label>
                <textarea required placeholder="Yangilik matnini kiriting..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 min-h-[120px] custom-scrollbar" />
              </div>

              <div className="flex items-center gap-3 p-3 glass-panel cursor-pointer" onClick={() => setFormData({...formData, active: !formData.active})}>
                <div className={`w-5 h-5 flex items-center justify-center rounded-[6px] border ${formData.active ? 'bg-[#FEC204] border-[#FEC204]' : 'border-white/20'}`}>
                  {formData.active && <div className="w-2.5 h-2.5 bg-black rounded-sm"></div>}
                </div>
                <span className="text-sm font-bold text-white">Faol (o'quvchilarga ko'rinadi)</span>
              </div>
              
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