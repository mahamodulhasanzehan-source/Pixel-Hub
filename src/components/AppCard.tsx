import React from 'react';
import { motion } from 'motion/react';
import { Download, Info, AlertCircle, Package, Calendar, HardDrive } from 'lucide-react';
import { AppData } from '../types';
import { formatBytes, formatTimeAgo } from '../utils/formatters';

interface AppCardProps {
  data: AppData;
  index: number;
  onOpenDetails: () => void;
  onDownload: (repo: string, version: string, url: string) => void;
}

export const AppCard = ({ 
  data, index, onOpenDetails, onDownload 
}: AppCardProps) => {
  const { repoName, release, error } = data;
  const exeAsset = release?.assets.find(a => a.name.endsWith('.exe'));
  const latestVersion = release?.tag_name;

  // Clean description string by stripping markdown headers/bold for clean card preview
  const cleanDescription = release?.body
    ? release.body
        .replace(/#+\s+/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`]/g, '')
        .trim()
    : 'No release description provided.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0c101a]/85 hover:bg-[#0f1422] hover:border-blue-500/40 transition-all duration-200 shadow-sm hover:shadow-[0_8px_30px_-6px_rgba(59,130,246,0.18)]"
    >
      {/* Top Specular Line on Hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/40 transition-all duration-300" />

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col cursor-pointer" onClick={onOpenDetails}>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 group-hover:border-blue-500/40 group-hover:bg-blue-500/15 transition-colors">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-blue-300 transition-colors truncate">
                {repoName.replace(/-/g, ' ')}
              </h3>
              {release && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{formatTimeAgo(release.published_at)}</span>
                </div>
              )}
            </div>
          </div>

          {release && (
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="font-mono text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                {release.tag_name}
              </span>
              {exeAsset && exeAsset.size > 0 && (
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <HardDrive className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{formatBytes(exeAsset.size)}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="flex-1 mb-2">
          {error ? (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="truncate">Failed to load: {error}</p>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
              {cleanDescription}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div 
        className="px-4 py-3 sm:px-5 border-t border-white/[0.06] bg-black/20 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onOpenDetails}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors py-1 px-1.5 -ml-1.5 rounded hover:bg-white/[0.04]"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        {exeAsset ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onDownload(repoName, latestVersion!, exeAsset.browser_download_url)}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </motion.button>
        ) : (
          <span className="text-xs text-slate-500 italic py-1">
            No installer
          </span>
        )}
      </div>
    </motion.div>
  );
};
