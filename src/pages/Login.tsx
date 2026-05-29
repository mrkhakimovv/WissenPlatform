import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User, Instagram, Send, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(username, password);
    if (success) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 h-full relative z-10 w-full overflow-hidden items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-8 flex flex-col items-center w-full max-w-[360px]"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FEC204] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[#FEC204]/20 mb-6 border border-white/20">
          <GraduationCap size={44} color="#0d0d0d" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
          Wissen Edu
        </h1>
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#FEC204] mb-8 text-center">O'quv Markazi</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-white/40" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#FEC204]/50 focus:ring-1 focus:ring-[#FEC204]/50 transition-all text-white placeholder-white/30 text-sm"
                placeholder="Login"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-white/40" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#FEC204]/50 focus:ring-1 focus:ring-[#FEC204]/50 transition-all text-white placeholder-white/30 text-sm"
                placeholder="Parol"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FEC204] to-[#f59e0b] text-black font-bold py-4 rounded-2xl shadow-lg shadow-[#FEC204]/20 mt-6 disabled:opacity-70 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              'Kirish'
            )}
          </button>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-[360px] mt-6 glass-panel p-4 border-white/10 !bg-white/[0.02]"
      >
        <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-3 text-center">Markaz bilan bog'lanish</div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <a href="https://t.me/wissen_admin" target="_blank" className="flex items-center gap-3 p-3 text-left rounded-xl hover:bg-white/[0.06] transition-colors bg-white/[0.02] border border-white/5 group">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex shrink-0 items-center justify-center">
              <Send size={14} className="-ml-0.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider mb-0.5">Telegram</div>
              <div className="text-[11px] truncate font-semibold text-white/90">@wissen_admin</div>
            </div>
          </a>

          <a href="tel:+998886444400" className="flex items-center gap-3 p-3 text-left rounded-xl hover:bg-white/[0.06] transition-colors bg-white/[0.02] border border-white/5 group">
            <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-400 shrink-0 flex items-center justify-center">
              <Phone size={14} />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider mb-0.5">Telefon</div>
              <div className="text-[11px] truncate font-semibold text-white/90">+998886444400</div>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
