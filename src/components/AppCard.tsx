import React from 'react';
import { motion } from 'motion/react';
import { Download, Play, Info, X, AlertCircle, Box, Trash2, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';
import { AppData } from '../types';

interface AppCardProps {
  data: AppData;
  index: number;
  installedVersion?: string;
  onOpenDetails: () => void;
  onDownloadOrUpdate: (repo: string, version: string, url: string, isUpdate?: boolean) => void;
  onUninstall: (repo: string) => void;
  onOpen: (repo: string) => void;
}

export const AppCard = ({ 
  data, index, installedVersion, onOpenDetails, onDownloadOrUpdate, onUninstall, onOpen 
}: AppCardProps) => {
  const { repoName, release, error } = data;
  const exeAsset = release?.assets.find(a => a.name.endsWith('.exe'));
  
  const latestVersion = release?.tag_name;
  const isInstalled = !!installedVersion;
  const needsUpdate = isInstalled && installedVersion !== latestVersion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col cursor-pointer group hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300"
      onClick={onOpenDetails}
    >
      <div className="p-8 flex-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10" />
        
        <div className="flex justify-between items-start mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 group-hover:border-blue-500/30 transition-colors">
              <Box className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              {repoName.replace(/-/g, ' ')}
            </h2>
          </div>
          {release && (
            <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-xs font-bold text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
              {release.tag_name}
            </span>
          )}
        </div>

        <div className="relative">
          {error ? (
            <div className="flex items-start gap-3 text-red-400 text-sm bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">Failed to load module: {error}</p>
            </div>
          ) : release ? (
            <div className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
              <Markdown>{release.body}</Markdown>
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic">No module information available.</p>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-slate-800/50 bg-slate-900/80 flex gap-3 relative z-10" onClick={e => e.stopPropagation()}>
        {exeAsset ? (
          <>
            {needsUpdate ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDownloadOrUpdate(repoName, latestVersion!, exeAsset.browser_download_url, true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:from-amber-500 hover:to-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-400/20 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update Available</span>
              </motion.button>
            ) : isInstalled ? (
              <div className="flex-1 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onOpen(repoName)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300"
                >
                  <Play className="w-4 h-4" />
                  <span>Open</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUninstall(repoName)}
                  className="flex items-center justify-center py-3 px-4 rounded-2xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all duration-300"
                  title="Uninstall"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDownloadOrUpdate(repoName, latestVersion!, exeAsset.browser_download_url, false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/20 transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                <span>Get Module</span>
              </motion.button>
            )}
          </>
        ) : (
          <button disabled className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed">
            <X className="w-4 h-4" />
            <span>Unavailable</span>
          </button>
        )}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenDetails}
          className="p-3 rounded-2xl bg-slate-800/50 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all border border-slate-700/50"
          title="View Details"
        >
          <Info className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};
