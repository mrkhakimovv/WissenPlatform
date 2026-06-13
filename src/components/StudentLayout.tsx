import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, CreditCard, CalendarCheck, CalendarDays, User, Moon, Sun, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function StudentLayout() {
  const { user } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const location = useLocation();
  const isProfile = location.pathname.endsWith('/profile');
  
  const navItems = [
    { to: ".", icon: <Home size={22} />, label: "Asosiy" },
    { to: "payments", icon: <CreditCard size={22} />, label: "To'lovlar" },
    { to: "attendance", icon: <CalendarCheck size={22} />, label: "Davomat" },
    { to: "schedule", icon: <CalendarDays size={22} />, label: "Jadval" },
    { to: "profile", icon: <User size={22} />, label: "Profil" },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Header */}
      {!isProfile && (
        <header className="px-6 pt-10 pb-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[#FEC204] text-xl font-bold tracking-tight">{user?.fullName || "O'quvchi"}</h1>
            <p className="opacity-50 text-[10px] uppercase tracking-widest font-semibold mt-0.5">O'quvchi Kabineti</p>
          </div>
          <div className="flex items-center gap-3 text-[var(--theme-text-primary)]">
            <button onClick={cycleTheme} className="w-10 h-10 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-center opacity-70 hover:text-[#FEC204] transition-colors">
              {theme === 'dark' ? <Moon size={16} /> : theme === 'light' ? <Sun size={16} /> : <Layers size={16} />}
            </button>
            <div className="w-10 h-10 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-center text-[#FEC204] font-bold">
              {user?.fullName?.substring(0,2).toUpperCase() || 'ST'}
            </div>
          </div>
        </header>
      )}

      {/* Main Content Scrollable */}
      <main className="flex-1 overflow-y-auto px-6 pb-6 pt-2 scroll-smooth">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="w-full h-20 bg-white/5 backdrop-blur-2xl border-t border-[color:var(--glass-border)] flex items-center justify-around px-1 sm:rounded-b-[40px] z-30 shrink-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '.'}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-[20%] gap-1 transition-all ${
                isActive ? 'text-[#FEC204]' : 'text-[color:var(--theme-text-primary)]/40 hover:text-[color:var(--theme-text-primary)]/70'
              }`
            }
          >
            {item.icon}
            <span className={`text-[9px] ${true ? 'font-medium' : ''}`}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
