import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User, Eye, EyeOff, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isInstallable, installApp } = usePWAInstall();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      const ok = await login(username.trim(), password);
      if (ok) {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-6 relative overflow-y-auto z-20">

      {isInstallable && (
        <button 
          onClick={installApp}
          type="button"
          className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-[#FEC204] text-black font-bold text-[12px] uppercase tracking-wide rounded-full shadow-lg hover:bg-[#e0ab00] transition-colors z-50"
        >
          <Download size={16} />
          APK O'rnatish
        </button>
      )}
  
      <div className="flex flex-col items-center justify-center min-h-full max-w-[340px] md:max-w-[400px] mx-auto w-full py-10 md:py-16">
        
        <div className="w-[72px] h-[72px] md:w-[90px] md:h-[90px] rounded-3xl bg-transparent border border-white/20 shadow-xl shadow-black/40 flex items-center justify-center mb-6 md:mb-8 relative overflow-hidden backdrop-blur-md shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <GraduationCap className="text-[#FEC204] relative z-10 w-10 h-10 md:w-12 md:h-12" strokeWidth={2} />
        </div>
        
        <h1 className="text-[26px] md:text-[32px] font-black text-white mb-1 tracking-tight">
          Wissen Edu
        </h1>
        <p className="text-[10px] md:text-[12px] uppercase font-bold tracking-[2.5px] text-[#FEC204] mb-10 text-center drop-shadow-[0_0_10px_rgba(254,194,4,0.5)]">O'quv Markazi</p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 glass-panel p-6 md:p-8">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <User size={18} className="text-white/40" />
            </div>
            <input
              type="text"
              autoFocus
              autoComplete="username"
              placeholder="Foydalanuvchi nomi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl h-[48px] md:h-[52px] pl-11 pr-4 outline-none focus:border-[#FEC204] focus:bg-white/10 transition-all font-semibold text-[13px] md:text-[14px] text-white"
              required
            />
          </div>

          <div className="relative mb-2">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <Lock size={18} className="text-white/40" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl h-[48px] md:h-[52px] pl-11 pr-11 outline-none focus:border-[#FEC204] focus:bg-white/10 transition-all font-semibold text-[13px] md:text-[14px] text-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="glass-button h-[50px] md:h-[54px] w-full flex justify-center items-center mt-2 tracking-wide text-[14px] md:text-[15px] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Kirilmoqda...' : 'Tizimga kirish'}
          </button>
        </form>
      </div>
    </div>
  );
}
