import React from 'react';
import { motion } from 'motion/react';
import { Layers } from 'lucide-react';
import { GITHUB_USER } from '../config/modules';

export const Header = () => {
  return (
    <header className="border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Layers className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-blue-400 drop-shadow-sm">Pixcel Hub</h1>
            <p className="text-sm text-slate-400 font-medium">@{GITHUB_USER}'s Modules</p>
          </div>
        </motion.div>
      </div>
    </header>
  );
};
