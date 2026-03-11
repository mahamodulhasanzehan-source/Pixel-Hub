import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';

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
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 bg-slate-800/90 backdrop-blur-md border border-slate-700/80 text-slate-100 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex items-center gap-3"
        >
          <Info className="w-5 h-5 text-blue-400" />
          <span className="font-medium">{toast.message}</span>
          <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
