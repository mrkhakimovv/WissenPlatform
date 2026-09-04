import React, { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, doc, setDoc, secondaryAuth, createUserWithEmailAndPassword } from '../lib/firebase';
import { Loader2, CheckCircle2, XCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAddStudentModal({ onClose }: { onClose: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [submitting, setSubmitting] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ' + val.replace(/\D/g, '');
    }
    if (val.length > 4 && val[4] !== ' ') {
      val = '+998 ' + val.substring(4).trimStart();
    }
    setPhone(val);
  };

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    
    const checkUsername = async () => {
      setUsernameStatus('checking');
      const q = query(collection(db, 'users'), where('username', '==', username));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setUsernameStatus('taken');
      } else {
        setUsernameStatus('available');
      }
    };
    
    const delay = setTimeout(checkUsername, 500);
    return () => clearTimeout(delay);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === 'checking') {
      toast.error("Iltimos, username tekshirilishini kuting");
      return;
    }
    if (usernameStatus === 'taken') {
      toast.error("Bu username band!");
      return;
    }

    setSubmitting(true);
    try {
      const email = `${username}@wissen.internal`;
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      await setDoc(doc(db, 'users', userCred.user.uid), {
        fullName: `${firstName} ${lastName}`.trim(),
        username: username,
        phone: phone,
        password: password,
        role: 'student',
        createdAt: new Date().toISOString(),
      });
      
      toast.success("O'quvchi muvaffaqiyatli yaratildi");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-[440px] glass-panel border border-white/10 rounded-[24px] p-6 md:p-8 flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-white/60 transition-colors">
          <X size={16} />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-[18px] bg-[rgba(254,194,4,0.1)] flex items-center justify-center mx-auto mb-4 border border-[rgba(254,194,4,0.2)] overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-[20px] font-black text-white mb-1">O'quvchi qo'shish</h2>
          <p className="text-[13px] text-white/60">Yangi o'quvchi profilini yaratish</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[1px] font-bold text-white/40 ml-1">Ism</label>
              <input required value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 rounded-[12px]" placeholder="Ali" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[1px] font-bold text-white/40 ml-1">Familiya</label>
              <input required value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 rounded-[12px]" placeholder="Valiyev" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-[1px] font-bold text-white/40 ml-1">Telefon raqam</label>
            <input required type="tel" value={phone} onChange={handlePhoneChange} className="w-full bg-white/5 border border-white/10 p-3.5 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 rounded-[12px]" placeholder="+998 90 123 45 67" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-[1px] font-bold text-white/40 ml-1 flex items-center justify-between">
              <span>Username (Tahallus)</span>
              {usernameStatus === 'checking' && <span className="text-[#FEC204] animate-pulse">Tekshirilmoqda...</span>}
              {usernameStatus === 'available' && <span className="text-green-500">Bo'sh ✓</span>}
              {usernameStatus === 'taken' && <span className="text-red-500">Band ⚠</span>}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-medium">@</span>
              <input 
                required 
                value={username} 
                onChange={e=>setUsername(e.target.value)} 
                className={`w-full bg-white/5 border border-white/10 p-3.5 pl-9 outline-none text-sm text-white/90 rounded-[12px] transition-colors ${
                  usernameStatus === 'available' ? 'border-green-500/50' : 
                  usernameStatus === 'taken' ? 'border-red-500/50' : 
                  'focus:border-[#FEC204]/50'
                }`}
                placeholder="ali_2026" 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 size={16} className="text-[#FEC204] animate-spin" />}
                {usernameStatus === 'available' && <CheckCircle2 size={16} className="text-green-500" />}
                {usernameStatus === 'taken' && <XCircle size={16} className="text-red-500" />}
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-[1px] font-bold text-white/40 ml-1">Parol</label>
            <input required type="text" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 rounded-[12px]" placeholder="••••••••" minLength={6} />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full h-[52px] bg-[#FEC204] text-black font-black text-sm rounded-[14px] flex items-center justify-center hover:bg-[#ffcd29] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(254,194,4,0.3)] disabled:opacity-70 disabled:active:scale-100"
            >
              {submitting ? <Loader2 size={20} className="animate-spin" /> : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
