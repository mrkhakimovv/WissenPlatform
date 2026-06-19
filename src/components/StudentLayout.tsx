import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, CreditCard, CalendarCheck, CalendarDays, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function StudentLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isProfile = location.pathname.endsWith('/profile');
  
  const navItems = [
    { to: ".", icon: <Home size={22} />, label: "Asosiy" },
    { to: "payments", icon: <CreditCard size={22} />, label: "To'lov" },
    { to: "attendance", icon: <CalendarCheck size={22} />, label: "Davomat" },
    { to: "schedule", icon: <CalendarDays size={22} />, label: "Jadval" },
    { to: "profile", icon: <User size={22} />, label: "Profil" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-transparent">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel shrink-0 rounded-none md:m-3 md:rounded-3xl p-5 border-white/5 shadow-2xl relative z-30">
        <div className="flex flex-col mb-10 pl-2 mt-2">
          <h1 className="text-[#FEC204] text-[20px] font-black tracking-[-0.5px] leading-tight line-clamp-2">{user?.fullName || "O'quvchi"}</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[2px] font-bold">O'quvchi Kabineti</p>
        </div>
        <div className="flex flex-col gap-2 flex-1 relative z-30">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        {/* Mobile Top Header - hide on profile page */}
        {!isProfile && (
          <header className="md:hidden h-[72px] px-5 flex items-center justify-between shrink-0 border-b border-white/5 relative z-20">
            <div className="flex flex-col">
              <h1 className="text-[#FEC204] text-[20px] font-black tracking-[-0.5px] leading-tight line-clamp-1">{user?.fullName || "O'quvchi"}</h1>
              <p className="text-white/40 text-[9px] uppercase tracking-[2px] font-bold">O'quvchi Kabineti</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <div className="w-10 h-10 rounded-2xl bg-[#FEC204] flex items-center justify-center text-[#000] font-black text-sm shadow-lg shadow-[#FEC204]/20 border border-white/20">
                {user?.fullName?.substring(0,2).toUpperCase() || 'ST'}
              </div>
            </div>
          </header>
        )}

        {/* Desktop Top Header (Always visible on desktop) */}
        <header className="hidden md:flex h-[80px] px-8 items-center justify-end shrink-0 relative z-20 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[14px] font-bold text-white/90 tracking-wide">{user?.fullName || "O'quvchi"}</span>
              <span className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Talaba</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FEC204] flex items-center justify-center text-[#000] font-black text-[15px] shadow-lg shadow-[#FEC204]/20 border border-white/20">
              {user?.fullName?.substring(0,2).toUpperCase() || 'ST'}
            </div>
          </div>
        </header>

        {/* Main Content Scrollable */}
        <main className={`flex-1 overflow-y-auto scroll-smooth relative z-10 w-full max-w-7xl mx-auto p-5 md:p-8 ${isProfile ? 'md:p-8 p-0' : ''}`}>
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden w-full h-[80px] glass-panel rounded-t-3xl rounded-b-none border-t border-white/10 flex items-center justify-around px-2 z-30 shrink-0 pb-4 relative">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '.'}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                  isActive ? 'text-[#FEC204]' : 'text-white/40 hover:text-white/70'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-[1px]">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
