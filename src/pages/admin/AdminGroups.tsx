import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, where, doc, deleteDoc, updateDoc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Plus, Search, Users, Trash2, Edit2, X, QrCode, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminGroups() {
  const { confirm } = useConfirm();
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    subject: '', 
    teacherName: '',
    days: [] as string[],
    startTime: '',
    endTime: '',
    schedule: {} as Record<string, {startTime: string, endTime: string}>,
    monthlyFee: ''
  });

  const WEEKDAYS = [
    { id: '1', label: 'Du' },
    { id: '2', label: 'Se' },
    { id: '3', label: 'Ch' },
    { id: '4', label: 'Pa' },
    { id: '5', label: 'Ju' },
    { id: '6', label: 'Sh' },
    { id: '7', label: 'Ya' }
  ];

  useEffect(() => {
    const unsubGroups = onSnapshot(query(collection(db, 'groups'), orderBy('createdAt', 'desc')), snap => {
      setGroups(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubStudents = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), snap => {
      setStudents(snap.docs.map(d => ({id: d.id, ...d.data()})).filter((s: any) => s.status !== 'archived'));
    });
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), snap => {
      setSubjects(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubTeachers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'teacher')), snap => {
      setTeachers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubGroups(); unsubStudents(); unsubSubjects(); unsubTeachers(); }
  }, []);

  const getStudentCount = (groupId: string) => students.filter(s => s.groups?.includes(groupId) || s.groupId === groupId).length;
  
  const filteredGroups = groups.filter(g => g.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateDoc(doc(db, 'groups', editingGroup.id), formData);
        
        // Update all students in this group
        if (formData.monthlyFee && Number(formData.monthlyFee) > 0) {
          const groupStudents = students.filter(s => s.groups?.includes(editingGroup.id) || s.groupId === editingGroup.id);
          const promises = groupStudents.map(student => 
             updateDoc(doc(db, 'users', student.id), { monthlyFee: Number(formData.monthlyFee) })
          );
          await Promise.all(promises);
        }
        toast.success("Guruh yangilandi");
      } else {
        const newGroupRef = await addDoc(collection(db, 'groups'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        // (New groups don't have students yet, so no need to update students)
        toast.success("Guruh qo'shildi");
      }
      setIsModalOpen(false);
      setEditingGroup(null);
      setFormData({ name: '', subject: '', teacherName: '', days: [], startTime: '', endTime: '', schedule: {}, monthlyFee: '' });
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const openEdit = (group: any) => {
    setEditingGroup(group);
    setFormData({ 
      name: group.name || '', 
      subject: group.subject || '', 
      teacherName: group.teacherName || '',
      days: group.days || [],
      startTime: group.startTime || '',
      endTime: group.endTime || '',
      schedule: group.schedule || {},
      monthlyFee: group.monthlyFee || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (groupId: string) => {
    const count = getStudentCount(groupId);
    if (count > 0) {
      toast.error(`Bu guruhda ${count} ta o'quvchi bor. Avval ularni boshqa guruhga o'tkazing.`);
      return;
    }
    if (await confirm({ title: 'Diqqat', message: "Guruhni o'chirishni tasdiqlaysizmi?" })) {
      try {
        await deleteDoc(doc(db, 'groups', groupId));
        toast.success("O'chirildi");
      } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[20px] font-black tracking-[-0.5px] text-white">Guruhlar</h1>
        <button 
          onClick={() => {
            setEditingGroup(null);
            setFormData({ name: '', subject: '', teacherName: '', days: [], startTime: '', endTime: '', schedule: {}, monthlyFee: '' });
            setIsModalOpen(true);
          }}
          className="w-10 h-10 rounded-[12px] bg-[#FEC204] flex items-center justify-center text-[#000] shadow-sm transform active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search size={16} className="text-white/40" />
        </div>
        <input 
          type="text"
          placeholder="Guruh nomini qidirish..."
          value={searchTerm || ""}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 pl-11 !rounded-[10px]"
        />
      </div>

      <div className="flex flex-col gap-3 mt-4 pb-20">
        {filteredGroups.length === 0 ? (
          <div className="glass-panel p-4 border-dashed flex flex-col items-center justify-center py-10 opacity-70">
            <Users size={32} className="text-white/40 mb-3" />
            <p className="text-[14px] font-bold text-white/40">Guruhlar topilmadi</p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <div key={group.id} className="glass-panel p-4 !rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 active:border-[rgba(254,194,4,0.4)] transition-colors hover:border-[rgba(254,194,4,0.3)]">
              <div className="flex-1 pr-2">
                <h3 className="text-[14px] font-[700] text-white">{group.name || "Nomsiz guruh"}</h3>
                <p className="text-[11px] text-white/40 mt-1 font-medium flex items-center gap-2 flex-wrap">
                  {group.subject || "Fan ko'rsatilmagan"} • {group.teacherName || "O'qituvchi tanlanmagan"}
                  {(group.days?.length > 0) && (
                    <span className="inline-flex items-center gap-1 flex-wrap">
                      {WEEKDAYS.filter(w => group.days.includes(w.id)).map(w => {
                        const sched = group.schedule?.[w.id] || { startTime: group.startTime || '', endTime: group.endTime || '' };
                        return (
                          <span key={w.id} className="bg-white/5 px-2 py-0.5 rounded text-[10px]">
                            {w.label} {sched.startTime ? `${sched.startTime}${sched.endTime ? `-${sched.endTime}` : ''}` : ''}
                          </span>
                        );
                      })}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center mr-2">
                  <span className="text-[18px] font-[800] text-[#FEC204] tracking-[-0.5px] leading-none">{getStudentCount(group.id)}</span>
                  <p className="text-[9px] uppercase tracking-[1px] font-bold text-white/40">o'quvchi</p>
                </div>
                <button onClick={() => openEdit(group)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(group.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-end md:justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[400px] bg-[#0d0d0d] border border-white/10 rounded-t-[20px] md:rounded-[20px] p-5 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[18px] font-black tracking-tight text-white">{editingGroup ? 'Guruhni tahrirlash' : 'Yangi guruh'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <input placeholder="Guruh nomi" value={formData.name || ""} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              
              <input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="Oylik to'lov summasi (so'm)" value={formData.monthlyFee || ""} onChange={e=>setFormData({...formData, monthlyFee: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              
              <select value={formData.subject || ""} onChange={e=>setFormData({...formData, subject: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                <option value="" disabled>Fanni tanlang</option>
                {subjects.map(s => <option key={s.id} value={s.name || ""} className="bg-[#1a1a1a]">{s.name}</option>)}
              </select>

              <select value={formData.teacherName || ""} onChange={e=>setFormData({...formData, teacherName: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                <option value="" disabled>O'qituvchini tanlang</option>
                {teachers.map(t => <option key={t.id} value={t.fullName || ""} className="bg-[#1a1a1a]">{t.fullName}</option>)}
              </select>

              <div className="space-y-2">
                <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold block">Dars kunlari</label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        const days = formData.days.includes(day.id) 
                          ? formData.days.filter(d => d !== day.id)
                          : [...formData.days, day.id];
                        setFormData({...formData, days});
                      }}
                      className={`w-9 h-9 rounded-full text-[12px] font-bold transition-colors ${
                        formData.days.includes(day.id) 
                        ? 'bg-[#FEC204] text-black' 
                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.days.length > 0 && (
                <div className="space-y-3 mt-4">
                  <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold block mb-2">Dars vaqtlari</label>
                  {WEEKDAYS.filter(w => formData.days.includes(w.id)).map(day => {
                    const sched = formData.schedule[day.id] || { startTime: formData.startTime || '', endTime: formData.endTime || '' };
                    return (
                      <div key={day.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                        <span className="text-[12px] font-bold text-[#FEC204] w-8 text-center">{day.label}</span>
                        <div className="flex-1">
                          <input 
                            type="time" 
                            value={sched.startTime || ""} 
                            onChange={e => setFormData({
                              ...formData, 
                              schedule: { ...formData.schedule, [day.id]: { ...sched, startTime: e.target.value } }
                            })} 
                            className="w-full bg-black/20 rounded-lg p-2 outline-none focus:border-[#FEC204]/50 border border-transparent text-sm text-white" 
                            style={{ colorScheme: "dark" }} 
                          />
                        </div>
                        <span className="text-white/40">-</span>
                        <div className="flex-1">
                          <input 
                            type="time" 
                            value={sched.endTime || ""} 
                            onChange={e => setFormData({
                              ...formData, 
                              schedule: { ...formData.schedule, [day.id]: { ...sched, endTime: e.target.value } }
                            })} 
                            className="w-full bg-black/20 rounded-lg p-2 outline-none focus:border-[#FEC204]/50 border border-transparent text-sm text-white" 
                            style={{ colorScheme: "dark" }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
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
