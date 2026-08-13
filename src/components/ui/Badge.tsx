import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'red' | 'gold' | 'blue' | 'gray';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ children, variant = 'gray', className, ...props }: BadgeProps) {
  const variants = {
    green: 'bg-green-500/20 text-green-400 border-green-500/20',
    red: 'bg-red-500/20 text-red-400 border-red-500/20',
    gold: 'bg-[#FEC204]/20 text-[#FEC204] border-[#FEC204]/20',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    gray: 'bg-white/10 text-white/50 border-white/10',
  };

  return (
    <span 
      className={cn(
        "text-[10px] px-2 py-0.5 rounded-full border leading-none inline-flex items-center justify-center font-bold",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
