import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User, Send, Phone } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(username, password);
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 relative h-full overflow-y-auto pt-10 pb-10 z-20">
      <div className="flex flex-col items-center max-w-[340px] md:max-w-[400px] mx-auto w-full pb-8">
        
        <div className="w-[72px] h-[72px] md:w-[90px] md:h-[90px] rounded-3xl bg-transparent border border-white/20 shadow-xl shadow-black/40 flex items-center justify-center mb-6 md:mb-8 relative overflow-hidden backdrop-blur-md">
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
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl h-[48px] md:h-[52px] pl-11 pr-4 outline-none focus:border-[#FEC204] focus:bg-white/10 transition-all font-semibold text-[13px] md:text-[14px] text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-button h-[50px] md:h-[54px] w-full flex justify-center items-center mt-2 tracking-wide text-[14px] md:text-[15px]"
          >
            {loading ? 'Kirilmoqda...' : 'Tizimga kirish'}
          </button>
        </form>

        <div className="w-full mt-8 p-5 md:p-6 rounded-3xl glass-panel">
          <div className="text-[10px] md:text-[11px] uppercase tracking-[1.5px] font-bold text-white/40 mb-4 text-center">Aloqa markazi</div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <a href="https://t.me/wissen_admin" target="_blank" className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 active:border-[#FEC204]/50 transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 text-blue-400 flex shrink-0 items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Send size={18} className="-ml-[2px]" />
              </div>
              <div className="text-center">
                <div className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">Telegram</div>
                <div className="text-[11px] md:text-[12px] font-bold text-white/90">@wissen_admin</div>
              </div>
            </a>

            <a href="tel:+998886444400" className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 active:border-[#FEC204]/50 transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/20 text-green-400 flex shrink-0 items-center justify-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <Phone size={18} />
              </div>
              <div className="text-center">
                <div className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">Telefon</div>
                <div className="text-[11px] md:text-[12px] font-bold text-white/90">+998886444400</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
