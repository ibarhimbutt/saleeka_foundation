"use client";

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import type { UserProfile, UserRole, UserType } from '@/lib/firestoreTypes';

// Utility function to convert Firebase User to AuthUser
const convertFirebaseUserToAuthUser = (firebaseUser: User): any => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    emailVerified: firebaseUser.emailVerified,
    isAnonymous: firebaseUser.isAnonymous,
  };
};

// Utility function to convert Neo4j node to UserProfile
const convertNeo4jNodeToUserProfile = (neo4jNode: any): UserProfile => {
  // Map Neo4j role to UserProfile role
  const mapRole = (neo4jRole: string): any => {
    switch (neo4jRole) {
      case 'superAdmin':
      case 'editor':
      case 'viewer':
        return neo4jRole;
      case 'admin':
        return 'superAdmin';
      case 'student':
      case 'mentor':
      case 'professional':
      case 'donor':
        return 'viewer';
      default:
        return 'viewer';
    }
  };

  // Map Neo4j type to UserProfile type
  const mapType = (neo4jType: string): any => {
    switch (neo4jType) {
      case 'admin':
        return 'admin';
      case 'student':
        return 'student';
      case 'mentor':
      case 'professional':
        return 'professional';
      case 'donor':
        return 'donor';
      case 'orgadmin':
        return 'orgadmin';
      default:
        return 'unclassified';
    }
  };

  return {
    uid: neo4jNode.uid,
    email: neo4jNode.email,
    displayName: neo4jNode.displayName,
    firstName: neo4jNode.firstName,
    lastName: neo4jNode.lastName,
    role: mapRole(neo4jNode.role),
    type: mapType(neo4jNode.type),
    photoURL: neo4jNode.photoURL,
    bio: neo4jNode.bio,
    interests: neo4jNode.interests,
    phone: neo4jNode.phone,
    location: neo4jNode.location,
    website: neo4jNode.website,
    linkedinUrl: neo4jNode.linkedinUrl,
    githubUrl: neo4jNode.githubUrl,
    twitterUrl: neo4jNode.twitterUrl,
    company: neo4jNode.company,
    jobTitle: neo4jNode.jobTitle,
    skills: neo4jNode.skills,
    experience: neo4jNode.experience,
    education: neo4jNode.education,
    subscribeNewsletter: neo4jNode.subscribeNewsletter,
    emailNotifications: neo4jNode.emailNotifications,
    pushNotifications: neo4jNode.pushNotifications,
    marketingEmails: neo4jNode.marketingEmails,
    createdAt: neo4jNode.createdAt as any,
    updatedAt: neo4jNode.updatedAt as any,
    lastLoginAt: neo4jNode.lastLoginAt as any,
    isActive: neo4jNode.isActive,
    isVerified: neo4jNode.isVerified,
    profileVisibility: neo4jNode.profileVisibility,
    showEmail: neo4jNode.showEmail,
    showPhone: neo4jNode.showPhone,
    showLocation: neo4jNode.showLocation,
  };
};

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (user: any | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if auth is available
    if (!auth) {
      console.error('Firebase auth is not initialized');
      setLoading(false);
      return;
    }

    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          // User is signed in
          const authUser = convertFirebaseUserToAuthUser(firebaseUser);
          setUser(authUser);
          
          // Fetch user profile from Neo4j
          try {
            const response = await fetch(`/api/auth/profile?uid=${encodeURIComponent(firebaseUser.uid)}`);
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                const convertedProfile = convertNeo4jNodeToUserProfile(data.user);
                setUserProfile(convertedProfile);
              } else {
                // If no profile exists in Neo4j, create a basic one
                const basicProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  displayName: firebaseUser.displayName || '',
                  role: 'viewer' as UserRole,
                  type: 'student' as UserType,
                  createdAt: new Date() as any,
                  isActive: true,
                  isVerified: firebaseUser.emailVerified,
                };
                setUserProfile(basicProfile);
              }
            } else {
              // If API call fails, create a basic profile
              const basicProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                role: 'viewer' as UserRole,
                type: 'student' as UserType,
                createdAt: new Date() as any,
                isActive: true,
                isVerified: firebaseUser.emailVerified,
              };
              setUserProfile(basicProfile);
            }
          } catch (error) {
            console.error('Error fetching user profile from Neo4j:', error);
            // Set basic profile if Neo4j fetch fails
            const basicProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              role: 'viewer' as UserRole,
              type: 'student' as UserType,
              createdAt: new Date() as any,
              isActive: true,
              isVerified: firebaseUser.emailVerified,
            };
            setUserProfile(basicProfile);
          }
        } else {
          // User is signed out
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      router.push('/'); // Redirect to home page
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setLoading(false);
    }
  };

  const setUserValue = (user: any | null) => {
    console.log('AuthContext setUser called with:', user);
    setUser(user);
  };

  const setUserProfileValue = (profile: UserProfile | null) => {
    console.log('AuthContext setUserProfile called with:', profile);
    setUserProfile(profile);
  };

  const value = { user, userProfile, loading, logout, setUser: setUserValue, setUserProfile: setUserProfileValue };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};