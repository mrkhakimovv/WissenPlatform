import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Plus, X, Trash2, Calendar, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Group } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminHomeworks() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    groupId: '',
    deadline: ''
  });
  const [teacherImages, setTeacherImages] = useState<{data: string, mimeType: string}[]>([]);
  const [teacherAnalysis, setTeacherAnalysis] = useState<any>(null);

  useEffect(() => {
    const unsubHW = onSnapshot(query(collection(db, 'homeworks'), orderBy('createdAt', 'desc')), snap => {
      setHomeworks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubGroups = onSnapshot(collection(db, 'groups'), snap => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
    });
    return () => { unsubHW(); unsubGroups(); };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImages: {data: string, mimeType: string}[] = [];
    let processed = 0;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        // Data URL format: data:image/png;base64,....
        const [header, base64] = result.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        
        newImages.push({ data: base64, mimeType });
        processed++;
        if (processed === files.length) {
          setTeacherImages(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (teacherImages.length === 0) return toast.error("Rasmlar tanlanmagan");
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-teacher-examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: teacherImages })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Noma\'lum xatolik');
      
      setTeacherAnalysis(data);
      toast.success("Tahlil muvaffaqiyatli yakunlandi!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'homeworks'), {
        ...formData,
        teacherAnalysis,
        createdAt: new Date().toISOString()
      });
      toast.success("Vazifa yaratildi");
      setIsModalOpen(false);
      setFormData({ title: '', description: '', groupId: '', deadline: '' });
      setTeacherImages([]);
      setTeacherAnalysis(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ title: 'Diqqat', message: 'Vazifani o\'chirishni tasdiqlaysizmi?' })) {
      await deleteDoc(doc(db, 'homeworks', id));
      toast.success("O'chirildi");
    }
  };

  const teacherGroups = groups.filter(g => user?.role !== 'teacher' || g.teacherName === user?.fullName);
  const filteredHomeworks = homeworks.filter(hw => user?.role !== 'teacher' || teacherGroups.some(g => g.id === hw.groupId));

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[24px] font-black text-white tracking-[-0.5px]">Uy Vazifalari</h1>
          <p className="text-[12px] font-bold text-white/40 mt-1 uppercase tracking-[1px]">AI orqali tekshirish</p>
        </div>
        <button onClick={() => {
          setIsModalOpen(true);
          setFormData({ title: '', description: '', groupId: '', deadline: '' });
          setTeacherImages([]);
          setTeacherAnalysis(null);
        }} className="btn-primary w-full md:w-auto py-3 px-6 rounded-xl text-[13px] uppercase tracking-[1px]">
          <Plus size={18} className="mr-2 inline-block" /> Yangi vazifa
        </button>
      </div>

      <div className="space-y-3 pb-24 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 flex-1">
        {filteredHomeworks.map(hw => (
          <div key={hw.id} className="glass-panel-list p-5 flex flex-col group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[16px] font-bold text-white mb-1 leading-tight">{hw.title}</h3>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                  {groups.find(g => g.id === hw.groupId)?.name || 'Barcha'}
                </p>
              </div>
              <button onClick={() => handleDelete(hw.id)} className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            
            <p className="text-sm text-white/60 mb-4 line-clamp-2">{hw.description}</p>
            
            <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 text-[12px] font-bold text-white/50">
                <Calendar size={14} className="text-[#FEC204]" />
                Muddati: {hw.deadline ? new Date(hw.deadline).toLocaleString('uz-UZ') : "Noma'lum"}
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold text-white/50">
                <FileText size={14} className={hw.teacherAnalysis ? "text-green-400" : "text-white/20"} />
                AI Reference: {hw.teacherAnalysis ? "Mavjud" : "Yo'q"}
              </div>
            </div>
          </div>
        ))}
        {homeworks.length === 0 && <p className="text-center text-white/40 py-6 text-sm col-span-full">Vazifalar yo'q</p>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-[18px] font-black tracking-tight text-white">Yangi vazifa yaratish</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4 overflow-y-auto pr-2 pb-2">
              <div>
                <label className="block text-[11px] uppercase tracking-[1px] font-bold text-white/40 mb-1.5 ml-1">Sarlavha</label>
                <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[1px] font-bold text-white/40 mb-1.5 ml-1">Tavsif</label>
                <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[1px] font-bold text-white/40 mb-1.5 ml-1">Guruh</label>
                  <select required value={formData.groupId} onChange={e=>setFormData({...formData, groupId: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white appearance-none" style={{ colorScheme: "dark" }}>
                    <option value="" disabled className="bg-[#1a1a1a]">Tanlang</option>
                    {teacherGroups.map(g => <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[1px] font-bold text-white/40 mb-1.5 ml-1">Muddat</label>
                  <input required type="datetime-local" value={formData.deadline} onChange={e=>setFormData({...formData, deadline: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white appearance-none" style={{ colorScheme: "dark" }} />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 mt-4">
                <label className="block text-[11px] uppercase tracking-[1px] font-bold text-[#FEC204] mb-1.5 ml-1">AI Tahlil Uchun Namuna (Ixtiyoriy)</label>
                <p className="text-xs text-white/40 mb-3">O'z yechimingiz rasmlarini yuklang. AI ularni o'rganib, talabalar ishini tekshirish uchun "Reference" yaratadi.</p>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-white hover:file:bg-white/10 transition-colors mb-3" />
                
                {teacherImages.length > 0 && !teacherAnalysis && (
                  <button type="button" onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-2 bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider rounded-xl border border-blue-500/20 hover:bg-blue-500/30 transition-colors flex items-center justify-center">
                    {isAnalyzing ? <Loader2 size={16} className="animate-spin mr-2" /> : <ImageIcon size={16} className="mr-2" />}
                    {isAnalyzing ? 'Tahlil qilinmoqda...' : 'Tahlil qilish'}
                  </button>
                )}
                {teacherAnalysis && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-400 font-bold text-xs">AI Tahlil muvaffaqiyatli yakunlandi!</p>
                    <p className="text-green-400/70 text-[10px] mt-1">Jami savollar: {teacherAnalysis.questionCount}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 glass-button py-3 text-sm">Bekor qilish</button>
                <button type="submit" className="flex-1 btn-primary py-3 text-sm">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
