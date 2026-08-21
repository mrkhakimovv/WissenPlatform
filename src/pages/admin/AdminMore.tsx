import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc, getDocs, where, secondaryAuth, createUserWithEmailAndPassword } from '../../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { GraduationCap, ChevronRight, X, UserPlus, BookOpen, Calendar as CalendarIcon, ArrowLeft, Trash2, Edit2, QrCode } from 'lucide-react';
import { ScheduleItem } from '../../types';

import { Bell, Send } from 'lucide-react';
import { auth } from '../../lib/firebase';

function NotificationsTab({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [target, setTarget] = useState('all');
  const [targetId, setTargetId] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const unsubG = onSnapshot(collection(db, 'groups'), snap => setGroups(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubS = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), snap => setStudents(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    
    // Notif history
    // Since we don't have indexes, just fetch and sort client side
    const unsubN = onSnapshot(collection(db, 'notifications'), snap => {
      const all = snap.docs.map(d => ({id: d.id, ...d.data()}));
      all.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistory(all.slice(0, 20));
    });
    
    return () => { unsubG(); unsubS(); unsubN(); };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      const idToken = await auth.currentUser.getIdToken(true);
      
      const res = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          title, body, link, target, targetId: target === 'all' ? undefined : targetId
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`Yuborildi! (Muvaffaqiyatli: ${data.sent || 0} ta)`);
      setTitle(''); setBody(''); setLink('');
    } catch(err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-[18px] font-black text-white leading-tight">Xabarnomalar (Push)</h2>
          <p className="text-[12px] text-white/50">O'quvchilarga bildirishnoma yuborish</p>
        </div>
      </div>

      <div className="glass-panel p-5">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block mb-1">Sarlavha *</label>
            <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204]" placeholder="Masalan: Yangi test qo'shildi!" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block mb-1">Matn *</label>
            <textarea required value={body} onChange={e=>setBody(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204] h-24 resize-none" placeholder="Xabar matni..." />
          </div>
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block mb-1">Havola (link) - Ixtiyoriy</label>
            <input value={link} onChange={e=>setLink(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204]" placeholder="Masalan: /student/exams" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block mb-1">Qabul qiluvchi</label>
            <select value={target} onChange={e=>{setTarget(e.target.value); setTargetId('');}} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204] appearance-none" style={{ colorScheme: "dark" }}>
              <option value="all">Barcha o'quvchilar</option>
              <option value="group">Guruh bo'yicha</option>
              <option value="user">Shaxsiy (Bitta o'quvchi)</option>
            </select>
          </div>
          {target === 'group' && (
            <div>
              <select required value={targetId} onChange={e=>setTargetId(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204] appearance-none" style={{ colorScheme: "dark" }}>
                <option value="" disabled>Guruhni tanlang</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}
          {target === 'user' && (
            <div>
              <select required value={targetId} onChange={e=>setTargetId(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204] appearance-none" style={{ colorScheme: "dark" }}>
                <option value="" disabled>O'quvchini tanlang</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
            </div>
          )}
          
          <button disabled={loading} type="submit" className="w-full py-3 bg-[#FEC204] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#FEC204]/90 transition-colors mt-2">
            <Send size={18} /> {loading ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </form>
      </div>
      
      <div className="mt-8">
        <h3 className="text-[14px] font-bold text-white mb-4">Oxirgi yuborilganlar</h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-[12px] text-white/40">Tarix bo'sh</p>
          ) : history.map(h => (
            <div key={h.id} className="glass-panel p-3">
              <h4 className="text-[13px] font-bold text-white">{h.title}</h4>
              <p className="text-[12px] text-white/60 mt-1">{h.body}</p>
              <div className="text-[10px] text-white/40 mt-2 flex justify-between">
                <span>{new Date(h.createdAt).toLocaleString()}</span>
                <span className="uppercase">{h.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}


const ActionRow = ({ icon, iconBg, label, sub, onClick }: any) => (
  <div onClick={onClick} className="flex items-center gap-3 p-3.5 border-b border-white/5 hover:bg-white/5 active:bg-white/10 transition-colors last:border-b-0 cursor-pointer">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
    <div className="flex-1">
      <div className="text-[14px] font-semibold text-white">{label}</div>
      <div className="text-[11px] text-white/40 mt-0.5">{sub}</div>
    </div>
    <ChevronRight size={18} className="text-white/30" />
  </div>
);

export default function AdminMore() {
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'menu'|'teachers'|'subjects'|'schedules'|'notifications'>('menu');

  return (
    <div className="space-y-6 pb-6 h-full flex flex-col">
      {activeTab === 'menu' && (
        <MenuTab onTab={setActiveTab} />
      )}
      {activeTab === 'teachers' && <TeachersTab onBack={() => setActiveTab('menu')} />}
      {activeTab === 'subjects' && <SubjectsTab onBack={() => setActiveTab('menu')} />}
      {activeTab === 'schedules' && <SchedulesTab onBack={() => setActiveTab('menu')} />}
      {activeTab === 'notifications' && <NotificationsTab onBack={() => setActiveTab('menu')} />}
    </div>
  );
}

function MenuTab({ onTab }: { onTab: (tab: any) => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2.5 ml-1">Amallar</h3>
        <div className="glass-panel overflow-hidden border-white/10 p-0 !bg-white/[0.04]">
           <ActionRow 
             onClick={() => onTab('teachers')} 
             icon={<GraduationCap size={18} className="text-[#FEC204]" />} 
             iconBg="bg-[#FEC204]/10" 
             label="O'qituvchilar" 
             sub="Barcha o'qituvchilarni boshqarish" 
           />
           <ActionRow 
             onClick={() => onTab('subjects')} 
             icon={<BookOpen size={18} className="text-green-400" />} 
             iconBg="bg-green-400/10" 
             label="Fanlar" 
             sub="Markaz fanlarini boshqarish" 
           />
           <ActionRow 
             onClick={() => onTab('schedules')} 
             icon={<CalendarIcon size={18} className="text-blue-400" />} 
             iconBg="bg-blue-400/10" 
             label="Dars Jadvali" 
             sub="Guruhlarning dars jadvallarini boshqarish" 
           />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2.5 ml-1 mt-4">Markaz bilan bog'lanish</h3>
        <div className="glass-panel overflow-hidden border-white/10 p-0 !bg-white/[0.04]">
           <ActionRow 
             onClick={() => window.open('https://instagram.com/wissen_oquv_markazi', '_blank')} 
             icon="📸" 
             iconBg="bg-pink-500/10 text-xl" 
             label="Instagram" 
             sub="@wissen_oquv_markazi" 
           />
           <ActionRow 
             onClick={() => window.open('https://t.me/wissen_edu', '_blank')} 
             icon="✈️" 
             iconBg="bg-blue-400/10 text-xl" 
             label="Telegram kanal" 
             sub="@wissen_edu" 
           />
           <ActionRow 
             onClick={() => window.open('https://t.me/wissen_admin', '_blank')} 
             icon="👨‍💻" 
             iconBg="bg-blue-500/10 text-xl" 
             label="Telegram admin" 
             sub="@wissen_admin" 
           />
           <ActionRow 
             onClick={() => window.open('tel:+998886444400', '_blank')} 
             icon="📞" 
             iconBg="bg-green-500/10 text-xl" 
             label="Telefon" 
             sub="+998 88 644 44 00" 
           />
           <ActionRow 
             onClick={() => window.open('tel:+998882444481', '_blank')} 
             icon="📞" 
             iconBg="bg-green-500/10 text-xl" 
             label="Telefon (Qo'shimcha)" 
             sub="+998 88 244 44 81" 
           />
        </div>
      </motion.div>
    </>
  );
}

function TeachersTab({ onBack }: { onBack: () => void }) {
  const { confirm } = useConfirm();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ fullName: '', username: '', password: '', phone: '', subject: '', certificates: '' });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'users'), where('role', '==', 'teacher')), snap => {
      setTeachers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = `${teacherForm.username}@wissen.internal`;
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, teacherForm.password);
      
      const { password, ...dataToSave } = teacherForm;
      
      await addDoc(collection(db, 'users'), {
        ...dataToSave,
        role: 'teacher',
        createdAt: new Date().toISOString()
      });
      toast.success("O'qituvchi qo'shildi!");
      setIsModalOpen(false);
      setTeacherForm({ fullName: '', username: '', password: '', phone: '', subject: '', certificates: '' });
    } catch (err: any) {
      console.error('Kontekst:', err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error("Bu login (username) band, boshqasini tanlang!");
      } else {
        const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
        toast.error(msg);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ title: 'Diqqat', message: "O'chirishni tasdiqlaysizmi?" })) {
      await deleteDoc(doc(db, 'users', id));
      toast.success("O'chirildi");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><ArrowLeft size={18} className="text-white" /></button>
        <h2 className="text-xl font-bold text-white">O'qituvchilar</h2>
        <div className="flex-1"></div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="h-9 px-3 rounded-lg bg-[rgba(254,194,4,0.1)] flex items-center gap-2 text-[#FEC204] hover:bg-[rgba(254,194,4,0.2)] active:scale-95 transition-all border border-[#FEC204]/20 font-bold text-sm"
          title="O'qituvchi qabul qilish"
        >
          <QrCode size={16} />
          <span className="hidden sm:inline">Qabul</span>
        </button>
        <button onClick={() => setIsModalOpen(true)} className="glass-panel px-4 py-2 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black rounded-lg text-sm">
          + Qo'shish
        </button>
      </div>
      
      <div className="space-y-2">
        {teachers.map(t => (
          <div key={t.id} className="glass-panel p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-sm">{t.fullName}</p>
              <p className="text-xs text-white/40">{t.subject} • {t.phone}</p>
            </div>
            <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20"><Trash2 size={14}/></button>
          </div>
        ))}
        {teachers.length === 0 && <p className="text-center text-white/40 text-sm py-4">Yo'q</p>}
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsInviteModalOpen(false)}>
          <div className="w-full max-w-[400px] glass-panel border border-white/10 rounded-[24px] p-8 flex flex-col items-center text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsInviteModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-white/60 transition-colors">
              <X size={16} />
            </button>
            <h2 className="text-[20px] font-black text-white mb-2">O'qituvchi qabul qilish</h2>
            <p className="text-[13px] text-white/60 mb-6 leading-relaxed">
              Ushbu QR kodni o'qituvchilarga ko'rsating. Ular kodni skanerlab platformadan ro'yxatdan o'tishlari mumkin.
            </p>

            <div className="bg-white p-4 rounded-[20px] mb-8 shadow-[0_0_40px_rgba(254,194,4,0.15)] transition-all">
              <QRCodeSVG 
                value={`${window.location.origin}/oqituvchi-qoshil`} 
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/oqituvchi-qoshil`);
                toast.success("Havola nusxalandi!");
              }}
              className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-[14px] transition-all flex items-center justify-center gap-2"
            >
              Nusxa olish
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
          <div className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/95">
            <h2 className="text-lg font-bold text-white mb-4">Yangi O'qituvchi</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input required placeholder="F.I.SH." value={teacherForm.fullName} onChange={e=>setTeacherForm({...teacherForm, fullName: e.target.value})} className="w-full glass-panel p-3 text-sm placeholder-white/30 outline-none focus:border-[#FEC204]/50" />
              <input required placeholder="Login" value={teacherForm.username} onChange={e=>setTeacherForm({...teacherForm, username: e.target.value})} className="w-full glass-panel p-3 text-sm placeholder-white/30 outline-none focus:border-[#FEC204]/50" />
              <input required placeholder="Parol" type="text" value={teacherForm.password} onChange={e=>setTeacherForm({...teacherForm, password: e.target.value})} className="w-full glass-panel p-3 text-sm placeholder-white/30 outline-none focus:border-[#FEC204]/50" />
              <input required placeholder="Telefon raqami" value={teacherForm.phone} onChange={e=>setTeacherForm({...teacherForm, phone: e.target.value})} className="w-full glass-panel p-3 text-sm placeholder-white/30 outline-none focus:border-[#FEC204]/50" />
              <input required placeholder="Fani" value={teacherForm.subject} onChange={e=>setTeacherForm({...teacherForm, subject: e.target.value})} className="w-full glass-panel p-3 text-sm placeholder-white/30 outline-none focus:border-[#FEC204]/50" />
              <input required placeholder="Sertifikatlari" value={teacherForm.certificates} onChange={e=>setTeacherForm({...teacherForm, certificates: e.target.value})} className="w-full glass-panel p-3 text-sm placeholder-white/30 outline-none focus:border-[#FEC204]/50" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-3 text-sm border border-white/10 rounded-xl hover:bg-white/5">Bekor</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 text-sm bg-[#FEC204] text-black rounded-xl font-bold">Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectsTab({ onBack }: { onBack: () => void }) {
  const { confirm } = useConfirm();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '' });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'subjects')), snap => {
      setSubjects(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'subjects'), {
        ...form,
        createdAt: new Date().toISOString()
      });
      toast.success("Fan qo'shildi");
      setIsModalOpen(false);
      setForm({ name: '' });
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ title: 'Diqqat', message: "O'chirishni tasdiqlaysizmi?" })) {
      await deleteDoc(doc(db, 'subjects', id));
      toast.success("O'chirildi");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><ArrowLeft size={18} className="text-white" /></button>
        <h2 className="text-xl font-bold text-white">Fanlar</h2>
        <div className="flex-1"></div>
        <button onClick={() => setIsModalOpen(true)} className="glass-panel px-4 py-2 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black rounded-lg text-sm">
          + Qo'shish
        </button>
      </div>
      
      <div className="space-y-2">
        {subjects.map(s => (
          <div key={s.id} className="glass-panel p-4 flex items-center justify-between">
            <p className="font-bold text-white text-sm">{s.name}</p>
            <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20"><Trash2 size={14}/></button>
          </div>
        ))}
        {subjects.length === 0 && <p className="text-center text-white/40 text-sm py-4">Yo'q</p>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
          <div className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/95">
            <h2 className="text-lg font-bold text-white mb-4">Yangi Fan</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input required placeholder="Fan nomi" value={form.name} onChange={e=>setForm({name: e.target.value})} className="w-full glass-panel p-3 text-sm placeholder-white/30 outline-none focus:border-[#FEC204]/50" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-3 text-sm border border-white/10 rounded-xl hover:bg-white/5">Bekor</button>
                <button type="submit" className="flex-1 py-3 text-sm bg-[#FEC204] text-black rounded-xl font-bold">Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SchedulesTab({ onBack }: { onBack: () => void }) {
  const { confirm } = useConfirm();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ groupId: '', dayOfWeek: 1, startTime: '14:00', endTime: '16:00', location: 'Xona 1' });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'schedules')), snap => {
      setSchedules(snap.docs.map(d => ({id: d.id, ...d.data()} as ScheduleItem)));
    });
    const unsubG = onSnapshot(query(collection(db, 'groups')), snap => {
      setGroups(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsub(); unsubG(); };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const g = groups.find(x => x.id === form.groupId);
      if (!g) return;
      await addDoc(collection(db, 'schedules'), {
        groupId: form.groupId,
        subject: g.subject,
        dayOfWeek: Number(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location
      });
      toast.success("Dars qo'shildi");
      setIsModalOpen(false);
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ title: 'Diqqat', message: "O'chirishni tasdiqlaysizmi?" })) {
      await deleteDoc(doc(db, 'schedules', id));
      toast.success("O'chirildi");
    }
  };

  const daysMap = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><ArrowLeft size={18} className="text-white" /></button>
        <h2 className="text-xl font-bold text-white">Dars jadvali</h2>
        <div className="flex-1"></div>
        <button onClick={() => setIsModalOpen(true)} className="glass-panel px-4 py-2 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black rounded-lg text-sm">
          + Qo'shish
        </button>
      </div>
      
      <div className="space-y-2">
        {schedules.map(s => (
          <div key={s.id} className="glass-panel p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-sm">{groups.find(g=>g.id===s.groupId)?.name} — {s.subject}</p>
              <p className="text-xs text-white/40">{daysMap[s.dayOfWeek]} • {s.startTime}-{s.endTime} • {s.location}</p>
            </div>
            <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20"><Trash2 size={14}/></button>
          </div>
        ))}
        {schedules.length === 0 && <p className="text-center text-white/40 text-sm py-4">Yo'q</p>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
          <div className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/95">
            <h2 className="text-lg font-bold text-white mb-4">Yangi dars</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <select required value={form.groupId} onChange={e=>setForm({...form, groupId: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white appearance-none" style={{ colorScheme: "dark" }}>
                <option value="" disabled>Guruhni tanlang</option>
                {groups.map(g => <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>)}
              </select>
              <select required value={form.dayOfWeek} onChange={e=>setForm({...form, dayOfWeek: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white appearance-none" style={{ colorScheme: "dark" }}>
                <option value={1} className="bg-[#1a1a1a]">Dushanba</option>
                <option value={2} className="bg-[#1a1a1a]">Seshanba</option>
                <option value={3} className="bg-[#1a1a1a]">Chorshanba</option>
                <option value={4} className="bg-[#1a1a1a]">Payshanba</option>
                <option value={5} className="bg-[#1a1a1a]">Juma</option>
                <option value={6} className="bg-[#1a1a1a]">Shanba</option>
                <option value={7} className="bg-[#1a1a1a]">Yakshanba</option>
              </select>
              <div className="flex gap-2">
                <input required type="time" value={form.startTime} onChange={e=>setForm({...form, startTime: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" style={{ colorScheme: "dark" }} />
                <input required type="time" value={form.endTime} onChange={e=>setForm({...form, endTime: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" style={{ colorScheme: "dark" }} />
              </div>
              <input required placeholder="Xona (lokatsiya)" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-3 text-sm border border-white/10 rounded-xl hover:bg-white/5">Bekor</button>
                <button type="submit" className="flex-1 py-3 text-sm bg-[#FEC204] text-black rounded-xl font-bold">Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
