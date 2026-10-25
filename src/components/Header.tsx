import React from 'react';
import { Layers, Github, ExternalLink, KeyRound } from 'lucide-react';
import { GITHUB_USER } from '../config/modules';
import { getGitHubToken } from '../utils/tokenStorage';

interface HeaderProps {
  moduleCount?: number;
  onOpenTokenModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ moduleCount, onOpenTokenModal }) => {
  const hasToken = Boolean(getGitHubToken());

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#07090e]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            Pixcel Hub
          </span>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-xs text-slate-400 hidden sm:inline font-mono">
            @{GITHUB_USER}
          </span>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2.5">
          {typeof moduleCount === 'number' && (
            <span className="text-xs text-slate-400 tabular-nums mr-1">
              {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
            </span>
          )}

          {onOpenTokenModal && (
            <button
              onClick={onOpenTokenModal}
              title={hasToken ? 'GitHub Token Active' : 'Configure GitHub Token'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                hasToken
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15'
                  : 'text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{hasToken ? 'Token Active' : 'Token'}</span>
            </button>
          )}

          <a
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>
    </header>
  );
};
