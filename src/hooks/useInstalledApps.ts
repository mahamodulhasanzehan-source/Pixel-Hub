import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { User } from 'firebase/auth';

export function useInstalledApps(user: User | null, showToast: (msg: string) => void) {
  const [installedApps, setInstalledApps] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      setInstalledApps({});
      return;
    }
    
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
  }, [user, showToast]);

  const installOrUpdate = async (repoName: string, version: string, url: string, isUpdate: boolean = false) => {
    if (!user) return false;

    // Trigger actual file download
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    try {
      await setDoc(doc(db, `users/${user.uid}/installedApps/${repoName}`), {
        version,
        installedAt: new Date().toISOString()
      });
      showToast(isUpdate ? `Successfully updated ${repoName}!` : `Successfully installed ${repoName}!`);
      return true;
    } catch (error) {
      console.error("Error saving install to Firestore:", error);
      showToast("Downloaded, but failed to sync to your account.");
      return false;
    }
  };

  const uninstall = async (repoName: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/installedApps/${repoName}`));
      showToast(`Uninstalled ${repoName} from your device.`);
    } catch (error) {
      console.error("Error uninstalling:", error);
      showToast("Failed to uninstall module.");
    }
  };

  return { installedApps, installOrUpdate, uninstall };
}
