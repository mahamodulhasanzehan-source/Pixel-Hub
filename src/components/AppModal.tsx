import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Info, X, Github, AlertCircle, Box, CheckCircle2, RefreshCw, ChevronDown } from 'lucide-react';
import Markdown from 'react-markdown';
import { AppData, GitHubRelease } from '../types';
import { fetchAllReleases } from '../services/githubService';

interface AppModalProps {
  data: AppData;
  installedVersion?: string;
  onClose: () => void;
  onDownloadOrUpdate: (repo: string, version: string, url: string, isUpdate?: boolean) => void;
}

export const AppModal = ({ 
  data, installedVersion, onClose, onDownloadOrUpdate 
}: AppModalProps) => {
  const { repoName, release: initialRelease, error } = data;
  const [release, setRelease] = useState<GitHubRelease | null>(initialRelease);
  const [allReleases, setAllReleases] = useState<GitHubRelease[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);

  const exeAsset = release?.assets.find(a => a.name.endsWith('.exe'));
  
  const latestVersion = initialRelease?.tag_name;
  const currentViewVersion = release?.tag_name;
  const isInstalled = !!installedVersion;
  const needsUpdate = isInstalled && installedVersion !== latestVersion;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40, rotateX: -10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />
        
        <div className="flex items-center justify-between p-8 border-b border-slate-800/50 bg-slate-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <Box className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">{repoName.replace(/-/g, ' ')}</h2>
              {release && (
                <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-400">
                  <div className="relative">
                    <button 
                      onClick={handleVersionClick}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      {currentViewVersion}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 w-48 max-h-60 overflow-y-auto custom-scrollbar bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50"
                        >
                          {isLoadingReleases ? (
                            <div className="p-3 text-center text-slate-400 text-xs">Loading versions...</div>
                          ) : allReleases.length > 0 ? (
                            <div className="py-1">
                              {allReleases.map(r => (
                                <button
                                  key={r.id}
                                  onClick={() => handleSelectRelease(r)}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${r.tag_name === currentViewVersion ? 'text-blue-400 bg-slate-700/50' : 'text-slate-300'}`}
                                >
                                  {r.tag_name}
                                  {r.tag_name === latestVersion && <span className="ml-2 text-xs text-slate-500">(Latest)</span>}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 text-center text-slate-400 text-xs">No other versions found</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                    {new Date(release.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {isInstalled && !needsUpdate && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Previously downloaded
                    </span>
                  )}
                  {isInstalled && needsUpdate && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <RefreshCw className="w-4 h-4" />
                      New version available
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700/50"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {error ? (
              <div className="text-red-400 flex items-center gap-3 bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                <AlertCircle className="w-6 h-6" />
                <span className="font-medium text-lg">{error}</span>
              </div>
            ) : release ? (
              <div className="prose prose-invert prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-100 prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-pre:bg-slate-950/80 prose-pre:border prose-pre:border-slate-800 prose-pre:shadow-xl prose-img:rounded-2xl prose-img:border prose-img:border-slate-800">
                <Markdown>{release.body}</Markdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Info className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg italic">No detailed documentation available for this module.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-800/50 bg-slate-900/80 flex justify-end gap-4 relative z-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-8 py-3.5 rounded-2xl font-bold text-sm text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 transition-colors"
          >
            Close
          </motion.button>
          
          {exeAsset && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDownloadOrUpdate(repoName, currentViewVersion!, exeAsset.browser_download_url, false)}
              className="flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-blue-400/30 transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              <span className="text-base">Download {exeAsset.name}</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
