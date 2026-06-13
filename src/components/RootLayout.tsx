import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export function RootLayout() {
  return (
    <div className="relative h-full w-full font-sans text-[color:var(--theme-text-primary)] bg-[#0d0d0d] overflow-hidden flex items-center justify-center">
      {/* Background Blobs */}
      <div className="blob blob-blue"></div>
      <div className="blob blob-purple"></div>
      <div className="blob blob-gold"></div>
      
      {/* Decorative Text */}
      <div className="hidden sm:block absolute right-[5%] top-[10%] text-[color:var(--theme-text-primary)]/5 font-black text-9xl select-none pointer-events-none z-0">
        EDU
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-full max-w-[430px] flex flex-col overflow-hidden bg-white/5 backdrop-blur-[40px] border-x border-[color:var(--glass-border)] sm:rounded-[40px] sm:h-[95vh] sm:border-y shadow-2xl mx-auto shadow-black/50">
        <Outlet />
      </div>

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      />
    </div>
  );
}
