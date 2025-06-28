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
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const profileData = userDocSnap.data() as UserProfile;
              setUserProfile(profileData);
              console.log(`AuthContext: Loaded profile for user ${currentUser.uid}. Type: ${profileData.type}, Role: ${profileData.role}`);
            } else {
              console.warn(`AuthContext: No profile found in Firestore for user ${currentUser.uid}. This might be expected for new users or if provisioning is pending.`);
              // Assign a default 'viewer' role and 'unclassified' type if no profile exists
              const defaultProfile: UserProfile = {
                uid: currentUser.uid,
                email: currentUser.email || "unknown",
                role: 'viewer' as UserRole, 
                type: 'unclassified' as UserType, 
                createdAt: serverTimestamp() as any, 
              };
              setUserProfile(defaultProfile);
              console.log("AuthContext: Set default 'viewer' role and 'unclassified' type for new/unprofiled user in context.");
            }
          } catch (error: any) {
            const errorMessage = error.message || String(error);
            console.error(`AuthContext: Error fetching user profile for ${currentUser.uid} from Firestore: ${errorMessage}. This could be a Firebase Security Rules issue (e.g., 'Missing or insufficient permissions').`, error);
            // Set a minimal profile or null, and potentially guide user
             const minimalProfile: UserProfile = {
                uid: currentUser.uid,
                email: currentUser.email || "unknown",
                role: 'none' as UserRole, // Indicate an issue with role/profile fetching
                type: 'unclassified' as UserType,
                createdAt: serverTimestamp() as any,
              };
            setUserProfile(minimalProfile); // Or null if preferred
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
      if (auth) {
        await signOut(auth);
      } else {
        console.warn("AuthContext: Attempted logout, but Firebase auth object is uninitialized.");
      }
      setUser(null);
      setUserProfile(null); // Clear user profile on logout
      router.push('/'); // Redirect to home page instead of login
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