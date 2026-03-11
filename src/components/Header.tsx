import React from 'react';
import { motion } from 'motion/react';
import { Layers, LogIn, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { GITHUB_USER } from '../config/modules';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header = ({ user, onLogin, onLogout }: HeaderProps) => {
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

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {user.email}
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </motion.div>
      </div>
    </header>
  );
};
