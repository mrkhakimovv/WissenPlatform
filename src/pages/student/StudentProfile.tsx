import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Phone, Mail, MapPin, BookOpen, Clock, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pt-4 pb-6 overflow-y-auto">
      {/* Profile Header Block */}
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-[72px] h-[72px] rounded-full border-[2.5px] border-[#FEC204] p-[1.5px]">
            <div className="w-full h-full rounded-full bg-[#FEC204] flex items-center justify-center text-[22px] font-black text-[#000]">
              {user?.fullName?.substring(0, 2).toUpperCase() || 'ST'}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#22c55e] border-[2.5px] border-[color:var(--surface-color)] -mr-0.5" />
        </div>
        
        <h1 className="text-[18px] font-[800] text-white mb-0.5 tracking-tight">{user?.fullName || "A. Rustamov"}</h1>
        <p className="text-[11px] text-white/40 font-bold mb-3">Matematika va Ingliz tili o'quvchisi</p>
        
        <span className="px-3 py-1 bg-[rgba(254,194,4,0.12)] border border-[rgba(254,194,4,0.3)] text-[#a07800] text-[10px] uppercase font-[900] tracking-[1px] rounded-full">
          ID: {user?.id?.substring(0,8).toUpperCase() || 'WSSN-102'}
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel p-4 flex flex-col items-center justify-center p-3">
          <p className="text-[16px] font-[900] text-white tracking-[-0.5px]">94%</p>
          <p className="text-[9px] uppercase tracking-[1px] font-bold text-[#a07800] mt-1">Davomat</p>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center p-3">
          <p className="text-[16px] font-[900] text-[color:var(--success-color)] tracking-[-0.5px]">Active</p>
          <p className="text-[9px] uppercase tracking-[1px] font-bold text-green-700 mt-1">Holati</p>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center p-3">
          <p className="text-[16px] font-[900] text-white tracking-[-0.5px]">6</p>
          <p className="text-[9px] uppercase tracking-[1px] font-bold text-blue-600 mt-1">Oylar soni</p>
        </div>
      </div>

      {/* Info Sections */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">Shaxsiy ma'lumotlar</h2>
        <div className="glass-panel p-4 !p-2 space-y-1">
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-blue-50 flex items-center justify-center text-blue-500"><Phone size={16} /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40">Telefon</p>
              <p className="text-[13px] font-[700] text-white">+998 90 123 45 67</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-purple-500"><Mail size={16} /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40">Pochta</p>
              <p className="text-[13px] font-[700] text-white">{user?.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">O'quv ma'lumotlari</h2>
        <div className="glass-panel p-4 !p-2 space-y-1">
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-orange-50 flex items-center justify-center text-orange-500"><BookOpen size={16} /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40">Guruh p1</p>
              <p className="text-[13px] font-[700] text-white">Matematika • G-24</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-teal-50 flex items-center justify-center text-teal-600"><CalendarIcon size={16} /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40">O'quv kursi boshlandi</p>
              <p className="text-[13px] font-[700] text-white">01.01.2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button onClick={() => { logout(); navigate('/login'); }} className="glass-button py-3 mt-4 w-full flex justify-center items-center">
          Tizimdan chiqish
        </button>
      </div>

      <p className="text-center text-[10px] font-bold text-white/40 py-4">Wissen Edu v1.0.0</p>
    </div>
  );
}
