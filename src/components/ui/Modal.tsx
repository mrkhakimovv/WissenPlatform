import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:absolute">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn("glass-panel w-full max-w-sm p-6 bg-[#1a1a1a]/95 border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar", className)}
          >
            {(title || onClose) && (
              <div className="flex justify-between items-center mb-5">
                {title ? (
                  typeof title === 'string' ? (
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">{title}</h2>
                  ) : title
                ) : <div />}
                
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
