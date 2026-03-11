import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Play, Info, X, Github, AlertCircle, Loader2, Code, Box, Cpu, Layers, Sparkles, Hexagon, Triangle, Circle, Terminal, LogIn, LogOut, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { AppData, GitHubRelease } from './types';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';

const GITHUB_USER = 'mahamodulhasanzehan-source';
// Add your new repositories to this array!
const INITIAL_REPOS = ['Duplicate-Finder'];

const BackgroundDoodles = () => {
  const icons = [Code, Box, Cpu, Layers, Sparkles, Hexagon, Triangle, Circle, Terminal];
  const [doodles, setDoodles] = useState<Array<{ id: number; Icon: any; size: number; left: number; top: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    const newDoodles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      Icon: icons[i % icons.length],
      size: Math.random() * 40 + 20,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -20,
    }));
    setDoodles(newDoodles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-slate-950/80" />
      {doodles.map((doodle) => {
        const { Icon } = doodle;
        return (
          <motion.div
            key={doodle.id}
            className="absolute text-blue-500/10"
            style={{ left: `${doodle.left}%`, top: `${doodle.top}%` }}
            animate={{
              y: [0, -60, 0],
              x: [0, 40, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: doodle.duration,
              repeat: Infinity,
              ease: "linear",
              delay: doodle.delay,
            }}
          >
            <Icon size={doodle.size} strokeWidth={1.5} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default function App() {
  const [repos, setRepos] = useState<string[]>(INITIAL_REPOS);
  const [appsData, setAppsData] = useState<Record<string, AppData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  
  // Auth & State
  const [user, setUser] = useState<User | null>(null);
  const [installedApps, setInstalledApps] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setInstalledApps({});
      return;
    }
    
    // Listen to user's installed apps from Firestore
    const unsubscribe = onSnapshot(collection(db, `users/${user.uid}/installedApps`), (snapshot) => {
      const apps: Record<string, string> = {};
      snapshot.forEach((doc) => {
        apps[doc.id] = doc.data().version;
      });
      setInstalledApps(apps);
    }, (error) => {
      console.error("Error fetching installed apps:", error);
      showToast("Could not sync your installed apps.");
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      const newData: Record<string, AppData> = {};

      for (const repo of repos) {
        try {
          const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}/releases/latest`);
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }
          const release: GitHubRelease = await response.json();
          newData[repo] = { repoName: repo, release };
        } catch (error) {
          console.error(`Error fetching ${repo}:`, error);
          newData[repo] = { repoName: repo, release: null, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }

      setAppsData(newData);
      setLoading(false);
    };

    fetchApps();
  }, [repos]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Successfully signed in!");
    } catch (error) {
      console.error("Login error:", error);
      showToast("Failed to sign in.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Signed out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDownloadOrUpdate = async (repoName: string, version: string, url: string, isUpdate: boolean = false) => {
    if (!user) {
      showToast("Please sign in to download modules.");
      handleLogin();
      return;
    }

    // Trigger actual file download
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Save to Firestore
    try {
      await setDoc(doc(db, `users/${user.uid}/installedApps/${repoName}`), {
        version,
        installedAt: new Date().toISOString()
      });
      showToast(isUpdate ? `Successfully updated ${repoName}!` : `Successfully installed ${repoName}!`);
    } catch (error) {
      console.error("Error saving install to Firestore:", error);
      showToast("Downloaded, but failed to sync to your account.");
    }
  };

  const handleUninstall = async (repoName: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/installedApps/${repoName}`));
      showToast(`Uninstalled ${repoName} from your device.`);
    } catch (error) {
      console.error("Error uninstalling:", error);
      showToast("Failed to uninstall module.");
    }
  };

  const handleOpen = (repoName: string) => {
    showToast(`Opening ${repoName} on your desktop... (Simulated)`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 relative">
      <BackgroundDoodles />
      
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
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </motion.div>
        </div>
      </header>

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
            {repos.map((repo, index) => {
              const data = appsData[repo];
              if (!data) return null;

              return (
                <AppCard 
                  key={repo} 
                  data={data} 
                  index={index}
                  installedVersion={installedApps[repo]}
                  onOpenDetails={() => setSelectedApp(data)}
                  onDownloadOrUpdate={handleDownloadOrUpdate}
                  onUninstall={handleUninstall}
                  onOpen={handleOpen}
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
            installedVersion={installedApps[selectedApp.repoName]}
            onClose={() => setSelectedApp(null)} 
            onDownloadOrUpdate={handleDownloadOrUpdate}
            onUninstall={handleUninstall}
            onOpen={handleOpen}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-800/90 backdrop-blur-md border border-slate-700/80 text-slate-100 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex items-center gap-3"
          >
            <Info className="w-5 h-5 text-blue-400" />
            <span className="font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppCard({ 
  data, index, installedVersion, onOpenDetails, onDownloadOrUpdate, onUninstall, onOpen 
}: { 
  data: AppData, index: number, installedVersion?: string, onOpenDetails: () => void, 
  onDownloadOrUpdate: (repo: string, version: string, url: string, isUpdate?: boolean) => void,
  onUninstall: (repo: string) => void,
  onOpen: (repo: string) => void
}) {
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
}

function AppModal({ 
  data, installedVersion, onClose, onDownloadOrUpdate, onUninstall, onOpen 
}: { 
  data: AppData, installedVersion?: string, onClose: () => void, 
  onDownloadOrUpdate: (repo: string, version: string, url: string, isUpdate?: boolean) => void,
  onUninstall: (repo: string) => void,
  onOpen: (repo: string) => void
}) {
  const { repoName, release, error } = data;
  const exeAsset = release?.assets.find(a => a.name.endsWith('.exe'));
  
  const latestVersion = release?.tag_name;
  const isInstalled = !!installedVersion;
  const needsUpdate = isInstalled && installedVersion !== latestVersion;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                    <Github className="w-4 h-4" />
                    {release.tag_name}
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                    {new Date(release.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {isInstalled && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Installed: {installedVersion}
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
            <>
              {needsUpdate ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDownloadOrUpdate(repoName, latestVersion!, exeAsset.browser_download_url, true)}
                  className="flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:from-amber-500 hover:to-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-400/20 transition-all duration-300"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-base">Update to {latestVersion}</span>
                </motion.button>
              ) : isInstalled ? (
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onUninstall(repoName)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all duration-300"
                  >
                    <Trash2 className="w-5 h-5" />
                    Uninstall
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpen(repoName)}
                    className="flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300"
                  >
                    <Play className="w-5 h-5" />
                    <span className="text-base">Open Module</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDownloadOrUpdate(repoName, latestVersion!, exeAsset.browser_download_url, false)}
                  className="flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-blue-400/30 transition-all duration-300"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-base">Download {exeAsset.name}</span>
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
