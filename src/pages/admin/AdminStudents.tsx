import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, addDoc, updateDoc, secondaryAuth, createUserWithEmailAndPassword, getDocs, where } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Plus, Search, Trash2, Edit2, X, ChevronRight, CheckCircle2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Payment, Attendance } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminStudents() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({ fullName: '', username: '', password: '', groupId: '', monthlyFee: '', joinedDate: today });

  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ groupId: '', monthlyFee: '' });

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<Attendance[]>([]);
  
  const [isGroupAssignModalOpen, setIsGroupAssignModalOpen] = useState(false);
  const [groupAssignStudent, setGroupAssignStudent] = useState<any>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubStudents = onSnapshot(q, (snap) => {
      const studs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })).filter(s => s.role !== 'admin' && s.role !== 'teacher');
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
      const email = `${formData.username}@wissen.internal`;
      
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, formData.password);
      
      await setDoc(doc(db, 'users', userCred.user.uid), {
        ...formData,
        role: 'student',
        monthlyFee: Number(formData.monthlyFee),
        createdAt: new Date().toISOString()
      });
      toast.success("O'quvchi qo'shildi!");
      setIsModalOpen(false);
      setFormData({ fullName: '', username: '', password: '', groupId: '', monthlyFee: '', joinedDate: today });
    } catch(err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error("Bu login (username) band, boshqasini tanlang!");
      } else {
        toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateDoc(doc(db, 'users', editingStudent.id), {
          groupId: editData.groupId,
          monthlyFee: Number(editData.monthlyFee)
        });
        toast.success("Ma'lumotlar yangilandi!");
        setIsEditModalOpen(false);
        setEditingStudent(null);
      }
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const openEdit = (e: React.MouseEvent, student: any) => {
    e.stopPropagation(); // prevent card click
    setEditingStudent(student);
    setEditData({ groupId: student.groupId || '', monthlyFee: student.monthlyFee?.toString() || '' });
    setIsEditModalOpen(true);
  };

  const openProfile = async (student: any) => {
    setSelectedStudent(student);
    
    // Fetch payments and attendance
    const qPay = query(collection(db, 'payments'), where('studentId', '==', student.id));
    const paySnap = await getDocs(qPay);
    setStudentPayments(paySnap.docs.map(d => ({id: d.id, ...d.data()} as Payment)));

    const qAtt = query(collection(db, 'attendance'), where('studentId', '==', student.id));
    const attSnap = await getDocs(qAtt);
    setStudentAttendance(attSnap.docs.map(d => ({id: d.id, ...d.data()} as Attendance)));
  };

  const openGroupAssign = (e: React.MouseEvent, student: any) => {
    e.stopPropagation();
    setGroupAssignStudent(student);
    const currentGroups = student.groups || (student.groupId ? [student.groupId] : []);
    setSelectedGroupIds(currentGroups);
    setIsGroupAssignModalOpen(true);
  };

  const handleGroupAssignSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupAssignStudent) return;
    try {
      await updateDoc(doc(db, 'users', groupAssignStudent.id), {
        groups: selectedGroupIds,
        groupId: selectedGroupIds.length > 0 ? selectedGroupIds[0] : ''
      });
      toast.success("Guruhlar muvaffaqiyatli biriktirildi!");
      setIsGroupAssignModalOpen(false);
      setGroupAssignStudent(null);
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if(await confirm({ title: 'Diqqat', message: `${name} ni haqiqatan ham o'chirmoqchimisiz?` })) {
      try {
        await deleteDoc(doc(db, 'users', id));
        
        // Delete related payments
        const payQ = query(collection(db, 'payments'), where('studentId', '==', id));
        const paySnap = await getDocs(payQ);
        paySnap.forEach(d => deleteDoc(d.ref));
        
        // Delete related attendance
        const attQ = query(collection(db, 'attendance'), where('studentId', '==', id));
        const attSnap = await getDocs(attQ);
        attSnap.forEach(d => deleteDoc(d.ref));

        toast.success("O'chirildi");
      } catch (err: any) {
        toast.error("O'chirishda xatolik yuz berdi");
      }
    }
  };

  const filtered = students.filter(s => {
    if (user?.role === 'teacher') {
      const sGroupsIds = s.groups || (s.groupId ? [s.groupId] : []);
      const belongsToTeacher = groups.some(g => sGroupsIds.includes(g.id) && g.teacherName === user.fullName);
      if (!belongsToTeacher) return false;
    }
    return s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.username?.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

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

      <div className="space-y-4 pb-24 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {filtered.map((student, i) => {
          const initials = student.fullName?.substring(0, 2).toUpperCase() || 'ST';
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i*0.05 }}
              key={student.id} 
              className={`glass-panel p-5 flex flex-col relative group hover:border-[#FEC204]/30 transition-colors ${(!student.groups?.length && !student.groupId) ? 'ring-2 ring-[#FEC204] shadow-[0_0_20px_rgba(254,194,4,0.1)]' : ''}`}
            >
              {/* Header: Avatar & Actions */}
              <div className="flex justify-between items-start mb-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner font-bold text-xl text-white/90">
                    {initials}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openGroupAssign(e, student)} className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-full hover:text-blue-300 hover:bg-blue-500/20 transition-colors" title="Guruhlarga biriktirish">
                    <Layers size={14} />
                  </button>
                  <button onClick={(e) => openEdit(e, student)} className="w-8 h-8 flex items-center justify-center bg-white/5 text-white/70 rounded-full hover:text-white hover:bg-white/20 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={(e) => handleDelete(e, student.id, student.fullName)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Info: Name & ID */}
              <div className="mb-4">
                <h3 className="text-[18px] font-bold text-white leading-tight line-clamp-2">{student.fullName}</h3>
                <p className="text-[12px] text-blue-400 font-semibold mt-1">ID: #{student.id.substring(0,7).toUpperCase()}</p>
              </div>

              <div className="w-full h-px bg-white/10 mb-4"></div>

              {/* Details List */}
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-white/50">Telefon:</span>
                  <span className="text-[13px] text-blue-400 font-medium">{student.phone || 'Kiritilmagan'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-white/50">Guruh:</span>
                  <span className="text-[13px] text-white/90 font-medium truncate max-w-[120px] text-right" title={
                    (() => {
                      const sGroups = groups.filter(g => student.groups?.includes(g.id) || g.id === student.groupId);
                      return sGroups.length > 0 ? sGroups.map(g => g.name).join(', ') : 'Yo\'q';
                    })()
                  }>
                    {(() => {
                      const sGroups = groups.filter(g => student.groups?.includes(g.id) || g.id === student.groupId);
                      if (sGroups.length === 0) return 'Yo\'q';
                      if (sGroups.length > 1) return `${sGroups.length} ta guruh`;
                      return sGroups[0].name || 'Nomsiz guruh';
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-white/50">Username:</span>
                  <span className="text-[13px] text-white/90 font-medium truncate max-w-[120px] text-right">{student.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-white/50">Parol:</span>
                  <span className="text-[13px] text-white/90 font-medium">{student.password || '***'}</span>
                </div>
              </div>

              {/* Button */}
              <button 
                onClick={() => openProfile(student)} 
                className="w-full py-3 rounded-[12px] border border-blue-400/30 text-blue-400 text-[13px] font-bold hover:bg-blue-400/10 transition-colors mt-auto flex items-center justify-center"
              >
                Batafsil ma'lumot
              </button>
            </motion.div>
          )
        })}
        {filtered.length === 0 && <p className="text-center text-[color:var(--theme-text-primary)]/40 py-6 text-sm col-span-full">Topilmadi</p>}
      </div>



      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
          <div className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/80">
            <h2 className="text-lg font-bold mb-4 text-[color:var(--theme-text-primary)]">Yangi o'quvchi</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required placeholder="F.I.SH." value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <input required placeholder="Login" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <input required placeholder="Parol" type="text" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              <select required value={formData.groupId} onChange={e=>setFormData({...formData, groupId: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                <option value="" disabled>Guruhni tanlang</option>
                {groups.map(g => <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name} — {g.subject}</option>)}
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

      {/* Edit Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
          <div className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/80">
            <h2 className="text-lg font-bold mb-4 text-[color:var(--theme-text-primary)]">Tahrirlash: {editingStudent.fullName}</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-[11px] text-[color:var(--theme-text-primary)]/50 px-1 uppercase tracking-wider font-bold mb-1 block">Guruh</label>
                <select required value={editData.groupId} onChange={e=>setEditData({...editData, groupId: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="" disabled>Guruhni tanlang</option>
                  {groups.map(g => <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name} — {g.subject}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[color:var(--theme-text-primary)]/50 px-1 uppercase tracking-wider font-bold mb-1 block">Oylik to'lov</label>
                <input required type="number" placeholder="Oylik to'lov (so'm)" value={editData.monthlyFee} onChange={e=>setEditData({...editData, monthlyFee: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              </div>
              <div className="flex gap-3 pt-2 mt-4">
                <button type="button" onClick={()=>{setIsEditModalOpen(false); setEditingStudent(null);}} className="flex-1 py-3 rounded-xl border border-[color:var(--glass-border)] text-sm font-medium hover:bg-white/5">Bekor qilish</button>
                <button type="submit" className="flex-1 bg-[#FEC204] text-black rounded-xl py-3 text-sm font-bold active:scale-95 transition-transform">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm sm:absolute"
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[#0d0d0d] border-l border-white/10 p-6 flex flex-col shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[20px] font-black text-white">O'quvchi Profili</h2>
                <button onClick={() => setSelectedStudent(null)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white">
                  {selectedStudent.fullName.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-white">{selectedStudent.fullName}</h3>
                  <p className="text-[13px] text-white/40">@{selectedStudent.username}</p>
                  <p className="text-[12px] font-medium text-[#FEC204] mt-1">
                    Guruh: {(() => {
                      const sGroups = groups.filter(g => selectedStudent.groups?.includes(g.id) || g.id === selectedStudent.groupId);
                      return sGroups.length > 0 ? sGroups.map(g => g.name).join(', ') : 'Noma\'lum';
                    })()}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold text-white/40 mb-3">Davomat (Oxirgi 7 kun)</h4>
                  <div className="glass-panel p-4 flex gap-2 justify-between">
                    {Array.from({length: 7}).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - 6 + i);
                      const dateStr = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
                      const att = studentAttendance.find(a => a.date === dateStr);
                      const status = att?.status || 'empty';
                      let style = "bg-white/5 border-white/10";
                      if (status === 'present') style = "bg-[rgba(254,194,4,0.12)] border-[rgba(254,194,4,0.3)] text-[#FEC204]";
                      if (status === 'absent') style = "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-red-500";
                      return (
                        <div key={i} className={`flex-1 aspect-square rounded-[8px] border flex flex-col items-center justify-center ${style}`}>
                           <span className="text-[10px] font-bold">{d.getDate()}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold text-white/40 mb-3">To'lovlar Tarixi</h4>
                  <div className="glass-panel p-0 overflow-hidden">
                    {studentPayments.length === 0 ? (
                      <p className="text-[12px] text-white/40 p-4 text-center">To'lovlar topilmadi.</p>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {studentPayments.sort((a,b)=>new Date(b.paidAt).getTime()-new Date(a.paidAt).getTime()).slice(0, 5).map(pay => (
                          <div key={pay.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pay.status==='paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                <CheckCircle2 size={14} />
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-white">{pay.month}/{pay.year}</p>
                                <p className="text-[10px] text-white/40">{new Date(pay.paidAt).toLocaleDateString('uz-UZ')}</p>
                              </div>
                            </div>
                            <span className="text-[14px] font-bold text-white">{pay.amount.toLocaleString()} so'm</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-6 pb-4">
                <button onClick={(e) => { setSelectedStudent(null); openEdit(e, selectedStudent); }} className="w-full glass-panel py-3 flex items-center justify-center gap-2 font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  <Edit2 size={16} /> Profildan Tahrirlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isGroupAssignModalOpen && groupAssignStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
          <div className="glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/95 relative overflow-hidden">
            <h2 className="text-[18px] font-black text-white mb-2">Guruhlarga biriktirish</h2>
            <p className="text-[13px] text-white/50 mb-4">{groupAssignStudent.fullName} uchun guruhlarni tanlang</p>
            
            <form onSubmit={handleGroupAssignSave}>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {groups.length === 0 ? (
                  <p className="text-[13px] text-white/40 italic">Guruhlar mavjud emas</p>
                ) : (
                  groups.map(g => {
                    const isSelected = selectedGroupIds.includes(g.id);
                    return (
                      <div 
                        key={g.id} 
                        onClick={() => {
                          setSelectedGroupIds(prev => 
                            prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]
                          );
                        }}
                        className={`p-3 rounded-[12px] border cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FEC204]/10 border-[#FEC204]/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        <div>
                          <p className={`text-[14px] font-bold ${isSelected ? 'text-[#FEC204]' : 'text-white'}`}>{g.name || 'Nomsiz guruh'}</p>
                          <p className="text-[11px] text-white/40">{g.subject}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-[#FEC204] border-[#FEC204]' : 'border-white/20'}`}>
                          {isSelected && <CheckCircle2 size={12} className="text-black" />}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="flex gap-3 pt-2 mt-4 border-t border-white/10">
                <button type="button" onClick={() => {setIsGroupAssignModalOpen(false); setGroupAssignStudent(null);}} className="flex-1 py-3 rounded-xl border border-[color:var(--glass-border)] text-sm font-medium hover:bg-white/5">Bekor qilish</button>
                <button type="submit" className="flex-1 bg-[#FEC204] text-black rounded-xl py-3 text-sm font-bold active:scale-95 transition-transform">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
