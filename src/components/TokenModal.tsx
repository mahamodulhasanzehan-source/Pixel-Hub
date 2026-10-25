import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, X, Check, Trash2, ExternalLink } from 'lucide-react';
import { getGitHubToken, setGitHubToken } from '../utils/tokenStorage';

interface TokenModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({ onClose, onSaved }) => {
  const [token, setToken] = useState(getGitHubToken());
  const [copied, setCopied] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGitHubToken(token.trim());
    setCopied(true);
    setTimeout(() => {
      onSaved();
      onClose();
    }, 400);
  };

  const handleClear = () => {
    setGitHubToken('');
    setToken('');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        className="relative w-full max-w-md bg-[#0c0f17] border border-white/[0.08] rounded-xl shadow-2xl p-5 z-10 overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <KeyRound className="w-4 h-4 text-blue-400" />
            <span>GitHub Personal Access Token</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <p className="text-xs text-slate-400 leading-relaxed">
            GitHub limits unauthenticated requests to 60/hr. Adding your Personal Access Token increases this to 5,000/hr and resolves rate limit errors.
          </p>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_... or github_pat_..."
              className="w-full h-8 px-2.5 bg-white/[0.04] border border-white/[0.08] focus:border-blue-500/50 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href="https://github.com/settings/tokens?type=beta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
            >
              <span>Generate token</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2">
              {getGitHubToken() && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-7 px-2.5 inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
              <button
                type="submit"
                className="h-7 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : null}
                <span>{token.trim() ? 'Save & Reload' : 'Save'}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
