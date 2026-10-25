import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Search, X, RefreshCw, AlertCircle, KeyRound } from 'lucide-react';

import { AppData } from './types';
import { fetchAllUserApps } from './services/githubService';
import { getGitHubToken } from './utils/tokenStorage';

import { BackgroundDoodles } from './components/BackgroundDoodles';
import { Header } from './components/Header';
import { AppCard } from './components/AppCard';
import { AppModal } from './components/AppModal';
import { Toast } from './components/Toast';
import { TokenModal } from './components/TokenModal';

export default function App() {
  const [appsData, setAppsData] = useState<Record<string, AppData>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, id: Date.now() });
  };

  const loadApps = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await fetchAllUserApps();
      setAppsData(data);
    } catch (e) {
      console.error('Failed to load apps:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleDownload = (repoName: string, version: string, url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading ${repoName} (${version})...`);
  };

  const appList = useMemo(() => Object.values(appsData), [appsData]);

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return appList;
    const q = searchQuery.toLowerCase().trim();
    return appList.filter(app => {
      const name = app.repoName.toLowerCase();
      const body = app.release?.body?.toLowerCase() || '';
      return name.includes(q) || body.includes(q);
    });
  }, [appList, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-blue-500/25 relative flex flex-col antialiased">
      <BackgroundDoodles />
      <Header
        moduleCount={appList.length}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10 flex flex-col">
        {/* Sub-header / Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Software Modules
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Automated builds and standalone releases published to GitHub
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="w-full h-8 pl-8 pr-7 bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-blue-500/50 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadApps(true)}
              disabled={loading || isRefreshing}
              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              title="Refresh Modules"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-3 text-blue-500" />
            <p className="text-xs font-medium text-slate-400">Loading module catalog...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-white/[0.08] p-6 bg-white/[0.01]">
            <AlertCircle className="w-8 h-8 text-slate-600 mb-2.5" />
            <h3 className="text-sm font-semibold text-slate-300">
              {searchQuery ? 'No matching modules found' : 'No releases found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchQuery
                ? `No module matching "${searchQuery}". Try a different keyword.`
                : 'Repositories with published GitHub releases will automatically appear here.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-blue-400 hover:underline"
              >
                Clear search
              </button>
            ) : (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setIsTokenModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm shadow-blue-500/20"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{getGitHubToken() ? 'Manage GitHub Token' : 'Add GitHub Token (Fix Rate Limit)'}</span>
                </button>
                <button
                  onClick={() => loadApps(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredApps.map((data, index) => (
              <AppCard 
                key={data.repoName} 
                data={data} 
                index={index}
                onOpenDetails={() => setSelectedApp(data)}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal Dialogs */}
      <AnimatePresence>
        {selectedApp && (
          <AppModal 
            data={selectedApp} 
            onClose={() => setSelectedApp(null)} 
            onDownload={handleDownload}
          />
        )}
        {isTokenModalOpen && (
          <TokenModal
            onClose={() => setIsTokenModalOpen(false)}
            onSaved={() => {
              showToast('Token updated! Reloading modules...');
              loadApps(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
