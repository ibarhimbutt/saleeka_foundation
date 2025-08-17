"use client";

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, deleteUser as firebaseDeleteUser, type User } from 'firebase/auth';
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
  const mapRole = (neo4jRole: string): UserType => {
    switch (neo4jRole) {
      case 'admin':
        return 'admin';
      case 'student':
        return 'student';
      case 'mentor':
        return 'mentor';
      case 'donor':
        return 'donor';
      case 'orgadmin':
        return 'orgadmin';
      default:
        return 'unclassified';
    }
  };

  // Map Neo4j type to UserProfile type
  const mapType = (neo4jType: string): UserType => {
    switch (neo4jType) {
      case 'admin':
        return 'admin';
      case 'student':
        return 'student';
      case 'mentor':
        return 'mentor';
      case 'donor':
        return 'donor';
      case 'orgadmin':
        return 'orgadmin';
      default:
        return 'unclassified';
    }
  };

  // Handle both old single-table structure and new dual-table structure
  const baseProfile = {
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
    mentorCategory: neo4jNode.category, // Map category to mentorCategory for mentors
  };

  // Add mentor-specific properties if they exist (for backward compatibility with old data)
  if (neo4jNode.expertise || neo4jNode.category || neo4jNode.rating !== undefined) {
    return {
      ...baseProfile,
      // Ensure the type and role are correctly set to mentor if mentor properties exist
      type: 'mentor' as UserType,
      role: 'mentor' as UserType,
      // Add mentor-specific properties
      mentorCategory: neo4jNode.category,
      expertise: Array.isArray(neo4jNode.expertise) ? neo4jNode.expertise :
        (typeof neo4jNode.expertise === 'string' ?
          (() => { try { return JSON.parse(neo4jNode.expertise); } catch { return []; } })() : []),
      rating: neo4jNode.rating,
      yearsOfExperience: neo4jNode.yearsOfExperience,
      maxMentees: neo4jNode.maxMentees,
      currentMentees: neo4jNode.currentMentees,
      totalMentees: neo4jNode.totalMentees,
            specialties: Array.isArray(neo4jNode.specialties) ? neo4jNode.specialties : 
                  (typeof neo4jNode.specialties === 'string' ? 
                    (() => { try { return JSON.parse(neo4jNode.specialties); } catch { return []; } })() : []),
      certifications: Array.isArray(neo4jNode.certifications) ? neo4jNode.certifications : 
                     (typeof neo4jNode.certifications === 'string' ? 
                       (() => { try { return JSON.parse(neo4jNode.certifications); } catch { return []; } })() : []),
      availability: neo4jNode.availability,
      industry: neo4jNode.industry,
    };
  }

  return baseProfile;
};

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  deleteUser: () => Promise<void>;
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
                  role: 'student' as UserType,
                  type: 'student' as UserType,
                  createdAt: new Date() as any,
                  updatedAt: new Date() as any,
                  isActive: true,
                  isVerified: firebaseUser.emailVerified,
                  subscribeNewsletter: false,
                  emailNotifications: true,
                  pushNotifications: false,
                  marketingEmails: false,
                  profileVisibility: 'public',
                  showEmail: false,
                  showPhone: false,
                  showLocation: true,
                };
                setUserProfile(basicProfile);
              }
            } else {
              // If API call fails, create a basic profile
              const basicProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                role: 'student' as UserType,
                type: 'student' as UserType,
                createdAt: new Date() as any,
                updatedAt: new Date() as any,
                isActive: true,
                isVerified: firebaseUser.emailVerified,
                subscribeNewsletter: false,
                emailNotifications: true,
                pushNotifications: false,
                marketingEmails: false,
                profileVisibility: 'public',
                showEmail: false,
                showPhone: false,
                showLocation: true,
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
              role: 'student' as UserType,
              type: 'student' as UserType,
              createdAt: new Date() as any,
              updatedAt: new Date() as any,
              isActive: true,
              isVerified: firebaseUser.emailVerified,
              subscribeNewsletter: false,
              emailNotifications: true,
              pushNotifications: false,
              marketingEmails: false,
              profileVisibility: 'public',
              showEmail: false,
              showPhone: false,
              showLocation: true,
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

  const deleteUser = async () => {
    setLoading(true);
    try {
      if (!auth || !auth.currentUser) {
        throw new Error('No authenticated user to delete');
      }

      // Store the UID before deleting the Firebase user
      const uid = auth.currentUser.uid;

      // Delete user data from backend first
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user data from backend');
      }

      // Delete the Firebase user after backend deletion
      await firebaseDeleteUser(auth.currentUser);

      // Clear local state
      setUser(null);
      setUserProfile(null);

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error("Error deleting user account: ", error);
      throw error;
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

  const value = { user, userProfile, loading, logout, deleteUser, setUser: setUserValue, setUserProfile: setUserProfileValue };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};