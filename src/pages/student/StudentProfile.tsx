import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogOut, ChevronRight } from 'lucide-react';

const InfoRow = ({ icon, iconBg, label, value, badge, badgeClass }: any) => (
  <div className="flex items-center p-3.5 border-b border-white/5 hover:bg-white/5 transition-colors last:border-b-0">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base mr-3 shrink-0 ${iconBg}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="text-[11px] text-white/40 mb-0.5">{label}</div>
      <div className="text-[13px] font-medium text-white truncate">{value}</div>
    </div>
    {badge && (
      <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 border ${badgeClass}`}>
        {badge}
      </div>
    )}
  </div>
);

const ActionRow = ({ icon, iconBg, label, sub, onClick }: any) => (
  <div onClick={onClick} className="flex items-center gap-3 p-3.5 border-b border-white/5 hover:bg-white/5 active:bg-white/10 transition-colors last:border-b-0 cursor-pointer">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${iconBg}`}>{icon}</div>
    <div className="flex-1">
      <div className="text-[13px] font-medium text-white">{label}</div>
      <div className="text-[11px] text-white/40 mt-0.5">{sub}</div>
    </div>
    <ChevronRight size={18} className="text-white/30" />
  </div>
);

export default function StudentProfile() {
  const { user, logout } = useAuth();
  
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const initials = user?.fullName?.substring(0,2).toUpperCase() || 'ST';

  // Password strength calc
  let score = 0;
  if (newPw) {
    if (newPw.length >= 6) score++;
    if (newPw.length >= 10) score++;
    if (/[A-Z]/.test(newPw) || /[0-9]/.test(newPw)) score++;
  }
  const strengthClasses = ['bg-red-400', 'bg-yellow-400', 'bg-green-400'];

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPw || !newPw || !confirmPw) {
      toast.error("Barcha maydonlarni to'ldiring!");
      return;
    }
    if (newPw.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lsin!");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Parollar mos kelmadi!");
      return;
    }

    if (!user?.id) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { password: newPw });
      toast.success("Parol muvaffaqiyatli yangilandi");
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
    } catch(err) {
      toast.error("Xatolik yuz berdi");
    }
    setLoading(false);
  }

  const handleActionClick = () => {
    toast('Tez kunda ishga tushadi!', { icon: '🚧', style: { borderRadius: '12px', background: '#1c1c1c', color: '#fff', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' } });
  };

  return (
    <div className="space-y-6 pb-6">
      
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-2">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FEC204] to-[#ff8c00] p-[3px] relative mb-4" style={{ animation: 'ring-pulse 3s ease-in-out infinite' }}>
          <div className="w-full h-full rounded-full bg-[#1a1500] flex items-center justify-center font-bold text-3xl text-[#FEC204] tracking-tight">
            {initials}
          </div>
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#0a0a0a]" style={{ boxShadow: '0 0 8px rgba(74,222,128,0.6)' }}></div>
        </div>
        <h2 className="text-[22px] font-bold tracking-tight text-white mb-1.5">{user?.fullName}</h2>
        <p className="text-[13px] text-white/40 font-medium">O'quvchi · Wissen O'quv Markazi</p>
        <div className="mt-3 bg-[#FEC204]/10 border border-[#FEC204]/25 rounded-full px-4 py-1.5 text-[11px] text-[#FEC204] font-bold tracking-widest uppercase">
          ID: {user?.id?.substring(0,8).toUpperCase() || 'W-2024'}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-2.5">
        <div className="glass-panel text-center px-2 py-3.5 hover:border-[#FEC204]/30 hover:-translate-y-0.5 transition-all">
          <div className="text-[20px] font-bold text-[#FEC204] tracking-tight">92%</div>
          <div className="text-[10px] text-white/40 mt-1 font-medium">Davomat</div>
        </div>
        <div className="glass-panel text-center px-2 py-3.5 hover:border-[#FEC204]/30 hover:-translate-y-0.5 transition-all">
          <div className="text-[20px] font-bold text-green-400 tracking-tight">To'liq</div>
          <div className="text-[10px] text-white/40 mt-1 font-medium">To'lov</div>
        </div>
        <div className="glass-panel text-center px-2 py-3.5 hover:border-[#FEC204]/30 hover:-translate-y-0.5 transition-all">
          <div className="text-[20px] font-bold text-blue-400 tracking-tight">6 oy</div>
          <div className="text-[10px] text-white/40 mt-1 font-medium">O'qilgan</div>
        </div>
      </motion.div>

      {/* Shaxsiy Ma'lumotlar */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2.5 ml-1">Shaxsiy ma'lumotlar</h3>
        <div className="glass-panel overflow-hidden border-white/10 p-0 !bg-white/[0.04]">
           <InfoRow icon="👤" iconBg="bg-[#FEC204]/10 text-xl" label="To'liq ism" value={user?.fullName} />
           <InfoRow icon="🔑" iconBg="bg-blue-400/10 text-xl" label="Login (username)" value={user?.username} />
           <InfoRow icon="📱" iconBg="bg-purple-400/10 text-xl" label="Telefon raqam" value="+998 90 123 45 67" />
           <InfoRow icon="🗓" iconBg="bg-pink-400/10 text-xl" label="Qo'shilgan sana" value="1 Iyul 2024" />
        </div>
      </motion.div>

      {/* O'quv Ma'lumotlari */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2.5 ml-1">O'quv ma'lumotlari</h3>
        <div className="glass-panel overflow-hidden border-white/10 p-0 !bg-white/[0.04]">
           <InfoRow icon="📚" iconBg="bg-[#FEC204]/10 text-xl" label="Fan" value={user?.subject || "Belgilanmagan"} />
           <InfoRow icon="👥" iconBg="bg-green-400/10 text-xl" label="Guruh" value={user?.groupId || 'Hali guruhda emas'} badge="Faol" badgeClass="bg-green-400/15 text-green-400 border-green-400/25" />
           <InfoRow icon="👨‍🏫" iconBg="bg-blue-400/10 text-xl" label="O'qituvchi" value={user?.teacherId || "Noma'lum"} />
           <InfoRow icon="⏰" iconBg="bg-purple-400/10 text-xl" label="Dars vaqti" value="15:00 – 17:00" />
           <InfoRow icon="💰" iconBg="bg-[#FEC204]/10 text-xl" label="Oylik to'lov" value={`${user?.monthlyFee?.toLocaleString() || 600000} so'm`} badge="To'langan" badgeClass="bg-green-400/15 text-green-400 border-green-400/25" />
        </div>
      </motion.div>

      {/* Bu oylik statistika */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2.5 ml-1">Bu oylik statistika</h3>
        <div className="glass-panel p-4 space-y-4 border-white/10 !bg-white/[0.04]">
           <div>
             <div className="flex justify-between items-center mb-1.5">
               <div className="text-[13px] font-medium text-white">Davomat</div>
               <div className="text-[13px] text-green-400 font-bold">92%</div>
             </div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] rounded-full" style={{ width: '92%' }}></div>
             </div>
             <div className="flex justify-between text-[10px] text-white/40 mt-1.5 font-medium"><span>22 / 24 dars</span><span>Maqsad: 90%+</span></div>
           </div>
           
           <div>
             <div className="flex justify-between items-center mb-1.5">
               <div className="text-[13px] font-medium text-white">To'lov holati</div>
               <div className="text-[13px] text-[#FEC204] font-bold">100%</div>
             </div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#ffab00] to-[#FEC204] rounded-full" style={{ width: '100%' }}></div>
             </div>
             <div className="flex justify-between text-[10px] text-white/40 mt-1.5 font-medium"><span>600 000 / 600 000 so'm</span><span>Iyul 2024</span></div>
           </div>

           <div>
             <div className="flex justify-between items-center mb-1.5">
               <div className="text-[13px] font-medium text-white">Kurs davomiyligi</div>
               <div className="text-[13px] text-blue-400 font-bold">50%</div>
             </div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa] rounded-full" style={{ width: '50%' }}></div>
             </div>
             <div className="flex justify-between text-[10px] text-white/40 mt-1.5 font-medium"><span>6 / 12 oy</span><span>Dekabr 2024</span></div>
           </div>
        </div>
      </motion.div>

      {/* Parolni o'zgartirish */}
       <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2.5 ml-1">Parolni o'zgartirish</h3>
        <div className="glass-panel p-4 border-white/10 !bg-white/[0.04]">
           <form onSubmit={handleUpdatePassword} className="space-y-3">
             <div className="space-y-1">
               <label className="text-[11px] text-white/40 ml-1">Joriy parol</label>
               <div className="relative">
                 <input 
                   type={showOldPw ? "text" : "password"} 
                   value={oldPw} onChange={(e)=>setOldPw(e.target.value)} required
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-[#FEC204]/50 focus:bg-[#FEC204]/[0.02] transition-colors pr-10"
                   placeholder="••••••••"
                 />
                 <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#FEC204] transition-colors">
                   {showOldPw ? <Eye size={16} /> : <EyeOff size={16} />}
                 </button>
               </div>
             </div>
             <div className="space-y-1">
               <label className="text-[11px] text-white/40 ml-1">Yangi parol</label>
               <div className="relative">
                 <input 
                   type={showNewPw ? "text" : "password"} 
                   value={newPw} onChange={(e)=>setNewPw(e.target.value)} required
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-[#FEC204]/50 focus:bg-[#FEC204]/[0.02] transition-colors pr-10"
                   placeholder="••••••••"
                 />
                 <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#FEC204] transition-colors">
                   {showNewPw ? <Eye size={16} /> : <EyeOff size={16} />}
                 </button>
               </div>
               {newPw && (
                 <div className="flex gap-1 mt-1.5 px-0.5">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${i < score ? strengthClasses[score - 1] : 'bg-white/10'}`} />
                   ))}
                 </div>
               )}
             </div>
             <div className="space-y-1 pb-1">
               <label className="text-[11px] text-white/40 ml-1">Yangi parolni tasdiqlang</label>
               <div className="relative">
                 <input 
                   type={showConfirmPw ? "text" : "password"} 
                   value={confirmPw} onChange={(e)=>setConfirmPw(e.target.value)} required
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-[#FEC204]/50 focus:bg-[#FEC204]/[0.02] transition-colors pr-10"
                   placeholder="••••••••"
                 />
                 <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#FEC204] transition-colors">
                   {showConfirmPw ? <Eye size={16} /> : <EyeOff size={16} />}
                 </button>
               </div>
             </div>
             
             <button disabled={loading} type="submit" className="w-full py-3.5 mt-2 bg-gradient-to-br from-[#ffab00] to-[#fec204] text-black font-bold text-sm tracking-wide rounded-xl active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100">
               {loading ? 'Kutib turing...' : 'Parolni saqlash'}
             </button>
           </form>
        </div>
      </motion.div>

      {/* Settings Options */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2.5 ml-1">Qo'shimcha</h3>
        <div className="glass-panel overflow-hidden border-white/10 p-0 !bg-white/[0.04]">
           <ActionRow onClick={handleActionClick} icon="🔔" iconBg="bg-blue-400/10 text-xl" label="Bildirishnomalar" sub="To'lov va davomat xabarlari" />
           <ActionRow onClick={handleActionClick} icon="🌐" iconBg="bg-purple-400/10 text-xl" label="Til sozlamalari" sub="O'zbek / Русский" />
           <ActionRow onClick={handleActionClick} icon="📞" iconBg="bg-[#FEC204]/10 text-xl" label="Markaz bilan bog'lanish" sub="+998 71 000 00 00" />
           <ActionRow onClick={handleActionClick} icon="❓" iconBg="bg-green-400/10 text-xl" label="Yordam markazi" sub="Ko'p so'raladigan savollar" />
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-2 text-center pb-8 pt-2">
        <button onClick={() => {
          if (confirm('Tizimdan chiqishni xohlaysizmi?')) logout();
        }} className="w-full flex items-center justify-center gap-2 py-4 bg-red-400/10 border border-red-400/20 text-red-500 rounded-2xl font-semibold hover:bg-red-400/20 hover:scale-[0.99] transition-all">
          <LogOut size={18} /> Tizimdan chiqish
        </button>
        <div className="text-[11px] text-white/30 mt-6 pb-2 font-medium">
          Wissen Edu v1.0.0 · <span className="text-[#FEC204]/70">Wissen O'quv Markazi</span>
        </div>
      </motion.div>
    </div>
  )
}
