import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export function RootLayout() {
  return (
    <div className="flex h-screen w-full bg-[color:var(--color-wissen-dark)] overflow-hidden">
      
      {/* Background blobs */}
      <div className="blob blob-gold"></div>
      <div className="blob blob-purple"></div>
      <div className="blob blob-blue"></div>

      {/* Main app container */}
      <div id="root" className="w-full h-[100dvh] relative flex flex-col z-10 overflow-hidden bg-transparent">
        <Outlet />
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-wissen-dark)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            fontSize: '13px',
            fontWeight: '600'
          }
        }}
      />
    </div>
  );
}
