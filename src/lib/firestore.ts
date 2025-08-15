// FIREBASE IMPORTS COMMENTED OUT - NOW USING NEO4J
// import { 
//   doc, 
//   getDoc, 
//   setDoc, 
//   updateDoc, 
//   collection, 
//   query, 
//   where, 
//   orderBy, 
//   limit, 
//   getDocs,
//   serverTimestamp,
//   Timestamp 
// } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import type { UserProfile, UserSettings, UserActivity } from '@/lib/firestoreTypes';

// Import Neo4j replacement functions
import {
  getUserProfile as neo4jGetUserProfile,
  createUserProfile as neo4jCreateUserProfile,
  updateUserProfile as neo4jUpdateUserProfile,
  getUserSettings as neo4jGetUserSettings,
  updateUserSettings as neo4jUpdateUserSettings,
  logUserActivity as neo4jLogUserActivity,
  getUserActivity as neo4jGetUserActivity,
  formatTimestamp as neo4jFormatTimestamp,
  formatDateTime as neo4jFormatDateTime
} from './neo4jFirestoreReplacement';

// User Profile Operations
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    return await neo4jGetUserProfile(uid);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    await neo4jCreateUserProfile({
      ...profile,
      isActive: true,
      isVerified: false,
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    await neo4jUpdateUserProfile(uid, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// User Settings Operations
export const getUserSettings = async (uid: string): Promise<UserSettings | null> => {
  try {
    return await neo4jGetUserSettings(uid);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (uid: string, settings: Partial<UserSettings>): Promise<void> => {
  try {
    await neo4jUpdateUserSettings(uid, settings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// User Activity Operations
export const logUserActivity = async (activity: Omit<UserActivity, 'id' | 'createdAt'>): Promise<void> => {
  try {
    await neo4jLogUserActivity(activity);
  } catch (error) {
    console.error('Error logging user activity:', error);
    throw error;
  }
};

export const getUserActivity = async (uid: string, limitCount: number = 10): Promise<UserActivity[]> => {
  try {
    return await neo4jGetUserActivity(uid, limitCount);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

// Utility functions
export const formatTimestamp = (timestamp: any): string => {
  return neo4jFormatTimestamp(timestamp);
};

export const formatDateTime = (timestamp: any): string => {
  return neo4jFormatDateTime(timestamp);
};