const fs = require('fs');
let code = fs.readFileSync('src/components/StudentLayout.tsx', 'utf-8');

const importTarget = `import { useAuth } from '../contexts/AuthContext';`;
const newImport = `import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';`;
code = code.replace(importTarget, newImport);

const mobileHeaderTarget = `            <div className="flex items-center gap-3 shrink-0 ml-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileOpen(true)}>
              <div className="w-10 h-10 rounded-2xl bg-[#FEC204] flex items-center justify-center text-[#000] font-black text-sm shadow-lg shadow-[#FEC204]/20 border border-white/20">`;
const newMobileHeader = `            <div className="flex items-center gap-3 shrink-0 ml-2">
              <NotificationCenter />
              <div className="cursor-pointer hover:opacity-80 transition-opacity w-10 h-10 rounded-2xl bg-[#FEC204] flex items-center justify-center text-[#000] font-black text-sm shadow-lg shadow-[#FEC204]/20 border border-white/20" onClick={() => setIsProfileOpen(true)}>`;
code = code.replace(mobileHeaderTarget, newMobileHeader);

const desktopHeaderTarget = `        {/* Desktop Top Header (Always visible on desktop) */}
        <header className="hidden md:flex h-[80px] px-8 items-center justify-end shrink-0 relative z-20 border-b border-white/5">
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileOpen(true)}>`;
const newDesktopHeader = `        {/* Desktop Top Header (Always visible on desktop) */}
        <header className="hidden md:flex h-[80px] px-8 items-center justify-end shrink-0 relative z-20 border-b border-white/5 gap-4">
          <NotificationCenter />
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileOpen(true)}>`;
code = code.replace(desktopHeaderTarget, newDesktopHeader);

fs.writeFileSync('src/components/StudentLayout.tsx', code);
