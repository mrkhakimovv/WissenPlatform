import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, collection, query, where, getDocs, doc, setDoc, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherRegistration() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
  
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  
  const [submitting, setSubmitting] = useState(false);

  // Username validation and debouncing
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus('idle');
      setSuggestedUsernames([]);
      return;
    }
    
    // Only allow a-z, 0-9, ., _
    const sanitized = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (username !== sanitized) {
      setUsername(sanitized);
      return;
    }

    setUsernameStatus('checking');
    
    const timeoutId = setTimeout(async () => {
      try {
        const q = query(collection(db, 'users'), where('username', '==', sanitized));
        const snap = await getDocs(q);
        
        const reservedWords = ['admin', 'wissen', 'teacher', 'support', 'root', 'system'];
        
        if (!snap.empty || reservedWords.includes(sanitized)) {
          setUsernameStatus('taken');
          // Generate suggestions
          setSuggestedUsernames([
            `${sanitized}123`,
            `${sanitized}_2026`,
            `${sanitized}${Math.floor(Math.random()*1000)}`
          ]);
        } else {
          setUsernameStatus('available');
          setSuggestedUsernames([]);
        }
      } catch (e) {
        console.error('Error checking username', e);
        setUsernameStatus('idle');
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameStatus === 'checking') {
      toast.error("Iltimos, username tekshirilishini kuting");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const email = `${username}@wissen.internal`;
      
      if (usernameStatus === 'taken') {
        // Attempt login to see if this is an existing account
        try {
          await signInWithEmailAndPassword(auth, email, password);
          toast.success("Sizning eski akkauntingiz topildi va tizimga kirdingiz!");
          await login(email, password);
          navigate('/admin', { replace: true });
          return;
        } catch (loginErr) {
          toast.error("Ushbu username band yoki parol noto'g'ri. Agar bu sizning akkauntingiz bo'lsa, to'g'ri parolni kiritib kiring.");
          setSubmitting(false);
          return;
        }
      }

      // If available, create new account
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, 'users', userCred.user.uid), {
          fullName: `${firstName} ${lastName}`.trim(),
          username: username,
          phone: phone,
          role: 'teacher',
          subject: '',
          createdAt: new Date().toISOString()
        });
        
        toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
        await login(email, password);
        navigate('/admin', { replace: true });
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          // Bu holat username Firestore'da yo'q, lekin Firebase Auth'da (parollar bazasida) qolib ketganda yuz beradi.
          // Masalan, admin o'qituvchini ro'yxatdan o'chirib tashlagan bo'lsa.
          try {
            // Parolni tekshirib ko'ramiz
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            
            // Agar to'g'ri bo'lsa, uni bazaga qayta yaratamiz!
            await setDoc(doc(db, 'users', userCred.user.uid), {
              fullName: `${firstName} ${lastName}`.trim(),
              username: username,
              phone: phone,
              role: 'teacher',
              subject: '',
              createdAt: new Date().toISOString()
            });
            
            toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz (eski profil tiklandi)!");
            await login(email, password);
            navigate('/admin', { replace: true });
            return;
          } catch (loginErr) {
            // Parol xato bo'lsa, demak bu nom rostdan ham boshqa birovga tegishli yoki parol unutilgan.
            setUsernameStatus('taken');
            toast.error(`Bu username band. Iltimos: ${username}1 yoki ${username}_2026 deb kiritib ko'ring.`);
            setSubmitting(false);
            return;
          }
        }
        throw createErr;
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setUsernameStatus('taken');
        toast.error("Bu username allaqachon band. Iltimos boshqasini tanlang.");
      } else {
        toast.error(err.message || "Xatolik yuz berdi");
      }
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'teacher')) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  // If already logged in
  if (user) {
    if (user.role === 'admin' || user.role === 'teacher') {
      return null;
    }
    
    if (user.role === 'student') {
      return (
        <div className="min-h-screen bg-[#000] flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-[400px] glass-panel p-8 rounded-[24px] text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(254,194,4,0.15)] text-[#FEC204] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Siz tizimga kiritilgansiz</h2>
            <p className="text-[15px] font-bold text-[#FEC204] mb-8">{user.fullName}</p>
            
            <div className="flex flex-col gap-3">
              <Link 
                to="/"
                className="w-full py-3.5 bg-[#FEC204] text-black font-bold rounded-[14px] active:scale-[0.98] transition-all flex justify-center items-center h-[52px]"
              >
                Asosiy sahifaga o'tish
              </Link>
              <button 
                onClick={() => useAuth().logout?.()}
                className="w-full py-3.5 bg-white/5 text-white/60 font-bold rounded-[14px] hover:bg-white/10 active:scale-[0.98] transition-all h-[52px]"
              >
                Boshqa akkaunt yaratish
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[440px] glass-panel p-6 md:p-8 rounded-[24px] shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-[18px] bg-[rgba(254,194,4,0.1)] flex items-center justify-center mx-auto mb-4 border border-[rgba(254,194,4,0.2)] overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">Ro'yxatdan o'tish</h1>
          <p className="text-white/50 text-sm font-medium">Platformaga o'qituvchi sifatida qo'shilish</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[1px] font-bold text-white/40 ml-1">Ism</label>
              <input required value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full glass-panel p-3.5 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 !rounded-[12px]" placeholder="Ali" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[1px] font-bold text-white/40 ml-1">Familiya</label>
              <input required value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full glass-panel p-3.5 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 !rounded-[12px]" placeholder="Valiyev" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-[1px] font-bold text-white/40 ml-1">Telefon raqam</label>
            <input required type="tel" value={phone} onChange={handlePhoneChange} className="w-full glass-panel p-3.5 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 !rounded-[12px]" placeholder="+998 90 123 45 67" />
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
                className={`w-full glass-panel p-3.5 pl-9 outline-none text-sm text-white/90 !rounded-[12px] transition-colors ${
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
            
            {/* Suggestions */}
            {suggestedUsernames.length > 0 && (
              <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-[12px]">
                <p className="text-[12px] text-red-400 font-medium mb-2">
                  Ushbu username band yoki bu sizning eski profilingiz. Agar sizniki bo'lsa, parolingizni kiritib kirishingiz mumkin. Yoki boshqa tanlang:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedUsernames.map(sug => (
                    <button 
                      key={sug} 
                      type="button"
                      onClick={() => { setUsername(sug); setSuggestedUsernames([]); setUsernameStatus('idle'); }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/80 transition-colors"
                    >
                      @{sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-[1px] font-bold text-white/40 ml-1">Parol</label>
            <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full glass-panel p-3.5 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 !rounded-[12px]" placeholder="••••••••" minLength={6} />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full h-[52px] bg-[#FEC204] text-black font-black text-sm rounded-[14px] flex items-center justify-center hover:bg-[#ffcd29] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(254,194,4,0.3)] disabled:opacity-70 disabled:active:scale-100"
            >
              {submitting ? <Loader2 size={20} className="animate-spin" /> : "Ro'yxatdan o'tish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
