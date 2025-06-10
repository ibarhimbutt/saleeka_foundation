
"use client";

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Client-side Firebase auth
import { useRouter } from 'next/navigation';
// Removed unused import: import {NextRouter} from 'next/router';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if the imported 'auth' object appears to be a valid Firebase Auth instance
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      console.warn("AuthContext: Firebase auth object appears uninitialized or invalid. Authentication features will be unavailable.");
      setUser(null); // Explicitly set user to null
      setLoading(false); // Stop loading, user will be null
    }
  }, []); // Empty dependency array is correct as `auth` is a module-level import

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      router.push('/admin/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show a toast notification for logout error
    } finally {
      setLoading(false);
    }
  };

  const value = { user, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

