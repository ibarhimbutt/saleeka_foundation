
"use client";

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Client-side Firebase auth and db
import { useRouter } from 'next/navigation';
import type { UserProfile, UserRole, UserType } from '@/lib/firestoreTypes';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // To store Firestore profile data including role and type
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setLoading(true);
        if (currentUser) {
          setUser(currentUser);
          // Fetch user profile from Firestore
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          } else {
            // Optional: Create a default profile if it doesn't exist
            // For now, we'll assume admin users are pre-provisioned in Firestore
            console.warn(`AuthContext: No profile found in Firestore for user ${currentUser.uid}.`);
            // Assign a default 'viewer' role and 'unclassified' type if no profile exists
            // This is a placeholder; ideally, user provisioning handles this.
            const defaultProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || "unknown",
              role: 'viewer' as UserRole, // Default role
              type: 'unclassified' as UserType, // Default type
              createdAt: serverTimestamp() as any, // Placeholder, will be converted by Firestore
            };
            // To prevent errors, we won't auto-create here but will set a minimal profile for context
            // await setDoc(userDocRef, defaultProfile, { merge: true }); 
            setUserProfile(defaultProfile);
            console.log("AuthContext: Set default 'viewer' role and 'unclassified' type for new/unprofiled user in context.");
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      console.warn("AuthContext: Firebase auth object appears uninitialized or invalid. Authentication features will be unavailable.");
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null); // Clear user profile on logout
      router.push('/admin/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setLoading(false);
    }
  };

  const value = { user, userProfile, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
