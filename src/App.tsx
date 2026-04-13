import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

import { AppData } from './types';
import { MODULES_LIST } from './config/modules';
import { fetchAppReleases } from './services/githubService';

import { BackgroundDoodles } from './components/BackgroundDoodles';
import { Header } from './components/Header';
import { AppCard } from './components/AppCard';
import { AppModal } from './components/AppModal';
import { Toast } from './components/Toast';

export default function App() {
  const [appsData, setAppsData] = useState<Record<string, AppData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const loadApps = async () => {
      setLoading(true);
      const data = await fetchAppReleases(MODULES_LIST);
      setAppsData(data);
      setLoading(false);
    };
    loadApps();
  }, []);

  const handleDownload = (repoName: string, version: string, url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading ${repoName} ${version}...`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 relative">
      <BackgroundDoodles />
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-slate-400"
          >
            <Loader2 className="w-10 h-10 animate-spin mb-6 text-blue-500" />
            <p className="text-lg font-medium animate-pulse">Initializing Pixcel Hub modules...</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MODULES_LIST.map((repo, index) => {
              const data = appsData[repo];
              if (!data) return null;

              return (
                <AppCard 
                  key={repo} 
                  data={data} 
                  index={index}
                  onOpenDetails={() => setSelectedApp(data)}
                  onDownload={handleDownload}
                />
              );
            })}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedApp && (
          <AppModal 
            data={selectedApp} 
            onClose={() => setSelectedApp(null)} 
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
