import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Users, GraduationCap, ChevronRight, X, UserPlus, BookOpen } from 'lucide-react';

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
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Teacher Form
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    phone: '',
    subject: '',
    certificates: ''
  });

  // Subject Form
  const [subjectForm, setSubjectForm] = useState({
    name: ''
  });

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'users'), {
        ...teacherForm,
        role: 'teacher',
        createdAt: new Date().toISOString()
      });
      toast.success("O'qituvchi qo'shildi!");
      setIsTeacherModalOpen(false);
      setTeacherForm({ fullName: '', phone: '', subject: '', certificates: '' });
    } catch(err) {
      toast.error("Xatolik yuz berdi");
    }
    setLoading(false);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'subjects'), {
        ...subjectForm,
        createdAt: new Date().toISOString()
      });
      toast.success("Fan qo'shildi!");
      setIsSubjectModalOpen(false);
      setSubjectForm({ name: '' });
    } catch(err) {
      toast.error("Xatolik yuz berdi");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-6 h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2.5 ml-1">Amallar</h3>
        <div className="glass-panel overflow-hidden border-white/10 p-0 !bg-white/[0.04]">
           <ActionRow 
             onClick={() => setIsTeacherModalOpen(true)} 
             icon={<GraduationCap size={18} className="text-[#FEC204]" />} 
             iconBg="bg-[#FEC204]/10" 
             label="O'qituvchi qo'shish" 
             sub="Markazga yangi o'qituvchi qo'shish" 
           />
           <ActionRow 
             onClick={() => setIsSubjectModalOpen(true)} 
             icon={<BookOpen size={18} className="text-green-400" />} 
             iconBg="bg-green-400/10" 
             label="Fan qo'shish" 
             sub="Yangi fanni markaz dasturiga kiritish" 
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

      {/* Teacher Modal */}
      <AnimatePresence>
        {isTeacherModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/95 border-white/10"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-[#FEC204]" /> O'qituvchi qo'shish
                </h2>
                <button onClick={() => setIsTeacherModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold">Ism familiyasi</label>
                  <input required placeholder="F.I.SH." value={teacherForm.fullName} onChange={e=>setTeacherForm({...teacherForm, fullName: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold">Telefon raqami</label>
                  <input required placeholder="+998 90 123 45 67" value={teacherForm.phone} onChange={e=>setTeacherForm({...teacherForm, phone: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold">Dars beradigan fan nomi</label>
                  <input required placeholder="Masalan: Matematika" value={teacherForm.subject} onChange={e=>setTeacherForm({...teacherForm, subject: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold">Fan bo'yicha sertifikatlari</label>
                  <input required placeholder="Masalan: IELTS 8.0, CEFR C1" value={teacherForm.certificates} onChange={e=>setTeacherForm({...teacherForm, certificates: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                
                <div className="flex gap-3 pt-2 mt-4">
                  <button type="button" disabled={loading} onClick={()=>setIsTeacherModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors text-white/70">Bekor qilish</button>
                  <button type="submit" disabled={loading} className="flex-1 glass-button py-3 text-sm disabled:opacity-50">Qo'shish</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subject Modal */}
      <AnimatePresence>
        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/95 border-white/10"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-green-400" /> Fan qo'shish
                </h2>
                <button onClick={() => setIsSubjectModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50 px-1 uppercase tracking-wider font-bold">Fan nomi</label>
                  <input required placeholder="Masalan: Matematika" value={subjectForm.name} onChange={e=>setSubjectForm({...subjectForm, name: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                
                <div className="flex gap-3 pt-2 mt-4">
                  <button type="button" disabled={loading} onClick={()=>setIsSubjectModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors text-white/70">Bekor qilish</button>
                  <button type="submit" disabled={loading} className="flex-1 glass-button py-3 text-sm disabled:opacity-50">Qo'shish</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
