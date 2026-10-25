import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DownloadCloud, X } from 'lucide-react';

interface ToastProps {
  toast: { message: string; id: number } | null;
  onClose: () => void;
}

export const Toast = ({ toast, onClose }: ToastProps) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 max-w-sm w-[calc(100vw-2rem)] bg-[#101420] border border-blue-500/30 text-slate-100 px-3.5 py-2.5 rounded-lg shadow-xl z-50 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <DownloadCloud className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-medium text-slate-200 truncate">
              {toast.message}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
