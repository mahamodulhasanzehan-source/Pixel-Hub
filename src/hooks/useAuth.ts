import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export function useAuth(showToast: (msg: string) => void) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Successfully signed in!");
    } catch (error) {
      console.error("Login error:", error);
      showToast("Failed to sign in.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showToast("Signed out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { user, login, logout };
}
