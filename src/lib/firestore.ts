import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, UserSettings, UserActivity } from '@/lib/firestoreTypes';

// User Profile Operations
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// User Settings Operations
export const getUserSettings = async (uid: string): Promise<UserSettings | null> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'userSettings', uid));
    if (settingsDoc.exists()) {
      return settingsDoc.data() as UserSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (uid: string, settings: Partial<UserSettings>): Promise<void> => {
  try {
    const settingsRef = doc(db, 'userSettings', uid);
    await setDoc(settingsRef, {
      uid,
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// User Activity Operations
export const logUserActivity = async (activity: Omit<UserActivity, 'id' | 'createdAt'>): Promise<void> => {
  try {
    const activityRef = doc(collection(db, 'userActivity'));
    await setDoc(activityRef, {
      ...activity,
      id: activityRef.id,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
    throw error;
  }
};

export const getUserActivity = async (uid: string, limitCount: number = 10): Promise<UserActivity[]> => {
  try {
    const q = query(
      collection(db, 'userActivity'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserActivity);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

// Utility functions
export const formatTimestamp = (timestamp: Timestamp | undefined | null): string => {
  if (!timestamp) return 'N/A';
  
  try {
    // Check if it's a Firestore Timestamp object
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    
    // If it's a timestamp object with seconds property (Firestore server timestamp)
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date((timestamp as any).seconds * 1000).toLocaleDateString();
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'N/A';
  }
};

export const formatDateTime = (timestamp: Timestamp | undefined | null): string => {
  if (!timestamp) return 'N/A';
  
  try {
    // Check if it's a Firestore Timestamp object
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    // If it's a timestamp object with seconds property (Firestore server timestamp)
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date((timestamp as any).seconds * 1000).toLocaleString();
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'N/A';
  }
};