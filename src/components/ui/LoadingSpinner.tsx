import React from 'react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="w-8 h-8 rounded-full border-4 border-[#FEC204]/20 border-t-[#FEC204] animate-spin"></div>
    </div>
  );
}
