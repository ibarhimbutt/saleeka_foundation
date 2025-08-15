"use client";

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
// FIREBASE IMPORTS COMMENTED OUT - NOW USING NEO4J
// import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
// import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
// import { auth, db } from '@/lib/firebase'; // Client-side Firebase auth and db

// Import Neo4j authentication
import { signOut, getCurrentUser, validateSession } from '@/lib/neo4jAuth';
import type { AuthUser } from '@/lib/neo4jAuth';
import { useRouter } from 'next/navigation';
import type { UserProfile, UserRole, UserType } from '@/lib/firestoreTypes';
import { Neo4jUserService } from '@/lib/neo4jService';

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
  user: AuthUser | null;
  userProfile: UserProfile | null; // To store Neo4j profile data including role and type
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session token in localStorage
    const checkSession = async () => {
      setLoading(true);
      try {
        const sessionToken = localStorage.getItem('neo4j_session_token');
        if (sessionToken) {
          const session = validateSession(sessionToken);
          if (session) {
            // Session is valid, get current user
            const currentUser = await getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              // Fetch user profile from Neo4j
              const profile = await Neo4jUserService.getUserByUid(currentUser.uid);
              if (profile) {
                const convertedProfile = convertNeo4jNodeToUserProfile(profile);
                setUserProfile(convertedProfile);
              } else {
                // Fallback to basic profile if profile not found
                const basicProfile: UserProfile = {
                  uid: currentUser.uid,
                  email: currentUser.email,
                  role: 'viewer' as UserRole,
                  type: 'student' as UserType,
                  createdAt: new Date() as any,
                };
                setUserProfile(basicProfile);
              }
            }
          } else {
            // Invalid session, clear token
            localStorage.removeItem('neo4j_session_token');
            setUser(null);
            setUserProfile(null);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await signOut();
      // Clear session token
      localStorage.removeItem('neo4j_session_token');
      setUser(null);
      setUserProfile(null);
      router.push('/'); // Redirect to home page
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setLoading(false);
    }
  };

  const setUserValue = (user: AuthUser | null) => {
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