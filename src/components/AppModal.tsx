import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Github, AlertCircle, Package, ChevronDown, Check, ExternalLink, HardDrive } from 'lucide-react';
import Markdown from 'react-markdown';
import { AppData, GitHubRelease } from '../types';
import { fetchAllReleases } from '../services/githubService';
import { formatBytes, formatDate } from '../utils/formatters';
import { GITHUB_USER } from '../config/modules';

interface AppModalProps {
  data: AppData;
  onClose: () => void;
  onDownload: (repo: string, version: string, url: string) => void;
}

export const AppModal = ({ 
  data, onClose, onDownload 
}: AppModalProps) => {
  const { repoName, release: initialRelease, error } = data;
  const [release, setRelease] = useState<GitHubRelease | null>(initialRelease);
  const [allReleases, setAllReleases] = useState<GitHubRelease[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const exeAsset = release?.assets.find(a => a.name.endsWith('.exe'));
  const currentViewVersion = release?.tag_name || initialRelease?.tag_name;

  // Prevent background scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen, onClose]);

  const handleVersionClick = async () => {
    if (!isDropdownOpen && allReleases.length === 0) {
      setIsLoadingReleases(true);
      const releases = await fetchAllReleases(repoName);
      setAllReleases(releases);
      setIsLoadingReleases(false);
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectRelease = (selectedRelease: GitHubRelease) => {
    setRelease(selectedRelease);
    setIsDropdownOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-xl border border-white/[0.1] bg-[#0c101a] text-slate-100 shadow-2xl z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-white/[0.08] bg-[#0c101a] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                {repoName.replace(/-/g, ' ')}
              </h2>
              {release && (
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  {/* Version Picker */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={handleVersionClick}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                      title="Switch Version"
                    >
                      <span>{currentViewVersion}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1.5 w-52 max-h-56 overflow-y-auto custom-scrollbar bg-[#121724] border border-white/[0.1] rounded-lg shadow-xl z-50 py-1"
                        >
                          {isLoadingReleases ? (
                            <div className="p-3 text-center text-slate-400 text-xs">
                              Loading versions...
                            </div>
                          ) : allReleases.length > 0 ? (
                            allReleases.map(r => (
                              <button
                                key={r.id}
                                onClick={() => handleSelectRelease(r)}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/[0.06] transition-colors ${
                                  r.tag_name === currentViewVersion
                                    ? 'text-blue-400 font-medium bg-blue-500/10'
                                    : 'text-slate-300'
                                }`}
                              >
                                <span className="font-mono">{r.tag_name}</span>
                                {r.tag_name === currentViewVersion && (
                                  <Check className="w-3.5 h-3.5 text-blue-400" />
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-center text-slate-400 text-xs">
                              No older versions
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <span className="text-slate-400">{formatDate(release.published_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] flex items-center justify-center shrink-0 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable, strictly constrained) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar text-slate-300">
          {error ? (
            <div className="flex items-center gap-2.5 text-rose-400 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to load details: {error}</span>
            </div>
          ) : release ? (
            <div className="space-y-4">
              {/* Release Notes */}
              <div className="prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:text-slate-100 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-p:leading-relaxed prose-a:text-blue-400 hover:prose-a:underline prose-code:bg-white/[0.06] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/[0.08] prose-pre:p-3 prose-pre:rounded-lg">
                <Markdown>{release.body || '_No release notes provided for this release._'}</Markdown>
              </div>

              {/* Assets List if present */}
              {release.assets.length > 0 && (
                <div className="pt-4 border-t border-white/[0.06]">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Release Assets
                  </h4>
                  <div className="space-y-1.5">
                    {release.assets.map((asset) => (
                      <div
                        key={asset.name}
                        className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/[0.05] text-xs"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="font-mono text-slate-300 truncate">{asset.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {asset.size > 0 && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              {formatBytes(asset.size)}
                            </span>
                          )}
                          <a
                            href={asset.browser_download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No release data available.
            </div>
          )}
        </div>

        {/* Footer (Compact, strictly non-overflowing) */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-white/[0.08] bg-black/40 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
          <a
            href={release?.html_url || `https://github.com/${GITHUB_USER}/${repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Release</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="h-8 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
            >
              Close
            </button>

            {exeAsset && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onDownload(repoName, currentViewVersion!, exeAsset.browser_download_url)}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="truncate max-w-[180px] sm:max-w-none">
                  Download {exeAsset.name.endsWith('.exe') ? '.exe' : ''}
                </span>
                {exeAsset.size > 0 && (
                  <span className="text-[10px] opacity-80 font-mono">
                    ({formatBytes(exeAsset.size)})
                  </span>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
