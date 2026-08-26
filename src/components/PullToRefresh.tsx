import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({ children, onRefresh, className = "" }: PullToRefreshProps) {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || refreshing) return;
    
    if (containerRef.current && containerRef.current.scrollTop > 0) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0) {
      setPullDistance(Math.min(distance * 0.4, 120));

    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 90 && !refreshing) {
      setRefreshing(true);
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
      setRefreshing(false);
    }
    setPullDistance(0);
    setStartY(0);
  };

  return (
    <main 
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-end overflow-hidden transition-all duration-200 z-50 pointer-events-none"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance / 90
        }}
      >
        <div className={`bg-[#2a2a2a] p-2 mb-2 rounded-full shadow-lg border border-white/10 ${refreshing ? 'animate-spin' : ''}`}>
          <RefreshCw size={22} className="text-[#FEC204]" style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
        </div>
      </div>
      <div 
        className="transition-transform duration-200 h-full"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
    </main>
  );
}
