import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon | string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        {typeof Icon === 'string' ? (
          <span className="text-[24px]">{Icon}</span>
        ) : (
          <Icon size={24} className="text-white/50" />
        )}
      </div>
      <h3 className="text-[18px] font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-[13px] text-white/40 max-w-sm font-medium mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
