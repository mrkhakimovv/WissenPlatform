import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-[11px] text-[color:var(--theme-text-primary)]/50 px-1 uppercase tracking-wider font-bold block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-[color:var(--theme-text-primary)]/30 text-[color:var(--theme-text-primary)] transition-colors',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
