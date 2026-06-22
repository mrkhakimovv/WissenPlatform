import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User } from 'lucide-react';

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
    <div className="flex-1 flex flex-col px-6 relative overflow-y-auto z-20">
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
      </div>
    </div>
  );
}
