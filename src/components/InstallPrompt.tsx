import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const { isInstallable, installApp } = usePWAInstall();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isInstallable || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-[9999] animate-in slide-in-from-bottom-10">
      <div className="max-w-md mx-auto bg-[#FEC204] rounded-2xl shadow-[0_0_40px_rgba(254,194,4,0.3)] p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-[10px] flex items-center justify-center shrink-0">
            <span className="text-[#FEC204] font-black text-xl">W</span>
          </div>
          <div>
            <h3 className="text-black font-black text-[14px] leading-tight mb-0.5">Wissen Edu</h3>
            <p className="text-black/70 text-[11px] font-bold leading-tight">Ilovani ekranga o'rnating</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={installApp}
            className="px-4 py-2 bg-black text-white text-[12px] font-bold rounded-xl hover:bg-gray-900 transition-colors flex items-center gap-1.5"
          >
            <Download size={14} />
            O'rnatish
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="w-8 h-8 flex items-center justify-center text-black/50 hover:text-black hover:bg-black/10 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
