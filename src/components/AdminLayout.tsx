import { useConfirm } from '../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PullToRefresh } from './PullToRefresh';
import { Home, Users, CreditCard, CalendarCheck, BookOpen, Layers, LogOut, FileText, Megaphone, QrCode, X, Copy, CheckCircle2, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, query, getDocs, orderBy, where } from '../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { Group } from '../types';

export default function AdminLayout() {
  const { confirm } = useConfirm();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isStudentsPage = location.pathname.includes('/admin/students');

  
  let navItems = [
    { to: ".", icon: <Home size={22} />, label: "Asosiy" },
    { to: "groups", icon: <Layers size={22} />, label: "Guruhlar" },
    { to: "students", icon: <Users size={22} />, label: "O'quvchilar" },
    { to: "payments", icon: <CreditCard size={22} />, label: "To'lov" },
    { to: "attendance", icon: <CalendarCheck size={22} />, label: "Davomat" },
    { to: "more", icon: <BookOpen size={22} />, label: "Boshqa" },
    { to: "sat", icon: <Database size={22} />, label: "SAT BAZA" },
    { to: "tests", icon: <Database size={22} />, label: "Testlar bazasi" },
    { to: "exams", icon: <FileText size={22} />, label: "Imtihonlar" },
    { to: "homeworks", icon: <FileText size={22} />, label: "Vazifalar" },
    { to: "news", icon: <Megaphone size={22} />, label: "Yangiliklar" },
  ];

  if (user?.role === 'teacher') {
    navItems = navItems.filter(item => 
      ['.', 'students', 'attendance', 'homeworks', 'tests', 'sat', 'exams'].includes(item.to)
    );
  }

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/qoshil`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-transparent">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel shrink-0 rounded-none md:m-3 md:rounded-3xl p-5 border-white/5 shadow-2xl">
        <div className="flex flex-col mb-10 pl-2 mt-2">
          <h1 className="text-[#FEC204] text-[24px] font-black tracking-[-0.5px] leading-tight">Wissen Edu</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[2px] font-bold">Admin Panel</p>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              replace
              end={item.to === '.'}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-[#FEC204] text-black font-bold shadow-[0_0_15px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span className="text-[14px] font-bold tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </div>
        <button onClick={async () => { if (await confirm({ title: 'Diqqat', message: `Rostdan tizimdan chiqmoqchimisiz?` })) { logout().then(() => navigate('/login', { replace: true })); } }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white/90 hover:bg-white/5 transition-all mt-auto mb-2 text-left w-full group">
          <LogOut size={22} className="group-hover:text-red-400 transition-colors" />
          <span className="text-[14px] font-bold tracking-wide group-hover:text-red-400 transition-colors">Chiqish</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        {/* Mobile Top Header */}
        <header className="md:hidden h-[72px] px-5 flex items-center justify-between shrink-0 border-b border-white/5 ">
          <div className="flex flex-col">
            <h1 className="text-[#FEC204] text-[20px] font-black tracking-[-0.5px] leading-tight">Wissen Edu</h1>
            <p className="text-white/40 text-[9px] uppercase tracking-[2px] font-bold">Admin Panel</p>
          </div>
          <div className="flex items-center gap-3">
            {isStudentsPage && (
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="w-10 h-10 rounded-2xl bg-[rgba(254,194,4,0.1)] flex items-center justify-center text-[#FEC204] hover:bg-[rgba(254,194,4,0.2)] active:scale-95 transition-all border border-[#FEC204]/20"
                title="O'quvchi qabul qilish"
              >
                <QrCode size={18} />
              </button>
            )}
            <button onClick={async () => { if (await confirm({ title: 'Diqqat', message: `Rostdan tizimdan chiqmoqchimisiz?` })) { logout().then(() => navigate('/login', { replace: true })); } }} className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-white/70 hover:text-[#FEC204] active:scale-95 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Desktop Top Header */}
        <header className="hidden md:flex h-[80px] px-8 items-center justify-end shrink-0  border-b border-white/5">
          <div className="flex items-center gap-4">
            {isStudentsPage && (
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="h-11 px-4 rounded-2xl bg-[rgba(254,194,4,0.1)] flex items-center gap-2 text-[#FEC204] hover:bg-[rgba(254,194,4,0.2)] active:scale-95 transition-all border border-[#FEC204]/20 font-bold text-[13px] mr-2"
              >
                <QrCode size={18} />
                <span>O'quvchi qabul qilish</span>
              </button>
            )}
            <div className="flex flex-col items-end mr-2">
              <span className="text-[14px] font-bold text-white/90 tracking-wide">{user?.fullName || 'Administrator'}</span>
              <span className="text-[11px] text-white/40 font-bold uppercase tracking-wider">{user?.role === 'teacher' ? "O'qituvchi" : 'Boshqaruv'}</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FEC204] flex items-center justify-center text-[#000] font-black text-[15px] shadow-lg shadow-[#FEC204]/20 border border-white/20 uppercase">
              {user?.fullName ? user.fullName.substring(0, 2) : 'AD'}
            </div>
          </div>
        </header>

        {/* Main Content Scrollable */}
        <PullToRefresh className="flex-1 overflow-y-auto overscroll-y-contain p-5 md:p-8 scroll-smooth  w-full max-w-7xl mx-auto">
          <Outlet />
        </PullToRefresh>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden w-full glass-panel rounded-t-3xl rounded-b-none border-t border-white/10 flex items-center justify-start px-2 z-30 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 overflow-x-auto gap-2 scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              replace
              end={item.to === '.'}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center min-w-[70px] h-[55px] gap-1 transition-all ${
                  isActive ? 'text-[#FEC204]' : 'text-white/40 hover:text-white/70'
                }`
              }
            >
              {item.icon}
              <span className="text-[9px] font-bold uppercase tracking-[0.5px] truncate max-w-full">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {isInviteModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsInviteModalOpen(false)}>
            <div className="w-full max-w-[400px] glass-panel border border-white/10 rounded-[24px] p-8 flex flex-col items-center text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsInviteModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-white/60 transition-colors">
                <X size={16} />
              </button>
              <h2 className="text-[20px] font-black text-white mb-2">O'quvchi qabul qilish</h2>
              <p className="text-[13px] text-white/60 mb-6 leading-relaxed">
                Ushbu QR kodni o'quvchilarga ko'rsating. Ular kodni skanerlab platformadan ro'yxatdan o'tishlari mumkin.
              </p>

              <div className="bg-white p-4 rounded-[20px] mb-8 shadow-[0_0_40px_rgba(254,194,4,0.15)] transition-all">
                <QRCodeSVG 
                  value={`${window.location.origin}/qoshil`} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="w-full flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/qoshil`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-[12px] p-3 text-[12px] text-white/60 outline-none"
                />
                <button 
                  onClick={handleCopyLink}
                  className="w-[48px] h-[48px] flex items-center justify-center bg-[rgba(254,194,4,0.15)] text-[#FEC204] rounded-[12px] hover:bg-[rgba(254,194,4,0.25)] transition-colors shrink-0"
                >
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
